/**
 * Banco privado — Tecnologias Digitais do Governo — Lição 4 «Nuvem do Governo
 * e Plataforma do Funcionário e Agente do Estado». 14 itens de exame.
 * Tópicos TdR: Uso da CloudGov; Plataforma do Funcionário e Agente do Estado.
 * Não se afirmam funções, cópias de segurança ou prazos da CloudGov nem da
 * Plataforma: a lição remete para a entidade gestora, a ATDI, o ponto focal e
 * os recursos humanos. Casos FICTÍCIOS. Rascunho.
 */
import { F_PG, F_TDR_NUVEM, type QuestaoTDG } from "./tecnologias-governo-questoes-tipos";

const O1 = "Guardar e partilhar ficheiros de trabalho na nuvem do Governo com permissões adequadas.";
const O2 = "Explicar porque a nuvem não é, por si só, uma cópia de segurança garantida.";
const O3 = "Identificar que assuntos do funcionário se tratam por uma plataforma do funcionário e agente do Estado e a quem recorrer quando falha.";
const NUVEM = "Uso da CloudGov";
const PFAE = "Plataforma do Funcionário e Agente do Estado";

export const EXAME_TDG_L4: QuestaoTDG[] = [
  {
    cod: "TDG-L4-01", m: "m1", l: 4, t: "em", d: "f",
    e: "Segundo a lição, porque é preferível guardar ficheiros de trabalho na nuvem institucional em vez de os fazer circular em pen drives?",
    opts: [
      "Porque a nuvem torna dispensável qualquer outra cópia dos ficheiros",
      "Porque na nuvem os ficheiros ficam visíveis a toda a administração",
      "Porque o serviço é gerido pelo Estado e a partilha é feita com critério",
      "Porque a nuvem permite trabalhar a partir de contas de correio pessoais",
    ], ind: 2,
    exp: "A lição apresenta a nuvem institucional como serviço gerido pelo Estado que permite partilhar com colegas em vez de circular pen drives ou usar contas pessoais. Não a apresenta como cópia de segurança garantida.",
    obj: O1, topico: NUVEM, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-02", m: "m1", l: 4, t: "em", d: "f",
    e: "Qual destes nomes de ficheiro segue a boa prática indicada na lição?",
    opts: [
      "relatorio_final_FINAL2_revisto.docx",
      "novo documento (2) - copia.docx",
      "documento1_versao_nova.docx",
      "2026-10-02_relatorio-trimestral_v3.docx",
    ], ind: 3,
    exp: "A lição recomenda nomes com data e versão, para saber qual é a mais recente.",
    obj: O1, topico: NUVEM, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-03", m: "m1", l: 4, t: "em", d: "me",
    e: "Uma técnica de outra direcção precisa de consultar uma folha de beneficiários que inclui números de BI. Qual é a partilha adequada?",
    opts: [
      "Ligação aberta a qualquer pessoa, porque a técnica também trabalha no Estado",
      "Só com essa técnica, nomeada, só de leitura e apenas com o que ela precisa",
      "Cópia em pen drive, entregue em mão, para não usar a nuvem com dados pessoais",
      "Partilha com edição, para que a técnica possa corrigir os erros que encontrar",
    ], ind: 1,
    exp: "A lição pede partilha com pessoas nomeadas, só leitura quando basta, e proíbe a ligação aberta com dados pessoais. A pen drive é precisamente o que a nuvem deve substituir.",
    obj: O1, topico: NUVEM, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-04", m: "m1", l: 4, t: "em", d: "f",
    e: "O registo de um funcionário mostra uma habilitação que não corresponde ao certificado que ele tem. O que deve fazer, segundo a lição?",
    opts: [
      "Pedir a um colega dos recursos humanos que altere o dado informalmente",
      "Esperar pela próxima promoção para então tentar corrigir o dado errado",
      "Pedir a correcção pelo canal indicado pelos recursos humanos, com o certificado",
      "Alterar o dado ele próprio, logo que tenha acesso ao seu registo",
    ], ind: 2,
    exp: "A lição diz: pedir a correcção pelo canal indicado pelos recursos humanos, com documento de suporte.",
    obj: O3, topico: PFAE, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-05", m: "m1", l: 4, t: "em", d: "di",
    e: "Que afirmação sobre a Plataforma do Funcionário e Agente do Estado é compatível com as fontes usadas no curso?",
    opts: [
      "Permite pedir férias, receber o salário e mudar de categoria sem quaisquer outros passos",
      "As funções disponíveis e a forma de acesso são indicadas pelos recursos humanos",
      "É o Portal do Cidadão com outro nome, destinado a funcionários do Estado",
      "Dá a cada funcionário acesso aos dados de todos os colegas da sua unidade",
    ], ind: 1,
    exp: "Exige separar o confirmado do inventado. A lição não descreve funções concretas da plataforma: remete para os recursos humanos. Dados de colegas só são vistos por quem tem essa função, e não é o Portal do Cidadão.",
    obj: O3, topico: PFAE, fonte: F_PG,
  },
  {
    cod: "TDG-L4-06", m: "m1", l: 4, t: "vf", d: "f",
    e: "Verdadeiro ou falso: se um ficheiro for substituído por engano por uma versão errada numa pasta sincronizada, a sincronização pode reproduzir esse erro nas outras cópias.",
    val: true,
    exp: "Verdadeiro. A lição explica que a nuvem pode reproduzir apagamentos e substituições por engano; por isso não é, por si só, cópia de segurança garantida.",
    obj: O2, topico: NUVEM, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-07", m: "m1", l: 4, t: "vf", d: "me",
    e: "Verdadeiro ou falso: qualquer funcionário com acesso à plataforma do funcionário pode consultar os dados de um colega, desde que seja para o ajudar.",
    val: false,
    exp: "Falso. A lição diz que cada funcionário usa só o seu acesso e que dados de colegas só são vistos por quem tem essa função, como os recursos humanos.",
    obj: O3, topico: PFAE, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-08", m: "m1", l: 4, t: "vf", d: "me",
    e: "Verdadeiro ou falso: um consultor cujo contrato terminou ontem pode manter o acesso de leitura à pasta do projecto, porque ler não altera nada.",
    val: false,
    exp: "Falso. A lição manda retirar os acessos quando o trabalho termina. A leitura também expõe informação.",
    obj: O1, topico: NUVEM, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-09", m: "m1", l: 4, t: "cor", d: "me",
    e: "Associe cada ficheiro ou pasta da equipa à permissão adequada.",
    pares: [
      { esquerda: "Minuta que três técnicos redigem juntos", direita: "Edição para os três, nomeados" },
      { esquerda: "Versão aprovada, para consulta da direcção", direita: "Só leitura para as pessoas nomeadas" },
      { esquerda: "Folha com números de BI de beneficiários", direita: "Acesso restrito a quem trata o processo" },
      { esquerda: "Pasta de um projecto já concluído", direita: "Retirar os acessos que deixaram de ser precisos" },
    ],
    exp: "Aplica o mínimo acesso necessário pelo tempo necessário: editar só quem redige, ler quando basta, restringir dados pessoais e retirar acessos no fim.",
    obj: O1, topico: NUVEM, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-10", m: "m1", l: 4, t: "cor", d: "f",
    e: "Associe cada boa prática de organização na nuvem à razão que a justifica.",
    pares: [
      { esquerda: "Pastas por processo ou por equipa", direita: "Encontrar ficheiros e dar permissões por grupo" },
      { esquerda: "Data e versão no nome do ficheiro", direita: "Saber qual é a versão mais recente" },
      { esquerda: "Partilha com pessoas nomeadas", direita: "Saber sempre quem tem acesso" },
      { esquerda: "Retirar acessos no fim do trabalho", direita: "Não deixar acessos que já não são precisos" },
    ],
    exp: "São as boas práticas enumeradas na lição e a razão de cada uma.",
    obj: O1, topico: NUVEM, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-11", m: "m1", l: 4, t: "cor", d: "me",
    e: "Associe cada situação à entidade a quem a lição manda recorrer.",
    pares: [
      { esquerda: "Dado errado no próprio registo de funcionário", direita: "Recursos humanos, pelo canal indicado" },
      { esquerda: "Dúvida sobre as cópias de segurança da nuvem", direita: "ATDI ou ponto focal" },
      { esquerda: "Mensagem suspeita a pedir credenciais", direita: "Ponto focal de TI, pelo canal interno" },
      { esquerda: "Valor jurídico de uma assinatura num processo", direita: "Jurista da instituição" },
    ],
    exp: "Cada lição indica um interlocutor próprio: recursos humanos, ATDI ou ponto focal, ponto focal de TI e jurista.",
    obj: O3, topico: PFAE, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-12", m: "m1", l: 4, t: "em", cen: true, d: "me",
    e: "Caso fictício. A equipa de planificação de Massingir (fictícia) tem 4 pessoas: a chefe Teresa, os técnicos Aurélio e Sónia e a consultora externa Elisa, com contrato até 15/11/2026. A pasta «Plano 2027» tem «orcamento_v2.xlsx» e «agregados_com_BI.xlsx». Qual configuração segue a lição?",
    opts: [
      "Os quatro editam tudo, e o acesso da Elisa é revisto no fim do ano civil",
      "Teresa, Aurélio e Sónia editam; Elisa lê só o orçamento, sem a folha com BI, até 15/11",
      "Teresa, Aurélio e Sónia editam; Elisa recebe ligação aberta para ler os dois ficheiros",
      "Só a Teresa edita; os outros três lêem tudo, incluindo a folha com BI, sem prazo",
    ], ind: 1,
    exp: "Edição só para a equipa, leitura só no que a consultora precisa, dados pessoais restritos e acesso retirado no fim do contrato.",
    obj: O1, topico: NUVEM, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-13", m: "m1", l: 4, t: "em", cen: true, d: "di",
    e: "Caso fictício. Na Administração de Mandlakazi (fictícia), a técnica Eunice, dos recursos humanos, recebe três pedidos: (1) um colega quer saber a data de ingresso de outro colega «para organizar uma festa»; (2) um funcionário pede a correcção da sua data de ingresso, com a guia de ingresso; (3) um chefe pede cópia dos dados de toda a equipa para guardar na sua nuvem pessoal. Que decisão é correcta?",
    opts: [
      "Atender os três pedidos, porque todos vêm de pessoas da instituição",
      "Atender os pedidos 1 e 2, porque não envolvem ficheiros externos",
      "Atender só o pedido 2, pelo canal definido, e recusar o 1 e o 3",
      "Atender os pedidos 2 e 3, desde que o chefe use a nuvem institucional",
    ], ind: 2,
    exp: "Três decisões ao mesmo tempo: dados de colegas só para quem tem essa função e finalidade de serviço (recusar 1); correcção pelo canal, com documento (atender 2); dados pessoais fora de contas pessoais e sem finalidade (recusar 3). A alternativa 4 muda o local, mas não a falta de finalidade.",
    obj: O3, topico: PFAE, fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-L4-14", m: "m1", l: 4, t: "vf", cen: true, d: "di",
    e: "Caso fictício. Na Direcção Distrital de Planificação de Magude (fictícia), hoje é 04/11/2026. O consultor Luís, com contrato até 31/10/2026, ainda tem edição na pasta que contém a folha de beneficiários com BI, e essa folha está partilhada por ligação aberta. Verdadeiro ou falso: retirar o acesso do Luís resolve os problemas de partilha desta pasta.",
    val: false,
    exp: "Falso. Há dois problemas: o acesso do consultor depois do contrato e a ligação aberta a qualquer pessoa com dados pessoais. Retirar o Luís resolve só o primeiro.",
    obj: O1, topico: NUVEM, fonte: F_TDR_NUVEM,
  },
];
