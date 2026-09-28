/**
 * Tipo das questões do banco de avaliação do curso «Tecnologias Digitais do
 * Governo». Ficheiro PRIVADO, fora de src/ e de public/.
 *
 * Classificação de dificuldade usada (critério explícito, não calibrado com
 * respostas reais):
 *  - f  (fácil): reconhecer ou recordar um conceito ou regra da lição, um passo.
 *  - me (média): aplicar uma regra a uma situação dada, um passo de decisão.
 *  - di (difícil): analisar — várias condições em simultâneo, alternativas
 *    todas plausíveis, ou separar o que a fonte confirma do que não confirma.
 */
export type QuestaoTDG = {
  /** Código interno estável. Nunca se reutiliza um código retirado. */
  cod: string;
  m: "m1" | "transversal";
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
  /** Objectivo da lição, tal como escrito no conteúdo. */
  obj: string;
  /** Tópico dos TdR (secção 6.6) ou artigo do módulo transversal avaliado. */
  topico: string;
  /** Fonte rastreável: título ou endereço de uma fonte já citada na lição. */
  fonte: string;
};

// Fontes: cópias exactas das que constam das lições (tecnologias-governo-licoes.ts).
export const F_PG = "https://portaldogoverno.gov.mz/";
export const F_PC = "https://portalcidadao.moz.mz/utentes";
export const F_ATDI = "https://atdi.gov.mz/";
export const F_TDR_CORREIO = "TdR, secção 6.6 (Uso do CorreioGov; Gestão de contas do CorreioGov)";
export const F_TDR_DOC = "TdR, secção 6.6 (Sistema de Gestão Documental; Sistema de Assinatura Digital)";
export const F_TDR_NUVEM = "TdR, secção 6.6 (Uso da CloudGov; Plataforma do Funcionário e Agente do Estado)";
export const F_INTIC = "Propostas de articulado sobre interoperabilidade (INTIC, 2026)";
/** Módulo transversal: artigos já usados nas lições desse módulo. */
export const F_LEI_10_2024 = "Lei n.º 10/2024 — lições do módulo transversal";
