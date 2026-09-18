import { createFileRoute } from "@tanstack/react-router";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/turmas")({
  head: () => ({
    meta: [
      { title: "Turmas — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Turmas por província e distrito de formação, com código de inscrição, formadores, cronograma de sessões e limite de trinta formandos.",
      },
      { property: "og:title", content: "Turmas — Programa Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Cada turma tem província e distrito próprios: o local de formação, que pode diferir da província de registo do formando.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TurmasPage,
});

function TurmasPage() {
  return (
    <PlataformaPagina
      titulo="Turmas e cronogramas"
      introducao="Cada turma pertence a um curso e tem província e distrito próprios — o local de formação —, código único de inscrição, formador principal e auxiliares, datas e limite de trinta formandos."
    >
      <EstadoVazio
        titulo="Ainda não existem turmas"
        descricao="As turmas, as sessões e a verificação da carga horária entram na fase 3. Nessa altura, esta página lista as turmas de todas as províncias, com filtros por curso, província, distrito e estado."
      />
    </PlataformaPagina>
  );
}
