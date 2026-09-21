/**
 * Semente idempotente do BANCO DE QUESTÕES do curso «Computação em Nuvem».
 *
 * - Só escreve na tabela banco_questoes, e só para este curso.
 * - Todas as questões entram INACTIVAS (rascunho por validar pela Ologa/ATDI).
 *   O motor de exame só sorteia questões activas, pelo que nada fica operacional.
 * - Não cria nem altera lições, módulos, turmas, formandos, tentativas ou
 *   certificados. Não altera exame_configuracoes.
 * - Idempotente: a chave é (instrumento + enunciado). Repetir a execução
 *   actualiza, nunca duplica.
 *
 * Correr: bun run scripts/seed-questoes-computacao-nuvem.ts
 * Exige SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
 */
import { createClient } from "@supabase/supabase-js";
import { EXAME, PRE_POS, type QuestaoNuvem } from "./conteudo/computacao-nuvem-questoes";

const SLUG = "computacao-em-nuvem";
const AUTOR = "Equipa pedagógica Ologa (rascunho)";

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

function must<T>(res: { data: unknown; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data as T;
}

const TIPOLOGIA = {
  em: "escolha_multipla",
  vf: "verdadeiro_falso",
  cor: "correspondencia",
} as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;

/** Ordem do módulo no curso, por chave do plano. */
const ORDEM_MODULO: Record<QuestaoNuvem["m"], number> = {
  m1: 1,
  m2: 2,
  m3: 3,
  transversal: 4,
};

export function corpoQuestao(q: QuestaoNuvem) {
  switch (q.t) {
    case "em":
      if (!q.opts || q.ind === undefined) throw new Error(`Questão sem opções: ${q.e}`);
      if (q.ind < 0 || q.ind >= q.opts.length) throw new Error(`Gabarito fora do intervalo: ${q.e}`);
      return {
        conteudo: { opcoes: q.opts, ...(q.cen ? { cenario: true } : {}) },
        resposta: { indice: q.ind },
      };
    case "vf":
      if (q.val === undefined) throw new Error(`Questão sem valor: ${q.e}`);
      return { conteudo: q.cen ? { cenario: true } : {}, resposta: { valor: q.val } };
    case "cor":
      if (!q.pares || q.pares.length < 3) throw new Error(`Associação sem pares suficientes: ${q.e}`);
      return { conteudo: { pares: q.pares }, resposta: { pares: q.pares } };
  }
}

async function main() {
  const curso = must<{ id: string; titulo: string } | null>(
    await sb.from("cursos").select("id,titulo").eq("slug", SLUG).maybeSingle(),
  );
  if (!curso) throw new Error(`Curso ${SLUG} não encontrado`);

  const relacoes = must<{ modulo_id: string; ordem: number }[]>(
    await sb.from("curso_modulos").select("modulo_id,ordem").eq("curso_id", curso.id).order("ordem"),
  );
  const moduloPorChave: Record<string, string> = {};
  for (const [chave, ordem] of Object.entries(ORDEM_MODULO)) {
    const rel = relacoes.find((r) => r.ordem === ordem);
    if (!rel) throw new Error(`Módulo de ordem ${ordem} não está ligado ao curso`);
    moduloPorChave[chave] = rel.modulo_id;
  }

  const existentes = must<{ id: string; enunciado: string; instrumento: string }[]>(
    await sb.from("banco_questoes").select("id,enunciado,instrumento").eq("curso_id", curso.id),
  );
  const chaveExistente = new Set(existentes.map((q) => `${q.instrumento}::${q.enunciado}`));

  let inseridas = 0;
  let actualizadas = 0;

  const carregar = async (lista: QuestaoNuvem[], instrumento: "exame_final" | "pre_pos_teste") => {
    const vistos = new Set<string>();
    for (const q of lista) {
      if (vistos.has(q.e)) throw new Error(`Enunciado duplicado no ficheiro: ${q.e}`);
      vistos.add(q.e);
      const { conteudo, resposta } = corpoQuestao(q);
      const linha = {
        curso_id: curso.id,
        modulo_id: moduloPorChave[q.m]!,
        tipologia: TIPOLOGIA[q.t],
        dificuldade: DIFICULDADE[q.d],
        enunciado: q.e,
        conteudo,
        resposta,
        explicacao: q.exp,
        objectivo_associado: q.obj,
        instrumento,
        // Rascunho: inactiva, fora do sorteio, sem certificação.
        activa: false,
        autor_nome: AUTOR,
        actualizado_em: new Date().toISOString(),
      };
      if (chaveExistente.has(`${instrumento}::${q.e}`)) {
        must(
          await sb
            .from("banco_questoes")
            .update(linha)
            .eq("curso_id", curso.id)
            .eq("instrumento", instrumento)
            .eq("enunciado", q.e)
            .select("id"),
        );
        actualizadas++;
      } else {
        must(await sb.from("banco_questoes").insert(linha).select("id"));
        inseridas++;
      }
    }
  };

  await carregar(EXAME, "exame_final");
  await carregar(PRE_POS, "pre_pos_teste");

  const finais = must<{ instrumento: string; activa: boolean; tipologia: string; dificuldade: string }[]>(
    await sb
      .from("banco_questoes")
      .select("instrumento,activa,tipologia,dificuldade")
      .eq("curso_id", curso.id),
  );

  console.log(
    JSON.stringify(
      {
        curso: curso.titulo,
        inseridas,
        actualizadas,
        exameFicheiro: EXAME.length,
        prePosFicheiro: PRE_POS.length,
        naBase: {
          total: finais.length,
          exame: finais.filter((q) => q.instrumento === "exame_final").length,
          prePos: finais.filter((q) => q.instrumento === "pre_pos_teste").length,
          activas: finais.filter((q) => q.activa).length,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
