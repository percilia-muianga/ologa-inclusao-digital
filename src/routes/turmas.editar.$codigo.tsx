import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";
import { FormularioTurma, botaoPrimario, botaoSecundario } from "@/components/formulario-turma";
import {
  actualizarTurma,
  obterTurma,
  referenciasTurma,
  type DadosTurma,
} from "@/lib/turmas.functions";

export const Route = createFileRoute("/turmas/editar/$codigo")({
  loader: async ({ params }) => {
    const [dados, referencias] = await Promise.all([
      obterTurma({ data: params.codigo }),
      referenciasTurma(),
    ]);
    return { dados, referencias };
  },
  head: ({ params }) => ({
    meta: [
      { title: `Editar turma ${params.codigo} — Plataforma Nacional de Capacitação Digital` },
      {
        name: "description",
        content:
          "Alteração dos dados de uma turma: curso, local de formação, modalidade, formadores, datas, computadores da sala e estado. Toda a alteração fica no registo de auditoria.",
      },
      { property: "og:title", content: `Editar turma ${params.codigo}` },
      {
        property: "og:description",
        content: "As alterações às turmas ficam registadas na auditoria da plataforma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditarTurmaPage,
});

function EditarTurmaPage() {
  const { dados, referencias } = Route.useLoaderData();
  const { codigo } = Route.useParams();
  const actualizar = useServerFn(actualizarTurma);
  const navigate = useNavigate();
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!dados) {
    return (
      <PlataformaPagina titulo="Turma não encontrada">
        <EstadoVazio
          titulo={`Não existe nenhuma turma com o código ${codigo}`}
          descricao="Confirme o código na lista de turmas."
          accao={
            <Link to="/turmas" className={botaoPrimario}>
              Ver todas as turmas
            </Link>
          }
        />
      </PlataformaPagina>
    );
  }

  const { turma } = dados;

  async function gravar(valores: DadosTurma) {
    setErro(null);
    setAGuardar(true);
    try {
      const actualizada = await actualizar({ data: { ...valores, id: turma.id } });
      navigate({ to: "/turmas/$codigo", params: { codigo: actualizada.codigo_inscricao } });
    } catch {
      setErro("Não foi possível gravar as alterações. Verifique os dados e tente novamente.");
      setAGuardar(false);
    }
  }

  return (
    <PlataformaPagina
      titulo={`Editar turma ${turma.codigo_inscricao}`}
      introducao="Toda a alteração a uma turma fica no registo de auditoria, com o valor anterior, o valor novo, a data e a hora."
    >
      <FormularioTurma
        referencias={referencias}
        inicial={{
          cursoId: turma.curso_id,
          designacao: turma.designacao,
          provincia: turma.provincia,
          distrito: turma.distrito,
          localFormacao: turma.local_formacao,
          modalidade: turma.modalidade,
          formadorPrincipal: turma.formador_principal_nome,
          formadoresAuxiliares: turma.formadores_auxiliares,
          dataInicio: turma.data_inicio,
          dataFim: turma.data_fim,
          numComputadores: turma.num_computadores,
          estado: turma.estado,
        }}
        textoBotao="Gravar alterações"
        aGuardar={aGuardar}
        erro={erro}
        onSubmeter={gravar}
        accaoSecundaria={
          <Link
            to="/turmas/$codigo"
            params={{ codigo: turma.codigo_inscricao }}
            className={botaoSecundario}
          >
            Cancelar
          </Link>
        }
      />
    </PlataformaPagina>
  );
}
