// Cálculo da assiduidade. Vive à parte para poder ser usado tanto pelas
// funções de presenças como pelas de avaliação (condição dos 80 por cento).

export type EstadoPresenca = "presente" | "ausente" | "justificado";

export type EstadoSessao = "agendada" | "realizada" | "cancelada" | "adiada";

/** Qual das duas taxas vale para efeitos de certificação. */
export type BaseAssiduidade = "estrita" | "ajustada";

export const BASES_ASSIDUIDADE: ReadonlyArray<readonly [BaseAssiduidade, string, string]> = [
  [
    "estrita",
    "Assiduidade estrita",
    "Sessões presentes a dividir pelas sessões realizadas. As faltas justificadas contam como ausência.",
  ],
  [
    "ajustada",
    "Assiduidade ajustada",
    "Sessões presentes a dividir pelas sessões realizadas menos as justificadas. As justificadas saem do denominador: nem contam a favor nem contra.",
  ],
] as const;

export function rotuloBaseAssiduidade(valor: string): string {
  return BASES_ASSIDUIDADE.find(([v]) => v === valor)?.[1] ?? valor;
}

export function formulaBaseAssiduidade(valor: string): string {
  return BASES_ASSIDUIDADE.find(([v]) => v === valor)?.[2] ?? "";
}

export type MarcacaoBruta = {
  id: string;
  sessao_id: string;
  turma_id: string;
  inscricao_id: string;
  estado: EstadoPresenca;
  motivo: string | null;
  origem: string;
  origem_offline: boolean;
  conflito: boolean;
  justificacao_correccao: string | null;
  minutos_permanencia: number | null;
  progresso_pct: number | null;
  registado_em: string;
  nome_formando: string;
};

export type SessaoParaCalculo = { id: string; data: string; estado: EstadoSessao };

export type LinhaAssiduidade = {
  inscricaoId: string;
  nome: string;
  presentes: number;
  ausentes: number;
  justificadas: number;
  porMarcar: number;
  realizadas: number;
  totalSessoes: number;
  porRealizar: number;
  /** Presentes sobre realizadas. As justificadas contam como ausência. */
  taxaEstritaPct: number | null;
  /** Presentes sobre realizadas menos justificadas. */
  taxaAjustadaPct: number | null;
  /** A taxa que vale para certificação, conforme a configuração do curso. */
  taxaPct: number | null;
  base: BaseAssiduidade;
  abaixoDoLimiar: boolean;
  emRisco: boolean;
  maximoPossivelPct: number | null;
  conflitos: number;
};

export const LIMIAR_ASSIDUIDADE = 80;

/** Marcação que vale para cada formando em cada sessão: a mais recente. */
export function marcacaoEfectiva(marcacoes: MarcacaoBruta[]): Map<string, MarcacaoBruta> {
  const mapa = new Map<string, MarcacaoBruta>();
  for (const m of marcacoes) {
    const chave = `${m.sessao_id}|${m.inscricao_id}`;
    const actual = mapa.get(chave);
    if (!actual || new Date(m.registado_em) >= new Date(actual.registado_em)) mapa.set(chave, m);
  }
  return mapa;
}

/**
 * Uma sessão só conta como realizada quando o formador a marcou como
 * realizada. A data nunca decide sozinha: uma sessão cancelada, adiada ou que
 * nunca aconteceu não entra no denominador da assiduidade.
 */
export function sessoesRealizadas(sessoes: Array<{ id: string; estado: EstadoSessao }>): Set<string> {
  return new Set(sessoes.filter((s) => s.estado === "realizada").map((s) => s.id));
}

/** Sessões ainda por realizar: agendadas ou adiadas, que podem vir a contar. */
export function sessoesPorRealizar(
  sessoes: Array<{ id: string; estado: EstadoSessao }>,
): Set<string> {
  return new Set(
    sessoes.filter((s) => s.estado === "agendada" || s.estado === "adiada").map((s) => s.id),
  );
}

/**
 * Sessões cuja data já passou e que continuam agendadas. Ficam assinaladas ao
 * formador e ao supervisor — o estado nunca muda sozinho.
 */
export function sessoesPorRegularizar(
  sessoes: Array<{ id: string; data: string; estado: EstadoSessao }>,
  hoje = new Date(),
): Set<string> {
  const limite = new Date(hoje.toISOString().slice(0, 10) + "T23:59:59");
  return new Set(
    sessoes
      .filter((s) => s.estado === "agendada" && new Date(`${s.data}T00:00:00`) <= limite)
      .map((s) => s.id),
  );
}

function arredondar(numerador: number, denominador: number): number | null {
  if (denominador <= 0) return null;
  return Math.round((numerador / denominador) * 1000) / 10;
}

export function calcularAssiduidade(
  sessoes: SessaoParaCalculo[],
  inscritos: Array<{ id: string; nome: string }>,
  marcacoes: MarcacaoBruta[],
  base: BaseAssiduidade = "estrita",
): LinhaAssiduidade[] {
  const realizadas = sessoesRealizadas(sessoes);
  const porRealizar = sessoesPorRealizar(sessoes);
  const efectivas = marcacaoEfectiva(marcacoes);
  const conflitosPorInscricao = new Map<string, number>();
  for (const m of marcacoes) {
    if (m.conflito)
      conflitosPorInscricao.set(m.inscricao_id, (conflitosPorInscricao.get(m.inscricao_id) ?? 0) + 1);
  }

  return inscritos.map((i) => {
    let presentes = 0;
    let ausentes = 0;
    let justificadas = 0;
    let porMarcar = 0;
    for (const s of sessoes) {
      if (!realizadas.has(s.id)) continue;
      const m = efectivas.get(`${s.id}|${i.id}`);
      if (!m) porMarcar += 1;
      else if (m.estado === "presente") presentes += 1;
      else if (m.estado === "justificado") justificadas += 1;
      else ausentes += 1;
    }
    const nRealizadas = realizadas.size;
    const nPorRealizar = porRealizar.size;
    const total = sessoes.length;

    const taxaEstritaPct = arredondar(presentes, nRealizadas);
    const taxaAjustadaPct = arredondar(presentes, nRealizadas - justificadas);
    const taxaPct = base === "ajustada" ? taxaAjustadaPct : taxaEstritaPct;

    const maximoPossivelPct =
      base === "ajustada"
        ? arredondar(presentes + nPorRealizar, nRealizadas - justificadas + nPorRealizar)
        : arredondar(presentes + nPorRealizar, nRealizadas + nPorRealizar);

    return {
      inscricaoId: i.id,
      nome: i.nome,
      presentes,
      ausentes,
      justificadas,
      porMarcar,
      realizadas: nRealizadas,
      totalSessoes: total,
      porRealizar: nPorRealizar,
      taxaEstritaPct,
      taxaAjustadaPct,
      taxaPct,
      base,
      abaixoDoLimiar: taxaPct !== null && taxaPct < LIMIAR_ASSIDUIDADE,
      emRisco:
        maximoPossivelPct !== null &&
        nRealizadas > 0 &&
        nPorRealizar > 0 &&
        maximoPossivelPct < LIMIAR_ASSIDUIDADE,
      maximoPossivelPct,
      conflitos: conflitosPorInscricao.get(i.id) ?? 0,
    };
  });
}
