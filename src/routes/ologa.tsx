import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ologa")({
  head: () => ({ meta: [{ title: "Ologa — Administração" }] }),
  component: OlogaPage,
});

function OlogaPage() {
  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">Ologa</h1>
      </main>
    </>
  );
}
