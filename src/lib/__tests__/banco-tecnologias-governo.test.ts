/**
 * Verificação do banco PRIVADO de avaliação de «Tecnologias Digitais do
 * Governo». Simulação em memória: não toca na base de dados, não activa nada
 * e não imprime enunciados nem gabaritos.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EXAME_TDG,
  DIAGNOSTICO_TDG,
  PROPOSTA_PROVA_TDG,
  ORDEM_MODULO_TDG,
  planoLinhasTDG,
  type QuestaoTDG,
} from "../../../scripts/conteudo/tecnologias-governo-questoes";
import { EXAME_SC, DIAGNOSTICO_SC } from "../../../scripts/conteudo/seguranca-cibernetica-questoes";
import { EXAME_IA, DIAGNOSTICO_IA } from "../../../scripts/conteudo/inteligencia-artificial-questoes";
import { EXAME_V2 as EXAME_V2_NUVEM } from "../../../scripts/conteudo/computacao-nuvem-questoes-v2";
import { EXAME_TD_V2 } from "../../../scripts/conteudo/transformacao-digital-questoes-v2";
import { LICOES } from "../../../scripts/conteudo/tecnologias-governo-licoes";
import { LICOES_PLANO, TOPICOS_SEC_6_6 } from "../plano-tecnologias-governo";
import { quotasDificuldade } from "../quotas-exame";
import { geradorComSemente, sortearExame, tipoPedagogico, type QuestaoSorteavel } from "../sorteio-exame";

const TIPOLOGIA = { em: "escolha_multipla", vf: "verdadeiro_falso", cor: "correspondencia" } as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;
const contar = (vals: string[]) =>
  vals.reduce<Record<string, number>>((r, v) => ({ ...r, [v]: (r[v] ?? 0) + 1 }), {});
const tipoDe = (q: QuestaoTDG) => (q.cen ? "cenario" : TIPOLOGIA[q.t]);
const TODOS = [...EXAME_TDG, ...DIAGNOSTICO_TDG];

function sorteaveis(lista: QuestaoTDG[]): QuestaoSorteavel[] {
  return lista.map((q) => ({
    id: q.cod,
    moduloId: String(ORDEM_MODULO_TDG[q.m]),
    tipologia: TIPOLOGIA[q.t],
    dificuldade: DIFICULDADE[q.d],
    cenario: Boolean(q.cen),
  }));
}

const palavras = (t: string) =>
  new Set(
    t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/).filter((w) => w.length > 3),
  );
function jaccard(a: string, b: string) {
  const A = palavras(a);
  const B = palavras(b);
  const inter = [...A].filter((w) => B.has(w)).length;
  return inter / (A.size + B.size - inter || 1);
}

describe("banco TDG — dimensão e separação", () => {
  it("80 finais + 10 diagnóstico, códigos únicos e instrumentos separados", () => {
    expect(EXAME_TDG).toHaveLength(80);
    expect(DIAGNOSTICO_TDG).toHaveLength(10);
    expect(new Set(TODOS.map((q) => q.cod)).size).toBe(90);
    for (const q of EXAME_TDG) expect(q.cod).toMatch(/^TDG-(L[1-5]|TR-L[1-6])-\d{2}$/);
    for (const q of DIAGNOSTICO_TDG) expect(q.cod).toMatch(/^TDG-DIAG-\d{2}$/);
    // o código reflecte a lição declarada
    for (const q of EXAME_TDG) expect(q.cod.includes(`L${q.l}-`)).toBe(true);
  });

  it("sem enunciados repetidos, nem dentro do curso nem face aos outros bancos", () => {
    const proprios = TODOS.map((q) => q.e.trim());
    expect(new Set(proprios).size).toBe(proprios.length);
    const alheios = new Set(
      [...EXAME_SC, ...DIAGNOSTICO_SC, ...EXAME_IA, ...DIAGNOSTICO_IA, ...EXAME_V2_NUVEM, ...EXAME_TD_V2].map((q) => q.e.trim()),
    );
    for (const e of proprios) expect(alheios.has(e)).toBe(false);
  });

  it("sem quase-duplicados por sobreposição de palavras (limiar 0,5), no curso e face a SC e IA", () => {
    const pares: string[] = [];
    for (let i = 0; i < TODOS.length; i++)
      for (let j = i + 1; j < TODOS.length; j++)
        if (jaccard(TODOS[i]!.e, TODOS[j]!.e) >= 0.5) pares.push(`${TODOS[i]!.cod}~${TODOS[j]!.cod}`);
    for (const q of TODOS)
      for (const o of [...EXAME_SC, ...EXAME_IA]) if (jaccard(q.e, o.e) >= 0.5) pares.push(`${q.cod}~${o.cod}`);
    expect(pares).toEqual([]);
  });

  it("não recicla as perguntas formativas das lições", () => {
    const formativas = Object.values(LICOES).flatMap((c) => c.formativas.map((f) => f.pergunta));
    expect(formativas).toHaveLength(10);
    const reciclados: string[] = [];
    for (const q of TODOS)
      for (const f of formativas) if (q.e.trim() === f.trim() || jaccard(q.e, f) >= 0.4) reciclados.push(q.cod);
    expect(reciclados).toEqual([]);
  });
});

describe("banco TDG — matriz de cobertura", () => {
  it("marginais por módulo, lição, tipo e dificuldade", () => {
    expect(contar(EXAME_TDG.map((q) => q.m))).toEqual({ m1: 72, transversal: 8 });
    expect(contar(EXAME_TDG.filter((q) => q.m === "m1").map((q) => String(q.l)))).toEqual({
      "1": 14, "2": 15, "3": 15, "4": 14, "5": 14,
    });
    expect(contar(EXAME_TDG.map(tipoDe))).toEqual({
      escolha_multipla: 32, verdadeiro_falso: 16, correspondencia: 16, cenario: 16,
    });
    expect(contar(EXAME_TDG.map((q) => q.d))).toEqual({ f: 32, me: 32, di: 16 });
  });

  it("intersecção tipo × dificuldade: nenhum tipo concentra um só nível", () => {
    const x = contar(EXAME_TDG.map((q) => `${tipoDe(q)}/${q.d}`));
    expect(x).toEqual({
      "escolha_multipla/f": 13, "escolha_multipla/me": 12, "escolha_multipla/di": 7,
      "verdadeiro_falso/f": 6, "verdadeiro_falso/me": 7, "verdadeiro_falso/di": 3,
      "correspondencia/f": 7, "correspondencia/me": 9,
      "cenario/f": 4, "cenario/me": 4, "cenario/di": 8,
    });
  });

  it("as 5 lições, os 9 tópicos dos TdR, todos os objectivos e as 6 lições do transversal estão cobertos", () => {
    expect(new Set(EXAME_TDG.filter((q) => q.m === "m1").map((q) => q.l))).toEqual(new Set(LICOES_PLANO.map((l) => l.ordem)));
    const topicos = contar(EXAME_TDG.filter((q) => q.m === "m1").map((q) => q.topico));
    for (const t of TOPICOS_SEC_6_6) expect(topicos[t] ?? 0, t).toBeGreaterThanOrEqual(4);
    expect(Object.keys(topicos).every((t) => (TOPICOS_SEC_6_6 as readonly string[]).includes(t))).toBe(true);
    for (const l of LICOES_PLANO) {
      const objs = LICOES[l.chave]!.objectivos;
      const usados = new Set(EXAME_TDG.filter((q) => q.m === "m1" && q.l === l.ordem).map((q) => q.obj));
      for (const o of objs) expect(usados.has(o), `${l.chave}: ${o.slice(0, 40)}`).toBe(true);
      for (const o of usados) expect(objs.includes(o)).toBe(true);
    }
    expect(new Set(EXAME_TDG.filter((q) => q.m === "transversal").map((q) => q.l))).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it("cada estrato da prova proposta tem pelo menos o triplo no banco", () => {
    const b = sorteaveis(EXAME_TDG);
    const porMod = contar(b.map((q) => q.moduloId!));
    for (const [o, n] of Object.entries(PROPOSTA_PROVA_TDG.modulosPorOrdem)) expect(porMod[o] ?? 0).toBeGreaterThanOrEqual(n * 3);
    const porTipo = contar(b.map((q) => tipoPedagogico(q)));
    for (const [t, n] of Object.entries(PROPOSTA_PROVA_TDG.tipos)) expect(porTipo[t] ?? 0).toBeGreaterThanOrEqual(n * 3);
    const dif = quotasDificuldade(20, PROPOSTA_PROVA_TDG.pct);
    expect(dif).toEqual({ facil: 8, media: 8, dificil: 4 });
    const porDif = contar(b.map((q) => q.dificuldade));
    for (const [d, n] of Object.entries(dif)) expect(porDif[d] ?? 0).toBeGreaterThanOrEqual(n * 3);
  });
});

describe("banco TDG — validade dos itens", () => {
  it("metadados completos e fontes rastreáveis às lições", () => {
    const fontesLicoes = new Set(Object.values(LICOES).flatMap((c) => c.fontes.flatMap((f) => [f.titulo, f.url ?? ""])));
    for (const q of TODOS) {
      expect(q.e.length).toBeGreaterThan(40);
      expect(q.exp.length).toBeGreaterThan(30);
      if (q.m === "m1") expect(fontesLicoes.has(q.fonte), `${q.cod} ${q.fonte}`).toBe(true);
      else expect(q.fonte).toMatch(/^Lei n\.º 10\/2024/);
    }
  });

  it("gabaritos inequívocos e alternativas sem fórmulas de recurso", () => {
    for (const q of TODOS) {
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

  it("sem pista de comprimento, de posição nem de valor V/F", () => {
    const em = EXAME_TDG.filter((q) => q.t === "em");
    const pos = contar(em.map((q) => String(q.ind)));
    expect(Object.keys(pos).length).toBe(4);
    for (const n of Object.values(pos)) expect(n / em.length).toBeLessThan(0.4);
    const maisLonga = em.filter((q) => q.opts!.every((o, i) => i === q.ind || o.length < q.opts![q.ind!]!.length));
    expect(maisLonga.length / em.length).toBeLessThan(0.4);
    for (const q of em) {
      const c = q.opts!.map((o) => o.length);
      expect(Math.min(...c) / Math.max(...c), q.cod).toBeGreaterThanOrEqual(0.45);
    }
    const vf = EXAME_TDG.filter((q) => q.t === "vf");
    const verdadeiros = vf.filter((q) => q.val).length;
    expect(verdadeiros).toBeGreaterThanOrEqual(2);
  });

  it("cenários fictícios, auto-suficientes, e contas conferidas", () => {
    const cen = EXAME_TDG.filter((q) => q.cen);
    expect(cen).toHaveLength(16);
    for (const q of cen) {
      expect(q.e).toMatch(/fictíci[oa]/i);
      expect(q.e.length).toBeGreaterThan(150);
    }
    expect(cen.filter((q) => (q.e.match(/\d/g) ?? []).length >= 2).length).toBeGreaterThanOrEqual(8);
    // TDG-L2-14: A (2) + B (1) executáveis; C, D, E não
    expect(2 + 1).toBe(3);
    // TDG-L3-14: ordem de chegada 08h10, 09h30, 11h00 → requerimento é o 2.º (0511)
    expect(510 + 1).toBe(511);
  });

  it("afirmações prudentes: sem leis inventadas, sem efeitos jurídicos da assinatura, INTIC não é lei", () => {
    const texto = TODOS.map(
      (q) => `${q.e} ${q.exp} ${(q.opts ?? []).join(" ")} ${(q.pares ?? []).map((p) => `${p.esquerda} ${p.direita}`).join(" ")}`,
    ).join(" ").toLowerCase();
    const leis = texto.match(/lei n\.º [0-9/]+/g) ?? [];
    expect(new Set(leis)).toEqual(new Set(["lei n.º 10/2024"]));
    // nas explicações (a voz do gabarito) não se atribui valor jurídico à assinatura
    for (const q of TODOS) expect(q.exp.toLowerCase(), q.cod).not.toMatch(/tem (pleno )?valor jurídico|equivale à assinatura manuscrita/);
    for (const q of TODOS) if (/intic/i.test(q.exp)) expect(q.exp).toMatch(/não/);
  });
});

describe("banco TDG — simulação do sorteio (modo de ensaio)", () => {
  const dif = quotasDificuldade(20, PROPOSTA_PROVA_TDG.pct);
  const modulos = Object.fromEntries(Object.entries(PROPOSTA_PROVA_TDG.modulosPorOrdem)) as Record<string, number>;
  const quotas = { total: 20, dificuldade: dif, modulos, tipos: { ...PROPOSTA_PROVA_TDG.tipos } };

  it("o filtro de produção não encontra nenhuma questão deste plano (todas inactivas)", () => {
    const elegiveis = planoLinhasTDG().filter(
      (l) => l.instrumento === "exame_final" && l.estado_revisao === ("em_uso" as string) && l.activa === (true as boolean),
    );
    expect(elegiveis).toHaveLength(0);
  });

  it("200 provas em ensaio: todas viáveis, sem repetição, cobertura exacta, sem diagnóstico", () => {
    // ENSAIO: cópia em memória marcada como se estivesse activa; o plano real continua inactivo.
    const ensaio = planoLinhasTDG().map((l) => ({ ...l, activa: true, estado_revisao: "em_uso" }));
    const elegiveis = ensaio.filter((l) => l.instrumento === "exame_final" && l.activa && l.estado_revisao === "em_uso");
    expect(elegiveis).toHaveLength(80);
    const banco: QuestaoSorteavel[] = elegiveis.map((l) => ({
      id: l.cod, moduloId: String(l.ordemModulo), tipologia: l.tipologia, dificuldade: l.dificuldade, cenario: l.cenario,
    }));
    const porId = new Map(banco.map((q) => [q.id, q]));
    const diag = new Set(DIAGNOSTICO_TDG.map((q) => q.cod));
    const licao = new Map(EXAME_TDG.map((q) => [q.cod, `${q.m}-${q.l}`]));
    const assinaturas = new Set<string>();
    const usos = new Map<string, number>();
    let semLicao = 0;
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
      expect(contar(sel.map((q) => q.moduloId!))).toEqual({ "161": 18, "200": 2 });
      expect(contar(sel.map((q) => tipoPedagogico(q)))).toEqual({
        escolha_multipla: 8, verdadeiro_falso: 4, correspondencia: 4, cenario: 4,
      });
      expect(contar(sel.map((q) => q.dificuldade))).toEqual({ facil: 8, media: 8, dificil: 4 });
      const licoes = new Set(r.ids.map((id) => licao.get(id)));
      if ([1, 2, 3, 4, 5].some((l) => !licoes.has(`m1-${l}`))) semLicao++;
      assinaturas.add([...r.ids].sort().join("|"));
    }
    expect(assinaturas.size).toBeGreaterThan(190);
    expect(usos.size).toBe(80);
    // O motor não tem quota por lição; regista-se quantas provas deixam alguma lição de fora.
    expect(semLicao).toBeLessThanOrEqual(10);
  });

  it("falha fechada quando um estrato fica insuficiente", () => {
    const b = sorteaveis(EXAME_TDG).filter((q) => q.moduloId !== "200" || q.id === "TDG-TR-L1-01");
    expect(sortearExame(b, quotas, geradorComSemente(3)).ok).toBe(false);
  });
});

describe("banco TDG — plano de linhas e esquema real", () => {
  it("todas as linhas inactivas, em rascunho, com gabarito e colunas existentes na tabela", () => {
    const tipos = readFileSync("src/integrations/supabase/types.ts", "utf8");
    const bloco = tipos.slice(tipos.indexOf("banco_questoes: {"));
    const insert = bloco.slice(bloco.indexOf("Insert: {"), bloco.indexOf("Update: {"));
    const plano = planoLinhasTDG();
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

describe("banco TDG — o conteúdo não chega ao cliente", () => {
  it("nenhum ficheiro de src/ fora dos testes importa o banco", () => {
    const achados: string[] = [];
    const ver = (dir: string) => {
      for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) { ver(p); continue; }
        if (!/\.(ts|tsx)$/.test(n) || p.includes("__tests__")) continue;
        if (readFileSync(p, "utf8").includes("tecnologias-governo-questoes")) achados.push(p);
      }
    };
    ver("src");
    expect(achados).toEqual([]);
    expect(readdirSync("public").some((f) => f.includes("questoes"))).toBe(false);
  });
});
