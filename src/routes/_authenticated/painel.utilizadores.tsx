import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { listarUtilizadores } from "@/lib/administracao.functions";
import {
  prepararPerfilDeConta,
  definirPerfilDeConta,
  PERFIS_ATRIBUIVEIS,
  RESUMO_PERFIL,
  type PreparacaoPerfil,
} from "@/lib/perfis-admin.functions";
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

      <FichaDeConta />

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

const MENSAGENS: Record<string, string> = {
  SEM_SESSAO: "É preciso entrar com a sua conta.",
  SEM_PERMISSAO_ADMIN_GERAL:
    "Esta acção é reservada ao Administrador Geral Ologa. A sua conta não tem esse perfil.",
  EMAIL_INVALIDO: "Indique um endereço de email válido.",
  CONTA_INEXISTENTE: "Não existe nenhuma conta de acesso com esse email.",
  EMAIL_AMBIGUO: "Há mais do que uma conta com esse email. Verifique antes de continuar.",
  EMAIL_NAO_CONFIRMADO: "Essa conta ainda não confirmou o email.",
  PERFIL_NAO_PERMITIDO: "Esse perfil não pode ser atribuído por aqui.",
  CONTA_NAO_RESOLVIDA: "Não foi possível consultar as contas de acesso neste momento.",
};

function mensagem(erro: unknown): string {
  const t = erro instanceof Error ? erro.message : String(erro);
  return MENSAGENS[t] ?? "Não foi possível concluir. Tente novamente.";
}

/**
 * Ficha de uma conta que já existe: consultar primeiro, confirmar depois.
 * A consulta não altera nada. A gravação só acontece no segundo botão.
 */
function FichaDeConta() {
  const preparar = useServerFn(prepararPerfilDeConta);
  const definir = useServerFn(definirPerfilDeConta);
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<string>("admin_ologa");
  const [nome, setNome] = useState("");
  const [previsao, setPrevisao] = useState<PreparacaoPerfil | null>(null);

  const consulta = useMutation({
    mutationFn: () => preparar({ data: { email, papel, nome } }),
    onSuccess: (r) => setPrevisao(r as PreparacaoPerfil),
    onError: () => setPrevisao(null),
  });

  const gravacao = useMutation({
    mutationFn: () => definir({ data: { email, papel, nome } }),
    onSuccess: () => {
      setPrevisao(null);
      queryClient.invalidateQueries({ queryKey: ["utilizadores"] });
    },
  });

  return (
    <section className="mt-8 rounded-lg border border-line bg-white p-5">
      <h2 className="text-xl font-extrabold text-navy">Ficha de uma conta já existente</h2>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Cria ou completa a ficha de uma pessoa que já tem conta de acesso. Não cria contas
        novas, não define palavras-passe e não atribui papéis. Primeiro consulta-se, depois
        confirma-se.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="ficha-email" className="text-sm font-semibold text-navy">
            Email da conta
          </label>
          <input
            id="ficha-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setPrevisao(null);
            }}
            className="mt-1 min-h-11 w-full rounded-md border border-line px-3 py-2 text-base text-navy"
          />
        </div>
        <div>
          <label htmlFor="ficha-papel" className="text-sm font-semibold text-navy">
            Perfil a atribuir
          </label>
          <select
            id="ficha-papel"
            value={papel}
            onChange={(e) => {
              setPapel(e.target.value);
              setPrevisao(null);
            }}
            className="mt-1 min-h-11 w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy"
          >
            {PERFIS_ATRIBUIVEIS.map((p) => (
              <option key={p} value={p}>
                {RESUMO_PERFIL[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ficha-nome" className="text-sm font-semibold text-navy">
            Nome (só se a conta não tiver)
          </label>
          <input
            id="ficha-nome"
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setPrevisao(null);
            }}
            className="mt-1 min-h-11 w-full rounded-md border border-line px-3 py-2 text-base text-navy"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={!email || consulta.isPending}
        onClick={() => consulta.mutate()}
        className="mt-4 min-h-11 rounded-md border border-line px-4 py-2 text-base font-semibold text-navy hover:bg-page disabled:opacity-50"
      >
        {consulta.isPending ? "A consultar…" : "Consultar conta"}
      </button>

      {consulta.error ? (
        <p role="alert" className="mt-4 rounded-md border border-line bg-page p-4 text-base text-navy">
          {mensagem(consulta.error)}
        </p>
      ) : null}

      {previsao ? (
        <div className="mt-4 rounded-md border border-line bg-page p-4">
          <h3 className="text-lg font-extrabold text-navy">Confirmação</h3>
          <p className="mt-2 text-base text-navy-2">{previsao.resumo}</p>
          <dl className="mt-3 grid gap-2 text-base sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-navy">Antes</dt>
              <dd className="text-navy-2">
                {previsao.perfilActual
                  ? `${previsao.perfilActual.nome} — ${previsao.perfilActual.papel}`
                  : "Sem ficha nenhuma."}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Depois</dt>
              <dd className="text-navy-2">
                {previsao.perfilProposto.nome} — {previsao.perfilProposto.papel}
              </dd>
            </div>
          </dl>
          {previsao.operacao === "sem_alteracao" ? (
            <p className="mt-3 text-base text-navy-2">
              Já tem este perfil. Nada será alterado.
            </p>
          ) : (
            <button
              type="button"
              disabled={gravacao.isPending}
              onClick={() => gravacao.mutate()}
              className="mt-4 min-h-11 rounded-md bg-navy px-4 py-2 text-base font-semibold text-white disabled:opacity-50"
            >
              {gravacao.isPending ? "A gravar…" : "Confirmar e gravar a ficha"}
            </button>
          )}
        </div>
      ) : null}

      {gravacao.error ? (
        <p role="alert" className="mt-4 rounded-md border border-line bg-page p-4 text-base text-navy">
          {mensagem(gravacao.error)}
        </p>
      ) : null}
      {gravacao.isSuccess ? (
        <p className="mt-4 rounded-md border border-line bg-page p-4 text-base text-navy">
          Ficha gravada.
        </p>
      ) : null}
    </section>
  );
}
