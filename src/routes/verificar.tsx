import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { verificarCodigo } from "@/lib/verificar.functions";

export const Route = createFileRoute("/verificar")({
  head: () => ({
    meta: [
      { title: "Verificar documento — Ologa" },
      {
        name: "description",
        content:
          "Confirme a autenticidade de um certificado ou declaração emitidos pela plataforma Ologa.",
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
      instituicao: {
        nome: string;
        localizacao: string;
        registada_em: string;
        declaracao_assinada: boolean;
        concluidos: number;
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
    else setEstado({ tipo: "ok", instituicao: r.instituicao });
  }

  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Verificar documento</h1>
      <p className="mt-3 text-base text-foreground">
        Introduza o código de verificação impresso no certificado ou declaração para confirmar que
        foram emitidos pela plataforma Ologa.
      </p>
      <form onSubmit={submeter} className="mt-6 flex flex-wrap gap-3">
        <label htmlFor="codigo" className="sr-only">
          Código de verificação
        </label>
        <input
          id="codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          className="min-w-[240px] flex-1 rounded-md border border-ink/20 px-3 py-2 text-base"
          placeholder="Ex.: ABCD2345"
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
            Não encontrámos nenhum documento com esse código.
          </p>
        )}
        {estado.tipo === "ok" && (
          <div className="rounded-md border border-ink/10 bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-ink/60">
              Documento válido
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">{estado.instituicao.nome}</h2>
            {estado.instituicao.localizacao && (
              <p className="mt-1 text-foreground">{estado.instituicao.localizacao}</p>
            )}
            <dl className="mt-4 grid gap-2 text-base sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-ink/70">Colaboradores capacitados</dt>
                <dd className="text-ink">{estado.instituicao.concluidos}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink/70">Declaração de desenho universal</dt>
                <dd className="text-ink">
                  {estado.instituicao.declaracao_assinada ? "Assinada" : "Ainda por assinar"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-ink/70">Registada em</dt>
                <dd className="text-ink">
                  {new Date(estado.instituicao.registada_em).toLocaleDateString("pt-PT")}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-ink/60">
              Este documento atesta a formação realizada. Não constitui certificação de conformidade
              legal.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
