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
