import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { usePapelActivo } from "@/hooks/use-sessao";
import { PAPEIS, PERFIL_ADMIN_GERAL, NOME_ADMIN_GERAL } from "@/lib/papeis";
import { ListenButton, extrairFalasDeElemento } from "@/components/listen-button";

export const Route = createFileRoute("/_authenticated/painel/")({
  component: PainelInicio,
});

type Atalho = { to: string; titulo: string; texto: string };

const ATALHOS_ADMIN: Atalho[] = [
  {
    to: "/gestao/instituicoes",
    titulo: "Instituições",
    texto:
      "Lista das instituições inscritas e criação manual de uma instituição. Não é preciso criar nenhuma para usar as restantes áreas.",
  },
  {
    to: "/painel/utilizadores",
    titulo: "Gestão de utilizadores",
    texto: "Lista de contas, papéis atribuídos e contas marcadas como TESTE.",
  },
  {
    to: "/painel/equipa",
    titulo: "Contas de demonstração e de teste",
    texto: "Criar as seis contas de teste, atribuir os seis papéis à conta de demonstração e remover tudo num só comando.",
  },
  {
    to: "/painel/permissoes",
    titulo: "Verificação de permissões",
    texto: "Matriz do que cada papel consegue e não consegue ver, lida das regras em vigor na base de dados.",
  },
  {
    to: "/painel/auditoria",
    titulo: "Registo de actividade",
    texto: "Todas as criações, alterações e eliminações, e todas as consultas a campos sensíveis.",
  },
];

const ATALHOS_AUDITOR: Atalho[] = [
  {
    to: "/painel/permissoes",
    titulo: "Verificação de permissões",
    texto: "Matriz do que cada papel consegue e não consegue ver, lida das regras em vigor na base de dados.",
  },
  {
    to: "/painel/auditoria",
    titulo: "Registo de actividade",
    texto: "Consulta integral, sem qualquer possibilidade de alteração.",
  },
  {
    to: "/painel/utilizadores",
    titulo: "Utilizadores",
    texto: "Consulta de todas as contas e respectivos papéis.",
  },
];

/**
 * Administrador Geral Ologa: atalhos para as áreas já construídas. Apenas
 * apresentação — cada área e função de servidor continua a validar o acesso.
 */
const ATALHOS_ADMIN_GERAL: Atalho[] = [
  ...ATALHOS_ADMIN,
  { to: "/painel/conteudos", titulo: "Conteúdos preparados", texto: "Estado e importação dos pacotes de lições e bancos de avaliação, sempre em rascunho e inactivos." },
  { to: "/painel/licoes", titulo: "Editar cursos e lições", texto: "Actualizar texto, guião, duração e estado de cada lição, com registo de actividade e protecção contra sobrescrita." },
  { to: "/cursos", titulo: "Cursos", texto: "Os seis cursos, módulos, lições e estado de cada conteúdo." },
  { to: "/turmas", titulo: "Turmas e cronogramas", texto: "Criar e editar turmas, sessões e inscrições por código." },
  { to: "/presencas", titulo: "Presenças", texto: "Marcação por sessão, também sem ligação, e folha imprimível." },
  { to: "/avaliacao/banco", titulo: "Banco de questões", texto: "Consulta e revisão das questões por curso e módulo. Nenhum exame é activado aqui." },
  { to: "/workshops", titulo: "Workshops", texto: "Workshops provinciais e distritais e registo de participantes." },
  { to: "/painel/participacao", titulo: "Participação por formando", texto: "Nome e conclusão das aulas de cada formando, exportável em CSV e XLS." },
  { to: "/painel-nacional", titulo: "Painel Nacional", texto: "Indicadores de desempenho, satisfação, eficácia e workshops, com exportação." },
  { to: "/relatorios-mensais", titulo: "Relatórios mensais", texto: "Incidentes, reclamações, medidas correctivas e acessibilidade." },
  { to: "/certificados", titulo: "Certificados", texto: "Certificados emitidos e verificação pública." },
];

function PainelInicio() {
  const { papelActivo } = usePapelActivo();
  const ref = useRef<HTMLDivElement | null>(null);
  const definicao = PAPEIS.find((p) => p.valor === papelActivo);

  const atalhos =
    papelActivo === PERFIL_ADMIN_GERAL
      ? ATALHOS_ADMIN_GERAL
      : papelActivo === "admin_atdi"
        ? ATALHOS_ADMIN
        : papelActivo === "auditor_atdi"
          ? ATALHOS_AUDITOR
          : [];

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-navy">
          {definicao ? definicao.nome : papelActivo === PERFIL_ADMIN_GERAL ? NOME_ADMIN_GERAL : "Área reservada"}
        </h1>
        <ListenButton getFalas={() => extrairFalasDeElemento(ref.current)} />
      </div>
      {definicao ? <p className="mt-2 max-w-3xl text-base text-navy-2">{definicao.descricao}</p> : null}

      {atalhos.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {atalhos.map((a) => (
            <li key={a.to} className="rounded-lg border border-line bg-white p-5">
              <h2 className="text-lg font-extrabold text-navy">
                <Link to={a.to} className="underline">
                  {a.titulo}
                </Link>
              </h2>
              <p className="mt-2 text-base text-navy-2">{a.texto}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-lg border border-line bg-page p-5">
          <h2 className="text-lg font-extrabold text-navy">Ainda sem ecrãs neste papel</h2>
          <p className="mt-2 max-w-3xl text-base text-navy-2">
            As turmas, sessões, presenças, exames e certificados deste papel entram nas fases
            seguintes da plataforma. Nesta fase estão activos o acesso por papel, o registo de
            actividade e a verificação de permissões.
          </p>
          <p className="mt-3 text-base text-navy-2">
            Os módulos de literacia digital continuam abertos a todas as pessoas, com ou sem conta:{" "}
            <Link to="/formacao" className="font-semibold underline">
              ver os cursos
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
