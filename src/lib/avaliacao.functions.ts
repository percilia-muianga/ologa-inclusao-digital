import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { clienteDeEscritaGestao } from "@/lib/guardas";
import { avaliarCondicoesCertificacao } from "@/lib/certificacao.server";
import { sortearExame, type QuestaoSorteavel } from "@/lib/sorteio-exame";
import { QUOTAS_POR_CURSO, quotasDificuldade } from "@/lib/quotas-exame";

const admin = async () =>
  (await import("@/integrations/supabase/client.server")).supabaseAdmin;

export const TIPOLOGIAS = [
  { valor: "escolha_multipla", etiqueta: "Escolha múltipla" },
  { valor: "verdadeiro_falso", etiqueta: "Verdadeiro ou falso" },
  { valor: "resposta_curta", etiqueta: "Resposta curta" },
  { valor: "correspondencia", etiqueta: "Correspondência" },
  { valor: "ordenacao", etiqueta: "Ordenação" },
] as const;

export const DIFICULDADES = [
  { valor: "facil", etiqueta: "Fácil" },
  { valor: "media", etiqueta: "Média" },
  { valor: "dificil", etiqueta: "Difícil" },
] as const;

const tipologiaEnum = z.enum([
  "escolha_multipla",
  "verdadeiro_falso",
  "resposta_curta",
  "correspondencia",
  "ordenacao",
]);
const dificuldadeEnum = z.enum(["facil", "media", "dificil"]);

type Tipologia = z.infer<typeof tipologiaEnum>;
type Dificuldade = z.infer<typeof dificuldadeEnum>;

const CONFIG_PADRAO = {
  numero_questoes: 20,
  minutos: 60,
  pct_facil: 40,
  pct_media: 40,
  pct_dificil: 20,
  nota_minima_pct: 60,
  assiduidade_minima_pct: 80,
  prazo_dias: 30,
  tentativas_max: 2,
};

function baralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function normalizar(texto: string) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function gerarCodigo() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
}

// ---------- referências e panorama do banco ----------

export const referenciasBanco = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
  await exigirGestaoBanco(context as unknown as ContextoAutenticado, "ler");
  const s = await admin();
  const [cursosRes, relacoesRes, modulosRes] = await Promise.all([
    s.from("cursos").select("id,slug,titulo,ordem").order("ordem"),
    s.from("curso_modulos").select("curso_id,modulo_id,ordem").order("ordem"),
    s.from("modulos").select("id,titulo,ordem").order("ordem"),
  ]);
  if (cursosRes.error) throw cursosRes.error;
  if (relacoesRes.error) throw relacoesRes.error;
  if (modulosRes.error) throw modulosRes.error;
  const modulos = modulosRes.data ?? [];
  return {
    cursos: cursosRes.data ?? [],
    modulosPorCurso: (relacoesRes.data ?? []).reduce<
      Record<string, { id: string; titulo: string }[]>
    >((acc, r) => {
      const m = modulos.find((x) => x.id === r.modulo_id);
      if (!m) return acc;
      (acc[r.curso_id] ??= []).push({ id: m.id, titulo: m.titulo });
      return acc;
    }, {}),
  };
});

export const panoramaBanco = createServerFn({ method: "GET" }).handler(async () => {
  const s = await admin();
  const [cursosRes, questoesRes, configRes, relacoesRes, modulosRes] = await Promise.all([
    s.from("cursos").select("id,slug,titulo,ordem").order("ordem"),
    // Os dois instrumentos: o exame final certificador e o pré/pós-teste,
    // contados em separado. O rácio do TdR só conta questões activas.
    s
      .from("banco_questoes")
      .select("curso_id,modulo_id,activa,dificuldade,instrumento,estado_revisao,versao"),
    s.from("exame_configuracoes").select("*"),
    s.from("curso_modulos").select("curso_id,modulo_id,ordem").order("ordem"),
    s.from("modulos").select("id,titulo"),
  ]);
  if (cursosRes.error) throw cursosRes.error;
  if (questoesRes.error) throw questoesRes.error;
  if (configRes.error) throw configRes.error;
  if (relacoesRes.error) throw relacoesRes.error;
  if (modulosRes.error) throw modulosRes.error;

  const tudo = questoesRes.data ?? [];
  // Questões retiradas (versão exposta ou substituída) continuam na base, mas
  // saem do sorteio, do rácio de prontidão e das contagens utilizáveis.
  const emUso = (q: { estado_revisao: string }) => q.estado_revisao !== "retirada";
  const todas = tudo.filter(emUso);
  const retiradas = tudo.filter((q) => !emUso(q));
  const questoes = todas.filter((q) => q.instrumento === "exame_final");
  const diagnostico = todas.filter((q) => q.instrumento === "pre_pos_teste");
  const modulos = modulosRes.data ?? [];

  const cursos = (cursosRes.data ?? []).map((curso) => {
    const cfg = (configRes.data ?? []).find((c) => c.curso_id === curso.id) ?? {
      ...CONFIG_PADRAO,
      curso_id: curso.id,
    };
    const doCurso = questoes.filter((q) => q.curso_id === curso.id);
    const activas = doCurso.filter((q) => q.activa).length;
    const rascunhos = doCurso.length - activas;
    const diagCurso = diagnostico.filter((q) => q.curso_id === curso.id);
    const retiradasCurso = retiradas.filter((q) => q.curso_id === curso.id);
    const diagActivas = diagCurso.filter((q) => q.activa).length;
    const necessarias = cfg.numero_questoes;
    const minimoTdR = necessarias * 3;
    const porModulo = (relacoesRes.data ?? [])
      .filter((r) => r.curso_id === curso.id)
      .map((r) => {
        const doModulo = doCurso.filter((q) => q.modulo_id === r.modulo_id);
        const activasModulo = doModulo.filter((q) => q.activa).length;
        return {
          moduloId: r.modulo_id,
          titulo: modulos.find((m) => m.id === r.modulo_id)?.titulo ?? "Módulo",
          activas: activasModulo,
          rascunhos: doModulo.length - activasModulo,
          total: doModulo.length,
        };
      });
    return {
      id: curso.id,
      slug: curso.slug,
      titulo: curso.titulo,
      activas,
      // Nome antigo mantido para não quebrar quem já o lê.
      inactivas: rascunhos,
      rascunhos,
      total: doCurso.length,
      retiradas: {
        total: retiradasCurso.length,
        exame: retiradasCurso.filter((q) => q.instrumento === "exame_final").length,
        diagnostico: retiradasCurso.filter((q) => q.instrumento === "pre_pos_teste").length,
        versoes: [...new Set(retiradasCurso.map((q) => q.versao))].sort(),
      },
      diagnostico: {
        total: diagCurso.length,
        activas: diagActivas,
        rascunhos: diagCurso.length - diagActivas,
      },
      necessarias,
      minimoTdR,
      emFalta: Math.max(0, minimoTdR - activas),
      cumpreTriplo: activas >= minimoTdR,
      racio: necessarias > 0 ? activas / necessarias : 0,
      porDificuldade: {
        facil: doCurso.filter((q) => q.activa && q.dificuldade === "facil").length,
        media: doCurso.filter((q) => q.activa && q.dificuldade === "media").length,
        dificil: doCurso.filter((q) => q.activa && q.dificuldade === "dificil").length,
      },
      porModulo,
      configuracao: {
        numeroQuestoes: cfg.numero_questoes,
        minutos: cfg.minutos,
        pctFacil: cfg.pct_facil,
        pctMedia: cfg.pct_media,
        pctDificil: cfg.pct_dificil,
        notaMinimaPct: cfg.nota_minima_pct,
        assiduidadeMinimaPct: cfg.assiduidade_minima_pct,
        prazoDias: cfg.prazo_dias,
        tentativasMax: cfg.tentativas_max,
      },
    };
  });

  return {
    cursos,
    totalActivas: questoes.filter((q) => q.activa).length,
    totalRascunhos: questoes.filter((q) => !q.activa).length,
    totalEscritas: questoes.length,
    totalDiagnostico: diagnostico.length,
    totalDiagnosticoActivas: diagnostico.filter((q) => q.activa).length,
    totalRetiradas: retiradas.length,
    totalEmFalta: cursos.reduce((soma, c) => soma + c.emFalta, 0),
  };
});

// ---------- autorização da gestão do banco ----------
//
// O banco de questões contém gabaritos e explicações. Qualquer leitura ou
// escrita destes dados exige sessão real, validada no servidor ANTES de
// qualquer consulta. O papel nunca é aceite do cliente: é lido da base de
// dados com o cliente autenticado (RLS como o próprio utilizador).

type ContextoAutenticado = {
  supabase: {
    from: (t: string) => any;
  };
  userId: string;
};

const PAPEIS_LEITURA_BANCO = ["admin_atdi", "coordenador_nacional", "auditor_atdi"];
const PAPEIS_ESCRITA_BANCO = ["admin_atdi", "coordenador_nacional"];

async function papeisDoUtilizador(context: ContextoAutenticado) {
  const [papeisRes, perfilRes] = await Promise.all([
    context.supabase
      .from("utilizador_papeis")
      .select("papel")
      .eq("utilizador_id", context.userId),
    context.supabase.from("perfis").select("papel").eq("id", context.userId).maybeSingle(),
  ]);
  const papeis = ((papeisRes.data ?? []) as { papel: string }[]).map((p) => p.papel);
  const perfil = (perfilRes.data as { papel?: string } | null)?.papel ?? null;
  return { papeis, perfil };
}

/** Regra pura de autorização, separada para poder ser testada isoladamente. */
export function avaliarPermissoesBanco(papeis: string[], perfil: string | null) {
  const administradorOloga = perfil === "admin_ologa";
  return {
    podeLer: administradorOloga || papeis.some((p) => PAPEIS_LEITURA_BANCO.includes(p)),
    podeEscrever: administradorOloga || papeis.some((p) => PAPEIS_ESCRITA_BANCO.includes(p)),
  };
}

/** Devolve o que o utilizador autenticado pode fazer no banco de questões. */
async function permissoesBanco(context: ContextoAutenticado) {
  const { papeis, perfil } = await papeisDoUtilizador(context);
  return avaliarPermissoesBanco(papeis, perfil);
}

/** Barra a chamada antes de tocar na base com privilégios elevados. */
async function exigirGestaoBanco(context: ContextoAutenticado, modo: "ler" | "escrever") {
  const p = await permissoesBanco(context);
  if (modo === "ler" ? p.podeLer : p.podeEscrever) return p;
  throw new Error("SEM_PERMISSAO_BANCO");
}

/** Consulta de permissão para a interface. Exige sessão; anónimo recebe 401. */
export const permissaoGestaoBanco = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => permissoesBanco(context as unknown as ContextoAutenticado));

// ---------- gestão do banco ----------

export const listarQuestoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        cursoId: z.string().uuid().nullable().optional(),
        moduloId: z.string().uuid().nullable().optional(),
        tipologia: tipologiaEnum.nullable().optional(),
        dificuldade: dificuldadeEnum.nullable().optional(),
        estado: z.enum(["todas", "activas", "inactivas"]).default("todas"),
        revisao: z.enum(["utilizaveis", "retiradas", "todas"]).default("utilizaveis"),
        // Instrumentos distintos: exame final certificador e pré/pós-teste.
        instrumento: z.enum(["exame_final", "pre_pos_teste"]).default("exame_final"),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await exigirGestaoBanco(context as unknown as ContextoAutenticado, "ler");
    const s = await admin();
    let q = s
      .from("banco_questoes")
      .select(
        "id,curso_id,modulo_id,tipologia,dificuldade,enunciado,conteudo,resposta,explicacao,activa,autor_nome,criado_em,instrumento,objectivo_associado,estado_revisao,versao,retirada_em,retirada_motivo,cenario",
      )
      .eq("instrumento", data.instrumento)
      .order("criado_em", { ascending: false });
    if (data.cursoId) q = q.eq("curso_id", data.cursoId);
    if (data.moduloId) q = q.eq("modulo_id", data.moduloId);
    if (data.tipologia) q = q.eq("tipologia", data.tipologia);
    if (data.dificuldade) q = q.eq("dificuldade", data.dificuldade);
    if (data.estado === "activas") q = q.eq("activa", true);
    if (data.estado === "inactivas") q = q.eq("activa", false);
    if (data.revisao === "utilizaveis") q = q.eq("estado_revisao", "em_uso");
    if (data.revisao === "retiradas") q = q.eq("estado_revisao", "retirada");
    const { data: linhas, error } = await q;
    if (error) throw error;

    const ids = (linhas ?? []).map((l) => l.id);
    const usadas = new Set<string>();
    if (ids.length) {
      const { data: uso } = await s
        .from("exame_tentativa_questoes")
        .select("questao_id")
        .in("questao_id", ids);
      for (const u of uso ?? []) usadas.add(u.questao_id);
    }
    return (linhas ?? []).map((l) => ({ ...l, jaUsada: usadas.has(l.id) }));
  });

const questaoSchema = z.object({
  cursoId: z.string().uuid(),
  moduloId: z.string().uuid().nullable().optional(),
  tipologia: tipologiaEnum,
  dificuldade: dificuldadeEnum,
  enunciado: z.string().trim().min(3).max(2000),
  explicacao: z.string().trim().max(2000).default(""),
  autorNome: z.string().trim().max(160).default(""),
  activa: z.boolean().default(true),
  // conteúdo por tipologia
  opcoes: z.array(z.string().trim().min(1)).max(10).optional(),
  indiceCorrecto: z.number().int().min(0).optional(),
  valorVerdadeiro: z.boolean().optional(),
  respostasAceites: z.array(z.string().trim().min(1)).max(10).optional(),
  pares: z
    .array(z.object({ esquerda: z.string().trim().min(1), direita: z.string().trim().min(1) }))
    .max(10)
    .optional(),
  sequencia: z.array(z.string().trim().min(1)).max(10).optional(),
});

function montarConteudo(d: z.infer<typeof questaoSchema>) {
  switch (d.tipologia) {
    case "escolha_multipla": {
      if (!d.opcoes || d.opcoes.length < 2) throw new Error("OPCOES_INSUFICIENTES");
      if (d.indiceCorrecto === undefined || d.indiceCorrecto >= d.opcoes.length)
        throw new Error("RESPOSTA_INVALIDA");
      return { conteudo: { opcoes: d.opcoes }, resposta: { indice: d.indiceCorrecto } };
    }
    case "verdadeiro_falso": {
      if (d.valorVerdadeiro === undefined) throw new Error("RESPOSTA_INVALIDA");
      return { conteudo: {}, resposta: { valor: d.valorVerdadeiro } };
    }
    case "resposta_curta": {
      if (!d.respostasAceites || d.respostasAceites.length === 0)
        throw new Error("RESPOSTA_INVALIDA");
      return { conteudo: {}, resposta: { aceites: d.respostasAceites } };
    }
    case "correspondencia": {
      if (!d.pares || d.pares.length < 2) throw new Error("PARES_INSUFICIENTES");
      return { conteudo: { pares: d.pares }, resposta: { pares: d.pares } };
    }
    case "ordenacao": {
      if (!d.sequencia || d.sequencia.length < 2) throw new Error("SEQUENCIA_INSUFICIENTE");
      return { conteudo: { itens: d.sequencia }, resposta: { ordem: d.sequencia } };
    }
  }
}

export const criarQuestao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => questaoSchema.parse(i))
  .handler(async ({ data, context }) => {
    await exigirGestaoBanco(context as unknown as ContextoAutenticado, "escrever");
    const s = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { conteudo, resposta } = montarConteudo(data);
    const { data: nova, error } = await s
      .from("banco_questoes")
      .insert({
        curso_id: data.cursoId,
        modulo_id: data.moduloId ?? null,
        tipologia: data.tipologia,
        dificuldade: data.dificuldade,
        enunciado: data.enunciado,
        conteudo,
        resposta,
        explicacao: data.explicacao,
        autor_nome: data.autorNome,
        activa: data.activa,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: nova.id };
  });

export const actualizarQuestao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    questaoSchema.extend({ id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await exigirGestaoBanco(context as unknown as ContextoAutenticado, "escrever");
    const s = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { conteudo, resposta } = montarConteudo(data);
    const { error } = await s
      .from("banco_questoes")
      .update({
        curso_id: data.cursoId,
        modulo_id: data.moduloId ?? null,
        tipologia: data.tipologia,
        dificuldade: data.dificuldade,
        enunciado: data.enunciado,
        conteudo,
        resposta,
        explicacao: data.explicacao,
        autor_nome: data.autorNome,
        activa: data.activa,
        actualizado_em: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const definirEstadoQuestao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string().uuid(), activa: z.boolean() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await exigirGestaoBanco(context as unknown as ContextoAutenticado, "escrever");
    const s = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    // Uma questão retirada nunca volta ao sorteio: a activação é recusada no
    // servidor (e também por travão na própria base de dados).
    if (data.activa) {
      const { data: actual } = await s
        .from("banco_questoes")
        .select("estado_revisao")
        .eq("id", data.id)
        .maybeSingle();
      if (actual?.estado_revisao === "retirada") throw new Error("QUESTAO_RETIRADA");
    }
    const { error } = await s
      .from("banco_questoes")
      .update({ activa: data.activa, actualizado_em: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/**
 * Retira definitivamente do sorteio uma versão do banco de um curso. Nada é
 * apagado: enunciados, gabaritos e explicações ficam na base, e as tentativas
 * históricas não são tocadas. É idempotente: repetir não muda nada.
 */
export const retirarVersaoBanco = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        cursoId: z.string().uuid(),
        versao: z.string().min(1),
        motivo: z.string().min(5),
        instrumentos: z
          .array(z.enum(["exame_final", "pre_pos_teste"]))
          .min(1)
          .default(["exame_final", "pre_pos_teste"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await exigirGestaoBanco(context as unknown as ContextoAutenticado, "escrever");
    const s = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { data: linhas, error } = await s
      .from("banco_questoes")
      .update({
        estado_revisao: "retirada",
        activa: false,
        retirada_em: new Date().toISOString(),
        retirada_motivo: data.motivo,
        actualizado_em: new Date().toISOString(),
      })
      .eq("curso_id", data.cursoId)
      .eq("versao", data.versao)
      .eq("estado_revisao", "em_uso")
      .in("instrumento", data.instrumentos)
      .select("id");
    if (error) throw error;
    return { ok: true, retiradas: (linhas ?? []).length };
  });

export const guardarConfiguracaoExame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        cursoId: z.string().uuid(),
        numeroQuestoes: z.number().int().min(1).max(200),
        minutos: z.number().int().min(5).max(480),
        pctFacil: z.number().int().min(0).max(100),
        pctMedia: z.number().int().min(0).max(100),
        pctDificil: z.number().int().min(0).max(100),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await exigirGestaoBanco(context as unknown as ContextoAutenticado, "escrever");
    if (data.pctFacil + data.pctMedia + data.pctDificil !== 100)
      throw new Error("PERCENTAGENS_NAO_SOMAM_100");
    const s = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { error } = await s.from("exame_configuracoes").upsert(
      {
        curso_id: data.cursoId,
        numero_questoes: data.numeroQuestoes,
        minutos: data.minutos,
        pct_facil: data.pctFacil,
        pct_media: data.pctMedia,
        pct_dificil: data.pctDificil,
        actualizado_em: new Date().toISOString(),
      },
      { onConflict: "curso_id" },
    );
    if (error) throw error;
    return { ok: true };
  });

// ---------- exame final ----------

type QuestaoBanco = {
  id: string;
  modulo_id: string | null;
  tipologia: Tipologia;
  dificuldade: Dificuldade;
  enunciado: string;
  conteudo: Record<string, unknown>;
  resposta: Record<string, unknown>;
  explicacao: string;
  cenario?: boolean | null;
};

function apresentar(q: QuestaoBanco) {
  switch (q.tipologia) {
    case "escolha_multipla": {
      const opcoes = (q.conteudo.opcoes as string[]) ?? [];
      const indiceCorrecto = (q.resposta as { indice: number }).indice;
      const baralhadas = baralhar(opcoes.map((texto, i) => ({ texto, original: i })));
      return {
        apresentacao: { opcoes: baralhadas.map((o) => o.texto) },
        respostaCorrecta: {
          indice: baralhadas.findIndex((o) => o.original === indiceCorrecto),
        },
      };
    }
    case "verdadeiro_falso":
      return { apresentacao: {}, respostaCorrecta: q.resposta };
    case "resposta_curta":
      return { apresentacao: {}, respostaCorrecta: q.resposta };
    case "correspondencia": {
      const pares = (q.conteudo.pares as { esquerda: string; direita: string }[]) ?? [];
      return {
        apresentacao: {
          esquerda: pares.map((p) => p.esquerda),
          direita: baralhar(pares.map((p) => p.direita)),
        },
        respostaCorrecta: { pares },
      };
    }
    case "ordenacao": {
      const itens = (q.conteudo.itens as string[]) ?? [];
      return { apresentacao: { itens: baralhar(itens) }, respostaCorrecta: { ordem: itens } };
    }
  }
}

function seleccionarPorDificuldade(
  questoes: QuestaoBanco[],
  total: number,
  pct: { facil: number; media: number; dificil: number },
) {
  const alvo = {
    facil: Math.round((total * pct.facil) / 100),
    media: Math.round((total * pct.media) / 100),
    dificil: Math.round((total * pct.dificil) / 100),
  };
  const escolhidas: QuestaoBanco[] = [];
  for (const nivel of ["facil", "media", "dificil"] as const) {
    const disponiveis = baralhar(questoes.filter((q) => q.dificuldade === nivel));
    escolhidas.push(...disponiveis.slice(0, alvo[nivel]));
  }
  if (escolhidas.length < total) {
    const usadas = new Set(escolhidas.map((q) => q.id));
    const resto = baralhar(questoes.filter((q) => !usadas.has(q.id)));
    escolhidas.push(...resto.slice(0, total - escolhidas.length));
  }
  return baralhar(escolhidas).slice(0, total);
}

/**
 * Escolhe as questões da prova. Nos cursos com quotas de cobertura definidas
 * (Computação em Nuvem e Princípios da Transformação Digital), garante todos
 * os módulos e todas as tipologias do plano, além do equilíbrio de
 * dificuldade. Se as restrições não puderem ser cumpridas, a prova é
 * BLOQUEADA com a causa — nunca é completada em silêncio. Nos restantes
 * cursos mantém-se o comportamento anterior.
 */
async function seleccionarQuestoes(
  cursoId: string,
  banco: QuestaoBanco[],
  cfg: { numero_questoes: number; pct_facil: number; pct_media: number; pct_dificil: number },
): Promise<QuestaoBanco[]> {
  const s = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
  const { data: curso } = await s.from("cursos").select("slug").eq("id", cursoId).maybeSingle();
  const quotasCurso = curso?.slug ? QUOTAS_POR_CURSO[curso.slug] : undefined;
  const pct = { facil: cfg.pct_facil, media: cfg.pct_media, dificil: cfg.pct_dificil };

  if (!quotasCurso || quotasCurso.total !== cfg.numero_questoes) {
    return seleccionarPorDificuldade(banco, cfg.numero_questoes, pct);
  }

  const { data: modulos } = await s.from("modulos").select("id,ordem");
  const idPorOrdem = new Map<number, string>();
  for (const m of modulos ?? []) idPorOrdem.set(m.ordem, m.id);

  const modulosQuota: Record<string, number> = {};
  for (const [ordem, quantas] of Object.entries(quotasCurso.modulosPorOrdem)) {
    const id = idPorOrdem.get(Number(ordem));
    if (!id) throw new Error(`QUOTA_MODULO_DESCONHECIDO:${ordem}`);
    modulosQuota[id] = quantas;
  }

  const sorteaveis: QuestaoSorteavel[] = banco.map((q) => ({
    id: q.id,
    moduloId: q.modulo_id,
    tipologia: q.tipologia,
    dificuldade: q.dificuldade,
    cenario: Boolean(q.cenario),
  }));

  const resultado = sortearExame(sorteaveis, {
    total: cfg.numero_questoes,
    dificuldade: quotasDificuldade(cfg.numero_questoes, pct),
    modulos: modulosQuota,
    tipos: quotasCurso.tipos,
  });
  if (!resultado.ok) throw new Error(`SORTEIO_BLOQUEADO:${resultado.causa}:${resultado.detalhe}`);
  const porId = new Map(banco.map((q) => [q.id, q]));
  return resultado.ids.map((id) => porId.get(id)).filter((q): q is QuestaoBanco => Boolean(q));
}

async function carregarConfig(cursoId: string) {
  const s = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
  const { data } = await s
    .from("exame_configuracoes")
    .select("*")
    .eq("curso_id", cursoId)
    .maybeSingle();
  return data ?? { curso_id: cursoId, ...CONFIG_PADRAO };
}

async function formandoPorToken(token: string, perfilId: string) {
  const s = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
  const { data } = await s
    .from("formandos")
    .select("id, nome, token_pessoal, perfil_id")
    .eq("token_pessoal", token)
    .maybeSingle();
  if (!data) throw new Error("TOKEN_INVALIDO");
  // Conhecer o token nao e prova de titularidade: exige-se o vinculo com a
  // conta autenticada (formandos.perfil_id).
  if (!data.perfil_id || data.perfil_id !== perfilId) throw new Error("TOKEN_NAO_VINCULADO");
  return data;
}

/**
 * Assiduidade real do formando na turma. Devolve sempre as duas taxas — a
 * estrita e a ajustada — e diz qual delas vale para certificação, conforme a
 * configuração do curso. Só as sessões marcadas como realizadas contam.
 */
async function assiduidadeDoFormando(
  turmaId: string,
  cursoId: string,
  nome: string,
): Promise<{
  estritaPct: number | null;
  ajustadaPct: number | null;
  usadaPct: number | null;
  base: "estrita" | "ajustada";
  justificadas: number;
} | null> {
  const s = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
  const { calcularAssiduidade } = await import("@/lib/presencas.server");
  const [sessoesRes, inscricoesRes, presencasRes, cfgRes] = await Promise.all([
    s.from("turma_sessoes").select("id,data,estado").eq("turma_id", turmaId),
    s.from("turma_inscricoes").select("id,nome,estado").eq("turma_id", turmaId),
    s.from("presencas").select("*").eq("turma_id", turmaId),
    s
      .from("presenca_configuracoes")
      .select("base_assiduidade")
      .eq("curso_id", cursoId)
      .maybeSingle(),
  ]);
  const inscricao = (inscricoesRes.data ?? []).find(
    (i) => normalizar(i.nome) === normalizar(nome) && i.estado !== "desistiu",
  );
  if (!inscricao) return null;
  const base = (cfgRes.data?.base_assiduidade ?? "estrita") as "estrita" | "ajustada";
  const linhas = calcularAssiduidade(
    (sessoesRes.data ?? []).map((x) => ({
      id: x.id,
      data: x.data,
      estado: x.estado as never,
    })),
    [{ id: inscricao.id, nome: inscricao.nome }],
    (presencasRes.data ?? []) as never,
    base,
  );
  const l = linhas[0];
  if (!l) return null;
  return {
    estritaPct: l.taxaEstritaPct,
    ajustadaPct: l.taxaAjustadaPct,
    usadaPct: l.taxaPct,
    base,
    justificadas: l.justificadas,
  };
}


/** Última turma do formando para o curso, se existir inscrição registada. */
async function turmaDoFormando(nome: string, cursoId: string) {
  const s = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
  const { data: turmas } = await s
    .from("turmas")
    .select("id, designacao, provincia, data_inicio, data_fim")
    .eq("curso_id", cursoId);
  if (!turmas?.length) return null;
  const { data: inscricoes } = await s
    .from("turma_inscricoes")
    .select("turma_id, nome")
    .in(
      "turma_id",
      turmas.map((t) => t.id),
    );
  const minha = (inscricoes ?? []).find((i) => normalizar(i.nome) === normalizar(nome));
  if (!minha) return null;
  return turmas.find((t) => t.id === minha.turma_id) ?? null;
}

export const estadoAvaliacaoFormando = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ token: z.string().uuid(), cursoId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const s = await admin();
    const formando = await formandoPorToken(data.token, (context as unknown as ContextoAutenticado).userId);
    const cfg = await carregarConfig(data.cursoId);
    const turma = await turmaDoFormando(formando.nome, data.cursoId);

    const { data: tentativas } = await s
      .from("exame_tentativas")
      .select("id,numero,estado,iniciado_em,limite_em,submetido_em,pontuacao,total,nota_pct")
      .eq("formando_id", formando.id)
      .eq("curso_id", data.cursoId)
      .order("numero");

    const { data: certificado } = await s
      .from("certificados_curso")
      .select("codigo_verificacao, emitido_em, nota_final_pct, assiduidade_pct")
      .eq("formando_id", formando.id)
      .eq("curso_id", data.cursoId)
      .maybeSingle();

    const fim = turma?.data_fim ? new Date(turma.data_fim) : null;
    const prazoLimite = fim
      ? new Date(fim.getTime() + cfg.prazo_dias * 24 * 60 * 60 * 1000)
      : null;
    const diasRestantes = prazoLimite
      ? Math.ceil((prazoLimite.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : null;

    const melhorNota = (tentativas ?? [])
      .filter((t) => t.estado === "submetida" && t.nota_pct !== null)
      .reduce<number | null>((max, t) => Math.max(max ?? 0, Number(t.nota_pct)), null);

    const assiduidade = turma
      ? await assiduidadeDoFormando(turma.id, data.cursoId, formando.nome)
      : null;

    const condicoes = avaliarCondicoesCertificacao({
      assiduidadePct: assiduidade?.usadaPct ?? null,
      notaPct: melhorNota,
      minimoAssiduidadePct: cfg.assiduidade_minima_pct,
      minimoNotaPct: cfg.nota_minima_pct,
      dataFim: fim,
      prazoDias: cfg.prazo_dias,
      agora: new Date(),
    });

    return {
      prazoExpirado: condicoes.prazoExpirado,
      assiduidadeCumpre: condicoes.assiduidadeCumpre,
      notaCumpre: condicoes.notaCumpre,
      podeCertificar: condicoes.podeCertificar,
      formando: { nome: formando.nome },
      turma,
      tentativas: tentativas ?? [],
      tentativasMax: cfg.tentativas_max,
      notaMinimaPct: cfg.nota_minima_pct,
      assiduidadeMinimaPct: cfg.assiduidade_minima_pct,
      minutos: cfg.minutos,
      prazoDias: cfg.prazo_dias,
      prazoLimite: prazoLimite?.toISOString() ?? null,
      diasRestantes,
      melhorNota,
      // As duas taxas, sempre. A que vale para certificação é a indicada em
      // baseAssiduidade, escolhida na configuração do curso.
      assiduidadePct: assiduidade?.usadaPct ?? null,
      assiduidadeEstritaPct: assiduidade?.estritaPct ?? null,
      assiduidadeAjustadaPct: assiduidade?.ajustadaPct ?? null,
      faltasJustificadas: assiduidade?.justificadas ?? 0,
      baseAssiduidade: assiduidade?.base ?? "estrita",
      certificado,
    };

  });

export const iniciarExame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ token: z.string().uuid(), cursoId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const s = await admin();
    const formando = await formandoPorToken(data.token, (context as unknown as ContextoAutenticado).userId);
    const cfg = await carregarConfig(data.cursoId);

    const { data: existentes } = await s
      .from("exame_tentativas")
      .select("id,numero,estado,limite_em")
      .eq("formando_id", formando.id)
      .eq("curso_id", data.cursoId)
      .order("numero");

    // retoma segura: tentativa em curso dentro do tempo
    const emCurso = (existentes ?? []).find(
      (t) => t.estado === "em_curso" && new Date(t.limite_em).getTime() > Date.now(),
    );
    if (emCurso) return { tentativaId: emCurso.id, retomada: true };

    if ((existentes ?? []).length >= cfg.tentativas_max)
      throw new Error("TENTATIVAS_ESGOTADAS");

    const turmaDoExame = await turmaDoFormando(formando.nome, data.cursoId);
    // Secção 12.1: o exame só pode ser feito até ao prazo, em dias de
    // calendário, depois do fim da formação.
    if (turmaDoExame?.data_fim) {
      const limitePrazo = new Date(
        new Date(turmaDoExame.data_fim).getTime() + cfg.prazo_dias * 24 * 60 * 60 * 1000,
      );
      if (Date.now() > limitePrazo.getTime()) throw new Error("PRAZO_EXPIRADO");
    }

    const { data: questoesBanco, error } = await s
      .from("banco_questoes")
      .select(
        "id,modulo_id,tipologia,dificuldade,enunciado,conteudo,resposta,explicacao,cenario",
      )
      .eq("curso_id", data.cursoId)
      .eq("instrumento", "exame_final")
      .eq("estado_revisao", "em_uso")
      .eq("activa", true);
    if (error) throw error;
    const banco = (questoesBanco ?? []) as unknown as QuestaoBanco[];
    // Secção 10: banco activo com pelo menos o triplo das questões do exame.
    if (banco.length < cfg.numero_questoes * 3) throw new Error("BANCO_INSUFICIENTE");

    const seleccionadas = await seleccionarQuestoes(data.cursoId, banco, cfg);

    const turma = turmaDoExame;
    const limite = new Date(Date.now() + cfg.minutos * 60 * 1000).toISOString();
    const { data: tentativa, error: eT } = await s
      .from("exame_tentativas")
      .insert({
        formando_id: formando.id,
        curso_id: data.cursoId,
        turma_id: turma?.id ?? null,
        numero: (existentes?.length ?? 0) + 1,
        limite_em: limite,
        total: seleccionadas.length,
      })
      .select("id")
      .single();
    if (eT) throw eT;

    const linhas = seleccionadas.map((q, i) => {
      const { apresentacao, respostaCorrecta } = apresentar(q)!;
      return {
        tentativa_id: tentativa.id,
        questao_id: q.id,
        ordem: i + 1,
        modulo_id: q.modulo_id,
        tipologia: q.tipologia,
        dificuldade: q.dificuldade,
        enunciado: q.enunciado,
        apresentacao: apresentacao as never,
        resposta_correcta: respostaCorrecta as never,
        explicacao: q.explicacao,
      };
    });
    const { error: eQ } = await s.from("exame_tentativa_questoes").insert(linhas);
    if (eQ) throw eQ;

    return { tentativaId: tentativa.id, retomada: false };
  });

export const obterTentativa = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ token: z.string().uuid(), tentativaId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const s = await admin();
    const formando = await formandoPorToken(data.token, (context as unknown as ContextoAutenticado).userId);
    const { data: tentativa } = await s
      .from("exame_tentativas")
      .select("id,formando_id,curso_id,numero,estado,iniciado_em,limite_em,submetido_em,pontuacao,total,nota_pct")
      .eq("id", data.tentativaId)
      .maybeSingle();
    if (!tentativa || tentativa.formando_id !== formando.id)
      throw new Error("TENTATIVA_NAO_ENCONTRADA");

    const { data: curso } = await s
      .from("cursos")
      .select("titulo, slug")
      .eq("id", tentativa.curso_id)
      .single();

    const mostrarCorreccao = tentativa.estado === "submetida";
    const { data: questoes } = await s
      .from("exame_tentativa_questoes")
      .select(
        "id,ordem,tipologia,dificuldade,enunciado,apresentacao,resposta_dada,correcta,resposta_correcta,explicacao",
      )
      .eq("tentativa_id", tentativa.id)
      .order("ordem");

    return {
      tentativa,
      curso,
      questoes: (questoes ?? []).map((q) => ({
        id: q.id,
        ordem: q.ordem,
        tipologia: q.tipologia,
        dificuldade: q.dificuldade,
        enunciado: q.enunciado,
        apresentacao: q.apresentacao,
        respostaDada: q.resposta_dada,
        correcta: mostrarCorreccao ? q.correcta : null,
        respostaCorrecta: mostrarCorreccao ? q.resposta_correcta : null,
        explicacao: mostrarCorreccao ? q.explicacao : "",
      })),
    };
  });

export const guardarResposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        token: z.string().uuid(),
        tentativaId: z.string().uuid(),
        questaoId: z.string().uuid(),
        resposta: z.unknown(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const s = await admin();
    const formando = await formandoPorToken(data.token, (context as unknown as ContextoAutenticado).userId);
    const { data: tentativa } = await s
      .from("exame_tentativas")
      .select("id,formando_id,estado,limite_em")
      .eq("id", data.tentativaId)
      .maybeSingle();
    if (!tentativa || tentativa.formando_id !== formando.id)
      throw new Error("TENTATIVA_NAO_ENCONTRADA");
    if (tentativa.estado !== "em_curso") throw new Error("TENTATIVA_FECHADA");
    if (new Date(tentativa.limite_em).getTime() < Date.now())
      throw new Error("TEMPO_ESGOTADO");

    const { error } = await s
      .from("exame_tentativa_questoes")
      .update({
        resposta_dada: data.resposta as never,
        respondido_em: new Date().toISOString(),
      })
      .eq("id", data.questaoId)
      .eq("tentativa_id", tentativa.id);
    if (error) throw error;
    return { ok: true };
  });

function corrigir(
  tipologia: Tipologia,
  correcta: Record<string, unknown>,
  dada: unknown,
): boolean {
  if (dada === null || dada === undefined) return false;
  switch (tipologia) {
    case "escolha_multipla":
      return (dada as { indice?: number }).indice === (correcta as { indice: number }).indice;
    case "verdadeiro_falso":
      return (dada as { valor?: boolean }).valor === (correcta as { valor: boolean }).valor;
    case "resposta_curta": {
      const texto = normalizar(String((dada as { texto?: string }).texto ?? ""));
      const aceites = ((correcta as { aceites?: string[] }).aceites ?? []).map(normalizar);
      return texto.length > 0 && aceites.includes(texto);
    }
    case "correspondencia": {
      const pares = (correcta as { pares: { esquerda: string; direita: string }[] }).pares;
      const resp = (dada as { pares?: Record<string, string> }).pares ?? {};
      return pares.every((p) => normalizar(resp[p.esquerda] ?? "") === normalizar(p.direita));
    }
    case "ordenacao": {
      const ordem = (correcta as { ordem: string[] }).ordem;
      const resp = (dada as { ordem?: string[] }).ordem ?? [];
      return (
        resp.length === ordem.length && ordem.every((item, i) => normalizar(resp[i] ?? "") === normalizar(item))
      );
    }
  }
}

export const submeterExame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ token: z.string().uuid(), tentativaId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const s = await admin();
    const formando = await formandoPorToken(data.token, (context as unknown as ContextoAutenticado).userId);
    const { data: tentativa } = await s
      .from("exame_tentativas")
      .select("id,formando_id,estado,limite_em")
      .eq("id", data.tentativaId)
      .maybeSingle();
    if (!tentativa || tentativa.formando_id !== formando.id)
      throw new Error("TENTATIVA_NAO_ENCONTRADA");

    const { data: questoes } = await s
      .from("exame_tentativa_questoes")
      .select("id,tipologia,resposta_correcta,resposta_dada")
      .eq("tentativa_id", tentativa.id);

    let pontuacao = 0;
    for (const q of questoes ?? []) {
      const acertou = corrigir(
        q.tipologia as Tipologia,
        (q.resposta_correcta ?? {}) as Record<string, unknown>,
        q.resposta_dada,
      );
      if (acertou) pontuacao += 1;
      await s.from("exame_tentativa_questoes").update({ correcta: acertou }).eq("id", q.id);
    }
    const total = (questoes ?? []).length;
    const notaPct = total > 0 ? Math.round((pontuacao / total) * 1000) / 10 : 0;
    const expirou = new Date(tentativa.limite_em).getTime() < Date.now();

    const { error } = await s
      .from("exame_tentativas")
      .update({
        estado: expirou ? "expirada" : "submetida",
        submetido_em: new Date().toISOString(),
        pontuacao,
        total,
        nota_pct: notaPct,
      })
      .eq("id", tentativa.id);
    if (error) throw error;

    return { pontuacao, total, notaPct, expirou };
  });

// ---------- certificação por curso ----------

export const emitirCertificadoCurso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        token: z.string().uuid(),
        cursoId: z.string().uuid(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const s = await admin();
    const formando = await formandoPorToken(data.token, (context as unknown as ContextoAutenticado).userId);
    const cfg = await carregarConfig(data.cursoId);

    const { data: existente } = await s
      .from("certificados_curso")
      .select("codigo_verificacao, emitido_em")
      .eq("formando_id", formando.id)
      .eq("curso_id", data.cursoId)
      .maybeSingle();
    if (existente) return { ...existente, jaExistia: true };

    const { data: tentativas } = await s
      .from("exame_tentativas")
      .select("id, nota_pct, estado")
      .eq("formando_id", formando.id)
      .eq("curso_id", data.cursoId)
      .eq("estado", "submetida");
    const melhor = (tentativas ?? []).reduce<{ id: string; nota: number } | null>(
      (max, t) =>
        Number(t.nota_pct) > (max?.nota ?? -1) ? { id: t.id, nota: Number(t.nota_pct) } : max,
      null,
    );
    const { data: curso } = await s
      .from("cursos")
      .select("titulo, carga_horaria")
      .eq("id", data.cursoId)
      .single();
    const turma = await turmaDoFormando(formando.nome, data.cursoId);

    // A assiduidade é sempre apurada no servidor, a partir das presenças
    // marcadas — nunca aceite do lado de quem pede o certificado.
    const assiduidade = turma
      ? await assiduidadeDoFormando(turma.id, data.cursoId, formando.nome)
      : null;

    // Condições cumulativas das secções 12 e 12.1: nota, assiduidade e prazo.
    const condicoes = avaliarCondicoesCertificacao({
      assiduidadePct: assiduidade?.usadaPct ?? null,
      notaPct: melhor?.nota ?? null,
      minimoAssiduidadePct: cfg.assiduidade_minima_pct,
      minimoNotaPct: cfg.nota_minima_pct,
      dataFim: turma?.data_fim ? new Date(turma.data_fim) : null,
      prazoDias: cfg.prazo_dias,
      agora: new Date(),
    });
    if (!condicoes.podeCertificar || !melhor || !assiduidade || assiduidade.usadaPct === null)
      throw new Error(condicoes.motivo ?? "SEM_EXAME_SUBMETIDO");

    const { data: cert, error } = await s
      .from("certificados_curso")
      .insert({
        formando_id: formando.id,
        curso_id: data.cursoId,
        turma_id: turma?.id ?? null,
        tentativa_id: melhor.id,
        codigo_verificacao: gerarCodigo(),
        nome_formando: formando.nome,
        titulo_curso: curso?.titulo ?? "",
        carga_horaria: curso?.carga_horaria ?? 0,
        provincia: turma?.provincia ?? null,
        turma_designacao: turma?.designacao ?? null,
        data_inicio: turma?.data_inicio ?? null,
        data_fim: turma?.data_fim ?? null,
        nota_final_pct: melhor.nota,
        assiduidade_pct: assiduidade.usadaPct,
        base_assiduidade: assiduidade.base as never,
        assiduidade_estrita_pct: assiduidade.estritaPct,
        assiduidade_ajustada_pct: assiduidade.ajustadaPct,
      })
      .select("codigo_verificacao, emitido_em")
      .single();
    if (error) throw error;
    return { ...cert, jaExistia: false };
  });

