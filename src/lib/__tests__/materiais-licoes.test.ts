import { describe, expect, it } from "vitest";
import { avisosMaterial, mover, validarFicheiro } from "../materiais-licoes";

const base = { disponivel: true, descricao_acessivel: "Descrição", legenda_de: null, existe: true };

describe("materiais das lições", () => {
  it("valida formato e tamanho", () => {
    expect(validarFicheiro("pdf", "a.PDF", 10)).toEqual({ mime: "application/pdf" });
    expect("erro" in validarFicheiro("video", "a.avi", 10)).toBe(true);
    expect("erro" in validarFicheiro("legenda", "a.vtt", 0)).toBe(true);
    expect("erro" in validarFicheiro("pdf", "a.pdf", 51 * 1024 * 1024)).toBe(true);
    expect(validarFicheiro("legenda", "x.vtt", 5)).toEqual({ mime: "text/vtt" });
  });
  it("identifica ficheiro em falta, falta de descrição e vídeo sem legenda", () => {
    const v = { ...base, id: "v", tipo: "video" as const };
    const p = { ...base, id: "p", tipo: "pdf" as const, descricao_acessivel: "", existe: false, disponivel: false };
    const todos = [v, p];
    expect(avisosMaterial(v, todos)).toEqual(["video_sem_legenda"]);
    expect(avisosMaterial(p, todos)).toEqual(["ficheiro_em_falta", "indisponivel", "sem_descricao"]);
    const l = { ...base, id: "l", tipo: "legenda" as const, legenda_de: "v" };
    expect(avisosMaterial(v, [...todos, l])).toEqual([]);
    expect(avisosMaterial({ ...l, legenda_de: null }, [l])).toEqual(["legenda_sem_video"]);
  });
  it("move na ordem sem sair dos limites", () => {
    expect(mover(["a", "b", "c"], "b", -1)).toEqual(["b", "a", "c"]);
    expect(mover(["a", "b"], "a", -1)).toEqual(["a", "b"]);
  });
});
