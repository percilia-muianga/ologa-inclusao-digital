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
    if (cert) {
      return {
        ok: true as const,
        certificado: {
          nome_formando: cert.nome_formando,
          modulo: cert.titulo_modulo,
          instituicao: cert.nome_instituicao,
          data: cert.emitido_em,
          detalhes: null as null | {
            carga_horaria: number;
            provincia: string | null;
            turma: string | null;
            data_inicio: string | null;
            data_fim: string | null;
            nota_final_pct: string;
            assiduidade_pct: string;
            base_assiduidade: string;
          },
        },
      };
    }

    // Certificado de curso (avaliação final): mesmo mecanismo de verificação.
    // Projecção pública mínima: confirma a autenticidade do documento e nada
    // mais. Nota final e assiduidade NÃO são divulgadas publicamente.
    const { data: certCurso } = await supabaseAdmin
      .from("certificados_curso")
      .select(
        "nome_formando, titulo_curso, carga_horaria, provincia, turma_designacao, data_inicio, data_fim, base_assiduidade, emitido_em",
      )
      .eq("codigo_verificacao", codigo)
      .maybeSingle();
    if (!certCurso) return { ok: false as const };
    return {
      ok: true as const,
      certificado: {
        nome_formando: certCurso.nome_formando,
        modulo: certCurso.titulo_curso,
        instituicao: certCurso.provincia ?? "",
        data: certCurso.emitido_em,
        detalhes: {
          carga_horaria: certCurso.carga_horaria,
          provincia: certCurso.provincia,
          turma: certCurso.turma_designacao,
          data_inicio: certCurso.data_inicio,
          data_fim: certCurso.data_fim,
          nota_final_pct: null,
          assiduidade_pct: null,
          base_assiduidade: String(certCurso.base_assiduidade),
        },
      },
    };
  });
