import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useId, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { garantirPerfil } from "@/lib/conta.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Ologa" },
      {
        name: "description",
        content:
          "Entrada na área reservada da plataforma de literacia digital da Ologa, por email e palavra-passe.",
      },
      { property: "og:title", content: "Entrar — Ologa" },
      {
        property: "og:description",
        content: "Entrada na área reservada da plataforma de literacia digital da Ologa.",
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
      const sessao = await criarPerfil();
      if (sessao.papeis.length > 0) {
        navigate({ to: "/painel" });
        return;
      }
    } catch {
      /* segue para a verificação da área interna existente */
    }

    const { data: perfil } = await supabase
      .from("perfis")
      .select("papel")
      .eq("id", data.user.id)
      .maybeSingle();
    if (perfil?.papel === "admin_ologa") {
      navigate({ to: "/gestao/instituicoes" });
      return;
    }

    navigate({ to: "/painel" });
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <SiteHeader />
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
          <Link to="/criar-conta" className="font-semibold underline text-navy">
            Criar conta
          </Link>
          <Link to="/" className="text-navy-2 underline">
            Voltar ao início
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
