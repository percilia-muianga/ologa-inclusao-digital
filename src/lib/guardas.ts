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

/**
 * Regista no servidor um acesso a área de gestão ou a sua recusa.
 * Guarda o mínimo: quem (id da conta, quando existe), o que foi pedido e o
 * resultado. Nunca guarda palavras-passe, tokens, gabaritos nem conteúdos
 * pessoais. O registo é imutável (gatilho na base de dados).
 */
export async function registarEventoGestao(
  utilizadorId: string | null,
  accao: "leitura_gestao" | "escrita_gestao",
  resultado: "permitido" | "recusado",
  alvo?: string,
): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("registo_auditoria").insert({
      utilizador_id: utilizadorId,
      accao,
      entidade: "acesso_gestao",
      registo_id: alvo ?? null,
      valor_novo: { resultado, alvo: alvo ?? null },
      contexto_actor: utilizadorId ? "sessao_autenticada" : "sem_sessao",
    } as never);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Barra a chamada ANTES de qualquer consulta privilegiada.
 *
 * Recusas são sempre recusas, mesmo que o registo falhe. Mas uma ESCRITA
 * autorizada só avança se o registo de auditoria tiver ficado gravado: se a
 * auditoria falhar, a operação é interrompida antes de tocar nos dados.
 */
export async function exigirGestao(
  context: ContextoAutenticado,
  modo: "ler" | "escrever",
  alvo?: string,
): Promise<Permissoes> {
  const p = await permissoesGestao(context);
  const accao = modo === "ler" ? "leitura_gestao" : "escrita_gestao";
  const permitido = modo === "ler" ? p.podeLer : p.podeEscrever;
  if (!permitido) {
    await registarEventoGestao(context?.userId ?? null, accao, "recusado", alvo);
    throw new Error("SEM_PERMISSAO_GESTAO");
  }
  const registado = await registarEventoGestao(context?.userId ?? null, accao, "permitido", alvo);
  if (!registado && modo === "escrever") {
    throw new Error("AUDITORIA_INDISPONIVEL");
  }
  return p;
}
