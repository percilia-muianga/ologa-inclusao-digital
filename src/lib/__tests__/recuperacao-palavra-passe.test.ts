import { describe, expect, it } from "vitest";
import {
  CAMINHO_NOVA_PALAVRA_PASSE,
  MENSAGEM_PEDIDO_GENERICA,
  ORIGEM_PUBLICADA,
  emailComForma,
  enderecoDeRetorno,
  origemLegitima,
  validarNovaPalavraPasse,
} from "../recuperacao-palavra-passe";

describe("origem de retorno", () => {
  it("aceita o endereço publicado e as pré-visualizações", () => {
    expect(origemLegitima(ORIGEM_PUBLICADA)).toBe(true);
    expect(origemLegitima("https://id-preview--caff1b34.lovable.app")).toBe(true);
  });

  it("aceita o ambiente local de desenvolvimento", () => {
    expect(origemLegitima("http://localhost:8080")).toBe(true);
  });

  it("recusa origens estranhas", () => {
    expect(origemLegitima("https://exemplo-malicioso.com")).toBe(false);
    expect(origemLegitima("https://lovable.app.exemplo.com")).toBe(false);
    expect(origemLegitima("javascript:alert(1)")).toBe(false);
    expect(origemLegitima(null)).toBe(false);
    expect(origemLegitima("")).toBe(false);
  });

  it("substitui origem não reconhecida pelo endereço publicado", () => {
    expect(enderecoDeRetorno("https://exemplo-malicioso.com")).toBe(
      `${ORIGEM_PUBLICADA}${CAMINHO_NOVA_PALAVRA_PASSE}`,
    );
    expect(enderecoDeRetorno("https://ologa-staging-priv-9k3m2.lovable.app/")).toBe(
      `${ORIGEM_PUBLICADA}${CAMINHO_NOVA_PALAVRA_PASSE}`,
    );
  });
});

describe("validação da nova palavra-passe", () => {
  it("recusa palavras-passe curtas", () => {
    expect(validarNovaPalavraPasse("curta", "curta")).toEqual({
      ok: false,
      erro: "A palavra-passe deve ter pelo menos 8 caracteres.",
    });
  });

  it("recusa confirmação diferente", () => {
    const r = validarNovaPalavraPasse("palavra-longa", "palavra-diferente");
    expect(r.ok).toBe(false);
  });

  it("aceita palavra-passe válida e confirmada", () => {
    expect(validarNovaPalavraPasse("palavra-longa", "palavra-longa")).toEqual({ ok: true });
  });
});

describe("mensagem do pedido", () => {
  it("é sempre a mesma e não revela a existência da conta", () => {
    expect(MENSAGEM_PEDIDO_GENERICA).toContain("Se existir uma conta");
    expect(MENSAGEM_PEDIDO_GENERICA).not.toMatch(/não existe|inexistente|registad/i);
  });

  it("verifica apenas a forma do email", () => {
    expect(emailComForma("pessoa@exemplo.mz")).toBe(true);
    expect(emailComForma("sem-arroba")).toBe(false);
  });
});
