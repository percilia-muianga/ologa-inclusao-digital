import { describe, expect, it } from "vitest";
import { avaliarGestao } from "@/lib/guardas";

/**
 * Regra de autorização de gestão, testada isoladamente — sem base de dados,
 * sem contas e sem dados de produção.
 */
describe("avaliarGestao", () => {
  it("nega o anónimo / sem papéis", () => {
    expect(avaliarGestao([], null)).toEqual({ podeLer: false, podeEscrever: false });
  });

  it("nega o formando", () => {
    expect(avaliarGestao(["formando"], null)).toEqual({ podeLer: false, podeEscrever: false });
  });

  it("nega o formador enquanto não houver escopo verificável no servidor", () => {
    expect(avaliarGestao(["formador"], null)).toEqual({ podeLer: false, podeEscrever: false });
  });

  it("nega o supervisor provincial enquanto não houver escopo verificável", () => {
    expect(avaliarGestao(["supervisor_provincial"], null)).toEqual({
      podeLer: false,
      podeEscrever: false,
    });
  });

  it("dá só leitura ao auditor", () => {
    expect(avaliarGestao(["auditor_atdi"], null)).toEqual({ podeLer: true, podeEscrever: false });
  });

  it("dá leitura e escrita ao admin ATDI e ao coordenador nacional", () => {
    expect(avaliarGestao(["admin_atdi"], null)).toEqual({ podeLer: true, podeEscrever: true });
    expect(avaliarGestao(["coordenador_nacional"], null)).toEqual({
      podeLer: true,
      podeEscrever: true,
    });
  });

  it("mantém o acesso do administrador OLOGA existente", () => {
    expect(avaliarGestao([], "admin_ologa")).toEqual({ podeLer: true, podeEscrever: true });
  });

  it("não aceita papéis desconhecidos nem perfis não administrativos", () => {
    expect(avaliarGestao(["qualquer_coisa"], "formando")).toEqual({
      podeLer: false,
      podeEscrever: false,
    });
  });
});
