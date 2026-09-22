import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useId, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { garantirPerfil } from "@/lib/conta.functions";
import { destinoAposEntrada } from "@/lib/navegacao-painel";
import { PlataformaHeader } from "@/components/plataforma-header";
import { PlataformaFooter } from "@/components/plataforma-footer";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Entrada na área reservada da Plataforma Nacional de Capacitação Digital, por email e palavra-passe.",
      },
      { property: "og:title", content: "Entrar — Plataforma Nacional de Capacitação Digital" },
      {
        property: "og:description",
        content: "Entrada na área reservada da Plataforma Nacional de Capacitação Digital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EntrarPage,
});

function EntrarPage() {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement | null>(null);
  const emailId = useId();
  const passId = useId();
  const errId = useId();
  const criarPerfil = useServerFn(garantirPerfil);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setErro("Email ou palavra-passe incorrectos.");
      setLoading(false);
      return;
    }

    try {
      // Garante que o perfil existe; o destino não depende do resultado.
      await criarPerfil();
    } catch {
      /* o painel volta a ler a sessão e mostra o que a conta pode ver */
    }

    // Destino interno fixo: a área reservada decide o que mostrar conforme o
    // perfil e os papéis lidos no servidor. Não se segue nenhum endereço vindo
    // do navegador, por isso não há ciclos nem reencaminhamento para fora.
    navigate({ to: destinoAposEntrada() });
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <PlataformaHeader />
      <main id="conteudo" ref={ref} className="wrap max-w-md py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold text-navy">Entrar</h1>
          <ListenButton getFalas={() => extrairFalasDeElemento(ref.current)} />
        </div>
        <p className="mt-2 text-base text-navy-2">
          Área reservada da plataforma. Os módulos de literacia digital continuam abertos a
          todas as pessoas, sem conta.
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-8 space-y-5"
          aria-describedby={erro ? errId : undefined}
        >
          <div>
            <label htmlFor={emailId} className="block text-base font-semibold text-navy">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label htmlFor={passId} className="block text-base font-semibold text-navy">
              Palavra-passe
            </label>
            <input
              id={passId}
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          {erro && (
            <p id={errId} role="alert" className="rounded-md border border-line bg-page p-3 text-base text-navy">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-md bg-navy px-6 py-3 text-base font-semibold text-white disabled:opacity-70"
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-base">
          <Link to="/recuperar-palavra-passe" className="font-semibold underline text-navy">
            Esqueci-me da palavra-passe
          </Link>
          <Link to="/criar-conta" className="font-semibold underline text-navy">
            Criar conta
          </Link>
          <Link to="/" className="text-navy-2 underline">
            Voltar ao início
          </Link>
        </div>
      </main>
      <PlataformaFooter />
    </>
  );
}
