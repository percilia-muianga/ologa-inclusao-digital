import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { guardarResposta, obterTentativa, submeterExame } from "@/lib/avaliacao.functions";
import { formacaoStore } from "@/lib/formacao-store";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/avaliacao/exame/$tentativa")({
  component: ExamePage,
});

const campo = "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";

function formatarTempo(segundos: number) {
  const s = Math.max(0, segundos);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return { minutos: m, segundos: r, texto: `${m} minutos e ${r} segundos` };
}

function ExamePage() {
  const { tentativa: tentativaId } = Route.useParams();
  const qc = useQueryClient();
  const carregar = useServerFn(obterTentativa);
  const gravar = useServerFn(guardarResposta);
  const submeter = useServerFn(submeterExame);

  const [token, setToken] = useState<string | null>(null);
  const [agora, setAgora] = useState(() => Date.now());
  const [estadoGravacao, setEstadoGravacao] = useState("");
  const [aSubmeter, setASubmeter] = useState(false);
  const [respostas, setRespostas] = useState<Record<string, unknown>>({});

  useEffect(() => setToken(formacaoStore.token()), []);
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const dados = useQuery({
    queryKey: ["tentativa", tentativaId, token],
    enabled: !!token,
    retry: false,
    queryFn: () => carregar({ data: { token: token!, tentativaId } }),
  });

  useEffect(() => {
    if (!dados.data) return;
    const iniciais: Record<string, unknown> = {};
    for (const q of dados.data.questoes) if (q.respostaDada) iniciais[q.id] = q.respostaDada;
    setRespostas(iniciais);
  }, [dados.data]);

  if (!token) {
    return (
      <PlataformaPagina titulo="Exame final">
        <EstadoVazio
          titulo="Não encontrámos o seu código pessoal neste aparelho"
          descricao="Volte a abrir o exame a partir do ecrã de início, onde pode escrever o seu código pessoal de formando."
          accao={
            <Link
              to="/avaliacao/exame"
              className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
            >
              Ir para o início do exame
            </Link>
          }
        />
      </PlataformaPagina>
    );
  }

  if (dados.isLoading) {
    return (
      <PlataformaPagina titulo="Exame final">
        <p role="status" aria-live="polite" className="text-base text-navy-2">
          A carregar o seu exame…
        </p>
      </PlataformaPagina>
    );
  }

  if (dados.isError || !dados.data) {
    return (
      <PlataformaPagina titulo="Exame final">
        <EstadoVazio
          titulo="Não conseguimos abrir este exame"
          descricao="Este exame não existe ou não pertence ao seu código pessoal. Volte ao início do exame e tente novamente."
        />
      </PlataformaPagina>
    );
  }

  const { tentativa, curso, questoes } = dados.data;
  const submetido = tentativa.estado !== "em_curso";
  const restantes = Math.floor((new Date(tentativa.limite_em).getTime() - agora) / 1000);
  const tempo = formatarTempo(restantes);

  async function guardar(questaoId: string, resposta: unknown) {
    setRespostas((r) => ({ ...r, [questaoId]: resposta }));
    setEstadoGravacao("A gravar a resposta…");
    try {
      await gravar({ data: { token: token!, tentativaId, questaoId, resposta } });
      setEstadoGravacao("Resposta gravada.");
    } catch {
      setEstadoGravacao("Não foi possível gravar agora. A resposta fica no ecrã; tente de novo.");
    }
  }

  async function terminar() {
    setASubmeter(true);
    try {
      await submeter({ data: { token: token!, tentativaId } });
      await qc.invalidateQueries({ queryKey: ["tentativa", tentativaId] });
    } finally {
      setASubmeter(false);
    }
  }

  return (
    <PlataformaPagina
      titulo={`Exame final — ${curso?.titulo ?? "curso"}`}
      introducao={`Tentativa ${tentativa.numero}. As respostas gravam-se sozinhas à medida que as dá.`}
    >
      {!submetido ? (
        <div
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          className="mb-6 rounded-lg border border-line bg-white p-4"
        >
          <p className="text-base font-semibold text-navy">
            Tempo restante: {tempo.minutos} minutos e {tempo.segundos} segundos
          </p>
          <p className="text-sm text-navy-2">
            {restantes <= 0
              ? "O tempo terminou. Submeta o exame para registar as respostas já dadas."
              : restantes < 300
                ? "Atenção: falta menos de cinco minutos."
                : "O tempo é contado desde o início do exame, mesmo que feche o aparelho."}
          </p>
        </div>
      ) : (
        <div role="status" className="mb-6 rounded-lg border border-line bg-white p-4">
          <p className="text-base font-semibold text-navy">
            Exame submetido. Pontuação: {tentativa.pontuacao ?? 0} de {tentativa.total ?? 0} (
            {Number(tentativa.nota_pct ?? 0)}%).
          </p>
          <Link
            to="/certificados"
            className="mt-3 inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
          >
            Ver estado da certificação
          </Link>
        </div>
      )}

      <p role="status" aria-live="polite" className="mb-4 text-base text-navy-2">
        {estadoGravacao}
      </p>

      {questoes.length === 0 ? (
        <EstadoVazio
          titulo="Este exame não tem questões"
          descricao="O banco de questões deste curso está vazio. Fale com a coordenação da formação."
        />
      ) : (
        <ol className="grid gap-5">
          {questoes.map((q) => {
            const apresentacao = (q.apresentacao ?? {}) as Record<string, unknown>;
            const dada = (respostas[q.id] ?? {}) as Record<string, unknown>;
            return (
              <li key={q.id} className="rounded-lg border border-line bg-white p-5">
                <fieldset disabled={submetido || restantes <= 0}>
                  <legend className="text-base font-semibold text-navy">
                    {q.ordem}. {q.enunciado}
                  </legend>

                  {q.tipologia === "escolha_multipla" ? (
                    <div className="mt-3 grid gap-2">
                      {((apresentacao.opcoes as string[]) ?? []).map((op, i) => (
                        <label
                          key={i}
                          className="inline-flex min-h-11 items-center gap-3 text-base text-navy"
                        >
                          <input
                            type="radio"
                            className="h-6 w-6"
                            name={`q-${q.id}`}
                            checked={(dada as { indice?: number }).indice === i}
                            onChange={() => void guardar(q.id, { indice: i })}
                          />
                          {op}
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {q.tipologia === "verdadeiro_falso" ? (
                    <div className="mt-3 flex flex-wrap gap-4">
                      {[
                        { v: true, t: "Verdadeiro" },
                        { v: false, t: "Falso" },
                      ].map((o) => (
                        <label
                          key={o.t}
                          className="inline-flex min-h-11 items-center gap-3 text-base text-navy"
                        >
                          <input
                            type="radio"
                            className="h-6 w-6"
                            name={`q-${q.id}`}
                            checked={(dada as { valor?: boolean }).valor === o.v}
                            onChange={() => void guardar(q.id, { valor: o.v })}
                          />
                          {o.t}
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {q.tipologia === "resposta_curta" ? (
                    <div className="mt-3">
                      <label className="sr-only" htmlFor={`curta-${q.id}`}>
                        A sua resposta
                      </label>
                      <input
                        id={`curta-${q.id}`}
                        className={campo}
                        value={String((dada as { texto?: string }).texto ?? "")}
                        onChange={(e) =>
                          setRespostas((r) => ({ ...r, [q.id]: { texto: e.target.value } }))
                        }
                        onBlur={(e) => void guardar(q.id, { texto: e.target.value })}
                      />
                    </div>
                  ) : null}

                  {q.tipologia === "correspondencia" ? (
                    <div className="mt-3 grid gap-3">
                      {((apresentacao.esquerda as string[]) ?? []).map((esq, i) => (
                        <div key={i} className="grid gap-2 sm:grid-cols-2 sm:items-center">
                          <span className="text-base text-navy">{esq}</span>
                          <label className="sr-only" htmlFor={`corr-${q.id}-${i}`}>
                            Correspondência para {esq}
                          </label>
                          <select
                            id={`corr-${q.id}-${i}`}
                            className={campo}
                            value={
                              ((dada as { pares?: Record<string, string> }).pares ?? {})[esq] ?? ""
                            }
                            onChange={(e) => {
                              const pares = {
                                ...((dada as { pares?: Record<string, string> }).pares ?? {}),
                                [esq]: e.target.value,
                              };
                              void guardar(q.id, { pares });
                            }}
                          >
                            <option value="">Escolha a correspondência</option>
                            {((apresentacao.direita as string[]) ?? []).map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {q.tipologia === "ordenacao" ? (
                    <div className="mt-3 grid gap-3">
                      {((apresentacao.itens as string[]) ?? []).map((item, i) => {
                        const ordem = ((dada as { ordem?: string[] }).ordem ?? []) as string[];
                        const posicao = ordem.indexOf(item) + 1;
                        const itens = (apresentacao.itens as string[]) ?? [];
                        return (
                          <div key={i} className="grid gap-2 sm:grid-cols-2 sm:items-center">
                            <span className="text-base text-navy">{item}</span>
                            <label className="sr-only" htmlFor={`ord-${q.id}-${i}`}>
                              Posição de {item}
                            </label>
                            <select
                              id={`ord-${q.id}-${i}`}
                              className={campo}
                              value={posicao > 0 ? String(posicao) : ""}
                              onChange={(e) => {
                                const nova = [...ordem];
                                const anterior = nova.indexOf(item);
                                if (anterior >= 0) nova[anterior] = "";
                                const idx = Number(e.target.value) - 1;
                                while (nova.length < itens.length) nova.push("");
                                nova[idx] = item;
                                void guardar(q.id, { ordem: nova });
                              }}
                            >
                              <option value="">Escolha a posição</option>
                              {itens.map((_, k) => (
                                <option key={k} value={k + 1}>
                                  {k + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </fieldset>

                {submetido ? (
                  <div className="mt-4 rounded-md border border-line bg-page p-3">
                    <p className="text-base font-semibold text-navy">
                      {q.correcta ? "Resposta certa" : "Resposta errada"}
                    </p>
                    {q.explicacao ? (
                      <p className="mt-1 text-base text-navy-2">{q.explicacao}</p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}

      {!submetido ? (
        <button
          type="button"
          onClick={() => void terminar()}
          disabled={aSubmeter}
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
        >
          {aSubmeter ? "A submeter…" : "Submeter exame"}
        </button>
      ) : null}
    </PlataformaPagina>
  );
}
