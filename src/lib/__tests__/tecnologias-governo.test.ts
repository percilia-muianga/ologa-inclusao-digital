/**
 * Verificações do curso «Tecnologias Digitais do Governo». Lógica pura e texto
 * da migração; não entram com conta real nem escrevem na base.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  LICOES_PLANO,
  MINUTOS_LICOES,
  MINUTOS_TOTAIS,
  MINUTOS_TRANSVERSAL,
  MINUTOS_AVALIACAO_ORIENTACAO,
  CARGA_HORARIA_HORAS,
  TOPICOS_SEC_6_6,
  FICHA_CURSO,
} from "../plano-tecnologias-governo";
import { LICOES, montarTodas } from "../../../scripts/conteudo/tecnologias-governo-licoes";
import { payloadTecnologiasGoverno } from "../conteudos-preparados.server";
import { explicarErro } from "../conteudos-preparados.functions";

const SQL = readFileSync("drizzle/migrations/0024_importacao_tecnologias_governo_invoker.sql", "utf8");

describe("plano — 10 horas e 9 tópicos", () => {
  it("fecha em 600 minutos: 360 + 120 transversal (uma vez) + 120 avaliação", () => {
    expect(MINUTOS_LICOES).toBe(360);
    expect(MINUTOS_TRANSVERSAL).toBe(120);
    expect(MINUTOS_AVALIACAO_ORIENTACAO).toBe(120);
    expect(MINUTOS_TOTAIS).toBe(CARGA_HORARIA_HORAS * 60);
  });
  it("tem 5 lições com ordens 1–5 e tempos que somam a duração", () => {
    expect(LICOES_PLANO.map((l) => l.ordem)).toEqual([1, 2, 3, 4, 5]);
    for (const l of LICOES_PLANO) {
      expect(l.tempos.explicacao + l.tempos.actividade + l.tempos.formativa).toBe(l.minutos);
    }
  });
  it("cobre os 9 tópicos da secção 6.6, cada um numa só lição", () => {
    const todos = LICOES_PLANO.flatMap((l) => l.topicos);
    expect(new Set(todos).size).toBe(todos.length);
    for (const t of TOPICOS_SEC_6_6) expect(todos).toContain(t);
    expect(TOPICOS_SEC_6_6).toHaveLength(9);
  });
  it("ficha completa", () => {
    for (const v of Object.values(FICHA_CURSO)) expect(v.trim().length).toBeGreaterThan(80);
  });
});

describe("conteúdo das 5 lições", () => {
  it("cada lição é completa: caso, documentos, actividade, papel, 2 formativas, leitura fácil, guião, fontes", () => {
    for (const l of LICOES_PLANO) {
      const c = LICOES[l.chave]!;
      expect(c).toBeTruthy();
      expect(c.objectivos.length).toBeGreaterThanOrEqual(3);
      expect(c.caso.titulo).toMatch(/fictíci/i);
      expect(c.documentos.length).toBeGreaterThanOrEqual(2);
      expect(c.actividade.instrucoes.join(" ")).toContain("SIMULAÇÃO DIDÁCTICA");
      expect(c.papel.length).toBeGreaterThanOrEqual(2);
      expect(c.formativas).toHaveLength(2);
      for (const f of c.formativas) {
        expect(f.opcoes[f.certa]).toBeTruthy();
        expect(f.comentario.length).toBeGreaterThan(30);
      }
      expect(c.leituraFacil.length).toBeGreaterThanOrEqual(4);
      expect(c.guiao.conducao.length).toBeGreaterThanOrEqual(3);
      expect(c.fontes.length).toBeGreaterThanOrEqual(1);
    }
  });
  it("mantém as distinções pedidas", () => {
    const txt = JSON.stringify(LICOES);
    expect(txt).toContain("Assinatura digital ≠ imagem de assinatura");
    expect(txt).toContain("Interoperabilidade ≠ partilha livre de dados");
    expect(txt).toContain("CloudGov ≠ cópia de segurança garantida");
    expect(txt).toContain("responsável autorizado");
    expect(txt).toContain("não equivalem a lei aprovada");
  });
  it("não pede credenciais nem afirma validação ATDI ou execução real", () => {
    const txt = JSON.stringify(LICOES).toLowerCase();
    expect(txt).not.toMatch(/validad[oa] pela atdi/);
    expect(txt).not.toMatch(/introduza a sua palavra-passe/);
  });
  it("monta HTML escapado para as 5 lições", () => {
    const m = montarTodas();
    expect(m).toHaveLength(5);
    for (const l of m) {
      expect(l.elearning).toContain("<h2>Objectivos</h2>");
      expect(l.elearning).toContain("Em leitura fácil");
      expect(l.guiao).toContain("Guião do formador");
      expect(l.elearning).not.toContain("<script");
    }
  });
});

describe("pacote e importador", () => {
  it("pacote fixo: 5 lições, módulo com 360, transversal 120, 10 horas", () => {
    const p = payloadTecnologiasGoverno();
    expect(p.licoes).toHaveLength(5);
    expect(p.modulo.minutos).toBe(360);
    expect(p.transversal_minutos).toBe(120);
    expect(p.curso.carga_horaria).toBe(10);
    expect(p.curso.minutos_avaliacao_orientacao).toBe(120);
  });
  it("funções da base: INVOKER, sessão, perfil, trinco, hash, conflitos; sem DEFINER nem regra nova", () => {
    expect(SQL).not.toMatch(/SECURITY DEFINER/);
    expect((SQL.match(/SECURITY INVOKER/g) ?? []).length).toBe(2);
    expect(SQL).toContain("auth.uid()");
    expect(SQL).toContain("e_admin_geral_ologa");
    expect(SQL).toContain("pg_advisory_xact_lock");
    expect(SQL).toContain("ESTADO_ALTERADO");
    expect(SQL).toContain("CONFLITO_CONTEUDO_EXISTENTE");
    expect(SQL).toContain("MODULO_PARTILHADO_COM_OUTRO_CURSO");
    expect(SQL).toContain("SEM_REGRA_DE_ESCRITA_CURSO");
    expect(SQL).not.toMatch(/CREATE POLICY/i);
    expect(SQL).not.toMatch(/GRANT UPDATE/i);
    expect(SQL).toMatch(/REVOKE ALL ON FUNCTION public\.rpc_importar_tecnologias_governo\(jsonb, text\) FROM PUBLIC, anon/);
  });
  it("o módulo transversal global nunca é alterado: só horas deste curso", () => {
    expect(SQL).toMatch(/UPDATE public\.modulos SET descricao=_mod->>'descricao' WHERE id=_modulo/);
    expect(SQL).toMatch(/WHERE curso_id=_curso AND transversal=true/);
  });
  it("bloqueio por falta de regra é explicado e diz que nada foi gravado", () => {
    expect(explicarErro("SEM_REGRA_DE_ESCRITA_CURSO")).toContain("Nada foi gravado");
  });
});
