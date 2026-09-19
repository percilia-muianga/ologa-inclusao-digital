import { createFileRoute, Link } from "@tanstack/react-router";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";
import { obterTurma, rotuloEstadoTurma } from "@/lib/turmas.functions";

export const Route = createFileRoute("/turmas/$codigo")({
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

  const { turma, curso, sessoes, inscritos, horasAgendadas, cargaHorariaCurso, cargaConfere } =
    dados;

  return (
    <PlataformaPagina titulo={turma.designacao}>
      <p className="-mt-4 mb-6 inline-flex items-center rounded-md bg-navy px-4 py-2 text-base font-bold text-navy-foreground">
        <span className="sr-only">Local de formação: </span>
        {turma.provincia} · {turma.distrito}
      </p>

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

      <section aria-labelledby="cronograma" className="mt-10">
        <h2 id="cronograma" className="text-xl font-bold text-navy">
          Cronograma de sessões
        </h2>

        {cargaHorariaCurso > 0 ? (
          <p
            role="status"
            className={
              cargaConfere
                ? "mt-3 rounded-md border border-line bg-page p-4 text-base text-navy"
                : "mt-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-base text-navy"
            }
          >
            {cargaConfere ? (
              <>
                <strong>Carga horária conferida.</strong> As sessões somam {horasAgendadas} horas,
                exactamente a carga horária do curso.
              </>
            ) : (
              <>
                <strong>Atenção: a carga horária não confere.</strong> As sessões somam{" "}
                {horasAgendadas} horas e o curso exige {cargaHorariaCurso} horas. Faltam{" "}
                {Math.round((cargaHorariaCurso - horasAgendadas) * 100) / 100} horas por agendar.
              </>
            )}
          </p>
        ) : null}

        {sessoes.length === 0 ? (
          <div className="mt-4">
            <EstadoVazio
              titulo="Ainda não há sessões agendadas"
              descricao="Assim que a coordenação agendar as sessões, aparecem aqui com data, horas, duração, tema e formador, e a soma das horas é comparada com a carga horária do curso."
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-line">
            <table className="min-w-full border-collapse text-left text-sm">
              <caption className="sr-only">Sessões da turma, por ordem cronológica</caption>
              <thead className="bg-page text-navy">
                <tr>
                  {["#", "Data", "Início", "Fim", "Duração", "Tema", "Formador"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-3 py-2 text-xs font-bold uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessoes.map((s) => {
                  const [hi, mi] = s.hora_inicio.split(":").map(Number);
                  const [hf, mf] = s.hora_fim.split(":").map(Number);
                  const minutos = hf * 60 + mf - (hi * 60 + mi);
                  return (
                    <tr key={s.id} className="border-t border-line">
                      <th scope="row" className="px-3 py-2 text-left font-semibold text-navy">
                        {s.ordem}
                      </th>
                      <td className="px-3 py-2 text-navy-2">{formatarData(s.data)}</td>
                      <td className="px-3 py-2 text-navy-2">{s.hora_inicio.slice(0, 5)}</td>
                      <td className="px-3 py-2 text-navy-2">{s.hora_fim.slice(0, 5)}</td>
                      <td className="px-3 py-2 text-navy-2">
                        {Math.floor(minutos / 60)}h{String(minutos % 60).padStart(2, "0")}
                      </td>
                      <td className="px-3 py-2 text-navy-2">{s.tema}</td>
                      <td className="px-3 py-2 text-navy-2">{s.formador_nome ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-8 text-sm">
        <Link to="/turmas" className="font-semibold text-navy underline">
          Voltar à lista de turmas
        </Link>
      </p>
    </PlataformaPagina>
  );
}
