import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import {
  atualizarMetasInstituicao,
  atualizarPercursoInstituicao,
  listarModulosAdmin,
  marcarDeclaracaoManualmente,
  obterInstituicaoAdmin,
  regenerarCodigoInstituicao,
  regenerarTokenIndicadores,
} from "@/lib/instituicoes.functions";
import {
  APOIOS_OPCOES,
  CONECTIVIDADE_OPCOES,
  MEIO_OPCOES,
  MODALIDADE_OPCOES,
  NATUREZA_OPCOES,
  NIVEL_LITERACIA_OPCOES,
  PERCURSO_OPCOES,
  SALA_OPCOES,
  SETOR_OPCOES,
  rotulo,
  rotulosLista,
} from "@/lib/inscricao-schema";

export const Route = createFileRoute("/gestao/instituicoes/$id")({
  head: () => ({ meta: [{ title: "Ficha da instituição — Plataforma Nacional de Capacitação Digital" }] }),
  component: FichaPage,
});

type Instituicao = {
  id: string;
  nome: string;
  natureza: string;
  setor: string | null;
  setor_outro: string | null;
  ponto_focal_nome: string | null;
  ponto_focal_email: string | null;
  provincia: string | null;
  distrito: string | null;
  meio: string | null;
  modalidade: string | null;
  conectividade: string | null;
  num_computadores: number | null;
  num_colaboradores_total: number;
  nivel_literacia: string | null;
  num_mulheres: number | null;
  num_homens: number | null;
  num_pcd: number | null;
  apoios_acessibilidade: string[] | null;
  modulos_interesse: string[] | null;
  percurso: string | null;
  num_trabalhadores_total: number | null;
  meta_cobertura_pct: number | null;
  meta_conclusao_pct: number | null;
  meta_ganho_pontos: number | null;
  meta_equidade_max_pp: number | null;
  prazo_meses: number | null;
  pedido_meta_cobertura_pct: number | null;
  pedido_prazo_meses: number | null;
  declaracao_assinada: boolean;
  declaracao_assinada_em: string | null;
  indicadores_token: string;
  sala_disponivel: string | null;
  observacoes: string | null;
  consentimento: boolean;
  codigo_inscricao: string;
  criado_em: string;
};

type ItemPercurso = { modulo_id: string; ordem: number; titulo: string };
type ItemHist = {
  id: string;
  campo: string;
  valor_antigo: string | null;
  valor_novo: string | null;
  alterado_em: string;
  alterado_por: string | null;
};

function FichaPage() {
  const guard = useAdminGuard();
  const { id } = Route.useParams();
  const obter = useServerFn(obterInstituicaoAdmin);
  const regenerarCodigo = useServerFn(regenerarCodigoInstituicao);
  const regenerarToken = useServerFn(regenerarTokenIndicadores);
  const guardarMetas = useServerFn(atualizarMetasInstituicao);
  const guardarPercurso = useServerFn(atualizarPercursoInstituicao);
  const listarMods = useServerFn(listarModulosAdmin);

  const [inst, setInst] = useState<Instituicao | null>(null);
  const [modulosInteresse, setModulosInteresse] = useState<
    { id: string; titulo: string }[]
  >([]);
  const [percurso, setPercurso] = useState<ItemPercurso[]>([]);
  const [historico, setHistorico] = useState<ItemHist[]>([]);
  const [todosModulos, setTodosModulos] = useState<{ id: string; titulo: string }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [aRegenerarCodigo, setARegenerarCodigo] = useState(false);
  const [msgRegen, setMsgRegen] = useState<string | null>(null);
  const [aRegenerarToken, setARegenerarToken] = useState(false);
  const [msgToken, setMsgToken] = useState<string | null>(null);

  const [metaCob, setMetaCob] = useState<string>("");
  const [metaConcl, setMetaConcl] = useState<string>("");
  const [metaGanho, setMetaGanho] = useState<string>("");
  const [metaEqui, setMetaEqui] = useState<string>("");
  const [prazo, setPrazo] = useState<string>("");
  const [aGuardarMetas, setAGuardarMetas] = useState(false);
  const [msgMetas, setMsgMetas] = useState<string | null>(null);

  const [selPercurso, setSelPercurso] = useState<string>("");
  const [rascunhoPercurso, setRascunhoPercurso] = useState<string[]>([]);
  const [aGuardarPercurso, setAGuardarPercurso] = useState(false);
  const [msgPercurso, setMsgPercurso] = useState<string | null>(null);

  useEffect(() => {
    if (guard.estado !== "ok") return;
    let cancelado = false;
    Promise.all([obter({ data: { id } }), listarMods()]).then(([res, ml]) => {
      if (cancelado) return;
      if (res.ok) {
        const i = res.instituicao as Instituicao;
        setInst(i);
        setModulosInteresse(res.modulos);
        setPercurso(res.percurso as ItemPercurso[]);
        setHistorico(res.historico as ItemHist[]);
        setRascunhoPercurso((res.percurso as ItemPercurso[]).map((p) => p.modulo_id));
        setMetaCob(i.meta_cobertura_pct?.toString() ?? "");
        setMetaConcl(i.meta_conclusao_pct?.toString() ?? "");
        setMetaGanho(i.meta_ganho_pontos?.toString() ?? "");
        setMetaEqui(i.meta_equidade_max_pp?.toString() ?? "");
        setPrazo(i.prazo_meses?.toString() ?? "");
      } else {
        setErro(
          res.mensagem === "nao_encontrada"
            ? "Instituição não encontrada."
            : res.mensagem || "Erro ao carregar.",
        );
      }
      if (ml.ok) setTodosModulos(ml.modulos as { id: string; titulo: string }[]);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [guard.estado, id, obter, listarMods]);

  async function onRegenerarCodigo() {
    if (!inst) return;
    if (
      !window.confirm(
        "Vai gerar um novo código de inscrição. O código antigo deixa de ser válido para novas inscrições. Continuar?",
      )
    )
      return;
    setARegenerarCodigo(true);
    setMsgRegen(null);
    const res = await regenerarCodigo({ data: { id: inst.id } });
    setARegenerarCodigo(false);
    if (res.ok) {
      setInst({ ...inst, codigo_inscricao: res.codigo });
      setMsgRegen("Novo código gerado.");
    } else {
      setMsgRegen(res.mensagem || "Não foi possível gerar novo código.");
    }
  }

  async function onRegenerarToken() {
    if (!inst) return;
    if (
      !window.confirm(
        "Vai invalidar imediatamente o link atual dos indicadores. Quem tiver o link antigo perde o acesso. Continuar?",
      )
    )
      return;
    setARegenerarToken(true);
    setMsgToken(null);
    const res = await regenerarToken({ data: { id: inst.id } });
    setARegenerarToken(false);
    if (res.ok) {
      setInst({ ...inst, indicadores_token: res.token });
      setMsgToken("Novo link gerado. O antigo já não funciona.");
    } else {
      setMsgToken(res.mensagem || "Não foi possível gerar novo link.");
    }
  }

  async function onGuardarMetas() {
    if (!inst) return;
    setAGuardarMetas(true);
    setMsgMetas(null);
    const numOrNull = (s: string) => (s.trim() === "" ? null : Number(s));
    const res = await guardarMetas({
      data: {
        id: inst.id,
        meta_cobertura_pct: numOrNull(metaCob),
        meta_conclusao_pct: numOrNull(metaConcl),
        meta_ganho_pontos: numOrNull(metaGanho),
        meta_equidade_max_pp: numOrNull(metaEqui),
        prazo_meses: numOrNull(prazo),
      },
    });
    setAGuardarMetas(false);
    if (res.ok) {
      setMsgMetas("Metas guardadas.");
      // recarrega histórico
      obter({ data: { id: inst.id } }).then((r) => {
        if (r.ok) setHistorico(r.historico as ItemHist[]);
      });
    } else {
      setMsgMetas(res.mensagem || "Não foi possível guardar.");
    }
  }

  async function onGuardarPercurso() {
    if (!inst) return;
    setAGuardarPercurso(true);
    setMsgPercurso(null);
    const res = await guardarPercurso({
      data: { id: inst.id, modulos: rascunhoPercurso },
    });
    setAGuardarPercurso(false);
    if (res.ok) {
      setMsgPercurso("Percurso guardado.");
      const novo = rascunhoPercurso.map((mid, idx) => ({
        modulo_id: mid,
        ordem: idx + 1,
        titulo: todosModulos.find((m) => m.id === mid)?.titulo ?? "",
      }));
      setPercurso(novo);
    } else {
      setMsgPercurso(res.mensagem || "Não foi possível guardar.");
    }
  }

  function adicionarAoPercurso() {
    if (!selPercurso) return;
    if (rascunhoPercurso.includes(selPercurso)) return;
    setRascunhoPercurso([...rascunhoPercurso, selPercurso]);
    setSelPercurso("");
  }
  function removerDoPercurso(mid: string) {
    setRascunhoPercurso(rascunhoPercurso.filter((m) => m !== mid));
  }
  function moverPercurso(idx: number, dir: -1 | 1) {
    const novo = [...rascunhoPercurso];
    const j = idx + dir;
    if (j < 0 || j >= novo.length) return;
    [novo[idx], novo[j]] = [novo[j], novo[idx]];
    setRascunhoPercurso(novo);
  }

  const disponiveis = useMemo(
    () => todosModulos.filter((m) => !rascunhoPercurso.includes(m.id)),
    [todosModulos, rascunhoPercurso],
  );

  const linkIndicadores =
    typeof window !== "undefined" && inst
      ? `${window.location.origin}/indicadores/${inst.indicadores_token}`
      : "";

  if (guard.estado === "a_verificar" || carregando) {
    return (
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p role="status" aria-live="polite" className="text-base text-foreground">
          A carregar…
        </p>
      </main>
    );
  }
  if (guard.estado !== "ok") return null;
  if (erro || !inst) {
    return (
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p>
          <Link to="/gestao/instituicoes" className="text-base font-semibold text-ink underline">
            ← Voltar à lista
          </Link>
        </p>
        <p
          role="alert"
          className="mt-6 rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink"
        >
          {erro ?? "Instituição não disponível."}
        </p>
      </main>
    );
  }

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Saltar para o conteúdo principal
      </a>
      <main id="conteudo" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <p>
          <Link to="/gestao/instituicoes" className="text-base font-semibold text-ink underline">
            ← Voltar à lista
          </Link>
        </p>

        <h1 className="mt-4 text-3xl font-extrabold text-ink">{inst.nome}</h1>
        <p className="mt-1 text-sm text-foreground">
          Inscrita em {new Date(inst.criado_em).toLocaleDateString("pt-PT")}
        </p>

        {/* CÓDIGO DE INSCRIÇÃO */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-ink/20 bg-accent p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-ink/70">
              Código de inscrição
            </p>
            <p className="mt-2 font-mono text-2xl font-extrabold tracking-widest text-ink">
              {inst.codigo_inscricao}
            </p>
            <button
              type="button"
              onClick={onRegenerarCodigo}
              disabled={aRegenerarCodigo}
              className="mt-4 inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-white/70 disabled:opacity-70"
            >
              {aRegenerarCodigo ? "A gerar…" : "Gerar novo código"}
            </button>
            {msgRegen && (
              <p role="status" aria-live="polite" className="mt-2 text-sm text-ink">
                {msgRegen}
              </p>
            )}
          </div>

          <div className="rounded-md border border-ink/20 bg-accent p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-ink/70">
              Link dos indicadores
            </p>
            <p className="mt-2 break-all font-mono text-xs text-ink">
              {linkIndicadores}
            </p>
            <button
              type="button"
              onClick={onRegenerarToken}
              disabled={aRegenerarToken}
              className="mt-4 inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-white/70 disabled:opacity-70"
            >
              {aRegenerarToken ? "A gerar…" : "Regenerar link"}
            </button>
            {msgToken && (
              <p role="status" aria-live="polite" className="mt-2 text-sm text-ink">
                {msgToken}
              </p>
            )}
          </div>
        </div>

        {/* DOCUMENTOS */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-ink">Documentos</h2>
          <p className="mt-1 text-sm text-foreground">
            Gerados a partir dos dados registados. Atestam a formação realizada. Não constituem
            certificação de conformidade legal.
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {(
              [
                ["relatorio", "Relatório de capacitação"],
                ["certificado", "Certificado da instituição"],
                ["declaracao", "Declaração de desenho universal"],
              ] as const
            ).map(([t, nome]) => (
              <BotaoDocumento key={t} token={inst.indicadores_token} tipo={t} nome={nome} />
            ))}
          </ul>
          <DeclaracaoAssinaturaCard
            inst={inst}
            onAtualizado={(assinada, assinada_em) =>
              setInst({ ...inst, declaracao_assinada: assinada, declaracao_assinada_em: assinada_em })
            }
          />
        </section>



        {/* METAS ACORDADAS */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Metas acordadas</h2>
          <p className="mt-1 text-sm text-foreground">
            Ao lado de cada meta é apresentado o valor que a instituição pediu no
            formulário de inscrição. As alterações ficam registadas em histórico.
          </p>
          <div className="mt-4 grid gap-4 rounded-md border border-ink/10 p-4 sm:grid-cols-2">
            <CampoMeta
              rot="Meta de cobertura (%)"
              valor={metaCob}
              onChange={setMetaCob}
              pedido={inst.pedido_meta_cobertura_pct}
              tipo="int"
              min={1}
              max={100}
            />
            <CampoMeta
              rot="Prazo (meses)"
              valor={prazo}
              onChange={setPrazo}
              pedido={inst.pedido_prazo_meses}
              tipo="int"
              min={1}
            />
            <CampoMeta
              rot="Meta de conclusão (%)"
              valor={metaConcl}
              onChange={setMetaConcl}
              pedido={null}
              tipo="int"
              min={1}
              max={100}
            />
            <CampoMeta
              rot="Meta de ganho (pontos)"
              valor={metaGanho}
              onChange={setMetaGanho}
              pedido={null}
              tipo="int"
              min={1}
              max={100}
            />
            <CampoMeta
              rot="Meta de equidade (diferença máxima, pp)"
              valor={metaEqui}
              onChange={setMetaEqui}
              pedido={null}
              tipo="int"
              min={0}
              max={100}
            />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={onGuardarMetas}
              disabled={aGuardarMetas}
              className="inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-base font-semibold text-white hover:bg-ink/90 disabled:opacity-70"
            >
              {aGuardarMetas ? "A guardar…" : "Guardar metas"}
            </button>
            {msgMetas && (
              <p role="status" aria-live="polite" className="text-sm text-ink">
                {msgMetas}
              </p>
            )}
          </div>
        </section>

        {/* MÓDULOS DO PERCURSO */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Módulos do percurso</h2>
          <p className="mt-1 text-sm text-foreground">
            Ordene os módulos acordados. Módulos que a instituição indicou como
            interesse aparecem em baixo, apenas como referência.
          </p>

          <ol className="mt-4 space-y-2">
            {rascunhoPercurso.length === 0 && (
              <li className="rounded-md border border-dashed border-ink/20 p-3 text-sm text-foreground">
                Sem módulos definidos.
              </li>
            )}
            {rascunhoPercurso.map((mid, idx) => {
              const t = todosModulos.find((m) => m.id === mid)?.titulo ?? "(módulo)";
              return (
                <li
                  key={mid}
                  className="flex items-center gap-3 rounded-md border border-ink/10 p-3"
                >
                  <span className="font-mono text-sm text-ink/70">{idx + 1}.</span>
                  <span className="flex-1 text-base text-ink">{t}</span>
                  <button
                    type="button"
                    onClick={() => moverPercurso(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Subir"
                    className="rounded-md border border-ink/20 px-2 py-1 text-sm disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moverPercurso(idx, 1)}
                    disabled={idx === rascunhoPercurso.length - 1}
                    aria-label="Descer"
                    className="rounded-md border border-ink/20 px-2 py-1 text-sm disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removerDoPercurso(mid)}
                    className="rounded-md border border-ink/20 px-2 py-1 text-sm text-ink"
                  >
                    Remover
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <select
              value={selPercurso}
              onChange={(e) => setSelPercurso(e.target.value)}
              className="min-h-11 rounded-md border border-ink/20 bg-white px-3 text-base"
            >
              <option value="">Adicionar módulo…</option>
              {disponiveis.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.titulo}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={adicionarAoPercurso}
              disabled={!selPercurso}
              className="inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-accent disabled:opacity-50"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={onGuardarPercurso}
              disabled={aGuardarPercurso}
              className="ml-auto inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-base font-semibold text-white hover:bg-ink/90 disabled:opacity-70"
            >
              {aGuardarPercurso ? "A guardar…" : "Guardar percurso"}
            </button>
          </div>
          {msgPercurso && (
            <p role="status" aria-live="polite" className="mt-2 text-sm text-ink">
              {msgPercurso}
            </p>
          )}

          <p className="mt-6 text-sm font-semibold text-ink/70">
            Referência — módulos indicados no formulário de inscrição:
          </p>
          <p className="mt-1 text-sm text-foreground">
            {modulosInteresse.length > 0
              ? modulosInteresse.map((m) => m.titulo).join(", ")
              : "Nenhum indicado."}
          </p>
        </section>

        {/* HISTÓRICO DE METAS */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Histórico de metas</h2>
          {historico.length === 0 ? (
            <p className="mt-2 text-sm text-foreground">Sem alterações registadas.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10 rounded-md border border-ink/10">
              {historico.map((h) => (
                <li key={h.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[200px_1fr]">
                  <p className="text-sm text-ink/70">
                    {new Date(h.alterado_em).toLocaleString("pt-PT")}
                  </p>
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{h.campo}</span>:{" "}
                    <span className="text-ink/70">{h.valor_antigo ?? "—"}</span>{" "}
                    → <span className="font-semibold">{h.valor_novo ?? "—"}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* DADOS DA INSCRIÇÃO */}
        <Seccao titulo="1. Identificação">
          <Linha rot="Nome" val={inst.nome} />
          <Linha rot="Natureza" val={rotulo(NATUREZA_OPCOES, inst.natureza)} />
          <Linha rot="Setor" val={rotulo(SETOR_OPCOES, inst.setor)} />
          {inst.setor === "outro" && (
            <Linha rot="Setor (especificação)" val={inst.setor_outro ?? "—"} />
          )}
          <Linha rot="Ponto focal — nome" val={inst.ponto_focal_nome ?? "—"} />
          <Linha rot="Ponto focal — email" val={inst.ponto_focal_email ?? "—"} />
        </Seccao>

        <Seccao titulo="2. Localização">
          <Linha rot="Província" val={inst.provincia ?? "—"} />
          <Linha rot="Distrito" val={inst.distrito ?? "—"} />
          <Linha rot="Meio" val={rotulo(MEIO_OPCOES, inst.meio)} />
          <Linha
            rot="Modalidade pretendida"
            val={rotulo(MODALIDADE_OPCOES, inst.modalidade)}
          />
          <Linha
            rot="Conectividade no local"
            val={rotulo(CONECTIVIDADE_OPCOES, inst.conectividade)}
          />
          <Linha
            rot="Nº de computadores disponíveis"
            val={inst.num_computadores?.toString() ?? "—"}
          />
        </Seccao>

        <Seccao titulo="3. Colaboradores a formar">
          <Linha rot="Número total" val={inst.num_colaboradores_total.toString()} />
          <Linha
            rot="Nível de literacia digital predominante"
            val={rotulo(NIVEL_LITERACIA_OPCOES, inst.nivel_literacia)}
          />
          <Linha rot="Nº de mulheres" val={inst.num_mulheres?.toString() ?? "—"} />
          <Linha rot="Nº de homens" val={inst.num_homens?.toString() ?? "—"} />
          <Linha
            rot="Nº de pessoas com deficiência"
            val={inst.num_pcd?.toString() ?? "—"}
          />
        </Seccao>

        <Seccao titulo="4. Apoios de acessibilidade">
          <Linha
            rot="Apoios necessários"
            val={rotulosLista(APOIOS_OPCOES, inst.apoios_acessibilidade)}
          />
        </Seccao>

        <Seccao titulo="5. Percurso pretendido (do formulário)">
          <Linha rot="Percurso" val={rotulo(PERCURSO_OPCOES, inst.percurso)} />
        </Seccao>

        <Seccao titulo="6. Logística">
          <Linha
            rot="Sala disponível"
            val={rotulo(SALA_OPCOES, inst.sala_disponivel)}
          />
          <Linha rot="Observações" val={inst.observacoes ?? "—"} />
        </Seccao>

        <Seccao titulo="7. Consentimento">
          <Linha
            rot="Consentimento"
            val={inst.consentimento ? "Sim (confirmado)" : "Não"}
          />
        </Seccao>
      </main>
    </>
  );
}

function CampoMeta({
  rot,
  valor,
  onChange,
  pedido,
  tipo: _tipo,
  min,
  max,
}: {
  rot: string;
  valor: string;
  onChange: (v: string) => void;
  pedido: number | null;
  tipo: "int";
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{rot}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-11 w-full rounded-md border border-ink/20 bg-white px-3 text-base"
      />
      <span className="mt-1 block text-xs text-ink/60">
        Pedido: {pedido == null ? "— (não pedido no formulário)" : pedido}
      </span>
    </label>
  );
}

function Seccao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-ink">{titulo}</h2>
      <dl className="mt-4 divide-y divide-ink/10 rounded-md border border-ink/10">
        {children}
      </dl>
    </section>
  );
}
function Linha({ rot, val }: { rot: string; val: string }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-ink/70">{rot}</dt>
      <dd className="text-base text-ink">{val}</dd>
    </div>
  );
}

function DeclaracaoAssinaturaCard({
  inst,
  onAtualizado,
}: {
  inst: Instituicao;
  onAtualizado: (assinada: boolean, assinada_em: string | null) => void;
}) {
  const marcar = useServerFn(marcarDeclaracaoManualmente);
  const [aGuardar, setAGuardar] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function alternar(assinada: boolean) {
    const confirmMsg = assinada
      ? "Confirma que a Declaração de desenho universal foi assinada e devolvida pela instituição?"
      : "Marcar a declaração como NÃO assinada?";
    if (!window.confirm(confirmMsg)) return;
    setAGuardar(true);
    setMsg(null);
    const res = await marcar({ data: { id: inst.id, assinada } });
    setAGuardar(false);
    if (res.ok) {
      onAtualizado(res.assinada, res.assinada_em);
      setMsg(assinada ? "Marcada como assinada." : "Marca de assinada removida.");
    } else {
      setMsg(res.mensagem || "Não foi possível atualizar.");
    }
  }

  return (
    <div className="mt-4 rounded-md border border-ink/10 bg-accent p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink/70">
        Declaração de desenho universal — assinatura
      </p>
      <p className="mt-2 text-sm text-foreground">
        Gerar o PDF não assina nada. Marque como assinada apenas depois de receber a
        declaração assinada pela instituição.
      </p>
      <p className="mt-3 text-base text-ink">
        Estado:{" "}
        <span className="font-semibold">
          {inst.declaracao_assinada ? "Assinada" : "Por assinar"}
        </span>
        {inst.declaracao_assinada && inst.declaracao_assinada_em && (
          <>
            {" "}
            <span className="text-sm text-ink/70">
              (em {new Date(inst.declaracao_assinada_em).toLocaleDateString("pt-PT")})
            </span>
          </>
        )}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {!inst.declaracao_assinada ? (
          <button
            type="button"
            onClick={() => alternar(true)}
            disabled={aGuardar}
            className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-white hover:bg-ink/90 disabled:opacity-70"
          >
            {aGuardar ? "A guardar…" : "Marcar como assinada"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => alternar(false)}
            disabled={aGuardar}
            className="inline-flex min-h-11 items-center rounded-md border border-ink/30 bg-white px-4 text-base font-semibold text-ink hover:bg-white/70 disabled:opacity-70"
          >
            {aGuardar ? "A guardar…" : "Remover marca de assinada"}
          </button>
        )}
      </div>
      {msg && (
        <p role="status" aria-live="polite" className="mt-2 text-sm text-ink">
          {msg}
        </p>
      )}
    </div>
  );
}
