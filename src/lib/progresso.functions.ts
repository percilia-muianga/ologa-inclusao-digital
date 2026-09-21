import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Progresso de lições ligado à matrícula (turma_inscricoes).
 *
 * Regras que não mudam:
 * - marcar uma lição como feita NUNCA gera presença, aprovação nem certificado;
 * - o progresso local anónimo continua a existir e é identificado como tal;
 * - tudo é validado no servidor: dono da matrícula e pertença da lição ao curso
 *   da turma (incluindo módulos partilhados, como o transversal).
 *
 * Todas as leituras e escritas correm com o cliente autenticado (RLS aplica-se
 * como o próprio utilizador). Não é usado o cliente administrativo.
 */

export type MatriculaResumo = {
  inscricaoId: string;
  turmaId: string;
  turmaDesignacao: string;
  cursoId: string;
  estado: string;
};

/** Matrículas do próprio utilizador, opcionalmente filtradas por curso. */
export const listarMatriculasProprias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { cursoSlug?: string | null }) =>
    z.object({ cursoSlug: z.string().trim().min(1).max(120).nullish() }).parse(i),
  )
  .handler(async ({ context, data }): Promise<MatriculaResumo[]> => {
    let cursoId: string | null = null;
    if (data.cursoSlug) {
      const { data: curso } = await context.supabase
        .from("cursos")
        .select("id")
        .eq("slug", data.cursoSlug)
        .maybeSingle();
      if (!curso) return [];
      cursoId = curso.id;
    }

    const { data: inscricoes, error } = await context.supabase
      .from("turma_inscricoes")
      .select("id, estado, turma_id, turmas(id, designacao, curso_id)")
      .eq("perfil_id", context.userId);
    if (error) throw new Error(error.message);

    type Linha = {
      id: string;
      estado: string;
      turma_id: string;
      turmas: { id: string; designacao: string; curso_id: string } | null;
    };

    return ((inscricoes ?? []) as unknown as Linha[])
      .filter((l) => l.turmas && (!cursoId || l.turmas.curso_id === cursoId))
      .map((l) => ({
        inscricaoId: l.id,
        turmaId: l.turma_id,
        turmaDesignacao: l.turmas!.designacao,
        cursoId: l.turmas!.curso_id,
        estado: l.estado,
      }));
  });

/**
 * Confirma que a matrícula é do utilizador e que a lição pertence a um módulo
 * ligado ao curso dessa turma. Devolve o curso, ou lança.
 */
async function validarMatriculaELicao(
  supabase: { from: (t: string) => any },
  userId: string,
  inscricaoId: string,
  licaoId: string,
) {
  const { data: inscricao } = await supabase
    .from("turma_inscricoes")
    .select("id, perfil_id, turmas(curso_id)")
    .eq("id", inscricaoId)
    .maybeSingle();

  if (!inscricao || inscricao.perfil_id !== userId) {
    throw new Error("MATRICULA_INVALIDA");
  }
  const cursoId: string | undefined = inscricao.turmas?.curso_id;
  if (!cursoId) throw new Error("MATRICULA_INVALIDA");

  const { data: licao } = await supabase
    .from("licoes")
    .select("id, modulo_id")
    .eq("id", licaoId)
    .maybeSingle();
  if (!licao) throw new Error("LICAO_INVALIDA");

  const { data: rel } = await supabase
    .from("curso_modulos")
    .select("modulo_id")
    .eq("curso_id", cursoId)
    .eq("modulo_id", licao.modulo_id)
    .maybeSingle();
  if (!rel) throw new Error("LICAO_FORA_DO_CURSO");

  return { cursoId };
}

/** Lições já concluídas nesta matrícula (opcionalmente só de um módulo). */
export const obterProgressoMatricula = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { inscricaoId: string; moduloId?: string | null }) =>
    z
      .object({
        inscricaoId: z.string().uuid(),
        moduloId: z.string().uuid().nullish(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }): Promise<{ licoesConcluidas: string[] }> => {
    const { data: inscricao } = await context.supabase
      .from("turma_inscricoes")
      .select("id, perfil_id")
      .eq("id", data.inscricaoId)
      .maybeSingle();
    if (!inscricao || inscricao.perfil_id !== context.userId) {
      throw new Error("MATRICULA_INVALIDA");
    }

    const { data: linhas, error } = await context.supabase
      .from("progresso_licoes_matricula")
      .select("licao_id, licoes(modulo_id)")
      .eq("inscricao_id", data.inscricaoId);
    if (error) throw new Error(error.message);

    type Linha = { licao_id: string; licoes: { modulo_id: string } | null };
    const todas = (linhas ?? []) as unknown as Linha[];
    const filtradas = data.moduloId
      ? todas.filter((l) => l.licoes?.modulo_id === data.moduloId)
      : todas;
    return { licoesConcluidas: filtradas.map((l) => l.licao_id) };
  });

/**
 * Marca a lição como concluída nesta matrícula. Idempotente: repetir não cria
 * duplicados nem devolve erro. Nunca gera presença nem certificação.
 */
export const marcarLicaoMatricula = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { inscricaoId: string; licaoId: string }) =>
    z
      .object({ inscricaoId: z.string().uuid(), licaoId: z.string().uuid() })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    await validarMatriculaELicao(
      context.supabase as never,
      context.userId,
      data.inscricaoId,
      data.licaoId,
    );

    const { error } = await context.supabase
      .from("progresso_licoes_matricula")
      .insert({
        inscricao_id: data.inscricaoId,
        licao_id: data.licaoId,
        origem: "formando",
        registado_por: context.userId,
      });

    // 23505 = já estava marcada. Estado final é o mesmo: concluída.
    if (error && (error as { code?: string }).code !== "23505") {
      throw new Error(error.message);
    }
    return { ok: true as const, inscricaoId: data.inscricaoId, licaoId: data.licaoId };
  });

/** Retira a marca de concluída (correcção do próprio formando). */
export const desmarcarLicaoMatricula = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { inscricaoId: string; licaoId: string }) =>
    z
      .object({ inscricaoId: z.string().uuid(), licaoId: z.string().uuid() })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    const { data: inscricao } = await context.supabase
      .from("turma_inscricoes")
      .select("id, perfil_id")
      .eq("id", data.inscricaoId)
      .maybeSingle();
    if (!inscricao || inscricao.perfil_id !== context.userId) {
      throw new Error("MATRICULA_INVALIDA");
    }
    const { error } = await context.supabase
      .from("progresso_licoes_matricula")
      .delete()
      .eq("inscricao_id", data.inscricaoId)
      .eq("licao_id", data.licaoId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
