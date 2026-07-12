import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/admin-setup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const body = (await request.json()) as {
          email?: string;
          origin?: string;
          action?: "criar" | "link";
        };
        const email = body.email?.trim();
        const origin = body.origin?.trim();
        const action = body.action ?? "criar";
        if (!email || !origin) {
          return Response.json({ ok: false, erro: "input" }, { status: 400 });
        }

        if (action === "link") {
          const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: `${origin}/definir-palavra-passe` },
          });
          if (error) return Response.json({ ok: false, mensagem: error.message }, { status: 500 });
          const hashed = link.properties?.hashed_token;
          const direct = hashed
            ? `${origin}/definir-palavra-passe?token_hash=${hashed}&type=recovery`
            : null;
          return Response.json({
            ok: true,
            actionLink: link.properties?.action_link ?? null,
            directLink: direct,
          });
        }

        // Refuse if any admin_ologa already exists.
        const { data: existentes, error: exErr } = await supabaseAdmin
          .from("perfis")
          .select("id, email")
          .eq("papel", "admin_ologa");
        if (exErr) return Response.json({ ok: false, erro: "consulta", mensagem: exErr.message }, { status: 500 });
        if (existentes && existentes.length > 0) {
          return Response.json({ ok: false, erro: "ja_existe", admins: existentes }, { status: 409 });
        }

        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        const randomPassword =
          Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("") + "!Aa1";

        const { data: created, error: createErr } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password: randomPassword,
            email_confirm: true,
          });
        if (createErr || !created.user) {
          return Response.json({ ok: false, erro: "criar", mensagem: createErr?.message ?? "sem utilizador" }, { status: 500 });
        }

        const { error: perfilErr } = await supabaseAdmin.from("perfis").insert({
          id: created.user.id,
          nome: "Administradora Ologa",
          email,
          papel: "admin_ologa",
          instituicao_id: null,
        });
        if (perfilErr) {
          await supabaseAdmin.auth.admin.deleteUser(created.user.id);
          return Response.json({ ok: false, erro: "perfil", mensagem: perfilErr.message }, { status: 500 });
        }

        const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo: `${origin}/definir-palavra-passe` },
        });
        if (linkErr) return Response.json({ ok: false, erro: "link", mensagem: linkErr.message }, { status: 500 });

        const { data: userRow } = await supabaseAdmin.auth.admin.getUserById(created.user.id);
        const { data: perfilRow } = await supabaseAdmin
          .from("perfis")
          .select("id, email, papel, instituicao_id")
          .eq("id", created.user.id)
          .maybeSingle();

        return Response.json({
          ok: true,
          actionLink: link.properties?.action_link ?? null,
          userId: created.user.id,
          emailConfirmedAt: userRow.user?.email_confirmed_at ?? null,
          perfil: perfilRow,
        });
      },
    },
  },
});
