import { createFileRoute, Link, useNavigate, useServerFn } from "@tanstack/react-router";
import { useState, useId } from "react";
import { supabase } from "@/integrations/supabase/client";
import { reenviarConfirmacao } from "@/lib/auth.functions";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [{ title: "Entrar — Ologa" }],
  }),
  component: EntrarPage,
});

function EntrarPage() {
  const navigate = useNavigate();
  const reenviar = useServerFn(reenviarConfirmacao);
  const emailId = useId();
  const passId = useId();
  const errId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [naoConfirmado, setNaoConfirmado] = useState(false);
  const [reenviado, setReenviado] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setNaoConfirmado(false);
    setReenviado(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("not confirmed") || msg.includes("confirm")) {
        setNaoConfirmado(true);
      } else if (msg.includes("invalid")) {
        setErro("Email ou palavra-passe incorretos.");
      } else {
        setErro("Não foi possível entrar. Tente novamente.");
      }
      setLoading(false);
      return;
    }
    if (!data.user) {
      setErro("Não foi possível entrar. Tente novamente.");
      setLoading(false);
      return;
    }
    const { data: perfil } = await supabase
      .from("perfis")
      .select("papel")
      .eq("id", data.user.id)
      .maybeSingle();
    const papel = perfil?.papel;
    if (papel === "admin_ologa") navigate({ to: "/ologa" });
    else if (papel === "gestor_instituicao") navigate({ to: "/instituicao" });
    else navigate({ to: "/formacao" });
  }

  async function onReenviar() {
    setReenviado(null);
    const res = await reenviar({ data: { email, origin: window.location.origin } });
    if (res.ok) setReenviado("Enviámos um novo email de confirmação. Verifique a sua caixa de entrada.");
    else setReenviado("Não foi possível reenviar agora. Tente novamente daqui a alguns minutos.");
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">Entrar</h1>
        <p className="mt-2 text-base text-foreground">Introduza o seu email e a sua palavra-passe.</p>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5" aria-describedby={erro ? errId : undefined}>
          <div>
            <label htmlFor={emailId} className="block text-base font-semibold text-ink">Email</label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>
          <div>
            <label htmlFor={passId} className="block text-base font-semibold text-ink">Palavra-passe</label>
            <input
              id={passId}
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          {erro && (
            <p id={errId} role="alert" className="rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
              {erro}
            </p>
          )}

          {naoConfirmado && (
            <div role="alert" className="rounded-md border border-ink/20 bg-accent p-3">
              <p className="text-base text-ink">Ainda não confirmou o seu email. Verifique a sua caixa de entrada.</p>
              <button
                type="button"
                onClick={onReenviar}
                className="mt-3 inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-3 text-base font-semibold text-ink hover:bg-accent"
              >
                Reenviar email de confirmação
              </button>
              {reenviado && (
                <p role="status" aria-live="polite" className="mt-2 text-base text-ink">{reenviado}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-ink px-6 py-3 text-base font-semibold text-ink-foreground disabled:opacity-70"
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-base">
          <Link to="/recuperar" className="font-semibold text-ink underline">Esqueci-me da palavra-passe</Link>
          <Link to="/registo" className="font-semibold text-ink underline">Criar conta com código da instituição</Link>
          <Link to="/" className="text-muted-foreground underline">Voltar ao início</Link>
        </div>
      </main>
    </>
  );
}
