import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/ologa-logo.png.asset.json";
import { ListenButton } from "@/components/listen-button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const HERO_EYEBROW = "Plataforma de Literacia Digital";
const HERO_TITLE_A = "Literacia digital para a ";
const HERO_TITLE_HIGHLIGHT = "transformação de Moçambique";
const HERO_DESC =
  "Formação em competências digitais para instituições públicas e empresas — presencial e virtual, desenhada para todas as pessoas. Sem versões especiais.";

function HomePage() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>

      <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-extrabold tracking-wide"
            aria-label="Ologa — Literacia Digital"
          >
            <img src={logo.url} alt="" aria-hidden="true" className="h-9 w-auto" />
            <span className="flex flex-col leading-tight">
              <span className="text-base font-extrabold text-navy">OLOGA</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Literacia Digital
              </span>
            </span>
          </Link>

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-1 md:flex"
          >
            <Link
              to="/entrar"
              className="rounded-md px-3 py-2 text-sm font-semibold text-navy-2 transition-colors hover:bg-page hover:text-brand"
            >
              Entrar
            </Link>
            <Link
              to="/verificar"
              className="rounded-md px-3 py-2 text-sm font-semibold text-navy-2 transition-colors hover:bg-page hover:text-brand"
            >
              Verificar certificado
            </Link>
          </nav>

          <Link to="/inscricao" className="btn-brand btn-brand-hover">
            Inscrever instituição
          </Link>
        </div>
      </header>

      <main id="conteudo">
        <section className="hero-bg hero-halo">
          <div className="wrap relative z-[2] max-w-[760px] py-[74px] pb-16">
            <span className="pill-dark mb-5">{HERO_EYEBROW}</span>
            <h1 className="mb-4 text-[42px] font-extrabold leading-[1.12] text-white sm:text-[42px]">
              {HERO_TITLE_A}
              <span className="text-gold">{HERO_TITLE_HIGHLIGHT}</span>
            </h1>
            <p className="mb-7 max-w-[620px] text-[17.5px] text-[#d6dde4]">{HERO_DESC}</p>

            <div className="flex flex-wrap gap-3">
              <Link to="/inscricao" className="btn-brand btn-brand-hover">
                Inscrever a minha instituição
              </Link>
              <Link to="/entrar" className="btn-ghost-dark btn-ghost-dark-hover">
                Entrar
              </Link>
              <ListenButton sentences={[HERO_EYEBROW, `${HERO_TITLE_A}${HERO_TITLE_HIGHLIGHT}`, HERO_DESC]} />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy text-white/70">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 py-10">
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="" aria-hidden="true" className="h-9 w-auto" />
            <div className="text-sm">
              <p className="font-extrabold text-white">OLOGA</p>
              <p className="text-white/60">Ologa Sistemas Informáticos, Lda. · Maputo, Moçambique</p>
            </div>
          </div>
          <p className="text-xs text-white/60">Empresa Certificada NM ISO 9001</p>
        </div>
      </footer>
    </>
  );
}
