import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <p className="inline-flex items-center gap-2" aria-label="Ologa — Literacia Digital">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-brand-foreground font-extrabold"
            >
              O
            </span>
            <span className="text-lg font-extrabold tracking-tight text-ink">
              Ologa — Literacia Digital
            </span>
          </p>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">
          Ologa — Literacia Digital
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Plataforma de formação em competências digitais para instituições
          públicas e empresas em Moçambique.
        </p>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ologa.
          </p>
        </div>
      </footer>
    </div>
  );
}
