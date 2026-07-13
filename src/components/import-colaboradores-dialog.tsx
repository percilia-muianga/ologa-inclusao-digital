import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import * as XLSX from "xlsx";
import {
  importarColaboradoresChunk,
  mapearGenero,
  mapearNivel,
  type ResultadoLinha,
} from "@/lib/colaboradores.functions";

type Genero = "feminino" | "masculino" | "prefere_nao_indicar";
type Nivel = "nenhum" | "basico" | "intermedio" | "prefere_nao_indicar";

type LinhaBruta = Record<string, unknown>;

type LinhaValidada = {
  numero: number;
  nome: string;
  email: string;
  genero: Genero | null;
  nivel_partida: Nivel | null;
  funcao: string | null;
  erros: string[];
  avisos: string[];
};

const COLUNAS_ACEITES = new Set([
  "nome",
  "email",
  "genero",
  "gênero",
  "nivel de partida",
  "nível de partida",
  "nivel_de_partida",
  "nivel_partida",
  "nível de literacia",
  "funcao",
  "função",
]);

const COLUNAS_DEFICIENCIA = new Set([
  "deficiencia",
  "deficiência",
  "tem_deficiencia",
  "apoios",
  "apoios_acessibilidade",
  "acessibilidade",
]);

function normColuna(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mapearColuna(raw: string): "nome" | "email" | "genero" | "nivel" | "funcao" | "ignorar" | "deficiencia" {
  const n = normColuna(raw);
  if (COLUNAS_DEFICIENCIA.has(n)) return "deficiencia";
  if (n === "nome") return "nome";
  if (n === "email" || n === "e-mail") return "email";
  if (n === "genero" || n === "gênero") return "genero";
  if (
    n === "nivel de partida" ||
    n === "nível de partida" ||
    n === "nivel_partida" ||
    n === "nivel_de_partida" ||
    n === "nivel de literacia" ||
    n === "nível de literacia"
  )
    return "nivel";
  if (n === "funcao" || n === "função") return "funcao";
  return "ignorar";
}

function emailValido(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function validar(linhas: LinhaBruta[]): {
  linhas: LinhaValidada[];
  colunasIgnoradas: string[];
  aviso_deficiencia: boolean;
} {
  const cabecalhos = linhas[0] ? Object.keys(linhas[0]) : [];
  const mapa = new Map<string, "nome" | "email" | "genero" | "nivel" | "funcao" | "ignorar" | "deficiencia">();
  const ignoradas: string[] = [];
  let aviso_def = false;
  for (const c of cabecalhos) {
    const m = mapearColuna(c);
    mapa.set(c, m);
    if (m === "ignorar") ignoradas.push(c);
    if (m === "deficiencia") aviso_def = true;
  }

  const emailsVistos = new Set<string>();
  const validadas: LinhaValidada[] = linhas.map((linha, idx) => {
    const numero = idx + 2; // +1 header, +1 base-1
    let nome = "";
    let email = "";
    let genero: Genero | null = null;
    let nivel: Nivel | null = null;
    let funcao: string | null = null;
    const erros: string[] = [];
    const avisos: string[] = [];

    for (const [k, v] of Object.entries(linha)) {
      const tipo = mapa.get(k);
      if (!tipo || tipo === "ignorar" || tipo === "deficiencia") continue;
      const s = v == null ? "" : String(v).trim();
      if (tipo === "nome") nome = s;
      else if (tipo === "email") email = s.toLowerCase();
      else if (tipo === "funcao") funcao = s || null;
      else if (tipo === "genero") {
        const r = mapearGenero(s);
        if (r === "invalido") {
          avisos.push(`valor de género não reconhecido — campo deixado vazio`);
          genero = null;
        } else genero = r;
      } else if (tipo === "nivel") {
        const r = mapearNivel(s);
        if (r === "invalido") {
          avisos.push(`nível de partida não reconhecido — campo deixado vazio`);
          nivel = null;
        } else nivel = r;
      }
    }

    if (!nome) erros.push("nome é obrigatório");
    if (nome.length > 200) erros.push("nome tem mais de 200 caracteres");
    if (!email) erros.push("email é obrigatório");
    else if (!emailValido(email)) erros.push("email inválido");
    else if (emailsVistos.has(email)) erros.push("email repetido no ficheiro");
    if (funcao && funcao.length > 100) {
      avisos.push("função excede 100 caracteres — foi truncada");
      funcao = funcao.slice(0, 100);
    }
    if (email && emailValido(email)) emailsVistos.add(email);

    return { numero, nome, email, genero, nivel_partida: nivel, funcao, erros, avisos };
  });

  return { linhas: validadas, colunasIgnoradas: ignoradas, aviso_deficiencia: aviso_def };
}

async function lerFicheiro(f: File): Promise<LinhaBruta[]> {
  const buf = await f.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const primeira = wb.SheetNames[0];
  if (!primeira) return [];
  const sheet = wb.Sheets[primeira];
  return XLSX.utils.sheet_to_json<LinhaBruta>(sheet, { defval: "", raw: false });
}

type Estado =
  | { fase: "vazio" }
  | { fase: "preview"; validadas: LinhaValidada[]; ignoradas: string[]; aviso_def: boolean }
  | {
      fase: "importar";
      total: number;
      feitos: number;
      resultados: ResultadoLinha[];
    }
  | {
      fase: "fim";
      resultados: ResultadoLinha[];
      total: number;
      ignoradasErro: number;
    };

const TAMANHO_CHUNK = 10;

export function ImportColaboradoresDialog({
  aberto,
  fechar,
  aoConcluir,
}: {
  aberto: boolean;
  fechar: () => void;
  aoConcluir: () => void;
}) {
  const importar = useServerFn(importarColaboradoresChunk);
  const [estado, setEstado] = useState<Estado>({ fase: "vazio" });
  const [erroFicheiro, setErroFicheiro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFicheiro(e: React.ChangeEvent<HTMLInputElement>) {
    setErroFicheiro(null);
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const linhas = await lerFicheiro(f);
      if (linhas.length === 0) {
        setErroFicheiro("Ficheiro vazio ou sem dados.");
        return;
      }
      const { linhas: validadas, colunasIgnoradas, aviso_deficiencia } = validar(linhas);
      setEstado({ fase: "preview", validadas, ignoradas: colunasIgnoradas, aviso_def: aviso_deficiencia });
    } catch {
      setErroFicheiro("Não foi possível ler o ficheiro. Use .xlsx, .xls ou .csv.");
    }
  }

  async function iniciarImportacao() {
    if (estado.fase !== "preview") return;
    const validas = estado.validadas.filter((l) => l.erros.length === 0);
    if (validas.length === 0) return;

    setEstado({ fase: "importar", total: validas.length, feitos: 0, resultados: [] });

    const resultados: ResultadoLinha[] = [];
    for (let i = 0; i < validas.length; i += TAMANHO_CHUNK) {
      const chunk = validas.slice(i, i + TAMANHO_CHUNK).map((l) => ({
        nome: l.nome,
        email: l.email,
        genero: l.genero,
        nivel_partida: l.nivel_partida,
        funcao: l.funcao,
      }));
      const res = await importar({
        data: { origin: window.location.origin, linhas: chunk },
      });
      if (!res.ok) {
        for (const l of chunk) {
          resultados.push({ email: l.email, nome: l.nome, ok: false, erro: res.mensagem });
        }
      } else {
        resultados.push(...res.resultados);
      }
      setEstado({
        fase: "importar",
        total: validas.length,
        feitos: Math.min(i + TAMANHO_CHUNK, validas.length),
        resultados: [...resultados],
      });
    }
    const ignoradas = estado.validadas.filter((l) => l.erros.length > 0).length;
    setEstado({ fase: "fim", resultados, total: validas.length, ignoradasErro: ignoradas });
    aoConcluir();
  }

  function descarregarLinks() {
    if (estado.fase !== "fim") return;
    const criados = estado.resultados.filter((r) => r.ok && r.link);
    const dados = [
      ["nome", "email", "link"],
      ...criados.map((r) => [r.nome, r.email, r.link ?? ""]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Links");
    XLSX.writeFile(wb, "colaboradores-links.xlsx");
  }

  function reiniciar() {
    setEstado({ fase: "vazio" });
    setErroFicheiro(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-titulo"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4"
    >
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="import-titulo" className="text-2xl font-extrabold text-ink">
            Importar colaboradores
          </h2>
          <button
            type="button"
            onClick={() => {
              fechar();
              if (estado.fase === "fim" || estado.fase === "vazio") reiniciar();
            }}
            className="min-h-10 rounded-md border border-ink/20 px-3 text-base text-ink"
          >
            Fechar
          </button>
        </div>

        {estado.fase === "vazio" && (
          <div className="mt-6 space-y-4">
            <p className="text-base text-foreground">
              Carregue um ficheiro <strong>.xlsx</strong>, <strong>.xls</strong> ou <strong>.csv</strong> com
              as colunas: <code>nome</code>, <code>email</code>, <code>género</code>,{" "}
              <code>nível de partida</code>, <code>função</code>.
            </p>
            <p className="text-sm text-muted-foreground">
              Só <strong>nome</strong> e <strong>email</strong> são obrigatórios. Os restantes campos são
              opcionais.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onFicheiro}
              className="block w-full text-base"
            />
            {erroFicheiro && (
              <p role="alert" className="rounded-md border border-brand/40 bg-brand/5 p-3 text-base text-ink">
                {erroFicheiro}
              </p>
            )}
          </div>
        )}

        {estado.fase === "preview" && <PainelPreview
          estado={estado}
          iniciar={iniciarImportacao}
          cancelar={reiniciar}
        />}

        {estado.fase === "importar" && (
          <div className="mt-6 space-y-4">
            <p className="text-base text-ink">
              A criar contas… <strong>{estado.feitos}</strong> de <strong>{estado.total}</strong>
            </p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={estado.total}
              aria-valuenow={estado.feitos}
              className="h-3 w-full overflow-hidden rounded-full bg-ink/10"
            >
              <div
                className="h-full bg-ink transition-all"
                style={{ width: `${estado.total === 0 ? 0 : (estado.feitos / estado.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {estado.fase === "fim" && <PainelFim
          estado={estado}
          descarregar={descarregarLinks}
          reiniciar={reiniciar}
        />}
      </div>
    </div>
  );
}

function PainelPreview({
  estado,
  iniciar,
  cancelar,
}: {
  estado: Extract<Estado, { fase: "preview" }>;
  iniciar: () => void;
  cancelar: () => void;
}) {
  const validas = useMemo(() => estado.validadas.filter((l) => l.erros.length === 0), [estado.validadas]);
  const comErro = estado.validadas.length - validas.length;

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-md bg-ink/5 p-4 text-base text-ink">
        <p>
          <strong>{estado.validadas.length}</strong> linhas lidas —{" "}
          <strong>{validas.length}</strong> prontas a criar,{" "}
          <strong>{comErro}</strong> com erros (serão ignoradas).
        </p>
        {estado.ignoradas.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Colunas ignoradas: {estado.ignoradas.join(", ")}
          </p>
        )}
        {estado.aviso_def && (
          <p className="mt-2 text-sm text-brand">
            Aviso: o ficheiro tinha coluna(s) sobre deficiência ou apoios de acessibilidade. Foram
            <strong> ignoradas</strong>. Esses dados são declarados pela própria pessoa, no perfil dela.
          </p>
        )}
      </div>

      <div className="max-h-96 overflow-auto rounded-md border border-ink/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-ink/10 text-left">
              <th className="px-2 py-2">Linha</th>
              <th className="px-2 py-2">Nome</th>
              <th className="px-2 py-2">Email</th>
              <th className="px-2 py-2">Género</th>
              <th className="px-2 py-2">Nível</th>
              <th className="px-2 py-2">Função</th>
              <th className="px-2 py-2">Situação</th>
            </tr>
          </thead>
          <tbody>
            {estado.validadas.map((l) => (
              <tr key={l.numero} className="border-b border-ink/5 align-top">
                <td className="px-2 py-2 text-muted-foreground">{l.numero}</td>
                <td className="px-2 py-2">{l.nome || <span className="text-brand">—</span>}</td>
                <td className="px-2 py-2">{l.email || <span className="text-brand">—</span>}</td>
                <td className="px-2 py-2">{l.genero ?? "—"}</td>
                <td className="px-2 py-2">{l.nivel_partida ?? "—"}</td>
                <td className="px-2 py-2">{l.funcao ?? "—"}</td>
                <td className="px-2 py-2">
                  {l.erros.length > 0 ? (
                    <span className="font-semibold text-brand">Erro: {l.erros.join("; ")}</span>
                  ) : l.avisos.length > 0 ? (
                    <span className="text-muted-foreground">Aviso: {l.avisos.join("; ")}</span>
                  ) : (
                    <span className="text-ink">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={iniciar}
          disabled={validas.length === 0}
          className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground disabled:opacity-60"
        >
          Criar {validas.length} contas
        </button>
        <button
          type="button"
          onClick={cancelar}
          className="inline-flex min-h-11 items-center rounded-md border border-ink/20 px-4 text-base text-ink"
        >
          Escolher outro ficheiro
        </button>
      </div>
    </div>
  );
}

function PainelFim({
  estado,
  descarregar,
  reiniciar,
}: {
  estado: Extract<Estado, { fase: "fim" }>;
  descarregar: () => void;
  reiniciar: () => void;
}) {
  const criados = estado.resultados.filter((r) => r.ok).length;
  const erros = estado.resultados.filter((r) => !r.ok).length;
  const comLink = estado.resultados.filter((r) => r.ok && r.link).length;
  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-md bg-ink/5 p-4 text-base text-ink">
        <p className="font-semibold">Resumo</p>
        <ul className="mt-2 list-disc pl-5">
          <li>Contas criadas: <strong>{criados}</strong></li>
          <li>Linhas com erro: <strong>{erros}</strong></li>
          <li>Linhas ignoradas por erros de validação: <strong>{estado.ignoradasErro}</strong></li>
          <li>Links de palavra-passe prontos a entregar: <strong>{comLink}</strong></li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={descarregar}
          disabled={comLink === 0}
          className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-base font-semibold text-ink-foreground disabled:opacity-60"
        >
          Descarregar folha com os links
        </button>
        <button
          type="button"
          onClick={reiniciar}
          className="inline-flex min-h-11 items-center rounded-md border border-ink/20 px-4 text-base text-ink"
        >
          Nova importação
        </button>
      </div>

      {erros > 0 && (
        <div className="max-h-64 overflow-auto rounded-md border border-ink/10">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-ink/10 text-left">
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Erro</th>
              </tr>
            </thead>
            <tbody>
              {estado.resultados
                .filter((r) => !r.ok)
                .map((r) => (
                  <tr key={r.email} className="border-b border-ink/5">
                    <td className="px-2 py-2">{r.email}</td>
                    <td className="px-2 py-2 text-brand">{r.erro}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
