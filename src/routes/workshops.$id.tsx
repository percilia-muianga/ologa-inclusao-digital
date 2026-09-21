import { ErroPermissao } from "@/components/erro-permissao";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";
import {
  obterWorkshop,
  registarParticipantes,
  registarAvaliacaoConhecimento,
  registarSatisfacao,
  registarInqueritoEficacia,
  rotuloEstadoWorkshop,
} from "@/lib/workshops.functions";

export const Route = createFileRoute("/workshops/$id")({
  ssr: false,
  errorComponent: ({ error }) => <ErroPermissao erro={error} />,
  loader: ({ params }) => obterWorkshop({ data: params.id }),
  head: () => ({
    meta: [
      { title: "Workshop — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Ficha do workshop, folha de registo de participantes que funciona sem ligação, pré-teste e pós-teste, satisfação e inquérito de eficácia.",
      },
      { property: "og:title", content: "Ficha de workshop" },
      {
        property: "og:description",
        content: "Registo de participantes no próprio dia, com sincronização quando a ligação voltar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkshopPage,
});

type LinhaOffline = {
  nome: string;
  entidade: string;
  provincia: string;
  distrito: string;
  genero: string;
  contacto: string;
};

const LINHA_VAZIA: LinhaOffline = {
  nome: "",
  entidade: "",
  provincia: "",
  distrito: "",
  genero: "",
  contacto: "",
};

function formatarData(valor: string | null) {
  if (!valor) return "—";
  return new Date(`${valor}T00:00:00`).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const campo = "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";
const rotulo = "mb-1 block text-sm font-semibold text-navy";
const botao =
  "inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground";

function WorkshopPage() {
  const dados = Route.useLoaderData();
  const { id } = Route.useParams();
  const router = useRouter();

  if (!dados) {
    return (
      <PlataformaPagina titulo="Workshop não encontrado">
        <EstadoVazio
          titulo="Não existe nenhum workshop com esta referência"
          descricao="Confirme a ligação ou volte à lista de workshops."
          accao={
            <Link to="/workshops" className={botao}>
              Ver todos os workshops
            </Link>
          }
        />
      </PlataformaPagina>
    );
  }

  const { workshop, participantes, preMedia, posMedia, evolucaoPp, satisfacaoMedia } = dados;

  return (
    <PlataformaPagina
      titulo={`Workshop ${workshop.tipo === "provincial" ? "provincial" : "distrital"} — ${workshop.provincia}`}
    >
      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-3">
        <p className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 py-2 text-base font-bold text-navy-foreground">
          <span className="sr-only">Local de realização: </span>
          {workshop.provincia}
          {workshop.distrito ? ` · ${workshop.distrito}` : ""}
        </p>
        <Link
          to="/workshops/editar/$id"
          params={{ id }}
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-white px-4 text-base font-semibold text-navy hover:bg-page"
        >
          Editar workshop
        </Link>
      </div>

      <section aria-labelledby="ficha" className="rounded-lg border border-line bg-white p-5">
        <h2 id="ficha" className="text-xl font-bold text-navy">
          Ficha do workshop
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <dt className="text-sm text-navy-2">Local</dt>
            <dd className="font-bold text-navy">{workshop.local ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Data</dt>
            <dd className="font-bold text-navy">{formatarData(workshop.data)}</dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Duração</dt>
            <dd className="font-bold text-navy">{Number(workshop.duracao_horas)} horas</dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Formador ou facilitador</dt>
            <dd className="font-bold text-navy">{workshop.facilitador_nome ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Participantes</dt>
            <dd className="font-bold text-navy">
              {participantes.length} de {workshop.participantes_previstos || "—"} previstos
            </dd>
          </div>
          <div>
            <dt className="text-sm text-navy-2">Estado</dt>
            <dd className="font-bold text-navy">{rotuloEstadoWorkshop(workshop.estado)}</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-md border border-line bg-page p-4 text-base text-navy-2">
          Os participantes deste workshop não estão sujeitos aos critérios de certificação dos seis
          cursos formais: não há nota de exame nem exigência de oitenta por cento de assiduidade.
        </p>
      </section>

      <FolhaParticipantes
        workshopId={id}
        aoGuardar={() => router.invalidate()}
        participantes={participantes}
      />

      <section aria-labelledby="medicao" className="mt-10">
        <h2 id="medicao" className="text-xl font-bold text-navy">
          Pré-teste, pós-teste, satisfação e eficácia
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Média do pré-teste", preMedia === null ? "—" : `${preMedia}%`],
            ["Média do pós-teste", posMedia === null ? "—" : `${posMedia}%`],
            [
              "Evolução",
              evolucaoPp === null ? "—" : `${evolucaoPp > 0 ? "+" : ""}${evolucaoPp} pontos percentuais`,
            ],
            [
              "Satisfação média",
              satisfacaoMedia === null ? "—" : `${satisfacaoMedia} em 5`,
            ],
          ].map(([t, v]) => (
            <div key={t} className="rounded-md border border-line bg-white p-4">
              <dt className="text-sm text-navy-2">{t}</dt>
              <dd className="text-2xl font-extrabold text-navy">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <FormularioTeste workshopId={id} provincia={workshop.provincia} aoGuardar={() => router.invalidate()} />
          <FormularioSatisfacao
            workshopId={id}
            provincia={workshop.provincia}
            aoGuardar={() => router.invalidate()}
          />
          <FormularioEficacia workshopId={id} provincia={workshop.provincia} />
        </div>
      </section>

      <p className="mt-8 text-sm">
        <Link to="/workshops" className="font-semibold text-navy underline">
          Voltar à lista de workshops
        </Link>
      </p>
    </PlataformaPagina>
  );
}

/** Folha de registo que funciona sem ligação e envia quando a ligação voltar. */
function FolhaParticipantes({
  workshopId,
  participantes,
  aoGuardar,
}: {
  workshopId: string;
  participantes: Array<{
    id: string;
    nome: string;
    entidade: string | null;
    provincia: string | null;
    distrito: string | null;
    genero: string | null;
    contacto: string | null;
    duplicado_provavel: boolean;
    origem_offline: boolean;
  }>;
  aoGuardar: () => void;
}) {
  const enviar = useServerFn(registarParticipantes);
  const chave = `folha-workshop-${workshopId}`;
  const [linhas, setLinhas] = useState<LinhaOffline[]>([{ ...LINHA_VAZIA }]);
  const [porEnviar, setPorEnviar] = useState<LinhaOffline[]>([]);
  const [online, setOnline] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const guardadas = localStorage.getItem(chave);
    if (guardadas) {
      try {
        setPorEnviar(JSON.parse(guardadas) as LinhaOffline[]);
      } catch {
        /* folha ilegível: mantém-se guardada, nunca se apaga */
      }
    }
    const aoLigar = () => setOnline(true);
    const aoDesligar = () => setOnline(false);
    window.addEventListener("online", aoLigar);
    window.addEventListener("offline", aoDesligar);
    return () => {
      window.removeEventListener("online", aoLigar);
      window.removeEventListener("offline", aoDesligar);
    };
  }, [chave]);

  async function sincronizar(lista: LinhaOffline[]) {
    const resultado = await enviar({
      data: {
        workshopId,
        origemOffline: true,
        participantes: lista.map((l) => ({
          nome: l.nome,
          entidade: l.entidade || null,
          provincia: l.provincia || null,
          distrito: l.distrito || null,
          genero: l.genero || null,
          contacto: l.contacto || null,
        })),
      },
    });
    localStorage.removeItem(chave);
    setPorEnviar([]);
    setAviso(
      `${resultado.registados} participantes somados ao registo.` +
        (resultado.duplicados > 0
          ? ` ${resultado.duplicados} ficaram assinalados como duplicado provável, para revisão manual. Nenhum registo foi apagado.`
          : ""),
    );
    aoGuardar();
  }

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setAviso(null);
    const validas = linhas.filter((l) => l.nome.trim().length > 0);
    if (validas.length === 0) {
      setAviso("Escreva pelo menos o nome de um participante.");
      return;
    }
    if (!navigator.onLine) {
      const acumuladas = [...porEnviar, ...validas];
      localStorage.setItem(chave, JSON.stringify(acumuladas));
      setPorEnviar(acumuladas);
      setLinhas([{ ...LINHA_VAZIA }]);
      setAviso(
        `Sem ligação. ${validas.length} participantes ficaram guardados neste aparelho e são enviados assim que a ligação voltar.`,
      );
      return;
    }
    try {
      await sincronizar([...porEnviar, ...validas]);
      setLinhas([{ ...LINHA_VAZIA }]);
    } catch {
      const acumuladas = [...porEnviar, ...validas];
      localStorage.setItem(chave, JSON.stringify(acumuladas));
      setPorEnviar(acumuladas);
      setAviso("Não foi possível enviar agora. Os registos ficaram guardados neste aparelho.");
    }
  }

  function alterar(indice: number, campoNome: keyof LinhaOffline, valor: string) {
    setLinhas((atual) =>
      atual.map((l, i) => (i === indice ? { ...l, [campoNome]: valor } : l)),
    );
  }

  return (
    <section aria-labelledby="participantes" className="mt-10">
      <h2 id="participantes" className="text-xl font-bold text-navy">
        Registo de participantes
      </h2>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Registo leve, feito no próprio dia pelo facilitador. Funciona sem ligação: o que escrever
        fica guardado no aparelho e é enviado quando a ligação voltar. Os registos somam-se sempre —
        nunca substituem nem apagam o que já existe.
      </p>

      <p
        role="status"
        className={
          online
            ? "mt-3 rounded-md border border-line bg-page p-3 text-base text-navy"
            : "mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-base text-navy"
        }
      >
        {online ? "Com ligação à internet." : "Sem ligação à internet — a trabalhar no aparelho."}
        {porEnviar.length > 0
          ? ` ${porEnviar.length} registos por enviar guardados neste aparelho.`
          : ""}
      </p>

      {porEnviar.length > 0 && online ? (
        <button type="button" className={`${botao} mt-3`} onClick={() => void sincronizar(porEnviar)}>
          Enviar agora os {porEnviar.length} registos guardados
        </button>
      ) : null}

      <form onSubmit={submeter} className="mt-4 space-y-4 rounded-lg border border-line bg-white p-5">
        {linhas.map((linha, i) => (
          <fieldset key={i} className="grid gap-4 border-t border-line pt-4 first:border-0 first:pt-0 sm:grid-cols-3">
            <legend className="text-sm font-bold text-navy">Participante {i + 1}</legend>
            <div>
              <label htmlFor={`nome-${i}`} className={rotulo}>
                Nome
              </label>
              <input
                id={`nome-${i}`}
                className={campo}
                value={linha.nome}
                onChange={(e) => alterar(i, "nome", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`ent-${i}`} className={rotulo}>
                Entidade
              </label>
              <input
                id={`ent-${i}`}
                className={campo}
                value={linha.entidade}
                onChange={(e) => alterar(i, "entidade", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`cont-${i}`} className={rotulo}>
                Contacto
              </label>
              <input
                id={`cont-${i}`}
                className={campo}
                value={linha.contacto}
                onChange={(e) => alterar(i, "contacto", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`prov-${i}`} className={rotulo}>
                Província
              </label>
              <input
                id={`prov-${i}`}
                className={campo}
                value={linha.provincia}
                onChange={(e) => alterar(i, "provincia", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`dist-${i}`} className={rotulo}>
                Distrito
              </label>
              <input
                id={`dist-${i}`}
                className={campo}
                value={linha.distrito}
                onChange={(e) => alterar(i, "distrito", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor={`gen-${i}`} className={rotulo}>
                Género
              </label>
              <select
                id={`gen-${i}`}
                className={campo}
                value={linha.genero}
                onChange={(e) => alterar(i, "genero", e.target.value)}
              >
                <option value="">Prefere não indicar</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
              </select>
            </div>
          </fieldset>
        ))}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setLinhas((a) => [...a, { ...LINHA_VAZIA }])}
            className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
          >
            Acrescentar linha
          </button>
          <button type="submit" className={botao}>
            Guardar participantes
          </button>
        </div>

        {aviso ? (
          <p role="status" className="text-base font-semibold text-navy">
            {aviso}
          </p>
        ) : null}
      </form>

      {participantes.length === 0 ? (
        <div className="mt-6">
          <EstadoVazio
            titulo="Ainda não há participantes registados"
            descricao="Use a folha acima para registar os participantes no próprio dia, com ou sem ligação à internet."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border border-line">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">Participantes registados neste workshop</caption>
            <thead className="bg-page text-navy">
              <tr>
                {["Nome", "Entidade", "Província", "Distrito", "Género", "Contacto", "Observação"].map(
                  (h) => (
                    <th key={h} scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {participantes.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-navy">
                    {p.nome}
                  </th>
                  <td className="px-3 py-2 text-navy-2">{p.entidade ?? "—"}</td>
                  <td className="px-3 py-2 text-navy-2">{p.provincia ?? "—"}</td>
                  <td className="px-3 py-2 text-navy-2">{p.distrito ?? "—"}</td>
                  <td className="px-3 py-2 text-navy-2">{p.genero ?? "—"}</td>
                  <td className="px-3 py-2 text-navy-2">{p.contacto ?? "—"}</td>
                  <td className="px-3 py-2 text-navy-2">
                    {p.duplicado_provavel ? "Duplicado provável — rever manualmente" : "—"}
                    {p.origem_offline ? " · registado sem ligação" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function FormularioTeste({
  workshopId,
  provincia,
  aoGuardar,
}: {
  workshopId: string;
  provincia: string;
  aoGuardar: () => void;
}) {
  const registar = useServerFn(registarAvaliacaoConhecimento);
  const [momento, setMomento] = useState<"pre" | "pos">("pre");
  const [pontuacao, setPontuacao] = useState("");
  const [total, setTotal] = useState("10");
  const [aviso, setAviso] = useState<string | null>(null);

  return (
    <form
      className="space-y-4 rounded-lg border border-line bg-white p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        await registar({
          data: {
            momento,
            workshopId,
            provincia,
            pontuacao: Number(pontuacao),
            total: Number(total),
          },
        });
        setPontuacao("");
        setAviso("Resultado registado.");
        aoGuardar();
      }}
    >
      <h3 className="text-lg font-bold text-navy">Pré-teste e pós-teste</h3>
      <p className="text-sm text-navy-2">
        Teste breve de verificação de conhecimentos, distinto do exame final de certificação.
      </p>
      <div>
        <label htmlFor="momento" className={rotulo}>
          Momento
        </label>
        <select
          id="momento"
          className={campo}
          value={momento}
          onChange={(e) => setMomento(e.target.value as "pre" | "pos")}
        >
          <option value="pre">Pré-teste</option>
          <option value="pos">Pós-teste</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pont" className={rotulo}>
            Pontuação
          </label>
          <input
            id="pont"
            type="number"
            min="0"
            required
            className={campo}
            value={pontuacao}
            onChange={(e) => setPontuacao(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tot" className={rotulo}>
            Total
          </label>
          <input
            id="tot"
            type="number"
            min="1"
            required
            className={campo}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className={botao}>
        Registar resultado
      </button>
      {aviso ? (
        <p role="status" className="text-sm font-semibold text-navy">
          {aviso}
        </p>
      ) : null}
    </form>
  );
}

function FormularioSatisfacao({
  workshopId,
  provincia,
  aoGuardar,
}: {
  workshopId: string;
  provincia: string;
  aoGuardar: () => void;
}) {
  const registar = useServerFn(registarSatisfacao);
  const [pontuacao, setPontuacao] = useState("4");
  const [comentario, setComentario] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  return (
    <form
      className="space-y-4 rounded-lg border border-line bg-white p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        await registar({
          data: { workshopId, provincia, pontuacao: Number(pontuacao), comentario: comentario || null },
        });
        setComentario("");
        setAviso("Resposta registada.");
        aoGuardar();
      }}
    >
      <h3 className="text-lg font-bold text-navy">Questionário de satisfação</h3>
      <p className="text-sm text-navy-2">Aplicado no final da acção, numa escala de 1 a 5.</p>
      <div>
        <label htmlFor="sat" className={rotulo}>
          Satisfação de 1 a 5
        </label>
        <select id="sat" className={campo} value={pontuacao} onChange={(e) => setPontuacao(e.target.value)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="com" className={rotulo}>
          Comentário
        </label>
        <textarea
          id="com"
          rows={3}
          className="w-full rounded-md border border-line bg-white p-3 text-base text-navy"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      </div>
      <button type="submit" className={botao}>
        Registar resposta
      </button>
      {aviso ? (
        <p role="status" className="text-sm font-semibold text-navy">
          {aviso}
        </p>
      ) : null}
    </form>
  );
}

function FormularioEficacia({ workshopId, provincia }: { workshopId: string; provincia: string }) {
  const registar = useServerFn(registarInqueritoEficacia);
  const [nome, setNome] = useState("");
  const [aplica, setAplica] = useState("sim");
  const [observacoes, setObservacoes] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  return (
    <form
      className="space-y-4 rounded-lg border border-line bg-white p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        await registar({
          data: {
            workshopId,
            provincia,
            nomeParticipante: nome || null,
            aplicaCompetencias: aplica === "sim",
            observacoes: observacoes || null,
          },
        });
        setNome("");
        setObservacoes("");
        setAviso("Inquérito registado.");
      }}
    >
      <h3 className="text-lg font-bold text-navy">Inquérito de eficácia aos três meses</h3>
      <p className="text-sm text-navy-2">
        Recolha feita pela ATDI três meses depois da formação. Aqui regista-se o resultado.
      </p>
      <div>
        <label htmlFor="ef-nome" className={rotulo}>
          Participante
        </label>
        <input id="ef-nome" className={campo} value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label htmlFor="ef-aplica" className={rotulo}>
          Aplica as competências adquiridas?
        </label>
        <select id="ef-aplica" className={campo} value={aplica} onChange={(e) => setAplica(e.target.value)}>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
      </div>
      <div>
        <label htmlFor="ef-obs" className={rotulo}>
          Observações
        </label>
        <textarea
          id="ef-obs"
          rows={3}
          className="w-full rounded-md border border-line bg-white p-3 text-base text-navy"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>
      <button type="submit" className={botao}>
        Registar inquérito
      </button>
      {aviso ? (
        <p role="status" className="text-sm font-semibold text-navy">
          {aviso}
        </p>
      ) : null}
    </form>
  );
}
