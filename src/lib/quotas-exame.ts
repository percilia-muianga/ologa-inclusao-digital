/**
 * Quotas de cobertura do exame final, por curso.
 *
 * O TdR (secção 10) exige variedade de tipologias e aleatoriedade. A
 * repartição concreta abaixo é PROPOSTA PEDAGÓGICA da Ologa, por validar pela
 * ATDI — não é imposição do TdR. As chaves dos módulos são a ordem do módulo
 * na tabela de módulos, que é estável e legível.
 *
 * Cursos sem quotas definidas mantêm o comportamento anterior (apenas
 * equilíbrio de dificuldade), para não alterar o que já funciona.
 */
import type { DificuldadeSorteio, TipoPedagogico } from "@/lib/sorteio-exame";

export type QuotasCurso = {
  /** Quantas questões de cada módulo, por ordem do módulo. */
  modulosPorOrdem: Record<number, number>;
  /** Quantas questões de cada tipo pedagógico. */
  tipos: Partial<Record<TipoPedagogico, number>>;
  /** Total de questões a que estas quotas se referem. */
  total: number;
  nota: string;
};

export const QUOTAS_POR_CURSO: Record<string, QuotasCurso> = {
  "computacao-em-nuvem": {
    total: 20,
    modulosPorOrdem: { 131: 6, 132: 7, 133: 5, 200: 2 },
    tipos: { escolha_multipla: 8, verdadeiro_falso: 4, correspondencia: 4, cenario: 4 },
    nota: "Proposta pedagógica: 6 do módulo 1, 7 do módulo 2, 5 do módulo 3 e 2 do módulo transversal; 8 de escolha múltipla, 4 de verdadeiro/falso, 4 de associação e 4 de cenário. O cenário conta como categoria própria, mesmo usando escolha múltipla como formato de resposta.",
  },
  "principios-transformacao-digital": {
    total: 20,
    modulosPorOrdem: { 111: 6, 112: 6, 113: 6, 200: 2 },
    tipos: {
      escolha_multipla: 8,
      verdadeiro_falso: 4,
      correspondencia: 4,
      ordenacao: 2,
      cenario: 2,
    },
    nota: "Proposta pedagógica, por validar pela Ologa/ATDI: 6 de Fundamentos da Transformação Digital (111), 6 de Serviços Públicos Centrados no Cidadão (112), 6 de Implementação e Mudança Institucional (113) e 2 do módulo transversal Governo Digital Inclusivo e Acessibilidade (200); 8 de escolha múltipla, 4 de verdadeiro/falso, 4 de associação, 2 de ordenação e 2 de cenário. O cenário conta como categoria própria e exclui a classificação como escolha múltipla, mesmo usando esse formato de resposta.",
  },
  "introducao-inteligencia-artificial": {
    total: 20,
    modulosPorOrdem: { 121: 9, 122: 9, 200: 2 },
    tipos: { escolha_multipla: 8, verdadeiro_falso: 4, correspondencia: 4, cenario: 4 },
    nota: "Proposta pedagógica, por validar pela Ologa/ATDI: 9 de Fundamentos de Inteligência Artificial (121), 9 de Uso Responsável da Inteligência Artificial (122) e 2 do módulo transversal Governo Digital Inclusivo e Acessibilidade (200); 8 de escolha múltipla, 4 de verdadeiro/falso, 4 de associação e 4 de cenário; 8 fáceis, 8 médias e 4 difíceis. Prova de 20 itens em 60 minutos: proposta pedagógica, não número imposto pelo Termo de Referência. O cenário conta como categoria própria, mesmo usando escolha múltipla ou verdadeiro/falso como formato de resposta.",
  },
};

/** Quotas de dificuldade a partir das percentagens configuradas. */
export function quotasDificuldade(
  total: number,
  pct: { facil: number; media: number; dificil: number },
): Record<DificuldadeSorteio, number> {
  const facil = Math.round((total * pct.facil) / 100);
  const media = Math.round((total * pct.media) / 100);
  const dificil = total - facil - media;
  return { facil, media, dificil };
}
