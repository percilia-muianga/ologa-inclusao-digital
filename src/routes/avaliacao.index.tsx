import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { panoramaBanco, permissaoGestaoBanco, disponibilidadeAvaliacao } from "@/lib/avaliacao.functions";
import { pendenciasCurriculares } from "@/lib/cursos.functions";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/avaliacao/")({
  component: AvaliacaoPage,
});

function AvaliacaoPage() {
  const carregarPermissao = useServerFn(permissaoGestaoBanco);
  const permissao = useQuery({
    queryKey: ["permissao-banco"],
    queryFn: () => carregarPermissao(),
    retry: false,
  });
  if (permissao.isLoading) {
    return (
      <PlataformaPagina titulo="Avaliação" introducao="A carregar…">
        <p role="status" className="text-base text-navy-2">A carregar…</p>
      </PlataformaPagina>
    );
  }
  return permissao.data?.podeLer ? <AvaliacaoGestao /> : <AvaliacaoFormando />;
}

function AvaliacaoFormando() {
  const carregar = useServerFn(disponibilidadeAvaliacao);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["disponibilidade-avaliacao"],
    queryFn: () => carregar(),
    retry: false,
  });
  return (
    <PlataformaPagina
      titulo="Avaliação"
      introducao="O exame final é gerado no momento em que o inicia, a partir das questões do seu curso."
    >
      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-bold text-navy">Como funciona</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-navy-2">
          <li>Precisa de ter sessão iniciada e estar inscrito numa turma do curso.</li>
          <li>O acesso ao exame depende da assiduidade mínima definida para o curso.</li>
          <li>O tempo do exame começa a contar quando o inicia.</li>
        </ul>
      </section>
      <div role="status" aria-live="polite" className="mt-4">
        {isLoading ? <p className="text-base text-navy-2">A carregar…</p> : null}
        {isError ? (
          <p className="text-base text-navy-2">Não foi possível mostrar a disponibilidade. Tente novamente mais tarde.</p>
        ) : null}
      </div>
      {data ? (
        <ul className="mt-4 space-y-2">
          {data.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-white p-4">
              <span className="font-semibold text-navy">{c.titulo}</span>
              <span className="text-base text-navy-2">
                {c.disponivel ? "Exame disponível" : "Exame ainda não disponível"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {data && data.some((c) => c.disponivel) ? (
        <Link to="/avaliacao/exame" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground">
          Iniciar exame final
        </Link>
      ) : (
        <p className="mt-6 text-base text-navy-2">
          Os exames ficam disponíveis após a activação das questões e da configuração necessária.
        </p>
      )}
    </PlataformaPagina>
  );
}

function AvaliacaoGestao() {
  const carregar = useServerFn(panoramaBanco);
  const carregarPendencias = useServerFn(pendenciasCurriculares);
  const curriculo = useQuery({
    queryKey: ["pendencias-curriculares"],
    queryFn: () => carregarPendencias(),
    retry: false,
  });
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
      introducao="Estado do banco de questões por curso e módulo. O exame final é gerado no momento em que o formando o inicia."
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

      {curriculo.data && curriculo.data.some((c) => c.pendente) ? (
        <section
          aria-labelledby="revisao-pedagogica"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-5"
        >
          <h2 id="revisao-pedagogica" className="text-lg font-bold text-navy">
            Cargas horárias pendentes de revisão pedagógica
          </h2>
          <p className="mt-2 text-base text-navy-2">
            Nos cursos abaixo, a soma dos módulos não coincide com a carga horária oficial. A
            distribuição curricular está em revisão.
          </p>
          <ul className="mt-3 space-y-1 text-base text-navy-2">
            {curriculo.data
              .filter((c) => c.pendente)
              .map((c) => (
                <li key={c.id}>
                  <strong className="text-navy">{c.titulo}</strong>: carga oficial de{" "}
                  {c.cargaOficial} horas; soma dos módulos de {c.horasCurriculo} horas.
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      <div role="status" aria-live="polite">
        {isLoading ? <p className="text-base text-navy-2">A carregar o banco de questões…</p> : null}
        {isError ? (
          <EstadoVazio
            titulo="Não foi possível mostrar o banco de questões"
            descricao="As contagens por curso e módulo não ficaram disponíveis. Verifique a ligação e volte a tentar; nenhuma questão foi alterada."
            accao={
              <Button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                size="lg"
                className="min-h-11"
              >
                {isFetching ? "A tentar novamente…" : "Tentar novamente"}
              </Button>
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
            {data.totalRetiradas > 0 ? (
              <section className="rounded-lg border border-line bg-white p-5">
                <h2 className="text-lg font-bold text-navy">
                  Questões arquivadas: {data.totalRetiradas}
                </h2>
                <p className="mt-2 text-base text-navy-2">
                  Mantidas para histórico. Não são utilizadas nos exames.
                </p>
              </section>
            ) : null}

            {data.totalEscritas === 0 && data.totalDiagnostico === 0 ? (
              <EstadoVazio
                titulo={
                  data.totalRetiradas > 0
                    ? "Sem questões utilizáveis: as existentes estão arquivadas"
                    : "O banco de questões ainda está vazio"
                }
                descricao={
                  data.totalRetiradas > 0
                    ? "As questões arquivadas são mantidas para histórico e não são utilizadas nos exames. Enquanto não houver questões utilizáveis, nenhum exame é gerado."
                    : "Ainda não há questões. Abra «Gerir banco de questões» para as introduzir."
                }
              />
            ) : data.totalActivas === 0 ? (
              <section className="rounded-lg border border-amber-300 bg-amber-50 p-5">
                <h2 className="text-lg font-bold text-navy">
                  Estado do banco de questões
                </h2>
                <p className="mt-2 text-base text-navy-2">
                  Os exames ficam disponíveis após a activação das questões e da configuração
                  necessária. Neste momento nenhuma questão está activa.
                </p>
                <p className="mt-2 text-base text-navy-2">
                  Exame final: {data.totalEscritas} questões escritas, {data.totalActivas} activas,{" "}
                  {data.totalRascunhos} em rascunho. Diagnóstico e pós-teste:{" "}
                  {data.totalDiagnostico} escritas, {data.totalDiagnosticoActivas} activas.
                </p>
              </section>
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
                      ? `Mínimo atingido: ${curso.activas} questões activas para ${curso.necessarias} por exame`
                      : curso.total === 0
                        ? `Sem questões: faltam ${curso.minimoTdR} activas`
                        : `${curso.rascunhos} em rascunho, ${curso.activas} activas; faltam ${curso.emFalta} activas para o mínimo exigido de ${curso.minimoTdR}`}
                  </p>
                </div>
                <dl className="mt-4 grid gap-3 text-base sm:grid-cols-4">
                  <div>
                    <dt className="font-semibold text-navy-2">Questões escritas</dt>
                    <dd className="text-navy">{curso.total}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy-2">Activas</dt>
                    <dd className="text-navy">{curso.activas}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy-2">Em rascunho</dt>
                    <dd className="text-navy">{curso.rascunhos}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy-2">Arquivadas</dt>
                    <dd className="text-navy">
                      {curso.retiradas.total}
                      {curso.retiradas.total > 0
                        ? ` (${curso.retiradas.exame} de exame, ${curso.retiradas.diagnostico} de diagnóstico)`
                        : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy-2">Diagnóstico e pós-teste</dt>
                    <dd className="text-navy">
                      {curso.diagnostico.total} escritas, {curso.diagnostico.activas} activas
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy-2">Questões por exame</dt>
                    <dd className="text-navy">{curso.necessarias}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy-2">Mínimo exigido</dt>
                    <dd className="text-navy">{curso.minimoTdR}</dd>
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
                        {m.titulo}: {m.activas} activas
                        {m.rascunhos > 0 ? `, ${m.rascunhos} em rascunho` : ""}
                        {m.total === 0
                          ? " — sem questões"
                          : m.activas === 0
                            ? " — sem questões activas"
                            : ""}
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
