import { createServerFn } from "@tanstack/react-start";

const LIMITE_DIVULGACAO = 5;

function mediaPct(lista: Array<{ pontuacao: number; total: number }>): number | null {
  const uteis = lista.filter((a) => a.total > 0);
  if (uteis.length === 0) return null;
  return (
    Math.round((uteis.reduce((s, a) => s + (a.pontuacao / a.total) * 100, 0) / uteis.length) * 10) /
    10
  );
}

/**
 * Indicadores do Painel Nacional, organizados pelos tipos do Termo de
 * Referência: desempenho da formação, satisfação e eficácia, mais a execução
 * dos workshops. Cortes com menos de cinco pessoas são suprimidos.
 */
export const obterIndicadoresTdr = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { calcularAssiduidade } = await import("@/lib/presencas.server");

  const [
    turmasRes,
    inscricoesRes,
    certificadosRes,
    avaliacoesRes,
    satisfacaoRes,
    eficaciaRes,
    workshopsRes,
    participantesRes,
    configRes,
    locaisRes,
    distritosRes,
    sessoesRes,
    presencasRes,
    basesRes,
  ] = await Promise.all([
    supabaseAdmin.from("turmas").select("id,provincia,distrito,curso_id,estado"),
    supabaseAdmin.from("turma_inscricoes").select("id,turma_id,nome,estado"),
    supabaseAdmin.from("certificados").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("avaliacoes_conhecimento")
      .select("momento,pontuacao,total,provincia,workshop_id,turma_id"),
    supabaseAdmin.from("questionarios_satisfacao").select("pontuacao,provincia"),
    supabaseAdmin.from("inqueritos_eficacia").select("aplica_competencias,provincia"),
    supabaseAdmin.from("workshops").select("id,tipo,provincia,distrito,estado"),
    supabaseAdmin.from("workshop_participantes").select("workshop_id,provincia"),
    supabaseAdmin.from("configuracoes_programa").select("chave,valor"),
    supabaseAdmin.from("locais_formacao").select("ordem,provincia,local").order("ordem"),
    supabaseAdmin
      .from("distritos_tdr")
      .select("provincia,nome,ordem_provincia,ordem")
      .order("ordem_provincia")
      .order("ordem"),
    supabaseAdmin.from("turma_sessoes").select("id,turma_id,data,estado"),
    supabaseAdmin.from("presencas").select("*"),
    supabaseAdmin.from("presenca_configuracoes").select("curso_id,base_assiduidade"),
  ]);


  for (const r of [
    turmasRes,
    inscricoesRes,
    certificadosRes,
    avaliacoesRes,
    satisfacaoRes,
    eficaciaRes,
    workshopsRes,
    participantesRes,
    configRes,
    locaisRes,
    distritosRes,
  ]) {
    if (r.error) throw r.error;
  }

  const config: Record<string, string> = {};
  for (const c of configRes.data ?? []) config[c.chave] = c.valor;

  const turmas = turmasRes.data ?? [];
  const inscricoes = (inscricoesRes.data ?? []).filter((i) => i.estado !== "desistiu");
  const workshops = workshopsRes.data ?? [];
  const avaliacoes = avaliacoesRes.data ?? [];
  const satisfacao = satisfacaoRes.data ?? [];
  const eficacia = eficaciaRes.data ?? [];

  const inscritos = inscricoes.length;
  const certificados = certificadosRes.count ?? 0;
  const concluidos = certificados;

  const preNacional = mediaPct(avaliacoes.filter((a) => a.momento === "pre"));
  const posNacional = mediaPct(avaliacoes.filter((a) => a.momento === "pos"));

  const indiceSatisfacao = satisfacao.length
    ? Math.round((satisfacao.reduce((s, q) => s + q.pontuacao, 0) / satisfacao.length / 5) * 1000) /
      10
    : null;

  const eficaciaPct = eficacia.length
    ? Math.round(
        (eficacia.filter((e) => e.aplica_competencias).length / eficacia.length) * 1000,
      ) / 10
    : null;

  const provincias = (locaisRes.data ?? []).map((l) => l.provincia);
  const distritosPorProvincia = new Map<string, string[]>();
  for (const d of distritosRes.data ?? []) {
    const lista = distritosPorProvincia.get(d.provincia) ?? [];
    lista.push(d.nome);
    distritosPorProvincia.set(d.provincia, lista);
  }

  const porProvincia = provincias.map((provincia) => {
    const turmasP = turmas.filter((t) => t.provincia === provincia);
    const idsTurmas = new Set(turmasP.map((t) => t.id));
    const inscritosP = inscricoes.filter((i) => idsTurmas.has(i.turma_id)).length;
    const avaliacoesP = avaliacoes.filter(
      (a) => a.provincia === provincia || (a.turma_id && idsTurmas.has(a.turma_id)),
    );
    const preP = mediaPct(avaliacoesP.filter((a) => a.momento === "pre"));
    const posP = mediaPct(avaliacoesP.filter((a) => a.momento === "pos"));
    const censurado = avaliacoesP.length > 0 && avaliacoesP.length < LIMITE_DIVULGACAO;
    const wsP = workshops.filter((w) => w.provincia === provincia);
    return {
      provincia,
      turmas: turmasP.length,
      inscritos: inscritosP,
      preMedia: censurado ? null : preP,
      posMedia: censurado ? null : posP,
      evolucaoPp: censurado || preP === null || posP === null ? null : Math.round((posP - preP) * 10) / 10,
      censurado,
      workshopsProvinciaisRealizados: wsP.filter(
        (w) => w.tipo === "provincial" && w.estado === "realizado",
      ).length,
      workshopsProvinciaisPlaneados: Math.max(
        1,
        wsP.filter((w) => w.tipo === "provincial").length,
      ),
      workshopsDistritaisRealizados: wsP.filter(
        (w) => w.tipo === "distrital" && w.estado === "realizado",
      ).length,
      workshopsDistritaisPlaneados: distritosPorProvincia.get(provincia)?.length ?? 7,
    };
  });

  const porDistrito = [...distritosPorProvincia.entries()].flatMap(([provincia, nomes]) =>
    nomes.map((nome) => ({
      provincia,
      distrito: nome,
      realizados: workshops.filter(
        (w) => w.distrito === nome && w.tipo === "distrital" && w.estado === "realizado",
      ).length,
      planeados: 1,
    })),
  );

  return {
    desempenho: {
      inscritos,
      concluidos,
      taxaConclusaoPct: inscritos > 0 ? Math.round((concluidos / inscritos) * 1000) / 10 : null,
      certificados,
      taxaCertificacaoPct:
        inscritos > 0 ? Math.round((certificados / inscritos) * 1000) / 10 : null,
      preMedia: preNacional,
      posMedia: posNacional,
      evolucaoPp:
        preNacional !== null && posNacional !== null
          ? Math.round((posNacional - preNacional) * 10) / 10
          : null,
      avaliacoesRegistadas: avaliacoes.length,
    },
    satisfacao: {
      indicePct: indiceSatisfacao,
      respostas: satisfacao.length,
    },
    eficacia: {
      aplicamPct: eficaciaPct,
      respostas: eficacia.length,
    },
    workshops: {
      provinciaisRealizados: workshops.filter(
        (w) => w.tipo === "provincial" && w.estado === "realizado",
      ).length,
      provinciaisPlaneados: Number(config["workshops_provinciais_previstos"] ?? 11),
      distritaisRealizados: workshops.filter(
        (w) => w.tipo === "distrital" && w.estado === "realizado",
      ).length,
      distritaisPlaneados: Number(config["workshops_distritais_previstos"] ?? 77),
      participantes: (participantesRes.data ?? []).length,
    },
    porProvincia,
    porDistrito,
  };
});
