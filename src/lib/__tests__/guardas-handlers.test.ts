/**
 * Testes isolados das guardas de servidor com sessão e base de dados simuladas.
 * Nenhuma conta real, nenhum dado de produção, nenhuma ligação à base do projecto.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const registos: any[] = [];
let falharAuditoria = false;

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: () => ({
      insert: async (linha: any) => {
        if (falharAuditoria) return { error: { message: "auditoria indisponível" } };
        registos.push(linha);
        return { error: null };
      },
    }),
  },
}));

import { exigirGestao, avaliarGestao } from "@/lib/guardas";

/** Contexto simulado: devolve os papéis e o perfil que o teste definir. */
function contexto(userId: string | null, papeis: string[], perfil: string | null) {
  return {
    userId: userId as string,
    supabase: {
      from: (tabela: string) => {
        const resposta =
          tabela === "utilizador_papeis"
            ? { data: papeis.map((p) => ({ papel: p })) }
            : { data: perfil ? { papel: perfil } : null };
        const api: any = {
          select: () => api,
          eq: () => api,
          maybeSingle: async () => resposta,
          then: (r: any) => Promise.resolve(resposta).then(r),
        };
        return api;
      },
    },
  } as any;
}

beforeEach(() => {
  registos.length = 0;
  falharAuditoria = false;
});

describe("guardas de gestão (handlers)", () => {
  it("anónimo (sem sessão) é recusado antes de qualquer consulta privilegiada", async () => {
    await expect(exigirGestao(contexto(null, [], null), "ler")).rejects.toThrow(
      "SEM_PERMISSAO_GESTAO",
    );
  });

  it("formando não lê nem escreve gestão", async () => {
    const c = contexto("u1", ["formando"], "formando");
    await expect(exigirGestao(c, "ler")).rejects.toThrow("SEM_PERMISSAO_GESTAO");
    await expect(exigirGestao(c, "escrever")).rejects.toThrow("SEM_PERMISSAO_GESTAO");
  });

  it("formador sem escopo verificável é recusado (nega, não concede)", async () => {
    const c = contexto("u2", ["formador"], "formando");
    await expect(exigirGestao(c, "ler")).rejects.toThrow("SEM_PERMISSAO_GESTAO");
    await expect(exigirGestao(c, "escrever")).rejects.toThrow("SEM_PERMISSAO_GESTAO");
  });

  it("supervisor provincial sem escopo verificável é recusado", async () => {
    const c = contexto("u3", ["supervisor_provincial"], "formando");
    await expect(exigirGestao(c, "escrever")).rejects.toThrow("SEM_PERMISSAO_GESTAO");
  });

  it("auditor lê mas nunca escreve", async () => {
    const c = contexto("u4", ["auditor_atdi"], "formando");
    await expect(exigirGestao(c, "ler")).resolves.toMatchObject({ podeLer: true });
    await expect(exigirGestao(c, "escrever")).rejects.toThrow("SEM_PERMISSAO_GESTAO");
  });

  it("coordenador nacional e administração lêem e escrevem", async () => {
    await expect(
      exigirGestao(contexto("u5", ["coordenador_nacional"], "formando"), "escrever"),
    ).resolves.toMatchObject({ podeEscrever: true });
    await expect(
      exigirGestao(contexto("u6", [], "admin_ologa"), "escrever"),
    ).resolves.toMatchObject({ podeEscrever: true });
  });

  it("o papel nunca vem do cliente: só conta o que está na base", () => {
    expect(avaliarGestao([], null)).toEqual({ podeLer: false, podeEscrever: false });
  });

  it("cada decisão fica registada com o actor verificado e o resultado", async () => {
    await expect(exigirGestao(contexto("u7", ["formando"], "formando"), "ler")).rejects.toThrow();
    await exigirGestao(contexto("u8", ["admin_atdi"], "formando"), "escrever", "turmas");
    expect(registos).toHaveLength(2);
    expect(registos[0]).toMatchObject({
      utilizador_id: "u7",
      accao: "leitura_gestao",
      valor_novo: { resultado: "recusado" },
    });
    expect(registos[1]).toMatchObject({
      utilizador_id: "u8",
      accao: "escrita_gestao",
      contexto_actor: "sessao_autenticada",
      valor_novo: { resultado: "permitido", alvo: "turmas" },
    });
    expect(JSON.stringify(registos)).not.toMatch(/token|password|palavra-passe|resposta/i);
  });

  it("se a auditoria falhar, a escrita autorizada é interrompida", async () => {
    falharAuditoria = true;
    await expect(
      exigirGestao(contexto("u9", ["admin_atdi"], "formando"), "escrever"),
    ).rejects.toThrow("AUDITORIA_INDISPONIVEL");
  });

  it("se a auditoria falhar, a recusa continua a ser recusa", async () => {
    falharAuditoria = true;
    await expect(exigirGestao(contexto("u10", [], "formando"), "ler")).rejects.toThrow(
      "SEM_PERMISSAO_GESTAO",
    );
  });
});
