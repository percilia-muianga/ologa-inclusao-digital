/**
 * Regras puras do «O meu percurso» — testáveis sem base de dados.
 * Junta lições, presenças, avaliação e certificado numa etapa seguinte clara.
 */

export type EtapaPercurso =
  | "licoes"
  | "presencas"
  | "avaliacao_indisponivel"
  | "avaliacao"
  | "certificado_pronto"
  | "certificado_emitido";

export type DadosPercurso = {
  licoesTotal: number;
  licoesConcluidas: number;
  sessoesRealizadas: number;
  assiduidadePct: number | null;
  assiduidadeMinimaPct: number;
  avaliacaoDisponivel: boolean;
  melhorNotaPct: number | null;
  notaMinimaPct: number;
  certificadoEmitido: boolean;
};

/** A próxima coisa que o formando deve fazer. Nunca afirma aprovação sem dados. */
export function proximaEtapa(d: DadosPercurso): EtapaPercurso {
  if (d.certificadoEmitido) return "certificado_emitido";
  const assiduidadeOk =
    d.assiduidadePct !== null && d.assiduidadePct >= d.assiduidadeMinimaPct;
  const notaOk = d.melhorNotaPct !== null && d.melhorNotaPct >= d.notaMinimaPct;
  if (assiduidadeOk && notaOk) return "certificado_pronto";
  if (d.licoesTotal > 0 && d.licoesConcluidas < d.licoesTotal) return "licoes";
  if (!assiduidadeOk) return "presencas";
  if (!d.avaliacaoDisponivel) return "avaliacao_indisponivel";
  return "avaliacao";
}

export function percentagem(n: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((n / total) * 100);
}
