/**
 * Verificações do banco de questões do curso «Computação em Nuvem».
 * Não toca na base de dados partilhada: lê apenas o ficheiro de conteúdo.
 */
import { describe, expect, it } from "vitest";
import { EXAME, PRE_POS, type QuestaoNuvem } from "../../../scripts/conteudo/computacao-nuvem-questoes";
import { corpoQuestao } from "../../../scripts/seed-questoes-computacao-nuvem";

const conta = <T extends string>(lista: QuestaoNuvem[], f: (q: QuestaoNuvem) => T) =>
  lista.reduce<Record<string, number>>((a, q) => {
    const k = f(q);
    a[k] = (a[k] ?? 0) + 1;
    return a;
  }, {});

describe("banco de questões — Computação em Nuvem", () => {
  it("tem 60 questões de exame e 10 de diagnóstico/pós-teste", () => {
    expect(EXAME).toHaveLength(60);
    expect(PRE_POS).toHaveLength(10);
  });

  it("cumpre a secção 10 do TdR: banco com pelo menos o triplo do exame de 20", () => {
    expect(EXAME.length).toBeGreaterThanOrEqual(20 * 3);
  });

  it("segue a distribuição proposta por módulo", () => {
    expect(conta(EXAME, (q) => q.m)).toEqual({ m1: 18, m2: 21, m3: 15, transversal: 6 });
  });

  it("segue a distribuição proposta por tipo pedagógico", () => {
    expect(conta(EXAME, (q) => (q.cen ? "cenario" : q.t))).toEqual({
      em: 24,
      vf: 12,
      cor: 12,
      cenario: 12,
    });
  });

  it("tem dificuldades suficientes para o sorteio 40/40/20 de 20 questões", () => {
    const d = conta(EXAME, (q) => q.d);
    expect(d["f"]).toBeGreaterThanOrEqual(8 * 3);
    expect(d["me"]).toBeGreaterThanOrEqual(8 * 3);
    expect(d["di"]).toBeGreaterThanOrEqual(4 * 3);
  });

  it("não tem enunciados duplicados dentro nem entre instrumentos", () => {
    const todos = [...EXAME, ...PRE_POS].map((q) => q.e);
    expect(new Set(todos).size).toBe(todos.length);
  });

  it("todas as questões têm enunciado, explicação e objectivo associado", () => {
    for (const q of [...EXAME, ...PRE_POS]) {
      expect(q.e.length).toBeGreaterThan(20);
      expect(q.exp.length).toBeGreaterThan(20);
      expect(q.obj.length).toBeGreaterThan(10);
    }
  });

  it("os gabaritos são válidos para cada tipologia", () => {
    for (const q of [...EXAME, ...PRE_POS]) {
      const { conteudo, resposta } = corpoQuestao(q);
      if (q.t === "em") {
        const opcoes = (conteudo as { opcoes: string[] }).opcoes;
        expect(opcoes.length).toBeGreaterThanOrEqual(4);
        expect(new Set(opcoes).size).toBe(opcoes.length);
        const indice = (resposta as { indice: number }).indice;
        expect(indice).toBeGreaterThanOrEqual(0);
        expect(indice).toBeLessThan(opcoes.length);
      }
      if (q.t === "vf") expect(typeof (resposta as { valor: boolean }).valor).toBe("boolean");
      if (q.t === "cor") {
        const pares = (resposta as { pares: { esquerda: string; direita: string }[] }).pares;
        expect(pares.length).toBeGreaterThanOrEqual(3);
        expect(new Set(pares.map((p) => p.esquerda)).size).toBe(pares.length);
        expect(new Set(pares.map((p) => p.direita)).size).toBe(pares.length);
      }
    }
  });

  it("os cenários contêm caso e problema, não apenas rótulo", () => {
    const cenarios = EXAME.filter((q) => q.cen);
    expect(cenarios).toHaveLength(12);
    for (const q of cenarios) {
      expect(q.e.toLowerCase()).toContain("caso fictício");
      expect(q.e.length).toBeGreaterThan(150);
      expect(q.e).toMatch(/\?/);
    }
  });

  it("as associações são exercícios efectivos de associar", () => {
    for (const q of EXAME.filter((x) => x.t === "cor")) {
      expect(q.pares!.length).toBeGreaterThanOrEqual(4);
      for (const p of q.pares!) {
        expect(p.esquerda.trim().length).toBeGreaterThan(3);
        expect(p.direita.trim().length).toBeGreaterThan(2);
      }
    }
  });

  it("os cálculos de custo dos cenários estão verificados", () => {
    expect(220 * 0.1).toBeCloseTo(22.0, 2);
    expect(400 * 0.025 * 64).toBeCloseTo(640.0, 2);
    const computacao = EXAME.find((q) => q.e.includes("220 horas"))!;
    expect(computacao.opts![computacao.ind!]).toBe("22,00 USD");
    const cambio = EXAME.find((q) => q.e.includes("64 MZN por USD"))!;
    expect(cambio.opts![cambio.ind!]).toBe("640,00 MZN");
  });

  it("os cenários de custo identificam os preços como fictícios", () => {
    for (const q of EXAME.filter((x) => x.e.includes("USD"))) {
      expect(q.e).toMatch(/FICTÍCIOS/);
    }
  });

  it("não expõe gabaritos no pacote do navegador", async () => {
    const { readdirSync, readFileSync, statSync } = await import("node:fs");
    const { join } = await import("node:path");
    const ficheiros: string[] = [];
    const andar = (dir: string) => {
      for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) andar(p);
        else if (/\.(ts|tsx)$/.test(p) && !p.includes("__tests__")) ficheiros.push(p);
      }
    };
    andar("src");
    for (const f of ficheiros) {
      expect(readFileSync(f, "utf8")).not.toContain("computacao-nuvem-questoes");
    }
  });
});
