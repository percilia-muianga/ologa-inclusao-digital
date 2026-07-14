import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { moduloQuery } from "./formacao.$modulo";
import { formacaoStore } from "@/lib/formacao-store";
import { ListenButton } from "@/components/listen-button";


export const Route = createFileRoute("/formacao/$modulo/")({
  component: ModuloOverview,
});

function ModuloOverview() {
  const { modulo: moduloId } = Route.useParams();
  const { data } = useSuspenseQuery(moduloQuery(moduloId));
  const [concluidas, setConcluidas] = useState<Set<string>>(new Set());
  const [diagnostico, setDiagnostico] = useState<{ pontuacao: number; total: number } | null>(null);

  useEffect(() => {
    setConcluidas(formacaoStore.licoesConcluidas(moduloId));
    setDiagnostico(formacaoStore.diagnostico(moduloId));
  }, [moduloId]);

  const todasConcluidas =
    data.licoes.length > 0 && data.licoes.every((l) => concluidas.has(l.id));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-4 flex justify-end">
          <ListenButton
            getSentences={() => {
              const partes: string[] = [data.modulo.titulo];
              if (data.modulo.descricao) partes.push(data.modulo.descricao);
              if (data.modulo.desenho_universal)
                partes.push(`Desenho universal. ${data.modulo.desenho_universal}`);
              partes.push(
                `Este módulo tem ${data.licoes.length} ${
                  data.licoes.length === 1 ? "lição" : "lições"
                }.`,
              );
              data.licoes.forEach((l) => partes.push(`${l.ordem}. ${l.titulo}.`));
              return partes;
            }}
          />
        </div>
        {data.modulo.descricao ? (
          <p className="mb-6 text-base leading-relaxed text-navy-2">
            {data.modulo.descricao}
          </p>
        ) : null}


        {data.modulo.desenho_universal ? (
          <section
            aria-labelledby="titulo-desenho-universal"
            className="mb-8 rounded-xl border border-line bg-page/60 p-5"
          >
            <h2
              id="titulo-desenho-universal"
              className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-dark"
            >
              Desenho universal
            </h2>
            <p className="text-sm leading-relaxed text-navy-2">
              {data.modulo.desenho_universal}
            </p>
          </section>
        ) : null}

        <section aria-labelledby="titulo-licoes">
          <h2 id="titulo-licoes" className="mb-3 text-lg font-bold text-navy">
            Lições
          </h2>
          <ol className="space-y-2">
            {data.licoes.map((l) => {
              const feita = concluidas.has(l.id);
              return (
                <li key={l.id}>
                  <Link
                    to="/formacao/$modulo/licao/$licao"
                    params={{ modulo: moduloId, licao: l.id }}
                    className="flex items-center justify-between rounded-lg border border-line bg-white p-4 hover:border-brand"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className={
                          "inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold " +
                          (feita
                            ? "bg-[color:var(--color-success,#2E8B57)] text-white"
                            : "bg-line text-navy-2")
                        }
                      >
                        {feita ? "✓" : l.ordem}
                      </span>
                      <span>
                        <span className="block font-semibold text-navy">{l.titulo}</span>
                        {l.duracao ? (
                          <span className="block text-xs text-muted-foreground">
                            {l.duracao}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span className="text-sm text-brand-dark">Abrir →</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {data.numeroPerguntas > 0 ? (
          <section className="mt-8 rounded-xl border border-line bg-white p-5">
            <h2 className="mb-1 text-lg font-bold text-navy">Teste do módulo</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {data.numeroPerguntas} perguntas. Pode repetir sem limite.
            </p>
            <Link
              to="/formacao/$modulo/quiz"
              params={{ modulo: moduloId }}
              className="btn-brand btn-brand-hover"
            >
              {todasConcluidas ? "Fazer o teste" : "Fazer o teste na mesma"}
            </Link>
          </section>
        ) : null}
      </div>

      <aside className="space-y-4">
        {data.numeroPerguntas > 0 ? (
          <section className="rounded-xl border border-line bg-page/60 p-5">
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-navy-2">
              Diagnóstico inicial <span className="font-normal normal-case text-muted-foreground">(opcional)</span>
            </h2>
            <p className="mb-3 text-sm text-navy-2">
              Faça o diagnóstico se quiser medir depois quanto aprendeu. Nunca impede o
              acesso ao curso.
            </p>
            {diagnostico ? (
              <p className="mb-3 text-xs text-muted-foreground">
                Já fez: acertou {diagnostico.pontuacao} de {diagnostico.total}.
              </p>
            ) : null}
            <Link
              to="/formacao/$modulo/diagnostico"
              params={{ modulo: moduloId }}
              className="text-sm font-semibold text-brand-dark underline"
            >
              {diagnostico ? "Rever diagnóstico" : "Fazer diagnóstico"}
            </Link>
          </section>
        ) : null}

        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-navy-2">
            Certificado
          </h2>
          <p className="mb-3 text-sm text-navy-2">
            Emitido quando concluir todas as lições e obtiver, pelo menos, dois terços no
            teste do módulo.
          </p>
          <Link
            to="/formacao/$modulo/certificado"
            params={{ modulo: moduloId }}
            className="text-sm font-semibold text-brand-dark underline"
          >
            Ir para a página de certificado
          </Link>
        </section>
      </aside>
    </div>
  );
}
