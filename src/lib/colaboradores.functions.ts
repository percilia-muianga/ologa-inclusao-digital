import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// ---------- Utils ----------

async function obterGestor(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("perfis")
    .select("papel, instituicao_id")
    .eq("id", userId)
    .maybeSingle();
  if (!data || data.papel !== "gestor_instituicao" || !data.instituicao_id) return null;
  return { instituicao_id: data.instituicao_id };
}

// ---------- Normalização de valores ----------

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type Genero = "feminino" | "masculino" | "prefere_nao_indicar";
type Nivel = "nenhum" | "basico" | "intermedio" | "prefere_nao_indicar";

export function mapearGenero(v: string | null | undefined): Genero | null | "invalido" {
  if (!v || !v.trim()) return null;
  const n = normalizar(v);
  if (["feminino", "f"].includes(n)) return "feminino";
  if (["masculino", "m"].includes(n)) return "masculino";
  if (["prefere nao indicar", "prefere_nao_indicar", "prefiro nao indicar", "nao indicado"].includes(n))
    return "prefere_nao_indicar";
  return "invalido";
}

export function mapearNivel(v: string | null | undefined): Nivel | null | "invalido" {
  if (!v || !v.trim()) return null;
  const n = normalizar(v);
  if (n === "nenhum") return "nenhum";
  if (n === "basico") return "basico";
  if (n === "intermedio") return "intermedio";
  if (
    [
      "nao sei ou misto",
      "nao sei",
      "prefiro nao indicar",
      "prefere_nao_indicar",
      "prefere nao indicar",
    ].includes(n)
  )
    return "prefere_nao_indicar";
  return "invalido";
}

// ---------- Servidor: obter dados da minha instituição ----------

export const obterMinhaInstituicaoGestor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const g = await obterGestor(context.userId);
    if (!g) return { ok: false as const, mensagem: "acesso_negado" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("instituicoes")
      .select("id, nome, codigo_inscricao")
      .eq("id", g.instituicao_id)
      .maybeSingle();
    if (error) return { ok: false as const, mensagem: error.message };
    if (!data) return { ok: false as const, mensagem: "nao_encontrada" };
    return { ok: true as const, instituicao: data };
  });

// ---------- Servidor: listar colaboradores ----------

export const listarColaboradoresGestor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ pesquisa: z.string().trim().max(200).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const g = await obterGestor(context.userId);
    if (!g) return { ok: false as const, mensagem: "acesso_negado" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("perfis")
      .select("id, nome, email, funcao, criado_em")
      .eq("instituicao_id", g.instituicao_id)
      .eq("papel", "formando")
      .order("nome", { ascending: true });

    if (data.pesquisa && data.pesquisa.length > 0) {
      const p = data.pesquisa.replace(/[%_]/g, "");
      query = query.or(`nome.ilike.%${p}%,email.ilike.%${p}%`);
    }

    const { data: perfis, error } = await query;
    if (error) return { ok: false as const, mensagem: error.message };

    const ids = (perfis ?? []).map((p) => p.id);
    let estadoMap = new Map<
      string,
      { tem_password: boolean; ultimo_acesso: string | null }
    >();
    if (ids.length > 0) {
      const { data: estados } = await supabaseAdmin.rpc("obter_estado_contas", { _ids: ids });
      for (const e of estados ?? []) {
        estadoMap.set(e.id, {
          tem_password: !!e.tem_password,
          ultimo_acesso: e.ultimo_acesso,
        });
      }
    }

    const colaboradores = (perfis ?? []).map((p) => {
      const e = estadoMap.get(p.id);
      return {
        id: p.id,
        nome: p.nome,
        email: p.email,
        funcao: p.funcao,
        criado_em: p.criado_em,
        tem_password: e?.tem_password ?? false,
        ultimo_acesso: e?.ultimo_acesso ?? null,
      };
    });

    return { ok: true as const, colaboradores };
  });

// ---------- Servidor: regenerar link de palavra-passe ----------

export const regenerarLinkPasswordColaborador = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ perfil_id: z.string().uuid(), origin: z.string().url() })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const g = await obterGestor(context.userId);
    if (!g) return { ok: false as const, mensagem: "acesso_negado" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Confirmar que o perfil pertence à mesma instituição
    const { data: perfil, error: erroPerfil } = await supabaseAdmin
      .from("perfis")
      .select("email, instituicao_id, papel")
      .eq("id", data.perfil_id)
      .maybeSingle();
    if (erroPerfil) return { ok: false as const, mensagem: erroPerfil.message };
    if (!perfil || perfil.instituicao_id !== g.instituicao_id) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    if (perfil.papel !== "formando") {
      return { ok: false as const, mensagem: "so_formandos" };
    }

    const redirectTo = `${data.origin.replace(/\/$/, "")}/definir-palavra-passe`;
    const { data: linkData, error: erroLink } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: perfil.email,
      options: { redirectTo },
    });
    if (erroLink || !linkData?.properties?.action_link) {
      return { ok: false as const, mensagem: erroLink?.message ?? "erro_link" };
    }
    return { ok: true as const, link: linkData.properties.action_link };
  });

// ---------- Servidor: importar colaboradores em bloco ----------

const linhaSchema = z.object({
  nome: z.string().trim().min(1).max(200),
  email: z.string().trim().toLowerCase().email(),
  genero: z.enum(["feminino", "masculino", "prefere_nao_indicar"]).nullable().optional(),
  nivel_partida: z
    .enum(["nenhum", "basico", "intermedio", "prefere_nao_indicar"])
    .nullable()
    .optional(),
  funcao: z.string().trim().max(100).nullable().optional(),
});

const importarSchema = z.object({
  origin: z.string().url(),
  linhas: z.array(linhaSchema).min(1).max(25),
});

export type ResultadoLinha = {
  email: string;
  nome: string;
  ok: boolean;
  erro?: string;
  link?: string;
};

export const importarColaboradoresChunk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => importarSchema.parse(d))
  .handler(async ({ data, context }): Promise<
    { ok: false; mensagem: string } | { ok: true; resultados: ResultadoLinha[] }
  > => {
    const g = await obterGestor(context.userId);
    if (!g) return { ok: false, mensagem: "acesso_negado" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const redirectTo = `${data.origin.replace(/\/$/, "")}/definir-palavra-passe`;

    const resultados: ResultadoLinha[] = [];

    for (const linha of data.linhas) {
      const nome = linha.nome.trim();
      const email = linha.email.trim().toLowerCase();

      // Já existe perfil com este email?
      const { data: existente } = await supabaseAdmin
        .from("perfis")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (existente) {
        resultados.push({
          email,
          nome,
          ok: false,
          erro: "Já existe uma conta com este email — linha ignorada.",
        });
        continue;
      }

      const { data: criado, error: erroUser } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { nome },
      });
      if (erroUser || !criado?.user) {
        resultados.push({
          email,
          nome,
          ok: false,
          erro: erroUser?.message ?? "Não foi possível criar a conta.",
        });
        continue;
      }
      const novoId = criado.user.id;

      const { error: erroPerfil } = await supabaseAdmin.from("perfis").insert({
        id: novoId,
        nome,
        email,
        papel: "formando",
        instituicao_id: g.instituicao_id,
        genero: linha.genero ?? null,
        nivel_partida: linha.nivel_partida ?? null,
        funcao: linha.funcao?.trim() ? linha.funcao.trim() : null,
      });
      if (erroPerfil) {
        await supabaseAdmin.auth.admin.deleteUser(novoId);
        resultados.push({ email, nome, ok: false, erro: erroPerfil.message });
        continue;
      }

      const { data: linkData, error: erroLink } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });
      if (erroLink || !linkData?.properties?.action_link) {
        resultados.push({
          email,
          nome,
          ok: true,
          erro: "Conta criada, mas não foi possível gerar link automaticamente.",
        });
        continue;
      }

      resultados.push({ email, nome, ok: true, link: linkData.properties.action_link });
    }

    return { ok: true, resultados };
  });
