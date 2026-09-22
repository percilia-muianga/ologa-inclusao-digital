import { describe, expect, it } from "vitest";
import {
  BLOCOS_AVALIACAO,
  CARGA_HORARIA_HORAS,
  LICOES_PLANO,
  MINUTOS_TOTAIS,
  MODULOS_PLANO,
  RESULTADOS_SEC_6_4,
  TOPICOS_SEC_6_4,
} from "../plano-seguranca-cibernetica";
import { LICOES, montarTodas } from "../../../scripts/conteudo/seguranca-cibernetica-licoes";
import { LICOES_M1 } from "../../../scripts/conteudo/seguranca-cibernetica-m1";
import { LICOES_M2 } from "../../../scripts/conteudo/seguranca-cibernetica-m2";
import { LICOES_M3 } from "../../../scripts/conteudo/seguranca-cibernetica-m3";

describe("plano de Segurança Cibernética Avançada", () => {
  it("soma 30 horas, incluindo transversal e avaliação", () => {
    expect(MINUTOS_TOTAIS).toBe(1800);
    expect(MINUTOS_TOTAIS / 60).toBe(CARGA_HORARIA_HORAS);
  });

  it("reparte 480 / 600 / 480 minutos pelos módulos e 120 no transversal", () => {
    const porOrdem = Object.fromEntries(MODULOS_PLANO.map((m) => [m.ordem, m.minutos]));
    expect(porOrdem[1]).toBe(480);
    expect(porOrdem[2]).toBe(600);
    expect(porOrdem[3]).toBe(480);
    expect(porOrdem[4]).toBe(120);
    expect(BLOCOS_AVALIACAO.reduce((s, b) => s + b.minutos, 0)).toBe(120);
  });

  it("tem 15 lições com ordens 1 a 5 em cada módulo e blocos de tempo coerentes", () => {
    expect(LICOES_PLANO).toHaveLength(15);
    for (const m of MODULOS_PLANO.filter((x) => !x.transversal)) {
      expect(m.licoes.map((l) => l.ordem)).toEqual([1, 2, 3, 4, 5]);
    }
    for (const l of LICOES_PLANO) {
      const t = l.tempos;
      expect(t.acolhimento + t.exposicao + t.actividade + t.partilha).toBe(l.minutos);
      expect(l.teoriaMin + l.praticaMin).toBe(l.minutos);
    }
  });

  it("cobre os 16 tópicos e os 10 resultados da secção 6.4", () => {
    const topicos = new Set(LICOES_PLANO.flatMap((l) => l.topicos));
    const resultados = new Set(LICOES_PLANO.flatMap((l) => l.resultados));
    for (const t of TOPICOS_SEC_6_4) expect(topicos.has(t)).toBe(true);
    for (const r of RESULTADOS_SEC_6_4) expect(resultados.has(r)).toBe(true);
  });

  it("usa títulos explícitos, sem marcadores de conteúdo por fornecer", () => {
    for (const l of LICOES_PLANO) {
      expect(l.titulo.length).toBeGreaterThan(20);
      expect(l.titulo.toLowerCase()).not.toMatch(/lição \d|por fornecer|em prepara/);
    }
  });
});

describe("conteúdo escrito das 15 lições", () => {
  it("existe conteúdo para cada chave do plano, sem chaves órfãs", () => {
    expect(Object.keys(LICOES_M1)).toHaveLength(5);
    expect(Object.keys(LICOES_M2)).toHaveLength(5);
    expect(Object.keys(LICOES_M3)).toHaveLength(5);
    expect(Object.keys(LICOES).sort()).toEqual(LICOES_PLANO.map((l) => l.chave).sort());
  });

  it("nas lições com laboratório, papel mais laboratório cabe no tempo de actividade", () => {
    for (const l of LICOES_PLANO) {
      const c = LICOES[l.chave];
      if (!c?.laboratorio) continue;
      const lab = c.laboratorio;
      expect(lab.minutos, l.chave).toBeGreaterThan(0);
      const papel = c.actividade.passos.reduce((s, p) => {
        const m = p.match(/\((\d+) minutos\)/);
        return s + (m ? Number(m[1]) : 0);
      }, 0);
      expect(papel + lab.minutos, l.chave).toBe(l.tempos.actividade);
      expect(lab.dependenciasPorPreparar.length, l.chave).toBeGreaterThan(0);
    }
  });

  it("cada lição tem objectivos, explicação substantiva, actividade e síntese", () => {
    for (const [chave, c] of Object.entries(LICOES)) {
      expect(c.objectivos.length, chave).toBeGreaterThanOrEqual(3);
      expect(c.explicacao.length, chave).toBeGreaterThanOrEqual(4);
      expect(c.explicacao.join(" ").length, chave).toBeGreaterThan(1800);
      expect(c.exemplo.corpo.length, chave).toBeGreaterThanOrEqual(2);
      expect(c.actividade.enunciado.length, chave).toBeGreaterThanOrEqual(3);
      expect(c.actividade.rubrica.length, chave).toBeGreaterThanOrEqual(4);
      expect(c.sintese.length, chave).toBeGreaterThanOrEqual(4);
      expect(c.verificacao.length, chave).toBeGreaterThanOrEqual(2);
      for (const v of c.verificacao) {
        expect(v.resposta.length, chave).toBeGreaterThan(80);
        expect(v.feedback.length, chave).toBeGreaterThan(40);
      }
      expect(c.guiao.conducao, chave).toHaveLength(4);
    }
  });

  it("os laboratórios declarados no plano existem, com reversão e alternativa offline", () => {
    for (const l of LICOES_PLANO) {
      const c = LICOES[l.chave]!;
      expect(Boolean(c.laboratorio), l.chave).toBe(l.laboratorio);
      if (!c.laboratorio) continue;
      expect(c.laboratorio.recursos.length, l.chave).toBeGreaterThanOrEqual(3);
      expect(c.laboratorio.passos.length, l.chave).toBeGreaterThanOrEqual(4);
      expect(c.laboratorio.verificacaoSucesso.length, l.chave).toBeGreaterThanOrEqual(3);
      expect(c.laboratorio.reversao.length, l.chave).toBeGreaterThanOrEqual(2);
      expect(c.laboratorio.alternativaOffline.length, l.chave).toBeGreaterThanOrEqual(3);
    }
  });

  it("as referências têm data de consulta e endereço", () => {
    for (const [chave, c] of Object.entries(LICOES)) {
      for (const r of c.referencias ?? []) {
        expect(r.url, chave).toMatch(/^https:\/\//);
        expect(r.consultadoEm, chave).toMatch(/2026/);
      }
    }
  });
});

describe("montagem das lições", () => {
  const montadas = montarTodas();

  it("monta 15 lições com conteúdo e guião", () => {
    expect(montadas).toHaveLength(15);
    for (const m of montadas) {
      expect(m.elearning.length, m.chave).toBeGreaterThan(6000);
      expect(m.guiao.length, m.chave).toBeGreaterThan(1500);
      expect(m.elearning).toContain("Duração prevista");
      expect(m.elearning).toContain("Síntese em leitura fácil");
      expect(m.guiao).toContain("Guião do formador");
    }
  });

  it("marca os casos como fictícios e as referências como voluntárias", () => {
    for (const m of montadas) {
      expect(m.elearning, m.chave).toContain("fictícios");
      if (m.elearning.includes("Referências consultadas")) {
        expect(m.elearning.toLowerCase(), m.chave).toContain("não são lei moçambicana");
      }
    }
  });

  it("mostra as regras do laboratório apenas nas lições com laboratório", () => {
    for (const m of montadas) {
      expect(m.elearning.includes("Regras do laboratório"), m.chave).toBe(m.laboratorio);
    }
  });

  it("não expõe perguntas nem gabaritos de exame", () => {
    for (const m of montadas) {
      expect(m.elearning, m.chave).toContain("não são perguntas do exame final");
      expect(m.guiao, m.chave).toContain("não contém perguntas nem respostas");
    }
  });
});
