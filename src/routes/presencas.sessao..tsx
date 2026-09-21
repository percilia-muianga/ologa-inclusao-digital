
/**
 * Estado da sessão: agendada, realizada, cancelada ou adiada. Só as
 * realizadas entram no denominador da assiduidade. O estado nunca muda
 * sozinho — quem o muda é o formador, e cancelar ou adiar exige motivo
 * escrito, que fica no registo de auditoria.
 */
function EstadoDaSessao({
  estado,
  motivo,
  actualizadoEm,
  actualizadoPor,
  dataSessao,
  aoDefinir,
}: {
  estado: EstadoSessao;
  motivo: string | null;
  actualizadoEm: string | null;
  actualizadoPor: string | null;
  dataSessao: string;
  aoDefinir: (
    estado: EstadoSessao,
    motivo: string | null,
    porNome: string | null,
  ) => Promise<string | null>;
}) {
  const [escolhido, setEscolhido] = useState<EstadoSessao>(estado);
  const [texto, setTexto] = useState("");
  const [quem, setQuem] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState(false);

  const passou = new Date(`${dataSessao}T23:59:59`) < new Date();
  const porRegularizar = estado === "agendada" && passou;
  const exigeMotivo = escolhido === "cancelada" || escolhido === "adiada";

  return (
    <section aria-labelledby="estado-sessao" className="mt-6 rounded-lg border border-line bg-white p-4">
      <h2 id="estado-sessao" className="text-lg font-bold text-navy">
        Estado desta sessão
      </h2>
      <p className="mt-1 text-base text-navy">
        Estado actual: {rotuloEstadoSessao(estado)}.{" "}
        {estado === "realizada"
          ? "Entra no cálculo da assiduidade."
          : "Não entra no cálculo da assiduidade."}
        {motivo ? ` Motivo escrito: ${motivo}.` : ""}
        {actualizadoEm
          ? ` Marcado${actualizadoPor ? ` por ${actualizadoPor}` : ""} em ${new Date(actualizadoEm).toLocaleString("pt-PT")}.`
          : ""}
      </p>

      {porRegularizar ? (
        <p
          role="status"
          className="mt-3 rounded-md border border-[#C20400] bg-[#FFF4F4] p-3 text-base font-semibold text-[#C20400]"
        >
          Por regularizar: a data desta sessão já passou e ela continua agendada. Falta dizer se foi
          realizada, cancelada ou adiada. Enquanto isso não for feito, não entra no cálculo da
          assiduidade de nenhum formando.
        </p>
      ) : null}

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-navy-2">Passar o estado para</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {ESTADOS_SESSAO.map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={escolhido === valor}
              onClick={() => setEscolhido(valor)}
              className={botaoEstado(escolhido === valor)}
            >
              {rotulo}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-navy-2">
          {ESTADOS_SESSAO.find(([v]) => v === escolhido)?.[2]}
        </p>
      </fieldset>

      {exigeMotivo ? (
        <div className="mt-3">
          <label className="block text-sm font-semibold text-navy-2" htmlFor="motivo-estado">
            Motivo do cancelamento ou adiamento (obrigatório)
          </label>
          <textarea
            id="motivo-estado"
            rows={2}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="min-h-11 w-full rounded-md border border-line bg-white p-3 text-base text-navy"
          />
        </div>
      ) : null}

      <div className="mt-3">
        <label className="block text-sm font-semibold text-navy-2" htmlFor="quem-estado">
          Nome de quem marca o estado
        </label>
        <input
          id="quem-estado"
          type="text"
          value={quem}
          onChange={(e) => setQuem(e.target.value)}
          className="mt-1 min-h-11 w-full max-w-md rounded-md border border-line bg-white px-3 text-base text-navy"
        />
      </div>

      <div role="status" aria-live="polite" className="mt-2 text-base font-semibold text-navy">
        {erro ? <span className="text-[#C20400]">{erro}</span> : null}
        {feito ? "Estado da sessão actualizado e registado na auditoria." : null}
      </div>

      <button
        type="button"
        onClick={async () => {
          setErro(null);
          setFeito(false);
          const r = await aoDefinir(escolhido, texto || null, quem.trim() || null);
          if (r) setErro(r);
          else {
            setFeito(true);
            setTexto("");
          }
        }}
        className="mt-3 inline-flex min-h-11 items-center rounded-md bg-navy px-5 text-base font-semibold text-navy-foreground"
      >
        Gravar estado da sessão
      </button>
    </section>
  );
}
