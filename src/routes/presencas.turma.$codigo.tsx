import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { assiduidadeDaTurma, LIMIAR_ASSIDUIDADE } from "@/lib/presencas.functions";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/presencas/turma/$codigo")({
  head: () => ({
    meta: [
      { title: "Assiduidade da turma — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Taxa de assiduidade por formando, sessões realizadas, marcações em falta e alerta de risco antes do fim da formação.",
      },
      { property: "og:title", content: "Assiduidade da turma — Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Sessões presentes sobre sessões realizadas, com sinal em cor e em texto abaixo dos oitenta por cento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssiduidadeTurmaPage,
});

function formatarData(valor: string) {
  return new Date(`${valor}T00:00:00`).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function AssiduidadeTurmaPage() {
  const { codigo } = useParams({ from: "/presencas/turma/$codigo" });
  const carregar = useServerFn(assiduidadeDaTurma);
  const q = useQuery({
    queryKey: ["assiduidade-turma", codigo],
    queryFn: () => carregar({ data: codigo }),
  });

  if (q.isLoading)
    return (
      <PlataformaPagina titulo="Assiduidade da turma">
        <p role="status" className="text-base text-navy">
          A carregar…
        </p>
      </PlataformaPagina>
    );

  const d = q.data;
  if (!d)
    return (
      <PlataformaPagina titulo="Assiduidade da turma">
        <EstadoVazio
          titulo="Turma não encontrada"
          descricao="O código que abriu não corresponde a nenhuma turma. Volte à lista de presenças e escolha uma turma."
          accao={
            <Link
              to="/presencas"
              className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
            >
              Voltar às presenças
            </Link>
          }
        />
      </PlataformaPagina>
    );

  const emRisco = d.linhas.filter((l) => l.emRisco);

  return (
    <PlataformaPagina
      titulo={`Presenças — ${d.turma.designacao}`}
      introducao={`${d.cursoTitulo} · ${d.turma.provincia}, ${d.turma.distrito} · ${d.inscritos} formandos inscritos. A taxa de assiduidade é o número de sessões em que o formando esteve presente sobre o número de sessões já realizadas. O limiar para certificação é de ${LIMIAR_ASSIDUIDADE} por cento.`}
    >
      <section aria-labelledby="sessoes">
        <h2 id="sessoes" className="text-xl font-bold text-navy">
          Sessões
        </h2>
        {d.sessoes.length === 0 ? (
          <EstadoVazio
            titulo="Esta turma ainda não tem sessões no cronograma"
            descricao="Sem sessões não há presenças para marcar. Acrescente as sessões na ficha da turma e depois volte aqui."
            accao={
              <Link
                to="/turmas/$codigo"
                params={{ codigo: d.turma.codigo_inscricao }}
                className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
              >
                Abrir ficha da turma
              </Link>
            }
          />
        ) : (
          <ul className="mt-4 grid gap-3">
            {d.sessoes.map((s) => (
              <li key={s.id} className="rounded-lg border border-line bg-white p-4">
                <p className="text-base font-bold text-navy">
                  Sessão {s.ordem} — {s.tema}
                </p>
                <p className="mt-1 text-base text-navy-2">
                  {formatarData(s.data)} · {s.hora_inicio.slice(0, 5)} às {s.hora_fim.slice(0, 5)} ·{" "}
                  {s.modalidade === "virtual" ? "Virtual" : s.modalidade === "misto" ? "Misto" : "Presencial"} ·{" "}
                  {s.realizada ? "já realizada" : "ainda por realizar"} · {s.marcadas} de{" "}
                  {d.inscritos} formandos marcados
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    to="/presencas/sessao/$id"
                    params={{ id: s.id }}
                    className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
                  >
                    Marcar presenças
                  </Link>
                  <Link
                    to="/presencas/folha/$id"
                    params={{ id: s.id }}
                    className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
                  >
                    Folha para imprimir
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="assiduidade" className="mt-10">
        <h2 id="assiduidade" className="text-xl font-bold text-navy">
          Assiduidade por formando
        </h2>

        {emRisco.length > 0 ? (
          <p
            role="status"
            className="mt-3 rounded-md border border-[#C20400] bg-[#FFF4F4] p-4 text-base font-semibold text-[#C20400]"
          >
            Alerta de risco: {emRisco.length} formandos já não conseguem atingir os{" "}
            {LIMIAR_ASSIDUIDADE} por cento mesmo comparecendo a todas as sessões que faltam —{" "}
            {emRisco.map((l) => l.nome).join(", ")}.
          </p>
        ) : null}

        {d.linhas.length === 0 ? (
          <EstadoVazio
            titulo="Ainda não há formandos inscritos nesta turma"
            descricao="A assiduidade aparece assim que houver inscrições. Inscreva formandos na ficha da turma."
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-base">
              <caption className="sr-only">
                Assiduidade por formando: sessões presentes sobre sessões realizadas
              </caption>
              <thead>
                <tr className="border-b border-line text-navy-2">
                  <th scope="col" className="py-2 pr-4">Formando</th>
                  <th scope="col" className="py-2 pr-4">Presenças</th>
                  <th scope="col" className="py-2 pr-4">Faltas</th>
                  <th scope="col" className="py-2 pr-4">Justificadas</th>
                  <th scope="col" className="py-2 pr-4">Por marcar</th>
                  <th scope="col" className="py-2 pr-4">Taxa</th>
                  <th scope="col" className="py-2">Situação</th>
                </tr>
              </thead>
              <tbody>
                {d.linhas.map((l) => (
                  <tr key={l.inscricaoId} className="border-b border-line align-top">
                    <th scope="row" className="py-3 pr-4 font-semibold text-navy">
                      {l.nome}
                      {l.conflitos > 0 ? (
                        <span className="block text-sm font-normal text-[#C20400]">
                          {l.conflitos} marcações contraditórias, para revisão manual
                        </span>
                      ) : null}
                    </th>
                    <td className="py-3 pr-4 text-navy">
                      {l.presentes} de {l.realizadas}
                    </td>
                    <td className="py-3 pr-4 text-navy">{l.ausentes}</td>
                    <td className="py-3 pr-4 text-navy">{l.justificadas}</td>
                    <td className="py-3 pr-4 text-navy">{l.porMarcar}</td>
                    <td className="py-3 pr-4 text-navy">
                      {l.taxaPct === null ? "—" : `${l.taxaPct}%`}
                    </td>
                    <td
                      className={
                        l.abaixoDoLimiar || l.emRisco
                          ? "py-3 font-semibold text-[#C20400]"
                          : "py-3 font-semibold text-navy"
                      }
                    >
                      {l.taxaPct === null
                        ? "Sem sessões realizadas"
                        : l.emRisco
                          ? `Em risco: no máximo ${l.maximoPossivelPct}%`
                          : l.abaixoDoLimiar
                            ? `Abaixo dos ${LIMIAR_ASSIDUIDADE} por cento`
                            : "Cumpre o limiar"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PlataformaPagina>
  );
}
