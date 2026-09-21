/**
 * Plano curricular PROPOSTO para o curso «Introdução à Inteligência Artificial».
 *
 * DIVERGÊNCIA DE CARGA HORÁRIA — por resolver com a ATDI:
 * - A secção 6.2 (página 13) do Termo de Referência do Concurso
 *   78A/MDAP/MCTD/QCBS/25 indica uma duração máxima de 16 horas, incluindo a
 *   componente prática.
 * - A tabela da secção 14 (página 29) indica 20 horas, em regime presencial.
 * - A secção 13.1 (página 27) remete a tabela de cargas horárias para as
 *   propostas dos concorrentes.
 * As três indicações não coincidem. A equipa trabalha com 20 horas a título
 * PROVISÓRIO, por autorização da gestora do projecto e enquanto a ATDI não
 * confirma. Não se afirma, em lado nenhum, que as 20 horas estão fixadas ou
 * são definitivas. Existe um plano alternativo adaptável a 16 horas,
 * documentado abaixo e NÃO activo.
 *
 * A divisão interna (módulos, lições, blocos de avaliação) é proposta da
 * equipa e não é explicação da divergência acima: a divergência está nos
 * documentos do concurso, não na nossa repartição.
 *
 * Estado geral: rascunho por validar pela Ologa/ATDI.
 */

/** Âmbito do conteúdo programático da secção 6.2 (páginas 13 e 14). */
export const TOPICOS_SEC_6_2 = [
  "conceito_e_fundamentos_de_ia",
  "dados_algoritmos_e_modelos",
  "aprendizagem_automatica",
  "uso_de_ferramentas_de_ia",
  "aplicacoes_e_casos_de_uso",
  "etica_riscos_e_proteccao_de_dados",
  "oportunidades_para_a_organizacao_e_a_economia",
  "governacao_da_ia_incluindo_eu_ai_act",
  "actores_nacionais_e_internacionais",
  "politica_e_diplomacia_da_ia",
] as const;

export type TopicoSec62 = (typeof TOPICOS_SEC_6_2)[number];

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
  /** Fonte única dos tempos: o conteúdo e o guião são gerados daqui. */
  tempos: TemposLicao;
  topicos: TopicoSec62[];
};

export type ModuloPlano = {
  chave: string;
  ordem: number;
  titulo: string;
  descricao?: string;
  minutos: number;
  teoriaMin: number;
  praticaMin: number;
  transversal: boolean;
  licoes: LicaoPlano[];
};

/** 10 + 35 + 60 + 15 = 120 minutos. */
const T120: TemposLicao = { acolhimento: 10, exposicao: 35, actividade: 60, partilha: 15 };

function licao(
  chave: string,
  ordem: number,
  titulo: string,
  tempos: TemposLicao,
  topicos: TopicoSec62[],
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
  licao("m1l1", 1, "O que é inteligência artificial", T120, [
    "conceito_e_fundamentos_de_ia",
    "aplicacoes_e_casos_de_uso",
  ]),
  licao("m1l2", 2, "Dados, algoritmos e modelos", T120, [
    "dados_algoritmos_e_modelos",
    "etica_riscos_e_proteccao_de_dados",
  ]),
  licao("m1l3", 3, "Aprendizagem automática em linguagem simples", T120, [
    "aprendizagem_automatica",
    "dados_algoritmos_e_modelos",
  ]),
  licao("m1l4", 4, "Aplicações da inteligência artificial", T120, [
    "uso_de_ferramentas_de_ia",
    "aplicacoes_e_casos_de_uso",
    "oportunidades_para_a_organizacao_e_a_economia",
  ]),
];

/**
 * Módulo 2 — APENAS PLANEADO nesta etapa. Os títulos já existem na base e o
 * conteúdo continua honestamente «por fornecer». A lição 4 deste módulo é o
 * lugar previsto para a governação da IA, incluindo o Regulamento Europeu de
 * Inteligência Artificial (EU AI Act), os actores nacionais e internacionais
 * e a política e diplomacia da IA, com fontes oficiais actualizadas à data em
 * que for escrita. Nada disso é escrito agora.
 */
const M2_LICOES: LicaoPlano[] = [
  licao("m2l1", 1, "Casos de uso no serviço público", T120, [
    "aplicacoes_e_casos_de_uso",
    "oportunidades_para_a_organizacao_e_a_economia",
  ]),
  licao("m2l2", 2, "Protecção de dados e privacidade", T120, [
    "etica_riscos_e_proteccao_de_dados",
  ]),
  licao("m2l3", 3, "Preconceito algorítmico e inclusão", T120, [
    "etica_riscos_e_proteccao_de_dados",
  ]),
  licao("m2l4", 4, "Supervisão humana e prestação de contas", T120, [
    "governacao_da_ia_incluindo_eu_ai_act",
    "actores_nacionais_e_internacionais",
    "politica_e_diplomacia_da_ia",
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
    "Fundamentos de Inteligência Artificial",
    "Quatro lições sobre os fundamentos: o que é e o que não é inteligência artificial, com uma breve história e a distinção entre automação por regras e sistemas que inferem a partir de dados; dados, características, rótulos, qualidade e representatividade, e a diferença entre algoritmo e modelo; aprendizagem supervisionada, não supervisionada e por reforço em linguagem simples, com sobreajustamento e erros de falso positivo e falso negativo; e aplicações ao trabalho administrativo, com verificação humana obrigatória. Rascunho por validar pela Ologa/ATDI.",
    M1_LICOES,
  ),
  modulo(
    "m2",
    2,
    "Uso Responsável da Inteligência Artificial",
    // Só PLANEADO: o seed não escreve esta descrição enquanto as lições não
    // estiverem escritas.
    "Quatro lições planeadas, ainda por escrever.",
    M2_LICOES,
  ),
  {
    chave: "transversal",
    ordem: 3,
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
  { chave: "diagnostico", titulo: "Diagnóstico e orientação inicial", minutos: 20 },
  { chave: "revisao", titulo: "Revisão e pós-teste", minutos: 40 },
  { chave: "exame", titulo: "Orientação e exame final", minutos: 60 },
];

export const MINUTOS_AVALIACAO_ORIENTACAO = BLOCOS_AVALIACAO.reduce((s, b) => s + b.minutos, 0);

export const MINUTOS_MODULOS = MODULOS_PLANO.reduce((s, m) => s + m.minutos, 0);

export const MINUTOS_TOTAIS = MINUTOS_MODULOS + MINUTOS_AVALIACAO_ORIENTACAO;

/** Carga provisória com que a equipa está a trabalhar. Não é definitiva. */
export const CARGA_HORARIA_PROVISORIA_HORAS = 20;

export const MODALIDADE_TABELA_SEC_14 = "presencial";

export const LICOES_PLANO: LicaoPlano[] = MODULOS_PLANO.flatMap((m) => m.licoes);

/**
 * Plano alternativo adaptável a 16 horas. DOCUMENTADO E NÃO ACTIVO: serve para
 * mostrar que o curso é comprimível se a ATDI confirmar as 16 horas da secção
 * 6.2. Nenhum objectivo de aprendizagem é retirado; reduzem-se e reorganizam-se
 * actividades. Nenhuma actividade reduzida pode ser apresentada como simulação
 * prática executada.
 */
export const PLANO_ALTERNATIVO_16H = {
  activo: false,
  totalMinutos: 960,
  blocos: [
    { chave: "m1", titulo: "Fundamentos de Inteligência Artificial", minutos: 360 },
    { chave: "m2", titulo: "Uso Responsável da Inteligência Artificial", minutos: 360 },
    {
      chave: "transversal",
      titulo: "Governo Digital Inclusivo e Acessibilidade",
      minutos: 120,
    },
    { chave: "avaliacao", titulo: "Diagnóstico, revisão e exame final", minutos: 120 },
  ],
  comoSeAdapta: [
    "Cada lição passa de 120 para 90 minutos: mantêm-se o acolhimento e a exposição, e encurta-se a actividade prática.",
    "A partilha em plenário passa a duas apresentações curtas e as restantes entregas passam a escrito, sem apresentação oral.",
    "Nenhum objectivo de aprendizagem é retirado; nenhum tema sai do programa.",
    "Nenhuma actividade encurtada pode ser descrita como simulação prática executada: o que for feito apenas em papel é registado como análise documental.",
    "Se a prática com ferramenta de inteligência artificial não couber no tempo, fica registada como PENDENTE e é reagendada dentro do horário replaneado.",
  ],
} as const;

/** Texto único da divergência. Usado na ficha, no seed e na matriz. */
export const DIVERGENCIA_CARGA =
  "Carga horária PROVISÓRIA de 20 horas, por confirmar pela ATDI. Os documentos do concurso divergem: a secção 6.2 (p. 13) indica um máximo de 16 horas, incluindo a prática; a tabela da secção 14 (p. 29) indica 20 horas em regime presencial; e a secção 13.1 (p. 27) remete a tabela de cargas horárias para as propostas dos concorrentes. A equipa trabalha com 20 horas a título provisório, por autorização da gestora do projecto, enquanto a ATDI não decide. Existe um plano alternativo adaptável a 16 horas, documentado e não activo. A divisão interna por módulos e lições é proposta da equipa e não explica nem resolve esta divergência.";

export const AVISO_PROPOSTA =
  "Proposta pedagógica — por validar pela Ologa/ATDI. A disponibilidade deste rascunho não equivale a aprovação.";

/**
 * Ficha do curso. Distingue sempre o que vem do Termo de Referência do que é
 * proposta da equipa por validar.
 */
export const FICHA_CURSO = {
  objectivos:
    "Objectivos assentes no conteúdo programático da secção 6.2 (páginas 13 e 14) do Termo de Referência: compreender o conceito de inteligência artificial e os seus fundamentos; distinguir dados, algoritmos e modelos e perceber, em linguagem simples, o que é a aprendizagem automática; utilizar ferramentas de inteligência artificial no trabalho administrativo, com verificação humana; reconhecer aplicações, oportunidades e riscos para a organização e para a economia; tratar ética, riscos e protecção de dados; e conhecer a governação da inteligência artificial, incluindo o Regulamento Europeu de Inteligência Artificial (EU AI Act), os actores nacionais e internacionais e a política e diplomacia da inteligência artificial. Estado real nesta data: os fundamentos estão escritos no módulo 1 (quatro lições, em rascunho). O módulo 2 — casos de uso no serviço público, protecção de dados e privacidade, preconceito algorítmico e inclusão, e supervisão humana e prestação de contas — está planeado e por fornecer; é aí que a governação, incluindo o EU AI Act, os actores e a política e diplomacia serão desenvolvidos, com fontes oficiais actualizadas à data em que forem escritos. O EU AI Act é legislação da União Europeia: é estudado como referência internacional de governação e não se afirma que se aplica automaticamente a Moçambique; qualquer leitura jurídica cabe à área jurídica da instituição.",
  publicoAlvo:
    "Servidores públicos seleccionados pela entidade beneficiária, segundo os critérios da própria entidade. Não é exigida formação anterior em informática, matemática ou programação.",
  preRequisitos:
    "Pré-requisitos digitais propostos pela equipa, por validar: utilizar o computador de forma autónoma, abrir e guardar ficheiros, navegar na internet e usar uma conta de correio electrónico institucional. Não é exigido saber programar. Pré-requisitos de ambiente, da responsabilidade da entidade anfitriã: sala com energia estável, computadores em número suficiente, ligação à internet utilizável em simultâneo pela turma e projecção visível de todos os lugares.",
  materiais:
    "Materiais e condições propostos, por validar: um computador por pessoa formanda como recomendação e, quando não for possível, no máximo duas pessoas por computador, alternando quem executa; conteúdos e guiões na plataforma, em texto navegável por teclado e com leitura em voz alta; fichas de trabalho em papel para os exercícios de análise, que não exigem computador; e, para a prática da lição 4, uma ferramenta de inteligência artificial institucional previamente autorizada pela entidade, preparada pelo formador antes da sessão, com contas e permissões já criadas. Não se pede a ninguém que crie conta pessoal, nem que pague, e não se promete que qualquer ferramenta seja gratuita. Não se introduzem dados reais de pessoas em nenhuma ferramenta: todos os textos usados são fictícios e fornecidos no material.",
  nota:
    "Carga horária provisória de 20 horas, por confirmar pela ATDI — ver a nota de divergência da ficha. Distribuição proposta pela equipa, por validar: 8 horas no módulo 1, 8 horas no módulo 2, 2 horas do módulo transversal contadas uma única vez e 2 horas de diagnóstico, revisão e exame, fora dos módulos. Banco de avaliação deste curso: ainda por preparar, inactivo. O exame deste curso não está activo e não emite certificados. Língua de Sinais de Moçambique, vídeo, legendagem e revisão de acessibilidade por terceiros continuam pendentes e não são reclamados como feitos.",
} as const;
