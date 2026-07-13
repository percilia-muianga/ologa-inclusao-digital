import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/definir-palavra-passe")({
  head: () => ({
    meta: [{ title: "Definir palavra-passe — Ologa" }],
  }),
  component: DefinirPage,
});

type EstadoSessao =
  | { estado: "a_verificar" }
  | { estado: "ok" }
  | { estado: "erro"; mensagem: string };

function DefinirPage() {
  const navigate = useNavigate();
  const passId = useId();
  const errId = useId();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sessao, setSessao] = useState<EstadoSessao>({ estado: "a_verificar" });

  useEffect(() => {
    let cancelado = false;

    async function estabelecerSessao() {
      const url = new URL(window.location.href);

      // Evita que uma sessão pré-existente (ex.: admin na mesma janela) interfira
      // com a sessão de recuperação/convite.
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});

      // 1) Formato novo (query): ?token_hash=...&type=recovery|invite
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
          // Limpa o token do endereço.
          window.history.replaceState({}, "", url.pathname);
          setSessao({ estado: "ok" });
        }
        return;
      }

      // 2) Formato antigo (fragmento): #access_token=...&refresh_token=...&type=recovery
      //    ou erros: #error=...&error_description=...
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
            setSessao({ estado: "ok" });
          }
          return;
        }
      }

      // 3) Sem token no endereço — pode já haver sessão (detectSessionInUrl anterior).
      const { data } = await supabase.auth.getSession();
      if (cancelado) return;
      if (data.session) {
        setSessao({ estado: "ok" });
      } else {
        setSessao({
          estado: "erro",
          mensagem: "Este link já foi utilizado ou é inválido. Peça um novo.",
        });
      }
    }

    estabelecerSessao();

    return () => {
      cancelado = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      console.error("[definir-palavra-passe] updateUser falhou:", error);
      setErro(traduzirErroPassword(error.message) + ` (detalhe: ${error.message})`);
      return;
    }
    await supabase.auth.signOut();
    setLoading(false);
    navigate({ to: "/entrar" });
  }

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

        {sessao.estado === "ok" && (
          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5" aria-describedby={erro ? errId : undefined}>
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

function mensagemErro(bruto: string): string {
  const m = bruto.toLowerCase();
  if (m.includes("expired") || m.includes("expirad")) {
    return "Este link expirou. Peça um novo.";
  }
  return "Este link já foi utilizado ou é inválido. Peça um novo.";
}

function traduzirErroPassword(bruto: string): string {
  const m = bruto.toLowerCase();
  if (m.includes("same") && m.includes("password")) {
    return "A nova palavra-passe tem de ser diferente da anterior.";
  }
  if (m.includes("weak") || m.includes("pwned") || m.includes("leaked") || m.includes("compromised")) {
    return "Esta palavra-passe é demasiado fraca ou foi encontrada em fugas de dados conhecidas. Escolha outra.";
  }
  if (m.includes("at least") || m.includes("short") || m.includes("length")) {
    return "A palavra-passe não cumpre os requisitos mínimos.";
  }
  if (m.includes("session") || m.includes("jwt") || m.includes("auth")) {
    return "A sessão de recuperação expirou. Peça um novo link.";
  }
  return "Não foi possível definir a palavra-passe.";
}
