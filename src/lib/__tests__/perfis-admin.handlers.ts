/**
 * Testes isolados dos HANDLERS REAIS de criação/alteração da ficha de uma
 * conta existente. Nenhuma conta real, nenhuma ligação à base do projecto:
 * createServerFn, o servidor de confiança e o cliente autenticado são todos
 * simulados. Nada é executado em produção.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@tanstack/react-start", () => {
  const criar = () => {
    const estado: { temMiddleware: boolean } = { temMiddleware: false };
    const api: any = {
      middleware: () => {
        estado.temMiddleware = true;
        return api;
      },
      inputValidator: () => api,
      validator: () => api,
      handler: (fn: Function) => {
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

const CONTAS = [
  {
    id: "conta-gmail",
    email: "Pessoa.Exemplo@Gmail.com",
    email_confirmed_at: "2026-09-18T00:00:00Z",
    user_metadata: { nome: "Nome Da Conta" },
  },
  {
    id: "conta-por-confirmar",
    email: "por.confirmar@exemplo.com",
    email_confirmed_at: null,
    user_metadata: {},
  },
];

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    auth: { admin: { listUsers: async () => ({ data: { users: CONTAS }, error: null }) } },
    from: () => {
      throw new Error("O servidor de confiança não pode gravar fichas nesta acção");
    },
  },
}));

import { prepararPerfilDeConta, definirPerfilDeConta } from "../perfis-admin.functions";

type Linha = Record<string, any> | null;

/** Cliente autenticado simulado: perfis do actor e da conta alvo. */
function criarCliente(perfis: Record<string, Linha>, escritas: any[]) {
  return {
    from: (tabela: string) => {
      let alvo: string | null = null;
      const cadeia: any = {
        select: () => cadeia,
        eq: (_col: string, v: string) => {
          alvo = v;
          return cadeia;
        },
        maybeSingle: async () => ({ data: (alvo && perfis[alvo]) || null, error: null }),
        insert: async (linha: any) => {
          escritas.push({ tabela, op: "insert", linha });
          return { error: null };
        },
        update: (linha: any) => {
          escritas.push({ tabela, op: "update", linha });
          return { eq: async () => ({ error: null }) };
        },
      };
      return cadeia;
    },
  };
}

const ADMIN = { id: "actor-admin", papel: "admin_ologa", nome: "Admin", email: "a@b.c" };
const COORD = { id: "actor-coord", papel: "formando", nome: "C", email: "c@b.c" };

let escritas: any[] = [];
beforeEach(() => {
  escritas = [];
});

function contexto(actorId: string, perfis: Record<string, Linha>) {
  return { userId: actorId, supabase: criarCliente(perfis, escritas) };
}

describe("ficha de conta existente — preparação e gravação", () => {
  it("exige sessão: sem conta autenticada é recusado antes de qualquer consulta", async () => {
    await expect(
      (prepararPerfilDeConta as any).__executar({
        context: { userId: null, supabase: null },
        data: { email: "pessoa.exemplo@gmail.com", papel: "admin_ologa" },
      }),
    ).rejects.toThrow("SEM_SESSAO");
    expect(escritas).toHaveLength(0);
  });

  it("nega quem não é Administrador Geral, mesmo autenticado", async () => {
    await expect(
      (definirPerfilDeConta as any).__executar({
        context: contexto("actor-coord", { "actor-coord": COORD }),
        data: { email: "pessoa.exemplo@gmail.com", papel: "admin_ologa" },
      }),
    ).rejects.toThrow("SEM_PERMISSAO_ADMIN_GERAL");
    expect(escritas).toHaveLength(0);
  });

  it("o Administrador Geral prepara a ficha e vê o antes e o depois, sem gravar", async () => {
    const r = await (prepararPerfilDeConta as any).__executar({
      context: contexto("actor-admin", { "actor-admin": ADMIN }),
      data: { email: "  PESSOA.EXEMPLO@gmail.com  ", papel: "admin_ologa" },
    });
    expect(r.conta.id).toBe("conta-gmail");
    expect(r.conta.email).toBe("pessoa.exemplo@gmail.com");
    expect(r.perfilActual).toBeNull();
    expect(r.perfilProposto).toEqual({
      nome: "Nome Da Conta",
      email: "pessoa.exemplo@gmail.com",
      papel: "admin_ologa",
    });
    expect(r.operacao).toBe("criar");
    expect(escritas).toHaveLength(0);
  });

  it("ignora qualquer identificador vindo do cliente: só o email resolve a conta", async () => {
    const r = await (prepararPerfilDeConta as any).__executar({
      context: contexto("actor-admin", { "actor-admin": ADMIN }),
      data: {
        email: "pessoa.exemplo@gmail.com",
        papel: "admin_ologa",
        id: "conta-inventada",
        actorId: "outro",
      } as any,
    });
    expect(r.conta.id).toBe("conta-gmail");
  });

  it("recusa email inexistente e email por confirmar, sem escrever", async () => {
    const ctx = () => contexto("actor-admin", { "actor-admin": ADMIN });
    await expect(
      (definirPerfilDeConta as any).__executar({
        context: ctx(),
        data: { email: "ninguem@exemplo.com", papel: "admin_ologa" },
      }),
    ).rejects.toThrow("CONTA_INEXISTENTE");
    await expect(
      (definirPerfilDeConta as any).__executar({
        context: ctx(),
        data: { email: "por.confirmar@exemplo.com", papel: "admin_ologa" },
      }),
    ).rejects.toThrow("EMAIL_NAO_CONFIRMADO");
    expect(escritas).toHaveLength(0);
  });

  it("recusa perfis fora da lista permitida", async () => {
    await expect(
      (definirPerfilDeConta as any).__executar({
        context: contexto("actor-admin", { "actor-admin": ADMIN }),
        data: { email: "pessoa.exemplo@gmail.com", papel: "admin_atdi" },
      }),
    ).rejects.toThrow("PERFIL_NAO_PERMITIDO");
    expect(escritas).toHaveLength(0);
  });

  it("grava com o cliente autenticado (autor real no gatilho), nunca com o servidor de confiança", async () => {
    const r = await (definirPerfilDeConta as any).__executar({
      context: contexto("actor-admin", { "actor-admin": ADMIN }),
      data: { email: "pessoa.exemplo@gmail.com", papel: "admin_ologa" },
    });
    expect(r).toEqual({ operacao: "criado", id: "conta-gmail", papel: "admin_ologa" });
    expect(escritas).toEqual([
      {
        tabela: "perfis",
        op: "insert",
        linha: {
          id: "conta-gmail",
          nome: "Nome Da Conta",
          email: "pessoa.exemplo@gmail.com",
          papel: "admin_ologa",
        },
      },
    ]);
  });

  it("é idempotente: ficha já com o perfil pedido não é reescrita", async () => {
    const r = await (definirPerfilDeConta as any).__executar({
      context: contexto("actor-admin", {
        "actor-admin": ADMIN,
        "conta-gmail": { nome: "Nome Da Conta", email: "pessoa.exemplo@gmail.com", papel: "admin_ologa" },
      }),
      data: { email: "pessoa.exemplo@gmail.com", papel: "admin_ologa" },
    });
    expect(r.operacao).toBe("sem_alteracao");
    expect(escritas).toHaveLength(0);
  });
});
