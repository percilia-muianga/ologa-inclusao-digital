/**
 * Banco privado — Tecnologias Digitais do Governo — Lição 5 «Interoperabilidade
 * ao serviço do cidadão: integração final». 14 itens de exame.
 * Tópico TdR: Sistemas de Interoperabilidade; integração dos 9 tópicos.
 * As propostas de articulado INTIC (2026) NÃO são tratadas como lei.
 * Casos, acordos e registos FICTÍCIOS. Rascunho.
 */
import { F_INTIC, type QuestaoTDG } from "./tecnologias-governo-questoes-tipos";

const O1 = "Explicar a interoperabilidade como troca controlada de dados entre sistemas públicos para não pedir ao cidadão o que o Estado já tem.";
const O2 = "Distinguir interoperabilidade de partilha livre de dados: finalidade, base legal, mínimo necessário e registo.";
const O3 = "Integrar os oito tópicos anteriores num percurso de serviço ao cidadão.";
const INT = "Sistemas de Interoperabilidade";

export const EXAME_TDG_L5: QuestaoTDG[] = [
  {
    cod: "TDG-L5-01", m: "m1", l: 5, t: "em", d: "f",
    e: "Segundo a lição, o que é interoperabilidade?",
    opts: [
      "Um único sistema central que substitui os sistemas de cada instituição",
      "A publicação dos dados de todas as instituições num portal de acesso livre",
      "A ligação de todas as instituições públicas à mesma rede de internet",
      "A capacidade de sistemas de instituições diferentes trocarem dados com segurança",
    ], ind: 3,
    exp: "A lição define interoperabilidade como a capacidade de sistemas de instituições diferentes trocarem dados de forma segura e compreensível.",
    obj: O1, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-02", m: "m1", l: 5, t: "em", d: "f",
    e: "Qual é o principal benefício da interoperabilidade para o cidadão, segundo a lição?",
    opts: [
      "Deixar de ter de levar documentos que o Estado já tem, quando há base para a consulta",
      "Passar a poder consultar os dados de outros cidadãos para confirmar informações",
      "Receber todos os serviços públicos sem ter de apresentar qualquer pedido",
      "Deixar de ter de assinar os pedidos, porque os sistemas o fazem por ele",
    ], ind: 0,
    exp: "O exemplo da lição: em vez de o cidadão ir buscar uma certidão a outra instituição, o serviço consulta a informação necessária, se houver base, e regista a consulta.",
    obj: O1, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-03", m: "m1", l: 5, t: "em", d: "me",
    e: "Para confirmar se um requerente está inscrito num registo de outra instituição, qual resposta respeita o princípio do mínimo necessário?",
    opts: [
      "O registo completo do requerente, com moradas e contactos",
      "A resposta «sim, está inscrito» ou «não está inscrito»",
      "A cópia integral do processo do requerente nessa instituição",
      "A lista de todos os inscritos, para confirmar o nome lá",
    ], ind: 1,
    exp: "A lição dá o exemplo: «sim/não, está inscrito» em vez do registo completo.",
    obj: O2, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-04", m: "m1", l: 5, t: "em", d: "me",
    e: "Num relatório interno sobre um projecto de troca de dados, que frase descreve correctamente o enquadramento apresentado no curso?",
    opts: [
      "A lei de interoperabilidade aprovada em 2026 obriga todas as instituições a ligar-se",
      "As propostas do INTIC já se aplicam às instituições centrais, mas ainda não às locais",
      "Há propostas de articulado (INTIC, 2026), que não são lei; o quadro confirma-se com juristas",
      "Não existe nenhum documento sobre interoperabilidade, pelo que qualquer troca é permitida",
    ], ind: 2,
    exp: "A lição diz que as propostas de articulado do INTIC (2026) não equivalem a lei aprovada e que o quadro legal aplicável se confirma com os juristas da instituição.",
    obj: O2, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-05", m: "m1", l: 5, t: "em", d: "di",
    e: "Um pedido de dados entre instituições indica a finalidade e o processo, pede só uma resposta sim/não e identifica o técnico que o fez, mas não indica base legal nem acordo. Qual é a apreciação correcta?",
    opts: [
      "Está correcto, porque pede apenas o mínimo necessário e fica registado",
      "Está correcto, porque as duas instituições pertencem ao Estado",
      "Está incompleto: falta a base que permite a troca e deve ser completado",
      "Está correcto, desde que o cidadão saiba que os dados vão ser consultados",
    ], ind: 2,
    exp: "O pedido cumpre três dos requisitos, o que torna as alternativas erradas plausíveis. Mas a lição exige todos: finalidade, base legal ou acordo, mínimo necessário, quem pode pedir e registo. Sem base, a troca não deve avançar.",
    obj: O2, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-06", m: "m1", l: 5, t: "vf", d: "f",
    e: "Verdadeiro ou falso: cada consulta feita por interoperabilidade deve ficar registada, com quem consultou o quê e quando.",
    val: true,
    exp: "Verdadeiro. O registo é um dos requisitos que a lição enumera para cada troca.",
    obj: O2, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-07", m: "m1", l: 5, t: "vf", d: "me",
    e: "Verdadeiro ou falso: se duas instituições já trocam dados para uma finalidade definida, podem usar a mesma ligação para qualquer outra finalidade sem novo enquadramento.",
    val: false,
    exp: "Falso. Cada troca precisa de finalidade definida e de base que a permita. Uma finalidade nova não herda a base da anterior.",
    obj: O2, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-08", m: "m1", l: 5, t: "cor", d: "f",
    e: "Associe cada requisito de uma troca de dados ao exemplo que o cumpre.",
    pares: [
      { esquerda: "Finalidade definida", direita: "Decidir a isenção de taxa no processo n.º 77/2026" },
      { esquerda: "Base que permite a troca", direita: "Acordo entre as duas instituições n.º 5/2026" },
      { esquerda: "Mínimo necessário", direita: "Resposta sim/não sobre a inscrição" },
      { esquerda: "Registo", direita: "Consulta anotada com técnico, data e hora" },
    ],
    exp: "São quatro dos requisitos da lição, cada um com um exemplo fictício.",
    obj: O2, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-09", m: "m1", l: 5, t: "cor", d: "me",
    e: "No percurso de um pedido de serviço, associe cada passo ao tópico do curso que o suporta.",
    pares: [
      { esquerda: "O cidadão lê a informação sobre o serviço", direita: "Portal do Governo" },
      { esquerda: "O pedido entra na secretaria e recebe número", direita: "Gestão documental" },
      { esquerda: "A decisão final é assinada", direita: "Assinatura digital" },
      { esquerda: "Confirma-se a matrícula noutra instituição", direita: "Interoperabilidade" },
    ],
    exp: "A integração da lição 5 liga cada passo do serviço a um dos sistemas estudados.",
    obj: O3, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-10", m: "m1", l: 5, t: "em", cen: true, d: "me",
    e: "Caso fictício. A secretaria do Distrito de Namaacha (fictício) pede à unidade sanitária local: «Enviem a lista de todos os utentes, com diagnósticos, moradas e contactos, para cruzarmos quando precisarmos em futuros apoios.» Qual é o problema principal deste pedido?",
    opts: [
      "Deveria ter sido enviado por ofício em papel e não por meio digital",
      "Não tem finalidade concreta e pede dados a mais, para uso indefinido",
      "Deveria pedir também os dados dos familiares, para ficar completo",
      "Não tem problema, porque as duas entidades pertencem ao Estado",
    ], ind: 1,
    exp: "Falta finalidade definida, pede muito além do necessário e anuncia um uso futuro indefinido: é partilha livre de dados, não interoperabilidade.",
    obj: O2, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-11", m: "m1", l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício. Para decidir 120 pedidos de isenção, o Conselho Municipal de Xai-Xai (fictício) precisa de saber se cada requerente está inscrito no registo social (fictício). Existe o acordo n.º 2/2026, com essa finalidade. Propostas: (A) pedir, de uma vez, o registo completo dos 120; (B) para cada processo, pedir sim/não, com número do processo e técnico, ficando registado; (C) pedir a lista dos 8 000 inscritos do município para cruzar localmente. Qual proposta respeita os princípios?",
    opts: [
      "A proposta A, porque faz um só pedido em vez de 120",
      "A proposta B, porque pede o mínimo, por processo, com registo",
      "A proposta C, porque evita revelar quem pediu a isenção",
      "As propostas A e C, porque há acordo para essa finalidade",
    ], ind: 1,
    exp: "O acordo existe, o que torna A e C tentadoras. Mas A pede registos completos e C pede dados de 8 000 pessoas que não pediram nada. Só B respeita o mínimo necessário e o registo.",
    obj: O2, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-12", m: "m1", l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício. A Sra. Felismina Macamo pede uma licença de venda ambulante no Município de Maxixe (fictício). O regulamento fictício exige prova de residência, que outra instituição já tem, e há acordo para a consultar. Qual é a sequência coerente com a integração estudada?",
    opts: [
      "Informação no Portal do Governo; pedido em linha ou balcão; registo e classificação; consulta com base e registo; decisão assinada digitalmente",
      "Pedido em linha ou balcão; decisão assinada digitalmente; registo e classificação; consulta com base e registo; informação no Portal do Governo",
      "Informação no Portal do Governo; consulta com base e registo; pedido em linha ou balcão; decisão assinada digitalmente; registo e classificação",
      "Registo e classificação; informação no Portal do Governo; decisão assinada digitalmente; pedido em linha ou balcão; consulta com base e registo",
    ], ind: 0,
    exp: "Ordenar cinco passos exige perceber as dependências: informar antes de pedir, registar o pedido antes de o tratar, consultar dados só quando há pedido e processo, e assinar a decisão no fim.",
    obj: O3, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-13", m: "m1", l: 5, t: "vf", cen: true, d: "f",
    e: "Caso fictício. O Município de Montepuez (fictício) passou a aceitar em linha os pedidos de licença de obras. O Sr. Baltazar Nhampossa, de 67 anos, não usa internet e vai ao balcão. Verdadeiro ou falso: como o pedido passou a ser feito em linha, o Sr. Baltazar deixa de o poder fazer no balcão.",
    val: false,
    exp: "Falso. A lição insiste que quem não usa internet continua a ser atendido; o balcão presencial é a alternativa.",
    obj: O3, topico: INT, fonte: F_INTIC,
  },
  {
    cod: "TDG-L5-14", m: "m1", l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício. Um técnico da Direcção Provincial de Educação de Nampula (fictícia) recebe um pedido para confirmar a matrícula de uma aluna: indica finalidade, processo e acordo, e pede só sim/não. Mas chega de um endereço de correio pessoal, de alguém que diz ser «colega da acção social». O que deve o técnico fazer?",
    opts: [
      "Responder já, porque o pedido cumpre o mínimo necessário e indica a base",
      "Responder com cópia ao director, para que a resposta fique registada",
      "Enviar o processo completo da aluna, para evitar novos pedidos no futuro",
      "Não responder por esse canal e confirmar identidade e pedido pelo canal institucional",
    ], ind: 3,
    exp: "O conteúdo do pedido parece correcto, mas quem pode pedir tem de estar identificado, e um endereço pessoal é um sinal de alerta da lição 2. Confirmar pelo canal institucional junta as duas regras.",
    obj: O2, topico: INT, fonte: F_INTIC,
  },
];
