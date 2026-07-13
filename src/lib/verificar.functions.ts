import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const verificarCodigo = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ codigo: z.string().min(4).max(32) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const codigo = data.codigo.trim().toUpperCase();
    const { data: inst } = await supabaseAdmin
      .from("instituicoes")
      .select("id, nome, provincia, distrito, criado_em, declaracao_assinada")
      .eq("codigo_inscricao", codigo)
      .maybeSingle();
    if (!inst) return { ok: false as const };

    const { data: fs } = await supabaseAdmin
      .from("formandos")
      .select("id")
      .eq("instituicao_id", inst.id);
    const ids = (fs ?? []).map((r) => r.id);
    let concluidos = 0;
    if (ids.length > 0) {
      const { data: uniq } = await supabaseAdmin
        .from("certificados")
        .select("formando_id")
        .in("formando_id", ids);
      concluidos = new Set((uniq ?? []).map((r) => r.formando_id)).size;
    }
    return {
      ok: true as const,
      instituicao: {
        nome: inst.nome,
        localizacao: [inst.distrito, inst.provincia].filter(Boolean).join(", "),
        registada_em: inst.criado_em,
        declaracao_assinada: inst.declaracao_assinada,
        concluidos,
      },
    };
  });
