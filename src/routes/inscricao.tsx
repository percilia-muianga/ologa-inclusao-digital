import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/inscricao")({
  head: () => ({
    meta: [{ title: "Inscrever a minha instituição — Ologa" }],
  }),
  component: InscricaoPage,
});

function InscricaoPage() {
  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Inscrever a minha instituição</h1>
    </main>
  );
}
