import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="wrap flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
        <p className="text-sm font-semibold text-navy-2">
          Ologa — Literacia Digital
        </p>
        <nav aria-label="Navegação de rodapé" className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-semibold text-navy-2 transition-colors hover:text-brand"
          >
            Página inicial
          </Link>
          <span className="text-line" aria-hidden="true">
            ·
          </span>
          <Link
            to="/formacao"
            className="text-sm font-semibold text-navy-2 transition-colors hover:text-brand"
          >
            Cursos
          </Link>
        </nav>
      </div>
    </footer>
  );
}
