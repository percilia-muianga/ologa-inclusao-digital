import { createServerFn } from "@tanstack/react-start";
import {
  calcularAssiduidade,
  marcacaoEfectiva,
  sessoesRealizadas,
  LIMIAR_ASSIDUIDADE,
  type MarcacaoBruta,
  type EstadoPresenca,
} from "@/lib/presencas.server";

export { LIMIAR_ASSIDUIDADE };
export type { EstadoPresenca };

export const ESTADOS_PRESENCA: ReadonlyArray<readonly [EstadoPresenca, string]> = [
  ["presente", "Presente"],
  ["ausente", "Ausente"],
  ["justificado", "Justificado"],
] as const;

export function rotuloEstadoPresenca(valor: string): string {
  return ESTADOS_PRESENCA.find(([v]) => v === valor)?.[1] ?? valor;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Turmas com sessões, para o formador escolher onde vai marcar presenças. */
export const listarTurmasComSessoes = createServerFn({ method: "GET" }).handler(async () => {
  const s = await admin();
  const [turmasRes, sessoesRes, inscricoesRes, presencasRes, cursosRes] = await Promise.all([
    s
      .from("turmas")
      .select("id,designacao,codigo_inscricao,provincia,distrito,estado,curso_id,data_inicio,data_fim")
      .order("criado_em", { ascending: false }),
    s.from("turma_sessoes").select("id,turma_id,data,tema,modalidade,ordem").order("ordem"),
    s.from("turma_inscricoes").select("id,turma_id,nome,estado"),
    s.from("presencas").select("*"),
    s.from("cursos").select("id,titulo"),
  ]);
  for (const r of [turmasRes, sessoesRes, inscricoesRes, presencasRes, cursosRes])
    if (r.error) throw r.error;

  const cursos = cursosRes.data ?? [];
  const marcacoes = (presencasRes.data ?? []) as unknown as MarcacaoBruta[];

  const turmas = (turmasRes.data ?? []).map((t) => {
    const sessoes = (sessoesRes.data ?? []).filter((x) => x.turma_id === t.id);
    const inscritos = (inscricoesRes.data ?? []).filter(
      (i) => i.turma_id === t.id && i.estado !== "desistiu",
    );
    const linhas = calcularAssiduidade(
      sessoes.map((x) => ({ id: x.id, data: x.data })),
      inscritos.map((i) => ({ id: i.id, nome: i.nome })),
      marcacoes.filter((m) => m.turma_id === t.id),
    );
    const comTaxa = linhas.filter((l) => l.taxaPct !== null);
    return {
      id: t.id,
      designacao: t.designacao,
      codigo: t.codigo_inscricao,
      provincia: t.provincia,
      distrito: t.distrito,
      estado: t.estado,
      cursoTitulo: cursos.find((c) => c.id === t.curso_id)?.titulo ?? "",
      totalSessoes: sessoes.length,
      sessoesRealizadas: sessoesRealizadas(sessoes.map((x) => ({ id: x.id, data: x.data }))).size,
      inscritos: inscritos.length,
      abaixoDoLimiar: linhas.filter((l) => l.abaixoDoLimiar).length,
      emRisco: linhas.filter((l) => l.emRisco).length,
      assiduidadeMediaPct: comTaxa.length
        ? Math.round((comTaxa.reduce((a, l) => a + (l.taxaPct ?? 0), 0) / comTaxa.length) * 10) / 10
        : null,
    };
  });

  return { turmas };
});

/** Assiduidade de uma turma, formando a formando, com alerta de risco. */
export const assiduidadeDaTurma = createServerFn({ method: "GET" })
  .validator((codigo: string) => codigo)
  .handler(async ({ data: codigo }) => {
    const s = await admin();
    const turmaRes = await s
      .from("turmas")
      .select("id,designacao,codigo_inscricao,provincia,distrito,curso_id,data_inicio,data_fim,estado")
      .eq("codigo_inscricao", codigo.toUpperCase())
      .maybeSingle();
    if (turmaRes.error) throw turmaRes.error;
    if (!turmaRes.data) return null;
    const turma = turmaRes.data;

    const [sessoesRes, inscricoesRes, presencasRes, cursoRes] = await Promise.all([
      s
        .from("turma_sessoes")
        .select("id,ordem,data,hora_inicio,hora_fim,tema,modalidade,formador_nome")
        .eq("turma_id", turma.id)
        .order("ordem"),
      s.from("turma_inscricoes").select("id,nome,estado").eq("turma_id", turma.id),
      s.from("presencas").select("*").eq("turma_id", turma.id),
      s.from("cursos").select("id,titulo").eq("id", turma.curso_id).maybeSingle(),
    ]);
    for (const r of [sessoesRes, inscricoesRes, presencasRes, cursoRes]) if (r.error) throw r.error;

    const sessoes = sessoesRes.data ?? [];
    const inscritos = (inscricoesRes.data ?? []).filter((i) => i.estado !== "desistiu");
    const marcacoes = (presencasRes.data ?? []) as unknown as MarcacaoBruta[];
    const efectivas = marcacaoEfectiva(marcacoes);
    const realizadas = sessoesRealizadas(sessoes.map((x) => ({ id: x.id, data: x.data })));

    return {
      turma,
      cursoTitulo: cursoRes.data?.titulo ?? "",
      sessoes: sessoes.map((x) => ({
        ...x,
        realizada: realizadas.has(x.id),
        marcadas: inscritos.filter((i) => efectivas.has(`${x.id}|${i.id}`)).length,
      })),
      inscritos: inscritos.length,
      limiar: LIMIAR_ASSIDUIDADE,
      linhas: calcularAssiduidade(
        sessoes.map((x) => ({ id: x.id, data: x.data })),
        inscritos.map((i) => ({ id: i.id, nome: i.nome })),
        marcacoes,
      ),
    };
  });

/** Folha de uma sessão: formandos da turma e a marcação que já existe. */
export const obterFolhaSessao = createServerFn({ method: "GET" })
  .validator((sessaoId: string) => sessaoId)
  .handler(async ({ data: sessaoId }) => {
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
        actualizado_em: null,
      },
      formandos: inscritos.map((i) => {
        const historico = marcacoes.filter((m) => m.inscricao_id === i.id);
        const actual = efectivas.get(`${sessaoId}|${i.id}`) ?? null;
        return {
          inscricaoId: i.id,
          nome: i.nome,
          actual,
          conflito: historico.some((h) => h.conflito),
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
  .validator(
    (dados: {
      sessaoId: string;
      origemOffline: boolean;
      aparelho: string | null;
      marcadoPorNome: string | null;
      marcacoes: MarcacaoEnvio[];
    }) => dados,
  )
  .handler(async ({ data }) => {
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
 * progresso, comparados com o limiar configurado para o curso.
 */
export const calcularPresencasVirtuais = createServerFn({ method: "POST" })
  .validator(
    (dados: {
      sessaoId: string;
      registos: Array<{
        inscricaoId: string;
        nome: string;
        minutosPermanencia: number;
        progressoPct: number;
      }>;
    }) => dados,
  )
  .handler(async ({ data }) => {
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
  .handler(async ({ data }) => {
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

/** Limiares de presença das sessões virtuais, por curso. */
export const guardarConfigPresencaVirtual = createServerFn({ method: "POST" })
  .validator(
    (dados: { cursoId: string; limiarPermanenciaPct: number; limiarProgressoPct: number }) => dados,
  )
  .handler(async ({ data }) => {
    const s = await admin();
    const { error } = await s.from("presenca_configuracoes").upsert(
      {
        curso_id: data.cursoId,
        limiar_permanencia_pct: data.limiarPermanenciaPct,
        limiar_progresso_pct: data.limiarProgressoPct,
        actualizado_em: new Date().toISOString(),
      },
      { onConflict: "curso_id" },
    );
    if (error) throw error;
    return { ok: true };
  });
