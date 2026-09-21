/**
 * Plano curricular PROPOSTO para o curso «Princípios da Transformação Digital»
 * (24 horas, regime virtual — tabela da secção 14 do Termo de Referência do
 * Concurso 78A/MDAP/MCTD/QCBS/25).
 *
 * IMPORTANTE — enquadramento honesto:
 * - A carga de 24 horas é exigência da tabela da secção 14.
 * - A distribuição interna por módulo e por lição abaixo é PROPOSTA da equipa,
 *   não é imposta pelo Termo de Referência, e está por validar pela Ologa/ATDI.
 * - O documento de concurso contém divergências internas noutros cursos
 *   (Introdução à IA: 16 h na secção 6.2 e 20 h na secção 14; Redes: 120 h na
 *   descrição e 80 h na secção 14). Ver docs/matriz-tdr.md. Este ficheiro não
 *   arbitra essas divergências.
 */

/** Âmbito mínimo do conteúdo programático da secção 6.1 do Termo de Referência. */
export const TOPICOS_SEC_6_1 = [
  "conceitos_e_impactos_institucionais",
  "estrategia_planeamento_implementacao_gestao",
  "modelos_de_servico_digitais_e_inovacao",
  "politicas_publicas_e_competencias_digitais",
  "impactos_sociais_economicos_eticos_juridicos",
  "impactos_ambientais_e_sustentabilidade",
  "tecnologias_ia_bigdata_iot_blockchain_cloud",
  "seguranca_e_privacidade",
  "casos_praticos",
  "eficiencia_dos_servicos_e_mudanca_de_comportamentos",
] as const;

export type TopicoSec61 = (typeof TOPICOS_SEC_6_1)[number];

export type LicaoPlano = {
  /** Chave estável usada pelo seed; a lição na base é identificada por (módulo, ordem). */
  chave: string;
  ordem: number;
  titulo: string;
  minutos: number;
  teoriaMin: number;
  praticaMin: number;
  topicos: TopicoSec61[];
};

export type ModuloPlano = {
  chave: string;
  ordem: number;
  titulo: string;
  minutos: number;
  teoriaMin: number;
  praticaMin: number;
  transversal: boolean;
  licoes: LicaoPlano[];
};

export const MODULOS_PLANO: ModuloPlano[] = [
  {
    chave: "m1",
    ordem: 1,
    titulo: "Fundamentos da Transformação Digital",
    minutos: 360,
    teoriaMin: 180,
    praticaMin: 180,
    transversal: false,
    licoes: [
      {
        chave: "m1l1",
        ordem: 1,
        titulo: "O que é a transformação digital",
        minutos: 90,
        teoriaMin: 50,
        praticaMin: 40,
        topicos: [
          "conceitos_e_impactos_institucionais",
          "tecnologias_ia_bigdata_iot_blockchain_cloud",
        ],
      },
      {
        chave: "m1l2",
        ordem: 2,
        titulo: "Transformação digital no sector público",
        minutos: 90,
        teoriaMin: 50,
        praticaMin: 40,
        topicos: [
          "conceitos_e_impactos_institucionais",
          "politicas_publicas_e_competencias_digitais",
          "modelos_de_servico_digitais_e_inovacao",
        ],
      },
      {
        chave: "m1l3",
        ordem: 3,
        titulo: "Valor público, impactos sociais, éticos e ambientais",
        minutos: 90,
        teoriaMin: 40,
        praticaMin: 50,
        topicos: [
          "impactos_sociais_economicos_eticos_juridicos",
          "impactos_ambientais_e_sustentabilidade",
        ],
      },
      {
        chave: "m1l4",
        ordem: 4,
        titulo: "Diagnóstico da maturidade digital",
        minutos: 90,
        teoriaMin: 40,
        praticaMin: 50,
        topicos: [
          "estrategia_planeamento_implementacao_gestao",
          "casos_praticos",
        ],
      },
    ],
  },
  {
    chave: "m2",
    ordem: 2,
    titulo: "Serviços Públicos Centrados no Cidadão",
    minutos: 420,
    teoriaMin: 180,
    praticaMin: 240,
    transversal: false,
    licoes: [
      {
        chave: "m2l1",
        ordem: 1,
        titulo: "Conhecer as pessoas que usam o serviço",
        minutos: 105,
        teoriaMin: 45,
        praticaMin: 60,
        topicos: [
          "eficiencia_dos_servicos_e_mudanca_de_comportamentos",
          "politicas_publicas_e_competencias_digitais",
        ],
      },
      {
        chave: "m2l2",
        ordem: 2,
        titulo: "Mapear a jornada de um serviço público",
        minutos: 105,
        teoriaMin: 45,
        praticaMin: 60,
        topicos: ["casos_praticos", "modelos_de_servico_digitais_e_inovacao"],
      },
      {
        chave: "m2l3",
        ordem: 3,
        titulo: "Simplificar processos antes de digitalizar",
        minutos: 105,
        teoriaMin: 45,
        praticaMin: 60,
        topicos: [
          "eficiencia_dos_servicos_e_mudanca_de_comportamentos",
          "modelos_de_servico_digitais_e_inovacao",
        ],
      },
      {
        chave: "m2l4",
        ordem: 4,
        titulo: "Dados, segurança e privacidade no atendimento",
        minutos: 105,
        teoriaMin: 45,
        praticaMin: 60,
        topicos: [
          "seguranca_e_privacidade",
          "tecnologias_ia_bigdata_iot_blockchain_cloud",
          "impactos_sociais_economicos_eticos_juridicos",
        ],
      },
    ],
  },
  {
    chave: "m3",
    ordem: 3,
    titulo: "Implementação e Mudança Institucional",
    minutos: 420,
    teoriaMin: 120,
    praticaMin: 300,
    transversal: false,
    licoes: [
      {
        chave: "m3l1",
        ordem: 1,
        titulo: "Estratégia, prioridades e planeamento",
        minutos: 105,
        teoriaMin: 35,
        praticaMin: 70,
        topicos: [
          "estrategia_planeamento_implementacao_gestao",
          "politicas_publicas_e_competencias_digitais",
        ],
      },
      {
        chave: "m3l2",
        ordem: 2,
        titulo: "Organizar equipas, competências e responsabilidades",
        minutos: 105,
        teoriaMin: 35,
        praticaMin: 70,
        topicos: [
          "politicas_publicas_e_competencias_digitais",
          "estrategia_planeamento_implementacao_gestao",
        ],
      },
      {
        chave: "m3l3",
        ordem: 3,
        titulo: "Gerir a mudança e a adopção de comportamentos",
        minutos: 105,
        teoriaMin: 25,
        praticaMin: 80,
        topicos: [
          "eficiencia_dos_servicos_e_mudanca_de_comportamentos",
          "conceitos_e_impactos_institucionais",
        ],
      },
      {
        chave: "m3l4",
        ordem: 4,
        titulo: "Medir resultados, sustentar e melhorar continuamente",
        minutos: 105,
        teoriaMin: 25,
        praticaMin: 80,
        topicos: [
          "casos_praticos",
          "impactos_ambientais_e_sustentabilidade",
          "eficiencia_dos_servicos_e_mudanca_de_comportamentos",
        ],
      },
    ],
  },
  {
    chave: "transversal",
    ordem: 4,
    titulo: "Governo Digital Inclusivo e Acessibilidade",
    minutos: 120,
    teoriaMin: 60,
    praticaMin: 60,
    transversal: true,
    licoes: [],
  },
];

/** Blocos de avaliação e orientação que não pertencem a nenhum módulo. */
export const BLOCOS_AVALIACAO = [
  { chave: "diagnostico", titulo: "Diagnóstico e orientação inicial", minutos: 30 },
  { chave: "revisao", titulo: "Revisão e pós-teste", minutos: 30 },
  { chave: "exame", titulo: "Orientação e exame final", minutos: 60 },
];

export const MINUTOS_AVALIACAO_ORIENTACAO = BLOCOS_AVALIACAO.reduce(
  (soma, b) => soma + b.minutos,
  0,
);

export const MINUTOS_MODULOS = MODULOS_PLANO.reduce((soma, m) => soma + m.minutos, 0);

export const MINUTOS_TOTAIS = MINUTOS_MODULOS + MINUTOS_AVALIACAO_ORIENTACAO;

export const CARGA_HORARIA_OFICIAL_HORAS = 24;

/** Lições com conteúdo produzido nesta etapa (as do transversal já existiam). */
export const LICOES_PLANO: LicaoPlano[] = MODULOS_PLANO.flatMap((m) => m.licoes);

export const AVISO_PROPOSTA =
  "Proposta pedagógica — por validar pela Ologa/ATDI. A disponibilidade deste rascunho não equivale a aprovação.";
