import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Inscrição do formando numa turma pelo código.
 *
 * A pessoa inscrita é SEMPRE a da sessão: as funções da base usam auth.uid()
 * e não recebem qualquer identificador de pessoa. A verificação de vaga e a
 * inscrição são uma só operação na base (turma bloqueada durante a escrita).
 */

const codigoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(4)
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/),
});

export type TurmaPorCodigo = {
  id: string;
  designacao: string;
  codigo: string;
  provincia: string;
  distrito: string;
  local: string | null;
  modalidade: string;
  estado: string;
  dataInicio: string | null;
  dataFim: string | null;
  cursoTitulo: string;
  cursoSlug: string;
  vagasLivres: number;
};

export type ConsultaCodigo =
  | { resultado: "codigo_invalido" }
  | { resultado: "encontrada"; turma: TurmaPorCodigo; minhaInscricao: string | null };

export type ResultadoInscricao =
  | "inscrito"
  | "ja_inscrito"
  | "codigo_invalido"
  | "inscricoes_fechadas"
  | "turma_cheia"
  | "sem_perfil";

export const consultarTurmaPorCodigo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { codigo: string }) => {
    const r = codigoSchema.safeParse(i);
    return r.success ? r.data : { codigo: "" };
  })
  .handler(async ({ context, data }): Promise<ConsultaCodigo> => {
    if (!data.codigo) return { resultado: "codigo_invalido" };
    const { data: r, error } = await (context.supabase as any).rpc("rpc_turma_por_codigo", {
      _codigo: data.codigo,
    });
    if (error) throw new Error("Não foi possível consultar o código.");
    return r as ConsultaCodigo;
  });

export const inscreverPorCodigo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { codigo: string }) => {
    const r = codigoSchema.safeParse(i);
    return r.success ? r.data : { codigo: "" };
  })
  .handler(async ({ context, data }): Promise<{ resultado: ResultadoInscricao }> => {
    if (!data.codigo) return { resultado: "codigo_invalido" };
    const { data: r, error } = await (context.supabase as any).rpc("rpc_inscrever_por_codigo", {
      _codigo: data.codigo,
    });
    if (error) throw new Error("Não foi possível concluir a inscrição.");
    return { resultado: (r as { resultado: ResultadoInscricao }).resultado };
  });

export type MinhaTurma = {
  inscricaoId: string;
  estado: string;
  inscritoEm: string;
  turmaDesignacao: string;
  turmaEstado: string;
  provincia: string;
  distrito: string;
  dataInicio: string | null;
  dataFim: string | null;
  cursoTitulo: string;
  cursoSlug: string;
};

/** Turmas do próprio utilizador (as regras da base só lhe mostram as suas). */
export const listarMinhasTurmas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MinhaTurma[]> => {
    const { data, error } = await context.supabase
      .from("turma_inscricoes")
      .select(
        "id, estado, criado_em, turmas(designacao, estado, provincia, distrito, data_inicio, data_fim, cursos(titulo, slug))",
      )
      .eq("perfil_id", context.userId)
      .order("criado_em", { ascending: false });
    if (error) throw new Error("Não foi possível ler as suas turmas.");
    type Linha = {
      id: string;
      estado: string;
      criado_em: string;
      turmas: {
        designacao: string;
        estado: string;
        provincia: string;
        distrito: string;
        data_inicio: string | null;
        data_fim: string | null;
        cursos: { titulo: string; slug: string } | null;
      } | null;
    };
    return ((data ?? []) as unknown as Linha[])
      .filter((l) => l.turmas)
      .map((l) => ({
        inscricaoId: l.id,
        estado: l.estado,
        inscritoEm: l.criado_em,
        turmaDesignacao: l.turmas!.designacao,
        turmaEstado: l.turmas!.estado,
        provincia: l.turmas!.provincia,
        distrito: l.turmas!.distrito,
        dataInicio: l.turmas!.data_inicio,
        dataFim: l.turmas!.data_fim,
        cursoTitulo: l.turmas!.cursos?.titulo ?? "",
        cursoSlug: l.turmas!.cursos?.slug ?? "",
      }));
  });
