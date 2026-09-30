/**
 * Montagem pura do relatório de participação: resumo por formando e detalhe
 * por formando × curso × turma × módulo × lição. Não lê a base de dados;
 * recebe apenas as linhas que as regras de acesso já deixaram ver.
 */

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

export type LinhaDetalhe = {
  inscricaoId: string;
  nome: string;
  curso: string;
  turma: string;
  modulo: string;
  moduloOrdem: number;
  licao: string;
  licaoOrdem: number;
  concluida: boolean;
  concluidaEm: string | null;
};

export type DadosParticipacao = {
  inscricoes: { id: string; turma_id: string; nome: string; estado: string }[];
  turmas: { id: string; designacao: string; curso_id: string; provincia: string; distrito: string }[];
  cursos: { id: string; titulo: string }[];
  cursoModulos: { curso_id: string; modulo_id: string; ordem: number }[];
  modulos: { id: string; titulo: string }[];
  licoes: { id: string; modulo_id: string; ordem: number; titulo: string }[];
  progresso: { inscricao_id: string; licao_id: string; concluida_em: string }[];
};

export function montarParticipacao(d: DadosParticipacao) {
  const turma = new Map(d.turmas.map((t) => [t.id, t]));
  const curso = new Map(d.cursos.map((c) => [c.id, c.titulo]));
  const modulo = new Map(d.modulos.map((m) => [m.id, m.titulo]));
  const licoesPorModulo = new Map<string, DadosParticipacao["licoes"]>();
  for (const l of d.licoes) licoesPorModulo.set(l.modulo_id, [...(licoesPorModulo.get(l.modulo_id) ?? []), l]);

  // Lições do curso, na ordem do módulo no curso e da lição no módulo. Uma
  // lição partilhada (módulo transversal) conta uma vez por curso.
  const licoesCurso = new Map<string, { licao: DadosParticipacao["licoes"][number]; modTitulo: string; modOrdem: number }[]>();
  for (const cm of [...d.cursoModulos].sort((a, b) => a.ordem - b.ordem)) {
    const lista = licoesCurso.get(cm.curso_id) ?? [];
    const vistos = new Set(lista.map((x) => x.licao.id));
    for (const l of [...(licoesPorModulo.get(cm.modulo_id) ?? [])].sort((a, b) => a.ordem - b.ordem)) {
      if (vistos.has(l.id)) continue;
      lista.push({ licao: l, modTitulo: modulo.get(cm.modulo_id) ?? "", modOrdem: cm.ordem });
    }
    licoesCurso.set(cm.curso_id, lista);
  }

  // Primeira conclusão de cada lição por inscrição.
  const conclusao = new Map<string, string>();
  for (const p of d.progresso) {
    const k = `${p.inscricao_id}|${p.licao_id}`;
    const actual = conclusao.get(k);
    if (!actual || p.concluida_em < actual) conclusao.set(k, p.concluida_em);
  }

  const resumo: LinhaParticipacao[] = [];
  const detalhe: LinhaDetalhe[] = [];
  for (const i of [...d.inscricoes].sort((a, b) => a.nome.localeCompare(b.nome, "pt"))) {
    const t = turma.get(i.turma_id);
    const cursoTitulo = t ? curso.get(t.curso_id) ?? "" : "";
    const lista = t ? licoesCurso.get(t.curso_id) ?? [] : [];
    let feitas = 0;
    let ultima: string | null = null;
    for (const { licao, modTitulo, modOrdem } of lista) {
      const em = conclusao.get(`${i.id}|${licao.id}`) ?? null;
      if (em) {
        feitas++;
        if (!ultima || em > ultima) ultima = em;
      }
      detalhe.push({
        inscricaoId: i.id,
        nome: i.nome,
        curso: cursoTitulo,
        turma: t?.designacao ?? "",
        modulo: modTitulo,
        moduloOrdem: modOrdem,
        licao: licao.titulo,
        licaoOrdem: licao.ordem,
        concluida: !!em,
        concluidaEm: em,
      });
    }
    resumo.push({
      inscricaoId: i.id,
      nome: i.nome,
      curso: cursoTitulo,
      turma: t?.designacao ?? "",
      provincia: t?.provincia ?? "",
      distrito: t?.distrito ?? "",
      estadoInscricao: i.estado,
      aulasConcluidas: feitas,
      aulasTotal: lista.length,
      conclusaoPct: lista.length ? Math.round((feitas / lista.length) * 1000) / 10 : null,
      ultimaConclusao: ultima,
    });
  }
  return { resumo, detalhe };
}

// ---------- exportação ----------

export const CAB_RESUMO = ["Nome", "Curso", "Turma", "Província", "Distrito", "Estado da inscrição", "Aulas concluídas", "Aulas do curso", "Conclusão (%)", "Última aula concluída"];
export const CAB_DETALHE = ["Nome", "Curso", "Turma", "Módulo", "Lição", "Estado", "Concluída em (data e hora)"];

const dataHora = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const data = (iso: string) => dataHora(iso).slice(0, 10);

export function linhasResumo(r: LinhaParticipacao[]): (string | number)[][] {
  return r.map((l) => [
    l.nome, l.curso, l.turma, l.provincia, l.distrito, l.estadoInscricao,
    l.aulasConcluidas, l.aulasTotal, l.conclusaoPct ?? "—",
    l.ultimaConclusao ? data(l.ultimaConclusao) : "—",
  ]);
}

export function linhasDetalhe(r: LinhaDetalhe[]): (string | number)[][] {
  return r.map((l) => [
    l.nome, l.curso, l.turma, l.modulo, l.licao,
    l.concluida ? "Concluída" : "Por concluir",
    l.concluidaEm ? dataHora(l.concluidaEm) : "—",
  ]);
}

const celula = (v: string | number) => {
  const t = String(v);
  return /[";\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

export function paraCsv(cab: string[], linhas: (string | number)[][]) {
  return `\uFEFF${[cab, ...linhas].map((r) => r.map(celula).join(";")).join("\r\n")}`;
}
