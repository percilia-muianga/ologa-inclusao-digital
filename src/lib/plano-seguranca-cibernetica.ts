/**
 * Plano curricular PROPOSTO para o curso «Segurança Cibernética Avançada».
 *
 * Carga horária: 30 horas em regime presencial, conforme a tabela da secção 14
 * do Termo de Referência do Concurso 78A/MDAP/MCTD/QCBS/25. Não há divergência
 * documental conhecida neste curso.
 *
 * A REPARTIÇÃO INTERNA das 1800 minutos — quantos minutos vão para cada módulo,
 * para cada lição e para os blocos de avaliação — é PROPOSTA PEDAGÓGICA DA
 * EQUIPA e não é imposta pelos Termos de Referência. O que o Termo de
 * Referência fixa é o total de 30 horas e o conteúdo programático da secção
 * 6.4 (página 15).
 *
 * Erro corrigido nesta revisão: a configuração anterior somava 15 lições de
 * 120 minutos (30 horas) MAIS 2 horas do módulo transversal e 0 minutos de
 * avaliação, ou seja 32 horas. A repartição abaixo cabe nas 30 horas e inclui
 * o módulo transversal e a avaliação.
 *
 * Estado editorial (validação pedagógica pendente, práticas por executar,
 * escritas pendentes na base de dados) fica em docs/pontos-por-validar.md e
 * não é apresentado ao formando.
 */

/** Conteúdo programático da secção 6.4 (página 15). */
export const TOPICOS_SEC_6_4 = [
  "fundamentos_avancados_de_seguranca",
  "seguranca_de_redes",
  "ethical_hacking_e_testes_de_intrusao",
  "gestao_de_vulnerabilidades",
  "seguranca_de_sistemas_operativos",
  "seguranca_da_computacao_em_nuvem",
  "seguranca_de_aplicacoes",
  "criptografia_aplicada",
  "monitorizacao_e_siem",
  "resposta_a_incidentes",
  "forense_basica",
  "malware_e_ameacas_avancadas",
  "gestao_de_identidades_e_acessos",
  "devsecops",
  "normas_e_conformidade",
  "laboratorios_praticos",
] as const;

export type TopicoSec64 = (typeof TOPICOS_SEC_6_4)[number];

/** Resultados de aprendizagem esperados, enunciados na secção 6.4. */
export const RESULTADOS_SEC_6_4 = [
  "identificar_e_mitigar_vulnerabilidades",
  "definir_controlos_e_politicas",
  "realizar_teste_de_intrusao_etico_documentado",
  "configurar_monitorizacao",
  "responder_a_incidentes",
  "realizar_forense_basica",
  "proteger_ambientes_locais_e_em_nuvem",
  "aplicar_normas_e_boas_praticas",
  "gerir_risco_e_continuidade",
  "contribuir_para_um_centro_de_operacoes_de_seguranca",
] as const;

export type ResultadoSec64 = (typeof RESULTADOS_SEC_6_4)[number];

export type TemposLicao = {
  acolhimento: number;
  exposicao: number;
  actividade: number;
  partilha: number;
};

export type LicaoPlano = {
  /** Chave estável interna. Na base a lição é identificada por (módulo, ordem). */
  chave: string;
  ordem: number;
  titulo: string;
  minutos: number;
  teoriaMin: number;
  praticaMin: number;
  tempos: TemposLicao;
  topicos: TopicoSec64[];
  resultados: ResultadoSec64[];
  /** true quando a lição tem laboratório executado em ambiente isolado. */
  laboratorio: boolean;
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

/** 10 + 25 + 40 + 15 = 90 minutos. */
export const T90: TemposLicao = { acolhimento: 10, exposicao: 25, actividade: 40, partilha: 15 };
/** 10 + 30 + 45 + 15 = 100 minutos. */
export const T100: TemposLicao = { acolhimento: 10, exposicao: 30, actividade: 45, partilha: 15 };
/** 10 + 35 + 60 + 15 = 120 minutos. */
export const T120: TemposLicao = { acolhimento: 10, exposicao: 35, actividade: 60, partilha: 15 };

function licao(
  chave: string,
  ordem: number,
  titulo: string,
  tempos: TemposLicao,
  topicos: TopicoSec64[],
  resultados: ResultadoSec64[],
  laboratorio: boolean,
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
    resultados,
    laboratorio,
  };
}

const M1_LICOES: LicaoPlano[] = [
  licao(
    "m1l1",
    1,
    "Fundamentos avançados, activos críticos e risco cibernético",
    T90,
    ["fundamentos_avancados_de_seguranca", "normas_e_conformidade"],
    ["definir_controlos_e_politicas", "gerir_risco_e_continuidade"],
    false,
  ),
  licao(
    "m1l2",
    2,
    "Gestão de vulnerabilidades e teste de intrusão autorizado",
    T90,
    ["gestao_de_vulnerabilidades", "ethical_hacking_e_testes_de_intrusao"],
    ["identificar_e_mitigar_vulnerabilidades", "realizar_teste_de_intrusao_etico_documentado"],
    false,
  ),
  licao(
    "m1l3",
    3,
    "Endurecimento de sistemas operativos e segurança de redes",
    T100,
    ["seguranca_de_sistemas_operativos", "seguranca_de_redes", "laboratorios_praticos"],
    ["identificar_e_mitigar_vulnerabilidades", "proteger_ambientes_locais_e_em_nuvem"],
    true,
  ),
  licao(
    "m1l4",
    4,
    "Gestão de identidades e acessos e criptografia aplicada",
    T100,
    ["gestao_de_identidades_e_acessos", "criptografia_aplicada", "laboratorios_praticos"],
    ["definir_controlos_e_politicas", "proteger_ambientes_locais_e_em_nuvem"],
    true,
  ),
  licao(
    "m1l5",
    5,
    "Segurança da computação em nuvem e responsabilidade partilhada",
    T100,
    ["seguranca_da_computacao_em_nuvem", "gestao_de_identidades_e_acessos"],
    ["proteger_ambientes_locais_e_em_nuvem", "definir_controlos_e_politicas"],
    false,
  ),
];

const M2_LICOES: LicaoPlano[] = [
  licao(
    "m2l1",
    1,
    "Segurança de aplicações e testes segundo o guia OWASP",
    T120,
    ["seguranca_de_aplicacoes", "ethical_hacking_e_testes_de_intrusao", "laboratorios_praticos"],
    ["identificar_e_mitigar_vulnerabilidades", "realizar_teste_de_intrusao_etico_documentado"],
    true,
  ),
  licao(
    "m2l2",
    2,
    "DevSecOps: segurança no ciclo de desenvolvimento",
    T120,
    ["devsecops", "seguranca_de_aplicacoes", "gestao_de_vulnerabilidades"],
    ["identificar_e_mitigar_vulnerabilidades", "definir_controlos_e_politicas"],
    false,
  ),
  licao(
    "m2l3",
    3,
    "Monitorização, registos e SIEM no apoio ao centro de operações",
    T120,
    ["monitorizacao_e_siem", "seguranca_de_redes", "laboratorios_praticos"],
    ["configurar_monitorizacao", "contribuir_para_um_centro_de_operacoes_de_seguranca"],
    true,
  ),
  licao(
    "m2l4",
    4,
    "Malware, ameaças avançadas e análise forense básica",
    T120,
    ["malware_e_ameacas_avancadas", "forense_basica", "laboratorios_praticos"],
    ["realizar_forense_basica", "responder_a_incidentes"],
    true,
  ),
  licao(
    "m2l5",
    5,
    "Resposta a incidentes: detecção, contenção e recuperação",
    T120,
    ["resposta_a_incidentes", "monitorizacao_e_siem"],
    ["responder_a_incidentes", "contribuir_para_um_centro_de_operacoes_de_seguranca"],
    false,
  ),
];

const M3_LICOES: LicaoPlano[] = [
  licao(
    "m3l1",
    1,
    "Plano de resposta a incidentes e cadeia de custódia da evidência",
    T90,
    ["resposta_a_incidentes", "forense_basica", "normas_e_conformidade"],
    ["responder_a_incidentes", "realizar_forense_basica"],
    false,
  ),
  licao(
    "m3l2",
    2,
    "Comunicação inclusiva e acessível durante um incidente",
    T90,
    ["resposta_a_incidentes", "normas_e_conformidade"],
    ["responder_a_incidentes", "definir_controlos_e_politicas"],
    false,
  ),
  licao(
    "m3l3",
    3,
    "Continuidade dos serviços, cópias de segurança e restauro verificado",
    T100,
    ["resposta_a_incidentes", "seguranca_da_computacao_em_nuvem", "laboratorios_praticos"],
    ["gerir_risco_e_continuidade", "proteger_ambientes_locais_e_em_nuvem"],
    true,
  ),
  licao(
    "m3l4",
    4,
    "Laboratório integrado: do alerta ao relatório",
    T100,
    [
      "laboratorios_praticos",
      "monitorizacao_e_siem",
      "resposta_a_incidentes",
      "forense_basica",
      "ethical_hacking_e_testes_de_intrusao",
    ],
    [
      "responder_a_incidentes",
      "realizar_forense_basica",
      "contribuir_para_um_centro_de_operacoes_de_seguranca",
      "realizar_teste_de_intrusao_etico_documentado",
    ],
    true,
  ),
  licao(
    "m3l5",
    5,
    "Normas, políticas de segurança e melhoria contínua",
    T100,
    ["normas_e_conformidade", "fundamentos_avancados_de_seguranca", "devsecops"],
    ["aplicar_normas_e_boas_praticas", "definir_controlos_e_politicas", "gerir_risco_e_continuidade"],
    false,
  ),
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
    "Gestão Avançada do Risco Cibernético",
    "Cinco lições sobre a base técnica e de gestão: fundamentos avançados, inventário de activos críticos e avaliação de risco; gestão de vulnerabilidades e teste de intrusão autorizado, com regras de compromisso e documentação; endurecimento de sistemas operativos e segurança de redes, com laboratório em ambiente isolado; gestão de identidades e acessos e criptografia aplicada, com laboratório; e segurança da computação em nuvem com o modelo de responsabilidade partilhada.",
    M1_LICOES,
  ),
  modulo(
    "m2",
    2,
    "Protecção, Detecção e Resposta",
    "Cinco lições sobre a operação de segurança: segurança de aplicações com o guia de testes da OWASP e laboratório em aplicação vulnerável instalada localmente; DevSecOps e verificações automáticas no ciclo de desenvolvimento; monitorização, registos e SIEM no apoio ao centro de operações de segurança, com laboratório de regras de detecção; malware, ameaças avançadas e análise forense básica, sem executar software malicioso real; e resposta a incidentes com detecção, contenção, erradicação e recuperação.",
    M2_LICOES,
  ),
  modulo(
    "m3",
    3,
    "Continuidade, Incidentes e Conformidade",
    "Cinco lições sobre preparação, continuidade e governação: plano de resposta a incidentes e cadeia de custódia da evidência; comunicação inclusiva e acessível durante um incidente; continuidade dos serviços com cópias de segurança e restauro verificado em laboratório; laboratório integrado que percorre o caminho do alerta ao relatório; e normas, políticas de segurança e melhoria contínua, com o quadro NIST de segurança cibernética como referência voluntária.",
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
  { chave: "diagnostico", titulo: "Diagnóstico e orientação inicial", minutos: 20 },
  { chave: "revisao", titulo: "Revisão e pós-teste", minutos: 40 },
  { chave: "exame", titulo: "Orientação e exame final", minutos: 60 },
];

export const MINUTOS_AVALIACAO_ORIENTACAO = BLOCOS_AVALIACAO.reduce((s, b) => s + b.minutos, 0);
export const MINUTOS_MODULOS = MODULOS_PLANO.reduce((s, m) => s + m.minutos, 0);
export const MINUTOS_TOTAIS = MINUTOS_MODULOS + MINUTOS_AVALIACAO_ORIENTACAO;

/** 30 horas, conforme a tabela da secção 14. */
export const CARGA_HORARIA_HORAS = 30;
export const MODALIDADE_TABELA_SEC_14 = "presencial";

export const LICOES_PLANO: LicaoPlano[] = MODULOS_PLANO.flatMap((m) => m.licoes);

/** Identificação estável do curso na base de dados. */
export const SLUG_CURSO = "seguranca-cibernetica-avancada";

/** USO INTERNO. Estado editorial; não é apresentado na plataforma. */
export const ESTADO_EDITORIAL_INTERNO =
  "Conteúdo das 15 lições escrito pela equipa e ainda não validado pela Ologa/ATDI. Banco de avaliação e exame final não preparados e não activos. Laboratórios escritos mas nunca executados em sala: a execução efectiva é registada pelo formador na sessão e nenhuma leitura de texto conta como prática executada. Língua de Sinais de Moçambique, vídeo, legendagem e revisão de acessibilidade por terceiros: inexistentes, não anunciados. Nenhuma certificação ISO, nenhuma validação formal da ATDI e nenhuma revisão da REMOTELINE são alegadas.";

/**
 * Ficha do curso. É a versão do CÓDIGO. A ficha que o público vê vem dos campos
 * guardados na base de dados; enquanto a sincronização autorizada não for feita,
 * as duas podem divergir — ver docs/pontos-por-validar.md.
 */
export const FICHA_CURSO = {
  objectivos:
    "Objectivos assentes no conteúdo programático da secção 6.4 (página 15) do Termo de Referência: consolidar fundamentos avançados de segurança da informação; proteger redes, sistemas operativos, aplicações e ambientes em nuvem; realizar gestão de vulnerabilidades e testes de intrusão éticos, sempre autorizados por escrito e documentados; aplicar criptografia e gerir identidades e acessos; configurar monitorização e trabalhar com registos e SIEM em apoio a um centro de operações de segurança; responder a incidentes e realizar análise forense básica preservando a cadeia de custódia; reconhecer malware e ameaças avançadas; integrar segurança no ciclo de desenvolvimento (DevSecOps); e aplicar normas e boas práticas internacionais na definição de políticas, na gestão do risco e na continuidade dos serviços. As referências técnicas usadas — o quadro de segurança cibernética do NIST, o catálogo de vulnerabilidades exploradas conhecidas da CISA e o guia de testes de segurança de aplicações web da OWASP — são referências internacionais voluntárias: não são lei moçambicana, não criam prazos nem obrigações legais e a sua leitura jurídica cabe à área jurídica de cada instituição.",
  publicoAlvo:
    "Pessoal técnico de tecnologias de informação do sector público indicado pela entidade beneficiária: administradores de sistemas e de redes, responsáveis por aplicações e bases de dados, pontos focais de segurança da informação e quem integra ou virá a integrar equipas de resposta a incidentes. É um curso avançado e prático, não é uma acção de sensibilização geral.",
  preRequisitos:
    "Pré-requisitos técnicos: administrar um sistema operativo (Linux ou Windows) na linha de comandos; compreender endereçamento de rede, portas e serviços; ler registos de sistema; e ter noções de administração de servidores ou de aplicações. Não é exigido saber programar, embora ajude. Pré-requisitos de ambiente, da responsabilidade da entidade anfitriã: sala com energia estável; um computador por pessoa com permissão de instalação e com virtualização activada; um segmento de rede isolado, sem ligação à rede de produção da instituição; e autorização escrita da direcção para os exercícios de teste, limitada às máquinas do laboratório.",
  materiais:
    "Um computador por pessoa formanda, com programa de virtualização e as imagens de máquinas virtuais preparadas e copiadas antes da sessão; conteúdos e guiões na plataforma, em texto navegável por teclado e com leitura em voz alta; fichas em papel com os registos, configurações e dados fictícios necessários aos exercícios de análise, que não exigem computador; e um segmento de rede isolado para os laboratórios. Todos os alvos são máquinas do próprio laboratório: nunca se usa um sistema real da instituição nem um sistema de terceiros. Não se distribui, não se descarrega e não se executa software malicioso real — a análise de malware é feita sobre indicadores, registos e descrições fornecidos no material. Não se pede a ninguém que crie conta pessoal nem que pague qualquer serviço.",
  nota:
    "Carga horária de 30 horas, em regime presencial: 8 horas no módulo 1, 10 horas no módulo 2, 8 horas no módulo 3, 2 horas do módulo transversal de Governo Digital Inclusivo e Acessibilidade, contadas uma única vez, e 2 horas de diagnóstico, revisão e exame final, fora dos módulos. Esta repartição interna é proposta pedagógica da equipa; o total de 30 horas é o da tabela da secção 14 do Termo de Referência. A avaliação final deste curso é disponibilizada em fase posterior.",
} as const;
