import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Verificação no navegador, antes de pedir dados ao servidor: sem sessão
 * válida (ou com sessão expirada que já não se renova), segue para a entrada
 * com regresso à página pretendida. Evita pedidos sem credenciais e os erros
 * técnicos daí resultantes. A permissão continua a ser decidida no servidor.
 */
export async function exigirSessao({ location }: { location: { href: string } }) {
  if (typeof window === "undefined") return;
  const { data } = await supabase.auth.getSession();
  const sessao = data.session;
  const expirada = !!sessao?.expires_at && sessao.expires_at * 1000 <= Date.now();
  if (!sessao || expirada) {
    throw redirect({ to: "/entrar", search: { redirect: location.href } });
  }
}
