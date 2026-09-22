import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlataformaHeader } from "@/components/plataforma-header";
import { PlataformaFooter } from "@/components/plataforma-footer";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";
import { validarNovaPalavraPasse } from "@/lib/recuperacao-palavra-passe";

export const Route = createFileRoute("/nova-palavra-passe")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Definir nova palavra-passe — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Defina uma nova palavra-passe da sua conta na Plataforma Nacional de Capacitação Digital, a partir da ligação recebida por email.",
      },
      {
        property: "og:title",
        content: "Definir nova palavra-passe — Plataforma Nacional de Capacitação Digital",
      },
      {
        property: "og:description",
        content: "Definição de nova palavra-passe da conta da plataforma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NovaPalavraPassePage,
});

type Estado = "a-verificar" | "pronto" | "ligacao-invalida" | "concluido";

function NovaPalavraPassePage() {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement | null>(null);
  const passId = useId();
  const confirmarId = useId();
  const erroId = useId();

  const [estado, setEstado] = useState<Estado>("a-verificar");
  const [palavraPasse, setPalavraPasse] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aGravar, setAGravar] = useState(false);

  // Valida a ligação de recuperação: ou o endereço traz um erro do fornecedor
  // (ligação expirada ou já usada), ou existe uma sessão de recuperação válida.
  useEffect(() => {
    let activo = true;

    const parametrosDoEndereco = () => {
      const fragmento = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const consulta = new URLSearchParams(window.location.search);
      return fragmento.get("error") ?? consulta.get("error");
    };

    if (parametrosDoEndereco()) {
      setEstado("ligacao-invalida");
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((evento) => {
      if (!activo) return;
      if (evento === "PASSWORD_RECOVERY" || evento === "SIGNED_IN") setEstado("pronto");
    });

    const prazo = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!activo) return;
      setEstado(data.session ? "pronto" : "ligacao-invalida");
    }, 1500);

    return () => {
      activo = false;
      clearTimeout(prazo);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const validacao = validarNovaPalavraPasse(palavraPasse, confirmacao);
    if (!validacao.ok) {
      setErro(validacao.erro);
      return;
    }
    setAGravar(true);
    const { error } = await supabase.auth.updateUser({ password: palavraPasse });
    setAGravar(false);
    if (error) {
      setErro(
        "Não foi possível guardar a nova palavra-passe. A ligação pode ter expirado ou já ter sido usada. Peça outra ligação.",
      );
      return;
    }
    setEstado("concluido");
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <PlataformaHeader />
      <main id="conteudo" ref={ref} className="wrap max-w-md py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold text-navy">Definir nova palavra-passe</h1>
          <ListenButton getFalas={() => extrairFalasDeElemento(ref.current)} />
        </div>

        {estado === "a-verificar" && (
          <p role="status" className="mt-6 text-base text-navy-2">
            A verificar a ligação recebida por email…
          </p>
        )}

        {estado === "ligacao-invalida" && (
          <div
            role="alert"
            className="mt-6 rounded-md border border-line bg-page p-4 text-base text-navy"
          >
            <p>
              Esta ligação já não é válida. As ligações de recuperação expiram e só podem
              ser usadas uma vez.
            </p>
            <Link
              to="/recuperar-palavra-passe"
              className="mt-4 inline-block min-h-12 rounded-md bg-navy px-6 py-3 font-semibold text-white"
            >
              Pedir outra ligação
            </Link>
          </div>
        )}

        {estado === "concluido" && (
          <div
            role="status"
            className="mt-6 rounded-md border border-line bg-page p-4 text-base text-navy"
          >
            <p>Palavra-passe alterada. Já pode entrar com a nova palavra-passe.</p>
            <button
              type="button"
              onClick={() => navigate({ to: "/entrar" })}
              className="mt-4 min-h-12 rounded-md bg-navy px-6 py-3 font-semibold text-white"
            >
              Ir para a entrada
            </button>
          </div>
        )}

        {estado === "pronto" && (
          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-8 space-y-5"
            aria-describedby={erro ? erroId : undefined}
          >
            <div>
              <label htmlFor={passId} className="block text-base font-semibold text-navy">
                Nova palavra-passe
              </label>
              <input
                id={passId}
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={palavraPasse}
                onChange={(e) => setPalavraPasse(e.target.value)}
                aria-invalid={erro ? true : undefined}
                aria-describedby={`${passId}-ajuda`}
                className="mt-1 block w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy focus:outline-none focus:ring-2 focus:ring-navy"
              />
              <p id={`${passId}-ajuda`} className="mt-1 text-sm text-navy-2">
                Pelo menos 8 caracteres.
              </p>
            </div>

            <div>
              <label htmlFor={confirmarId} className="block text-base font-semibold text-navy">
                Confirmar a nova palavra-passe
              </label>
              <input
                id={confirmarId}
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
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
              disabled={aGravar}
              className="min-h-12 w-full rounded-md bg-navy px-6 py-3 text-base font-semibold text-white disabled:opacity-70"
            >
              {aGravar ? "A guardar…" : "Guardar nova palavra-passe"}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-2 text-base">
          <Link to="/entrar" className="font-semibold underline text-navy">
            Voltar a entrar
          </Link>
        </div>
      </main>
      <PlataformaFooter />
    </>
  );
}
