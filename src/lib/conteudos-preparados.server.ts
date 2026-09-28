/**
 * Conteúdos já preparados pela equipa, prontos a importar pela área reservada.
 *
 * Este ficheiro é EXCLUSIVAMENTE do servidor (o sufixo .server impede que entre
 * no pacote enviado ao navegador). É aqui, e só aqui, que os enunciados e os
 * gabaritos do banco de avaliação existem dentro da aplicação: nenhum handler
 * os devolve ao cliente, apenas contagens e estados.
 *
 * Reutiliza a lógica pura dos integradores já escritos e testados. Importar
 * este ficheiro NÃO escreve nada: só monta os dados em memória.
 */
import {
  MODULOS_PLANO,
  MINUTOS_AVALIACAO_ORIENTACAO,
  CARGA_HORARIA_HORAS,
  MODALIDADE_TABELA_SEC_14,
  FICHA_CURSO,
  SLUG_CURSO as SLUG_SEGURANCA,
} from "./plano-seguranca-cibernetica";
import {
  DESCRICOES_MODULO,
  montarTodas,
} from "../../scripts/conteudo/seguranca-cibernetica-licoes";
import {
  planoIntegracao,
  resumoPlano,
  SLUG_CURSO as SLUG_IA,
} from "../../scripts/integrar-banco-inteligencia-artificial";

export { SLUG_SEGURANCA, SLUG_IA };

export type LicaoPayload = {
  modulo_ordem: number;
  ordem: number;
  titulo: string;
  minutos: number;
  elearning: string;
  guiao: string;
};

export type PayloadSeguranca = {
  curso: {
    carga_horaria: number;
    modalidade: string;
    objectivos: string;
    publico_alvo: string;
    pre_requisitos: string;
    materiais: string;
    nota: string;
    minutos_avaliacao_orientacao: number;
  };
  modulos: { ordem: number; descricao: string; minutos: number }[];
  transversal_minutos: number;
  licoes: LicaoPayload[];
};

/** Pacote 1 — as 15 lições, as descrições dos 3 módulos, a ficha e as horas. */
export function payloadSeguranca(): PayloadSeguranca {
  const montadas = montarTodas();
  if (montadas.length !== 15) throw new Error("PACOTE_INCOMPLETO");

  const modulos = MODULOS_PLANO.filter((m) => !m.transversal).map((m) => {
    const descricao = DESCRICOES_MODULO[m.chave];
    if (!descricao) throw new Error("PACOTE_INCOMPLETO");
    return { ordem: m.ordem, descricao, minutos: m.minutos };
  });
  const transversal = MODULOS_PLANO.find((m) => m.transversal);
  if (!transversal) throw new Error("PACOTE_INCOMPLETO");

  return {
    curso: {
      carga_horaria: CARGA_HORARIA_HORAS,
      modalidade: MODALIDADE_TABELA_SEC_14,
      objectivos: FICHA_CURSO.objectivos,
      publico_alvo: FICHA_CURSO.publicoAlvo,
      pre_requisitos: FICHA_CURSO.preRequisitos,
      materiais: FICHA_CURSO.materiais,
      nota: FICHA_CURSO.nota,
      minutos_avaliacao_orientacao: MINUTOS_AVALIACAO_ORIENTACAO,
    },
    modulos,
    transversal_minutos: transversal.minutos,
    licoes: montadas.map((l) => ({
      modulo_ordem: l.moduloOrdem,
      ordem: l.ordem,
      titulo: l.titulo,
      minutos: l.minutos,
      elearning: l.elearning,
      guiao: l.guiao,
    })),
  };
}

export type QuestaoPayload = {
  /** Identidade estável do item. O enunciado é mutável e não identifica nada. */
  codigo: string;
  ordem_modulo: number;
  instrumento: "exame_final" | "pre_pos_teste";
  tipologia: string;
  dificuldade: string;
  enunciado: string;
  conteudo: Record<string, unknown>;
  resposta: Record<string, unknown>;
  explicacao: string;
  objectivo_associado: string;
  cenario: boolean;
  versao: string;
  autor_nome: string;
};

/** Pacote 2 — 80 questões de exame + 10 de diagnóstico, todas inactivas. */
export function payloadBancoIA(): { questoes: QuestaoPayload[] } {
  const linhas = planoIntegracao();
  if (linhas.length !== 90) throw new Error("PACOTE_INCOMPLETO");
  if (linhas.some((l) => l.activa)) throw new Error("PACOTE_COM_QUESTAO_ACTIVA");
  return {
    questoes: linhas.map((l) => ({
      codigo: l.cod,
      ordem_modulo: l.ordemModulo,
      instrumento: l.instrumento,
      tipologia: l.tipologia,
      dificuldade: l.dificuldade,
      enunciado: l.enunciado,
      conteudo: l.conteudo,
      resposta: l.resposta,
      explicacao: l.explicacao,
      objectivo_associado: l.objectivo_associado,
      cenario: l.cenario,
      versao: l.versao,
      autor_nome: l.autor_nome,
    })),
  };
}

/** Resumo do banco para mostrar no ecrã: contagens, nunca enunciados. */
export function resumoBancoIA() {
  return resumoPlano(planoIntegracao());
}

// ---- Pacote 3 — Tecnologias Digitais do Governo ----
import {
  CARGA_HORARIA_HORAS as TDG_HORAS,
  MODALIDADE as TDG_MODALIDADE,
  FICHA_CURSO as TDG_FICHA,
  NOTA_CARGA as TDG_NOTA,
  DESCRICAO_MODULO as TDG_DESCRICAO,
  MINUTOS_LICOES as TDG_MIN_LICOES,
  MINUTOS_TRANSVERSAL as TDG_TRANSVERSAL,
  MINUTOS_AVALIACAO_ORIENTACAO as TDG_AVAL,
} from "./plano-tecnologias-governo";
import { montarTodas as montarTodasTdg } from "../../scripts/conteudo/tecnologias-governo-licoes";

/** Pacote 3 — 5 lições, ficha, descrição do módulo temático e horas (600 min). */
export function payloadTecnologiasGoverno() {
  const licoes = montarTodasTdg();
  if (licoes.length !== 5) throw new Error("PACOTE_INCOMPLETO");
  return {
    curso: {
      carga_horaria: TDG_HORAS,
      modalidade: TDG_MODALIDADE,
      objectivos: TDG_FICHA.objectivos,
      publico_alvo: TDG_FICHA.publicoAlvo,
      pre_requisitos: TDG_FICHA.preRequisitos,
      materiais: TDG_FICHA.materiais,
      nota: TDG_NOTA,
      minutos_avaliacao_orientacao: TDG_AVAL,
    },
    modulo: { descricao: TDG_DESCRICAO, minutos: TDG_MIN_LICOES },
    transversal_minutos: TDG_TRANSVERSAL,
    licoes: licoes.map((l) => ({
      ordem: l.ordem,
      titulo: l.titulo,
      minutos: l.minutos,
      elearning: l.elearning,
      guiao: l.guiao,
    })),
  };
}

// ---- Pacote 4 — Administração de Redes e Segurança Cibernética ----
import {
  SLUG_CURSO as REDES_SLUG,
  CARGA_HORARIA_HORAS as REDES_HORAS,
  MODALIDADE as REDES_MODALIDADE,
  FICHA_CURSO as REDES_FICHA,
  NOTA_CARGA as REDES_NOTA,
  MODULOS_PLANO as REDES_MODULOS,
  MINUTOS_TRANSVERSAL as REDES_TRANSVERSAL,
  MINUTOS_AVALIACAO_ORIENTACAO as REDES_AVAL,
  MINUTOS_CONTEUDOS as REDES_MIN_LICOES,
} from "./plano-redes";
import { montarTodasRedes } from "../../scripts/conteudo/redes-licoes";
import {
  ID_CURSO_REDES,
  ID_MODULO_TRANSVERSAL as REDES_ID_TRANSVERSAL,
  IDS_MODULOS_REDES,
  IDS_LICOES_REDES,
} from "../../scripts/conteudo/redes-ids";

export { REDES_SLUG };

/** Pacote 4 — 60 lições com IDs exactos, 12 módulos (380 min), ficha e horas (4800 min). */
export function payloadRedes() {
  const licoes = montarTodasRedes();
  if (licoes.length !== 60 || REDES_MODULOS.length !== 12 || IDS_MODULOS_REDES.length !== 12) {
    throw new Error("PACOTE_INCOMPLETO");
  }
  return {
    curso: {
      id: ID_CURSO_REDES,
      slug: REDES_SLUG,
      carga_horaria: REDES_HORAS,
      modalidade: REDES_MODALIDADE,
      objectivos: REDES_FICHA.objectivos,
      publico_alvo: REDES_FICHA.publicoAlvo,
      pre_requisitos: REDES_FICHA.preRequisitos,
      materiais: REDES_FICHA.materiais,
      nota: REDES_NOTA,
      minutos_avaliacao_orientacao: REDES_AVAL,
    },
    modulos: REDES_MODULOS.map((m) => ({
      id: IDS_MODULOS_REDES[m.ordem - 1]!,
      ordem: m.ordem,
      descricao: m.descricao,
      minutos: m.minutos,
    })),
    transversal: { id: REDES_ID_TRANSVERSAL, minutos: REDES_TRANSVERSAL },
    licoes: licoes.map((l) => {
      const id = IDS_LICOES_REDES[l.chave];
      if (!id) throw new Error("PACOTE_INCOMPLETO");
      return {
        id,
        modulo_id: IDS_MODULOS_REDES[l.modulo_ordem - 1]!,
        modulo_ordem: l.modulo_ordem,
        ordem: l.ordem,
        titulo: l.titulo,
        minutos: l.minutos,
        elearning: l.elearning,
        guiao: l.guiao,
      };
    }),
    minutos_licoes: REDES_MIN_LICOES,
  };
}
export type PayloadRedes = ReturnType<typeof payloadRedes>;

// ---- Pacotes 5 a 7 — bancos privados de avaliação (SC, Governo, Redes) ----
// Mesmo padrão do banco de IA: 80 questões de exame + 10 de diagnóstico, todas
// inactivas e em rascunho. A base de dados só identifica o módulo pela ordem
// dentro do curso (curso_modulos.ordem); os planos de SC e Governo usam a
// ordem global do módulo, convertida aqui por uma tabela fixa.
import { planoLinhasSC } from "../../scripts/conteudo/seguranca-cibernetica-questoes";
import { planoLinhasTDG } from "../../scripts/conteudo/tecnologias-governo-questoes";
import { planoLinhasRedes } from "../../scripts/conteudo/redes-questoes";
import { AUTOR_NOME as AUTOR_BANCO } from "../../scripts/integrar-banco-inteligencia-artificial";

export type PacoteBanco = "banco-seguranca-cibernetica" | "banco-tecnologias-governo" | "banco-redes";

type LinhaBancoPrivado = {
  cod: string;
  ordemModulo: number;
  instrumento: "exame_final" | "pre_pos_teste";
  tipologia: string;
  dificuldade: string;
  enunciado: string;
  conteudo: Record<string, unknown>;
  resposta: Record<string, unknown>;
  explicacao: string;
  objectivo_associado: string;
  cenario: boolean;
  activa: boolean;
  estado_revisao: string;
  versao: string;
};

/** Ordem global do módulo (modulos.ordem) → ordem no curso (curso_modulos.ordem). */
export const ORDEM_NO_CURSO: Record<PacoteBanco, Record<number, number>> = {
  "banco-seguranca-cibernetica": { 141: 1, 142: 2, 143: 3, 200: 4 },
  "banco-tecnologias-governo": { 161: 1, 200: 2 },
  "banco-redes": Object.fromEntries(Array.from({ length: 13 }, (_, i) => [i + 1, i + 1])),
};

/** Contagem esperada de questões de exame por ordem no curso (igual à verificada na base). */
export const MATRIZ_MODULOS: Record<PacoteBanco, Record<number, number>> = {
  "banco-seguranca-cibernetica": { 1: 24, 2: 25, 3: 23, 4: 8 },
  "banco-tecnologias-governo": { 1: 72, 2: 8 },
  "banco-redes": { ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, 6])), 13: 8 },
};

function linhasBanco(pacote: PacoteBanco): LinhaBancoPrivado[] {
  if (pacote === "banco-seguranca-cibernetica") return planoLinhasSC() as LinhaBancoPrivado[];
  if (pacote === "banco-tecnologias-governo") return planoLinhasTDG() as LinhaBancoPrivado[];
  return planoLinhasRedes() as LinhaBancoPrivado[];
}

export function payloadBanco(pacote: PacoteBanco): { questoes: QuestaoPayload[] } {
  const linhas = linhasBanco(pacote);
  if (linhas.length !== 90) throw new Error("PACOTE_INCOMPLETO");
  if (linhas.some((l) => l.activa !== false || l.estado_revisao !== "rascunho")) {
    throw new Error("PACOTE_COM_QUESTAO_ACTIVA");
  }
  const mapa = ORDEM_NO_CURSO[pacote];
  const questoes = linhas.map((l) => {
    const ordem = mapa[l.ordemModulo];
    if (!ordem) throw new Error("PACOTE_INCOMPLETO");
    return {
      codigo: l.cod,
      ordem_modulo: ordem,
      instrumento: l.instrumento,
      tipologia: l.tipologia,
      dificuldade: l.dificuldade,
      enunciado: l.enunciado,
      conteudo: l.conteudo,
      resposta: l.resposta,
      explicacao: l.explicacao,
      objectivo_associado: l.objectivo_associado,
      cenario: l.cenario,
      versao: l.versao,
      autor_nome: AUTOR_BANCO,
    };
  });
  const exame = questoes.filter((q) => q.instrumento === "exame_final");
  for (const [ordem, n] of Object.entries(MATRIZ_MODULOS[pacote])) {
    if (exame.filter((q) => q.ordem_modulo === Number(ordem)).length !== n) throw new Error("PACOTE_INCOMPLETO");
  }
  return { questoes };
}

/** Resumo para o ecrã: só contagens, nunca enunciados nem gabaritos. */
export function resumoBanco(pacote: PacoteBanco) {
  const { questoes } = payloadBanco(pacote);
  const contar = (vals: string[]) =>
    vals.reduce<Record<string, number>>((r, v) => ({ ...r, [v]: (r[v] ?? 0) + 1 }), {});
  const exame = questoes.filter((q) => q.instrumento === "exame_final");
  return {
    total: questoes.length,
    exame_final: exame.length,
    pre_pos_teste: questoes.length - exame.length,
    porModulo: contar(exame.map((q) => `módulo ${q.ordem_modulo}`)),
    porTipo: contar(exame.map((q) => (q.cenario ? "cenario" : q.tipologia))),
    porDificuldade: contar(exame.map((q) => q.dificuldade)),
    activas: 0,
  };
}
