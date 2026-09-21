import { ErroPermissao } from "@/components/erro-permissao";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";
import { listarWorkshops, rotuloEstadoWorkshop } from "@/lib/workshops.functions";

export const Route = createFileRoute("/workshops/")({
  ssr: false,
  errorComponent: ({ error }) => <ErroPermissao erro={error} />,
  loader: () => listarWorkshops(),
  head: () => ({
    meta: [
      { title: "Workshops — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Workshops provinciais e distritais de sensibilização, divulgação dos serviços digitais do Governo e auscultação, com registo de participantes.",
      },
      { property: "og:title", content: "Workshops de sensibilização e auscultação" },
      {
        property: "og:description",
        content:
          "Onze workshops provinciais e setenta e sete distritais, com registo leve de participantes e pré e pós-teste.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkshopsPage,
});

function formatarData(valor: string | null) {
  if (!valor) return "—";
  return new Date(`${valor}T00:00:00`).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function WorkshopsPage() {
  const { workshops, config, locais } = Route.useLoaderData();
  const [provincia, setProvincia] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");

  const filtrados = useMemo(
    () =>
      workshops.filter(
        (w) =>
          (!provincia || w.provincia === provincia) &&
          (!tipo || w.tipo === tipo) &&
          (!estado || w.estado === estado),
      ),
    [workshops, provincia, tipo, estado],
  );

  const previstosProv = Number(config["workshops_provinciais_previstos"] ?? 11);
  const previstosDist = Number(config["workshops_distritais_previstos"] ?? 77);
  const realizadosProv = workshops.filter(
    (w) => w.tipo === "provincial" && w.estado === "realizado",
  ).length;
  const realizadosDist = workshops.filter(
    (w) => w.tipo === "distrital" && w.estado === "realizado",
  ).length;

  const campo =
    "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";

  return (
    <PlataformaPagina
      titulo="Workshops"
      introducao="Programa de sensibilização, divulgação dos serviços digitais do Governo e auscultação. Os participantes dos workshops não estão sujeitos aos critérios de certificação dos seis cursos: não há nota de exame nem exigência de oitenta por cento de assiduidade."
    >
      <section aria-labelledby="execucao" className="rounded-lg border border-line bg-white p-5">
        <h2 id="execucao" className="text-xl font-bold text-navy">
          Execução face ao previsto
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-line bg-page p-4">
            <dt className="text-sm text-navy-2">Workshops provinciais</dt>
            <dd className="text-2xl font-extrabold text-navy">
              {realizadosProv} de {previstosProv}
            </dd>
            <p className="mt-1 text-sm text-navy-2">
              Um por província, até {config["workshops_provinciais_participantes_max"] ?? 60}{" "}
              participantes.
            </p>
          </div>
          <div className="rounded-md border border-line bg-page p-4">
            <dt className="text-sm text-navy-2">Workshops distritais</dt>
            <dd className="text-2xl font-extrabold text-navy">
              {realizadosDist} de {previstosDist}
            </dd>
            <p className="mt-1 text-sm text-navy-2">
              Sete por província, de {config["workshops_distritais_participantes_min"] ?? 25} a{" "}
              {config["workshops_distritais_participantes_max"] ?? 30} participantes.
            </p>
          </div>
          <div className="rounded-md border border-line bg-page p-4">
            <dt className="text-sm text-navy-2">Duração de cada workshop</dt>
            <dd className="text-2xl font-extrabold text-navy">
              até {config["workshop_duracao_horas_max"] ?? 6} horas
            </dd>
            <p className="mt-1 text-sm text-navy-2">Um dia de trabalho.</p>
          </div>
          <div className="rounded-md border border-line bg-page p-4">
            <dt className="text-sm text-navy-2">Participantes registados</dt>
            <dd className="text-2xl font-extrabold text-navy">
              {workshops.reduce((s, w) => s + w.participantes, 0)}
            </dd>
            <p className="mt-1 text-sm text-navy-2">Registo leve, sem certificação por nota.</p>
          </div>
        </dl>
      </section>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-xl font-bold text-navy">Lista de workshops</h2>
        <Link
          to="/workshops/novo"
          className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
        >
          Criar workshop
        </Link>
      </div>

      <form
        className="mt-4 grid gap-4 rounded-lg border border-line bg-white p-5 sm:grid-cols-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="f-prov" className="mb-1 block text-sm font-semibold text-navy">
            Província
          </label>
          <select
            id="f-prov"
            className={campo}
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
          >
            <option value="">Todas as províncias</option>
            {locais.map((l) => (
              <option key={l.provincia} value={l.provincia}>
                {l.provincia}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-tipo" className="mb-1 block text-sm font-semibold text-navy">
            Tipo
          </label>
          <select id="f-tipo" className={campo} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Provinciais e distritais</option>
            <option value="provincial">Provincial</option>
            <option value="distrital">Distrital</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-estado" className="mb-1 block text-sm font-semibold text-navy">
            Estado
          </label>
          <select
            id="f-estado"
            className={campo}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Todos os estados</option>
            <option value="planeado">Planeado</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </form>

      {filtrados.length === 0 ? (
        <div className="mt-6">
          <EstadoVazio
            titulo="Ainda não há workshops registados"
            descricao="Crie o primeiro workshop com o botão acima. Cada workshop guarda província, distrito, local, data, duração, facilitador e participantes previstos e efectivos."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border border-line">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">Workshops registados</caption>
            <thead className="bg-page text-navy">
              <tr>
                {["Tipo", "Local de realização", "Data", "Facilitador", "Participantes", "Estado", ""].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-3 py-2 text-xs font-bold uppercase tracking-wide"
                    >
                      {h || <span className="sr-only">Acções</span>}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((w) => (
                <tr key={w.id} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-navy">
                    {w.tipo === "provincial" ? "Provincial" : "Distrital"}
                  </th>
                  <td className="px-3 py-2 text-navy-2">
                    {w.provincia}
                    {w.distrito ? ` · ${w.distrito}` : ""}
                    {w.local ? ` — ${w.local}` : ""}
                  </td>
                  <td className="px-3 py-2 text-navy-2">{formatarData(w.data)}</td>
                  <td className="px-3 py-2 text-navy-2">{w.facilitador ?? "—"}</td>
                  <td className="px-3 py-2 text-navy-2">
                    {w.participantes} de {w.previstos || "—"}
                  </td>
                  <td className="px-3 py-2 text-navy-2">{rotuloEstadoWorkshop(w.estado)}</td>
                  <td className="px-3 py-2">
                    <Link
                      to="/workshops/$id"
                      params={{ id: w.id }}
                      className="font-semibold text-navy underline"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PlataformaPagina>
  );
}
