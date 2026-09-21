/**
 * Testes dos HANDLERS REAIS das funções de servidor.
 *
 * Não se testa aqui a regra de permissão isolada (isso está noutro ficheiro):
 * executa-se o corpo verdadeiro de cada função exportada de src/lib/*.functions.ts,
 * com createServerFn simulado, sessão simulada e cliente de base de dados
 * simulado. Nenhuma conta real, nenhuma ligação à base de dados do projecto.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// --- createServerFn simulado: guarda o handler e deixa executá-lo ---------
vi.mock("@tanstack/react-start", () => {
  const criar = () => {
    const estado: { handler?: Function; temMiddleware: boolean } = { temMiddleware: false };
    const api: any = {
      middleware: () => {
        estado.temMiddleware = true;
        return api;
      },
      validator: () => api,
      inputValidator: () => api,
      handler: (fn: Function) => {
        estado.handler = fn;
        const exec: any = (args: any) => fn(args);
        exec.__executar = (args: any) => fn(args);
        exec.__temMiddleware = estado.temMiddleware;
        return exec;
      },
    };
    return api;
  };
  return { createServerFn: criar };
});

vi.mock("@/integrations/supabase/auth-middleware", () => ({
  requireSupabaseAuth: { __middleware: true },
}));

// --- cliente do servidor de confiança: espiado, nunca deve escrever gestão -
const registoAdmin: string[] = [];
const auditoria: any[] = [];
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: (tabela: string) => {
      registoAdmin.push(tabela);
      return criarCadeia(tabela, {}, registoAdmin, auditoria);
    },
  },
}));

// --- cadeia encadeável que imita o cliente Supabase ----------------------
function criarCadeia(
  tabela: string,
  dados: Record<string, any>,
  registo: string[],
  auditoriaLinhas: any[],
) {
  const resultado = () => dados[tabela] ?? { data: [], error: null, count: 0 };
  const cadeia: any = new Proxy(
    {},
    {
      get(_alvo, prop: string) {
        if (prop === "then") {
          return (aceitar: any, rejeitar: any) => Promise.resolve(resultado()).then(aceitar, rejeitar);
        }
        return (...args: any[]) => {
          if (["insert", "update", "upsert", "delete"].includes(prop)) {
            registo.push(`${tabela}.${prop}`);
            if (tabela === "registo_auditoria") auditoriaLinhas.push(args[0]);
          }
          return cadeia;
        };
      },
    },
  );
  return cadeia;
}

function clienteFalso(dados: Record<string, any>, registo: string[]) {
  return {
    from: (tabela: string) => criarCadeia(tabela, dados, registo, auditoria),
  } as any;
}

type Papel = "anonimo" | "formando" | "auditor" | "coordenador" | "admin";

function contexto(papel: Papel, extra: Record<string, any> = {}) {
  const registo: string[] = [];
  const papeis =
    papel === "auditor"
      ? [{ papel: "auditor_atdi" }]
      : papel === "coordenador"
        ? [{ papel: "coordenador_nacional" }]
        : papel === "formando"
          ? [{ papel: "formando" }]
          : [];
  const perfilPapel = papel === "admin" ? "admin_ologa" : "formando";
  const dados: Record<string, any> = {
    utilizador_papeis: { data: papeis, error: null },
    perfis: { data: papel === "anonimo" ? null : { papel: perfilPapel }, error: null },
    ...extra,
  };
  const ctx: any = {
    userId: papel === "anonimo" ? undefined : `id-${papel}`,
    supabase: clienteFalso(dados, registo),
  };
  return { ctx, registo };
}

beforeEach(() => {
  registoAdmin.length = 0;
  auditoria.length = 0;
});

function escritas(registo: string[]) {
  return registo.filter((r) => /\.(insert|update|upsert|delete)$/.test(r) && !r.startsWith("registo_auditoria"));
}

// -------------------------------------------------------------------------
describe("handlers de gestão: quem não pode, não chega à base", () => {
  const casos: Array<[string, () => Promise<any>, any]> = [];

  async function correr(papel: Papel, executar: (ctx: any) => Promise<any>, extra = {}) {
    const { ctx, registo } = contexto(papel, extra);
    let erro: unknown = null;
    try {
      await executar(ctx);
    } catch (e) {
      erro = e;
      if (process.env['DEPURAR']) console.log((e as Error).stack);
    }
    return { erro, escritasFeitas: escritas(registo), registoAdmin: [...registoAdmin] };
  }

  it("criarTurma: anónimo, formando e auditor são recusados; administração escreve", async () => {
    const { criarTurma } = await import("@/lib/turmas.functions");
    const dadosTurma = {
      cursoId: "11111111-1111-1111-1111-111111111111",
      designacao: "Turma A",
      provincia: "Maputo",
      distrito: "KaMpfumo",
      localFormacao: null,
      modalidade: "presencial",
      formadorPrincipal: null,
      dataInicio: null,
      dataFim: null,
      limite: 25,
      observacoes: null,
      numComputadores: null,
    } as any;
    const chamar = (ctx: any) => (criarTurma as any).__executar({ data: dadosTurma, context: ctx });

    for (const papel of ["anonimo", "formando", "auditor"] as Papel[]) {
      const r = await correr(papel, chamar);
      expect(r.erro, papel).toBeTruthy();
      expect(r.escritasFeitas, papel).toEqual([]);
      expect(r.registoAdmin.includes("turmas"), papel).toBe(false);
    }

    const ok = await correr("admin", chamar, { turmas: { data: { id: "t1" }, error: null } });
    expect(ok.erro).toBeNull();
    expect(ok.escritasFeitas).toContain("turmas.insert");
    expect(ok.registoAdmin.includes("turmas")).toBe(false);
  });

  it("registarPresencas e corrigirPresenca: só administração/coordenação escrevem", async () => {
    const { registarPresencas, corrigirPresenca } = await import("@/lib/presencas.functions");
    const extra = {
      turma_sessoes: { data: { id: "s1", turma_id: "t1" }, error: null },
      presencas: { data: [{ id: "p1", conflito: false }], error: null },
    };
    const marcar = (ctx: any) =>
      (registarPresencas as any).__executar({
        data: {
          sessaoId: "s1",
          origemOffline: false,
          aparelho: null,
          marcadoPorNome: null,
          marcacoes: [{ inscricaoId: "i1", nome: "Ana", estado: "presente", motivo: null }],
        },
        context: ctx,
      });
    const corrigir = (ctx: any) =>
      (corrigirPresenca as any).__executar({
        data: {
          sessaoId: "s1",
          inscricaoId: "i1",
          nome: "Ana",
          estado: "presente",
          motivo: null,
          justificacao: "Folha em papel recebida depois.",
        },
        context: ctx,
      });

    for (const executar of [marcar, corrigir]) {
      for (const papel of ["anonimo", "formando", "auditor"] as Papel[]) {
        const r = await correr(papel, executar, extra);
        expect(r.erro, papel).toBeTruthy();
        expect(r.escritasFeitas, papel).toEqual([]);
      }
      const ok = await correr("coordenador", executar, extra);
      expect(ok.erro).toBeNull();
      expect(ok.escritasFeitas).toContain("presencas.insert");
      expect(ok.registoAdmin.includes("presencas")).toBe(false);
    }
  });

  it("guardarConfigPresencaVirtual: auditor recusado, coordenação grava", async () => {
    const { guardarConfigPresencaVirtual } = await import("@/lib/presencas.functions");
    const chamar = (ctx: any) =>
      (guardarConfigPresencaVirtual as any).__executar({
        data: {
          cursoId: "11111111-1111-1111-1111-111111111111",
          limiarPermanenciaPct: 75,
          limiarProgressoPct: 75,
          baseAssiduidade: "estrita",
        },
        context: ctx,
      });
    const neg = await correr("auditor", chamar);
    expect(neg.erro).toBeTruthy();
    expect(neg.escritasFeitas).toEqual([]);
    const ok = await correr("coordenador", chamar, { presenca_configuracoes: { data: null, error: null } });
    expect(ok.erro).toBeNull();
    expect(ok.escritasFeitas).toContain("presenca_configuracoes.upsert");
  });

  it("criarWorkshop: anónimo/formando/auditor recusados", async () => {
    const { criarWorkshop } = await import("@/lib/workshops.functions");
    const chamar = (ctx: any) =>
      (criarWorkshop as any).__executar({
        data: {
          tipo: "provincial",
          provincia: "Sofala",
          distrito: null,
          local: null,
          data: null,
          duracaoHoras: 4,
          facilitador: null,
          previstos: 30,
        },
        context: ctx,
      });
    for (const papel of ["anonimo", "formando", "auditor"] as Papel[]) {
      const r = await correr(papel, chamar);
      expect(r.erro, papel).toBeTruthy();
      expect(r.escritasFeitas, papel).toEqual([]);
    }
    const ok = await correr("admin", chamar, { workshops: { data: { id: "w1" }, error: null } });
    expect(ok.erro).toBeNull();
    expect(ok.escritasFeitas).toContain("workshops.insert");
  });

  it("criarRelatorioMensal: auditor recusado, administração grava", async () => {
    const { criarRelatorioMensal } = await import("@/lib/relatorios.functions");
    const chamar = (ctx: any) =>
      (criarRelatorioMensal as any).__executar({
        data: { ano: 2026, mes: 9, provincia: "Maputo" },
        context: ctx,
      });
    const neg = await correr("auditor", chamar);
    expect(neg.erro).toBeTruthy();
    expect(neg.escritasFeitas).toEqual([]);
    const ok = await correr("admin", chamar, { relatorios_mensais: { data: { id: "r1" }, error: null } });
    expect(ok.erro).toBeNull();
    expect(ok.escritasFeitas).toContain("relatorios_mensais.insert");
  });

  it("criarQuestao, actualizarQuestao e guardarConfiguracaoExame: banco fechado a quem não gere", async () => {
    const { criarQuestao, actualizarQuestao, guardarConfiguracaoExame } = await import(
      "@/lib/avaliacao.functions"
    );
    const questao = {
      cursoId: "11111111-1111-1111-1111-111111111111",
      moduloId: null,
      tipologia: "verdadeiro_falso",
      dificuldade: "facil",
      enunciado: "Enunciado de teste apenas para o handler.",
      explicacao: "Explicação de teste.",
      autorNome: "Teste",
      activa: false,
      verdadeiro: true,
    } as any;
    const chamadas: Array<[string, (ctx: any) => Promise<any>, string]> = [
      ["criarQuestao", (ctx) => (criarQuestao as any).__executar({ data: questao, context: ctx }), "banco_questoes.insert"],
      [
        "actualizarQuestao",
        (ctx) =>
          (actualizarQuestao as any).__executar({
            data: { ...questao, id: "22222222-2222-2222-2222-222222222222" },
            context: ctx,
          }),
        "banco_questoes.update",
      ],
      [
        "guardarConfiguracaoExame",
        (ctx) =>
          (guardarConfiguracaoExame as any).__executar({
            data: {
              cursoId: "11111111-1111-1111-1111-111111111111",
              numeroQuestoes: 20,
              minutos: 45,
              pctFacil: 40,
              pctMedia: 40,
              pctDificil: 20,
            },
            context: ctx,
          }),
        "exame_configuracoes.upsert",
      ],
    ];
    for (const [nome, executar, escritaEsperada] of chamadas) {
      for (const papel of ["anonimo", "formando", "auditor"] as Papel[]) {
        const r = await correr(papel, executar);
        expect(r.erro, `${nome}/${papel}`).toBeTruthy();
        expect(r.escritasFeitas, `${nome}/${papel}`).toEqual([]);
      }
      const ok = await correr("admin", executar, {
        banco_questoes: { data: { id: "q1" }, error: null },
        exame_configuracoes: { data: null, error: null },
      });
      expect(ok.erro, nome).toBeNull();
      expect(ok.escritasFeitas, nome).toContain(escritaEsperada);
    }
  });

  it("inscreverFormando: formando de fora não inscreve ninguém", async () => {
    const { inscreverFormando } = await import("@/lib/turmas.functions");
    const chamar = (ctx: any) =>
      (inscreverFormando as any).__executar({
        data: { turmaId: "t1", nome: "Ana", email: null },
        context: ctx,
      });
    for (const papel of ["anonimo", "formando", "auditor"] as Papel[]) {
      const r = await correr(papel, chamar);
      expect(r.erro, papel).toBeTruthy();
      expect(r.escritasFeitas, papel).toEqual([]);
    }
  });

  it("obterDocumentoInstituicao: sem permissão não devolve documento", async () => {
    const { obterDocumentoInstituicao } = await import("@/lib/documentos.functions");
    const chamar = (ctx: any) =>
      (obterDocumentoInstituicao as any).__executar({
        data: { tipo: "declaracao", instituicaoId: "i1" },
        context: ctx,
      });
    for (const papel of ["anonimo", "formando", "auditor"] as Papel[]) {
      const { ctx } = contexto(papel);
      if (papel === "auditor") continue; // o auditor pode ler
      await expect(chamar(ctx)).rejects.toThrow();
    }
  });
});

describe("fluxos pessoais: sessão e titularidade", () => {
  it("emitirCertificado recusa quem não tem perfil na sessão", async () => {
    const { emitirCertificado } = await import("@/lib/formacao.functions");
    const { ctx } = contexto("anonimo");
    await expect(
      (emitirCertificado as any).__executar({
        data: { moduloId: "m1", tokenPessoal: "t", respostas: [] },
        context: ctx,
      }),
    ).rejects.toThrow();
  });

  it("iniciarExame e submeterExame recusam token que não pertence à conta", async () => {
    const { iniciarExame, submeterExame } = await import("@/lib/avaliacao.functions");
    const extra = {
      // formando existe, mas está ligado a OUTRA conta
      formandos: { data: { id: "f1", nome: "Ana", token_pessoal: "tok", perfil_id: "outra-conta" }, error: null },
    };
    const { ctx } = contexto("formando", extra);
    await expect(
      (iniciarExame as any).__executar({
        data: { tokenPessoal: "tok", cursoId: "11111111-1111-1111-1111-111111111111" },
        context: ctx,
      }),
    ).rejects.toThrow();
    await expect(
      (submeterExame as any).__executar({
        data: { tokenPessoal: "tok", tentativaId: "33333333-3333-3333-3333-333333333333" },
        context: ctx,
      }),
    ).rejects.toThrow();
  });
});

// -------------------------------------------------------------------------
describe("inventário: nenhuma função mutadora fica sem sessão e sem guarda", () => {
  const pasta = join(process.cwd(), "src/lib");
  const publicasIntencionais = new Set([
    "submeterQuiz",
    "submeterDiagnostico",
    "registarProgresso",
    "registarProgressoMatricula",
    "inscreverInstituicao",
    "guardarInteresse",
  ]);

  it("toda a função POST exige sessão e passa por uma guarda de autorização", () => {
    const falhas: string[] = [];
    for (const ficheiro of readdirSync(pasta).filter((f) => f.endsWith(".functions.ts"))) {
      const texto = readFileSync(join(pasta, ficheiro), "utf8");
      const blocos = texto.split(/^export const /m).slice(1);
      for (const bloco of blocos) {
        const nome = bloco.split(/[\s=]/)[0] ?? "";
        if (!/createServerFn\(\{\s*method:\s*"POST"/.test(bloco) && !/method: 'POST'/.test(bloco)) continue;
        if (publicasIntencionais.has(nome)) continue;
        const temSessao = /\.middleware\(\[/.test(bloco);
        const temGuarda =
          /exigirGestao\(|exigirGestaoBanco\(|clienteDeEscritaGestao\(|perfil_id|context\.userId/.test(bloco);
        if (!temSessao || !temGuarda) falhas.push(`${ficheiro}:${nome}`);
      }
    }
    expect(falhas).toEqual([]);
  });
});
