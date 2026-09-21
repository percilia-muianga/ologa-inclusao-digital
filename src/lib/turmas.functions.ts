import { createServerFn } from "@tanstack/react-start";
import {
  sessaoObrigatoria,
  exigirGestao,
  clienteDeEscritaGestao,
  type ContextoAutenticado,
} from "@/lib/guardas";

export type TurmaResumo = {
  id: string;
  designacao: string;
  codigoInscricao: string;
  provincia: string;
  distrito: string;
  localFormacao: string | null;
  modalidade: string;
  estado: string;
  formadorPrincipal: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  limiteFormandos: number;
  inscritos: number;
  cursoId: string;
  cursoTitulo: string;
  cursoSlug: string;
};

export const ESTADOS_TURMA: ReadonlyArray<readonly [string, string]> = [
  ["planeada", "Planeada"],
  ["inscricoes_abertas", "Inscrições abertas"],
  ["a_decorrer", "A decorrer"],
  ["concluida", "Concluída"],
  ["cancelada", "Cancelada"],
] as const;

export function rotuloEstadoTurma(valor: string): string {
  return ESTADOS_TURMA.find(([v]) => v === valor)?.[1] ?? valor;
}

/** Lista todas as turmas com o curso associado e o número de inscritos. */
export const listarTurmas = createServerFn({ method: "GET" })
  .middleware([sessaoObrigatoria])
  .handler(async ({ context }) => {
  await exigirGestao(context as unknown as ContextoAutenticado, "ler");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [turmasRes, cursosRes, inscricoesRes] = await Promise.all([
    supabaseAdmin
      .from("turmas")
      .select(
        "id,designacao,codigo_inscricao,provincia,distrito,local_formacao,modalidade,estado,formador_principal_nome,data_inicio,data_fim,limite_formandos,curso_id",
      )
      .order("criado_em", { ascending: false }),
    supabaseAdmin.from("cursos").select("id,titulo,slug"),
    supabaseAdmin.from("turma_inscricoes").select("turma_id,estado"),
  ]);
  if (turmasRes.error) throw turmasRes.error;
  if (cursosRes.error) throw cursosRes.error;
  if (inscricoesRes.error) throw inscricoesRes.error;

  const cursos = cursosRes.data ?? [];
  const inscritosPorTurma = new Map<string, number>();
  for (const i of inscricoesRes.data ?? []) {
    if (i.estado === "desistiu") continue;
    inscritosPorTurma.set(i.turma_id, (inscritosPorTurma.get(i.turma_id) ?? 0) + 1);
  }

  const turmas: TurmaResumo[] = (turmasRes.data ?? []).map((t) => {
    const curso = cursos.find((c) => c.id === t.curso_id);
    return {
      id: t.id,
      designacao: t.designacao,
      codigoInscricao: t.codigo_inscricao,
      provincia: t.provincia,
      distrito: t.distrito,
      localFormacao: t.local_formacao,
      modalidade: t.modalidade,
      estado: t.estado,
      formadorPrincipal: t.formador_principal_nome,
      dataInicio: t.data_inicio,
      dataFim: t.data_fim,
      limiteFormandos: t.limite_formandos,
      inscritos: inscritosPorTurma.get(t.id) ?? 0,
      cursoId: t.curso_id,
      cursoTitulo: curso?.titulo ?? "Curso não encontrado",
      cursoSlug: curso?.slug ?? "",
    };
  });

  return {
    turmas,
    cursos: cursos.map((c) => ({ id: c.id, titulo: c.titulo })),
  };
});

/** Ficha de uma turma, pelo código de inscrição, com o cronograma de sessões. */
export const obterTurma = createServerFn({ method: "GET" })
  .middleware([sessaoObrigatoria])
  .validator((codigo: string) => codigo)
  .handler(async ({ data: codigo, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "ler");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const turmaRes = await supabaseAdmin
      .from("turmas")
      .select("*")
      .eq("codigo_inscricao", codigo.toUpperCase())
      .maybeSingle();
    if (turmaRes.error) throw turmaRes.error;
    if (!turmaRes.data) return null;
    const turma = turmaRes.data;

    const [cursoRes, sessoesRes, inscricoesRes] = await Promise.all([
      supabaseAdmin
        .from("cursos")
        .select("id,titulo,slug,carga_horaria,modalidade")
        .eq("id", turma.curso_id)
        .maybeSingle(),
      supabaseAdmin
        .from("turma_sessoes")
        .select("id,ordem,data,hora_inicio,hora_fim,tema,formador_nome,modalidade")
        .eq("turma_id", turma.id)
        .order("ordem"),
      supabaseAdmin.from("turma_inscricoes").select("id,estado").eq("turma_id", turma.id),
    ]);
    if (cursoRes.error) throw cursoRes.error;
    if (sessoesRes.error) throw sessoesRes.error;
    if (inscricoesRes.error) throw inscricoesRes.error;

    const sessoes = sessoesRes.data ?? [];
    const minutos = sessoes.reduce((soma, s) => {
      const [hi, mi] = s.hora_inicio.split(":").map(Number);
      const [hf, mf] = s.hora_fim.split(":").map(Number);
      return soma + (hf * 60 + mf - (hi * 60 + mi));
    }, 0);
    const cargaCurso = cursoRes.data?.carga_horaria ?? 0;

    return {
      turma,
      curso: cursoRes.data,
      sessoes,
      inscritos: (inscricoesRes.data ?? []).filter((i: { estado: string }) => i.estado !== "desistiu").length,
      horasAgendadas: Math.round((minutos / 60) * 100) / 100,
      cargaHorariaCurso: cargaCurso,
      cargaConfere: cargaCurso > 0 && Math.abs(minutos / 60 - cargaCurso) < 0.01,
    };
  });

export type DadosTurma = {
  cursoId: string;
  designacao: string;
  provincia: string;
  distrito: string;
  localFormacao: string | null;
  modalidade: string;
  formadorPrincipal: string | null;
  formadoresAuxiliares: string[];
  dataInicio: string | null;
  dataFim: string | null;
  numComputadores: number | null;
  estado: string;
};

/** Listas de apoio aos formulários de turma: cursos, locais e distritos. */
export const referenciasTurma = createServerFn({ method: "GET" })
  .middleware([sessaoObrigatoria])
  .handler(async ({ context }) => {
  await exigirGestao(context as unknown as ContextoAutenticado, "ler");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [cursosRes, locaisRes, distritosRes] = await Promise.all([
    supabaseAdmin.from("cursos").select("id,titulo,carga_horaria,modalidade").order("ordem"),
    supabaseAdmin.from("locais_formacao").select("provincia,local").order("ordem"),
    supabaseAdmin
      .from("distritos_tdr")
      .select("provincia,nome,ordem_provincia,ordem")
      .order("ordem_provincia")
      .order("ordem"),
  ]);
  if (cursosRes.error) throw cursosRes.error;
  if (locaisRes.error) throw locaisRes.error;
  if (distritosRes.error) throw distritosRes.error;

  const porProvincia = new Map<string, string[]>();
  for (const d of distritosRes.data ?? []) {
    const lista = porProvincia.get(d.provincia) ?? [];
    lista.push(d.nome);
    porProvincia.set(d.provincia, lista);
  }
  return {
    cursos: cursosRes.data ?? [],
    locais: locaisRes.data ?? [],
    distritos: [...porProvincia.entries()].map(([provincia, nomes]) => ({ provincia, nomes })),
  };
});

/** Cria uma turma. O código de inscrição é gerado pela base de dados. */
export const criarTurma = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator((dados: DadosTurma) => dados)
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { data: criada, error } = await db
      .from("turmas")
      .insert({
        curso_id: data.cursoId,
        designacao: data.designacao.trim(),
        provincia: data.provincia,
        distrito: data.distrito,
        local_formacao: data.localFormacao,
        modalidade: data.modalidade,
        formador_principal_nome: data.formadorPrincipal,
        formadores_auxiliares: data.formadoresAuxiliares,
        data_inicio: data.dataInicio,
        data_fim: data.dataFim,
        num_computadores: data.numComputadores,
        estado: data.estado as never,
      })
      .select("id,codigo_inscricao,designacao")
      .single();
    if (error) throw error;
    return criada;
  });

/** Actualiza uma turma. A alteração fica no registo de auditoria (gatilho na base de dados). */
export const actualizarTurma = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator((dados: DadosTurma & { id: string }) => dados)
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { data: actualizada, error } = await db
      .from("turmas")
      .update({
        curso_id: data.cursoId,
        designacao: data.designacao.trim(),
        provincia: data.provincia,
        distrito: data.distrito,
        local_formacao: data.localFormacao,
        modalidade: data.modalidade,
        formador_principal_nome: data.formadorPrincipal,
        formadores_auxiliares: data.formadoresAuxiliares,
        data_inicio: data.dataInicio,
        data_fim: data.dataFim,
        num_computadores: data.numComputadores,
        estado: data.estado as never,
      })
      .eq("id", data.id)
      .select("codigo_inscricao")
      .single();
    if (error) throw error;
    return actualizada;
  });

export type DadosSessao = {
  data: string;
  horaInicio: string;
  horaFim: string;
  tema: string;
  formadorNome: string | null;
  modalidade: string;
};

/** Acrescenta uma sessão ao cronograma, na ordem seguinte. */
export const criarSessao = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator((dados: DadosSessao & { turmaId: string }) => dados)
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { data: existentes, error: erroOrdem } = await db
      .from("turma_sessoes")
      .select("ordem")
      .eq("turma_id", data.turmaId)
      .order("ordem", { ascending: false })
      .limit(1);
    if (erroOrdem) throw erroOrdem;
    const ordem = (existentes?.[0]?.ordem ?? 0) + 1;

    const { error } = await db.from("turma_sessoes").insert({
      turma_id: data.turmaId,
      ordem,
      data: data.data,
      hora_inicio: data.horaInicio,
      hora_fim: data.horaFim,
      tema: data.tema.trim(),
      formador_nome: data.formadorNome,
      modalidade: data.modalidade,
    });
    if (error) throw error;
    return { ordem };
  });

/** Altera uma sessão do cronograma. */
export const actualizarSessao = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator((dados: DadosSessao & { id: string }) => dados)
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { error } = await db
      .from("turma_sessoes")
      .update({
        data: data.data,
        hora_inicio: data.horaInicio,
        hora_fim: data.horaFim,
        tema: data.tema.trim(),
        formador_nome: data.formadorNome,
        modalidade: data.modalidade,
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/** Remove uma sessão do cronograma. A remoção fica registada na auditoria. */
export const removerSessao = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator((dados: { id: string }) => dados)
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const { error } = await db.from("turma_sessoes").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/**
 * Inscreve um formando numa turma. A inscrição é recusada quando a turma já
 * atingiu o limite de formandos definido no Termo de Referência.
 */
export const inscreverFormando = createServerFn({ method: "POST" })
  .middleware([sessaoObrigatoria])
  .validator((dados: { turmaId: string; nome: string; email: string | null }) => dados)
  .handler(async ({ data, context }) => {
    await exigirGestao(context as unknown as ContextoAutenticado, "escrever");
    const db = clienteDeEscritaGestao(context as unknown as ContextoAutenticado);
    const turmaRes = await db
      .from("turmas")
      .select("id,limite_formandos")
      .eq("id", data.turmaId)
      .maybeSingle();
    if (turmaRes.error) throw turmaRes.error;
    if (!turmaRes.data) return { ok: false as const, motivo: "Turma não encontrada." };

    const inscritosRes = await db
      .from("turma_inscricoes")
      .select("id,estado")
      .eq("turma_id", data.turmaId);
    if (inscritosRes.error) throw inscritosRes.error;
    const activos = (inscritosRes.data ?? []).filter((i: { estado: string }) => i.estado !== "desistiu").length;
    if (activos >= turmaRes.data.limite_formandos) {
      return {
        ok: false as const,
        motivo: `A turma está cheia: já tem ${activos} formandos, que é o limite de ${turmaRes.data.limite_formandos}. Não é possível inscrever mais ninguém nesta turma.`,
      };
    }

    const { error } = await db.from("turma_inscricoes").insert({
      turma_id: data.turmaId,
      nome: data.nome.trim(),
      email: data.email,
    });
    if (error) throw error;
    return { ok: true as const, inscritos: activos + 1 };
  });
