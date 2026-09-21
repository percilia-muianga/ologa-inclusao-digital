import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listarTurmasComSessoes, LIMIAR_ASSIDUIDADE } from "@/lib/presencas.functions";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/presencas/")({
  head: () => ({
    meta: [
      { title: "Presenças — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Marcação de presenças por formando e por sessão, feita no telefone, a funcionar sem internet, com a taxa de assiduidade de cada formando.",
      },
      { property: "og:title", content: "Presenças — Programa Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Presente, ausente ou justificado, com sincronização quando a ligação voltar e sinal claro abaixo dos oitenta por cento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PresencasPage,
});

function PresencasPage() {
  const carregar = useServerFn(listarTurmasComSessoes);
  const q = useQuery({ queryKey: ["turmas-presencas"], queryFn: () => carregar() });

  const turmas = q.data?.turmas ?? [];

  if (q.isError) return <ErroPermissao erro={q.error} />;

  return (
    <PlataformaPagina
      titulo="Presenças"
      introducao="Marcação de presente, ausente ou justificado por formando e por sessão, num ecrã feito para telefone, que funciona sem internet e envia as marcações quando a ligação voltar. A assiduidade mínima para certificação é de 80 por cento."
    >
      {q.isLoading ? (
        <p role="status" className="text-base text-navy">
          A carregar as turmas…
        </p>
      ) : turmas.length === 0 ? (
        <EstadoVazio
          titulo="Ainda não há turmas para marcar presenças"
          descricao="As folhas de presença aparecem aqui assim que existir uma turma com sessões no cronograma. Comece por criar a turma e depois acrescente as sessões."
          accao={
            <Link
              to="/turmas/nova"
              className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
            >
              Criar turma
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4">
          {turmas.map((t) => (
            <li key={t.id} className="rounded-lg border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-navy">{t.designacao}</h2>
              <p className="mt-1 text-base text-navy-2">
                {t.cursoTitulo} · {t.provincia}, {t.distrito} · código {t.codigo}
              </p>
              <p className="mt-2 text-base text-navy">
                {t.inscritos} formandos inscritos · {t.sessoesRealizadas} de {t.totalSessoes} sessões
                marcadas como realizadas · {t.justificadas} faltas justificadas
              </p>
              <p className="mt-1 text-base text-navy">
                Assiduidade estrita média:{" "}
                {t.assiduidadeEstritaMediaPct === null
                  ? "— (sem sessões realizadas)"
                  : `${t.assiduidadeEstritaMediaPct}%`}{" "}
                · Assiduidade ajustada média:{" "}
                {t.assiduidadeAjustadaMediaPct === null
                  ? "— (sem sessões realizadas)"
                  : `${t.assiduidadeAjustadaMediaPct}%`}
                . Para certificação vale a {t.base === "ajustada" ? "ajustada" : "estrita"}.
              </p>
              {t.sessoesPorRegularizar > 0 ? (
                <p className="mt-2 rounded-md border border-[#C20400] bg-[#FFF4F4] p-3 text-base font-semibold text-[#C20400]">
                  Por regularizar: {t.sessoesPorRegularizar} sessões com a data já passada continuam
                  agendadas. Abra a turma e marque cada uma como realizada, cancelada ou adiada —
                  enquanto isso não for feito, não entram no cálculo da assiduidade.
                </p>
              ) : null}
              {t.abaixoDoLimiar > 0 || t.emRisco > 0 ? (
                <p className="mt-2 rounded-md border border-[#C20400] bg-[#FFF4F4] p-3 text-base font-semibold text-[#C20400]">
                  Atenção: {t.abaixoDoLimiar} formandos abaixo dos {LIMIAR_ASSIDUIDADE} por cento
                  {t.emRisco > 0
                    ? ` e ${t.emRisco} já não conseguem atingir os ${LIMIAR_ASSIDUIDADE} por cento mesmo comparecendo a todas as sessões que faltam`
                    : ""}
                  .
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/presencas/turma/$codigo"
                  params={{ codigo: t.codigo }}
                  className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
                >
                  Abrir presenças e assiduidade
                </Link>
                <Link
                  to="/turmas/$codigo"
                  params={{ codigo: t.codigo }}
                  className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
                >
                  Ficha da turma
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PlataformaPagina>
  );
}
