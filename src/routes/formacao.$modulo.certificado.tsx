import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  emitirCertificado,
  listarInstituicoesPublico,
} from "@/lib/formacao.functions";
import { moduloQuery } from "./formacao.$modulo";
import { formacaoStore } from "@/lib/formacao-store";

const instituicoesQuery = queryOptions({
  queryKey: ["formacao", "instituicoes-publico"],
  queryFn: () => listarInstituicoesPublico(),
});

export const Route = createFileRoute("/formacao/$modulo/certificado")({
  loader: ({ context }) => context.queryClient.ensureQueryData(instituicoesQuery),
  component: CertificadoView,
});

type Genero = "feminino" | "masculino" | "prefere_nao_indicar";
type Nivel = "nenhum" | "basico" | "intermedio" | "prefere_nao_indicar";
type Apoio =
  | "lsm"
  | "leitura_facil"
  | "baixa_visao"
  | "audiodescricao"
  | "mobilidade"
  | "nenhum";

const APOIOS: { valor: Apoio; etiqueta: string }[] = [
  { valor: "lsm", etiqueta: "Língua de sinais moçambicana" },
  { valor: "leitura_facil", etiqueta: "Leitura fácil" },
  { valor: "baixa_visao", etiqueta: "Baixa visão / alto contraste" },
  { valor: "audiodescricao", etiqueta: "Audiodescrição" },
  { valor: "mobilidade", etiqueta: "Apoio de mobilidade" },
  { valor: "nenhum", etiqueta: "Não preciso de apoio específico" },
];

function CertificadoView() {
  const { modulo: moduloId } = Route.useParams();
  const navigate = useNavigate();
  const { data: mod } = useSuspenseQuery(moduloQuery(moduloId));
  const { data: instituicoes } = useSuspenseQuery(instituicoesQuery);
  const emitir = useServerFn(emitirCertificado);

  const [tokenExistente, setTokenExistente] = useState<string | null>(null);
  const [licoesFeitas, setLicoesFeitas] = useState<Set<string>>(new Set());
  const [diagnostico, setDiagnostico] = useState<
    { pontuacao: number; total: number } | null
  >(null);

  const [nome, setNome] = useState("");
  const [instituicaoId, setInstituicaoId] = useState<string>("");
  const [genero, setGenero] = useState<Genero | "">("");
  const [nivelPartida, setNivelPartida] = useState<Nivel | "">("");
  const [precisaApoio, setPrecisaApoio] = useState<"" | "sim" | "nao">("");
  const [apoios, setApoios] = useState<Apoio[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [emitido, setEmitido] = useState<{
    codigoVerificacao: string;
    emitidoEm: string;
    tokenPessoal: string;
    jaExistia: boolean;
    diagnostico: { pontuacao: number; total: number } | null;
    quizPontuacao: number;
    quizTotal: number;
  } | null>(null);

  useEffect(() => {
    setTokenExistente(formacaoStore.token());
    setLicoesFeitas(formacaoStore.licoesConcluidas(moduloId));
    setDiagnostico(formacaoStore.diagnostico(moduloId));
  }, [moduloId]);

  const licoesFaltam = useMemo(
    () => mod.licoes.filter((l) => !licoesFeitas.has(l.id)),
    [mod.licoes, licoesFeitas],
  );

  const respostasQuiz = formacaoStore.respostasQuiz(moduloId);
  const semQuiz = !respostasQuiz || respostasQuiz.length === 0;

  async function submeter() {
    setErro(null);
    setEnviando(true);
    try {
      const estado = formacaoStore.ler();
      const quizzes = Object.entries(estado.quizzesPorModulo).map(
        ([mId, respostas]) => ({ moduloId: mId, respostas }),
      );
      const licoesConcluidasIds = Array.from(
        estado.licoesConcluidasPorModulo[moduloId] ?? [],
      );

      const payload: Parameters<typeof emitir>[0]["data"] = {
        moduloId,
        tokenPessoal: tokenExistente ?? null,
        progresso: { licoesConcluidasIds, quizzes },
      };

      if (!tokenExistente) {
        if (nome.trim().length < 2) {
          setErro("Escreva o seu nome tal como quer que apareça no certificado.");
          setEnviando(false);
          return;
        }
        payload.nome = nome.trim();
        payload.instituicaoId = instituicaoId || null;
        payload.genero = (genero || null) as Genero | null;
        payload.nivelPartida = (nivelPartida || null) as Nivel | null;
        payload.precisaApoio =
          precisaApoio === "" ? null : precisaApoio === "sim";
        payload.apoiosAcessibilidade = apoios.length > 0 ? apoios : null;
        payload.diagnostico = diagnostico;
      }

      const r = await emitir({ data: payload });
      formacaoStore.guardarToken(r.tokenPessoal);

      // Nota do quiz do módulo (para exibir junto ao diagnóstico)
      const gab = respostasQuiz ?? [];
      const total = gab.length;
      // O servidor já validou; usamos o total simples como referência visual.
      setEmitido({
        codigoVerificacao: r.codigoVerificacao,
        emitidoEm: r.emitidoEm,
        tokenPessoal: r.tokenPessoal,
        jaExistia: r.jaExistia,
        diagnostico,
        quizPontuacao: total, // aproximação client-side apenas para o gráfico
        quizTotal: total,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido.";
      const traducao: Record<string, string> = {
        LICOES_INCOMPLETAS: "Ainda faltam lições por concluir.",
        QUIZ_NAO_SUBMETIDO: "Precisa de fazer o teste do módulo primeiro.",
        QUIZ_INSUFICIENTE:
          "A nota do teste ainda não chegou. Reveja as lições e repita o teste — sem limites.",
        TOKEN_INVALIDO: "O seu link pessoal já não é reconhecido.",
        NOME_OBRIGATORIO: "Escreva o seu nome.",
      };
      setErro(traducao[msg] ?? msg);
    } finally {
      setEnviando(false);
    }
  }

  if (emitido) {
    return (
      <div className="mx-auto max-w-2xl">
        <section className="rounded-xl border border-line bg-white p-6">
          <h2 className="text-xl font-bold text-navy">
            {emitido.jaExistia ? "Certificado já existente" : "Certificado emitido"}
          </h2>
          <p className="mt-2 text-sm text-navy-2">
            Módulo: <strong>{mod.modulo.titulo}</strong>
          </p>
          <div className="mt-4 rounded-lg border border-line bg-page/60 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Código de verificação
            </p>
            <p className="mt-1 text-lg font-mono font-bold text-navy">
              {emitido.codigoVerificacao}
            </p>
            <Link
              to="/verificar"
              className="mt-2 inline-block text-sm text-brand underline"
            >
              Verificar certificado
            </Link>
          </div>

          <div className="mt-4 rounded-lg border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              O seu link pessoal
            </p>
            <p className="mt-1 break-all font-mono text-sm text-navy">
              {emitido.tokenPessoal}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Guarde este link. Da próxima vez que emitir um certificado noutro módulo,
              este dispositivo já o reconhece automaticamente e a sua instituição
              vê o seu percurso.
            </p>
          </div>

          {emitido.diagnostico ? (
            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-2">
                Do início ao fim
              </h3>
              <p className="mt-2 text-sm text-navy-2">
                No início acertou <strong>{emitido.diagnostico.pontuacao}</strong> de{" "}
                <strong>{emitido.diagnostico.total}</strong>. Agora, no teste do módulo,
                completou-o com aproveitamento.
              </p>
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <div className="mb-1 flex justify-between text-muted-foreground">
                    <span>Diagnóstico</span>
                    <span>
                      {emitido.diagnostico.pontuacao}/{emitido.diagnostico.total}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full bg-navy-2"
                      style={{
                        width: `${
                          emitido.diagnostico.total === 0
                            ? 0
                            : Math.round(
                                (emitido.diagnostico.pontuacao /
                                  emitido.diagnostico.total) *
                                  100,
                              )
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-muted-foreground">
                    <span>Teste do módulo</span>
                    <span>aprovado</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                    <div className="h-full w-full bg-brand" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate({ to: "/formacao" })}
              className="btn-brand btn-brand-hover"
            >
              Ver outros cursos
            </button>
          </div>
        </section>
      </div>
    );
  }

  const bloqueado = licoesFaltam.length > 0 || semQuiz;

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-3 text-sm">
        <Link
          to="/formacao/$modulo"
          params={{ modulo: moduloId }}
          className="text-navy-2 underline hover:text-brand"
        >
          ← Voltar ao módulo
        </Link>
      </nav>
      <h2 className="mb-2 text-xl font-bold text-navy">Emitir certificado</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Módulo: {mod.modulo.titulo}
      </p>

      {bloqueado ? (
        <section className="rounded-xl border border-line bg-page/60 p-5">
          <h3 className="mb-2 font-semibold text-navy">Antes de emitir</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-navy-2">
            {licoesFaltam.length > 0 ? (
              <li>
                Faltam {licoesFaltam.length} lições por concluir neste dispositivo.
              </li>
            ) : null}
            {semQuiz ? <li>Ainda não fez o teste do módulo.</li> : null}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/formacao/$modulo"
              params={{ modulo: moduloId }}
              className="btn-brand btn-brand-hover"
            >
              Voltar ao módulo
            </Link>
          </div>
        </section>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submeter();
          }}
          className="space-y-6 rounded-xl border border-line bg-white p-6"
        >
          {tokenExistente ? (
            <div className="rounded-lg border border-line bg-page/60 p-4 text-sm text-navy-2">
              Reconhecemos o seu link pessoal deste dispositivo. Vamos usar os dados
              que já registou — não precisa de preencher nada.
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-navy" htmlFor="nome">
                  Nome (obrigatório) *
                </label>
                <input
                  id="nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
                  placeholder="Como quer que apareça no certificado"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-navy" htmlFor="inst">
                  Instituição (opcional)
                </label>
                <select
                  id="inst"
                  value={instituicaoId}
                  onChange={(e) => setInstituicaoId(e.target.value)}
                  className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
                >
                  <option value="">— Sem instituição —</option>
                  {instituicoes.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-navy">
                  Género (opcional)
                </legend>
                <div className="flex flex-wrap gap-3 text-sm text-navy-2">
                  {(
                    [
                      ["feminino", "Feminino"],
                      ["masculino", "Masculino"],
                      ["prefere_nao_indicar", "Prefiro não indicar"],
                    ] as [Genero, string][]
                  ).map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="genero"
                        checked={genero === v}
                        onChange={() => setGenero(v)}
                      />
                      {l}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-navy">
                  Nível de partida (opcional)
                </legend>
                <div className="flex flex-wrap gap-3 text-sm text-navy-2">
                  {(
                    [
                      ["nenhum", "Nenhum"],
                      ["basico", "Básico"],
                      ["intermedio", "Intermédio"],
                      ["prefere_nao_indicar", "Prefiro não indicar"],
                    ] as [Nivel, string][]
                  ).map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="nivel"
                        checked={nivelPartida === v}
                        onChange={() => setNivelPartida(v)}
                      />
                      {l}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-navy">
                  Precisa de apoio para aprender? (opcional)
                </legend>
                <div className="flex flex-wrap gap-3 text-sm text-navy-2">
                  {(
                    [
                      ["nao", "Não"],
                      ["sim", "Sim"],
                    ] as [typeof precisaApoio, string][]
                  ).map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="apoio"
                        checked={precisaApoio === v}
                        onChange={() => setPrecisaApoio(v)}
                      />
                      {l}
                    </label>
                  ))}
                </div>
              </fieldset>

              {precisaApoio === "sim" ? (
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-navy">
                    Tipo de apoio (opcional)
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2 text-sm text-navy-2">
                    {APOIOS.map((a) => (
                      <label key={a.valor} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={apoios.includes(a.valor)}
                          onChange={(e) =>
                            setApoios((prev) =>
                              e.target.checked
                                ? [...prev, a.valor]
                                : prev.filter((x) => x !== a.valor),
                            )
                          }
                        />
                        {a.etiqueta}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}
            </>
          )}

          {erro ? <p className="text-sm text-brand">{erro}</p> : null}

          <button type="submit" disabled={enviando} className="btn-brand btn-brand-hover">
            {enviando ? "A emitir…" : "Emitir certificado"}
          </button>
        </form>
      )}
    </div>
  );
}
