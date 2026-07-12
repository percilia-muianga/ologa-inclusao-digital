import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/verificar")({
  head: () => ({
    meta: [{ title: "Verificar certificado — Ologa" }],
  }),
  component: VerificarPage,
});

function VerificarPage() {
  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Verificar certificado</h1>
    </main>
  );
}
