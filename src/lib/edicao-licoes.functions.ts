/**
 * Edição de cursos e lições na área reservada (Administrador Geral Ologa).
 *
 * - Não alarga permissões: escreve com o cliente da própria sessão, logo a
 *   política RLS existente `licoes_update_admin` (is_admin) decide sempre.
 * - Cada alteração fica no registo de auditoria pelo gatilho já existente.
 * - Protecção contra sobrescrita atómica: o cliente envia os valores que viu;
 *   a função da base compara e grava na mesma transacção com a linha bloqueada.
 * - Não toca em bancos de questões nem em exames.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Contexto = { supabase: any; userId: string };

async function exigirAdministradorGeral(context: Contexto) {
  if (!context?.userId) throw new Error("SEM_SESSAO");
  const { data, error } = await context.supabase
    .from("perfis")
    .select("papel")
    .eq("id", context.userId)
    .maybeSingle();
  if (error || (data as { papel?: string } | null)?.papel !== "admin_ologa") {
    throw new Error("SEM_PERMISSAO_ADMIN_GERAL");
  }
}

export type LicaoEditavel = {
  id: string;
  modulo_id: string;
  modulo_titulo: string;
  modulo_ordem: number;
  ordem: number;
  titulo: string;
  duracao_minutos: number | null;
  estado_conteudo: "por_fornecer" | "disponivel";
  proposta_por_validar: boolean;
  conteudo_elearning: string | null;
  guiao_formador: string | null;
};

export const listarCursosEdicao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirAdministradorGeral(context as Contexto);
    const { data, error } = await context.supabase
      .from("cursos")
      .select("id, slug, titulo, carga_horaria, minutos_avaliacao_orientacao")
      .order("ordem");
    if (error) throw new Error(error.message);
    return data as {
      id: string;
      slug: string;
      titulo: string;
      carga_horaria: number;
      minutos_avaliacao_orientacao: number;
    }[];
  });

export const listarLicoesCurso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ cursoId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirAdministradorGeral(context as Contexto);
    const { data: cm, error } = await context.supabase
      .from("curso_modulos")
      .select("ordem, modulo_id, modulos(titulo)")
      .eq("curso_id", data.cursoId)
      .order("ordem");
    if (error) throw new Error(error.message);
    const ids = (cm ?? []).map((r: any) => r.modulo_id);
    if (ids.length === 0) return [] as LicaoEditavel[];
    const { data: ls, error: e2 } = await context.supabase
      .from("licoes")
      .select(
        "id, modulo_id, ordem, titulo, duracao_minutos, estado_conteudo, proposta_por_validar, conteudo_elearning, guiao_formador",
      )
      .in("modulo_id", ids);
    if (e2) throw new Error(e2.message);
    const mod = new Map((cm ?? []).map((r: any) => [r.modulo_id, r]));
    return (ls ?? [])
      .map((l: any) => {
        const m: any = mod.get(l.modulo_id);
        return { ...l, modulo_ordem: m.ordem, modulo_titulo: m.modulos?.titulo ?? "" };
      })
      .sort((a: any, b: any) => a.modulo_ordem - b.modulo_ordem || a.ordem - b.ordem) as LicaoEditavel[];
  });

const campos = z.object({
  titulo: z.string().trim().min(3).max(300),
  duracao_minutos: z.number().int().min(0).max(6000).nullable(),
  estado_conteudo: z.enum(["por_fornecer", "disponivel"]),
  conteudo_elearning: z.string().max(400_000).nullable(),
  guiao_formador: z.string().max(400_000).nullable(),
});

export type CamposLicao = z.infer<typeof campos>;

export const guardarLicao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), anterior: campos, novo: campos }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await exigirAdministradorGeral(context as Contexto);
    // Comparação e actualização numa só transacção, com a linha bloqueada
    // (rpc_guardar_licao, SECURITY INVOKER: as regras de acesso decidem).
    const { data: r, error } = await context.supabase.rpc("rpc_guardar_licao", {
      _id: data.id,
      _anterior: data.anterior,
      _novo: data.novo,
    });
    if (error) throw new Error(error.message);
    const res = r as { estado: string; campos?: string[] };
    if (res.estado === "inexistente") throw new Error("LICAO_INEXISTENTE");
    if (res.estado === "conflito") return { estado: "conflito" as const };
    if (res.estado === "sem_alteracoes") return { estado: "sem_alteracoes" as const };
    return { estado: "gravado" as const, campos: res.campos ?? [] };
  });

/** Distribuição curricular gravada (curso_modulos), incluindo o transversal. */
export const obterDistribuicaoCurso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ cursoId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirAdministradorGeral(context as Contexto);
    const { data: cm, error } = await context.supabase
      .from("curso_modulos")
      .select("modulo_id, carga_horaria_minutos, transversal")
      .eq("curso_id", data.cursoId);
    if (error) throw new Error(error.message);
    return (cm ?? []) as { modulo_id: string; carga_horaria_minutos: number; transversal: boolean }[];
  });
