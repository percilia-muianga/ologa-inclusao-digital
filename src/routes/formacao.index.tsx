import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listarModulos } from "@/lib/formacao.functions";

const modulosQuery = queryOptions({
  queryKey: ["formacao", "modulos"],
  queryFn: () => listarModulos(),
});

export const Route = createFileRoute("/formacao/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(modulosQuery),
  head: () => ({
    meta: [
      { title: "Cursos — Ologa Literacia Digital" },
      {
        name: "description",
        content:
          "Cursos de literacia digital abertos, sem inscrição obrigatória. O certificado só é emitido quando o formando quiser.",
      },
    ],
  }),
  component: ListaModulos,
});

const NIVEL_ETIQUETA: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermédio",
  avancado: "Avançado",
};

function ListaModulos() {
  const { data: modulos } = useSuspenseQuery(modulosQuery);

  return (
    <section className="wrap py-10">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">Cursos</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Abra qualquer curso sem se registar. O seu progresso guarda-se neste dispositivo.
          Quando quiser guardar um certificado (ou associar-se à sua instituição), cria-se
          um link pessoal no fim do curso.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos?.map((m) => (
          <li key={m.id}>
            <Link
              to="/formacao/$modulo"
              params={{ modulo: m.id }}
              className="card-elevated block h-full rounded-xl border border-line p-5 transition hover:border-brand"
            >
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Módulo {m.ordem}</span>
                <span aria-hidden>·</span>
                <span>{NIVEL_ETIQUETA[m.nivel] ?? m.nivel}</span>
                {m.duracao ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{m.duracao}</span>
                  </>
                ) : null}
              </div>
              <h2 className="text-lg font-bold text-navy">{m.titulo}</h2>
              {m.descricao ? (
                <p className="mt-2 text-sm text-muted-foreground">{m.descricao}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
