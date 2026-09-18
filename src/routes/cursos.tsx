import { createFileRoute, Link } from "@tanstack/react-router";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Os seis cursos do programa nacional de capacitação digital, mais o módulo transversal de Governo Digital Inclusivo e Acessibilidade.",
      },
      { property: "og:title", content: "Cursos — Programa Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Estrutura Curso, Módulo e Lição, com carga horária, modalidade e número previsto de formandos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CursosPage,
});

function CursosPage() {
  return (
    <PlataformaPagina
      titulo="Cursos do programa"
      introducao="Seis cursos de capacitação, mais um módulo transversal obrigatório sobre Governo Digital Inclusivo e Acessibilidade. Cada curso organiza-se em módulos reutilizáveis e lições."
    >
      <EstadoVazio
        titulo="Os cursos são carregados na fase seguinte"
        descricao="A estrutura dos seis cursos, dos módulos e das lições está planeada e entra na fase 2. Entretanto, os onze módulos de literacia digital já existentes continuam abertos ao público, sem necessidade de conta."
        accao={
          <Link
            to="/formacao"
            className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
          >
            Ver os módulos de literacia digital
          </Link>
        }
      />
    </PlataformaPagina>
  );
}
