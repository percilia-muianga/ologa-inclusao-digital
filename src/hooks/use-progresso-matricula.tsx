import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listarMatriculasProprias,
  marcarLicaoMatricula,
  obterProgressoMatricula,
  type MatriculaResumo,
} from "@/lib/progresso.functions";
import { useSessao } from "@/hooks/use-sessao";

export type EstadoGravacao = "inactivo" | "a-guardar" | "guardado" | "erro";

/**
 * Progresso por matrícula. Só existe quando há sessão iniciada E matrícula
 * válida no curso em contexto. Sem isso, o progresso continua local e é
 * identificado como tal na interface.
 *
 * Marcar uma lição como feita não gera presença, aprovação nem certificado.
 */
export function useProgressoMatricula(cursoSlug?: string, moduloId?: string) {
  const sessao = useSessao();
  const autenticado = !!sessao.data?.perfil;

  const listar = useServerFn(listarMatriculasProprias);
  const obter = useServerFn(obterProgressoMatricula);
  const marcar = useServerFn(marcarLicaoMatricula);
  const queryClient = useQueryClient();

  const matriculas = useQuery<MatriculaResumo[]>({
    queryKey: ["matriculas", cursoSlug ?? null],
    queryFn: () => listar({ data: { cursoSlug: cursoSlug ?? null } }),
    enabled: autenticado && !!cursoSlug,
    retry: false,
  });

  const matricula = matriculas.data?.[0] ?? null;
  const inscricaoId = matricula?.inscricaoId ?? null;

  const progresso = useQuery<{ licoesConcluidas: string[] }>({
    queryKey: ["progresso-matricula", inscricaoId, moduloId ?? null],
    queryFn: () =>
      obter({ data: { inscricaoId: inscricaoId!, moduloId: moduloId ?? null } }),
    enabled: !!inscricaoId,
    retry: false,
  });

  const [estado, setEstado] = useState<EstadoGravacao>("inactivo");
  const [ultimaLicao, setUltimaLicao] = useState<string | null>(null);

  // Impede que uma resposta atrasada de outra matrícula contamine o estado.
  const matriculaActual = useRef<string | null>(inscricaoId);
  useEffect(() => {
    matriculaActual.current = inscricaoId;
    setEstado("inactivo");
  }, [inscricaoId]);

  const guardar = useCallback(
    async (licaoId: string) => {
      if (!inscricaoId) return false;
      const alvo = inscricaoId;
      setUltimaLicao(licaoId);
      setEstado("a-guardar");
      try {
        await marcar({ data: { inscricaoId: alvo, licaoId } });
        if (matriculaActual.current !== alvo) return true; // resposta tardia: ignorar
        setEstado("guardado");
        await queryClient.invalidateQueries({
          queryKey: ["progresso-matricula", alvo],
        });
        return true;
      } catch {
        if (matriculaActual.current !== alvo) return false;
        setEstado("erro");
        return false;
      }
    },
    [inscricaoId, marcar, queryClient],
  );

  const tentarDeNovo = useCallback(() => {
    if (ultimaLicao) void guardar(ultimaLicao);
  }, [guardar, ultimaLicao]);

  return {
    autenticado,
    matricula,
    aCarregar:
      (autenticado && !!cursoSlug && matriculas.isLoading) || progresso.isLoading,
    falhaLeitura: matriculas.isError || progresso.isError,
    concluidas: new Set(progresso.data?.licoesConcluidas ?? []),
    estado,
    guardar,
    tentarDeNovo,
  };
}
