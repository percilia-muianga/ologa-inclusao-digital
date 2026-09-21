// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// O hook chama funções de servidor; aqui são substituídas para poder testar
// falha de gravação e troca de conta sem tocar em base de dados nenhuma.
const marcar = vi.fn();
const listar = vi.fn();
const obter = vi.fn();

vi.mock("@tanstack/react-start", () => ({
  useServerFn: (fn: unknown) => fn,
}));
vi.mock("@/lib/progresso.functions", () => ({
  listarMatriculasProprias: (...a: unknown[]) => listar(...a),
  obterProgressoMatricula: (...a: unknown[]) => obter(...a),
  marcarLicaoMatricula: (...a: unknown[]) => marcar(...a),
}));
const sessao = { data: { perfil: { id: "pessoa-a" } } };
vi.mock("@/hooks/use-sessao", () => ({ useSessao: () => sessao }));

import { useProgressoMatricula } from "../use-progresso-matricula";

const MAT_A = { inscricaoId: "insc-a", turmaDesignacao: "Turma A", cursoSlug: "curso-a" };
const MAT_B = { inscricaoId: "insc-b", turmaDesignacao: "Turma B", cursoSlug: "curso-b" };

function envolver() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  listar.mockImplementation(({ data }: { data: { cursoSlug: string | null } }) =>
    Promise.resolve(data.cursoSlug === "curso-b" ? [MAT_B] : [MAT_A]),
  );
  obter.mockResolvedValue({ licoesConcluidas: [] });
});

describe("useProgressoMatricula", () => {
  it("assinala erro quando a gravação falha e não finge que guardou", async () => {
    marcar.mockRejectedValueOnce(new Error("rede"));
    const { result } = renderHook(() => useProgressoMatricula("curso-a", "mod-1"), {
      wrapper: envolver(),
    });
    await waitFor(() => expect(result.current.matricula?.inscricaoId).toBe("insc-a"));

    let devolveu: boolean | undefined;
    await act(async () => {
      devolveu = await result.current.guardar("licao-1");
    });
    expect(devolveu).toBe(false);
    expect(result.current.estado).toBe("erro");
  });

  it("tentar de novo grava a mesma lição e passa a guardado", async () => {
    marcar.mockRejectedValueOnce(new Error("rede")).mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useProgressoMatricula("curso-a", "mod-1"), {
      wrapper: envolver(),
    });
    await waitFor(() => expect(result.current.matricula?.inscricaoId).toBe("insc-a"));

    await act(async () => {
      await result.current.guardar("licao-1");
    });
    expect(result.current.estado).toBe("erro");

    await act(async () => {
      result.current.tentarDeNovo();
    });
    await waitFor(() => expect(result.current.estado).toBe("guardado"));
    expect(marcar).toHaveBeenLastCalledWith({
      data: { inscricaoId: "insc-a", licaoId: "licao-1" },
    });
  });

  it("resposta atrasada de outra matrícula não contamina a matrícula actual", async () => {
    let resolver: (v: unknown) => void = () => {};
    marcar.mockImplementationOnce(() => new Promise((r) => (resolver = r)));

    const { result, rerender } = renderHook(
      ({ curso }: { curso: string }) => useProgressoMatricula(curso, "mod-1"),
      { wrapper: envolver(), initialProps: { curso: "curso-a" } },
    );
    await waitFor(() => expect(result.current.matricula?.inscricaoId).toBe("insc-a"));

    let promessa: Promise<boolean> | undefined;
    act(() => {
      promessa = result.current.guardar("licao-1");
    });
    expect(result.current.estado).toBe("a-guardar");

    // A pessoa muda de curso/matrícula antes de a gravação anterior responder.
    rerender({ curso: "curso-b" });
    await waitFor(() => expect(result.current.matricula?.inscricaoId).toBe("insc-b"));
    expect(result.current.estado).toBe("inactivo");

    await act(async () => {
      resolver({ ok: true });
      await promessa;
    });
    // A resposta tardia pertence à matrícula anterior: não muda o estado desta.
    expect(result.current.estado).toBe("inactivo");
  });

  it("sem matrícula não grava nada no servidor", async () => {
    listar.mockResolvedValue([]);
    const { result } = renderHook(() => useProgressoMatricula("curso-a", "mod-1"), {
      wrapper: envolver(),
    });
    await waitFor(() => expect(result.current.aCarregar).toBe(false));
    let devolveu: boolean | undefined;
    await act(async () => {
      devolveu = await result.current.guardar("licao-1");
    });
    expect(devolveu).toBe(false);
    expect(marcar).not.toHaveBeenCalled();
  });
});
