import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ErroPermissao } from "@/components/erro-permissao";
import { TIPOS } from "@/lib/materiais-licoes";
import { preVisualizarCurso, preVisualizarCursos, preVisualizarLicao } from "@/lib/pre-visualizacao.functions";

export const Route = createFileRoute("/_authenticated/painel/pre-visualizar")({
  head: () => ({
    meta: [
      { title: "Pré-visualizar como formando — Plataforma Nacional" },
      { name: "description", content: "Consulta de cursos, lições, materiais, percurso, exame e certificado tal como o formando os vê, sem gravar dados." },
      { property: "og:title", content: "Pré-visualizar como formando" },
      { property: "og:description", content: "Vista de formando para a Administradora Geral, apenas de leitura." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PreVisualizar,
});

function Faixa() {
  return (
    <div role="status" className="sticky top-0 z-10 border-b-4 border-brand bg-page px-4 py-3 text-base text-navy">
      <strong>Modo de pré-visualização como formando.</strong> Nada é gravado: não há inscrição, progresso,
      presenças, tentativas nem certificados. Os valores de percurso mostram o estado inicial de uma inscrição nova, não resultados reais.
    </div>
  );
}

function PreVisualizar() {
  const fCursos = useServerFn(preVisualizarCursos);
  const cursos = useQuery({ queryKey: ["pv-cursos"], queryFn: () => fCursos() });
  const [cursoId, setCursoId] = useState("");
  const [licaoId, setLicaoId] = useState("");

  if (cursos.isError) return <ErroPermissao erro={cursos.error} />;

  return (
    <>
      <Faixa />
      <main id="conteudo" className="wrap max-w-4xl py-8">
        <p><Link to="/painel" className="font-semibold underline">Voltar ao painel</Link></p>
        <h1 className="mt-3 text-3xl font-extrabold text-navy">Pré-visualizar como formando</h1>
        <label className="mt-6 block text-sm font-semibold text-navy" htmlFor="pv-curso">Curso</label>
        <select id="pv-curso" className="mt-1 min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy"
          value={cursoId} onChange={(e) => { setCursoId(e.target.value); setLicaoId(""); }}>
          <option value="">{cursos.isLoading ? "A carregar…" : "Escolha um curso"}</option>
          {(cursos.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
        {cursoId ? <VistaCurso cursoId={cursoId} licaoId={licaoId} onLicao={setLicaoId} /> : null}
      </main>
    </>
  );
}

function VistaCurso({ cursoId, licaoId, onLicao }: { cursoId: string; licaoId: string; onLicao: (id: string) => void }) {
  const f = useServerFn(preVisualizarCurso);
  const q = useQuery({ queryKey: ["pv-curso", cursoId], queryFn: () => f({ data: { cursoId } }) });
  if (q.isLoading) return <p className="mt-6 text-base text-navy-2">A carregar o curso…</p>;
  if (q.isError || !q.data) return <p role="alert" className="mt-6 font-semibold text-brand">Não foi possível carregar o curso.</p>;
  const { curso, modulos, exame } = q.data;
  const total = modulos.reduce((s, m) => s + m.licoes.length, 0);
  const secao = "mt-6 rounded-xl border border-line bg-white p-6";

  return (
    <>
      <section className={secao} aria-labelledby="pv-ficha">
        <h2 id="pv-ficha" className="text-2xl font-extrabold text-navy">{curso.titulo}</h2>
        <p className="mt-1 text-base text-navy-2">{curso.carga_horaria} horas · {curso.modalidade}</p>
        {([["Objectivos", curso.objectivos], ["Público-alvo", curso.publico_alvo], ["Pré-requisitos", curso.pre_requisitos], ["Materiais", curso.materiais]] as const)
          .filter(([, v]) => v).map(([t, v]) => (
            <div key={t} className="mt-4"><h3 className="font-bold text-navy">{t}</h3><p className="whitespace-pre-line text-base text-navy-2">{v}</p></div>
          ))}
      </section>

      <section className={secao} aria-labelledby="pv-percurso">
        <h2 id="pv-percurso" className="text-xl font-extrabold text-navy">O meu percurso</h2>
        <p className="mt-1 text-sm text-navy-2">Estado inicial de uma inscrição nova (exemplo, não é um resultado real).</p>
        <ul className="mt-3 space-y-1 text-base text-navy">
          <li>Lições concluídas: 0 de {total}</li>
          <li>Assiduidade: sem sessões registadas</li>
          <li>Exame final: {exame.disponivel ? "disponível após cumprir as condições" : "ainda não disponível"}</li>
          <li>Certificado: ainda não emitido</li>
        </ul>
      </section>

      <section className={secao} aria-labelledby="pv-licoes">
        <h2 id="pv-licoes" className="text-xl font-extrabold text-navy">Módulos e lições</h2>
        {modulos.length === 0 ? <p className="mt-2 text-base text-navy-2">Este curso ainda não tem módulos.</p> : null}
        {modulos.map((m) => (
          <div key={m.id} className="mt-4">
            <h3 className="font-bold text-navy">{m.ordem}. {m.titulo}</h3>
            <ol className="mt-2 space-y-1">
              {m.licoes.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => onLicao(l.id)} aria-pressed={licaoId === l.id}
                    className="min-h-11 text-left text-base text-navy underline">
                    {l.titulo}{l.duracao_minutos ? ` (${l.duracao_minutos} min)` : ""}{l.disponivel ? "" : " — conteúdo em preparação"}
                  </button>
                  {licaoId === l.id ? <VistaLicao licaoId={l.id} /> : null}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <section className={secao} aria-labelledby="pv-exame">
        <h2 id="pv-exame" className="text-xl font-extrabold text-navy">Exame final</h2>
        <p className="mt-2 text-base text-navy">
          {exame.disponivel
            ? "O exame fica disponível ao formando quando cumprir as condições abaixo."
            : "O exame final deste curso ainda não está disponível. Fica disponível depois de a gestão concluir a activação e a configuração."}
        </p>
        <p className="mt-2 text-sm text-navy-2">A pré-visualização não inicia provas nem mostra questões.</p>
        <ul className="mt-3 space-y-1 text-base text-navy">
          <li>{exame.regras.numero_questoes} questões · {exame.regras.minutos} minutos</li>
          <li>Tentativas permitidas: {exame.regras.tentativas_max}</li>
          <li>Prazo: {exame.regras.prazo_dias} dias</li>
        </ul>
      </section>

      <section className={secao} aria-labelledby="pv-cert">
        <h2 id="pv-cert" className="text-xl font-extrabold text-navy">Certificado</h2>
        <p className="mt-2 text-base text-navy">
          Emitido quando o formando obtém pelo menos {exame.regras.nota_minima_pct}% no exame final e {exame.regras.assiduidade_minima_pct}% de assiduidade.
          Cada certificado tem um código de verificação pública.
        </p>
        <p className="mt-2 text-sm text-navy-2">A pré-visualização não emite certificados.</p>
      </section>
    </>
  );
}

function VistaLicao({ licaoId }: { licaoId: string }) {
  const f = useServerFn(preVisualizarLicao);
  const q = useQuery({ queryKey: ["pv-licao", licaoId], queryFn: () => f({ data: { licaoId } }) });
  if (q.isLoading) return <p className="ml-4 text-base text-navy-2">A carregar a lição…</p>;
  if (q.isError || !q.data) return <p role="alert" className="ml-4 font-semibold text-brand">Não foi possível carregar a lição.</p>;
  const { licao, materiais } = q.data;
  const principais = materiais.filter((m) => m.tipo !== "legenda");
  return (
    <div className="my-3 rounded-lg border border-line bg-page p-4">
      {licao.disponivel && licao.conteudo
        ? <div className="prose max-w-none text-navy-2" dangerouslySetInnerHTML={{ __html: licao.conteudo }} />
        : <p className="text-base text-navy-2">O conteúdo desta lição está em preparação.</p>}
      <h4 className="mt-4 font-bold text-navy">Materiais da lição</h4>
      {principais.length === 0 ? <p className="text-base text-navy-2">Sem materiais disponíveis para o formando.</p> : (
        <ul className="mt-2 space-y-3">
          {principais.map((m) => {
            const legendas = materiais.filter((x) => x.tipo === "legenda" && x.legenda_de === m.id);
            return (
              <li key={m.id}>
                <p className="font-semibold text-navy">{m.titulo} <span className="font-normal">({TIPOS[m.tipo].rotulo})</span></p>
                {m.tipo === "video" ? (
                  <video controls preload="metadata" crossOrigin="anonymous" className="mt-2 w-full max-w-xl rounded-md">
                    <source src={m.url} type={m.mime} />
                    {legendas.map((l, k) => <track key={l.id} kind="captions" src={l.url} srcLang={l.idioma} label={l.titulo} default={k === 0} />)}
                  </video>
                ) : null}
                <a href={m.url} target="_blank" rel="noreferrer" className="text-base font-semibold underline">Abrir<span className="sr-only"> {m.titulo} (abre noutro separador)</span></a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
