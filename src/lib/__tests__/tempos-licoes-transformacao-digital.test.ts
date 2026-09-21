import { describe, expect, it } from "vitest";
import {
  LICOES_PLANO,
  MINUTOS_TOTAIS,
  CARGA_HORARIA_OFICIAL_HORAS,
} from "@/lib/plano-transformacao-digital";
import {
  LICOES,
  montarElearning,
  montarGuiao,
  minutosPorBloco,
} from "../../../scripts/conteudo/transformacao-digital-licoes";

describe("tempos das lições — fonte única entre conteúdo e guião", () => {
  it("os quatro blocos fecham com os minutos, a teoria e a prática de cada lição", () => {
    for (const l of LICOES_PLANO) {
      const { acolhimento, exposicao, actividade, partilha } = l.tempos;
      expect(acolhimento + exposicao).toBe(l.teoriaMin);
      expect(actividade + partilha).toBe(l.praticaMin);
      expect(acolhimento + exposicao + actividade + partilha).toBe(l.minutos);
      expect(l.minutos === 90 || l.minutos === 105).toBe(true);
    }
  });

  it("continua a somar exactamente 24 horas", () => {
    expect(MINUTOS_TOTAIS).toBe(CARGA_HORARIA_OFICIAL_HORAS * 60);
  });

  it("todas as 12 lições têm conteúdo e guião com quatro passos de condução", () => {
    expect(LICOES_PLANO).toHaveLength(12);
    for (const l of LICOES_PLANO) {
      const c = LICOES[l.chave];
      expect(c, `falta conteúdo para ${l.chave}`).toBeDefined();
      expect(c!.guiao.conducao).toHaveLength(4);
      expect(c!.objectivos.length).toBeGreaterThan(0);
      expect(c!.explicacao.length).toBeGreaterThan(0);
      expect(c!.verificacao.length).toBeGreaterThan(0);
    }
  });

  it("o tempo da actividade no conteúdo é o mesmo que o guião reserva", () => {
    for (const l of LICOES_PLANO) {
      const c = LICOES[l.chave]!;
      const html = montarElearning(c, l.minutos, l.tempos);
      const guiao = montarGuiao(c, l.titulo, l.minutos, l.tempos);
      expect(html).toContain(
        `${l.tempos.actividade} minutos de trabalho`,
      );
      expect(html).toContain(`${l.tempos.partilha} minutos de partilha`);

      // As faixas do guião derivam dos mesmos minutos.
      const blocos = minutosPorBloco(l.tempos);
      let inicio = 0;
      for (const m of blocos) {
        expect(guiao).toContain(`${inicio}–${inicio + m} min`);
        inicio += m;
      }
      expect(inicio).toBe(l.minutos);
    }
  });

  it("o guião não expõe perguntas nem respostas do exame final", async () => {
    const { EXAME } = await import(
      "../../../scripts/conteudo/transformacao-digital-questoes"
    );
    for (const l of LICOES_PLANO) {
      const guiao = montarGuiao(LICOES[l.chave]!, l.titulo, l.minutos, l.tempos);
      for (const q of EXAME) {
        expect(guiao.includes(q.e)).toBe(false);
      }
    }
  });
});
