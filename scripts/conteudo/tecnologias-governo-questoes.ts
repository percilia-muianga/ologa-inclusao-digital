/**
 * BANCO DE AVALIAÇÃO do curso «Tecnologias Digitais do Governo».
 *
 * Ficheiro PRIVADO: vive fora de src/ e fora de public/. Enunciados, gabaritos
 * e explicações nunca entram no pacote do navegador. Nada aqui foi importado
 * para a base de dados; o plano de linhas abaixo é função pura, sem escrita.
 *
 * Dois instrumentos separados:
 * - EXAME_TDG: 80 questões finais (72 do módulo 161, 8 do transversal 200).
 *   Regra do triplo: secção 10 do Termo de Referência, tal como registada na
 *   matriz interna. A prova de 20 itens em 60 minutos é PROPOSTA PEDAGÓGICA,
 *   usada só em simulação; não há configuração de exame real.
 * - DIAGNOSTICO_TDG: 10 questões de diagnóstico e pós-teste, fora das 80 e
 *   fora do sorteio.
 *
 * Matriz, marginais e intersecções: docs/matriz-banco-tecnologias-governo.md.
 * Não se descreve o funcionamento do CorreioGov, da CloudGov, do Portal do
 * Cidadão, do Sistema de Assinatura Digital nem da Plataforma do Funcionário
 * para além do que as lições afirmam; não se atribuem efeitos jurídicos à
 * assinatura. A única lei citada é a Lei n.º 10/2024, nos artigos das lições
 * do módulo transversal. Estado editorial: rascunho por validar pela Ologa/ATDI.
 */
import { F_LEI_10_2024 as LEI, F_PC, F_PG, F_TDR_CORREIO, F_TDR_DOC, F_TDR_NUVEM, F_INTIC, type QuestaoTDG } from "./tecnologias-governo-questoes-tipos";
import { EXAME_TDG_L1 } from "./tecnologias-governo-questoes-l1";
import { EXAME_TDG_L2 } from "./tecnologias-governo-questoes-l2";
import { EXAME_TDG_L3 } from "./tecnologias-governo-questoes-l3";
import { EXAME_TDG_L4 } from "./tecnologias-governo-questoes-l4";
import { EXAME_TDG_L5 } from "./tecnologias-governo-questoes-l5";

export type { QuestaoTDG } from "./tecnologias-governo-questoes-tipos";

const TRANSVERSAL: QuestaoTDG[] = [
  {
    cod: "TDG-TR-L1-01", m: "transversal", l: 1, t: "em", d: "f",
    e: "Ao desenhar o novo formulário de um portal de serviços ao cidadão, que prática corresponde ao desenho universal estudado a propósito do artigo 16 da Lei n.º 10/2024?",
    opts: [
      "Tratar da acessibilidade só depois de chegarem reclamações dos utentes",
      "Criar uma versão à parte, com menos funções, só para pessoas com deficiência",
      "Garantir desde o início que funciona com teclado e com leitor de ecrã",
      "Fazer o formulário funcionar apenas em telemóveis de modelo recente",
    ], ind: 2,
    exp: "O desenho universal, como apresentado na lição, pensa o serviço para todos desde o início, sem versões diminuídas nem correcções tardias.",
    obj: "Aplicar o desenho universal a serviços digitais. Lição 1 do módulo transversal.",
    topico: "Lei n.º 10/2024, art. 16", fonte: LEI,
  },
  {
    cod: "TDG-TR-L1-02", m: "transversal", l: 1, t: "cor", d: "me",
    e: "Associe cada barreira no atendimento de um serviço público ao ajustamento razoável adequado.",
    pares: [
      { esquerda: "Pessoa cega preenche um formulário em linha", direita: "Formulário compatível com leitor de ecrã" },
      { esquerda: "Pessoa em cadeira de rodas e balcão no 1.º andar", direita: "Atendimento num espaço acessível" },
      { esquerda: "Pessoa surda no atendimento presencial", direita: "Comunicação escrita ou em língua de sinais" },
      { esquerda: "Pessoa com pouca prática de leitura", direita: "Informação em linguagem simples e leitura fácil" },
    ],
    exp: "O ajustamento razoável adapta o atendimento à barreira concreta, sem excluir a pessoa do serviço.",
    obj: "Aplicar o ajustamento razoável no atendimento. Lição 1 do módulo transversal.",
    topico: "Lei n.º 10/2024, art. 16", fonte: LEI,
  },
  {
    cod: "TDG-TR-L2-01", m: "transversal", l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: segundo o artigo 17 da Lei n.º 10/2024, como apresentado na lição, o anúncio de um novo serviço digital ao público deve procurar estar disponível em formatos acessíveis.",
    val: true,
    exp: "Verdadeiro. O anúncio é informação ao público e deve poder ser usado por pessoas diferentes.",
    obj: "Aplicar o direito à informação acessível. Lição 2 do módulo transversal.",
    topico: "Lei n.º 10/2024, art. 17", fonte: LEI,
  },
  {
    cod: "TDG-TR-L3-01", m: "transversal", l: 3, t: "em", d: "me",
    e: "Uma direcção vai adquirir um sistema de gestão documental. De acordo com a lição sobre o artigo 20 da Lei n.º 10/2024, em que momento entra a acessibilidade?",
    opts: [
      "Só na fase de utilização, quando algum funcionário pedir adaptações",
      "Nos requisitos do caderno de encargos, na avaliação e na verificação da entrega",
      "Apenas nos ecrãs vistos pelo público, deixando de fora os usados pelos funcionários",
      "Na decisão do fornecedor, por ser uma matéria técnica que ele domina melhor",
    ], ind: 1,
    exp: "A lição coloca a acessibilidade nos requisitos da aquisição, na avaliação das propostas e na verificação à entrega. Os funcionários com deficiência também usam o sistema.",
    obj: "Incorporar acessibilidade nas aquisições públicas. Lição 3 do módulo transversal.",
    topico: "Lei n.º 10/2024, art. 20", fonte: LEI,
  },
  {
    cod: "TDG-TR-L4-01", m: "transversal", l: 4, t: "em", d: "f",
    e: "Vão ser preparados os materiais para ensinar os funcionários de um distrito a usar o correio e a nuvem institucionais. Qual das opções respeita a lição do módulo transversal dedicada ao artigo 24 da Lei n.º 10/2024?",
    opts: [
      "Entregar os materiais em texto acessível e aceitar respostas orais ou em papel",
      "Entregar os materiais só em fotografia dos diapositivos, tirada na sala",
      "Exigir computador com internet para todas as actividades, sem alternativa",
      "Dispensar as pessoas com deficiência das actividades, sem outra forma de participar",
    ], ind: 0,
    exp: "A lição pede materiais acessíveis e actividades que não criem barreiras. Dispensar sem alternativa exclui, não adapta.",
    obj: "Planear formação acessível. Lição 4 do módulo transversal.",
    topico: "Lei n.º 10/2024, art. 24", fonte: LEI,
  },
  {
    cod: "TDG-TR-L5-01", m: "transversal", l: 5, t: "em", d: "me",
    e: "O formulário de um portal de serviços pergunta se a pessoa precisa de apoio por deficiência, para planear o atendimento. Que prática segue a lição sobre o artigo 30 da Lei n.º 10/2024?",
    opts: [
      "Pergunta obrigatória, com a resposta visível a todo o pessoal do serviço",
      "Resposta guardada numa folha partilhada e enviada por correio a cada sector",
      "Não perguntar nada, porque a lei proíbe recolher este tipo de informação",
      "Pergunta opcional e autodeclarada, com acesso restrito e relatórios agregados",
    ], ind: 3,
    exp: "A lição prevê recolha com finalidade clara, opcional e autodeclarada, protecção da informação individual e relatórios que não identificam pessoas. A lei promove a recolha; não a proíbe.",
    obj: "Recolher dados sobre deficiência com minimização e protecção. Lição 5 do módulo transversal.",
    topico: "Lei n.º 10/2024, art. 30", fonte: LEI,
  },
  {
    cod: "TDG-TR-L6-01", m: "transversal", l: 6, t: "vf", d: "me",
    e: "Verdadeiro ou falso: num relatório de utilização de um portal por distrito, uma célula com 2 utentes com deficiência visual pode ser publicada sem cuidados especiais, porque mostra números e não nomes.",
    val: false,
    exp: "Falso. Em grupos muito pequenos, os números permitem identificar pessoas. A lição trata grupos com menos de cinco pessoas como informação insuficiente para divulgação.",
    obj: "Proteger grupos pequenos na divulgação de indicadores. Lição 6 do módulo transversal.",
    topico: "Lei n.º 10/2024, art. 31", fonte: LEI,
  },
  {
    cod: "TDG-TR-L6-02", m: "transversal", l: 6, t: "cor", d: "f",
    e: "Um serviço vai publicar estatísticas sobre os pedidos feitos no portal. Associe cada elemento ao tratamento adequado.",
    pares: [
      { esquerda: "Total de pedidos por distrito", direita: "Publicar em forma agregada" },
      { esquerda: "Ficheiro com cada pedido individual", direita: "Manter restrito e fora da publicação" },
      { esquerda: "Distrito com 3 requerentes com deficiência", direita: "Indicar informação insuficiente para divulgação" },
      { esquerda: "Desagregação por sexo e por deficiência", direita: "Apresentar, verificando se cria grupos identificáveis" },
    ],
    exp: "A desagregação é pedida, mas a publicação protege as pessoas: agrega, restringe o individual e suprime grupos pequenos.",
    obj: "Conciliar desagregação estatística com protecção de dados. Lição 6 do módulo transversal.",
    topico: "Lei n.º 10/2024, art. 31", fonte: LEI,
  },
];

/** Banco do exame final: 80 questões. Nenhuma está na base de dados. */
export const EXAME_TDG: QuestaoTDG[] = [
  ...EXAME_TDG_L1, ...EXAME_TDG_L2, ...EXAME_TDG_L3, ...EXAME_TDG_L4, ...EXAME_TDG_L5, ...TRANSVERSAL,
];

/** Diagnóstico e pós-teste: 10 questões separadas; não entram no sorteio. */
export const DIAGNOSTICO_TDG: QuestaoTDG[] = [
  {
    cod: "TDG-DIAG-01", m: "m1", l: 1, t: "em", d: "f",
    e: "Diagnóstico. Um sítio da internet que publica sobretudo notícias, comunicados e a organização do Governo é principalmente:",
    opts: [
      "Um canal de informação sobre o Estado",
      "Um balcão para pedir serviços públicos",
      "Um sistema de correio electrónico oficial",
      "Um sistema de registo de documentos",
    ], ind: 0,
    exp: "Publicar informação é a função de um portal informativo. O curso distingue-o do portal de serviços.",
    obj: "Sondagem inicial sobre portais.", topico: "Portal do Governo", fonte: F_PG,
  },
  {
    cod: "TDG-DIAG-02", m: "m1", l: 1, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: pode-se confirmar que uma página é oficial só pelo aspecto e pelas cores que apresenta.",
    val: false,
    exp: "Falso. Aspecto e cores copiam-se. O curso ensina a verificar o domínio e a origem do endereço.",
    obj: "Sondagem inicial sobre páginas oficiais.", topico: "Portal do Cidadão", fonte: F_PC,
  },
  {
    cod: "TDG-DIAG-03", m: "m1", l: 2, t: "em", d: "f",
    e: "Diagnóstico. A quem pode dar a palavra-passe do seu correio electrónico de serviço?",
    opts: [
      "Ao chefe directo, quando ele pedir",
      "A ninguém, em nenhuma circunstância",
      "A um colega de confiança do gabinete",
      "A quem telefonar em nome da informática",
    ], ind: 1,
    exp: "A palavra-passe é pessoal. O curso trata também dos pedidos formais de gestão de contas.",
    obj: "Sondagem inicial sobre contas de correio.", topico: "Gestão de contas do CorreioGov", fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-DIAG-04", m: "m1", l: 2, t: "vf", d: "me",
    e: "Diagnóstico. Verdadeiro ou falso: quem recebe uma mensagem com endereços em Bcc (cópia oculta) não vê os endereços dos outros destinatários em Bcc.",
    val: true,
    exp: "Verdadeiro. O curso usa o Bcc para proteger endereços de cidadãos.",
    obj: "Sondagem inicial sobre uso do correio.", topico: "Uso do CorreioGov", fonte: F_TDR_CORREIO,
  },
  {
    cod: "TDG-DIAG-05", m: "m1", l: 3, t: "em", d: "me",
    e: "Diagnóstico. O que significa registar um documento que chega à secretaria?",
    opts: [
      "Tirar-lhe uma fotografia com o telemóvel do serviço",
      "Dar-lhe número, data, remetente e assunto, para o seguir",
      "Guardá-lo numa gaveta até alguém o pedir de volta",
      "Carimbá-lo e devolvê-lo logo a quem o entregou",
    ], ind: 1,
    exp: "Registar permite saber sempre onde está o documento. O curso trabalha registo, classificação e encaminhamento.",
    obj: "Sondagem inicial sobre gestão documental.", topico: "Sistema de Gestão Documental", fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-DIAG-06", m: "m1", l: 3, t: "vf", d: "me",
    e: "Diagnóstico. Verdadeiro ou falso: a imagem de uma assinatura colada num documento pode ser copiada por qualquer pessoa.",
    val: true,
    exp: "Verdadeiro. Por isso o curso distingue imagem de assinatura de assinatura digital.",
    obj: "Sondagem inicial sobre assinatura.", topico: "Sistema de Assinatura Digital", fonte: F_TDR_DOC,
  },
  {
    cod: "TDG-DIAG-07", m: "m1", l: 4, t: "em", d: "f",
    e: "Diagnóstico. Para trabalhar no mesmo ficheiro com dois colegas, o que é preferível?",
    opts: [
      "Passar o ficheiro de mão em mão numa pen drive",
      "Guardá-lo numa conta pessoal de armazenamento",
      "Enviá-lo por correio a cada nova alteração feita",
      "Partilhá-lo no serviço institucional com os dois",
    ], ind: 3,
    exp: "O curso trata da partilha no serviço institucional com pessoas nomeadas e permissões adequadas.",
    obj: "Sondagem inicial sobre nuvem institucional.", topico: "Uso da CloudGov", fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-DIAG-08", m: "m1", l: 4, t: "em", d: "me",
    e: "Diagnóstico. Se encontrar um dado errado no seu registo de funcionário, a quem deve pedir a correcção?",
    opts: [
      "A um colega que tenha acesso ao sistema",
      "Aos recursos humanos, pelo canal indicado",
      "Ao ponto focal de informática da unidade",
      "A ninguém: os registos não se corrigem",
    ], ind: 1,
    exp: "O curso indica os recursos humanos, com documento de suporte.",
    obj: "Sondagem inicial sobre a plataforma do funcionário.", topico: "Plataforma do Funcionário e Agente do Estado", fonte: F_TDR_NUVEM,
  },
  {
    cod: "TDG-DIAG-09", m: "m1", l: 5, t: "em", d: "me",
    e: "Diagnóstico. Quando uma instituição pública consulta dados de um cidadão noutra instituição, o que deve pedir?",
    opts: [
      "Todos os dados que a outra instituição tiver",
      "Só os dados necessários para aquele pedido",
      "Os dados do cidadão e também dos familiares",
      "Os dados de todos os cidadãos do distrito",
    ], ind: 1,
    exp: "O curso trata do mínimo necessário, com finalidade, base e registo.",
    obj: "Sondagem inicial sobre interoperabilidade.", topico: "Sistemas de Interoperabilidade", fonte: F_INTIC,
  },
  {
    cod: "TDG-DIAG-10", m: "m1", l: 5, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: quem não usa internet deve continuar a poder ser atendido presencialmente.",
    val: true,
    exp: "Verdadeiro. O curso mantém sempre a alternativa presencial.",
    obj: "Sondagem inicial sobre canais de atendimento.", topico: "Portal do Cidadão", fonte: F_PC,
  },
];

/** Prova PROPOSTA, só para simulação. Não configura exame real. */
export const PROPOSTA_PROVA_TDG = {
  total: 20,
  minutos: 60,
  modulosPorOrdem: { 161: 18, 200: 2 } as Record<number, number>,
  tipos: { escolha_multipla: 8, verdadeiro_falso: 4, correspondencia: 4, cenario: 4 },
  pct: { facil: 40, media: 40, dificil: 20 },
  nota: "Proposta pedagógica por validar pela Ologa/ATDI; não é número imposto pelo Termo de Referência.",
} as const;

export const ORDEM_MODULO_TDG = { m1: 161, transversal: 200 } as const;
const TIPOLOGIA = { em: "escolha_multipla", vf: "verdadeiro_falso", cor: "correspondencia" } as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;

export type LinhaPlanoTDG = {
  cod: string;
  ordemModulo: number;
  instrumento: "exame_final" | "pre_pos_teste";
  tipologia: (typeof TIPOLOGIA)[keyof typeof TIPOLOGIA];
  dificuldade: (typeof DIFICULDADE)[keyof typeof DIFICULDADE];
  enunciado: string;
  conteudo: Record<string, unknown>;
  resposta: Record<string, unknown>;
  explicacao: string;
  objectivo_associado: string;
  cenario: boolean;
  /** Explícitos: na tabela real os valores por omissão são activa=true e em_uso. */
  activa: false;
  estado_revisao: "rascunho";
  versao: "v1";
  codigo: string;
};

function corpo(q: QuestaoTDG) {
  if (q.t === "em") {
    if (!q.opts || q.ind === undefined || q.ind < 0 || q.ind >= q.opts.length)
      throw new Error(`Gabarito inválido: ${q.cod}`);
    return { conteudo: { opcoes: q.opts, ...(q.cen ? { cenario: true } : {}) }, resposta: { indice: q.ind } };
  }
  if (q.t === "vf") {
    if (q.val === undefined) throw new Error(`Item sem valor: ${q.cod}`);
    return { conteudo: q.cen ? { cenario: true } : {}, resposta: { valor: q.val } };
  }
  if (!q.pares || q.pares.length < 3) throw new Error(`Associação incompleta: ${q.cod}`);
  return { conteudo: { pares: q.pares }, resposta: { pares: q.pares } };
}

/** MODO DE ENSAIO: plano de linhas em memória. Não escreve nada em lado nenhum. */
export function planoLinhasTDG(): LinhaPlanoTDG[] {
  const linhas: LinhaPlanoTDG[] = [];
  const add = (q: QuestaoTDG, instrumento: LinhaPlanoTDG["instrumento"]) => {
    const { conteudo, resposta } = corpo(q);
    linhas.push({
      cod: q.cod,
      ordemModulo: ORDEM_MODULO_TDG[q.m],
      instrumento,
      tipologia: TIPOLOGIA[q.t],
      dificuldade: DIFICULDADE[q.d],
      enunciado: q.e.trim(),
      conteudo,
      resposta,
      explicacao: q.exp,
      objectivo_associado: q.obj,
      cenario: Boolean(q.cen),
      activa: false,
      estado_revisao: "rascunho",
      versao: "v1",
      codigo: q.cod,
    });
  };
  for (const q of EXAME_TDG) add(q, "exame_final");
  for (const q of DIAGNOSTICO_TDG) add(q, "pre_pos_teste");
  return linhas;
}
