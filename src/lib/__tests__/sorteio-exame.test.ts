import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  geradorComSemente,
  sortearExame,
  tipoPedagogico,
  type QuestaoSorteavel,
  type QuotasExame,
} from "@/lib/sorteio-exame";
import { QUOTAS_POR_CURSO, quotasDificuldade } from "@/lib/quotas-exame";

/** Banco sintético com a mesma forma do banco real de Computação em Nuvem. */
function bancoNuvem(): QuestaoSorteavel[] {
  const linhas: [string, string, boolean, string, number][] = [
    // módulo, tipologia, cenário, dificuldade, quantas
    ["131", "escolha_multipla", false, "facil", 3],
    ["131", "escolha_multipla", false, "media", 3],
    ["131", "escolha_multipla", true, "media", 2],
    ["131", "escolha_multipla", false, "dificil", 1],
    ["131", "escolha_multipla", true, "dificil", 1],
    ["131", "verdadeiro_falso", false, "facil", 4],
    ["131", "correspondencia", false, "facil", 2],
    ["131", "correspondencia", false, "media", 1],
    ["131", "correspondencia", false, "dificil", 1],
    ["132", "escolha_multipla", false, "facil", 5],
    ["132", "escolha_multipla", false, "media", 3],
    ["132", "escolha_multipla", true, "media", 2],
    ["132", "escolha_multipla", false, "dificil", 1],
    ["132", "escolha_multipla", true, "dificil", 2],
    ["132", "verdadeiro_falso", false, "facil", 2],
    ["132", "verdadeiro_falso", false, "media", 2],
    ["132", "correspondencia", false, "facil", 1],
    ["132", "correspondencia", false, "media", 2],
    ["132", "correspondencia", false, "dificil", 1],
    ["133", "escolha_multipla", false, "facil", 4],
    ["133", "escolha_multipla", true, "media", 2],
    ["133", "escolha_multipla", false, "dificil", 2],
    ["133", "escolha_multipla", true, "dificil", 1],
    ["133", "verdadeiro_falso", false, "facil", 1],
    ["133", "verdadeiro_falso", false, "media", 2],
    ["133", "correspondencia", false, "media", 2],
    ["133", "correspondencia", false, "dificil", 1],
    ["200", "escolha_multipla", false, "facil", 1],
    ["200", "escolha_multipla", true, "media", 1],
    ["200", "escolha_multipla", false, "media", 1],
    ["200", "escolha_multipla", true, "dificil", 1],
    ["200", "verdadeiro_falso", false, "facil", 1],
    ["200", "correspondencia", false, "media", 1],
  ];
  const questoes: QuestaoSorteavel[] = [];
  let n = 0;
  for (const [modulo, tipologia, cenario, dificuldade, quantas] of linhas) {
    for (let i = 0; i < quantas; i++) {
      questoes.push({
        id: `q${++n}`,
        moduloId: modulo,
        tipologia: tipologia as QuestaoSorteavel["tipologia"],
        cenario,
        dificuldade: dificuldade as QuestaoSorteavel["dificuldade"],
      });
    }
  }
  return questoes;
}

function quotasNuvem(): QuotasExame {
  const q = QUOTAS_POR_CURSO["computacao-em-nuvem"]!;
  return {
    total: q.total,
    dificuldade: quotasDificuldade(q.total, { facil: 40, media: 40, dificil: 20 }),
    modulos: Object.fromEntries(
      Object.entries(q.modulosPorOrdem).map(([ordem, n]) => [ordem, n]),
    ),
    tipos: q.tipos,
  };
}

function conferir(
  ids: string[],
  banco: QuestaoSorteavel[],
  quotas: QuotasExame,
) {
  expect(new Set(ids).size).toBe(ids.length); // sem repetições
  expect(ids.length).toBe(quotas.total);
  const escolhidas = ids.map((id) => banco.find((q) => q.id === id)!);
  expect(escolhidas.every(Boolean)).toBe(true);
  for (const [modulo, n] of Object.entries(quotas.modulos))
    expect(escolhidas.filter((q) => q.moduloId === modulo).length).toBe(n);
  for (const [tipo, n] of Object.entries(quotas.tipos))
    expect(escolhidas.filter((q) => tipoPedagogico(q) === tipo).length).toBe(n);
  for (const d of ["facil", "media", "dificil"] as const)
    expect(escolhidas.filter((q) => q.dificuldade === d).length).toBe(quotas.dificuldade[d]);
}

describe("sorteio com cobertura garantida — Computação em Nuvem", () => {
  const banco = bancoNuvem();
  const quotas = quotasNuvem();

  it("as quotas de dificuldade de 40/40/20 dão 8 fáceis, 8 médias e 4 difíceis", () => {
    expect(quotasDificuldade(20, { facil: 40, media: 40, dificil: 20 })).toEqual({
      facil: 8,
      media: 8,
      dificil: 4,
    });
  });

  it("cumpre módulos, tipologias, dificuldades e não repete, em 200 amostras com sementes diferentes", () => {
    for (let semente = 1; semente <= 200; semente++) {
      const r = sortearExame(banco, quotas, geradorComSemente(semente));
      expect(r.ok, `semente ${semente}`).toBe(true);
      if (r.ok) conferir(r.ids, banco, quotas);
    }
  });

  it("é determinístico com a mesma semente e varia com sementes diferentes", () => {
    const a = sortearExame(banco, quotas, geradorComSemente(7));
    const b = sortearExame(banco, quotas, geradorComSemente(7));
    const c = sortearExame(banco, quotas, geradorComSemente(8));
    expect(a).toEqual(b);
    expect(a.ok && c.ok && a.ids.join() === c.ids.join()).toBe(false);
  });

  it("sorteia entre várias selecções viáveis (não devolve sempre a mesma prova)", () => {
    const provas = new Set<string>();
    for (let s = 1; s <= 30; s++) {
      const r = sortearExame(banco, quotas, geradorComSemente(s));
      if (r.ok) provas.add([...r.ids].sort().join(","));
    }
    expect(provas.size).toBeGreaterThan(20);
  });
});

describe("sorteio com cobertura garantida — Transformação Digital", () => {
  // Composição real do banco v2 de Transformação Digital:
  // 111 Fundamentos 18 · 112 Serviços Centrados no Cidadão 18 ·
  // 113 Implementação e Mudança 18 · 200 Governo Digital Inclusivo 6.
  // "cenario" representa questão de cenário (formato de resposta escolha múltipla).
  const linhas: [string, string, string, number][] = [
    ["111", "escolha_multipla", "facil", 3],
    ["111", "escolha_multipla", "media", 3],
    ["111", "escolha_multipla", "dificil", 2],
    ["111", "verdadeiro_falso", "facil", 2],
    ["111", "verdadeiro_falso", "media", 2],
    ["111", "correspondencia", "facil", 1],
    ["111", "correspondencia", "media", 1],
    ["111", "correspondencia", "dificil", 1],
    ["111", "ordenacao", "facil", 1],
    ["111", "cenario", "media", 1],
    ["111", "cenario", "dificil", 1],
    ["112", "escolha_multipla", "facil", 3],
    ["112", "escolha_multipla", "media", 4],
    ["112", "escolha_multipla", "dificil", 1],
    ["112", "verdadeiro_falso", "facil", 2],
    ["112", "verdadeiro_falso", "media", 1],
    ["112", "verdadeiro_falso", "dificil", 1],
    ["112", "correspondencia", "facil", 1],
    ["112", "correspondencia", "media", 1],
    ["112", "correspondencia", "dificil", 1],
    ["112", "ordenacao", "facil", 1],
    ["112", "ordenacao", "media", 1],
    ["112", "cenario", "dificil", 1],
    ["113", "escolha_multipla", "facil", 2],
    ["113", "escolha_multipla", "media", 3],
    ["113", "escolha_multipla", "dificil", 1],
    ["113", "verdadeiro_falso", "facil", 2],
    ["113", "verdadeiro_falso", "media", 1],
    ["113", "verdadeiro_falso", "dificil", 1],
    ["113", "correspondencia", "facil", 2],
    ["113", "correspondencia", "media", 1],
    ["113", "correspondencia", "dificil", 1],
    ["113", "ordenacao", "facil", 1],
    ["113", "ordenacao", "media", 1],
    ["113", "cenario", "media", 2],
    ["200", "escolha_multipla", "facil", 1],
    ["200", "escolha_multipla", "media", 1],
    ["200", "correspondencia", "facil", 1],
    ["200", "correspondencia", "media", 1],
    ["200", "ordenacao", "facil", 1],
    ["200", "cenario", "media", 1],
  ];
  const banco: QuestaoSorteavel[] = [];
  let n = 0;
  for (const [m, t, d, q] of linhas)
    for (let i = 0; i < q; i++)
      banco.push({
        id: `t${++n}`,
        moduloId: m,
        tipologia: (t === "cenario" ? "escolha_multipla" : t) as QuestaoSorteavel["tipologia"],
        cenario: t === "cenario",
        dificuldade: d as QuestaoSorteavel["dificuldade"],
      });


  const cfg = QUOTAS_POR_CURSO["principios-transformacao-digital"]!;
  const quotas: QuotasExame = {
    total: cfg.total,
    dificuldade: quotasDificuldade(cfg.total, { facil: 40, media: 40, dificil: 20 }),
    modulos: cfg.modulosPorOrdem as unknown as Record<string, number>,
    tipos: cfg.tipos,
  };

  it("cumpre as quotas propostas em 150 amostras, com todos os módulos, tipos e cenários", () => {
    for (let semente = 1; semente <= 150; semente++) {
      const r = sortearExame(banco, quotas, geradorComSemente(semente));
      expect(r.ok, `semente ${semente}`).toBe(true);
      if (r.ok) {
        conferir(r.ids, banco, quotas);
        const escolhidas = r.ids.map((id) => banco.find((q) => q.id === id)!);
        expect(escolhidas.filter((q) => q.tipologia === "ordenacao" && !q.cenario).length).toBe(2);
        expect(escolhidas.filter((q) => q.cenario).length).toBe(2);
        expect(new Set(escolhidas.map((q) => q.moduloId)).size).toBe(4);
      }
    }
  });

});

describe("bloqueios honestos, sem completar em silêncio", () => {
  const banco = bancoNuvem();
  const quotas = quotasNuvem();

  it("bloqueia quando as quotas não somam o total", () => {
    const r = sortearExame(banco, { ...quotas, modulos: { "131": 5 } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.causa).toBe("QUOTAS_INCOERENTES");
  });

  it("bloqueia quando um módulo não tem questões utilizáveis suficientes", () => {
    const semM3 = banco.filter((q) => q.moduloId !== "133");
    const r = sortearExame(semM3, quotas, geradorComSemente(3));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.causa).toBe("MODULO_SEM_QUESTOES");
  });

  it("bloqueia por escassez de cenários em vez de os substituir por outros tipos", () => {
    const poucos = banco.filter((q) => !q.cenario || q.id === banco.find((x) => x.cenario)!.id);
    const r = sortearExame(poucos, quotas, geradorComSemente(4));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.causa).toBe("TIPO_SEM_QUESTOES");
  });

  it("bloqueia por escassez de difíceis", () => {
    const semDificeis = banco.filter((q) => q.dificuldade !== "dificil");
    const r = sortearExame(semDificeis, quotas, geradorComSemente(5));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.causa).toBe("DIFICULDADE_SEM_QUESTOES");
  });

  it("detecta combinação impossível mesmo quando cada critério isolado chega", () => {
    // Dois módulos, dois tipos: há 2 de cada critério, mas as questões estão
    // nos cantos errados da tabela, pelo que não existe combinação válida.
    const q = (id: string, m: string, t: QuestaoSorteavel["tipologia"]): QuestaoSorteavel => ({
      id,
      moduloId: m,
      tipologia: t,
      cenario: false,
      dificuldade: "facil",
    });
    const r = sortearExame(
      [q("a", "A", "escolha_multipla"), q("b", "A", "escolha_multipla")],
      {
        total: 2,
        dificuldade: { facil: 2, media: 0, dificil: 0 },
        modulos: { A: 1, B: 1 },
        tipos: { escolha_multipla: 2 },
      },
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.causa).toBe("MODULO_SEM_QUESTOES");

    const r2 = sortearExame(
      [
        q("a", "A", "escolha_multipla"),
        q("b", "A", "escolha_multipla"),
        q("c", "B", "verdadeiro_falso"),
        q("d", "B", "verdadeiro_falso"),
      ],
      {
        total: 2,
        dificuldade: { facil: 2, media: 0, dificil: 0 },
        modulos: { A: 2, B: 0 },
        tipos: { escolha_multipla: 1, verdadeiro_falso: 1 },
      },
    );
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.causa).toBe("COMBINACAO_IMPOSSIVEL");
  });

  it("resolve um conjunto que uma escolha gananciosa perderia", () => {
    // Uma escolha gananciosa que enchesse o tipo A com as questões do módulo X
    // ficaria sem forma de cumprir o módulo Y; o retrocesso encontra a solução.
    const q = (
      id: string,
      m: string,
      t: QuestaoSorteavel["tipologia"],
      d: QuestaoSorteavel["dificuldade"],
    ): QuestaoSorteavel => ({ id, moduloId: m, tipologia: t, cenario: false, dificuldade: d });
    const banco2 = [
      q("1", "X", "escolha_multipla", "facil"),
      q("2", "X", "escolha_multipla", "facil"),
      q("3", "X", "verdadeiro_falso", "media"),
      q("4", "Y", "escolha_multipla", "facil"),
      q("5", "Y", "escolha_multipla", "media"),
    ];
    for (let s = 1; s <= 50; s++) {
      const r = sortearExame(
        banco2,
        {
          total: 3,
          dificuldade: { facil: 2, media: 1, dificil: 0 },
          modulos: { X: 2, Y: 1 },
          tipos: { escolha_multipla: 2, verdadeiro_falso: 1 },
        },
        geradorComSemente(s),
      );
      expect(r.ok, `semente ${s}`).toBe(true);
      if (r.ok) {
        expect(r.ids).toContain("3");
        expect(r.ids.some((id) => id === "4" || id === "5")).toBe(true);
        expect(new Set(r.ids).size).toBe(3);
      }
    }
  });
});

describe("classificação pedagógica por metadado", () => {
  it("cenário é categoria própria mesmo usando escolha múltipla", () => {
    expect(tipoPedagogico({ tipologia: "escolha_multipla", cenario: true })).toBe("cenario");
    expect(tipoPedagogico({ tipologia: "escolha_multipla", cenario: false })).toBe(
      "escolha_multipla",
    );
    expect(tipoPedagogico({ tipologia: "correspondencia", cenario: false })).toBe(
      "correspondencia",
    );
  });

  it("não usa o texto do enunciado para decidir o tipo", () => {
    const comTextoDeCenario = { tipologia: "verdadeiro_falso" as const, cenario: false };
    expect(tipoPedagogico(comTextoDeCenario)).toBe("verdadeiro_falso");
  });
});

describe("garantias no motor de exame (regressão sobre o código)", () => {
  const fonte = readFileSync("src/lib/avaliacao.functions.ts", "utf8");

  it("o exame só carrega questões activas, em uso e do instrumento de exame", () => {
    const trecho = fonte.slice(fonte.indexOf("export const iniciarExame"));
    expect(trecho).toContain('.eq("instrumento", "exame_final")');
    expect(trecho).toContain('.eq("estado_revisao", "em_uso")');
    expect(trecho).toContain('.eq("activa", true)');
  });

  it("uma questão retirada não pode ser activada pelo servidor", () => {
    expect(fonte).toContain("QUESTAO_RETIRADA");
  });

  it("a retirada de uma versão não apaga nada", () => {
    const trecho = fonte.slice(fonte.indexOf("export const retirarVersaoBanco"));
    expect(trecho).toContain('estado_revisao: "retirada"');
    expect(trecho).not.toContain(".delete(");
  });

  it("o sorteio bloqueia a prova em vez de a completar em silêncio", () => {
    expect(fonte).toContain("SORTEIO_BLOQUEADO");
  });

  it("o módulo de sorteio é puro: não lê a base nem toca em respostas", () => {
    const motor = readFileSync("src/lib/sorteio-exame.ts", "utf8");
    expect(motor).not.toContain("supabase");
    expect(motor).not.toContain("resposta:");
    expect(motor).not.toContain("explicacao");
    expect(motor).not.toContain("gabarito:");
  });
});
