import { describe, expect, it } from "vitest";
import {
  EXAME,
  PRE_POS,
  type QuestaoSeed,
} from "../../../scripts/conteudo/transformacao-digital-questoes";

/** Número de questões do exame final gerado (CONFIG_PADRAO em avaliacao.functions.ts). */
const QUESTOES_POR_EXAME = 20;
/** Secção 10 do Termo de Referência: banco activo com o triplo do exame. */
const FACTOR_TDR = 3;

function gabaritoValido(q: QuestaoSeed): boolean {
  switch (q.t) {
    case "em":
      return (
        Array.isArray(q.opts) &&
        q.opts.length >= 2 &&
        typeof q.ind === "number" &&
        q.ind >= 0 &&
        q.ind < q.opts.length
      );
    case "vf":
      return typeof q.val === "boolean";
    case "cor":
      return Array.isArray(q.pares) && q.pares.length >= 2;
    case "ord":
      return Array.isArray(q.seq) && q.seq.length >= 2;
  }
}

describe("banco de questões — Princípios da Transformação Digital", () => {
  it("tem pelo menos o triplo das questões do exame", () => {
    expect(EXAME.length).toBeGreaterThanOrEqual(QUESTOES_POR_EXAME * FACTOR_TDR);
  });

  it("não tem enunciados duplicados, dentro nem entre instrumentos", () => {
    const todos = [...EXAME, ...PRE_POS].map((q) => q.e.trim().toLowerCase());
    expect(new Set(todos).size).toBe(todos.length);
  });

  it("todos os gabaritos são válidos para a sua tipologia", () => {
    for (const q of [...EXAME, ...PRE_POS]) {
      expect(gabaritoValido(q), `gabarito inválido: ${q.e}`).toBe(true);
    }
  });

  it("todas as questões têm explicação e objectivo associado", () => {
    for (const q of [...EXAME, ...PRE_POS]) {
      expect(q.exp.trim().length, `sem explicação: ${q.e}`).toBeGreaterThan(10);
      expect(q.obj.trim().length, `sem objectivo: ${q.e}`).toBeGreaterThan(3);
    }
  });

  it("cobre os três módulos e as três dificuldades, com tipologias variadas", () => {
    for (const m of ["m1", "m2", "m3"] as const) {
      expect(EXAME.filter((q) => q.m === m).length).toBeGreaterThanOrEqual(10);
    }
    for (const d of ["f", "me", "di"] as const) {
      expect(EXAME.filter((q) => q.d === d).length).toBeGreaterThan(0);
    }
    expect(new Set(EXAME.map((q) => q.t)).size).toBeGreaterThanOrEqual(4);
  });

  it("o pré/pós-teste tem 10 questões e é instrumento separado do exame", () => {
    expect(PRE_POS).toHaveLength(10);
    const enunciadosExame = new Set(EXAME.map((q) => q.e));
    for (const q of PRE_POS) expect(enunciadosExame.has(q.e)).toBe(false);
  });
});
