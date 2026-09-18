import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef } from "react";
import { listarRegistoAuditoria, listarAcessosSensiveis } from "@/lib/administracao.functions";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";

export const Route = createFileRoute("/_authenticated/painel/auditoria")({
  component: PaginaAuditoria,
});

const ACCOES: Record<string, string> = {
  insert: "Criação",
  update: "Alteração",
  delete: "Eliminação",
};

function dataHora(v: string) {
  return new Date(v).toLocaleString("pt-PT", { timeZone: "Africa/Maputo" });
}

function PaginaAuditoria() {
  const fnAud = useServerFn(listarRegistoAuditoria);
  const fnSens = useServerFn(listarAcessosSensiveis);
  const ref = useRef<HTMLDivElement | null>(null);

  const auditoria = useQuery({ queryKey: ["auditoria"], queryFn: () => fnAud() });
  const acessos = useQuery({ queryKey: ["acessos-sensiveis"], queryFn: () => fnSens() });

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-navy">Registo de actividade</h1>
        <ListenButton getFalas={() => extrairFalasDeElemento(ref.current)} />
      </div>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Todas as criações, alterações e eliminações de dados, com utilizador, acção, entidade
        afectada, valor anterior, valor novo, data e hora e endereço de rede. O registo é
        imutável: ninguém o pode alterar nem apagar. O tipo de deficiência é dado sensível de
        saúde — regista-se apenas que houve alteração, nunca o seu conteúdo.
      </p>

      <h2 className="mt-8 text-2xl font-extrabold text-navy">Alterações de dados</h2>
      {auditoria.isLoading ? <p className="mt-3 text-base text-navy-2">A carregar…</p> : null}
      {auditoria.data && auditoria.data.length === 0 ? (
        <p className="mt-3 text-base text-navy-2">Ainda sem dados.</p>
      ) : null}
      {auditoria.data && auditoria.data.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-base">
            <caption className="sr-only">Registo de alterações de dados</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Data e hora</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Acção</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Entidade</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Registo</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Utilizador</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Endereço</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Campos sensíveis</th>
              </tr>
            </thead>
            <tbody>
              {auditoria.data.map((r: any) => (
                <tr key={r.id} className="border-b border-line align-top">
                  <td className="py-2 pr-4 text-navy-2">{dataHora(r.ocorrido_em)}</td>
                  <td className="py-2 pr-4 text-navy">{ACCOES[r.accao] ?? r.accao}</td>
                  <td className="py-2 pr-4 text-navy-2">{r.entidade}</td>
                  <td className="py-2 pr-4 text-navy-2">{r.registo_id ?? "—"}</td>
                  <td className="py-2 pr-4 text-navy-2">{r.utilizador_id ?? "—"}</td>
                  <td className="py-2 pr-4 text-navy-2">{r.endereco_ip ?? "—"}</td>
                  <td className="py-2 pr-4 text-navy-2">
                    {r.campos_sensiveis_alterados
                      ? `${r.campos_sensiveis_alterados.join(", ")} (alterado, conteúdo não registado)`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <h2 className="mt-10 text-2xl font-extrabold text-navy">
        Consultas a dados sensíveis
      </h2>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Quem audita também é auditado: cada consulta a campos sensíveis feita por
        administrador ou auditor fica aqui registada.
      </p>
      {acessos.isLoading ? <p className="mt-3 text-base text-navy-2">A carregar…</p> : null}
      {acessos.data && acessos.data.length === 0 ? (
        <p className="mt-3 text-base text-navy-2">Ainda sem dados.</p>
      ) : null}
      {acessos.data && acessos.data.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-base">
            <caption className="sr-only">Registo de consultas a dados sensíveis</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Data e hora</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Quem consultou</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Perfil consultado</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Campos</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Contexto</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Endereço</th>
              </tr>
            </thead>
            <tbody>
              {acessos.data.map((r: any) => (
                <tr key={r.id} className="border-b border-line align-top">
                  <td className="py-2 pr-4 text-navy-2">{dataHora(r.ocorrido_em)}</td>
                  <td className="py-2 pr-4 text-navy-2">{r.consultado_por ?? "—"}</td>
                  <td className="py-2 pr-4 text-navy-2">{r.perfil_consultado ?? "Todos"}</td>
                  <td className="py-2 pr-4 text-navy-2">{(r.campos ?? []).join(", ")}</td>
                  <td className="py-2 pr-4 text-navy-2">{r.contexto ?? "—"}</td>
                  <td className="py-2 pr-4 text-navy-2">{r.endereco_ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
