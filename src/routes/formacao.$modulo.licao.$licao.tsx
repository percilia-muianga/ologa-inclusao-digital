import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { obterLicao } from "@/lib/formacao.functions";
import { moduloQuery } from "./formacao.$modulo";
import { formacaoStore } from "@/lib/formacao-store";

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

function LicaoView() {
  const { modulo: moduloId, licao: licaoId } = Route.useParams();
  const navigate = useNavigate();
  const { data: licao } = useSuspenseQuery(licaoQuery(licaoId));
  const { data: mod } = useSuspenseQuery(moduloQuery(moduloId));
  const [aba, setAba] = useState<Aba>("elearning");

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
      });
    } else {
      navigate({ to: "/formacao/$modulo", params: { modulo: moduloId } });
    }
  }

  return (
    <div>
      <nav className="mb-3 text-sm">
        <Link
          to="/formacao/$modulo"
          params={{ modulo: moduloId }}
          className="text-navy-2 underline hover:text-brand"
        >
          ← Voltar ao módulo
        </Link>
      </nav>
      <h2 className="mb-4 text-xl font-bold text-navy sm:text-2xl">{licao.titulo}</h2>

      <ul className="selos-formato" aria-label="Formatos acessíveis assegurados nesta lição">
        <li className="selo-formato"><span>Texto</span><span className="check" aria-hidden>✓</span></li>
        <li className="selo-formato"><span>Leitura fácil</span><span className="check" aria-hidden>✓</span></li>
        <li className="selo-formato"><span>Áudio</span><span className="check" aria-hidden>✓</span></li>
        <li className="selo-formato"><span>Alto contraste</span><span className="check" aria-hidden>✓</span></li>
        <li className="selo-formato"><span>Língua de Sinais Moçambicana</span><span className="check" aria-hidden>✓</span></li>
      </ul>

      {licao.guiao_formador ? (
        <div role="tablist" aria-label="Vistas da lição" className="mb-4 flex gap-2 border-b border-line">
          <button
            role="tab"
            aria-selected={aba === "elearning"}
            onClick={() => setAba("elearning")}
            className={
              "border-b-2 px-3 py-2 text-sm font-semibold " +
              (aba === "elearning" ? "border-brand text-brand" : "border-transparent text-navy-2")
            }
          >
            Conteúdo (e-learning)
          </button>
          <button
            role="tab"
            aria-selected={aba === "guiao"}
            onClick={() => setAba("guiao")}
            className={
              "border-b-2 px-3 py-2 text-sm font-semibold " +
              (aba === "guiao" ? "border-brand text-brand" : "border-transparent text-navy-2")
            }
          >
            Guião do formador
          </button>
        </div>
      ) : null}

      {aba === "elearning" ? (
        <article className="licao-prose max-w-none rounded-xl border border-line bg-white p-6">
          {licao.ilustracao_svg ? (
            <div
              className="mb-4"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: licao.ilustracao_svg }}
            />
          ) : null}
          <div dangerouslySetInnerHTML={{ __html: licao.conteudo_elearning ?? "" }} />
        </article>
      ) : (
        <article className="licao-prose max-w-none rounded-xl border border-line bg-page/60 p-6">
          <div dangerouslySetInnerHTML={{ __html: licao.guiao_formador ?? "" }} />
        </article>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          {anterior ? (
            <Link
              to="/formacao/$modulo/licao/$licao"
              params={{ modulo: moduloId, licao: anterior.id }}
              className="text-sm font-semibold text-navy-2 underline"
            >
              ← {anterior.titulo}
            </Link>
          ) : null}
        </div>
        <button onClick={concluirEAvancar} className="btn-brand btn-brand-hover">
          {proxima ? "Marcar como feita e continuar" : "Marcar como feita e concluir"}
        </button>
      </div>
    </div>
  );
}
