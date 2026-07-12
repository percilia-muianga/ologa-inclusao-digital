import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const registoSchema = z.object({
  codigo: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  nome: z.string().trim().min(1).max(200),
  genero: z
    .enum(["feminino", "masculino", "prefere_nao_indicar"])
    .nullable()
    .optional(),
  nivel_partida: z
    .enum(["nenhum", "basico", "intermedio", "prefere_nao_indicar"])
    .nullable()
    .optional(),
  tem_deficiencia: z.boolean().nullable().optional(),
  apoios_acessibilidade: z.array(z.string().min(1).max(200)).max(20).nullable().optional(),
  origin: z.string().url(),
});

export const registarFormando = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => registoSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const codigo = data.codigo.trim();
    const { data: inst, error: instErr } = await supabaseAdmin
      .from("instituicoes")
      .select("id")
      .eq("codigo_inscricao", codigo)
      .maybeSingle();

    if (instErr) {
      return { ok: false as const, erro: "servidor" as const };
    }
    if (!inst) {
      return { ok: false as const, erro: "codigo_invalido" as const };
    }

    const pub = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data: signUpData, error: signUpErr } = await pub.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${data.origin}/entrar` },
    });

    if (signUpErr || !signUpData.user) {
      return {
        ok: false as const,
        erro: "auth" as const,
        mensagem: signUpErr?.message ?? "Não foi possível criar a conta.",
      };
    }

    const { error: perfilErr } = await supabaseAdmin.from("perfis").insert({
      id: signUpData.user.id,
      nome: data.nome.trim(),
      email: data.email.trim(),
      papel: "formando",
      instituicao_id: inst.id,
      genero: data.genero ?? null,
      nivel_partida: data.nivel_partida ?? null,
      tem_deficiencia: data.tem_deficiencia ?? null,
      apoios_acessibilidade: data.apoios_acessibilidade ?? null,
    });

    if (perfilErr) {
      await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
      return {
        ok: false as const,
        erro: "perfil" as const,
        mensagem: perfilErr.message,
      };
    }

    return { ok: true as const };
  });

const reenviarSchema = z.object({
  email: z.string().trim().email(),
  origin: z.string().url(),
});

export const reenviarConfirmacao = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => reenviarSchema.parse(d))
  .handler(async ({ data }) => {
    const pub = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await pub.auth.resend({
      type: "signup",
      email: data.email,
      options: { emailRedirectTo: `${data.origin}/entrar` },
    });
    if (error) {
      return { ok: false as const, mensagem: error.message };
    }
    return { ok: true as const };
  });
