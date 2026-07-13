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

    const { data: percursoRows } = await supabaseAdmin
      .from("instituicao_modulos_percurso")
      .select("modulo_id, ordem, modulos(titulo)")
      .eq("instituicao_id", data.id)
      .order("ordem", { ascending: true });
    const percurso = (percursoRows ?? []).map((r) => ({
      modulo_id: r.modulo_id as string,
      ordem: r.ordem as number,
      titulo:
        (r as unknown as { modulos: { titulo: string } | null }).modulos?.titulo ?? "",
    }));

    const { data: hist } = await supabaseAdmin
      .from("metas_historico")
      .select("id, campo, valor_antigo, valor_novo, alterado_em, alterado_por")
      .eq("instituicao_id", data.id)
      .order("alterado_em", { ascending: false })
      .limit(50);

    return {
      ok: true as const,
      instituicao: inst,
      modulos,
      percurso,
      historico: hist ?? [],
    };
  });

const METAS_SCHEMA = z.object({
  id: z.string().uuid(),
  meta_cobertura_pct: z.number().int().min(1).max(100).nullable(),
  meta_conclusao_pct: z.number().int().min(1).max(100).nullable(),
  meta_ganho_pontos: z.number().int().min(1).max(100).nullable(),
  meta_equidade_max_pp: z.number().int().min(0).max(100).nullable(),
  prazo_meses: z.number().int().positive().nullable(),
});

export const atualizarMetasInstituicao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => METAS_SCHEMA.parse(d))
  .handler(async ({ data, context }) => {
    if (!(await garantirAdmin(context.userId))) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("instituicoes")
      .update({
        meta_cobertura_pct: data.meta_cobertura_pct,
        meta_conclusao_pct: data.meta_conclusao_pct,
        meta_ganho_pontos: data.meta_ganho_pontos,
        meta_equidade_max_pp: data.meta_equidade_max_pp,
        prazo_meses: data.prazo_meses,
      })
      .eq("id", data.id);
    if (error) return { ok: false as const, mensagem: error.message };
    return { ok: true as const };
  });

const PERCURSO_SCHEMA = z.object({
  id: z.string().uuid(),
  modulos: z.array(z.string().uuid()),
});

export const atualizarPercursoInstituicao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PERCURSO_SCHEMA.parse(d))
  .handler(async ({ data, context }) => {
    if (!(await garantirAdmin(context.userId))) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: delErr } = await supabaseAdmin
      .from("instituicao_modulos_percurso")
      .delete()
      .eq("instituicao_id", data.id);
    if (delErr) return { ok: false as const, mensagem: delErr.message };
    if (data.modulos.length > 0) {
      const rows = data.modulos.map((modulo_id, idx) => ({
        instituicao_id: data.id,
        modulo_id,
        ordem: idx + 1,
      }));
      const { error: insErr } = await supabaseAdmin
        .from("instituicao_modulos_percurso")
        .insert(rows);
      if (insErr) return { ok: false as const, mensagem: insErr.message };
    }
    return { ok: true as const };
  });

export const regenerarTokenIndicadores = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await garantirAdmin(context.userId))) {
      return { ok: false as const, mensagem: "acesso_negado" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: upd, error } = await supabaseAdmin
      .from("instituicoes")
      .update({ indicadores_token: crypto.randomUUID() })
      .eq("id", data.id)
      .select("indicadores_token")
      .single();
    if (error || !upd) {
      return { ok: false as const, mensagem: error?.message ?? "erro" };
    }
    return { ok: true as const, token: upd.indicadores_token };
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
          pedido_meta_cobertura_pct: data.meta_cobertura_pct,
          pedido_prazo_meses: data.prazo_meses,
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

