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

/** Valores simples, seguros de enviar ao navegador. */
export type Json = string | number | boolean | null | Json[] | { [chave: string]: Json };

export type EstadoPacote = {
  pacote:
    | "seguranca-cibernetica"
    | "banco-inteligencia-artificial"
    | "tecnologias-governo"
    | "redes"
    | "banco-seguranca-cibernetica"
    | "banco-tecnologias-governo"
    | "banco-redes";
  hash: string;
  resumo: { [chave: string]: Json };
  previsto: { [chave: string]: Json };
  erro: string | null;
};

type PacoteBanco = "banco-seguranca-cibernetica" | "banco-tecnologias-governo" | "banco-redes";

/** Nomes das funções da base propostas em docs/migracoes-por-autorizar/bancos-sc-governo-redes.sql. */
export const RPC_BANCOS: Record<PacoteBanco, { estado: string; importar: string }> = {
  "banco-seguranca-cibernetica": { estado: "rpc_estado_banco_sc", importar: "rpc_importar_banco_sc" },
  "banco-tecnologias-governo": { estado: "rpc_estado_banco_tdg", importar: "rpc_importar_banco_tdg" },
  "banco-redes": { estado: "rpc_estado_banco_redes", importar: "rpc_importar_banco_redes" },
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
      let previsto: { [chave: string]: Json } = {};
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
      const estado = (data ?? {}) as { [chave: string]: Json };
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
      let previsto: { [chave: string]: Json } = {};
      let erro: string | null = error ? error.message : null;
      try {
        previsto = preparados.resumoBancoIA() as unknown as { [chave: string]: Json };
      } catch (e) {
        erro = erro ?? (e as Error).message;
      }
      const estado = (data ?? {}) as { [chave: string]: Json };
      resultados.push({
        pacote: "banco-inteligencia-artificial",
        hash: (estado["hash"] as string) ?? "",
        resumo: estado,
        previsto,
        erro,
      });
    }

    // Pacote 3 — Tecnologias Digitais do Governo.
    {
      const { data, error } = await sb.rpc("rpc_estado_tecnologias_governo");
      let previsto: { [chave: string]: Json } = {};
      let erro: string | null = error ? error.message : null;
      try {
        const p = preparados.payloadTecnologiasGoverno();
        previsto = {
          licoes: p.licoes.length,
          minutos_licoes: p.licoes.reduce((s, l) => s + l.minutos, 0),
          transversal_minutos: p.transversal_minutos,
          minutos_avaliacao: p.curso.minutos_avaliacao_orientacao,
          horas: p.curso.carga_horaria,
        };
      } catch (e) {
        erro = erro ?? (e as Error).message;
      }
      const estado = (data ?? {}) as { [chave: string]: Json };
      if (!erro && estado["regra_de_escrita_do_curso"] === false) {
        erro = explicarErro("SEM_REGRA_DE_ESCRITA_CURSO");
      }
      resultados.push({
        pacote: "tecnologias-governo",
        hash: (estado["hash"] as string) ?? "",
        resumo: estado,
        previsto,
        erro,
      });
    }

    // Pacote 4 — Administração de Redes (60 lições, 12 módulos, 80 horas).
    {
      const { data, error } = await sb.rpc("rpc_estado_redes");
      let previsto: { [chave: string]: Json } = {};
      let erro: string | null = error ? explicarErro(error.message) : null;
      try {
        const p = preparados.payloadRedes();
        previsto = {
          licoes: p.licoes.length,
          modulos: p.modulos.length,
          minutos_licoes: p.licoes.reduce((s, l) => s + l.minutos, 0),
          transversal_minutos: p.transversal.minutos,
          minutos_avaliacao: p.curso.minutos_avaliacao_orientacao,
          horas: p.curso.carga_horaria,
        };
      } catch (e) {
        erro = erro ?? (e as Error).message;
      }
      const estado = (data ?? {}) as { [chave: string]: Json };
      if (!erro && estado["regra_de_escrita_do_curso"] === false) {
        erro = explicarErro("SEM_REGRA_DE_ESCRITA_CURSO");
      }
      resultados.push({
        pacote: "redes",
        hash: (estado["hash"] as string) ?? "",
        resumo: estado,
        previsto,
        erro,
      });
    }

    // Pacotes 5 a 7 — bancos privados de SC, Governo e Redes (funções por aprovar).
    for (const [pacote, rpc] of Object.entries(RPC_BANCOS)) {
      const { data, error } = await sb.rpc(rpc.estado);
      let previsto: { [chave: string]: Json } = {};
      let erro: string | null = error ? explicarErro(error.message) : null;
      try {
        previsto = preparados.resumoBanco(pacote as PacoteBanco) as unknown as { [chave: string]: Json };
      } catch (e) {
        erro = erro ?? (e as Error).message;
      }
      const estado = (data ?? {}) as { [chave: string]: Json };
      resultados.push({
        pacote: pacote as PacoteBanco,
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
  detalhe: { [chave: string]: Json } | null;
  erro: string | null;
};

/** Mensagens em português, a partir dos códigos de erro da base de dados. */
export function explicarErro(mensagem: string): string {
  if (mensagem.includes("SEM_PERMISSAO_ADMIN_GERAL"))
    return "Esta acção é exclusiva do perfil Administrador Geral Ologa.";
  if (/rpc_(estado|importar)_banco_(sc|tdg|redes)/.test(mensagem))
    return "A importação deste banco ainda não está autorizada na base de dados (funções por aprovar). Nada foi gravado.";
  if (mensagem.includes("rpc_estado_redes") || mensagem.includes("rpc_importar_redes"))
    return "A importação deste curso ainda não está autorizada na base de dados (funções por aprovar). Nada foi gravado.";
  if (mensagem.includes("IDS_INESPERADOS"))
    return "As identificações do curso, módulos ou lições na plataforma não são as esperadas pelo pacote. Nada foi gravado.";
  if (mensagem.includes("SEM_REGRA_DE_ESCRITA"))
    return "Falta uma regra de escrita da base de dados, só para o Administrador Geral Ologa e só neste curso, na ficha do curso e nas horas dos módulos. Sem ela a importação fica bloqueada. Nada foi gravado.";
  if (mensagem.includes("SEM_SESSAO")) return "A sessão terminou. Entre outra vez.";
  if (mensagem.includes("ESTADO_ALTERADO"))
    return "Os dados na plataforma mudaram desde a verificação que está no ecrã. Nada foi gravado: verifique outra vez.";
  if (mensagem.includes("CONFLITO_CONTEUDO_EXISTENTE"))
    return "Já existe conteúdo diferente em pelo menos uma lição. Nada foi gravado e nada foi substituído.";
  if (mensagem.includes("CONFLITO_QUESTOES_EM_USO"))
    return "Há questões já em uso ou já revistas. Nada foi gravado.";
  if (mensagem.includes("CONFLITO_QUESTOES_DIFERENTES"))
    return "Há questões com o mesmo código já na plataforma, mas diferentes das do pacote. Este pacote nunca substitui revisão humana: nada foi gravado.";
  if (mensagem.includes("CODIGO_INESPERADO_NA_BASE"))
    return "Existem questões deste curso que não pertencem ao pacote preparado. Nada foi gravado.";
  if (mensagem.includes("QUESTOES_SEM_CODIGO"))
    return "Existem questões deste curso sem código estável. Nada foi gravado.";
  if (mensagem.includes("MODULO_NAO_LIGADO_AO_CURSO"))
    return "Um módulo indicado no pacote não está ligado a este curso. Nada foi gravado.";
  if (mensagem.includes("ESTRUTURA_DE_MODULOS_INESPERADA"))
    return "O curso não tem exactamente três módulos temáticos e um transversal. Nada foi gravado.";
  if (mensagem.includes("MODULO_PARTILHADO_COM_OUTRO_CURSO"))
    return "Um dos módulos está ligado a outro curso. Nada foi gravado.";
  if (mensagem.includes("MINUTOS_POR_MODULO_INCOERENTES"))
    return "Os minutos das lições não batem certo com os do respectivo módulo. Nada foi gravado.";
  if (mensagem.includes("MINUTOS_INCOERENTES"))
    return "As horas do pacote não fecham com a carga horária do curso. Nada foi gravado.";
  if (mensagem.includes("PAYLOAD") || mensagem.includes("INVALID") || mensagem.includes("MATRIZ"))
    return "O pacote preparado não passou na verificação da base de dados. Nada foi gravado.";
  if (mensagem.includes("permission denied") || mensagem.includes("row-level security"))
    return "A base de dados recusou a escrita para esta conta (código REGRA_DE_ACESSO). Nada foi gravado.";
  if (mensagem.includes("check constraint"))
    return "Um valor do pacote não é aceite pelas regras da base de dados (código REGRA_DE_VALIDACAO). Nada foi gravado.";
  if (mensagem.includes("duplicate key") || mensagem.includes("unique constraint"))
    return "Já existe um registo com a mesma identificação (código REGISTO_DUPLICADO). Nada foi gravado.";
  if (mensagem.includes("foreign key"))
    return "O pacote refere um registo que não existe na plataforma (código REFERENCIA_INEXISTENTE). Nada foi gravado.";
  return "Não foi possível importar (código ERRO_DESCONHECIDO). Nada foi gravado.";
}

export const importarConteudosPreparados = createServerFn({ method: "POST" })
  .inputValidator((input: { pacote: string; hash: string }) => {
    if (
      input?.pacote !== "seguranca-cibernetica" &&
      input?.pacote !== "banco-inteligencia-artificial" &&
      input?.pacote !== "tecnologias-governo" &&
      input?.pacote !== "redes" &&
      !Object.prototype.hasOwnProperty.call(RPC_BANCOS, input?.pacote)
    ) {
      throw new Error("PACOTE_DESCONHECIDO");
    }
    if (typeof input.hash !== "string" || input.hash.length < 8) throw new Error("ESTADO_ALTERADO");
    return { pacote: input.pacote as string, hash: input.hash };
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
        return { ok: true, detalhe: res as { [chave: string]: Json }, erro: null };
      }

      if (data.pacote === "tecnologias-governo") {
        const payload = preparados.payloadTecnologiasGoverno();
        const { data: res, error } = await sb.rpc("rpc_importar_tecnologias_governo", {
          _payload: payload,
          _hash_estado: data.hash,
        });
        if (error) return { ok: false, detalhe: null, erro: explicarErro(error.message) };
        return { ok: true, detalhe: res as { [chave: string]: Json }, erro: null };
      }

      if (Object.prototype.hasOwnProperty.call(RPC_BANCOS, data.pacote)) {
        const pacote = data.pacote as PacoteBanco;
        const payload = preparados.payloadBanco(pacote);
        const { data: res, error } = await sb.rpc(RPC_BANCOS[pacote].importar, {
          _payload: payload,
          _hash_estado: data.hash,
        });
        if (error) return { ok: false, detalhe: null, erro: explicarErro(error.message) };
        return { ok: true, detalhe: res as { [chave: string]: Json }, erro: null };
      }

      if (data.pacote === "redes") {
        const payload = preparados.payloadRedes();
        const { data: res, error } = await sb.rpc("rpc_importar_redes", {
          _payload: payload,
          _hash_estado: data.hash,
        });
        if (error) return { ok: false, detalhe: null, erro: explicarErro(error.message) };
        return { ok: true, detalhe: res as { [chave: string]: Json }, erro: null };
      }

      const payload = preparados.payloadBancoIA();
      const { data: res, error } = await sb.rpc("rpc_importar_banco_ia", {
        _payload: payload,
        _hash_estado: data.hash,
      });
      if (error) return { ok: false, detalhe: null, erro: explicarErro(error.message) };
      return { ok: true, detalhe: res as { [chave: string]: Json }, erro: null };
    } catch (e) {
      return { ok: false, detalhe: null, erro: explicarErro((e as Error).message) };
    }
  });
