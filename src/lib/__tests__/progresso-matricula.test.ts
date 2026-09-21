import { describe, expect, it } from "vitest";
import { avaliarPertenca } from "../progresso.server";

const UTILIZADOR_A = "11111111-1111-1111-1111-111111111111";
const UTILIZADOR_B = "22222222-2222-2222-2222-222222222222";
const CURSO_1 = "curso-1";
const CURSO_2 = "curso-2";
const MODULO_1 = "modulo-1";
const MODULO_TRANSVERSAL = "modulo-transversal";
const MODULO_DE_OUTRO_CURSO = "modulo-9";

describe("progresso por matrícula — isolamento e pertença", () => {
  it("aceita lição de módulo próprio do curso da matrícula", () => {
    expect(
      avaliarPertenca({
        perfilDaMatricula: UTILIZADOR_A,
        utilizador: UTILIZADOR_A,
        cursoDaTurma: CURSO_1,
        moduloDaLicao: MODULO_1,
        modulosDoCurso: [MODULO_1, MODULO_TRANSVERSAL],
      }),
    ).toBeNull();
  });

  it("aceita lição de módulo partilhado (transversal) ligado ao curso", () => {
    expect(
      avaliarPertenca({
        perfilDaMatricula: UTILIZADOR_A,
        utilizador: UTILIZADOR_A,
        cursoDaTurma: CURSO_2,
        moduloDaLicao: MODULO_TRANSVERSAL,
        modulosDoCurso: [MODULO_TRANSVERSAL],
      }),
    ).toBeNull();
  });

  it("recusa matrícula de outra pessoa", () => {
    expect(
      avaliarPertenca({
        perfilDaMatricula: UTILIZADOR_B,
        utilizador: UTILIZADOR_A,
        cursoDaTurma: CURSO_1,
        moduloDaLicao: MODULO_1,
        modulosDoCurso: [MODULO_1],
      }),
    ).toBe("MATRICULA_INVALIDA");
  });

  it("recusa matrícula inexistente", () => {
    expect(
      avaliarPertenca({
        perfilDaMatricula: null,
        utilizador: UTILIZADOR_A,
        cursoDaTurma: CURSO_1,
        moduloDaLicao: MODULO_1,
        modulosDoCurso: [MODULO_1],
      }),
    ).toBe("MATRICULA_INVALIDA");
  });

  it("recusa lição de um curso onde a pessoa não está matriculada", () => {
    expect(
      avaliarPertenca({
        perfilDaMatricula: UTILIZADOR_A,
        utilizador: UTILIZADOR_A,
        cursoDaTurma: CURSO_1,
        moduloDaLicao: MODULO_DE_OUTRO_CURSO,
        modulosDoCurso: [MODULO_1, MODULO_TRANSVERSAL],
      }),
    ).toBe("LICAO_FORA_DO_CURSO");
  });

  it("recusa lição sem módulo", () => {
    expect(
      avaliarPertenca({
        perfilDaMatricula: UTILIZADOR_A,
        utilizador: UTILIZADOR_A,
        cursoDaTurma: CURSO_1,
        moduloDaLicao: null,
        modulosDoCurso: [MODULO_1],
      }),
    ).toBe("LICAO_INVALIDA");
  });

  it("recusa turma sem curso", () => {
    expect(
      avaliarPertenca({
        perfilDaMatricula: UTILIZADOR_A,
        utilizador: UTILIZADOR_A,
        cursoDaTurma: null,
        moduloDaLicao: MODULO_1,
        modulosDoCurso: [MODULO_1],
      }),
    ).toBe("MATRICULA_INVALIDA");
  });
});
