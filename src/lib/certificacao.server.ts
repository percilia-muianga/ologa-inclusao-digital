// Condições de certificação individual (secções 12 e 12.1 do Termo de
// Referência). Função pura, para poder ser testada isoladamente e usada
// apenas no servidor — nunca decidida do lado do cliente.

export type CondicoesCertificacao = {
  assiduidadePct: number | null;
  notaPct: number | null;
  minimoAssiduidadePct: number;
  minimoNotaPct: number;
  /** Fim da formação; o prazo conta a partir daqui, em dias de calendário. */
  dataFim: Date | null;
  prazoDias: number;
  agora: Date;
};

export type ResultadoCondicoes = {
  prazoLimite: Date | null;
  diasRestantes: number | null;
  prazoExpirado: boolean;
  assiduidadeCumpre: boolean;
  notaCumpre: boolean;
  /** Cumulativas: as duas condições e o prazo. */
  podeCertificar: boolean;
  motivo:
    | null
    | "ASSIDUIDADE_POR_APURAR"
    | "ASSIDUIDADE_INSUFICIENTE"
    | "SEM_EXAME_SUBMETIDO"
    | "NOTA_INSUFICIENTE"
    | "PRAZO_EXPIRADO";
};

const DIA = 24 * 60 * 60 * 1000;

export function avaliarCondicoesCertificacao(c: CondicoesCertificacao): ResultadoCondicoes {
  const prazoLimite = c.dataFim ? new Date(c.dataFim.getTime() + c.prazoDias * DIA) : null;
  const diasRestantes = prazoLimite
    ? Math.ceil((prazoLimite.getTime() - c.agora.getTime()) / DIA)
    : null;
  const prazoExpirado = prazoLimite !== null && c.agora.getTime() > prazoLimite.getTime();

  const assiduidadeCumpre =
    c.assiduidadePct !== null && c.assiduidadePct >= c.minimoAssiduidadePct;
  const notaCumpre = c.notaPct !== null && c.notaPct >= c.minimoNotaPct;

  let motivo: ResultadoCondicoes["motivo"] = null;
  if (c.notaPct === null) motivo = "SEM_EXAME_SUBMETIDO";
  else if (!notaCumpre) motivo = "NOTA_INSUFICIENTE";
  else if (c.assiduidadePct === null) motivo = "ASSIDUIDADE_POR_APURAR";
  else if (!assiduidadeCumpre) motivo = "ASSIDUIDADE_INSUFICIENTE";
  else if (prazoExpirado) motivo = "PRAZO_EXPIRADO";

  return {
    prazoLimite,
    diasRestantes,
    prazoExpirado,
    assiduidadeCumpre,
    notaCumpre,
    podeCertificar: motivo === null,
    motivo,
  };
}
