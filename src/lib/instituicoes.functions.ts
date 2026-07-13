import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { baseInstituicaoSchema } from "./inscricao-schema";

const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function gerarCodigo(len = 8): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += ALFABETO[bytes[i] % ALFABETO.length];
  return out;
}

async function garantirAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("perfis")
    .select("papel")
    .eq("id", userId)
    .maybeSingle();
  return data?.papel === "admin_ologa";
}

export const listarInstituicoesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await garantirAdmin(context.userId))) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("instituicoes")
      .select(
        "id, nome, natureza, setor, provincia, distrito, meio, conectividade, modalidade, num_colaboradores_total, codigo_inscricao, criado_em",
      )
      .order("criado_em", { ascending: false });
    if (error) return { ok: false as const, mensagem: error.message };
    return { ok: true as const, instituicoes: data ?? [] };
  });

export const obterInstituicaoAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await garantirAdmin(context.userId))) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inst, error } = await supabaseAdmin
      .from("instituicoes")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) return { ok: false as const, mensagem: error.message };
    if (!inst) return { ok: false as const, mensagem: "nao_encontrada" };

    let modulos: { id: string; titulo: string }[] = [];
    if (inst.modulos_interesse && inst.modulos_interesse.length > 0) {
      const { data: mods } = await supabaseAdmin
        .from("modulos")
        .select("id, titulo")
        .in("id", inst.modulos_interesse);
      modulos = mods ?? [];
    }
    return { ok: true as const, instituicao: inst, modulos };
  });

export const regenerarCodigoInstituicao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await garantirAdmin(context.userId))) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < 6; i++) {
      const codigo = gerarCodigo(8);
      const { data: upd, error } = await supabaseAdmin
        .from("instituicoes")
        .update({ codigo_inscricao: codigo })
        .eq("id", data.id)
        .select("codigo_inscricao")
        .single();
      if (!error && upd) {
        return { ok: true as const, codigo: upd.codigo_inscricao };
      }
      const msg = error?.message?.toLowerCase() ?? "";
      if (!msg.includes("duplicate") && !msg.includes("codigo_inscricao")) {
        return { ok: false as const, mensagem: error?.message ?? "erro" };
      }
    }
    return { ok: false as const, mensagem: "Não foi possível gerar código único." };
  });

export const criarInstituicaoManual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => baseInstituicaoSchema.parse(d))
  .handler(async ({ data, context }) => {
    if (!(await garantirAdmin(context.userId))) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < 6; i++) {
      const codigo = gerarCodigo(8);
      const { data: inserted, error } = await supabaseAdmin
        .from("instituicoes")
        .insert({
          nome: data.nome,
          natureza: data.natureza,
          setor: data.setor,
          setor_outro:
            data.setor === "outro" ? data.setor_outro?.trim() ?? null : null,
          ponto_focal_nome: data.ponto_focal_nome?.trim() || null,
          ponto_focal_email: data.ponto_focal_email || null,
          provincia: data.provincia ?? null,
          distrito: data.distrito?.trim() || null,
          meio: data.meio ?? null,
          modalidade: data.modalidade ?? null,
          conectividade: data.conectividade ?? null,
          num_computadores: data.num_computadores ?? null,
          num_trabalhadores_total: data.num_trabalhadores_total,
          meta_cobertura_pct: data.meta_cobertura_pct,
          prazo_meses: data.prazo_meses,
          num_colaboradores_total: data.num_colaboradores_total,
          nivel_literacia: data.nivel_literacia ?? null,
          num_mulheres: data.num_mulheres ?? null,
          num_homens: data.num_homens ?? null,
          num_pcd: data.num_pcd ?? null,
          apoios_acessibilidade: data.apoios_acessibilidade ?? null,
          modulos_interesse: data.modulos_interesse ?? null,
          percurso: data.percurso ?? null,
          sala_disponivel: data.sala_disponivel ?? null,
          observacoes: data.observacoes?.trim() || null,
          consentimento: true,
          codigo_inscricao: codigo,
        })
        .select("id, codigo_inscricao, indicadores_token")
        .single();
      if (!error && inserted) {
        return {
          ok: true as const,
          id: inserted.id,
          codigo: inserted.codigo_inscricao,
          indicadores_token: inserted.indicadores_token,
        };
      }
      const msg = error?.message?.toLowerCase() ?? "";
      if (!msg.includes("duplicate") && !msg.includes("codigo_inscricao")) {
        return { ok: false as const, mensagem: error?.message ?? "erro" };
      }
    }
    return { ok: false as const, mensagem: "Não foi possível gerar código único." };
  });

export const listarModulosAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await garantirAdmin(context.userId))) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("modulos")
      .select("id, titulo, ordem, nivel")
      .order("ordem", { ascending: true });
    if (error) return { ok: false as const, mensagem: error.message };
    return { ok: true as const, modulos: data ?? [] };
  });

export const listarGestoresInstituicao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ instituicao_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await garantirAdmin(context.userId))) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: gestores, error } = await supabaseAdmin
      .from("perfis")
      .select("id, nome, email, criado_em")
      .eq("instituicao_id", data.instituicao_id)
      .eq("papel", "gestor_instituicao")
      .order("criado_em", { ascending: true });
    if (error) return { ok: false as const, mensagem: error.message };
    return { ok: true as const, gestores: gestores ?? [] };
  });

export const criarGestorInstituicao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        instituicao_id: z.string().uuid(),
        nome: z.string().trim().min(2, "Nome obrigatório").max(200),
        email: z.string().trim().toLowerCase().email("Email inválido"),
        origin: z.string().url(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (!(await garantirAdmin(context.userId))) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Confirmar que a instituição existe
    const { data: inst, error: erroInst } = await supabaseAdmin
      .from("instituicoes")
      .select("id")
      .eq("id", data.instituicao_id)
      .maybeSingle();
    if (erroInst) return { ok: false as const, mensagem: erroInst.message };
    if (!inst) return { ok: false as const, mensagem: "instituicao_nao_encontrada" };

    // Criar utilizador com email confirmado, sem palavra-passe
    const { data: criado, error: erroUser } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
      user_metadata: { nome: data.nome },
    });
    if (erroUser || !criado?.user) {
      return {
        ok: false as const,
        mensagem: erroUser?.message ?? "Não foi possível criar o utilizador.",
      };
    }
    const novoId = criado.user.id;

    // Criar perfil ligado à instituição, papel gestor_instituicao
    const { error: erroPerfil } = await supabaseAdmin.from("perfis").insert({
      id: novoId,
      nome: data.nome,
      email: data.email,
      papel: "gestor_instituicao",
      instituicao_id: data.instituicao_id,
    });
    if (erroPerfil) {
      // Reverter utilizador para não deixar conta órfã
      await supabaseAdmin.auth.admin.deleteUser(novoId);
      return { ok: false as const, mensagem: erroPerfil.message };
    }

    // Gerar link de definição de palavra-passe (invite)
    const redirectTo = `${data.origin.replace(/\/$/, "")}/definir-palavra-passe`;
    const { data: linkData, error: erroLink } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
      options: { redirectTo },
    });
    if (erroLink || !linkData?.properties?.action_link) {
      return {
        ok: false as const,
        mensagem: erroLink?.message ?? "Conta criada, mas não foi possível gerar o link.",
      };
    }

    return {
      ok: true as const,
      gestor: {
        id: novoId,
        nome: data.nome,
        email: data.email,
      },
      link: linkData.properties.action_link,
    };
  });
