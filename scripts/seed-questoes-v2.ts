/**
 * Semente idempotente da VERSÃO 2 dos bancos de questões dos cursos
 * «Computação em Nuvem» e «Princípios da Transformação Digital».
 *
 * Contexto: a versão 1 esteve acessível sem sessão e foi retirada. As linhas
 * retiradas ficam guardadas, fora do sorteio e impossíveis de activar. Esta
 * semente escreve conteúdo NOVO, com identificadores novos, na versão v2.
 *
 * Garantias:
 * - Só escreve na tabela banco_questoes, e só para estes dois cursos.
 * - Todas as questões entram INACTIVAS (rascunho por validar pela Ologa/ATDI).
 * - Nunca reescreve nem reactiva uma questão retirada: se a chave existir com
 *   estado «retirada», a linha é ignorada e contada em separado.
 * - Idempotente: a chave é (versao + instrumento + enunciado). Repetir a
 *   execução actualiza, nunca duplica.
 * - Não cria nem altera lições, módulos, turmas, formandos, tentativas,
 *   certificados nem exame_configuracoes.
 *
 * Correr: bun run scripts/seed-questoes-v2.ts
 * Exige SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
 */
import { createClient } from "@supabase/supabase-js";
import { EXAME_V2, PRE_POS_V2, type QuestaoNuvemV2 } from "./conteudo/computacao-nuvem-questoes-v2";
import {
  EXAME_TD_V2,
  PRE_POS_TD_V2,
  type QuestaoTdV2,
} from "./conteudo/transformacao-digital-questoes-v2";

const VERSAO = "v2";
const AUTOR = "Equipa pedagógica Ologa (rascunho v2)";

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
  ord: "ordenacao",
} as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;

type Questao = QuestaoNuvemV2 | QuestaoTdV2;
type QuestaoComOrdenacao = Questao & { seq?: string[]; cen?: boolean };

export function corpoQuestaoV2(q: QuestaoComOrdenacao) {
  const cen = q.cen ? { cenario: true } : {};
  switch (q.t) {
    case "em":
      if (!q.opts || q.ind === undefined) throw new Error(`Questão sem opções: ${q.e}`);
      if (q.ind < 0 || q.ind >= q.opts.length) throw new Error(`Gabarito fora do intervalo: ${q.e}`);
      return { conteudo: { opcoes: q.opts, ...cen }, resposta: { indice: q.ind } };
    case "vf":
      if (q.val === undefined) throw new Error(`Questão sem valor: ${q.e}`);
      return { conteudo: { ...cen }, resposta: { valor: q.val } };
    case "cor":
      if (!q.pares || q.pares.length < 3) throw new Error(`Associação sem pares suficientes: ${q.e}`);
      return { conteudo: { pares: q.pares, ...cen }, resposta: { pares: q.pares } };
    case "ord":
      if (!q.seq || q.seq.length < 3) throw new Error(`Ordenação sem itens suficientes: ${q.e}`);
      return { conteudo: { itens: q.seq, ...cen }, resposta: { ordem: q.seq } };
    default:
      throw new Error(`Tipologia desconhecida: ${q.e}`);
  }
}

type Alvo = {
  slug: string;
  ordemPorChave: Record<string, number>;
  exame: QuestaoComOrdenacao[];
  prePos: QuestaoComOrdenacao[];
};

const ALVOS: Alvo[] = [
  {
    slug: "computacao-em-nuvem",
    ordemPorChave: { m1: 1, m2: 2, m3: 3, transversal: 4 },
    exame: EXAME_V2 as QuestaoComOrdenacao[],
    prePos: PRE_POS_V2 as QuestaoComOrdenacao[],
  },
  {
    slug: "principios-transformacao-digital",
    ordemPorChave: { m1: 1, m2: 2, m3: 3 },
    exame: EXAME_TD_V2 as QuestaoComOrdenacao[],
    prePos: PRE_POS_TD_V2 as QuestaoComOrdenacao[],
  },
];

async function semearCurso(alvo: Alvo) {
  const curso = must<{ id: string; titulo: string } | null>(
    await sb.from("cursos").select("id,titulo").eq("slug", alvo.slug).maybeSingle(),
  );
  if (!curso) throw new Error(`Curso ${alvo.slug} não encontrado`);

  const relacoes = must<{ modulo_id: string; ordem: number }[]>(
    await sb.from("curso_modulos").select("modulo_id,ordem").eq("curso_id", curso.id).order("ordem"),
  );
  const moduloPorChave: Record<string, string> = {};
  for (const [chave, ordem] of Object.entries(alvo.ordemPorChave)) {
    const rel = relacoes.find((r) => r.ordem === ordem);
    if (!rel) throw new Error(`Módulo de ordem ${ordem} não está ligado ao curso ${alvo.slug}`);
    moduloPorChave[chave] = rel.modulo_id;
  }

  const existentes = must<
    { enunciado: string; instrumento: string; estado_revisao: string; versao: string }[]
  >(
    await sb
      .from("banco_questoes")
      .select("enunciado,instrumento,estado_revisao,versao")
      .eq("curso_id", curso.id),
  );
  const estadoPorChave = new Map(
    existentes.map((q) => [`${q.versao}::${q.instrumento}::${q.enunciado}`, q.estado_revisao] as const),
  );
  const retiradasComMesmoTexto = new Set(
    existentes
      .filter((q) => q.estado_revisao === "retirada")
      .map((q) => `${q.instrumento}::${q.enunciado}`),
  );

  let inseridas = 0;
  let actualizadas = 0;
  let ignoradasRetiradas = 0;

  const carregar = async (lista: QuestaoComOrdenacao[], instrumento: "exame_final" | "pre_pos_teste") => {
    const vistos = new Set<string>();
    for (const q of lista) {
      if (vistos.has(q.e)) throw new Error(`Enunciado duplicado no ficheiro: ${q.e}`);
      vistos.add(q.e);

      // Nunca reescrever nem ressuscitar texto que foi retirado.
      if (retiradasComMesmoTexto.has(`${instrumento}::${q.e}`)) {
        ignoradasRetiradas++;
        continue;
      }
      const estado = estadoPorChave.get(`${VERSAO}::${instrumento}::${q.e}`);
      if (estado === "retirada") {
        ignoradasRetiradas++;
        continue;
      }

      const { conteudo, resposta } = corpoQuestaoV2(q);
      const linha = {
        curso_id: curso.id,
        modulo_id: moduloPorChave[q.m]!,
        tipologia: TIPOLOGIA[q.t as keyof typeof TIPOLOGIA],
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
        versao: VERSAO,
        estado_revisao: "em_uso",
        cenario: Boolean(q.cen),
        actualizado_em: new Date().toISOString(),
      };

      if (estado) {
        must(
          await sb
            .from("banco_questoes")
            .update(linha)
            .eq("curso_id", curso.id)
            .eq("instrumento", instrumento)
            .eq("versao", VERSAO)
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

  await carregar(alvo.exame, "exame_final");
  await carregar(alvo.prePos, "pre_pos_teste");

  const finais = must<
    { instrumento: string; activa: boolean; estado_revisao: string; versao: string }[]
  >(
    await sb
      .from("banco_questoes")
      .select("instrumento,activa,estado_revisao,versao")
      .eq("curso_id", curso.id),
  );

  return {
    curso: curso.titulo,
    inseridas,
    actualizadas,
    ignoradasPorEstaremRetiradas: ignoradasRetiradas,
    naBase: {
      total: finais.length,
      activas: finais.filter((q) => q.activa).length,
      retiradas: finais.filter((q) => q.estado_revisao === "retirada").length,
      utilizaveis: finais.filter((q) => q.estado_revisao !== "retirada").length,
      v2Exame: finais.filter(
        (q) => q.versao === VERSAO && q.instrumento === "exame_final" && q.estado_revisao !== "retirada",
      ).length,
      v2Diagnostico: finais.filter(
        (q) => q.versao === VERSAO && q.instrumento === "pre_pos_teste" && q.estado_revisao !== "retirada",
      ).length,
    },
  };
}

async function main() {
  const resultado = [];
  for (const alvo of ALVOS) resultado.push(await semearCurso(alvo));
  console.log(JSON.stringify({ versao: VERSAO, cursos: resultado }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
