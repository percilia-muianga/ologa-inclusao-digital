import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { obterRelatorioParticipacao } from "@/lib/relatorio-participacao.functions";
import { CAB_DETALHE, CAB_RESUMO, linhasDetalhe, linhasResumo, paraCsv } from "@/lib/participacao";

export const Route = createFileRoute("/_authenticated/painel/participacao")({
  head: () => ({
    meta: [
      { title: "Relatório de participação por formando — Plataforma Nacional" },
      { name: "description", content: "Resumo e detalhe por lição da conclusão das aulas, exportável em CSV e XLS." },
      { property: "og:title", content: "Relatório de participação por formando" },
      { property: "og:description", content: "Conclusão das aulas por formando e por lição, com exportação CSV e XLS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RelatorioParticipacao,
});

function descarregar(conteudo: BlobPart, tipo: string, nome: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

function Tabela({ titulo, cab, linhas, chaves }: { titulo: string; cab: string[]; linhas: (string | number)[][]; chaves: string[] }) {
  return (
    <div className="mt-4 max-h-[36rem] overflow-auto rounded-md border border-line">
      <table className="min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">{titulo}</caption>
        <thead className="sticky top-0 bg-page text-navy">
          <tr>{cab.map((h) => <th key={h} scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">{h}</th>)}</tr>
        </thead>
        <tbody>
          {linhas.map((r, i) => (
            <tr key={chaves[i]} className="border-t border-line">
              <th scope="row" className="px-3 py-2 text-left font-semibold text-navy">{r[0]}</th>
              {r.slice(1).map((v, k) => <td key={k} className="px-3 py-2 text-navy-2">{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatorioParticipacao() {
  const f = useServerFn(obterRelatorioParticipacao);
  const q = useQuery({ queryKey: ["relatorio-participacao"], queryFn: () => f() });
  const resumo = linhasResumo(q.data?.resumo ?? []);
  const detalhe = linhasDetalhe(q.data?.detalhe ?? []);

  function csvResumo() {
    descarregar(paraCsv(CAB_RESUMO, resumo), "text/csv;charset=utf-8", "participacao-resumo.csv");
  }
  function csvDetalhe() {
    descarregar(paraCsv(CAB_DETALHE, detalhe), "text/csv;charset=utf-8", "participacao-detalhe-por-licao.csv");
  }
  async function xls() {
    const XLSX = await import("xlsx");
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, XLSX.utils.aoa_to_sheet([CAB_RESUMO, ...resumo]), "Resumo");
    XLSX.utils.book_append_sheet(livro, XLSX.utils.aoa_to_sheet([CAB_DETALHE, ...detalhe]), "Detalhe por lição");
    XLSX.writeFile(livro, "participacao-por-formando.xls", { bookType: "biff8" });
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-navy">Relatório de participação por formando</h1>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Resumo por formando e detalhe de cada lição do curso, com estado e data e hora de conclusão.
        Só aparecem as inscrições que a sua conta pode consultar.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" size="lg" className="min-h-11" onClick={csvResumo} disabled={!q.data}>
          <Download aria-hidden="true" /> CSV — resumo
        </Button>
        <Button type="button" size="lg" className="min-h-11" onClick={csvDetalhe} disabled={!q.data}>
          <Download aria-hidden="true" /> CSV — detalhe por lição
        </Button>
        <Button type="button" size="lg" variant="outline" className="min-h-11" onClick={() => void xls()} disabled={!q.data}>
          <Download aria-hidden="true" /> XLS — resumo e detalhe
        </Button>
      </div>
      {q.isLoading ? <p className="mt-6 text-base text-navy-2">A carregar…</p> : null}
      {q.isError ? (
        <p role="alert" className="mt-6 text-base font-semibold text-brand">
          Não foi possível carregar o relatório. Esta área é da equipa de formação e da administração.
        </p>
      ) : null}
      {q.data && q.data.resumo.length === 0 ? (
        <p className="mt-6 text-base text-navy-2">
          Ainda não há formandos inscritos em turmas. Quando houver inscrições, aparecem aqui; a exportação sai só com os títulos das colunas.
        </p>
      ) : null}
      {q.data && q.data.resumo.length > 0 ? (
        <>
          <h2 className="mt-8 text-xl font-bold text-navy">Resumo</h2>
          <Tabela titulo="Resumo por formando" cab={CAB_RESUMO} linhas={resumo} chaves={q.data.resumo.map((l) => l.inscricaoId)} />
          <h2 className="mt-8 text-xl font-bold text-navy">Detalhe por módulo e lição</h2>
          <Tabela
            titulo="Detalhe por formando, módulo e lição"
            cab={CAB_DETALHE}
            linhas={detalhe}
            chaves={q.data.detalhe.map((l, i) => `${l.inscricaoId}-${i}`)}
          />
        </>
      ) : null}
    </div>
  );
}
