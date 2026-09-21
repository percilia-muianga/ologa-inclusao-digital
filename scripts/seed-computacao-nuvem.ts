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
  DESCRICOES_MODULO,
} from "./conteudo/computacao-nuvem-licoes";
import {
  MODULOS_PLANO,
  MINUTOS_AVALIACAO_ORIENTACAO,
  FICHA_CURSO,
} from "../src/lib/plano-computacao-nuvem";

/** «8 h 40 min», «9 horas» — sem arredondar para horas inteiras. */
function textoDuracao(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h} ${h === 1 ? "hora" : "horas"}`;
  return `${h} h ${m} min`;
}

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
    await sb.from("cursos").select("id,titulo,minutos_avaliacao_orientacao").eq("slug", SLUG).maybeSingle(),
  );
  if (!curso) throw new Error(`Curso ${SLUG} não encontrado`);

  const relacoes = must(
    await sb.from("curso_modulos").select("modulo_id,ordem,carga_horaria_minutos").eq("curso_id", curso.id).order("ordem"),
  );

  // Reconciliação dos metadados de duração com o plano (fonte única).
  // A carga do CURSO (30 h) é dos TdR; a distribuição por módulo é proposta.
  const tempos: string[] = [];
  for (const plano of MODULOS_PLANO) {
    const rel = relacoes.find((r) => r.ordem === plano.ordem);
    if (!rel) throw new Error(`Módulo de ordem ${plano.ordem} não está ligado ao curso`);
    if (rel.carga_horaria_minutos !== plano.minutos) {
      must(
        await sb
          .from("curso_modulos")
          .update({ carga_horaria_minutos: plano.minutos })
          .eq("curso_id", curso.id)
          .eq("modulo_id", rel.modulo_id)
          .select("modulo_id"),
      );
      tempos.push(`${plano.chave}: ${rel.carga_horaria_minutos} -> ${plano.minutos} min`);
    }
    // O módulo transversal é partilhado por vários cursos: não se altera o
    // texto de duração do módulo em si, apenas a carga nesta relação.
    if (!plano.transversal) {
      must(
        await sb
          .from("modulos")
          .update({ duracao: textoDuracao(plano.minutos) })
          .eq("id", rel.modulo_id)
          .select("id"),
      );
    }
  }
  if (curso.minutos_avaliacao_orientacao !== MINUTOS_AVALIACAO_ORIENTACAO) {
    must(
      await sb
        .from("cursos")
        .update({ minutos_avaliacao_orientacao: MINUTOS_AVALIACAO_ORIENTACAO })
        .eq("id", curso.id)
        .select("id"),
    );
    tempos.push(
      `avaliação/orientação: ${curso.minutos_avaliacao_orientacao} -> ${MINUTOS_AVALIACAO_ORIENTACAO} min`,
    );
  }

  const actualizadas: string[] = [];
  const semConteudo: string[] = [];
  const descricoes: string[] = [];

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

    // Descrição do módulo só muda quando TODAS as suas lições estão escritas.
    const todasEscritas = plano.licoes.every((l) => LICOES[l.chave]);
    const descricao = DESCRICOES_MODULO[plano.chave];
    if (todasEscritas && descricao) {
      must(
        await sb
          .from("modulos")
          .update({ descricao })
          .eq("id", rel.modulo_id)
          .select("id"),
      );
      descricoes.push(plano.chave);
    }
  }

  console.log(
    JSON.stringify(
      { curso: curso.titulo, tempos, actualizadas, descricoesActualizadas: descricoes, porPreencher: semConteudo },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
