import { describe, expect, it } from "vitest";
import {
  BLOCOS_AVALIACAO,
  CARGA_HORARIA_OFICIAL_HORAS,
  LICOES_PLANO,
  MINUTOS_AVALIACAO_ORIENTACAO,
  MINUTOS_MODULOS,
  MINUTOS_TOTAIS,
  MODULOS_PLANO,
  TOPICOS_SEC_6_1,
} from "@/lib/plano-transformacao-digital";

describe("plano curricular — Princípios da Transformação Digital", () => {
  it("soma exactamente 24 horas", () => {
    expect(MINUTOS_TOTAIS).toBe(CARGA_HORARIA_OFICIAL_HORAS * 60);
    expect(MINUTOS_MODULOS).toBe(1320);
    expect(MINUTOS_AVALIACAO_ORIENTACAO).toBe(120);
  });

  it("não conta o exame nem o transversal duas vezes", () => {
    const chaves = [
      ...MODULOS_PLANO.map((m) => m.chave),
      ...BLOCOS_AVALIACAO.map((b) => b.chave),
    ];
    expect(new Set(chaves).size).toBe(chaves.length);
    expect(MODULOS_PLANO.filter((m) => m.transversal)).toHaveLength(1);
  });

  it("cada módulo soma os minutos das suas lições e a divisão teoria/prática fecha", () => {
    for (const m of MODULOS_PLANO) {
      expect(m.teoriaMin + m.praticaMin).toBe(m.minutos);
      if (m.licoes.length === 0) continue;
      expect(m.licoes.reduce((s, l) => s + l.minutos, 0)).toBe(m.minutos);
      expect(m.licoes.reduce((s, l) => s + l.teoriaMin, 0)).toBe(m.teoriaMin);
      expect(m.licoes.reduce((s, l) => s + l.praticaMin, 0)).toBe(m.praticaMin);
      for (const l of m.licoes) expect(l.teoriaMin + l.praticaMin).toBe(l.minutos);
    }
  });

  it("tem as 12 lições dos três módulos próprios", () => {
    expect(LICOES_PLANO).toHaveLength(12);
    expect(new Set(LICOES_PLANO.map((l) => l.chave)).size).toBe(12);
  });

  it("cobre todos os tópicos mínimos da secção 6.1", () => {
    const cobertos = new Set(LICOES_PLANO.flatMap((l) => l.topicos));
    for (const topico of TOPICOS_SEC_6_1) expect(cobertos.has(topico)).toBe(true);
  });
});
