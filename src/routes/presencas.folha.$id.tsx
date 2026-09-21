import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { obterFolhaSessao } from "@/lib/presencas.functions";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/presencas/folha/$id")({
  head: () => ({
    meta: [
      { title: "Folha de presenças para imprimir — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Folha de presenças de uma sessão, com nome dos formandos e espaço para assinatura, para quando não há telefone nem rede e para arquivo físico.",
      },
      { property: "og:title", content: "Folha de presenças para imprimir — Capacitação Digital" },
      {
        property: "og:description",
        content: "Uma folha por sessão, com nome dos formandos e espaço para assinatura.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FolhaImpressaoPage,
});

function FolhaImpressaoPage() {
  const { id } = useParams({ from: "/presencas/folha/$id" });
  const carregar = useServerFn(obterFolhaSessao);
  const q = useQuery({ queryKey: ["folha-sessao", id], queryFn: () => carregar({ data: id }) });

  if (q.isError) return <ErroPermissao erro={q.error} />;

  if (q.isLoading)
    return (
      <PlataformaPagina titulo="Folha de presenças">
        <p role="status" className="text-base text-navy">
          A carregar a folha…
        </p>
      </PlataformaPagina>
    );

  const d = q.data;
  if (!d)
    return (
      <PlataformaPagina titulo="Folha de presenças">
        <EstadoVazio
          titulo="Sessão não encontrada"
          descricao="Esta sessão já não existe no cronograma. Volte às presenças e escolha outra sessão."
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

  const data = new Date(`${d.sessao.data}T00:00:00`).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <PlataformaPagina
      titulo="Folha de presenças para imprimir"
      introducao="Para quando não há telefone nem rede, e para o arquivo físico. Depois de recolhidas as assinaturas, marque as presenças na plataforma — nada é apagado."
    >
      <div className="print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground"
        >
          Imprimir esta folha
        </button>
        <Link
          to="/presencas/sessao/$id"
          params={{ id }}
          className="ml-3 inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
        >
          Marcar presenças no aparelho
        </Link>
      </div>

      <article className="mt-6 rounded-lg border border-line bg-white p-6 print:border-0 print:p-0">
        <h2 className="text-xl font-bold text-navy">{d.turma.designacao}</h2>
        <p className="mt-1 text-base text-navy">
          {d.curso?.titulo ?? ""} · {d.turma.provincia}, {d.turma.distrito}
        </p>
        <p className="mt-1 text-base text-navy">
          Sessão {d.sessao.ordem} — {d.sessao.tema} · {data} · {d.sessao.hora_inicio.slice(0, 5)} às{" "}
          {d.sessao.hora_fim.slice(0, 5)} ·{" "}
          {d.sessao.modalidade === "virtual"
            ? "Virtual"
            : d.sessao.modalidade === "misto"
              ? "Misto"
              : "Presencial"}
        </p>
        <p className="mt-1 text-base text-navy">
          Formador: {d.sessao.formador_nome ?? "________________________"}
        </p>

        {d.formandos.length === 0 ? (
          <p className="mt-6 text-base text-navy">
            Esta turma ainda não tem formandos inscritos. Inscreva os formandos na ficha da turma
            para que os nomes apareçam nesta folha.
          </p>
        ) : (
          <table className="mt-6 w-full border-collapse text-left text-base">
            <caption className="sr-only">
              Lista de formandos com espaço para assinatura e para marcar a presença
            </caption>
            <thead>
              <tr>
                <th scope="col" className="border border-line px-2 py-2 text-navy">
                  N.º
                </th>
                <th scope="col" className="border border-line px-2 py-2 text-navy">
                  Nome do formando
                </th>
                <th scope="col" className="border border-line px-2 py-2 text-navy">
                  Presente
                </th>
                <th scope="col" className="border border-line px-2 py-2 text-navy">
                  Ausente
                </th>
                <th scope="col" className="border border-line px-2 py-2 text-navy">
                  Justificado
                </th>
                <th scope="col" className="border border-line px-2 py-2 text-navy">
                  Assinatura
                </th>
              </tr>
            </thead>
            <tbody>
              {d.formandos.map((f, i) => (
                <tr key={f.inscricaoId}>
                  <td className="border border-line px-2 py-4 text-navy">{i + 1}</td>
                  <td className="border border-line px-2 py-4 text-navy">{f.nome}</td>
                  <td className="border border-line px-2 py-4"> </td>
                  <td className="border border-line px-2 py-4"> </td>
                  <td className="border border-line px-2 py-4"> </td>
                  <td className="border border-line px-2 py-4"> </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mt-6 text-base text-navy">
          Assinatura do formador: ______________________________ Data: ____ / ____ / ________
        </p>
        <p className="mt-4 text-sm text-navy-2">
          Este documento atesta a formação realizada. Não constitui certificação de conformidade
          legal.
        </p>
      </article>
    </PlataformaPagina>
  );
}
