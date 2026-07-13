import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

// ---------- Convite: geração e hash ----------

const VALIDADE_CONVITE_DIAS = 30;

function gerarTokenConvite(): string {
  // 32 bytes = 256 bits de entropia. Codificação base64url -> ~43 chars imprimíveis.
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hashToken(token: string): Promise<string> {
  const buf = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const arr = Array.from(new Uint8Array(digest));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Cria um novo convite para um perfil e invalida quaisquer convites anteriores.
 * Devolve o token em claro (para incluir no link) — o token nunca é guardado em claro.
 */
async function criarConviteParaPerfil(perfilId: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Invalidar convites anteriores por usar deste perfil.
  await supabaseAdmin
    .from("convites_colaborador")
    .update({ invalidado_em: new Date().toISOString() })
    .eq("perfil_id", perfilId)
    .is("usado_em", null)
    .is("invalidado_em", null);

  const token = gerarTokenConvite();
  const token_hash = await hashToken(token);
  const expira_em = new Date(
    Date.now() + VALIDADE_CONVITE_DIAS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error } = await supabaseAdmin.from("convites_colaborador").insert({
    perfil_id: perfilId,
    token_hash,
    expira_em,
  });
  if (error) throw new Error(error.message);
  return token;
}

function construirLink(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/definir-palavra-passe?convite=${token}`;
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

export type EstadoConvite = "por_usar" | "usado" | "expirado" | "sem_convite";

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
      .select("id, nome, email, funcao, criado_em, palavra_passe_definida_em")
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
    const ultimoMap = new Map<string, string | null>();
    if (ids.length > 0) {
      const { data: estados } = await supabaseAdmin.rpc("obter_estado_contas", { _ids: ids });
      for (const e of estados ?? []) {
        ultimoMap.set(e.id, e.ultimo_acesso);
      }
    }

    // Estado do convite mais recente por perfil (ignora convites invalidados).
    const conviteMap = new Map<string, EstadoConvite>();
    if (ids.length > 0) {
      const { data: convites } = await supabaseAdmin
        .from("convites_colaborador")
        .select("perfil_id, expira_em, usado_em, invalidado_em, criado_em")
        .in("perfil_id", ids)
        .is("invalidado_em", null)
        .order("criado_em", { ascending: false });
      const agora = Date.now();
      for (const c of convites ?? []) {
        if (conviteMap.has(c.perfil_id)) continue; // fica só com o mais recente
        if (c.usado_em) conviteMap.set(c.perfil_id, "usado");
        else if (new Date(c.expira_em).getTime() < agora)
          conviteMap.set(c.perfil_id, "expirado");
        else conviteMap.set(c.perfil_id, "por_usar");
      }
    }

    const colaboradores = (perfis ?? []).map((p) => ({
      id: p.id,
      nome: p.nome,
      email: p.email,
      funcao: p.funcao,
      criado_em: p.criado_em,
      conta_ativada: p.palavra_passe_definida_em != null,
      ultimo_acesso: ultimoMap.get(p.id) ?? null,
      estado_convite: (conviteMap.get(p.id) ?? "sem_convite") as EstadoConvite,
    }));

    return { ok: true as const, colaboradores };
  });


// ---------- Servidor: regenerar link de convite ----------

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

    const { data: perfil, error: erroPerfil } = await supabaseAdmin
      .from("perfis")
      .select("email, instituicao_id, papel, palavra_passe_definida_em")
      .eq("id", data.perfil_id)
      .maybeSingle();
    if (erroPerfil) return { ok: false as const, mensagem: erroPerfil.message };
    if (!perfil || perfil.instituicao_id !== g.instituicao_id) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    if (perfil.papel !== "formando") {
      return { ok: false as const, mensagem: "so_formandos" };
    }
    if (perfil.palavra_passe_definida_em) {
      return { ok: false as const, mensagem: "conta_ja_ativada" };
    }

    try {
      const token = await criarConviteParaPerfil(data.perfil_id);
      return { ok: true as const, link: construirLink(data.origin, token) };
    } catch (e) {
      return { ok: false as const, mensagem: e instanceof Error ? e.message : "erro_convite" };
    }
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

      try {
        const token = await criarConviteParaPerfil(novoId);
        resultados.push({ email, nome, ok: true, link: construirLink(data.origin, token) });
      } catch (e) {
        resultados.push({
          email,
          nome,
          ok: true,
          erro:
            "Conta criada, mas não foi possível gerar o convite: " +
            (e instanceof Error ? e.message : "erro desconhecido"),
        });
      }
    }

    return { ok: true, resultados };
  });

// ---------- Servidor: verificar convite (público) ----------

export const verificarConvite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ token: z.string().min(20).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token_hash = await hashToken(data.token);
    const { data: convite } = await supabaseAdmin
      .from("convites_colaborador")
      .select("perfil_id, expira_em, usado_em, invalidado_em, perfis!inner(email, palavra_passe_definida_em)")
      .eq("token_hash", token_hash)
      .maybeSingle();
    if (!convite) return { ok: false as const, motivo: "invalido" as const };
    if (convite.invalidado_em) return { ok: false as const, motivo: "invalidado" as const };
    if (convite.usado_em) return { ok: false as const, motivo: "usado" as const };
    if (new Date(convite.expira_em).getTime() < Date.now())
      return { ok: false as const, motivo: "expirado" as const };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perfil = convite.perfis as any;
    if (perfil?.palavra_passe_definida_em)
      return { ok: false as const, motivo: "ja_ativada" as const };
    return { ok: true as const, email: perfil?.email as string };
  });

// ---------- Servidor: definir palavra-passe via convite (público) ----------

export const definirPasswordViaConvite = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        token: z.string().min(20).max(200),
        password: z.string().min(8).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const token_hash = await hashToken(data.token);

    const { data: convite } = await supabaseAdmin
      .from("convites_colaborador")
      .select("id, perfil_id, expira_em, usado_em, invalidado_em")
      .eq("token_hash", token_hash)
      .maybeSingle();
    if (!convite) return { ok: false as const, motivo: "invalido" as const };
    if (convite.invalidado_em) return { ok: false as const, motivo: "invalidado" as const };
    if (convite.usado_em) return { ok: false as const, motivo: "usado" as const };
    if (new Date(convite.expira_em).getTime() < Date.now())
      return { ok: false as const, motivo: "expirado" as const };

    const { data: perfil } = await supabaseAdmin
      .from("perfis")
      .select("id, palavra_passe_definida_em")
      .eq("id", convite.perfil_id)
      .maybeSingle();
    if (!perfil) return { ok: false as const, motivo: "invalido" as const };
    if (perfil.palavra_passe_definida_em)
      return { ok: false as const, motivo: "ja_ativada" as const };

    const { error: erroUpd } = await supabaseAdmin.auth.admin.updateUserById(perfil.id, {
      password: data.password,
    });
    if (erroUpd) {
      return {
        ok: false as const,
        motivo: "password_invalida" as const,
        mensagem: erroUpd.message,
      };
    }

    // Marcar convite como usado e perfil como ativado.
    await supabaseAdmin
      .from("convites_colaborador")
      .update({ usado_em: new Date().toISOString() })
      .eq("id", convite.id);
    await supabaseAdmin
      .from("perfis")
      .update({ palavra_passe_definida_em: new Date().toISOString() })
      .eq("id", perfil.id);

    return { ok: true as const };
  });

// ---------- Servidor: marcar palavra-passe como definida pelo próprio (fluxo recovery normal) ----------

export const marcarPasswordDefinida = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("perfis")
      .update({ palavra_passe_definida_em: new Date().toISOString() })
      .eq("id", context.userId)
      .is("palavra_passe_definida_em", null);
    if (error) return { ok: false as const, mensagem: error.message };
    return { ok: true as const };
  });
