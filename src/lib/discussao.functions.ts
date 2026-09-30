/**
 * Discussão pedagógica por turma. Cliente da sessão: as regras da base decidem
 * quem lê, publica, responde e modera (formando inscrito, formador principal,
 * gestão do programa). Cada acção fica no registo de actividade.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PapelDiscussao = "formando" | "formador" | "moderacao";
export type TurmaDiscussao = {
  turmaId: string; designacao: string; curso: string; provincia: string; distrito: string;
  estadoTurma: string; papel: PapelDiscussao; total: number; semResposta: number; minhasPorResolver: number;
};
export type Resposta = {
  id: string; autor_id: string; autor_nome: string; papel_autor: PapelDiscussao; mensagem: string;
  oculto: boolean; moderacao_motivo: string | null; criado_em: string;
};
export type Topico = {
  id: string; autor_id: string; autor_nome: string; titulo: string; mensagem: string;
  estado: "aberta" | "respondida" | "resolvida"; oculto: boolean; moderacao_motivo: string | null;
  criado_em: string; actualizado_em: string; respostas: Resposta[];
};

function erroLegivel(msg: string): string {
  if (/DISCUSSAO_TOPICO_OCULTO/.test(msg)) return "Esta dúvida foi ocultada pela moderação e já não aceita mensagens.";
  if (/row-level|42501|DISCUSSAO_/.test(msg)) return "Não tem permissão para esta acção nesta turma.";
  if (/check constraint/.test(msg)) return "Texto demasiado curto ou demasiado longo.";
  return "Não foi possível gravar. Tente novamente.";
}

export const listarTurmasDiscussao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("rpc_discussao_turmas");
    if (error) throw new Error("Não foi possível ler as turmas.");
    return (data ?? []) as unknown as TurmaDiscussao[];
  });

export const lerDiscussao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ turmaId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const s = context.supabase;
    const { data: papel } = await s.rpc("discussao_papel", { _uid: context.userId, _turma: data.turmaId });
    if (!papel) return { acesso: false as const };
    const { data: turma } = await s.from("turmas").select("designacao, provincia, distrito, cursos(titulo)").eq("id", data.turmaId).maybeSingle();
    const { data: tops, error } = await s.from("discussao_topicos")
      .select("id,autor_id,autor_nome,titulo,mensagem,estado,oculto,moderacao_motivo,criado_em,actualizado_em")
      .eq("turma_id", data.turmaId).order("criado_em", { ascending: false });
    if (error) throw new Error("Não foi possível ler a discussão.");
    const ids = (tops ?? []).map((t) => t.id);
    const { data: resp } = ids.length
      ? await s.from("discussao_respostas")
          .select("id,topico_id,autor_id,autor_nome,papel_autor,mensagem,oculto,moderacao_motivo,criado_em")
          .in("topico_id", ids).order("criado_em")
      : { data: [] as any[] };
    const topicos: Topico[] = (tops ?? []).map((t) => ({
      ...(t as any),
      respostas: (resp ?? []).filter((r: any) => r.topico_id === t.id) as Resposta[],
    }));
    return {
      acesso: true as const,
      papel: papel as PapelDiscussao,
      eu: context.userId,
      turma: {
        designacao: turma?.designacao ?? "", provincia: turma?.provincia ?? "", distrito: turma?.distrito ?? "",
        curso: (turma as any)?.cursos?.titulo ?? "",
      },
      topicos,
    };
  });

export const criarTopico = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    turmaId: z.string().uuid(), titulo: z.string().trim().min(3).max(200), mensagem: z.string().trim().min(5).max(5000),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("discussao_topicos")
      .insert({ turma_id: data.turmaId, autor_id: context.userId, titulo: data.titulo, mensagem: data.mensagem });
    if (error) return { ok: false as const, erro: erroLegivel(error.message) };
    return { ok: true as const };
  });

export const responderTopico = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    turmaId: z.string().uuid(), topicoId: z.string().uuid(), mensagem: z.string().trim().min(2).max(5000),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("discussao_respostas")
      .insert({ turma_id: data.turmaId, topico_id: data.topicoId, autor_id: context.userId, mensagem: data.mensagem });
    if (error) return { ok: false as const, erro: erroLegivel(error.message) };
    return { ok: true as const };
  });

export const mudarEstadoTopico = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ topicoId: z.string().uuid(), estado: z.enum(["aberta", "resolvida"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: r, error } = await context.supabase.from("discussao_topicos")
      .update({ estado: data.estado }).eq("id", data.topicoId).select("id");
    if (error || !r?.length) return { ok: false as const, erro: erroLegivel(error?.message ?? "row-level") };
    return { ok: true as const };
  });

export const moderar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    tipo: z.enum(["topico", "resposta"]), id: z.string().uuid(), oculto: z.boolean(),
    motivo: z.string().trim().min(3).max(500).nullable(),
  }).refine((v) => !v.oculto || !!v.motivo, { message: "Motivo obrigatório" }).parse(d))
  .handler(async ({ data, context }) => {
    const tabela = data.tipo === "topico" ? "discussao_topicos" : "discussao_respostas";
    const { data: r, error } = await context.supabase.from(tabela)
      .update({ oculto: data.oculto, moderacao_motivo: data.oculto ? data.motivo : null })
      .eq("id", data.id).select("id");
    if (error || !r?.length) return { ok: false as const, erro: erroLegivel(error?.message ?? "row-level") };
    return { ok: true as const };
  });
