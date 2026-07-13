import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { listarInstituicoesAdmin } from "@/lib/instituicoes.functions";
import {
  NATUREZA_OPCOES,
  PROVINCIAS,
  SETOR_OPCOES,
  MEIO_OPCOES,
  MODALIDADE_OPCOES,
  CONECTIVIDADE_OPCOES,
  rotulo,
} from "@/lib/inscricao-schema";

export const Route = createFileRoute("/ologa/")({
  head: () => ({ meta: [{ title: "Ologa — Administração" }] }),
  component: OlogaPage,
});

type LinhaInstituicao = {
  id: string;
  nome: string;
  natureza: string;
  setor: string | null;
  provincia: string | null;
  distrito: string | null;
  meio: string | null;
  conectividade: string | null;
  modalidade: string | null;
  num_colaboradores_total: number;
  codigo_inscricao: string;
  criado_em: string;
};

function OlogaPage() {
  const guard = useAdminGuard();
  const listar = useServerFn(listarInstituicoesAdmin);
  const [instituicoes, setInstituicoes] = useState<LinhaInstituicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroProvincia, setFiltroProvincia] = useState("");

  useEffect(() => {
    if (guard.estado !== "ok") return;
    let cancelado = false;
    listar().then((res) => {
      if (cancelado) return;
      if (res.ok) setInstituicoes(res.instituicoes as LinhaInstituicao[]);
      else setErro(res.mensagem || "Erro ao carregar.");
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [guard.estado, listar]);

  const filtradas = useMemo(() => {
    const q = pesquisa.trim().toLowerCase();
    return instituicoes.filter((i) => {
      const okNome = q === "" || i.nome.toLowerCase().includes(q);
      const okProv = filtroProvincia === "" || i.provincia === filtroProvincia;
      return okNome && okProv;
    });
  }, [instituicoes, pesquisa, filtroProvincia]);

  if (guard.estado === "a_verificar") {
    return (
      <main id="conteudo" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p role="status" aria-live="polite" className="text-base text-foreground">
          A verificar acesso…
        </p>
      </main>
    );
  }
  if (guard.estado !== "ok") return null;

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <main id="conteudo" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-ink">Ologa — Instituições</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/formacao"
              className="inline-flex min-h-11 items-center rounded-md border border-ink/20 px-4 text-base font-semibold text-ink"
            >
              Ver cursos
            </Link>
            <Link
              to="/ologa/nova-instituicao"
              className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground"
            >
              Criar instituição manualmente
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div>
            <label htmlFor="pesquisa" className="block text-base font-semibold text-ink">
              Pesquisar por nome
            </label>
            <input
              id="pesquisa"
              type="search"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor="filtro-provincia" className="block text-base font-semibold text-ink">
              Filtrar por província
            </label>
            <select
              id="filtro-provincia"
              value={filtroProvincia}
              onChange={(e) => setFiltroProvincia(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="">Todas as províncias</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8">
          {carregando ? (
            <p role="status" aria-live="polite" className="text-base text-foreground">
              A carregar instituições…
            </p>
          ) : erro ? (
            <p role="alert" className="rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
              {erro}
            </p>
          ) : filtradas.length === 0 ? (
            <p className="text-base text-foreground">
              {instituicoes.length === 0
                ? "Ainda não existem instituições inscritas."
                : "Nenhuma instituição corresponde aos filtros."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-ink/10">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-accent text-ink">
                  <tr>
                    <Th>Nome</Th>
                    <Th>Natureza</Th>
                    <Th>Setor</Th>
                    <Th>Província</Th>
                    <Th>Distrito</Th>
                    <Th>Meio</Th>
                    <Th>Conectividade</Th>
                    <Th>Modalidade</Th>
                    <Th className="text-right">Nº colab.</Th>
                    <Th>Inscrita em</Th>
                    <Th>Código</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((i) => (
                    <tr key={i.id} className="border-t border-ink/10 hover:bg-accent/60">
                      <Td>
                        <Link
                          to="/ologa/instituicoes/$id"
                          params={{ id: i.id }}
                          className="font-semibold text-ink underline"
                        >
                          {i.nome}
                        </Link>
                      </Td>
                      <Td>{rotulo(NATUREZA_OPCOES, i.natureza)}</Td>
                      <Td>{rotulo(SETOR_OPCOES, i.setor)}</Td>
                      <Td>{i.provincia ?? "—"}</Td>
                      <Td>{i.distrito ?? "—"}</Td>
                      <Td>{rotulo(MEIO_OPCOES, i.meio)}</Td>
                      <Td>{rotulo(CONECTIVIDADE_OPCOES, i.conectividade)}</Td>
                      <Td>{rotulo(MODALIDADE_OPCOES, i.modalidade)}</Td>
                      <Td className="text-right">{i.num_colaboradores_total}</Td>
                      <Td>{new Date(i.criado_em).toLocaleDateString("pt-PT")}</Td>
                      <Td>
                        <span className="font-mono font-bold tracking-widest text-ink">
                          {i.codigo_inscricao}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2 text-xs font-bold uppercase tracking-wide ${className ?? ""}`}>
      {children}
    </th>
  );
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 align-top text-ink ${className ?? ""}`}>{children}</td>;
}
