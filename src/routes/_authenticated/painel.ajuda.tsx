import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  CATEGORIAS_SUPORTE, ESTADOS_SUPORTE, guardarFaq, listarFaqAdmin, listarPedidosAdmin, responderPedido,
  type Faq, type PedidoSuporte,
} from "@/lib/ajuda.functions";

export const Route = createFileRoute("/_authenticated/painel/ajuda")({
  head: () => ({
    meta: [
      { title: "FAQ e pedidos de suporte — Área reservada Ologa" },
      { name: "description", content: "Gestão das perguntas frequentes e resposta aos pedidos de apoio." },
      { property: "og:title", content: "FAQ e pedidos de suporte" },
      { property: "og:description", content: "Perguntas frequentes e pedidos de apoio, com registo de actividade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PainelAjuda,
});

const campo = "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy min-h-11";

function PainelAjuda() {
  const fFaq = useServerFn(listarFaqAdmin);
  const fPed = useServerFn(listarPedidosAdmin);
  const faq = useQuery({ queryKey: ["faq-admin"], queryFn: () => fFaq() });
  const ped = useQuery({ queryKey: ["pedidos-admin"], queryFn: () => fPed() });
  const [filtro, setFiltro] = useState<"todos" | keyof typeof ESTADOS_SUPORTE>("aberto");
  const pedidos = (ped.data ?? []).filter((p) => filtro === "todos" || p.estado === filtro);

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-navy">FAQ e pedidos de suporte</h1>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        As perguntas só aparecem na página pública «Ajuda» depois de publicadas. Todas as alterações ficam no registo de actividade.
      </p>
      {faq.isError || ped.isError ? <p role="alert" className="mt-4 font-semibold text-brand">Não foi possível carregar. Só o Administrador Geral Ologa tem acesso.</p> : null}

      <section className="mt-8" aria-labelledby="ped-t">
        <h2 id="ped-t" className="text-2xl font-extrabold text-navy">Pedidos de suporte</h2>
        <p className="mt-1 text-base text-navy-2" role="status">
          {(ped.data ?? []).filter((p) => p.estado === "aberto").length} abertos · {(ped.data ?? []).filter((p) => p.estado === "em_curso").length} em tratamento · {(ped.data ?? []).filter((p) => p.estado === "resolvido").length} resolvidos
        </p>
        <label className="mt-3 block max-w-xs text-base font-semibold text-navy">Mostrar
          <select className={campo} value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)}>
            <option value="todos">Todos</option>
            {Object.entries(ESTADOS_SUPORTE).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
          </select>
        </label>
        <ul className="mt-4 space-y-4">
          {pedidos.map((p) => <li key={`${p.id}-${p.actualizado_em}`}><CartaoPedido p={p} /></li>)}
        </ul>
        {ped.data && pedidos.length === 0 ? <p className="mt-3 text-base text-navy-2">Nenhum pedido neste estado.</p> : null}
      </section>

      <section className="mt-10" aria-labelledby="faq-t">
        <h2 id="faq-t" className="text-2xl font-extrabold text-navy">Perguntas frequentes</h2>
        <div className="mt-4 space-y-4">
          {faq.data?.map((f) => <FormFaq key={`${f.id}-${f.versao}`} f={f} />)}
          <FormFaq f={null} proximaOrdem={(faq.data?.length ?? 0) + 1} />
        </div>
      </section>
    </div>
  );
}

function CartaoPedido({ p }: { p: PedidoSuporte }) {
  const f = useServerFn(responderPedido);
  const qc = useQueryClient();
  const [estado, setEstado] = useState(p.estado);
  const [resposta, setResposta] = useState(p.resposta ?? "");
  const [msg, setMsg] = useState<{ erro: boolean; t: string } | null>(null);
  const m = useMutation({
    mutationFn: () => f({ data: { id: p.id, actualizadoEm: p.actualizado_em, estado, resposta: resposta || null } }),
    onSuccess: (r) => {
      setMsg(r.estado === "gravado" ? { erro: false, t: "Resposta gravada." } : { erro: true, t: "Este pedido foi alterado por outra pessoa. Nada foi gravado; a lista foi recarregada." });
      qc.invalidateQueries({ queryKey: ["pedidos-admin"] });
    },
    onError: () => setMsg({ erro: true, t: "Não foi possível gravar." }),
  });
  return (
    <form className="rounded-md border border-line bg-white p-4" onSubmit={(e) => { e.preventDefault(); m.mutate(); }}>
      <h3 className="text-base font-bold text-navy">{p.assunto}</h3>
      <p className="text-sm text-navy-2">
        {p.autor?.nome ?? "—"} ({p.autor?.email ?? "—"}) · {CATEGORIAS_SUPORTE[p.categoria]} · {new Date(p.criado_em).toLocaleString("pt-PT")}
      </p>
      <p className="mt-2 whitespace-pre-line text-base text-navy">{p.mensagem}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[12rem_1fr]">
        <label className="text-sm font-semibold text-navy">Estado
          <select className={campo} value={estado} onChange={(e) => setEstado(e.target.value as typeof estado)}>
            {Object.entries(ESTADOS_SUPORTE).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-navy">Resposta (visível para quem pediu)
          <textarea rows={3} className={campo} value={resposta} maxLength={5000} onChange={(e) => setResposta(e.target.value)} />
        </label>
      </div>
      <button type="submit" disabled={m.isPending} className="mt-3 min-h-11 rounded-md bg-navy px-4 py-1 text-sm font-bold text-white disabled:opacity-60">
        {m.isPending ? "A gravar…" : "Gravar resposta"}
      </button>
      {msg ? <p role={msg.erro ? "alert" : "status"} className={`mt-2 text-sm font-semibold ${msg.erro ? "text-brand" : "text-navy"}`}>{msg.t}</p> : null}
    </form>
  );
}

function FormFaq({ f, proximaOrdem = 1 }: { f: Faq | null; proximaOrdem?: number }) {
  const g = useServerFn(guardarFaq);
  const qc = useQueryClient();
  const vazio = { pergunta: "", resposta: "", categoria: "geral", ordem: proximaOrdem, publicada: false };
  const [v, setV] = useState(f ? { pergunta: f.pergunta, resposta: f.resposta, categoria: f.categoria, ordem: f.ordem, publicada: f.publicada } : vazio);
  const [msg, setMsg] = useState<{ erro: boolean; t: string } | null>(null);
  const m = useMutation({
    mutationFn: () => g({ data: { id: f?.id ?? null, versao: f?.versao ?? null, campos: v } }),
    onSuccess: (r) => {
      if (r.estado === "conflito") setMsg({ erro: true, t: "Esta pergunta foi alterada por outra pessoa. Nada foi gravado." });
      else { setMsg({ erro: false, t: f ? "Pergunta gravada." : "Pergunta criada (por publicar, salvo se marcou «Publicar»)." }); if (!f) setV(vazio); }
      qc.invalidateQueries({ queryKey: ["faq-admin"] });
    },
    onError: () => setMsg({ erro: true, t: "Não foi possível gravar. Pergunta e resposta precisam de pelo menos 5 caracteres." }),
  });
  const id = f?.id ?? "nova";
  return (
    <form className="rounded-md border border-line bg-white p-4" onSubmit={(e) => { e.preventDefault(); m.mutate(); }} aria-label={f ? `Pergunta: ${f.pergunta}` : "Nova pergunta"}>
      {!f ? <h3 className="text-base font-bold text-navy">Nova pergunta</h3> : null}
      <label className="block text-sm font-semibold text-navy" htmlFor={`p-${id}`}>Pergunta</label>
      <input id={`p-${id}`} className={campo} value={v.pergunta} required minLength={5} onChange={(e) => setV({ ...v, pergunta: e.target.value })} />
      <label className="mt-3 block text-sm font-semibold text-navy" htmlFor={`r-${id}`}>Resposta</label>
      <textarea id={`r-${id}`} rows={3} className={campo} value={v.resposta} required minLength={5} onChange={(e) => setV({ ...v, resposta: e.target.value })} />
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-semibold text-navy">Categoria
          <input className={campo} value={v.categoria} required onChange={(e) => setV({ ...v, categoria: e.target.value })} />
        </label>
        <label className="text-sm font-semibold text-navy">Ordem
          <input type="number" min={1} className={campo} value={v.ordem} onChange={(e) => setV({ ...v, ordem: Number(e.target.value) || 1 })} />
        </label>
        <label className="flex min-h-11 items-center gap-2 self-end text-sm font-semibold text-navy">
          <input type="checkbox" className="h-5 w-5" checked={v.publicada} onChange={(e) => setV({ ...v, publicada: e.target.checked })} /> Publicar
        </label>
      </div>
      <button type="submit" disabled={m.isPending} className="mt-3 min-h-11 rounded-md bg-navy px-4 py-1 text-sm font-bold text-white disabled:opacity-60">
        {m.isPending ? "A gravar…" : f ? "Gravar pergunta" : "Criar pergunta"}
      </button>
      {msg ? <p role={msg.erro ? "alert" : "status"} className={`mt-2 text-sm font-semibold ${msg.erro ? "text-brand" : "text-navy"}`}>{msg.t}</p> : null}
    </form>
  );
}
