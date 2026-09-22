/**
 * Importação, pela área reservada, dos dois pacotes de conteúdos já preparados.
 *
 * Limites deste ficheiro:
 *  - Os dados a importar NUNCA vêm do cliente. São montados no servidor, a
 *    partir do módulo `.server` privado, dentro do próprio handler (assim os
 *    enunciados e gabaritos não entram no pacote enviado ao navegador).
 *  - O cliente só envia qual dos dois pacotes quer e a impressão digital
 *    (hash) do estado que viu na pré-visualização.
 *  - A sessão e o perfil «Administrador Geral Ologa» são revalidados no
 *    servidor em cada chamada, e outra vez dentro da base de dados: as funções
 *    da base são SECURITY INVOKER, pelo que as políticas decidem sempre.
 *  - Nenhuma resposta devolve enunciados, opções ou gabaritos: só contagens.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type EstadoPacote = {
  pacote: "seguranca-cibernetica" | "banco-inteligencia-artificial";
  hash: string;
  resumo: Record<string, unknown>;
  previsto: Record<string, unknown>;
  erro: string | null;
};

type Contexto = { supabase: any; userId: string };

async function exigirAdministradorGeral(context: Contexto) {
  if (!context?.userId) throw new Error("SEM_SESSAO");
  const { data, error } = await context.supabase
    .from("perfis")
    .select("papel")
    .eq("id", context.userId)
    .maybeSingle();
  if (error) throw new Error("SEM_PERMISSAO_ADMIN_GERAL");
  if ((data as { papel?: string } | null)?.papel !== "admin_ologa") {
    throw new Error("SEM_PERMISSAO_ADMIN_GERAL");
  }
}

/** Verificação de preparação: o que está na base e o que o pacote traria. */
export const estadoConteudosPreparados = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EstadoPacote[]> => {
    await exigirAdministradorGeral(context as unknown as Contexto);
    const sb = (context as unknown as Contexto).supabase;
    const preparados = await import("./conteudos-preparados.server");

    const resultados: EstadoPacote[] = [];

    // Pacote 1 — Segurança Cibernética Avançada.
    {
      const { data, error } = await sb.rpc("rpc_estado_seguranca_cibernetica");
      let previsto: Record<string, unknown> = {};
      let erro: string | null = error ? error.message : null;
      try {
        const p = preparados.payloadSeguranca();
        previsto = {
          licoes: p.licoes.length,
          modulos: p.modulos.length,
          minutos_licoes: p.licoes.reduce((s, l) => s + l.minutos, 0),
          transversal_minutos: p.transversal_minutos,
          minutos_avaliacao: p.curso.minutos_avaliacao_orientacao,
          horas: p.curso.carga_horaria,
        };
      } catch (e) {
        erro = erro ?? (e as Error).message;
      }
      const estado = (data ?? {}) as Record<string, unknown>;
      resultados.push({
        pacote: "seguranca-cibernetica",
        hash: (estado["hash"] as string) ?? "",
        resumo: estado,
        previsto,
        erro,
      });
    }

    // Pacote 2 — banco de avaliação de Inteligência Artificial.
    {
      const { data, error } = await sb.rpc("rpc_estado_banco_ia");
      let previsto: Record<string, unknown> = {};
      let erro: string | null = error ? error.message : null;
      try {
        previsto = preparados.resumoBancoIA() as unknown as Record<string, unknown>;
      } catch (e) {
        erro = erro ?? (e as Error).message;
      }
      const estado = (data ?? {}) as Record<string, unknown>;
      resultados.push({
        pacote: "banco-inteligencia-artificial",
        hash: (estado["hash"] as string) ?? "",
        resumo: estado,
        previsto,
        erro,
      });
    }

    return resultados;
  });

export type ResultadoImportacao = {
  ok: boolean;
  detalhe: Record<string, unknown> | null;
  erro: string | null;
};

/** Mensagens em português, a partir dos códigos de erro da base de dados. */
export function explicarErro(mensagem: string): string {
  if (mensagem.includes("SEM_PERMISSAO_ADMIN_GERAL"))
    return "Esta acção é exclusiva do perfil Administrador Geral Ologa.";
  if (mensagem.includes("SEM_SESSAO")) return "A sessão terminou. Entre outra vez.";
  if (mensagem.includes("ESTADO_ALTERADO"))
    return "Os dados na plataforma mudaram desde a verificação que está no ecrã. Nada foi gravado: verifique outra vez.";
  if (mensagem.includes("CONFLITO_CONTEUDO_EXISTENTE"))
    return "Já existe conteúdo diferente em pelo menos uma lição. Nada foi gravado e nada foi substituído.";
  if (mensagem.includes("CONFLITO_QUESTOES_EM_USO"))
    return "Há questões já em uso ou já revistas. Nada foi gravado.";
  if (mensagem.includes("MODULO_PARTILHADO_COM_OUTRO_CURSO"))
    return "Um dos módulos está ligado a outro curso. Nada foi gravado.";
  if (mensagem.includes("MINUTOS_INCOERENTES"))
    return "As horas do pacote não fecham em 30 horas. Nada foi gravado.";
  if (mensagem.includes("PAYLOAD") || mensagem.includes("INVALID") || mensagem.includes("MATRIZ"))
    return "O pacote preparado não passou na verificação da base de dados. Nada foi gravado.";
  if (mensagem.includes("permission denied") || mensagem.includes("row-level security"))
    return "A base de dados recusou a escrita para esta conta. Nada foi gravado.";
  return "Não foi possível importar. Nada foi gravado.";
}

export const importarConteudosPreparados = createServerFn({ method: "POST" })
  .inputValidator((input: { pacote: string; hash: string }) => {
    if (input?.pacote !== "seguranca-cibernetica" && input?.pacote !== "banco-inteligencia-artificial") {
      throw new Error("PACOTE_DESCONHECIDO");
    }
    if (typeof input.hash !== "string" || input.hash.length < 8) throw new Error("ESTADO_ALTERADO");
    return { pacote: input.pacote, hash: input.hash };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }): Promise<ResultadoImportacao> => {
    try {
      await exigirAdministradorGeral(context as unknown as Contexto);
    } catch (e) {
      return { ok: false, detalhe: null, erro: explicarErro((e as Error).message) };
    }
    const sb = (context as unknown as Contexto).supabase;
    const preparados = await import("./conteudos-preparados.server");

    try {
      if (data.pacote === "seguranca-cibernetica") {
        const payload = preparados.payloadSeguranca();
        const { data: res, error } = await sb.rpc("rpc_importar_seguranca_cibernetica", {
          _payload: payload,
          _hash_estado: data.hash,
        });
        if (error) return { ok: false, detalhe: null, erro: explicarErro(error.message) };
        return { ok: true, detalhe: res as Record<string, unknown>, erro: null };
      }

      const payload = preparados.payloadBancoIA();
      const { data: res, error } = await sb.rpc("rpc_importar_banco_ia", {
        _payload: payload,
        _hash_estado: data.hash,
      });
      if (error) return { ok: false, detalhe: null, erro: explicarErro(error.message) };
      return { ok: true, detalhe: res as Record<string, unknown>, erro: null };
    } catch (e) {
      return { ok: false, detalhe: null, erro: explicarErro((e as Error).message) };
    }
  });
