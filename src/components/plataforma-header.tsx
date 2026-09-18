import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/ologa-logo.png.asset.json";

type Item = { to: string; label: string };

export const NAV_PLATAFORMA: Item[] = [
  { to: "/cursos", label: "Cursos" },
  { to: "/turmas", label: "Turmas" },
  { to: "/presencas", label: "Presenças" },
  { to: "/avaliacao", label: "Avaliação" },
  { to: "/certificados", label: "Certificados" },
  { to: "/painel-nacional", label: "Painel Nacional" },
  { to: "/conformidade", label: "Conformidade" },
];

export function PlataformaHeader() {
  const [aberto, setAberto] = useState(false);
  const botaoRef = useRef<HTMLButtonElement | null>(null);
  const painelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (
        painelRef.current &&
        !painelRef.current.contains(alvo) &&
        botaoRef.current &&
        !botaoRef.current.contains(alvo)
      ) {
        setAberto(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [aberto]);

  const fechar = () => setAberto(false);

  const linkDesktop =
    "whitespace-nowrap rounded-md px-1.5 py-2 text-[12px] font-semibold text-navy-2 transition-colors hover:bg-page hover:text-brand-dark xl:px-2 xl:text-[13px]";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          onClick={fechar}
          className="flex min-w-0 items-center gap-2.5 font-extrabold tracking-wide"
          aria-label="Plataforma Nacional de Capacitação Digital — página inicial"
        >
          <img src={logo.url} alt="" aria-hidden="true" className="h-9 w-auto shrink-0" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-base font-extrabold text-navy">
              Capacitação Digital
            </span>
            <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Programa Nacional — Moçambique
            </span>
          </span>
        </Link>

        <nav
          aria-label="Navegação principal da plataforma"
          className="hidden items-center gap-0 lg:flex xl:gap-1"
        >
          {NAV_PLATAFORMA.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkDesktop}
              activeProps={{ className: `${linkDesktop} bg-page text-brand-dark` }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/entrar"
            onClick={fechar}
            className="hidden min-h-11 items-center rounded-md bg-navy px-4 text-sm font-semibold text-navy-foreground transition-colors hover:bg-navy-2 sm:inline-flex"
          >
            Entrar
          </Link>
          <button
            ref={botaoRef}
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="menu-plataforma"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line text-navy transition-colors hover:bg-page lg:hidden"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {aberto ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {aberto ? (
        <div
          ref={painelRef}
          id="menu-plataforma"
          className="border-t border-line bg-white lg:hidden"
        >
          <nav
            aria-label="Navegação principal da plataforma"
            className="mx-auto flex max-w-[1360px] flex-col px-4 py-2 sm:px-6"
          >
            {NAV_PLATAFORMA.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={fechar}
                className="min-h-11 rounded-md px-3 py-2.5 text-base font-semibold text-navy-2 hover:bg-page hover:text-brand-dark"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/verificar"
              onClick={fechar}
              className="min-h-11 rounded-md px-3 py-2.5 text-base font-semibold text-navy-2 hover:bg-page hover:text-brand-dark"
            >
              Verificar certificado
            </Link>
            <Link
              to="/entrar"
              onClick={fechar}
              className="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground sm:hidden"
            >
              Entrar
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
