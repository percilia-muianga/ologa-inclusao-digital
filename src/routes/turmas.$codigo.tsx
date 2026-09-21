import { ErroPermissao } from "@/components/erro-permissao";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";
import { GestaoSessoes, InscricaoFormandos } from "@/components/gestao-turma";
import { obterTurma, rotuloEstadoTurma } from "@/lib/turmas.functions";

export const Route = createFileRoute("/turmas/$codigo")({
  ssr: false,
  errorComponent: ({ error }) => <ErroPermissao erro={error} />,
  loader: ({ params }) => obterTurma({ data: params.codigo }),
  head: ({ params }) => ({
    meta: [
      { title: `Turma ${params.codigo} — Plataforma Nacional de Capacitação Digital` },
      {
        name: "description",
        content:
          "Ficha da turma: curso, local de formação, formadores, datas, inscritos e cronograma de sessões com verificação da carga horária.",
      },
      { property: "og:title", content: `Turma ${params.codigo}` },
      {
        property: "og:description",
        content: "Cronograma de sessões e verificação da carga horária do curso.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TurmaPage,
});

function formatarData(valor: string | null) {
  if (!valor) return "—";
  return new Date(`${valor}T00:00:00`).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function TurmaPage() {
  const dados = Route.useLoaderData();
  const { codigo } = Route.useParams();

  if (!dados) {
    return (
      <PlataformaPagina titulo="Turma não encontrada">
        <EstadoVazio
          titulo={`Não existe nenhuma turma com o código ${codigo}`}
          descricao="Confirme o código com a coordenação da formação. O código tem oito caracteres, em dois grupos de quatro, e não contém a letra O, o zero, a letra I, a letra L nem o número um."
          accao={
            <Link
              to="/turmas"
              className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
            >
              Ver todas as turmas
            </Link>
          }
        />
      </PlataformaPagina>
    );
  }

  const { turma, curso, sessoes, inscritos, cargaHorariaCurso } = dados;

  return (
    <PlataformaPagina titulo={turma.designacao}>
      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-3">
        <p className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 py-2 text-base font-bold text-navy-foreground">
          <span className="sr-only">Local de formação: </span>
          {turma.provincia} · {turma.distrito}
        </p>
        <Link
          to="/turmas/editar/$codigo"
          params={{ codigo: turma.codigo_inscricao }}
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-white px-4 text-base font-semibold text-navy hover:bg-page"
        >
          Editar turma
        </Link>
      </div>

      <section aria-labelledby="ficha" className="rounded-lg border border-line bg-white p-5">
        <h2 id="ficha" className="text-xl font-bold text-navy">
          Ficha da turma
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <dt className="text-sm text-navy-2">Curso</dt>
            <dd className="font-bold text-navy">
              {curso ? (
                <Link to="/cursos/$curso" params={{ curso: curso.slug }} className="underline">
                  {curso.titulo}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Código de inscrição</dt>
            <dd className="font-mono text-lg font-bold tracking-widest text-navy">
              {turma.codigo_inscricao}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Estado</dt>
            <dd className="font-bold text-navy">{rotuloEstadoTurma(turma.estado)}</dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Local de formação</dt>
            <dd className="font-bold text-navy">
              {turma.local_formacao ?? "—"} — {turma.distrito}, {turma.provincia}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Modalidade</dt>
            <dd className="font-bold text-navy">{turma.modalidade}</dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Datas</dt>
            <dd className="font-bold text-navy">
              {formatarData(turma.data_inicio)} a {formatarData(turma.data_fim)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Formador principal</dt>
            <dd className="font-bold text-navy">{turma.formador_principal_nome ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Formadores auxiliares</dt>
            <dd className="font-bold text-navy">
              {turma.formadores_auxiliares.length > 0
                ? turma.formadores_auxiliares.join(", ")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Formandos</dt>
            <dd
              className={
                inscritos >= turma.limite_formandos
                  ? "font-bold text-brand-dark"
                  : "font-bold text-navy"
              }
            >
              {inscritos} de {turma.limite_formandos}
              {inscritos >= turma.limite_formandos
                ? " — limite atingido, não aceite mais inscrições"
                : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Computadores disponíveis na sala</dt>
            <dd className="font-bold text-navy">{turma.num_computadores ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Formandos por computador</dt>
            <dd className="font-bold text-navy">
              {turma.num_computadores && turma.num_computadores > 0 && inscritos > 0
                ? `${Math.round((inscritos / turma.num_computadores) * 100) / 100} por computador`
                : "—"}
            </dd>
          </div>
        </dl>

        {turma.num_computadores && turma.num_computadores > 0 && inscritos > 0
          ? (() => {
              const racio = inscritos / turma.num_computadores;
              const excede = racio > 2;
              return (
                <p
                  role="status"
                  className={
                    excede
                      ? "mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-base text-navy"
                      : "mt-4 rounded-md border border-line bg-page p-4 text-base text-navy"
                  }
                >
                  {excede ? (
                    <>
                      <strong>Atenção: o rácio de equipamento excede o máximo admitido.</strong> São{" "}
                      {Math.round(racio * 100) / 100} formandos por computador e o Termo de
                      Referência admite no máximo dois. Faltam{" "}
                      {Math.ceil(inscritos / 2) - turma.num_computadores} computadores.
                    </>
                  ) : (
                    <>
                      <strong>Rácio de equipamento conforme.</strong> São{" "}
                      {Math.round(racio * 100) / 100} formandos por computador, dentro do máximo de
                      dois admitido pelo Termo de Referência.
                    </>
                  )}
                </p>
              );
            })()
          : null}

        <p className="mt-3 text-sm text-navy-2">
          A turma mantém-se limitada a {turma.limite_formandos} formandos, conforme o Termo de
          Referência.
        </p>
      </section>

      <GestaoSessoes
        turmaId={turma.id}
        sessoes={sessoes}
        cargaHorariaCurso={cargaHorariaCurso}
      />

      <InscricaoFormandos
        turmaId={turma.id}
        inscritos={inscritos}
        limite={turma.limite_formandos}
      />

      <p className="mt-8 text-sm">
        <Link to="/turmas" className="font-semibold text-navy underline">
          Voltar à lista de turmas
        </Link>
      </p>
    </PlataformaPagina>
  );
}
