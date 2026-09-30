/**
 * Relatório de participação por formando: nome e conclusão das aulas.
 * Lê com a sessão de quem pede; as regras de acesso existentes (equipa de
 * formação e administração) decidem que inscrições são visíveis.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LinhaParticipacao = {
  inscricaoId: string;
  nome: string;
  curso: string;
  turma: string;
  provincia: string;
  distrito: string;
  estadoInscricao: string;
  aulasConcluidas: number;
  aulasTotal: number;
  conclusaoPct: number | null;
  ultimaConclusao: string | null;
};

export const obterRelatorioParticipacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [insc, turmas, cursos, cm] = await Promise.all([
      sb.from("turma_inscricoes").select("id,turma_id,nome,estado").order("nome"),
      sb.from("turmas").select("id,designacao,curso_id,provincia,distrito"),
      sb.from("cursos").select("id,titulo"),
      sb.from("curso_modulos").select("curso_id,modulo_id"),
    ]);
    for (const r of [insc, turmas, cursos, cm]) if (r.error) throw new Error(r.error.message);

    const modulos = [...new Set((cm.data ?? []).map((r) => r.modulo_id))];
    const licoes = modulos.length
      ? await sb.from("licoes").select("id,modulo_id").in("modulo_id", modulos)
      : { data: [], error: null };
    if (licoes.error) throw new Error(licoes.error.message);

    const ids = (insc.data ?? []).map((i) => i.id);
    const prog = ids.length
      ? await sb.from("progresso_licoes_matricula").select("inscricao_id,licao_id,concluida_em").in("inscricao_id", ids)
      : { data: [], error: null };
    if (prog.error) throw new Error(prog.error.message);

    const licoesPorModulo = new Map<string, string[]>();
    for (const l of licoes.data ?? []) licoesPorModulo.set(l.modulo_id, [...(licoesPorModulo.get(l.modulo_id) ?? []), l.id]);
    const licoesCurso = new Map<string, Set<string>>();
    for (const r of cm.data ?? []) {
      const s = licoesCurso.get(r.curso_id) ?? new Set<string>();
      for (const id of licoesPorModulo.get(r.modulo_id) ?? []) s.add(id);
      licoesCurso.set(r.curso_id, s);
    }
    const turma = new Map((turmas.data ?? []).map((t) => [t.id, t]));
    const curso = new Map((cursos.data ?? []).map((c) => [c.id, c.titulo]));

    return (insc.data ?? []).map((i): LinhaParticipacao => {
      const t = turma.get(i.turma_id);
      const doCurso = t ? licoesCurso.get(t.curso_id) ?? new Set<string>() : new Set<string>();
      const feitas = (prog.data ?? []).filter((p) => p.inscricao_id === i.id && doCurso.has(p.licao_id));
      const unicas = new Set(feitas.map((p) => p.licao_id)).size;
      const ultima = feitas.map((p) => p.concluida_em).sort().at(-1) ?? null;
      return {
        inscricaoId: i.id,
        nome: i.nome,
        curso: t ? curso.get(t.curso_id) ?? "" : "",
        turma: t?.designacao ?? "",
        provincia: t?.provincia ?? "",
        distrito: t?.distrito ?? "",
        estadoInscricao: i.estado,
        aulasConcluidas: unicas,
        aulasTotal: doCurso.size,
        conclusaoPct: doCurso.size ? Math.round((unicas / doCurso.size) * 1000) / 10 : null,
        ultimaConclusao: ultima,
      };
    });
  });
