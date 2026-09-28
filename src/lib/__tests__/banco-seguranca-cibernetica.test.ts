/**
 * Verificação do banco PRIVADO de avaliação de «Segurança Cibernética
 * Avançada». Simulação em memória: não toca na base de dados, não activa nada
 * e não imprime enunciados nem gabaritos.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EXAME_SC,
  DIAGNOSTICO_SC,
  PROPOSTA_PROVA_SC,
  ORDEM_MODULO_SC,
  planoLinhasSC,
  type QuestaoSC,
} from "../../../scripts/conteudo/seguranca-cibernetica-questoes";
import { EXAME_IA, DIAGNOSTICO_IA } from "../../../scripts/conteudo/inteligencia-artificial-questoes";
import { EXAME_V2 as EXAME_V2_NUVEM } from "../../../scripts/conteudo/computacao-nuvem-questoes-v2";
import { EXAME_TD_V2 } from "../../../scripts/conteudo/transformacao-digital-questoes-v2";
import { LICOES } from "../../../scripts/conteudo/seguranca-cibernetica-licoes";
import { MODULOS_PLANO } from "../plano-seguranca-cibernetica";
import { quotasDificuldade } from "../quotas-exame";
import { geradorComSemente, sortearExame, tipoPedagogico, type QuestaoSorteavel } from "../sorteio-exame";

const TIPOLOGIA = { em: "escolha_multipla", vf: "verdadeiro_falso", cor: "correspondencia" } as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;
const contar = (vals: string[]) =>
  vals.reduce<Record<string, number>>((r, v) => ({ ...r, [v]: (r[v] ?? 0) + 1 }), {});
const tipoDe = (q: QuestaoSC) => (q.cen ? "cenario" : TIPOLOGIA[q.t]);

function sorteaveis(lista: QuestaoSC[]): QuestaoSorteavel[] {
  return lista.map((q) => ({
    id: q.cod,
    moduloId: String(ORDEM_MODULO_SC[q.m]),
    tipologia: TIPOLOGIA[q.t],
    dificuldade: DIFICULDADE[q.d],
    cenario: Boolean(q.cen),
  }));
}

const palavras = (t: string) =>
  new Set(
    t
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
function jaccard(a: string, b: string) {
  const A = palavras(a);
  const B = palavras(b);
  const inter = [...A].filter((w) => B.has(w)).length;
  return inter / (A.size + B.size - inter || 1);
}

describe("banco SC — dimensão e separação", () => {
  it("80 finais + 10 diagnóstico, códigos únicos e instrumentos separados", () => {
    expect(EXAME_SC).toHaveLength(80);
    expect(DIAGNOSTICO_SC).toHaveLength(10);
    const cods = [...EXAME_SC, ...DIAGNOSTICO_SC].map((q) => q.cod);
    expect(new Set(cods).size).toBe(90);
    for (const q of EXAME_SC) expect(q.cod).toMatch(/^SC-(M[123]L[1-5]|TR-L[1-6])-\d{2}$/);
    for (const q of DIAGNOSTICO_SC) expect(q.cod).toMatch(/^SC-DIAG-\d{2}$/);
  });

  it("sem enunciados repetidos, nem dentro do curso nem face aos outros bancos", () => {
    const proprios = [...EXAME_SC, ...DIAGNOSTICO_SC].map((q) => q.e.trim());
    expect(new Set(proprios).size).toBe(proprios.length);
    const alheios = new Set(
      [...EXAME_IA, ...DIAGNOSTICO_IA, ...EXAME_V2_NUVEM, ...EXAME_TD_V2].map((q) => q.e.trim()),
    );
    for (const e of proprios) expect(alheios.has(e)).toBe(false);
  });

  it("sem quase-duplicados semânticos por sobreposição de palavras (limiar 0,5)", () => {
    const todos = [...EXAME_SC, ...DIAGNOSTICO_SC];
    const pares: string[] = [];
    for (let i = 0; i < todos.length; i++)
      for (let j = i + 1; j < todos.length; j++)
        if (jaccard(todos[i]!.e, todos[j]!.e) >= 0.5) pares.push(`${todos[i]!.cod}~${todos[j]!.cod}`);
    expect(pares).toEqual([]);
  });

  it("não recicla as perguntas formativas das lições", () => {
    const formativas = Object.values(LICOES).flatMap((c) => c.verificacao.map((v) => v.pergunta));
    expect(formativas).toHaveLength(30);
    const reciclados: string[] = [];
    for (const q of [...EXAME_SC, ...DIAGNOSTICO_SC])
      for (const f of formativas) if (q.e.trim() === f.trim() || jaccard(q.e, f) >= 0.5) reciclados.push(q.cod);
    expect(reciclados).toEqual([]);
  });
});

describe("banco SC — matriz de cobertura", () => {
  it("marginais por módulo, tipo e dificuldade", () => {
    expect(contar(EXAME_SC.map((q) => q.m))).toEqual({ m1: 24, m2: 25, m3: 23, transversal: 8 });
    expect(contar(EXAME_SC.map(tipoDe))).toEqual({
      escolha_multipla: 32, verdadeiro_falso: 16, correspondencia: 16, cenario: 16,
    });
    expect(contar(EXAME_SC.map((q) => q.d))).toEqual({ f: 32, me: 32, di: 16 });
  });

  it("todas as 15 lições e as 6 do transversal estão representadas", () => {
    for (const m of MODULOS_PLANO.filter((x) => !x.transversal)) {
      const ls = new Set(EXAME_SC.filter((q) => q.m === m.chave).map((q) => q.l));
      expect(ls).toEqual(new Set(m.licoes.map((l) => l.ordem)));
    }
    expect(new Set(EXAME_SC.filter((q) => q.m === "transversal").map((q) => q.l))).toEqual(
      new Set([1, 2, 3, 4, 5, 6]),
    );
  });

  it("cada estrato da prova proposta tem pelo menos o triplo no banco", () => {
    const b = sorteaveis(EXAME_SC);
    const porMod = contar(b.map((q) => q.moduloId!));
    for (const [o, n] of Object.entries(PROPOSTA_PROVA_SC.modulosPorOrdem))
      expect(porMod[o] ?? 0).toBeGreaterThanOrEqual(n * 3);
    const porTipo = contar(b.map((q) => tipoPedagogico(q)));
    for (const [t, n] of Object.entries(PROPOSTA_PROVA_SC.tipos)) expect(porTipo[t] ?? 0).toBeGreaterThanOrEqual(n * 3);
    const dif = quotasDificuldade(20, PROPOSTA_PROVA_SC.pct);
    expect(dif).toEqual({ facil: 8, media: 8, dificil: 4 });
    const porDif = contar(b.map((q) => q.dificuldade));
    for (const [d, n] of Object.entries(dif)) expect(porDif[d] ?? 0).toBeGreaterThanOrEqual(n * 3);
  });

  it("cada módulo temático tem todas as dificuldades e todos os tipos", () => {
    for (const m of ["m1", "m2", "m3"] as const) {
      const doM = EXAME_SC.filter((q) => q.m === m);
      expect(new Set(doM.map((q) => q.d)).size).toBe(3);
      expect(new Set(doM.map(tipoDe)).size).toBe(4);
    }
  });
});

describe("banco SC — validade dos itens", () => {
  it("metadados completos", () => {
    for (const q of [...EXAME_SC, ...DIAGNOSTICO_SC]) {
      expect(q.e.length).toBeGreaterThan(40);
      expect(q.exp.length).toBeGreaterThan(30);
      expect(q.obj.length).toBeGreaterThan(10);
    }
  });

  it("gabaritos inequívocos e alternativas sem fórmulas de recurso", () => {
    for (const q of [...EXAME_SC, ...DIAGNOSTICO_SC]) {
      if (q.t === "em") {
        expect(q.opts).toHaveLength(4);
        expect(new Set(q.opts).size).toBe(4);
        expect(q.ind!).toBeGreaterThanOrEqual(0);
        expect(q.ind!).toBeLessThan(4);
        for (const o of q.opts!) expect(o.toLowerCase()).not.toMatch(/todas as anteriores|nenhuma das anteriores/);
      }
      if (q.t === "vf") expect(typeof q.val).toBe("boolean");
      if (q.t === "cor") {
        expect(q.pares).toHaveLength(4);
        expect(new Set(q.pares!.map((p) => p.esquerda)).size).toBe(4);
        expect(new Set(q.pares!.map((p) => p.direita)).size).toBe(4);
      }
    }
  });

  it("sem pista de comprimento nem de posição", () => {
    const em = EXAME_SC.filter((q) => q.t === "em");
    const pos = contar(em.map((q) => String(q.ind)));
    expect(Object.keys(pos).length).toBe(4);
    for (const n of Object.values(pos)) expect(n / em.length).toBeLessThan(0.45);
    const maisLonga = em.filter((q) => q.opts!.every((o, i) => i === q.ind || o.length < q.opts![q.ind!]!.length));
    expect(maisLonga.length / em.length).toBeLessThan(0.5);
    // alternativas de comprimento semelhante: a mais curta tem pelo menos 40 % da mais longa
    for (const q of em) {
      const c = q.opts!.map((o) => o.length);
      expect(Math.min(...c) / Math.max(...c), q.cod).toBeGreaterThanOrEqual(0.4);
    }
  });

  it("cenários fictícios, auto-suficientes, e contas conferidas", () => {
    const cen = EXAME_SC.filter((q) => q.cen);
    expect(cen).toHaveLength(16);
    for (const q of cen) {
      expect(q.e).toMatch(/fictício/i);
      expect(q.e.length).toBeGreaterThan(150);
    }
    expect(cen.filter((q) => ((q.e.match(/\d/g) ?? []).length) >= 2).length).toBeGreaterThanOrEqual(8);
    // SC-M1L1-05: B=16, A=15, C=5
    expect([4 * 4, 3 * 5, 1 * 5]).toEqual([16, 15, 5]);
    // SC-M1L4-05: 6 + (9 - 2) + 2 = 15
    expect(6 + (9 - 2) + 2).toBe(15);
    // SC-M2L3-05: 180 alertas contra ~10 × 5 dias úteis
    expect(10 * 5).toBeLessThan(180);
    // SC-M3L3-05: 41 200 / 1 500 ≈ 27
    expect(Math.round(41200 / 1500)).toBe(27);
    // SC-M3L5-05: 6/8 = 75 %
    expect((6 / 8) * 100).toBe(75);
  });

  it("afirmações jurídicas prudentes", () => {
    const texto = [...EXAME_SC, ...DIAGNOSTICO_SC]
      .map((q) => `${q.e} ${q.exp} ${(q.opts ?? []).join(" ")} ${(q.pares ?? []).map((p) => p.esquerda + " " + p.direita).join(" ")}`)
      .join(" ")
      .toLowerCase();
    expect(texto).not.toMatch(/lei (moçambicana )?de segurança cibernética/);
    expect(texto).not.toMatch(/iso\/iec 27001/);
    const leis = texto.match(/lei n\.º [0-9/]+/g) ?? [];
    expect(new Set(leis)).toEqual(new Set(["lei n.º 10/2024"]));
  });

  it("fontes técnicas são as oficiais já usadas nas lições", () => {
    const permitidas = new Set(
      Object.values(LICOES).flatMap((c) => (c.referencias ?? []).map((r) => r.url)),
    );
    for (const q of EXAME_SC) if (q.fonte) expect(permitidas.has(q.fonte)).toBe(true);
  });
});

describe("banco SC — simulação do sorteio (modo de ensaio)", () => {
  const dif = quotasDificuldade(20, PROPOSTA_PROVA_SC.pct);
  const modulos = Object.fromEntries(
    Object.entries(PROPOSTA_PROVA_SC.modulosPorOrdem).map(([k, v]) => [k, v]),
  ) as Record<string, number>;
  const quotas = { total: 20, dificuldade: dif, modulos, tipos: { ...PROPOSTA_PROVA_SC.tipos } };

  it("o filtro de produção não encontra nenhuma questão deste plano (todas inactivas)", () => {
    const plano = planoLinhasSC();
    const elegiveis = plano.filter(
      (l) => l.instrumento === "exame_final" && l.estado_revisao === ("em_uso" as string) && l.activa === (true as boolean),
    );
    expect(elegiveis).toHaveLength(0);
    expect(elegiveis.length < 20 * 3).toBe(true); // produção recusaria com BANCO_INSUFICIENTE
  });

  it("200 provas em ensaio: todas viáveis, sem repetição, cobertura exacta, sem diagnóstico", () => {
    const plano = planoLinhasSC();
    // ENSAIO: cópia em memória marcada como se estivesse activa; o plano real continua inactivo.
    const ensaio = plano.map((l) => ({ ...l, activa: true, estado_revisao: "em_uso" }));
    const elegiveis = ensaio.filter((l) => l.instrumento === "exame_final" && l.activa && l.estado_revisao === "em_uso");
    expect(elegiveis).toHaveLength(80);
    const banco: QuestaoSorteavel[] = elegiveis.map((l) => ({
      id: l.cod, moduloId: String(l.ordemModulo), tipologia: l.tipologia, dificuldade: l.dificuldade, cenario: l.cenario,
    }));
    const porId = new Map(banco.map((q) => [q.id, q]));
    const diag = new Set(DIAGNOSTICO_SC.map((q) => q.cod));
    const assinaturas = new Set<string>();
    const usos = new Map<string, number>();
    for (let s = 1; s <= 200; s++) {
      const r = sortearExame(banco, quotas, geradorComSemente(s));
      expect(r.ok, `semente ${s}`).toBe(true);
      if (!r.ok) return;
      expect(r.ids).toHaveLength(20);
      expect(new Set(r.ids).size).toBe(20);
      for (const id of r.ids) {
        expect(diag.has(id)).toBe(false);
        usos.set(id, (usos.get(id) ?? 0) + 1);
      }
      const sel = r.ids.map((id) => porId.get(id)!);
      expect(contar(sel.map((q) => q.moduloId!))).toEqual({ "141": 6, "142": 6, "143": 6, "200": 2 });
      expect(contar(sel.map((q) => tipoPedagogico(q)))).toEqual({
        escolha_multipla: 8, verdadeiro_falso: 4, correspondencia: 4, cenario: 4,
      });
      expect(contar(sel.map((q) => q.dificuldade))).toEqual({ facil: 8, media: 8, dificil: 4 });
      assinaturas.add([...r.ids].sort().join("|"));
    }
    expect(assinaturas.size).toBeGreaterThan(190);
    // todas as 80 questões chegam a ser sorteadas em 200 provas
    expect(usos.size).toBe(80);
  });

  it("falha fechada quando um estrato fica insuficiente", () => {
    const b = sorteaveis(EXAME_SC).filter((q) => q.moduloId !== "200" || q.id === "SC-TR-L1-01");
    const r = sortearExame(b, quotas, geradorComSemente(3));
    expect(r.ok).toBe(false);
  });
});

describe("banco SC — plano de linhas e esquema real", () => {
  it("todas as linhas inactivas, em rascunho, com gabarito e colunas existentes na tabela", () => {
    const tipos = readFileSync("src/integrations/supabase/types.ts", "utf8");
    const bloco = tipos.slice(tipos.indexOf("banco_questoes: {"));
    const insert = bloco.slice(bloco.indexOf("Insert: {"), bloco.indexOf("Update: {"));
    const plano = planoLinhasSC();
    expect(plano).toHaveLength(90);
    expect(plano.filter((l) => l.instrumento === "pre_pos_teste")).toHaveLength(10);
    for (const l of plano) {
      expect(l.activa).toBe(false);
      expect(l.estado_revisao).toBe("rascunho");
      expect(Object.keys(l.resposta).length).toBeGreaterThan(0);
    }
    for (const col of Object.keys(plano[0]!).filter((k) => k !== "cod" && k !== "ordemModulo"))
      expect(insert, `coluna ${col}`).toMatch(new RegExp(`\\b${col}\\??:`));
  });
});

describe("banco SC — o conteúdo não chega ao cliente", () => {
  it("nenhum ficheiro de src/ fora dos testes importa o banco", () => {
    const achados: string[] = [];
    const ver = (dir: string) => {
      for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) { ver(p); continue; }
        // Única excepção: o módulo exclusivo do servidor (sufixo .server) que monta o pacote.
        if (!/\.(ts|tsx)$/.test(n) || p.includes("__tests__") || p.endsWith("conteudos-preparados.server.ts")) continue;
        if (readFileSync(p, "utf8").includes("seguranca-cibernetica-questoes")) achados.push(p);
      }
    };
    ver("src");
    expect(achados).toEqual([]);
    expect(readdirSync("public").some((f) => f.includes("questoes"))).toBe(false);
  });
});
