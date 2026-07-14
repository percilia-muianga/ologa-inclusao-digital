import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const verificarCodigo = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ codigo: z.string().min(4).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const codigo = data.codigo.trim().toUpperCase();
    const { data: cert } = await supabaseAdmin
      .from("certificados")
      .select("nome_formando, titulo_modulo, nome_instituicao, emitido_em")
      .eq("codigo_verificacao", codigo)
      .maybeSingle();
    if (!cert) return { ok: false as const };
    return {
      ok: true as const,
      certificado: {
        nome_formando: cert.nome_formando,
        modulo: cert.titulo_modulo,
        instituicao: cert.nome_instituicao,
        data: cert.emitido_em,
      },
    };
  });
