import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PoliticaAcesso = {
  tabela: string;
  politica: string;
  operacao: string;
  papeis: string;
  condicao: string;
  condicao_escrita: string;
};

export type TabelaProtegida = {
  tabela: string;
  rls_activa: boolean;
  numero_politicas: number;
};

export type RelatorioPermissoes = {
  geradoEm: string;
  tabelas: TabelaProtegida[];
  politicas: PoliticaAcesso[];
};

/**
 * Relatório de verificação de permissões.
 * As regras são lidas directamente da base de dados (políticas em vigor),
 * nunca escritas à mão, para servirem de prova documental.
 * Acessível apenas a administrador e auditor — validado pelas próprias funções.
 */
export const obterRelatorioPermissoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RelatorioPermissoes> => {
    const [tabelas, politicas] = await Promise.all([
      context.supabase.rpc("listar_tabelas_protegidas"),
      context.supabase.rpc("listar_politicas_acesso"),
    ]);

    if (tabelas.error) throw new Error(tabelas.error.message);
    if (politicas.error) throw new Error(politicas.error.message);

    return {
      geradoEm: new Date().toISOString(),
      tabelas: (tabelas.data ?? []) as TabelaProtegida[],
      politicas: (politicas.data ?? []) as PoliticaAcesso[],
    };
  });
