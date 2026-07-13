// Staging-only auth bypass.
//
// Quando VITE_AUTH_BYPASS === "true", a app faz sign-in automático como conta
// demo (admin) sem alguma vez mostrar o ecrã /entrar. Em produção esta flag
// não existe (ou está a "false") e a autenticação normal volta.
//
// NÃO apaga o código de autenticação — só o contorna.
import { supabase } from "@/integrations/supabase/client";

export const AUTH_BYPASS_ENABLED =
  import.meta.env.VITE_AUTH_BYPASS === "true";

const BYPASS_EMAIL = import.meta.env.VITE_AUTH_BYPASS_EMAIL as string | undefined;
const BYPASS_PASSWORD = import.meta.env.VITE_AUTH_BYPASS_PASSWORD as string | undefined;

let ensurePromise: Promise<void> | null = null;

export function ensureBypassSession(): Promise<void> {
  if (!AUTH_BYPASS_ENABLED) return Promise.resolve();
  if (typeof window === "undefined") return Promise.resolve();
  if (!BYPASS_EMAIL || !BYPASS_PASSWORD) return Promise.resolve();
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return;
    const { error } = await supabase.auth.signInWithPassword({
      email: BYPASS_EMAIL,
      password: BYPASS_PASSWORD,
    });
    if (error) {
      // Se falhar (ex: password mudada), fica em silêncio — o fluxo normal
      // de /entrar continua a funcionar para quem precisar.
      // eslint-disable-next-line no-console
      console.warn("[auth-bypass] sign-in automático falhou:", error.message);
      ensurePromise = null;
    }
  })();

  return ensurePromise;
}
