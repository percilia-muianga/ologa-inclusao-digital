import { createFileRoute, Link } from "@tanstack/react-router";
import { PlataformaPagina } from "@/components/plataforma-pagina";
import { listarCursosPrograma } from "@/lib/cursos.functions";

export const Route = createFileRoute("/cursos/")({
  loader: () => listarCursosPrograma(),
  head: () => ({
    meta: [
      { title: "Cursos — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Seis cursos de capacitação e um módulo transversal obrigatório de Governo Digital Inclusivo e Acessibilidade.",
      },
      { property: "og:title", content: "Cursos — Plataforma Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Seis cursos de capacitação e um módulo transversal obrigatório de Governo Digital Inclusivo e Acessibilidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://ologa-staging-priv-9k3m2.lovable.app/cursos" },
    ],
  }),
  component: CursosPage,
});

function CursosPage() {
  const { cursos, totalGeralPorFornecer } = Route.useLoaderData();
  return (
    <PlataformaPagina titulo="Cursos do programa" introducao="Seis cursos de capacitação, mais um módulo transversal obrigatório sobre Governo Digital Inclusivo e Acessibilidade. Cada curso organiza-se em módulos reutilizáveis e lições.">
      <section aria-labelledby="plano-conteudo" className="mb-8 rounded-lg border border-line bg-page p-5">
        <h2 id="plano-conteudo" className="text-lg font-bold text-navy">Como está organizado o programa</h2>
        <p className="mt-2 text-base text-navy-2">
          Cada curso tem uma carga horária própria, módulos temáticos e o módulo transversal
          de Governo Digital Inclusivo e Acessibilidade, obrigatório e contado uma única vez.
          Os módulos assinalados como <b>em preparação</b> ainda não têm lições publicadas.
        </p>
        <p className="mt-2 text-base text-navy-2">
          O acompanhamento do banco de questões e do exame final fica na área de{" "}
          <Link to="/avaliacao" className="font-semibold text-navy underline">Avaliação</Link>.
        </p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cursos.map((curso) => (
          <article key={curso.id} className="flex h-full flex-col rounded-lg border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-dark">Curso {curso.ordem}</p>
            <h2 className="mt-2 text-xl font-extrabold text-navy">{curso.titulo}</h2>
            <p className="mt-3 text-sm font-semibold text-navy-2">{curso.cargaHoraria} horas · {curso.modalidade}</p>
            <p className="mt-1 text-sm text-navy-2">Meta: {curso.formandosPrevistos.toLocaleString("pt-PT")} formandos</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
              <div><dt className="text-navy-2">Módulos</dt><dd className="font-bold text-navy">{curso.totalModulos}</dd></div>
              <div>
                <dt className="text-navy-2">Lições disponíveis</dt>
                <dd className="font-bold text-navy">
                  {curso.licoesDisponiveis}
                  {curso.licoesPorFornecer > 0 ? (
                    <span className="ml-2 text-xs font-semibold text-navy-2">
                      · {curso.licoesPorFornecer} em preparação
                    </span>
                  ) : null}
                </dd>
              </div>
            </dl>
            <Link to="/cursos/$curso" params={{ curso: curso.slug }} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground">Ver estrutura do curso</Link>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm text-navy-2">Os onze módulos de literacia digital existentes permanecem disponíveis, sem conta, na <Link to="/formacao" className="font-semibold text-navy underline">formação aberta</Link>.</p>
    </PlataformaPagina>
  );
}
