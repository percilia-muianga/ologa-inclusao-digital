/** Papéis do sistema — nomes e descrições em português de Moçambique. */

export type PapelSistema =
  | "formando"
  | "formador"
  | "supervisor_provincial"
  | "coordenador_nacional"
  | "admin_atdi"
  | "auditor_atdi";

export type DefinicaoPapel = {
  valor: PapelSistema;
  nome: string;
  descricao: string;
  /** Prefixo do endereço de email das contas de teste. */
  prefixoTeste: string;
};

export const PAPEIS: DefinicaoPapel[] = [
  {
    valor: "formando",
    nome: "Formando",
    descricao:
      "Inscreve-se num curso através do código de turma e consulta o seu percurso, presenças, notas e certificados.",
    prefixoTeste: "formando.teste",
  },
  {
    valor: "formador",
    nome: "Formador",
    descricao:
      "Vê apenas as suas turmas, marca presenças, lança observações e consulta o desempenho dos seus formandos.",
    prefixoTeste: "formador.teste",
  },
  {
    valor: "supervisor_provincial",
    nome: "Supervisor provincial",
    descricao:
      "Vê todas as turmas da sua província, valida presenças e reporta incidências.",
    prefixoTeste: "supervisor.teste",
  },
  {
    valor: "coordenador_nacional",
    nome: "Coordenador nacional (Ologa)",
    descricao:
      "Cria cursos, turmas e cronogramas, atribui formadores e gere o banco de questões.",
    prefixoTeste: "coordenador.teste",
  },
  {
    valor: "admin_atdi",
    nome: "Administrador ATDI",
    descricao:
      "Acesso total de leitura, gestão de utilizadores e configuração institucional.",
    prefixoTeste: "admin.teste",
  },
  {
    valor: "auditor_atdi",
    nome: "Auditor ATDI",
    descricao:
      "Acesso exclusivamente de leitura a todos os dados e a todos os registos de actividade. Não pode alterar nada.",
    prefixoTeste: "auditor.teste",
  },
];

/**
 * Perfil de origem (perfis.papel), distinto dos papéis de sistema.
 * Não é um papel atribuído: identifica a conta de administração da Ologa.
 */
export const PERFIL_ADMIN_GERAL = "admin_ologa" as const;
export const NOME_ADMIN_GERAL = "Administrador Geral Ologa";

/** Papel usado apenas para escolher a vista: pode ser o perfil de origem. */
export type PapelVista = PapelSistema | typeof PERFIL_ADMIN_GERAL;

export function nomeDoPapel(papel: string): string {
  if (papel === PERFIL_ADMIN_GERAL) return NOME_ADMIN_GERAL;
  return PAPEIS.find((p) => p.valor === papel)?.nome ?? papel;
}

/** As 11 províncias de Moçambique. */
export const PROVINCIAS = [
  "Cabo Delgado",
  "Niassa",
  "Nampula",
  "Zambézia",
  "Tete",
  "Manica",
  "Sofala",
  "Inhambane",
  "Gaza",
  "Província de Maputo",
  "Cidade de Maputo",
] as const;

export const GENEROS = [
  { valor: "feminino", nome: "Feminino" },
  { valor: "masculino", nome: "Masculino" },
  { valor: "outro", nome: "Outro" },
  { valor: "prefere_nao_indicar", nome: "Prefiro não indicar" },
] as const;

/** Campos de identificação sensíveis — só visíveis ao próprio, ao administrador e ao auditor. */
export const CAMPOS_SENSIVEIS = [
  "email",
  "telefone",
  "genero",
  "tipo_deficiencia",
] as const;

/**
 * Papéis usados APENAS para escolher a vista do painel.
 *
 * Quem tem o perfil "Administrador Geral Ologa" (perfis.papel = 'admin_ologa')
 * passa a ver a vista administrativa com o SEU nome — não é convertido em
 * "Administrador ATDI" nem recebe esse papel. Isto não concede nada: as regras
 * do servidor já reconhecem este perfil e cada função revalida-o. Quem não tem
 * papéis nem este perfil continua sem vista reservada.
 */
export function papeisDeVista(
  papeis: PapelSistema[],
  administradorGeral: boolean,
): PapelVista[] {
  if (!administradorGeral) return papeis;
  return [PERFIL_ADMIN_GERAL, ...papeis];
}
