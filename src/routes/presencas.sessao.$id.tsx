import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  obterFolhaSessao,
  registarPresencas,
  corrigirPresenca,
  calcularPresencasVirtuais,
  definirEstadoSessao,
  ESTADOS_PRESENCA,
  ESTADOS_SESSAO,
  rotuloEstadoPresenca,
  rotuloEstadoSessao,
  type EstadoPresenca,
  type EstadoSessao,
  type MarcacaoEnvio,
} from "@/lib/presencas.functions";

import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/presencas/sessao/$id")({
  head: () => ({
    meta: [
      { title: "Marcar presenças da sessão — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Marcação num só toque, feita no telefone dentro da sala, que funciona sem internet e envia as marcações quando a ligação voltar.",
      },
      { property: "og:title", content: "Marcar presenças da sessão — Capacitação Digital" },
      {
        property: "og:description",
        content:
          "Presente, ausente ou justificado com motivo escrito, sem apagar marcações anteriores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarcarSessaoPage,
});

const CHAVE = (id: string) => `presencas-sessao-${id}`;

type Escolha = { estado: EstadoPresenca; motivo: string };

function botaoEstado(activo: boolean) {
  return [
    "min-h-11 min-w-[6.5rem] rounded-md border px-4 text-base font-semibold",
    activo ? "border-navy bg-navy text-navy-foreground" : "border-line bg-white text-navy",
  ].join(" ");
}

function MarcarSessaoPage() {
  const { id } = useParams({ from: "/presencas/sessao/$id" });
  const carregar = useServerFn(obterFolhaSessao);
  const enviar = useServerFn(registarPresencas);
  const corrigir = useServerFn(corrigirPresenca);
  const calcular = useServerFn(calcularPresencasVirtuais);
  const mudarEstado = useServerFn(definirEstadoSessao);


  const q = useQuery({ queryKey: ["folha-sessao", id], queryFn: () => carregar({ data: id }) });

  const [escolhas, setEscolhas] = useState<Record<string, Escolha>>({});
  const [porEnviar, setPorEnviar] = useState<MarcacaoEnvio[]>([]);
  const [online, setOnline] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);
  const [estadoEnvio, setEstadoEnvio] = useState<"nada" | "guardado" | "enviado" | "erro">("nada");

  useEffect(() => {
    setOnline(navigator.onLine);
    const guardadas = localStorage.getItem(CHAVE(id));
    if (guardadas) {
      try {
        setPorEnviar(JSON.parse(guardadas) as MarcacaoEnvio[]);
        setEstadoEnvio("guardado");
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
  }, [id]);

  async function sincronizar(lista: MarcacaoEnvio[]) {
    const r = await enviar({
      data: {
        sessaoId: id,
        origemOffline: true,
        aparelho: typeof navigator === "undefined" ? null : navigator.userAgent.slice(0, 120),
        marcadoPorNome: null,
        marcacoes: lista,
      },
    });
    localStorage.removeItem(CHAVE(id));
    setPorEnviar([]);
    setEstadoEnvio("enviado");
    setAviso(
      `${r.gravadas} marcações enviadas.` +
        (r.conflitos > 0
          ? ` ${r.conflitos} ficaram assinaladas como contraditórias, para revisão manual. Nenhuma marcação foi apagada.`
          : "") +
        (r.recusadas > 0
          ? ` ${r.recusadas} não foram gravadas por falta de motivo escrito na falta justificada.`
          : ""),
    );
    await q.refetch();
  }

  async function gravar() {
    setAviso(null);
    const d = q.data;
    if (!d) return;
    const lista: MarcacaoEnvio[] = Object.entries(escolhas).map(([inscricaoId, e]) => ({
      inscricaoId,
      nome: d.formandos.find((f) => f.inscricaoId === inscricaoId)?.nome ?? "",
      estado: e.estado,
      motivo: e.motivo || null,
    }));
    if (lista.length === 0) {
      setAviso("Ainda não marcou nenhum formando nesta sessão.");
      return;
    }
    const semMotivo = lista.filter(
      (m) => m.estado === "justificado" && (m.motivo ?? "").trim().length === 0,
    );
    if (semMotivo.length > 0) {
      setAviso(
        `Uma falta justificada exige o motivo por escrito. Falta o motivo de: ${semMotivo
          .map((m) => m.nome)
          .join(", ")}.`,
      );
      return;
    }

    if (!navigator.onLine) {
      const acumuladas = [...porEnviar, ...lista];
      localStorage.setItem(CHAVE(id), JSON.stringify(acumuladas));
      setPorEnviar(acumuladas);
      setEscolhas({});
      setEstadoEnvio("guardado");
      setAviso(
        `Sem ligação. ${lista.length} marcações ficaram guardadas neste aparelho e são enviadas assim que a ligação voltar.`,
      );
      return;
    }
    try {
      await sincronizar([...porEnviar, ...lista]);
      setEscolhas({});
    } catch {
      const acumuladas = [...porEnviar, ...lista];
      localStorage.setItem(CHAVE(id), JSON.stringify(acumuladas));
      setPorEnviar(acumuladas);
      setEstadoEnvio("erro");
      setAviso(
        "Não foi possível enviar agora. As marcações ficaram guardadas neste aparelho e podem ser enviadas mais tarde.",
      );
    }
  }

  if (q.isLoading)
    return (
      <PlataformaPagina titulo="Marcar presenças">
        <p role="status" className="text-base text-navy">
          A carregar a folha da sessão…
        </p>
      </PlataformaPagina>
    );

  const d = q.data;
  if (!d)
    return (
      <PlataformaPagina titulo="Marcar presenças">
        <EstadoVazio
          titulo="Sessão não encontrada"
          descricao="Esta sessão já não existe no cronograma. Volte às presenças e escolha outra sessão."
          accao={
            <Link
              to="/presencas"
              className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
            >
              Voltar às presenças
            </Link>
          }
        />
      </PlataformaPagina>
    );

  const virtual = d.sessao.modalidade === "virtual";

  return (
    <PlataformaPagina
      titulo={`Sessão ${d.sessao.ordem} — ${d.sessao.tema}`}
      introducao={`${d.turma.designacao} · ${new Date(`${d.sessao.data}T00:00:00`).toLocaleDateString("pt-PT")} · ${d.sessao.hora_inicio.slice(0, 5)} às ${d.sessao.hora_fim.slice(0, 5)}. Marque num só toque. As marcações somam-se: nada é apagado, e marcações contraditórias ficam assinaladas para revisão manual.`}
    >
      <p
        role="status"
        className={
          online
            ? "rounded-md border border-line bg-page p-3 text-base text-navy"
            : "rounded-md border border-amber-300 bg-amber-50 p-3 text-base text-navy"
        }
      >
        {online ? "Com ligação à internet." : "Sem ligação à internet — a trabalhar no aparelho."}{" "}
        {porEnviar.length > 0
          ? `${porEnviar.length} marcações guardadas neste aparelho, por enviar.`
          : estadoEnvio === "enviado"
            ? "Todas as marcações foram enviadas."
            : "Nada por enviar neste aparelho."}
        {estadoEnvio === "erro" ? " Houve um erro no último envio." : ""}
      </p>

      <EstadoDaSessao
        estado={d.sessao.estado as EstadoSessao}
        motivo={d.sessao.motivo_estado}
        actualizadoEm={d.sessao.estado_actualizado_em}
        actualizadoPor={d.sessao.estado_actualizado_por_nome}
        dataSessao={d.sessao.data}
        aoDefinir={async (estado, motivo, porNome) => {
          const r = await mudarEstado({ data: { sessaoId: id, estado, motivo, porNome } });
          if (!r.ok) return r.motivo;
          await q.refetch();
          return null;
        }}
      />


      {porEnviar.length > 0 && online ? (
        <button
          type="button"
          onClick={() => void sincronizar(porEnviar)}
          className="mt-3 inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
        >
          Enviar agora as {porEnviar.length} marcações guardadas
        </button>
      ) : null}

      <div role="status" aria-live="polite" className="mt-3 text-base font-semibold text-navy">
        {aviso}
      </div>

      {d.formandos.length === 0 ? (
        <div className="mt-6">
          <EstadoVazio
            titulo="Esta turma ainda não tem formandos inscritos"
            descricao="Sem inscrições não há quem marcar. Inscreva os formandos na ficha da turma e volte a esta sessão."
            accao={
              <Link
                to="/turmas/$codigo"
                params={{ codigo: d.turma.codigo_inscricao }}
                className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
              >
                Abrir ficha da turma
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <ul className="mt-6 grid gap-4">
            {d.formandos.map((f) => {
              const escolha = escolhas[f.inscricaoId];
              return (
                <li key={f.inscricaoId} className="rounded-lg border border-line bg-white p-4">
                  <p className="text-lg font-bold text-navy">{f.nome}</p>
                  <p className="mt-1 text-base text-navy-2">
                    {f.actual
                      ? `Marcação actual: ${rotuloEstadoPresenca(f.actual.estado)}${
                          f.actual.motivo ? ` — ${f.actual.motivo}` : ""
                        }${f.actual.origem === "calculada" ? " (calculada pela sessão virtual)" : ""}${
                          f.actual.origem === "correccao" ? " (corrigida pelo formador)" : ""
                        }`
                      : "Ainda sem marcação nesta sessão."}
                  </p>
                  {f.introducaoManual ? (
                    <p className="mt-1 text-base text-navy-2">
                      Valor da sessão virtual introduzido manualmente
                      {f.introducaoManual.porNome ? ` por ${f.introducaoManual.porNome}` : ""}
                      {f.introducaoManual.em
                        ? ` em ${new Date(f.introducaoManual.em).toLocaleString("pt-PT")}`
                        : ""}
                      : {f.introducaoManual.minutos ?? "—"} minutos de permanência e{" "}
                      {f.introducaoManual.progresso ?? "—"} por cento de progresso. Não foi recolhido
                      automaticamente por nenhuma plataforma de videoconferência.
                    </p>
                  ) : null}

                  {f.conflito ? (
                    <p className="mt-1 text-base font-semibold text-[#C20400]">
                      Marcações contraditórias nesta sessão, guardadas todas — precisa de revisão
                      manual.
                    </p>
                  ) : null}

                  <fieldset className="mt-3">
                    <legend className="sr-only">Presença de {f.nome}</legend>
                    <div className="flex flex-wrap gap-3">
                      {ESTADOS_PRESENCA.map(([valor, rotulo]) => (
                        <button
                          key={valor}
                          type="button"
                          aria-pressed={escolha?.estado === valor}
                          onClick={() =>
                            setEscolhas((a) => ({
                              ...a,
                              [f.inscricaoId]: {
                                estado: valor,
                                motivo: a[f.inscricaoId]?.motivo ?? "",
                              },
                            }))
                          }
                          className={botaoEstado(escolha?.estado === valor)}
                        >
                          {rotulo}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {escolha?.estado === "justificado" ? (
                    <div className="mt-3">
                      <label
                        htmlFor={`motivo-${f.inscricaoId}`}
                        className="block text-sm font-semibold text-navy-2"
                      >
                        Motivo da justificação (obrigatório)
                      </label>
                      <textarea
                        id={`motivo-${f.inscricaoId}`}
                        rows={2}
                        value={escolha.motivo}
                        onChange={(e) =>
                          setEscolhas((a) => ({
                            ...a,
                            [f.inscricaoId]: { estado: "justificado", motivo: e.target.value },
                          }))
                        }
                        className="min-h-11 w-full rounded-md border border-line bg-white p-3 text-base text-navy"
                      />
                    </div>
                  ) : null}

                  <CorrigirPresenca
                    nome={f.nome}
                    aoCorrigir={async (estado, motivo, justificacao) => {
                      const r = await corrigir({
                        data: {
                          sessaoId: id,
                          inscricaoId: f.inscricaoId,
                          nome: f.nome,
                          estado,
                          motivo,
                          justificacao,
                        },
                      });
                      if (!r.ok) return r.motivo;
                      await q.refetch();
                      return null;
                    }}
                  />
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => void gravar()}
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground"
          >
            Gravar marcações
          </button>
        </>
      )}

      {virtual ? (
        <SessaoVirtual
          formandos={d.formandos.map((f) => ({ inscricaoId: f.inscricaoId, nome: f.nome }))}
          limiares={{
            permanencia: d.configuracao.limiar_permanencia_pct,
            progresso: d.configuracao.limiar_progresso_pct,
          }}
          aoCalcular={async (registos, introduzidoPorNome) => {
            const r = await calcular({ data: { sessaoId: id, introduzidoPorNome, registos } });
            await q.refetch();
            return r.gravadas;
          }}

        />
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/presencas/folha/$id"
          params={{ id }}
          className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
        >
          Folha para imprimir
        </Link>
        <Link
          to="/presencas/turma/$codigo"
          params={{ codigo: d.turma.codigo_inscricao }}
          className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
        >
          Assiduidade da turma
        </Link>
      </div>
    </PlataformaPagina>
  );
}

/** Correcção de uma presença já registada. Exige justificação escrita. */
function CorrigirPresenca({
  nome,
  aoCorrigir,
}: {
  nome: string;
  aoCorrigir: (
    estado: EstadoPresenca,
    motivo: string | null,
    justificacao: string,
  ) => Promise<string | null>;
}) {
  const [aberto, setAberto] = useState(false);
  const [estado, setEstado] = useState<EstadoPresenca>("presente");
  const [motivo, setMotivo] = useState("");
  const [justificacao, setJustificacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState(false);

  if (!aberto)
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-3 inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
      >
        Corrigir presença de {nome}
      </button>
    );

  return (
    <div className="mt-3 rounded-md border border-line bg-page p-4">
      <p className="text-base font-semibold text-navy">Corrigir a presença de {nome}</p>
      <p className="mt-1 text-sm text-navy-2">
        A marcação anterior mantém-se. A correcção é acrescentada por cima e fica no registo de
        auditoria, com a justificação escrita.
      </p>
      <fieldset className="mt-3">
        <legend className="sr-only">Nova presença</legend>
        <div className="flex flex-wrap gap-3">
          {ESTADOS_PRESENCA.map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={estado === valor}
              onClick={() => setEstado(valor)}
              className={botaoEstado(estado === valor)}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </fieldset>
      {estado === "justificado" ? (
        <div className="mt-3">
          <label className="block text-sm font-semibold text-navy-2" htmlFor={`cmotivo-${nome}`}>
            Motivo da justificação
          </label>
          <textarea
            id={`cmotivo-${nome}`}
            rows={2}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="min-h-11 w-full rounded-md border border-line bg-white p-3 text-base text-navy"
          />
        </div>
      ) : null}
      <div className="mt-3">
        <label className="block text-sm font-semibold text-navy-2" htmlFor={`just-${nome}`}>
          Justificação da correcção (obrigatória)
        </label>
        <textarea
          id={`just-${nome}`}
          rows={2}
          value={justificacao}
          onChange={(e) => setJustificacao(e.target.value)}
          className="min-h-11 w-full rounded-md border border-line bg-white p-3 text-base text-navy"
        />
      </div>
      <div role="status" aria-live="polite" className="mt-2 text-base font-semibold text-navy">
        {erro ? <span className="text-[#C20400]">{erro}</span> : null}
        {feito ? "Correcção registada." : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={async () => {
            setErro(null);
            setFeito(false);
            const r = await aoCorrigir(estado, motivo || null, justificacao);
            if (r) setErro(r);
            else {
              setFeito(true);
              setJustificacao("");
              setMotivo("");
            }
          }}
          className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
        >
          Gravar correcção
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

/** Sessões virtuais: presença calculada por permanência e progresso. */
function SessaoVirtual({
  formandos,
  limiares,
  aoCalcular,
}: {
  formandos: Array<{ inscricaoId: string; nome: string }>;
  limiares: { permanencia: number; progresso: number };
  aoCalcular: (
    registos: Array<{
      inscricaoId: string;
      nome: string;
      minutosPermanencia: number;
      progressoPct: number;
    }>,
    introduzidoPorNome: string | null,
  ) => Promise<number>;
}) {
  const [valores, setValores] = useState<Record<string, { minutos: string; progresso: string }>>({});
  const [quem, setQuem] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);


  return (
    <section aria-labelledby="virtual" className="mt-10">
      <h2 id="virtual" className="text-xl font-bold text-navy">
        Sessão virtual — presença calculada
      </h2>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Nesta sessão a presença é calculada pelo tempo de permanência e pelo progresso. Conta como
        presente quem permanecer pelo menos {limiares.permanencia} por cento da duração da sessão e
        atingir pelo menos {limiares.progresso} por cento de progresso. O formador pode corrigir
        qualquer presença calculada, com justificação escrita.
      </p>
      <div className="mt-4 grid gap-4">
        {formandos.map((f) => (
          <div key={f.inscricaoId} className="rounded-lg border border-line bg-white p-4 sm:flex sm:items-end sm:gap-4">
            <p className="text-base font-semibold text-navy sm:flex-1">{f.nome}</p>
            <div>
              <label className="block text-sm font-semibold text-navy-2" htmlFor={`min-${f.inscricaoId}`}>
                Minutos de permanência
              </label>
              <input
                id={`min-${f.inscricaoId}`}
                type="number"
                min={0}
                inputMode="numeric"
                value={valores[f.inscricaoId]?.minutos ?? ""}
                onChange={(e) =>
                  setValores((a) => ({
                    ...a,
                    [f.inscricaoId]: {
                      minutos: e.target.value,
                      progresso: a[f.inscricaoId]?.progresso ?? "",
                    },
                  }))
                }
                className="min-h-11 w-32 rounded-md border border-line bg-white px-3 text-base text-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-2" htmlFor={`prog-${f.inscricaoId}`}>
                Progresso (%)
              </label>
              <input
                id={`prog-${f.inscricaoId}`}
                type="number"
                min={0}
                max={100}
                inputMode="numeric"
                value={valores[f.inscricaoId]?.progresso ?? ""}
                onChange={(e) =>
                  setValores((a) => ({
                    ...a,
                    [f.inscricaoId]: {
                      minutos: a[f.inscricaoId]?.minutos ?? "",
                      progresso: e.target.value,
                    },
                  }))
                }
                className="min-h-11 w-32 rounded-md border border-line bg-white px-3 text-base text-navy"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <label className="block text-sm font-semibold text-navy-2" htmlFor="quem-introduziu">
          Nome de quem está a introduzir estes valores (obrigatório)
        </label>
        <p className="text-sm text-navy-2">
          Estes minutos e este progresso são escritos à mão pelo formador. Fica registado na ficha
          desta sessão quem os escreveu e quando, para o dado não passar por automático.
        </p>
        <input
          id="quem-introduziu"
          type="text"
          value={quem}
          onChange={(e) => setQuem(e.target.value)}
          className="mt-2 min-h-11 w-full max-w-md rounded-md border border-line bg-white px-3 text-base text-navy"
        />
      </div>
      <div role="status" aria-live="polite" className="mt-3 text-base font-semibold text-navy">
        {aviso}
      </div>
      <button
        type="button"
        onClick={async () => {
          const registos = formandos
            .filter((f) => valores[f.inscricaoId]?.minutos)
            .map((f) => ({
              inscricaoId: f.inscricaoId,
              nome: f.nome,
              minutosPermanencia: Number(valores[f.inscricaoId]?.minutos ?? 0),
              progressoPct: Number(valores[f.inscricaoId]?.progresso ?? 0),
            }));
          if (registos.length === 0) {
            setAviso("Escreva os minutos de permanência de pelo menos um formando.");
            return;
          }
          if (quem.trim().length < 3) {
            setAviso("Escreva o nome de quem está a introduzir estes valores.");
            return;
          }
          const n = await aoCalcular(registos, quem.trim());
          setValores({});
          setAviso(
            `${n} presenças calculadas e gravadas, com o registo de que os valores foram introduzidos por ${quem.trim()}. Pode corrigir qualquer uma acima.`,
          );
        }}

        className="mt-4 inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground"
      >
        Calcular presenças desta sessão virtual
      </button>
    </section>
  );
}
