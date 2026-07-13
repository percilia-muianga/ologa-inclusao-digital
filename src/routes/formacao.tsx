import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/formacao")({
  component: FormacaoLayout,
});

function FormacaoLayout() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <SiteHeader />
      <main id="conteudo">
        <Outlet />
      </main>
    </>
  );
}
