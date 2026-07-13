import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { obterQuiz, submeterQuiz } from "@/lib/formacao.functions";
import { moduloQuery } from "./formacao.$modulo";
import { formacaoStore, type RespostaQuiz } from "@/lib/formacao-store";

const quizQuery = (moduloId: string) =>
  queryOptions({
    queryKey: ["formacao", "quiz", moduloId],
    queryFn: () => obterQuiz({ data: { moduloId } }),
  });

export const Route = createFileRoute("/formacao/$modulo/quiz")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(quizQuery(params.modulo)),
  component: QuizView,
});

type Resultado = {
  pontuacao: number;
  total: number;
  correcoes: { perguntaId: string; indiceCorreto: number; acertou: boolean }[];
};

function QuizView() {
  const { modulo: moduloId } = Route.useParams();
  const navigate = useNavigate();
  const { data: perguntas } = useSuspenseQuery(quizQuery(moduloId));
  const { data: mod } = useSuspenseQuery(moduloQuery(moduloId));
  const submeter = useServerFn(submeterQuiz);

  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const guardadas = formacaoStore.respostasQuiz(moduloId);
    if (guardadas) {
      const map: Record<string, number> = {};
      for (const r of guardadas) map[r.perguntaId] = r.indice;
      setRespostas(map);
    }
  }, [moduloId]);

  async function enviar() {
    setErro(null);
    const lista: RespostaQuiz[] = perguntas.map((p) => ({
      perguntaId: p.id,
      indice: respostas[p.id] ?? -1,
    }));
    if (lista.some((r) => r.indice < 0)) {
      setErro("Responda a todas as perguntas antes de submeter.");
      return;
    }
    setEnviando(true);
    try {
      const r = await submeter({ data: { moduloId, respostas: lista } });
      formacaoStore.guardarQuiz(moduloId, lista);
      setResultado(r);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível submeter as respostas.");
    } finally {
      setEnviando(false);
    }
  }

  function refazer() {
    setResultado(null);
    setRespostas({});
  }

  if (resultado) {
    const pct = resultado.total === 0 ? 0 : resultado.pontuacao / resultado.total;
    const passou = pct >= 2 / 3;
    return (
      <div className="mx-auto max-w-2xl">
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-xl font-bold text-navy">Resultado</h2>
          <p className="mt-2 text-base text-navy-2">
            Acertou <strong>{resultado.pontuacao}</strong> de{" "}
            <strong>{resultado.total}</strong>.{" "}
            {passou
              ? "Boa! Já pode emitir o certificado deste módulo."
              : "Não se preocupe: é exatamente para isto que serve a formação. Reveja as lições e tente de novo."}
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-brand"
              style={{ width: `${Math.round(pct * 100)}%` }}
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={refazer} className="btn-brand btn-brand-hover">
              Repetir o teste
            </button>
            {passou ? (
              <button
                onClick={() =>
                  navigate({
                    to: "/formacao/$modulo/certificado",
                    params: { modulo: moduloId },
                  })
                }
                className="btn-brand btn-brand-hover"
              >
                Continuar para o certificado →
              </button>
            ) : null}
            <Link
              to="/formacao/$modulo"
              params={{ modulo: moduloId }}
              className="text-sm font-semibold text-navy-2 underline"
            >
              Voltar ao módulo
            </Link>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {perguntas.map((p, i) => {
            const corr = resultado.correcoes.find((c) => c.perguntaId === p.id);
            const dada = respostas[p.id];
            const opcoes = (p.opcoes as string[]) ?? [];
            return (
              <article key={p.id} className="rounded-xl border border-line bg-white p-5">
                <h3 className="mb-3 font-semibold text-navy">
                  {i + 1}. {p.pergunta}
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {opcoes.map((o, idx) => {
                    const eraCerta = corr?.indiceCorreto === idx;
                    const foiEscolhida = dada === idx;
                    return (
                      <li
                        key={idx}
                        className={
                          "rounded-md border px-3 py-2 " +
                          (eraCerta
                            ? "border-[color:var(--color-success,#2E8B57)] bg-[color:var(--color-success,#2E8B57)]/10 text-navy"
                            : foiEscolhida
                              ? "border-line bg-page text-navy-2"
                              : "border-line text-navy-2")
                        }
                      >
                        <span className="mr-2 font-semibold">
                          {eraCerta ? "✓ " : foiEscolhida ? "• " : "  "}
                        </span>
                        {o}
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-2 text-xl font-bold text-navy">Teste — {mod.modulo.titulo}</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Sem tempo limite. Pode repetir sem limite.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar();
        }}
        className="space-y-5"
      >
        {perguntas.map((p, i) => {
          const opcoes = (p.opcoes as string[]) ?? [];
          return (
            <fieldset key={p.id} className="rounded-xl border border-line bg-white p-5">
              <legend className="mb-3 font-semibold text-navy">
                {i + 1}. {p.pergunta}
              </legend>
              <div className="space-y-2">
                {opcoes.map((o, idx) => (
                  <label key={idx} className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-page">
                    <input
                      type="radio"
                      name={`p-${p.id}`}
                      checked={respostas[p.id] === idx}
                      onChange={() => setRespostas((r) => ({ ...r, [p.id]: idx }))}
                      className="mt-1"
                    />
                    <span className="text-sm text-navy-2">{o}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
        {erro ? <p className="text-sm text-brand">{erro}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={enviando} className="btn-brand btn-brand-hover">
            {enviando ? "A submeter…" : "Submeter respostas"}
          </button>
          <Link
            to="/formacao/$modulo"
            params={{ modulo: moduloId }}
            className="text-sm font-semibold text-navy-2 underline"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
