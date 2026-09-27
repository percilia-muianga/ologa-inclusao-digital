/** Regressão: o importador IA grava 'rascunho'; a regra da base tem de o aceitar. */
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { explicarErro } from "../conteudos-preparados.functions";
import { planoIntegracao } from "../../../scripts/integrar-banco-inteligencia-artificial";

const dir = "drizzle/migrations";
const ultimaRegra = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()
  .map((f) => readFileSync(`${dir}/${f}`, "utf8"))
  .filter((s) => /ADD CONSTRAINT banco_questoes_estado_revisao_valido/.test(s)).pop()!;

describe("banco IA — estado de revisão aceite pela base", () => {
  it("a regra em vigor aceita todos os estados que o pacote grava", () => {
    for (const l of planoIntegracao()) expect(ultimaRegra).toContain(`'${l.estado_revisao}'`);
    expect(ultimaRegra).toContain("'em_uso'");
    expect(ultimaRegra).toContain("'retirada'");
  });
  it("violação de regra dá código seguro, sem expor o nome interno", () => {
    const m = explicarErro('new row violates check constraint "banco_questoes_estado_revisao_valido"');
    expect(m).toContain("REGRA_DE_VALIDACAO");
    expect(m).not.toContain("banco_questoes");
  });
});
