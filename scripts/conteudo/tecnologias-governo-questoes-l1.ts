/**
 * Banco privado — Tecnologias Digitais do Governo — Lição 1 «Ecossistema
 * digital do Estado: Portal do Governo e Portal do Cidadão». 14 itens de exame.
 * Tópicos TdR: Portal do Governo; Portal do Cidadão.
 * Não se descrevem passos, ecrãs nem serviços concretos do Portal do Cidadão:
 * só o que a lição afirma. Áreas do Portal do Governo conforme consulta de
 * 27/09/2026 registada na fonte da lição. Casos FICTÍCIOS. Rascunho.
 */
import { F_PC, F_PG, type QuestaoTDG } from "./tecnologias-governo-questoes-tipos";

const O1 = "Explicar para que serve um portal institucional do Governo e para que serve um portal de serviços ao cidadão.";
const O2 = "Orientar um cidadão para o canal adequado (portal informativo, portal de serviços, balcão presencial).";
const O3 = "Verificar se uma página é oficial antes de a indicar ao cidadão.";

export const EXAME_TDG_L1: QuestaoTDG[] = [
  {
    cod: "TDG-L1-01", m: "m1", l: 1, t: "em", d: "f",
    e: "Um utente quer consultar informação sobre a organização do Conselho de Ministros e dos governos provinciais. Segundo a lição, que canal lhe indica?",
    opts: [
      "O Portal do Cidadão, por ser o balcão digital onde se pedem e acompanham os serviços",
      "O Portal do Governo, que é sobretudo um canal de informação sobre o Estado",
      "O correio institucional do funcionário, para lhe enviar os documentos",
      "O balcão da secretaria, que é o único sítio onde essa informação existe",
    ], ind: 1,
    exp: "A lição apresenta o Portal do Governo como canal de informação, com a área Governo (Conselho de Ministros, governos provinciais e distritais). O portal do cidadão é, em conceito, um balcão de serviços.",
    obj: O1, topico: "Portal do Governo", fonte: F_PG,
  },
  {
    cod: "TDG-L1-02", m: "m1", l: 1, t: "em", d: "f",
    e: "Antes de indicar a um cidadão o endereço de um portal do Estado, que verificação recomenda a lição?",
    opts: [
      "Confirmar que a página mostra o emblema da República e as cores nacionais",
      "Confirmar que a página abre depressa e tem um aspecto cuidado e profissional",
      "Confirmar o domínio governamental e que o endereço veio de fonte oficial",
      "Confirmar que o endereço foi partilhado por vários colegas num grupo de mensagens",
    ], ind: 2,
    exp: "A lição pede dois cuidados: o endereço termina no domínio governamental conhecido (por exemplo .gov.mz) e foi obtido de fonte oficial, não de mensagem recebida. Emblemas, cores e aspecto copiam-se com facilidade.",
    obj: O3, topico: "Portal do Cidadão", fonte: F_PC,
  },
  {
    cod: "TDG-L1-03", m: "m1", l: 1, t: "em", d: "f",
    e: "Uma funcionária quer ler os procedimentos relativos ao seu processo individual. Segundo a consulta ao Portal do Governo registada na lição, em que área aparecem esses temas?",
    opts: [
      "Na área Cidadão",
      "Na área Empresas",
      "Na área Imprensa",
      "Na área Função Pública",
    ], ind: 3,
    exp: "Na consulta de 27/09/2026 citada na lição, a área Função Pública inclui processos administrativos, processo individual e procedimentos para a promoção do funcionário.",
    obj: O1, topico: "Portal do Governo", fonte: F_PG,
  },
  {
    cod: "TDG-L1-04", m: "m1", l: 1, t: "em", d: "me",
    e: "Um cidadão de 70 anos, sem telemóvel nem computador com internet, quer acompanhar um pedido que o portal de serviços permite acompanhar. Qual é a orientação adequada?",
    opts: [
      "Oferecer o balcão presencial ou acompanhar com ele, sem usar a conta dele",
      "Criar-lhe uma conta com o endereço do funcionário e acompanhar o pedido por ele",
      "Explicar que só é possível pela internet e pedir que volte com um familiar",
      "Pedir-lhe os dados de acesso de um familiar para consultar o pedido no balcão",
    ], ind: 0,
    exp: "A lição manda oferecer a alternativa presencial a quem não tem acesso. O funcionário orienta; nunca cria contas em nome de outro nem usa dados de acesso de terceiros.",
    obj: O2, topico: "Portal do Cidadão", fonte: F_PC,
  },
  {
    cod: "TDG-L1-05", m: "m1", l: 1, t: "em", d: "f",
    e: "Antes de explicar a um utente os passos para pedir um serviço no portal de serviços ao cidadão, o que deve o funcionário fazer, segundo a lição?",
    opts: [
      "Descrever os passos de memória, tal como funcionavam quando os usou pela última vez",
      "Repetir a explicação dada por outro utente que já pediu esse serviço no mês anterior",
      "Garantir ao utente que todos os serviços públicos já estão disponíveis nesse portal",
      "Confirmar no próprio portal se o serviço está disponível e quais são os passos",
    ], ind: 3,
    exp: "A lição diz que os serviços e os passos são os que constam do próprio portal e devem ser confirmados lá antes de orientar. Descrever passos não confirmados é um dos erros comuns do guião.",
    obj: O2, topico: "Portal do Cidadão", fonte: F_PC,
  },
  {
    cod: "TDG-L1-06", m: "m1", l: 1, t: "em", d: "di",
    e: "Três pedidos no balcão: (a) ler um comunicado do Governo; (b) acompanhar um pedido feito em linha, que o portal de serviços permite acompanhar; (c) um cidadão cego cujo leitor de ecrã não consegue usar o formulário do portal. Que combinação de orientações está correcta?",
    opts: [
      "(a) Portal do Governo; (b) portal de serviços; (c) balcão ou apoio, sem usar a conta dele",
      "(a) portal de serviços; (b) Portal do Governo; (c) Portal do Governo, que é mais simples",
      "(a) Portal do Governo; (b) balcão; (c) o funcionário entra na conta dele e faz o pedido",
      "(a) Portal do Governo; (b) portal de serviços; (c) pedir que volte com quem veja",
    ], ind: 0,
    exp: "É preciso acertar as três ao mesmo tempo: informar é função do Portal do Governo; acompanhar pedidos é do portal de serviços; a quem o portal não acomoda oferece-se a alternativa presencial ou apoio, sem usar a conta da pessoa nem a mandar embora.",
    obj: O2, topico: "Portal do Governo", fonte: F_PG,
  },
  {
    cod: "TDG-L1-07", m: "m1", l: 1, t: "vf", d: "f",
    e: "Verdadeiro ou falso: um endereço recebido por mensagem pode ser indicado ao cidadão desde que a página apresente o nome do portal oficial.",
    val: false,
    exp: "Falso. O nome e o aspecto imitam-se. A lição manda usar endereços obtidos de fonte oficial e confirmar o domínio governamental.",
    obj: O3, topico: "Portal do Cidadão", fonte: F_PC,
  },
  {
    cod: "TDG-L1-08", m: "m1", l: 1, t: "vf", d: "me",
    e: "Verdadeiro ou falso: uma página cujo endereço termina em .gov.mz, mas que foi aberta a partir de uma ligação recebida por SMS, merece a mesma confiança que o endereço obtido numa fonte oficial.",
    val: false,
    exp: "Falso. A lição exige as duas condições: domínio governamental e origem em fonte oficial, não em mensagem recebida. Uma ligação recebida pode levar a endereço parecido ou enganador.",
    obj: O3, topico: "Portal do Cidadão", fonte: F_PC,
  },
  {
    cod: "TDG-L1-09", m: "m1", l: 1, t: "vf", d: "di",
    e: "Verdadeiro ou falso: o endereço «portaldogoverno.gov.mz.actualizar-dados.com» termina no domínio governamental .gov.mz.",
    val: false,
    exp: "Falso. O endereço termina em .com: «portaldogoverno.gov.mz» é só o início do nome, colocado para enganar. É preciso ler até ao fim para ver o domínio real, o que exige análise e não reconhecimento.",
    obj: O3, topico: "Portal do Governo", fonte: F_PG,
  },
  {
    cod: "TDG-L1-10", m: "m1", l: 1, t: "cor", d: "f",
    e: "Associe cada necessidade ao canal indicado na lição.",
    pares: [
      { esquerda: "Informação geral sobre províncias e distritos", direita: "Portal do Governo, área Moçambique" },
      { esquerda: "Procedimentos para a promoção do funcionário", direita: "Portal do Governo, área Função Pública" },
      { esquerda: "Pedir ou acompanhar um serviço disponível em linha", direita: "Portal de serviços ao cidadão" },
      { esquerda: "Cidadão sem qualquer acesso à internet", direita: "Balcão presencial" },
    ],
    exp: "As áreas do Portal do Governo seguem a consulta registada na lição; o portal de serviços é o balcão digital; o balcão presencial é sempre a alternativa.",
    obj: O2, topico: "Portal do Governo", fonte: F_PG,
  },
  {
    cod: "TDG-L1-11", m: "m1", l: 1, t: "cor", d: "me",
    e: "Um utente mostra uma mensagem suspeita. Associe cada sinal encontrado ao que o funcionário lhe deve dizer.",
    pares: [
      { esquerda: "Endereço em .com e não no domínio governamental", direita: "Não usar esse endereço; procurar o oficial em fonte oficial" },
      { esquerda: "Pedido de pagamento feito por mensagem", direita: "Não pagar nem responder à mensagem" },
      { esquerda: "Pedido da palavra-passe para «confirmação»", direita: "Nunca a enviar a ninguém" },
      { esquerda: "Ameaça de suspensão imediata da conta", direita: "Desconfiar da urgência e confirmar por canal oficial" },
    ],
    exp: "A lição lista estes sinais de imitação e a orientação: não pagar, não responder, não entregar palavra-passe e usar só endereços de fonte oficial.",
    obj: O3, topico: "Portal do Cidadão", fonte: F_PC,
  },
  {
    cod: "TDG-L1-12", m: "m1", l: 1, t: "cor", d: "me",
    e: "Associe cada situação no balcão à conduta do funcionário que a lição descreve.",
    pares: [
      { esquerda: "O utente quer que o funcionário use a conta dele", direita: "Recusar e orientar enquanto o utente escreve os seus dados" },
      { esquerda: "O utente não sabe que documentos deve ter", direita: "Explicar os documentos, confirmados na fonte oficial" },
      { esquerda: "O serviço não existe no portal de serviços", direita: "Indicar o atendimento presencial" },
      { esquerda: "O utente duvida de um endereço que recebeu", direita: "Confirmar domínio e origem antes de o usar" },
    ],
    exp: "O funcionário orienta: não usa contas alheias, explica documentos confirmados, oferece o presencial e verifica endereços.",
    obj: O2, topico: "Portal do Cidadão", fonte: F_PC,
  },
  {
    cod: "TDG-L1-13", m: "m1", l: 1, t: "em", cen: true, d: "me",
    e: "Caso fictício. Na Secretaria Distrital de Gurué (fictícia), o Sr. Custódio Namashulua mostra um SMS: «A sua inscrição no portal expira hoje. Pague 75 MT em portal-servicos-mz.net e envie o código que vai receber.» Pergunta ao funcionário se deve pagar. Qual é a orientação correcta?",
    opts: [
      "Pagar os 75 MT, mas guardar o comprovativo para reclamar se não for verdade",
      "Responder ao SMS a pedir mais informação antes de decidir se paga ou não",
      "Não pagar nem enviar o código: o endereço não é governamental e veio por mensagem",
      "Abrir a página no computador do balcão para confirmar se é verdadeira",
    ], ind: 2,
    exp: "Há três sinais da lição: domínio não governamental, pagamento pedido por mensagem e pedido de código. Não se paga, não se responde e não se abre a página; usa-se só o endereço de fonte oficial.",
    obj: O3, topico: "Portal do Cidadão", fonte: F_PC,
  },
  {
    cod: "TDG-L1-14", m: "m1", l: 1, t: "em", cen: true, d: "di",
    e: "Caso fictício. No balcão da Administração de Marracuene (fictícia) foram preenchidas 4 fichas de orientação. Ficha 1: Rosa quer ler comunicados do Governo — Portal do Governo. Ficha 2: Paulo quer acompanhar um pedido feito em linha — portal de serviços, alternativa balcão. Ficha 3: Zulmira, sem internet, quer pedir um serviço — portal de serviços, com o funcionário a usar a conta dela. Ficha 4: Tomé recebeu um endereço em .com — não usar e procurar o oficial. Que ficha tem um erro?",
    opts: [
      "A ficha 1, porque os comunicados se pedem no portal de serviços",
      "A ficha 2, porque o acompanhamento de pedidos não tem alternativa",
      "A ficha 4, porque o endereço deve ser testado antes de ser recusado",
      "A ficha 3, porque o funcionário não pode usar a conta da utente",
    ], ind: 3,
    exp: "É preciso avaliar as quatro fichas. A 3 falha duas regras: usa a conta da utente e ignora o balcão para quem não tem internet. As outras seguem a lição.",
    obj: O2, topico: "Portal do Cidadão", fonte: F_PC,
  },
];
