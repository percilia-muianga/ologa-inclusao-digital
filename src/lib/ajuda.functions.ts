/**
 * FAQ e pedidos de suporte. Cliente da sessão sempre: as regras de acesso
 * decidem (FAQ: escrita só admin; pedidos: cada pessoa vê os seus, admin vê
 * e responde a todos). Cada alteração fica no registo de auditoria.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };
async function exigirAdmin(c: Ctx) {
  const { data } = await c.supabase.from("perfis").select("papel").eq("id", c.userId).maybeSingle();
  if (data?.papel !== "admin_ologa") throw new Error("SEM_PERMISSAO_ADMIN_GERAL");
}

export const CATEGORIAS_SUPORTE = {
  acesso: "Entrar na conta / acesso",
  conteudo: "Conteúdos dos cursos",
  acessibilidade: "Acessibilidade",
  tecnico: "Problema técnico",
  outro: "Outro assunto",
} as const;
export const ESTADOS_SUPORTE = { aberto: "Aberto", em_curso: "Em tratamento", resolvido: "Resolvido" } as const;

export type Faq = { id: string; pergunta: string; resposta: string; categoria: string; ordem: number; publicada: boolean; versao: number };

export const listarFaqAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirAdmin(context as Ctx);
    const { data, error } = await context.supabase.from("faq_perguntas").select("id,pergunta,resposta,categoria,ordem,publicada,versao").order("ordem");
    if (error) throw new Error(error.message);
    return data as Faq[];
  });

const faqCampos = z.object({
  pergunta: z.string().trim().min(5).max(500),
  resposta: z.string().trim().min(5).max(10000),
  categoria: z.string().trim().min(2).max(60),
  ordem: z.number().int().min(1).max(10000),
  publicada: z.boolean(),
});

export const guardarFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid().nullable(), versao: z.number().int().nullable(), campos: faqCampos }).parse(d))
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as Ctx);
    const s = context.supabase;
    if (!data.id) {
      const { error } = await s.from("faq_perguntas").insert(data.campos);
      if (error) throw new Error(error.message);
      return { estado: "gravado" as const };
    }
    const { data: r, error } = await s.from("faq_perguntas")
      .update({ ...data.campos, versao: (data.versao ?? 0) + 1, actualizado_em: new Date().toISOString() })
      .eq("id", data.id).eq("versao", data.versao ?? -1).select("id");
    if (error) throw new Error(error.message);
    return { estado: (r?.length ? "gravado" : "conflito") as "gravado" | "conflito" };
  });

export const criarPedidoSuporte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      categoria: z.enum(["acesso", "conteudo", "acessibilidade", "tecnico", "outro"]),
      assunto: z.string().trim().min(3).max(200),
      mensagem: z.string().trim().min(5).max(5000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pedidos_suporte").insert({ ...data, autor_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type PedidoSuporte = {
  id: string; categoria: keyof typeof CATEGORIAS_SUPORTE; assunto: string; mensagem: string;
  estado: keyof typeof ESTADOS_SUPORTE; resposta: string | null; criado_em: string; actualizado_em: string;
  autor?: { nome: string; email: string } | null;
};

export const meusPedidosSuporte = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("pedidos_suporte")
      .select("id,categoria,assunto,mensagem,estado,resposta,criado_em,actualizado_em")
      .eq("autor_id", context.userId).order("criado_em", { ascending: false });
    if (error) throw new Error(error.message);
    return data as PedidoSuporte[];
  });

export const listarPedidosAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await exigirAdmin(context as Ctx);
    const { data, error } = await context.supabase.from("pedidos_suporte")
      .select("id,categoria,assunto,mensagem,estado,resposta,criado_em,actualizado_em,autor:perfis(nome,email)")
      .order("criado_em", { ascending: false });
    if (error) throw new Error(error.message);
    return data as PedidoSuporte[];
  });

export const responderPedido = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid(),
      actualizadoEm: z.string(),
      estado: z.enum(["aberto", "em_curso", "resolvido"]),
      resposta: z.string().trim().max(5000).nullable(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await exigirAdmin(context as Ctx);
    const { data: r, error } = await context.supabase.from("pedidos_suporte")
      .update({ estado: data.estado, resposta: data.resposta || null, actualizado_em: new Date().toISOString() })
      .eq("id", data.id).eq("actualizado_em", data.actualizadoEm).select("id");
    if (error) throw new Error(error.message);
    return { estado: (r?.length ? "gravado" : "conflito") as "gravado" | "conflito" };
  });
