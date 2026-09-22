import { createFileRoute, Link } from "@tanstack/react-router";
import { useId, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlataformaHeader } from "@/components/plataforma-header";
import { PlataformaFooter } from "@/components/plataforma-footer";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";
import {
  MENSAGEM_PEDIDO_GENERICA,
  emailComForma,
  enderecoDeRetorno,
} from "@/lib/recuperacao-palavra-passe";

export const Route = createFileRoute("/recuperar-palavra-passe")({
  head: () => ({
    meta: [
      { title: "Recuperar palavra-passe — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Peça uma mensagem de correio electrónico para definir uma nova palavra-passe da sua conta na Plataforma Nacional de Capacitação Digital.",
      },
      {
        property: "og:title",
        content: "Recuperar palavra-passe — Plataforma Nacional de Capacitação Digital",
      },
      {
        property: "og:description",
        content: "Pedido de nova palavra-passe da conta da plataforma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecuperarPage,
});

function RecuperarPage() {
  const ref = useRef<HTMLElement | null>(null);
  const emailId = useId();
  const erroId = useId();

  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [aEnviar, setAEnviar] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!emailComForma(email)) {
      setErro("Escreva um email válido, por exemplo nome@organizacao.mz.");
      return;
    }
    setAEnviar(true);
    const origem = typeof window === "undefined" ? null : window.location.origin;
    try {
      // O envio é feito pelo mecanismo nativo de recuperação do fornecedor de
      // autenticação. A resposta é sempre a mesma, exista ou não a conta.
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: enderecoDeRetorno(origem),
      });
    } catch {
      /* resposta genérica também em caso de falha do envio */
    }
    setAEnviar(false);
    setEnviado(true);
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <PlataformaHeader />
      <main id="conteudo" ref={ref} className="wrap max-w-md py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold text-navy">Recuperar palavra-passe</h1>
          <ListenButton getFalas={() => extrairFalasDeElemento(ref.current)} />
        </div>
        <p className="mt-2 text-base text-navy-2">
          Escreva o email da sua conta. Enviamos uma mensagem com uma ligação para definir
          uma nova palavra-passe.
        </p>

        {enviado ? (
          <div
            role="status"
            className="mt-8 rounded-md border border-line bg-page p-4 text-base text-navy"
          >
            <p>{MENSAGEM_PEDIDO_GENERICA}</p>
            <p className="mt-3 text-navy-2">
              A ligação é válida por tempo limitado. Se não chegar, pode pedir outra dentro
              de alguns minutos.
            </p>
            <button
              type="button"
              onClick={() => setEnviado(false)}
              className="mt-4 min-h-12 rounded-md border border-navy px-5 py-2 text-base font-semibold text-navy"
            >
              Pedir outra ligação
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-8 space-y-5"
            aria-describedby={erro ? erroId : undefined}
          >
            <div>
              <label htmlFor={emailId} className="block text-base font-semibold text-navy">
                Email da conta
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={erro ? true : undefined}
                className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>

            {erro && (
              <p
                id={erroId}
                role="alert"
                className="rounded-md border border-line bg-page p-3 text-base text-navy"
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={aEnviar}
              className="min-h-12 w-full rounded-md bg-navy px-6 py-3 text-base font-semibold text-white disabled:opacity-70"
            >
              {aEnviar ? "A enviar…" : "Enviar ligação de recuperação"}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-2 text-base">
          <Link to="/entrar" className="font-semibold underline text-navy">
            Voltar a entrar
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
