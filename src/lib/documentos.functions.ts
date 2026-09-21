/**
 * Documentos em PDF da instituição (relatório, certificado, declaração).
 *
 * Estes ficheiros nomeiam pessoas. Por isso deixaram de ser obteníveis apenas
 * com a posse da ligação pessoal da instituição: exigem sessão iniciada e
 * permissão de gestão verificada no servidor. A página pública de indicadores
 * continua a mostrar apenas totais agregados e censurados.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sessaoObrigatoria, exigirGestao, type ContextoAutenticado } from "@/lib/guardas";

const esquema = z.object({
  tipo: z.enum(["relatorio", "certificado", "declaracao"]),
  token: z.string().uuid(),
});

export const obterDocumentoInstituicao = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .inputValidator((d: z.infer<typeof esquema>) => esquema.parse(d))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as ContextoAutenticado;
    await exigirGestao(ctx, "ler", `documento_${data.tipo}`);

    const {
      carregarDadosPorToken,
      gerarRelatorio,
      gerarCertificadoInstituicao,
      gerarDeclaracaoDesenhoUniversal,
    } = await import("@/lib/documentos.server");

    const d = await carregarDadosPorToken(data.token);
    if (!d) throw new Error("DOCUMENTO_NAO_ENCONTRADO");

    const bytes =
      data.tipo === "relatorio"
        ? await gerarRelatorio(d)
        : data.tipo === "certificado"
          ? await gerarCertificadoInstituicao(d)
          : await gerarDeclaracaoDesenhoUniversal(d);

    let binario = "";
    for (const b of bytes) binario += String.fromCharCode(b);
    return { nome: `${data.tipo}.pdf`, base64: btoa(binario) };
  });
