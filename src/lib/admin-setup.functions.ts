import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  origin: z.string().url(),
  setupToken: z.string().min(10),
});

export const criarAdminOlogaUnico = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_SETUP_TOKEN;
    if (!expected || data.setupToken !== expected) {
      return { ok: false as const, erro: "token" as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Random password (never revealed)
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
        erro: "criar" as const,
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
      return {
        ok: false as const,
        erro: "perfil" as const,
        mensagem: perfilErr.message,
      };
    }

    const { data: link, error: linkErr } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: data.email,
        options: { redirectTo: `${data.origin}/definir-palavra-passe` },
      });

    if (linkErr) {
      return { ok: false as const, erro: "link" as const, mensagem: linkErr.message };
    }

    return {
      ok: true as const,
      actionLink: link.properties?.action_link ?? null,
      userId: created.user.id,
    };
  });
