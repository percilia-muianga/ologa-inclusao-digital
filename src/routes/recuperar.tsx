import { createFileRoute, Link } from "@tanstack/react-router";
import { useId, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/recuperar")({
  head: () => ({
    meta: [{ title: "Recuperar palavra-passe — Ologa" }],
  }),
  component: RecuperarPage,
});

function RecuperarPage() {
  const emailId = useId();
  const errId = useId();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/definir-palavra-passe`,
    });
    setLoading(false);
    if (error) {
      setErro("Não foi possível enviar o email. Tente novamente.");
      return;
    }
    setEnviado(true);
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">Saltar para o conteúdo principal</a>
      <main id="conteudo" className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">Recuperar palavra-passe</h1>
        <p className="mt-2 text-base text-foreground">
          Indique o email da sua conta. Vamos enviar-lhe um link para definir uma nova palavra-passe.
        </p>

        {enviado ? (
          <div role="status" aria-live="polite" className="mt-8 rounded-md border border-ink/20 bg-accent p-4">
            <p className="text-base text-ink">Se existe uma conta com esse email, receberá em breve um email com o link.</p>
            <div className="mt-4">
              <Link to="/entrar" className="font-semibold text-ink underline">Voltar a Entrar</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5" aria-describedby={erro ? errId : undefined}>
            <div>
              <label htmlFor={emailId} className="block text-base font-semibold text-ink">Email</label>
              <input
                id={emailId}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
              />
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
              {loading ? "A enviar…" : "Enviar email"}
            </button>
          </form>
        )}

        <div className="mt-6">
          <Link to="/entrar" className="font-semibold text-ink underline">Voltar a Entrar</Link>
        </div>
      </main>
    </>
  );
}
