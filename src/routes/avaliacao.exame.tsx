import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/avaliacao/exame")({
  head: () => ({
    meta: [
      { title: "Exame final — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Exame final gerado no momento em que o formando o inicia, com tempo limite, gravação automática e retoma segura.",
      },
      { property: "og:title", content: "Exame final — Capacitação Digital" },
      {
        property: "og:description",
        content: "Dois formandos nunca recebem o mesmo exame.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Outlet />,
});
