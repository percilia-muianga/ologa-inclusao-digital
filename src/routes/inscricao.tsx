import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  FormularioInstituicao,
  type Modulo,
  type PayloadInstituicao,
} from "@/components/formulario-instituicao";
import { criarInscricao, listarModulosPublico } from "@/lib/inscricao.functions";

export const Route = createFileRoute("/inscricao")({
  head: () => ({
    meta: [
      { title: "Inscrever a minha instituição — Ologa" },
      {
        name: "description",
        content:
          "Formulário público de inscrição de instituições para a formação da Ologa.",
      },
    ],
  }),
  component: InscricaoPage,
});

function InscricaoPage() {
  const listar = useServerFn(listarModulosPublico);
  const criar = useServerFn(criarInscricao);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [modulosCarregados, setModulosCarregados] = useState(false);
  const [aSubmeter, setASubmeter] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [codigo, setCodigo] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<"codigo" | "link" | null>(null);

  useEffect(() => {
    let cancelado = false;
    listar().then((res) => {
      if (cancelado) return;
      if (res.ok) setModulos(res.modulos as Modulo[]);
      setModulosCarregados(true);
    });
    return () => {
      cancelado = true;
    };
  }, [listar]);

  async function onSubmit(payload: PayloadInstituicao) {
    setErro(null);
    setASubmeter(true);
    const res = await criar({ data: { ...payload, consentimento: true } });
    setASubmeter(false);
    if (res.ok) {
      setCodigo(res.codigo);
      setToken(res.indicadores_token);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErro(
        res.mensagem ||
          "Não foi possível concluir a inscrição. Tente novamente daqui a instantes.",
      );
    }
  }

  async function copiar(texto: string, qual: "codigo" | "link") {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(qual);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      /* sem clipboard: o utilizador copia à mão */
    }
  }

  if (codigo && token) {
    const linkIndicadores =
      typeof window !== "undefined"
        ? `${window.location.origin}/indicadores/${token}`
        : `/indicadores/${token}`;
    return (
      <>
        <a href="#conteudo" className="skip-link">
          Saltar para o conteúdo principal
        </a>
        <main id="conteudo" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h1 className="text-3xl font-extrabold text-ink">Inscrição registada</h1>
          <p className="mt-4 text-base text-ink">
            Guarde estes dois elementos. Estão disponíveis apenas neste ecrã — não
            são enviados por email.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div
              role="status"
              aria-live="polite"
              className="rounded-md border border-ink/20 bg-accent p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-ink/70">
                Código de inscrição da instituição
              </p>
              <p className="mt-2 font-mono text-3xl font-extrabold tracking-widest text-ink">
                {codigo}
              </p>
              <p className="mt-3 text-sm text-foreground">
                Os colaboradores escrevem este código ao pedir o certificado.
              </p>
              <button
                type="button"
                onClick={() => copiar(codigo, "codigo")}
                className="mt-4 inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-white/70"
              >
                {copiado === "codigo" ? "✓ Copiado" : "Copiar código"}
              </button>
            </div>

            <div className="rounded-md border border-ink/20 bg-accent p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-ink/70">
                Link dos indicadores
              </p>
              <p className="mt-2 break-all font-mono text-sm text-ink">
                {linkIndicadores}
              </p>
              <p className="mt-3 text-sm text-foreground">
                Guarde este link. Dá acesso aos indicadores da sua instituição.
                Não o partilhe fora dela.
              </p>
              <button
                type="button"
                onClick={() => copiar(linkIndicadores, "link")}
                className="mt-4 inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-white/70"
              >
                {copiado === "link" ? "✓ Copiado" : "Copiar link"}
              </button>
            </div>
          </div>

          <div className="mt-10">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-accent"
            >
              Voltar ao início
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">
          Inscrever a minha instituição
        </h1>
        <p className="mt-2 text-base text-foreground">
          Preencha os dados da instituição. No fim, receberá um código de inscrição
          para partilhar com os colaboradores que vão fazer a formação.
        </p>

        <div className="mt-8">
          <FormularioInstituicao
            modo="publico"
            modulos={modulos}
            modulosCarregados={modulosCarregados}
            aSubmeter={aSubmeter}
            onSubmit={onSubmit}
            textoBotao="Submeter inscrição"
            mensagemErro={erro}
          />
        </div>
      </main>
    </>
  );
}
