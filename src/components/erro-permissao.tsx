import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { PlataformaPagina } from "@/components/plataforma-pagina";
import { supabase } from "@/integrations/supabase/client";

/**
 * Mensagem única para quando o servidor recusa o acesso a uma área de gestão.
 * Distingue falta de sessão de falta de permissão. A decisão é do servidor.
 */
export function ErroPermissao({ erro }: { erro?: unknown }) {
  const texto = erro instanceof Error ? erro.message : String(erro ?? "");
  const recusaSessao = /unauthorized|401|SEM_SESSAO/i.test(texto);
  const destino = useRouterState({ select: (s) => s.location.href });
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const semSessao = recusaSessao && email === null;

  if (email === undefined) {
    return <PlataformaPagina titulo="A verificar a sessão…" introducao="Um momento." />;
  }

  if (semSessao || (recusaSessao && !email)) {
    return (
      <PlataformaPagina
        titulo="Inicie sessão para continuar"
        introducao="Para aceder a esta área, inicie sessão com a sua conta."
      >
        <Link
          to="/entrar"
          search={{ redirect: destino }}
          className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 py-2 text-base font-semibold text-white"
        >
          Iniciar sessão
        </Link>
      </PlataformaPagina>
    );
  }

  return (
    <PlataformaPagina
      titulo={recusaSessao ? "Não foi possível confirmar a sessão" : "Sem permissão para esta área"}
      introducao={
        recusaSessao
          ? "A sessão pode ter expirado. Recarregue a página ou inicie sessão novamente."
          : "A sua conta não tem permissão para ver ou alterar esta área. Fale com a administração do programa."
      }
    >
      <p className="text-base text-navy">
        Sessão iniciada como <strong>{email}</strong>.
      </p>
      <p className="mt-3 flex flex-wrap gap-4 text-base">
        <Link to="/painel" className="font-semibold underline">
          Ir para o painel
        </Link>
        {recusaSessao ? (
          <Link to="/entrar" search={{ redirect: destino }} className="font-semibold underline">
            Iniciar sessão novamente
          </Link>
        ) : null}
      </p>
    </PlataformaPagina>
  );
}
