/**
 * Relatório de participação: resumo por formando e detalhe por lição.
 * Lê com a sessão de quem pede; as regras de acesso existentes (equipa de
 * formação e administração) decidem que inscrições são visíveis.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { montarParticipacao } from "./participacao";

export type { LinhaParticipacao, LinhaDetalhe } from "./participacao";

export const obterRelatorioParticipacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [insc, turmas, cursos, cm, mods] = await Promise.all([
      sb.from("turma_inscricoes").select("id,turma_id,nome,estado").order("nome"),
      sb.from("turmas").select("id,designacao,curso_id,provincia,distrito"),
      sb.from("cursos").select("id,titulo"),
      sb.from("curso_modulos").select("curso_id,modulo_id,ordem"),
      sb.from("modulos").select("id,titulo"),
    ]);
    for (const r of [insc, turmas, cursos, cm, mods]) if (r.error) throw new Error(r.error.message);

    const modulos = [...new Set((cm.data ?? []).map((r) => r.modulo_id))];
    const licoes = modulos.length
      ? await sb.from("licoes").select("id,modulo_id,ordem,titulo").in("modulo_id", modulos)
      : { data: [], error: null };
    if (licoes.error) throw new Error(licoes.error.message);

    const ids = (insc.data ?? []).map((i) => i.id);
    const prog = ids.length
      ? await sb.from("progresso_licoes_matricula").select("inscricao_id,licao_id,concluida_em").in("inscricao_id", ids)
      : { data: [], error: null };
    if (prog.error) throw new Error(prog.error.message);

    return montarParticipacao({
      inscricoes: insc.data ?? [],
      turmas: turmas.data ?? [],
      cursos: cursos.data ?? [],
      cursoModulos: cm.data ?? [],
      modulos: mods.data ?? [],
      licoes: licoes.data ?? [],
      progresso: prog.data ?? [],
    });
  });
