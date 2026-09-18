import { Link } from "@tanstack/react-router";

export function PlataformaFooter() {
  const link =
    "text-sm font-semibold text-navy-2 underline-offset-2 transition-colors hover:text-brand-dark hover:underline";

  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-8 sm:px-6">
        <p className="text-sm font-bold text-navy">
          Plataforma Nacional de Capacitação Digital
        </p>
        <nav aria-label="Navegação de rodapé" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/" className={link}>
            Página inicial
          </Link>
          <Link to="/cursos" className={link}>
            Cursos
          </Link>
          <Link to="/formacao" className={link}>
            Módulos de literacia digital
          </Link>
          <Link to="/verificar" className={link}>
            Verificar certificado
          </Link>
          <Link to="/conformidade" className={link}>
            Conformidade
          </Link>
          <Link to="/entrar" className={link}>
            Entrar
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          Acesso público e anónimo aos módulos de literacia digital. Sem necessidade de
          criar conta.
        </p>
        <p className="text-xs text-muted-foreground">
          <Link to="/ologa" className="font-semibold underline">
            Sobre a Ologa
          </Link>{" "}
          — informação institucional e comercial da entidade que opera a plataforma.
        </p>
      </div>
    </footer>
  );
}
