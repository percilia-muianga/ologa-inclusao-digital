import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { obterQuiz, submeterDiagnostico } from "@/lib/formacao.functions";
import { moduloQuery } from "./formacao.$modulo";
import { formacaoStore } from "@/lib/formacao-store";

const diagPerguntasQuery = (moduloId: string) =>
  queryOptions({
    queryKey: ["formacao", "quiz", moduloId],
    queryFn: () => obterQuiz({ data: { moduloId } }),
  });

export const Route = createFileRoute("/formacao/$modulo/diagnostico")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(diagPerguntasQuery(params.modulo)),
  component: DiagnosticoView,
});

function DiagnosticoView() {
  const { modulo: moduloId } = Route.useParams();
  const { data: perguntas } = useSuspenseQuery(diagPerguntasQuery(moduloId));
  const { data: mod } = useSuspenseQuery(moduloQuery(moduloId));
  const submeter = useServerFn(submeterDiagnostico);

  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [resultado, setResultado] = useState<{ pontuacao: number; total: number } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    setErro(null);
    const lista = perguntas.map((p) => ({
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
      formacaoStore.guardarDiagnostico(moduloId, r.pontuacao, r.total);
      setResultado(r);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível submeter o diagnóstico.");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <div className="mx-auto max-w-2xl">
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-xl font-bold text-navy">Diagnóstico registado</h2>
          <p className="mt-2 text-base text-navy-2">
            Acertou <strong>{resultado.pontuacao}</strong> de{" "}
            <strong>{resultado.total}</strong>. Não se preocupe: é exatamente para isto
            que serve a formação. No fim do curso vamos comparar com a sua nota do teste.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/formacao/$modulo"
              params={{ modulo: moduloId }}
              search={{ curso }}
              className="btn-brand btn-brand-hover"
            >
              Começar as lições
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-2 text-xl font-bold text-navy">
        Diagnóstico — {mod.modulo.titulo}
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Opcional. Serve apenas para medir depois o quanto aprendeu. Não impede o acesso
        ao curso, e ninguém vê a sua nota inicial exceto no relatório final da
        instituição, quando existir. Sem tempo limite.
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
                      name={`d-${p.id}`}
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
            {enviando ? "A submeter…" : "Submeter diagnóstico"}
          </button>
          <Link
            to="/formacao/$modulo"
            params={{ modulo: moduloId }}
            search={{ curso }}
            className="text-sm font-semibold text-navy-2 underline"
          >
            Saltar
          </Link>
        </div>
      </form>
    </div>
  );
}
