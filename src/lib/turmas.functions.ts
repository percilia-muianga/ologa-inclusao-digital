import { createServerFn } from "@tanstack/react-start";

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
export const listarTurmas = createServerFn({ method: "GET" }).handler(async () => {
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
  .validator((codigo: string) => codigo)
  .handler(async ({ data: codigo }) => {
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
      inscritos: (inscricoesRes.data ?? []).filter((i) => i.estado !== "desistiu").length,
      horasAgendadas: Math.round((minutos / 60) * 100) / 100,
      cargaHorariaCurso: cargaCurso,
      cargaConfere: cargaCurso > 0 && Math.abs(minutos / 60 - cargaCurso) < 0.01,
    };
  });
