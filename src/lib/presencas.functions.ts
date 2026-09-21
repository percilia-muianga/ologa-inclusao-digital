import { createServerFn } from "@tanstack/react-start";
import { sessaoObrigatoria, exigirGestao, type ContextoAutenticado } from "@/lib/guardas";
import {
  calcularAssiduidade,
  marcacaoEfectiva,
  sessoesRealizadas,
  sessoesPorRegularizar,
  BASES_ASSIDUIDADE,
  rotuloBaseAssiduidade,
  formulaBaseAssiduidade,
  LIMIAR_ASSIDUIDADE,
  type MarcacaoBruta,
  type EstadoPresenca,
  type EstadoSessao,
  type BaseAssiduidade,
  type SessaoParaCalculo,
} from "@/lib/presencas.server";

export { LIMIAR_ASSIDUIDADE, BASES_ASSIDUIDADE, rotuloBaseAssiduidade, formulaBaseAssiduidade };
export type { EstadoPresenca, EstadoSessao, BaseAssiduidade };

export const ESTADOS_PRESENCA: ReadonlyArray<readonly [EstadoPresenca, string]> = [
  ["presente", "Presente"],
  ["ausente", "Ausente"],
  ["justificado", "Justificado"],
] as const;

export const ESTADOS_SESSAO: ReadonlyArray<readonly [EstadoSessao, string, string]> = [
  ["agendada", "Agendada", "Ainda por realizar. Não entra no cálculo da assiduidade."],
  ["realizada", "Realizada", "Aconteceu. É a única situação que entra no cálculo da assiduidade."],
  ["cancelada", "Cancelada", "Não aconteceu e não é reposta. Exige motivo escrito."],
  ["adiada", "Adiada", "Não aconteceu nesta data e será remarcada. Exige motivo escrito."],
] as const;

export function rotuloEstadoPresenca(valor: string): string {
  return ESTADOS_PRESENCA.find(([v]) => v === valor)?.[1] ?? valor;
}

export function rotuloEstadoSessao(valor: string): string {
  return ESTADOS_SESSAO.find(([v]) => v === valor)?.[1] ?? valor;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function paraCalculo(
  sessoes: Array<{ id: string; data: string; estado: string }>,
): SessaoParaCalculo[] {
  return sessoes.map((s) => ({ id: s.id, data: s.data, estado: s.estado as EstadoSessao }));
}

/** Turmas com sessões, para o formador escolher onde vai marcar presenças. */
export const listarTurmasComSessoes = createServerFn({ method: "GET" })
  .middleware([sessaoObrigatoria])
  .handler(async ({ context }) => {
  await exigirGestao(context as unknown as ContextoAutenticado, "ler");
  const s = await admin();
  const [turmasRes, sessoesRes, inscricoesRes, presencasRes, cursosRes, configRes] =
    await Promise.all([
      s
        .from("turmas")
        .select("id,designacao,codigo_inscricao,provincia,distrito,estado,curso_id,data_inicio,data_fim")
        .order("criado_em", { ascending: false }),
      s.from("turma_sessoes").select("id,turma_id,data,tema,modalidade,ordem,estado").order("ordem"),
      s.from("turma_inscricoes").select("id,turma_id,nome,estado"),
      s.from("presencas").select("*"),
      s.from("cursos").select("id,titulo"),
      s.from("presenca_configuracoes").select("curso_id,base_assiduidade"),
    ]);
  for (const r of [turmasRes, sessoesRes, inscricoesRes, presencasRes, cursosRes, configRes])
    if (r.error) throw r.error;

  const cursos = cursosRes.data ?? [];
  const marcacoes = (presencasRes.data ?? []) as unknown as MarcacaoBruta[];

  const turmas = (turmasRes.data ?? []).map((t) => {
    const sessoes = paraCalculo((sessoesRes.data ?? []).filter((x) => x.turma_id === t.id));
    const inscritos = (inscricoesRes.data ?? []).filter(
      (i) => i.turma_id === t.id && i.estado !== "desistiu",
    );
    const base =
      ((configRes.data ?? []).find((c) => c.curso_id === t.curso_id)
        ?.base_assiduidade as BaseAssiduidade) ?? "estrita";
    const linhas = calcularAssiduidade(
      sessoes,
      inscritos.map((i) => ({ id: i.id, nome: i.nome })),
      marcacoes.filter((m) => m.turma_id === t.id),
      base,
    );
    const media = (chave: "taxaEstritaPct" | "taxaAjustadaPct") => {
      const uteis = linhas.filter((l) => l[chave] !== null);
      return uteis.length
        ? Math.round((uteis.reduce((a, l) => a + (l[chave] ?? 0), 0) / uteis.length) * 10) / 10
        : null;
    };
    return {
      id: t.id,
      designacao: t.designacao,
      codigo: t.codigo_inscricao,
      provincia: t.provincia,
      distrito: t.distrito,
      estado: t.estado,
      cursoTitulo: cursos.find((c) => c.id === t.curso_id)?.titulo ?? "",
      base,
      totalSessoes: sessoes.length,
      sessoesRealizadas: sessoesRealizadas(sessoes).size,
      sessoesPorRegularizar: sessoesPorRegularizar(sessoes).size,
      inscritos: inscritos.length,
      abaixoDoLimiar: linhas.filter((l) => l.abaixoDoLimiar).length,
      emRisco: linhas.filter((l) => l.emRisco).length,
      justificadas: linhas.reduce((a, l) => a + l.justificadas, 0),
      assiduidadeEstritaMediaPct: media("taxaEstritaPct"),
      assiduidadeAjustadaMediaPct: media("taxaAjustadaPct"),
    };
  });

  return { turmas };
});

/** Assiduidade de uma turma, formando a formando, com alerta de risco. */
export const assiduidadeDaTurma = createServerFn({ method: "GET" })
  .middleware([sessaoObrigatoria])
  .validator((codigo: string) => codigo)
  .handler(async ({ data: codigo, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "ler");
    const s = await admin();
    const turmaRes = await s
      .from("turmas")
      .select("id,designacao,codigo_inscricao,provincia,distrito,curso_id,data_inicio,data_fim,estado")
      .eq("codigo_inscricao", codigo.toUpperCase())
      .maybeSingle();
    if (turmaRes.error) throw turmaRes.error;
    if (!turmaRes.data) return null;
    const turma = turmaRes.data;

    const [sessoesRes, inscricoesRes, presencasRes, cursoRes, configRes] = await Promise.all([
      s
        .from("turma_sessoes")
        .select(
          "id,ordem,data,hora_inicio,hora_fim,tema,modalidade,formador_nome,estado,motivo_estado,estado_actualizado_em,estado_actualizado_por_nome",
        )
        .eq("turma_id", turma.id)
        .order("ordem"),
      s.from("turma_inscricoes").select("id,nome,estado").eq("turma_id", turma.id),
      s.from("presencas").select("*").eq("turma_id", turma.id),
      s.from("cursos").select("id,titulo").eq("id", turma.curso_id).maybeSingle(),
      s
        .from("presenca_configuracoes")
        .select("base_assiduidade")
        .eq("curso_id", turma.curso_id)
        .maybeSingle(),
    ]);
    for (const r of [sessoesRes, inscricoesRes, presencasRes, cursoRes, configRes])
      if (r.error) throw r.error;

    const sessoes = sessoesRes.data ?? [];
    const calculo = paraCalculo(sessoes);
    const inscritos = (inscricoesRes.data ?? []).filter((i) => i.estado !== "desistiu");
    const marcacoes = (presencasRes.data ?? []) as unknown as MarcacaoBruta[];
    const efectivas = marcacaoEfectiva(marcacoes);
    const realizadas = sessoesRealizadas(calculo);
    const porRegularizar = sessoesPorRegularizar(calculo);
    const base = (configRes.data?.base_assiduidade as BaseAssiduidade) ?? "estrita";

    return {
      turma,
      cursoTitulo: cursoRes.data?.titulo ?? "",
      base,
      sessoes: sessoes.map((x) => ({
        ...x,
        realizada: realizadas.has(x.id),
        porRegularizar: porRegularizar.has(x.id),
        marcadas: inscritos.filter((i) => efectivas.has(`${x.id}|${i.id}`)).length,
      })),
      porRegularizar: porRegularizar.size,
      inscritos: inscritos.length,
      limiar: LIMIAR_ASSIDUIDADE,
      linhas: calcularAssiduidade(
        calculo,
        inscritos.map((i) => ({ id: i.id, nome: i.nome })),
        marcacoes,
        base,
      ),
    };
  });

/**
 * Estado da sessão, marcado pelo formador. Cancelar ou adiar exige motivo
 * escrito. A alteração fica no registo de auditoria (gatilho da tabela).
 */
export const definirEstadoSessao = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      sessaoId: string;
      estado: EstadoSessao;
      motivo: string | null;
      porNome: string | null;
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const exigeMotivo = data.estado === "cancelada" || data.estado === "adiada";
    if (exigeMotivo && (data.motivo ?? "").trim().length < 5)
      return {
        ok: false as const,
        motivo: "Cancelar ou adiar uma sessão exige um motivo escrito.",
      };

    const s = await admin();
    const { error } = await s
      .from("turma_sessoes")
      .update({
        estado: data.estado as never,
        motivo_estado: exigeMotivo ? (data.motivo ?? "").trim() : null,
        estado_actualizado_em: new Date().toISOString(),
        estado_actualizado_por_nome: data.porNome,
      })
      .eq("id", data.sessaoId);
    if (error) throw error;
    return { ok: true as const };
  });

/** Folha de uma sessão: formandos da turma e a marcação que já existe. */
export const obterFolhaSessao = createServerFn({ method: "GET" })
  .middleware([sessaoObrigatoria])
  .validator((sessaoId: string) => sessaoId)
  .handler(async ({ data: sessaoId, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "ler");
    const s = await admin();
    const sessaoRes = await s.from("turma_sessoes").select("*").eq("id", sessaoId).maybeSingle();
    if (sessaoRes.error) throw sessaoRes.error;
    if (!sessaoRes.data) return null;
    const sessao = sessaoRes.data;

    const turmaRes = await s
      .from("turmas")
      .select("id,designacao,codigo_inscricao,provincia,distrito,curso_id")
      .eq("id", sessao.turma_id)
      .single();
    if (turmaRes.error) throw turmaRes.error;

    const [inscricoesRes, presencasRes, cursoRes, configRes] = await Promise.all([
      s.from("turma_inscricoes").select("id,nome,estado").eq("turma_id", sessao.turma_id).order("nome"),
      s.from("presencas").select("*").eq("sessao_id", sessaoId).order("registado_em"),
      s.from("cursos").select("id,titulo,carga_horaria").eq("id", turmaRes.data.curso_id).maybeSingle(),
      s
        .from("presenca_configuracoes")
        .select("*")
        .eq("curso_id", turmaRes.data.curso_id)
        .maybeSingle(),
    ]);
    for (const r of [inscricoesRes, presencasRes, cursoRes, configRes]) if (r.error) throw r.error;

    const inscritos = (inscricoesRes.data ?? []).filter((i) => i.estado !== "desistiu");
    const marcacoes = (presencasRes.data ?? []) as unknown as MarcacaoBruta[];
    const efectivas = marcacaoEfectiva(marcacoes);

    return {
      sessao,
      turma: turmaRes.data,
      curso: cursoRes.data,
      configuracao: configRes.data ?? {
        curso_id: turmaRes.data.curso_id,
        limiar_permanencia_pct: 75,
        limiar_progresso_pct: 75,
        base_assiduidade: "estrita",
        actualizado_em: null,
      },
      formandos: inscritos.map((i) => {
        const historico = (presencasRes.data ?? []).filter((m) => m.inscricao_id === i.id);
        const actual = efectivas.get(`${sessaoId}|${i.id}`) ?? null;
        const calculada = historico.find((h) => h.origem === "calculada") ?? null;
        return {
          inscricaoId: i.id,
          nome: i.nome,
          actual,
          conflito: historico.some((h) => h.conflito),
          // Proveniência do valor da sessão virtual: quem o escreveu e quando.
          introducaoManual: calculada?.valor_introduzido_manualmente
            ? {
                porNome: calculada.introduzido_por_nome,
                em: calculada.introduzido_em,
                minutos: calculada.minutos_permanencia,
                progresso: calculada.progresso_pct,
              }
            : null,
          historico,
        };
      }),
    };
  });

export type MarcacaoEnvio = {
  inscricaoId: string;
  nome: string;
  estado: EstadoPresenca;
  motivo: string | null;
};

/**
 * Grava marcações de presença. Recebe lotes, incluindo os que ficaram
 * guardados no aparelho sem ligação. As marcações somam-se sempre: nada é
 * apagado nem substituído. Marcações contraditórias da mesma sessão ficam
 * assinaladas para revisão manual (gatilho na base de dados).
 */
export const registarPresencas = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      sessaoId: string;
      origemOffline: boolean;
      aparelho: string | null;
      marcadoPorNome: string | null;
      marcacoes: MarcacaoEnvio[];
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const s = await admin();
    const sessaoRes = await s
      .from("turma_sessoes")
      .select("id,turma_id")
      .eq("id", data.sessaoId)
      .single();
    if (sessaoRes.error) throw sessaoRes.error;

    const linhas = data.marcacoes
      .filter((m) => m.estado !== "justificado" || (m.motivo ?? "").trim().length > 0)
      .map((m) => ({
        sessao_id: data.sessaoId,
        turma_id: sessaoRes.data.turma_id,
        inscricao_id: m.inscricaoId,
        nome_formando: m.nome,
        estado: m.estado as never,
        motivo: m.estado === "justificado" ? (m.motivo ?? "").trim() : null,
        origem: "manual" as never,
        origem_offline: data.origemOffline,
        aparelho: data.aparelho,
        marcado_por_nome: data.marcadoPorNome,
      }));

    const recusadas = data.marcacoes.length - linhas.length;
    if (linhas.length === 0) return { gravadas: 0, conflitos: 0, recusadas };

    const { data: inseridas, error } = await s.from("presencas").insert(linhas).select("id,conflito");
    if (error) throw error;
    return {
      gravadas: (inseridas ?? []).length,
      conflitos: (inseridas ?? []).filter((i) => i.conflito).length,
      recusadas,
    };
  });

/**
 * Sessões virtuais: a presença é calculada pelo tempo de permanência e pelo
 * progresso, comparados com o limiar configurado para o curso. Os valores são
 * introduzidos pelo formador — fica registado que são manuais, por quem e
 * quando, para o dado não passar por automático.
 */
export const calcularPresencasVirtuais = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      sessaoId: string;
      introduzidoPorNome: string | null;
      registos: Array<{
        inscricaoId: string;
        nome: string;
        minutosPermanencia: number;
        progressoPct: number;
      }>;
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const s = await admin();
    const sessaoRes = await s
      .from("turma_sessoes")
      .select("id,turma_id,hora_inicio,hora_fim")
      .eq("id", data.sessaoId)
      .single();
    if (sessaoRes.error) throw sessaoRes.error;
    const turmaRes = await s
      .from("turmas")
      .select("curso_id")
      .eq("id", sessaoRes.data.turma_id)
      .single();
    if (turmaRes.error) throw turmaRes.error;
    const cfgRes = await s
      .from("presenca_configuracoes")
      .select("limiar_permanencia_pct,limiar_progresso_pct")
      .eq("curso_id", turmaRes.data.curso_id)
      .maybeSingle();
    if (cfgRes.error) throw cfgRes.error;
    const limiarPermanencia = cfgRes.data?.limiar_permanencia_pct ?? 75;
    const limiarProgresso = cfgRes.data?.limiar_progresso_pct ?? 75;

    const [hi, mi] = sessaoRes.data.hora_inicio.split(":").map(Number);
    const [hf, mf] = sessaoRes.data.hora_fim.split(":").map(Number);
    const duracao = Math.max(1, hf * 60 + mf - (hi * 60 + mi));
    const agora = new Date().toISOString();

    const linhas = data.registos.map((r) => {
      const permanenciaPct = Math.round((r.minutosPermanencia / duracao) * 100);
      const presente = permanenciaPct >= limiarPermanencia && r.progressoPct >= limiarProgresso;
      return {
        sessao_id: data.sessaoId,
        turma_id: sessaoRes.data.turma_id,
        inscricao_id: r.inscricaoId,
        nome_formando: r.nome,
        estado: (presente ? "presente" : "ausente") as never,
        origem: "calculada" as never,
        minutos_permanencia: r.minutosPermanencia,
        progresso_pct: r.progressoPct,
        valor_introduzido_manualmente: true,
        introduzido_por_nome: data.introduzidoPorNome,
        introduzido_em: agora,
      };
    });
    if (linhas.length === 0) return { gravadas: 0, duracao, limiarPermanencia, limiarProgresso };

    const { data: inseridas, error } = await s.from("presencas").insert(linhas).select("id,estado");
    if (error) throw error;
    return {
      gravadas: (inseridas ?? []).length,
      presentes: (inseridas ?? []).filter((i) => i.estado === "presente").length,
      duracao,
      limiarPermanencia,
      limiarProgresso,
    };
  });

/**
 * Correcção de uma presença pelo formador. Exige justificação escrita, que
 * fica no registo de auditoria. A marcação anterior mantém-se — a correcção é
 * acrescentada por cima.
 */
export const corrigirPresenca = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      sessaoId: string;
      inscricaoId: string;
      nome: string;
      estado: EstadoPresenca;
      motivo: string | null;
      justificacao: string;
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    if (data.justificacao.trim().length < 5)
      return { ok: false as const, motivo: "A correcção exige uma justificação escrita." };
    if (data.estado === "justificado" && (data.motivo ?? "").trim().length === 0)
      return { ok: false as const, motivo: "Uma falta justificada exige o motivo por escrito." };

    const s = await admin();
    const sessaoRes = await s
      .from("turma_sessoes")
      .select("id,turma_id")
      .eq("id", data.sessaoId)
      .single();
    if (sessaoRes.error) throw sessaoRes.error;

    const { error } = await s.from("presencas").insert({
      sessao_id: data.sessaoId,
      turma_id: sessaoRes.data.turma_id,
      inscricao_id: data.inscricaoId,
      nome_formando: data.nome,
      estado: data.estado as never,
      motivo: data.estado === "justificado" ? (data.motivo ?? "").trim() : null,
      origem: "correccao" as never,
      justificacao_correccao: data.justificacao.trim(),
    });
    if (error) throw error;
    return { ok: true as const };
  });

/**
 * Limiares de presença das sessões virtuais e base de assiduidade que vale
 * para a certificação, por curso.
 */
export const guardarConfigPresencaVirtual = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      cursoId: string;
      limiarPermanenciaPct: number;
      limiarProgressoPct: number;
      baseAssiduidade?: BaseAssiduidade;
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const s = await admin();
    const { error } = await s.from("presenca_configuracoes").upsert(
      {
        curso_id: data.cursoId,
        limiar_permanencia_pct: data.limiarPermanenciaPct,
        limiar_progresso_pct: data.limiarProgressoPct,
        base_assiduidade: (data.baseAssiduidade ?? "estrita") as never,
        actualizado_em: new Date().toISOString(),
      },
      { onConflict: "curso_id" },
    );
    if (error) throw error;
    return { ok: true };
  });

/** Base de assiduidade escolhida para cada curso, para o ecrã de configuração. */
export const listarBasesAssiduidade = createServerFn({ method: "GET" })
  .middleware([sessaoObrigatoria])
  .handler(async ({ context }) => {
  await exigirGestao(context as unknown as ContextoAutenticado, "ler");
  const s = await admin();
  const [cursosRes, configRes] = await Promise.all([
    s.from("cursos").select("id,titulo,ordem").order("ordem"),
    s.from("presenca_configuracoes").select("*"),
  ]);
  for (const r of [cursosRes, configRes]) if (r.error) throw r.error;
  return {
    cursos: (cursosRes.data ?? []).map((c) => {
      const cfg = (configRes.data ?? []).find((x) => x.curso_id === c.id);
      return {
        id: c.id,
        titulo: c.titulo,
        base: (cfg?.base_assiduidade as BaseAssiduidade) ?? "estrita",
        limiarPermanenciaPct: cfg?.limiar_permanencia_pct ?? 75,
        limiarProgressoPct: cfg?.limiar_progresso_pct ?? 75,
      };
    }),
  };
});
