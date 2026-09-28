/**
 * Banco privado — Tecnologias Digitais do Governo — Lição 3 «Documentos e
 * assinatura digital». 15 itens de exame.
 * Tópicos TdR: Sistema de Gestão Documental; Sistema de Assinatura Digital.
 * Não se afirma o valor jurídico de nenhum tipo de assinatura: a lição remete
 * para a legislação aplicável e para o jurista. Não se descrevem procedimentos
 * do Sistema de Assinatura Digital do Estado. Casos FICTÍCIOS. Rascunho.
 */
import { F_TDR_DOC, type QuestaoTDG } from "./tecnologias-governo-questoes-tipos";

const O1 = "Registar, classificar e encaminhar um documento num sistema de gestão documental.";
const O2 = "Explicar a diferença entre assinatura digital e imagem digitalizada de uma assinatura.";
const O3 = "Identificar quando um documento assinado digitalmente deve ser verificado antes de ser aceite.";
const SGD = "Sistema de Gestão Documental";
const SAD = "Sistema de Assinatura Digital";

export const EXAME_TDG_L3: QuestaoTDG[] = [
  {
    cod: "TDG-L3-01", m: "m1", l: 3, t: "em", d: "f",
    e: "Segundo a lição, qual é a sequência do percurso de um documento num sistema de gestão documental?",
    opts: [
      "Classificação, registo, despacho, encaminhamento e arquivo",
      "Registo, classificação, encaminhamento, despacho e arquivo",
      "Encaminhamento, registo, arquivo, classificação e despacho",
      "Despacho, registo, classificação, arquivo e encaminhamento",
    ], ind: 1,
    exp: "A lição descreve o documento da entrada ao arquivo: registo, classificação, encaminhamento, despacho e arquivo.",
    obj: O1, topico: SGD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-02", m: "m1", l: 3, t: "em", d: "f",
    e: "Que elementos compõem o registo de entrada de um documento, segundo a lição?",
    opts: [
      "Número de páginas, formato do papel, cor da tinta e nome de quem digitalizou",
      "Nome do sistema, tamanho do ficheiro, hora de impressão e número de cópias",
      "Número, data, remetente e assunto do documento",
      "Assinatura, carimbo, cor do envelope e forma de entrega",
    ], ind: 2,
    exp: "O registo tem número, data, remetente e assunto. A classificação acrescenta tipo, processo e grau de acesso.",
    obj: O1, topico: SGD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-03", m: "m1", l: 3, t: "em", d: "me",
    e: "Chegam à secretaria, no mesmo dia, quatro documentos. Qual deve ser registado com grau de acesso restrito?",
    opts: [
      "Um convite de outra direcção para uma reunião pública de balanço anual das actividades",
      "Um pedido de justificação de faltas com atestado médico de um funcionário",
      "Uma circular sobre o horário de funcionamento durante a época festiva",
      "Um ofício a pedir o número de salas de reunião disponíveis no edifício",
    ], ind: 1,
    exp: "O atestado médico contém dados pessoais de saúde. A lição manda que documentos com dados pessoais não fiquem visíveis a toda a instituição.",
    obj: O1, topico: SGD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-04", m: "m1", l: 3, t: "em", d: "me",
    e: "Um cidadão pergunta onde está o requerimento que entregou há três semanas. Que informação do sistema de gestão documental permite responder-lhe?",
    opts: [
      "A data em que o requerimento foi impresso pela última vez no serviço",
      "O nome da pessoa que digitalizou o requerimento no dia da entrada",
      "O número de páginas e o tamanho do ficheiro digitalizado",
      "O encaminhamento registado: a quem foi, com que prazo e o que falta",
    ], ind: 3,
    exp: "A lição diz que o valor do sistema está em saber sempre onde está o documento, quem o tem e o que falta fazer — o encaminhamento registado.",
    obj: O1, topico: SGD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-05", m: "m1", l: 3, t: "em", d: "f",
    e: "Segundo a lição, o que permite verificar uma assinatura digital?",
    opts: [
      "Quem assinou e se o documento foi alterado depois da assinatura",
      "Que o documento produz efeitos jurídicos em qualquer processo",
      "Que o destinatário leu o documento até ao fim antes de o arquivar",
      "Que o conteúdo do documento não tem erros de facto nem de cálculo",
    ], ind: 0,
    exp: "A assinatura digital permite verificar o signatário e detectar alterações posteriores. O valor jurídico depende da legislação aplicável e a lição remete para o jurista; a assinatura não valida o conteúdo.",
    obj: O2, topico: SAD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-06", m: "m1", l: 3, t: "em", d: "di",
    e: "Um documento chega com a frase «assinado digitalmente» escrita no corpo da mensagem, mas o leitor de PDF não mostra nenhuma informação de assinatura. Qual é a apreciação correcta?",
    opts: [
      "É assinado digitalmente, porque o remetente o declara por escrito",
      "É assinado digitalmente, se vier de um endereço institucional",
      "Não se pode tratar como assinado: a frase não é assinatura verificável",
      "É assinado digitalmente, se tiver imagem de assinatura e carimbo",
    ], ind: 2,
    exp: "Exige separar o que se declara do que se pode verificar. Sem informação de assinatura verificável, nem a frase, nem o endereço, nem a imagem com carimbo provam quem assinou ou que o documento não foi alterado.",
    obj: O3, topico: SAD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-07", m: "m1", l: 3, t: "vf", d: "f",
    e: "Verdadeiro ou falso: digitalizar um papel e guardá-lo numa pasta do computador é o mesmo que registá-lo num sistema de gestão documental.",
    val: false,
    exp: "Falso. A lição distingue: digitalizar dá uma cópia; registar dá número, data, remetente, assunto, processo e encaminhamento rastreável.",
    obj: O1, topico: SGD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-08", m: "m1", l: 3, t: "vf", d: "me",
    e: "Verdadeiro ou falso: se o leitor de PDF indicar que o documento foi alterado depois da assinatura digital, a assinatura continua a provar que o signatário aprovou o texto que está no ecrã.",
    val: false,
    exp: "Falso. A assinatura digital serve precisamente para detectar alterações posteriores. Se houve alteração, o texto actual não é o que foi assinado.",
    obj: O3, topico: SAD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-09", m: "m1", l: 3, t: "vf", d: "me",
    e: "Verdadeiro ou falso: saber se um certo tipo de assinatura produz efeitos jurídicos num processo concreto é uma decisão que o funcionário toma sozinho, com base na diferença técnica entre assinatura digital e imagem de assinatura.",
    val: false,
    exp: "Falso. A lição diz que o valor jurídico depende da legislação aplicável e que, em caso de dúvida, se consulta o jurista da instituição.",
    obj: O2, topico: SAD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-10", m: "m1", l: 3, t: "cor", d: "f",
    e: "Associe cada campo do livro de registo ao exemplo adequado.",
    pares: [
      { esquerda: "Número", direita: "CMG/2026/0415" },
      { esquerda: "Grau de acesso", direita: "Restrito: contém dados de saúde" },
      { esquerda: "Encaminhado a", direita: "Sector de recursos humanos" },
      { esquerda: "Prazo", direita: "15 dias úteis" },
    ],
    exp: "São campos do modelo de livro de registo da lição: número único, grau de acesso, destino e prazo.",
    obj: O1, topico: SGD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-11", m: "m1", l: 3, t: "cor", d: "me",
    e: "Associe cada acção sobre um documento à fase do percurso a que pertence.",
    pares: [
      { esquerda: "O documento recebe número e data de entrada", direita: "Registo" },
      { esquerda: "Liga-se ao processo e recebe grau de acesso", direita: "Classificação" },
      { esquerda: "Segue para o sector competente, com prazo", direita: "Encaminhamento" },
      { esquerda: "A chefia decide o que se faz com o pedido", direita: "Despacho" },
    ],
    exp: "Reconhecer a fase a partir da acção concreta aplica o percurso descrito na lição.",
    obj: O1, topico: SGD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-12", m: "m1", l: 3, t: "cor", d: "me",
    e: "Associe cada situação ao que ela prova ou não prova.",
    pares: [
      { esquerda: "Imagem de assinatura colada num PDF", direita: "Não prova quem assinou, porque se copia" },
      { esquerda: "Assinatura digital verificada, sem alterações", direita: "Permite verificar signatário e integridade" },
      { esquerda: "Assinatura digital com alteração posterior", direita: "Já não cobre o conteúdo actual" },
      { esquerda: "Papel digitalizado guardado numa pasta", direita: "Há cópia, mas não registo rastreável" },
    ],
    exp: "A lição distingue imagem de assinatura de assinatura digital e digitalização de registo.",
    obj: O2, topico: SAD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-13", m: "m1", l: 3, t: "vf", cen: true, d: "f",
    e: "Caso fictício. Chega à secretaria do Conselho Municipal de Gurué (fictício) uma declaração de uma empresa em PDF, com imagem de assinatura e carimbo colados. Ao abrir, o leitor não mostra informação de assinatura digital. Verdadeiro ou falso: a declaração pode ser registada como documento assinado digitalmente.",
    val: false,
    exp: "Falso. Sem informação de assinatura verificável é uma imagem colada. Regista-se como tal e, se for exigida assinatura válida, pede-se o documento correcto conforme as regras aplicáveis.",
    obj: O2, topico: SAD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-14", m: "m1", l: 3, t: "em", cen: true, d: "di",
    e: "Caso fictício. A secretaria do Conselho Municipal de Chimoio (fictício) numera por ordem de chegada, de CMC/2026/0510 a 0512: às 08h10, ofício de uma direcção provincial com resposta pedida em 10 dias úteis; às 09h30, requerimento de uma cidadã com a certidão de nascimento do filho; às 11h00, reclamação sobre a limpeza do mercado. Qual linha do livro de registo está correcta?",
    opts: [
      "CMC/2026/0510 — requerimento da cidadã — acesso restrito",
      "CMC/2026/0511 — requerimento da cidadã — acesso a toda a instituição",
      "CMC/2026/0512 — ofício da direcção provincial — prazo de 10 dias úteis",
      "CMC/2026/0511 — requerimento da cidadã — acesso restrito",
    ], ind: 3,
    exp: "É preciso combinar a ordem de chegada (o requerimento é o segundo: 0511) com o grau de acesso (a certidão tem dados pessoais: restrito). Cada alternativa errada acerta um critério e falha o outro.",
    obj: O1, topico: SGD, fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-L3-15", m: "m1", l: 3, t: "em", cen: true, d: "di",
    e: "Caso fictício. A Administração do Distrito de Sussundenga (fictícia) recebe um ofício em PDF assinado digitalmente. O leitor mostra assinatura válida de «Director Provincial» e nenhuma alteração posterior. O ofício pede os dados pessoais de 30 funcionários. O que deve fazer o técnico da secretaria?",
    opts: [
      "Enviar logo os dados dos 30 funcionários, porque a assinatura é válida",
      "Recusar o ofício, porque documentos digitais não entram na secretaria",
      "Imprimir, assinar à mão por baixo e arquivar sem registar a entrada",
      "Registar, classificar como restrito e encaminhar a despacho da chefia",
    ], ind: 3,
    exp: "A assinatura válida confirma signatário e integridade, mas não decide se os dados devem ser enviados. O documento segue o percurso normal: registo, classificação com acesso restrito e despacho de quem tem competência.",
    obj: O3, topico: SAD, fonte: F_TDR_DOC,
  },
];
