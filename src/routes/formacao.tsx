import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/formacao")({
  head: () => ({ meta: [{ title: "A minha formação — Ologa" }] }),
  component: FormacaoPage,
});

function FormacaoPage() {
  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">A minha formação</h1>
      </main>
    </>
  );
}
