import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { panoramaBanco } from "@/lib/avaliacao.functions";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/avaliacao/")({
  component: AvaliacaoPage,
});

function AvaliacaoPage() {
  const carregar = useServerFn(panoramaBanco);
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["panorama-banco"],
    queryFn: () =>
      Promise.race([
        carregar(),
        new Promise<never>((_, rejeitar) =>
          setTimeout(() => rejeitar(new Error("TEMPO_ESGOTADO")), 10000),
        ),
      ]),
    retry: false,
  });

  return (
    <PlataformaPagina
      titulo="Avaliação"
      introducao="Banco de questões por curso e módulo, com pelo menos o triplo das questões usadas em cada exame, e exame final gerado no momento em que o formando o inicia."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          to="/avaliacao/banco"
          className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
        >
          Gerir banco de questões
        </Link>
        <Link
          to="/avaliacao/exame"
          className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
        >
          Iniciar exame final
        </Link>
      </div>

      <div role="status" aria-live="polite">
        {isLoading ? <p className="text-base text-navy-2">A carregar o banco de questões…</p> : null}
        {isError ? (
          <EstadoVazio
            titulo="Não foi possível mostrar o banco de questões"
            descricao="As contagens por curso e módulo não ficaram disponíveis. Verifique a ligação e volte a tentar; nenhuma questão foi alterada."
            accao={
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground disabled:opacity-60"
              >
                {isFetching ? "A tentar novamente…" : "Tentar novamente"}
              </button>
            }
          />
        ) : null}
      </div>

      {data ? (
        data.cursos.length === 0 ? (
          <EstadoVazio
            titulo="Ainda não há cursos para avaliar"
            descricao="Crie primeiro os cursos e os módulos; o banco de questões organiza-se por curso e por módulo."
          />
        ) : (
          <div className="space-y-4">
            {data.totalActivas === 0 ? (
              <EstadoVazio
                titulo="O banco de questões ainda está vazio"
                descricao="A estrutura está pronta e à espera das questões da Ologa. Abra «Gerir banco de questões» para as introduzir; a contagem em falta por curso e por módulo fica sempre visível."
              />
            ) : null}

            {data.cursos.map((curso) => (
              <section
                key={curso.id}
                className="rounded-lg border border-line bg-white p-5"
                aria-labelledby={`curso-${curso.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 id={`curso-${curso.id}`} className="text-lg font-bold text-navy">
                    {curso.titulo}
                  </h2>
                  <p
                    className={
                      curso.cumpreTriplo
                        ? "text-base font-semibold text-navy"
                        : "text-base font-semibold text-[#C20400]"
                    }
                  >
                    {curso.cumpreTriplo
                      ? `Rácio cumprido: ${curso.activas} questões activas para ${curso.necessarias} do exame`
                      : `Rácio por cumprir: faltam ${curso.emFalta} questões activas (mínimo ${curso.minimoTdR})`}
                  </p>
                </div>
                <dl className="mt-4 grid gap-3 text-base sm:grid-cols-4">
                  <div>
                    <dt className="font-semibold text-navy-2">Questões activas</dt>
                    <dd className="text-navy">{curso.activas}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy-2">Questões inactivas</dt>
                    <dd className="text-navy">{curso.inactivas}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy-2">Questões por exame</dt>
                    <dd className="text-navy">{curso.necessarias}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy-2">Mínimo do Termo de Referência</dt>
                    <dd className="text-navy">{curso.minimoTdR} (o triplo)</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm text-navy-2">
                  Por dificuldade: {curso.porDificuldade.facil} fáceis,{" "}
                  {curso.porDificuldade.media} médias, {curso.porDificuldade.dificil} difíceis.
                  Tempo do exame: {curso.configuracao.minutos} minutos. Nota mínima:{" "}
                  {curso.configuracao.notaMinimaPct}%. Assiduidade mínima:{" "}
                  {curso.configuracao.assiduidadeMinimaPct}%.
                </p>
                {curso.porModulo.length ? (
                  <ul className="mt-3 grid gap-1 text-sm text-navy-2 sm:grid-cols-2">
                    {curso.porModulo.map((m) => (
                      <li key={m.moduloId}>
                        {m.titulo}: {m.activas} questões activas
                        {m.activas === 0 ? " — por fornecer" : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-navy-2">
                    Este curso ainda não tem módulos associados.
                  </p>
                )}
              </section>
            ))}
          </div>
        )
      ) : null}
    </PlataformaPagina>
  );
}
