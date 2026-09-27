/**
 * Plano curricular — «Tecnologias Digitais do Governo» (TdR secção 6.6, p. 17;
 * carga da secção 14, p. 29: 10 horas, presencial).
 *
 * A repartição de minutos é PROPOSTA PEDAGÓGICA INTERNA da equipa: os TdR fixam
 * só as 10 horas e os 9 tópicos, não a divisão por lição.
 * Este ficheiro não contém conteúdo nem perguntas: só estrutura e tempos.
 */

export const SLUG_CURSO = "tecnologias-digitais-governo";
export const CARGA_HORARIA_HORAS = 10;
export const MODALIDADE = "presencial";
export const MINUTOS_TRANSVERSAL = 120;
export const BLOCOS_AVALIACAO = [
  { chave: "diagnostico", minutos: 20 },
  { chave: "revisao", minutos: 40 },
  { chave: "exame", minutos: 60 },
] as const;
export const MINUTOS_AVALIACAO_ORIENTACAO = BLOCOS_AVALIACAO.reduce((s, b) => s + b.minutos, 0);

/** Os 9 tópicos obrigatórios da secção 6.6, tal como constam dos TdR. */
export const TOPICOS_SEC_6_6 = [
  "Portal do Cidadão",
  "Sistema de Gestão Documental",
  "Uso do CorreioGov",
  "Uso da CloudGov",
  "Gestão de contas do CorreioGov",
  "Portal do Governo",
  "Plataforma do Funcionário e Agente do Estado",
  "Sistema de Assinatura Digital",
  "Sistemas de Interoperabilidade",
] as const;
export type TopicoTdr = (typeof TOPICOS_SEC_6_6)[number];

export type TemposLicao = { explicacao: number; actividade: number; formativa: number };

export type LicaoPlano = {
  chave: string;
  ordem: number;
  titulo: string;
  minutos: number;
  tempos: TemposLicao;
  topicos: TopicoTdr[];
};

export const LICOES_PLANO: LicaoPlano[] = [
  {
    chave: "tdg-l1",
    ordem: 1,
    titulo: "Ecossistema digital do Estado: Portal do Governo e Portal do Cidadão",
    minutos: 60,
    tempos: { explicacao: 20, actividade: 30, formativa: 10 },
    topicos: ["Portal do Governo", "Portal do Cidadão"],
  },
  {
    chave: "tdg-l2",
    ordem: 2,
    titulo: "Correio electrónico do Governo: uso e gestão de contas",
    minutos: 75,
    tempos: { explicacao: 25, actividade: 40, formativa: 10 },
    topicos: ["Uso do CorreioGov", "Gestão de contas do CorreioGov"],
  },
  {
    chave: "tdg-l3",
    ordem: 3,
    titulo: "Documentos e assinatura digital: gestão documental e Sistema de Assinatura Digital",
    minutos: 75,
    tempos: { explicacao: 25, actividade: 40, formativa: 10 },
    topicos: ["Sistema de Gestão Documental", "Sistema de Assinatura Digital"],
  },
  {
    chave: "tdg-l4",
    ordem: 4,
    titulo: "Nuvem do Governo e Plataforma do Funcionário e Agente do Estado",
    minutos: 75,
    tempos: { explicacao: 25, actividade: 40, formativa: 10 },
    topicos: ["Uso da CloudGov", "Plataforma do Funcionário e Agente do Estado"],
  },
  {
    chave: "tdg-l5",
    ordem: 5,
    titulo: "Interoperabilidade ao serviço do cidadão: integração final",
    minutos: 75,
    tempos: { explicacao: 25, actividade: 40, formativa: 10 },
    topicos: ["Sistemas de Interoperabilidade"],
  },
];

export const MINUTOS_LICOES = LICOES_PLANO.reduce((s, l) => s + l.minutos, 0);
export const MINUTOS_TOTAIS = MINUTOS_LICOES + MINUTOS_TRANSVERSAL + MINUTOS_AVALIACAO_ORIENTACAO;

export const DESCRICAO_MODULO =
  "Uso dos sistemas digitais do Estado para facilitar o serviço ao cidadão: Portal do Governo e Portal do Cidadão; uso e gestão de contas do CorreioGov; gestão documental e assinatura digital; CloudGov e Plataforma do Funcionário e Agente do Estado; interoperabilidade. As práticas usam simulações didácticas identificadas como tal, sem ecrãs, logótipos nem acessos reais.";

export const NOTA_CARGA =
  "10 horas (TdR, secção 14): 360 minutos de lições temáticas, 120 do módulo transversal e 120 de avaliação e orientação (diagnóstico 20, revisão 40, exame 60).";

export const FICHA_CURSO = {
  objectivos:
    "No fim do curso, a pessoa formanda: distingue a função do Portal do Governo e do Portal do Cidadão e orienta um cidadão para o canal adequado; usa o correio electrónico institucional com segurança e sabe que a criação, alteração e desactivação de contas exige pedido de um responsável autorizado; regista, classifica e encaminha documentos num sistema de gestão documental e distingue assinatura digital de imagem de assinatura; guarda e partilha ficheiros de trabalho na nuvem do Governo com permissões adequadas, sem a confundir com cópia de segurança garantida; identifica o que a Plataforma do Funcionário e Agente do Estado serve para tratar; e explica como a interoperabilidade evita pedir ao cidadão documentos que o Estado já tem, sem significar partilha livre de dados. Resultado dos TdR (secção 6.6): usar os sistemas digitais do Estado para facilitar o serviço ao cidadão.",
  publicoAlvo:
    "Funcionários e agentes do Estado da administração central, provincial, distrital e autárquica que atendem cidadãos, tramitam expediente ou gerem contas e documentos da sua unidade, incluindo pessoal de secretaria, atendimento e pontos focais de tecnologias de informação.",
  preRequisitos:
    "Literacia digital básica: ligar e usar computador ou telemóvel, escrever texto e usar um navegador. Não são exigidos conhecimentos técnicos. Não é preciso ter conta nos sistemas do Governo: nenhuma credencial real é pedida no curso.",
  materiais:
    "Conteúdo de e-learning em texto leve, com síntese em leitura fácil e leitura em voz alta pelo navegador; guião do formador por lição; fichas de caso fictício e documentos de exemplo incluídos em cada lição (mensagens, pedidos de conta, ofícios, registos de entrada, pedidos de dados); versão em papel de todas as actividades com respostas esperadas. As práticas são simulações didácticas em papel ou texto: não reproduzem ecrãs, botões, endereços nem logótipos reais. Não estão disponíveis vídeo, legendagem nem Língua de Sinais Moçambicana.",
};
