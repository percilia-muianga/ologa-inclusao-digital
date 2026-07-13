import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { listarModulos } from "@/lib/formacao.functions";
import { formacaoStore } from "@/lib/formacao-store";

const modulosQuery = queryOptions({
  queryKey: ["formacao", "modulos"],
  queryFn: () => listarModulos(),
});

export const Route = createFileRoute("/formacao/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(modulosQuery),
  head: () => ({
    meta: [
      { title: "Cursos — Ologa Literacia Digital" },
      {
        name: "description",
        content:
          "Pacote completo de literacia digital: 11 módulos adaptados ao contexto de Moçambique, em formato físico e virtual.",
      },
    ],
  }),
  component: ListaModulos,
});

const NIVEL_ETIQUETA: Record<string, string> = {
  basico: "Básico",
  intermedio: "Intermédio",
  avancado: "Avançado",
};

const NOTA_MINIMA = 2 / 3;

type Filtro = "todos" | "basico" | "intermedio" | "avancado";

const FILTROS: { valor: Filtro; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "basico", etiqueta: "Básico" },
  { valor: "intermedio", etiqueta: "Intermédio" },
  { valor: "avancado", etiqueta: "Avançado" },
];

function ListaModulos() {
  const { data: modulos } = useSuspenseQuery(modulosQuery);
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [nome, setNome] = useState("");
  const [hidratado, setHidratado] = useState(false);
  const [licoesPorModulo, setLicoesPorModulo] = useState<Record<string, string[]>>({});
  const [resultadosQuiz, setResultadosQuiz] = useState<
    Record<string, { pontuacao: number; total: number }>
  >({});

  useEffect(() => {
    setLicoesPorModulo(formacaoStore.todasLicoesConcluidas());
    setResultadosQuiz(formacaoStore.todosResultadosQuiz());
    setHidratado(true);
  }, []);

  const totais = useMemo(() => {
    const totalLicoes = modulos.reduce((s, m) => s + (m.numeroLicoes ?? 0), 0);
    let feitas = 0;
    let modulosCompletos = 0;
    const pcts: number[] = [];
    for (const m of modulos) {
      const feitasMod = (licoesPorModulo[m.id] ?? []).length;
      feitas += Math.min(feitasMod, m.numeroLicoes ?? 0);
      const q = resultadosQuiz[m.id];
      const qPct = q && q.total > 0 ? q.pontuacao / q.total : null;
      const licoesOk = (m.numeroLicoes ?? 0) > 0 && feitasMod >= (m.numeroLicoes ?? 0);
      const quizOk = qPct !== null && qPct >= NOTA_MINIMA;
      if (licoesOk && quizOk) modulosCompletos += 1;
      if (qPct !== null) pcts.push(qPct);
    }
    const mediaQuiz =
      pcts.length === 0 ? null : Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100);
    return {
      totalLicoes,
      feitas,
      modulosCompletos,
      mediaQuiz,
      pctGeral: totalLicoes === 0 ? 0 : Math.round((feitas / totalLicoes) * 100),
    };
  }, [modulos, licoesPorModulo, resultadosQuiz]);

  const primeiroCompleto = useMemo(() => {
    for (const m of modulos) {
      const feitasMod = (licoesPorModulo[m.id] ?? []).length;
      const q = resultadosQuiz[m.id];
      const qPct = q && q.total > 0 ? q.pontuacao / q.total : null;
      const licoesOk = (m.numeroLicoes ?? 0) > 0 && feitasMod >= (m.numeroLicoes ?? 0);
      const quizOk = qPct !== null && qPct >= NOTA_MINIMA;
      if (licoesOk && quizOk) return m;
    }
    return null;
  }, [modulos, licoesPorModulo, resultadosQuiz]);

  const podeEmitir = hidratado && primeiroCompleto !== null && nome.trim().length >= 2;

  const modulosFiltrados = useMemo(
    () => (filtro === "todos" ? modulos : modulos.filter((m) => m.nivel === filtro)),
    [modulos, filtro],
  );

  function emitir() {
    if (!primeiroCompleto) return;
    navigate({
      to: "/formacao/$modulo/certificado",
      params: { modulo: primeiroCompleto.id },
    });
  }

  return (
    <section className="wrap py-10">
      <div className="mb-6 max-w-3xl">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Cursos</div>
        <h1 className="mt-2 text-3xl font-extrabold text-navy sm:text-4xl">
          Pacote completo de literacia digital
        </h1>
        <p className="mt-3 text-base text-navy-2">
          Onze módulos adaptados ao contexto de Moçambique, em formato físico e virtual. Os
          marcados como <b>Disponível</b> já têm conteúdo completo — clique para abrir as lições
          com material de e-learning e guião do formador.
        </p>
      </div>

      {/* Painel de progresso */}
      <div className="mb-8 grid gap-6 rounded-2xl border border-line bg-white p-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-lg font-bold text-navy">O seu progresso</h2>
          <p className="mt-1 text-sm text-navy-2">
            Marque as lições como concluídas e faça os quizzes de cada módulo. O progresso fica
            guardado neste dispositivo.
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-brand transition-all"
              style={{ width: `${totais.pctGeral}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-2xl font-extrabold text-navy">
                {totais.feitas}/{totais.totalLicoes}
              </div>
              <div className="text-xs text-muted-foreground">Lições concluídas</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-navy">
                {totais.modulosCompletos}/{modulos.length}
              </div>
              <div className="text-xs text-muted-foreground">Módulos completos</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-navy">
                {totais.mediaQuiz === null ? "—" : `${totais.mediaQuiz}%`}
              </div>
              <div className="text-xs text-muted-foreground">Média nos quizzes</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2">
          <label htmlFor="cert-nome" className="sr-only">
            O seu nome completo
          </label>
          <input
            id="cert-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="O seu nome completo"
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={emitir}
            disabled={!podeEmitir}
            className="btn-brand btn-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Emitir o meu certificado
          </button>
          <p className="text-xs text-muted-foreground">
            Disponível ao concluir pelo menos um módulo (lições + quiz).
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div
        className="mb-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filtrar cursos por nível"
      >
        {FILTROS.map((f) => {
          const ativo = filtro === f.valor;
          return (
            <button
              key={f.valor}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => setFiltro(f.valor)}
              className={
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors " +
                (ativo
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-white text-navy-2 hover:border-navy")
              }
            >
              {f.etiqueta}
            </button>
          );
        })}
      </div>

      {/* Cartões */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulosFiltrados.map((m) => {
          const feitasMod = (licoesPorModulo[m.id] ?? []).length;
          const total = m.numeroLicoes ?? 0;
          const pct = total === 0 ? 0 : Math.round((Math.min(feitasMod, total) / total) * 100);
          const q = resultadosQuiz[m.id];
          const qPct = q && q.total > 0 ? q.pontuacao / q.total : null;
          const completo =
            total > 0 && feitasMod >= total && qPct !== null && qPct >= NOTA_MINIMA;
          return (
            <li key={m.id}>
              <Link
                to="/formacao/$modulo"
                params={{ modulo: m.id }}
                className="relative flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
                aria-label={`${m.titulo} — ${NIVEL_ETIQUETA[m.nivel] ?? m.nivel}, ${total} lições${completo ? ", concluído" : ""}`}
              >
                <span className="absolute right-4 top-4 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  Disponível
                </span>
                {completo ? (
                  <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                    ✓ Concluído
                  </span>
                ) : null}
                <div
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-page text-2xl"
                  aria-hidden="true"
                >
                  {m.icone ?? "📘"}
                </div>
                <h3 className="text-lg font-bold text-navy">{m.titulo}</h3>
                {m.descricao ? (
                  <p className="mt-1 text-sm text-navy-2">{m.descricao}</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  <span
                    className={
                      "rounded-full px-2.5 py-0.5 " +
                      (m.nivel === "basico"
                        ? "bg-emerald-50 text-emerald-700"
                        : m.nivel === "intermedio"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-violet-50 text-violet-700")
                    }
                  >
                    {NIVEL_ETIQUETA[m.nivel] ?? m.nivel}
                  </span>
                  {m.duracao ? (
                    <span className="rounded-full bg-page px-2.5 py-0.5 text-navy-2">
                      {m.duracao}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-page px-2.5 py-0.5 text-navy-2">
                    {total} lições
                  </span>
                </div>
                <div
                  className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-line"
                  title={`${Math.min(feitasMod, total)}/${total} lições concluídas`}
                >
                  <div
                    className="h-full bg-brand transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
