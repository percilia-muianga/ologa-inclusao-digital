import { createFileRoute } from "@tanstack/react-router";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/avaliacao")({
  head: () => ({
    meta: [
      { title: "Avaliação — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Banco de questões por curso e módulo e exame final gerado no momento em que o formando o inicia, com tempo limite e retoma segura.",
      },
      { property: "og:title", content: "Avaliação — Programa Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Dois formandos nunca recebem o mesmo exame: distribuição por módulo e dificuldade e ordem das opções aleatória.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AvaliacaoPage,
});

function AvaliacaoPage() {
  return (
    <PlataformaPagina
      titulo="Avaliação"
      introducao="Banco de questões por curso e módulo, com pelo menos o triplo das questões usadas em cada exame, e exame final gerado no momento em que o formando o inicia."
    >
      <EstadoVazio
        titulo="O banco de questões ainda está vazio"
        descricao="As questões, as cinco tipologias e o exame final entram na fase 5. Os diagnósticos e quizzes dos módulos de literacia digital já existentes continuam disponíveis ao público."
      />
    </PlataformaPagina>
  );
}
