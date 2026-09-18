import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef } from "react";
import {
  obterRelatorioPermissoes,
  type PoliticaAcesso,
} from "@/lib/permissoes.functions";
import { PAPEIS, type PapelSistema } from "@/lib/papeis";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";

export const Route = createFileRoute("/_authenticated/painel/permissoes")({
  component: PaginaPermissoes,
});

const OPERACOES = ["SELECT", "INSERT", "UPDATE", "DELETE"] as const;
type Operacao = (typeof OPERACOES)[number];

const NOME_OPERACAO: Record<Operacao, string> = {
  SELECT: "Ver",
  INSERT: "Criar",
  UPDATE: "Alterar",
  DELETE: "Eliminar",
};

/** A condição da regra menciona este papel? Lido do texto real da regra em vigor. */
function condicaoCobrePapel(condicao: string, papel: PapelSistema): boolean {
  const c = condicao.toLowerCase();
  if (papel === "admin_atdi") {
    return c.includes("e_admin_atdi") || c.includes("'admin_atdi'");
  }
  if (papel === "auditor_atdi") {
    return c.includes("e_auditor_atdi") || c.includes("'auditor_atdi'");
  }
  return c.includes(`'${papel}'`);
}

/** Âmbito legível a partir da condição da regra. */
function ambitoDaCondicao(condicao: string): string {
  const c = condicao.toLowerCase();
  if (c.includes("auth.uid()") && (c.includes("id = auth.uid()") || c.includes("utilizador_id = auth.uid()"))) {
    return "só os próprios registos";
  }
  if (c === "true") return "tudo";
  return "tudo, conforme a regra";
}

type Celula = { permitido: boolean; ambito: string };

function calcular(
  politicas: PoliticaAcesso[],
  tabela: string,
  papel: PapelSistema,
  operacao: Operacao,
): Celula {
  const relevantes = politicas.filter(
    (p) =>
      p.tabela === tabela &&
      (p.operacao === "ALL" || p.operacao === operacao) &&
      (condicaoCobrePapel(p.condicao, papel) ||
        condicaoCobrePapel(p.condicao_escrita, papel) ||
        // regras do próprio utilizador aplicam-se a qualquer papel autenticado
        p.condicao.toLowerCase().includes("auth.uid()")),
  );
  if (relevantes.length === 0) return { permitido: false, ambito: "—" };

  const explicita = relevantes.find(
    (p) => condicaoCobrePapel(p.condicao, papel) || condicaoCobrePapel(p.condicao_escrita, papel),
  );
  const escolhida = explicita ?? relevantes[0];
  return { permitido: true, ambito: ambitoDaCondicao(escolhida.condicao) };
}

function PaginaPermissoes() {
  const fn = useServerFn(obterRelatorioPermissoes);
  const ref = useRef<HTMLDivElement | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["relatorio-permissoes"],
    queryFn: () => fn(),
  });

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-navy">Verificação de permissões</h1>
        <div className="flex items-center gap-2">
          <ListenButton getFalas={() => extrairFalasDeElemento(ref.current)} />
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-11 rounded-md border border-line px-4 py-2 text-base font-semibold text-navy hover:bg-page"
          >
            Imprimir ou guardar em PDF
          </button>
        </div>
      </div>

      <p className="mt-2 max-w-3xl text-base text-navy-2">
        O que cada papel consegue e não consegue ver, criar, alterar e eliminar. Esta matriz
        não é escrita à mão: é lida directamente das regras de acesso em vigor na base de
        dados, no momento em que abre a página. Serve de evidência do isolamento de dados.
      </p>
      {data ? (
        <p className="mt-2 text-base text-navy-2">
          Gerado em {new Date(data.geradoEm).toLocaleString("pt-PT", { timeZone: "Africa/Maputo" })}.
        </p>
      ) : null}

      {isLoading ? <p className="mt-6 text-base text-navy-2">A carregar…</p> : null}
      {error ? (
        <p role="alert" className="mt-6 rounded-md border border-line bg-page p-4 text-base text-navy">
          Não foi possível carregar o relatório. Só o administrador e o auditor lhe têm acesso.
        </p>
      ) : null}

      {data
        ? data.tabelas.map((t) => (
            <section key={t.tabela} className="mt-8">
              <h2 className="text-2xl font-extrabold text-navy">{t.tabela}</h2>
              <p className="mt-1 text-base text-navy-2">
                Protecção por regras de acesso:{" "}
                <strong>{t.rls_activa ? "activa" : "NÃO ACTIVA"}</strong> · {t.numero_politicas}{" "}
                {t.numero_politicas === 1 ? "regra" : "regras"}.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-base">
                  <caption className="sr-only">Permissões por papel na entidade {t.tabela}</caption>
                  <thead>
                    <tr className="border-b border-line">
                      <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Papel</th>
                      {OPERACOES.map((op) => (
                        <th key={op} scope="col" className="py-2 pr-4 font-extrabold text-navy">
                          {NOME_OPERACAO[op]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PAPEIS.map((p) => (
                      <tr key={p.valor} className="border-b border-line align-top">
                        <th scope="row" className="py-2 pr-4 font-semibold text-navy">{p.nome}</th>
                        {OPERACOES.map((op) => {
                          const c = calcular(data.politicas, t.tabela, p.valor, op);
                          return (
                            <td key={op} className="py-2 pr-4 text-navy-2">
                              {c.permitido ? `Sim — ${c.ambito}` : "Não"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        : null}

      {data && data.politicas.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold text-navy">Regras em vigor, texto integral</h2>
          <p className="mt-1 max-w-3xl text-base text-navy-2">
            Transcrição das regras tal como estão na base de dados, para conferência técnica.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <caption className="sr-only">Regras de acesso em vigor</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Entidade</th>
                  <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Regra</th>
                  <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Operação</th>
                  <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Condição</th>
                </tr>
              </thead>
              <tbody>
                {data.politicas.map((p) => (
                  <tr key={`${p.tabela}-${p.politica}`} className="border-b border-line align-top">
                    <td className="py-2 pr-4 text-navy-2">{p.tabela}</td>
                    <td className="py-2 pr-4 text-navy-2">{p.politica}</td>
                    <td className="py-2 pr-4 text-navy-2">{p.operacao}</td>
                    <td className="py-2 pr-4 font-mono text-[12px] text-navy-2">
                      {p.condicao || p.condicao_escrita || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
