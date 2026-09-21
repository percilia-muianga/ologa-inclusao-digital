/**
 * Verificação dos bancos renovados (versão 2) dos cursos «Computação em Nuvem»
 * e «Princípios da Transformação Digital».
 *
 * Simulação isolada e em memória: nunca toca na base de dados, não cria
 * formandos, turmas nem tentativas, e não activa nada.
 */
import { describe, expect, it } from "vitest";
import {
  EXAME_V2,
  PRE_POS_V2,
  type QuestaoNuvemV2,
} from "../../../scripts/conteudo/computacao-nuvem-questoes-v2";
import {
  EXAME_TD_V2,
  PRE_POS_TD_V2,
  type QuestaoTdV2,
} from "../../../scripts/conteudo/transformacao-digital-questoes-v2";
import { EXAME as EXAME_V1, PRE_POS as PRE_POS_V1 } from "../../../scripts/conteudo/computacao-nuvem-questoes";
import { QUOTAS_POR_CURSO, quotasDificuldade } from "../quotas-exame";
import {
  geradorComSemente,
  sortearExame,
  tipoPedagogico,
  type QuestaoSorteavel,
  type TipoPedagogico,
} from "../sorteio-exame";

type Q = (QuestaoNuvemV2 | QuestaoTdV2) & { seq?: string[]; cen?: boolean };

const TIPOLOGIA = {
  em: "escolha_multipla",
  vf: "verdadeiro_falso",
  cor: "correspondencia",
  ord: "ordenacao",
} as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;

/** Converte o ficheiro de conteúdo no formato que o motor de sorteio recebe. */
function sorteaveis(lista: Q[], moduloPorChave: Record<string, string>): QuestaoSorteavel[] {
  return lista.map((q, i) => ({
    id: `q${i}`,
    moduloId: moduloPorChave[q.m]!,
    tipologia: TIPOLOGIA[q.t as keyof typeof TIPOLOGIA],
    dificuldade: DIFICULDADE[q.d],
    cenario: Boolean(q.cen),
  }));
}

const MOD_NUVEM = { m1: "131", m2: "132", m3: "133", transversal: "200" };
const MOD_TD = { m1: "111", m2: "112", m3: "113", transversal: "200" };

const CURSOS = [
  {
    nome: "Computação em Nuvem",
    slug: "computacao-em-nuvem",
    exame: EXAME_V2 as Q[],
    prePos: PRE_POS_V2 as Q[],
    modulos: MOD_NUVEM as Record<string, string>,
  },
  {
    nome: "Princípios da Transformação Digital",
    slug: "principios-transformacao-digital",
    exame: EXAME_TD_V2 as Q[],
    prePos: PRE_POS_TD_V2 as Q[],
    modulos: MOD_TD as Record<string, string>,
  },
];

describe("bancos renovados — contagens e rácio", () => {
  for (const c of CURSOS) {
    it(`${c.nome}: 60 questões de exame e 10 de diagnóstico`, () => {
      expect(c.exame).toHaveLength(60);
      expect(c.prePos).toHaveLength(10);
    });

    it(`${c.nome}: banco de exame é pelo menos o triplo da prova`, () => {
      const quotas = QUOTAS_POR_CURSO[c.slug]!;
      expect(c.exame.length).toBeGreaterThanOrEqual(quotas.total * 3);
    });

    it(`${c.nome}: nenhum enunciado repetido, dentro e entre instrumentos`, () => {
      const todos = [...c.exame, ...c.prePos].map((q) => q.e.trim());
      expect(new Set(todos).size).toBe(todos.length);
    });

    it(`${c.nome}: gabaritos e metadados válidos em todas as questões`, () => {
      for (const q of [...c.exame, ...c.prePos]) {
        expect(q.e.length).toBeGreaterThan(30);
        expect(q.exp.length).toBeGreaterThan(40);
        expect(q.obj.length).toBeGreaterThan(10);
        if (q.t === "em") {
          expect(q.opts && q.opts.length).toBeGreaterThanOrEqual(3);
          expect(q.ind).toBeGreaterThanOrEqual(0);
          expect(q.ind!).toBeLessThan(q.opts!.length);
          // distractores com substância, não alternativas vazias
          for (const o of q.opts!) expect(o.trim().length).toBeGreaterThan(3);
          expect(new Set(q.opts!).size).toBe(q.opts!.length);
        }
        if (q.t === "vf") expect(typeof q.val).toBe("boolean");
        if (q.t === "cor") {
          expect(q.pares!.length).toBeGreaterThanOrEqual(4);
          for (const p of q.pares!) {
            expect(p.esquerda.trim().length).toBeGreaterThan(3);
            expect(p.direita.trim().length).toBeGreaterThan(2);
          }
        }
        if (q.t === "ord") {
          expect(q.seq!.length).toBeGreaterThanOrEqual(4);
          expect(new Set(q.seq!).size).toBe(q.seq!.length);
        }
        if (q.cen) expect(q.e.length).toBeGreaterThan(150);
      }
    });

    it(`${c.nome}: o banco de exame cobre as quotas exactas em vigor`, () => {
      const quotas = QUOTAS_POR_CURSO[c.slug]!;
      const porModulo: Record<string, number> = {};
      const porTipo: Record<string, number> = {};
      for (const q of sorteaveis(c.exame, c.modulos)) {
        porModulo[q.moduloId!] = (porModulo[q.moduloId!] ?? 0) + 1;
        const t = tipoPedagogico(q);
        porTipo[t] = (porTipo[t] ?? 0) + 1;
      }
      for (const [ordem, n] of Object.entries(quotas.modulosPorOrdem)) {
        expect(porModulo[ordem] ?? 0).toBeGreaterThanOrEqual(n * 3);
      }
      for (const [tipo, n] of Object.entries(quotas.tipos)) {
        expect(porTipo[tipo] ?? 0).toBeGreaterThanOrEqual(n! * 3);
      }
    });
  }

  it("Nuvem: as questões novas não repetem os enunciados da versão retirada", () => {
    const antigos = new Set([...EXAME_V1, ...PRE_POS_V1].map((q) => q.e.trim()));
    for (const q of [...EXAME_V2, ...PRE_POS_V2]) expect(antigos.has(q.e.trim())).toBe(false);
  });

  it("Transformação Digital: banco novo sem questões de cenário, coerente com as quotas", () => {
    for (const q of [...EXAME_TD_V2, ...PRE_POS_TD_V2]) {
      expect((q as Q).cen).toBeUndefined();
    }
    expect(QUOTAS_POR_CURSO["principios-transformacao-digital"]!.tipos.cenario).toBeUndefined();
  });
});

describe("bancos renovados — viabilidade do sorteio com cobertura", () => {
  for (const c of CURSOS) {
    it(`${c.nome}: 100 provas simuladas, todas viáveis e com cobertura completa`, () => {
      const quotas = QUOTAS_POR_CURSO[c.slug]!;
      const banco = sorteaveis(c.exame, c.modulos);
      const porId = new Map(banco.map((q) => [q.id, q]));
      const dif = quotasDificuldade(quotas.total, { facil: 40, media: 40, dificil: 20 });
      const modulos: Record<string, number> = {};
      for (const [ordem, n] of Object.entries(quotas.modulosPorOrdem)) modulos[ordem] = n;

      const assinaturas = new Set<string>();
      for (let s = 1; s <= 100; s++) {
        const r = sortearExame(
          banco,
          { total: quotas.total, dificuldade: dif, modulos, tipos: quotas.tipos },
          geradorComSemente(s),
        );
        expect(r.ok, `semente ${s}: ${r.ok ? "" : `${r.causa} ${r.detalhe}`}`).toBe(true);
        if (!r.ok) return;

        expect(r.ids).toHaveLength(quotas.total);
        expect(new Set(r.ids).size).toBe(quotas.total);

        const sel = r.ids.map((id) => porId.get(id)!);
        const cm: Record<string, number> = {};
        const ct: Partial<Record<TipoPedagogico, number>> = {};
        const cd: Record<string, number> = {};
        for (const q of sel) {
          cm[q.moduloId!] = (cm[q.moduloId!] ?? 0) + 1;
          const t = tipoPedagogico(q);
          ct[t] = (ct[t] ?? 0) + 1;
          cd[q.dificuldade] = (cd[q.dificuldade] ?? 0) + 1;
        }
        for (const [ordem, n] of Object.entries(modulos)) expect(cm[ordem] ?? 0).toBe(n);
        for (const [tipo, n] of Object.entries(quotas.tipos))
          expect(ct[tipo as TipoPedagogico] ?? 0).toBe(n);
        for (const [d, n] of Object.entries(dif)) expect(cd[d] ?? 0).toBe(n);

        assinaturas.add([...r.ids].sort().join(","));
      }
      // Aleatoriedade efectiva: sementes diferentes produzem provas diferentes.
      expect(assinaturas.size).toBeGreaterThan(80);
    });

    it(`${c.nome}: o diagnóstico é separado e não entra no sorteio do exame`, () => {
      const idsExame = new Set(sorteaveis(c.exame, c.modulos).map((q) => q.id));
      expect(idsExame.size).toBe(60);
      expect(c.prePos.every((q) => !c.exame.some((e) => e.e === q.e))).toBe(true);
    });
  }
});
