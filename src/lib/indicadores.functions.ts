import { createServerFn } from "@tanstack/react-start";

// Painel público de indicadores. TODOS os valores são agregados nacionais —
// nunca identificam nenhuma instituição em concreto.
export const obterIndicadoresPublicos = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [instRes, formRes, certRes, quizRes] = await Promise.all([
      supabaseAdmin
        .from("instituicoes")
        .select(
          "provincia,distrito,meio,num_colaboradores_total,num_mulheres,num_pcd,nivel_literacia,apoios_acessibilidade,declaracao_assinada",
        ),
      supabaseAdmin.from("formandos").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("certificados").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("progresso_quizzes").select("pontuacao,total"),
    ]);

    const instituicoes = instRes.data ?? [];

    const numInstituicoes = instituicoes.length;
    const numColabTotal = instituicoes.reduce(
      (a, r) => a + (r.num_colaboradores_total ?? 0),
      0,
    );
    const numMulheres = instituicoes.reduce((a, r) => a + (r.num_mulheres ?? 0), 0);
    const numPcd = instituicoes.reduce((a, r) => a + (r.num_pcd ?? 0), 0);
    const numRurais = instituicoes
      .filter((r) => (r.meio ?? "").toLowerCase() === "rural")
      .reduce((a, r) => a + (r.num_colaboradores_total ?? 0), 0);
    const numZero = instituicoes
      .filter((r) => (r.nivel_literacia ?? "") === "nenhum")
      .reduce((a, r) => a + (r.num_colaboradores_total ?? 0), 0);

    const distritos = new Set<string>();
    for (const r of instituicoes) {
      const p = (r.provincia ?? "").trim().toLowerCase();
      const d = (r.distrito ?? "").trim().toLowerCase();
      if (p && d) distritos.add(`${p}|${d}`);
    }

    let instComApoios = 0;
    const tiposApoio = new Set<string>();
    for (const r of instituicoes) {
      const apoios = (r.apoios_acessibilidade ?? []) as string[] | null;
      const uteis = (apoios ?? []).filter((a) => a && a !== "nenhum");
      if (uteis.length > 0) {
        instComApoios += 1;
        for (const a of uteis) tiposApoio.add(a);
      }
    }

    const instComDeclaracao = instituicoes.filter((r) => r.declaracao_assinada === true).length;

    const formandosInscritos = formRes.count ?? 0;
    const modulosConcluidos = certRes.count ?? 0;

    const quizzes = (quizRes.data ?? []).filter((q) => (q.total ?? 0) > 0);
    const mediaQuizzesPct = quizzes.length
      ? Math.round(
          (quizzes.reduce((a, q) => a + (q.pontuacao ?? 0) / (q.total ?? 1), 0) /
            quizzes.length) *
            100,
        )
      : null;

    const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : null);

    return {
      // Compromisso institucional (novo)
      instituicoesComDeclaracao: instComDeclaracao,
      // Quem alcançamos
      mulheresPct: pct(numMulheres, numColabTotal),
      ruraisPct: pct(numRurais, numColabTotal),
      distritosAbrangidos: distritos.size,
      formandosZero: numZero,
      // Formação & cobertura
      instituicoesInscritas: numInstituicoes,
      formandosInscritos: numColabTotal, // previstos, via inscrição
      formandosInscritosReais: formandosInscritos, // não usado no painel; reservado
      modulosConcluidos,
      mediaQuizzesPct,
      // Desenho universal
      pessoasComDeficiencia: numPcd,
      instituicoesComApoios: instComApoios,
      tiposApoioRequeridos: tiposApoio.size,
      licoesComAudioPct: 100,
    };
  },
);
