import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PAPEIS, type PapelSistema } from "./papeis";

/** Verifica se quem chama é administrador (ATDI) ou o administrador Ologa existente. */
async function exigirAdministrador(context: { supabase: any; userId: string }) {
  const { data: papeis } = await context.supabase
    .from("utilizador_papeis")
    .select("papel")
    .eq("utilizador_id", context.userId);
  if ((papeis ?? []).some((p: { papel: string }) => p.papel === "admin_atdi")) return;

  const { data: perfil } = await context.supabase
    .from("perfis")
    .select("papel")
    .eq("id", context.userId)
    .maybeSingle();
  if (perfil?.papel === "admin_ologa") return;

  throw new Error("Sem permissão: esta operação é reservada ao administrador.");
}

/** Quem audita também é auditado: regista a consulta a campos sensíveis. */
async function registarConsultaSensivel(
  context: { supabase: any },
  perfil: string | null,
  contexto: string,
) {
  await context.supabase.rpc("registar_acesso_sensivel", {
    _perfil_consultado: perfil,
    _campos: ["email", "telefone", "genero", "tipo_deficiencia"],
    _contexto: contexto,
  });
}

export type UtilizadorGerido = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  provincia: string | null;
  distrito: string | null;
  entidade_empregadora: string | null;
  cargo: string | null;
  conta_de_teste: boolean;
  papeis: PapelSistema[];
};

/** Lista de utilizadores para a gestão. Só administrador e auditor. */
export const listarUtilizadores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UtilizadorGerido[]> => {
    const { data: perfis, error } = await context.supabase
      .from("perfis")
      .select(
        "id, nome, email, telefone, provincia, distrito, entidade_empregadora, cargo, conta_de_teste",
      )
      .order("nome");
    if (error) throw new Error(error.message);

    const { data: papeis } = await context.supabase
      .from("utilizador_papeis")
      .select("utilizador_id, papel");

    await registarConsultaSensivel(context, null, "Lista de utilizadores");

    return (perfis ?? []).map((p: any) => ({
      ...p,
      papeis: (papeis ?? [])
        .filter((r: any) => r.utilizador_id === p.id)
        .map((r: any) => r.papel as PapelSistema),
    }));
  });

/** Registo de auditoria. Só administrador e auditor (garantido pelas políticas). */
export const listarRegistoAuditoria = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("registo_auditoria")
      .select("*")
      .order("ocorrido_em", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Registo de consultas a campos sensíveis. */
export const listarAcessosSensiveis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("registo_acesso_sensivel")
      .select("*")
      .order("ocorrido_em", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Atribui os seis papéis a uma conta existente (conta de demonstração). */
export const atribuirTodosOsPapeis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ context, data }) => {
    await exigirAdministrador(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = data.email.trim().toLowerCase();
    const { data: perfil } = await supabaseAdmin
      .from("perfis")
      .select("id, nome")
      .ilike("email", email)
      .maybeSingle();
    if (!perfil) {
      throw new Error(
        "Não existe nenhuma conta com esse email. Crie primeiro a conta e volte a tentar.",
      );
    }

    for (const p of PAPEIS) {
      await supabaseAdmin
        .from("utilizador_papeis")
        .upsert(
          { utilizador_id: perfil.id, papel: p.valor, atribuido_por: context.userId },
          { onConflict: "utilizador_id,papel" },
        );
    }
    return { ok: true, nome: perfil.nome, papeis: PAPEIS.length };
  });

function gerarPalavraPasse(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
}

export type ContaDeTesteCriada = {
  papel: PapelSistema;
  nomeDoPapel: string;
  email: string;
  palavraPasse: string;
  estado: "criada" | "ja_existia";
};

/**
 * Cria as seis contas de teste, uma por papel, marcadas com conta_de_teste.
 * As palavras-passe são devolvidas uma única vez, para descarregar em ficheiro.
 */
export const criarContasDeTeste = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { dominio: string }) => data)
  .handler(async ({ context, data }): Promise<ContaDeTesteCriada[]> => {
    await exigirAdministrador(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const dominio = data.dominio.trim().replace(/^@/, "").toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(dominio)) {
      throw new Error("Domínio inválido. Exemplo válido: ologa.co.mz");
    }

    const resultado: ContaDeTesteCriada[] = [];

    for (const p of PAPEIS) {
      const email = `${p.prefixoTeste}@${dominio}`;
      const { data: existente } = await supabaseAdmin
        .from("perfis")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

      if (existente) {
        resultado.push({
          papel: p.valor,
          nomeDoPapel: p.nome,
          email,
          palavraPasse: "",
          estado: "ja_existia",
        });
        continue;
      }

      const palavraPasse = gerarPalavraPasse();
      const { data: criado, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: palavraPasse,
        email_confirm: true,
        user_metadata: { nome: `Conta de teste — ${p.nome}` },
      });
      if (error || !criado.user) {
        throw new Error(`Não foi possível criar ${email}: ${error?.message ?? "erro desconhecido"}`);
      }

      await supabaseAdmin.from("perfis").insert({
        id: criado.user.id,
        nome: `Conta de teste — ${p.nome}`,
        email,
        papel: "formando",
        provincia: "Cidade de Maputo",
        distrito: "KaMpfumo",
        entidade_empregadora: "Ologa — validação interna",
        cargo: "Conta de teste",
        conta_de_teste: true,
      });

      await supabaseAdmin
        .from("utilizador_papeis")
        .insert({ utilizador_id: criado.user.id, papel: p.valor, atribuido_por: context.userId });

      resultado.push({
        papel: p.valor,
        nomeDoPapel: p.nome,
        email,
        palavraPasse,
        estado: "criada",
      });
    }

    return resultado;
  });

/** Remove, num só comando, todas as contas marcadas como conta de teste. */
export const removerContasDeTeste = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirAdministrador(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: contas, error } = await supabaseAdmin
      .from("perfis")
      .select("id, email")
      .eq("conta_de_teste", true);
    if (error) throw new Error(error.message);

    const removidas: string[] = [];
    for (const conta of contas ?? []) {
      await supabaseAdmin.from("utilizador_papeis").delete().eq("utilizador_id", conta.id);
      await supabaseAdmin.from("perfis").delete().eq("id", conta.id);
      await supabaseAdmin.auth.admin.deleteUser(conta.id);
      removidas.push(conta.email);
    }
    return { removidas: removidas.length };
  });
