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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErro(
        res.mensagem ||
          "Não foi possível concluir a inscrição. Tente novamente daqui a instantes.",
      );
    }
  }

  if (codigo) {
    return (
      <>
        <a href="#conteudo" className="skip-link">
          Saltar para o conteúdo principal
        </a>
        <main id="conteudo" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <h1 className="text-3xl font-extrabold text-ink">Inscrição registada</h1>
          <p className="mt-4 text-base text-ink">
            A inscrição da instituição foi registada com sucesso. Guarde e partilhe o
            código abaixo com os colaboradores que se vão inscrever na formação.
          </p>
          <div
            role="status"
            aria-live="polite"
            className="mt-6 rounded-md border border-ink/20 bg-accent p-6"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-ink/70">
              Código de inscrição da instituição
            </p>
            <p className="mt-2 font-mono text-4xl font-extrabold tracking-widest text-ink">
              {codigo}
            </p>
          </div>
          <p className="mt-6 text-base text-foreground">
            Cada colaborador vai precisar deste código para criar a sua conta em
            /registo. Anote-o em local seguro — o código é curto e fácil de ditar ao
            telefone.
          </p>
          <div className="mt-8">
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
