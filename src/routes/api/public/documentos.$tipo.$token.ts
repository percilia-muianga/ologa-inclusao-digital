import { createFileRoute } from "@tanstack/react-router";

const TIPOS = ["relatorio", "certificado", "declaracao"] as const;
type Tipo = (typeof TIPOS)[number];

async function servir(tipo: string, token: string): Promise<Response> {
  if (!TIPOS.includes(tipo as Tipo)) return new Response("Tipo inválido", { status: 404 });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return new Response("Token inválido", { status: 400 });
  }
  const {
    carregarDadosPorToken,
    marcarDeclaracaoAssinada,
    gerarRelatorio,
    gerarCertificadoInstituicao,
    gerarDeclaracaoDesenhoUniversal,
  } = await import("@/lib/documentos.server");

  const d = await carregarDadosPorToken(token);
  if (!d) return new Response("Não encontrado", { status: 404 });

  let bytes: Uint8Array;
  let nome: string;
  if (tipo === "relatorio") {
    bytes = await gerarRelatorio(d);
    nome = "relatorio-capacitacao.pdf";
  } else if (tipo === "certificado") {
    bytes = await gerarCertificadoInstituicao(d);
    nome = "certificado-instituicao.pdf";
  } else {
    bytes = await gerarDeclaracaoDesenhoUniversal(d);
    nome = "declaracao-desenho-universal.pdf";
    await marcarDeclaracaoAssinada(d.inst.id);
  }

  return new Response(bytes as BodyInit, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${nome}"`,
      "cache-control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/public/documentos/$tipo/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => servir(params.tipo, params.token),
    },
  },
});
