import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";
import {
  actualizarWorkshop,
  listarReferenciasTdr,
  obterWorkshop,
  ESTADOS_WORKSHOP,
} from "@/lib/workshops.functions";

export const Route = createFileRoute("/workshops/editar/$id")({
  loader: async ({ params }) => {
    const [dados, referencias] = await Promise.all([
      obterWorkshop({ data: params.id }),
      listarReferenciasTdr(),
    ]);
    return { dados, referencias };
  },
  head: () => ({
    meta: [
      { title: "Editar workshop — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Alteração dos dados de um workshop provincial ou distrital: província, distrito, local, data, duração, facilitador, participantes previstos e estado.",
      },
      { property: "og:title", content: "Editar workshop" },
      {
        property: "og:description",
        content: "As alterações aos workshops ficam registadas na auditoria da plataforma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditarWorkshopPage,
});

const campo = "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";
const rotulo = "mb-1 block text-sm font-semibold text-navy";
const botao =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground";
const botaoSec =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-base font-semibold text-navy hover:bg-page";

function EditarWorkshopPage() {
  const { dados, referencias } = Route.useLoaderData();
  const { id } = Route.useParams();
  const actualizar = useServerFn(actualizarWorkshop);
  const navigate = useNavigate();
  const ws = dados?.workshop;

  const [tipo, setTipo] = useState<"provincial" | "distrital">(
    (ws?.tipo as "provincial" | "distrital") ?? "provincial",
  );
  const [provincia, setProvincia] = useState(ws?.provincia ?? "");
  const [distrito, setDistrito] = useState(ws?.distrito ?? "");
  const [local, setLocal] = useState(ws?.local ?? "");
  const [data, setData] = useState(ws?.data ?? "");
  const [duracao, setDuracao] = useState(String(ws?.duracao_horas ?? 6));
  const [facilitador, setFacilitador] = useState(ws?.facilitador_nome ?? "");
  const [previstos, setPrevistos] = useState(String(ws?.participantes_previstos ?? 0));
  const [estado, setEstado] = useState<string>(ws?.estado ?? "planeado");
  const [observacoes, setObservacoes] = useState(ws?.observacoes ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [aGuardar, setAGuardar] = useState(false);

  if (!dados || !ws) {
    return (
      <PlataformaPagina titulo="Workshop não encontrado">
        <EstadoVazio
          titulo="Não existe nenhum workshop com esta referência"
          descricao="Volte à lista de workshops e escolha um da lista."
          accao={
            <Link to="/workshops" className={botao}>
              Ver todos os workshops
            </Link>
          }
        />
      </PlataformaPagina>
    );
  }

  const maxHoras = Number(referencias.config["workshop_duracao_horas_max"] ?? 6);
  const grupoDistritos =
    referencias.distritos.find((d) => d.provincia === provincia)?.nomes ??
    referencias.distritos.find((d) => d.provincia.startsWith("Maputo"))?.nomes ??
    [];

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (Number(duracao) > maxHoras) {
      setErro(`A duração máxima de um workshop é de ${maxHoras} horas.`);
      return;
    }
    if (tipo === "distrital" && !distrito) {
      setErro("Um workshop distrital precisa do distrito onde se realiza.");
      return;
    }
    setAGuardar(true);
    try {
      await actualizar({
        data: {
          id,
          tipo,
          provincia,
          distrito: tipo === "distrital" ? distrito || null : null,
          local: local || null,
          data: data || null,
          duracaoHoras: Number(duracao),
          facilitador: facilitador || null,
          previstos: Number(previstos) || 0,
          estado,
          observacoes: observacoes || null,
        },
      });
      navigate({ to: "/workshops/$id", params: { id } });
    } catch {
      setErro("Não foi possível gravar as alterações. Tente novamente.");
      setAGuardar(false);
    }
  }

  return (
    <PlataformaPagina
      titulo="Editar workshop"
      introducao="Toda a alteração a um workshop fica no registo de auditoria, com o valor anterior, o valor novo, a data e a hora."
    >
      <form
        onSubmit={submeter}
        className="max-w-3xl space-y-5 rounded-lg border border-line bg-white p-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="w-tipo" className={rotulo}>
              Tipo de workshop
            </label>
            <select
              id="w-tipo"
              className={campo}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "provincial" | "distrital")}
            >
              <option value="provincial">Provincial — até 60 participantes</option>
              <option value="distrital">Distrital — de 25 a 30 participantes</option>
            </select>
          </div>
          <div>
            <label htmlFor="w-provincia" className={rotulo}>
              Província
            </label>
            <select
              id="w-provincia"
              className={campo}
              value={provincia}
              onChange={(e) => {
                setProvincia(e.target.value);
                setDistrito("");
              }}
            >
              {referencias.locais.map((l) => (
                <option key={l.provincia} value={l.provincia}>
                  {l.provincia} — {l.local}
                </option>
              ))}
            </select>
          </div>
          {tipo === "distrital" ? (
            <div>
              <label htmlFor="w-distrito" className={rotulo}>
                Distrito
              </label>
              <select
                id="w-distrito"
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
            <label htmlFor="w-local" className={rotulo}>
              Local
            </label>
            <input
              id="w-local"
              className={campo}
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="w-data" className={rotulo}>
              Data
            </label>
            <input
              id="w-data"
              type="date"
              className={campo}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="w-duracao" className={rotulo}>
              Duração em horas (máximo {maxHoras})
            </label>
            <input
              id="w-duracao"
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
            <label htmlFor="w-facilitador" className={rotulo}>
              Formador ou facilitador
            </label>
            <input
              id="w-facilitador"
              className={campo}
              value={facilitador}
              onChange={(e) => setFacilitador(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="w-previstos" className={rotulo}>
              Participantes previstos
            </label>
            <input
              id="w-previstos"
              type="number"
              min="0"
              className={campo}
              value={previstos}
              onChange={(e) => setPrevistos(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="w-estado" className={rotulo}>
              Estado
            </label>
            <select
              id="w-estado"
              className={campo}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {ESTADOS_WORKSHOP.map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="w-observacoes" className={rotulo}>
              Observações
            </label>
            <textarea
              id="w-observacoes"
              rows={3}
              className="w-full rounded-md border border-line bg-white p-3 text-base text-navy"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        {erro ? (
          <p role="alert" className="text-base font-semibold text-brand-dark">
            {erro}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={aGuardar} className={botao}>
            {aGuardar ? "A guardar…" : "Gravar alterações"}
          </button>
          <Link to="/workshops/$id" params={{ id }} className={botaoSec}>
            Cancelar
          </Link>
        </div>
      </form>
    </PlataformaPagina>
  );
}
