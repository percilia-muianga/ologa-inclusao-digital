import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { usePreviewFormacaoGuard } from "@/hooks/use-preview-formacao-guard";
import { PreviewBanner } from "@/components/preview-banner";
import { obterLicao, marcarLicaoConcluida } from "@/lib/formacao.functions";


export const Route = createFileRoute("/formacao/$modulo/licao/$licao")({
  head: () => ({ meta: [{ title: "Lição — Ologa" }] }),
  component: LicaoPage,
});

type Dados = Awaited<ReturnType<typeof obterLicao>>;

const FORMATOS = [
  "Texto",
  "Leitura fácil",
  "Áudio",
  "Alto contraste",
  "Língua de Sinais Moçambicana — interpretação assegurada",
];

function LicaoPage() {
  const { modulo: moduloParam, licao: licaoParam } = Route.useParams();
  const navigate = useNavigate();
  const guard = usePreviewFormacaoGuard();
  const carregar = useServerFn(obterLicao);
  const marcar = useServerFn(marcarLicaoConcluida);

  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<"conteudo" | "guiao">("conteudo");
  const [ampliada, setAmpliada] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);

  const mOrdem = Number.parseInt(moduloParam, 10);
  const lOrdem = Number.parseInt(licaoParam, 10);

  useEffect(() => {
    if (guard.estado !== "ok") return;
    if (!Number.isFinite(mOrdem) || !Number.isFinite(lOrdem)) {
      setErro("Lição inválida.");
      return;
    }
    setDados(null);
    setAba("conteudo");
    (async () => {
      try {
        const r = await carregar({
          data: { modulo_ordem: mOrdem, licao_ordem: lOrdem },
        });
        setDados(r);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar a lição.");
      }
    })();
  }, [guard.estado, carregar, mOrdem, lOrdem]);

  async function concluir() {
    if (!dados) return;
    setAGuardar(true);
    try {
      await marcar({ data: { licao_id: dados.licao.id } });
      setDados({ ...dados, concluida: true });
    } catch (e) {
      console.error(e);
      alert("Não foi possível guardar o progresso.");
    } finally {
      setAGuardar(false);
    }
  }

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

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          to="/formacao/$modulo"
          params={{ modulo: String(dados.modulo.ordem) }}
          className="text-sm text-ink underline"
        >
          ← {dados.modulo.ordem}. {dados.modulo.titulo}
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold text-ink">
          {dados.licao.ordem}. {dados.licao.titulo}
        </h1>
        {dados.licao.duracao && (
          <p className="mt-1 text-sm text-muted-foreground">{dados.licao.duracao}</p>
        )}

        <section className="mt-6 rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="text-base font-bold text-ink">Formatos disponíveis</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {FORMATOS.map((f) => (
              <li
                key={f}
                className="rounded-md border border-ink/20 bg-ink/5 px-3 py-1 text-sm text-ink"
              >
                {f}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8" role="tablist" aria-label="Formato do conteúdo">
          {(
            [
              ["conteudo", "Conteúdo (e-learning)"],
              ["guiao", "Guião do formador"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={aba === id}
              aria-controls={`painel-${id}`}
              id={`aba-${id}`}
              onClick={() => setAba(id)}
              className={
                "min-h-11 rounded-t-md border-b-2 px-4 text-base font-semibold " +
                (aba === id
                  ? "border-ink text-ink"
                  : "border-transparent text-muted-foreground hover:text-ink")
              }
            >
              {label}
            </button>
          ))}
        </div>

        {dados.licao.ilustracao_svg && (
          <figure className="mt-6 rounded-lg border border-ink/10 bg-white p-4">
            <button
              type="button"
              onClick={() => setAmpliada(true)}
              aria-label="Ampliar ilustração"
              className="block w-full"
            >
              <div
                className="[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-h-[420px] [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: dados.licao.ilustracao_svg }}
              />
            </button>
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              Clique na ilustração para ampliar.
            </figcaption>
          </figure>
        )}

        <article
          role="tabpanel"
          id="painel-conteudo"
          aria-labelledby="aba-conteudo"
          hidden={aba !== "conteudo"}
          className="prose prose-neutral mt-6 max-w-none text-ink"
          dangerouslySetInnerHTML={{ __html: dados.licao.conteudo_elearning ?? "" }}
        />
        <article
          role="tabpanel"
          id="painel-guiao"
          aria-labelledby="aba-guiao"
          hidden={aba !== "guiao"}
          className="prose prose-neutral mt-6 max-w-none text-ink"
          dangerouslySetInnerHTML={{ __html: dados.licao.guiao_formador ?? "" }}
        />

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={concluir}
            disabled={aGuardar || dados.concluida}
            className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground disabled:opacity-60"
          >
            {dados.concluida ? "✓ Concluída" : aGuardar ? "A guardar…" : "Marcar como concluída"}
          </button>
        </div>

        <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-6">
          {dados.anterior ? (
            <Link
              to="/formacao/$modulo/licao/$licao"
              params={{
                modulo: String(dados.modulo.ordem),
                licao: String(dados.anterior.ordem),
              }}
              className="inline-flex min-h-11 items-center rounded-md border border-ink/20 px-4 text-base text-ink"
            >
              ← Lição anterior
            </Link>
          ) : (
            <span />
          )}

          {dados.e_ultima ? (
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/formacao/$modulo/quiz",
                  params: { modulo: String(dados.modulo.ordem) },
                })
              }
              className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground"
            >
              Fazer o quiz →
            </button>
          ) : dados.seguinte ? (
            <Link
              to="/formacao/$modulo/licao/$licao"
              params={{
                modulo: String(dados.modulo.ordem),
                licao: String(dados.seguinte.ordem),
              }}
              className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground"
            >
              Lição seguinte →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>

      {ampliada && dados.licao.ilustracao_svg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ilustração ampliada"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
          onClick={() => setAmpliada(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-lg bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: dados.licao.ilustracao_svg }}
            />
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setAmpliada(false)}
                className="inline-flex min-h-11 items-center rounded-md border border-ink/20 px-4 text-base text-ink"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
