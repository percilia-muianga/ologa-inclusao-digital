/**
 * Pacote «Administração de Redes»: plano, 60 IDs, guiões, fontes, pacote,
 * texto das funções/regras POR AUTORIZAR e privacidade. Não escreve na base.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  LICOES_PLANO, MODULOS_PLANO, MINUTOS_CONTEUDOS, MINUTOS_TRANSVERSAL,
  MINUTOS_AVALIACAO_ORIENTACAO, CARGA_HORARIA_HORAS, RESULTADOS_TDR,
} from "../plano-redes";
import { LICOES_REDES, montarTodasRedes } from "../../../scripts/conteudo/redes-licoes";
import { IDS_LICOES_REDES, IDS_MODULOS_REDES } from "../../../scripts/conteudo/redes-ids";
import { FONTES } from "../../../scripts/conteudo/redes-base";
import { ACTIVIDADE_INTEGRADA } from "../../../scripts/conteudo/redes-m12";
import { verificarGuioes } from "../../../scripts/verificar-guioes-redes";
import { payloadRedes } from "../conteudos-preparados.server";
import { explicarErro } from "../conteudos-preparados.functions";

const FUN = readFileSync("docs/migracoes-por-autorizar/importacao-redes.sql", "utf8");
const POL = readFileSync("docs/migracoes-por-autorizar/politicas-redes.sql", "utf8");

describe("plano e horas", () => {
  it("4560 + 120 transversal + 120 avaliação = 4800 = 80 h", () => {
    expect(LICOES_PLANO.reduce((s, l) => s + l.minutos, 0)).toBe(4560);
    expect(MINUTOS_CONTEUDOS).toBe(4560);
    expect(MINUTOS_CONTEUDOS + MINUTOS_TRANSVERSAL + MINUTOS_AVALIACAO_ORIENTACAO).toBe(CARGA_HORARIA_HORAS * 60);
    expect(MODULOS_PLANO.every((m) => m.minutos === 380)).toBe(true);
  });
});

describe("60 lições", () => {
  it("IDs únicos, iguais ao plano, e 60 IDs de base distintos", () => {
    const chaves = Object.keys(LICOES_REDES);
    expect(chaves).toHaveLength(60);
    expect(new Set(chaves)).toEqual(new Set(LICOES_PLANO.map((l) => l.chave)));
    expect(new Set(Object.values(IDS_LICOES_REDES)).size).toBe(60);
    expect(new Set(IDS_MODULOS_REDES).size).toBe(12);
  });
  it("guiões terminam na duração planeada", () => {
    expect(verificarGuioes(LICOES_REDES)).toEqual([]);
  });
  it("todas as fontes citadas existem", () => {
    for (const c of Object.values(LICOES_REDES)) for (const f of c.fontes) expect(FONTES[f]).toBeTruthy();
  });
  it("C01–C18 cobrem R01–R18", () => {
    const cobertos = new Set(ACTIVIDADE_INTEGRADA.criterios.flatMap((c) => c.resultados));
    for (const r of Object.keys(RESULTADOS_TDR)) expect(cobertos.has(r as never)).toBe(true);
  });
  it("HTML montado sem <script>", () => {
    for (const l of montarTodasRedes()) {
      expect(l.elearning).not.toMatch(/<script/i);
      expect(l.guiao).toContain("Guião do formador");
    }
  });
});

describe("pacote", () => {
  const p = payloadRedes();
  it("estrutura exacta", () => {
    expect(p.licoes).toHaveLength(60);
    expect(p.modulos).toHaveLength(12);
    expect(p.transversal.minutos).toBe(120);
    expect(p.curso.carga_horaria).toBe(80);
    expect(p.curso.minutos_avaliacao_orientacao).toBe(120);
    expect(p.curso.slug).toBe("redes-avancadas-seguranca-cibernetica");
    for (const m of p.modulos) {
      expect(p.licoes.filter((l) => l.modulo_id === m.id).reduce((s, l) => s + l.minutos, 0)).toBe(m.minutos);
    }
  });
  it("não contém credenciais reais evidentes", () => {
    const t = JSON.stringify(p);
    expect(t).not.toMatch(/BEGIN (RSA |OPENSSH )?PRIVATE KEY/);
    expect(t).not.toMatch(/sb_secret_|service_role/);
  });
});

describe("SQL por autorizar", () => {
  it("funções INVOKER, sem DEFINER, sem regras nem grants de tabela", () => {
    expect(FUN).not.toMatch(/SECURITY DEFINER/);
    expect((FUN.match(/SECURITY INVOKER/g) ?? []).length).toBe(2);
    expect(FUN).not.toMatch(/CREATE POLICY/i);
    expect(FUN).not.toMatch(/GRANT (UPDATE|INSERT|DELETE|ALL) ON (TABLE )?public\./i);
    for (const k of ["pg_advisory_xact_lock", "ESTADO_ALTERADO", "CONFLITO_CONTEUDO_EXISTENTE", "IDS_INESPERADOS", "SEM_REGRA_DE_ESCRITA_CURSO", "e_admin_geral_ologa"]) expect(FUN).toContain(k);
    expect(FUN).toMatch(/REVOKE ALL ON FUNCTION public\.rpc_importar_redes\(jsonb, text\) FROM PUBLIC, anon/);
  });
  it("regras: só UPDATE, só admin_ologa, só o slug de Redes", () => {
    const pols = POL.match(/CREATE POLICY/g) ?? [];
    expect(pols).toHaveLength(2);
    expect(POL).not.toMatch(/FOR (INSERT|DELETE|ALL|SELECT)/);
    expect((POL.match(/FOR UPDATE/g) ?? []).length).toBe(2);
    expect((POL.match(/redes-avancadas-seguranca-cibernetica/g) ?? []).length).toBe(4);
    expect(POL).not.toMatch(/ON public\.modulos/);
  });
  it("nada disto está em migrações autoexecutáveis", () => {
    for (const f of readdirSync("drizzle/migrations")) {
      if (!f.endsWith(".sql")) continue;
      expect(readFileSync(join("drizzle/migrations", f), "utf8")).not.toMatch(/rpc_importar_redes|redes_admin_ologa/);
    }
  });
  it("mensagem clara quando as funções ainda não existem", () => {
    expect(explicarErro("Could not find the function public.rpc_estado_redes")).toContain("ainda não está autorizada");
  });
});

describe("privacidade do pacote", () => {
  const ficheiros = (d: string): string[] =>
    readdirSync(d).flatMap((f) => {
      const p = join(d, f);
      return statSync(p).isDirectory() ? (f === "__tests__" ? [] : ficheiros(p)) : [p];
    });
  it("nenhum ficheiro que chega ao navegador importa o conteúdo ou o módulo .server", () => {
    for (const f of ficheiros("src").filter((x) => /\.(ts|tsx)$/.test(x) && !/\.server\.tsx?$/.test(x))) {
      const t = readFileSync(f, "utf8");
      expect(t, f).not.toMatch(/from ["'][^"']*scripts\/conteudo/);
      expect(t, f).not.toMatch(/^import [^;]*conteudos-preparados\.server/m);
    }
  });
});
