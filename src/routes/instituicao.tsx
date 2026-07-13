import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { useGestorGuard } from "@/hooks/use-gestor-guard";
import {
  listarColaboradoresGestor,
  obterMinhaInstituicaoGestor,
  regenerarLinkPasswordColaborador,
} from "@/lib/colaboradores.functions";
import { ImportColaboradoresDialog } from "@/components/import-colaboradores-dialog";

export const Route = createFileRoute("/instituicao")({
  head: () => ({ meta: [{ title: "A minha instituição — Ologa" }] }),
  component: InstituicaoPage,
});

type EstadoConvite = "por_usar" | "usado" | "expirado" | "sem_convite";

type Colaborador = {
  id: string;
  nome: string;
  email: string;
  funcao: string | null;
  conta_ativada: boolean;
  ultimo_acesso: string | null;
  estado_convite: EstadoConvite;
};


type Instituicao = { id: string; nome: string; codigo_inscricao: string };

function InstituicaoPage() {
  const guard = useGestorGuard();
  const obterInst = useServerFn(obterMinhaInstituicaoGestor);
  const listar = useServerFn(listarColaboradoresGestor);
  const regenerar = useServerFn(regenerarLinkPasswordColaborador);

  const [inst, setInst] = useState<Instituicao | null>(null);
  const [colabs, setColabs] = useState<Colaborador[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [importAberto, setImportAberto] = useState(false);
  const [linkAberto, setLinkAberto] = useState<{ nome: string; link: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [codigoCopiado, setCodigoCopiado] = useState(false);

  const carregar = useCallback(
    async (q: string) => {
      setErro(null);
      const [r1, r2] = await Promise.all([
        obterInst(),
        listar({ data: { pesquisa: q } }),
      ]);
      if (!r1.ok) {
        setErro("Não foi possível carregar a instituição.");
        return;
      }
      setInst(r1.instituicao);
      if (!r2.ok) {
        setErro("Não foi possível carregar os colaboradores.");
        return;
      }
      setColabs(r2.colaboradores);
    },
    [obterInst, listar],
  );

  useEffect(() => {
    if (guard.estado !== "ok") return;
    void carregar("");
  }, [guard.estado, carregar]);

  useEffect(() => {
    if (guard.estado !== "ok") return;
    const t = setTimeout(() => {
      void carregar(pesquisa.trim());
    }, 250);
    return () => clearTimeout(t);
  }, [pesquisa, guard.estado, carregar]);

  async function pedirNovoLink(id: string, nome: string) {
    const res = await regenerar({
      data: { perfil_id: id, origin: window.location.origin },
    });
    if (!res.ok) {
      alert("Não foi possível gerar o link.");
      return;
    }
    setLinkAberto({ nome, link: res.link });
    setCopiado(false);
  }

  async function copiarCodigo() {
    if (!inst) return;
    await navigator.clipboard.writeText(inst.codigo_inscricao);
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 2000);
  }

  async function copiarLink() {
    if (!linkAberto) return;
    await navigator.clipboard.writeText(linkAberto.link);
    setCopiado(true);
  }

  if (guard.estado === "a_verificar") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p className="text-base text-foreground">A verificar acesso…</p>
      </main>
    );
  }
  if (guard.estado !== "ok") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p className="text-base text-foreground">A redirecionar…</p>
      </main>
    );
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">A minha instituição</h1>

        {erro && (
          <p role="alert" className="mt-4 rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
            {erro}
          </p>
        )}

        {inst && (
          <section className="mt-6 rounded-lg border border-ink/10 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Instituição
            </p>
            <p className="mt-1 text-2xl font-bold text-ink">{inst.nome}</p>
            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Código de inscrição
              </p>
              <p className="mt-1 text-sm text-foreground">
                Entregue este código aos colaboradores que se registarem em <code>/registo</code>.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <code className="rounded-md bg-ink/5 px-4 py-2 text-2xl font-mono font-bold tracking-widest text-ink">
                  {inst.codigo_inscricao}
                </code>
                <button
                  type="button"
                  onClick={copiarCodigo}
                  className="inline-flex min-h-11 items-center rounded-md border border-ink/20 px-3 text-base text-ink"
                >
                  {codigoCopiado ? "Copiado!" : "Copiar código"}
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-ink">Colaboradores</h2>
            <button
              type="button"
              onClick={() => setImportAberto(true)}
              className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground"
            >
              Importar em massa
            </button>
          </div>

          <div className="mt-4">
            <label htmlFor="pesquisa" className="sr-only">Pesquisar por nome ou email</label>
            <input
              id="pesquisa"
              type="search"
              placeholder="Pesquisar por nome ou email…"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              className="block w-full max-w-md rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          <div className="mt-4 overflow-auto rounded-md border border-ink/10">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-ink/5 text-left">
                <tr>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Conta ativada</th>
                  <th className="px-3 py-2">Convite</th>
                  <th className="px-3 py-2">Último acesso</th>
                  <th className="px-3 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {colabs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                      Ainda não há colaboradores registados nesta instituição.
                    </td>
                  </tr>
                )}
                {colabs.map((c) => (
                  <tr key={c.id} className="border-t border-ink/5">
                    <td className="px-3 py-2 font-semibold text-ink">{c.nome}</td>
                    <td className="px-3 py-2 text-foreground">{c.email}</td>
                    <td className="px-3 py-2">
                      {c.conta_ativada ? (
                        <span className="text-ink">Sim</span>
                      ) : (
                        <span className="text-brand">Não</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{rotuloEstadoConvite(c.estado_convite)}</td>
                    <td className="px-3 py-2 text-foreground">
                      {c.ultimo_acesso
                        ? new Date(c.ultimo_acesso).toLocaleString("pt-PT")
                        : "Nunca"}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => pedirNovoLink(c.id, c.nome)}
                        disabled={c.conta_ativada}
                        className="inline-flex min-h-9 items-center rounded-md border border-ink/20 px-3 text-sm text-ink disabled:opacity-50"
                      >
                        Gerar novo link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <ImportColaboradoresDialog
        aberto={importAberto}
        fechar={() => setImportAberto(false)}
        aoConcluir={() => void carregar(pesquisa.trim())}
      />

      {linkAberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="link-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
        >
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h2 id="link-titulo" className="text-2xl font-extrabold text-ink">
              Link de palavra-passe
            </h2>
            <p className="mt-2 text-base text-foreground">
              Para <strong>{linkAberto.nome}</strong>. Entregue este link ao colaborador para ele
              definir a palavra-passe.
            </p>
            <textarea
              readOnly
              value={linkAberto.link}
              rows={4}
              className="mt-4 block w-full break-all rounded-md border border-ink/20 bg-white p-3 font-mono text-sm text-ink"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copiarLink}
                className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground"
              >
                {copiado ? "Copiado!" : "Copiar link"}
              </button>
              <button
                type="button"
                onClick={() => setLinkAberto(null)}
                className="inline-flex min-h-11 items-center rounded-md border border-ink/20 px-4 text-base text-ink"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function rotuloEstadoConvite(e: EstadoConvite) {
  switch (e) {
    case "por_usar":
      return <span className="text-brand">Por usar</span>;
    case "usado":
      return <span className="text-ink">Usado</span>;
    case "expirado":
      return <span className="text-brand">Expirado</span>;
    default:
      return <span className="text-muted-foreground">—</span>;
  }
}

