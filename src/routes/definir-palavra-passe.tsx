import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useId, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  marcarPasswordDefinida,
  verificarConvite,
  definirPasswordViaConvite,
} from "@/lib/colaboradores.functions";


export const Route = createFileRoute("/definir-palavra-passe")({
  head: () => ({
    meta: [{ title: "Definir palavra-passe — Ologa" }],
  }),
  component: DefinirPage,
});

type EstadoSessao =
  | { estado: "a_verificar" }
  | { estado: "ok_convite"; token: string; email: string }
  | { estado: "ok_recovery" }
  | { estado: "erro"; mensagem: string };

function DefinirPage() {
  const navigate = useNavigate();
  const marcar = useServerFn(marcarPasswordDefinida);
  const verificar = useServerFn(verificarConvite);
  const definirConvite = useServerFn(definirPasswordViaConvite);
  const passId = useId();
  const errId = useId();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sessao, setSessao] = useState<EstadoSessao>({ estado: "a_verificar" });

  useEffect(() => {
    let cancelado = false;

    async function estabelecer() {
      const url = new URL(window.location.href);

      // FLUXO CONVITE: ?convite=<token>. Não usa sessão Supabase.
      const convite = url.searchParams.get("convite");
      if (convite) {
        const res = await verificar({ data: { token: convite } });
        if (cancelado) return;
        if (!res.ok) {
          setSessao({ estado: "erro", mensagem: mensagemConvite(res.motivo) });
          return;
        }
        setSessao({ estado: "ok_convite", token: convite, email: res.email });
        return;
      }

      // FLUXO RECOVERY normal (link Supabase de 1h). Estabelece sessão.
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});

      const tokenHash = url.searchParams.get("token_hash");
      const tipoQuery = url.searchParams.get("type");
      if (tokenHash && (tipoQuery === "recovery" || tipoQuery === "invite")) {
        const { error } = await supabase.auth.verifyOtp({
          type: tipoQuery,
          token_hash: tokenHash,
        });
        if (cancelado) return;
        if (error) {
          setSessao({ estado: "erro", mensagem: mensagemErro(error.message) });
        } else {
          window.history.replaceState({}, "", url.pathname);
          setSessao({ estado: "ok_recovery" });
        }
        return;
      }

      if (url.hash && url.hash.length > 1) {
        const hashParams = new URLSearchParams(url.hash.slice(1));
        const erroHash = hashParams.get("error_description") || hashParams.get("error");
        if (erroHash) {
          setSessao({ estado: "erro", mensagem: mensagemErro(erroHash) });
          return;
        }
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (cancelado) return;
          if (error) {
            setSessao({ estado: "erro", mensagem: mensagemErro(error.message) });
          } else {
            window.history.replaceState({}, "", url.pathname);
            setSessao({ estado: "ok_recovery" });
          }
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (cancelado) return;
      if (data.session) {
        setSessao({ estado: "ok_recovery" });
      } else {
        setSessao({
          estado: "erro",
          mensagem: "Este link já foi utilizado ou é inválido. Peça um novo.",
        });
      }
    }

    estabelecer();

    return () => {
      cancelado = true;
    };
  }, [verificar]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    if (sessao.estado === "ok_convite") {
      const res = await definirConvite({ data: { token: sessao.token, password } });
      setLoading(false);
      if (!res.ok) {
        if (res.motivo === "password_invalida") {
          setErro(traduzirErroPassword(res.mensagem ?? ""));
        } else {
          setErro(mensagemConvite(res.motivo));
        }
        return;
      }
      navigate({ to: "/entrar" });
      return;
    }

    if (sessao.estado === "ok_recovery") {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setLoading(false);
        setErro(traduzirErroPassword(error.message));
        return;
      }
      try {
        await marcar();
      } catch (e) {
        console.error("[definir-palavra-passe] marcarPasswordDefinida falhou:", e);
      }
      await supabase.auth.signOut();
      setLoading(false);
      navigate({ to: "/entrar" });
    }
  }

  const emSessao = sessao.estado === "ok_convite" || sessao.estado === "ok_recovery";

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">Definir palavra-passe</h1>

        {sessao.estado === "a_verificar" && (
          <p className="mt-4 text-base text-foreground" role="status" aria-live="polite">
            A verificar o link…
          </p>
        )}

        {sessao.estado === "erro" && (
          <div role="alert" className="mt-4 rounded-md border border-brand/40 bg-brand/5 p-4">
            <p className="text-base text-ink">{sessao.mensagem}</p>
            <div className="mt-4">
              <Link to="/recuperar" className="font-semibold text-ink underline">
                Pedir novo link
              </Link>
            </div>
          </div>
        )}

        {emSessao && (
          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5" aria-describedby={erro ? errId : undefined}>
            {sessao.estado === "ok_convite" && (
              <p className="text-base text-foreground">
                Conta: <strong className="text-ink">{sessao.email}</strong>
              </p>
            )}
            <div>
              <label htmlFor={passId} className="block text-base font-semibold text-ink">
                Nova palavra-passe
              </label>
              <input
                id={passId}
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
                aria-describedby={`${passId}-hint`}
              />
              <p id={`${passId}-hint`} className="mt-1 text-sm text-muted-foreground">
                Mínimo 8 caracteres.
              </p>
            </div>
            {erro && (
              <p id={errId} role="alert" className="rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
                {erro}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-ink px-6 py-3 text-base font-semibold text-ink-foreground disabled:opacity-70"
            >
              {loading ? "A guardar…" : "Guardar palavra-passe"}
            </button>
          </form>
        )}
      </main>
    </>
  );
}

function mensagemConvite(motivo: string): string {
  switch (motivo) {
    case "expirado":
      return "Este convite expirou (validade de 30 dias). Peça um novo link ao gestor da sua instituição.";
    case "usado":
      return "Este convite já foi utilizado. Se ainda não definiu a palavra-passe, peça um novo link.";
    case "invalidado":
      return "Este convite foi substituído por um mais recente. Use o link mais recente que recebeu.";
    case "ja_ativada":
      return "Esta conta já está ativada. Use a opção “Recuperar palavra-passe” para redefinir.";
    default:
      return "Este link é inválido. Peça um novo link ao gestor da sua instituição.";
  }
}

function mensagemErro(bruto: string): string {
  const m = bruto.toLowerCase();
  if (m.includes("expired") || m.includes("expirad")) {
    return "Este link expirou. Peça um novo.";
  }
  return "Este link já foi utilizado ou é inválido. Peça um novo.";
}

function traduzirErroPassword(bruto: string): string {
  const m = bruto.toLowerCase();
  if (m.includes("pwned") || m.includes("leaked") || m.includes("compromised") || m.includes("known to be weak") || (m.includes("weak") && m.includes("password"))) {
    return "Esta palavra-passe é demasiado comum e já apareceu em fugas de dados. Escolha outra.";
  }
  if (m.includes("same") && m.includes("password")) {
    return "A nova palavra-passe tem de ser diferente da anterior.";
  }
  if (m.includes("at least") || m.includes("short") || m.includes("length")) {
    return "A palavra-passe é demasiado curta. Use pelo menos 8 caracteres.";
  }
  if (m.includes("session") || m.includes("jwt") || m.includes("auth")) {
    return "A sessão de recuperação expirou. Peça um novo link.";
  }
  return "Não foi possível definir a palavra-passe. Tente outra.";
}
