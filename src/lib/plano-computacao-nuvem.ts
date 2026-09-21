/**
 * Plano curricular PROPOSTO para o curso «Computação em Nuvem»
 * (30 horas, regime presencial — tabela da secção 14 do Termo de Referência do
 * Concurso 78A/MDAP/MCTD/QCBS/25; conteúdo programático da secção 6.3).
 *
 * IMPORTANTE — enquadramento honesto:
 * - A carga de 30 horas e a modalidade presencial são exigência da tabela da
 *   secção 14. A plataforma de aprendizagem APOIA o curso presencial; não o
 *   substitui nem altera a modalidade.
 * - A distribuição interna por módulo e por lição abaixo é PROPOSTA da equipa,
 *   não é imposta pelo Termo de Referência, e está por validar pela Ologa/ATDI.
 * - Não são fixadas sessões diárias: o documento de concurso diverge entre a
 *   secção 9 (3 a 4 horas) e a secção 13.1 (2 a 3 horas). A divergência fica
 *   registada em docs/matriz-tdr.md e não é arbitrada aqui.
 */

/** Âmbito mínimo do conteúdo programático da secção 6.3 do Termo de Referência. */
export const TOPICOS_SEC_6_3 = [
  "conceito_e_cinco_caracteristicas",
  "historia_e_evolucao",
  "modelos_de_servico_iaas_paas_saas",
  "modelos_de_implantacao_publico_privado_hibrido",
  "vantagens_e_componentes_infraestruturais",
  "multinuvem_hibrida_serverless_microservicos",
  "cloud_native_devops_modernizacao",
  "iam_acesso_e_criptografia",
  "servicos_das_plataformas_populares",
  "laboratorio_maquina_virtual",
  "laboratorio_rede_virtual",
  "laboratorio_regras_de_seguranca",
  "laboratorio_armazenamento_bucket",
  "laboratorio_publicar_aplicacao_paas",
] as const;

export type TopicoSec63 = (typeof TOPICOS_SEC_6_3)[number];

/** As cinco operações práticas exigidas expressamente pela secção 6.3. */
export const OPERACOES_EXIGIDAS = [
  "laboratorio_maquina_virtual",
  "laboratorio_rede_virtual",
  "laboratorio_regras_de_seguranca",
  "laboratorio_armazenamento_bucket",
  "laboratorio_publicar_aplicacao_paas",
] as const satisfies readonly TopicoSec63[];

export type TemposLicao = {
  acolhimento: number;
  exposicao: number;
  actividade: number;
  partilha: number;
};

export type LicaoPlano = {
  /** Chave estável usada pelo seed; a lição na base é identificada por (módulo, ordem). */
  chave: string;
  ordem: number;
  titulo: string;
  minutos: number;
  teoriaMin: number;
  praticaMin: number;
  /**
   * Fonte única dos tempos da lição, em minutos. O texto da actividade no
   * conteúdo e a grelha de condução do guião do formador são gerados a partir
   * daqui — não são escritos à mão em dois sítios.
   * Invariantes verificados em teste: acolhimento + exposicao = teoriaMin;
   * actividade + partilha = praticaMin; a soma dos quatro = minutos.
   */
  tempos: TemposLicao;
  topicos: TopicoSec63[];
};

export type ModuloPlano = {
  chave: string;
  ordem: number;
  titulo: string;
  /**
   * Descrição do conteúdo que existe mesmo neste módulo. Só é definida nos
   * módulos próprios deste curso; o transversal é partilhado por vários
   * cursos e a sua descrição não é tocada aqui.
   */
  descricao?: string;
  minutos: number;
  teoriaMin: number;
  praticaMin: number;
  transversal: boolean;
  licoes: LicaoPlano[];
};

const T105: TemposLicao = { acolhimento: 10, exposicao: 35, actividade: 50, partilha: 10 };
const T110: TemposLicao = { acolhimento: 10, exposicao: 35, actividade: 55, partilha: 10 };
const T100: TemposLicao = { acolhimento: 10, exposicao: 35, actividade: 45, partilha: 10 };

function licao(
  chave: string,
  ordem: number,
  titulo: string,
  tempos: TemposLicao,
  topicos: TopicoSec63[],
): LicaoPlano {
  const minutos = tempos.acolhimento + tempos.exposicao + tempos.actividade + tempos.partilha;
  return {
    chave,
    ordem,
    titulo,
    minutos,
    teoriaMin: tempos.acolhimento + tempos.exposicao,
    praticaMin: tempos.actividade + tempos.partilha,
    tempos,
    topicos,
  };
}

const M1_LICOES: LicaoPlano[] = [
  licao("m1l1", 1, "O que é computação em nuvem", T105, [
    "conceito_e_cinco_caracteristicas",
    "historia_e_evolucao",
  ]),
  licao("m1l2", 2, "Modelos de serviço na nuvem", T105, [
    "modelos_de_servico_iaas_paas_saas",
    "servicos_das_plataformas_populares",
  ]),
  licao("m1l3", 3, "Nuvem pública, privada e híbrida", T105, [
    "modelos_de_implantacao_publico_privado_hibrido",
    "multinuvem_hibrida_serverless_microservicos",
  ]),
  licao("m1l4", 4, "Vantagens, limites e responsabilidades", T105, [
    "vantagens_e_componentes_infraestruturais",
  ]),
  licao("m1l5", 5, "Escolher o modelo adequado", T100, [
    "modelos_de_implantacao_publico_privado_hibrido",
    "vantagens_e_componentes_infraestruturais",
  ]),
];

const M2_LICOES: LicaoPlano[] = [
  licao("m2l1", 1, "Recursos de computação e armazenamento", T105, [
    "vantagens_e_componentes_infraestruturais",
    "servicos_das_plataformas_populares",
    "laboratorio_maquina_virtual",
    "laboratorio_armazenamento_bucket",
  ]),
  licao("m2l2", 2, "Redes e conectividade na nuvem", T110, [
    "vantagens_e_componentes_infraestruturais",
    "laboratorio_rede_virtual",
    "laboratorio_regras_de_seguranca",
  ]),
  licao("m2l3", 3, "Bases de dados e aplicações na nuvem", T110, [
    "modelos_de_servico_iaas_paas_saas",
    "servicos_das_plataformas_populares",
    "laboratorio_publicar_aplicacao_paas",
  ]),
  licao("m2l4", 4, "Disponibilidade, cópias e recuperação", T110, [
    "vantagens_e_componentes_infraestruturais",
  ]),
  licao("m2l5", 5, "Planear uma arquitectura simples", T105, [
    "multinuvem_hibrida_serverless_microservicos",
    "cloud_native_devops_modernizacao",
  ]),
];

const M3_LICOES: LicaoPlano[] = [
  licao("m3l1", 1, "Identidades e controlo de acesso", T100, [
    "iam_acesso_e_criptografia",
    "laboratorio_regras_de_seguranca",
  ]),
  licao("m3l2", 2, "Protecção de dados na nuvem", T100, [
    "iam_acesso_e_criptografia",
    "laboratorio_armazenamento_bucket",
  ]),
  licao("m3l3", 3, "Monitoria e resposta a incidentes", T100, [
    "cloud_native_devops_modernizacao",
  ]),
  licao("m3l4", 4, "Custos, consumo e optimização", T100, [
    "vantagens_e_componentes_infraestruturais",
  ]),
  licao("m3l5", 5, "Requisitos para contratação de serviços de nuvem", T100, [
    "modelos_de_implantacao_publico_privado_hibrido",
    "iam_acesso_e_criptografia",
  ]),
];

function somar(licoes: LicaoPlano[], campo: "minutos" | "teoriaMin" | "praticaMin") {
  return licoes.reduce((s, l) => s + l[campo], 0);
}

function modulo(
  chave: string,
  ordem: number,
  titulo: string,
  descricao: string,
  licoes: LicaoPlano[],
): ModuloPlano {
  return {
    chave,
    ordem,
    titulo,
    descricao,
    minutos: somar(licoes, "minutos"),
    teoriaMin: somar(licoes, "teoriaMin"),
    praticaMin: somar(licoes, "praticaMin"),
    transversal: false,
    licoes,
  };
}

export const MODULOS_PLANO: ModuloPlano[] = [
  modulo(
    "m1",
    1,
    "Fundamentos de Computação em Nuvem",
    "Cinco lições sobre o que é a computação em nuvem: as cinco características essenciais da definição do NIST, a história e a evolução do modelo, os três modelos de serviço, os modelos de implantação público, privado e híbrido, as vantagens e os limites, e um critério para escolher o modelo adequado a um serviço público. Rascunho por validar pela Ologa/ATDI.",
    M1_LICOES,
  ),
  modulo(
    "m2",
    2,
    "Serviços e Arquitectura na Nuvem",
    "Cinco lições com trabalho prático em ambiente formativo: criar uma máquina virtual, criar uma rede virtual, publicar uma aplicação simples numa plataforma como serviço, planear disponibilidade e cópias de segurança, e desenhar uma arquitectura simples com serverless, microserviços e práticas cloud-native e DevOps. Os laboratórios estão escritos e ainda não foram executados. Rascunho por validar pela Ologa/ATDI.",
    M2_LICOES,
  ),
  modulo(
    "m3",
    3,
    "Governação, Segurança e Custos",
    "Cinco lições sobre governar o que foi criado: identidades, permissões mínimas e regras de segurança de rede; criptografia e protecção de dados num contentor de armazenamento; monitoria e resposta a incidentes; custos, limites de consumo e limpeza de recursos; e requisitos a exigir na contratação de serviços de nuvem, incluindo portabilidade e localização dos dados. Rascunho por validar pela Ologa/ATDI.",
    M3_LICOES,
  ),
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

export const CARGA_HORARIA_OFICIAL_HORAS = 30;

export const MODALIDADE_OFICIAL = "presencial";

/** Lições com conteúdo produzido nesta etapa (as do transversal já existiam). */
export const LICOES_PLANO: LicaoPlano[] = MODULOS_PLANO.flatMap((m) => m.licoes);

export const AVISO_PROPOSTA =
  "Proposta pedagógica — por validar pela Ologa/ATDI. A disponibilidade deste rascunho não equivale a aprovação.";

export const AVISO_LABORATORIOS =
  "Laboratórios escritos e ainda NÃO EXECUTADOS. O ambiente formativo está por preparar: exige conta institucional de ensaio, com permissões e limites de consumo definidos pelo formador. O material de preparação sem ligação à internet é complementar e não substitui a prática real exigida pela secção 6.3.";
