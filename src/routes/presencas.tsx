import { createFileRoute } from "@tanstack/react-router";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/presencas")({
  head: () => ({
    meta: [
      { title: "Presenças — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Marcação de presenças por sessão, optimizada para telefone e para trabalhar sem internet, com taxa de assiduidade por formando.",
      },
      { property: "og:title", content: "Presenças — Programa Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Presente, ausente ou justificado, com sincronização quando a ligação voltar e sinal claro abaixo dos oitenta por cento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PresencasPage,
});

function PresencasPage() {
  return (
    <PlataformaPagina
      titulo="Presenças"
      introducao="Marcação de presente, ausente ou justificado por formando e por sessão, num ecrã feito para telefone, que funciona sem internet e sincroniza quando a ligação voltar."
    >
      <EstadoVazio
        titulo="Ainda não há sessões para marcar"
        descricao="A folha de presenças abre quando existirem turmas e sessões, na fase 4. A assiduidade mínima para certificação é de oitenta por cento e fica sempre visível por formando."
      />
    </PlataformaPagina>
  );
}
