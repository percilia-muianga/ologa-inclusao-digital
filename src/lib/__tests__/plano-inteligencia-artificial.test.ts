import { describe, expect, it } from "vitest";
import {
  BLOCOS_AVALIACAO,
  CARGA_HORARIA_PROVISORIA_HORAS,
  DIVERGENCIA_CARGA_INTERNA,
  ESTADO_EDITORIAL_INTERNO,
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

  it("guarda a divergência real no registo interno, com decisão e pendência", () => {
    expect(DIVERGENCIA_CARGA_INTERNA).toMatch(/16 horas/);
    expect(DIVERGENCIA_CARGA_INTERNA).toMatch(/secção 6\.2/);
    expect(DIVERGENCIA_CARGA_INTERNA).toMatch(/secção 14/);
    expect(DIVERGENCIA_CARGA_INTERNA).toMatch(/13\.1/);
    expect(DIVERGENCIA_CARGA_INTERNA).toMatch(/Decisão operacional/);
    expect(DIVERGENCIA_CARGA_INTERNA).toMatch(/Pendente: confirmação pela ATDI/);
    expect(DIVERGENCIA_CARGA_INTERNA).toMatch(/não constitui aprovação da ATDI/);
    expect(ESTADO_EDITORIAL_INTERNO).toMatch(/Língua de Sinais/);
    expect(ESTADO_EDITORIAL_INTERNO).toMatch(/Banco de avaliação por preparar/);
  });

  it("apresenta as 20 horas como configuração actual, sem rótulos editoriais", () => {
    const publicos = [
      FICHA_CURSO.nota,
      FICHA_CURSO.objectivos,
      FICHA_CURSO.materiais,
      FICHA_CURSO.preRequisitos,
      FICHA_CURSO.publicoAlvo,
    ];
    expect(FICHA_CURSO.nota).toMatch(/Carga horária de 20 horas/);
    for (const t of publicos) {
      expect(t).not.toMatch(/provisóri/i);
      expect(t).not.toMatch(/por validar|rascunho|proposta pedagógica/i);
      expect(t).not.toMatch(/ATDI não|confirmar pela ATDI|aprovado pela ATDI/i);
      expect(t).not.toMatch(/16 horas/);
      expect(t).not.toMatch(/Língua de Sinais|legendagem|vídeo/i);
      expect(t).not.toMatch(/inactiv/i);
    }
  });

  it("mantém o plano alternativo de 16 horas documentado e não activo", () => {
    expect(PLANO_ALTERNATIVO_16H.activo).toBe(false);
    expect(PLANO_ALTERNATIVO_16H.totalMinutos).toBe(960);
    expect(PLANO_ALTERNATIVO_16H.blocos.reduce((s, b) => s + b.minutos, 0)).toBe(960);
  });

  it("não anuncia a avaliação final como disponível", () => {
    expect(FICHA_CURSO.nota).toMatch(/disponibilizada em fase posterior/);
  });

  it("não afirma que o EU AI Act se aplica automaticamente a Moçambique", () => {
    expect(FICHA_CURSO.objectivos).toMatch(/não se aplica automaticamente a Moçambique/);
  });
});

describe("conteúdo escrito dos módulos 1 e 2", () => {
  const chaves = ["m1l1", "m1l2", "m1l3", "m1l4", "m2l1", "m2l2", "m2l3", "m2l4"];

  it("escreve as oito lições dos módulos 1 e 2", () => {
    expect(Object.keys(LICOES).sort()).toEqual(chaves);
    expect(DESCRICOES_MODULO["m2"]).not.toMatch(/Em preparação|por escrever/i);
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
    expect(tudo).not.toMatch(/ferramenta gratuita|grátis/i);
    const html4 = montarElearning(LICOES["m1l4"]!, 120, {
      acolhimento: 10,
      exposicao: 35,
      actividade: 60,
      partilha: 15,
    });
    expect(html4).toMatch(/não se promete que qualquer ferramenta seja gratuita/i);
    expect(html4).toMatch(/Não se pede a ninguém que crie conta pessoal|não se cria conta pessoal/i);
    expect(FICHA_CURSO.materiais).toMatch(/não se promete que qualquer ferramenta seja gratuita/i);
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
      expect(html).not.toMatch(/proposta pedagógica|por validar pela Ologa|rascunho por validar/i);
      expect(html).toContain("são fictícios e servem apenas de exercício");
      expect(html).toContain("Acolhimento e objectivos: 10 minutos");
      expect(html).toContain("Actividade prática: 60 minutos");
    }
    const html4 = montarElearning(LICOES["m1l4"]!, 120, {
      acolhimento: 10,
      exposicao: 35,
      actividade: 60,
      partilha: 15,
    });
    expect(html4).toContain("Condições desta prática");
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
      expect(g).not.toMatch(/proposta pedagógica|por validar pela Ologa|rascunho por validar/i);
      expect(g).toMatch(/gabarito fica sempre apenas no servidor/);
    }
  });
});
