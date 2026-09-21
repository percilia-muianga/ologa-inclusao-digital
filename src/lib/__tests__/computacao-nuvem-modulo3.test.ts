import { describe, expect, it } from "vitest";
import {
  MODULOS_PLANO,
  MINUTOS_TOTAIS,
  CARGA_HORARIA_OFICIAL_HORAS,
  MINUTOS_AVALIACAO_ORIENTACAO,
} from "@/lib/plano-computacao-nuvem";
import {
  LICOES,
  montarElearning,
  montarGuiao,
  minutosPorBloco,
  DESCRICOES_MODULO,
} from "../../../scripts/conteudo/computacao-nuvem-licoes";
import {
  calcularCustoMensal,
  PRECOS_FICTICIOS,
  CENARIO_CUSTOS,
} from "../../../scripts/conteudo/computacao-nuvem-m3";

const m3 = MODULOS_PLANO.find((m) => m.chave === "m3")!;

describe("módulo 3 — Governação, Segurança e Custos", () => {
  it("tem cinco lições de 100 minutos, somando 500 minutos (8 h 20)", () => {
    expect(m3.licoes).toHaveLength(5);
    for (const l of m3.licoes) expect(l.minutos).toBe(100);
    expect(m3.minutos).toBe(500);
  });

  it("o plano do curso continua a fechar em 30 horas", () => {
    const [m1, m2, m3p, transversal] = MODULOS_PLANO;
    expect([m1!.minutos, m2!.minutos, m3p!.minutos, transversal!.minutos]).toEqual([
      520, 540, 500, 120,
    ]);
    expect(MINUTOS_AVALIACAO_ORIENTACAO).toBe(120);
    expect(MINUTOS_TOTAIS).toBe(CARGA_HORARIA_OFICIAL_HORAS * 60);
    expect(MINUTOS_TOTAIS).toBe(1800);
  });

  it("as cinco lições têm conteúdo escrito, com todas as secções exigidas", () => {
    for (const l of m3.licoes) {
      const c = LICOES[l.chave];
      expect(c, l.chave).toBeDefined();
      expect(c!.objectivos.length).toBeGreaterThanOrEqual(3);
      expect(c!.explicacao.length).toBeGreaterThanOrEqual(5);
      expect(c!.exemplo.corpo.length).toBeGreaterThanOrEqual(3);
      expect(c!.actividade.enunciado.length).toBeGreaterThanOrEqual(5);
      expect(c!.actividade.produto.length).toBeGreaterThan(40);
      expect(c!.sintese.length).toBeGreaterThanOrEqual(5);
      expect(c!.verificacao).toHaveLength(2);
      expect(c!.referencias?.length).toBeGreaterThanOrEqual(1);
      expect(c!.guiao.conducao).toHaveLength(4);
      // Governação é análise documental: nenhuma lição deste módulo traz laboratório.
      expect(c!.laboratorio).toBeUndefined();
    }
  });

  it("os quatro blocos de tempo somam os 100 minutos de cada lição", () => {
    for (const l of m3.licoes) {
      expect(minutosPorBloco(l.tempos).reduce((a, b) => a + b, 0)).toBe(l.minutos);
      expect(l.tempos.acolhimento + l.tempos.exposicao).toBe(l.teoriaMin);
      expect(l.tempos.actividade + l.tempos.partilha).toBe(l.praticaMin);
    }
  });

  it("cada lição declara o exercício como análise documental e o trabalho em pares", () => {
    for (const l of m3.licoes) {
      const c = LICOES[l.chave]!;
      const enunciado = c.actividade.enunciado.join(" ");
      expect(c.actividade.formato).toBe("em pares");
      expect(enunciado).toContain("análise");
      expect(enunciado).toContain("duas pessoas por computador");
      expect(enunciado).toContain("Rubrica de apreciação");
      expect(c.guiao.conducao[3]).toContain("dois");
    }
  });

  it("o conteúdo e o guião geram-se sem erro e mantêm o rótulo de rascunho", () => {
    for (const l of m3.licoes) {
      const c = LICOES[l.chave]!;
      const html = montarElearning(c, l.minutos, l.tempos);
      const guiao = montarGuiao(c, l.titulo, l.minutos, l.tempos);
      expect(html).toContain("por validar pela Ologa/ATDI");
      expect(html).toContain(`${l.minutos} minutos`);
      expect(guiao).toContain("Guião do formador");
      expect(html).not.toContain("Laboratório —");
    }
  });

  it("a descrição do módulo 3 está escrita para o seed a aplicar", () => {
    expect(DESCRICOES_MODULO["m3"]).toContain("por validar pela Ologa/ATDI");
  });
});

describe("exercício de custos da lição 4 — cálculo verificado", () => {
  const r = calcularCustoMensal();

  it("cada rubrica tem operandos visíveis e o subtotal esperado", () => {
    expect(r.linhas.map((l) => Math.round(l.subtotalUsd * 100) / 100)).toEqual([
      94, 23.04, 10, 12.6, 10, 15,
    ]);
    for (const l of r.linhas) expect(l.operandos).toContain("×");
  });

  it("a saída sem custo é descontada antes de facturar", () => {
    const esperado = (CENARIO_CUSTOS.saidaGb - PRECOS_FICTICIOS.saidaGratisGb) * PRECOS_FICTICIOS.saidaGb;
    expect(Math.round(r.linhas[3]!.subtotalUsd * 100) / 100).toBe(
      Math.round(esperado * 100) / 100,
    );
  });

  it("o suporte aplica o mínimo mensal quando a percentagem fica abaixo", () => {
    expect(r.consumo).toBe(164.64);
    expect(r.suporteCalculado).toBe(16.46);
    expect(r.suporte).toBe(PRECOS_FICTICIOS.suporteMinimoUsd);
  });

  it("o total em dólares e a conversão em meticais fecham", () => {
    expect(r.totalUsd).toBe(189.64);
    expect(r.totalMzn).toBe(Math.round(189.64 * PRECOS_FICTICIOS.cambioMznPorUsd * 100) / 100);
    expect(r.totalMzn).toBe(12136.96);
  });

  it("a solução de referência do cálculo está no guião do formador, não no conteúdo do formando", () => {
    const l = m3.licoes.find((x) => x.chave === "m3l4")!;
    const c = LICOES["m3l4"]!;
    const html = montarElearning(c, l.minutos, l.tempos);
    const guiao = montarGuiao(c, l.titulo, l.minutos, l.tempos);
    expect(guiao).toContain("Solução de referência");
    expect(guiao).toContain("189,64");
    expect(html).not.toContain("Solução de referência");
    expect(html).toContain("FICTÍCIOS");
  });
});
