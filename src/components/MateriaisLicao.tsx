import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  actualizarMaterial, listarMateriais, registarMaterial, reordenarMateriais, substituirFicheiro, type MaterialLicao,
} from "@/lib/materiais-licoes.functions";
import {
  BUCKET_MATERIAIS, TEXTO_AVISO, TIPOS, avisosMaterial, extensao, mover, validarFicheiro, type TipoMaterial,
} from "@/lib/materiais-licoes";

const campo = "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy min-h-11";
const botao = "min-h-11 rounded-md border border-navy px-3 py-1 text-sm font-bold text-navy disabled:opacity-50";

async function carregar(licaoId: string, tipo: TipoMaterial, f: File) {
  const v = validarFicheiro(tipo, f.name, f.size);
  if ("erro" in v) throw new Error(v.erro);
  const path = `${licaoId}/${crypto.randomUUID()}.${extensao(f.name)}`;
  const { error } = await supabase.storage.from(BUCKET_MATERIAIS).upload(path, f, { contentType: v.mime, upsert: false });
  if (error) throw new Error("Não foi possível carregar o ficheiro. Verifique a sessão de Administrador Geral.");
  return path;
}

export function MateriaisLicao({ licaoId }: { licaoId: string }) {
  const fListar = useServerFn(listarMateriais);
  const fReord = useServerFn(reordenarMateriais);
  const qc = useQueryClient();
  const chave = ["materiais", licaoId];
  const q = useQuery({ queryKey: chave, queryFn: () => fListar({ data: { licaoId } }) });
  const lista = q.data ?? [];
  const [msg, setMsg] = useState<string | null>(null);
  const reord = useMutation({
    mutationFn: (ids: string[]) => fReord({ data: { licaoId, ids } }),
    onSuccess: (r) => { setMsg(r.estado === "conflito" ? "A lista mudou entretanto; foi recarregada." : "Ordem gravada."); qc.invalidateQueries({ queryKey: chave }); },
  });
  const avisos = (m: MaterialLicao) => avisosMaterial(m, lista);
  const comProblema = lista.filter((m) => avisos(m).some((a) => a !== "indisponivel")).length;

  return (
    <section className="mt-6 rounded-lg border border-line bg-white p-5" aria-labelledby="mat-titulo">
      <h2 id="mat-titulo" className="text-xl font-extrabold text-navy">Materiais da lição</h2>
      <p className="mt-1 text-sm text-navy-2">
        PDF, apresentações, vídeos (MP4/WebM) e legendas (WebVTT), até 50 MB. Um material novo fica
        indisponível até o disponibilizar. Substituir mantém o ficheiro anterior guardado. Todas as alterações ficam no registo de actividade.
      </p>
      {q.isLoading ? <p className="mt-3 text-base">A carregar…</p> : null}
      {q.isError ? <p role="alert" className="mt-3 font-semibold text-brand">Não foi possível carregar os materiais.</p> : null}
      {q.data ? (
        <p className="mt-3 text-base text-navy" role="status">
          {lista.length} materiais · {lista.filter((m) => m.disponivel).length} disponíveis · {comProblema} com avisos
        </p>
      ) : null}
      {msg ? <p role="status" className="mt-2 text-sm font-semibold text-navy">{msg}</p> : null}
      <ol className="mt-4 space-y-4">
        {lista.map((m, i) => (
          <li key={m.id}>
            <CartaoMaterial m={m} lista={lista} avisos={avisos(m)} licaoId={licaoId}
              acima={i > 0 ? () => reord.mutate(mover(lista.map((x) => x.id), m.id, -1)) : undefined}
              abaixo={i < lista.length - 1 ? () => reord.mutate(mover(lista.map((x) => x.id), m.id, 1)) : undefined}
              ocupado={reord.isPending} />
          </li>
        ))}
      </ol>
      <NovoMaterial licaoId={licaoId} videos={lista.filter((m) => m.tipo === "video")} />
    </section>
  );
}

function Previa({ m, lista }: { m: MaterialLicao; lista: MaterialLicao[] }) {
  if (!m.url) return <p className="text-sm font-semibold text-brand">Pré-visualização indisponível: ficheiro em falta.</p>;
  if (m.tipo === "video") {
    const legendas = lista.filter((x) => x.tipo === "legenda" && x.legenda_de === m.id && x.url);
    return (
      <video controls preload="metadata" className="mt-2 w-full max-w-xl rounded-md" aria-label={m.titulo} crossOrigin="anonymous">
        <source src={m.url} type={m.mime} />
        {legendas.map((l, k) => <track key={l.id} kind="captions" src={l.url!} srcLang={l.idioma} label={l.titulo} default={k === 0} />)}
      </video>
    );
  }
  if (m.mime === "application/pdf")
    return <iframe title={`Pré-visualização: ${m.titulo}`} src={m.url} className="mt-2 h-96 w-full rounded-md border border-line" />;
  return (
    <p className="mt-2 text-sm text-navy-2">
      Este formato não abre dentro da página. <a className="font-bold text-navy underline" href={m.url} target="_blank" rel="noreferrer">Descarregar {m.nome_original}</a>
    </p>
  );
}

function CartaoMaterial({ m, lista, avisos, licaoId, acima, abaixo, ocupado }: {
  m: MaterialLicao; lista: MaterialLicao[]; avisos: ReturnType<typeof avisosMaterial>; licaoId: string;
  acima?: () => void; abaixo?: () => void; ocupado: boolean;
}) {
  const fAct = useServerFn(actualizarMaterial);
  const fSub = useServerFn(substituirFicheiro);
  const qc = useQueryClient();
  const [v, setV] = useState({ titulo: m.titulo, descricao_acessivel: m.descricao_acessivel ?? "", idioma: m.idioma, legenda_de: m.legenda_de, disponivel: m.disponivel });
  const [previa, setPrevia] = useState(false);
  const [msg, setMsg] = useState<{ erro: boolean; t: string } | null>(null);
  const fim = (t: string, erro = false) => { setMsg({ erro, t }); qc.invalidateQueries({ queryKey: ["materiais", licaoId] }); };
  const guardar = useMutation({
    mutationFn: () => fAct({ data: { id: m.id, versao: m.versao, disponivel: v.disponivel, meta: { titulo: v.titulo, descricao_acessivel: v.descricao_acessivel || null, idioma: v.idioma, legenda_de: v.legenda_de } } }),
    onSuccess: (r) => fim(r.estado === "gravado" ? "Material gravado." : r.estado === "conflito" ? "Outra pessoa alterou este material. Nada foi gravado; a lista foi recarregada." : "O ficheiro não existe no armazenamento; não pode ser disponibilizado.", r.estado !== "gravado"),
    onError: (e) => setMsg({ erro: true, t: (e as Error).message }),
  });
  const substituir = useMutation({
    mutationFn: async (f: File) => {
      const path = await carregar(licaoId, m.tipo, f);
      return fSub({ data: { id: m.id, licaoId, tipo: m.tipo, versao: m.versao, nomeOriginal: f.name, tamanho: f.size, ficheiroPath: path } });
    },
    onSuccess: (r) => fim(r.estado === "gravado" ? "Ficheiro substituído." : "Outra pessoa alterou este material. Nada foi substituído.", r.estado !== "gravado"),
    onError: (e) => setMsg({ erro: true, t: (e as Error).message }),
  });
  const id = `m-${m.id}`;

  return (
    <article className="rounded-md border border-line p-4" aria-labelledby={`${id}-t`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`${id}-t`} className="text-base font-bold text-navy">
          {m.ordem}. {m.titulo} <span className="font-normal text-navy-2">— {TIPOS[m.tipo].rotulo} · {m.nome_original} · {(m.tamanho_bytes / 1048576).toFixed(1)} MB · versão {m.versao}</span>
        </h3>
        <div className="flex gap-2">
          <button type="button" className={botao} onClick={acima} disabled={!acima || ocupado} aria-label={`Mover «${m.titulo}» para cima`}>↑</button>
          <button type="button" className={botao} onClick={abaixo} disabled={!abaixo || ocupado} aria-label={`Mover «${m.titulo}» para baixo`}>↓</button>
        </div>
      </div>
      <p className={`mt-1 text-sm font-bold ${m.disponivel ? "text-navy" : "text-brand"}`}>{m.disponivel ? "Disponível aos formandos" : "Indisponível"}</p>
      {avisos.filter((a) => a !== "indisponivel").length ? (
        <ul className="mt-1 list-disc pl-5 text-sm text-brand">
          {avisos.filter((a) => a !== "indisponivel").map((a) => <li key={a}>{TEXTO_AVISO[a]}</li>)}
        </ul>
      ) : null}
      <form className="mt-3 grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); guardar.mutate(); }}>
        <label className="text-sm font-semibold text-navy">Título
          <input className={campo} value={v.titulo} required minLength={3} onChange={(e) => setV({ ...v, titulo: e.target.value })} />
        </label>
        <label className="text-sm font-semibold text-navy">Idioma (código, ex.: pt)
          <input className={campo} value={v.idioma} required onChange={(e) => setV({ ...v, idioma: e.target.value })} />
        </label>
        {m.tipo !== "legenda" ? (
          <label className="text-sm font-semibold text-navy sm:col-span-2">Descrição acessível
            <textarea rows={2} className={campo} value={v.descricao_acessivel} onChange={(e) => setV({ ...v, descricao_acessivel: e.target.value })} />
          </label>
        ) : (
          <label className="text-sm font-semibold text-navy sm:col-span-2">Legenda do vídeo
            <select className={campo} value={v.legenda_de ?? ""} onChange={(e) => setV({ ...v, legenda_de: e.target.value || null })}>
              <option value="">Nenhum</option>
              {lista.filter((x) => x.tipo === "video").map((x) => <option key={x.id} value={x.id}>{x.titulo}</option>)}
            </select>
          </label>
        )}
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-navy">
          <input type="checkbox" className="h-5 w-5" checked={v.disponivel} onChange={(e) => setV({ ...v, disponivel: e.target.checked })} />
          Disponibilizar aos formandos
        </label>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <button type="submit" className="min-h-11 rounded-md bg-navy px-4 py-1 text-sm font-bold text-white disabled:opacity-60" disabled={guardar.isPending}>
            {guardar.isPending ? "A gravar…" : "Gravar material"}
          </button>
          <button type="button" className={botao} onClick={() => setPrevia(!previa)} aria-expanded={previa}>{previa ? "Fechar pré-visualização" : "Pré-visualizar"}</button>
          <label className={`${botao} inline-flex cursor-pointer items-center`}>
            {substituir.isPending ? "A substituir…" : "Substituir ficheiro"}
            <input type="file" className="sr-only" accept={TIPOS[m.tipo].extensoes.map((x) => `.${x}`).join(",")}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) substituir.mutate(f); e.target.value = ""; }} />
          </label>
        </div>
      </form>
      {msg ? <p role={msg.erro ? "alert" : "status"} className={`mt-2 text-sm font-semibold ${msg.erro ? "text-brand" : "text-navy"}`}>{msg.t}</p> : null}
      {previa ? <Previa m={m} lista={lista} /> : null}
    </article>
  );
}

function NovoMaterial({ licaoId, videos }: { licaoId: string; videos: MaterialLicao[] }) {
  const fReg = useServerFn(registarMaterial);
  const qc = useQueryClient();
  const [tipo, setTipo] = useState<TipoMaterial>("pdf");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [idioma, setIdioma] = useState("pt");
  const [legendaDe, setLegendaDe] = useState("");
  const [ficheiro, setFicheiro] = useState<File | null>(null);
  const [msg, setMsg] = useState<{ erro: boolean; t: string } | null>(null);
  const m = useMutation({
    mutationFn: async () => {
      if (!ficheiro) throw new Error("Escolha um ficheiro.");
      const path = await carregar(licaoId, tipo, ficheiro);
      return fReg({ data: { licaoId, tipo, nomeOriginal: ficheiro.name, tamanho: ficheiro.size, ficheiroPath: path,
        meta: { titulo, descricao_acessivel: descricao || null, idioma, legenda_de: tipo === "legenda" ? legendaDe || null : null } } });
    },
    onSuccess: () => { setMsg({ erro: false, t: "Material anexado (indisponível até o disponibilizar)." }); setTitulo(""); setDescricao(""); setFicheiro(null); qc.invalidateQueries({ queryKey: ["materiais", licaoId] }); },
    onError: (e) => setMsg({ erro: true, t: (e as Error).message }),
  });

  return (
    <form className="mt-6 grid gap-3 border-t border-line pt-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); m.mutate(); }} aria-labelledby="novo-mat">
      <h3 id="novo-mat" className="text-base font-bold text-navy sm:col-span-2">Anexar material</h3>
      <label className="text-sm font-semibold text-navy">Tipo
        <select className={campo} value={tipo} onChange={(e) => setTipo(e.target.value as TipoMaterial)}>
          {(Object.keys(TIPOS) as TipoMaterial[]).map((t) => <option key={t} value={t}>{TIPOS[t].rotulo}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-navy">Ficheiro ({TIPOS[tipo].extensoes.join(", ")})
        <input type="file" className={campo} accept={TIPOS[tipo].extensoes.map((x) => `.${x}`).join(",")} required
          onChange={(e) => setFicheiro(e.target.files?.[0] ?? null)} />
      </label>
      <label className="text-sm font-semibold text-navy">Título
        <input className={campo} value={titulo} required minLength={3} onChange={(e) => setTitulo(e.target.value)} />
      </label>
      <label className="text-sm font-semibold text-navy">Idioma (código, ex.: pt)
        <input className={campo} value={idioma} required onChange={(e) => setIdioma(e.target.value)} />
      </label>
      {tipo === "legenda" ? (
        <label className="text-sm font-semibold text-navy sm:col-span-2">Legenda do vídeo
          <select className={campo} value={legendaDe} onChange={(e) => setLegendaDe(e.target.value)}>
            <option value="">Nenhum</option>
            {videos.map((x) => <option key={x.id} value={x.id}>{x.titulo}</option>)}
          </select>
        </label>
      ) : (
        <label className="text-sm font-semibold text-navy sm:col-span-2">Descrição acessível
          <textarea rows={2} className={campo} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </label>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={m.isPending} className="min-h-11 rounded-md bg-navy px-4 py-1 text-sm font-bold text-white disabled:opacity-60">
          {m.isPending ? "A anexar…" : "Anexar material"}
        </button>
        {msg ? <p role={msg.erro ? "alert" : "status"} className={`mt-2 text-sm font-semibold ${msg.erro ? "text-brand" : "text-navy"}`}>{msg.t}</p> : null}
      </div>
    </form>
  );
}
