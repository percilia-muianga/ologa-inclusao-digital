import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState, useId } from "react";
import {
  criarContasDeTeste,
  removerContasDeTeste,
  atribuirTodosOsPapeis,
  type ContaDeTesteCriada,
} from "@/lib/administracao.functions";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";

export const Route = createFileRoute("/_authenticated/painel/equipa")({
  component: PaginaEquipa,
});

function descarregarFolha(contas: ContaDeTesteCriada[]) {
  const linhas = [
    "Papel;Email;Palavra-passe;Estado",
    ...contas.map(
      (c) =>
        `${c.nomeDoPapel};${c.email};${c.palavraPasse || "(já existia — palavra-passe não alterada)"};${
          c.estado === "criada" ? "Criada agora" : "Já existia"
        }`,
    ),
  ];
  const blob = new Blob(["\uFEFF" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contas-de-teste-ologa.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function PaginaEquipa() {
  const ref = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const dominioId = useId();
  const emailId = useId();

  const [dominio, setDominio] = useState("");
  const [emailDemo, setEmailDemo] = useState("");
  const [contas, setContas] = useState<ContaDeTesteCriada[] | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const fnCriar = useServerFn(criarContasDeTeste);
  const fnRemover = useServerFn(removerContasDeTeste);
  const fnPapeis = useServerFn(atribuirTodosOsPapeis);

  const criar = useMutation({
    mutationFn: (d: string) => fnCriar({ data: { dominio: d } }),
    onSuccess: (res) => {
      setContas(res);
      setAviso(null);
      descarregarFolha(res);
      queryClient.invalidateQueries({ queryKey: ["utilizadores"] });
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const remover = useMutation({
    mutationFn: () => fnRemover(),
    onSuccess: (res) => {
      setContas(null);
      setAviso(`Removidas ${res.removidas} contas de teste.`);
      queryClient.invalidateQueries({ queryKey: ["utilizadores"] });
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const papeis = useMutation({
    mutationFn: (email: string) => fnPapeis({ data: { email } }),
    onSuccess: (res) => {
      setAviso(`Os seis papéis foram atribuídos à conta de ${res.nome}.`);
      queryClient.invalidateQueries({ queryKey: ["utilizadores"] });
      queryClient.invalidateQueries({ queryKey: ["sessao"] });
    },
    onError: (e: Error) => setAviso(e.message),
  });

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-navy">Contas de demonstração e de teste</h1>
        <ListenButton getFalas={() => extrairFalasDeElemento(ref.current)} />
      </div>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Estas contas destinam-se à demonstração ao cliente e à validação do isolamento de
        permissões pela equipa de IT. Ficam marcadas como TESTE, são excluídas dos
        indicadores e relatórios, e podem ser todas removidas num só comando antes da
        entrega à ATDI.
      </p>

      {aviso ? (
        <p role="status" className="mt-4 rounded-md border border-line bg-page p-4 text-base text-navy">
          {aviso}
        </p>
      ) : null}

      <section className="mt-8 rounded-lg border border-line bg-white p-5">
        <h2 className="text-2xl font-extrabold text-navy">Conta de demonstração</h2>
        <p className="mt-2 max-w-3xl text-base text-navy-2">
          Atribui os seis papéis a uma conta já existente. Depois de entrar, essa conta passa
          a ter no topo um selector para alternar entre áreas sem terminar a sessão.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <label htmlFor={emailId} className="block text-base font-semibold text-navy">
              Email da conta de demonstração
            </label>
            <input
              id={emailId}
              type="email"
              value={emailDemo}
              onChange={(e) => setEmailDemo(e.target.value)}
              className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy"
            />
          </div>
          <button
            type="button"
            disabled={!emailDemo || papeis.isPending}
            onClick={() => papeis.mutate(emailDemo)}
            className="min-h-12 rounded-md bg-navy px-5 py-3 text-base font-semibold text-white disabled:opacity-60"
          >
            {papeis.isPending ? "A atribuir…" : "Atribuir os seis papéis"}
          </button>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-line bg-white p-5">
        <h2 className="text-2xl font-extrabold text-navy">Seis contas de teste</h2>
        <p className="mt-2 max-w-3xl text-base text-navy-2">
          Uma conta por papel, no domínio que indicar. As palavras-passe são geradas agora e
          mostradas uma única vez: ao criar, é descarregada automaticamente uma folha com os
          acessos. Guarde-a em lugar seguro.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <label htmlFor={dominioId} className="block text-base font-semibold text-navy">
              Domínio das contas de teste
            </label>
            <input
              id={dominioId}
              type="text"
              placeholder="ologa.co.mz"
              value={dominio}
              onChange={(e) => setDominio(e.target.value)}
              className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy"
            />
          </div>
          <button
            type="button"
            disabled={!dominio || criar.isPending}
            onClick={() => criar.mutate(dominio)}
            className="min-h-12 rounded-md bg-navy px-5 py-3 text-base font-semibold text-white disabled:opacity-60"
          >
            {criar.isPending ? "A criar…" : "Criar as seis contas de teste"}
          </button>
        </div>

        {contas ? (
          <div className="mt-5">
            <h3 className="text-lg font-extrabold text-navy">Contas criadas</h3>
            <ul className="mt-2 list-disc pl-5 text-base text-navy-2">
              {contas.map((c) => (
                <li key={c.email}>
                  {c.nomeDoPapel}: {c.email} —{" "}
                  {c.estado === "criada" ? "criada agora" : "já existia, não alterada"}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-base text-navy-2">
              As palavras-passe estão apenas na folha descarregada.
            </p>
            <button
              type="button"
              onClick={() => descarregarFolha(contas)}
              className="mt-3 min-h-11 rounded-md border border-line px-4 py-2 text-base font-semibold text-navy hover:bg-page"
            >
              Voltar a descarregar a folha
            </button>
          </div>
        ) : null}
      </section>

      <section className="mt-8 rounded-lg border border-line bg-page p-5">
        <h2 className="text-2xl font-extrabold text-navy">Remoção antes da entrega</h2>
        <p className="mt-2 max-w-3xl text-base text-navy-2">
          Remove todas as contas marcadas como TESTE e os respectivos papéis. A remoção fica
          registada no registo de actividade.
        </p>
        <button
          type="button"
          disabled={remover.isPending}
          onClick={() => {
            if (confirm("Remover todas as contas de teste? Esta acção não pode ser anulada.")) {
              remover.mutate();
            }
          }}
          className="mt-4 min-h-12 rounded-md border-2 border-navy px-5 py-3 text-base font-semibold text-navy disabled:opacity-60"
        >
          {remover.isPending ? "A remover…" : "Remover todas as contas de teste"}
        </button>
      </section>
    </div>
  );
}
