/**
 * Tipo das questões do banco PRIVADO de avaliação do curso «Redes Avançadas e
 * Segurança Cibernética» (Administração de Redes). Fora de src/ e de public/.
 *
 * Critério de dificuldade (explícito, não calibrado com respostas reais):
 *  - f  (fácil): recordar ou reconhecer um conceito, regra ou função da lição; um passo.
 *  - me (média): aplicar uma regra ou cálculo a uma situação dada; um passo de decisão.
 *  - di (difícil): analisar — ler várias evidências (saídas, tabelas, números),
 *    combinar duas ou mais regras, ou excluir hipóteses plausíveis.
 *
 * Todos os casos, nomes e endereços são FICTÍCIOS e seguem o plano de
 * endereçamento da DPE (gamas privadas e de documentação, domínio dpe.example).
 */
import type { FonteChave } from "./redes-base";
import type { ResultadoTdr } from "../../src/lib/plano-redes";

export type QuestaoRedes = {
  /** Código interno estável. Nunca se reutiliza um código retirado. */
  cod: string;
  /** Ordem do módulo temático (1–12) ou módulo transversal. */
  m: number | "transversal";
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
  /** Objectivo da lição, copiado exactamente do conteúdo (vazio só no transversal). */
  obj: string;
  /** Resultados R01–R18 da secção 6.5 avaliados (subconjunto dos da lição). */
  r: ResultadoTdr[];
  /** Fonte: chave de FONTES já citada na lição. */
  fonte: FonteChave;
};
