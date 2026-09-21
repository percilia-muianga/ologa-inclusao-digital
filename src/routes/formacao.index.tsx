import { createFileRoute } from "@tanstack/react-router";
import { CatalogoCursos, modulosCatalogoQuery } from "@/components/catalogo-cursos";

export const Route = createFileRoute("/formacao/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(modulosCatalogoQuery),
  head: () => ({
    meta: [
      { title: "Cursos abertos — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Pacote completo de literacia digital: 11 módulos adaptados ao contexto de Moçambique, em formato físico e virtual.",
      },
    ],
  }),
  component: ListaModulos,
});

function ListaModulos() {
  return (
    <section className="wrap py-10">
      <div className="mb-6 max-w-3xl">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark">
          Cursos
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-4xl">
          Pacote completo de literacia digital
        </h1>
        <p className="mt-3 text-base text-navy-2">
          Onze módulos adaptados ao contexto de Moçambique, em formato físico e virtual. Os
          marcados como <b>Disponível</b> já têm conteúdo completo — clique para abrir as
          lições com material de e-learning e guião do formador.
        </p>
      </div>
      <CatalogoCursos />
    </section>
  );
}
