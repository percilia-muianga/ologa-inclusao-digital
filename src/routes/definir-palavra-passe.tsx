import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/definir-palavra-passe")({
  head: () => ({
    meta: [{ title: "Definir palavra-passe — Ologa" }],
  }),
  component: DefinirPage,
});

function DefinirPage() {
  const navigate = useNavigate();
  const passId = useId();
  const errId = useId();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sessao, setSessao] = useState<"a_verificar" | "ok" | "sem_sessao">("a_verificar");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Supabase processa o link (invite/recovery) automaticamente e cria a sessão.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSessao(data.session ? "ok" : "sem_sessao");
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSessao("ok");
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setErro("Não foi possível definir a palavra-passe. Tente novamente.");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      navigate({ to: "/entrar" });
      return;
    }
    const { data: perfil } = await supabase
      .from("perfis")
      .select("papel")
      .eq("id", userData.user.id)
      .maybeSingle();
    const papel = perfil?.papel;
    if (papel === "admin_ologa") navigate({ to: "/ologa" });
    else if (papel === "gestor_instituicao") navigate({ to: "/instituicao" });
    else navigate({ to: "/formacao" });
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">Definir palavra-passe</h1>

        {sessao === "a_verificar" && (
          <p className="mt-4 text-base text-foreground" role="status" aria-live="polite">A verificar o link…</p>
        )}

        {sessao === "sem_sessao" && (
          <div role="alert" className="mt-4 rounded-md border border-brand/40 bg-brand/5 p-4">
            <p className="text-base text-ink">
              Este link não é válido ou já foi utilizado. Peça um novo link para recuperar
              a palavra-passe.
            </p>
            <div className="mt-4">
              <Link to="/recuperar" className="font-semibold text-ink underline">Pedir novo link</Link>
            </div>
          </div>
        )}

        {sessao === "ok" && (
          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5" aria-describedby={erro ? errId : undefined}>
            <div>
              <label htmlFor={passId} className="block text-base font-semibold text-ink">Nova palavra-passe</label>
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
              <p id={`${passId}-hint`} className="mt-1 text-sm text-muted-foreground">Mínimo 8 caracteres.</p>
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
