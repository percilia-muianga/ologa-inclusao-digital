import { createServerFn } from "@tanstack/react-start";

export const listarCursosPrograma = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [cursosRes, relacoesRes, licoesRes] = await Promise.all([
    supabaseAdmin.from("cursos").select("id,ordem,slug,titulo,carga_horaria,modalidade,formandos_previstos,abrangencia").order("ordem"),
    supabaseAdmin.from("curso_modulos").select("curso_id,modulo_id"),
    supabaseAdmin.from("licoes").select("modulo_id,estado_conteudo"),
  ]);
  if (cursosRes.error) throw cursosRes.error;
  if (relacoesRes.error) throw relacoesRes.error;
  if (licoesRes.error) throw licoesRes.error;

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
    return {
      id: curso.id, ordem: curso.ordem, slug: curso.slug, titulo: curso.titulo,
      cargaHoraria: curso.carga_horaria, modalidade: curso.modalidade,
      formandosPrevistos: curso.formandos_previstos, abrangencia: curso.abrangencia,
      totalModulos: modulos.length,
      licoesPorFornecer: modulos.reduce((s, r) => s + (licoesPorModulo.get(r.modulo_id)?.porFornecer ?? 0), 0),
      licoesDisponiveis: modulos.reduce((s, r) => s + (licoesPorModulo.get(r.modulo_id)?.disponiveis ?? 0), 0),
    };
  });
  return { cursos, totalGeralPorFornecer: cursos.reduce((s, c) => s + c.licoesPorFornecer, 0) };
});

export const obterCursoPrograma = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
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
      return { ...modulo, ordem: r.ordem, transversal: r.transversal, licoes,
        porFornecer: licoes.filter((l) => l.estado_conteudo === "por_fornecer").length };
    });
    return { curso: cursoRes.data, modulos,
      totalPorFornecer: modulos.reduce((s, m) => s + m.porFornecer, 0) };
  });