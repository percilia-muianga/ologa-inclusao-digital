import { describe, it, expect } from "vitest";
import { papeisDeVista } from "../papeis";

describe("vista do painel", () => {
  it("perfil Administrador Geral sem papéis atribuídos vê a vista de administração", () => {
    expect(papeisDeVista([], true)).toEqual(["admin_atdi"]);
  });

  it("conta comum sem papéis continua sem vista reservada", () => {
    expect(papeisDeVista([], false)).toEqual([]);
  });

  it("não acumula papéis: só acrescenta a vista de administração", () => {
    expect(papeisDeVista(["formando"], true)).toEqual(["admin_atdi", "formando"]);
    expect(papeisDeVista(["auditor_atdi"], false)).toEqual(["auditor_atdi"]);
  });

  it("não duplica quando já tem o papel de administrador", () => {
    expect(papeisDeVista(["admin_atdi"], true)).toEqual(["admin_atdi"]);
  });
});
