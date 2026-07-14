import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/ologa-logo.png.asset.json";

type NavItem = { href?: string; to?: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/#mercado", label: "Análise de Mercado" },
  { href: "/#inscricao", label: "Inscrição" },
  { href: "/#indicadores", label: "Indicadores" },
  { href: "/#modulos", label: "Cursos" },
  { href: "/#percurso", label: "Percurso" },
  { href: "/#entregaveis", label: "Entregáveis" },
  { href: "/#contacto", label: "Contacto" },
];

const MOBILE_NAV_ITEMS: NavItem[] = [
  ...NAV_ITEMS,
  { to: "/verificar", label: "Verificar certificado" },
];

export function SiteHeader() {
  const [aberto, setAberto] = useState(false);
  const botaoRef = useRef<HTMLButtonElement | null>(null);
  const painelRef = useRef<HTMLDivElement | null>(null);

  // Fechar com Esc, e devolver o foco ao botão
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

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 font-extrabold tracking-wide"
          aria-label="Ologa — Agência de Transformação Digital"
          onClick={fechar}
        >
          <img src={logo.url} alt="" aria-hidden="true" className="h-9 w-auto shrink-0" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-base font-extrabold text-navy">OLOGA</span>
            <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Agência de Transformação Digital
            </span>
          </span>
        </Link>

        {/* Navegação desktop — a partir de lg (~1024px) */}
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-0 lg:flex xl:gap-1"
        >
          {NAV_ITEMS.map((item) =>
            item.to ? (
              <Link
                key={item.to}
                to={item.to}
                className="whitespace-nowrap rounded-md px-1.5 py-2 text-[12px] font-semibold text-navy-2 transition-colors hover:bg-page hover:text-brand xl:px-2 xl:text-[13px]"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-md px-1.5 py-2 text-[12px] font-semibold text-navy-2 transition-colors hover:bg-page hover:text-brand xl:px-2 xl:text-[13px]"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href="/#inscricao"
            className="btn-brand btn-brand-hover hidden whitespace-nowrap sm:inline-flex"
          >
            Solicitar Proposta
          </a>

          {/* Botão de menu — visível abaixo do xl */}
          <button
            ref={botaoRef}
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-controls="menu-principal"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line text-navy transition-colors hover:bg-page xl:hidden"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {aberto ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Painel do menu (móvel/tablet) */}
      {aberto ? (
        <div
          ref={painelRef}
          id="menu-principal"
          className="border-t border-line bg-white xl:hidden"
        >
          <nav aria-label="Navegação principal" className="wrap flex flex-col py-2">
            {NAV_ITEMS.map((item) =>
              item.to ? (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={fechar}
                  className="min-h-11 rounded-md px-3 py-2.5 text-base font-semibold text-navy-2 hover:bg-page hover:text-brand"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={fechar}
                  className="min-h-11 rounded-md px-3 py-2.5 text-base font-semibold text-navy-2 hover:bg-page hover:text-brand"
                >
                  {item.label}
                </a>
              ),
            )}
            <a
              href="/#inscricao"
              onClick={fechar}
              className="btn-brand btn-brand-hover mt-2 sm:hidden"
            >
              Solicitar Proposta
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
