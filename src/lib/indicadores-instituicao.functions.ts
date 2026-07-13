import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type PainelIndicadores = {
  instituicao: {
    nome: string;
    provincia: string | null;
    distrito: string | null;
    num_trabalhadores_total: number | null;
    prazo_meses: number | null;
    declaracao_assinada: boolean;
    declaracao_assinada_em: string | null;
  };
  totais: { inscritos: number; certificados: number };
  cobertura: { real_pct: number | null; meta_pct: number | null; disponivel: boolean };
  conclusao: { real_pct: number | null; meta_pct: number | null; disponivel: boolean };
  ganho: {
    real_pontos: number | null;
    meta_pontos: number | null;
    n: number;
    disponivel: boolean;
  };
  equidade: {
    dif_maxima_pp: number | null;
    meta_max_pp: number | null;
    sexo_censurado: boolean;
    apoio_censurado: boolean;
    disponivel: boolean;
  };
  compromisso: { declaracao_assinada: boolean; assinada_em: string | null };
  certificados_lista: { nome: string; modulo: string; data: string }[];
};

const TOKEN_SCHEMA = z.object({ token: z.string().uuid() });

export const obterIndicadoresPorToken = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => TOKEN_SCHEMA.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: json, error } = await supabaseAdmin.rpc("get_indicadores_por_token", {
      _token: data.token,
    });
    if (error) {
      return { ok: false as const, mensagem: "erro" };
    }
    if (!json) {
      return { ok: false as const, mensagem: "nao_encontrada" };
    }
    return { ok: true as const, painel: json as unknown as PainelIndicadores };
  });
