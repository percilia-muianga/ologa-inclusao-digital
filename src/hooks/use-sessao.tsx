import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { obterSessao, type Sessao } from "@/lib/conta.functions";
import type { PapelVista } from "@/lib/papeis";

const CHAVE_PAPEL = "ologa-papel-activo";

/** Sessão do próprio utilizador: perfil e papéis atribuídos. */
export function useSessao() {
  const fn = useServerFn(obterSessao);
  return useQuery<Sessao>({
    queryKey: ["sessao"],
    queryFn: () => fn(),
    staleTime: 30_000,
  });
}

type ContextoPapel = {
  papeis: PapelVista[];
  papelActivo: PapelVista | null;
  definirPapelActivo: (papel: PapelVista) => void;
};

const PapelContext = createContext<ContextoPapel>({
  papeis: [],
  papelActivo: null,
  definirPapelActivo: () => {},
});

/**
 * O papel activo escolhe apenas a VISTA. Não altera permissões:
 * a base de dados continua a validar tudo o que cada conta pode ver.
 */
export function PapelActivoProvider({
  papeis,
  children,
}: {
  papeis: PapelVista[];
  children: ReactNode;
}) {
  const [papelActivo, setPapel] = useState<PapelVista | null>(null);

  useEffect(() => {
    if (papeis.length === 0) {
      setPapel(null);
      return;
    }
    let guardado: string | null = null;
    try {
      guardado = sessionStorage.getItem(CHAVE_PAPEL);
    } catch {
      guardado = null;
    }
    const valido = guardado && papeis.includes(guardado as PapelVista);
    setPapel(valido ? (guardado as PapelVista) : papeis[0]);
  }, [papeis]);

  const valor = useMemo<ContextoPapel>(
    () => ({
      papeis,
      papelActivo,
      definirPapelActivo: (papel) => {
        setPapel(papel);
        try {
          sessionStorage.setItem(CHAVE_PAPEL, papel);
        } catch {
          /* sessão sem armazenamento — segue sem guardar */
        }
      },
    }),
    [papeis, papelActivo],
  );

  return <PapelContext.Provider value={valor}>{children}</PapelContext.Provider>;
}

export function usePapelActivo() {
  return useContext(PapelContext);
}
