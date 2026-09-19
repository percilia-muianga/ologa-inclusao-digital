import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";
import { listarRelatoriosMensais, criarRelatorioMensal } from "@/lib/relatorios.functions";

export const Route = createFileRoute("/relatorios-mensais")({
  loader: () => listarRelatoriosMensais(),
  head: () => ({
    meta: [
      { title: "Relatórios mensais — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Relatório mensal de desempenho Ambiental, Social, de Saúde e Segurança, com incidentes, reclamações, medidas correctivas, não conformidades e acessibilidade das actividades.",
      },
      { property: "og:title", content: "Relatórios mensais do programa" },
      {
        property: "og:description",
        content:
          "Acomodações razoáveis solicitadas e concedidas, formatos alternativos e barreiras identificadas e resolvidas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RelatoriosPage,
});

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const campo = "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";
const area = "w-full rounded-md border border-line bg-white p-3 text-base text-navy";
const rotulo = "mb-1 block text-sm font-semibold text-navy";

function RelatoriosPage() {
  const relatorios = Route.useLoaderData();
  const criar = useServerFn(criarRelatorioMensal);
  const router = useRouter();
  const hoje = new Date();

  const [form, setForm] = useState({
    ano: String(hoje.getFullYear()),
    mes: String(hoje.getMonth() + 1),
    provincia: "",
    incidentes: "",
    reclamacoes: "",
    medidas_correctivas: "",
    nao_conformidades: "",
    acomodacoes_solicitadas: "",
    acomodacoes_concedidas: "",
    formatos_alternativos: "",
    barreiras_identificadas: "",
    barreiras_resolvidas: "",
  });
  const [aviso, setAviso] = useState<string | null>(null);

  const alterar = (nome: keyof typeof form, valor: string) =>
    setForm((f) => ({ ...f, [nome]: valor }));

  const campoTexto = (nome: keyof typeof form, etiqueta: string) => (
    <div>
      <label htmlFor={nome} className={rotulo}>
        {etiqueta}
      </label>
      <textarea
        id={nome}
        rows={3}
        className={area}
        value={form[nome]}
        onChange={(e) => alterar(nome, e.target.value)}
      />
    </div>
  );

  return (
    <PlataformaPagina
      titulo="Relatórios mensais"
      introducao="Desempenho Ambiental, Social, de Saúde e Segurança das actividades: incidentes, reclamações recebidas, medidas correctivas adoptadas, acessibilidade das actividades e não conformidades identificadas."
    >
      <form
        className="space-y-6 rounded-lg border border-line bg-white p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await criar({
            data: {
              ano: Number(form.ano),
              mes: Number(form.mes),
              provincia: form.provincia || null,
              incidentes: form.incidentes || null,
              reclamacoes: form.reclamacoes || null,
              medidas_correctivas: form.medidas_correctivas || null,
              nao_conformidades: form.nao_conformidades || null,
              acomodacoes_solicitadas: form.acomodacoes_solicitadas || null,
              acomodacoes_concedidas: form.acomodacoes_concedidas || null,
              formatos_alternativos: form.formatos_alternativos || null,
              barreiras_identificadas: form.barreiras_identificadas || null,
              barreiras_resolvidas: form.barreiras_resolvidas || null,
            },
          });
          setAviso("Relatório mensal registado.");
          router.invalidate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="ano" className={rotulo}>
              Ano
            </label>
            <input
              id="ano"
              type="number"
              className={campo}
              value={form.ano}
              onChange={(e) => alterar("ano", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="mes" className={rotulo}>
              Mês
            </label>
            <select id="mes" className={campo} value={form.mes} onChange={(e) => alterar("mes", e.target.value)}>
              {MESES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="provincia" className={rotulo}>
              Província (opcional)
            </label>
            <input
              id="provincia"
              className={campo}
              value={form.provincia}
              onChange={(e) => alterar("provincia", e.target.value)}
            />
          </div>
        </div>

        <fieldset className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <legend className="text-lg font-bold text-navy">
            Ambiental, Social, Saúde e Segurança
          </legend>
          {campoTexto("incidentes", "Incidentes ocorridos")}
          {campoTexto("reclamacoes", "Reclamações recebidas")}
          {campoTexto("medidas_correctivas", "Medidas correctivas adoptadas")}
          {campoTexto("nao_conformidades", "Não conformidades identificadas")}
        </fieldset>

        <fieldset className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <legend className="text-lg font-bold text-navy">Acessibilidade das actividades</legend>
          {campoTexto("acomodacoes_solicitadas", "Acomodações razoáveis solicitadas")}
          {campoTexto("acomodacoes_concedidas", "Acomodações razoáveis concedidas")}
          {campoTexto("formatos_alternativos", "Conteúdos disponibilizados em formatos alternativos")}
          {campoTexto("barreiras_identificadas", "Barreiras identificadas")}
          {campoTexto("barreiras_resolvidas", "Barreiras resolvidas")}
        </fieldset>

        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground"
        >
          Registar relatório mensal
        </button>
        {aviso ? (
          <p role="status" className="text-base font-semibold text-navy">
            {aviso}
          </p>
        ) : null}
      </form>

      <section aria-labelledby="lista" className="mt-10">
        <h2 id="lista" className="text-xl font-bold text-navy">
          Relatórios registados
        </h2>
        {relatorios.length === 0 ? (
          <div className="mt-4">
            <EstadoVazio
              titulo="Ainda não há relatórios mensais"
              descricao="Use o formulário acima para registar o primeiro relatório do mês, incluindo o campo de acessibilidade das actividades."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {relatorios.map((r) => (
              <article key={r.id} className="rounded-lg border border-line bg-white p-5">
                <h3 className="text-lg font-bold text-navy">
                  {MESES[r.mes - 1]} de {r.ano}
                  {r.provincia ? ` — ${r.provincia}` : " — nacional"}
                </h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Incidentes", r.incidentes],
                    ["Reclamações", r.reclamacoes],
                    ["Medidas correctivas", r.medidas_correctivas],
                    ["Não conformidades", r.nao_conformidades],
                    ["Acomodações solicitadas", r.acomodacoes_solicitadas],
                    ["Acomodações concedidas", r.acomodacoes_concedidas],
                    ["Formatos alternativos", r.formatos_alternativos],
                    ["Barreiras identificadas", r.barreiras_identificadas],
                    ["Barreiras resolvidas", r.barreiras_resolvidas],
                  ].map(([t, v]) => (
                    <div key={t as string}>
                      <dt className="text-sm text-navy-2">{t}</dt>
                      <dd className="text-base font-semibold text-navy">{v || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </PlataformaPagina>
  );
}
