import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useFormandoGuard } from "@/hooks/use-formando-guard";
import { obterModulo } from "@/lib/formacao.functions";

export const Route = createFileRoute("/formacao/$modulo")({
  head: () => ({ meta: [{ title: "Módulo — Ologa" }] }),
  component: ModuloPage,
});

type Dados = Awaited<ReturnType<typeof obterModulo>>;

function ModuloPage() {
  const { modulo: moduloParam } = Route.useParams();
  const guard = useFormandoGuard();
  const carregar = useServerFn(obterModulo);
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const ordem = Number.parseInt(moduloParam, 10);

  useEffect(() => {
    if (guard.estado !== "ok") return;
    if (!Number.isFinite(ordem)) {
      setErro("Módulo inválido.");
      return;
    }
    (async () => {
      try {
        const r = await carregar({ data: { ordem } });
        setDados(r);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar o módulo.");
      }
    })();
  }, [guard.estado, carregar, ordem]);

  if (guard.estado !== "ok") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-base text-foreground">
          {guard.estado === "a_verificar" ? "A verificar acesso…" : "A redirecionar…"}
        </p>
      </main>
    );
  }
  if (erro) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p role="alert" className="text-base text-ink">{erro}</p>
        <Link to="/formacao" className="mt-4 inline-block text-ink underline">
          ← Voltar aos módulos
        </Link>
      </main>
    );
  }
  if (!dados) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-base text-foreground">A carregar…</p>
      </main>
    );
  }

  const feitas = dados.licoes.filter((l) => l.concluida).length;
  const total = dados.licoes.length;

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link to="/formacao" className="text-sm text-ink underline">
          ← Voltar aos módulos
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold text-ink">
          {dados.modulo.ordem}. {dados.modulo.titulo}
        </h1>

        <div className="mt-4">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-ink/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={feitas}
          >
            <div
              className="h-full bg-ink"
              style={{ width: total === 0 ? "0%" : `${(feitas / total) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {feitas} de {total} lições concluídas
          </p>
        </div>

        {dados.modulo.desenho_universal && (
          <section className="mt-6 rounded-lg border border-ink/10 bg-white p-5">
            <h2 className="text-base font-bold text-ink">Desenho universal neste módulo</h2>
            <p className="mt-2 text-base text-foreground">{dados.modulo.desenho_universal}</p>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-ink">Lições</h2>
          <ol className="mt-3 divide-y divide-ink/10 rounded-lg border border-ink/10 bg-white">
            {dados.licoes.map((l) => (
              <li key={l.id}>
                <Link
                  to="/formacao/$modulo/licao/$licao"
                  params={{ modulo: String(dados.modulo.ordem), licao: String(l.ordem) }}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-ink/5 focus:outline-none focus:bg-ink/5"
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={
                        "inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold " +
                        (l.concluida
                          ? "border-ink bg-ink text-ink-foreground"
                          : "border-ink/30 text-ink")
                      }
                    >
                      {l.concluida ? "✓" : l.ordem}
                    </span>
                    <span className="font-semibold text-ink">{l.titulo}</span>
                    <span className="sr-only">
                      {l.concluida ? "concluída" : "não concluída"}
                    </span>
                  </span>
                  {l.duracao && (
                    <span className="text-sm text-muted-foreground">{l.duracao}</span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {dados.total_perguntas > 0 && (
          <section className="mt-8 rounded-lg border border-ink/10 bg-white p-5">
            <h2 className="text-2xl font-bold text-ink">Quiz final</h2>
            <p className="mt-2 text-base text-foreground">
              {dados.total_perguntas} {dados.total_perguntas === 1 ? "pergunta" : "perguntas"}.
            </p>
            {dados.ultima_tentativa && (
              <p className="mt-1 text-sm text-muted-foreground">
                Última tentativa: {dados.ultima_tentativa.pontuacao} de{" "}
                {dados.ultima_tentativa.total} —{" "}
                {new Date(dados.ultima_tentativa.tentado_em).toLocaleString("pt-PT")}
              </p>
            )}
            <Link
              to="/formacao/$modulo/quiz"
              params={{ modulo: String(dados.modulo.ordem) }}
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground"
            >
              {dados.ultima_tentativa ? "Repetir quiz →" : "Fazer o quiz →"}
            </Link>
          </section>
        )}
      </main>
    </>
  );
}
