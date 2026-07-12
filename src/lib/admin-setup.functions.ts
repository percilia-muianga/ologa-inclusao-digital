import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  origin: z.string().url(),
});

export const criarAdminOlogaUnico = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Refuse if any admin_ologa already exists.
    const { data: existentes, error: exErr } = await supabaseAdmin
      .from("perfis")
      .select("id, email")
      .eq("papel", "admin_ologa");
    if (exErr) return { ok: false as const, erro: "consulta", mensagem: exErr.message };
    if (existentes && existentes.length > 0) {
      return { ok: false as const, erro: "ja_existe", admins: existentes };
    }

    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const randomPassword =
      Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("") + "!Aa1";

    const { data: created, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: randomPassword,
        email_confirm: true,
      });

    if (createErr || !created.user) {
      return {
        ok: false as const,
        erro: "criar",
        mensagem: createErr?.message ?? "sem utilizador",
      };
    }

    const { error: perfilErr } = await supabaseAdmin.from("perfis").insert({
      id: created.user.id,
      nome: "Administradora Ologa",
      email: data.email,
      papel: "admin_ologa",
      instituicao_id: null,
    });

    if (perfilErr) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return { ok: false as const, erro: "perfil", mensagem: perfilErr.message };
    }

    const { data: link, error: linkErr } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: data.email,
        options: { redirectTo: `${data.origin}/definir-palavra-passe` },
      });

    if (linkErr) {
      return { ok: false as const, erro: "link", mensagem: linkErr.message };
    }

    // Verify auth.users state
    const { data: userRow } = await supabaseAdmin.auth.admin.getUserById(created.user.id);

    return {
      ok: true as const,
      actionLink: link.properties?.action_link ?? null,
      userId: created.user.id,
      emailConfirmedAt: userRow.user?.email_confirmed_at ?? null,
    };
  });

export const gerarLinkReposicaoAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
      options: { redirectTo: `${data.origin}/definir-palavra-passe` },
    });
    if (error) return { ok: false as const, mensagem: error.message };
    return { ok: true as const, actionLink: link.properties?.action_link ?? null };
  });
