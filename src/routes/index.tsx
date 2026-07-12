import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  Building2,
  BarChart3,
  WifiOff,
  Users,
  ShieldCheck,
  Accessibility,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>

      <SiteHeader />

      <main id="conteudo">
        <Hero />
        <Features />
        <Audiences />
        <Universal />
      </main>

      <SiteFooter />
    </div>
  );
}

function Logo() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2"
      aria-label="Ologa — página inicial"
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-brand-foreground font-extrabold"
      >
        O
      </span>
      <span className="text-lg font-extrabold tracking-tight text-ink">
        Ologa<span className="text-brand">.</span>
      </span>
    </Link>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm font-medium text-foreground">
            <li>
              <a
                href="#formacao"
                className="rounded px-1 py-2 hover:text-brand"
              >
                Formação
              </a>
            </li>
            <li>
              <a
                href="#instituicoes"
                className="rounded px-1 py-2 hover:text-brand"
              >
                Instituições
              </a>
            </li>
            <li>
              <a
                href="#universal"
                className="rounded px-1 py-2 hover:text-brand"
              >
                Desenho Universal
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden sm:inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-ink hover:bg-accent"
          >
            Entrar
          </Link>
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-1 rounded-lg bg-ink px-4 text-sm font-semibold text-ink-foreground hover:opacity-90"
          >
            Começar
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.15fr_1fr] md:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-brand"
            />
            Plataforma de literacia digital · Moçambique
          </p>
          <h1 className="mt-5 text-4xl font-extrabold text-ink sm:text-5xl md:text-6xl">
            Competências digitais{" "}
            <span className="text-brand">para todas as pessoas.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            A Ologa é a plataforma de gestão de formação em literacia digital
            para instituições públicas e empresas. Contas para cada formando,
            progresso registado, indicadores por instituição e funcionamento
            mesmo sem ligação à Internet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-brand px-6 text-base font-semibold text-brand-foreground hover:opacity-90"
            >
              Começar formação
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex h-12 items-center rounded-lg border border-border bg-card px-6 text-base font-semibold text-ink hover:bg-accent"
            >
              Sou instituição
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/" className="font-semibold text-ink underline">
              Iniciar sessão
            </Link>
          </p>
        </div>

        <div className="relative">
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Instituição
                </p>
                <p className="text-lg font-bold text-ink">
                  Município da Beira
                </p>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
                role="status"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-success"
                />
                Ativa
              </span>
            </div>

            <dl className="mt-6 grid grid-cols-3 gap-4">
              <Stat label="Formandos" value="248" />
              <Stat label="Concluíram" value="164" tone="success" />
              <Stat label="Módulos" value="12" tone="gold" />
            </dl>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink">
                  Progresso médio
                </span>
                <span className="font-semibold text-ink">66%</span>
              </div>
              <div
                className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary"
                role="progressbar"
                aria-label="Progresso médio dos formandos"
                aria-valuenow={66}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: "66%" }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-ink">
              <WifiOff aria-hidden="true" className="h-4 w-4 text-brand" />
              <span>
                <strong className="font-semibold">Modo offline</strong> · dados
                a sincronizar quando houver rede
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string;
  tone?: "ink" | "success" | "gold";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "gold"
        ? "text-gold"
        : "text-ink";
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={`mt-1 text-2xl font-extrabold ${toneClass}`}>{value}</dd>
    </div>
  );
}

function Features() {
  const items = [
    {
      icon: GraduationCap,
      title: "Módulos de literacia digital",
      body: "Percursos guiados de introdução ao computador, Internet segura, correio eletrónico, folha de cálculo e serviços públicos digitais.",
    },
    {
      icon: Users,
      title: "Progresso por formando",
      body: "Cada utilizador tem conta própria, com histórico de módulos concluídos, notas e certificados.",
    },
    {
      icon: BarChart3,
      title: "Indicadores por instituição",
      body: "Painéis com participação, taxas de conclusão e desempenho por turma, exportáveis em folha de cálculo.",
    },
    {
      icon: WifiOff,
      title: "Modo offline",
      body: "Formandos podem continuar a aprender sem rede; o progresso sincroniza automaticamente quando o telemóvel volta a ter ligação.",
    },
    {
      icon: ShieldCheck,
      title: "Contas seguras",
      body: "Palavra-passe protegida, sessões por perfil e gestão de permissões por instituição.",
    },
    {
      icon: Building2,
      title: "Multi-instituição",
      body: "Uma única plataforma para vários municípios, escolas e empresas — cada uma com o seu espaço isolado.",
    },
  ];

  return (
    <section
      id="formacao"
      aria-labelledby="formacao-titulo"
      className="border-t border-border bg-card"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="max-w-2xl">
          <h2
            id="formacao-titulo"
            className="text-3xl font-extrabold text-ink sm:text-4xl"
          >
            Uma plataforma feita para formar em escala.
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Ferramentas simples para formadores, coordenadores e formandos —
            desenhadas para o contexto moçambicano.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card-elevated p-6">
              <span
                aria-hidden="true"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-ink"
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Audiences() {
  return (
    <section
      id="instituicoes"
      aria-labelledby="publicos-titulo"
      className="border-t border-border"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <h2
          id="publicos-titulo"
          className="text-3xl font-extrabold text-ink sm:text-4xl"
        >
          Para quem é a Ologa?
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <AudienceCard
            tag="Instituições públicas"
            title="Municípios, direções e escolas"
            body="Formação em larga escala para funcionários e cidadãos, com relatórios prontos para prestação de contas."
          />
          <AudienceCard
            tag="Empresas"
            title="Equipas em transformação digital"
            body="Percursos de literacia digital para colaboradores, com acompanhamento por departamento."
            highlight
          />
          <AudienceCard
            tag="Formadores"
            title="Coordenadores e monitores"
            body="Criam turmas, marcam presenças, acompanham o progresso e emitem certificados."
          />
        </div>
      </div>
    </section>
  );
}

function AudienceCard({
  tag,
  title,
  body,
  highlight = false,
}: {
  tag: string;
  title: string;
  body: string;
  highlight?: boolean;
}) {
  return (
    <article
      className={
        highlight
          ? "rounded-xl border border-transparent bg-ink p-6 text-ink-foreground shadow-lg"
          : "card-elevated p-6"
      }
    >
      <p
        className={
          "text-xs font-semibold uppercase tracking-wide " +
          (highlight ? "text-gold" : "text-brand")
        }
      >
        {tag}
      </p>
      <h3
        className={
          "mt-2 text-xl font-bold " + (highlight ? "text-ink-foreground" : "text-ink")
        }
      >
        {title}
      </h3>
      <p
        className={
          "mt-3 text-sm leading-relaxed " +
          (highlight ? "text-ink-foreground/85" : "text-muted-foreground")
        }
      >
        {body}
      </p>
    </article>
  );
}

function Universal() {
  const points = [
    "Contraste mínimo WCAG AA em todo o texto e componentes.",
    "Navegação completa por teclado, com foco sempre visível.",
    "HTML semântico e etiquetas ARIA compatíveis com leitores de ecrã.",
    "A cor nunca é o único meio de transmitir informação.",
    "Linguagem simples, frases curtas e português de Portugal.",
  ];

  return (
    <section
      id="universal"
      aria-labelledby="universal-titulo"
      className="border-t border-border bg-ink text-ink-foreground"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1.2fr] md:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-ink-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
            <Accessibility aria-hidden="true" className="h-3.5 w-3.5" />
            Desenho Universal
          </span>
          <h2
            id="universal-titulo"
            className="mt-4 text-3xl font-extrabold text-ink-foreground sm:text-4xl"
          >
            Uma só aplicação — para todas as pessoas.
          </h2>
          <p className="mt-4 max-w-md text-base text-ink-foreground/80">
            A Ologa não tem versões especiais. É desenhada, desde a primeira
            linha de código, para funcionar para quem tem pouca experiência
            digital, deficiência visual, motora ou auditiva.
          </p>
        </div>

        <ul className="space-y-3">
          {points.map((p) => (
            <li
              key={p}
              className="flex items-start gap-3 rounded-lg bg-ink-foreground/5 p-4"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold"
              >
                ✓
              </span>
              <span className="text-sm leading-relaxed text-ink-foreground/90">
                {p}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-sm text-muted-foreground">
            Literacia Digital · Moçambique
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ologa. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
