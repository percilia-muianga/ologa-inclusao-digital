import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef } from "react";
import { listarUtilizadores } from "@/lib/administracao.functions";
import { nomeDoPapel } from "@/lib/papeis";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";

export const Route = createFileRoute("/_authenticated/painel/utilizadores")({
  component: PaginaUtilizadores,
});

function PaginaUtilizadores() {
  const fn = useServerFn(listarUtilizadores);
  const ref = useRef<HTMLDivElement | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["utilizadores"],
    queryFn: () => fn(),
  });

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-navy">Utilizadores</h1>
        <ListenButton getFalas={() => extrairFalasDeElemento(ref.current)} />
      </div>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Lista de contas e papéis atribuídos. Os dados de identificação sensíveis só são
        visíveis ao próprio, ao administrador e ao auditor, e cada consulta feita nesta
        página fica registada no registo de actividade.
      </p>

      {isLoading ? <p className="mt-6 text-base text-navy-2">A carregar…</p> : null}
      {error ? (
        <p role="alert" className="mt-6 rounded-md border border-line bg-page p-4 text-base text-navy">
          Não foi possível carregar a lista. A sua conta pode não ter permissão para a ver.
        </p>
      ) : null}

      {data && data.length === 0 ? (
        <p className="mt-6 text-base text-navy-2">Ainda sem dados.</p>
      ) : null}

      {data && data.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-base">
            <caption className="sr-only">Lista de utilizadores da plataforma</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Nome</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Email</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Telefone</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Província</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Distrito</th>
                <th scope="col" className="py-2 pr-4 font-extrabold text-navy">Papéis</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-b border-line align-top">
                  <td className="py-2 pr-4 text-navy">
                    {u.nome}
                    {u.conta_de_teste ? (
                      <span className="ml-2 rounded bg-navy px-1.5 py-0.5 text-[11px] font-bold text-white">
                        TESTE
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-4 text-navy-2">{u.email}</td>
                  <td className="py-2 pr-4 text-navy-2">{u.telefone ?? "—"}</td>
                  <td className="py-2 pr-4 text-navy-2">{u.provincia ?? "—"}</td>
                  <td className="py-2 pr-4 text-navy-2">{u.distrito ?? "—"}</td>
                  <td className="py-2 pr-4 text-navy-2">
                    {u.papeis.length > 0 ? u.papeis.map(nomeDoPapel).join(", ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
