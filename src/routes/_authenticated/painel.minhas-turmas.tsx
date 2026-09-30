import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  consultarTurmaPorCodigo,
  inscreverPorCodigo,
  listarMinhasTurmas,
  type ResultadoInscricao,
  type TurmaPorCodigo,
} from "@/lib/inscricao-turma.functions";
import { rotuloEstadoTurma } from "@/lib/turmas.functions";
import { percursoDaMatricula, type PercursoMatricula } from "@/lib/percurso.functions";

export const Route = createFileRoute("/_authenticated/painel/minhas-turmas")({
  head: () => ({
    meta: [
      { title: "As minhas turmas — Plataforma Nacional de Capacitação Digital" },
      { name: "description", content: "Inscrever-se numa turma com o código recebido e continuar para as lições." },
      { property: "og:title", content: "As minhas turmas" },
      { property: "og:description", content: "Inscrição por código e acesso às lições da turma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MinhasTurmas,
});

const MENSAGENS: Record<Exclude<ResultadoInscricao, "inscrito">, string> = {
  codigo_invalido: "Este código não corresponde a nenhuma turma. Confirme o código com a pessoa responsável pela formação.",
  inscricoes_fechadas: "As inscrições nesta turma não estão abertas. Fale com a pessoa responsável pela formação.",
  turma_cheia: "Esta turma já tem todas as vagas ocupadas. Não foi feita a inscrição.",
  ja_inscrito: "Já está inscrito(a) nesta turma.",
  sem_perfil: "A sua conta ainda não tem perfil. Saia e volte a entrar, e tente de novo.",
};

function data(d: string | null) {
  return d ? new Date(d + "T00:00:00").toLocaleDateString("pt-PT") : "—";
}

function MinhasTurmas() {
  const qc = useQueryClient();
  const listar = useServerFn(listarMinhasTurmas);
  const consultar = useServerFn(consultarTurmaPorCodigo);
  const inscrever = useServerFn(inscreverPorCodigo);
  const turmas = useQuery({ queryKey: ["minhas-turmas"], queryFn: () => listar() });

  const [codigo, setCodigo] = useState("");
  const [turma, setTurma] = useState<TurmaPorCodigo | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function procurar(e: React.FormEvent) {
    e.preventDefault();
    setAviso(null);
    setTurma(null);
    setOcupado(true);
    try {
      const r = await consultar({ data: { codigo } });
      if (r.resultado === "codigo_invalido") setAviso({ tipo: "erro", texto: MENSAGENS.codigo_invalido });
      else if (r.minhaInscricao && r.minhaInscricao !== "desistiu")
        setAviso({ tipo: "erro", texto: MENSAGENS.ja_inscrito });
      else if (r.turma.estado !== "inscricoes_abertas")
        setAviso({ tipo: "erro", texto: MENSAGENS.inscricoes_fechadas });
      else if (r.turma.vagasLivres <= 0) setAviso({ tipo: "erro", texto: MENSAGENS.turma_cheia });
      else setTurma(r.turma);
    } catch {
      setAviso({ tipo: "erro", texto: "Não foi possível consultar o código. Tente novamente." });
    } finally {
      setOcupado(false);
    }
  }

  async function confirmar() {
    if (!turma) return;
    setOcupado(true);
    try {
      const r = await inscrever({ data: { codigo: turma.codigo } });
      if (r.resultado === "inscrito") {
        setAviso({ tipo: "ok", texto: `Ficou inscrito(a) na turma «${turma.designacao}».` });
        setTurma(null);
        setCodigo("");
        await qc.invalidateQueries({ queryKey: ["minhas-turmas"] });
      } else {
        setAviso({ tipo: "erro", texto: MENSAGENS[r.resultado] });
        if (r.resultado !== "ja_inscrito") setTurma(null);
      }
    } catch {
      setAviso({ tipo: "erro", texto: "Não foi possível concluir a inscrição. Tente novamente." });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-navy">As minhas turmas</h1>

      <section className="mt-6 rounded-lg border border-line bg-white p-5" aria-labelledby="inscrever">
        <h2 id="inscrever" className="text-xl font-extrabold text-navy">Inscrever-me com um código</h2>
        <form onSubmit={procurar} className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="codigo-turma" className="block text-base font-semibold text-navy">
              Código da turma
            </label>
            <input
              id="codigo-turma"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              autoComplete="off"
              className="mt-1 min-h-11 rounded-md border border-line px-3 font-mono text-lg tracking-widest"
              maxLength={20}
              required
            />
          </div>
          <button type="submit" disabled={ocupado || codigo.trim().length < 4} className="btn-brand btn-brand-hover min-h-11 disabled:opacity-50">
            Procurar turma
          </button>
        </form>

        {aviso ? (
          <p
            role={aviso.tipo === "erro" ? "alert" : "status"}
            className={"mt-4 rounded-md border p-3 text-base " + (aviso.tipo === "erro" ? "border-brand text-navy" : "border-line bg-page text-navy")}
          >
            {aviso.texto}
          </p>
        ) : null}

        {turma ? (
          <div className="mt-4 rounded-md border border-line bg-page p-4">
            <h3 className="text-lg font-extrabold text-navy">Confirme a turma</h3>
            <dl className="mt-2 grid gap-1 text-base text-navy sm:grid-cols-2">
              <div><dt className="inline font-semibold">Curso: </dt><dd className="inline">{turma.cursoTitulo}</dd></div>
              <div><dt className="inline font-semibold">Turma: </dt><dd className="inline">{turma.designacao}</dd></div>
              <div><dt className="inline font-semibold">Local: </dt><dd className="inline">{[turma.local, turma.distrito, turma.provincia].filter(Boolean).join(", ")}</dd></div>
              <div><dt className="inline font-semibold">Datas: </dt><dd className="inline">{data(turma.dataInicio)} a {data(turma.dataFim)}</dd></div>
              <div><dt className="inline font-semibold">Vagas livres: </dt><dd className="inline">{turma.vagasLivres}</dd></div>
            </dl>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={confirmar} disabled={ocupado} className="btn-brand btn-brand-hover min-h-11 disabled:opacity-50">
                {ocupado ? "A inscrever…" : "Confirmar inscrição"}
              </button>
              <button type="button" onClick={() => setTurma(null)} className="min-h-11 rounded-md border border-line bg-white px-4 font-semibold text-navy">
                Cancelar
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-8" aria-labelledby="lista">
        <h2 id="lista" className="text-xl font-extrabold text-navy">Turmas em que estou inscrito(a)</h2>
        {turmas.isLoading ? (
          <p className="mt-3 text-base text-navy-2">A carregar…</p>
        ) : turmas.isError ? (
          <p role="alert" className="mt-3 text-base text-navy">Não foi possível ler as suas turmas.</p>
        ) : (turmas.data ?? []).length === 0 ? (
          <p className="mt-3 text-base text-navy-2">Ainda não está inscrito(a) em nenhuma turma.</p>
        ) : (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {turmas.data!.map((t) => (
              <li key={t.inscricaoId} className="rounded-lg border border-line bg-white p-5">
                <h3 className="text-lg font-extrabold text-navy">{t.cursoTitulo}</h3>
                <p className="text-base text-navy-2">{t.turmaDesignacao} · {t.distrito}, {t.provincia}</p>
                <p className="text-base text-navy-2">{data(t.dataInicio)} a {data(t.dataFim)} · {rotuloEstadoTurma(t.turmaEstado)}</p>
                {t.estado === "desistiu" ? (
                  <p className="mt-2 text-base text-navy">Inscrição anulada.</p>
                ) : t.cursoSlug ? (
                  <>
                    <Percurso inscricaoId={t.inscricaoId} />
                    <Link to="/cursos/$curso" params={{ curso: t.cursoSlug }} className="btn-brand btn-brand-hover mt-3 inline-flex min-h-11 items-center">
                      Continuar para as lições
                    </Link>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const PROXIMO: Record<PercursoMatricula["etapa"], string> = {
  licoes: "Próximo passo: concluir as lições do curso.",
  presencas: "Próximo passo: participar nas sessões da turma. A assiduidade é registada pelo formador.",
  avaliacao_indisponivel: "O exame final ainda não está disponível para este curso. Será avisado(a) pela equipa de formação.",
  avaliacao: "Próximo passo: realizar o exame final.",
  certificado_pronto: "Cumpre as condições. Pode pedir o certificado do curso.",
  certificado_emitido: "Certificado emitido.",
};

function pct(v: number | null) {
  return v === null ? "ainda sem sessões realizadas" : `${v.toLocaleString("pt-PT")} %`;
}

function Percurso({ inscricaoId }: { inscricaoId: string }) {
  const obter = useServerFn(percursoDaMatricula);
  const q = useQuery({
    queryKey: ["percurso", inscricaoId],
    queryFn: () => obter({ data: { inscricaoId } }),
    retry: false,
  });
  if (q.isLoading) return <p className="mt-3 text-base text-navy-2">A carregar o percurso…</p>;
  if (q.isError || !q.data)
    return <p role="alert" className="mt-3 text-base text-navy">Não foi possível ler o seu percurso nesta turma.</p>;
  const p = q.data;
  const licPct = p.licoesTotal > 0 ? Math.round((p.licoesConcluidas / p.licoesTotal) * 100) : 0;
  return (
    <div className="mt-4 rounded-md border border-line bg-page p-4">
      <h4 className="text-base font-extrabold text-navy">O meu percurso</h4>
      <dl className="mt-2 grid gap-2 text-base text-navy-2">
        <div>
          <dt className="font-semibold text-navy">Lições</dt>
          <dd>
            {p.licoesConcluidas} de {p.licoesTotal} concluídas ({licPct} %)
            <progress className="mt-1 block h-2 w-full" max={100} value={licPct} aria-label="Lições concluídas" />
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-navy">Presenças</dt>
          <dd>
            {p.presentes} presença(s) em {p.sessoesRealizadas} sessão(ões) realizada(s) de {p.sessoesTotal}
            {p.justificadas > 0 ? `, ${p.justificadas} justificada(s)` : ""}. Assiduidade: {pct(p.assiduidadePct)} (mínimo {p.assiduidadeMinimaPct} %).
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-navy">Exame final</dt>
          <dd>
            {p.avaliacaoDisponivel ? "Disponível" : "Ainda não disponível"}
            {p.tentativasFeitas > 0 ? ` · ${p.tentativasFeitas} de ${p.tentativasMax} tentativa(s)` : ""}
            {p.melhorNotaPct !== null ? ` · melhor nota ${p.melhorNotaPct} % (mínimo ${p.notaMinimaPct} %)` : ""}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-navy">Certificado</dt>
          <dd>{p.certificadoCodigo ? `Emitido — código ${p.certificadoCodigo}` : "Ainda não emitido"}</dd>
        </div>
      </dl>
      <p className="mt-3 text-base font-semibold text-navy">{PROXIMO[p.etapa]}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {p.etapa === "avaliacao" || p.etapa === "certificado_pronto" ? (
          <Link to="/avaliacao/exame" className="font-semibold underline">Ir para o exame e certificado</Link>
        ) : null}
        {p.certificadoCodigo ? (
          <Link to="/verificar" className="font-semibold underline">Ver certificado</Link>
        ) : null}
      </div>
    </div>
  );
}
