import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  guardarLicao,
  listarCursosEdicao,
  listarLicoesCurso,
  type CamposLicao,
  type LicaoEditavel,
} from "@/lib/edicao-licoes.functions";

export const Route = createFileRoute("/_authenticated/painel/licoes")({
  head: () => ({
    meta: [
      { title: "Editar cursos e lições — Área reservada Ologa" },
      { name: "description", content: "Actualização do texto, guião, duração e estado das lições de cada curso." },
      { property: "og:title", content: "Editar cursos e lições — Área reservada Ologa" },
      { property: "og:description", content: "Edição de lições com registo de actividade, exclusiva do Administrador Geral Ologa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditarLicoes,
});

const campo = "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-base text-navy min-h-11";

function camposDe(l: LicaoEditavel): CamposLicao {
  return {
    titulo: l.titulo,
    duracao_minutos: l.duracao_minutos,
    estado_conteudo: l.estado_conteudo,
    conteudo_elearning: l.conteudo_elearning,
    guiao_formador: l.guiao_formador,
  };
}

function EditarLicoes() {
  const fCursos = useServerFn(listarCursosEdicao);
  const fLicoes = useServerFn(listarLicoesCurso);
  const [cursoId, setCursoId] = useState("");
  const [licaoId, setLicaoId] = useState("");
  const cursos = useQuery({ queryKey: ["edicao-cursos"], queryFn: () => fCursos() });
  const licoes = useQuery({
    queryKey: ["edicao-licoes", cursoId],
    queryFn: () => fLicoes({ data: { cursoId } }),
    enabled: !!cursoId,
  });
  const lista = licoes.data ?? [];
  const curso = cursos.data?.find((c) => c.id === cursoId);
  const somaMin = lista.reduce((s, l) => s + (l.duracao_minutos ?? 0), 0);
  const licao = lista.find((l) => l.id === licaoId);

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-navy">Editar cursos e lições</h1>
      <p className="mt-2 max-w-3xl text-base text-navy-2">
        Cada gravação fica no registo de actividade. Se outra pessoa alterou a lição depois de a abrir,
        a gravação é recusada para não apagar o trabalho dela. Os bancos de questões e os exames não
        são alterados aqui.
      </p>

      {cursos.isError ? (
        <p role="alert" className="mt-6 text-base font-semibold text-brand">
          Não foi possível carregar os cursos. Só o Administrador Geral Ologa pode editar lições.
        </p>
      ) : null}

      <div className="mt-6 max-w-xl">
        <label htmlFor="curso" className="text-base font-semibold text-navy">Curso</label>
        <select id="curso" className={campo} value={cursoId} onChange={(e) => { setCursoId(e.target.value); setLicaoId(""); }}>
          <option value="">{cursos.isLoading ? "A carregar…" : "Escolha um curso"}</option>
          {cursos.data?.map((c) => (
            <option key={c.id} value={c.id}>{c.titulo} ({c.carga_horaria} h)</option>
          ))}
        </select>
      </div>

      {curso ? (
        <p className="mt-4 text-base text-navy-2">
          {lista.length} lições · {lista.filter((l) => l.estado_conteudo === "disponivel").length} disponíveis ·{" "}
          {lista.filter((l) => l.proposta_por_validar).length} propostas por validar · soma das lições{" "}
          {(somaMin / 60).toFixed(1)} h + avaliação e orientação {(curso.minutos_avaliacao_orientacao / 60).toFixed(1)} h
          (carga do curso: {curso.carga_horaria} h)
        </p>
      ) : null}

      {cursoId && licoes.isLoading ? <p className="mt-4 text-base text-navy-2">A carregar as lições…</p> : null}
      {cursoId && !licoes.isLoading && lista.length === 0 ? (
        <p className="mt-4 text-base text-navy-2">Este curso ainda não tem lições associadas.</p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {lista.length > 0 ? (
          <nav aria-label="Lições do curso">
            <ul className="space-y-1">
              {lista.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setLicaoId(l.id)}
                    aria-current={l.id === licaoId ? "true" : undefined}
                    className={`min-h-11 w-full rounded-md border px-3 py-2 text-left text-base ${l.id === licaoId ? "border-brand bg-white font-bold text-navy" : "border-line bg-page text-navy-2 hover:bg-white"}`}
                  >
                    M{l.modulo_ordem}·L{l.ordem} — {l.titulo}
                    <span className="block text-sm">
                      {l.estado_conteudo === "disponivel" ? "Disponível" : "Por fornecer"}
                      {l.proposta_por_validar ? " · proposta por validar" : ""}
                      {l.duracao_minutos != null ? ` · ${l.duracao_minutos} min` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {licao ? <FormularioLicao key={licao.id} licao={licao} cursoId={cursoId} /> : null}
      </div>
    </div>
  );
}

function FormularioLicao({ licao, cursoId }: { licao: LicaoEditavel; cursoId: string }) {
  const guardar = useServerFn(guardarLicao);
  const qc = useQueryClient();
  const [base, setBase] = useState<CamposLicao>(() => camposDe(licao));
  const [v, setV] = useState<CamposLicao>(() => camposDe(licao));
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  useEffect(() => setMsg(null), [v]);

  const m = useMutation({
    mutationFn: () => guardar({ data: { id: licao.id, anterior: base, novo: v } }),
    onSuccess: (r) => {
      if (r.estado === "conflito") {
        setMsg({ tipo: "erro", texto: "Esta lição foi alterada por outra pessoa depois de a abrir. Nada foi gravado. Volte a abrir a lição para ver a versão actual." });
      } else if (r.estado === "sem_alteracoes") {
        setMsg({ tipo: "ok", texto: "Não havia alterações para gravar." });
      } else {
        setBase(v);
        setMsg({ tipo: "ok", texto: "Lição gravada e registada na actividade." });
        qc.invalidateQueries({ queryKey: ["edicao-licoes", cursoId] });
      }
    },
    onError: () => setMsg({ tipo: "erro", texto: "Não foi possível gravar. Verifique se tem sessão como Administrador Geral Ologa." }),
  });

  return (
    <form
      className="rounded-lg border border-line bg-white p-5"
      onSubmit={(e) => { e.preventDefault(); m.mutate(); }}
    >
      <h2 className="text-xl font-extrabold text-navy">Módulo {licao.modulo_ordem}: {licao.modulo_titulo}</h2>
      <label className="mt-4 block text-base font-semibold text-navy">Título
        <input className={campo} value={v.titulo} required minLength={3} onChange={(e) => setV({ ...v, titulo: e.target.value })} />
      </label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-base font-semibold text-navy">Duração (minutos)
          <input type="number" min={0} className={campo} value={v.duracao_minutos ?? ""}
            onChange={(e) => setV({ ...v, duracao_minutos: e.target.value === "" ? null : Number(e.target.value) })} />
        </label>
        <label className="block text-base font-semibold text-navy">Estado do conteúdo
          <select className={campo} value={v.estado_conteudo} onChange={(e) => setV({ ...v, estado_conteudo: e.target.value as CamposLicao["estado_conteudo"] })}>
            <option value="disponivel">Disponível</option>
            <option value="por_fornecer">Por fornecer</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block text-base font-semibold text-navy">Conteúdo da lição (e-learning)
        <textarea rows={16} className={`${campo} font-mono text-sm`} value={v.conteudo_elearning ?? ""}
          onChange={(e) => setV({ ...v, conteudo_elearning: e.target.value || null })} />
      </label>
      <label className="mt-4 block text-base font-semibold text-navy">Guião do formador
        <textarea rows={10} className={`${campo} font-mono text-sm`} value={v.guiao_formador ?? ""}
          onChange={(e) => setV({ ...v, guiao_formador: e.target.value || null })} />
      </label>
      {msg ? (
        <p role={msg.tipo === "erro" ? "alert" : "status"} className={`mt-4 text-base font-semibold ${msg.tipo === "erro" ? "text-brand" : "text-navy"}`}>{msg.texto}</p>
      ) : null}
      <button type="submit" disabled={m.isPending}
        className="mt-4 min-h-11 rounded-md bg-navy px-5 py-2 text-base font-bold text-white disabled:opacity-60">
        {m.isPending ? "A gravar…" : "Gravar lição"}
      </button>
    </form>
  );
}
