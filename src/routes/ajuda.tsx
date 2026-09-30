import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { PlataformaPagina } from "@/components/plataforma-pagina";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIAS_SUPORTE, ESTADOS_SUPORTE, criarPedidoSuporte, meusPedidosSuporte } from "@/lib/ajuda.functions";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda e suporte — Plataforma Nacional de Inclusão Digital" },
      { name: "description", content: "Perguntas frequentes e pedidos de apoio sobre a conta, os cursos e a acessibilidade da plataforma." },
      { property: "og:title", content: "Ajuda e suporte" },
      { property: "og:description", content: "Perguntas frequentes e pedidos de apoio da plataforma de formação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ajuda,
});

const campo = "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy min-h-11";

function Ajuda() {
  const faq = useQuery({
    queryKey: ["faq-publica"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faq_perguntas").select("id,pergunta,resposta,categoria,ordem").eq("publicada", true).order("ordem");
      if (error) throw error;
      return data;
    },
  });
  const [sessao, setSessao] = useState<boolean | null>(null);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSessao(!!data.session)); }, []);

  return (
    <PlataformaPagina titulo="Ajuda e suporte" introducao="Respostas às perguntas mais comuns e forma de pedir apoio à equipa.">
      <section aria-labelledby="faq-t">
        <h2 id="faq-t" className="text-2xl font-extrabold text-navy">Perguntas frequentes</h2>
        {faq.isLoading ? <p className="mt-3 text-base">A carregar…</p> : null}
        {faq.isError ? <p role="alert" className="mt-3 font-semibold text-brand">Não foi possível carregar as perguntas.</p> : null}
        {faq.data && faq.data.length === 0 ? <p className="mt-3 text-base text-navy-2">Ainda não há perguntas publicadas.</p> : null}
        <div className="mt-4 space-y-2">
          {faq.data?.map((f) => (
            <details key={f.id} className="rounded-md border border-line bg-white p-4">
              <summary className="min-h-11 cursor-pointer text-base font-bold text-navy">{f.pergunta}</summary>
              <p className="mt-2 whitespace-pre-line text-base text-navy-2">{f.resposta}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="mt-10" aria-labelledby="sup-t">
        <h2 id="sup-t" className="text-2xl font-extrabold text-navy">Pedir apoio</h2>
        {sessao === false ? (
          <p className="mt-3 text-base text-navy-2">
            Para enviar um pedido e acompanhar a resposta, <Link to="/entrar" className="font-bold text-navy underline">entre na sua conta</Link>.
          </p>
        ) : null}
        {sessao ? <Suporte /> : null}
      </section>
    </PlataformaPagina>
  );
}

function Suporte() {
  const fCriar = useServerFn(criarPedidoSuporte);
  const fMeus = useServerFn(meusPedidosSuporte);
  const qc = useQueryClient();
  const meus = useQuery({ queryKey: ["meus-pedidos"], queryFn: () => fMeus() });
  const [v, setV] = useState({ categoria: "acesso" as keyof typeof CATEGORIAS_SUPORTE, assunto: "", mensagem: "" });
  const [msg, setMsg] = useState<{ erro: boolean; t: string } | null>(null);
  const m = useMutation({
    mutationFn: () => fCriar({ data: v }),
    onSuccess: () => { setMsg({ erro: false, t: "Pedido enviado. A resposta aparece abaixo, nesta página." }); setV({ ...v, assunto: "", mensagem: "" }); qc.invalidateQueries({ queryKey: ["meus-pedidos"] }); },
    onError: () => setMsg({ erro: true, t: "Não foi possível enviar. Verifique se o assunto e a mensagem estão preenchidos." }),
  });
  return (
    <div className="mt-4 grid gap-8 lg:grid-cols-2">
      <form className="rounded-lg border border-line bg-white p-5" onSubmit={(e) => { e.preventDefault(); m.mutate(); }}>
        <label className="block text-base font-semibold text-navy">Tipo de pedido
          <select className={campo} value={v.categoria} onChange={(e) => setV({ ...v, categoria: e.target.value as typeof v.categoria })}>
            {Object.entries(CATEGORIAS_SUPORTE).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
          </select>
        </label>
        <label className="mt-4 block text-base font-semibold text-navy">Assunto
          <input className={campo} value={v.assunto} required minLength={3} maxLength={200} onChange={(e) => setV({ ...v, assunto: e.target.value })} />
        </label>
        <label className="mt-4 block text-base font-semibold text-navy">Mensagem
          <textarea rows={6} className={campo} value={v.mensagem} required minLength={5} maxLength={5000} onChange={(e) => setV({ ...v, mensagem: e.target.value })} />
        </label>
        <p className="mt-2 text-sm text-navy-2">Não escreva palavras-passe nem outros dados secretos na mensagem.</p>
        <button type="submit" disabled={m.isPending} className="mt-4 min-h-11 rounded-md bg-navy px-5 py-2 text-base font-bold text-white disabled:opacity-60">
          {m.isPending ? "A enviar…" : "Enviar pedido"}
        </button>
        {msg ? <p role={msg.erro ? "alert" : "status"} className={`mt-3 text-base font-semibold ${msg.erro ? "text-brand" : "text-navy"}`}>{msg.t}</p> : null}
      </form>
      <div>
        <h3 className="text-xl font-bold text-navy">Os meus pedidos</h3>
        {meus.data && meus.data.length === 0 ? <p className="mt-2 text-base text-navy-2">Ainda não enviou pedidos.</p> : null}
        <ul className="mt-3 space-y-3">
          {meus.data?.map((p) => (
            <li key={p.id} className="rounded-md border border-line bg-white p-4">
              <p className="text-base font-bold text-navy">{p.assunto}</p>
              <p className="text-sm text-navy-2">{CATEGORIAS_SUPORTE[p.categoria]} · {new Date(p.criado_em).toLocaleString("pt-PT")} · <strong>{ESTADOS_SUPORTE[p.estado]}</strong></p>
              {p.resposta ? <p className="mt-2 whitespace-pre-line text-base text-navy"><strong>Resposta:</strong> {p.resposta}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
