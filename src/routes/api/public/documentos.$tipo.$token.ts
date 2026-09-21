import { createFileRoute } from "@tanstack/react-router";

/**
 * Antiga via pública destes documentos. Os PDF nomeiam pessoas, por isso
 * deixaram de ser servidos só com a posse da ligação: passam a exigir sessão
 * iniciada e permissão de gestão (ver src/lib/documentos.functions.ts).
 */
export const Route = createFileRoute("/api/public/documentos/$tipo/$token")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          "Estes documentos passaram a exigir sessão iniciada com uma conta autorizada.",
          { status: 401, headers: { "content-type": "text/plain; charset=utf-8" } },
        ),
    },
  },
});
