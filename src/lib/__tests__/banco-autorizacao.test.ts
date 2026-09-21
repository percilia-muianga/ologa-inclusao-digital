import { describe, expect, it } from "vitest";
import { avaliarPermissoesBanco } from "@/lib/avaliacao.functions";

describe("autorização do banco de questões", () => {
  it("nega a quem não tem papel nenhum (anónimo autenticado sem papéis)", () => {
    expect(avaliarPermissoesBanco([], null)).toEqual({ podeLer: false, podeEscrever: false });
  });

  it("nega ao formando", () => {
    expect(avaliarPermissoesBanco(["formando"], "formando")).toEqual({
      podeLer: false,
      podeEscrever: false,
    });
  });

  it("nega ao formador e ao supervisor provincial", () => {
    expect(avaliarPermissoesBanco(["formador"], null).podeLer).toBe(false);
    expect(avaliarPermissoesBanco(["supervisor_provincial"], null).podeLer).toBe(false);
  });

  it("dá leitura, mas não escrita, ao auditor", () => {
    expect(avaliarPermissoesBanco(["auditor_atdi"], null)).toEqual({
      podeLer: true,
      podeEscrever: false,
    });
  });

  it("dá leitura e escrita à administração ATDI, à coordenação nacional e ao admin Ologa", () => {
    for (const p of [["admin_atdi"], ["coordenador_nacional"]]) {
      expect(avaliarPermissoesBanco(p, null)).toEqual({ podeLer: true, podeEscrever: true });
    }
    expect(avaliarPermissoesBanco([], "admin_ologa")).toEqual({
      podeLer: true,
      podeEscrever: true,
    });
  });

  it("não aceita papéis inventados pelo cliente", () => {
    expect(avaliarPermissoesBanco(["admin", "root", "gestor_instituicao"], "gestor_instituicao"))
      .toEqual({ podeLer: false, podeEscrever: false });
  });
});
