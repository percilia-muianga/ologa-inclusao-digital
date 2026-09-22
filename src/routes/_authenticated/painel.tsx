import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessao, PapelActivoProvider, usePapelActivo } from "@/hooks/use-sessao";
import { nomeDoPapel, papeisDeVista, type PapelSistema } from "@/lib/papeis";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Área reservada — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Área reservada da Plataforma Nacional de Capacitação Digital: percurso, turmas, presenças, utilizadores e registos de actividade.",
      },
      { property: "og:title", content: "Área reservada — Plataforma Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content: "Acesso por papel à área reservada da Plataforma Nacional de Capacitação Digital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PainelLayout,
});

function PainelLayout() {
  const sessao = useSessao();
  const papeis = papeisDeVista(
    (sessao.data?.papeis ?? []) as PapelSistema[],
    sessao.data?.administradorGeral ?? false,
  );

  return (
    <PapelActivoProvider papeis={papeis}>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <CabecalhoPainel nome={sessao.data?.perfil?.nome ?? ""} teste={!!sessao.data?.perfil?.conta_de_teste} />
      <main id="conteudo" className="wrap py-8">
        {sessao.isLoading ? (
          <p className="text-base text-navy-2">A carregar a sua sessão…</p>
        ) : papeis.length === 0 ? (
          <div className="rounded-lg border border-line bg-white p-6">
            <h1 className="text-2xl font-extrabold text-navy">Conta sem papel atribuído</h1>
            <p className="mt-2 text-base text-navy-2">
              A sua conta ainda não tem nenhum papel atribuído, por isso não tem acesso a
              nenhuma área reservada. Contacte o administrador da plataforma.
            </p>
            <p className="mt-4 text-base text-navy-2">
              Os módulos de literacia digital continuam abertos a todas as pessoas, sem conta:{" "}
              <Link to="/formacao" className="font-semibold underline">
                ver os cursos
              </Link>
              .
            </p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <SiteFooter />
    </PapelActivoProvider>
  );
}

function CabecalhoPainel({ nome, teste }: { nome: string; teste: boolean }) {
  const { papeis, papelActivo, definirPapelActivo } = usePapelActivo();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function terminarSessao() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/entrar", replace: true });
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="wrap flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0">
          <Link to="/" className="text-base font-extrabold text-navy">
            OLOGA
          </Link>
          <p className="truncate text-sm text-navy-2">
            {nome}
            {teste ? (
              <span className="ml-2 rounded bg-navy px-1.5 py-0.5 text-[11px] font-bold text-white">
                TESTE
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {papeis.length > 1 ? (
            <div className="flex items-center gap-2">
              <label htmlFor="selector-papel" className="text-sm font-semibold text-navy-2">
                A ver como
              </label>
              <select
                id="selector-papel"
                value={papelActivo ?? ""}
                onChange={(e) => definirPapelActivo(e.target.value as PapelSistema)}
                className="min-h-11 rounded-md border border-line bg-white px-3 py-2 text-base text-navy"
              >
                {papeis.map((p) => (
                  <option key={p} value={p}>
                    {nomeDoPapel(p)}
                  </option>
                ))}
              </select>
            </div>
          ) : papelActivo ? (
            <p className="text-sm font-semibold text-navy-2">{nomeDoPapel(papelActivo)}</p>
          ) : null}

          <button
            type="button"
            onClick={terminarSessao}
            className="min-h-11 rounded-md border border-line px-4 py-2 text-base font-semibold text-navy hover:bg-page"
          >
            Terminar sessão
          </button>
        </div>
      </div>
    </header>
  );
}
