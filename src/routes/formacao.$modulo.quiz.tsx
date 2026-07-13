import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { usePreviewFormacaoGuard } from "@/hooks/use-preview-formacao-guard";
import { PreviewBanner } from "@/components/preview-banner";
import { obterQuiz, submeterQuiz } from "@/lib/formacao.functions";


export const Route = createFileRoute("/formacao/$modulo/quiz")({
  head: () => ({ meta: [{ title: "Quiz — Ologa" }] }),
  component: QuizPage,
});

type Dados = Awaited<ReturnType<typeof obterQuiz>>;

function QuizPage() {
  const { modulo: moduloParam } = Route.useParams();
  const guard = usePreviewFormacaoGuard();
  const carregar = useServerFn(obterQuiz);
  const submeter = useServerFn(submeterQuiz);

  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [aSubmeter, setASubmeter] = useState(false);
  const [resultado, setResultado] = useState<Awaited<ReturnType<typeof submeterQuiz>> | null>(null);

  const ordem = Number.parseInt(moduloParam, 10);

  useEffect(() => {
    if (guard.estado !== "ok") return;
    if (!Number.isFinite(ordem)) {
      setErro("Módulo inválido.");
      return;
    }
    (async () => {
      try {
        const r = await carregar({ data: { modulo_ordem: ordem } });
        setDados(r);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar o quiz.");
      }
    })();
  }, [guard.estado, carregar, ordem]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!dados) return;
    if (Object.keys(respostas).length !== dados.perguntas.length) {
      setErro("Responda a todas as perguntas antes de submeter.");
      return;
    }
    setErro(null);
    setASubmeter(true);
    try {
      const r = await submeter({
        data: { modulo_ordem: ordem, respostas },
      });
      setResultado(r);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível submeter o quiz.");
    } finally {
      setASubmeter(false);
    }
  }

  if (guard.estado !== "ok") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-base text-foreground">
          {guard.estado === "a_verificar" ? "A verificar acesso…" : "A redirecionar…"}
        </p>
      </main>
    );
  }
  if (!dados && !erro) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-base text-foreground">A carregar…</p>
      </main>
    );
  }
  if (!dados) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p role="alert" className="text-base text-ink">{erro}</p>
      </main>
    );
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      {guard.modoPreVisualizacao && <PreviewBanner />}
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          to="/formacao/$modulo"
          params={{ modulo: moduloParam }}
          className="text-sm text-ink underline"
        >
          ← {dados.modulo.ordem}. {dados.modulo.titulo}
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold text-ink">Quiz final</h1>

        {resultado ? (
          <section className="mt-6 rounded-lg border border-ink/10 bg-white p-6">
            {resultado.modo_pre_visualizacao ? (
              <p className="text-lg font-semibold text-ink">
                Está em modo de pré-visualização. As respostas não são pontuadas nem guardadas.
              </p>
            ) : (
              <p className="text-2xl font-extrabold text-ink">
                {resultado.pontuacao} de {resultado.total} respostas corretas
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setRespostas({});
                }}
                className="inline-flex min-h-11 items-center rounded-md border border-ink/20 px-4 text-base text-ink"
              >
                Tentar outra vez
              </button>
              <Link
                to="/formacao/$modulo"
                params={{ modulo: moduloParam }}
                className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground"
              >
                Voltar ao módulo
              </Link>
            </div>
          </section>
        ) : (
          <form onSubmit={enviar} className="mt-6 space-y-6" noValidate>
            {dados.perguntas.map((p, i) => (
              <fieldset key={p.id} className="rounded-lg border border-ink/10 bg-white p-5">
                <legend className="text-base font-bold text-ink">
                  {i + 1}. {p.pergunta}
                </legend>
                <div className="mt-3 space-y-2">
                  {p.opcoes.map((op, idx) => {
                    const inputId = `p-${p.id}-o-${idx}`;
                    return (
                      <label
                        key={inputId}
                        htmlFor={inputId}
                        className="flex items-start gap-3 rounded-md border border-ink/10 p-3 text-base text-ink hover:bg-ink/5"
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name={`pergunta-${p.id}`}
                          value={idx}
                          checked={respostas[p.id] === idx}
                          onChange={() => setRespostas({ ...respostas, [p.id]: idx })}
                          className="mt-1"
                        />
                        <span>{op}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {erro && (
              <p role="alert" className="rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={aSubmeter}
              className="inline-flex min-h-12 items-center rounded-md bg-ink px-6 text-base font-semibold text-ink-foreground disabled:opacity-60"
            >
              {aSubmeter ? "A submeter…" : "Submeter respostas"}
            </button>
          </form>
        )}
      </main>
    </>
  );
}
