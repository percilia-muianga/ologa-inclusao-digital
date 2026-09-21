/**
 * Guardas centrais de autenticação e autorização do servidor.
 *
 * Regras (fail-closed):
 *  - Nenhum handler de gestão toca na base com privilégios elevados antes de
 *    a sessão ser validada no servidor.
 *  - O papel NUNCA é aceite do cliente: é lido da base com o cliente
 *    autenticado do próprio utilizador (RLS como ele).
 *  - Escopo por instituição/turma/província não existe hoje de forma
 *    verificável no servidor para formador e supervisor provincial. Enquanto
 *    não existir, esses papéis são NEGADOS na gestão, em vez de receberem
 *    acesso global.
 *  - O auditor é apenas leitura.
 */
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export { requireSupabaseAuth as sessaoObrigatoria };

export type ContextoAutenticado = {
  supabase: { from: (tabela: string) => any };
  userId: string;
};

/** Papéis que podem alterar dados de gestão (turmas, presenças, workshops, relatórios). */
export const PAPEIS_GESTAO_ESCRITA = ["admin_atdi", "coordenador_nacional"] as const;
/** Papéis que podem ler dados de gestão. O auditor entra só aqui. */
export const PAPEIS_GESTAO_LEITURA = [
  "admin_atdi",
  "coordenador_nacional",
  "auditor_atdi",
] as const;

export type Permissoes = { podeLer: boolean; podeEscrever: boolean };

/** Regra pura de autorização — testável isoladamente, sem base de dados. */
export function avaliarGestao(papeis: string[], perfil: string | null): Permissoes {
  const administradorOloga = perfil === "admin_ologa";
  return {
    podeLer:
      administradorOloga || papeis.some((p) => (PAPEIS_GESTAO_LEITURA as readonly string[]).includes(p)),
    podeEscrever:
      administradorOloga || papeis.some((p) => (PAPEIS_GESTAO_ESCRITA as readonly string[]).includes(p)),
  };
}

/** Lê papéis e perfil do utilizador autenticado, sempre do servidor. */
export async function papeisDoUtilizador(context: ContextoAutenticado) {
  const [papeisRes, perfilRes] = await Promise.all([
    context.supabase.from("utilizador_papeis").select("papel").eq("utilizador_id", context.userId),
    context.supabase.from("perfis").select("papel").eq("id", context.userId).maybeSingle(),
  ]);
  const papeis = ((papeisRes.data ?? []) as { papel: string }[]).map((p) => p.papel);
  const perfil = (perfilRes.data as { papel?: string } | null)?.papel ?? null;
  return { papeis, perfil };
}

export async function permissoesGestao(context: ContextoAutenticado): Promise<Permissoes> {
  if (!context?.userId) return { podeLer: false, podeEscrever: false };
  const { papeis, perfil } = await papeisDoUtilizador(context);
  return avaliarGestao(papeis, perfil);
}

/** Barra a chamada ANTES de qualquer consulta privilegiada. */
export async function exigirGestao(
  context: ContextoAutenticado,
  modo: "ler" | "escrever",
): Promise<Permissoes> {
  const p = await permissoesGestao(context);
  if (modo === "ler" ? p.podeLer : p.podeEscrever) return p;
  throw new Error("SEM_PERMISSAO_GESTAO");
}
