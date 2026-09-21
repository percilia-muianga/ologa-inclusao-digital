import { describe, expect, it } from "vitest";
import { avaliarCondicoesCertificacao } from "@/lib/certificacao.server";

const base = {
  minimoAssiduidadePct: 80,
  minimoNotaPct: 60,
  prazoDias: 30,
  dataFim: new Date("2026-01-01T00:00:00Z"),
  agora: new Date("2026-01-10T00:00:00Z"),
};

describe("condições de certificação", () => {
  it("79 por cento de assiduidade não certifica", () => {
    const r = avaliarCondicoesCertificacao({ ...base, assiduidadePct: 79, notaPct: 100 });
    expect(r.assiduidadeCumpre).toBe(false);
    expect(r.motivo).toBe("ASSIDUIDADE_INSUFICIENTE");
  });

  it("80 por cento de assiduidade certifica", () => {
    const r = avaliarCondicoesCertificacao({ ...base, assiduidadePct: 80, notaPct: 60 });
    expect(r.podeCertificar).toBe(true);
  });

  it("59 por cento de nota não certifica", () => {
    const r = avaliarCondicoesCertificacao({ ...base, assiduidadePct: 100, notaPct: 59 });
    expect(r.motivo).toBe("NOTA_INSUFICIENTE");
  });

  it("60 por cento de nota certifica", () => {
    const r = avaliarCondicoesCertificacao({ ...base, assiduidadePct: 100, notaPct: 60 });
    expect(r.notaCumpre).toBe(true);
    expect(r.podeCertificar).toBe(true);
  });

  it("assiduidade por apurar bloqueia", () => {
    const r = avaliarCondicoesCertificacao({ ...base, assiduidadePct: null, notaPct: 90 });
    expect(r.motivo).toBe("ASSIDUIDADE_POR_APURAR");
  });

  it("sem exame submetido bloqueia", () => {
    const r = avaliarCondicoesCertificacao({ ...base, assiduidadePct: 90, notaPct: null });
    expect(r.motivo).toBe("SEM_EXAME_SUBMETIDO");
  });

  it("no dia 30 ainda certifica", () => {
    const r = avaliarCondicoesCertificacao({
      ...base,
      agora: new Date("2026-01-31T00:00:00Z"),
      assiduidadePct: 90,
      notaPct: 90,
    });
    expect(r.prazoExpirado).toBe(false);
    expect(r.diasRestantes).toBe(0);
  });

  it("no dia 31 o prazo expirou", () => {
    const r = avaliarCondicoesCertificacao({
      ...base,
      agora: new Date("2026-02-01T00:00:01Z"),
      assiduidadePct: 90,
      notaPct: 90,
    });
    expect(r.prazoExpirado).toBe(true);
    expect(r.motivo).toBe("PRAZO_EXPIRADO");
  });

  it("sem data de fim não há prazo a contar", () => {
    const r = avaliarCondicoesCertificacao({
      ...base,
      dataFim: null,
      assiduidadePct: 90,
      notaPct: 90,
    });
    expect(r.prazoLimite).toBeNull();
    expect(r.podeCertificar).toBe(true);
  });
});
