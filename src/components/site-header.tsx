import { Link } from "@tanstack/react-router";
import logo from "@/assets/ologa-logo.png.asset.json";

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/#mercado", label: "Análise de Mercado" },
  { href: "/#inscricao", label: "Inscrição" },
  { href: "/#indicadores", label: "Indicadores" },
  { href: "/#modulos", label: "Cursos" },
  { href: "/#percurso", label: "Percurso" },
  { href: "/#entregaveis", label: "Entregáveis" },
  { href: "/#contacto", label: "Contacto" },
];

export function SiteHeader() {
  return (
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

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-navy-2 transition-colors hover:bg-page hover:text-brand"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/verificar"
            className="rounded-md px-3 py-2 text-sm font-semibold text-navy-2 transition-colors hover:bg-page hover:text-brand"
          >
            Verificar certificado
          </Link>
        </nav>

        <a href="/#inscricao" className="btn-brand btn-brand-hover">
          Solicitar Proposta
        </a>
      </div>
    </header>
  );
}
