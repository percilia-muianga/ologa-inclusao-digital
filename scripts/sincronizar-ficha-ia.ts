/**
 * Sincronização RESTRITA de DOIS campos da ficha do curso
 * «Introdução à Inteligência Artificial»: objectivos e materiais.
 *
 * - Actualiza APENAS as colunas `objectivos` e `materiais` da linha desse curso.
 * - NÃO toca em carga horária, módulos, lições, questões, exames, certificados,
 *   perfis ou permissões. Não é um seed.
 *
 * Correr: bun run scripts/sincronizar-ficha-ia.ts
 */
import { createClient } from "@supabase/supabase-js";
import { FICHA_CURSO } from "../src/lib/plano-inteligencia-artificial";

const SLUG = "introducao-inteligencia-artificial";

const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
if (!url || !key) throw new Error("Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

const fetchShim = (input: RequestInfo | URL, init?: RequestInit) => {
  const h = new Headers(init?.headers);
  if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
  h.set("apikey", key);
  return fetch(input, { ...init, headers: h });
};
const sb = createClient(url, key, {
  auth: { persistSession: false },
  global: { fetch: fetchShim as typeof fetch },
});

const objectivos = FICHA_CURSO.objectivos;
const materiais = `${FICHA_CURSO.materiais} ${FICHA_CURSO.nota}`;

const { data, error } = await sb
  .from("cursos")
  .update({ objectivos, materiais })
  .eq("slug", SLUG)
  .select("id, slug");
if (error) throw error;
if (!data || data.length !== 1) throw new Error(`Esperava 1 linha, obtive ${data?.length ?? 0}`);
console.log("Ficha sincronizada (objectivos, materiais):", data[0]);
