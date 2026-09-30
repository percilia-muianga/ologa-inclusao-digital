import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listarTurmasDiscussao } from "@/lib/discussao.functions";

export const Route = createFileRoute("/_authenticated/painel/discussao/")({
  head: () => ({
    meta: [
      { title: "Discussão das turmas — Área reservada" },
      { name: "description", content: "Dúvidas e respostas pedagógicas de cada turma em que participa." },
      { property: "og:title", content: "Discussão das turmas" },
      { property: "og:description", content: "Dúvidas dos formandos e respostas do formador, por turma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ListaDiscussao,
});

const PAPEL = { formando: "Formando(a)", formador: "Formador(a) responsável", moderacao: "Moderação" } as const;

function ListaDiscussao() {
  const f = useServerFn(listarTurmasDiscussao);
  const q = useQuery({ queryKey: ["discussao-turmas"], queryFn: () => f() });
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-navy">Discussão das turmas</h1>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Coloque dúvidas sobre as matérias do curso e acompanhe as respostas do formador. Só as pessoas da mesma turma,
        o formador responsável e a coordenação do programa vêem estas mensagens. Para problemas de acesso ou técnicos, use{" "}
        <Link to="/ajuda" className="font-semibold underline">Ajuda</Link>.
      </p>
      {q.isLoading ? <p className="mt-6 text-base text-navy-2" role="status">A carregar…</p>
        : q.isError ? <p role="alert" className="mt-6 font-semibold text-brand">Não foi possível ler as suas turmas.</p>
        : (q.data ?? []).length === 0 ? (
          <div className="mt-6 rounded-lg border border-line bg-page p-5">
            <h2 className="text-lg font-extrabold text-navy">Ainda não participa em nenhuma turma</h2>
            <p className="mt-2 text-base text-navy-2">
              A discussão fica disponível depois de se inscrever numa turma, ou quando for indicado(a) como formador(a) responsável.{" "}
              <Link to="/painel/minhas-turmas" className="font-semibold underline">Inscrever-me com um código</Link>.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {q.data!.map((t) => (
              <li key={t.turmaId} className="rounded-lg border border-line bg-white p-5">
                <h2 className="text-lg font-extrabold text-navy">
                  <Link to="/painel/discussao/$turma" params={{ turma: t.turmaId }} className="underline">
                    {t.curso} — {t.designacao}
                  </Link>
                </h2>
                <p className="text-base text-navy-2">{t.distrito}, {t.provincia} · {PAPEL[t.papel]}</p>
                <p className="mt-2 text-base text-navy">
                  {t.total} {t.total === 1 ? "dúvida" : "dúvidas"} · {t.semResposta} sem resposta
                  {t.minhasPorResolver > 0 ? ` · ${t.minhasPorResolver} minhas por resolver` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
