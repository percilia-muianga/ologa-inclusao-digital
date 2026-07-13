import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { obterModulo } from "@/lib/formacao.functions";
import { formacaoStore } from "@/lib/formacao-store";

export const moduloQuery = (moduloId: string) =>
  queryOptions({
    queryKey: ["formacao", "modulo", moduloId],
    queryFn: () => obterModulo({ data: { moduloId } }),
  });

export const Route = createFileRoute("/formacao/$modulo")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(moduloQuery(params.modulo)),
  component: ModuloLayout,
});

function ModuloLayout() {
  const { modulo: moduloId } = Route.useParams();
  const { data } = useSuspenseQuery(moduloQuery(moduloId));

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
        <Link to="/formacao" className="text-navy-2 underline hover:text-brand">
          ← Todos os cursos
        </Link>
      </nav>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Módulo {data.modulo.ordem}
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
