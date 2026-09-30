import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { proximaEtapa, type EtapaPercurso } from "./percurso.server";

export type PercursoMatricula = {
  cursoId: string;
  licoesTotal: number;
  licoesConcluidas: number;
  sessoesTotal: number;
  sessoesRealizadas: number;
  presentes: number;
  justificadas: number;
  assiduidadePct: number | null;
  assiduidadeMinimaPct: number;
  avaliacaoDisponivel: boolean;
  tentativasFeitas: number;
  tentativasMax: number;
  melhorNotaPct: number | null;
  notaMinimaPct: number;
  certificadoCodigo: string | null;
  etapa: EtapaPercurso;
};

/**
 * Resumo do percurso numa matrícula do próprio formando: lições, presenças,
 * avaliação e certificado. A titularidade é confirmada com o cliente do
 * utilizador (regras da base); só depois se lêem presenças e resultados, que
 * as regras reservam à equipa de formação. Apenas leitura, apenas desta matrícula.
 */
export const percursoDaMatricula = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { inscricaoId: string }) =>
    z.object({ inscricaoId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ context, data }): Promise<PercursoMatricula> => {
    const { data: insc } = await context.supabase
      .from("turma_inscricoes")
      .select("id, perfil_id, nome, turma_id, turmas(curso_id)")
      .eq("id", data.inscricaoId)
      .maybeSingle();
    const linha = insc as unknown as {
      id: string;
      perfil_id: string | null;
      nome: string;
      turma_id: string;
      turmas: { curso_id: string } | null;
    } | null;
    if (!linha || linha.perfil_id !== context.userId || !linha.turmas) {
      throw new Error("MATRICULA_INVALIDA");
    }
    const cursoId = linha.turmas.curso_id;

    const { supabaseAdmin: s } = await import("@/integrations/supabase/client.server");
    const { calcularAssiduidade } = await import("@/lib/presencas.server");

    const [rel, feitas, sessoes, presencas, cfgPres, cfgExame, activas, formando] =
      await Promise.all([
        s.from("curso_modulos").select("modulo_id").eq("curso_id", cursoId),
        s.from("progresso_licoes_matricula").select("licao_id").eq("inscricao_id", linha.id),
        s.from("turma_sessoes").select("id, data, estado").eq("turma_id", linha.turma_id),
        s.from("presencas").select("*").eq("turma_id", linha.turma_id).eq("inscricao_id", linha.id),
        s.from("presenca_configuracoes").select("base_assiduidade").eq("curso_id", cursoId).maybeSingle(),
        s.from("exame_configuracoes")
          .select("numero_questoes, nota_minima_pct, assiduidade_minima_pct, tentativas_max")
          .eq("curso_id", cursoId).maybeSingle(),
        s.from("banco_questoes").select("id", { count: "exact", head: true })
          .eq("curso_id", cursoId).eq("activa", true).eq("instrumento", "exame_final"),
        s.from("formandos").select("id").eq("perfil_id", context.userId).maybeSingle(),
      ]);

    const modulos = (rel.data ?? []).map((r) => r.modulo_id);
    const { data: licoes } = modulos.length
      ? await s.from("licoes").select("id").in("modulo_id", modulos)
      : { data: [] as { id: string }[] };
    const idsLicoes = new Set((licoes ?? []).map((l) => l.id));
    const concluidas = (feitas.data ?? []).filter((f) => idsLicoes.has(f.licao_id)).length;

    const base = (cfgPres.data?.base_assiduidade ?? "estrita") as "estrita" | "ajustada";
    const [a] = calcularAssiduidade(
      (sessoes.data ?? []).map((x) => ({ id: x.id, data: x.data, estado: x.estado as never })),
      [{ id: linha.id, nome: linha.nome }],
      (presencas.data ?? []) as never,
      base,
    );

    const numeroQuestoes = cfgExame.data?.numero_questoes ?? 20;
    const notaMinimaPct = cfgExame.data?.nota_minima_pct ?? 60;
    const assiduidadeMinimaPct = cfgExame.data?.assiduidade_minima_pct ?? 80;
    const tentativasMax = cfgExame.data?.tentativas_max ?? 2;
    // Disponível só com configuração guardada e banco activo com o triplo exigido.
    const avaliacaoDisponivel = !!cfgExame.data && (activas.count ?? 0) >= numeroQuestoes * 3;

    let tentativasFeitas = 0;
    let melhorNotaPct: number | null = null;
    let certificadoCodigo: string | null = null;
    if (formando.data) {
      const [t, c] = await Promise.all([
        s.from("exame_tentativas").select("estado, nota_pct")
          .eq("formando_id", formando.data.id).eq("curso_id", cursoId),
        s.from("certificados_curso").select("codigo_verificacao")
          .eq("formando_id", formando.data.id).eq("curso_id", cursoId).maybeSingle(),
      ]);
      tentativasFeitas = (t.data ?? []).length;
      for (const x of t.data ?? []) {
        if (x.estado === "submetida" && x.nota_pct !== null)
          melhorNotaPct = Math.max(melhorNotaPct ?? 0, Number(x.nota_pct));
      }
      certificadoCodigo = c.data?.codigo_verificacao ?? null;
    }

    const resumo = {
      cursoId,
      licoesTotal: idsLicoes.size,
      licoesConcluidas: concluidas,
      sessoesTotal: a?.totalSessoes ?? 0,
      sessoesRealizadas: a?.realizadas ?? 0,
      presentes: a?.presentes ?? 0,
      justificadas: a?.justificadas ?? 0,
      assiduidadePct: a?.taxaPct ?? null,
      assiduidadeMinimaPct,
      avaliacaoDisponivel,
      tentativasFeitas,
      tentativasMax,
      melhorNotaPct,
      notaMinimaPct,
      certificadoCodigo,
    };
    return {
      ...resumo,
      etapa: proximaEtapa({ ...resumo, certificadoEmitido: !!certificadoCodigo }),
    };
  });
