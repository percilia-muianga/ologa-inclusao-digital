import { ErroPermissao } from "@/components/erro-permissao";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PlataformaPagina } from "@/components/plataforma-pagina";
import { FormularioTurma, botaoPrimario, botaoSecundario } from "@/components/formulario-turma";
import { criarTurma, referenciasTurma, type DadosTurma } from "@/lib/turmas.functions";

export const Route = createFileRoute("/turmas/nova")({
  ssr: false,
  errorComponent: ({ error }) => <ErroPermissao erro={error} />,
  loader: () => referenciasTurma(),
  head: () => ({
    meta: [
      { title: "Criar turma — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Registo de uma turma: curso, província e distrito do local de formação, modalidade, formadores, datas, computadores da sala e estado.",
      },
      { property: "og:title", content: "Criar turma" },
      {
        property: "og:description",
        content:
          "O código de inscrição é gerado automaticamente e mostrado depois de gravar, pronto a ser ditado por telefone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NovaTurmaPage,
});

function NovaTurmaPage() {
  const referencias = Route.useLoaderData();
  const criar = useServerFn(criarTurma);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [criada, setCriada] = useState<{ codigo: string; designacao: string } | null>(null);

  async function gravar(dados: DadosTurma) {
    setErro(null);
    setAGuardar(true);
    try {
      const nova = await criar({ data: dados });
      setCriada({ codigo: nova.codigo_inscricao, designacao: nova.designacao });
    } catch {
      setErro("Não foi possível gravar a turma. Verifique os dados e tente novamente.");
    } finally {
      setAGuardar(false);
    }
  }

  if (criada) {
    return (
      <PlataformaPagina titulo="Turma criada">
        <section
          aria-labelledby="codigo-novo"
          className="rounded-lg border border-line bg-white p-5"
        >
          <h2 id="codigo-novo" className="text-xl font-bold text-navy">
            {criada.designacao}
          </h2>
          <p className="mt-2 text-base text-navy-2">
            Código de inscrição da turma. Pode ser ditado ao telefone ou enviado por SMS: não tem a
            letra O, o zero, a letra I, a letra L nem o número um.
          </p>
          <p className="mt-4 font-mono text-3xl font-bold tracking-widest text-navy">
            {criada.codigo}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/turmas/$codigo"
              params={{ codigo: criada.codigo }}
              className={botaoPrimario}
            >
              Abrir a turma e agendar sessões
            </Link>
            <Link to="/turmas" className={botaoSecundario}>
              Voltar à lista de turmas
            </Link>
          </div>
        </section>
      </PlataformaPagina>
    );
  }

  return (
    <PlataformaPagina
      titulo="Criar turma"
      introducao="A província e o distrito indicados são os do local de formação, porque é por eles que o Painel Nacional reporta — podem ser diferentes da província de registo do formando."
    >
      <FormularioTurma
        referencias={referencias}
        textoBotao="Gravar turma"
        aGuardar={aGuardar}
        erro={erro}
        onSubmeter={gravar}
        accaoSecundaria={
          <Link to="/turmas" className={botaoSecundario}>
            Cancelar
          </Link>
        }
      />
    </PlataformaPagina>
  );
}
