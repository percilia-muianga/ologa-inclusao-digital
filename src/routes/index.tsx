import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/ologa-logo.png.asset.json";
import { ListenButton } from "@/components/listen-button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const HERO_TITLE = "Literacia digital para todos";
const HERO_DESC =
  "Formação em competências digitais para instituições públicas e empresas em Moçambique — presencial e virtual, desenhada para todas as pessoas, sem versões especiais.";

const UNIVERSAL_ITEMS: Array<{ title: string; text: string }> = [
  { title: "Áudio", text: "Qualquer lição pode ser ouvida em voz alta." },
  { title: "Leitura fácil", text: "Linguagem simples, para quem parte do zero." },
  {
    title: "Alto contraste e texto ampliável",
    text: "Para quem tem baixa visão.",
  },
  {
    title: "Teclado e leitores de ecrã",
    text: "Toda a plataforma se usa sem rato.",
  },
  {
    title: "Língua de Sinais Moçambicana",
    text: "Componente em desenvolvimento.",
  },
];

function HomePage() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3" aria-label="Ologa — Literacia Digital">
            <img
              src={logo.url}
              alt=""
              aria-hidden="true"
              className="h-12 w-auto"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-xl font-extrabold tracking-tight text-ink">OLOGA</span>
              <span className="text-sm text-muted-foreground">Literacia Digital</span>
            </span>
          </Link>

          <nav
            aria-label="Navegação principal"
            className="ml-auto flex flex-wrap items-center gap-2 sm:gap-4"
          >
            <Link
              to="/entrar"
              className="inline-flex min-h-11 items-center rounded-md px-3 text-base font-semibold text-ink hover:underline"
            >
              Entrar
            </Link>
            <Link
              to="/verificar"
              className="inline-flex min-h-11 items-center rounded-md px-3 text-base font-semibold text-ink hover:underline"
            >
              Verificar certificado
            </Link>
            <Link
              to="/inscricao"
              className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 text-base font-semibold text-brand-foreground shadow-sm transition-colors hover:brightness-95"
            >
              Inscrever a minha instituição
            </Link>
          </nav>
        </div>
      </header>

      <main id="conteudo">
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {HERO_TITLE}
          </h1>
          <p className="mt-5 text-lg text-foreground">{HERO_DESC}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/entrar"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-ink px-6 py-3 text-base font-semibold text-ink-foreground transition-colors hover:brightness-110"
            >
              Entrar
            </Link>
            <Link
              to="/inscricao"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-ink/20 bg-white px-6 py-3 text-base font-semibold text-ink transition-colors hover:bg-accent"
            >
              Criar conta com código da instituição
            </Link>
            <ListenButton sentences={[HERO_TITLE, HERO_DESC]} />
          </div>
        </section>

        <section
          aria-labelledby="desenhado-para-todos"
          className="border-t border-border bg-card"
        >
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2
              id="desenhado-para-todos"
              className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
            >
              Desenhado para todos
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-foreground">
              Desenhar um serviço para todos — sem precisar de ajustar quando a outra pessoa o
              for usar.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {UNIVERSAL_ITEMS.map((item) => (
                <li key={item.title} className="card-elevated p-5">
                  <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-1 text-base text-muted-foreground">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-8 sm:px-6">
          <img src={logo.url} alt="" aria-hidden="true" className="h-10 w-auto" />
          <div className="text-sm text-muted-foreground">
            <p>Ologa Sistemas Informáticos, Lda. · Maputo, Moçambique</p>
            <p>Empresa Certificada NM ISO 9001</p>
          </div>
        </div>
      </footer>
    </>
  );
}
