import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { verificarCodigo } from "@/lib/verificar.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/verificar")({
  head: () => ({
    meta: [
      { title: "Verificar certificado — Ologa" },
      {
        name: "description",
        content:
          "Confirme a autenticidade de um certificado emitido pela plataforma Ologa.",
      },
    ],
  }),
  component: VerificarPage,
});

type Estado =
  | { tipo: "idle" }
  | { tipo: "a_verificar" }
  | { tipo: "invalido" }
  | {
      tipo: "ok";
      certificado: {
        nome_formando: string;
        modulo: string;
        instituicao: string;
        data: string;
      };
    };

function VerificarPage() {
  const [codigo, setCodigo] = useState("");
  const [estado, setEstado] = useState<Estado>({ tipo: "idle" });
  const verificar = useServerFn(verificarCodigo);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    const c = codigo.trim();
    if (c.length < 4) return;
    setEstado({ tipo: "a_verificar" });
    const r = await verificar({ data: { codigo: c } });
    if (!r.ok) setEstado({ tipo: "invalido" });
    else setEstado({ tipo: "ok", certificado: r.certificado });
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold text-ink">Verificar certificado</h1>
        <p className="mt-3 text-base text-foreground">
          Introduza o código de verificação impresso no certificado para confirmar que foi
          emitido pela plataforma Ologa.
        </p>
        <form onSubmit={submeter} className="mt-6 flex flex-wrap gap-3">
          <label htmlFor="codigo" className="sr-only">
            Código de verificação do certificado
          </label>
          <input
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            className="min-w-[240px] flex-1 rounded-md border border-ink/20 px-3 py-2 text-base"
            placeholder="Código do certificado"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className="rounded-md bg-brand-dark px-4 py-2 text-base font-semibold text-white"
          >
            Verificar
          </button>
        </form>

        <div className="mt-8" role="status" aria-live="polite">
          {estado.tipo === "a_verificar" && <p className="text-foreground">A verificar…</p>}
          {estado.tipo === "invalido" && (
            <p className="rounded-md bg-red-50 p-4 text-ink">
              Não encontrámos nenhum certificado com esse código.
            </p>
          )}
          {estado.tipo === "ok" && (
            <div className="rounded-md border border-ink/10 bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-ink/60">
                Certificado válido
              </p>
              <dl className="mt-4 grid gap-2 text-base sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-ink/70">Formando</dt>
                  <dd className="text-ink">{estado.certificado.nome_formando}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink/70">Módulo</dt>
                  <dd className="text-ink">{estado.certificado.modulo}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink/70">Instituição</dt>
                  <dd className="text-ink">{estado.certificado.instituicao}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink/70">Data de emissão</dt>
                  <dd className="text-ink">
                    {new Date(estado.certificado.data).toLocaleDateString("pt-PT")}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
