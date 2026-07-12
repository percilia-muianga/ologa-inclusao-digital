import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [{ title: "Entrar — Ologa" }],
  }),
  component: EntrarPage,
});

function EntrarPage() {
  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Entrar</h1>
    </main>
  );
}
