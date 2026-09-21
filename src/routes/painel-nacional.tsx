import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { PlataformaPagina } from "@/components/plataforma-pagina";
import { Button } from "@/components/ui/button";
import { obterIndicadoresTdr } from "@/lib/indicadores-tdr.functions";

export const Route = createFileRoute("/painel-nacional")({
  loader: () => obterIndicadoresTdr(),
  head: () => ({
    meta: [
      { title: "Painel Nacional — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Indicadores do Termo de Referência: desempenho da formação, satisfação, eficácia aos três meses e execução dos workshops por província e distrito.",
      },
      { property: "og:title", content: "Painel Nacional — Programa de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Cada indicador acompanhado da tabela de dados equivalente, com supressão de grupos com menos de cinco pessoas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PainelNacionalPage,
});

function Cartao({
  titulo,
  valor,
  nota,
}: {
  titulo: string;
  valor: string;
  nota?: string;
}) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <dt className="text-sm text-navy-2">{titulo}</dt>
      <dd className="text-2xl font-extrabold text-navy">{valor}</dd>
      {nota ? <p className="mt-1 text-sm text-navy-2">{nota}</p> : null}
    </div>
  );
}

function pct(v: number | null) {
  return v === null ? "—" : `${v}%`;
}

function descarregar(conteudo: BlobPart, tipo: string, nome: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const ligacao = document.createElement("a");
  ligacao.href = url;
  ligacao.download = nome;
  ligacao.click();
  URL.revokeObjectURL(url);
}

function celulaCsv(valor: string | number | null) {
  const texto = valor === null ? "—" : String(valor);
  return `"${texto.replaceAll('"', '""')}"`;
}

function PainelNacionalPage() {
  const dados = Route.useLoaderData();
  const { desempenho, satisfacao, eficacia, workshops, porProvincia, porDistrito } = dados;

  const indicadores = [
    ["Indicador", "Valor", "Nota"],
    ["Formandos inscritos", desempenho.inscritos, ""],
    ["Taxa de conclusão", pct(desempenho.taxaConclusaoPct), ""],
    ["Taxa de certificação", pct(desempenho.taxaCertificacaoPct), `${desempenho.certificados} certificados emitidos`],
    [
      "Melhoria entre pré-teste e pós-teste",
      desempenho.evolucaoPp === null
        ? "—"
        : `${desempenho.evolucaoPp > 0 ? "+" : ""}${desempenho.evolucaoPp} pp`,
      `Pré-teste ${pct(desempenho.preMedia)}; Pós-teste ${pct(desempenho.posMedia)}; ${desempenho.avaliacoesRegistadas} registos`,
    ],
    ["Índice de satisfação dos participantes", pct(satisfacao.indicePct), `${satisfacao.respostas} questionários`],
    ["Aplicam as competências aos três meses", pct(eficacia.aplicamPct), `${eficacia.respostas} inquéritos`],
    [
      "Assiduidade estrita média",
      pct(desempenho.assiduidadeEstritaPct),
      "Sessões presentes a dividir pelas sessões realizadas; as justificadas contam como ausência",
    ],
    [
      "Assiduidade ajustada média",
      pct(desempenho.assiduidadeAjustadaPct),
      "Sessões presentes a dividir pelas sessões realizadas menos as justificadas",
    ],
    ["Faltas justificadas registadas", desempenho.faltasJustificadas, ""],
    [
      "Sessões marcadas como realizadas",
      desempenho.sessoesRealizadas,
      `${desempenho.sessoesPorRegularizar} sessões com a data passada continuam agendadas e não contam`,
    ],
    ["Workshops provinciais realizados", workshops.provinciaisRealizados, workshops.provinciaisPlaneados],
    ["Workshops distritais realizados", workshops.distritaisRealizados, workshops.distritaisPlaneados],
  ];

  const colunasProvincia = [
    "Província",
    "Turmas",
    "Formandos",
    "Pré-teste",
    "Pós-teste",
    "Evolução",
    "Assiduidade estrita",
    "Assiduidade ajustada",
    "Faltas justificadas",
    "Workshop provincial",
    "Workshops distritais",
  ];

  const provincias = [
    colunasProvincia,
    ...porProvincia.map((p) => [
      p.provincia,
      p.turmas,
      p.inscritos,
      p.censurado ? "Insuficiente para divulgação" : pct(p.preMedia),
      p.censurado ? "Insuficiente para divulgação" : pct(p.posMedia),
      p.censurado
        ? "Insuficiente para divulgação"
        : p.evolucaoPp === null
          ? "—"
          : `${p.evolucaoPp > 0 ? "+" : ""}${p.evolucaoPp} pp`,
      pct(p.assiduidadeEstritaPct),
      pct(p.assiduidadeAjustadaPct),
      p.faltasJustificadas,
      `${p.workshopsProvinciaisRealizados} de 1`,
      `${p.workshopsDistritaisRealizados} de ${p.workshopsDistritaisPlaneados}`,
    ]),
  ];

  const distritos = [
    ["Província", "Distrito", "Realizados", "Previstos"],

    ...porDistrito.map((d) => [d.provincia, d.distrito, d.realizados, d.planeados]),
  ];

  function exportarCsv() {
    const linhas = [
      ["Painel Nacional"],
      ...indicadores,
      [],
      ["Por província"],
      ...provincias,
      [],
      ["Workshops por distrito"],
      ...distritos,
    ];
    const csv = `\uFEFF${linhas.map((linha) => linha.map((v) => celulaCsv(v ?? "")).join(";")).join("\r\n")}`;
    descarregar(csv, "text/csv;charset=utf-8", "painel-nacional.csv");
  }

  async function exportarXls() {
    const XLSX = await import("xlsx");
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, XLSX.utils.aoa_to_sheet(indicadores), "Indicadores");
    XLSX.utils.book_append_sheet(livro, XLSX.utils.aoa_to_sheet(provincias), "Por província");
    XLSX.utils.book_append_sheet(livro, XLSX.utils.aoa_to_sheet(distritos), "Por distrito");
    XLSX.writeFile(livro, "painel-nacional.xls", { bookType: "biff8" });
  }

  return (
    <PlataformaPagina
      titulo="Painel Nacional"
      introducao="Indicadores organizados pelos tipos do Termo de Referência: desempenho da formação, satisfação e eficácia, mais a execução dos workshops. As contagens mostram o número, mesmo quando é zero; os rácios, médias e percentagens sem denominador mostram um traço."
    >
      <div className="mb-8 flex flex-wrap gap-3 print:hidden" aria-label="Exportar esta vista">
        <Button type="button" size="lg" onClick={exportarCsv} className="min-h-11">
          <Download aria-hidden="true" />
          Exportar CSV
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={() => void exportarXls()} className="min-h-11">
          <Download aria-hidden="true" />
          Exportar XLS
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={() => window.print()} className="min-h-11">
          <Printer aria-hidden="true" />
          Exportar PDF
        </Button>
      </div>
      <section aria-labelledby="desempenho">
        <h2 id="desempenho" className="text-xl font-bold text-navy">
          Desempenho da formação
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Cartao titulo="Formandos inscritos" valor={String(desempenho.inscritos)} />
          <Cartao titulo="Taxa de conclusão" valor={pct(desempenho.taxaConclusaoPct)} />
          <Cartao
            titulo="Taxa de certificação"
            valor={pct(desempenho.taxaCertificacaoPct)}
            nota={`${desempenho.certificados} certificados emitidos`}
          />
          <Cartao
            titulo="Melhoria entre pré-teste e pós-teste"
            valor={
              desempenho.evolucaoPp === null
                ? "—"
                : `${desempenho.evolucaoPp > 0 ? "+" : ""}${desempenho.evolucaoPp} pp`
            }
            nota={`Pré-teste ${pct(desempenho.preMedia)} · Pós-teste ${pct(desempenho.posMedia)} · ${desempenho.avaliacoesRegistadas} registos`}
          />
        </dl>
      </section>

      <section aria-labelledby="satisfacao-eficacia" className="mt-10">
        <h2 id="satisfacao-eficacia" className="text-xl font-bold text-navy">
          Satisfação e eficácia
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Cartao
            titulo="Índice de satisfação dos participantes"
            valor={pct(satisfacao.indicePct)}
            nota={`${satisfacao.respostas} questionários respondidos no final das acções`}
          />
          <Cartao
            titulo="Aplicam as competências aos três meses"
            valor={pct(eficacia.aplicamPct)}
            nota={`${eficacia.respostas} inquéritos registados — recolha feita pela ATDI`}
          />
          <Cartao
            titulo="Workshops provinciais realizados"
            valor={`${workshops.provinciaisRealizados} de ${workshops.provinciaisPlaneados}`}
          />
          <Cartao
            titulo="Workshops distritais realizados"
            valor={`${workshops.distritaisRealizados} de ${workshops.distritaisPlaneados}`}
            nota={`${workshops.participantes} participantes registados`}
          />
        </dl>
      </section>

      <section aria-labelledby="provincias" className="mt-10">
        <h2 id="provincias" className="text-xl font-bold text-navy">
          Por província
        </h2>
        <p className="mt-2 max-w-3xl text-base text-navy-2">
          O programa cobre as onze províncias, com Maputo Cidade e Maputo Província contadas
          separadamente. Em qualquer corte, grupos com menos de cinco pessoas são suprimidos e
          mostrados como insuficiente para divulgação.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-line">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Turmas, formandos, evolução entre pré-teste e pós-teste e workshops por província
            </caption>
            <thead className="bg-page text-navy">
              <tr>
                {[
                  "Província",
                  "Turmas",
                  "Formandos",
                  "Pré-teste",
                  "Pós-teste",
                  "Evolução",
                  "Workshop provincial",
                  "Workshops distritais",
                ].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {porProvincia.map((p) => (
                <tr key={p.provincia} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-navy">
                    {p.provincia}
                  </th>
                  <td className="px-3 py-2 text-navy-2">{p.turmas}</td>
                  <td className="px-3 py-2 text-navy-2">{p.inscritos}</td>
                  <td className="px-3 py-2 text-navy-2">
                    {p.censurado ? "Insuficiente para divulgação" : pct(p.preMedia)}
                  </td>
                  <td className="px-3 py-2 text-navy-2">
                    {p.censurado ? "Insuficiente para divulgação" : pct(p.posMedia)}
                  </td>
                  <td className="px-3 py-2 text-navy-2">
                    {p.censurado
                      ? "Insuficiente para divulgação"
                      : p.evolucaoPp === null
                        ? "—"
                        : `${p.evolucaoPp > 0 ? "+" : ""}${p.evolucaoPp} pp`}
                  </td>
                  <td className="px-3 py-2 text-navy-2">
                    {p.workshopsProvinciaisRealizados} de 1
                  </td>
                  <td className="px-3 py-2 text-navy-2">
                    {p.workshopsDistritaisRealizados} de {p.workshopsDistritaisPlaneados}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="distritos" className="mt-10">
        <h2 id="distritos" className="text-xl font-bold text-navy">
          Workshops por distrito
        </h2>
        <p className="mt-2 max-w-3xl text-base text-navy-2">
          Os setenta e sete distritos do Termo de Referência, agrupados por província. A última
          linha do documento reúne Maputo Cidade e Maputo Província com oito distritos; a lista é
          reproduzida fielmente.
        </p>
        <div className="mt-4 overflow-x-auto rounded-md border border-line">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">Workshops distritais realizados face ao previsto</caption>
            <thead className="bg-page text-navy">
              <tr>
                {["Província", "Distrito", "Realizados", "Previstos"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {porDistrito.map((d) => (
                <tr key={`${d.provincia}-${d.distrito}`} className="border-t border-line">
                  <td className="px-3 py-2 text-navy-2">{d.provincia}</td>
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-navy">
                    {d.distrito}
                  </th>
                  <td className="px-3 py-2 text-navy-2">{d.realizados}</td>
                  <td className="px-3 py-2 text-navy-2">{d.planeados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-8 text-sm">
        <Link to="/relatorios-mensais" className="font-semibold text-navy underline">
          Ver relatórios mensais, incluindo a acessibilidade das actividades
        </Link>
      </p>
    </PlataformaPagina>
  );
}
