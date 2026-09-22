/**
 * Verificações dos dois pacotes de conteúdos preparados e das regras de
 * identificação do perfil na área reservada.
 *
 * NOTA HONESTA: estes testes verificam a lógica pura e os dados dos pacotes.
 * Não entram com nenhuma conta real, não escrevem na base de dados e não
 * provam o comportamento em produção. A autorização efectiva é validada na
 * base de dados (funções SECURITY INVOKER + políticas), não aqui.
 */
import { describe, it, expect } from "vitest";
import {
  payloadSeguranca,
  payloadBancoIA,
  resumoBancoIA,
} from "../conteudos-preparados.server";
import { explicarErro } from "../conteudos-preparados.functions";
import { nomeDoPapel, papeisDeVista } from "../papeis";
import { ligacoesDoPainel } from "../navegacao-painel";

describe("pacote 1 — Segurança Cibernética Avançada", () => {
  const p = payloadSeguranca();

  it("tem 15 lições, pares (módulo, ordem) únicos dentro de 1–3 e 1–5", () => {
    expect(p.licoes).toHaveLength(15);
    const chaves = new Set(p.licoes.map((l) => `${l.modulo_ordem}-${l.ordem}`));
    expect(chaves.size).toBe(15);
    for (const l of p.licoes) {
      expect(l.modulo_ordem).toBeGreaterThanOrEqual(1);
      expect(l.modulo_ordem).toBeLessThanOrEqual(3);
      expect(l.ordem).toBeGreaterThanOrEqual(1);
      expect(l.ordem).toBeLessThanOrEqual(5);
    }
  });

  it("nenhum campo obrigatório vai vazio", () => {
    for (const l of p.licoes) {
      expect(l.titulo.trim()).not.toBe("");
      expect(l.elearning.trim()).not.toBe("");
      expect(l.guiao.trim()).not.toBe("");
      expect(l.minutos).toBeGreaterThan(0);
    }
    for (const m of p.modulos) expect(m.descricao.trim()).not.toBe("");
    expect(p.curso.objectivos.trim()).not.toBe("");
    expect(p.curso.materiais.trim()).not.toBe("");
  });

  it("fecha exactamente em 30 horas: 1560 + 120 transversal + 120 de avaliação", () => {
    const somaLicoes = p.licoes.reduce((s, l) => s + l.minutos, 0);
    const somaModulos = p.modulos.reduce((s, m) => s + m.minutos, 0);
    expect(somaLicoes).toBe(1560);
    expect(somaModulos).toBe(1560);
    expect(p.transversal_minutos).toBe(120);
    expect(p.curso.minutos_avaliacao_orientacao).toBe(120);
    expect(somaModulos + p.transversal_minutos + p.curso.minutos_avaliacao_orientacao).toBe(
      p.curso.carga_horaria * 60,
    );
    expect(p.curso.carga_horaria).toBe(30);
  });

  it("o pacote nunca inclui o módulo transversal como módulo a reescrever", () => {
    expect(p.modulos.map((m) => m.ordem).sort()).toEqual([1, 2, 3]);
  });
});

describe("pacote 2 — banco de avaliação de Inteligência Artificial", () => {
  const p = payloadBancoIA();

  it("tem 90 itens: 80 de exame e 10 de diagnóstico", () => {
    expect(p.questoes).toHaveLength(90);
    expect(p.questoes.filter((q) => q.instrumento === "exame_final")).toHaveLength(80);
    expect(p.questoes.filter((q) => q.instrumento === "pre_pos_teste")).toHaveLength(10);
  });

  it("cada item tem código estável único — a identidade não é o enunciado", () => {
    const codigos = new Set(p.questoes.map((q) => q.codigo));
    expect(codigos.size).toBe(90);
    for (const q of p.questoes) expect(q.codigo.trim()).not.toBe("");
  });

  it("todos os valores cabem nas listas da base e nada vai vazio", () => {
    const tipologias = [
      "escolha_multipla",
      "verdadeiro_falso",
      "resposta_curta",
      "correspondencia",
      "ordenacao",
    ];
    for (const q of p.questoes) {
      expect(tipologias).toContain(q.tipologia);
      expect(["facil", "media", "dificil"]).toContain(q.dificuldade);
      expect(q.enunciado.trim()).not.toBe("");
      expect(q.versao.trim()).not.toBe("");
      expect(q.conteudo).toBeTruthy();
      expect(q.resposta).toBeTruthy();
      expect(q.ordem_modulo).toBeGreaterThan(0);
    }
  });

  it("o resumo mostrado no ecrã não traz enunciados nem gabaritos", () => {
    const texto = JSON.stringify(resumoBancoIA());
    expect(texto).not.toContain("resposta");
    expect(texto).not.toContain("enunciado");
    expect(JSON.parse(texto).activas).toBe(0);
  });
});

describe("mensagens e identificação do perfil", () => {
  it("cada recusa da base é explicada e diz sempre que nada foi gravado", () => {
    for (const codigo of [
      "SEM_PERMISSAO_ADMIN_GERAL",
      "ESTADO_ALTERADO",
      "CONFLITO_CONTEUDO_EXISTENTE",
      "CONFLITO_QUESTOES_EM_USO",
      "CONFLITO_QUESTOES_DIFERENTES: IA-M1-001",
      "CODIGO_INESPERADO_NA_BASE",
      "QUESTOES_SEM_CODIGO",
      "MODULO_NAO_LIGADO_AO_CURSO",
      "ESTRUTURA_DE_MODULOS_INESPERADA",
      "MODULO_PARTILHADO_COM_OUTRO_CURSO",
      "MINUTOS_POR_MODULO_INCOERENTES",
      "MINUTOS_INCOERENTES",
      "new row violates row-level security policy",
    ]) {
      const m = explicarErro(codigo);
      expect(m.length).toBeGreaterThan(10);
    }
    expect(explicarErro("ESTADO_ALTERADO")).toContain("Nada foi gravado");
  });

  it("o perfil admin_ologa é identificado como Administrador Geral Ologa", () => {
    expect(nomeDoPapel("admin_ologa")).toBe("Administrador Geral Ologa");
    expect(nomeDoPapel("admin_atdi")).toBe("Administrador ATDI");
  });

  it("só o Administrador Geral Ologa vê a importação de conteúdos", () => {
    const vista = papeisDeVista([], true);
    expect(vista[0]).toBe("admin_ologa");
    expect(ligacoesDoPainel(vista[0] ?? null).map((l) => l.to)).toContain("/painel/conteudos");
    expect(ligacoesDoPainel("admin_atdi").map((l) => l.to)).not.toContain("/painel/conteudos");
    expect(ligacoesDoPainel("auditor_atdi").map((l) => l.to)).not.toContain("/painel/conteudos");
    expect(ligacoesDoPainel("formando").map((l) => l.to)).not.toContain("/painel/conteudos");
  });
});
