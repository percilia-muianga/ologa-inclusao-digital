/**
 * «Pré-visualizar como formando» — apenas Administradora Geral Ologa.
 * Só leituras com o cliente da própria sessão (RLS decide). Não grava
 * inscrições, progresso, presenças, tentativas nem certificados, e não
 * devolve guiões do formador nem respostas do banco de questões.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BUCKET_MATERIAIS, type TipoMaterial } from "@/lib/materiais-licoes";

type Contexto = { supabase: any; userId: string };

async function exigirAdministradorGeral(context: Contexto) {
  if (!context?.userId) throw new Error("SEM_SESSAO");
  const { data, error } = await context.supabase
    .from("perfis").select("papel").eq("id", context.userId).maybeSingle();
  if (error || (data as { papel?: string } | null)?.papel !== "admin_ologa") {
    throw new Error("SEM_PERMISSAO_ADMIN_GERAL");
  }
}

const REGRAS_PADRAO = { numero_questoes: 20, minutos: 60, nota_minima_pct: 60, assiduidade_minima_pct: 80, prazo_dias: 30, tentativas_max: 2 };

export const preVisualizarCursos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirAdministradorGeral(context as Contexto);
    const { data, error } = await context.supabase.from("cursos").select("id, titulo, carga_horaria").order("ordem");
    if (error) throw new Error(error.message);
    return data as { id: string; titulo: string; carga_horaria: number }[];
  });

export const preVisualizarCurso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ cursoId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirAdministradorGeral(context as Contexto);
    const s = context.supabase;
    const [cursoRes, cmRes, cfgRes, questoesRes] = await Promise.all([
      s.from("cursos").select("id, titulo, carga_horaria, modalidade, objectivos, publico_alvo, pre_requisitos, materiais").eq("id", data.cursoId).maybeSingle(),
      s.from("curso_modulos").select("ordem, modulo_id, modulos(titulo)").eq("curso_id", data.cursoId).order("ordem"),
      s.from("exame_configuracoes").select("numero_questoes, minutos, nota_minima_pct, assiduidade_minima_pct, prazo_dias, tentativas_max").eq("curso_id", data.cursoId).maybeSingle(),
      s.from("banco_questoes").select("id", { count: "exact", head: true }).eq("curso_id", data.cursoId).eq("instrumento", "exame_final").eq("activa", true).neq("estado_revisao", "retirada"),
    ]);
    if (cursoRes.error || !cursoRes.data) throw new Error("CURSO_NAO_ENCONTRADO");
    if (cmRes.error) throw new Error(cmRes.error.message);
    const ids = (cmRes.data ?? []).map((r: any) => r.modulo_id);
    const { data: ls, error: e2 } = ids.length
      ? await s.from("licoes").select("id, modulo_id, ordem, titulo, duracao_minutos, estado_conteudo").in("modulo_id", ids)
      : { data: [], error: null };
    if (e2) throw new Error(e2.message);
    const modulos = (cmRes.data ?? []).map((m: any) => ({
      id: m.modulo_id as string,
      ordem: m.ordem as number,
      titulo: (m.modulos?.titulo ?? "") as string,
      licoes: (ls ?? []).filter((l: any) => l.modulo_id === m.modulo_id).sort((a: any, b: any) => a.ordem - b.ordem)
        .map((l: any) => ({ id: l.id as string, titulo: l.titulo as string, duracao_minutos: l.duracao_minutos as number | null, disponivel: l.estado_conteudo === "disponivel" })),
    }));
    const cfg = cfgRes.data as typeof REGRAS_PADRAO | null;
    const regras = cfg ?? REGRAS_PADRAO;
    const activas = questoesRes.count ?? 0;
    return {
      curso: cursoRes.data as { id: string; titulo: string; carga_horaria: number; modalidade: string; objectivos: string | null; publico_alvo: string | null; pre_requisitos: string | null; materiais: string | null },
      modulos,
      exame: { configurado: !!cfg, disponivel: !!cfg && activas >= regras.numero_questoes * 3, regras },
    };
  });

export const preVisualizarLicao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ licaoId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirAdministradorGeral(context as Contexto);
    const s = context.supabase;
    const { data: l, error } = await s.from("licoes")
      .select("id, titulo, duracao_minutos, estado_conteudo, conteudo_elearning").eq("id", data.licaoId).maybeSingle();
    if (error || !l) throw new Error("LICAO_NAO_ENCONTRADA");
    // Materiais tal como o formando os vê: apenas os disponibilizados.
    const { data: rows, error: e2 } = await s.from("licao_materiais")
      .select("id,tipo,titulo,descricao_acessivel,idioma,legenda_de,ficheiro_path,nome_original,mime,ordem")
      .eq("licao_id", data.licaoId).eq("disponivel", true).order("ordem");
    if (e2) throw new Error(e2.message);
    const paths = (rows ?? []).map((r: any) => r.ficheiro_path);
    const urls = new Map<string, string>();
    if (paths.length) {
      const { data: su } = await s.storage.from(BUCKET_MATERIAIS).createSignedUrls(paths, 3600);
      for (const u of su ?? []) if (u.signedUrl && u.path && !u.error) urls.set(u.path, u.signedUrl);
    }
    const materiais = (rows ?? []).filter((r: any) => urls.has(r.ficheiro_path)).map((r: any) => {
      const { ficheiro_path, ...resto } = r;
      return { ...resto, url: urls.get(ficheiro_path)! } as {
        id: string; tipo: TipoMaterial; titulo: string; descricao_acessivel: string | null; idioma: string;
        legenda_de: string | null; nome_original: string; mime: string; ordem: number; url: string;
      };
    });
    const disponivel = l.estado_conteudo === "disponivel";
    return {
      licao: { id: l.id as string, titulo: l.titulo as string, duracao_minutos: l.duracao_minutos as number | null, disponivel, conteudo: disponivel ? (l.conteudo_elearning as string | null) : null },
      materiais,
    };
  });
