import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PapelSistema } from "./papeis";

export type PerfilSessao = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  entidade_empregadora: string | null;
  provincia: string | null;
  distrito: string | null;
  cargo: string | null;
  genero: string | null;
  tipo_deficiencia: string | null;
  conta_de_teste: boolean;
  /** Perfil do LMS gravado em perfis.papel. */
  papel: string;
};

export type Sessao = {
  perfil: PerfilSessao | null;
  papeis: PapelSistema[];
  /**
   * Verdadeiro quando perfis.papel === "admin_ologa". Calculado no servidor a
   * partir do perfil já existente; não concede nada de novo — as regras da
   * base de dados (is_admin) já reconhecem este perfil.
   */
  administradorGeral: boolean;
};

/**
 * Cria o perfil do utilizador na primeira entrada, a partir dos dados
 * recolhidos no formulário de criação de conta, e devolve a sessão.
 * Idempotente: se o perfil já existir, não o altera.
 */
export const garantirPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Sessao> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existente } = await supabaseAdmin
      .from("perfis")
      .select("id")
      .eq("id", context.userId)
      .maybeSingle();

    if (!existente) {
      const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(context.userId);
      const meta = (userRes?.user?.user_metadata ?? {}) as Record<string, unknown>;
      const texto = (chave: string) => {
        const v = meta[chave];
        return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
      };

      await supabaseAdmin.from("perfis").insert({
        id: context.userId,
        nome: texto("nome") ?? userRes?.user?.email ?? "Sem nome",
        email: userRes?.user?.email ?? "",
        papel: "formando",
        telefone: texto("telefone"),
        entidade_empregadora: texto("entidade_empregadora"),
        provincia: texto("provincia"),
        distrito: texto("distrito"),
        cargo: texto("cargo"),
        genero: (texto("genero") as never) ?? null,
        tipo_deficiencia: texto("tipo_deficiencia"),
      });

      await supabaseAdmin
        .from("utilizador_papeis")
        .insert({ utilizador_id: context.userId, papel: "formando" });
    }

    return await lerSessao(context.userId);

    async function lerSessao(uid: string): Promise<Sessao> {
      const { data: perfil } = await supabaseAdmin
        .from("perfis")
        .select(
          "id, nome, email, telefone, entidade_empregadora, provincia, distrito, cargo, genero, tipo_deficiencia, conta_de_teste, papel",
        )
        .eq("id", uid)
        .maybeSingle();
      const { data: papeis } = await supabaseAdmin
        .from("utilizador_papeis")
        .select("papel")
        .eq("utilizador_id", uid);
      const p = (perfil as PerfilSessao | null) ?? null;
      return {
        perfil: p,
        papeis: (papeis ?? []).map((r) => r.papel as PapelSistema),
        administradorGeral: p?.papel === "admin_ologa",
      };
    }
  });

/** Sessão do próprio utilizador: perfil e papéis. */
export const obterSessao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Sessao> => {
    const { data: perfil } = await context.supabase
      .from("perfis")
      .select(
        "id, nome, email, telefone, entidade_empregadora, provincia, distrito, cargo, genero, tipo_deficiencia, conta_de_teste, papel",
      )
      .eq("id", context.userId)
      .maybeSingle();

    const { data: papeis } = await context.supabase
      .from("utilizador_papeis")
      .select("papel")
      .eq("utilizador_id", context.userId);

    const perfilLido = (perfil as PerfilSessao | null) ?? null;
    return {
      perfil: perfilLido,
      papeis: (papeis ?? []).map((r) => r.papel as PapelSistema),
      administradorGeral: perfilLido?.papel === "admin_ologa",
    };
  });

/**
 * O próprio utilizador actualiza os seus dados.
 * O tipo de deficiência é reversível a qualquer momento: enviar cadeia vazia
 * remove-o. O registo de auditoria guarda apenas que houve alteração.
 */
export const actualizarPerfilProprio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    nome: string;
    telefone?: string;
    entidade_empregadora?: string;
    provincia: string;
    distrito: string;
    cargo?: string;
    genero?: string;
    tipo_deficiencia?: string;
  }) => data)
  .handler(async ({ context, data }) => {
    const limpar = (v?: string) => (v && v.trim() !== "" ? v.trim() : null);
    const { error } = await context.supabase
      .from("perfis")
      .update({
        nome: data.nome.trim(),
        telefone: limpar(data.telefone),
        entidade_empregadora: limpar(data.entidade_empregadora),
        provincia: data.provincia,
        distrito: data.distrito.trim(),
        cargo: limpar(data.cargo),
        genero: (limpar(data.genero) as never) ?? null,
        tipo_deficiencia: limpar(data.tipo_deficiencia),
        actualizado_em: new Date().toISOString(),
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
