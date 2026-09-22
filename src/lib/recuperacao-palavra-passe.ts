/**
 * Recuperação de palavra-passe — regras puras, sem chamadas de rede.
 *
 * O envio do email é feito pelo mecanismo nativo do fornecedor de autenticação
 * já usado na plataforma. Aqui só se decide o endereço de retorno e se validam
 * as palavras-passe. Nenhum token é criado, lido ou apresentado.
 */

/** Endereço público do site, usado quando a origem actual não é reconhecida. */
export const ORIGEM_PUBLICADA = "https://ologa-staging-priv-9k3m2.lovable.app";

/** Caminho da página onde a pessoa define a nova palavra-passe. */
export const CAMINHO_NOVA_PALAVRA_PASSE = "/nova-palavra-passe";

/** Só estas origens são aceites como retorno do email de recuperação. */
export function origemLegitima(origem: string | null | undefined): boolean {
  if (!origem) return false;
  let url: URL;
  try {
    url = new URL(origem);
  } catch {
    return false;
  }
  if (url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    return true;
  }
  if (url.protocol !== "https:") return false;
  return url.hostname === "lovable.app" || url.hostname.endsWith(".lovable.app");
}

/**
 * Endereço de retorno do email. Origens desconhecidas são ignoradas e
 * substituídas pelo endereço publicado — nunca se aceita um destino arbitrário.
 */
export function enderecoDeRetorno(origem: string | null | undefined): string {
  const base = origemLegitima(origem) ? (origem as string) : ORIGEM_PUBLICADA;
  return `${base.replace(/\/+$/, "")}${CAMINHO_NOVA_PALAVRA_PASSE}`;
}

/** Resposta única do pedido: nunca revela se a conta existe. */
export const MENSAGEM_PEDIDO_GENERICA =
  "Se existir uma conta com esse email, enviámos uma mensagem com as instruções para definir uma nova palavra-passe. Verifique também a pasta de correio não desejado.";

export type ValidacaoPalavraPasse = { ok: true } | { ok: false; erro: string };

/** Mínimo de 8 caracteres e confirmação igual — mesmas regras da criação de conta. */
export function validarNovaPalavraPasse(
  palavraPasse: string,
  confirmacao: string,
): ValidacaoPalavraPasse {
  if (palavraPasse.length < 8) {
    return { ok: false, erro: "A palavra-passe deve ter pelo menos 8 caracteres." };
  }
  if (palavraPasse !== confirmacao) {
    return { ok: false, erro: "As duas palavras-passe não coincidem. Escreva a mesma nos dois campos." };
  }
  return { ok: true };
}

/** Email com forma válida — a existência da conta nunca é verificada no ecrã. */
export function emailComForma(email: string): boolean {
  const v = email.trim();
  return v.length > 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
