import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  DIFICULDADES,
  TIPOLOGIAS,
  actualizarQuestao,
  criarQuestao,
  definirEstadoQuestao,
  listarQuestoes,
  referenciasBanco,
} from "@/lib/avaliacao.functions";
import { PlataformaPagina, EstadoVazio } from "@/components/plataforma-pagina";

export const Route = createFileRoute("/avaliacao/banco")({
  head: () => ({
    meta: [
      { title: "Banco de questões — Plataforma Nacional de Capacitação Digital" },
      {
        name: "description",
        content:
          "Gestão das questões por curso e módulo, com as cinco tipologias, dificuldade, estado e autor.",
      },
      { property: "og:title", content: "Banco de questões — Capacitação Digital" },
      {
        property: "og:description",
        content: "Criar, editar e desactivar questões. Questões já usadas nunca são eliminadas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BancoPage,
});

type Tipologia = (typeof TIPOLOGIAS)[number]["valor"];
type Dificuldade = (typeof DIFICULDADES)[number]["valor"];

const etiquetaTipologia = (t: string) =>
  TIPOLOGIAS.find((x) => x.valor === t)?.etiqueta ?? t;
const etiquetaDificuldade = (d: string) =>
  DIFICULDADES.find((x) => x.valor === d)?.etiqueta ?? d;

const campo =
  "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";
const rotulo = "block text-sm font-semibold text-navy-2";

type FormEstado = {
  id: string | null;
  cursoId: string;
  moduloId: string;
  tipologia: Tipologia;
  dificuldade: Dificuldade;
  enunciado: string;
  explicacao: string;
  autorNome: string;
  activa: boolean;
  opcoes: string[];
  indiceCorrecto: number;
  valorVerdadeiro: boolean;
  respostasAceites: string;
  pares: { esquerda: string; direita: string }[];
  sequencia: string[];
};

const FORM_INICIAL: FormEstado = {
  id: null,
  cursoId: "",
  moduloId: "",
  tipologia: "escolha_multipla",
  dificuldade: "media",
  enunciado: "",
  explicacao: "",
  autorNome: "",
  activa: true,
  opcoes: ["", "", "", ""],
  indiceCorrecto: 0,
  valorVerdadeiro: true,
  respostasAceites: "",
  pares: [
    { esquerda: "", direita: "" },
    { esquerda: "", direita: "" },
  ],
  sequencia: ["", "", ""],
};

function BancoPage() {
  const qc = useQueryClient();
  const carregarRefs = useServerFn(referenciasBanco);
  const carregarQuestoes = useServerFn(listarQuestoes);
  const criar = useServerFn(criarQuestao);
  const actualizar = useServerFn(actualizarQuestao);
  const definirEstado = useServerFn(definirEstadoQuestao);

  const [filtros, setFiltros] = useState<{
    cursoId: string;
    moduloId: string;
    tipologia: string;
    dificuldade: string;
    estado: "todas" | "activas" | "inactivas";
  }>({ cursoId: "", moduloId: "", tipologia: "", dificuldade: "", estado: "todas" });

  const [form, setForm] = useState<FormEstado | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [aGravar, setAGravar] = useState(false);

  const refs = useQuery({ queryKey: ["refs-banco"], queryFn: () => carregarRefs() });
  const questoes = useQuery({
    queryKey: ["questoes", filtros],
    queryFn: () =>
      carregarQuestoes({
        data: {
          cursoId: filtros.cursoId || null,
          moduloId: filtros.moduloId || null,
          tipologia: (filtros.tipologia || null) as Tipologia | null,
          dificuldade: (filtros.dificuldade || null) as Dificuldade | null,
          estado: filtros.estado,
        },
      }),
  });

  const modulosDoCursoFiltro = useMemo(
    () => (filtros.cursoId ? (refs.data?.modulosPorCurso[filtros.cursoId] ?? []) : []),
    [refs.data, filtros.cursoId],
  );
  const modulosDoCursoForm = useMemo(
    () => (form?.cursoId ? (refs.data?.modulosPorCurso[form.cursoId] ?? []) : []),
    [refs.data, form?.cursoId],
  );

  function abrirNova() {
    setMensagem(null);
    setForm({ ...FORM_INICIAL, cursoId: filtros.cursoId || refs.data?.cursos[0]?.id || "" });
  }

  function abrirEdicao(q: Record<string, unknown>) {
    setMensagem(null);
    const conteudo = (q.conteudo ?? {}) as Record<string, unknown>;
    const resposta = (q.resposta ?? {}) as Record<string, unknown>;
    setForm({
      ...FORM_INICIAL,
      id: q.id as string,
      cursoId: q.curso_id as string,
      moduloId: (q.modulo_id as string) ?? "",
      tipologia: q.tipologia as Tipologia,
      dificuldade: q.dificuldade as Dificuldade,
      enunciado: q.enunciado as string,
      explicacao: (q.explicacao as string) ?? "",
      autorNome: (q.autor_nome as string) ?? "",
      activa: Boolean(q.activa),
      opcoes: (conteudo.opcoes as string[]) ?? FORM_INICIAL.opcoes,
      indiceCorrecto: (resposta.indice as number) ?? 0,
      valorVerdadeiro: (resposta.valor as boolean) ?? true,
      respostasAceites: ((resposta.aceites as string[]) ?? []).join(", "),
      pares:
        (conteudo.pares as { esquerda: string; direita: string }[]) ?? FORM_INICIAL.pares,
      sequencia: (conteudo.itens as string[]) ?? FORM_INICIAL.sequencia,
    });
  }

  async function gravar() {
    if (!form) return;
    setAGravar(true);
    setMensagem(null);
    try {
      const base = {
        cursoId: form.cursoId,
        moduloId: form.moduloId || null,
        tipologia: form.tipologia,
        dificuldade: form.dificuldade,
        enunciado: form.enunciado,
        explicacao: form.explicacao,
        autorNome: form.autorNome,
        activa: form.activa,
        opcoes: form.opcoes.filter((o) => o.trim()),
        indiceCorrecto: form.indiceCorrecto,
        valorVerdadeiro: form.valorVerdadeiro,
        respostasAceites: form.respostasAceites
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        pares: form.pares.filter((p) => p.esquerda.trim() && p.direita.trim()),
        sequencia: form.sequencia.filter((s) => s.trim()),
      };
      if (form.id) await actualizar({ data: { ...base, id: form.id } });
      else await criar({ data: base });
      setForm(null);
      setMensagem("Questão gravada.");
      await qc.invalidateQueries({ queryKey: ["questoes"] });
    } catch (e) {
      setMensagem(
        `Não foi possível gravar a questão: ${(e as Error).message}. Confirme o enunciado e a resposta correcta.`,
      );
    } finally {
      setAGravar(false);
    }
  }

  async function alternarEstado(id: string, activa: boolean) {
    await definirEstado({ data: { id, activa } });
    await qc.invalidateQueries({ queryKey: ["questoes"] });
  }

  return (
    <PlataformaPagina
      titulo="Banco de questões"
      introducao="As questões organizam-se por curso e por módulo, com tipologia, dificuldade, resposta correcta, explicação, estado e autor. Uma questão já usada numa tentativa nunca é eliminada: é desactivada."
    >
      <div className="mb-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={abrirNova}
          className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
        >
          Nova questão
        </button>
        <Link
          to="/avaliacao"
          className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
        >
          Voltar ao panorama
        </Link>
      </div>

      <fieldset className="mb-6 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-5">
        <legend className="px-1 text-sm font-semibold text-navy-2">Filtros</legend>
        <div>
          <label className={rotulo} htmlFor="f-curso">
            Curso
          </label>
          <select
            id="f-curso"
            className={campo}
            value={filtros.cursoId}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, cursoId: e.target.value, moduloId: "" }))
            }
          >
            <option value="">Todos os cursos</option>
            {(refs.data?.cursos ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={rotulo} htmlFor="f-modulo">
            Módulo
          </label>
          <select
            id="f-modulo"
            className={campo}
            value={filtros.moduloId}
            onChange={(e) => setFiltros((f) => ({ ...f, moduloId: e.target.value }))}
          >
            <option value="">Todos os módulos</option>
            {modulosDoCursoFiltro.map((m) => (
              <option key={m.id} value={m.id}>
                {m.titulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={rotulo} htmlFor="f-tipologia">
            Tipologia
          </label>
          <select
            id="f-tipologia"
            className={campo}
            value={filtros.tipologia}
            onChange={(e) => setFiltros((f) => ({ ...f, tipologia: e.target.value }))}
          >
            <option value="">Todas</option>
            {TIPOLOGIAS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={rotulo} htmlFor="f-dificuldade">
            Dificuldade
          </label>
          <select
            id="f-dificuldade"
            className={campo}
            value={filtros.dificuldade}
            onChange={(e) => setFiltros((f) => ({ ...f, dificuldade: e.target.value }))}
          >
            <option value="">Todas</option>
            {DIFICULDADES.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={rotulo} htmlFor="f-estado">
            Estado
          </label>
          <select
            id="f-estado"
            className={campo}
            value={filtros.estado}
            onChange={(e) =>
              setFiltros((f) => ({
                ...f,
                estado: e.target.value as "todas" | "activas" | "inactivas",
              }))
            }
          >
            <option value="todas">Todas</option>
            <option value="activas">Activas</option>
            <option value="inactivas">Inactivas</option>
          </select>
        </div>
      </fieldset>

      <p role="status" aria-live="polite" className="mb-4 text-base text-navy">
        {mensagem}
      </p>

      {form ? (
        <form
          className="mb-8 grid gap-4 rounded-lg border border-line bg-white p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void gravar();
          }}
        >
          <h2 className="text-lg font-bold text-navy">
            {form.id ? "Editar questão" : "Nova questão"}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={rotulo} htmlFor="q-curso">
                Curso
              </label>
              <select
                id="q-curso"
                className={campo}
                required
                value={form.cursoId}
                onChange={(e) =>
                  setForm((f) => f && { ...f, cursoId: e.target.value, moduloId: "" })
                }
              >
                <option value="">Escolha o curso</option>
                {(refs.data?.cursos ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={rotulo} htmlFor="q-modulo">
                Módulo
              </label>
              <select
                id="q-modulo"
                className={campo}
                value={form.moduloId}
                onChange={(e) => setForm((f) => f && { ...f, moduloId: e.target.value })}
              >
                <option value="">Sem módulo específico</option>
                {modulosDoCursoForm.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.titulo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={rotulo} htmlFor="q-tipologia">
                Tipologia
              </label>
              <select
                id="q-tipologia"
                className={campo}
                value={form.tipologia}
                onChange={(e) =>
                  setForm((f) => f && { ...f, tipologia: e.target.value as Tipologia })
                }
              >
                {TIPOLOGIAS.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={rotulo} htmlFor="q-dificuldade">
                Dificuldade
              </label>
              <select
                id="q-dificuldade"
                className={campo}
                value={form.dificuldade}
                onChange={(e) =>
                  setForm((f) => f && { ...f, dificuldade: e.target.value as Dificuldade })
                }
              >
                {DIFICULDADES.map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={rotulo} htmlFor="q-enunciado">
              Enunciado
            </label>
            <textarea
              id="q-enunciado"
              required
              rows={3}
              className="w-full rounded-md border border-line bg-white p-3 text-base text-navy"
              value={form.enunciado}
              onChange={(e) => setForm((f) => f && { ...f, enunciado: e.target.value })}
            />
          </div>

          {form.tipologia === "escolha_multipla" ? (
            <fieldset className="grid gap-2">
              <legend className={rotulo}>Opções e resposta correcta</legend>
              {form.opcoes.map((op, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input
                    type="radio"
                    name="correcta"
                    className="h-6 w-6"
                    checked={form.indiceCorrecto === i}
                    onChange={() => setForm((f) => f && { ...f, indiceCorrecto: i })}
                    aria-label={`Opção ${i + 1} é a correcta`}
                  />
                  <label className="sr-only" htmlFor={`opcao-${i}`}>
                    Texto da opção {i + 1}
                  </label>
                  <input
                    id={`opcao-${i}`}
                    className={`${campo} flex-1`}
                    value={op}
                    onChange={(e) =>
                      setForm((f) => {
                        if (!f) return f;
                        const opcoes = [...f.opcoes];
                        opcoes[i] = e.target.value;
                        return { ...f, opcoes };
                      })
                    }
                  />
                </div>
              ))}
              <button
                type="button"
                className="min-h-11 self-start rounded-md border border-line px-3 text-base font-semibold text-navy"
                onClick={() => setForm((f) => f && { ...f, opcoes: [...f.opcoes, ""] })}
              >
                Acrescentar opção
              </button>
            </fieldset>
          ) : null}

          {form.tipologia === "verdadeiro_falso" ? (
            <fieldset>
              <legend className={rotulo}>Resposta correcta</legend>
              {[
                { v: true, t: "Verdadeiro" },
                { v: false, t: "Falso" },
              ].map((o) => (
                <label key={o.t} className="mr-6 inline-flex min-h-11 items-center gap-2 text-base text-navy">
                  <input
                    type="radio"
                    name="vf"
                    className="h-6 w-6"
                    checked={form.valorVerdadeiro === o.v}
                    onChange={() => setForm((f) => f && { ...f, valorVerdadeiro: o.v })}
                  />
                  {o.t}
                </label>
              ))}
            </fieldset>
          ) : null}

          {form.tipologia === "resposta_curta" ? (
            <div>
              <label className={rotulo} htmlFor="q-aceites">
                Respostas aceites, separadas por vírgula
              </label>
              <input
                id="q-aceites"
                className={campo}
                value={form.respostasAceites}
                onChange={(e) =>
                  setForm((f) => f && { ...f, respostasAceites: e.target.value })
                }
              />
            </div>
          ) : null}

          {form.tipologia === "correspondencia" ? (
            <fieldset className="grid gap-2">
              <legend className={rotulo}>Pares a corresponder</legend>
              {form.pares.map((p, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-2">
                  <label className="sr-only" htmlFor={`par-e-${i}`}>
                    Elemento da esquerda {i + 1}
                  </label>
                  <input
                    id={`par-e-${i}`}
                    className={campo}
                    placeholder="Esquerda"
                    value={p.esquerda}
                    onChange={(e) =>
                      setForm((f) => {
                        if (!f) return f;
                        const pares = [...f.pares];
                        pares[i] = { ...pares[i], esquerda: e.target.value };
                        return { ...f, pares };
                      })
                    }
                  />
                  <label className="sr-only" htmlFor={`par-d-${i}`}>
                    Elemento da direita {i + 1}
                  </label>
                  <input
                    id={`par-d-${i}`}
                    className={campo}
                    placeholder="Direita"
                    value={p.direita}
                    onChange={(e) =>
                      setForm((f) => {
                        if (!f) return f;
                        const pares = [...f.pares];
                        pares[i] = { ...pares[i], direita: e.target.value };
                        return { ...f, pares };
                      })
                    }
                  />
                </div>
              ))}
              <button
                type="button"
                className="min-h-11 self-start rounded-md border border-line px-3 text-base font-semibold text-navy"
                onClick={() =>
                  setForm((f) => f && { ...f, pares: [...f.pares, { esquerda: "", direita: "" }] })
                }
              >
                Acrescentar par
              </button>
            </fieldset>
          ) : null}

          {form.tipologia === "ordenacao" ? (
            <fieldset className="grid gap-2">
              <legend className={rotulo}>Itens pela ordem correcta</legend>
              {form.sequencia.map((item, i) => (
                <div key={i}>
                  <label className="sr-only" htmlFor={`seq-${i}`}>
                    Item {i + 1} da sequência
                  </label>
                  <input
                    id={`seq-${i}`}
                    className={campo}
                    value={item}
                    onChange={(e) =>
                      setForm((f) => {
                        if (!f) return f;
                        const sequencia = [...f.sequencia];
                        sequencia[i] = e.target.value;
                        return { ...f, sequencia };
                      })
                    }
                  />
                </div>
              ))}
              <button
                type="button"
                className="min-h-11 self-start rounded-md border border-line px-3 text-base font-semibold text-navy"
                onClick={() => setForm((f) => f && { ...f, sequencia: [...f.sequencia, ""] })}
              >
                Acrescentar item
              </button>
            </fieldset>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={rotulo} htmlFor="q-explicacao">
                Explicação da resposta
              </label>
              <textarea
                id="q-explicacao"
                rows={2}
                className="w-full rounded-md border border-line bg-white p-3 text-base text-navy"
                value={form.explicacao}
                onChange={(e) => setForm((f) => f && { ...f, explicacao: e.target.value })}
              />
            </div>
            <div>
              <label className={rotulo} htmlFor="q-autor">
                Autor
              </label>
              <input
                id="q-autor"
                className={campo}
                value={form.autorNome}
                onChange={(e) => setForm((f) => f && { ...f, autorNome: e.target.value })}
              />
              <label className="mt-3 inline-flex min-h-11 items-center gap-2 text-base text-navy">
                <input
                  type="checkbox"
                  className="h-6 w-6"
                  checked={form.activa}
                  onChange={(e) => setForm((f) => f && { ...f, activa: e.target.checked })}
                />
                Questão activa
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={aGravar}
              className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-base font-semibold text-navy-foreground"
            >
              {aGravar ? "A gravar…" : "Gravar questão"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-base font-semibold text-navy"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      <div role="status" aria-live="polite">
        {questoes.isLoading ? <p className="text-base text-navy-2">A carregar questões…</p> : null}
      </div>

      {questoes.data && questoes.data.length === 0 ? (
        <EstadoVazio
          titulo="Não há questões com estes filtros"
          descricao="Altere os filtros ou use «Nova questão» para introduzir a primeira questão deste curso. O conteúdo das questões é fornecido pela Ologa."
        />
      ) : null}

      {questoes.data && questoes.data.length > 0 ? (
        <ul className="grid gap-3">
          {questoes.data.map((q) => (
            <li key={q.id} className="rounded-lg border border-line bg-white p-4">
              <p className="text-base font-semibold text-navy">{q.enunciado}</p>
              <p className="mt-1 text-sm text-navy-2">
                {etiquetaTipologia(q.tipologia)} · {etiquetaDificuldade(q.dificuldade)} ·{" "}
                {q.activa ? "Activa" : "Inactiva"}
                {q.autor_nome ? ` · Autor: ${q.autor_nome}` : ""}
                {q.jaUsada ? " · Já usada numa tentativa (não pode ser eliminada)" : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => abrirEdicao(q as unknown as Record<string, unknown>)}
                  className="min-h-11 rounded-md border border-line px-3 text-base font-semibold text-navy"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void alternarEstado(q.id, !q.activa)}
                  className="min-h-11 rounded-md border border-line px-3 text-base font-semibold text-navy"
                >
                  {q.activa ? "Desactivar" : "Activar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </PlataformaPagina>
  );
}
