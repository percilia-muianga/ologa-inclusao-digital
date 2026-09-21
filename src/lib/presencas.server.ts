// Cálculo da assiduidade. Vive à parte para poder ser usado tanto pelas
// funções de presenças como pelas de avaliação (condição dos 80 por cento).

export type EstadoPresenca = "presente" | "ausente" | "justificado";

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

export type LinhaAssiduidade = {
  inscricaoId: string;
  nome: string;
  presentes: number;
  ausentes: number;
  justificadas: number;
  porMarcar: number;
  realizadas: number;
  totalSessoes: number;
  taxaPct: number | null;
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

/** Uma sessão conta como realizada quando a sua data já passou. */
export function sessoesRealizadas(
  sessoes: Array<{ id: string; data: string }>,
  hoje = new Date(),
): Set<string> {
  const limite = new Date(hoje.toISOString().slice(0, 10) + "T23:59:59");
  return new Set(
    sessoes.filter((s) => new Date(`${s.data}T00:00:00`) <= limite).map((s) => s.id),
  );
}

export function calcularAssiduidade(
  sessoes: Array<{ id: string; data: string }>,
  inscritos: Array<{ id: string; nome: string }>,
  marcacoes: MarcacaoBruta[],
  hoje = new Date(),
): LinhaAssiduidade[] {
  const realizadas = sessoesRealizadas(sessoes, hoje);
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
    const total = sessoes.length;
    const taxaPct = nRealizadas > 0 ? Math.round((presentes / nRealizadas) * 1000) / 10 : null;
    const maximoPossivelPct =
      total > 0 ? Math.round(((presentes + (total - nRealizadas)) / total) * 1000) / 10 : null;
    return {
      inscricaoId: i.id,
      nome: i.nome,
      presentes,
      ausentes,
      justificadas,
      porMarcar,
      realizadas: nRealizadas,
      totalSessoes: total,
      taxaPct,
      abaixoDoLimiar: taxaPct !== null && taxaPct < LIMIAR_ASSIDUIDADE,
      emRisco:
        maximoPossivelPct !== null &&
        nRealizadas > 0 &&
        nRealizadas < total &&
        maximoPossivelPct < LIMIAR_ASSIDUIDADE,
      maximoPossivelPct,
      conflitos: conflitosPorInscricao.get(i.id) ?? 0,
    };
  });
}
