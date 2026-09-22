/**
 * Integração editorial RESTRITA às quatro lições do módulo 2 do curso
 * «Introdução à Inteligência Artificial».
 *
 * - Actualiza APENAS as quatro lições de ordem 1 a 4 do módulo de ordem 2
 *   desse curso, e a descrição desse mesmo módulo.
 * - NÃO cria nem apaga lições ou módulos; NÃO toca no módulo 1, no módulo
 *   transversal, noutros cursos, no banco de questões, em turmas, presenças,
 *   exames, certificados, perfis ou permissões.
 * - Não é o seed do curso: o seed (scripts/seed-inteligencia-artificial.ts)
 *   reescreveria também o módulo 1 e a ficha do curso, e continua por correr.
 *
 * Correr: bun run scripts/integrar-m2-inteligencia-artificial.ts
 */
import { createClient } from "@supabase/supabase-js";
import { LICOES, montarElearning, montarGuiao, DESCRICOES_MODULO } from "./conteudo/inteligencia-artificial-licoes";
import { MODULOS_PLANO } from "../src/lib/plano-inteligencia-artificial";

const SLUG = "introducao-inteligencia-artificial";
const ORDEM_MODULO = 2;

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

function must<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data as T;
}

async function main() {
  const curso = must(await sb.from("cursos").select("id").eq("slug", SLUG).maybeSingle());
  if (!curso) throw new Error(`Curso ${SLUG} não encontrado`);

  const rel = must(
    await sb
      .from("curso_modulos")
      .select("modulo_id,carga_horaria_minutos")
      .eq("curso_id", curso.id)
      .eq("ordem", ORDEM_MODULO)
      .maybeSingle(),
  );
  if (!rel) throw new Error("Módulo 2 não está ligado ao curso");

  const plano = MODULOS_PLANO.find((m) => m.ordem === ORDEM_MODULO)!;
  const actualizadas: string[] = [];

  for (const l of plano.licoes) {
    const conteudo = LICOES[l.chave];
    if (!conteudo) throw new Error(`Sem conteúdo escrito para ${l.chave}`);
    const existente = must(
      await sb
        .from("licoes")
        .select("id")
        .eq("modulo_id", rel.modulo_id)
        .eq("ordem", l.ordem)
        .maybeSingle(),
    );
    if (!existente) throw new Error(`Lição ${l.chave} não existe — não é criada aqui`);
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
          proposta_por_validar: false,
        })
        .eq("id", existente.id)
        .select("id"),
    );
    actualizadas.push(`${l.chave} (${existente.id})`);
  }

  const descricao = DESCRICOES_MODULO["m2"];
  if (descricao) must(await sb.from("modulos").update({ descricao }).eq("id", rel.modulo_id).select("id"));

  console.log(JSON.stringify({ actualizadas, descricaoModulo2: Boolean(descricao) }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
