import { createServerFn } from "@tanstack/react-start";

// Painel público de indicadores. Apenas agregados nacionais — nunca dados
// de uma instituição concreta. Se todos os totais forem zero, o UI mostra
// "Ainda sem dados".
export const obterIndicadoresPublicos = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [instRes, decRes, certRes, distRes] = await Promise.all([
      supabaseAdmin.from("instituicoes").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("instituicoes")
        .select("id", { count: "exact", head: true })
        .eq("declaracao_assinada", true),
      supabaseAdmin.from("certificados").select("formando_id"),
      supabaseAdmin.from("instituicoes").select("distrito").not("distrito", "is", null),
    ]);

    const formandosCertificados = new Set(
      (certRes.data ?? []).map((r) => r.formando_id as string),
    ).size;

    const distritos = new Set(
      (distRes.data ?? [])
        .map((r) => (r.distrito as string | null)?.trim().toLowerCase())
        .filter((s): s is string => !!s),
    ).size;

    return {
      instituicoesInscritas: instRes.count ?? 0,
      instituicoesComDeclaracao: decRes.count ?? 0,
      formandosCertificados,
      distritosAbrangidos: distritos,
    };
  },
);
