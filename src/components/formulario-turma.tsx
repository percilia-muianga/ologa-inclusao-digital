import { useMemo, useState } from "react";
import { ESTADOS_TURMA, type DadosTurma } from "@/lib/turmas.functions";

export type ReferenciasTurma = {
  cursos: Array<{ id: string; titulo: string; carga_horaria: number; modalidade: string }>;
  locais: Array<{ provincia: string; local: string }>;
  distritos: Array<{ provincia: string; nomes: string[] }>;
};

const MODALIDADES: ReadonlyArray<readonly [string, string]> = [
  ["presencial", "Presencial"],
  ["virtual", "Virtual"],
  ["misto", "Misto"],
] as const;

export const campoClasse =
  "min-h-11 w-full rounded-md border border-line bg-white px-3 text-base text-navy";
export const rotuloClasse = "mb-1 block text-sm font-semibold text-navy";
export const botaoPrimario =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground";
export const botaoSecundario =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-base font-semibold text-navy hover:bg-page";

/**
 * Formulário partilhado pela criação e pela edição de turmas. O código de
 * inscrição não é editável: é gerado pela base de dados ao gravar.
 */
export function FormularioTurma({
  referencias,
  inicial,
  textoBotao,
  aGuardar,
  erro,
  onSubmeter,
  accaoSecundaria,
}: {
  referencias: ReferenciasTurma;
  inicial?: Partial<DadosTurma>;
  textoBotao: string;
  aGuardar: boolean;
  erro: string | null;
  onSubmeter: (dados: DadosTurma) => void;
  accaoSecundaria?: React.ReactNode;
}) {
  const provinciasDisponiveis = useMemo(
    () =>
      Array.from(
        new Set([
          ...referencias.locais.map((l) => l.provincia),
          ...referencias.distritos.map((d) => d.provincia),
        ]),
      ),
    [referencias],
  );

  const [cursoId, setCursoId] = useState(inicial?.cursoId ?? referencias.cursos[0]?.id ?? "");
  const [designacao, setDesignacao] = useState(inicial?.designacao ?? "");
  const [provincia, setProvincia] = useState(inicial?.provincia ?? provinciasDisponiveis[0] ?? "");
  const [distrito, setDistrito] = useState(inicial?.distrito ?? "");
  const [localFormacao, setLocalFormacao] = useState(inicial?.localFormacao ?? "");
  const [modalidade, setModalidade] = useState(inicial?.modalidade ?? "presencial");
  const [formadorPrincipal, setFormadorPrincipal] = useState(inicial?.formadorPrincipal ?? "");
  const [auxiliares, setAuxiliares] = useState((inicial?.formadoresAuxiliares ?? []).join(", "));
  const [dataInicio, setDataInicio] = useState(inicial?.dataInicio ?? "");
  const [dataFim, setDataFim] = useState(inicial?.dataFim ?? "");
  const [computadores, setComputadores] = useState(
    inicial?.numComputadores != null ? String(inicial.numComputadores) : "",
  );
  const [estado, setEstado] = useState(inicial?.estado ?? "planeada");
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const distritosDaProvincia = useMemo(() => {
    const exacto = referencias.distritos.find((d) => d.provincia === provincia)?.nomes;
    if (exacto) return exacto;
    if (provincia.startsWith("Maputo")) {
      return referencias.distritos.find((d) => d.provincia.startsWith("Maputo"))?.nomes ?? [];
    }
    return [];
  }, [referencias, provincia]);

  const localSugerido = referencias.locais.find((l) => l.provincia === provincia)?.local ?? "";
  const curso = referencias.cursos.find((c) => c.id === cursoId);

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErroLocal(null);
    if (!cursoId) {
      setErroLocal("Escolha o curso da turma.");
      return;
    }
    if (designacao.trim().length < 3) {
      setErroLocal("Indique a designação da turma, com pelo menos três caracteres.");
      return;
    }
    if (!provincia || !distrito) {
      setErroLocal(
        "A província e o distrito do local de formação são obrigatórios: é por eles que o Painel Nacional reporta.",
      );
      return;
    }
    if (dataInicio && dataFim && dataFim < dataInicio) {
      setErroLocal("A data de fim não pode ser anterior à data de início.");
      return;
    }
    onSubmeter({
      cursoId,
      designacao,
      provincia,
      distrito,
      localFormacao: localFormacao.trim() || null,
      modalidade,
      formadorPrincipal: formadorPrincipal.trim() || null,
      formadoresAuxiliares: auxiliares
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0),
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
      numComputadores: computadores.trim() === "" ? null : Number(computadores),
      estado,
    });
  }

  const mensagem = erroLocal ?? erro;

  return (
    <form onSubmit={submeter} className="rounded-lg border border-line bg-white p-5">
      {mensagem ? (
        <p
          role="alert"
          className="mb-5 rounded-md border border-amber-300 bg-amber-50 p-4 text-base text-navy"
        >
          {mensagem}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="t-curso" className={rotuloClasse}>
            Curso
          </label>
          <select
            id="t-curso"
            className={campoClasse}
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            required
          >
            {referencias.cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo} — {c.carga_horaria} horas
              </option>
            ))}
          </select>
          {curso ? (
            <p className="mt-1 text-sm text-navy-2">
              Carga horária do curso: {curso.carga_horaria} horas. O cronograma de sessões terá de
              somar exactamente estas horas.
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="t-designacao" className={rotuloClasse}>
            Designação da turma
          </label>
          <input
            id="t-designacao"
            className={campoClasse}
            value={designacao}
            onChange={(e) => setDesignacao(e.target.value)}
            maxLength={120}
            required
          />
        </div>

        <div>
          <label htmlFor="t-provincia" className={rotuloClasse}>
            Província do local de formação
          </label>
          <select
            id="t-provincia"
            className={campoClasse}
            value={provincia}
            onChange={(e) => {
              setProvincia(e.target.value);
              setDistrito("");
            }}
            required
          >
            {provinciasDisponiveis.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="t-distrito" className={rotuloClasse}>
            Distrito do local de formação
          </label>
          <input
            id="t-distrito"
            list="lista-distritos"
            className={campoClasse}
            value={distrito}
            onChange={(e) => setDistrito(e.target.value)}
            required
          />
          <datalist id="lista-distritos">
            {distritosDaProvincia.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          <p className="mt-1 text-sm text-navy-2">
            Pode escolher um dos distritos da província ou escrever a capital provincial.
          </p>
        </div>

        <div>
          <label htmlFor="t-local" className={rotuloClasse}>
            Local de formação
          </label>
          <input
            id="t-local"
            className={campoClasse}
            value={localFormacao}
            onChange={(e) => setLocalFormacao(e.target.value)}
            placeholder={localSugerido}
            maxLength={160}
          />
        </div>

        <div>
          <label htmlFor="t-modalidade" className={rotuloClasse}>
            Modalidade
          </label>
          <select
            id="t-modalidade"
            className={campoClasse}
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
          >
            {MODALIDADES.map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="t-formador" className={rotuloClasse}>
            Formador principal
          </label>
          <input
            id="t-formador"
            className={campoClasse}
            value={formadorPrincipal}
            onChange={(e) => setFormadorPrincipal(e.target.value)}
            maxLength={120}
          />
        </div>

        <div>
          <label htmlFor="t-auxiliares" className={rotuloClasse}>
            Formadores auxiliares
          </label>
          <input
            id="t-auxiliares"
            className={campoClasse}
            value={auxiliares}
            onChange={(e) => setAuxiliares(e.target.value)}
            maxLength={300}
          />
          <p className="mt-1 text-sm text-navy-2">Separe os nomes por vírgulas.</p>
        </div>

        <div>
          <label htmlFor="t-inicio" className={rotuloClasse}>
            Data de início
          </label>
          <input
            id="t-inicio"
            type="date"
            className={campoClasse}
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="t-fim" className={rotuloClasse}>
            Data de fim
          </label>
          <input
            id="t-fim"
            type="date"
            className={campoClasse}
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="t-computadores" className={rotuloClasse}>
            Computadores disponíveis na sala
          </label>
          <input
            id="t-computadores"
            type="number"
            min={0}
            max={200}
            inputMode="numeric"
            className={campoClasse}
            value={computadores}
            onChange={(e) => setComputadores(e.target.value)}
          />
          <p className="mt-1 text-sm text-navy-2">
            O Termo de Referência admite no máximo dois formandos por computador.
          </p>
        </div>

        <div>
          <label htmlFor="t-estado" className={rotuloClasse}>
            Estado
          </label>
          <select
            id="t-estado"
            className={campoClasse}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            {ESTADOS_TURMA.map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-5 rounded-md border border-line bg-page p-4 text-base text-navy-2">
        A turma fica limitada a trinta formandos, conforme o Termo de Referência. O código de
        inscrição é gerado automaticamente ao gravar, em dois grupos de quatro caracteres sem
        letras nem números ambíguos.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" className={botaoPrimario} disabled={aGuardar}>
          {aGuardar ? "A gravar…" : textoBotao}
        </button>
        {accaoSecundaria}
      </div>
    </form>
  );
}
