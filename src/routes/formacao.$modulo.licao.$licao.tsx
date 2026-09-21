import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { obterLicao } from "@/lib/formacao.functions";
import { moduloQuery } from "./formacao.$modulo";
import { formacaoStore } from "@/lib/formacao-store";
import {
  ListenButton,
  extrairFalasDeHtml,
  PAUSA_TITULO_MS,
  type Fala,
} from "@/components/listen-button";

const licaoQuery = (licaoId: string) =>
  queryOptions({
    queryKey: ["formacao", "licao", licaoId],
    queryFn: () => obterLicao({ data: { licaoId } }),
  });

export const Route = createFileRoute("/formacao/$modulo/licao/$licao")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(licaoQuery(params.licao)),
  component: LicaoView,
});

type Aba = "elearning" | "guiao";

function pararLeitura() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function LicaoView() {
  const { modulo: moduloId, licao: licaoId } = Route.useParams();
  const { curso } = useSearch({ from: "/formacao/$modulo" });
  const navigate = useNavigate();
  const { data: licao } = useSuspenseQuery(licaoQuery(licaoId));
  const { data: mod } = useSuspenseQuery(moduloQuery(moduloId, curso));
  const [aba, setAba] = useState<Aba>("elearning");

  // Paragem automática ao mudar de separador ou de lição
  useEffect(() => {
    pararLeitura();
  }, [aba, licaoId]);
  useEffect(() => pararLeitura, []);

  const indice = useMemo(
    () => mod.licoes.findIndex((l) => l.id === licaoId),
    [mod.licoes, licaoId],
  );
  const anterior = indice > 0 ? mod.licoes[indice - 1] : null;
  const proxima = indice >= 0 && indice < mod.licoes.length - 1 ? mod.licoes[indice + 1] : null;

  function concluirEAvancar() {
    formacaoStore.marcarLicaoConcluida(moduloId, licaoId);
    if (proxima) {
      navigate({
        to: "/formacao/$modulo/licao/$licao",
        params: { modulo: moduloId, licao: proxima.id },
        search: { curso },
      });
    } else {
      navigate({ to: "/formacao/$modulo", params: { modulo: moduloId }, search: { curso } });
    }
  }

  function trocarAba(destino: Aba) {
    if (destino !== aba) {
      pararLeitura();
      setAba(destino);
    }
  }

  function teclaSeparador(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!licao.guiao_formador) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      trocarAba(aba === "elearning" ? "guiao" : "elearning");
      // Devolver foco ao novo separador seleccionado
      const alvo = document.getElementById(
        aba === "elearning" ? "tab-guiao" : "tab-elearning",
      );
      alvo?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      trocarAba("elearning");
      document.getElementById("tab-elearning")?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      trocarAba("guiao");
      document.getElementById("tab-guiao")?.focus();
    }
  }

  const temGuiao = !!licao.guiao_formador;

  return (
    <div>
      <nav className="mb-3 text-sm" aria-label="Navegação da lição">
        <Link
          to="/formacao/$modulo"
          params={{ modulo: moduloId }}
          search={{ curso }}
          className="text-navy-2 underline hover:text-brand-dark"
        >
          ← Voltar ao módulo
        </Link>
      </nav>
      <h2 className="mb-4 text-xl font-bold text-navy sm:text-2xl">{licao.titulo}</h2>

      {/* Só é assinalado como disponível o formato que existe mesmo. */}
      <ul className="selos-formato" aria-label="Formatos desta lição">
        <li className="selo-formato"><span>Texto: disponível</span><span className="check" aria-hidden="true">✓</span></li>
        <li className="selo-formato"><span>Síntese em leitura fácil: disponível</span><span className="check" aria-hidden="true">✓</span></li>
        <li className="selo-formato"><span>Leitura em voz alta pelo navegador: disponível</span><span className="check" aria-hidden="true">✓</span></li>
        <li className="selo-formato"><span>Alto contraste e navegação por teclado: disponíveis</span><span className="check" aria-hidden="true">✓</span></li>
        <li className="selo-formato"><span>Vídeo e legendagem: por produzir</span></li>
        <li className="selo-formato"><span>Língua de Sinais Moçambicana: por produzir</span></li>
      </ul>

      {temGuiao ? (
        <div role="tablist" aria-label="Vistas da lição" className="mb-4 flex gap-2 border-b border-line">
          <button
            id="tab-elearning"
            role="tab"
            type="button"
            aria-selected={aba === "elearning"}
            aria-controls="painel-elearning"
            tabIndex={aba === "elearning" ? 0 : -1}
            onClick={() => trocarAba("elearning")}
            onKeyDown={teclaSeparador}
            className={
              "border-b-2 px-3 py-2 text-sm font-semibold " +
              (aba === "elearning" ? "border-brand text-brand-dark" : "border-transparent text-navy-2")
            }
          >
            Conteúdo (e-learning)
          </button>
          <button
            id="tab-guiao"
            role="tab"
            type="button"
            aria-selected={aba === "guiao"}
            aria-controls="painel-guiao"
            tabIndex={aba === "guiao" ? 0 : -1}
            onClick={() => trocarAba("guiao")}
            onKeyDown={teclaSeparador}
            className={
              "border-b-2 px-3 py-2 text-sm font-semibold " +
              (aba === "guiao" ? "border-brand text-brand-dark" : "border-transparent text-navy-2")
            }
          >
            Guião do formador
          </button>
        </div>
      ) : null}

      {aba === "elearning" ? (
        <section
          id="painel-elearning"
          role={temGuiao ? "tabpanel" : undefined}
          aria-labelledby={temGuiao ? "tab-elearning" : undefined}
          tabIndex={temGuiao ? 0 : undefined}
        >
          <div className="mb-3 flex justify-end">
            <ListenButton
              key={`elearning-${licaoId}`}
              label="🔊 Ouvir esta página"
              getFalas={() => {
                const falas: Fala[] = [
                  { texto: licao.titulo, pausaMs: PAUSA_TITULO_MS },
                ];
                if (licao.conteudo_elearning) {
                  falas.push(...extrairFalasDeHtml(licao.conteudo_elearning));
                }
                return falas;
              }}
            />
          </div>
          <article className="licao-prose max-w-none rounded-xl border border-line bg-white p-6">
            {licao.ilustracao_svg ? (
              // Os SVGs importados já trazem role="img" e aria-label descritivo.
              // NÃO envolver com aria-hidden — isso apagaria a descrição.
              <div
                className="mb-4 ilustracao-licao"
                dangerouslySetInnerHTML={{ __html: licao.ilustracao_svg }}
              />
            ) : null}
            <div dangerouslySetInnerHTML={{ __html: licao.conteudo_elearning ?? "" }} />
          </article>
        </section>
      ) : (
        <section
          id="painel-guiao"
          role="tabpanel"
          aria-labelledby="tab-guiao"
          tabIndex={0}
        >
          <div className="mb-3 flex justify-end">
            <ListenButton
              key={`guiao-${licaoId}`}
              label="🔊 Ouvir o guião do formador"
              getFalas={() => {
                const falas: Fala[] = [
                  { texto: `Guião do formador — ${licao.titulo}`, pausaMs: PAUSA_TITULO_MS },
                ];
                if (licao.guiao_formador) {
                  falas.push(...extrairFalasDeHtml(licao.guiao_formador));
                }
                return falas;
              }}
            />
          </div>
          <article className="licao-prose max-w-none rounded-xl border border-line bg-page/60 p-6">
            <div dangerouslySetInnerHTML={{ __html: licao.guiao_formador ?? "" }} />
          </article>
        </section>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          {anterior ? (
            <Link
              to="/formacao/$modulo/licao/$licao"
              params={{ modulo: moduloId, licao: anterior.id }}
              search={{ curso }}
              className="text-sm font-semibold text-navy-2 underline"
            >
              ← {anterior.titulo}
            </Link>
          ) : null}
        </div>
        <button type="button" onClick={concluirEAvancar} className="btn-brand btn-brand-hover">
          {proxima ? "Marcar como feita e continuar" : "Marcar como feita e concluir"}
        </button>
      </div>
    </div>
  );
}
