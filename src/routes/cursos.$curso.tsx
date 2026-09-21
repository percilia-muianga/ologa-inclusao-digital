import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PlataformaPagina } from "@/components/plataforma-pagina";
import { obterCursoPrograma } from "@/lib/cursos.functions";

export const Route = createFileRoute("/cursos/$curso")({
  loader: async ({ params }) => {
    const resultado = await obterCursoPrograma({ data: params.curso });
    if (!resultado) throw notFound();
    return resultado;
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Curso indisponível — Plataforma Nacional de Capacitação Digital" },
          { name: "robots", content: "noindex" },
        ],
      };
    const titulo = `${loaderData.curso.titulo} — Plataforma Nacional de Capacitação Digital`;
    const descricao = `${loaderData.curso.carga_horaria} horas em regime ${loaderData.curso.modalidade}, organizado em ${loaderData.modulos.length} módulos.`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: descricao },
        { property: "og:title", content: titulo },
        { property: "og:description", content: descricao },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CursoPage,
});

function CursoPage() {
  const { curso, modulos, totalPorFornecer, minutosAvaliacao, horasCurriculo, propostaPorValidar } =
    Route.useLoaderData();
  const campos = [
    ["Objectivos", curso.objectivos],
    ["Público-alvo", curso.publico_alvo],
    ["Pré-requisitos", curso.pre_requisitos],
    ["Materiais", curso.materiais],
  ] as const;
  return (
    <PlataformaPagina titulo={curso.titulo} introducao={`${curso.carga_horaria} horas · ${curso.modalidade} · Meta de ${curso.formandos_previstos.toLocaleString("pt-PT")} formandos.`}>
      <Link to="/cursos" className="inline-flex min-h-11 items-center font-semibold text-navy underline">← Voltar aos seis cursos</Link>
      <section aria-labelledby="estado-conteudo" className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-5">
        <h2 id="estado-conteudo" className="text-lg font-bold text-navy">Estado do conteúdo</h2>
        {propostaPorValidar ? (
          <p className="mt-2 text-navy-2">
            <strong>Proposta pedagógica — por validar pela Ologa/ATDI.</strong> O conteúdo
            das lições é um rascunho preparado pela equipa. Estar disponível nesta página
            não significa estar aprovado. Todos os casos apresentados são fictícios e
            servem apenas de exercício.
          </p>
        ) : null}
        {totalPorFornecer > 0 ? (
          <p className="mt-2 text-navy-2">
            <strong>{totalPorFornecer} lições por fornecer neste curso.</strong> Os
            títulos organizam o plano de produção; o conteúdo temático será fornecido
            pela equipa Ologa.
          </p>
        ) : (
          <p className="mt-2 text-navy-2">
            <strong>Todas as lições deste curso já têm conteúdo escrito.</strong> O
            conteúdo está em rascunho, por validar. Não existe aprovação da Ologa, da
            ATDI nem revisão de acessibilidade por terceiros.
          </p>
        )}
        <p className="mt-2 text-navy-2">
          Carga oficial do curso: {curso.carga_horaria} horas. Soma do plano curricular:{" "}
          {horasCurriculo} horas
          {minutosAvaliacao > 0
            ? `, das quais ${Math.round((minutosAvaliacao / 60) * 10) / 10} horas de avaliação e orientação fora dos módulos`
            : ""}
          .{" "}
          {horasCurriculo === curso.carga_horaria
            ? "As duas somas coincidem."
            : "As duas somas não coincidem: a divergência está assinalada para revisão pedagógica."}
        </p>
      </section>
      <section aria-labelledby="ficha-curso" className="mt-6">
        <h2 id="ficha-curso" className="text-xl font-extrabold text-navy">Ficha do curso</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {campos.map(([rotulo, valor]) => (
            <div key={rotulo} className="rounded-lg border border-line bg-page p-4">
              <dt className="font-bold text-navy">{rotulo}</dt>
              <dd className="mt-2 text-sm text-navy-2">{valor || "Conteúdo por fornecer pela equipa Ologa."}</dd>
            </div>
          ))}
          <div className="rounded-lg border border-line bg-page p-4">
            <dt className="font-bold text-navy">Progresso agregado</dt>
            <dd className="mt-2 text-sm text-navy-2">—</dd>
          </div>
        </dl>
      </section>
      <div className="mt-8 space-y-6">
        {modulos.map((modulo) => (
          <section key={modulo.id} aria-labelledby={`modulo-${modulo.id}`} className="rounded-lg border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-dark">{modulo.transversal ? "Módulo transversal obrigatório" : `Módulo ${modulo.ordem}`}</p><h2 id={`modulo-${modulo.id}`} className="mt-1 text-xl font-extrabold text-navy">{modulo.titulo}</h2>{modulo.descricao ? <p className="mt-2 max-w-3xl text-navy-2">{modulo.descricao}</p> : null}</div>
              <span className="rounded-full bg-page px-3 py-1 text-sm font-bold text-navy">
                {modulo.porFornecer > 0
                  ? `${modulo.porFornecer} lições por fornecer`
                  : modulo.licoes.some((l) => l.proposta_por_validar)
                    ? "Conteúdo escrito, em rascunho por validar"
                    : "Conteúdo disponível"}
              </span>
            </div>
            <ol className="mt-5 space-y-4">
              {modulo.licoes.map((licao) => (
                <li key={licao.id} className="rounded-md border border-line p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-bold text-navy">{licao.ordem}. {licao.titulo}</h3>
                    <span className={`rounded px-2 py-1 text-xs font-bold ${licao.estado_conteudo === "disponivel" ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-900"}`}>{licao.estado_conteudo === "disponivel" ? "Conteúdo disponível" : "Conteúdo por fornecer"}</span>
                  </div>
                  <p className="mt-1 text-sm text-navy-2">
                    {licao.duracao ?? "Duração por definir"}
                    {licao.proposta_por_validar ? " · Proposta pedagógica por validar" : ""}
                  </p>
                  {licao.estado_conteudo === "disponivel" && licao.conteudo_elearning ? (
                    <>
                      <Link
                        to="/formacao/$modulo/licao/$licao"
                        params={{ modulo: modulo.id, licao: licao.id }}
                        search={{ curso: curso.slug }}
                        className="mt-3 inline-flex min-h-11 items-center font-semibold text-navy underline"
                      >
                        Abrir a lição, com leitura em voz alta e navegação entre lições
                      </Link>
                      <details className="mt-3">
                        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-navy">
                          Ler aqui o conteúdo desta lição
                        </summary>
                        <div className="prose mt-4 max-w-none text-navy-2" dangerouslySetInnerHTML={{ __html: licao.conteudo_elearning }} />
                      </details>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-navy-2">Título definido; conteúdo temático ainda por escrever.</p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </PlataformaPagina>
  );
}