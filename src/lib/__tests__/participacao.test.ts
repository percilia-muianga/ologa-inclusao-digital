import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { CAB_DETALHE, CAB_RESUMO, linhasDetalhe, linhasResumo, montarParticipacao, paraCsv } from "../participacao";

// Dados fictícios: um curso com dois módulos (um transversal partilhado),
// três lições; Ana parcial, Bento sem progresso, Carla completa.
const dados = {
  cursos: [{ id: "c1", titulo: "Curso Fictício" }],
  turmas: [{ id: "t1", designacao: "Turma Teste", curso_id: "c1", provincia: "Sofala", distrito: "Beira" }],
  cursoModulos: [
    { curso_id: "c1", modulo_id: "mT", ordem: 2 },
    { curso_id: "c1", modulo_id: "m1", ordem: 1 },
  ],
  modulos: [{ id: "m1", titulo: "Módulo 1" }, { id: "mT", titulo: "Transversal" }],
  licoes: [
    { id: "l2", modulo_id: "m1", ordem: 2, titulo: "Lição 1.2" },
    { id: "l1", modulo_id: "m1", ordem: 1, titulo: "Lição 1.1" },
    { id: "lT", modulo_id: "mT", ordem: 1, titulo: "Lição T" },
  ],
  inscricoes: [
    { id: "iB", turma_id: "t1", nome: "Bento; Fictício", estado: "confirmada" },
    { id: "iA", turma_id: "t1", nome: "Ana Fictícia", estado: "confirmada" },
    { id: "iC", turma_id: "t1", nome: "Carla \"Teste\"", estado: "confirmada" },
  ],
  progresso: [
    { inscricao_id: "iA", licao_id: "l1", concluida_em: "2026-09-10T08:30:00Z" },
    { inscricao_id: "iA", licao_id: "l1", concluida_em: "2026-09-12T08:30:00Z" },
    { inscricao_id: "iC", licao_id: "l1", concluida_em: "2026-09-10T09:00:00Z" },
    { inscricao_id: "iC", licao_id: "l2", concluida_em: "2026-09-11T10:15:00Z" },
    { inscricao_id: "iC", licao_id: "lT", concluida_em: "2026-09-12T11:45:00Z" },
    { inscricao_id: "iX", licao_id: "l1", concluida_em: "2026-09-12T11:45:00Z" },
  ],
};

describe("relatório de participação", () => {
  const r = montarParticipacao(dados);

  it("resumo cobre sem progresso, parcial e completo", () => {
    const por = Object.fromEntries(r.resumo.map((l) => [l.inscricaoId, l]));
    expect(por.iB).toMatchObject({ aulasConcluidas: 0, aulasTotal: 3, conclusaoPct: 0, ultimaConclusao: null });
    expect(por.iA).toMatchObject({ aulasConcluidas: 1, conclusaoPct: 33.3, ultimaConclusao: "2026-09-10T08:30:00Z" });
    expect(por.iC).toMatchObject({ aulasConcluidas: 3, conclusaoPct: 100 });
  });

  it("detalhe tem uma linha por formando e lição, na ordem curricular", () => {
    expect(r.detalhe).toHaveLength(9);
    const ana = r.detalhe.filter((l) => l.inscricaoId === "iA");
    expect(ana.map((l) => l.licao)).toEqual(["Lição 1.1", "Lição 1.2", "Lição T"]);
    expect(ana.map((l) => l.concluida)).toEqual([true, false, false]);
    expect(r.detalhe.filter((l) => l.inscricaoId === "iB").every((l) => !l.concluida && !l.concluidaEm)).toBe(true);
  });

  it("exporta CSV e XLS legíveis com resumo e detalhe", () => {
    mkdirSync("/tmp/participacao", { recursive: true });
    const csv = paraCsv(CAB_DETALHE, linhasDetalhe(r.detalhe));
    writeFileSync("/tmp/participacao/detalhe.csv", csv);
    const linhas = csv.replace(/^\uFEFF/, "").split("\r\n");
    expect(linhas).toHaveLength(10);
    expect(linhas[0]).toBe(CAB_DETALHE.join(";"));
    expect(csv).toContain('"Bento; Fictício"');
    expect(csv).toContain('"Carla ""Teste"""');

    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, XLSX.utils.aoa_to_sheet([CAB_RESUMO, ...linhasResumo(r.resumo)]), "Resumo");
    XLSX.utils.book_append_sheet(livro, XLSX.utils.aoa_to_sheet([CAB_DETALHE, ...linhasDetalhe(r.detalhe)]), "Detalhe por lição");
    writeFileSync("/tmp/participacao/relatorio.xls", XLSX.write(livro, { bookType: "biff8", type: "buffer" }));
    const lido = XLSX.read(readFileSync("/tmp/participacao/relatorio.xls"));
    expect(lido.SheetNames).toEqual(["Resumo", "Detalhe por lição"]);
    const det = XLSX.utils.sheet_to_json<string[]>(lido.Sheets["Detalhe por lição"]!, { header: 1 });
    expect(det).toHaveLength(10);
    expect(det[1]?.[5]).toBe("Concluída");
    const res = XLSX.utils.sheet_to_json<string[]>(lido.Sheets.Resumo!, { header: 1 });
    expect(res).toHaveLength(4);
  });
});
