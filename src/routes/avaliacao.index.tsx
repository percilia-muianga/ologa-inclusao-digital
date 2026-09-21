import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { panoramaBanco } from "@/lib/avaliacao.functions";
import { pendenciasCurriculares } from "@/lib/cursos.functions";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/avaliacao/")({
  component: AvaliacaoPage,
});

function AvaliacaoPage() {
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

      {curriculo.data && curriculo.data.some((c) => c.pendente) ? (
        <section
          aria-labelledby="revisao-pedagogica"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-5"
        >
          <h2 id="revisao-pedagogica" className="text-lg font-bold text-navy">
            Cargas horárias pendentes de revisão pedagógica
          </h2>
          <p className="mt-2 text-base text-navy-2">
            A carga horária oficial de cada curso segue a secção 14 do Termo de Referência. A soma
            dos módulos não coincide nos cursos abaixo. Nenhum módulo ou lição foi retirado para
            acertar a conta: a distribuição curricular aguarda revisão da equipa Ologa.
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
                  Versões retiradas: {data.totalRetiradas} questões
                </h2>
                <p className="mt-2 text-base text-navy-2">
                  Estas questões continuam guardadas, com as suas respostas e explicações, mas estão
                  fora do sorteio e do rácio, e não podem ser activadas. Só contam como utilizáveis
                  as questões em rascunho que não foram retiradas. A renovação do conteúdo entra como
                  versão nova.
                </p>
              </section>
            ) : null}

            {data.totalEscritas === 0 && data.totalDiagnostico === 0 ? (
              <EstadoVazio
                titulo={
                  data.totalRetiradas > 0
                    ? "Sem questões utilizáveis: as que existiam foram retiradas"
                    : "O banco de questões ainda está vazio"
                }
                descricao={
                  data.totalRetiradas > 0
                    ? "As questões que existiam foram retiradas e continuam guardadas, mas não podem ser usadas nem activadas. É preciso escrever uma versão nova, que a Ologa/ATDI depois valida. Enquanto não houver questões utilizáveis, nenhum exame é gerado. Onde se lê «por fornecer» por curso ou por módulo, isso conta apenas as questões utilizáveis."
                    : "Ainda não há nenhuma questão escrita. A estrutura está pronta e à espera das questões da Ologa. Abra «Gerir banco de questões» para as introduzir; a contagem em falta por curso e por módulo fica sempre visível."
                }
              />
            ) : data.totalActivas === 0 ? (
              <section className="rounded-lg border border-amber-300 bg-amber-50 p-5">
                <h2 className="text-lg font-bold text-navy">
                  Banco preparado, por validar e activar
                </h2>
                <p className="mt-2 text-base text-navy-2">
                  Já há questões escritas, mas nenhuma está activa. Enquanto assim for, nenhum exame
                  é gerado e nenhum certificado é emitido. O rácio do Termo de Referência só conta
                  questões activas.
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
                      ? `Rácio cumprido: ${curso.activas} questões activas para ${curso.necessarias} do exame`
                      : curso.total === 0
                        ? `Sem questões escritas: faltam ${curso.minimoTdR} activas (o triplo de ${curso.necessarias})`
                        : `Por validar e activar: ${curso.rascunhos} em rascunho, ${curso.activas} activas; faltam ${curso.emFalta} activas para o mínimo de ${curso.minimoTdR}`}
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
                    <dt className="font-semibold text-navy-2">Em rascunho, por validar</dt>
                    <dd className="text-navy">{curso.rascunhos}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-navy-2">Retiradas (fora do sorteio)</dt>
                    <dd className="text-navy">
                      {curso.retiradas.total}
                      {curso.retiradas.total > 0
                        ? ` (${curso.retiradas.exame} de exame, ${curso.retiradas.diagnostico} de diagnóstico; versões ${curso.retiradas.versoes.join(", ")})`
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
                        {m.titulo}: {m.activas} activas
                        {m.rascunhos > 0 ? `, ${m.rascunhos} em rascunho` : ""}
                        {m.total === 0
                          ? " — por fornecer"
                          : m.activas === 0
                            ? " — por validar e activar"
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
