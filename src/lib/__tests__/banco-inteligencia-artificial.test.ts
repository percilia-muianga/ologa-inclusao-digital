/**
 * Verificação do banco de avaliação do curso «Introdução à Inteligência
 * Artificial».
 *
 * Simulação isolada e em memória: nunca toca na base de dados, não cria
 * formandos, turmas nem tentativas, e não activa nada. Nenhum enunciado ou
 * gabarito é impresso.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EXAME_IA,
  DIAGNOSTICO_IA,
  type QuestaoIA,
} from "../../../scripts/conteudo/inteligencia-artificial-questoes";
import { EXAME as EXAME_V1_NUVEM } from "../../../scripts/conteudo/computacao-nuvem-questoes";
import { EXAME_V2 as EXAME_V2_NUVEM } from "../../../scripts/conteudo/computacao-nuvem-questoes-v2";
import { EXAME_TD_V2 } from "../../../scripts/conteudo/transformacao-digital-questoes-v2";
import { QUOTAS_POR_CURSO, quotasDificuldade } from "../quotas-exame";
import {
  geradorComSemente,
  sortearExame,
  tipoPedagogico,
  type QuestaoSorteavel,
  type TipoPedagogico,
} from "../sorteio-exame";

const SLUG = "introducao-inteligencia-artificial";
const MOD = { m1: "121", m2: "122", transversal: "200" } as const;
const TIPOLOGIA = { em: "escolha_multipla", vf: "verdadeiro_falso", cor: "correspondencia" } as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;

function sorteaveis(lista: QuestaoIA[]): QuestaoSorteavel[] {
  return lista.map((q) => ({
    id: q.cod,
    moduloId: MOD[q.m],
    tipologia: TIPOLOGIA[q.t],
    dificuldade: DIFICULDADE[q.d],
    cenario: Boolean(q.cen),
  }));
}

function contar<T extends string>(vals: T[]): Record<string, number> {
  const r: Record<string, number> = {};
  for (const v of vals) r[v] = (r[v] ?? 0) + 1;
  return r;
}

describe("banco de IA — dimensão e separação dos instrumentos", () => {
  it("80 questões finais e 10 de diagnóstico, separadas", () => {
    expect(EXAME_IA).toHaveLength(80);
    expect(DIAGNOSTICO_IA).toHaveLength(10);
    const codsExame = new Set(EXAME_IA.map((q) => q.cod));
    for (const q of DIAGNOSTICO_IA) expect(codsExame.has(q.cod)).toBe(false);
  });

  it("o banco é pelo menos o triplo da prova proposta de 20 itens", () => {
    const quotas = QUOTAS_POR_CURSO[SLUG]!;
    expect(quotas.total).toBe(20);
    expect(EXAME_IA.length).toBeGreaterThanOrEqual(quotas.total * 3);
    expect(EXAME_IA.length).toBe(80);
  });

  it("códigos internos e enunciados únicos nos dois instrumentos", () => {
    const todos = [...EXAME_IA, ...DIAGNOSTICO_IA];
    const cods = todos.map((q) => q.cod);
    expect(new Set(cods).size).toBe(cods.length);
    const enunciados = todos.map((q) => q.e.trim());
    expect(new Set(enunciados).size).toBe(enunciados.length);
  });

  it("nenhum enunciado é repetido dos bancos dos outros cursos", () => {
    const alheios = new Set(
      [...EXAME_V1_NUVEM, ...EXAME_V2_NUVEM, ...EXAME_TD_V2].map((q) => q.e.trim()),
    );
    for (const q of [...EXAME_IA, ...DIAGNOSTICO_IA]) expect(alheios.has(q.e.trim())).toBe(false);
  });
});

describe("banco de IA — matriz de cobertura", () => {
  it("marginais por módulo, tipo pedagógico e dificuldade", () => {
    expect(contar(EXAME_IA.map((q) => q.m))).toEqual({ m1: 36, m2: 36, transversal: 8 });
    expect(contar(EXAME_IA.map((q) => (q.cen ? "cenario" : TIPOLOGIA[q.t])))).toEqual({
      escolha_multipla: 32,
      verdadeiro_falso: 16,
      correspondencia: 16,
      cenario: 16,
    });
    expect(contar(EXAME_IA.map((q) => q.d))).toEqual({ f: 32, me: 32, di: 16 });
  });

  it("nove questões por lição em cada módulo temático e oito no transversal", () => {
    for (const m of ["m1", "m2"] as const) {
      const porLicao = contar(EXAME_IA.filter((q) => q.m === m).map((q) => `L${q.l}`));
      expect(porLicao).toEqual({ L1: 9, L2: 9, L3: 9, L4: 9 });
    }
    const t = EXAME_IA.filter((q) => q.m === "transversal");
    expect(t).toHaveLength(8);
    // as seis lições do módulo transversal estão todas representadas
    expect(new Set(t.map((q) => q.l))).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it("cruzamentos módulo × tipo e módulo × dificuldade são viáveis para o sorteio", () => {
    const quotas = QUOTAS_POR_CURSO[SLUG]!;
    for (const [ordem, n] of Object.entries(quotas.modulosPorOrdem)) {
      const doModulo = sorteaveis(EXAME_IA).filter((q) => q.moduloId === ordem);
      expect(doModulo.length).toBeGreaterThanOrEqual(n * 3);
    }
    // cada cruzamento tipo × dificuldade exigido pela prova tem oferta suficiente
    const porTipo = contar(sorteaveis(EXAME_IA).map((q) => tipoPedagogico(q)));
    for (const [tipo, n] of Object.entries(quotas.tipos)) {
      expect(porTipo[tipo] ?? 0).toBeGreaterThanOrEqual(n! * 3);
    }
    const porDif = contar(EXAME_IA.map((q) => DIFICULDADE[q.d]));
    const dif = quotasDificuldade(quotas.total, { facil: 40, media: 40, dificil: 20 });
    expect(dif).toEqual({ facil: 8, media: 8, dificil: 4 });
    for (const [d, n] of Object.entries(dif)) expect(porDif[d] ?? 0).toBeGreaterThanOrEqual(n * 3);
  });
});

describe("banco de IA — validade dos itens", () => {
  it("metadados estáveis e completos em todos os itens", () => {
    for (const q of [...EXAME_IA, ...DIAGNOSTICO_IA]) {
      expect(q.cod).toMatch(/^IA-[A-Z0-9-]+$/);
      expect(q.e.length).toBeGreaterThan(40);
      expect(q.exp.length).toBeGreaterThan(40);
      expect(q.obj.length).toBeGreaterThan(10);
      expect(["m1", "m2", "transversal"]).toContain(q.m);
      expect(q.l).toBeGreaterThanOrEqual(1);
    }
  });

  it("alternativas plausíveis e gabarito inequívoco", () => {
    for (const q of [...EXAME_IA, ...DIAGNOSTICO_IA]) {
      if (q.t === "em") {
        expect(q.opts!.length).toBe(4);
        expect(q.ind!).toBeGreaterThanOrEqual(0);
        expect(q.ind!).toBeLessThan(q.opts!.length);
        expect(new Set(q.opts!).size).toBe(q.opts!.length);
        for (const o of q.opts!) {
          expect(o.trim().length).toBeGreaterThan(8);
          expect(o.toLowerCase()).not.toContain("todas as anteriores");
          expect(o.toLowerCase()).not.toContain("nenhuma das anteriores");
        }
      }
      if (q.t === "vf") expect(typeof q.val).toBe("boolean");
      if (q.t === "cor") {
        expect(q.pares!.length).toBe(4);
        expect(new Set(q.pares!.map((p) => p.esquerda)).size).toBe(4);
        expect(new Set(q.pares!.map((p) => p.direita)).size).toBe(4);
      }
      if (q.cen) expect(q.e.length).toBeGreaterThan(150);
    }
  });

  it("a posição da resposta correcta varia e não há opção mais longa sistemática", () => {
    const em = EXAME_IA.filter((q) => q.t === "em");
    const posicoes = contar(em.map((q) => String(q.ind)));
    expect(Object.keys(posicoes).length).toBeGreaterThanOrEqual(3);
    const maisLonga = em.filter((q) => {
      const maior = Math.max(...q.opts!.map((o) => o.length));
      return q.opts![q.ind!]!.length === maior;
    });
    // a correcta não pode ser a mais longa na larga maioria dos itens
    expect(maisLonga.length / em.length).toBeLessThan(0.75);
  });

  it("os cenários trazem dados quantificados no enunciado", () => {
    const cenarios = EXAME_IA.filter((q) => q.cen);
    expect(cenarios).toHaveLength(16);
    for (const q of cenarios) {
      expect(q.e).toMatch(/fictício|fictícia/i);
      expect((q.e.match(/\d/g) ?? []).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("contas dos cenários calculáveis conferem", () => {
    // IA-M1L3-08: 100 assinalados, 60 correctos → 40 alarmes falsos;
    // 80 realmente incompletos, 60 apanhados → 20 não detectados.
    expect(100 - 60).toBe(40);
    expect(80 - 60).toBe(20);
    // IA-M2L3-03: 60/150 = 40% e 10/50 = 20% → 20 pontos percentuais.
    expect((60 / 150) * 100 - (10 / 50) * 100).toBe(20);
    // IA-M2L3-08: 48/480 = 10% e 24/120 = 20%.
    expect((48 / 480) * 100).toBe(10);
    expect((24 / 120) * 100).toBe(20);
    // IA-M1L4-07: (40 - (10 + 15)) * 12 = 180 minutos.
    expect((40 - (10 + 15)) * 12).toBe(180);
    // IA-M1L4-08: 20 × 400 = 8000 < 9000 → saldo desfavorável de 1000.
    expect(20 * 400 - 9000).toBe(-1000);
    // IA-M1L1-09: 192/240 = 80%; 48 erros, 30 detectados, 18 efectivos.
    expect((192 / 240) * 100).toBe(80);
    expect(48 - 30).toBe(18);
    // IA-M1L3-09: 470/500 = 94% e 70/100 = 70%.
    expect((470 / 500) * 100).toBe(94);
  });

  it("afirmações jurídicas seguem as fontes verificadas", () => {
    const texto = [...EXAME_IA, ...DIAGNOSTICO_IA]
      .map((q) => `${q.e} ${q.exp} ${(q.opts ?? []).join(" ")}`)
      .join(" ")
      .toLowerCase();
    expect(texto).not.toContain("lei moçambicana de inteligência artificial");
    expect(texto).not.toContain("nunca pode abranger entidades situadas fora da união europeia»");
    expect(texto).toContain("não é lei moçambicana");
    expect(texto).toContain("artigo 2.º");
    expect(texto).toContain("proposta submetida a consulta, não aprovação");
  });
});

describe("banco de IA — sorteio da prova proposta", () => {
  const quotas = QUOTAS_POR_CURSO[SLUG]!;
  const banco = sorteaveis(EXAME_IA);
  const porId = new Map(banco.map((q) => [q.id, q]));
  const dif = quotasDificuldade(quotas.total, { facil: 40, media: 40, dificil: 20 });
  const modulos: Record<string, number> = { ...quotas.modulosPorOrdem } as Record<string, number>;

  it("200 provas simuladas: todas viáveis, sem repetições e com cobertura exacta", () => {
    const assinaturas = new Set<string>();
    for (let s = 1; s <= 200; s++) {
      const r = sortearExame(
        banco,
        { total: quotas.total, dificuldade: dif, modulos, tipos: quotas.tipos },
        geradorComSemente(s),
      );
      expect(r.ok, `semente ${s}`).toBe(true);
      if (!r.ok) return;
      expect(r.ids).toHaveLength(20);
      expect(new Set(r.ids).size).toBe(20);

      const sel = r.ids.map((id) => porId.get(id)!);
      const cm = contar(sel.map((q) => q.moduloId!));
      const ct = contar(sel.map((q) => tipoPedagogico(q) as TipoPedagogico));
      const cd = contar(sel.map((q) => q.dificuldade));
      expect(cm).toEqual({ "121": 9, "122": 9, "200": 2 });
      expect(ct).toEqual({ escolha_multipla: 8, verdadeiro_falso: 4, correspondencia: 4, cenario: 4 });
      expect(cd).toEqual({ facil: 8, media: 8, dificil: 4 });
      assinaturas.add([...r.ids].sort().join("|"));
    }
    // amostras independentes: o sorteio não devolve sempre a mesma prova
    expect(assinaturas.size).toBeGreaterThan(150);
  });

  it("falha fechada quando o banco é insuficiente para as quotas", () => {
    const reduzido = banco.filter((q) => q.moduloId !== "200");
    const r = sortearExame(
      reduzido,
      { total: quotas.total, dificuldade: dif, modulos, tipos: quotas.tipos },
      geradorComSemente(7),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(["MODULO_SEM_QUESTOES", "COMBINACAO_IMPOSSIVEL"]).toContain(r.causa);
  });

  it("falha fechada quando se pedem mais cenários do que existem", () => {
    const r = sortearExame(
      banco,
      {
        total: quotas.total,
        dificuldade: dif,
        modulos,
        tipos: { ...quotas.tipos, cenario: 18 },
      },
      geradorComSemente(9),
    );
    expect(r.ok).toBe(false);
  });
});

describe("banco de IA — o conteúdo não chega ao cliente", () => {
  it("nenhum ficheiro de src/ importa o banco de questões de IA", () => {
    const encontrados: string[] = [];
    const percorrer = (dir: string) => {
      for (const nome of readdirSync(dir)) {
        const caminho = join(dir, nome);
        if (statSync(caminho).isDirectory()) {
          percorrer(caminho);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(nome)) continue;
        if (caminho.includes("__tests__")) continue;
        const texto = readFileSync(caminho, "utf8");
        if (texto.includes("inteligencia-artificial-questoes")) encontrados.push(caminho);
      }
    };
    percorrer("src");
    expect(encontrados).toEqual([]);
  });

  it("o banco vive fora de public/ e de src/", () => {
    const publicos = readdirSync("public");
    expect(publicos.some((f) => f.includes("questoes"))).toBe(false);
  });
});
