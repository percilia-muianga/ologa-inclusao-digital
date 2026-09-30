import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { obterRelatorioParticipacao } from "@/lib/relatorio-participacao.functions";

export const Route = createFileRoute("/_authenticated/painel/participacao")({
  head: () => ({
    meta: [
      { title: "Relatório de participação por formando — Plataforma Nacional" },
      { name: "description", content: "Nome de cada formando e conclusão das aulas, exportável em CSV e XLS." },
      { property: "og:title", content: "Relatório de participação por formando" },
      { property: "og:description", content: "Conclusão das aulas por formando, com exportação CSV e XLS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RelatorioParticipacao,
});

const CAB = ["Nome", "Curso", "Turma", "Província", "Distrito", "Estado da inscrição", "Aulas concluídas", "Aulas do curso", "Conclusão (%)", "Última aula concluída"];

function descarregar(conteudo: BlobPart, tipo: string, nome: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}
const celula = (v: string | number) => {
  const t = String(v);
  return /[";\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

function RelatorioParticipacao() {
  const f = useServerFn(obterRelatorioParticipacao);
  const q = useQuery({ queryKey: ["relatorio-participacao"], queryFn: () => f() });
  const linhas = (q.data ?? []).map((l) => [
    l.nome, l.curso, l.turma, l.provincia, l.distrito, l.estadoInscricao,
    l.aulasConcluidas, l.aulasTotal, l.conclusaoPct ?? "—",
    l.ultimaConclusao ? new Date(l.ultimaConclusao).toLocaleDateString("pt-MZ") : "—",
  ]);

  function csv() {
    const txt = `\uFEFF${[CAB, ...linhas].map((r) => r.map(celula).join(";")).join("\r\n")}`;
    descarregar(txt, "text/csv;charset=utf-8", "participacao-por-formando.csv");
  }
  async function xls() {
    const XLSX = await import("xlsx");
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, XLSX.utils.aoa_to_sheet([CAB, ...linhas]), "Participação");
    XLSX.writeFile(livro, "participacao-por-formando.xls", { bookType: "biff8" });
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-navy">Relatório de participação por formando</h1>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Nome de cada formando inscrito e quantas aulas do curso já concluiu. Só aparecem as inscrições
        que a sua conta pode consultar.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" size="lg" className="min-h-11" onClick={csv} disabled={!q.data}>
          <Download aria-hidden="true" /> Exportar CSV
        </Button>
        <Button type="button" size="lg" variant="outline" className="min-h-11" onClick={() => void xls()} disabled={!q.data}>
          <Download aria-hidden="true" /> Exportar XLS
        </Button>
      </div>
      {q.isLoading ? <p className="mt-6 text-base text-navy-2">A carregar…</p> : null}
      {q.isError ? (
        <p role="alert" className="mt-6 text-base font-semibold text-brand">
          Não foi possível carregar o relatório. Esta área é da equipa de formação e da administração.
        </p>
      ) : null}
      {q.data && q.data.length === 0 ? (
        <p className="mt-6 text-base text-navy-2">
          Ainda não há formandos inscritos em turmas. Quando houver inscrições, aparecem aqui; a exportação sai só com os títulos das colunas.
        </p>
      ) : null}
      {q.data && q.data.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-md border border-line">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">Participação por formando</caption>
            <thead className="bg-page text-navy">
              <tr>{CAB.map((h) => <th key={h} scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody>
              {linhas.map((r, i) => (
                <tr key={q.data[i].inscricaoId} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-navy">{r[0]}</th>
                  {r.slice(1).map((v, k) => <td key={k} className="px-3 py-2 text-navy-2">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
