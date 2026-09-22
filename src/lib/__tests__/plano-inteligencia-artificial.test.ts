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

describe("módulo 2 — uso responsável da inteligência artificial", () => {
  const chaves = ["m2l1", "m2l2", "m2l3", "m2l4"];
  const T = { acolhimento: 10, exposicao: 35, actividade: 60, partilha: 15 };

  it("dá às quatro lições objectivos observáveis, caso fictício, tabela e produto", () => {
    for (const k of chaves) {
      const c = LICOES[k]!;
      expect(c.objectivos.length).toBeGreaterThanOrEqual(4);
      expect(c.explicacao.length).toBeGreaterThanOrEqual(5);
      expect(c.explicacao.join(" ").length).toBeGreaterThan(2500);
      expect(c.tabela!.linhas.length).toBeGreaterThan(0);
      for (const linha of c.tabela!.linhas)
        expect(linha).toHaveLength(c.tabela!.colunas.length);
      expect(c.anexos!.length).toBeGreaterThanOrEqual(2);
      expect(c.actividade.produto.length).toBeGreaterThan(80);
      expect(c.actividade.rubrica.length).toBeGreaterThanOrEqual(5);
      expect(c.sintese.length).toBeGreaterThanOrEqual(8);
      expect(c.verificacao).toHaveLength(2);
      expect(c.guiao.conducao).toHaveLength(4);
      const html = montarElearning(c, 120, T);
      expect(html).toContain("Acolhimento e objectivos: 10 minutos");
      expect(html).toContain("Exposição: 35 minutos");
      expect(html).toContain("Actividade prática: 60 minutos");
      expect(html).toContain("Partilha e síntese: 15 minutos");
      expect(html).toContain("são fictícios e servem apenas de exercício");
      const guiao = montarGuiao(c, "t", 120, T);
      expect(guiao).toContain("105–120 min");
      expect(guiao).toMatch(/gabarito fica sempre apenas no servidor/);
    }
  });

  it("lição 5: compara com a alternativa sem IA, exige duas execuções e não decide direitos", () => {
    const c = LICOES["m2l1"]!;
    const tudo = JSON.stringify(c);
    for (const criterio of ["Custo", "Benefício", "Língua", "Conectividade", "Dependência de fornecedor"])
      expect(c.tabela!.linhas.some((l) => l[0]!.includes(criterio))).toBe(true);
    expect(c.tabela!.linhas).toHaveLength(6);
    expect(tudo).toMatch(/alternativa sem inteligência artificial/i);
    expect(tudo).toMatch(/duas execuções/);
    expect(tudo).toMatch(/não decidas se o pedido é deferido|decisão sobre direitos/i);
    expect(c.pratica!.contingencia.join(" ")).toMatch(/PENDENTE — a reagendar/);
    expect(c.pratica!.contingencia.join(" ")).toMatch(/não substitui a prática real/);
    expect(tudo).toMatch(/não se promete que qualquer ferramenta seja gratuita/);
    expect(tudo).toMatch(/Ninguém cria conta pessoal, ninguém paga/);
  });

  it("lição 6: tabela de dezasseis campos e distinção pseudonimização/anonimização", () => {
    const c = LICOES["m2l2"]!;
    expect(c.tabela!.linhas).toHaveLength(16);
    const tudo = JSON.stringify(c);
    expect(tudo).toMatch(/Pseudonimizar|pseudonimização/i);
    expect(tudo).toMatch(/Anonimizar|anonimização/i);
    expect(tudo).toMatch(/retenção/i);
    expect(tudo).toMatch(/fluxo/i);
    // Não se inventa legislação nacional aprovada.
    expect(tudo).not.toMatch(/Lei n\.º|lei moçambicana de protecção de dados em vigor/i);
    expect(tudo).toMatch(/área jurídica da instituição/);
  });

  it("lição 7: os cálculos de falsos positivos e falsos negativos fecham", () => {
    const c = LICOES["m2l3"]!;
    const linhas = c.tabela!.linhas;
    expect(linhas).toHaveLength(4);
    const n = (l: string[], i: number) => Number(l[i]);
    let total = 0, incompletos = 0, vp = 0, fn = 0, completos = 0, fp = 0, vn = 0;
    for (const l of linhas.slice(0, 3)) {
      // total = incompletos + completos; incompletos = VP + FN; completos = FP + VN
      expect(n(l, 3) + n(l, 4)).toBe(n(l, 2));
      expect(n(l, 6) + n(l, 7)).toBe(n(l, 5));
      expect(n(l, 2) + n(l, 5)).toBe(n(l, 1));
      total += n(l, 1); incompletos += n(l, 2); vp += n(l, 3); fn += n(l, 4);
      completos += n(l, 5); fp += n(l, 6); vn += n(l, 7);
    }
    const t = linhas[3]!;
    expect([total, incompletos, vp, fn, completos, fp, vn]).toEqual(
      [1, 2, 3, 4, 5, 6, 7].map((i) => n(t, i)),
    );
    expect(total).toBe(600);
    expect((vp + vn) / total).toBe(0.78);
    // Taxas por grupo, tal como a rubrica as apresenta.
    expect(15 / 60).toBe(0.25);
    expect(24 / 240).toBe(0.1);
    expect(30 / 60).toBe(0.5);
    expect(35 / 140).toBe(0.25);
    expect(8 / 20).toBe(0.4);
    expect(20 / 80).toBe(0.25);
    expect(Math.round((fn / incompletos) * 1000) / 10).toBe(37.9);
    expect(Math.round((fp / completos) * 1000) / 10).toBe(17.2);
    const rubrica = c.actividade.rubrica.join(" ");
    expect(rubrica).toMatch(/15 dividido por 60 = 0,25/);
    expect(rubrica).toMatch(/30 dividido por 60 = 0,50/);
    expect(rubrica).toMatch(/468 dividido por 600 = 0,78/);
    const tudo = JSON.stringify(c);
    expect(tudo).toMatch(/não prova, por si, causalidade|não prova causalidade|é um sinal, não uma prova/);
    expect(tudo).toMatch(/alternativa acessível/);
  });

  it("lição 8: supervisão com poder de parar, contestação e distinção lei/recomendação/estratégia", () => {
    const c = LICOES["m2l4"]!;
    const tudo = JSON.stringify(c);
    expect(c.tabela!.colunas).toEqual([
      "Risco", "Quem é afectado", "Responsável (por função)", "Acção", "Evidência", "Prazo",
    ]);
    expect(tudo).toMatch(/poder de suspender|mandar parar/);
    expect(tudo).toMatch(/contestação/);
    expect(tudo).toMatch(/minuta de suspensão/i);
    expect(tudo).toMatch(/piloto/);
    expect(tudo).toMatch(/organizações de pessoas com deficiência/);
    expect(tudo).toMatch(/Lei é norma obrigatória/);
    expect(tudo).toMatch(/não se aplica automaticamente a Moçambique|não é lei aplicável|não é lei de Moçambique/);
  });

  it("cita as quatro fontes oficiais com data de consulta e síntese própria até 200 palavras", () => {
    const urls = [
      "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
      "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics",
      "https://au.int/en/documents/20240809/continental-artificial-intelligence-strategy",
      "https://intic.gov.mz/consulta-publica-da-proposta-da-estrategia-nacional-de-inteligencia-artificial/",
    ];
    const todas = chaves.flatMap((k) => LICOES[k]!.referencias ?? []);
    for (const url of urls) {
      const ref = todas.find((r) => r.url === url);
      expect(ref, url).toBeDefined();
      expect(ref!.consultadoEm).toBe("22 de Setembro de 2026");
      expect(ref!.resumo!.split(/\s+/).length).toBeLessThanOrEqual(200);
      expect(ref!.resumo!.split(/\s+/).length).toBeGreaterThan(80);
    }
    const html = montarElearning(LICOES["m2l4"]!, 120, T);
    for (const url of urls) expect(html).toContain(url);
    expect(html).toContain("consultado em 22 de Setembro de 2026");
    expect(html).toContain("Síntese da equipa");
  });

  it("não afirma estratégia nem lei de IA aprovada em Moçambique, nem mandato regulador do INTIC", () => {
    const tudo = chaves.map((k) => JSON.stringify(LICOES[k])).join(" ");
    expect(tudo).not.toMatch(/estratégia nacional de inteligência artificial aprovada/i);
    expect(tudo).not.toMatch(/INTIC é a autoridade|INTIC, autoridade reguladora/i);
    expect(tudo).toMatch(/não se deve inferir da consulta que o INTIC seja autoridade reguladora/i);
    expect(tudo).toMatch(/não prova que exista estratégia aprovada/);
    expect(tudo).toMatch(/proposta/i);
    expect(tudo).not.toMatch(/aprovado pela ATDI|validado pela Ologa|Língua de Sinais/i);
  });
});
