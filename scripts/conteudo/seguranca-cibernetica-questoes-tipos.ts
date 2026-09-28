/**
 * Tipo das questões do banco de avaliação do curso «Segurança Cibernética
 * Avançada». Ficheiro PRIVADO, fora de src/ e de public/.
 */
export type QuestaoSC = {
  /** Código interno estável do item. Nunca se reutiliza um código retirado. */
  cod: string;
  m: "m1" | "m2" | "m3" | "transversal";
  /** Ordem da lição de origem dentro do módulo. */
  l: number;
  t: "em" | "vf" | "cor";
  /** Categoria pedagógica «cenário» (formato de resposta em escolha múltipla ou V/F). */
  cen?: true;
  d: "f" | "me" | "di";
  e: string;
  opts?: string[];
  ind?: number;
  val?: boolean;
  pares?: { esquerda: string; direita: string }[];
  exp: string;
  /** Objectivo de aprendizagem da lição a que o item está associado. */
  obj: string;
  /** Fonte oficial quando o item é técnico; as mesmas usadas nas lições. */
  fonte?: string;
};

export const FONTE_NIST = "https://www.nist.gov/cyberframework";
export const FONTE_KEV = "https://www.cisa.gov/known-exploited-vulnerabilities-catalog";
export const FONTE_WSTG = "https://owasp.org/projects/web-security-testing-guide";
