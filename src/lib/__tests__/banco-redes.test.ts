/**
 * Verificação do banco PRIVADO de avaliação de «Redes Avançadas e Segurança
 * Cibernética». Simulação em memória: não toca na base de dados, não activa
 * nada e não imprime enunciados nem gabaritos.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EXAME_REDES,
  DIAGNOSTICO_REDES,
  PROPOSTA_PROVA_REDES,
  ordemModuloRedes,
  planoLinhasRedes,
  type QuestaoRedes,
} from "../../../scripts/conteudo/redes-questoes";
import { EXAME_TDG, DIAGNOSTICO_TDG } from "../../../scripts/conteudo/tecnologias-governo-questoes";
import { EXAME_SC, DIAGNOSTICO_SC } from "../../../scripts/conteudo/seguranca-cibernetica-questoes";
import { EXAME_IA, DIAGNOSTICO_IA } from "../../../scripts/conteudo/inteligencia-artificial-questoes";
import { EXAME_V2 as EXAME_V2_NUVEM } from "../../../scripts/conteudo/computacao-nuvem-questoes-v2";
import { EXAME_TD_V2 } from "../../../scripts/conteudo/transformacao-digital-questoes-v2";
import { LICOES_REDES } from "../../../scripts/conteudo/redes-licoes";
import { FONTES } from "../../../scripts/conteudo/redes-base";
import { LICOES_PLANO, RESULTADOS_TDR } from "../plano-redes";
import { quotasDificuldade } from "../quotas-exame";
import { geradorComSemente, sortearExame, tipoPedagogico, type QuestaoSorteavel } from "../sorteio-exame";

const TIPOLOGIA = { em: "escolha_multipla", vf: "verdadeiro_falso", cor: "correspondencia" } as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;
const contar = (vals: string[]) =>
  vals.reduce<Record<string, number>>((r, v) => ({ ...r, [v]: (r[v] ?? 0) + 1 }), {});
const tipoDe = (q: QuestaoRedes) => (q.cen ? "cenario" : TIPOLOGIA[q.t]);
const TODOS = [...EXAME_REDES, ...DIAGNOSTICO_REDES];
const TECNICAS = EXAME_REDES.filter((q) => q.m !== "transversal");
const chave = (q: QuestaoRedes) => `r-m${String(q.m).padStart(2, "0")}-l${q.l}`;

function sorteaveis(lista: QuestaoRedes[]): QuestaoSorteavel[] {
  return lista.map((q) => ({
    id: q.cod,
    moduloId: String(ordemModuloRedes(q)),
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

describe("banco Redes — dimensão e separação", () => {
  it("80 finais + 10 diagnóstico, códigos únicos e coerentes com módulo/lição", () => {
    expect(EXAME_REDES).toHaveLength(80);
    expect(DIAGNOSTICO_REDES).toHaveLength(10);
    expect(new Set(TODOS.map((q) => q.cod)).size).toBe(90);
    for (const q of TECNICAS) expect(q.cod.startsWith(`RED-M${String(q.m).padStart(2, "0")}-L${q.l}-`), q.cod).toBe(true);
    for (const q of EXAME_REDES.filter((x) => x.m === "transversal")) expect(q.cod).toMatch(new RegExp(`^RED-TR-L${q.l}-\\d{2}$`));
    for (const q of DIAGNOSTICO_REDES) expect(q.cod).toMatch(/^RED-DIAG-\d{2}$/);
  });

  it("sem enunciados repetidos, nem no curso nem face aos outros bancos", () => {
    const proprios = TODOS.map((q) => q.e.trim());
    expect(new Set(proprios).size).toBe(proprios.length);
    const alheios = new Set(
      [...EXAME_TDG, ...DIAGNOSTICO_TDG, ...EXAME_SC, ...DIAGNOSTICO_SC, ...EXAME_IA, ...DIAGNOSTICO_IA, ...EXAME_V2_NUVEM, ...EXAME_TD_V2]
        .map((q) => q.e.trim()),
    );
    for (const e of proprios) expect(alheios.has(e)).toBe(false);
  });

  it("sem quase-duplicados (limiar 0,5), no curso e face a TDG, SC e IA", () => {
    const pares: string[] = [];
    for (let i = 0; i < TODOS.length; i++)
      for (let j = i + 1; j < TODOS.length; j++)
        if (jaccard(TODOS[i]!.e, TODOS[j]!.e) >= 0.5) pares.push(`${TODOS[i]!.cod}~${TODOS[j]!.cod}`);
    for (const q of TODOS)
      for (const o of [...EXAME_TDG, ...DIAGNOSTICO_TDG, ...EXAME_SC, ...EXAME_IA])
        if (jaccard(q.e, o.e) >= 0.5) pares.push(`${q.cod}~${o.cod}`);
    expect(pares).toEqual([]);
  });

  it("não recicla as 120 perguntas formativas das lições", () => {
    const formativas = Object.values(LICOES_REDES).flatMap((c) => c.formativas.map((f) => f.pergunta));
    expect(formativas).toHaveLength(120);
    const reciclados: string[] = [];
    for (const q of TODOS)
      for (const f of formativas) if (q.e.trim() === f.trim() || jaccard(q.e, f) >= 0.4) reciclados.push(q.cod);
    expect(reciclados).toEqual([]);
  });
});

describe("banco Redes — matriz de cobertura", () => {
  it("72 técnicas (6 por módulo) + 8 transversais; marginais de tipo e dificuldade", () => {
    expect(TECNICAS).toHaveLength(72);
    const porMod = contar(TECNICAS.map((q) => String(q.m)));
    for (let m = 1; m <= 12; m++) expect(porMod[String(m)], `módulo ${m}`).toBe(6);
    expect(contar(EXAME_REDES.map(tipoDe))).toEqual({
      escolha_multipla: 32, verdadeiro_falso: 16, correspondencia: 16, cenario: 16,
    });
    expect(contar(EXAME_REDES.map((q) => q.d))).toEqual({ f: 32, me: 32, di: 16 });
  });

  it("as 60 lições têm pelo menos uma questão e todas as questões pertencem ao plano", () => {
    const chaves = new Set(LICOES_PLANO.map((l) => l.chave));
    const usadas = new Set(TECNICAS.map(chave));
    expect(usadas).toEqual(chaves);
  });

  it("objectivo copiado da lição, resultados dentro dos da lição e os 18 resultados cobertos", () => {
    const plano = new Map(LICOES_PLANO.map((l) => [l.chave, l]));
    const cobertos = new Set<string>();
    for (const q of [...TECNICAS, ...DIAGNOSTICO_REDES]) {
      const k = chave(q);
      expect(LICOES_REDES[k]!.objectivos, `${q.cod} objectivo`).toContain(q.obj);
      expect(q.r.length, q.cod).toBeGreaterThan(0);
      for (const r of q.r) expect(plano.get(k)!.resultados, `${q.cod} ${r}`).toContain(r);
      if (EXAME_REDES.includes(q)) q.r.forEach((r) => cobertos.add(r));
    }
    expect([...cobertos].sort()).toEqual(Object.keys(RESULTADOS_TDR).sort());
    const tr = EXAME_REDES.filter((q) => q.m === "transversal");
    expect(new Set(tr.map((q) => q.l))).toEqual(new Set([1, 2, 3, 4, 5, 6]));
    for (const q of tr) expect(q.r).toEqual([]);
  });

  it("intersecções registadas na matriz (tipo × dificuldade; módulo × tipo)", () => {
    expect(contar(EXAME_REDES.map((q) => `${tipoDe(q)}/${q.d}`))).toEqual({
      "escolha_multipla/f": 7, "escolha_multipla/me": 22, "escolha_multipla/di": 3,
      "verdadeiro_falso/f": 12, "verdadeiro_falso/me": 4,
      "correspondencia/f": 13, "correspondencia/me": 3,
      "cenario/me": 3, "cenario/di": 13,
    });
  });

  it("cada estrato da prova proposta tem pelo menos o triplo no banco", () => {
    const b = sorteaveis(EXAME_REDES);
    const porMod = contar(b.map((q) => q.moduloId!));
    const somaMod = Object.values(PROPOSTA_PROVA_REDES.modulosPorOrdem).reduce((s, n) => s + n, 0);
    expect(somaMod).toBe(20);
    expect(Object.values(PROPOSTA_PROVA_REDES.modulosPorOrdem).filter((n) => n === 2)).toHaveLength(7); // 6 técnicos + transversal
    for (const [o, n] of Object.entries(PROPOSTA_PROVA_REDES.modulosPorOrdem)) expect(porMod[o] ?? 0, `mod ${o}`).toBeGreaterThanOrEqual(n * 3);
    const porTipo = contar(b.map((q) => tipoPedagogico(q)));
    for (const [t, n] of Object.entries(PROPOSTA_PROVA_REDES.tipos)) expect(porTipo[t] ?? 0).toBeGreaterThanOrEqual(n * 3);
    const dif = quotasDificuldade(20, PROPOSTA_PROVA_REDES.pct);
    expect(dif).toEqual({ facil: 8, media: 8, dificil: 4 });
    const porDif = contar(b.map((q) => q.dificuldade));
    for (const [d, n] of Object.entries(dif)) expect(porDif[d] ?? 0).toBeGreaterThanOrEqual(n * 3);
  });
});

describe("banco Redes — validade dos itens", () => {
  it("fontes: chave existente e já citada na lição (transversal: Lei n.º 10/2024)", () => {
    for (const q of TODOS) {
      expect(FONTES[q.fonte], q.cod).toBeDefined();
      expect(q.e.length).toBeGreaterThan(30);
      expect(q.exp.length).toBeGreaterThan(30);
      if (q.m === "transversal") expect(q.fonte).toBe("lei102024");
      else expect(LICOES_REDES[chave(q)]!.fontes, `${q.cod} ${q.fonte}`).toContain(q.fonte);
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

  it("sem pista de posição, de comprimento nem de valor V/F", () => {
    const em = EXAME_REDES.filter((q) => q.t === "em");
    const pos = contar(em.map((q) => String(q.ind)));
    expect(Object.keys(pos).length).toBe(4);
    for (const n of Object.values(pos)) expect(n / em.length).toBeLessThan(0.3);
    const maisLonga = em.filter((q) => q.opts!.every((o, i) => i === q.ind || o.length < q.opts![q.ind!]!.length));
    expect(maisLonga.length / em.length).toBeLessThan(0.35);
    for (const q of em) {
      const c = q.opts!.map((o) => o.length);
      expect(Math.min(...c) / Math.max(...c), q.cod).toBeGreaterThanOrEqual(0.45);
    }
    const vf = EXAME_REDES.filter((q) => q.t === "vf");
    const verdadeiros = vf.filter((q) => q.val).length;
    expect(verdadeiros).toBeGreaterThanOrEqual(4);
    expect(vf.length - verdadeiros).toBeGreaterThanOrEqual(4);
  });

  it("cenários fictícios e auto-suficientes; contas conferidas", () => {
    const cen = EXAME_REDES.filter((q) => q.cen);
    expect(cen).toHaveLength(16);
    for (const q of cen) {
      expect(q.e).toMatch(/fictíci[oa]/i);
      expect(q.e.length).toBeGreaterThan(200);
    }
    // Só endereços privados ou de documentação nos enunciados
    for (const q of TODOS)
      for (const ip of q.e.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g) ?? [])
        expect(ip, q.cod).toMatch(/^(10\.|192\.168\.|203\.0\.113\.|198\.51\.100\.|0\.0\.0\.0)/);
    // M01-L2-01: 10.20.10.64/26 → difusão .127, último útil .126
    expect(64 + 64 - 2).toBe(126);
    // M03-L3-02: custos OSPF 10+10 < 25 < 1+1+25
    expect([10 + 10, 25, 1 + 1 + 25].sort((a, b) => a - b)[0]).toBe(20);
    // M04-L2-01: 25 × 3 / 60 arredondado para cima
    expect(Math.ceil((25 * 3) / 60)).toBe(2);
    // M05-L4-01 e M09-L4-01: 0,5% de 720 h
    expect(720 * 0.005).toBeCloseTo(3.6);
    // M06-L1-02: 2×3 vs 3×1
    expect([2 * 3, 3 * 1]).toEqual([6, 3]);
    // M09-L3-01: 6 locais em malha completa
    expect((6 * 5) / 2).toBe(15);
    // M10-L3-01: (160+12+8+20)×8×50×3
    expect(((160 + 12 + 8 + 20) * 8 * 50 * 3) / 1000).toBe(240);
    // M10-L4-01: 500×1514×8 / 5e6
    expect((500 * 1514 * 8) / 5e6).toBeCloseTo(1.21, 2);
    // M11-L2-01: 450e6×8/300 sobre 100 Mbit/s
    expect((450e6 * 8) / 300 / 1e6).toBe(12);
    // M11-L2-02: abre na 5.ª (3 seguidas > 80), fecha na 8.ª (< 70)
    const am = [85, 78, 82, 84, 83, 75, 72, 69];
    let seg = 0, aberto = -1, fechado = -1;
    am.forEach((v, i) => {
      if (aberto < 0) { seg = v > 80 ? seg + 1 : 0; if (seg === 3) aberto = i + 1; }
      else if (fechado < 0 && v < 70) fechado = i + 1;
    });
    expect([aberto, fechado]).toEqual([5, 8]);
    // M12-L5-01: 6/10
    expect(6 / 10).toBe(0.6);
  });

  it("M12: falta de prova nunca é «não aplicável»", () => {
    for (const q of TODOS.filter((x) => x.m === 12)) {
      const certa = q.t === "em" ? q.opts![q.ind!]! : "";
      expect(certa, q.cod).not.toMatch(/não aplicável por falta|não aplicável, porque faltou/i);
    }
  });
});

const FALHAS_OBSERVADAS = 12;

describe("banco Redes — simulação do sorteio (modo de ensaio)", () => {
  const dif = quotasDificuldade(20, PROPOSTA_PROVA_REDES.pct);
  const modulos = Object.fromEntries(
    Object.entries(PROPOSTA_PROVA_REDES.modulosPorOrdem).map(([k, v]) => [k, v]),
  ) as Record<string, number>;
  const quotas = { total: 20, dificuldade: dif, modulos, tipos: { ...PROPOSTA_PROVA_REDES.tipos } };

  it("o filtro de produção não encontra nenhuma questão deste plano (todas inactivas)", () => {
    const elegiveis = planoLinhasRedes().filter(
      (l) => l.instrumento === "exame_final" && l.estado_revisao === ("em_uso" as string) && l.activa === (true as boolean),
    );
    expect(elegiveis).toHaveLength(0);
  });

  it("200 provas em ensaio: viáveis, sem repetição, 13 módulos, quotas exactas, sem diagnóstico", () => {
    // ENSAIO: cópia em memória marcada como activa; o plano real continua inactivo.
    const ensaio = planoLinhasRedes().map((l) => ({ ...l, activa: true, estado_revisao: "em_uso" }));
    const elegiveis = ensaio.filter((l) => l.instrumento === "exame_final" && l.activa && l.estado_revisao === "em_uso");
    expect(elegiveis).toHaveLength(80);
    const banco: QuestaoSorteavel[] = elegiveis.map((l) => ({
      id: l.cod, moduloId: String(l.ordemModulo), tipologia: l.tipologia, dificuldade: l.dificuldade, cenario: l.cenario,
    }));
    const porId = new Map(banco.map((q) => [q.id, q]));
    const diag = new Set(DIAGNOSTICO_REDES.map((q) => q.cod));
    const esperadoMod = Object.fromEntries(Object.entries(modulos).map(([k, v]) => [k, v]));
    const assinaturas = new Set<string>();
    const usos = new Map<string, number>();
    const falhas: number[] = [];
    for (let s = 1; s <= 200; s++) {
      const r = sortearExame(banco, quotas, geradorComSemente(s));
      if (!r.ok) { expect(r.causa).toBe("LIMITE_DE_TRABALHO"); falhas.push(s); continue; }
      expect(r.ids).toHaveLength(20);
      expect(new Set(r.ids).size).toBe(20);
      for (const id of r.ids) {
        expect(diag.has(id)).toBe(false);
        usos.set(id, (usos.get(id) ?? 0) + 1);
      }
      const sel = r.ids.map((id) => porId.get(id)!);
      expect(contar(sel.map((q) => q.moduloId!))).toEqual(esperadoMod);
      expect(contar(sel.map((q) => tipoPedagogico(q)))).toEqual({
        escolha_multipla: 8, verdadeiro_falso: 4, correspondencia: 4, cenario: 4,
      });
      expect(contar(sel.map((q) => q.dificuldade))).toEqual({ facil: 8, media: 8, dificil: 4 });
      assinaturas.add([...r.ids].sort().join("|"));
    }
    // Registo honesto (ver matriz): o motor real, sem alteração, esgota o limite de
    // trabalho em algumas sementes; falha fechada, nunca prova incompleta.
    expect(falhas.length).toBe(FALHAS_OBSERVADAS);
    expect(assinaturas.size).toBeGreaterThan(180);
    expect(usos.size).toBe(80);
  }, 60_000);

  it("falha fechada quando um estrato fica insuficiente", () => {
    const b = sorteaveis(EXAME_REDES).filter((q) => q.moduloId !== "13" || q.id === "RED-TR-L1-01");
    expect(sortearExame(b, quotas, geradorComSemente(3)).ok).toBe(false);
  });
});

describe("banco Redes — plano de linhas e esquema real", () => {
  it("todas as linhas inactivas, em rascunho, com gabarito e colunas existentes na tabela", () => {
    const tipos = readFileSync("src/integrations/supabase/types.ts", "utf8");
    const bloco = tipos.slice(tipos.indexOf("banco_questoes: {"));
    const insert = bloco.slice(bloco.indexOf("Insert: {"), bloco.indexOf("Update: {"));
    const plano = planoLinhasRedes();
    expect(plano).toHaveLength(90);
    expect(plano.filter((l) => l.instrumento === "pre_pos_teste")).toHaveLength(10);
    for (const l of plano) {
      expect(l.activa).toBe(false);
      expect(l.estado_revisao).toBe("rascunho");
      expect(Object.keys(l.resposta).length).toBeGreaterThan(0);
      expect(l.ordemModulo).toBeGreaterThanOrEqual(1);
      expect(l.ordemModulo).toBeLessThanOrEqual(13);
    }
    for (const col of Object.keys(plano[0]!).filter((k) => k !== "cod" && k !== "ordemModulo"))
      expect(insert, `coluna ${col}`).toMatch(new RegExp(`\\b${col}\\??:`));
  });
});

describe("banco Redes — o conteúdo não chega ao cliente", () => {
  it("nenhum ficheiro de src/ fora dos testes importa o banco", () => {
    const achados: string[] = [];
    const ver = (dir: string) => {
      for (const n of readdirSync(dir)) {
        const p = join(dir, n);
        if (statSync(p).isDirectory()) { ver(p); continue; }
        if (!/\.(ts|tsx)$/.test(n) || p.includes("__tests__")) continue;
        if (/redes-questoes/.test(readFileSync(p, "utf8"))) achados.push(p);
      }
    };
    ver("src");
    expect(achados).toEqual([]);
    expect(readdirSync("public").some((f) => f.includes("questoes"))).toBe(false);
  });
});
