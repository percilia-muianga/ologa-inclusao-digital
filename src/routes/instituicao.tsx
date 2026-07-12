import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/instituicao")({
  head: () => ({ meta: [{ title: "A minha instituição — Ologa" }] }),
  component: InstituicaoPage,
});

function InstituicaoPage() {
  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">A minha instituição</h1>
      </main>
    </>
  );
}
