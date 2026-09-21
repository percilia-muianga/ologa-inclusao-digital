import { describe, expect, it } from "vitest";
import {
  BLOCOS_AVALIACAO,
  CARGA_HORARIA_PROVISORIA_HORAS,
  DIVERGENCIA_CARGA,
  FICHA_CURSO,
  MINUTOS_AVALIACAO_ORIENTACAO,
  MINUTOS_MODULOS,
  MINUTOS_TOTAIS,
  MODULOS_PLANO,
  PLANO_ALTERNATIVO_16H,
} from "../plano-inteligencia-artificial";
import {
  LICOES,
  DESCRICOES_MODULO,
  montarElearning,
  montarGuiao,
} from "../../../scripts/conteudo/inteligencia-artificial-licoes";

describe("plano de Introdução à Inteligência Artificial", () => {
  it("soma 1200 minutos, isto é 20 horas provisórias", () => {
    expect(MINUTOS_MODULOS).toBe(1080);
    expect(MINUTOS_AVALIACAO_ORIENTACAO).toBe(120);
    expect(MINUTOS_TOTAIS).toBe(1200);
    expect(MINUTOS_TOTAIS / 60).toBe(CARGA_HORARIA_PROVISORIA_HORAS);
  });

  it("reparte 20 + 40 + 60 minutos de diagnóstico, revisão e exame", () => {
    expect(BLOCOS_AVALIACAO.map((b) => b.minutos)).toEqual([20, 40, 60]);
  });

  it("tem módulo 1 e módulo 2 com quatro lições de 120 minutos e transversal de 120", () => {
    const [m1, m2, transversal] = MODULOS_PLANO;
    for (const m of [m1!, m2!]) {
      expect(m.licoes).toHaveLength(4);
      expect(m.minutos).toBe(480);
      for (const l of m.licoes) expect(l.minutos).toBe(120);
    }
    expect(transversal!.transversal).toBe(true);
    expect(transversal!.minutos).toBe(120);
    expect(transversal!.licoes).toHaveLength(0);
  });

  it("mantém a grelha de tempos 10 + 35 + 60 + 15 em cada lição", () => {
    for (const m of MODULOS_PLANO) {
      for (const l of m.licoes) {
        const t = l.tempos;
        expect([t.acolhimento, t.exposicao, t.actividade, t.partilha]).toEqual([10, 35, 60, 15]);
        expect(t.acolhimento + t.exposicao + t.actividade + t.partilha).toBe(l.minutos);
        expect(l.teoriaMin + l.praticaMin).toBe(l.minutos);
      }
    }
  });

  it("declara a divergência sem afirmar que as 20 horas estão fixadas", () => {
    const textos = [DIVERGENCIA_CARGA, FICHA_CURSO.nota, FICHA_CURSO.objectivos];
    expect(DIVERGENCIA_CARGA).toMatch(/PROVISÓRIA/);
    expect(DIVERGENCIA_CARGA).toMatch(/16 horas/);
    expect(DIVERGENCIA_CARGA).toMatch(/secção 6\.2/);
    expect(DIVERGENCIA_CARGA).toMatch(/secção 14/);
    expect(DIVERGENCIA_CARGA).toMatch(/13\.1/);
    for (const t of textos) {
      expect(t).not.toMatch(/20 horas fixad/i);
      expect(t).not.toMatch(/carga fixada/i);
      expect(t).not.toMatch(/definitiv[ao]s? 20/i);
    }
  });

  it("mantém o plano alternativo de 16 horas documentado e não activo", () => {
    expect(PLANO_ALTERNATIVO_16H.activo).toBe(false);
    expect(PLANO_ALTERNATIVO_16H.totalMinutos).toBe(960);
    expect(PLANO_ALTERNATIVO_16H.blocos.reduce((s, b) => s + b.minutos, 0)).toBe(960);
  });

  it("diz na ficha que o banco de avaliação continua por preparar e inactivo", () => {
    expect(FICHA_CURSO.nota).toMatch(/por preparar, inactivo/);
    expect(FICHA_CURSO.nota).toMatch(/não emite certificados/);
  });

  it("não afirma que o EU AI Act se aplica automaticamente a Moçambique", () => {
    expect(FICHA_CURSO.objectivos).toMatch(/não se afirma que se aplica automaticamente/);
  });
});

describe("conteúdo escrito do módulo 1", () => {
  const chaves = ["m1l1", "m1l2", "m1l3", "m1l4"];

  it("escreve as quatro lições do módulo 1 e nenhuma do módulo 2", () => {
    expect(Object.keys(LICOES).sort()).toEqual(chaves);
    expect(DESCRICOES_MODULO["m2"]).toBeUndefined();
  });

  it("dá a cada lição objectivos, explicação desenvolvida, caso, actividade e duas questões", () => {
    for (const k of chaves) {
      const c = LICOES[k]!;
      expect(c.objectivos.length).toBeGreaterThanOrEqual(4);
      expect(c.explicacao.length).toBeGreaterThanOrEqual(5);
      expect(c.explicacao.join(" ").length).toBeGreaterThan(2500);
      expect(c.exemplo.corpo.length).toBeGreaterThanOrEqual(3);
      expect(c.actividade.enunciado.length).toBeGreaterThanOrEqual(3);
      expect(c.actividade.rubrica.length).toBeGreaterThanOrEqual(4);
      expect(c.sintese.length).toBeGreaterThanOrEqual(6);
      expect(c.verificacao).toHaveLength(2);
      for (const v of c.verificacao) {
        expect(v.resposta.length).toBeGreaterThan(40);
        expect(v.feedback.length).toBeGreaterThan(40);
      }
      expect(c.guiao.conducao).toHaveLength(4);
      expect(c.referencias?.some((r) => r.url === "https://oecd.ai/en/ai-principles")).toBe(true);
      expect(
        c.referencias?.some(
          (r) => r.url === "https://www.nist.gov/itl/ai-risk-management-framework",
        ),
      ).toBe(true);
    }
  });

  it("fornece por inteiro o mini-conjunto de dados e a tabela de resultados", () => {
    expect(LICOES["m1l2"]!.tabela?.linhas).toHaveLength(10);
    expect(LICOES["m1l2"]!.tabela?.colunas).toHaveLength(8);
    for (const linha of LICOES["m1l2"]!.tabela!.linhas)
      expect(linha).toHaveLength(LICOES["m1l2"]!.tabela!.colunas.length);
    expect(LICOES["m1l3"]!.tabela?.linhas).toHaveLength(3);
  });

  it("confirma os cálculos da lição 3 com os números fornecidos", () => {
    const vp = 30, fp = 20, fn = 10, vn = 140;
    expect(vp + fp + fn + vn).toBe(200);
    expect((vp + vn) / 200).toBe(0.85);
    expect(vp / (vp + fn)).toBe(0.75);
    expect((fp + vn) / 200).toBe(0.8);
    const rubrica = LICOES["m1l3"]!.actividade.rubrica.join(" ");
    expect(rubrica).toMatch(/170 dividido por 200 = 0,85/);
    expect(rubrica).toMatch(/30 dividido por 40 = 0,75/);
    expect(rubrica).toMatch(/160 dividido por 200 = 0,80/);
  });

  it("dá à lição 4 os dois anexos, a prática por executar e a contingência", () => {
    const c = LICOES["m1l4"]!;
    expect(c.anexos).toHaveLength(2);
    expect(c.anexos![1]!.nota).toMatch(/SIMULADA/);
    expect(c.pratica).toBeDefined();
    expect(c.pratica!.contingencia.join(" ")).toMatch(/PENDENTE/);
    expect(c.pratica!.preRequisitos.join(" ")).toMatch(/autorizada/);
    expect(c.pratica!.preRequisitos.join(" ")).toMatch(/não cria conta pessoal|Nenhuma pessoa formanda cria conta pessoal/);
  });

  it("não promete gratuitidade nem exige conta pessoal ou pagamento", () => {
    const tudo = Object.values(LICOES)
      .map((c) => JSON.stringify(c))
      .join(" ");
    expect(tudo).not.toMatch(/ferramenta gratuita/i);
    expect(tudo).toMatch(/não se promete que qualquer ferramenta seja gratuita/i);
  });

  it("não afirma que a prática foi realizada nem inventa Língua de Sinais ou vídeo", () => {
    for (const k of chaves) {
      const c = LICOES[k]!;
      const html = montarElearning(c, 120, {
        acolhimento: 10,
        exposicao: 35,
        actividade: 60,
        partilha: 15,
      });
      expect(html).not.toMatch(/laboratório realizado|prática realizada|vídeo em Língua de Sinais/i);
      expect(html).toContain("Proposta pedagógica");
      expect(html).toContain("Acolhimento e objectivos: 10 minutos");
      expect(html).toContain("Actividade prática: 60 minutos");
    }
    const html4 = montarElearning(LICOES["m1l4"]!, 120, {
      acolhimento: 10,
      exposicao: 35,
      actividade: 60,
      partilha: 15,
    });
    expect(html4).toContain("Prática ainda NÃO EXECUTADA");
  });

  it("gera guiões cujos tempos somam 120 minutos e que não expõem o exame", () => {
    for (const k of chaves) {
      const g = montarGuiao(LICOES[k]!, "t", 120, {
        acolhimento: 10,
        exposicao: 35,
        actividade: 60,
        partilha: 15,
      });
      expect(g).toContain("0–10 min");
      expect(g).toContain("10–45 min");
      expect(g).toContain("45–105 min");
      expect(g).toContain("105–120 min");
      expect(g).toMatch(/banco de questões deste curso ainda NÃO está preparado/);
    }
  });
});
