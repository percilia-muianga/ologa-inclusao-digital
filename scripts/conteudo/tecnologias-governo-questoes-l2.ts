/**
 * Banco privado — Tecnologias Digitais do Governo — Lição 2 «Correio
 * electrónico do Governo: uso e gestão de contas». 15 itens de exame.
 * Tópicos TdR: Uso do CorreioGov; Gestão de contas do CorreioGov.
 * Só princípios gerais ensinados na lição; nada sobre o funcionamento técnico
 * do CorreioGov (ecrãs, prazos, capacidade, procedimentos internos).
 * Casos FICTÍCIOS. Rascunho.
 */
import { F_TDR_CORREIO, type QuestaoTDG } from "./tecnologias-governo-questoes-tipos";

const O1 = "Usar o correio electrónico institucional para comunicação de serviço: assunto claro, destinatários certos, anexos adequados.";
const O2 = "Reconhecer mensagens fraudulentas e saber a quem as reportar.";
const O3 = "Explicar que criar, alterar, suspender ou desactivar uma conta exige pedido de responsável autorizado e registo.";
const USO = "Uso do CorreioGov";
const CONTAS = "Gestão de contas do CorreioGov";

export const EXAME_TDG_L2: QuestaoTDG[] = [
  {
    cod: "TDG-L2-01", m: "m1", l: 2, t: "em", d: "f",
    e: "Segundo a lição, porque é que o correio electrónico institucional não deve ser usado para assuntos pessoais?",
    opts: [
      "Porque só pode ser aberto dentro do edifício da própria instituição",
      "Porque identifica quem escreve como agente de uma instituição pública",
      "Porque o correio pessoal é sempre mais seguro para qualquer assunto",
      "Porque as mensagens pessoais são lidas por toda a unidade de trabalho",
    ], ind: 1,
    exp: "A lição justifica a regra com a identificação do remetente como agente público: o que se escreve compromete a instituição. As outras razões não constam da lição.",
    obj: O1, topico: USO, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-02", m: "m1", l: 2, t: "em", d: "me",
    e: "Uma convocatória vai ser enviada a 40 cidadãos que não se conhecem entre si. Onde se devem colocar os endereços deles?",
    opts: [
      "Todos no campo Para, para que cada um saiba quem mais foi convocado",
      "No campo Cc, porque são destinatários apenas para conhecimento da reunião marcada",
      "No campo Bcc (cópia oculta), para não mostrar os endereços uns aos outros",
      "Metade no campo Para e metade no campo Cc, para equilibrar a lista",
    ], ind: 2,
    exp: "Endereços de cidadãos são dados pessoais e só seguem a quem precisa deles. Em Bcc, cada destinatário recebe a mensagem sem ver os outros endereços.",
    obj: O1, topico: USO, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-03", m: "m1", l: 2, t: "em", d: "f",
    e: "Numa conversa por correio com 25 destinatários, um colega pede apenas a si o número de um processo. Como responde, segundo a lição?",
    opts: [
      "Responde só ao colega que pediu o número do processo",
      "Responde a todos, para que fiquem todos informados",
      "Responde a todos e acrescenta a direcção em cópia",
      "Reencaminha a conversa inteira para o arquivo geral",
    ], ind: 0,
    exp: "A lição pede que se evite «responder a todos» sem necessidade e que se escolham os destinatários com cuidado.",
    obj: O1, topico: USO, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-04", m: "m1", l: 2, t: "em", d: "f",
    e: "Qual destes elementos de uma mensagem é um sinal típico de fraude, segundo a lição?",
    opts: [
      "Um assunto que indica o número do processo a que a mensagem se refere",
      "Um remetente de uma unidade conhecida, confirmado pelo canal interno",
      "Um anexo com o documento que o colega tinha anunciado na véspera",
      "Um pedido para confirmar a palavra-passe ou um código recebido",
    ], ind: 3,
    exp: "A lição enumera: urgência artificial, pedido de palavra-passe ou código, remetente parecido mas diferente, ligações que não correspondem ao texto e anexos inesperados.",
    obj: O2, topico: USO, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-05", m: "m1", l: 2, t: "em", d: "me",
    e: "Chega um anexo «factura_urgente.zip» com o nome de um fornecedor que a instituição conhece, mas o texto não corresponde a nenhum contrato em curso. O que faz?",
    opts: [
      "Abre o anexo no computador de um colega, para não pôr o seu em risco",
      "Não abre nem responde e reporta ao ponto focal de TI pelo canal interno",
      "Responde ao remetente a pedir que envie a factura em formato PDF",
      "Reencaminha a mensagem ao fornecedor para confirmar se é verdadeira",
    ], ind: 1,
    exp: "O nome conhecido não afasta os outros sinais: anexo inesperado e texto que não bate certo. A regra da lição é não clicar, não responder e reportar ao ponto focal de TI pelo canal interno conhecido.",
    obj: O2, topico: USO, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-06", m: "m1", l: 2, t: "em", d: "di",
    e: "Um técnico sai da instituição a 30/09/2026. Qual destes pedidos de desactivação da conta está completo segundo a ficha modelo da lição?",
    opts: [
      "Pedido do colega de gabinete do técnico, com o despacho de saída e data de efeito 30/09/2026",
      "Pedido do chefe da unidade do técnico, com o despacho de saída e data de efeito 30/09/2026",
      "Pedido do chefe da unidade do técnico, com data de efeito 30/09/2026, sem documento de suporte",
      "Pedido do chefe de outra unidade, com o despacho de saída e data de efeito 30/09/2026",
    ], ind: 1,
    exp: "A ficha exige tipo, titular, responsável autorizado que pede (o da unidade do titular), documento de suporte e data de efeito. Cada alternativa errada falha num único elemento, o que obriga a verificar todos.",
    obj: O3, topico: CONTAS, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-07", m: "m1", l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: uma conta pessoal de correio institucional pode ser usada por dois funcionários do mesmo gabinete, desde que ambos conheçam a palavra-passe.",
    val: false,
    exp: "Falso. A lição diz que nunca se partilha uma conta pessoal. Caixas partilhadas de serviço, quando existem, têm responsável nomeado.",
    obj: O3, topico: CONTAS, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-08", m: "m1", l: 2, t: "vf", d: "me",
    e: "Verdadeiro ou falso: quando um funcionário muda de funções dentro da instituição, a sua conta mantém-se exactamente igual até ele sair.",
    val: false,
    exp: "Falso. A lição indica que, na saída ou na mudança de funções, a conta é suspensa ou ajustada no prazo definido pela instituição.",
    obj: O3, topico: CONTAS, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-09", m: "m1", l: 2, t: "vf", d: "di",
    e: "Verdadeiro ou falso: um pedido de criação de conta que parece vir do endereço institucional do director, com despacho em anexo, pode ser executado sem outra confirmação.",
    val: false,
    exp: "Falso. A lição aponta como erro comum aceitar este tipo de pedido sem confirmar o remetente pelo canal interno. O pedido pode ser legítimo, mas só depois de confirmado. A dificuldade está em a mensagem parecer correcta em tudo.",
    obj: O3, topico: CONTAS, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-10", m: "m1", l: 2, t: "cor", d: "f",
    e: "Associe cada acção de gestão de contas à situação que normalmente a origina.",
    pares: [
      { esquerda: "Criar", direita: "Entrada de um novo técnico, com despacho" },
      { esquerda: "Alterar dados", direita: "Mudança de função do titular na instituição" },
      { esquerda: "Suspender", direita: "Ausência prolongada decidida pelo responsável" },
      { esquerda: "Desactivar", direita: "Saída definitiva do funcionário" },
    ],
    exp: "A lição define gerir contas como criar, alterar, repor acesso, suspender e desactivar, sempre por pedido do responsável autorizado e com registo.",
    obj: O3, topico: CONTAS, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-11", m: "m1", l: 2, t: "cor", d: "me",
    e: "Associe cada parte de uma mensagem de serviço à boa prática da lição.",
    pares: [
      { esquerda: "Assunto", direita: "Diz o que é e indica o número do processo" },
      { esquerda: "Destinatários", direita: "Só quem precisa, escolhendo Para, Cc ou Bcc" },
      { esquerda: "Dados pessoais de cidadãos", direita: "Só seguem a quem precisa deles para o serviço" },
      { esquerda: "Anexos", direita: "Apenas os adequados ao assunto tratado" },
    ],
    exp: "São as quatro regras de uso apresentadas: assunto claro, destinatários certos, dados pessoais só a quem precisa e anexos adequados.",
    obj: O1, topico: USO, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-12", m: "m1", l: 2, t: "cor", d: "me",
    e: "Associe cada mensagem recebida pela pessoa que gere as contas à decisão correcta.",
    pares: [
      { esquerda: "Pedido, de endereço pessoal, da palavra-passe de uma colega ausente", direita: "Recusar; só pedido formal do responsável" },
      { esquerda: "Pedido de conta nova, assinado pelo chefe da unidade, com despacho", direita: "Confirmar pelo canal interno e preencher a ficha" },
      { esquerda: "Aviso de que a caixa será apagada em 2 horas, de domínio externo", direita: "Não clicar e reportar ao ponto focal de TI" },
      { esquerda: "Cidadão que pede o ponto de situação do seu processo", direita: "Responder só a ele, com assunto que identifique o processo" },
    ],
    exp: "Cada decisão aplica uma regra: palavras-passe não se entregam; pedidos de conta confirmam-se e registam-se; fraudes reportam-se; respostas a cidadãos vão só ao interessado.",
    obj: O3, topico: CONTAS, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-13", m: "m1", l: 2, t: "em", cen: true, d: "me",
    e: "Caso fictício. O Sr. Armando Chiziane pediu por escrito informação sobre o processo n.º SDAE-GUR/2026/0088 ao Serviço Distrital de Actividades Económicas de Gurué (fictício). A técnica preparou quatro versões da resposta. Qual segue a lição?",
    opts: [
      "Assunto «Resposta»; enviada só ao Sr. Armando; indica estado, próximo passo, prazo e contacto",
      "Assunto com o número do processo; enviada ao Sr. Armando e, em Cc, a outros 12 requerentes",
      "Assunto com o número do processo; só ao Sr. Armando; estado, próximo passo, prazo e contacto",
      "Assunto com o número do processo; só ao Sr. Armando; anexa a lista dos outros beneficiários",
    ], ind: 2,
    exp: "A resposta certa junta tudo: assunto que identifica o processo, só o interessado como destinatário, conteúdo útil e nenhum dado de terceiros. Cada alternativa errada falha numa destas regras.",
    obj: O1, topico: USO, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-14", m: "m1", l: 2, t: "em", cen: true, d: "di",
    e: "Caso fictício. Na Direcção Provincial de Agricultura de Tete (fictícia) chegam, no mesmo dia: (A) pedido do director para criar contas para 2 técnicos, com despacho, confirmado pelo canal interno; (B) pedido da chefe da unidade para desactivar a conta de 1 funcionário aposentado, com documento, confirmado; (C) telefonema do chefe de outra unidade a pedir a suspensão de 1 conta; (D) pedido de um colega para receber a palavra-passe de outra funcionária; (E) pedido do responsável da unidade para alterar a função de 1 titular, sem documento de suporte. Quantas contas podem ser tratadas já, tal como os pedidos chegaram?",
    opts: ["3 contas", "4 contas", "5 contas", "6 contas"], ind: 0,
    exp: "Só A (2 contas) e B (1 conta) cumprem pedido do responsável autorizado, documento e confirmação: 3. C vem de quem não é responsável e por telefone; D nunca se executa; E precisa primeiro do documento de suporte.",
    obj: O3, topico: CONTAS, fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-L2-15", m: "m1", l: 2, t: "vf", cen: true, d: "f",
    e: "Caso fictício. A técnica Rosa Mabunda, da Direcção Distrital de Saúde de Manica (fictícia), recebe de «suporte-contas@verificacao-correio.org» uma mensagem: «Para manter a sua caixa, envie nos próximos 30 minutos o código que acabou de receber por SMS.» Verdadeiro ou falso: Rosa pode enviar o código, porque não é a palavra-passe.",
    val: false,
    exp: "Falso. A lição inclui o pedido de código entre os sinais de fraude, a par da urgência e do remetente externo. Não se responde e reporta-se ao ponto focal de TI.",
    obj: O2, topico: USO, fonte: F_TDR_CORREIO,
  },
];
