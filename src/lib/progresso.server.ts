/**
 * Regras puras do progresso por matrícula — testáveis sem base de dados.
 * A leitura dos dados fica nas funções de servidor; aqui só a decisão.
 */

export type MotivoRecusa =
  | "MATRICULA_INVALIDA"
  | "LICAO_INVALIDA"
  | "LICAO_FORA_DO_CURSO";

export type DadosPertenca = {
  /** Dono da matrícula, tal como está na base. */
  perfilDaMatricula: string | null | undefined;
  /** Utilizador autenticado que está a pedir a gravação. */
  utilizador: string;
  /** Curso da turma onde a matrícula existe. */
  cursoDaTurma: string | null | undefined;
  /** Módulo a que a lição pertence. */
  moduloDaLicao: string | null | undefined;
  /** Módulos ligados ao curso da turma (inclui os partilhados). */
  modulosDoCurso: string[];
};

/**
 * Devolve null quando a gravação é permitida, ou o motivo da recusa.
 * Um módulo partilhado (o transversal, por exemplo) é aceite desde que esteja
 * ligado ao curso da turma — não é exigido um curso «pai» único.
 */
export function avaliarPertenca(d: DadosPertenca): MotivoRecusa | null {
  if (!d.perfilDaMatricula || d.perfilDaMatricula !== d.utilizador) {
    return "MATRICULA_INVALIDA";
  }
  if (!d.cursoDaTurma) return "MATRICULA_INVALIDA";
  if (!d.moduloDaLicao) return "LICAO_INVALIDA";
  if (!d.modulosDoCurso.includes(d.moduloDaLicao)) return "LICAO_FORA_DO_CURSO";
  return null;
}
