import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Catálogo: módulos com progresso ----------

export const listarCatalogo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: modulos, error } = await supabase
      .from("modulos")
      .select("id, ordem, titulo, nivel, duracao, descricao, desenho_universal")
      .order("ordem", { ascending: true });
    if (error) throw error;

    const moduloIds = modulos.map((m) => m.id);
    const { data: licoes } = await supabase
      .from("licoes")
      .select("id, modulo_id")
      .in("modulo_id", moduloIds);

    const { data: progresso } = await supabase
      .from("progresso_licoes")
      .select("licao_id")
      .eq("perfil_id", userId);

    const concluidas = new Set((progresso ?? []).map((p) => p.licao_id));
    const licoesPorModulo = new Map<string, string[]>();
    for (const l of licoes ?? []) {
      const arr = licoesPorModulo.get(l.modulo_id) ?? [];
      arr.push(l.id);
      licoesPorModulo.set(l.modulo_id, arr);
    }

    return modulos.map((m) => {
      const ids = licoesPorModulo.get(m.id) ?? [];
      const total = ids.length;
      const feitas = ids.filter((id) => concluidas.has(id)).length;
      return { ...m, total_licoes: total, licoes_concluidas: feitas };
    });
  });

// ---------- Módulo (por ordem) ----------

export const obterModulo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ordem: z.number().int().positive() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: modulo, error } = await supabase
      .from("modulos")
      .select("id, ordem, titulo, nivel, duracao, descricao, desenho_universal")
      .eq("ordem", data.ordem)
      .maybeSingle();
    if (error) throw error;
    if (!modulo) return null;

    const { data: licoes } = await supabase
      .from("licoes")
      .select("id, ordem, titulo, duracao")
      .eq("modulo_id", modulo.id)
      .order("ordem", { ascending: true });

    const licaoIds = (licoes ?? []).map((l) => l.id);
    const { data: prog } = await supabase
      .from("progresso_licoes")
      .select("licao_id")
      .eq("perfil_id", userId)
      .in("licao_id", licaoIds.length ? licaoIds : ["00000000-0000-0000-0000-000000000000"]);
    const concluidas = new Set((prog ?? []).map((p) => p.licao_id));

    const { count: totalPerguntas } = await supabase
      .from("quiz_perguntas")
      .select("id", { count: "exact", head: true })
      .eq("modulo_id", modulo.id);

    const { data: tentativas } = await supabase
      .from("progresso_quizzes")
      .select("pontuacao, total, tentado_em")
      .eq("perfil_id", userId)
      .eq("modulo_id", modulo.id)
      .order("tentado_em", { ascending: false })
      .limit(1);

    return {
      modulo,
      licoes: (licoes ?? []).map((l) => ({ ...l, concluida: concluidas.has(l.id) })),
      total_perguntas: totalPerguntas ?? 0,
      ultima_tentativa: tentativas?.[0] ?? null,
    };
  });

// ---------- Lição (por ordem do módulo + ordem da lição) ----------

export const obterLicao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        modulo_ordem: z.number().int().positive(),
        licao_ordem: z.number().int().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: modulo } = await supabase
      .from("modulos")
      .select("id, ordem, titulo")
      .eq("ordem", data.modulo_ordem)
      .maybeSingle();
    if (!modulo) return null;

    const { data: licoes } = await supabase
      .from("licoes")
      .select("id, ordem, titulo, duracao, ilustracao_svg, conteudo_elearning, guiao_formador")
      .eq("modulo_id", modulo.id)
      .order("ordem", { ascending: true });

    const lista = licoes ?? [];
    const idx = lista.findIndex((l) => l.ordem === data.licao_ordem);
    if (idx === -1) return null;
    const licao = lista[idx];

    const { data: prog } = await supabase
      .from("progresso_licoes")
      .select("concluida_em")
      .eq("perfil_id", userId)
      .eq("licao_id", licao.id)
      .maybeSingle();

    return {
      modulo,
      licao,
      concluida: !!prog,
      anterior: idx > 0 ? { ordem: lista[idx - 1].ordem, titulo: lista[idx - 1].titulo } : null,
      seguinte:
        idx < lista.length - 1
          ? { ordem: lista[idx + 1].ordem, titulo: lista[idx + 1].titulo }
          : null,
      e_ultima: idx === lista.length - 1,
    };
  });

// ---------- Marcar lição como concluída ----------

export const marcarLicaoConcluida = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ licao_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: perfil } = await supabase
      .from("perfis")
      .select("papel")
      .eq("id", userId)
      .maybeSingle();
    if (perfil?.papel !== "formando") {
      return { ok: true, modo_pre_visualizacao: true };
    }
    const { error } = await supabase
      .from("progresso_licoes")
      .upsert(
        { perfil_id: userId, licao_id: data.licao_id },
        { onConflict: "perfil_id,licao_id", ignoreDuplicates: true },
      );
    if (error) throw error;
    return { ok: true, modo_pre_visualizacao: false };
  });


// ---------- Quiz: perguntas (sem revelar resposta correta) ----------

export const obterQuiz = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ modulo_ordem: z.number().int().positive() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: modulo } = await supabase
      .from("modulos")
      .select("id, ordem, titulo")
      .eq("ordem", data.modulo_ordem)
      .maybeSingle();
    if (!modulo) return null;

    const { data: perguntas, error: pErr } = await supabase
      .from("quiz_perguntas")
      .select("id, pergunta, opcoes")
      .eq("modulo_id", modulo.id)
      .order("id", { ascending: true });
    console.log("[obterQuiz] perguntas.len=", perguntas?.length, "err=", pErr);

    const { data: tentativas } = await supabase
      .from("progresso_quizzes")
      .select("pontuacao, total, tentado_em")
      .eq("perfil_id", userId)
      .eq("modulo_id", modulo.id)
      .order("tentado_em", { ascending: false })
      .limit(1);

    return {
      modulo,
      perguntas: (perguntas ?? []).map((p) => ({
        id: p.id,
        pergunta: p.pergunta,
        opcoes: p.opcoes as string[],
      })),
      ultima_tentativa: tentativas?.[0] ?? null,
      _debug: { perguntas_len: perguntas?.length ?? 0, err: pErr ? JSON.stringify(pErr) : null },
    };
  });

// ---------- Submeter quiz ----------

export const submeterQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        modulo_ordem: z.number().int().positive(),
        respostas: z.record(z.string().uuid(), z.number().int().min(0)),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verifica o papel primeiro. Em pré-visualização (admin/gestor) não pontua
    // nem grava — devolve apenas a flag para a UI mostrar a mensagem.
    const { data: perfil } = await supabase
      .from("perfis")
      .select("papel")
      .eq("id", userId)
      .maybeSingle();

    if (perfil?.papel !== "formando") {
      return { modo_pre_visualizacao: true as const };
    }

    const { data: modulo } = await supabase
      .from("modulos")
      .select("id")
      .eq("ordem", data.modulo_ordem)
      .maybeSingle();
    if (!modulo) throw new Error("Módulo não encontrado");

    // A coluna `resposta_correta_indice` não está concedida ao papel
    // `authenticated` (é intencional — esconde a resposta correta do cliente).
    // A correção precisa do service_role para a ler.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: perguntas, error: perguntasErr } = await supabaseAdmin
      .from("quiz_perguntas")
      .select("id, resposta_correta_indice")
      .eq("modulo_id", modulo.id);
    if (perguntasErr) throw perguntasErr;

    const lista = perguntas ?? [];
    let pontuacao = 0;
    for (const p of lista) {
      if (data.respostas[p.id] === p.resposta_correta_indice) pontuacao += 1;
    }
    const total = lista.length;

    const { error } = await supabase.from("progresso_quizzes").insert({
      perfil_id: userId,
      modulo_id: modulo.id,
      pontuacao,
      total,
    });
    if (error) throw error;

    return { modo_pre_visualizacao: false as const, pontuacao, total };
  });

