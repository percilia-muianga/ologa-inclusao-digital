import { describe, expect, it } from "vitest";
import {
  calcularAssiduidade,
  sessoesPorRegularizar,
  type MarcacaoBruta,
  type SessaoParaCalculo,
} from "@/lib/presencas.server";

function sessao(id: string, estado: SessaoParaCalculo["estado"], data = "2026-01-05"): SessaoParaCalculo {
  return { id, data, estado };
}

function marcar(
  sessao_id: string,
  estado: MarcacaoBruta["estado"],
  registado_em = "2026-01-05T10:00:00Z",
): MarcacaoBruta {
  return {
    id: `${sessao_id}-${estado}-${registado_em}`,
    sessao_id,
    turma_id: "t",
    inscricao_id: "i1",
    estado,
    motivo: estado === "justificado" ? "Atestado médico" : null,
    origem: "manual",
    origem_offline: false,
    conflito: false,
    justificacao_correccao: null,
    minutos_permanencia: null,
    progresso_pct: null,
    registado_em,
    nome_formando: "Formanda",
  };
}

const inscritos = [{ id: "i1", nome: "Formanda" }];

describe("assiduidade", () => {
  it("só as sessões realizadas entram no denominador", () => {
    const sessoes = [
      sessao("s1", "realizada"),
      sessao("s2", "realizada"),
      sessao("s3", "cancelada"),
      sessao("s4", "adiada"),
    ];
    const [linha] = calcularAssiduidade(sessoes, inscritos, [
      marcar("s1", "presente"),
      marcar("s2", "presente"),
    ]);
    expect(linha.realizadas).toBe(2);
    expect(linha.taxaEstritaPct).toBe(100);
  });

  it("79 por cento fica abaixo do limiar e 80 por cento não", () => {
    const cem = Array.from({ length: 100 }, (_, i) => sessao(`s${i}`, "realizada"));
    const setentaNove = calcularAssiduidade(
      cem,
      inscritos,
      cem.slice(0, 79).map((s) => marcar(s.id, "presente")),
    )[0];
    expect(setentaNove.taxaEstritaPct).toBe(79);
    expect(setentaNove.abaixoDoLimiar).toBe(true);

    const oitenta = calcularAssiduidade(
      cem,
      inscritos,
      cem.slice(0, 80).map((s) => marcar(s.id, "presente")),
    )[0];
    expect(oitenta.taxaEstritaPct).toBe(80);
    expect(oitenta.abaixoDoLimiar).toBe(false);
  });

  it("a taxa ajustada tira as justificadas do denominador", () => {
    const sessoes = [
      sessao("s1", "realizada"),
      sessao("s2", "realizada"),
      sessao("s3", "realizada"),
      sessao("s4", "realizada"),
    ];
    const marcacoes = [
      marcar("s1", "presente"),
      marcar("s2", "presente"),
      marcar("s3", "presente"),
      marcar("s4", "justificado"),
    ];
    const [estrita] = calcularAssiduidade(sessoes, inscritos, marcacoes, "estrita");
    const [ajustada] = calcularAssiduidade(sessoes, inscritos, marcacoes, "ajustada");
    expect(estrita.taxaPct).toBe(75);
    expect(ajustada.taxaPct).toBe(100);
  });

  it("vale a marcação mais recente de cada sessão", () => {
    const sessoes = [sessao("s1", "realizada")];
    const [linha] = calcularAssiduidade(sessoes, inscritos, [
      marcar("s1", "ausente", "2026-01-05T10:00:00Z"),
      marcar("s1", "presente", "2026-01-05T12:00:00Z"),
    ]);
    expect(linha.presentes).toBe(1);
  });

  it("sessão com data passada ainda agendada fica por regularizar", () => {
    const porRegularizar = sessoesPorRegularizar(
      [sessao("s1", "agendada", "2026-01-01"), sessao("s2", "agendada", "2026-12-31")],
      new Date("2026-06-01T00:00:00Z"),
    );
    expect(porRegularizar.has("s1")).toBe(true);
    expect(porRegularizar.has("s2")).toBe(false);
  });
});
