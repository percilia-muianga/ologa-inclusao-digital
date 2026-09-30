import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  criarTopico, lerDiscussao, moderar, mudarEstadoTopico, responderTopico,
  type PapelDiscussao, type Resposta, type Topico,
} from "@/lib/discussao.functions";

export const Route = createFileRoute("/_authenticated/painel/discussao/$turma")({
  head: () => ({
    meta: [
      { title: "Discussão da turma — Área reservada" },
      { name: "description", content: "Dúvidas dos formandos e respostas do formador desta turma." },
      { property: "og:title", content: "Discussão da turma" },
      { property: "og:description", content: "Espaço de dúvidas pedagógicas da turma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DiscussaoTurma,
});

const campo = "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy min-h-11";
const ESTADO = { aberta: "À espera de resposta", respondida: "Respondida", resolvida: "Resolvida" } as const;
const PAPEL_AUTOR: Record<PapelDiscussao, string> = { formando: "Formando(a)", formador: "Formador(a)", moderacao: "Coordenação" };
const dataHora = (s: string) => new Date(s).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });

function DiscussaoTurma() {
  const { turma } = Route.useParams();
  const f = useServerFn(lerDiscussao);
  const q = useQuery({ queryKey: ["discussao", turma], queryFn: () => f({ data: { turmaId: turma } }) });
  const [filtro, setFiltro] = useState<"todas" | "minhas" | keyof typeof ESTADO>("todas");

  if (q.isLoading) return <p className="text-base text-navy-2" role="status">A carregar…</p>;
  if (q.isError) return <p role="alert" className="font-semibold text-brand">Não foi possível ler a discussão.</p>;
  if (!q.data?.acesso) {
    return (
      <div className="rounded-lg border border-line bg-page p-5">
        <h1 className="text-2xl font-extrabold text-navy">Sem acesso a esta turma</h1>
        <p className="mt-2 text-base text-navy-2">A discussão só está disponível para quem está inscrito na turma, para o formador responsável e para a coordenação.</p>
        <Link to="/painel/discussao" className="mt-3 inline-block font-semibold underline">Ver as minhas turmas</Link>
      </div>
    );
  }
  const d = q.data;
  const lista = d.topicos.filter((t) => filtro === "todas" || (filtro === "minhas" ? t.autor_id === d.eu : t.estado === filtro));

  return (
    <div>
      <Link to="/painel/discussao" className="font-semibold underline">← Discussão das turmas</Link>
      <h1 className="mt-3 text-3xl font-extrabold text-navy">Discussão · {d.turma.designacao}</h1>
      <p className="mt-1 text-base text-navy-2">{d.turma.curso} · {d.turma.distrito}, {d.turma.provincia}</p>

      {d.papel === "formando" ? <NovaDuvida turmaId={turma} /> : null}

      <section className="mt-8" aria-labelledby="duv-t">
        <h2 id="duv-t" className="text-2xl font-extrabold text-navy">Dúvidas da turma</h2>
        <label className="mt-3 block max-w-xs text-base font-semibold text-navy">Mostrar
          <select className={campo} value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)}>
            <option value="todas">Todas</option>
            <option value="minhas">As minhas</option>
            {Object.entries(ESTADO).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
          </select>
        </label>
        <p className="mt-2 text-base text-navy-2" role="status">{lista.length} {lista.length === 1 ? "dúvida" : "dúvidas"}</p>
        {d.topicos.length === 0 ? (
          <p className="mt-3 text-base text-navy-2">
            {d.papel === "formando" ? "Ainda ninguém colocou dúvidas nesta turma. Pode ser a primeira pessoa." : "Ainda não há dúvidas nesta turma."}
          </p>
        ) : lista.length === 0 ? <p className="mt-3 text-base text-navy-2">Nenhuma dúvida neste filtro.</p> : null}
        <ul className="mt-4 space-y-4">
          {lista.map((t) => <li key={`${t.id}-${t.actualizado_em}`}><CartaoTopico t={t} turmaId={turma} papel={d.papel} eu={d.eu} /></li>)}
        </ul>
      </section>
    </div>
  );
}

function useRecarregar(turmaId: string) {
  const qc = useQueryClient();
  return () => { qc.invalidateQueries({ queryKey: ["discussao", turmaId] }); qc.invalidateQueries({ queryKey: ["discussao-turmas"] }); };
}

function NovaDuvida({ turmaId }: { turmaId: string }) {
  const f = useServerFn(criarTopico);
  const recarregar = useRecarregar(turmaId);
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [msg, setMsg] = useState<{ erro: boolean; t: string } | null>(null);
  const m = useMutation({
    mutationFn: () => f({ data: { turmaId, titulo, mensagem } }),
    onSuccess: (r) => {
      if (r.ok) { setTitulo(""); setMensagem(""); setMsg({ erro: false, t: "Dúvida publicada. Será avisado(a) aqui quando houver resposta." }); recarregar(); }
      else setMsg({ erro: true, t: r.erro });
    },
    onError: () => setMsg({ erro: true, t: "Verifique o título (3 a 200 caracteres) e a mensagem (5 a 5000)." }),
  });
  return (
    <form className="mt-6 rounded-lg border border-line bg-white p-5" onSubmit={(e) => { e.preventDefault(); setMsg(null); m.mutate(); }} aria-labelledby="nova-t">
      <h2 id="nova-t" className="text-xl font-extrabold text-navy">Colocar uma dúvida</h2>
      <p className="mt-1 text-base text-navy-2">Não escreva dados pessoais, palavras-passe ou números de documentos.</p>
      <label className="mt-3 block text-base font-semibold text-navy">Assunto
        <input className={campo} value={titulo} onChange={(e) => setTitulo(e.target.value)} required minLength={3} maxLength={200} />
      </label>
      <label className="mt-3 block text-base font-semibold text-navy">A sua dúvida
        <textarea className={campo} rows={4} value={mensagem} onChange={(e) => setMensagem(e.target.value)} required minLength={5} maxLength={5000} />
      </label>
      <button type="submit" disabled={m.isPending} className="btn-brand btn-brand-hover mt-3 inline-flex min-h-11 items-center">
        {m.isPending ? "A publicar…" : "Publicar dúvida"}
      </button>
      {msg ? <p role={msg.erro ? "alert" : "status"} className={`mt-2 font-semibold ${msg.erro ? "text-brand" : "text-navy"}`}>{msg.t}</p> : null}
    </form>
  );
}

function CartaoTopico({ t, turmaId, papel, eu }: { t: Topico; turmaId: string; papel: PapelDiscussao; eu: string }) {
  const fResp = useServerFn(responderTopico);
  const fEstado = useServerFn(mudarEstadoTopico);
  const recarregar = useRecarregar(turmaId);
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState<{ erro: boolean; t: string } | null>(null);
  const tratar = (r: { ok: boolean; erro?: string }, ok: string) => { if (r.ok) { setMsg({ erro: false, t: ok }); recarregar(); } else setMsg({ erro: true, t: r.erro ?? "Não foi possível gravar." }); };
  const resp = useMutation({ mutationFn: () => fResp({ data: { turmaId, topicoId: t.id, mensagem: texto } }), onSuccess: (r) => { if (r.ok) setTexto(""); tratar(r, "Resposta publicada."); } });
  const est = useMutation({ mutationFn: (estado: "aberta" | "resolvida") => fEstado({ data: { topicoId: t.id, estado } }), onSuccess: (r) => tratar(r, "Estado actualizado.") });
  const souAutor = t.autor_id === eu;
  const podeResponder = !t.oculto || papel === "moderacao";

  return (
    <article className="rounded-lg border border-line bg-white p-5" aria-labelledby={`t-${t.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`t-${t.id}`} className="text-lg font-extrabold text-navy">{t.titulo}</h3>
        <span className="rounded-md border border-line px-2 py-1 text-sm font-semibold text-navy">{ESTADO[t.estado]}</span>
      </div>
      <p className="text-sm text-navy-2">{t.autor_nome || "Formando(a)"}{souAutor ? " (eu)" : ""} · {dataHora(t.criado_em)}</p>
      {t.oculto ? <p className="mt-2 rounded-md bg-page p-2 text-base text-navy"><strong>Ocultada pela coordenação:</strong> {t.moderacao_motivo}</p> : null}
      <p className="mt-2 whitespace-pre-wrap text-base text-navy">{t.mensagem}</p>
      {papel === "moderacao" ? <Moderar tipo="topico" id={t.id} oculto={t.oculto} turmaId={turmaId} /> : null}

      <h4 className="sr-only">Respostas</h4>
      {t.respostas.length === 0 ? <p className="mt-3 text-base text-navy-2">Ainda sem respostas.</p> : (
        <ol className="mt-3 space-y-3 border-l-4 border-line pl-4">
          {t.respostas.map((r) => <li key={`${r.id}-${r.oculto}`}><CartaoResposta r={r} papel={papel} turmaId={turmaId} eu={eu} /></li>)}
        </ol>
      )}

      {podeResponder ? (
        <form className="mt-3" onSubmit={(e) => { e.preventDefault(); setMsg(null); resp.mutate(); }}>
          <label className="block text-base font-semibold text-navy">{papel === "formando" ? "Acrescentar mensagem" : "Responder"}
            <textarea className={campo} rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} required minLength={2} maxLength={5000} />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="submit" disabled={resp.isPending} className="btn-brand btn-brand-hover inline-flex min-h-11 items-center">
              {resp.isPending ? "A publicar…" : "Publicar resposta"}
            </button>
            {(souAutor || papel !== "formando") && t.estado !== "resolvida" ? (
              <button type="button" onClick={() => est.mutate("resolvida")} className="min-h-11 rounded-md border border-line px-4 font-semibold text-navy">Marcar como resolvida</button>
            ) : null}
            {(souAutor || papel !== "formando") && t.estado === "resolvida" ? (
              <button type="button" onClick={() => est.mutate("aberta")} className="min-h-11 rounded-md border border-line px-4 font-semibold text-navy">Reabrir</button>
            ) : null}
          </div>
        </form>
      ) : <p className="mt-3 text-base text-navy-2">Esta dúvida já não aceita novas mensagens.</p>}
      {msg ? <p role={msg.erro ? "alert" : "status"} className={`mt-2 font-semibold ${msg.erro ? "text-brand" : "text-navy"}`}>{msg.t}</p> : null}
    </article>
  );
}

function CartaoResposta({ r, papel, turmaId, eu }: { r: Resposta; papel: PapelDiscussao; turmaId: string; eu: string }) {
  return (
    <div>
      <p className="text-sm text-navy-2">
        <strong className="text-navy">{r.autor_nome || PAPEL_AUTOR[r.papel_autor]}</strong>
        {r.papel_autor !== "formando" ? ` · ${PAPEL_AUTOR[r.papel_autor]}` : ""}{r.autor_id === eu ? " (eu)" : ""} · {dataHora(r.criado_em)}
      </p>
      {r.oculto ? <p className="mt-1 rounded-md bg-page p-2 text-base text-navy"><strong>Ocultada pela coordenação:</strong> {r.moderacao_motivo}</p> : null}
      <p className="mt-1 whitespace-pre-wrap text-base text-navy">{r.mensagem}</p>
      {papel === "moderacao" ? <Moderar tipo="resposta" id={r.id} oculto={r.oculto} turmaId={turmaId} /> : null}
    </div>
  );
}

function Moderar({ tipo, id, oculto, turmaId }: { tipo: "topico" | "resposta"; id: string; oculto: boolean; turmaId: string }) {
  const f = useServerFn(moderar);
  const recarregar = useRecarregar(turmaId);
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const m = useMutation({
    mutationFn: (ocultar: boolean) => f({ data: { tipo, id, oculto: ocultar, motivo: ocultar ? motivo : null } }),
    onSuccess: (r) => { if (r.ok) { setAberto(false); recarregar(); } else setErro(r.erro); },
    onError: () => setErro("Indique o motivo (3 a 500 caracteres)."),
  });
  if (oculto) return <button type="button" onClick={() => m.mutate(false)} className="mt-2 min-h-11 rounded-md border border-line px-3 text-sm font-semibold text-navy">Voltar a mostrar</button>;
  if (!aberto) return <button type="button" onClick={() => setAberto(true)} className="mt-2 min-h-11 rounded-md border border-line px-3 text-sm font-semibold text-navy">Ocultar (moderação)</button>;
  return (
    <form className="mt-2" onSubmit={(e) => { e.preventDefault(); setErro(null); m.mutate(true); }}>
      <label className="block text-sm font-semibold text-navy">Motivo (visível para a turma)
        <input className={campo} value={motivo} onChange={(e) => setMotivo(e.target.value)} required minLength={3} maxLength={500} />
      </label>
      <div className="mt-2 flex gap-2">
        <button type="submit" className="btn-brand btn-brand-hover inline-flex min-h-11 items-center">Ocultar</button>
        <button type="button" onClick={() => setAberto(false)} className="min-h-11 rounded-md border border-line px-3 font-semibold text-navy">Cancelar</button>
      </div>
      {erro ? <p role="alert" className="mt-1 font-semibold text-brand">{erro}</p> : null}
    </form>
  );
}
