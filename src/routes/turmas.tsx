import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";
import { listarTurmas, ESTADOS_TURMA, rotuloEstadoTurma } from "@/lib/turmas.functions";
import { PROVINCIAS } from "@/lib/inscricao-schema";

export const Route = createFileRoute("/turmas")({
  loader: () => listarTurmas(),
  head: () => ({
    meta: [
      { title: "Turmas — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Turmas por província e distrito de formação, com código de inscrição legível, formadores, cronograma de sessões e limite de trinta formandos.",
      },
      { property: "og:title", content: "Turmas — Programa Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Cada turma tem província e distrito próprios: o local de formação, que pode diferir da província de registo do formando.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TurmasPage,
});

const selectClasse =
  "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";
const rotuloClasse = "block text-sm font-semibold text-navy";

function TurmasPage() {
  const { turmas, cursos } = Route.useLoaderData();
  const [provincia, setProvincia] = useState("");
  const [curso, setCurso] = useState("");
  const [estado, setEstado] = useState("");
  const [formador, setFormador] = useState("");

  const formadores = useMemo(
    () =>
      Array.from(
        new Set(turmas.map((t) => t.formadorPrincipal).filter((f): f is string => !!f)),
      ).sort((a, b) => a.localeCompare(b, "pt")),
    [turmas],
  );

  const filtradas = useMemo(
    () =>
      turmas.filter(
        (t) =>
          (!provincia || t.provincia === provincia) &&
          (!curso || t.cursoId === curso) &&
          (!estado || t.estado === estado) &&
          (!formador || t.formadorPrincipal === formador),
      ),
    [turmas, provincia, curso, estado, formador],
  );

  const porProvincia = useMemo(() => {
    const mapa = new Map<string, { turmas: number; inscritos: number }>();
    for (const t of filtradas) {
      const actual = mapa.get(t.provincia) ?? { turmas: 0, inscritos: 0 };
      actual.turmas += 1;
      actual.inscritos += t.inscritos;
      mapa.set(t.provincia, actual);
    }
    return PROVINCIAS.map((p) => ({
      provincia: p,
      turmas: mapa.get(p)?.turmas ?? 0,
      inscritos: mapa.get(p)?.inscritos ?? 0,
    }));
  }, [filtradas]);

  const totalTurmas = porProvincia.reduce((s, l) => s + l.turmas, 0);
  const totalInscritos = porProvincia.reduce((s, l) => s + l.inscritos, 0);
  const comFiltros = Boolean(provincia || curso || estado || formador);

  return (
    <PlataformaPagina
      titulo="Turmas e cronogramas"
      introducao="Cada turma pertence a um curso e tem província e distrito próprios — o local de formação —, código único de inscrição, formador principal e auxiliares, datas e limite de trinta formandos. O Painel Nacional reporta pelo local de formação, não pela província de registo do formando."
    >
      <section aria-labelledby="filtros" className="rounded-lg border border-line bg-white p-5">
        <h2 id="filtros" className="text-lg font-bold text-navy">
          Filtrar turmas
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="f-provincia" className={rotuloClasse}>
              Província do local de formação
            </label>
            <select
              id="f-provincia"
              className={`${selectClasse} mt-1`}
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
            >
              <option value="">Todas as províncias</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-curso" className={rotuloClasse}>
              Curso
            </label>
            <select
              id="f-curso"
              className={`${selectClasse} mt-1`}
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
            >
              <option value="">Todos os cursos</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-estado" className={rotuloClasse}>
              Estado
            </label>
            <select
              id="f-estado"
              className={`${selectClasse} mt-1`}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos os estados</option>
              {ESTADOS_TURMA.map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-formador" className={rotuloClasse}>
              Formador principal
            </label>
            <select
              id="f-formador"
              className={`${selectClasse} mt-1`}
              value={formador}
              onChange={(e) => setFormador(e.target.value)}
              disabled={formadores.length === 0}
            >
              <option value="">Todos os formadores</option>
              {formadores.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            {formadores.length === 0 ? (
              <p className="mt-1 text-sm text-navy-2">
                Ainda não há formadores atribuídos a turmas.
              </p>
            ) : null}
          </div>
        </div>
        {comFiltros ? (
          <button
            type="button"
            onClick={() => {
              setProvincia("");
              setCurso("");
              setEstado("");
              setFormador("");
            }}
            className="mt-4 inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy hover:bg-page"
          >
            Limpar filtros
          </button>
        ) : null}
      </section>

      <section aria-labelledby="soma-provincia" className="mt-10">
        <h2 id="soma-provincia" className="text-xl font-bold text-navy">
          Turmas e formandos inscritos por província
        </h2>
        <p className="mt-2 text-base text-navy-2">
          Soma pelo local de formação, nas onze províncias, e sempre em tabela, para que a
          leitura nunca dependa da cor. A vista respeita os filtros acima.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-line">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Número de turmas e de formandos inscritos por província de formação
            </caption>
            <thead className="bg-page text-navy">
              <tr>
                <th scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                  Província
                </th>
                <th scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                  Turmas
                </th>
                <th scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                  Formandos inscritos
                </th>
              </tr>
            </thead>
            <tbody>
              {porProvincia.map((linha) => (
                <tr key={linha.provincia} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-navy">
                    {linha.provincia}
                  </th>
                  <td className="px-3 py-2 text-navy-2">{linha.turmas}</td>
                  <td className="px-3 py-2 text-navy-2">{linha.inscritos}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line bg-page">
                <th scope="row" className="px-3 py-2 text-left font-bold text-navy">
                  Total
                </th>
                <td className="px-3 py-2 font-bold text-navy">{totalTurmas}</td>
                <td className="px-3 py-2 font-bold text-navy">{totalInscritos}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section aria-labelledby="lista-turmas" className="mt-10">
        <h2 id="lista-turmas" className="text-xl font-bold text-navy">
          Lista de turmas{" "}
          <span className="font-semibold text-navy-2">({filtradas.length})</span>
        </h2>

        {filtradas.length === 0 ? (
          <div className="mt-4">
            <EstadoVazio
              titulo={comFiltros ? "Nenhuma turma com estes filtros" : "Ainda não existem turmas"}
              descricao={
                comFiltros
                  ? "Nenhuma turma corresponde à combinação escolhida. Limpe os filtros para ver todas as turmas registadas."
                  : "A estrutura de turmas, sessões e verificação da carga horária já está criada. Assim que a coordenação nacional registar a primeira turma, ela aparece aqui com o seu código de inscrição, província e distrito de formação."
              }
            />
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 xl:grid-cols-2">
            {filtradas.map((t) => {
              const lotada = t.inscritos >= t.limiteFormandos;
              return (
                <li
                  key={t.id}
                  className="flex h-full flex-col rounded-lg border border-line bg-white p-5"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <h3 className="text-lg font-extrabold text-navy">{t.designacao}</h3>
                    <p className="inline-flex items-center rounded-md bg-navy px-3 py-1 text-sm font-bold text-navy-foreground">
                      <span className="sr-only">Local de formação: </span>
                      {t.provincia} · {t.distrito}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-navy-2">{t.cursoTitulo}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                    <div>
                      <dt className="text-navy-2">Código de inscrição</dt>
                      <dd className="font-mono text-base font-bold tracking-widest text-navy">
                        {t.codigoInscricao}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-navy-2">Estado</dt>
                      <dd className="font-bold text-navy">{rotuloEstadoTurma(t.estado)}</dd>
                    </div>
                    <div>
                      <dt className="text-navy-2">Formandos</dt>
                      <dd className={lotada ? "font-bold text-brand-dark" : "font-bold text-navy"}>
                        {t.inscritos} de {t.limiteFormandos}
                        {lotada ? " — turma cheia" : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-navy-2">Formador principal</dt>
                      <dd className="font-bold text-navy">{t.formadorPrincipal ?? "—"}</dd>
                    </div>
                  </dl>
                  <Link
                    to="/turmas/$codigo"
                    params={{ codigo: t.codigoInscricao }}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
                  >
                    Ver turma e cronograma
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-8 text-sm text-navy-2">
        O código de inscrição usa apenas letras e números sem ambiguidade — não tem a letra O
        nem o zero, nem a letra I, a letra L ou o número um —, para poder ser ditado ao telefone
        ou enviado por SMS sem enganos.
      </p>
    </PlataformaPagina>
  );
}
