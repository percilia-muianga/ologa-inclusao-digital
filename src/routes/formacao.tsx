import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { usePreviewFormacaoGuard } from "@/hooks/use-preview-formacao-guard";
import { PreviewBanner } from "@/components/preview-banner";
import { listarCatalogo } from "@/lib/formacao.functions";


export const Route = createFileRoute("/formacao")({
  head: () => ({ meta: [{ title: "A minha formação — Ologa" }] }),
  component: FormacaoPage,
});

type NivelDB = "basico" | "intermedio" | "avancado";
type Modulo = {
  id: string;
  ordem: number;
  titulo: string;
  nivel: NivelDB;
  duracao: string | null;
  descricao: string | null;
  desenho_universal: string | null;
  total_licoes: number;
  licoes_concluidas: number;
};

const NIVEL_LABEL: Record<NivelDB, string> = {
  basico: "Básico",
  intermedio: "Intermédio",
  avancado: "Avançado",
};

function FormacaoPage() {
  const guard = useFormandoGuard();
  const carregar = useServerFn(listarCatalogo);
  const [modulos, setModulos] = useState<Modulo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todos" | NivelDB>("todos");

  useEffect(() => {
    if (guard.estado !== "ok") return;
    (async () => {
      try {
        const r = await carregar();
        setModulos(r as Modulo[]);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar os módulos.");
      }
    })();
  }, [guard.estado, carregar]);

  const filtrados = useMemo(
    () => (modulos ?? []).filter((m) => filtro === "todos" || m.nivel === filtro),
    [modulos, filtro],
  );

  if (guard.estado === "a_verificar") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-base text-foreground">A verificar acesso…</p>
      </main>
    );
  }
  if (guard.estado !== "ok") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-base text-foreground">A redirecionar…</p>
      </main>
    );
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">A minha formação</h1>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Filtrar por nível
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["todos", "basico", "intermedio", "avancado"] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setFiltro(n)}
                aria-pressed={filtro === n}
                className={
                  "inline-flex min-h-10 items-center rounded-md border px-3 text-sm " +
                  (filtro === n
                    ? "border-ink bg-ink text-ink-foreground"
                    : "border-ink/20 text-ink")
                }
              >
                {n === "todos" ? "Todos" : NIVEL_LABEL[n]}
              </button>
            ))}
          </div>
        </fieldset>

        {erro && (
          <p role="alert" className="mt-6 rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
            {erro}
          </p>
        )}

        {modulos === null && !erro && (
          <p className="mt-6 text-base text-foreground">A carregar módulos…</p>
        )}

        {modulos !== null && filtrados.length === 0 && (
          <p className="mt-6 text-base text-foreground">Não há módulos para este nível.</p>
        )}

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((m) => (
            <li key={m.id}>
              <Link
                to="/formacao/$modulo"
                params={{ modulo: String(m.ordem) }}
                className="block h-full rounded-lg border border-ink/10 bg-white p-5 transition-colors hover:border-ink/40 focus:outline-none focus:ring-2 focus:ring-ink"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-md bg-ink/5 px-2 py-1 text-xs font-semibold text-ink">
                    {NIVEL_LABEL[m.nivel]}
                  </span>
                  {m.duracao && (
                    <span className="text-xs text-muted-foreground">{m.duracao}</span>
                  )}
                </div>
                <h2 className="mt-3 text-lg font-extrabold text-ink">
                  {m.ordem}. {m.titulo}
                </h2>
                {m.descricao && (
                  <p className="mt-2 text-sm text-foreground">{m.descricao}</p>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  {m.total_licoes} {m.total_licoes === 1 ? "lição" : "lições"}
                </p>
                <div className="mt-2">
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-ink/10"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={m.total_licoes}
                    aria-valuenow={m.licoes_concluidas}
                    aria-label={`Progresso do módulo ${m.titulo}`}
                  >
                    <div
                      className="h-full bg-ink"
                      style={{
                        width:
                          m.total_licoes === 0
                            ? "0%"
                            : `${(m.licoes_concluidas / m.total_licoes) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {m.licoes_concluidas} de {m.total_licoes} concluídas
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
