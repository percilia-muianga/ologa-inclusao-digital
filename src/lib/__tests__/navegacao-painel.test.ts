import { describe, it, expect } from "vitest";
import { ligacoesDoPainel, destinoAposEntrada } from "../navegacao-painel";
import { papeisDeVista } from "../papeis";

describe("navegação da área reservada", () => {
  it("o Administrador Geral Ologa, sem papéis atribuídos, vê instituições e utilizadores", () => {
    const vista = papeisDeVista([], true);
    const ligacoes = ligacoesDoPainel(vista[0] ?? null).map((l) => l.to);
    expect(ligacoes).toContain("/gestao/instituicoes");
    expect(ligacoes).toContain("/painel/utilizadores");
    expect(ligacoes).toContain("/painel/auditoria");
  });

  it("o auditor não vê a gestão de instituições nem a equipa", () => {
    const ligacoes = ligacoesDoPainel("auditor_atdi").map((l) => l.to);
    expect(ligacoes).not.toContain("/gestao/instituicoes");
    expect(ligacoes).not.toContain("/painel/equipa");
    expect(ligacoes).toContain("/painel/auditoria");
  });

  it("conta sem papel de gestão não vê nenhuma área de administração", () => {
    const vista = papeisDeVista([], false);
    const ligacoes = ligacoesDoPainel(vista[0] ?? null).map((l) => l.to);
    expect(ligacoes).toEqual(["/painel", "/formacao", "/"]);
  });

  it("o formando também não vê áreas de administração", () => {
    const ligacoes = ligacoesDoPainel("formando").map((l) => l.to);
    expect(ligacoes).not.toContain("/painel/utilizadores");
  });

  it("depois de entrar, o destino é sempre interno e fixo", () => {
    expect(destinoAposEntrada()).toBe("/painel");
  });
});
