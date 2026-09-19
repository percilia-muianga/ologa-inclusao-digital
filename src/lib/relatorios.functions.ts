import { createServerFn } from "@tanstack/react-start";

export type RelatorioMensal = {
  id: string;
  ano: number;
  mes: number;
  provincia: string | null;
  incidentes: string | null;
  reclamacoes: string | null;
  medidas_correctivas: string | null;
  nao_conformidades: string | null;
  acomodacoes_solicitadas: string | null;
  acomodacoes_concedidas: string | null;
  formatos_alternativos: string | null;
  barreiras_identificadas: string | null;
  barreiras_resolvidas: string | null;
};

export const listarRelatoriosMensais = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("relatorios_mensais")
    .select("*")
    .order("ano", { ascending: false })
    .order("mes", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RelatorioMensal[];
});

export const criarRelatorioMensal = createServerFn({ method: "POST" })
  .validator((dados: Omit<RelatorioMensal, "id">) => dados)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("relatorios_mensais").insert(data);
    if (error) throw error;
    return { ok: true };
  });
