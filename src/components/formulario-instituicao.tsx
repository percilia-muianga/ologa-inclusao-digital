import { useEffect, useId, useMemo, useState } from "react";
import {
  APOIOS_OPCOES,
  CONECTIVIDADE_OPCOES,
  CONSENTIMENTO_TEXTO,
  MEIO_OPCOES,
  MODALIDADE_OPCOES,
  NATUREZA_OPCOES,
  NIVEL_LITERACIA_OPCOES,
  PERCURSO_OPCOES,
  PROVINCIAS,
  SALA_OPCOES,
  SETOR_OPCOES,
} from "@/lib/inscricao-schema";

export type Modulo = { id: string; titulo: string; ordem: number | null; nivel: string | null };

export type ValoresFormulario = {
  nome: string;
  natureza: string;
  setor: string;
  setor_outro: string;
  ponto_focal_nome: string;
  ponto_focal_email: string;
  provincia: string;
  distrito: string;
  meio: string;
  modalidade: string;
  conectividade: string;
  num_computadores: string;
  num_colaboradores_total: string;
  nivel_literacia: string;
  num_mulheres: string;
  num_homens: string;
  num_pcd: string;
  apoios_acessibilidade: string[];
  modulos_interesse: string[];
  percurso: string;
  prazo: string;
  sala_disponivel: string;
  observacoes: string;
  consentimento: boolean;
};

export const VALORES_INICIAIS: ValoresFormulario = {
  nome: "",
  natureza: "",
  setor: "",
  setor_outro: "",
  ponto_focal_nome: "",
  ponto_focal_email: "",
  provincia: "",
  distrito: "",
  meio: "",
  modalidade: "",
  conectividade: "",
  num_computadores: "",
  num_colaboradores_total: "",
  nivel_literacia: "",
  num_mulheres: "",
  num_homens: "",
  num_pcd: "",
  apoios_acessibilidade: [],
  modulos_interesse: [],
  percurso: "",
  prazo: "",
  sala_disponivel: "",
  observacoes: "",
  consentimento: false,
};

function numOuNulo(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export type PayloadInstituicao = {
  nome: string;
  natureza: string;
  setor: string;
  setor_outro: string | null;
  ponto_focal_nome: string | null;
  ponto_focal_email: string | null;
  provincia: string | null;
  distrito: string | null;
  meio: string | null;
  modalidade: string | null;
  conectividade: string | null;
  num_computadores: number | null;
  num_colaboradores_total: number;
  nivel_literacia: string | null;
  num_mulheres: number | null;
  num_homens: number | null;
  num_pcd: number | null;
  apoios_acessibilidade: string[] | null;
  modulos_interesse: string[] | null;
  percurso: string | null;
  prazo: string | null;
  sala_disponivel: string | null;
  observacoes: string | null;
};

export function valoresParaPayload(v: ValoresFormulario): PayloadInstituicao {
  return {
    nome: v.nome.trim(),
    natureza: v.natureza,
    setor: v.setor,
    setor_outro: v.setor === "outro" ? v.setor_outro.trim() || null : null,
    ponto_focal_nome: v.ponto_focal_nome.trim() || null,
    ponto_focal_email: v.ponto_focal_email.trim() || null,
    provincia: v.provincia || null,
    distrito: v.distrito.trim() || null,
    meio: v.meio || null,
    modalidade: v.modalidade || null,
    conectividade: v.conectividade || null,
    num_computadores: numOuNulo(v.num_computadores),
    num_colaboradores_total: Number(v.num_colaboradores_total),
    nivel_literacia: v.nivel_literacia || null,
    num_mulheres: numOuNulo(v.num_mulheres),
    num_homens: numOuNulo(v.num_homens),
    num_pcd: numOuNulo(v.num_pcd),
    apoios_acessibilidade:
      v.apoios_acessibilidade.length > 0 ? v.apoios_acessibilidade : null,
    modulos_interesse:
      v.modulos_interesse.length > 0 ? v.modulos_interesse : null,
    percurso: v.percurso || null,
    prazo: v.prazo || null,
    sala_disponivel: v.sala_disponivel || null,
    observacoes: v.observacoes.trim() || null,
  };
}

type Props = {
  modo: "publico" | "admin";
  modulos: Modulo[];
  modulosCarregados: boolean;
  valoresIniciais?: Partial<ValoresFormulario>;
  aSubmeter: boolean;
  onSubmit: (payload: PayloadInstituicao, valores: ValoresFormulario) => Promise<void> | void;
  textoBotao: string;
  mensagemErro?: string | null;
};

export function FormularioInstituicao({
  modo,
  modulos,
  modulosCarregados,
  valoresIniciais,
  aSubmeter,
  onSubmit,
  textoBotao,
  mensagemErro,
}: Props) {
  const [v, setV] = useState<ValoresFormulario>({
    ...VALORES_INICIAIS,
    ...valoresIniciais,
  });
  const [erros, setErros] = useState<Record<string, string>>({});
  const idsCampos = useIdsCampos();

  useEffect(() => {
    setV((prev) => ({ ...prev, ...(valoresIniciais ?? {}) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCampo = <K extends keyof ValoresFormulario>(k: K, val: ValoresFormulario[K]) => {
    setV((prev) => ({ ...prev, [k]: val }));
  };

  const toggleLista = (k: "apoios_acessibilidade" | "modulos_interesse", val: string) => {
    setV((prev) => {
      const lista = prev[k];
      const existe = lista.includes(val);
      return { ...prev, [k]: existe ? lista.filter((x) => x !== val) : [...lista, val] };
    });
  };

  const validar = (): boolean => {
    const e: Record<string, string> = {};
    if (!v.nome.trim()) e.nome = "Indique o nome da instituição.";
    if (!v.natureza) e.natureza = "Escolha a natureza.";
    if (!v.setor) e.setor = "Escolha o setor.";
    if (v.setor === "outro" && !v.setor_outro.trim())
      e.setor_outro = "Especifique o setor.";
    if (v.ponto_focal_email.trim()) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.ponto_focal_email.trim());
      if (!emailOk) e.ponto_focal_email = "Email inválido.";
    }
    const totalStr = v.num_colaboradores_total.trim();
    if (!totalStr) e.num_colaboradores_total = "Indique o número total.";
    else {
      const n = Number(totalStr);
      if (!Number.isInteger(n) || n < 1)
        e.num_colaboradores_total = "Deve ser um número inteiro maior ou igual a 1.";
    }
    for (const [chave, rotulo] of [
      ["num_computadores", "número de computadores"],
      ["num_mulheres", "número de mulheres"],
      ["num_homens", "número de homens"],
      ["num_pcd", "número de pessoas com deficiência"],
    ] as const) {
      const val = v[chave];
      if (val.trim()) {
        const n = Number(val);
        if (!Number.isInteger(n) || n < 0)
          e[chave] = `Indique um número inteiro válido para ${rotulo}.`;
      }
    }
    if (modo === "publico" && !v.consentimento)
      e.consentimento = "Precisamos do seu consentimento para prosseguir.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  async function submeter(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validar()) return;
    const payload = valoresParaPayload(v);
    await onSubmit(payload, v);
  }

  const modulosOrdenados = useMemo(
    () => [...modulos].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [modulos],
  );

  return (
    <form onSubmit={submeter} noValidate className="space-y-10">
      {/* 1. Identificação */}
      <section aria-labelledby={idsCampos.secIdent} className="space-y-5">
        <h2 id={idsCampos.secIdent} className="text-xl font-bold text-ink">
          1. Identificação
        </h2>

        <CampoTexto
          id={idsCampos.nome}
          label="Nome da instituição"
          obrigatorio
          value={v.nome}
          onChange={(x) => setCampo("nome", x)}
          erro={erros.nome}
          autoComplete="organization"
        />

        <CampoSelecao
          id={idsCampos.natureza}
          label="Natureza"
          obrigatorio
          value={v.natureza}
          onChange={(x) => setCampo("natureza", x)}
          opcoes={NATUREZA_OPCOES}
          erro={erros.natureza}
        />

        <CampoSelecao
          id={idsCampos.setor}
          label="Setor"
          obrigatorio
          value={v.setor}
          onChange={(x) => setCampo("setor", x)}
          opcoes={SETOR_OPCOES}
          erro={erros.setor}
        />
        {v.setor === "outro" && (
          <CampoTexto
            id={idsCampos.setorOutro}
            label="Especifique o setor"
            obrigatorio
            value={v.setor_outro}
            onChange={(x) => setCampo("setor_outro", x)}
            erro={erros.setor_outro}
          />
        )}

        <fieldset className="space-y-4">
          <legend className="text-base font-semibold text-ink">Ponto focal</legend>
          <CampoTexto
            id={idsCampos.pfNome}
            label="Nome do ponto focal"
            value={v.ponto_focal_nome}
            onChange={(x) => setCampo("ponto_focal_nome", x)}
            autoComplete="name"
          />
          <CampoTexto
            id={idsCampos.pfEmail}
            label="Email do ponto focal"
            type="email"
            value={v.ponto_focal_email}
            onChange={(x) => setCampo("ponto_focal_email", x)}
            erro={erros.ponto_focal_email}
            autoComplete="email"
          />
        </fieldset>
      </section>

      {/* 2. Localização */}
      <section aria-labelledby={idsCampos.secLoc} className="space-y-5">
        <h2 id={idsCampos.secLoc} className="text-xl font-bold text-ink">
          2. Localização
        </h2>

        <CampoSelecao
          id={idsCampos.provincia}
          label="Província"
          value={v.provincia}
          onChange={(x) => setCampo("provincia", x)}
          opcoes={PROVINCIAS.map((p) => [p, p] as const)}
        />

        <CampoTexto
          id={idsCampos.distrito}
          label="Distrito"
          value={v.distrito}
          onChange={(x) => setCampo("distrito", x)}
        />

        <CampoSelecao
          id={idsCampos.meio}
          label="Meio"
          value={v.meio}
          onChange={(x) => setCampo("meio", x)}
          opcoes={MEIO_OPCOES}
        />

        <CampoSelecao
          id={idsCampos.modalidade}
          label="Modalidade pretendida"
          value={v.modalidade}
          onChange={(x) => setCampo("modalidade", x)}
          opcoes={MODALIDADE_OPCOES}
        />

        <CampoSelecao
          id={idsCampos.conectividade}
          label="Conectividade no local"
          value={v.conectividade}
          onChange={(x) => setCampo("conectividade", x)}
          opcoes={CONECTIVIDADE_OPCOES}
        />

        <CampoNumero
          id={idsCampos.nComp}
          label="Número de computadores disponíveis"
          value={v.num_computadores}
          onChange={(x) => setCampo("num_computadores", x)}
          erro={erros.num_computadores}
          min={0}
        />
      </section>

      {/* 3. Colaboradores */}
      <section aria-labelledby={idsCampos.secColab} className="space-y-5">
        <h2 id={idsCampos.secColab} className="text-xl font-bold text-ink">
          3. Colaboradores a formar
        </h2>

        <CampoNumero
          id={idsCampos.nTotal}
          label="Número total"
          obrigatorio
          value={v.num_colaboradores_total}
          onChange={(x) => setCampo("num_colaboradores_total", x)}
          erro={erros.num_colaboradores_total}
          min={1}
        />

        <CampoSelecao
          id={idsCampos.nivelLit}
          label="Nível de literacia digital predominante dos colaboradores"
          value={v.nivel_literacia}
          onChange={(x) => setCampo("nivel_literacia", x)}
          opcoes={NIVEL_LITERACIA_OPCOES}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <CampoNumero
            id={idsCampos.nMul}
            label="Número de mulheres"
            value={v.num_mulheres}
            onChange={(x) => setCampo("num_mulheres", x)}
            erro={erros.num_mulheres}
            min={0}
          />
          <CampoNumero
            id={idsCampos.nHom}
            label="Número de homens"
            value={v.num_homens}
            onChange={(x) => setCampo("num_homens", x)}
            erro={erros.num_homens}
            min={0}
          />
          <CampoNumero
            id={idsCampos.nPcd}
            label="Número de pessoas com deficiência"
            value={v.num_pcd}
            onChange={(x) => setCampo("num_pcd", x)}
            erro={erros.num_pcd}
            min={0}
          />
        </div>
      </section>

      {/* 4. Apoios de acessibilidade */}
      <section aria-labelledby={idsCampos.secApoios} className="space-y-4">
        <h2 id={idsCampos.secApoios} className="text-xl font-bold text-ink">
          4. Apoios de acessibilidade necessários
        </h2>
        <p className="text-base text-foreground">
          Serve para garantir a provisão (intérprete, sala acessível). A formação é a mesma
          para todos — não criamos versões separadas.
        </p>
        <fieldset className="space-y-2">
          <legend className="sr-only">Apoios de acessibilidade</legend>
          {APOIOS_OPCOES.map(([valor, rotulo]) => (
            <label key={valor} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={v.apoios_acessibilidade.includes(valor)}
                onChange={() => toggleLista("apoios_acessibilidade", valor)}
                className="mt-1 h-5 w-5 rounded border-ink/30"
              />
              <span className="text-base text-ink">{rotulo}</span>
            </label>
          ))}
        </fieldset>
      </section>

      {/* 5. Módulos e percurso */}
      <section aria-labelledby={idsCampos.secModulos} className="space-y-5">
        <h2 id={idsCampos.secModulos} className="text-xl font-bold text-ink">
          5. Módulos de interesse e percurso pretendido
        </h2>

        <div>
          <p className="block text-base font-semibold text-ink">Módulos de interesse</p>
          {!modulosCarregados ? (
            <p className="mt-2 text-base text-foreground">A carregar…</p>
          ) : modulosOrdenados.length === 0 ? (
            <p className="mt-2 text-base text-foreground">
              Os módulos ainda não estão carregados.
            </p>
          ) : (
            <fieldset className="mt-2 space-y-2">
              <legend className="sr-only">Módulos de interesse</legend>
              {modulosOrdenados.map((m) => (
                <label key={m.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={v.modulos_interesse.includes(m.id)}
                    onChange={() => toggleLista("modulos_interesse", m.id)}
                    className="mt-1 h-5 w-5 rounded border-ink/30"
                  />
                  <span className="text-base text-ink">{m.titulo}</span>
                </label>
              ))}
            </fieldset>
          )}
        </div>

        <CampoSelecao
          id={idsCampos.percurso}
          label="Percurso pretendido"
          value={v.percurso}
          onChange={(x) => setCampo("percurso", x)}
          opcoes={PERCURSO_OPCOES}
        />
      </section>

      {/* 6. Logística */}
      <section aria-labelledby={idsCampos.secLog} className="space-y-5">
        <h2 id={idsCampos.secLog} className="text-xl font-bold text-ink">
          6. Logística
        </h2>

        <CampoSelecao
          id={idsCampos.prazo}
          label="Prazo pretendido"
          value={v.prazo}
          onChange={(x) => setCampo("prazo", x)}
          opcoes={PRAZO_OPCOES}
        />

        <CampoSelecao
          id={idsCampos.sala}
          label="Sala disponível"
          value={v.sala_disponivel}
          onChange={(x) => setCampo("sala_disponivel", x)}
          opcoes={SALA_OPCOES}
        />

        <div>
          <label htmlFor={idsCampos.obs} className="block text-base font-semibold text-ink">
            Observações
          </label>
          <textarea
            id={idsCampos.obs}
            value={v.observacoes}
            onChange={(e) => setCampo("observacoes", e.target.value)}
            rows={5}
            className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
      </section>

      {/* 7. Consentimento (só no formulário público) */}
      {modo === "publico" && (
        <section aria-labelledby={idsCampos.secCons} className="space-y-3">
          <h2 id={idsCampos.secCons} className="text-xl font-bold text-ink">
            7. Consentimento
          </h2>
          <p className="text-base text-ink">{CONSENTIMENTO_TEXTO}</p>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={v.consentimento}
              onChange={(e) => setCampo("consentimento", e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-ink/30"
              aria-describedby={erros.consentimento ? `${idsCampos.secCons}-err` : undefined}
            />
            <span className="text-base font-semibold text-ink">
              Confirmo que li e autorizo o tratamento dos dados nos termos acima.
            </span>
          </label>
          {erros.consentimento && (
            <p id={`${idsCampos.secCons}-err`} role="alert" className="text-base text-ink">
              {erros.consentimento}
            </p>
          )}
        </section>
      )}

      {mensagemErro && (
        <p role="alert" className="rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
          {mensagemErro}
        </p>
      )}

      <button
        type="submit"
        disabled={aSubmeter}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-ink px-6 py-3 text-base font-semibold text-ink-foreground disabled:opacity-70 sm:w-auto"
      >
        {aSubmeter ? "A submeter…" : textoBotao}
      </button>
    </form>
  );
}

// ---- Campos reutilizáveis ----

function CampoTexto(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  obrigatorio?: boolean;
  type?: string;
  autoComplete?: string;
  erro?: string;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-base font-semibold text-ink">
        {props.label}
        {props.obrigatorio ? <span aria-hidden> *</span> : null}
      </label>
      <input
        id={props.id}
        type={props.type ?? "text"}
        required={props.obrigatorio}
        autoComplete={props.autoComplete}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        aria-invalid={props.erro ? true : undefined}
        aria-describedby={props.erro ? `${props.id}-err` : undefined}
        className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
      />
      {props.erro && (
        <p id={`${props.id}-err`} role="alert" className="mt-1 text-sm text-ink">
          {props.erro}
        </p>
      )}
    </div>
  );
}

function CampoNumero(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  obrigatorio?: boolean;
  erro?: string;
  min?: number;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-base font-semibold text-ink">
        {props.label}
        {props.obrigatorio ? <span aria-hidden> *</span> : null}
      </label>
      <input
        id={props.id}
        type="number"
        inputMode="numeric"
        min={props.min}
        required={props.obrigatorio}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        aria-invalid={props.erro ? true : undefined}
        aria-describedby={props.erro ? `${props.id}-err` : undefined}
        className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
      />
      {props.erro && (
        <p id={`${props.id}-err`} role="alert" className="mt-1 text-sm text-ink">
          {props.erro}
        </p>
      )}
    </div>
  );
}

function CampoSelecao(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  opcoes: readonly (readonly [string, string])[];
  obrigatorio?: boolean;
  erro?: string;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-base font-semibold text-ink">
        {props.label}
        {props.obrigatorio ? <span aria-hidden> *</span> : null}
      </label>
      <select
        id={props.id}
        required={props.obrigatorio}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        aria-invalid={props.erro ? true : undefined}
        aria-describedby={props.erro ? `${props.id}-err` : undefined}
        className="mt-1 block w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
      >
        <option value="">— Selecionar —</option>
        {props.opcoes.map(([v, r]) => (
          <option key={v} value={v}>
            {r}
          </option>
        ))}
      </select>
      {props.erro && (
        <p id={`${props.id}-err`} role="alert" className="mt-1 text-sm text-ink">
          {props.erro}
        </p>
      )}
    </div>
  );
}

function useIdsCampos() {
  const base = useId();
  return {
    secIdent: `${base}-s1`,
    secLoc: `${base}-s2`,
    secColab: `${base}-s3`,
    secApoios: `${base}-s4`,
    secModulos: `${base}-s5`,
    secLog: `${base}-s6`,
    secCons: `${base}-s7`,
    nome: `${base}-nome`,
    natureza: `${base}-natureza`,
    setor: `${base}-setor`,
    setorOutro: `${base}-setor-outro`,
    pfNome: `${base}-pf-nome`,
    pfEmail: `${base}-pf-email`,
    provincia: `${base}-provincia`,
    distrito: `${base}-distrito`,
    meio: `${base}-meio`,
    modalidade: `${base}-modalidade`,
    conectividade: `${base}-conectividade`,
    nComp: `${base}-ncomp`,
    nTotal: `${base}-ntotal`,
    nivelLit: `${base}-nivel-lit`,
    nMul: `${base}-nmul`,
    nHom: `${base}-nhom`,
    nPcd: `${base}-npcd`,
    percurso: `${base}-percurso`,
    prazo: `${base}-prazo`,
    sala: `${base}-sala`,
    obs: `${base}-obs`,
  };
}
