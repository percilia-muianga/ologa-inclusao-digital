import { createServerFn } from "@tanstack/react-start";
import { sessaoObrigatoria, exigirGestao, type ContextoAutenticado } from "@/lib/guardas";

export type WorkshopResumo = {
  id: string;
  tipo: "provincial" | "distrital";
  provincia: string;
  distrito: string | null;
  local: string | null;
  data: string | null;
  duracaoHoras: number;
  facilitador: string | null;
  previstos: number;
  efectivos: number;
  estado: string;
  participantes: number;
};

export const ESTADOS_WORKSHOP: ReadonlyArray<readonly [string, string]> = [
  ["planeado", "Planeado"],
  ["confirmado", "Confirmado"],
  ["realizado", "Realizado"],
  ["cancelado", "Cancelado"],
] as const;

export function rotuloEstadoWorkshop(valor: string): string {
  return ESTADOS_WORKSHOP.find(([v]) => v === valor)?.[1] ?? valor;
}

/** Listas de referência do Termo de Referência: locais de formação e distritos. */
export const listarReferenciasTdr = createServerFn({ method: "GET" })
  .middleware([sessaoObrigatoria])
  .handler(async ({ context }) => {
  await exigirGestao(context as unknown as ContextoAutenticado, "ler");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [locaisRes, distritosRes, configRes] = await Promise.all([
    supabaseAdmin.from("locais_formacao").select("ordem,provincia,local").order("ordem"),
    supabaseAdmin
      .from("distritos_tdr")
      .select("provincia,ordem_provincia,ordem,nome")
      .order("ordem_provincia")
      .order("ordem"),
    supabaseAdmin.from("configuracoes_programa").select("chave,valor"),
  ]);
  if (locaisRes.error) throw locaisRes.error;
  if (distritosRes.error) throw distritosRes.error;
  if (configRes.error) throw configRes.error;

  const porProvincia = new Map<string, string[]>();
  for (const d of distritosRes.data ?? []) {
    const lista = porProvincia.get(d.provincia) ?? [];
    lista.push(d.nome);
    porProvincia.set(d.provincia, lista);
  }

  const config: Record<string, string> = {};
  for (const c of configRes.data ?? []) config[c.chave] = c.valor;

  return {
    locais: locaisRes.data ?? [],
    distritos: [...porProvincia.entries()].map(([provincia, nomes]) => ({ provincia, nomes })),
    totalDistritos: (distritosRes.data ?? []).length,
    config,
  };
});

/** Lista de workshops, com somatórios por província e por tipo. */
export const listarWorkshops = createServerFn({ method: "GET" })
  .middleware([sessaoObrigatoria])
  .handler(async ({ context }) => {
  await exigirGestao(context as unknown as ContextoAutenticado, "ler");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [wsRes, partRes, configRes, locaisRes] = await Promise.all([
    supabaseAdmin
      .from("workshops")
      .select(
        "id,tipo,provincia,distrito,local,data,duracao_horas,facilitador_nome,participantes_previstos,participantes_efectivos,estado",
      )
      .order("criado_em", { ascending: false }),
    supabaseAdmin.from("workshop_participantes").select("workshop_id"),
    supabaseAdmin.from("configuracoes_programa").select("chave,valor"),
    supabaseAdmin.from("locais_formacao").select("ordem,provincia,local").order("ordem"),
  ]);
  if (wsRes.error) throw wsRes.error;
  if (partRes.error) throw partRes.error;
  if (configRes.error) throw configRes.error;
  if (locaisRes.error) throw locaisRes.error;

  const contagem = new Map<string, number>();
  for (const p of partRes.data ?? [])
    contagem.set(p.workshop_id, (contagem.get(p.workshop_id) ?? 0) + 1);

  const workshops: WorkshopResumo[] = (wsRes.data ?? []).map((w) => ({
    id: w.id,
    tipo: w.tipo as "provincial" | "distrital",
    provincia: w.provincia,
    distrito: w.distrito,
    local: w.local,
    data: w.data,
    duracaoHoras: Number(w.duracao_horas),
    facilitador: w.facilitador_nome,
    previstos: w.participantes_previstos,
    efectivos: w.participantes_efectivos,
    estado: w.estado,
    participantes: contagem.get(w.id) ?? 0,
  }));

  const config: Record<string, string> = {};
  for (const c of configRes.data ?? []) config[c.chave] = c.valor;

  return { workshops, config, locais: locaisRes.data ?? [] };
});

/** Ficha de um workshop com os participantes registados. */
export const obterWorkshop = createServerFn({ method: "GET" })
  .middleware([sessaoObrigatoria])
  .validator((id: string) => id)
  .handler(async ({ data: id, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "ler");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const wsRes = await supabaseAdmin.from("workshops").select("*").eq("id", id).maybeSingle();
    if (wsRes.error) throw wsRes.error;
    if (!wsRes.data) return null;

    const [partRes, avalRes, satRes] = await Promise.all([
      supabaseAdmin
        .from("workshop_participantes")
        .select("id,nome,entidade,provincia,distrito,genero,contacto,duplicado_provavel,origem_offline,registado_em")
        .eq("workshop_id", id)
        .order("registado_em"),
      supabaseAdmin
        .from("avaliacoes_conhecimento")
        .select("momento,pontuacao,total")
        .eq("workshop_id", id),
      supabaseAdmin.from("questionarios_satisfacao").select("pontuacao").eq("workshop_id", id),
    ]);
    if (partRes.error) throw partRes.error;
    if (avalRes.error) throw avalRes.error;
    if (satRes.error) throw satRes.error;

    const media = (m: "pre" | "pos") => {
      const lista = (avalRes.data ?? []).filter((a) => a.momento === m && a.total > 0);
      if (lista.length === 0) return null;
      return (
        Math.round(
          (lista.reduce((s, a) => s + (a.pontuacao / a.total) * 100, 0) / lista.length) * 10,
        ) / 10
      );
    };
    const pre = media("pre");
    const pos = media("pos");
    const satisfacao = (satRes.data ?? []).length
      ? Math.round(
          ((satRes.data ?? []).reduce((s, q) => s + q.pontuacao, 0) / (satRes.data ?? []).length) *
            10,
        ) / 10
      : null;

    return {
      workshop: wsRes.data,
      participantes: partRes.data ?? [],
      preMedia: pre,
      posMedia: pos,
      evolucaoPp: pre !== null && pos !== null ? Math.round((pos - pre) * 10) / 10 : null,
      satisfacaoMedia: satisfacao,
    };
  });

export const criarWorkshop = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      tipo: "provincial" | "distrital";
      provincia: string;
      distrito: string | null;
      local: string | null;
      data: string | null;
      duracaoHoras: number;
      facilitador: string | null;
      previstos: number;
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { data: criado, error } = await db
      .from("workshops")
      .insert({
        tipo: data.tipo,
        provincia: data.provincia,
        distrito: data.distrito,
        local: data.local,
        data: data.data,
        duracao_horas: data.duracaoHoras,
        facilitador_nome: data.facilitador,
        participantes_previstos: data.previstos,
      })
      .select("id")
      .single();
    if (error) throw error;
    return criado;
  });

/**
 * Registo de participantes. Recebe lotes (incluindo folhas preenchidas sem
 * ligação): soma sempre os registos, nunca substitui nem apaga. Participantes
 * com o mesmo nome e contacto na mesma sessão ficam assinalados como duplicado
 * provável, para revisão manual.
 */
export const registarParticipantes = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      workshopId: string;
      origemOffline: boolean;
      participantes: Array<{
        nome: string;
        entidade: string | null;
        provincia: string | null;
        distrito: string | null;
        genero: string | null;
        contacto: string | null;
      }>;
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const linhas = data.participantes
      .filter((p) => p.nome.trim().length > 0)
      .map((p) => ({
        workshop_id: data.workshopId,
        nome: p.nome.trim(),
        entidade: p.entidade,
        provincia: p.provincia,
        distrito: p.distrito,
        genero: (p.genero || null) as never,
        contacto: p.contacto,
        origem_offline: data.origemOffline,
      }));
    if (linhas.length === 0) return { registados: 0, duplicados: 0 };

    const { data: inseridos, error } = await db
      .from("workshop_participantes")
      .insert(linhas)
      .select("id,duplicado_provavel");
    if (error) throw error;

    const { count } = await db
      .from("workshop_participantes")
      .select("id", { count: "exact", head: true })
      .eq("workshop_id", data.workshopId);
    await db
      .from("workshops")
      .update({ participantes_efectivos: count ?? 0 })
      .eq("id", data.workshopId);

    return {
      registados: (inseridos ?? []).length,
      duplicados: (inseridos ?? []).filter((i) => i.duplicado_provavel).length,
    };
  });

/** Pré-teste e pós-teste de um workshop ou de uma turma. */
export const registarAvaliacaoConhecimento = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      momento: "pre" | "pos";
      workshopId?: string | null;
      turmaId?: string | null;
      cursoId?: string | null;
      provincia?: string | null;
      pontuacao: number;
      total: number;
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { error } = await db.from("avaliacoes_conhecimento").insert({
      momento: data.momento,
      workshop_id: data.workshopId ?? null,
      turma_id: data.turmaId ?? null,
      curso_id: data.cursoId ?? null,
      provincia: data.provincia ?? null,
      pontuacao: data.pontuacao,
      total: data.total,
    });
    if (error) throw error;
    return { ok: true };
  });

/** Questionário de satisfação no final de cada acção. */
export const registarSatisfacao = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      workshopId?: string | null;
      turmaId?: string | null;
      provincia?: string | null;
      pontuacao: number;
      comentario?: string | null;
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { error } = await db.from("questionarios_satisfacao").insert({
      workshop_id: data.workshopId ?? null,
      turma_id: data.turmaId ?? null,
      provincia: data.provincia ?? null,
      pontuacao: data.pontuacao,
      comentario: data.comentario ?? null,
    });
    if (error) throw error;
    return { ok: true };
  });

/** Inquérito de eficácia três meses depois da formação (recolha pela ATDI). */
export const registarInqueritoEficacia = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      workshopId?: string | null;
      turmaId?: string | null;
      cursoId?: string | null;
      provincia?: string | null;
      nomeParticipante?: string | null;
      aplicaCompetencias: boolean;
      observacoes?: string | null;
      registadoPor?: string | null;
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { error } = await db.from("inqueritos_eficacia").insert({
      workshop_id: data.workshopId ?? null,
      turma_id: data.turmaId ?? null,
      curso_id: data.cursoId ?? null,
      provincia: data.provincia ?? null,
      nome_participante: data.nomeParticipante ?? null,
      aplica_competencias: data.aplicaCompetencias,
      observacoes: data.observacoes ?? null,
      registado_por: data.registadoPor ?? null,
    });
    if (error) throw error;
    return { ok: true };
  });

/** Actualiza um workshop. A alteração fica no registo de auditoria. */
export const actualizarWorkshop = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator(
    (dados: {
      id: string;
      tipo: "provincial" | "distrital";
      provincia: string;
      distrito: string | null;
      local: string | null;
      data: string | null;
      duracaoHoras: number;
      facilitador: string | null;
      previstos: number;
      estado: string;
      observacoes: string | null;
    }) => dados,
  )
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { error } = await db
      .from("workshops")
      .update({
        tipo: data.tipo,
        provincia: data.provincia,
        distrito: data.distrito,
        local: data.local,
        data: data.data,
        duracao_horas: data.duracaoHoras,
        facilitador_nome: data.facilitador,
        participantes_previstos: data.previstos,
        estado: data.estado as never,
        observacoes: data.observacoes,
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
