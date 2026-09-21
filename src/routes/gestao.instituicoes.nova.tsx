import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import {
  criarInstituicaoManual,
  listarModulosAdmin,
} from "@/lib/instituicoes.functions";
import {
  FormularioInstituicao,
  type Modulo,
  type PayloadInstituicao,
} from "@/components/formulario-instituicao";

export const Route = createFileRoute("/gestao/instituicoes/nova")({
  head: () => ({ meta: [{ title: "Nova instituição — Plataforma Nacional de Capacitação Digital" }] }),
  component: NovaInstituicaoPage,
});

function NovaInstituicaoPage() {
  const guard = useAdminGuard();
  const navigate = useNavigate();
  const listar = useServerFn(listarModulosAdmin);
  const criar = useServerFn(criarInstituicaoManual);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [modulosCarregados, setModulosCarregados] = useState(false);
  const [aSubmeter, setASubmeter] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (guard.estado !== "ok") return;
    listar().then((res) => {
      if (res.ok) setModulos(res.modulos as Modulo[]);
      setModulosCarregados(true);
    });
  }, [guard.estado, listar]);

  async function onSubmit(payload: PayloadInstituicao) {
    setErro(null);
    setASubmeter(true);
    const res = await criar({ data: payload });
    setASubmeter(false);
    if (res.ok) {
      navigate({ to: "/gestao/instituicoes/$id", params: { id: res.id } });
    } else {
      setErro(res.mensagem || "Não foi possível criar a instituição.");
    }
  }

  if (guard.estado === "a_verificar") {
    return (
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p role="status" aria-live="polite" className="text-base text-foreground">
          A verificar acesso…
        </p>
      </main>
    );
  }
  if (guard.estado !== "ok") return null;

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p>
          <Link to="/gestao/instituicoes" className="text-base font-semibold text-ink underline">
            ← Voltar à lista
          </Link>
        </p>
        <h1 className="mt-4 text-3xl font-extrabold text-ink">
          Criar instituição manualmente
        </h1>
        <p className="mt-2 text-base text-foreground">
          Use este formulário quando é a Ologa a inscrever a instituição em nome dela.
          É gerado automaticamente um código de inscrição.
        </p>

        <div className="mt-8">
          <FormularioInstituicao
            modo="admin"
            modulos={modulos}
            modulosCarregados={modulosCarregados}
            aSubmeter={aSubmeter}
            onSubmit={onSubmit}
            textoBotao="Criar instituição"
            mensagemErro={erro}
          />
        </div>
      </main>
    </>
  );
}
