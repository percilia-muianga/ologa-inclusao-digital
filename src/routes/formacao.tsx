import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PlataformaHeader } from "@/components/plataforma-header";
import { PlataformaFooter } from "@/components/plataforma-footer";

export const Route = createFileRoute("/formacao")({
  component: FormacaoLayout,
});

function FormacaoLayout() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <PlataformaHeader />
      <main id="conteudo">
        <Outlet />
      </main>
      <PlataformaFooter />
    </>
  );
}
