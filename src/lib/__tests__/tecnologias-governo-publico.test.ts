import { describe, it, expect } from "vitest";
import { montarTodas } from "../../../scripts/conteudo/tecnologias-governo-licoes";
import { FICHA_CURSO, DESCRICAO_MODULO, NOTA_CARGA } from "../plano-tecnologias-governo";

describe("Tecnologias do Governo — apresentação pública final", () => {
  const licoes = montarTodas();
  const publico = [...licoes.map((l) => l.elearning), DESCRICAO_MODULO, NOTA_CARGA, ...Object.values(FICHA_CURSO)].join("\n");
  it("sem marcas genéricas de pendência no texto público", () => {
    expect(publico).not.toMatch(/por validar|pendente|não foi possível confirm|manual oficial disponível/i);
  });
  it("simulações didácticas continuam identificadas", () => {
    for (const l of licoes) expect(l.elearning).toMatch(/simula[çc][ãa]o did[áa]ctica/i);
  });
  it("exactamente 5 lições, ordens 1..5", () => {
    expect(licoes.map((l) => l.ordem)).toEqual([1, 2, 3, 4, 5]);
  });
});
