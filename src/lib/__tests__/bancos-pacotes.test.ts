/**
 * Pacotes privados dos bancos de SC, Governo e Redes em «Conteúdos preparados».
 * Só memória e leitura de ficheiros: nada é importado nem activado.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  MATRIZ_MODULOS,
  payloadBanco,
  resumoBanco,
  type PacoteBanco,
} from "../conteudos-preparados.server";
import { RPC_BANCOS } from "../conteudos-preparados.functions";

const PACOTES: PacoteBanco[] = ["banco-seguranca-cibernetica", "banco-tecnologias-governo", "banco-redes"];

describe.each(PACOTES)("pacote %s", (pacote) => {
  const { questoes } = payloadBanco(pacote);

  it("80 exame + 10 diagnóstico, códigos únicos, matriz igual à exigida pela base", () => {
    expect(questoes).toHaveLength(90);
    expect(new Set(questoes.map((q) => q.codigo)).size).toBe(90);
    const exame = questoes.filter((q) => q.instrumento === "exame_final");
    expect(exame).toHaveLength(80);
    for (const [o, n] of Object.entries(MATRIZ_MODULOS[pacote]))
      expect(exame.filter((q) => q.ordem_modulo === Number(o)).length).toBe(n);
    const r = resumoBanco(pacote);
    expect(r.porTipo).toEqual({ escolha_multipla: 32, verdadeiro_falso: 16, correspondencia: 16, cenario: 16 });
    expect(r.porDificuldade).toEqual({ facil: 32, media: 32, dificil: 16 });
    expect(r.activas).toBe(0);
  });

  it("não envia estado de activação: a base grava sempre activa=false e rascunho", () => {
    for (const q of questoes) {
      expect(Object.keys(q)).not.toContain("activa");
      expect(Object.keys(q)).not.toContain("estado_revisao");
      expect(Object.keys(q.resposta).length).toBeGreaterThan(0);
    }
  });

  it("resumo não contém enunciados nem gabaritos", () => {
    const texto = JSON.stringify(resumoBanco(pacote));
    for (const q of questoes.slice(0, 10)) expect(texto).not.toContain(q.enunciado.slice(0, 40));
  });
});

describe("funções por autorizar e privacidade", () => {
  const sql = readFileSync("docs/migracoes-por-autorizar/bancos-sc-governo-redes.sql", "utf8");

  it("6 funções, SECURITY INVOKER, admin_ologa, sem service_role, grants mínimos", () => {
    const corpo = sql.replace(/^--.*$/gm, "");
    for (const { estado, importar } of Object.values(RPC_BANCOS)) {
      expect(corpo).toContain(`CREATE OR REPLACE FUNCTION public.${estado}()`);
      expect(corpo).toContain(`CREATE OR REPLACE FUNCTION public.${importar}(_payload jsonb, _hash_estado text)`);
      expect(corpo).toContain(`REVOKE ALL ON FUNCTION public.${estado}() FROM PUBLIC, anon;`);
      expect(corpo).toContain(`GRANT EXECUTE ON FUNCTION public.${importar}(jsonb, text) TO authenticated;`);
    }
    expect(corpo).not.toMatch(/SECURITY DEFINER|service_role|CREATE POLICY|GRANT (SELECT|INSERT|UPDATE|DELETE|ALL) ON/i);
    expect(corpo.match(/e_admin_geral_ologa/g)?.length).toBe(6);
    expect(corpo.match(/SET search_path TO 'public'/g)?.length).toBe(6);
    expect(corpo).not.toMatch(/activa\s*=\s*true|UPDATE public\.banco_questoes|exame_configuracoes/);
  });

  it("o código enviado ao navegador não importa o módulo privado estaticamente", () => {
    const fn = readFileSync("src/lib/conteudos-preparados.functions.ts", "utf8");
    expect(fn).not.toMatch(/^import .*conteudos-preparados\.server/m);
    const rota = readFileSync("src/routes/_authenticated/painel.conteudos.tsx", "utf8");
    expect(rota).not.toMatch(/questoes|\.server/);
  });
});
