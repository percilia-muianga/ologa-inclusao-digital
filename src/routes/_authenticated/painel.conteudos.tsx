import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  estadoConteudosPreparados,
  importarConteudosPreparados,
  type EstadoPacote,
  type ResultadoImportacao,
} from "@/lib/conteudos-preparados.functions";

export const Route = createFileRoute("/_authenticated/painel/conteudos")({
  head: () => ({
    meta: [
      { title: "Conteúdos preparados — Área reservada Ologa" },
      {
        name: "description",
        content:
          "Verificação e importação dos conteúdos já preparados pela equipa: curso de Segurança Cibernética Avançada e banco de avaliação de Inteligência Artificial.",
      },
      { property: "og:title", content: "Conteúdos preparados — Área reservada Ologa" },
      {
        property: "og:description",
        content: "Importação controlada dos conteúdos preparados, exclusiva do Administrador Geral Ologa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConteudosPreparados,
});

const NOMES: Record<string, string> = {
  "seguranca-cibernetica": "Curso Segurança Cibernética Avançada (15 lições, ficha e horas)",
  "banco-inteligencia-artificial":
    "Banco de avaliação de Inteligência Artificial (80 de exame + 10 de diagnóstico, todas inactivas)",
};

function ConteudosPreparados() {
  const obter = useServerFn(estadoConteudosPreparados);
  const importar = useServerFn(importarConteudosPreparados);
  const queryClient = useQueryClient();
  const [resultados, setResultados] = useState<Record<string, ResultadoImportacao>>({});

  const estado = useQuery<EstadoPacote[]>({
    queryKey: ["conteudos-preparados"],
    queryFn: () => obter() as Promise<EstadoPacote[]>,
    staleTime: 0,
  });

  const mutacao = useMutation({
    mutationFn: (v: { pacote: string; hash: string }) =>
      importar({ data: v }) as Promise<ResultadoImportacao>,
    onSuccess: (res, v) => {
      setResultados((r) => ({ ...r, [v.pacote]: res }));
      queryClient.invalidateQueries({ queryKey: ["conteudos-preparados"] });
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-navy">Conteúdos preparados</h1>
        <p className="mt-2 max-w-3xl text-base text-navy-2">
          Aqui importa, para a plataforma, conteúdos já escritos e verificados pela equipa. Cada
          pacote é independente e é gravado tudo ou nada: se alguma coisa não bater certo, não fica
          nada gravado. Nenhuma questão é activada e nenhum exame é preparado por esta página.
        </p>
      </header>

      {estado.isLoading ? <p className="text-base text-navy-2">A verificar…</p> : null}
      {estado.isError ? (
        <p className="text-base text-navy-2">
          Não foi possível verificar. Esta página é exclusiva do perfil Administrador Geral Ologa.
        </p>
      ) : null}

      {((estado.data ?? []) as EstadoPacote[]).map((p) => {
        const res = resultados[p.pacote];
        const aDecorrer = mutacao.isPending && mutacao.variables?.pacote === p.pacote;
        return (
          <section key={p.pacote} className="rounded-lg border border-line bg-white p-6">
            <h2 className="text-lg font-extrabold text-navy">{NOMES[p.pacote] ?? p.pacote}</h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-base font-bold text-navy">O que está na plataforma</h3>
                <ul className="mt-2 space-y-1 text-base text-navy-2">
                  {Object.entries(p.resumo)
                    .filter(([k]) => k !== "hash" && k !== "licoes" && k !== "modulos" && k !== "curso")
                    .map(([k, v]) => (
                      <li key={k}>
                        {k.replaceAll("_", " ")}: <strong>{String(v)}</strong>
                      </li>
                    ))}
                  {"licoes" in p.resumo ? (
                    <li>
                      lições com conteúdo:{" "}
                      <strong>
                        {(p.resumo["licoes"] as { tem_conteudo: boolean }[] | undefined)?.filter(
                          (l) => l.tem_conteudo,
                        ).length ?? 0}
                      </strong>
                    </li>
                  ) : null}
                </ul>
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">O que o pacote traz</h3>
                <ul className="mt-2 space-y-1 text-base text-navy-2">
                  {Object.entries(p.previsto).map(([k, v]) => (
                    <li key={k}>
                      {k.replaceAll("_", " ")}:{" "}
                      <strong>{typeof v === "object" ? JSON.stringify(v) : String(v)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {p.erro ? (
              <p className="mt-4 rounded-md border border-line bg-page p-3 text-base text-navy">
                Não é possível importar agora: {p.erro}
              </p>
            ) : null}

            <button
              type="button"
              disabled={aDecorrer || !p.hash || !!p.erro}
              onClick={() => mutacao.mutate({ pacote: p.pacote, hash: p.hash })}
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-navy px-4 py-2 text-base font-semibold text-white disabled:opacity-50"
            >
              {aDecorrer ? "A importar…" : "Importar este pacote"}
            </button>

            {res ? (
              <p
                role="status"
                className="mt-4 rounded-md border border-line bg-page p-3 text-base text-navy"
              >
                {res.ok
                  ? `Importado. ${Object.entries(res.detalhe ?? {})
                      .filter(([k]) => k !== "pacote")
                      .map(([k, v]) => `${k.replaceAll("_", " ")}: ${String(v)}`)
                      .join("; ")}`
                  : res.erro}
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
