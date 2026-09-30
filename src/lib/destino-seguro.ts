/** Aceita apenas caminhos internos ("/..."), nunca endereços externos. */
export function destinoSeguro(valor: unknown): string | undefined {
  if (typeof valor !== "string") return undefined;
  if (!valor.startsWith("/") || valor.startsWith("//") || valor.includes("\\")) return undefined;
  if (valor.startsWith("/entrar")) return undefined;
  return valor;
}
