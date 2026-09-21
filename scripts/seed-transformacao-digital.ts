/**
 * Semente idempotente do curso «Princípios da Transformação Digital».
 *
 * - Actualiza as 12 lições existentes pelos seus identificadores actuais
 *   (encontradas por módulo + ordem). NUNCA apaga lições: progresso_licoes
 *   tem CASCADE sobre licoes.
 * - Ajusta os minutos por módulo e os minutos de avaliação e orientação.
 * - Preenche objectivos, público-alvo, pré-requisitos e materiais do curso.
 * - Carrega o banco do exame final (60) e o pré/pós-teste (10), ambos
 *   INACTIVOS (rascunho), sem duplicar em execuções repetidas.
 *
 * Correr: bun run scripts/seed-transformacao-digital.ts
 * Exige SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
 */
import { createClient } from "@supabase/supabase-js";
import { LICOES, montarElearning, montarGuiao } from "./conteudo/transformacao-digital-licoes";
import { EXAME, PRE_POS, type QuestaoSeed } from "./conteudo/transformacao-digital-questoes";
import {
  MINUTOS_AVALIACAO_ORIENTACAO,
  MODULOS_PLANO,
} from "../src/lib/plano-transformacao-digital";

const SLUG = "principios-transformacao-digital";
const AUTOR = "Equipa Ologa — proposta pedagógica por validar";

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

const TIPOLOGIA = {
  em: "escolha_multipla",
  vf: "verdadeiro_falso",
  cor: "correspondencia",
  ord: "ordenacao",
} as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;

function corpoQuestao(q: QuestaoSeed) {
  switch (q.t) {
    case "em":
      if (!q.opts || q.ind === undefined) throw new Error(`Questão sem opções: ${q.e}`);
      return { conteudo: { opcoes: q.opts }, resposta: { indice: q.ind } };
    case "vf":
      if (q.val === undefined) throw new Error(`Questão sem valor: ${q.e}`);
      return { conteudo: {}, resposta: { valor: q.val } };
    case "cor":
      if (!q.pares) throw new Error(`Questão sem pares: ${q.e}`);
      return { conteudo: { pares: q.pares }, resposta: { pares: q.pares } };
    case "ord":
      if (!q.seq) throw new Error(`Questão sem sequência: ${q.e}`);
      return { conteudo: { itens: q.seq }, resposta: { ordem: q.seq } };
  }
}

async function main() {
  const curso = must(
    await sb.from("cursos").select("id,titulo,carga_horaria").eq("slug", SLUG).maybeSingle(),
  );
  if (!curso) throw new Error(`Curso ${SLUG} não encontrado`);

  // ---- ficha do curso ----
  must(
    await sb
      .from("cursos")
      .update({
        objectivos:
          "No fim do curso, a pessoa formanda distingue digitalização de transformação digital, diagnostica a maturidade digital do seu serviço, mapeia e simplifica a jornada de um serviço público, aplica princípios de protecção de dados e segurança ao alcance do serviço, e produz um plano de implementação de uma página com responsáveis, prazos e indicadores de resultado. Proposta pedagógica — por validar pela Ologa/ATDI.",
        publico_alvo:
          "Quadros e técnicos da administração pública central, provincial, distrital e autárquica com responsabilidade sobre serviços prestados ao cidadão, incluindo pontos focais de transformação digital e pessoal de atendimento. Não exige funções técnicas de informática.",
        pre_requisitos:
          "Literacia digital básica: utilizar computador ou telemóvel, correio electrónico e navegador. Ligação à internet suficiente para sessão virtual, ou acesso ao conteúdo em modo texto quando a ligação for fraca. Não são exigidos conhecimentos de programação.",
        materiais:
          "Conteúdo de e-learning em texto com síntese em leitura fácil e leitura em voz alta pelo navegador; guião do formador por lição; grelha de diagnóstico de maturidade; modelo de mapa de jornada; grelha de simplificação; matriz de papéis; modelo de plano de uma página; grelha de indicadores. Não estão disponíveis vídeo, legendagem nem Língua de Sinais Moçambicana.",
        minutos_avaliacao_orientacao: MINUTOS_AVALIACAO_ORIENTACAO,
      })
      .eq("id", curso.id)
      .select("id"),
  );

  const relacoes = must(
    await sb
      .from("curso_modulos")
      .select("modulo_id,ordem")
      .eq("curso_id", curso.id)
      .order("ordem"),
  );

  let licoesActualizadas = 0;
  for (const plano of MODULOS_PLANO) {
    const rel = relacoes.find((r) => r.ordem === plano.ordem);
    if (!rel) throw new Error(`Módulo de ordem ${plano.ordem} não está ligado ao curso`);

    must(
      await sb
        .from("curso_modulos")
        .update({ carga_horaria_minutos: plano.minutos })
        .eq("curso_id", curso.id)
        .eq("modulo_id", rel.modulo_id)
        .select("modulo_id"),
    );

    // Descrição do conteúdo que existe mesmo. O módulo transversal é
    // partilhado por vários cursos e não é tocado aqui.
    if (plano.descricao) {
      must(
        await sb
          .from("modulos")
          .update({ descricao: plano.descricao })
          .eq("id", rel.modulo_id)
          .select("id"),
      );
    }



    for (const l of plano.licoes) {
      const existente = must(
        await sb
          .from("licoes")
          .select("id")
          .eq("modulo_id", rel.modulo_id)
          .eq("ordem", l.ordem)
          .maybeSingle(),
      );
      if (!existente) throw new Error(`Lição ${plano.chave}/${l.ordem} não existe — não é criada aqui`);
      const conteudo = LICOES[l.chave];
      if (!conteudo) throw new Error(`Falta conteúdo para ${l.chave}`);
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
            proposta_por_validar: true,
          })
          .eq("id", existente.id)
          .select("id"),
      );
      licoesActualizadas++;
    }
  }

  // ---- banco de questões ----
  const moduloPorChave: Record<string, string> = {};
  for (const plano of MODULOS_PLANO) {
    const rel = relacoes.find((r) => r.ordem === plano.ordem);
    if (rel) moduloPorChave[plano.chave] = rel.modulo_id;
  }

  const existentes = must(
    await sb.from("banco_questoes").select("id,enunciado,instrumento,estado_revisao").eq("curso_id", curso.id),
  );
  const estadoExistente = new Map(
    (existentes as { enunciado: string; instrumento: string; estado_revisao: string }[]).map(
      (q) => [`${q.instrumento}::${q.enunciado}`, q.estado_revisao] as const,
    ),
  );
  // Versões retiradas não são reactivadas, reescritas nem contadas.
  const VERSAO = process.env["VERSAO_BANCO"] ?? "v1";
  let ignoradasRetiradas = 0;

  let inseridas = 0;
  let actualizadas = 0;
  const carregar = async (lista: QuestaoSeed[], instrumento: "exame_final" | "pre_pos_teste") => {
    const vistos = new Set<string>();
    for (const q of lista) {
      if (vistos.has(q.e)) throw new Error(`Enunciado duplicado no ficheiro: ${q.e}`);
      vistos.add(q.e);
      const estado = estadoExistente.get(`${instrumento}::${q.e}`);
      if (estado === "retirada") {
        ignoradasRetiradas++;
        continue;
      }
      const { conteudo, resposta } = corpoQuestao(q);
      const linha = {
        curso_id: curso.id,
        modulo_id: moduloPorChave[q.m] ?? null,
        tipologia: TIPOLOGIA[q.t],
        dificuldade: DIFICULDADE[q.d],
        enunciado: q.e,
        conteudo,
        resposta,
        explicacao: q.exp,
        objectivo_associado: q.obj,
        instrumento,
        // Rascunho: não activa certificação oficial enquanto não for validado.
        activa: false,
        autor_nome: AUTOR,
        versao: VERSAO,
        estado_revisao: "em_uso",
        actualizado_em: new Date().toISOString(),
      };
      if (estado) {
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

  console.log(
    JSON.stringify(
      {
        curso: curso.titulo,
        licoesActualizadas,
        questoesInseridas: inseridas,
        questoesActualizadas: actualizadas,
        questoesIgnoradasPorEstaremRetiradas: ignoradasRetiradas,
        versao: VERSAO,
        exame: EXAME.length,
        prePos: PRE_POS.length,
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
