import { ErroPermissao } from "@/components/erro-permissao";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PlataformaPagina } from "@/components/plataforma-pagina";
import { criarWorkshop, listarReferenciasTdr } from "@/lib/workshops.functions";

export const Route = createFileRoute("/workshops/novo")({
  ssr: false,
  errorComponent: ({ error }) => <ErroPermissao erro={error} />,
  loader: () => listarReferenciasTdr(),
  head: () => ({
    meta: [
      { title: "Criar workshop — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Criação de workshop provincial ou distrital, com província, distrito, local, data, duração, facilitador e participantes previstos.",
      },
      { property: "og:title", content: "Criar workshop" },
      { property: "og:description", content: "Workshop provincial ou distrital de sensibilização." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NovoWorkshopPage,
});

function NovoWorkshopPage() {
  const { locais, distritos, config } = Route.useLoaderData();
  const criar = useServerFn(criarWorkshop);
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<"provincial" | "distrital">("provincial");
  const [provincia, setProvincia] = useState(locais[0]?.provincia ?? "");
  const [distrito, setDistrito] = useState("");
  const [local, setLocal] = useState("");
  const [data, setData] = useState("");
  const [duracao, setDuracao] = useState("6");
  const [facilitador, setFacilitador] = useState("");
  const [previstos, setPrevistos] = useState("60");
  const [erro, setErro] = useState<string | null>(null);
  const [aGuardar, setAGuardar] = useState(false);

  const maxHoras = Number(config["workshop_duracao_horas_max"] ?? 6);
  const grupoDistritos =
    distritos.find((d) => d.provincia === provincia)?.nomes ??
    distritos.find((d) => d.provincia.startsWith("Maputo"))?.nomes ??
    [];

  const campo = "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";
  const rotulo = "mb-1 block text-sm font-semibold text-navy";

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (Number(duracao) > maxHoras) {
      setErro(`A duração máxima de um workshop é de ${maxHoras} horas.`);
      return;
    }
    setAGuardar(true);
    try {
      const criado = await criar({
        data: {
          tipo,
          provincia,
          distrito: tipo === "distrital" ? distrito || null : null,
          local: local || null,
          data: data || null,
          duracaoHoras: Number(duracao),
          facilitador: facilitador || null,
          previstos: Number(previstos) || 0,
        },
      });
      navigate({ to: "/workshops/$id", params: { id: criado.id } });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar o workshop.");
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <PlataformaPagina
      titulo="Criar workshop"
      introducao="Workshop de um dia, de sensibilização, divulgação dos serviços digitais do Governo e auscultação. Não emite certificado com nota nem exige assiduidade mínima."
    >
      <form onSubmit={submeter} className="max-w-3xl space-y-5 rounded-lg border border-line bg-white p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tipo" className={rotulo}>
              Tipo de workshop
            </label>
            <select
              id="tipo"
              className={campo}
              value={tipo}
              onChange={(e) => {
                const v = e.target.value as "provincial" | "distrital";
                setTipo(v);
                setPrevistos(v === "provincial" ? "60" : "30");
              }}
            >
              <option value="provincial">Provincial — até 60 participantes</option>
              <option value="distrital">Distrital — de 25 a 30 participantes</option>
            </select>
          </div>
          <div>
            <label htmlFor="provincia" className={rotulo}>
              Província
            </label>
            <select
              id="provincia"
              className={campo}
              value={provincia}
              onChange={(e) => {
                setProvincia(e.target.value);
                setDistrito("");
              }}
            >
              {locais.map((l) => (
                <option key={l.provincia} value={l.provincia}>
                  {l.provincia} — {l.local}
                </option>
              ))}
            </select>
          </div>
          {tipo === "distrital" ? (
            <div>
              <label htmlFor="distrito" className={rotulo}>
                Distrito
              </label>
              <select
                id="distrito"
                className={campo}
                value={distrito}
                onChange={(e) => setDistrito(e.target.value)}
                required
              >
                <option value="">Escolha o distrito</option>
                {grupoDistritos.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label htmlFor="local" className={rotulo}>
              Local
            </label>
            <input id="local" className={campo} value={local} onChange={(e) => setLocal(e.target.value)} />
          </div>
          <div>
            <label htmlFor="data" className={rotulo}>
              Data
            </label>
            <input
              id="data"
              type="date"
              className={campo}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="duracao" className={rotulo}>
              Duração em horas (máximo {maxHoras})
            </label>
            <input
              id="duracao"
              type="number"
              step="0.5"
              min="0.5"
              max={maxHoras}
              className={campo}
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="facilitador" className={rotulo}>
              Formador ou facilitador
            </label>
            <input
              id="facilitador"
              className={campo}
              value={facilitador}
              onChange={(e) => setFacilitador(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="previstos" className={rotulo}>
              Participantes previstos
            </label>
            <input
              id="previstos"
              type="number"
              min="0"
              className={campo}
              value={previstos}
              onChange={(e) => setPrevistos(e.target.value)}
            />
          </div>
        </div>

        {erro ? (
          <p role="alert" className="text-base font-semibold text-brand-dark">
            {erro}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={aGuardar}
          className="inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground"
        >
          {aGuardar ? "A guardar…" : "Criar workshop"}
        </button>
      </form>
    </PlataformaPagina>
  );
}
