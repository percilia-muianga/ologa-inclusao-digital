import { describe, expect, it } from "vitest";
import { proximaEtapa, percentagem, type DadosPercurso } from "../percurso.server";

const base: DadosPercurso = {
  licoesTotal: 10,
  licoesConcluidas: 0,
  sessoesRealizadas: 0,
  assiduidadePct: null,
  assiduidadeMinimaPct: 80,
  avaliacaoDisponivel: false,
  melhorNotaPct: null,
  notaMinimaPct: 60,
  certificadoEmitido: false,
};

describe("proximaEtapa", () => {
  it("começa pelas lições", () => expect(proximaEtapa(base)).toBe("licoes"));
  it("lições feitas sem assiduidade → presenças", () =>
    expect(proximaEtapa({ ...base, licoesConcluidas: 10, assiduidadePct: 79 })).toBe("presencas"));
  it("avaliação inactiva é indicada, não oferecida", () =>
    expect(proximaEtapa({ ...base, licoesConcluidas: 10, assiduidadePct: 80 })).toBe("avaliacao_indisponivel"));
  it("avaliação disponível", () =>
    expect(proximaEtapa({ ...base, licoesConcluidas: 10, assiduidadePct: 90, avaliacaoDisponivel: true })).toBe("avaliacao"));
  it("nota 59 não chega", () =>
    expect(proximaEtapa({ ...base, licoesConcluidas: 10, assiduidadePct: 90, avaliacaoDisponivel: true, melhorNotaPct: 59 })).toBe("avaliacao"));
  it("condições cumpridas → certificado pronto", () =>
    expect(proximaEtapa({ ...base, assiduidadePct: 80, melhorNotaPct: 60 })).toBe("certificado_pronto"));
  it("certificado emitido prevalece", () =>
    expect(proximaEtapa({ ...base, certificadoEmitido: true })).toBe("certificado_emitido"));
  it("percentagem sem total é nula", () => {
    expect(percentagem(3, 0)).toBeNull();
    expect(percentagem(1, 3)).toBe(33);
  });
});
