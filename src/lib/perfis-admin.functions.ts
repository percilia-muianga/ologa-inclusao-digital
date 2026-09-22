/**
 * Criar ou completar a FICHA (perfis) de uma conta de acesso que já existe.
 *
 * Regras fixas desta acção:
 *  - Nunca cria contas de acesso, nunca define nem repõe palavras-passe.
 *  - Só o Administrador Geral Ologa (perfis.papel = 'admin_ologa', a mesma
 *    regra da função is_admin da base) pode chamar. Coordenação nacional,
 *    auditoria e administração ATDI são recusadas aqui.
 *  - O identificador da conta é resolvido NO SERVIDOR pelo email exacto
 *    normalizado; o cliente nunca envia identificadores nem o seu próprio papel.
 *  - A gravação é feita com o cliente autenticado de quem chama, para que as
 *    políticas da base decidam e o gatilho de auditoria registe o autor real.
 *  - Nenhum email está fixo no código.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Perfil do LMS que esta acção pode atribuir. Lista fechada. */
export const PERFIS_ATRIBUIVEIS = ["admin_ologa", "gestor_instituicao", "formando"] as const;
export type PerfilAtribuivel = (typeof PERFIS_ATRIBUIVEIS)[number];

export const RESUMO_PERFIL: Record<PerfilAtribuivel, string> = {
  admin_ologa: "Administrador Geral Ologa — acesso a todas as áreas de gestão.",
  gestor_instituicao: "Gestor de instituição — acesso aos dados da sua instituição.",
  formando: "Formando — acesso apenas ao seu percurso.",
};

export type ContaResolvida = {
  /** Identificador da conta de acesso, resolvido no servidor. */
  id: string;
  email: string;
  emailConfirmado: boolean;
  /** Nome vindo dos dados da conta; nunca inventado. */
  nomeDaConta: string | null;
};

export type PreparacaoPerfil = {
  conta: ContaResolvida;
  /** Estado actual da ficha: null quando ainda não existe. */
  perfilActual: { nome: string; email: string; papel: string } | null;
  /** Estado que ficaria depois de submeter. */
  perfilProposto: { nome: string; email: string; papel: PerfilAtribuivel };
  operacao: "criar" | "alterar" | "sem_alteracao";
  resumo: string;
};

function normalizarEmail(email: string): string {
  return String(email ?? "").trim().toLowerCase();
}

/** Só o Administrador Geral Ologa. Lê o papel da base, nunca do cliente. */
async function exigirAdministradorGeral(context: { supabase: any; userId: string }) {
  if (!context?.userId || !context?.supabase) throw new Error("SEM_SESSAO");
  const { data: perfil } = await context.supabase
    .from("perfis")
    .select("papel")
    .eq("id", context.userId)
    .maybeSingle();
  if (perfil?.papel !== "admin_ologa") throw new Error("SEM_PERMISSAO_ADMIN_GERAL");
}

/**
 * Resolve a conta de acesso pelo email exacto normalizado, só de leitura.
 * Recusa se não existir, se houver mais do que uma correspondência exacta ou
 * se o email ainda não estiver confirmado.
 */
async function resolverContaPorEmail(email: string): Promise<ContaResolvida> {
  const alvo = normalizarEmail(email);
  if (!alvo || !alvo.includes("@")) throw new Error("EMAIL_INVALIDO");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error("CONTA_NAO_RESOLVIDA");

  const iguais = (data?.users ?? []).filter((u: any) => normalizarEmail(u.email ?? "") === alvo);
  if (iguais.length === 0) throw new Error("CONTA_INEXISTENTE");
  if (iguais.length > 1) throw new Error("EMAIL_AMBIGUO");

  const u: any = iguais[0];
  const confirmado = Boolean(u.email_confirmed_at ?? u.confirmed_at);
  if (!confirmado) throw new Error("EMAIL_NAO_CONFIRMADO");

  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const nomeMeta = typeof meta["nome"] === "string" && meta["nome"].trim() !== "" ? meta["nome"].trim() : null;

  return { id: u.id, email: normalizarEmail(u.email ?? ""), emailConfirmado: true, nomeDaConta: nomeMeta };
}

function validarPerfil(papel: string): PerfilAtribuivel {
  if (!(PERFIS_ATRIBUIVEIS as readonly string[]).includes(papel)) throw new Error("PERFIL_NAO_PERMITIDO");
  return papel as PerfilAtribuivel;
}

/**
 * CONSULTA — não altera nada. Mostra o antes e o depois para confirmação.
 */
export const prepararPerfilDeConta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; papel: string; nome?: string }) => data)
  .handler(async ({ context, data }): Promise<PreparacaoPerfil> => {
    await exigirAdministradorGeral(context as any);
    const papel = validarPerfil(data.papel);
    const conta = await resolverContaPorEmail(data.email);

    const { data: actual } = await (context as any).supabase
      .from("perfis")
      .select("nome, email, papel")
      .eq("id", conta.id)
      .maybeSingle();

    const nomeIndicado = typeof data.nome === "string" && data.nome.trim() !== "" ? data.nome.trim() : null;
    const nome = actual?.nome ?? nomeIndicado ?? conta.nomeDaConta ?? conta.email;

    const operacao: PreparacaoPerfil["operacao"] = !actual
      ? "criar"
      : actual.papel === papel
        ? "sem_alteracao"
        : "alterar";

    return {
      conta,
      perfilActual: actual ? { nome: actual.nome, email: actual.email, papel: actual.papel } : null,
      perfilProposto: { nome, email: conta.email, papel },
      operacao,
      resumo: RESUMO_PERFIL[papel],
    };
  });

/**
 * GRAVAÇÃO — só depois de a consulta acima ter sido confirmada por quem chama.
 * Idempotente: se a ficha já tiver o perfil pedido, não escreve nada.
 */
export const definirPerfilDeConta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; papel: string; nome?: string }) => data)
  .handler(async ({ context, data }) => {
    await exigirAdministradorGeral(context as any);
    const papel = validarPerfil(data.papel);
    const conta = await resolverContaPorEmail(data.email);

    // Cliente autenticado de quem chama: RLS decide e o gatilho regista o autor real.
    const cliente = (context as any).supabase;

    const { data: actual } = await cliente
      .from("perfis")
      .select("nome, email, papel")
      .eq("id", conta.id)
      .maybeSingle();

    if (actual && actual.papel === papel) {
      return { operacao: "sem_alteracao" as const, id: conta.id, papel };
    }

    const nomeIndicado = typeof data.nome === "string" && data.nome.trim() !== "" ? data.nome.trim() : null;

    if (!actual) {
      const { error } = await cliente.from("perfis").insert({
        id: conta.id,
        nome: nomeIndicado ?? conta.nomeDaConta ?? conta.email,
        email: conta.email,
        papel,
      });
      if (error) throw new Error(error.message);
      return { operacao: "criado" as const, id: conta.id, papel };
    }

    const { error } = await cliente
      .from("perfis")
      .update({ papel, actualizado_em: new Date().toISOString() })
      .eq("id", conta.id);
    if (error) throw new Error(error.message);
    return { operacao: "alterado" as const, id: conta.id, papel };
  });
