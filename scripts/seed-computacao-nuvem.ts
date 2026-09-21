/**
 * Semente idempotente do curso «Computação em Nuvem» (30 h, presencial).
 *
 * - Actualiza APENAS as lições já existentes que tenham conteúdo escrito em
 *   scripts/conteudo/computacao-nuvem-licoes.ts. As restantes ficam como
 *   estão, honestamente «por fornecer».
 * - NUNCA cria nem apaga lições: progresso_licoes e
 *   progresso_licoes_matricula têm CASCADE sobre licoes.
 * - Não toca no banco de questões, em turmas, presenças nem certificados.
 *
 * Correr: bun run scripts/seed-computacao-nuvem.ts
 * Exige SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
 */
import { createClient } from "@supabase/supabase-js";
import {
  LICOES,
  montarElearning,
  montarGuiao,
} from "./conteudo/computacao-nuvem-licoes";
import { MODULOS_PLANO } from "../src/lib/plano-computacao-nuvem";

const SLUG = "computacao-em-nuvem";

const url = process.env["SUPABASE_URL"];
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

function must<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data as T;
}

async function main() {
  const curso = must(
    await sb.from("cursos").select("id,titulo").eq("slug", SLUG).maybeSingle(),
  );
  if (!curso) throw new Error(`Curso ${SLUG} não encontrado`);

  const relacoes = must(
    await sb.from("curso_modulos").select("modulo_id,ordem").eq("curso_id", curso.id).order("ordem"),
  );

  const actualizadas: string[] = [];
  const semConteudo: string[] = [];

  for (const plano of MODULOS_PLANO) {
    if (plano.transversal) continue;
    const rel = relacoes.find((r) => r.ordem === plano.ordem);
    if (!rel) throw new Error(`Módulo de ordem ${plano.ordem} não está ligado ao curso`);

    for (const l of plano.licoes) {
      const conteudo = LICOES[l.chave];
      if (!conteudo) {
        semConteudo.push(l.chave);
        continue;
      }
      const existente = must(
        await sb
          .from("licoes")
          .select("id")
          .eq("modulo_id", rel.modulo_id)
          .eq("ordem", l.ordem)
          .maybeSingle(),
      );
      if (!existente) throw new Error(`Lição ${plano.chave}/${l.ordem} não existe — não é criada aqui`);

      must(
        await sb
          .from("licoes")
          .update({
            titulo: l.titulo,
            duracao: `${l.minutos} minutos`,
            duracao_minutos: l.minutos,
            conteudo_elearning: montarElearning(conteudo, l.minutos, l.tempos),
            guiao_formador: montarGuiao(conteudo, l.titulo, l.minutos, l.tempos),
            estado_conteudo: "disponivel",
            // Rascunho: a disponibilidade não equivale a aprovação.
            proposta_por_validar: true,
          })
          .eq("id", existente.id)
          .select("id"),
      );
      actualizadas.push(`${l.chave} (${existente.id})`);
    }
  }

  console.log(
    JSON.stringify(
      { curso: curso.titulo, actualizadas, porPreencher: semConteudo },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
