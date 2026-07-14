import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import logo from "@/assets/ologa-logo.png.asset.json";
import { SiteHeader } from "@/components/site-header";
import { ListenButton } from "@/components/listen-button";
import {
  FormularioInstituicao,
  type Modulo as ModuloForm,
  type PayloadInstituicao,
} from "@/components/formulario-instituicao";
import { criarInscricao, listarModulosPublico } from "@/lib/inscricao.functions";
import { obterIndicadoresPublicos } from "@/lib/indicadores.functions";
import { CatalogoCursos } from "@/components/catalogo-cursos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ologa | Plataforma de Literacia Digital" },
      {
        name: "description",
        content:
          "Capacitação digital para instituições moçambicanas, alinhada com a Lei n.º 10/2024 e desenhada segundo os princípios do desenho universal.",
      },
      { property: "og:title", content: "Ologa | Plataforma de Literacia Digital" },
      {
        property: "og:description",
        content:
          "Um único pacote: capacita as equipas e reduz o risco de incumprimento. Presencial e virtual, desenhado para todas as pessoas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const HERO_EYEBROW = "Capacitação Digital Alinhada com a Lei n.º 10/2024";
const HERO_TITLE_A = "Literacia digital que sustenta a ";
const HERO_TITLE_HIGHLIGHT = "transformação do Estado";
const HERO_TITLE_B = " moçambicano";
const HERO_DESC =
  "Um único pacote: capacita as equipas e, ao mesmo tempo, reduz o risco de incumprimento. Presencial e virtual, desenhado para todas as pessoas — porque digitalizar sem desenho universal é reproduzir a exclusão em formato digital.";

type Src = { url: string; ref: string };

// --- Dados exatos das estatísticas de mercado ---
const STATS: {
  n: string;
  l: string;
  s: string;
  href: string;
  ref: string;
}[] = [
  {
    n: "19,8%",
    l: "Penetração da internet",
    s: "≈ 6,96 M de utilizadores",
    href: "https://datareportal.com/reports/digital-2025-mozambique",
    ref: "DataReportal",
  },
  {
    n: "50,4%",
    l: "Ligações móveis ativas",
    s: "17,7 M de ligações",
    href: "https://datareportal.com/reports/digital-2025-mozambique",
    ref: "DataReportal",
  },
  {
    n: "≈ 80%",
    l: "População offline",
    s: "≈ 28 M sem acesso efetivo",
    href: "https://datareportal.com/reports/digital-2025-mozambique",
    ref: "DataReportal",
  },
  {
    n: "14%",
    l: "Não sabe usar a internet",
    s: "entre quem está offline",
    href: "https://www.trade.gov/country-commercial-guides/mozambique-digital-economy",
    ref: "ITA / EUA",
  },
  {
    n: "38%",
    l: "População analfabeta",
    s: "28,9% entre adultos · 49,4% nas mulheres",
    href: "https://opais.co.mz/mocambique-quer-reduzir-taxa-de-analfabetismo-para-23-ate-2029/",
    ref: "dados oficiais",
  },
  {
    n: "2,7%",
    l: "População com deficiência",
    s: "Censo 2017 — cerca de 726 mil pessoas; hoje, acima de 900 mil",
    href: "https://aimnews.org/2023/12/03/mocambique-cerca-de-26-por-cento-da-populacao-sao-deficientes/",
    ref: "Censo 2017, INE",
  },
];

const LEI_HREF =
  "https://aimnews.org/2025/10/29/instituicoes-publicas-e-privadas-chamadas-a-garantir-acessibilidade-sob-a-nova-lei-da-deficiencia/";
const LEI_REF =
  "Lei n.º 10/2024 — Promoção e Proteção dos Direitos da Pessoa com Deficiência";



type Indicadores = {
  instituicoesComDeclaracao: number;
  mulheresPct: number | null;
  ruraisPct: number | null;
  distritosAbrangidos: number;
  formandosZero: number;
  instituicoesInscritas: number;
  formandosInscritos: number;
  formandosInscritosReais: number;
  modulosConcluidos: number;
  mediaQuizzesPct: number | null;
  pessoasComDeficiencia: number;
  instituicoesComApoios: number;
  tiposApoioRequeridos: number;
  licoesComAudioPct: number;
};

type Proveniencia = "inc" | "for" | "plat";
type Kpi = {
  src: Proveniencia;
  val: string;
  lab: string;
  pct?: number | null;
  barColor?: string;
};

function HomePage() {
  const [src, setSrc] = useState<Src | null>(null);
  const listarModulos = useServerFn(listarModulosPublico);
  const criar = useServerFn(criarInscricao);
  const carregarIndicadores = useServerFn(obterIndicadoresPublicos);

  // Formulário de instituições (para o embutido no #inscricao)
  const [modulosForm, setModulosForm] = useState<ModuloForm[]>([]);
  const [modulosFormCarregados, setModulosFormCarregados] = useState(false);
  const [aSubmeter, setASubmeter] = useState(false);
  const [erroInsc, setErroInsc] = useState<string | null>(null);
  const [codigoInsc, setCodigoInsc] = useState<string | null>(null);

  // Indicadores
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [indicadoresCarregados, setIndicadoresCarregados] = useState(false);

  useEffect(() => {
    let cancelado = false;
    listarModulos().then((res) => {
      if (cancelado) return;
      if (res.ok) {
        setModulosForm(res.modulos as ModuloForm[]);
      }
      setModulosFormCarregados(true);
    });
    carregarIndicadores()
      .then((r) => {
        if (cancelado) return;
        setIndicadores(r);
      })
      .finally(() => {
        if (!cancelado) setIndicadoresCarregados(true);
      });
    return () => {
      cancelado = true;
    };
  }, [listarModulos, carregarIndicadores]);

  async function submeterInscricao(payload: PayloadInstituicao) {
    setErroInsc(null);
    setASubmeter(true);
    const res = await criar({ data: { ...payload, consentimento: true } });
    setASubmeter(false);
    if (res.ok) {
      setCodigoInsc(res.codigo);
      const el = document.getElementById("inscricao");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setErroInsc(
        res.mensagem ||
          "Não foi possível concluir a inscrição. Tente novamente daqui a instantes.",
      );
    }
  }

  // Fechar com Escape
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [src]);

  const openSrc = (url: string, ref: string) => setSrc({ url, ref });

  const semInscricoes = !indicadores || indicadores.instituicoesInscritas === 0;

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>

      <SiteHeader />


      <main id="conteudo">
        {/* HERO — inalterado */}
        <section className="hero-bg hero-halo">
          <div className="wrap relative z-[2] max-w-[760px] py-[74px] pb-16">
            <span className="pill-dark mb-5">{HERO_EYEBROW}</span>
            <h1 className="mb-4 text-[42px] font-extrabold leading-[1.12] text-white sm:text-[42px]">
              {HERO_TITLE_A}
              <span className="text-gold">{HERO_TITLE_HIGHLIGHT}</span>
              {HERO_TITLE_B}
            </h1>
            <p className="mb-7 max-w-[620px] text-[17.5px] text-[#d6dde4]">{HERO_DESC}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/formacao" className="btn-brand btn-brand-hover">
                Abrir os Cursos
              </Link>
              <a href="#mercado" className="btn-ghost-dark btn-ghost-dark-hover">
                Ver Análise de Mercado
              </a>
              <ListenButton
                variant="dark"
                sentences={[
                  HERO_EYEBROW,
                  `${HERO_TITLE_A}${HERO_TITLE_HIGHLIGHT}${HERO_TITLE_B}`,
                  HERO_DESC,
                ]}
              />
            </div>
          </div>
        </section>

        {/* 1. ANÁLISE DE MERCADO */}
        <section id="mercado" className="py-16">
          <div className="wrap">
            <div className="mb-4 flex justify-end">
              <ListenButton
                label="🔊 Ouvir esta secção"
                sentences={[
                  "Análise de Mercado. Contexto Moçambicano.",
                  "Quem ficou de fora.",
                  "A adesão móvel é forte, mas o uso da internet é baixo, boa parte do país não lê, e há moçambicanos que não veem, não ouvem ou têm dificuldade de locomoção.",
                  ...STATS.map((st) => `${st.n}: ${st.l}. ${st.s}.`),
                ]}
              />
            </div>
            <div className="eyebrow">Análise de Mercado · Contexto Moçambicano</div>
            <h2 className="mb-3 text-[30px] font-extrabold leading-tight text-navy">
              Quem ficou de fora
            </h2>
            <p className="mb-9 max-w-[720px] text-[17px] text-muted-foreground">
              A adesão móvel é forte, mas o uso da internet é baixo, boa parte do país
              não lê, e há moçambicanos que não veem, não ouvem ou têm dificuldade de
              locomoção.
            </p>


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STATS.map((st) => (
                <div
                  key={st.l}
                  className="card-elevated p-[22px]"
                >
                  <div className="text-[32px] font-extrabold leading-none text-brand">
                    {st.n}
                  </div>
                  <div className="mt-2 text-[13.5px] font-semibold text-muted-foreground">
                    {st.l}
                  </div>
                  <div className="mt-1 text-[12px] text-muted-foreground">{st.s}</div>
                  <button
                    type="button"
                    onClick={() => openSrc(st.href, st.ref)}
                    className="mt-3 inline-block rounded-full border border-line px-2 py-[3px] text-[11px] font-bold text-navy-2 transition-colors hover:border-brand hover:text-brand"
                  >
                    Fonte: {st.ref} ↗
                  </button>
                </div>
              ))}
            </div>

            {/* Nota metodológica */}
            <div className="mt-5 rounded-xl border border-[#f0d9a8] bg-[#fff4e0] p-5 text-[13.5px] leading-[1.65] text-[#6b5310]">
              <b className="mb-1 block text-[#6b4f0c]">
                Nota metodológica — este valor é um piso mínimo, não a dimensão real do
                público.
              </b>
              O censo mede a deficiência por autodeclaração. Os países que a medem por
              via <strong className="text-[#5e4d2a]">funcional</strong> — as perguntas do
              Grupo de Washington, que perguntam pela dificuldade em ver, ouvir, andar,
              lembrar ou comunicar — registam prevalências de{" "}
              <strong className="text-[#5e4d2a]">15% a 25%</strong>. O público que a
              formação tem de servir é, portanto, várias vezes maior do que os 2,7%
              sugerem.
            </div>

            {/* Três parágrafos */}
            <div className="mt-8 max-w-[930px] space-y-[14px] text-[15.5px] text-[#39485a]">
              <p>
                <strong className="text-navy">O acesso existe; o que falta é saber usar.</strong>{" "}
                Metade do país tem ligação móvel (50,4%), mas só{" "}
                <strong className="text-navy">19,8%</strong> usa realmente a internet e
                cerca de <strong className="text-navy">80%</strong> permanece offline. E,
                entre quem está de fora, <strong className="text-navy">14%</strong> diz
                simplesmente que não sabe usar a internet. Não é falta de cobertura — é
                falta de competência. É exatamente aqui que a formação atua.
              </p>
              <p>
                <strong className="text-navy">E há quem não leia, não veja e não ouça.</strong>{" "}
                Com <strong className="text-navy">38%</strong> de analfabetismo, uma
                formação só em texto exclui quase 4 em cada 10 moçambicanos. A somar, o
                Censo de 2017 contou{" "}
                <strong className="text-navy">
                  mais de 726 mil pessoas com deficiência
                </strong>{" "}
                — hoje, acima de 900 mil — e esse número é apenas o piso: medida por via
                funcional, a prevalência situa-se entre 15% e 25%. Juntos, deixam de ser
                um caso à parte: são uma parte decisiva do país, que uma formação
                convencional simplesmente não alcança. Por isso o material tem de poder
                ser <strong className="text-navy">ouvido</strong>, escrito em{" "}
                <strong className="text-navy">linguagem simples</strong>, visto com{" "}
                <strong className="text-navy">alto contraste</strong> e{" "}
                <strong className="text-navy">
                  interpretado em Língua de Sinais Moçambicana
                </strong>
                .
              </p>
              <p>
                <strong className="text-navy">E o Estado acelerou.</strong> Foi criado o
                Ministério das Comunicações e Transformação Digital, está em consulta a
                Estratégia Nacional de Transformação Digital e avança o Plano Quinquenal
                da Digitalização 2025–2029. Mas a digitalização só funciona se quem
                opera os serviços tiver competências — e se o serviço servir toda a
                gente.
              </p>
            </div>

            {/* Insight — 4 blocos navy */}
            <div className="mt-11 grid grid-cols-1 gap-6 rounded-2xl bg-navy p-7 text-white sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <h3 className="mb-2 text-[14px] text-gold">1 · O contexto</h3>
                <p className="text-[14px] leading-[1.5] text-[#cdd5dd]">
                  O Estado acelerou a digitalização: novo ministério, Estratégia
                  Nacional de Transformação Digital e serviços a passar para o digital.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-[14px] text-gold">2 · A necessidade</h3>
                <p className="text-[14px] leading-[1.5] text-[#cdd5dd]">
                  Mas falta quem saiba operar: baixa literacia digital, escassez de
                  competências em dados — e uma grande parte do país que não lê, não vê
                  ou não ouve.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-[14px] text-gold">3 · A exigência</h3>
                <p className="text-[14px] leading-[1.5] text-[#cdd5dd]">
                  A <strong className="text-white">Lei n.º 10/2024</strong> obriga as
                  instituições — públicas e privadas que prestem serviços públicos — a
                  garantir acessibilidade, incluindo nas TIC: o site, o formulário e o
                  atendimento. Digitalizar sem desenho universal é reproduzir a exclusão
                  em formato digital.
                </p>
                <button
                  type="button"
                  onClick={() => openSrc(LEI_HREF, LEI_REF)}
                  className="mt-2 text-[11.5px] text-[#aeb9c4] underline hover:text-white"
                >
                  Fonte ↗
                </button>
              </div>
              <div>
                <h3 className="mb-2 text-[14px] text-gold">4 · A resposta</h3>
                <p className="text-[14px] leading-[1.5] text-[#cdd5dd]">
                  Um pacote de literacia digital universalmente desenhado: uma só
                  formação, para todos, sem versões especiais — que capacita e, ao mesmo
                  tempo, aproxima a instituição da conformidade.
                </p>
              </div>
            </div>

            {/* 2. "Cada lacuna tem uma resposta no programa" — bloco dentro da Análise */}
            <div className="mt-12">
              <div className="eyebrow">Do problema à resposta</div>
              <h3 className="mb-3 text-[24px] font-extrabold leading-tight text-navy">
                Cada lacuna tem uma resposta no programa
              </h3>
              <div className="border-b border-line">
                {[
                  {
                    gap: "Sabe-se pouco das ferramentas de base",
                    sub: "14% de quem está offline não sabe usar a internet",
                    sol: (
                      <>
                        Módulos de{" "}
                        <b className="text-navy">
                          Windows, Navegação, Word, Excel Avançado e Email profissional
                        </b>{" "}
                        criam a fundação operacional que falta nas equipas.
                      </>
                    ),
                  },
                  {
                    gap: "Os serviços do Estado estão a digitalizar-se",
                    sub: "Portais, e-GP, identidade digital",
                    sol: (
                      <>
                        Módulos de{" "}
                        <b className="text-navy">
                          Colaboração na Nuvem e Digitalização de Processos
                        </b>{" "}
                        preparam para fluxos de trabalho totalmente digitais.
                      </>
                    ),
                  },
                  {
                    gap: "Faltam competências em dados e IA",
                    sub: "défice reconhecido nacionalmente",
                    sol: (
                      <>
                        Módulos de{" "}
                        <b className="text-navy">
                          Fundamentos de IA e IA Generativa aplicada
                        </b>{" "}
                        elevam a produtividade e a capacidade analítica.
                      </>
                    ),
                  },
                  {
                    gap: "Há riscos de segurança e de dados",
                    sub: "nova política de governação de dados",
                    sol: (
                      <>
                        Módulos de{" "}
                        <b className="text-navy">Segurança Digital e Proteção de Dados</b>{" "}
                        protegem a instituição e os cidadãos.
                      </>
                    ),
                  },
                  {
                    gap: "Há quem não leia, não veja ou não ouça",
                    sub: "38% de analfabetismo · 2,7% com deficiência",
                    sol: (
                      <>
                        Aqui a resposta{" "}
                        <b className="text-navy">
                          não é um módulo — é o desenho de todos eles
                        </b>
                        . Todas as lições têm áudio, leitura fácil e alto contraste: uma
                        só formação, para todos, sem versões especiais.
                      </>
                    ),
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-5 border-t border-line py-[18px] md:grid-cols-[200px_1fr]"
                  >
                    <div className="text-[15px] font-extrabold text-brand-dark">
                      {row.gap}
                      <small className="mt-1 block text-[12.5px] font-semibold text-muted-foreground">
                        {row.sub}
                      </small>
                    </div>
                    <div className="text-[15px] text-[#39485a]">{row.sol}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. INSCRIÇÃO — embutida na homepage */}
        <section id="inscricao" className="border-t border-line bg-white py-16">
          <div className="wrap max-w-[960px]">
            <div className="eyebrow">Inscrição de Instituição</div>
            <h2 className="mb-3 text-[30px] font-extrabold leading-tight text-navy">
              Inscreva a sua instituição
            </h2>
            <p className="mb-8 max-w-[720px] text-[17px] text-muted-foreground">
              Preencha os dados da sua organização e das equipas a formar. No fim,
              recebe um código de inscrição para partilhar com os colaboradores que
              vão fazer a formação.
            </p>

            {codigoInsc ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-2xl border border-line bg-page p-7"
              >
                <h3 className="text-[22px] font-extrabold text-navy">
                  Inscrição registada
                </h3>
                <p className="mt-2 text-[15px] text-muted-foreground">
                  Guarde e partilhe o código abaixo com os colaboradores.
                </p>
                <div className="mt-5 rounded-xl border border-ink/20 bg-white p-5">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Código de inscrição da instituição
                  </p>
                  <p className="mt-1 font-mono text-[32px] font-extrabold tracking-widest text-navy">
                    {codigoInsc}
                  </p>
                </div>
              </div>
            ) : (
              <FormularioInstituicao
                modo="publico"
                modulos={modulosForm}
                modulosCarregados={modulosFormCarregados}
                aSubmeter={aSubmeter}
                onSubmit={submeterInscricao}
                textoBotao="Submeter inscrição"
                mensagemErro={erroInsc}
              />
            )}
          </div>
        </section>

        {/* 3. INDICADORES — painel público, agregados nacionais */}
        <section id="indicadores" className="py-16">
          <div className="wrap">
            <div className="mb-4 flex justify-end">
              <ListenButton
                label="🔊 Ouvir esta secção"
                sentences={[
                  "Indicadores.",
                  "Indicadores que o programa se propõe observar. Os valores são calculados a partir das inscrições submetidas e da atividade de formação; começam a zero e atualizam-se à medida que os dados entram.",
                  "Todos os números são agregados nacionais; nunca dados de uma instituição em concreto.",
                ]}
              />
            </div>
            <h2 className="mb-3 text-[30px] font-extrabold leading-tight text-navy">
              Indicadores
            </h2>
            <p className="mb-9 max-w-[820px] text-[17px] text-muted-foreground">
              Indicadores que o programa se propõe observar. Os valores são
              calculados a partir das inscrições submetidas e da atividade de
              formação — começam a zero e atualizam-se à medida que os dados
              entram. Todos os números são agregados nacionais; nunca dados de
              uma instituição em concreto.
            </p>


            {!indicadoresCarregados ? (
              <div className="rounded-2xl border border-line bg-white p-7 text-[15px] text-muted-foreground">
                A carregar indicadores…
              </div>
            ) : (
              (() => {
                // Distinção entre CONTAGENS e RÁCIOS:
                // - Contagens: mostram o número, mesmo que seja 0 (facto verdadeiro).
                // - Rácios/percentagens: sem denominador são indefinidos → "—".
                // A ausência de inscrições é explicada uma vez no painel
                // "Leitura dos indicadores", em vez de repetida em cada cartão.
                const nInc = (n: number | null | undefined) => fmtNum(n);
                const pInc = (p: number | null | undefined) => fmtPct(p);
                const nFor = (n: number | null | undefined) => fmtNum(n);
                const pFor = (p: number | null | undefined) => fmtPct(p);
                const barInc = (p: number | null | undefined) =>
                  p == null ? null : p;
                return (

                  <>
                    {/* Compromisso institucional — cartão novo, acima de tudo */}
                    <div className="mb-8">
                      <IndSubh titulo="Compromisso institucional" />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <KpiCard
                          kpi={{
                            src: "inc",
                            val: nInc(indicadores!.instituicoesComDeclaracao),
                            lab: "Instituições com Declaração de Desenho Universal assinada",
                          }}
                        />
                      </div>
                    </div>

                    <IndSubh titulo="Quem alcançamos" />
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <KpiCard
                        kpi={{
                          src: "inc",
                          val: pInc(indicadores!.mulheresPct),
                          lab: "Mulheres formadas",
                          pct: barInc(indicadores!.mulheresPct),
                          barColor: "var(--red, #c8213a)",
                        }}
                      />
                      <KpiCard
                        kpi={{
                          src: "inc",
                          val: pInc(indicadores!.ruraisPct),
                          lab: "Formandos em zonas rurais",
                          pct: barInc(indicadores!.ruraisPct),
                          barColor: "var(--gold, #c98a2b)",
                        }}
                      />
                      <KpiCard
                        kpi={{
                          src: "inc",
                          val: nInc(indicadores!.distritosAbrangidos),
                          lab: "Distritos e postos abrangidos",
                        }}
                      />
                      <KpiCard
                        kpi={{
                          src: "inc",
                          val: nInc(indicadores!.formandosZero),
                          lab: "Formandos que partem do zero",
                        }}
                      />
                    </div>

                    <IndSubh titulo="Formação & cobertura" />
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <KpiCard
                        kpi={{
                          src: "inc",
                          val: nInc(indicadores!.instituicoesInscritas),
                          lab: "Instituições inscritas",
                        }}
                      />
                      <KpiCard
                        kpi={{
                          src: "inc",
                          val: nInc(indicadores!.formandosInscritos),
                          lab: "Formandos inscritos",
                        }}
                      />
                      <KpiCard
                        kpi={{
                          src: "for",
                          val: nFor(indicadores!.modulosConcluidos),
                          lab: "Módulos concluídos",
                        }}
                      />
                      <KpiCard
                        kpi={{
                          src: "for",
                          val: pFor(indicadores!.mediaQuizzesPct),
                          lab: "Média nos quizzes",
                          pct: barInc(indicadores!.mediaQuizzesPct),
                          barColor: "var(--navy, #10233b)",
                        }}
                      />
                    </div>

                    <IndSubh titulo="Desenho universal" />
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <KpiCard
                        kpi={{
                          src: "inc",
                          val: nInc(indicadores!.pessoasComDeficiencia),
                          lab: "Pessoas com deficiência",
                        }}
                      />
                      <KpiCard
                        kpi={{
                          src: "inc",
                          val: nInc(indicadores!.instituicoesComApoios),
                          lab: "Instituições com apoios solicitados",
                        }}
                      />
                      <KpiCard
                        kpi={{
                          src: "inc",
                          val: nInc(indicadores!.tiposApoioRequeridos),
                          lab: "Tipos de apoio requeridos",
                        }}
                      />
                      <KpiCard
                        kpi={{
                          src: "plat",
                          val: `${indicadores!.licoesComAudioPct}%`,
                          lab: "Lições com áudio",
                        }}
                      />
                    </div>
                  </>
                );
              })()
            )}

            <div className="mt-8 grid gap-5 rounded-2xl bg-navy p-6 text-[14px] leading-[1.65] text-[#cdd5dd] sm:p-7">
              <div>
                <h3 className="mb-2 text-[14px] text-gold">
                  Leitura dos indicadores
                </h3>
                <p>{lerIndicadores(indicadores, semInscricoes)}</p>
              </div>
              <div className="border-t border-white/15 pt-4">
                <h3 className="mb-2 text-[14px] text-gold">
                  Desenho universal e a Lei n.º 10/2024
                </h3>
                <p>
                  Todas as lições têm áudio, leitura fácil e alto contraste. A
                  plataforma foi desenhada segundo os princípios de desenho
                  universal que a Lei n.º 10/2024 consagra — o que reduz o
                  risco de incumprimento e aproxima a instituição da
                  conformidade. A avaliação da conformidade de cada instituição
                  compete às entidades competentes, não à Ologa.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* 4. CURSOS — componente partilhado com /formacao */}
        <section id="modulos" className="border-t border-line bg-white py-16">
          <div className="wrap">
            <div className="eyebrow">Cursos</div>
            <h2 className="mb-3 text-[30px] font-extrabold leading-tight text-navy">
              Pacote completo de literacia digital
            </h2>
            <p className="mb-9 max-w-[820px] text-[17px] text-muted-foreground">
              Onze módulos adaptados ao contexto de Moçambique, em formato físico e virtual.
            </p>

            <CatalogoCursos />
          </div>
        </section>


        {/* 5. PERCURSO */}
        <section id="percurso" className="py-16">
          <div className="wrap">
            <div className="eyebrow">Percurso de Aprendizagem</div>
            <h2 className="mb-3 text-[30px] font-extrabold leading-tight text-navy">
              Três níveis, um destino: equipas digitalmente competentes
            </h2>
            <p className="mb-9 max-w-[720px] text-[17px] text-muted-foreground">
              Um percurso progressivo que leva o formando da fundação operacional até às
              competências avançadas de IA e digitalização.
            </p>
            <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
              {[
                {
                  n: "1",
                  h: "Fundação",
                  d: "4–6 semanas",
                  items: [
                    "Windows e sistema operativo",
                    "Navegação segura na internet",
                    "Word — documentos profissionais",
                    "Email e comunicação",
                  ],
                },
                {
                  n: "2",
                  h: "Intermédio",
                  d: "5–7 semanas",
                  items: [
                    "Excel Avançado",
                    "Colaboração na nuvem",
                    "Segurança digital",
                    "Proteção de dados",
                  ],
                },
                {
                  n: "3",
                  h: "Avançado",
                  d: "4–5 semanas",
                  items: [
                    "Fundamentos de IA",
                    "IA generativa no trabalho",
                    "Digitalização de processos",
                    "Projeto final aplicado",
                  ],
                },
              ].map((lvl) => (
                <div key={lvl.n} className="relative card-elevated p-[26px]">
                  <div className="absolute -top-[14px] left-[26px] flex h-[30px] w-[30px] items-center justify-center rounded-full bg-brand text-[14px] font-extrabold text-white">
                    {lvl.n}
                  </div>
                  <h3 className="mt-[10px] mb-1 text-[18px] text-navy">{lvl.h}</h3>
                  <div className="mb-[14px] text-[13px] font-semibold text-muted-foreground">
                    {lvl.d}
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-[14px] text-[#39485a] marker:text-muted-foreground">
                    {lvl.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-9 grid grid-cols-1 gap-[18px] md:grid-cols-2">
              <div className="flex gap-4 rounded-2xl border border-line bg-white p-[22px]">
                <div className="text-[28px]">🏫</div>
                <div>
                  <h4 className="mb-1 text-[16px] text-navy">Formação presencial</h4>
                  <p className="text-[14px] text-muted-foreground">
                    Sessões práticas em sala, conduzidas pelo{" "}
                    <b className="text-navy">guião do formador</b> de cada lição —
                    ideal para equipas de instituições públicas.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl border border-line bg-white p-[22px]">
                <div className="text-[28px]">💻</div>
                <div>
                  <h4 className="mb-1 text-[16px] text-navy">Formação virtual</h4>
                  <p className="text-[14px] text-muted-foreground">
                    Os mesmos módulos em{" "}
                    <b className="text-navy">conteúdo e-learning</b> para estudo
                    autónomo, acessíveis mesmo com conectividade limitada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ENTREGÁVEIS */}
        <section id="entregaveis" className="border-t border-line bg-white py-16">
          <div className="wrap">
            <div className="eyebrow">No fim da formação</div>
            <h2 className="mb-3 text-[30px] font-extrabold leading-tight text-navy">
              O que fica na mão de quem se formou — e da instituição
            </h2>
            <p className="mb-9 max-w-[720px] text-[17px] text-muted-foreground">
              A formação não termina numa lista de presenças. Termina em três
              documentos, dois deles para a instituição levar a uma auditoria.
            </p>

            <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
              {[
                {
                  who: "Para o formando",
                  h: "Certificado de Conclusão",
                  p: (
                    <>
                      Módulo concluído, horas de formação, pontuação obtida e um{" "}
                      <strong className="text-navy">código de verificação</strong> que
                      qualquer pessoa pode confirmar em linha. É a prova de que fez e
                      concluiu.
                    </>
                  ),
                },
                {
                  who: "Para a instituição",
                  h: "Relatório de Capacitação",
                  p: (
                    <>
                      Quantos formou, taxa de conclusão, participação de mulheres,
                      pessoas com deficiência, apoios prestados — e o{" "}
                      <strong className="text-navy">antes e depois</strong>: quantos
                      partiram do zero e onde chegaram.
                    </>
                  ),
                },
                {
                  who: "Para a instituição",
                  h: "Declaração de Formação com Desenho Universal",
                  p: (
                    <>
                      Atesta que a capacitação foi realizada num programa{" "}
                      <strong className="text-navy">
                        desenhado segundo os princípios do desenho universal
                      </strong>{" "}
                      — com áudio, leitura fácil, alto contraste e interpretação em
                      Língua de Sinais Moçambicana.
                    </>
                  ),
                },
              ].map((c) => (
                <div key={c.h} className="card-elevated p-6">
                  <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-brand-dark">
                    {c.who}
                  </div>
                  <h3 className="mb-2 text-[16.5px] text-navy">{c.h}</h3>
                  <p className="text-[13.5px] text-muted-foreground">{c.p}</p>
                </div>
              ))}
            </div>

            {/* Nota amarela — fase seguinte */}
            <div className="mt-5 rounded-xl border border-[#f0d9a8] bg-[#fff4e0] p-5 text-[13px] leading-[1.6] text-[#6b5310]">
              <b className="text-[#6b4f0c]">
                Fase seguinte — reconhecimento no sistema nacional.
              </b>{" "}
              O Certificado de Conclusão é hoje emitido pela Ologa e verificável em
              linha. Está em curso o caminho para o seu{" "}
              <strong>
                reconhecimento no Sistema Nacional de Qualificações Profissionais
              </strong>
              , através do processo de acreditação junto da{" "}
              <strong>ANEP — Autoridade Nacional de Educação Profissional</strong>,
              tendo o IFPELAC como âncora institucional. Enquanto esse processo não
              estiver concluído, não apresentamos o certificado como acreditado.
            </div>

            {/* Nota de rigor — estilo neutro claro, sem competir com o aviso amarelo */}
            <div className="mt-5 rounded-xl border border-line bg-page p-5 text-[13px] leading-[1.6] text-navy-2">
              <b className="text-navy">
                Uma nota de rigor, que fazemos questão de deixar clara:
              </b>{" "}
              esta declaração atesta <b className="text-navy">o que foi feito na formação</b>. Não
              certifica que a instituição cumpre a Lei n.º 10/2024 — essa avaliação não
              nos compete e não a fazemos. O que fica documentado é que as suas equipas
              foram capacitadas por um programa que serve todas as pessoas, sem versões
              especiais.
            </div>
          </div>
        </section>

        {/* 5. CONTACTO */}
        <section id="contacto" className="bg-navy py-16 text-white">
          <div className="wrap max-w-[680px] text-center">
            <div className="eyebrow" style={{ color: "var(--color-gold)" }}>
              Ologa Sistemas Informáticos, Lda.
            </div>
            <h2 className="mb-3 text-[30px] font-extrabold leading-tight text-white">
              Pronto para capacitar a sua equipa?
            </h2>
            <p className="mx-auto mb-8 max-w-[720px] text-[17px] text-[#cdd5dd]">
              Desenhamos um plano de formação à medida da sua organização, com módulos,
              calendário e formato adaptados às suas necessidades.
            </p>
            <a href="#inscricao" className="btn-brand btn-brand-hover">
              Solicitar uma Proposta
            </a>
          </div>
        </section>
      </main>

      {/* 6. RODAPÉ */}
      <footer className="bg-navy pt-12 pb-8 text-[#aeb9c4]">
        <div className="wrap">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo.url} alt="" aria-hidden="true" className="h-9 w-auto" />
              <div className="text-sm">
                <p className="font-extrabold text-white">OLOGA</p>
                <p className="text-[#8896a4]">
                  Ologa Sistemas Informáticos, Lda. · Maputo, Moçambique
                </p>
              </div>
            </div>
            <nav
              aria-label="Ligações do rodapé"
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
            >
              <Link to="/verificar" className="text-[#aab6c2] underline hover:text-white">
                Verificar certificado
              </Link>
              <Link to="/entrar" className="text-[#aab6c2] hover:text-white">
                Área da Ologa
              </Link>
            </nav>
          </div>
          <div className="mt-7 border-t border-white/10 pt-5 text-[12px] leading-[1.7] text-[#7e8c9a]">
            Fontes da análise: DataReportal (Digital 2025: Mozambique) · Instituto
            Nacional de Estatística — Censo 2017 · Ministério das Comunicações e
            Transformação Digital · UNDP Moçambique · ITA · Banco Mundial. As
            referências completas abrem em cada percentagem da análise de mercado.
          </div>
        </div>
      </footer>

      {/* Painel de fontes — abre DENTRO da plataforma */}
      {src ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fonte"
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-auto bg-navy/60 p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSrc(null);
          }}
        >
          <div className="mx-auto my-auto w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="relative bg-navy p-7 text-white">
              <button
                type="button"
                onClick={() => setSrc(null)}
                aria-label="Fechar"
                className="absolute right-4 top-4 h-[34px] w-[34px] rounded-full border border-white/50 bg-white/20 text-[22px] leading-[32px] text-white transition-colors hover:bg-white hover:text-navy"
              >
                ×
              </button>
              <div className="mb-3 flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-white/15 text-[24px]">
                🔗
              </div>
              <h3 className="text-[22px] font-extrabold leading-tight">Fonte</h3>
              <p className="mt-1.5 text-[14px] text-[#cdd5dd]">
                {(() => {
                  try {
                    return new URL(src.url).hostname.replace(/^www\./, "");
                  } catch {
                    return src.url;
                  }
                })()}
              </p>
            </div>
            <div className="max-h-[64vh] overflow-auto p-7">
              <h4 className="mb-2 text-[12.5px] font-extrabold uppercase tracking-wider text-brand-dark">
                Referência
              </h4>
              <p className="font-semibold text-navy">{src.ref}</p>
              <h4 className="mt-4 mb-2 text-[12.5px] font-extrabold uppercase tracking-wider text-brand-dark">
                Endereço
              </h4>
              <div className="break-all font-mono text-[13px] text-navy-2">
                {src.url}
              </div>
              <p className="mt-4 text-[13px] text-muted-foreground">
                Esta plataforma não abre janelas externas. A referência fica aqui, para
                consulta e verificação.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// ---- Painel de indicadores: helpers ----
function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
function fmtPct(p: number | null | undefined): string {
  if (p == null) return "—";
  return `${p}%`;
}
function IndSubh({ titulo }: { titulo: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 text-[12px] font-extrabold uppercase tracking-[1px] text-navy">
      <span>{titulo}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
function KpiCard({ kpi }: { kpi: Kpi }) {
  const catRotulo =
    kpi.src === "inc"
      ? "Via inscrição"
      : kpi.src === "for"
        ? "Atividade na plataforma"
        : "Da plataforma";
  const catClasse =
    kpi.src === "inc"
      ? "bg-[#fdecea] text-[#c8213a]"
      : kpi.src === "for"
        ? "bg-[#eaf3fb] text-[#1b6ea8]"
        : "bg-[#eef2f6] text-navy";
  return (
    <div className="card-elevated p-[20px]">
      <span
        className={`inline-block rounded-full px-2 py-[2px] text-[10px] font-extrabold uppercase tracking-[.6px] ${catClasse}`}
      >
        {catRotulo}
      </span>
      <div
        className={`mt-[9px] font-extrabold leading-none text-navy ${/^[\d—]/.test(kpi.val) ? "text-[30px]" : "text-[15px] leading-snug text-muted-foreground"}`}
      >
        {kpi.val}
      </div>
      <div className="mt-[6px] text-[12.5px] font-semibold text-muted-foreground">
        {kpi.lab}
      </div>
      {kpi.pct != null ? (
        <div className="mt-[13px] h-[7px] overflow-hidden rounded-md bg-[#eef1f4]">
          <div
            className="h-full rounded-md"
            style={{
              width: `${Math.max(0, Math.min(100, kpi.pct))}%`,
              background: kpi.barColor ?? "var(--navy, #10233b)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
function lerIndicadores(ind: Indicadores | null, semInscricoes: boolean): string {
  if (!ind || semInscricoes) {
    return "Ainda sem inscrições registadas. Esta leitura é gerada automaticamente a partir dos formulários de inscrição submetidos.";
  }
  const partes: string[] = [];
  partes.push(
    `Com base em ${fmtNum(ind.instituicoesInscritas)} instituição(ões) inscrita(s), estão previstos ${fmtNum(ind.formandosInscritos)} formandos`,
  );
  if (ind.mulheresPct != null && ind.ruraisPct != null) {
    partes.push(
      `, dos quais ${ind.mulheresPct}% mulheres e ${ind.ruraisPct}% em zonas rurais`,
    );
  }
  partes.push(`, abrangendo ${fmtNum(ind.distritosAbrangidos)} distrito(s)/posto(s)`);
  if (ind.pessoasComDeficiencia > 0) {
    partes.push(
      ` e incluindo ${fmtNum(ind.pessoasComDeficiencia)} pessoa(s) com deficiência`,
    );
  }
  partes.push(
    ". A participação feminina e a cobertura rural são acompanhadas como metas de inclusão do programa.",
  );
  if (ind.formandosZero > 0 && ind.formandosInscritos > 0) {
    const pZero = Math.round((ind.formandosZero / ind.formandosInscritos) * 100);
    partes.push(
      ` ${pZero}% destes formandos partem do zero, sem qualquer literacia digital.`,
    );
  }
  return partes.join("");
}
