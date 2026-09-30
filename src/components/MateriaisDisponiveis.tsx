import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listarMateriaisDisponiveis } from "@/lib/materiais-licoes.functions";
import { TIPOS } from "@/lib/materiais-licoes";

/** Materiais disponibilizados da lição, pela ordem definida. Requer sessão. */
export function MateriaisDisponiveis({ licaoId }: { licaoId: string }) {
  const [sessao, setSessao] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(!!data.session));
  }, []);
  const f = useServerFn(listarMateriaisDisponiveis);
  const q = useQuery({ queryKey: ["materiais-disponiveis", licaoId], queryFn: () => f({ data: { licaoId } }), enabled: sessao === true });

  if (sessao === null) return null;
  if (!sessao) return <p className="mt-4 text-base text-navy-2">Inicie sessão para ver os materiais desta lição.</p>;
  if (q.isLoading) return <p className="mt-4 text-base text-navy-2">A carregar materiais…</p>;
  if (q.isError) return <p role="alert" className="mt-4 text-base font-semibold text-brand">Não foi possível carregar os materiais.</p>;
  const lista = q.data ?? [];
  const principais = lista.filter((m) => m.tipo !== "legenda");
  if (principais.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-line bg-white p-6" aria-labelledby="mat-disp">
      <h2 id="mat-disp" className="text-xl font-extrabold text-navy">Materiais da lição</h2>
      <ol className="mt-4 space-y-6">
        {principais.map((m) => {
          const legendas = lista.filter((l) => l.tipo === "legenda" && l.legenda_de === m.id);
          const descId = `desc-${m.id}`;
          return (
            <li key={m.id}>
              <h3 className="text-base font-bold text-navy">{m.titulo} <span className="font-normal text-navy-2">({TIPOS[m.tipo].rotulo})</span></h3>
              {m.descricao_acessivel ? <p id={descId} className="mt-1 text-base text-navy-2">{m.descricao_acessivel}</p> : null}
              {m.tipo === "video" ? (
                <video controls preload="metadata" crossOrigin="anonymous" className="mt-2 w-full max-w-2xl rounded-md"
                  aria-describedby={m.descricao_acessivel ? descId : undefined}>
                  <source src={m.url} type={m.mime} />
                  {legendas.map((l, k) => <track key={l.id} kind="captions" src={l.url} srcLang={l.idioma} label={l.titulo} default={k === 0} />)}
                </video>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-3">
                <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-md bg-navy px-4 text-sm font-bold text-white">
                  {m.tipo === "video" ? "Abrir vídeo num separador" : "Abrir"}<span className="sr-only"> {m.titulo} (abre noutro separador)</span>
                </a>
                <a href={`${m.url}&download=${encodeURIComponent(m.nome_original)}`} className="inline-flex min-h-11 items-center rounded-md border border-navy px-4 text-sm font-bold text-navy">
                  Descarregar<span className="sr-only"> {m.nome_original}</span>
                </a>
                {legendas.map((l) => (
                  <a key={l.id} href={`${l.url}&download=${encodeURIComponent(l.nome_original)}`} className="inline-flex min-h-11 items-center rounded-md border border-navy px-4 text-sm font-bold text-navy">
                    Descarregar legenda ({l.idioma})
                  </a>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
