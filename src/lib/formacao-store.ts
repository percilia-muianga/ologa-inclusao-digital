// Estado local do formando anónimo. Vive apenas no navegador (localStorage).
// Nunca é enviado para o servidor, exceto no momento de emitir o certificado.

const CHAVE = "ologa.formacao.v1";

export type RespostaQuiz = { perguntaId: string; indice: number };

export type EstadoFormacao = {
  tokenPessoal: string | null;
  licoesConcluidasPorModulo: Record<string, string[]>; // moduloId -> licaoId[]
  quizzesPorModulo: Record<string, RespostaQuiz[]>; // moduloId -> últimas respostas
  diagnosticoPorModulo: Record<string, { pontuacao: number; total: number }>;
};

const INICIAL: EstadoFormacao = {
  tokenPessoal: null,
  licoesConcluidasPorModulo: {},
  quizzesPorModulo: {},
  diagnosticoPorModulo: {},
};

function ler(): EstadoFormacao {
  if (typeof window === "undefined") return INICIAL;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return INICIAL;
    const obj = JSON.parse(bruto) as Partial<EstadoFormacao>;
    return { ...INICIAL, ...obj };
  } catch {
    return INICIAL;
  }
}

function escrever(estado: EstadoFormacao) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE, JSON.stringify(estado));
}

export const formacaoStore = {
  ler,

  marcarLicaoConcluida(moduloId: string, licaoId: string) {
    const s = ler();
    const atuais = new Set(s.licoesConcluidasPorModulo[moduloId] ?? []);
    atuais.add(licaoId);
    s.licoesConcluidasPorModulo[moduloId] = Array.from(atuais);
    escrever(s);
  },

  licoesConcluidas(moduloId: string): Set<string> {
    return new Set(ler().licoesConcluidasPorModulo[moduloId] ?? []);
  },

  guardarQuiz(moduloId: string, respostas: RespostaQuiz[]) {
    const s = ler();
    s.quizzesPorModulo[moduloId] = respostas;
    escrever(s);
  },

  respostasQuiz(moduloId: string): RespostaQuiz[] | null {
    return ler().quizzesPorModulo[moduloId] ?? null;
  },

  guardarDiagnostico(moduloId: string, pontuacao: number, total: number) {
    const s = ler();
    s.diagnosticoPorModulo[moduloId] = { pontuacao, total };
    escrever(s);
  },

  diagnostico(moduloId: string) {
    return ler().diagnosticoPorModulo[moduloId] ?? null;
  },

  guardarToken(token: string) {
    const s = ler();
    s.tokenPessoal = token;
    escrever(s);
  },

  token(): string | null {
    return ler().tokenPessoal;
  },
};
