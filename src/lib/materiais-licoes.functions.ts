/**
 * Materiais das lições (PDF, apresentações, vídeos, legendas).
 * Usa sempre o cliente da sessão: as regras de acesso (is_admin) decidem.
 * Cada alteração fica no registo de auditoria pelo gatilho da tabela.
 * Ficheiros substituídos não são apagados do armazenamento.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BUCKET_MATERIAIS, validarFicheiro, type TipoMaterial } from "./materiais-licoes";

type Ctx = { supabase: any; userId: string };

async function exigirAdmin(c: Ctx) {
  if (!c?.userId) throw new Error("SEM_SESSAO");
  const { data } = await c.supabase.from("perfis").select("papel").eq("id", c.userId).maybeSingle();
  if (data?.papel !== "admin_ologa") throw new Error("SEM_PERMISSAO_ADMIN_GERAL");
}

const tipo = z.enum(["pdf", "apresentacao", "video", "legenda"]);
const caminho = (licaoId: string) => z.string().regex(new RegExp(`^${licaoId}/[0-9a-f-]{36}\\.[a-z0-9]{2,5}$`));

export type MaterialLicao = {
  id: string; licao_id: string; tipo: TipoMaterial; titulo: string; descricao_acessivel: string | null;
  idioma: string; legenda_de: string | null; ficheiro_path: string; nome_original: string; mime: string;
  tamanho_bytes: number; ordem: number; disponivel: boolean; versao: number; actualizado_em: string;
  existe: boolean; url: string | null;
};

export const listarMateriais = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ licaoId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as Ctx);
    const s = context.supabase;
    const { data: rows, error } = await s.from("licao_materiais").select("*").eq("licao_id", data.licaoId).order("ordem");
    if (error) throw new Error(error.message);
    const { data: objs } = await s.storage.from(BUCKET_MATERIAIS).list(data.licaoId, { limit: 1000 });
    const existentes = new Set((objs ?? []).map((o: any) => `${data.licaoId}/${o.name}`));
    const presentes = (rows ?? []).filter((r: any) => existentes.has(r.ficheiro_path)).map((r: any) => r.ficheiro_path);
    const urls = new Map<string, string>();
    if (presentes.length) {
      const { data: su } = await s.storage.from(BUCKET_MATERIAIS).createSignedUrls(presentes, 3600);
      for (const u of su ?? []) if (u.signedUrl && u.path) urls.set(u.path, u.signedUrl);
    }
    return (rows ?? []).map((r: any) => ({ ...r, existe: existentes.has(r.ficheiro_path), url: urls.get(r.ficheiro_path) ?? null })) as MaterialLicao[];
  });

const meta = z.object({
  titulo: z.string().trim().min(3).max(200),
  descricao_acessivel: z.string().trim().max(2000).nullable(),
  idioma: z.string().trim().min(2).max(10),
  legenda_de: z.string().uuid().nullable(),
});

export const registarMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) =>
    z.object({
      licaoId: z.string().uuid(), tipo, nomeOriginal: z.string().min(1).max(300), tamanho: z.number().int(),
      ficheiroPath: caminho(d?.licaoId ?? "x"), meta,
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as Ctx);
    const v = validarFicheiro(data.tipo, data.nomeOriginal, data.tamanho);
    if ("erro" in v) throw new Error(v.erro);
    const s = context.supabase;
    const { data: ult } = await s.from("licao_materiais").select("ordem").eq("licao_id", data.licaoId).order("ordem", { ascending: false }).limit(1);
    const { error } = await s.from("licao_materiais").insert({
      licao_id: data.licaoId, tipo: data.tipo, ...data.meta, legenda_de: data.tipo === "legenda" ? data.meta.legenda_de : null,
      ficheiro_path: data.ficheiroPath, nome_original: data.nomeOriginal, mime: v.mime, tamanho_bytes: data.tamanho,
      ordem: (ult?.[0]?.ordem ?? 0) + 1, disponivel: false,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Substitui o ficheiro mantendo o registo; recusa se outra pessoa já alterou (versão). */
export const substituirFicheiro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) =>
    z.object({
      id: z.string().uuid(), licaoId: z.string().uuid(), tipo, versao: z.number().int(),
      nomeOriginal: z.string().min(1).max(300), tamanho: z.number().int(), ficheiroPath: caminho(d?.licaoId ?? "x"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as Ctx);
    const v = validarFicheiro(data.tipo, data.nomeOriginal, data.tamanho);
    if ("erro" in v) throw new Error(v.erro);
    const { data: r, error } = await context.supabase.from("licao_materiais")
      .update({ ficheiro_path: data.ficheiroPath, nome_original: data.nomeOriginal, mime: v.mime, tamanho_bytes: data.tamanho, versao: data.versao + 1, actualizado_em: new Date().toISOString() })
      .eq("id", data.id).eq("licao_id", data.licaoId).eq("tipo", data.tipo).eq("versao", data.versao).select("id");
    if (error) throw new Error(error.message);
    return { estado: (r?.length ? "gravado" : "conflito") as "gravado" | "conflito" };
  });

export const actualizarMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), versao: z.number().int(), meta, disponivel: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as Ctx);
    const s = context.supabase;
    const { data: atual, error: e1 } = await s.from("licao_materiais").select("tipo,ficheiro_path,licao_id").eq("id", data.id).maybeSingle();
    if (e1 || !atual) throw new Error("MATERIAL_INEXISTENTE");
    if (data.disponivel) {
      const { data: objs } = await s.storage.from(BUCKET_MATERIAIS).list(atual.licao_id, { limit: 1000 });
      if (!(objs ?? []).some((o: any) => `${atual.licao_id}/${o.name}` === atual.ficheiro_path))
        return { estado: "ficheiro_em_falta" as const };
    }
    const { data: r, error } = await s.from("licao_materiais")
      .update({ ...data.meta, legenda_de: atual.tipo === "legenda" ? data.meta.legenda_de : null, disponivel: data.disponivel, versao: data.versao + 1, actualizado_em: new Date().toISOString() })
      .eq("id", data.id).eq("versao", data.versao).select("id");
    if (error) throw new Error(error.message);
    return { estado: (r?.length ? "gravado" : "conflito") as "gravado" | "conflito" | "ficheiro_em_falta" };
  });

export const reordenarMateriais = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ licaoId: z.string().uuid(), ids: z.array(z.string().uuid()).min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as Ctx);
    const s = context.supabase;
    const { data: rows } = await s.from("licao_materiais").select("id,ordem").eq("licao_id", data.licaoId);
    const atuais = new Map((rows ?? []).map((r: any) => [r.id, r.ordem]));
    if (atuais.size !== data.ids.length || data.ids.some((i) => !atuais.has(i))) return { estado: "conflito" as const };
    for (const [i, id] of data.ids.entries()) {
      if (atuais.get(id) === i + 1) continue;
      const { error } = await s.from("licao_materiais").update({ ordem: i + 1 }).eq("id", id).eq("licao_id", data.licaoId);
      if (error) throw new Error(error.message);
    }
    return { estado: "gravado" as const };
  });
