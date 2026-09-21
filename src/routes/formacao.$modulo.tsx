import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { obterModulo } from "@/lib/formacao.functions";
import { formacaoStore } from "@/lib/formacao-store";

export const moduloQuery = (moduloId: string, cursoSlug?: string) =>
  queryOptions({
    queryKey: ["formacao", "modulo", moduloId, cursoSlug ?? null],
    queryFn: () => obterModulo({ data: { moduloId, cursoSlug: cursoSlug ?? null } }),
  });

/**
 * `curso` é o contexto de percurso: indica a partir de que curso a pessoa
 * chegou ao módulo. Não altera os dados nem a ordenação global; é validado no
 * servidor e ignorado se o módulo não pertencer a esse curso.
 */
export type PesquisaModulo = { curso?: string };

export const Route = createFileRoute("/formacao/$modulo")({
  validateSearch: (s: Record<string, unknown>): PesquisaModulo =>
    typeof s["curso"] === "string" && s["curso"].length > 0
      ? { curso: s["curso"] }
      : {},
  loaderDeps: ({ search }) => ({ curso: search.curso }),
  loader: ({ context, params, deps }) =>
    context.queryClient.ensureQueryData(moduloQuery(params.modulo, deps.curso)),
  component: ModuloLayout,
});

function ModuloLayout() {
  const { modulo: moduloId } = Route.useParams();
  const { curso } = Route.useSearch();
  const { data } = useSuspenseQuery(moduloQuery(moduloId, curso));
  const contexto = data.contexto;

  // Progresso local (barra discreta em topo do módulo)
  const [concluidas, setConcluidas] = useState(0);
  useEffect(() => {
    setConcluidas(formacaoStore.licoesConcluidas(moduloId).size);
    const listener = () => setConcluidas(formacaoStore.licoesConcluidas(moduloId).size);
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, [moduloId]);

  const totalLicoes = data.licoes.length;
  const pct = totalLicoes === 0 ? 0 : Math.round((concluidas / totalLicoes) * 100);

  return (
    <div className="wrap py-8">
      <nav className="mb-4 text-sm">
        {contexto ? (
          <Link
            to="/cursos/$curso"
            params={{ curso: contexto.cursoSlug }}
            className="text-navy-2 underline hover:text-brand"
          >
            ← Voltar ao curso {contexto.cursoTitulo}
          </Link>
        ) : (
          <Link to="/formacao" className="text-navy-2 underline hover:text-brand">
            ← Todos os módulos da formação aberta
          </Link>
        )}
      </nav>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {contexto
            ? contexto.transversal
              ? `Módulo transversal obrigatório · ${contexto.cursoTitulo}`
              : `Módulo ${contexto.ordemNoCurso} de ${contexto.totalModulos} · ${contexto.cursoTitulo}`
            : "Módulo da formação aberta"}
        </div>
        <h1 className="mt-1 text-2xl font-extrabold text-navy sm:text-3xl">
          {data.modulo.titulo}
        </h1>
        {totalLicoes > 0 ? (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progresso neste dispositivo</span>
              <span>{concluidas}/{totalLicoes}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line" role="presentation">
              <div
                className="h-full bg-brand transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
      <Outlet />
    </div>
  );
}
