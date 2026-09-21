import { createServerFn } from "@tanstack/react-start";

/**
 * Perguntas usadas em cada exame final, quando o curso ainda não tem
 * configuração própria gravada. Tem de acompanhar CONFIG_PADRAO em
 * avaliacao.functions.ts — é a mesma fonte para os dois ecrãs.
 */
const QUESTOES_POR_EXAME_PADRAO = 20;
/** Secção 10 do Termo de Referência: banco activo com o triplo do exame. */
const FACTOR_BANCO_TDR = 3;

export const listarCursosPrograma = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [cursosRes, relacoesRes, licoesRes, bancoRes, wsPerguntasRes, configRes, examesRes] =
    await Promise.all([
      supabaseAdmin.from("cursos").select("id,ordem,slug,titulo,carga_horaria,modalidade,formandos_previstos,abrangencia,minutos_avaliacao_orientacao").order("ordem"),
      supabaseAdmin.from("curso_modulos").select("curso_id,modulo_id,carga_horaria_minutos"),
      supabaseAdmin.from("licoes").select("modulo_id,estado_conteudo"),
      // O pré/pós-teste é outro instrumento e não conta para o banco do exame.
      supabaseAdmin.from("banco_questoes").select("curso_id,activa").eq("instrumento", "exame_final"),
      supabaseAdmin.from("workshop_perguntas").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("configuracoes_programa").select("chave,valor"),
      supabaseAdmin.from("exame_configuracoes").select("curso_id,numero_questoes"),
    ]);
  if (cursosRes.error) throw cursosRes.error;
  if (relacoesRes.error) throw relacoesRes.error;
  if (licoesRes.error) throw licoesRes.error;
  if (bancoRes.error) throw bancoRes.error;
  if (wsPerguntasRes.error) throw wsPerguntasRes.error;
  if (configRes.error) throw configRes.error;
  if (examesRes.error) throw examesRes.error;

  const config: Record<string, string> = {};
  for (const c of configRes.data ?? []) config[c.chave] = c.valor;
  // Instrumento distinto do exame final: banco de pré-teste e pós-teste.
  const minimoPrePos = Number(config["banco_perguntas_minimo_por_curso"] ?? 30);

  const activasPorCurso = new Map<string, number>();
  for (const q of bancoRes.data ?? [])
    if (q.activa) activasPorCurso.set(q.curso_id, (activasPorCurso.get(q.curso_id) ?? 0) + 1);

  const licoesPorModulo = new Map<string, { porFornecer: number; disponiveis: number }>();
  for (const licao of licoesRes.data ?? []) {
    const actual = licoesPorModulo.get(licao.modulo_id) ?? { porFornecer: 0, disponiveis: 0 };
    if (licao.estado_conteudo === "por_fornecer") actual.porFornecer += 1;
    else actual.disponiveis += 1;
    licoesPorModulo.set(licao.modulo_id, actual);
  }

  const relacoes = relacoesRes.data ?? [];
  const cursos = (cursosRes.data ?? []).map((curso) => {
    const modulos = relacoes.filter((r) => r.curso_id === curso.id);
    const questoesPorExame =
      (examesRes.data ?? []).find((e) => e.curso_id === curso.id)?.numero_questoes ??
      QUESTOES_POR_EXAME_PADRAO;
    const minimoBanco = questoesPorExame * FACTOR_BANCO_TDR;
    const activas = activasPorCurso.get(curso.id) ?? 0;
    // Minutos dos módulos mais os blocos de avaliação e orientação que não
    // pertencem a nenhum módulo (diagnóstico, pós-teste, exame final).
    const minutosCurriculo =
      modulos.reduce((s, r) => s + (r.carga_horaria_minutos ?? 0), 0) +
      (curso.minutos_avaliacao_orientacao ?? 0);
    const horasCurriculo = Math.round((minutosCurriculo / 60) * 10) / 10;
    return {
      id: curso.id, ordem: curso.ordem, slug: curso.slug, titulo: curso.titulo,
      cargaHoraria: curso.carga_horaria, modalidade: curso.modalidade,
      formandosPrevistos: curso.formandos_previstos, abrangencia: curso.abrangencia,
      totalModulos: modulos.length,
      licoesPorFornecer: modulos.reduce((s, r) => s + (licoesPorModulo.get(r.modulo_id)?.porFornecer ?? 0), 0),
      licoesDisponiveis: modulos.reduce((s, r) => s + (licoesPorModulo.get(r.modulo_id)?.disponiveis ?? 0), 0),
      questoesPorExame,
      minimoBanco,
      questoesActivas: activas,
      questoesPorFornecer: Math.max(0, minimoBanco - activas),
      horasCurriculo,
      // Não reduzimos módulos para fazer a soma bater certo: a divergência
      // fica assinalada para revisão pedagógica.
      revisaoPedagogicaPendente: horasCurriculo !== curso.carga_horaria,
    };
  });
  const perguntasWorkshops = wsPerguntasRes.count ?? 0;
  return {
    cursos,
    totalGeralPorFornecer: cursos.reduce((s, c) => s + c.licoesPorFornecer, 0),
    minimoPrePosTeste: minimoPrePos,
    questoesPorFornecerExames: cursos.reduce((s, c) => s + c.questoesPorFornecer, 0),
    perguntasWorkshops,
    perguntasPorFornecerWorkshops: Math.max(0, minimoPrePos - perguntasWorkshops),
    cursosEmRevisaoPedagogica: cursos.filter((c) => c.revisaoPedagogicaPendente).length,
  };
});

export const obterCursoPrograma = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cursoRes = await supabaseAdmin.from("cursos")
      .select("id,ordem,slug,titulo,carga_horaria,modalidade,formandos_previstos,abrangencia,objectivos,publico_alvo,pre_requisitos,materiais")
      .eq("slug", slug).maybeSingle();
    if (cursoRes.error) throw cursoRes.error;
    if (!cursoRes.data) return null;

    const relacoesRes = await supabaseAdmin.from("curso_modulos")
      .select("modulo_id,ordem,carga_horaria_minutos,obrigatorio,transversal")
      .eq("curso_id", cursoRes.data.id).order("ordem");
    if (relacoesRes.error) throw relacoesRes.error;
    const ids = (relacoesRes.data ?? []).map((r) => r.modulo_id);
    const [modulosRes, licoesRes] = await Promise.all([
      supabaseAdmin.from("modulos").select("id,titulo,descricao,icone,cor_fundo").in("id", ids),
      supabaseAdmin.from("licoes").select("id,modulo_id,ordem,titulo,duracao,conteudo_elearning,estado_conteudo").in("modulo_id", ids).order("ordem"),
    ]);
    if (modulosRes.error) throw modulosRes.error;
    if (licoesRes.error) throw licoesRes.error;
    const modulos = (relacoesRes.data ?? []).map((r) => {
      const modulo = (modulosRes.data ?? []).find((m) => m.id === r.modulo_id)!;
      const licoes = (licoesRes.data ?? []).filter((l) => l.modulo_id === r.modulo_id);
      return { ...modulo, ordem: r.ordem, transversal: r.transversal,
        minutos: r.carga_horaria_minutos ?? 0, licoes,
        porFornecer: licoes.filter((l) => l.estado_conteudo === "por_fornecer").length };
    });
    const minutosCurriculo = modulos.reduce((s, m) => s + m.minutos, 0);
    return { curso: cursoRes.data, modulos,
      totalPorFornecer: modulos.reduce((s, m) => s + m.porFornecer, 0),
      horasCurriculo: Math.round((minutosCurriculo / 60) * 10) / 10 };
  });

/**
 * Divergências entre a carga horária oficial do curso (secção 14 do Termo de
 * Referência) e a soma dos módulos. Área de gestão, não do formando.
 */
export const pendenciasCurriculares = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [cursosRes, relacoesRes] = await Promise.all([
    supabaseAdmin.from("cursos").select("id,titulo,carga_horaria,modalidade").order("ordem"),
    supabaseAdmin.from("curso_modulos").select("curso_id,carga_horaria_minutos"),
  ]);
  if (cursosRes.error) throw cursosRes.error;
  if (relacoesRes.error) throw relacoesRes.error;
  return (cursosRes.data ?? []).map((c) => {
    const minutos = (relacoesRes.data ?? [])
      .filter((r) => r.curso_id === c.id)
      .reduce((s, r) => s + (r.carga_horaria_minutos ?? 0), 0);
    const horas = Math.round((minutos / 60) * 10) / 10;
    return {
      id: c.id,
      titulo: c.titulo,
      modalidade: c.modalidade,
      cargaOficial: c.carga_horaria,
      horasCurriculo: horas,
      pendente: horas !== c.carga_horaria,
    };
  });
});
