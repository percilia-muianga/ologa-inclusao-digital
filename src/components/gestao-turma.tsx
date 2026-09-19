import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  actualizarSessao,
  criarSessao,
  inscreverFormando,
  removerSessao,
  type DadosSessao,
} from "@/lib/turmas.functions";
import { campoClasse, rotuloClasse, botaoPrimario, botaoSecundario } from "@/components/formulario-turma";

export type Sessao = {
  id: string;
  ordem: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tema: string;
  formador_nome: string | null;
  modalidade: string;
};

function minutosDe(inicio: string, fim: string) {
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fim.split(":").map(Number);
  return hf * 60 + mf - (hi * 60 + mi);
}

function formatarDuracao(minutos: number) {
  const sinal = minutos < 0 ? "-" : "";
  const abs = Math.abs(minutos);
  return `${sinal}${Math.floor(abs / 60)}h${String(abs % 60).padStart(2, "0")}`;
}

function formatarData(valor: string) {
  return new Date(`${valor}T00:00:00`).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const MODALIDADES_SESSAO: ReadonlyArray<readonly [string, string]> = [
  ["presencial", "Presencial"],
  ["virtual", "Virtual"],
  ["misto", "Misto"],
] as const;

type Formulario = DadosSessao;

const VAZIO: Formulario = {
  data: "",
  horaInicio: "08:00",
  horaFim: "12:00",
  tema: "",
  formadorNome: null,
  modalidade: "presencial",
};

/**
 * Cronograma editável: criar, alterar e remover sessões. O aviso de horas
 * actualiza-se em tempo real, incluindo a sessão que está a ser escrita.
 */
export function GestaoSessoes({
  turmaId,
  sessoes,
  cargaHorariaCurso,
}: {
  turmaId: string;
  sessoes: Sessao[];
  cargaHorariaCurso: number;
}) {
  const router = useRouter();
  const criar = useServerFn(criarSessao);
  const actualizar = useServerFn(actualizarSessao);
  const remover = useServerFn(removerSessao);

  const [emEdicao, setEmEdicao] = useState<string | null>(null);
  const [form, setForm] = useState<Formulario>(VAZIO);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const minutosGravados = useMemo(
    () => sessoes.reduce((soma, s) => soma + minutosDe(s.hora_inicio, s.hora_fim), 0),
    [sessoes],
  );

  const minutosEmEdicao = useMemo(() => {
    if (!form.horaInicio || !form.horaFim) return 0;
    const m = minutosDe(form.horaInicio, form.horaFim);
    if (Number.isNaN(m) || m <= 0) return 0;
    if (emEdicao) {
      const original = sessoes.find((s) => s.id === emEdicao);
      return m - (original ? minutosDe(original.hora_inicio, original.hora_fim) : 0);
    }
    return m;
  }, [form, emEdicao, sessoes]);

  const minutosPrevistos = minutosGravados + minutosEmEdicao;
  const minutosCurso = cargaHorariaCurso * 60;
  const diferenca = minutosPrevistos - minutosCurso;
  const horas = (m: number) => Math.round((m / 60) * 100) / 100;

  function alterar<K extends keyof Formulario>(chave: K, valor: Formulario[K]) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    if (!form.data) {
      setErro("Indique a data da sessão.");
      return;
    }
    if (form.tema.trim().length < 3) {
      setErro("Indique o tema da sessão.");
      return;
    }
    if (minutosDe(form.horaInicio, form.horaFim) <= 0) {
      setErro("A hora de fim tem de ser posterior à hora de início.");
      return;
    }
    setAGuardar(true);
    try {
      if (emEdicao) {
        await actualizar({ data: { ...form, id: emEdicao } });
        setAviso("Sessão alterada.");
      } else {
        await criar({ data: { ...form, turmaId } });
        setAviso("Sessão acrescentada ao cronograma.");
      }
      setForm(VAZIO);
      setEmEdicao(null);
      await router.invalidate();
    } catch {
      setErro("Não foi possível gravar a sessão. Tente novamente.");
    } finally {
      setAGuardar(false);
    }
  }

  async function apagar(id: string, ordem: number) {
    if (!window.confirm(`Remover a sessão ${ordem} do cronograma?`)) return;
    setErro(null);
    try {
      await remover({ data: { id } });
      if (emEdicao === id) {
        setEmEdicao(null);
        setForm(VAZIO);
      }
      setAviso("Sessão removida do cronograma.");
      await router.invalidate();
    } catch {
      setErro("Não foi possível remover a sessão. Tente novamente.");
    }
  }

  function editar(s: Sessao) {
    setEmEdicao(s.id);
    setErro(null);
    setAviso(null);
    setForm({
      data: s.data,
      horaInicio: s.hora_inicio.slice(0, 5),
      horaFim: s.hora_fim.slice(0, 5),
      tema: s.tema,
      formadorNome: s.formador_nome,
      modalidade: s.modalidade,
    });
  }

  return (
    <section aria-labelledby="cronograma" className="mt-10">
      <h2 id="cronograma" className="text-xl font-bold text-navy">
        Cronograma de sessões
      </h2>

      {cargaHorariaCurso > 0 ? (
        <p
          role="status"
          className={
            diferenca === 0
              ? "mt-3 rounded-md border border-line bg-page p-4 text-base text-navy"
              : "mt-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-base text-navy"
          }
        >
          {diferenca === 0 ? (
            <>
              <strong>Carga horária conferida.</strong> As sessões somam {horas(minutosPrevistos)}{" "}
              horas, exactamente a carga horária do curso.
            </>
          ) : diferenca < 0 ? (
            <>
              <strong>Faltam horas por agendar.</strong> As sessões somam{" "}
              {horas(minutosPrevistos)} horas e o curso exige {cargaHorariaCurso} horas: faltam{" "}
              {horas(-diferenca)} horas.
            </>
          ) : (
            <>
              <strong>As sessões excedem a carga horária.</strong> As sessões somam{" "}
              {horas(minutosPrevistos)} horas e o curso exige {cargaHorariaCurso} horas: excedem em{" "}
              {horas(diferenca)} horas.
            </>
          )}
          {minutosEmEdicao !== 0 ? (
            <span className="block text-sm text-navy-2">
              Já conta a sessão que está a preencher, com {formatarDuracao(minutosEmEdicao)}.
            </span>
          ) : null}
        </p>
      ) : null}

      {sessoes.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-line bg-page px-5 py-6 text-base text-navy-2">
          Ainda não há sessões agendadas nesta turma. Use o formulário abaixo para acrescentar a
          primeira sessão, com data, horas, tema e formador.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border border-line">
          <table className="min-w-full border-collapse text-left text-sm">
            <caption className="sr-only">Sessões da turma, por ordem cronológica</caption>
            <thead className="bg-page text-navy">
              <tr>
                {["#", "Data", "Início", "Fim", "Duração", "Tema", "Formador", "Acções"].map(
                  (h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-3 py-2 text-xs font-bold uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {sessoes.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-navy">
                    {s.ordem}
                  </th>
                  <td className="px-3 py-2 text-navy-2">{formatarData(s.data)}</td>
                  <td className="px-3 py-2 text-navy-2">{s.hora_inicio.slice(0, 5)}</td>
                  <td className="px-3 py-2 text-navy-2">{s.hora_fim.slice(0, 5)}</td>
                  <td className="px-3 py-2 text-navy-2">
                    {formatarDuracao(minutosDe(s.hora_inicio, s.hora_fim))}
                  </td>
                  <td className="px-3 py-2 text-navy-2">{s.tema}</td>
                  <td className="px-3 py-2 text-navy-2">{s.formador_nome ?? "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editar(s)}
                        className="inline-flex min-h-11 items-center rounded-md border border-line px-3 text-sm font-semibold text-navy hover:bg-page"
                      >
                        Editar
                        <span className="sr-only"> a sessão {s.ordem}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => apagar(s.id, s.ordem)}
                        className="inline-flex min-h-11 items-center rounded-md border border-line px-3 text-sm font-semibold text-brand-dark hover:bg-page"
                      >
                        Remover
                        <span className="sr-only"> a sessão {s.ordem}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={submeter} className="mt-6 rounded-lg border border-line bg-white p-5">
        <h3 className="text-lg font-bold text-navy">
          {emEdicao ? "Alterar sessão" : "Acrescentar sessão"}
        </h3>
        {erro ? (
          <p
            role="alert"
            className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-base text-navy"
          >
            {erro}
          </p>
        ) : null}
        {aviso ? (
          <p role="status" className="mt-3 rounded-md border border-line bg-page p-4 text-base text-navy">
            {aviso}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label htmlFor="s-data" className={rotuloClasse}>
              Data
            </label>
            <input
              id="s-data"
              type="date"
              className={campoClasse}
              value={form.data}
              onChange={(e) => alterar("data", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="s-inicio" className={rotuloClasse}>
              Hora de início
            </label>
            <input
              id="s-inicio"
              type="time"
              className={campoClasse}
              value={form.horaInicio}
              onChange={(e) => alterar("horaInicio", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="s-fim" className={rotuloClasse}>
              Hora de fim
            </label>
            <input
              id="s-fim"
              type="time"
              className={campoClasse}
              value={form.horaFim}
              onChange={(e) => alterar("horaFim", e.target.value)}
              required
            />
            <p className="mt-1 text-sm text-navy-2">
              Duração desta sessão: {formatarDuracao(minutosDe(form.horaInicio, form.horaFim) || 0)}
              .
            </p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="s-tema" className={rotuloClasse}>
              Tema
            </label>
            <input
              id="s-tema"
              className={campoClasse}
              value={form.tema}
              onChange={(e) => alterar("tema", e.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div>
            <label htmlFor="s-formador" className={rotuloClasse}>
              Formador
            </label>
            <input
              id="s-formador"
              className={campoClasse}
              value={form.formadorNome ?? ""}
              onChange={(e) => alterar("formadorNome", e.target.value || null)}
              maxLength={120}
            />
          </div>
          <div>
            <label htmlFor="s-modalidade" className={rotuloClasse}>
              Modalidade
            </label>
            <select
              id="s-modalidade"
              className={campoClasse}
              value={form.modalidade}
              onChange={(e) => alterar("modalidade", e.target.value)}
            >
              {MODALIDADES_SESSAO.map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" className={botaoPrimario} disabled={aGuardar}>
            {aGuardar ? "A gravar…" : emEdicao ? "Gravar alterações" : "Acrescentar sessão"}
          </button>
          {emEdicao ? (
            <button
              type="button"
              className={botaoSecundario}
              onClick={() => {
                setEmEdicao(null);
                setForm(VAZIO);
              }}
            >
              Cancelar alteração
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

/** Inscrição de formandos, com bloqueio ao atingir o limite da turma. */
export function InscricaoFormandos({
  turmaId,
  inscritos,
  limite,
}: {
  turmaId: string;
  inscritos: number;
  limite: number;
}) {
  const router = useRouter();
  const inscrever = useServerFn(inscreverFormando);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aGuardar, setAGuardar] = useState(false);

  const cheia = inscritos >= limite;

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    if (nome.trim().length < 3) {
      setErro("Indique o nome completo do formando.");
      return;
    }
    setAGuardar(true);
    try {
      const r = await inscrever({ data: { turmaId, nome, email: email.trim() || null } });
      if (!r.ok) {
        setErro(r.motivo);
      } else {
        setAviso(`Formando inscrito. A turma tem agora ${r.inscritos} de ${limite} formandos.`);
        setNome("");
        setEmail("");
        await router.invalidate();
      }
    } catch {
      setErro("Não foi possível inscrever o formando. Tente novamente.");
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <section aria-labelledby="inscricoes" className="mt-10 rounded-lg border border-line bg-white p-5">
      <h2 id="inscricoes" className="text-xl font-bold text-navy">
        Inscrever formando
      </h2>

      {cheia ? (
        <p
          role="status"
          className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-base text-navy"
        >
          <strong>Turma cheia.</strong> A turma atingiu o limite de {limite} formandos e não aceita
          mais inscrições. Crie uma nova turma para os formandos em espera.
        </p>
      ) : (
        <p className="mt-2 text-base text-navy-2">
          A turma tem {inscritos} de {limite} formandos. Restam {limite - inscritos} lugares.
        </p>
      )}

      {erro ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-base text-navy"
        >
          {erro}
        </p>
      ) : null}
      {aviso ? (
        <p role="status" className="mt-3 rounded-md border border-line bg-page p-4 text-base text-navy">
          {aviso}
        </p>
      ) : null}

      <form onSubmit={submeter} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="i-nome" className={rotuloClasse}>
            Nome do formando
          </label>
          <input
            id="i-nome"
            className={campoClasse}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={120}
            disabled={cheia}
          />
        </div>
        <div>
          <label htmlFor="i-email" className={rotuloClasse}>
            Email (opcional)
          </label>
          <input
            id="i-email"
            type="email"
            className={campoClasse}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={160}
            disabled={cheia}
          />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" className={botaoPrimario} disabled={cheia || aGuardar}>
            {aGuardar ? "A inscrever…" : "Inscrever formando"}
          </button>
        </div>
      </form>
    </section>
  );
}
