import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/ologa-logo.png.asset.json";
import { ListenButton } from "@/components/listen-button";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const HERO_EYEBROW = "Capacitação Digital Alinhada com a Lei n.º 10/2024";
const HERO_TITLE_A = "Literacia digital que sustenta a ";
const HERO_TITLE_HIGHLIGHT = "transformação do Estado";
const HERO_TITLE_B = " moçambicano";
const HERO_DESC =
  "Um único pacote: capacita as equipas e, ao mesmo tempo, reduz o risco de incumprimento. Presencial e virtual, desenhado para todas as pessoas — porque digitalizar sem desenho universal é reproduzir a exclusão em formato digital.";

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "#analise", label: "Análise de Mercado" },
  { href: "#inscricao", label: "Inscrição" },
  { href: "#indicadores", label: "Indicadores" },
  { href: "#cursos", label: "Cursos" },
  { href: "#percurso", label: "Percurso" },
  { href: "#entregaveis", label: "Entregáveis" },
  { href: "#contacto", label: "Contacto" },
];

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
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-semibold text-navy-2 transition-colors hover:bg-page hover:text-brand"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a href="#proposta" className="btn-brand btn-brand-hover">
            Solicitar Proposta
          </a>
        </div>
      </header>

      <main id="conteudo">
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
              <a href="#analise" className="btn-ghost-dark btn-ghost-dark-hover">
                Ver Análise de Mercado
              </a>
              <ListenButton
                variant="dark"
                sentences={[HERO_EYEBROW, `${HERO_TITLE_A}${HERO_TITLE_HIGHLIGHT}${HERO_TITLE_B}`, HERO_DESC]}
              />
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
          <nav aria-label="Ligações do rodapé" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <Link to="/verificar" className="text-white/70 underline hover:text-white">
              Verificar certificado
            </Link>
            <Link to="/entrar" className="text-white/50 hover:text-white/80">
              Área interna Ologa
            </Link>
            <span className="text-white/60">Empresa Certificada NM ISO 9001</span>
          </nav>
        </div>
      </footer>
    </>
  );
}
