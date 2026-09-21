import { createFileRoute, Outlet } from "@tanstack/react-router";

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
  component: () => <Outlet />,
});
