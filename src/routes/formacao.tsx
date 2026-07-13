import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import logo from "@/assets/ologa-logo.png.asset.json";

export const Route = createFileRoute("/formacao")({
  component: FormacaoLayout,
});

function FormacaoLayout() {
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
          <nav aria-label="Navegação secundária" className="flex items-center gap-4 text-sm">
            <Link to="/formacao" className="font-semibold text-navy hover:text-brand">
              Cursos
            </Link>
            <Link to="/verificar" className="text-navy-2 hover:text-brand">
              Verificar certificado
            </Link>
          </nav>
        </div>
      </header>
      <main id="conteudo">
        <Outlet />
      </main>
    </>
  );
}
