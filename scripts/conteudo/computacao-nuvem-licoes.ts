/**
 * Conteúdo original das lições dos módulos próprios do curso
 * «Computação em Nuvem» (30 h, presencial).
 *
 * Estado: PROPOSTA PEDAGÓGICA — por validar pela Ologa/ATDI.
 * Os cenários são fictícios e servem apenas de exercício. Não contém
 * estatísticas reais nem conclusões jurídicas.
 *
 * Este ficheiro vive fora de src/ para não entrar no pacote do navegador por
 * engano; é lido apenas pelo seed (scripts/seed-computacao-nuvem.ts).
 *
 * O ficheiro é preenchido lição a lição. O seed só grava as lições que
 * existirem aqui — as restantes continuam honestamente «por fornecer».
 */

import type { TemposLicao } from "../../src/lib/plano-computacao-nuvem";
import { LICOES_M3 } from "./computacao-nuvem-m3";

export type Laboratorio = {
  titulo: string;
  /** Percurso didáctico escolhido; o fornecedor é exemplo, não imposição. */
  percurso: string;
  preRequisitos: string[];
  passos: string[];
  verificacao: string[];
  problemas: string[];
  evidencia: string[];
  limpeza: string[];
  /** Quando a limpeza é adiada por outro exercício depender deste recurso. */
  limpezaAdiada?: string;
  /** Código completo transcrito na lição, por ficheiro. */
  codigo?: { ficheiro: string; descarregarEm?: string; corpo: string }[];
};

export type ConteudoLicao = {
  objectivos: string[];
  explicacao: string[];
  exemplo: { titulo: string; corpo: string[] };
  /** Os minutos não são escritos aqui: vêm de TemposLicao (fonte única). */
  actividade: { formato: string; enunciado: string[]; produto: string };
  laboratorio?: Laboratorio;
  sintese: string[];
  verificacao: { pergunta: string; resposta: string; feedback: string }[];
  referencias?: { titulo: string; url: string; consultadoEm: string }[];
  guiao: {
    preparacao: string[];
    /** Quatro passos, pela ordem: acolhimento, exposição, actividade, partilha. */
    conducao: [string, string, string, string];
    criterios: string[];
    errosComuns: string[];
  };
};

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const lista = (itens: string[]) =>
  `<ul>${itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

const paragrafos = (itens: string[]) => itens.map((p) => `<p>${esc(p)}</p>`).join("");

export const AVISO_HTML =
  '<p class="aviso-proposta"><strong>Proposta pedagógica — por validar pela Ologa/ATDI.</strong> ' +
  "Este conteúdo é um rascunho preparado pela equipa. A sua disponibilidade na plataforma " +
  "não significa aprovação nem validação técnica.</p>";

/** Rótulos dos quatro blocos, pela mesma ordem de TemposLicao. */
export const BLOCOS_TEMPO = [
  "Acolhimento e objectivos",
  "Exposição",
  "Actividade prática",
  "Partilha e síntese",
] as const;

export function minutosPorBloco(t: TemposLicao): number[] {
  return [t.acolhimento, t.exposicao, t.actividade, t.partilha];
}

function grelhaTempos(t: TemposLicao): string {
  const minutos = minutosPorBloco(t);
  return (
    "<ul>" +
    BLOCOS_TEMPO.map((b, i) => `<li>${b}: ${minutos[i]} minutos.</li>`).join("") +
    "</ul>"
  );
}

function faixas(t: TemposLicao): string[] {
  const minutos = minutosPorBloco(t);
  let inicio = 0;
  return minutos.map((m) => {
    const faixa = `${inicio}–${inicio + m} min`;
    inicio += m;
    return faixa;
  });
}

function referenciasHtml(c: ConteudoLicao): string {
  if (!c.referencias?.length) return "";
  return (
    "<h3>Referências consultadas</h3>" +
    "<ul>" +
    c.referencias
      .map(
        (r) =>
          `<li>${esc(r.titulo)} — <a href="${esc(r.url)}" rel="noreferrer noopener" target="_blank">${esc(r.url)}</a> (consultado em ${esc(r.consultadoEm)}).</li>`,
      )
      .join("") +
    "</ul>"
  );
}

const AVISO_LAB =
  '<p class="aviso-proposta"><strong>Laboratório por executar.</strong> Este guião ainda ' +
  "não foi executado por nós. O ambiente de formação está por preparar: a conta " +
  "institucional de formação, os limites de consumo e as permissões são definidos pelo " +
  "formador antes da sessão. Nunca se usam dados reais de pessoas, nunca se escrevem " +
  "credenciais no material e nada é adquirido durante a aula. A leitura deste guião é " +
  "preparação; não substitui a prática no ambiente real.</p>";

function laboratorioHtml(c: ConteudoLicao): string {
  const l = c.laboratorio;
  if (!l) return "";
  return [
    `<h3>Laboratório — ${esc(l.titulo)}</h3>`,
    AVISO_LAB,
    `<p><strong>Percurso didáctico:</strong> ${esc(l.percurso)} O fornecedor é exemplo de ensino, escolhido pela clareza da documentação, e não uma imposição do Termo de Referência nem uma recomendação de compra.</p>`,
    "<h4>Pré-requisitos</h4>",
    lista(l.preRequisitos),
    l.codigo?.length
      ? "<h4>Ficheiros do exemplo</h4><p>O exemplo está completo aqui e também disponível para descarregar. Não tem dependências a instalar.</p>" +
        l.codigo
          .map(
            (f) =>
              `<p><strong>${esc(f.ficheiro)}</strong>${f.descarregarEm ? ` — <a href="${esc(f.descarregarEm)}" rel="noreferrer noopener" target="_blank">descarregar</a>` : ""}</p><pre><code>${esc(f.corpo)}</code></pre>`,
          )
          .join("")
      : "",
    "<h4>Passos</h4>",
    `<ol>${l.passos.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`,
    "<h4>Como verificar o resultado</h4>",
    lista(l.verificacao),
    "<h4>Problemas comuns</h4>",
    lista(l.problemas),
    "<h4>Evidência a recolher</h4>",
    "<p>A evidência não pode conter segredos: sem chaves, sem palavras-passe, sem tokens, sem dados pessoais. Tapar identificadores de subscrição nas imagens.</p>",
    lista(l.evidencia),
    "<h4>Limpeza</h4>",
    l.limpezaAdiada
      ? `<p>${esc(l.limpezaAdiada)}</p>`
      : "",
    lista(l.limpeza),
    "<p>Apagar apenas os recursos criados neste exercício, dentro do grupo de recursos do exercício. Não apagar nada fora dele.</p>",
  ].join("");
}

export function montarElearning(
  c: ConteudoLicao,
  minutos: number,
  tempos: TemposLicao,
): string {
  return [
    AVISO_HTML,
    `<p><strong>Duração prevista:</strong> ${minutos} minutos, em sessão presencial.</p>`,
    "<h3>Como o tempo desta lição está distribuído</h3>",
    grelhaTempos(tempos),
    "<h3>Objectivos da lição</h3>",
    lista(c.objectivos),
    "<h3>Explicação</h3>",
    paragrafos(c.explicacao),
    `<h3>${esc(c.exemplo.titulo)}</h3>`,
    paragrafos(c.exemplo.corpo),
    "<h3>Actividade prática</h3>",
    `<p>Trabalho ${esc(c.actividade.formato)}, com ${tempos.actividade} minutos de trabalho, seguidos de ${tempos.partilha} minutos de partilha e síntese em plenário.</p>`,
    paragrafos(c.actividade.enunciado),
    `<p><strong>Produto esperado:</strong> ${esc(c.actividade.produto)}</p>`,
    laboratorioHtml(c),
    "<h3>Síntese em leitura fácil</h3>",
    lista(c.sintese),
    "<h3>Verificação formativa</h3>",
    "<p>Estas perguntas não contam para a nota final e não são perguntas do exame final. Servem para a pessoa formanda confirmar o que percebeu.</p>",
    c.verificacao
      .map(
        (v, i) =>
          `<details><summary>Pergunta ${i + 1}. ${esc(v.pergunta)}</summary>` +
          `<p><strong>Resposta:</strong> ${esc(v.resposta)}</p>` +
          `<p><strong>Comentário:</strong> ${esc(v.feedback)}</p></details>`,
      )
      .join(""),
    referenciasHtml(c),
  ].join("");
}

export function montarGuiao(
  c: ConteudoLicao,
  titulo: string,
  minutos: number,
  tempos: TemposLicao,
): string {
  const faixa = faixas(tempos);
  return [
    AVISO_HTML,
    `<h3>Guião do formador — ${esc(titulo)}</h3>`,
    `<p><strong>Duração prevista:</strong> ${minutos} minutos, em sessão presencial.</p>`,
    "<p>Os tempos abaixo são os mesmos que a pessoa formanda vê no conteúdo da lição.</p>",
    "<h4>Preparação</h4>",
    lista(c.guiao.preparacao),
    "<h4>Condução</h4>",
    `<ol>${c.guiao.conducao
      .map(
        (passo, i) =>
          `<li><strong>${faixa[i]} (${BLOCOS_TEMPO[i]}):</strong> ${esc(passo)}</li>`,
      )
      .join("")}</ol>`,
    "<h4>Critérios de apreciação do produto da actividade</h4>",
    lista(c.guiao.criterios),
    "<h4>Erros comuns a antecipar</h4>",
    lista(c.guiao.errosComuns),
    "<p><strong>Separação pedagógica:</strong> este guião não contém perguntas nem " +
      "respostas do exame final. O exame é gerado no momento em que a pessoa formanda " +
      "o inicia, a partir do banco de questões, e o gabarito fica apenas no servidor.</p>",
  ].join("");
}

/**
 * Descrição a aplicar ao módulo quando TODAS as suas lições já têm conteúdo
 * escrito. Rascunho: escrito, por validar pela Ologa/ATDI.
 */
export const DESCRICOES_MODULO: Record<string, string> = {
  m2: "Conteúdo escrito, em rascunho por validar pela Ologa/ATDI. Cinco lições com guiões de laboratório ainda POR EXECUTAR, em ambiente de formação a preparar pelo formador: recursos de computação e armazenamento, com criação de um recipiente de objectos privado na Amazon Web Services e preparação escrita da máquina virtual; redes e conectividade, com criação da rede virtual, sub-redes e grupos de segurança no Azure e, só depois, da máquina virtual dentro da sub-rede de aplicação; bases de dados e aplicações, com publicação de uma aplicação simples numa plataforma como serviço; disponibilidade, cópias de segurança e recuperação; e desenho de uma arquitectura simples, incluindo microserviços, práticas cloud-native, DevOps e etapas de modernização.",
  m1: "Conteúdo escrito, em rascunho por validar pela Ologa/ATDI. Cinco lições: o que é computação em nuvem e as cinco características essenciais; modelos de serviço (infra-estrutura, plataforma e programa como serviço); modelos de implantação (pública, privada, comunitária, híbrida) e multinuvem; vantagens, limites, componentes de infra-estrutura e responsabilidade partilhada; e escolha fundamentada do modelo para um serviço público.",
};

export const LICOES: Record<string, ConteudoLicao> = {
  m1l1: {
    objectivos: [
      "Definir computação em nuvem por palavras próprias e identificar as cinco características essenciais da definição do NIST.",
      "Distinguir um serviço que é nuvem de um serviço que apenas está alojado noutro sítio.",
      "Situar no tempo a evolução do modelo, do centro de dados próprio até aos serviços geridos actuais.",
    ],
    explicacao: [
      "Computação em nuvem é a possibilidade de usar capacidade informática — servidores, armazenamento, redes, bases de dados, aplicações — pedindo-a pela rede, no momento em que é precisa, com o consumo medido. A instituição deixa de comprar equipamento para responder ao pico previsto e passa a pedir capacidade conforme a procura real. Atenção a um ponto que gera confusão: a medição do consumo é característica do modelo, mas a forma de cobrança depende do contrato. Pode ser cobrança ao consumo, pode ser tarifa fixa ou capacidade reservada por período, e numa nuvem privada da própria administração pode não haver factura externa nenhuma — a medição serve então para repartir custo interno e controlar o uso.",
      "A referência mais usada para esta definição é a publicação SP 800-145 do NIST, o instituto norte-americano de normas e tecnologia. Essa publicação enumera cinco características essenciais. A primeira é o auto-serviço a pedido: a pessoa responsável obtém os recursos sozinha, num portal ou por comando, sem abrir pedido a um técnico do fornecedor. A segunda é o acesso amplo pela rede: os recursos são alcançados por meios de rede normalizados, a partir de computador, telemóvel ou outro equipamento. A terceira é o agrupamento de recursos: o fornecedor mantém uma reserva comum de capacidade servida a vários consumidores, com isolamento entre eles, e o consumidor normalmente não sabe em que máquina física está a correr. Consumidor aqui não quer dizer forçosamente outra instituição: numa nuvem privada, os consumidores que partilham a mesma reserva são as direcções, os departamentos e os projectos da própria organização. A quarta é a elasticidade rápida: a capacidade cresce e diminui depressa, em alguns casos de forma automática, dando a impressão de ser ilimitada. A quinta é o serviço medido: o consumo é contado e apresentado — horas de máquina, gigabytes guardados, pedidos atendidos — o que permite controlar o uso e, quando o contrato assim o determinar, facturar.",
      "Estas cinco características servem de critério prático. Um servidor alugado num centro de dados, que demora três dias a ser entregue e cuja capacidade não muda sem novo contrato, não cumpre o auto-serviço nem a elasticidade: está alojado fora, mas não é nuvem. O teste é simples: consigo obter sozinho, em minutos, aumentar e diminuir, e ver quanto consumi?",
      "Quanto à evolução: durante décadas cada instituição manteve a sua própria sala de servidores, com custo fixo e capacidade dimensionada para o pico. A virtualização permitiu correr várias máquinas lógicas num mesmo equipamento físico, aumentando o aproveitamento. Nos anos 2000, grandes operadores começaram a oferecer essa capacidade virtualizada a terceiros, com o consumo medido. Seguiram-se os serviços geridos, em que o fornecedor trata também do sistema operativo, da base de dados ou da própria plataforma de aplicação, e mais recentemente a execução sem servidor visível, em que a unidade de consumo passa a ser sobretudo a execução do código, embora haja quase sempre outras componentes a contar, como armazenamento, tráfego de rede e serviços associados. A direcção é sempre a mesma: menos infra-estrutura para gerir e mais atenção ao serviço prestado.",
      "Para um serviço público, isto muda a conversa. A pergunta deixa de ser «quantos servidores compramos este ano» e passa a ser «que capacidade precisamos, quando, com que garantias de protecção de dados e a que custo mensal». As respostas a essa segunda pergunta são o assunto do resto do curso.",
    ],
    exemplo: {
      titulo: "O portal de inscrições do Serviço Distrital de Ondela (cenário fictício)",
      corpo: [
        "O Serviço Distrital de Ondela abre inscrições escolares durante duas semanas por ano. Nessas duas semanas o portal recebe muitos acessos ao mesmo tempo; nos restantes onze meses e meio quase ninguém lhe toca. A sala de servidores do distrito foi dimensionada para o pico: equipamento parado quase todo o ano, que na mesma consome energia e exige manutenção.",
        "Se o portal passar a correr em nuvem, a equipa aumenta a capacidade antes do período de inscrições e reduz depois. O auto-serviço permite fazê-lo no próprio dia; o serviço medido mostra ao director quanto foi consumido no pico, e o contrato dirá se isso se traduz em factura variável ou em tarifa fixa. Passar para a nuvem não garante, por si, poupança: o resultado depende do perfil de utilização, do contrato, da ligação à internet disponível e do trabalho de migração.",
        "Este cenário é fictício e serve de exercício. Não descreve nenhum serviço existente nem apresenta valores de preço.",
      ],
    },
    actividade: {
      formato: "em pares",
      enunciado: [
        "Escolham um sistema informático que a vossa instituição use hoje: um portal, uma aplicação de gestão, uma pasta de ficheiros partilhada ou o correio electrónico.",
        "Para cada uma das cinco características essenciais, escrevam «cumpre», «não cumpre» ou «não sei», e uma frase a justificar.",
        "Concluam com uma frase: este sistema é nuvem, é alojamento fora da instituição, ou é equipamento próprio? Se a resposta depender de informação que não têm, escrevam «por apurar» e indiquem a quem seria preciso perguntar.",
      ],
      produto:
        "uma grelha com as cinco características avaliadas e justificadas, e uma conclusão fundamentada sobre a natureza do sistema escolhido.",
    },
    sintese: [
      "Nuvem é pedir capacidade informática pela rede, quando é precisa, com o consumo medido.",
      "Medir o consumo não é o mesmo que pagar por consumo: a cobrança depende do contrato e pode ser fixa, ou nem existir numa nuvem privada.",
      "São cinco as características essenciais: peço sozinho; chego pela rede; a capacidade é partilhada por vários consumidores, que podem ser áreas da própria organização; cresce e diminui depressa; o consumo é medido.",
      "Estar alojado fora da instituição não é, por si, nuvem.",
      "O modelo evoluiu da sala de servidores própria para a virtualização, depois para serviços geridos e para a execução sem servidor visível.",
    ],
    verificacao: [
      {
        pergunta:
          "Um servidor alugado noutra cidade, entregue três dias depois do pedido e com capacidade fixa durante o contrato, é computação em nuvem?",
        resposta: "Não. Falha o auto-serviço a pedido e a elasticidade rápida.",
        feedback:
          "O critério não é o sítio onde o equipamento está, mas a forma como a capacidade é obtida, ajustada e medida.",
      },
      {
        pergunta:
          "Porque é que o serviço medido interessa a quem dirige um serviço público, e não apenas a quem paga a factura?",
        resposta:
          "Porque mostra o consumo real e permite definir limites, detectar desperdício e justificar a despesa perante quem decide.",
        feedback:
          "A medição é também um instrumento de governação: sem ela, o consumo cresce sem ninguém dar por isso. O tema volta na lição sobre custos e limites.",
      },
    ],
    referencias: [
      {
        titulo: "NIST SP 800-145, The NIST Definition of Cloud Computing",
        url: "https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-145.pdf",
        consultadoEm: "21 de Setembro de 2026",
      },
    ],
    guiao: {
      preparacao: [
        "Escrever no quadro as cinco características, para ficarem visíveis durante toda a lição.",
        "Ter preparado um exemplo local de sistema da instituição anfitriã, caso o grupo hesite em escolher.",
        "Imprimir a grelha da actividade em papel: esta lição não exige computador nem ligação à internet.",
      ],
      conducao: [
        "Acolhimento, objectivos da lição e pergunta inicial ao grupo: o que já ouviram chamar «nuvem»?",
        "Exposição das cinco características essenciais, uma a uma com exemplo, e resumo da evolução do modelo até aos serviços geridos.",
        "Actividade em pares com a grelha das cinco características, circulando para apoiar quem marcar muitos «não sei».",
        "Partilha de dois pares com conclusões diferentes e síntese em leitura fácil.",
      ],
      criterios: [
        "Avalia as cinco características e não apenas duas ou três.",
        "Justifica cada avaliação com uma razão ligada ao funcionamento do sistema escolhido.",
        "Usa «não sei» ou «por apurar» em vez de inventar, quando não tem a informação.",
        "A conclusão é coerente com as avaliações feitas na grelha.",
      ],
      errosComuns: [
        "Confundir «está na internet» com «está na nuvem».",
        "Tratar armazenamento de ficheiros partilhado como prova de que toda a instituição já está em nuvem.",
        "Saltar a característica do serviço medido por ser a menos visível para quem usa.",
      ],
    },
  },

  m1l2: {
    objectivos: [
      "Distinguir infra-estrutura como serviço, plataforma como serviço e programa como serviço pelo que fica a cargo de cada parte.",
      "Classificar correctamente três serviços informáticos usados no dia-a-dia de uma instituição.",
      "Justificar a escolha de um dos três modelos para uma necessidade concreta de um serviço público.",
    ],
    explicacao: [
      "Os três modelos de serviço distinguem-se por uma pergunta simples: até onde vai o trabalho do fornecedor e onde começa o trabalho da instituição. Em todos eles o equipamento físico, a electricidade e as instalações são do fornecedor. O que muda é o resto.",
      "Na infra-estrutura como serviço, a instituição recebe os elementos de base: máquinas virtuais, discos, redes. Instala o sistema operativo que quiser, actualiza-o, instala as aplicações e responde pela configuração. É o modelo com mais liberdade e com mais trabalho: quem escolhe este caminho precisa de pessoal com competências de administração de sistemas.",
      "Na plataforma como serviço, a instituição entrega apenas a aplicação e a sua configuração. O fornecedor trata do sistema operativo, do servidor aplicacional e, muitas vezes, da base de dados e da capacidade de crescer com a procura. Perde-se liberdade de configurar o que está por baixo e ganha-se tempo: é o modelo habitual para publicar depressa um serviço em linha com uma equipa pequena.",
      "No programa como serviço, a instituição não gere aplicação nenhuma: usa um programa pronto, pela rede, e configura-o. Correio electrónico institucional, sistemas de videoconferência e ferramentas de escritório em linha são exemplos correntes. O trabalho que resta é de configuração, de gestão de contas e de utilizadores, e de tratamento dos dados que lá ficam guardados.",
      "Uma imagem útil é a da refeição: a infra-estrutura como serviço é a cozinha equipada onde se cozinha tudo; a plataforma como serviço é a cozinha onde já está preparada a base e só se termina o prato; o programa como serviço é a refeição servida à mesa. A imagem ajuda a lembrar a repartição do trabalho, mas não substitui o contrato: é o contrato que diz exactamente quem faz o quê, incluindo em caso de falha.",
      "Uma instituição raramente escolhe um só. É comum ter correio electrónico como programa como serviço, o portal de serviços como plataforma, e uma ou outra máquina virtual de infra-estrutura para aplicações antigas que ainda não foram modernizadas. A regra prática é subir o mais possível na escala — do mais gerido para o menos gerido — e só descer quando houver razão técnica ou legal para o fazer.",
    ],
    exemplo: {
      titulo: "Três necessidades da Direcção Provincial de Muteva (cenário fictício)",
      corpo: [
        "A Direcção Provincial de Muteva tem três problemas em cima da mesa. Primeiro: o correio electrónico institucional falha e não há quem o mantenha. Segundo: querem publicar um portal simples de marcação de atendimento, escrito por dois técnicos da casa. Terceiro: há uma aplicação antiga de gestão de expediente que só corre numa versão específica de sistema operativo.",
        "A escolha razoável é diferente em cada caso: o correio passa para um programa como serviço, porque não há valor em manter servidor de correio próprio; o portal de marcações vai para uma plataforma como serviço, porque a equipa quer publicar código e não administrar servidores; a aplicação antiga fica, para já, numa máquina virtual de infra-estrutura como serviço, porque exige aquela versão concreta — e fica registada como candidata a modernização.",
        "Cenário fictício, para exercício. Não representa nenhuma direcção provincial existente.",
      ],
    },
    actividade: {
      formato: "em grupos de três",
      enunciado: [
        "Listem cinco serviços informáticos que a vossa instituição usa hoje ou pretende usar no próximo ano.",
        "Para cada um, indiquem o modelo de serviço mais adequado e escrevam, em duas colunas, o que ficaria a cargo do fornecedor e o que ficaria a cargo da instituição.",
        "Assinalem, para cada linha, uma competência que a equipa precisaria de ter. Se essa competência não existir hoje, escrevam «por formar».",
      ],
      produto:
        "uma tabela de cinco serviços com o modelo escolhido, a repartição de responsabilidades e as competências necessárias ou por formar.",
    },
    sintese: [
      "Os três modelos diferem no que o fornecedor faz e no que a instituição continua a fazer.",
      "Infra-estrutura: recebo máquinas e redes, giro tudo o que está por cima.",
      "Plataforma: entrego a aplicação, o fornecedor trata do que está por baixo.",
      "Programa como serviço: uso um programa pronto e giro contas, configuração e dados.",
      "A maioria das instituições usa os três ao mesmo tempo, conforme a necessidade.",
    ],
    verificacao: [
      {
        pergunta:
          "Numa plataforma como serviço, quem é responsável por actualizar o sistema operativo do servidor?",
        resposta: "O fornecedor.",
        feedback:
          "É essa a vantagem principal do modelo. Em contrapartida, a instituição não escolhe livremente versões nem configurações desse nível.",
      },
      {
        pergunta:
          "Se a instituição usa correio electrónico institucional em linha, deixa de ter responsabilidades sobre esses dados?",
        resposta:
          "Não. Continua responsável pelas contas, pelas permissões, pela informação que lá coloca e pelo cumprimento das regras de protecção de dados.",
        feedback:
          "Esta é a confusão mais frequente e volta na lição sobre responsabilidade partilhada: contratar um programa como serviço transfere operação, não transfere responsabilidade pelos dados.",
      },
    ],
    guiao: {
      preparacao: [
        "Levar preparada a tabela de duas colunas — fornecedor e instituição — em papel, para grupos sem computador.",
        "Confirmar com a instituição anfitriã quais os serviços informáticos que podem ser mencionados em sala.",
        "Preparar dois exemplos de cada modelo que sejam reconhecíveis pelo grupo.",
      ],
      conducao: [
        "Acolhimento, retoma das cinco características da lição anterior e objectivos desta.",
        "Exposição dos três modelos com a repartição de responsabilidades, usando a imagem da refeição e corrigindo-a de imediato com a remissão para o contrato.",
        "Actividade em grupos de três, com apoio para distinguir plataforma de programa como serviço.",
        "Partilha de um grupo por modelo e síntese em leitura fácil.",
      ],
      criterios: [
        "Classifica pelo menos quatro dos cinco serviços de forma defensável.",
        "A repartição de responsabilidades é coerente com o modelo escolhido.",
        "Identifica pelo menos uma competência por formar sem a esconder.",
        "Não confunde plataforma como serviço com programa como serviço.",
      ],
      errosComuns: [
        "Achar que qualquer coisa acedida pelo navegador é programa como serviço.",
        "Supor que a infra-estrutura como serviço é sempre mais barata por parecer mais simples.",
        "Concluir que contratar serviço gerido dispensa a instituição de responsabilidade sobre os dados.",
      ],
    },
  },

  m1l3: {
    objectivos: [
      "Distinguir nuvem pública, privada, comunitária e híbrida pelo critério de quem a nuvem serve.",
      "Explicar o que é multinuvem e em que difere de nuvem híbrida.",
      "Identificar dois riscos e duas vantagens de uma solução híbrida para um serviço público.",
    ],
    explicacao: [
      "Os modelos de implantação respondem a outra pergunta: para quem existe esta nuvem. A nuvem pública é operada para uso do público em geral; qualquer organização contrata e a capacidade é partilhada com outros consumidores. A nuvem privada existe para uso exclusivo de uma organização, com as suas várias unidades como consumidores, e pode estar instalada nas instalações da organização ou nas de terceiro que a opere. A nuvem comunitária serve um conjunto de organizações com preocupações comuns, por exemplo várias instituições do mesmo sector com os mesmos requisitos de segurança. A nuvem híbrida é a composição de duas ou mais destas, que permanecem distintas mas são ligadas por tecnologia que permite mover dados ou aplicações entre elas.",
      "A distinção não é sobre o sítio onde estão as máquinas. Uma nuvem privada pode estar alojada fora da instituição e continuar a ser privada, porque serve uma só organização. E uma nuvem pública não deixa de ser pública por a instituição ter lá uma área isolada com rede própria.",
      "Multinuvem é coisa diferente de híbrida. Multinuvem significa usar serviços de mais do que um fornecedor de nuvem, por exemplo armazenamento num e uma aplicação noutro. Pode haver multinuvem sem nenhuma componente privada; e pode haver nuvem híbrida com um único fornecedor. As razões para usar mais do que um fornecedor costumam ser reduzir a dependência de um só, aproveitar um serviço que só existe num deles, ou responder a exigência de continuidade. O custo é a complexidade: duas consolas, dois modelos de identidade, duas facturas e equipas que precisam de conhecer ambos.",
      "Para a administração pública, o caso híbrido aparece com frequência por três razões. Há dados cuja localização ou tratamento está sujeito a exigências que aconselham a mantê-los sob controlo directo. Há aplicações antigas que não correm em nuvem pública sem serem reescritas. E há ligações à internet que, em certos distritos, não sustentam um serviço inteiramente remoto — o que recomenda manter capacidade local para o atendimento continuar quando a ligação cair.",
      "Os riscos de uma solução híbrida são igualmente concretos: a superfície a proteger aumenta, porque há duas redes e uma ligação entre elas; a responsabilidade dilui-se, porque uma falha pode estar de qualquer dos lados; e o custo de operação sobe, porque é preciso manter competências nos dois ambientes. Uma arquitectura híbrida deve ser uma decisão justificada, não o resultado de não se ter decidido.",
    ],
    exemplo: {
      titulo: "O registo de licenças da Autarquia de Cambala (cenário fictício)",
      corpo: [
        "A Autarquia de Cambala tem um registo de licenças comerciais com dados de identificação dos requerentes e quer publicar um portal onde o munícipe consulta o estado do seu pedido.",
        "A proposta em discussão é híbrida: a base de dados do registo fica numa nuvem privada operada para o sector, por causa dos dados pessoais e de uma exigência interna de controlo directo; o portal de consulta, que só mostra o estado do pedido e não guarda dados sensíveis, fica em nuvem pública, onde é fácil aguentar picos de acesso.",
        "As duas partes ligam-se por um canal cifrado e o portal só pode perguntar pelo estado de um pedido, nunca ler a ficha completa. Cenário fictício, para exercício.",
      ],
    },
    actividade: {
      formato: "em grupos de três",
      enunciado: [
        "Escolham um serviço da vossa instituição que trate dados de pessoas.",
        "Dividam esse serviço em duas listas: o que poderia estar em nuvem pública e o que, na vossa opinião, deve ficar sob controlo directo. Justifiquem cada colocação com uma razão — legal, técnica ou de ligação à internet.",
        "Desenhem, com caixas e setas, a ligação entre as duas partes e escrevam que informação atravessa essa ligação.",
        "Indiquem um risco que esta divisão cria e como o mitigariam.",
      ],
      produto:
        "um esquema de duas zonas com a informação que circula entre elas, as justificações de cada colocação e um risco com a respectiva mitigação.",
    },
    sintese: [
      "O modelo de implantação responde a: para quem existe esta nuvem.",
      "Pública serve o público em geral; privada serve uma organização; comunitária serve um grupo com requisitos comuns; híbrida liga duas ou mais.",
      "Privada não quer dizer «dentro do edifício»: quer dizer «para uma só organização».",
      "Multinuvem é usar vários fornecedores; é diferente de híbrida.",
      "O híbrido resolve problemas reais e aumenta a complexidade e a superfície a proteger.",
    ],
    verificacao: [
      {
        pergunta:
          "Uma instituição contrata capacidade exclusiva, operada por terceiro, em instalações do terceiro. É nuvem pública ou privada?",
        resposta: "Privada, porque é de uso exclusivo de uma organização.",
        feedback:
          "O critério é o conjunto de consumidores servidos, não a propriedade do edifício nem a localização do equipamento.",
      },
      {
        pergunta: "Usar armazenamento de um fornecedor e aplicações de outro é nuvem híbrida?",
        resposta: "Não necessariamente. Isso é multinuvem; só é híbrida se combinar modelos de implantação diferentes.",
        feedback:
          "Os dois conceitos aparecem juntos com frequência, mas respondem a perguntas distintas: quantos fornecedores, e que tipo de nuvem.",
      },
    ],
    referencias: [
      {
        titulo: "NIST SP 800-145, The NIST Definition of Cloud Computing",
        url: "https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-145.pdf",
        consultadoEm: "21 de Setembro de 2026",
      },
    ],
    guiao: {
      preparacao: [
        "Levar cartões com os quatro modelos de implantação para uma classificação rápida em plenário.",
        "Preparar folhas A3 para os esquemas de caixas e setas; a actividade não precisa de computador.",
        "Antecipar a confusão entre híbrida e multinuvem, que é o ponto mais falhado desta lição.",
      ],
      conducao: [
        "Acolhimento, ligação aos modelos de serviço da lição anterior e objectivos desta.",
        "Exposição dos quatro modelos de implantação, da diferença entre híbrida e multinuvem e das razões e riscos do híbrido no sector público.",
        "Actividade em grupos: divisão do serviço em duas zonas e esquema da ligação.",
        "Partilha de dois esquemas com decisões opostas e síntese em leitura fácil.",
      ],
      criterios: [
        "Justifica cada colocação com uma razão concreta e não apenas com «é mais seguro».",
        "O esquema identifica que informação atravessa a ligação entre as zonas.",
        "Distingue correctamente híbrida de multinuvem.",
        "Indica um risco realista e uma mitigação proporcional.",
      ],
      errosComuns: [
        "Tratar «privada» como sinónimo de «dentro do edifício».",
        "Chamar híbrida a qualquer situação com dois fornecedores.",
        "Colocar tudo sob controlo directo por precaução, sem avaliar o custo dessa decisão.",
      ],
    },
  },

  m1l4: {
    objectivos: [
      "Enumerar as vantagens habituais da nuvem e o limite prático de cada uma.",
      "Identificar as componentes de infra-estrutura que sustentam um serviço em nuvem.",
      "Aplicar o princípio da responsabilidade partilhada, dizendo o que continua a caber à instituição em cada modelo de serviço.",
    ],
    explicacao: [
      "As vantagens mais invocadas são quatro. Ajustar a capacidade à procura, evitando comprar para o pico. Reduzir o tempo entre decidir e ter o serviço a funcionar, porque não há aquisição de equipamento. Aceder a serviços geridos que a instituição não teria capacidade de montar sozinha. E melhorar a continuidade, por ser mais fácil ter cópias em locais diferentes.",
      "Cada uma tem o seu limite. O ajuste à procura só poupa se alguém reduzir a capacidade quando o pico passa — máquinas esquecidas ligadas consomem na mesma. A rapidez inicial não elimina o trabalho de migrar dados, rever processos e formar pessoas, que costuma ser a parte mais demorada. Os serviços geridos aumentam a dependência do fornecedor e dificultam a saída. E nada disto funciona sem ligação à internet com qualidade suficiente, o que em vários distritos é a primeira restrição a verificar, antes de qualquer decisão de arquitectura.",
      "Por baixo do serviço estão componentes de infra-estrutura que convém nomear, porque reaparecem em todas as consolas: centros de dados agrupados em regiões, e dentro de cada região zonas separadas para que uma falha não apanhe tudo; capacidade de cálculo, seja em máquinas virtuais, contentores ou funções; armazenamento, em disco ligado à máquina, em contentor de objectos ou em sistema de ficheiros partilhado; rede, com redes virtuais, endereços, balanceadores e ligações privadas; e os serviços de identidade, registo e monitoria que atravessam tudo o resto.",
      "O princípio que organiza as responsabilidades chama-se responsabilidade partilhada. O fornecedor responde pela segurança da nuvem: instalações, equipamento, rede física, e a camada que ele próprio gere. A instituição responde pela segurança na nuvem: que dados coloca lá, quem tem acesso, como configura o que criou, e o cumprimento das regras a que está sujeita. A fronteira desloca-se com o modelo de serviço — em infra-estrutura como serviço a instituição responde também pelo sistema operativo; em plataforma como serviço deixa de responder por ele; em programa como serviço fica sobretudo com contas, configuração e dados. O que nunca se transfere é a responsabilidade pelos dados e pelo serviço prestado ao cidadão.",
      "A maioria dos incidentes públicos conhecidos neste domínio não resulta de falha do fornecedor, mas de configuração indevida do lado do cliente: um contentor de armazenamento aberto ao público, uma permissão excessiva, uma chave deixada dentro do código. É por isso que este curso dedica um módulo inteiro a identidades, permissões mínimas e protecção de dados.",
    ],
    exemplo: {
      titulo: "A fronteira mal percebida no Hospital Distrital de Namacurra do Norte (cenário fictício)",
      corpo: [
        "O Hospital Distrital de Namacurra do Norte contrata uma plataforma como serviço para uma aplicação de marcação de consultas. A direcção fica com a ideia de que «a segurança é do fornecedor».",
        "Seis meses depois descobre-se que doze pessoas que já saíram do hospital continuam com conta activa, e que o relatório mensal de marcações estava a ser guardado num espaço de partilha acessível a quem tivesse o endereço.",
        "Nenhuma destas falhas é do fornecedor: ambas estão do lado da instituição — gestão de contas e configuração de acesso. Cenário fictício, para exercício.",
      ],
    },
    actividade: {
      formato: "em pares",
      enunciado: [
        "Desenhem uma tabela com três colunas: infra-estrutura como serviço, plataforma como serviço e programa como serviço.",
        "Nas linhas, coloquem: instalações e equipamento; rede física; sistema operativo; aplicação; configuração de acesso; dados; contas de utilizador; cumprimento das regras aplicáveis.",
        "Preencham cada célula com «fornecedor», «instituição» ou «ambos» e assinalem as células onde tiverem dúvida.",
        "Escolham uma das células marcadas com dúvida e escrevam que pergunta fariam ao fornecedor para a esclarecer.",
      ],
      produto:
        "a matriz de responsabilidade partilhada preenchida, com as dúvidas assinaladas e uma pergunta concreta a colocar ao fornecedor.",
    },
    sintese: [
      "As vantagens da nuvem são reais e têm limites: poupar exige gerir; a rapidez inicial não elimina o trabalho de migrar.",
      "Sem ligação à internet com qualidade suficiente, a discussão de arquitectura não avança.",
      "Componentes a conhecer: regiões e zonas, cálculo, armazenamento, rede, identidade e monitoria.",
      "O fornecedor responde pela segurança da nuvem; a instituição responde pela segurança na nuvem.",
      "A responsabilidade pelos dados e pelo serviço ao cidadão não se transfere por contrato.",
    ],
    verificacao: [
      {
        pergunta:
          "Um contentor de armazenamento com dados de utentes ficou acessível ao público. De quem é a responsabilidade?",
        resposta: "Da instituição: é configuração do lado do cliente.",
        feedback:
          "Este é o caso típico da responsabilidade na nuvem. O fornecedor entrega o mecanismo de controlo de acesso; usá-lo correctamente é trabalho de quem cria o recurso.",
      },
      {
        pergunta: "Migrar para a nuvem reduz sempre o custo?",
        resposta:
          "Não. Depende do perfil de utilização, do contrato, do esforço de migração e da disciplina em reduzir capacidade quando deixa de ser precisa.",
        feedback:
          "Vale a pena separar as duas perguntas: «isto melhora o serviço?» e «isto custa menos?». Nem sempre têm a mesma resposta.",
      },
    ],
    guiao: {
      preparacao: [
        "Levar a matriz de responsabilidade partilhada já desenhada em papel, com as linhas preenchidas e as células vazias.",
        "Preparar um exemplo de incidente por configuração indevida, sem nomear instituições reais.",
        "Verificar com o grupo, no início, qual é a qualidade da ligação à internet nos seus locais de trabalho.",
      ],
      conducao: [
        "Acolhimento, recolha rápida das expectativas de poupança que o grupo traz e objectivos da lição.",
        "Exposição das vantagens e dos seus limites, das componentes de infra-estrutura e do princípio da responsabilidade partilhada.",
        "Actividade em pares com a matriz de responsabilidades e as dúvidas assinaladas.",
        "Partilha das células onde houve mais desacordo e síntese em leitura fácil.",
      ],
      criterios: [
        "A matriz reflecte a deslocação da fronteira entre os três modelos.",
        "Coloca dados e cumprimento das regras do lado da instituição em todos os modelos.",
        "Assinala dúvidas em vez de as preencher ao acaso.",
        "A pergunta ao fornecedor é concreta e respondível.",
      ],
      errosComuns: [
        "Atribuir toda a segurança ao fornecedor por ele ser especializado.",
        "Esquecer a gestão de contas de pessoas que saíram da instituição.",
        "Prometer poupança antes de conhecer o perfil de utilização.",
      ],
    },
  },

  m1l5: {
    objectivos: [
      "Aplicar critérios explícitos para escolher modelo de serviço e modelo de implantação para um serviço público concreto.",
      "Registar por escrito os pressupostos e as informações em falta que condicionam a escolha.",
      "Apresentar e defender uma recomendação fundamentada perante o grupo.",
    ],
    explicacao: [
      "Esta lição fecha o módulo com a única pergunta que interessa na prática: dado este serviço, que modelo escolher. A resposta não sai de uma tabela universal; sai de critérios aplicados com honestidade, e de dizer o que ainda não se sabe.",
      "Seis critérios cobrem a maior parte dos casos. Primeiro, a natureza dos dados: há dados pessoais ou sensíveis, e que exigências se aplicam ao seu tratamento e localização. Segundo, o padrão de procura: é constante, tem picos previsíveis, ou é imprevisível. Terceiro, a ligação à internet nos locais onde o serviço é usado, incluindo o que acontece ao atendimento quando ela cai. Quarto, as competências da equipa hoje e as que se conseguem formar num horizonte razoável. Quinto, a dependência do fornecedor e o custo de sair: que formatos, que dados, que reescrita seriam precisos para mudar. Sexto, o custo total, que inclui migração, formação e operação, e não apenas a factura mensal de capacidade.",
      "Ao aplicar estes critérios, três regras ajudam a não errar por hábito. Subir na escala de gestão sempre que não houver razão para descer: escolher o serviço mais gerido que sirva. Não decidir a arquitectura antes de conhecer a ligação à internet dos locais de uso. E escrever os pressupostos: «assumimos que os dados de identificação podem ser tratados por operador contratado» é uma frase que tem de ser confirmada por quem tem competência para isso, não pelo técnico que desenha a solução.",
      "Uma recomendação útil tem sempre quatro partes: a opção escolhida; as opções descartadas e porquê; os pressupostos assumidos; e a lista do que falta apurar, com indicação de quem pode responder. Uma recomendação sem a quarta parte costuma ser uma recomendação que esconde o que não se sabe.",
      "Por fim, uma nota de método: a escolha não é definitiva. Serviços começam num modelo e mudam quando as condições mudam — quando a aplicação antiga é reescrita, quando a ligação melhora, quando a equipa ganha competências. Registar a decisão com data e com os pressupostos permite revê-la sem recomeçar do zero.",
    ],
    exemplo: {
      titulo: "O cadastro de agricultores do Serviço Provincial de Tuvane (cenário fictício)",
      corpo: [
        "O Serviço Provincial de Tuvane quer informatizar o cadastro de agricultores. Os dados incluem nome, documento de identificação e localização das parcelas. O registo é feito por extensionistas em dez postos, quatro deles com ligação à internet instável. A consulta central é feita por seis técnicos na capital provincial. A equipa informática tem duas pessoas, sem experiência de administração de servidores.",
        "Aplicados os critérios, a proposta é: aplicação em plataforma como serviço, por causa da equipa pequena; base de dados sob controlo directo em nuvem privada do sector, por causa dos dados de identificação, ficando a arquitectura híbrida; e registo nos postos com funcionamento local que sincroniza quando há ligação, por causa dos quatro postos instáveis.",
        "Pressupostos escritos: que existe capacidade disponível na nuvem privada do sector; e que a sincronização diferida é aceitável para o processo de cadastro. Por apurar: o prazo legal de conservação dos dados e quem autoriza o tratamento por operador contratado. Cenário fictício, para exercício.",
      ],
    },
    actividade: {
      formato: "em grupos de quatro, com apresentação",
      enunciado: [
        "Escolham um serviço real da vossa instituição que ainda não esteja em nuvem — sem usar dados reais de pessoas no exercício.",
        "Apliquem os seis critérios, um a um, e escrevam uma linha de conclusão por critério.",
        "Escrevam a recomendação com as quatro partes: opção escolhida, opções descartadas e porquê, pressupostos assumidos, e o que falta apurar com indicação de quem responde.",
        "Na partilha ouvem-se dois grupos, escolhidos por amostra: 3 minutos de exposição e 1 minuto de comentário cada, seguidos de 2 minutos de síntese. Os restantes grupos entregam a ficha ao formador, que devolve apreciação escrita.",
      ],
      produto:
        "uma ficha de recomendação de uma página com os seis critérios aplicados, a opção escolhida, as descartadas, os pressupostos e a lista do que falta apurar.",
    },
    sintese: [
      "A escolha do modelo faz-se com critérios escritos, não por hábito nem por moda.",
      "Seis critérios: natureza dos dados, padrão de procura, ligação à internet, competências, dependência do fornecedor e custo total.",
      "Escolher o serviço mais gerido que sirva, e descer na escala só com razão.",
      "Uma boa recomendação diz também o que ainda não se sabe e quem pode responder.",
      "A decisão tem data e pressupostos, e revê-se quando as condições mudarem.",
    ],
    verificacao: [
      {
        pergunta:
          "Numa recomendação, por que motivo é indispensável a lista do que falta apurar?",
        resposta:
          "Porque torna visível o que a decisão está a assumir e permite que quem tem competência confirme ou corrija esses pressupostos.",
        feedback:
          "Sem esta lista, um pressuposto por confirmar passa a decisão tomada sem que ninguém repare.",
      },
      {
        pergunta:
          "Um serviço usado em postos com ligação instável: que critério tem de ser avaliado antes de escolher a arquitectura?",
        resposta:
          "A ligação à internet nos locais de uso, incluindo o que acontece ao atendimento quando ela cai.",
        feedback:
          "Este critério manda muitas vezes mais do que a preferência tecnológica: determina se é preciso funcionamento local com sincronização posterior.",
      },
    ],
    guiao: {
      preparacao: [
        "Imprimir a ficha de recomendação com os seis critérios e as quatro partes, uma por grupo.",
        "Combinar antes com os participantes que serviços podem ser usados no exercício, para evitar dados reais de pessoas.",
        "Preparar o cronómetro da partilha: dois grupos por amostra, 3 minutos de exposição e 1 minuto de comentário cada, e 2 minutos de síntese — 10 minutos ao todo numa turma até 30 participantes.",
      ],
      conducao: [
        "Acolhimento, retoma dos três blocos do módulo — características, modelos de serviço, modelos de implantação — e objectivos desta lição.",
        "Exposição dos seis critérios, das três regras de método e da estrutura da recomendação em quatro partes.",
        "Actividade em grupos de quatro: aplicação dos critérios e redacção da ficha de recomendação.",
        "Partilha por amostra: dois grupos, 3 minutos de exposição e 1 minuto de comentário cada, e 2 minutos de síntese final do módulo em leitura fácil. As fichas dos restantes grupos são recolhidas para apreciação escrita.",
      ],
      criterios: [
        "Aplica os seis critérios e não apenas os dois mais fáceis.",
        "A recomendação tem as quatro partes, incluindo o que falta apurar.",
        "Os pressupostos estão escritos como pressupostos, e não como factos.",
        "Responde ao comentário recebido, em sala ou por escrito, sem abandonar a fundamentação nem a defender de forma rígida.",
      ],
      errosComuns: [
        "Escolher o modelo primeiro e procurar os critérios que o justificam depois.",
        "Deixar de fora o custo de migração e de formação na comparação.",
        "Apresentar pressupostos por confirmar como se fossem decisões já tomadas.",
      ],
    },
  },
  m2l1: {
    objectivos: [
      "Distinguir as famílias de recursos de computação — máquina virtual, contentor e execução sem servidor — e indicar quando cada uma serve.",
      "Distinguir armazenamento de blocos, de ficheiros e de objectos, e escolher o tipo adequado a um caso de serviço público.",
      "Criar, em ambiente de formação, um recipiente de objectos privado na Amazon Web Services, verificar que está fechado ao exterior e apagá-lo no fim.",
      "Preparar por escrito os parâmetros da máquina virtual que será criada na lição seguinte, depois de existir rede.",
    ],
    explicacao: [
      "Os recursos de computação são as várias formas de correr código na nuvem. A máquina virtual é a mais próxima do que já se conhece: um computador lógico, com sistema operativo próprio, ao qual se liga por acesso remoto e onde se instala o que for preciso. Dá liberdade total e, em troca, deixa à instituição a responsabilidade pelas actualizações, pela segurança do sistema operativo e pelo que lá corre. O contentor é uma forma mais leve: empacota a aplicação com as bibliotecas de que ela precisa e corre sobre um sistema operativo partilhado, arrancando em segundos e sendo fácil de replicar. A execução sem servidor visível, por vezes chamada serverless, vai mais longe: escreve-se uma função, o fornecedor trata de a executar quando é chamada e de a dimensionar, e a equipa deixa de gerir servidores. Serverless não quer dizer que não existam servidores; quer dizer que não são geridos por quem usa o serviço, e o custo tem normalmente várias componentes — execuções, tempo de execução, memória atribuída, tráfego e serviços associados — e não apenas o tempo de execução.",
      "Estas três formas correspondem a graus diferentes de controlo e de trabalho. Uma aplicação antiga, que exige uma versão específica do sistema operativo, tende a ir para máquina virtual. Uma aplicação nova, feita em partes independentes, encaixa melhor em contentores, que são a base do estilo cloud-native e das práticas de integração e entrega contínuas, assunto retomado na última lição do módulo. Uma tarefa esporádica — converter um ficheiro, enviar uma notificação, tratar um formulário — é bom candidato à execução sem servidor.",
      "Do lado do armazenamento há três tipos que não se substituem entre si. O armazenamento de blocos é o disco de uma máquina: rápido, é onde vive o sistema operativo e a base de dados. Na maioria dos casos um disco está ligado a uma máquina de cada vez, mas há discos partilháveis, previstos precisamente para aglomerados de servidores que acedem ao mesmo disco em simultâneo, com um sistema de ficheiros preparado para isso. O armazenamento de ficheiros é uma pasta partilhada em rede, acessível por vários computadores ao mesmo tempo, útil para documentos de trabalho de uma equipa. O armazenamento de objectos guarda ficheiros inteiros, cada um com um nome e com informação descritiva associada, acedidos por interface de rede em vez de sistema de ficheiros: é a escolha habitual para digitalizações, fotografias, cópias de segurança e registos que crescem continuamente.",
      "Convém não exagerar as vantagens do armazenamento de objectos. Cresce muito, mas não é ilimitado: há quotas por conta e por recipiente, limites de pedidos por segundo e limites de tamanho por objecto, e o custo tem várias componentes — capacidade guardada, pedidos, tráfego de saída e, em alguns níveis de acesso, penalizações por leitura frequente ou por remoção antecipada. Dizer que é sempre mais barato é falso: depende do padrão de acesso. Para dados lidos muitas vezes ao dia, outro tipo de armazenamento pode sair melhor.",
      "Nos serviços de objectos a terminologia difere entre fornecedores e convém não a baralhar. Na Amazon Web Services, o recipiente chama-se bucket e faz parte do serviço S3. No Azure, o recipiente equivalente chama-se contentor e vive dentro de uma conta de armazenamento, no serviço Blob Storage. São conceitos equivalentes no papel que desempenham — recipiente nomeado de objectos — mas não são a mesma coisa nem têm as mesmas regras de nomes, de permissões e de níveis de acesso. Dizer «bucket» a um contentor do Azure é impreciso; o que se pode dizer é que um corresponde ao outro. As regras de nomes de bucket admitem mais do que letras, números e hífenes — os pontos são permitidos, com restrições, e desaconselhados em certos usos — pelo que o padrão simplificado adoptado no laboratório é uma convenção nossa, e a regra oficial fica indicada nas referências.",
      "Duas regras atravessam toda esta lição. Primeira: o armazenamento é privado por defeito e só se abre o que tiver mesmo de estar aberto, com justificação escrita. Segunda: tudo o que é criado num exercício é apagado no fim do exercício, junto do fornecedor onde foi criado, e a ordem de eliminação respeita as dependências entre recursos.",
    ],
    exemplo: {
      titulo: "O arquivo de digitalizações do Serviço Distrital de Ondela (cenário fictício)",
      corpo: [
        "O Serviço Distrital de Ondela digitaliza processos de licenciamento. Hoje os ficheiros estão no disco de um computador do gabinete e são copiados à mão para um disco externo, às sextas-feiras, quando alguém se lembra.",
        "A equipa propõe três mudanças. A aplicação de consulta dos processos passa a correr numa máquina virtual, porque depende de uma versão antiga de um componente. As digitalizações passam para armazenamento de objectos, privado, porque são ficheiros que só crescem e raramente mudam depois de criados. A pasta partilhada de minutas de despacho, essa, continua a fazer sentido como armazenamento de ficheiros, acessível a vários postos ao mesmo tempo.",
        "Antes de decidir, a equipa anota duas perguntas de custo: quantas vezes por dia cada digitalização é consultada, e quanto tráfego de saída isso gera. Cenário fictício, para exercício. Não descreve nenhum serviço existente e não indica preços.",
      ],
    },
    actividade: {
      formato:
        "em pares, um computador por par, com alternância de quem executa — o Termo de Referência fixa o máximo de dois formandos por computador e recomenda um por computador sempre que o equipamento chegue",
      enunciado: [
        "Primeira parte, em papel, 10 minutos: para o caso fictício de Ondela, decidam que tipo de computação e que tipo de armazenamento servem cada uma das três necessidades, com uma linha de justificação em cada.",
        "Segunda parte, no ambiente de formação, 40 minutos: executar o laboratório abaixo. Dentro do par, uma pessoa executa a primeira metade dos passos e a outra executa a segunda; ambas registam evidência. Havendo um computador por pessoa, cada uma executa o percurso completo.",
        "Quem ficar bloqueado num passo escreve o número do passo e a mensagem de erro exacta na ficha, e passa ao passo seguinte que não dependa dele.",
      ],
      produto:
        "ficha do par com as três decisões justificadas, a evidência do laboratório, o registo de quem executou cada metade e a ficha de preparação da máquina virtual da lição seguinte.",
    },
    laboratorio: {
      titulo: "Criar um recipiente de objectos privado e preparar a máquina virtual da lição seguinte",
      percurso:
        "Amazon S3 para o recipiente de objectos. A máquina virtual não é criada nesta lição: só é criada na lição seguinte, já dentro da rede virtual, porque a interface de rede de uma máquina não se muda para outra rede depois de criada.",
      preRequisitos: [
        "Amazon Web Services — conta institucional de formação da entidade formadora, com orçamento e alertas de custo definidos pelo formador.",
        "Amazon Web Services — utilizador ou papel de formação com permissões limitadas por política aos buckets cujo nome comece pelo prefixo da turma, com autorização para criar, listar, carregar e apagar apenas esses buckets.",
        "Nenhum participante usa conta pessoal, associa cartão de pagamento ou introduz credenciais próprias. Os dados usados são fictícios.",
        "Ficheiro de exemplo preparado antes pelo formador, sem dados de pessoas.",
        "Navegador actualizado e ligação à internet estável. Se o ambiente falhar, a prática fica registada como pendente e é reagendada: a demonstração do formador serve para acompanhar o raciocínio, mas não substitui a execução pelos formandos.",
      ],
      passos: [
        "Entrar na consola da Amazon Web Services com o utilizador de formação e confirmar, antes de tudo, que está seleccionada a conta de formação e a região combinada.",
        "Abrir o serviço S3 e criar um bucket com um nome único global, seguindo a convenção do laboratório: apenas minúsculas, números e hífenes, começando pelo prefixo da turma, por exemplo formacao-nuvem-t01-g03. A regra oficial de nomes é mais permissiva do que esta convenção; fica indicada nas referências.",
        "Manter activo o bloqueio de todo o acesso público. O bucket fica privado; nenhum exercício deste curso torna público um recipiente de objectos.",
        "Carregar o ficheiro fictício de exemplo e confirmar que aparece na lista de objectos.",
        "Copiar o endereço do objecto e abri-lo numa janela anónima do navegador, sem sessão iniciada.",
        "Trocar de executante dentro do par e repetir a leitura da configuração: bloqueio de acesso público, política do bucket e lista de objectos.",
        "Preparação da lição seguinte, em papel: escrever na ficha o nome que a máquina virtual vai ter, o tamanho autorizado pelo formador, a região, o utilizador administrativo e o método de autenticação por chave. Nada é criado no Azure nesta lição.",
        "Registar na ficha o nome do bucket, a região e as horas de criação e de eliminação.",
      ],
      verificacao: [
        "O bucket aparece na lista do S3 e o painel indica que o acesso público está bloqueado.",
        "O objecto carregado aparece na listagem, com o tamanho esperado.",
        "A abertura do endereço do objecto na janela anónima devolve explicitamente «acesso negado» — é esse o resultado correcto, e é uma verificação positiva de que a regra actua, e não um simples tempo de espera esgotado.",
        "A ficha de preparação da máquina virtual está preenchida em todos os campos.",
      ],
      problemas: [
        "Nome de bucket recusado: os nomes são únicos em todo o mundo; acrescentar o código da turma e do grupo. Se o nome contiver maiúsculas ou sublinhados, é recusado pela própria regra oficial.",
        "Falta de permissão para criar: confirmar que o nome começa pelo prefixo autorizado pela política de formação, e chamar o formador se persistir.",
        "O endereço do objecto devolve «não encontrado» em vez de «acesso negado»: confirmar o nome exacto do objecto; ambos os resultados significam que não está público, mas só o primeiro confirma que o objecto existe.",
        "Ambiente indisponível: registar a prática como pendente, com data de reagendamento, e não a dar por cumprida com a demonstração do formador.",
      ],
      evidencia: [
        "Captura de ecrã das propriedades do bucket mostrando o bloqueio de acesso público activo, com o identificador da conta tapado.",
        "Captura de ecrã da listagem de objectos com o ficheiro fictício carregado.",
        "Captura de ecrã do resultado «acesso negado» na janela anónima.",
        "Ficha do par com nome do bucket, região, horas, quem executou cada metade e os parâmetros preparados da máquina virtual.",
      ],
      limpeza: [
        "Amazon Web Services, por ordem de dependência: apagar primeiro os objectos e só depois o bucket, que não pode ser apagado enquanto tiver conteúdo.",
        "Confirmar que a listagem de buckets com o prefixo da turma deixou de conter o bucket do par.",
        "Não há nada a apagar no Azure nesta lição, porque nada foi lá criado.",
      ],
    },
    sintese: [
      "Máquina virtual dá mais controlo e mais trabalho; contentor é mais leve; sem servidor visível é para tarefas curtas e ocasionais.",
      "Sem servidor visível não significa sem servidores: significa que não somos nós a geri-los, e o custo tem várias componentes.",
      "Blocos é o disco de uma máquina, normalmente ligado a uma de cada vez, havendo discos partilháveis para casos próprios; ficheiros é a pasta partilhada; objectos é para ficheiros que só crescem.",
      "O armazenamento de objectos tem quotas, limites e custo com várias componentes: não é ilimitado nem sempre o mais barato.",
      "Bucket na Amazon e contentor no Azure desempenham o mesmo papel, mas não são a mesma coisa; o padrão de nomes usado no laboratório é convenção nossa, mais estrita do que a regra oficial.",
      "O armazenamento é privado por defeito, e o que se cria apaga-se no fim, junto do fornecedor onde foi criado.",
    ],
    verificacao: [
      {
        pergunta:
          "Um serviço recebe pedidos de certidão duas ou três vezes por dia e limita-se a enviar um aviso por correio electrónico. Que forma de computação estudar primeiro?",
        resposta:
          "A execução sem servidor visível, porque a tarefa é curta, esporádica e não exige manter um servidor sempre ligado.",
        feedback:
          "Antes de decidir, conviria ainda verificar os requisitos de protecção de dados e se o volume se mantém baixo ao longo do ano.",
      },
      {
        pergunta:
          "«O armazenamento de objectos é ilimitado e é sempre a opção mais barata.» A afirmação está correcta?",
        resposta:
          "Não. Há quotas e limites de pedidos e de tamanho, e o custo depende da capacidade, dos pedidos, do tráfego de saída e do nível de acesso escolhido.",
        feedback:
          "Para dados consultados muitas vezes por dia, outro tipo de armazenamento pode custar menos. A comparação faz-se com o padrão de acesso em mãos.",
      },
    ],
    referencias: [
      {
        titulo: "Amazon S3 — Getting started with Amazon S3",
        url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html",
        consultadoEm: "21 de Setembro de 2026",
      },
      {
        titulo: "Amazon S3 — Regras de nomes de buckets",
        url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html",
        consultadoEm: "21 de Setembro de 2026",
      },
      {
        titulo: "Azure — Discos partilhados entre máquinas virtuais",
        url: "https://learn.microsoft.com/en-us/azure/virtual-machines/disks-shared",
        consultadoEm: "21 de Setembro de 2026",
      },
    ],
    guiao: {
      preparacao: [
        "Preparar do lado da Amazon: conta de formação, orçamento e alertas, política que limita os participantes aos buckets com o prefixo da turma, e lista de regiões autorizadas.",
        "Não preparar nada no Azure para esta lição: a máquina virtual só é criada na lição seguinte, depois de existir rede.",
        "Distribuir o ficheiro fictício de exemplo e a ficha de preparação da máquina virtual.",
        "Organizar a sala em pares, com um computador por par e alternância de executante; havendo equipamento, um computador por pessoa.",
        "Executar o laboratório sozinho antes da aula: este guião ainda não foi executado.",
        "Ter pronto o procedimento para falha de ambiente: registar prática pendente, marcar reagendamento e não a substituir por demonstração.",
      ],
      conducao: [
        "Acolhimento, retoma do módulo anterior numa frase e apresentação dos objectivos, com aviso de que se usa conta de formação, dados fictícios e nenhum recurso pago por iniciativa própria.",
        "Exposição das três formas de computação e dos três tipos de armazenamento, com os limites e custos do armazenamento de objectos e a distinção entre bucket e contentor.",
        "Actividade: 10 minutos de decisão em papel e 40 minutos de laboratório, com troca de executante a meio e preenchimento da ficha de preparação da máquina virtual.",
        "Partilha por amostra: dois pares apresentam 3 minutos cada, com 1 minuto de comentário, e 2 minutos de síntese. As fichas dos restantes pares são recolhidas para apreciação escrita.",
      ],
      criterios: [
        "As três decisões de tipo de computação e de armazenamento estão justificadas, e não apenas nomeadas.",
        "O bucket ficou privado e a verificação em janela anónima devolveu acesso negado.",
        "Ambas as pessoas do par executaram parte dos passos, com registo.",
        "A evidência não contém chaves, palavras-passe nem identificadores de conta visíveis.",
        "A ficha de preparação da máquina virtual está completa e a limpeza do bucket está registada.",
      ],
      errosComuns: [
        "Desactivar o bloqueio de acesso público do bucket para conseguir abrir o ficheiro no navegador.",
        "Tentar criar já a máquina virtual, ficando com ela numa rede que depois não serve.",
        "Deixar uma pessoa do par a executar tudo e a outra a observar.",
        "Tentar apagar o bucket antes de apagar os objectos.",
        "Confundir contentor de objectos com contentor de aplicação: são coisas diferentes com o mesmo nome em português.",
      ],
    },
  },
  m2l2: {
    objectivos: [
      "Explicar o que é uma rede virtual, o que são sub-redes e endereçamento privado, e porque é que a rede se cria antes das máquinas.",
      "Escrever regras de segurança com prioridades numéricas, sabendo que as regras por omissão permitem o tráfego dentro da própria rede virtual e que negar exige regra explícita.",
      "Criar a rede virtual, as sub-redes e os grupos de segurança e, só depois, criar uma máquina virtual Linux directamente na sub-rede de aplicação, com acesso administrativo restrito a uma origem conhecida.",
      "Distinguir regra desenhada, regra configurada e ligação efectivamente testada.",
    ],
    explicacao: [
      "Uma rede virtual na nuvem é o espaço de rede privado da instituição dentro da infra-estrutura do fornecedor. Define-se um intervalo de endereços privados — por exemplo 10.20.0.0/16 — e dentro dele criam-se sub-redes, cada uma com o seu pedaço de endereços. As sub-redes servem para separar responsabilidades: uma para os servidores de aplicação, outra para a base de dados, outra para a administração.",
      "A ordem importa e não é detalhe de laboratório: a interface de rede de uma máquina virtual nasce numa sub-rede e não passa depois para outra rede virtual. Por isso a rede desenha-se e cria-se primeiro, e as máquinas criam-se dentro dela. Trocar a ordem obriga a apagar a máquina e a recriá-la.",
      "O endereçamento tem de ser pensado antes. Se a instituição já usa 10.20.0.0/16 na sua rede interna, escolher o mesmo intervalo na nuvem impede depois a ligação entre as duas redes, porque os endereços colidem.",
      "Sobre o tráfego aplicam-se regras de segurança. No Azure chamam-se grupos de segurança de rede e associam-se a uma sub-rede ou à interface de rede de uma máquina. Cada regra tem prioridade entre 100 e 4096, origem, destino, porta e protocolo; ganha a primeira regra que corresponder, por ordem crescente de número. Existe um ponto que engana muita gente: entre as regras por omissão, com prioridade 65000, há uma que PERMITE todo o tráfego de entrada vindo da própria rede virtual. Isso significa que criar uma regra que permite a aplicação falar com a base de dados não implica, de forma nenhuma, que o resto da rede fique impedido de lhe falar. Para restringir de verdade é preciso uma regra de negação explícita, com número menor do que 65000 e maior do que as regras de permissão — por exemplo permissões em 100 e 200, negação em 4000 — para que a negação seja avaliada depois das permissões e antes das omissões.",
      "Verificar também não é o que parece. Uma ligação que fica à espera e acaba por expirar não prova que a regra está a filtrar: pode ser serviço parado, porta errada, encaminhamento ou máquina desligada. A verificação séria tem duas partes: um teste positivo, em que o tráfego autorizado passa mesmo, e um teste negativo apoiado na avaliação de regras efectivas do próprio portal, que diz qual a regra que decidiu o destino daquele tráfego. Há três estados diferentes a não confundir: regra desenhada no papel, regra configurada e associada no portal, e ligação efectivamente testada.",
      "O acesso administrativo nunca se abre a qualquer origem. Neste laboratório usa-se o caminho mais simples que é possível preparar numa sala: uma regra que permite a porta de acesso remoto apenas a partir do endereço público de saída da sala, em barra trinta e dois, e nada mais. Em produção há caminhos melhores — acesso intermediado pelo portal, posto de salto na sub-rede de administração ou rede privada virtual — e a sub-rede de administração é criada aqui já a pensar nisso, embora não se coloque nenhuma máquina lá dentro.",
      "Para ligar a rede da instituição à rede na nuvem há três caminhos habituais: rede privada virtual sobre a internet, ligação dedicada contratada a um operador, e ligação entre redes virtuais, quando há mais do que uma rede ou mais do que um fornecedor. Em Moçambique a escolha depende muito da ligação disponível no local: num distrito com ligação intermitente, o serviço tem de continuar a funcionar localmente e sincronizar depois.",
    ],
    exemplo: {
      titulo: "A rede do portal de licenciamento de Ondela (cenário fictício)",
      corpo: [
        "A equipa de Ondela desenha a rede do portal com três sub-redes: aplicação, dados e administração. A base de dados não tem endereço público e só deve aceitar ligações vindas da sub-rede da aplicação.",
        "Na primeira versão do desenho, a equipa escreve apenas a regra que permite a aplicação falar com a base de dados e dá o trabalho por terminado. Na revisão, alguém lembra que a regra por omissão permite o tráfego dentro da rede virtual: qualquer máquina de qualquer sub-rede continuaria a alcançar a base de dados. Acrescenta-se então uma negação explícita com prioridade 4000.",
        "Para a avaria de fim-de-semana, a equipa recusa abrir a porta de administração ao mundo: autoriza o endereço concreto de quem vai intervir, regista a autorização e fecha-a depois. Cenário fictício, para exercício.",
      ],
    },
    actividade: {
      formato:
        "em pares, um computador por par, com alternância de quem executa; havendo equipamento, um computador por pessoa, conforme o máximo de dois formandos por computador fixado no Termo de Referência",
      enunciado: [
        "Primeira parte, em papel, 10 minutos: desenhem o plano de endereçamento das três sub-redes e escrevam a tabela de regras com prioridade, origem, destino, porta e razão de ser, incluindo as negações explícitas.",
        "Segunda parte, no ambiente de formação, 35 minutos: executar o laboratório abaixo pela ordem indicada — rede, sub-redes e grupos de segurança primeiro, máquina virtual depois. A meio, trocar de executante dentro do par.",
        "Terceira parte, 10 minutos: apagar tudo o que foi criado, pela ordem de dependências, e registar a eliminação.",
      ],
      produto:
        "plano de endereçamento e tabela de regras com prioridades justificadas, evidência do teste positivo e do teste negativo por avaliação de regras, e registo da limpeza com quem executou cada parte.",
    },
    laboratorio: {
      titulo: "Criar rede virtual, regras de segurança e, dentro delas, a máquina virtual",
      percurso:
        "Microsoft Azure: rede virtual, sub-redes, três grupos de segurança de rede e uma máquina virtual Linux criada já dentro da sub-rede de aplicação.",
      preRequisitos: [
        "Microsoft Azure — subscrição institucional de formação da entidade formadora, com orçamento e alertas de custo definidos pelo formador.",
        "Microsoft Azure — grupo de recursos do exercício já criado, com nome que identifique a turma e a data, e utilizador de formação com permissões de contribuidor limitadas a esse grupo de recursos.",
        "Este laboratório é apenas no Azure. O bucket da lição anterior é da Amazon Web Services, não pertence a este grupo de recursos e já foi apagado lá.",
        "Ficha de preparação da máquina virtual, preenchida na lição anterior: nome, tamanho autorizado, região, utilizador administrativo e autenticação por chave.",
        "Endereço público de saída da sala, apurado pelo formador antes da sessão e escrito no quadro, para usar como origem autorizada. Não é escrito em documento partilhado publicamente.",
        "Ferramenta de avaliação de fluxo já disponível e com as permissões necessárias, tratadas pelo formador antes da sessão. O utilizador de formação está limitado ao grupo de recursos e não deve activar serviços fora desse âmbito. Se a ferramenta não estiver disponível, o teste negativo fica registado como pendente e não se dá por bem sucedido.",
        "Se o ambiente falhar, a prática fica registada como pendente e é reagendada. A demonstração do formador não a substitui.",
      ],
      passos: [
        "No portal do Azure, dentro do grupo de recursos do exercício, criar a rede virtual com o intervalo combinado, por exemplo 10.20.0.0/16, na região da ficha de preparação.",
        "Criar três sub-redes: aplicacao (10.20.1.0/24), dados (10.20.2.0/24) e administracao (10.20.3.0/24).",
        "Criar os três grupos de segurança de rede, um por sub-rede: nsg-aplicacao, nsg-dados e nsg-administracao, com o código do par no nome.",
        "Em nsg-aplicacao: regra de entrada prioridade 100, protocolo TCP, porta 22, origem o endereço de saída da sala em barra trinta e dois, destino 10.20.1.0/24, acção permitir. Regra de entrada prioridade 4000, qualquer protocolo, qualquer porta, origem qualquer, destino 10.20.1.0/24, acção negar.",
        "Em nsg-dados: regra de entrada prioridade 100, protocolo TCP, porta 5432, origem 10.20.1.0/24, destino 10.20.2.0/24, acção permitir. Regra de entrada prioridade 4000, qualquer origem, destino 10.20.2.0/24, acção negar. Sem esta segunda regra, a regra por omissão 65000 continuaria a permitir o tráfego vindo de toda a rede virtual.",
        "Em nsg-administracao: regra de entrada prioridade 100, TCP, porta 22, origem o endereço da sala em barra trinta e dois, e regra de entrada prioridade 4000 a negar tudo o resto. A sub-rede fica preparada para um futuro posto de salto; nesta sessão não se cria máquina nenhuma nela.",
        "Associar cada grupo de segurança à sua sub-rede e confirmar a associação na página de cada sub-rede.",
        "Só agora criar a máquina virtual Linux, com os dados da ficha de preparação, escolhendo explicitamente a rede virtual criada e a sub-rede aplicacao, com endereço público atribuído e SEM permitir portas de entrada no assistente.",
        "No separador de rede da criação, definir explicitamente o grupo de segurança da interface de rede como «Nenhum», ou equivalente na interface usada. A filtragem já vem do grupo associado à sub-rede; um segundo grupo na interface acumula-se com esse e pode bloquear o acesso remoto sem razão aparente.",
        "Escolher autenticação por chave e guardar a chave privada na pasta local do exercício. A chave nunca é enviada por correio electrónico, colada na ficha ou fotografada.",
        "Teste positivo: a partir da sala, estabelecer sessão de acesso remoto à máquina, com a chave, e executar um comando simples que confirme a ligação.",
        "Teste negativo por avaliação de regras, na interface de rede desta máquina, que é a única que existe: avaliar a entrada na porta 22 a partir de um endereço qualquer da internet, que deve resultar em negado, com indicação da regra 4000.",
        "Revisão do grupo de segurança da sub-rede de dados: ler no portal as regras e a associação e confirmar, uma a uma, que existe a permissão em 100 e a negação em 4000. Não há nesta sessão nenhuma máquina na sub-rede de dados, por isso não existe destino real e a conectividade dessa sub-rede fica por testar — é revisão de configuração, não teste executado.",
        "Registar na ficha o resultado de cada avaliação, com o nome da regra que decidiu, e não apenas «não liguei». Se a ferramenta de avaliação não estiver disponível, escrever «teste pendente» em vez de qualquer conclusão.",
      ],
      verificacao: [
        "As três sub-redes existem com os intervalos planeados, sem sobreposição, e cada uma mostra o seu grupo de segurança associado.",
        "Cada grupo de segurança tem, no mínimo, uma regra de permissão específica e uma negação explícita com prioridade inferior a 65000.",
        "Teste positivo: a sessão de acesso remoto a partir da sala estabelece-se e o comando responde.",
        "Teste negativo: a avaliação de regras do portal devolve «negado» para a porta 22 vinda de origem não autorizada e nomeia a regra responsável.",
        "Sub-rede de dados: regras e associação revistas no portal. A conectividade fica assinalada como NÃO TESTADA, por não existir máquina de destino nesta sessão.",
        "Nenhuma regra de PERMISSÃO tem origem «qualquer» ou 0.0.0.0/0 numa porta administrativa. As regras de negação podem e devem ter origem qualquer — é essa a sua função.",
        "A interface de rede da máquina não tem grupo de segurança próprio associado.",
      ],
      problemas: [
        "Regra criada mas sem efeito: confirmar a associação do grupo de segurança à sub-rede e verificar se alguma regra de número menor corresponde primeiro ao mesmo tráfego.",
        "Base de dados alcançável de outra sub-rede apesar da regra de permissão: falta a negação explícita; as regras por omissão permitem o tráfego interno da rede virtual.",
        "Máquina criada fora da sub-rede pretendida: não se resolve movendo a interface de rede para outra rede virtual, porque isso não é possível; apaga-se a máquina com o disco e a interface e cria-se de novo na sub-rede certa.",
        "Sessão remota falha depois de tudo configurado: distinguir causas — regra, serviço parado, chave errada ou endereço de saída da sala alterado. A avaliação de regras do portal diz se o problema é de filtragem.",
        "Endereço de saída da sala muda durante a sessão, o que é comum em ligações móveis: pedir o novo endereço ao formador e actualizar a regra, nunca alargá-la.",
      ],
      evidencia: [
        "Captura de ecrã das três sub-redes com os intervalos e os grupos de segurança associados.",
        "Captura de ecrã das regras de entrada de cada grupo, mostrando prioridades, origens restritas e a negação explícita.",
        "Captura de ecrã do resultado da avaliação de fluxo para a porta 22 de origem não autorizada, com a regra que decidiu, ou registo de «teste pendente» se a ferramenta não estiver disponível.",
        "Captura de ecrã das regras e da associação do grupo da sub-rede de dados, identificada como revisão de configuração e não como teste de conectividade.",
        "Captura de ecrã do comando executado na sessão remota, sem conteúdo sensível.",
        "Ficha com hora de eliminação, lista de recursos apagados e nome de quem executou cada parte.",
      ],
      limpeza: [
        "Apagar por ordem de dependências, tudo dentro do grupo de recursos do exercício: primeiro a máquina virtual, depois o disco e a interface de rede que lhe pertencem, depois o endereço público.",
        "Remover as associações dos grupos de segurança às sub-redes e apagar os três grupos de segurança.",
        "Apagar por fim a rede virtual, que não pode ser apagada enquanto tiver interfaces ligadas.",
        "Conferir que ficaram apenas os recursos partilhados que já existiam antes da sessão, se os houver, e comunicar ao formador o que foi apagado.",
      ],
    },
    sintese: [
      "A rede cria-se primeiro e as máquinas nascem dentro dela: a interface de rede não muda de rede virtual depois.",
      "As sub-redes separam aplicação, dados e administração; o plano de endereços decide-se antes e não pode colidir com a rede da instituição.",
      "As regras por omissão permitem o tráfego dentro da rede virtual: permitir a aplicação não chega, é preciso negar explicitamente o resto.",
      "As prioridades mandam: permissões em números baixos, negação explícita antes das omissões.",
      "Nunca se abre a porta administrativa a qualquer origem; neste laboratório só o endereço de saída da sala.",
      "Tempo de espera esgotado não prova filtragem: confirma-se com teste positivo e com a avaliação de regras do portal.",
    ],
    verificacao: [
      {
        pergunta:
          "Numa sub-rede de dados existe apenas uma regra que permite a porta da base de dados vinda da sub-rede de aplicação. O resto do tráfego interno fica bloqueado?",
        resposta:
          "Não. A regra por omissão de prioridade 65000 permite o tráfego vindo da própria rede virtual, por isso é preciso uma negação explícita com prioridade inferior a esse número.",
        feedback:
          "É o erro mais comum nestas configurações e não aparece em testes feitos a partir da máquina certa — só a partir das outras.",
      },
      {
        pergunta:
          "A tentativa de ligação ficou à espera e expirou. Isso prova que a regra de segurança está a funcionar?",
        resposta:
          "Não. Pode ser serviço parado, porta errada, máquina desligada ou encaminhamento. Confirma-se com a avaliação de regras do portal, que nomeia a regra que decidiu.",
        feedback:
          "Vale a pena distinguir sempre: regra desenhada, regra configurada e ligação testada são três coisas diferentes.",
      },
    ],
    referencias: [
      {
        titulo: "Azure — Quickstart: criar uma rede virtual",
        url: "https://learn.microsoft.com/en-us/azure/virtual-network/quickstart-create-virtual-network",
        consultadoEm: "21 de Setembro de 2026",
      },
      {
        titulo: "Azure — Descrição geral dos grupos de segurança de rede, incluindo as regras por omissão",
        url: "https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview",
        consultadoEm: "21 de Setembro de 2026",
      },
      {
        titulo: "Azure — Quickstart: criar uma máquina virtual Linux no portal",
        url: "https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal",
        consultadoEm: "21 de Setembro de 2026",
      },
    ],
    guiao: {
      preparacao: [
        "Apurar e escrever no quadro o endereço público de saída da sala, antes da sessão, e prever que pode mudar.",
        "Confirmar a subscrição de formação, o grupo de recursos do exercício, o orçamento, os alertas e a lista de tamanhos de máquina autorizados. Nada do lado da Amazon é necessário nesta lição.",
        "Recolher as fichas de preparação da lição anterior e confirmar que estão completas antes de abrir o laboratório.",
        "Distribuir a tabela de regras em branco, com coluna de prioridade bem visível.",
        "Preparar antes da sessão a ferramenta de avaliação de fluxo e as permissões que ela exige, para que os participantes não tenham de activar nada fora do grupo de recursos.",
        "Reservar os últimos 10 minutos para a limpeza por ordem de dependências, verificada recurso a recurso.",
        "Executar o percurso sozinho antes da aula: este guião ainda não foi executado.",
      ],
      conducao: [
        "Acolhimento, explicação da ordem — rede primeiro, máquina depois — e objectivos.",
        "Exposição de redes virtuais, sub-redes, plano de endereços, prioridades, regras por omissão que permitem tráfego interno, negação explícita e formas de verificar.",
        "Actividade: 10 minutos de plano em papel, 35 minutos de laboratório com troca de executante a meio, e 10 minutos de limpeza verificada.",
        "Partilha por amostra: dois pares apresentam 3 minutos cada, com 1 minuto de comentário, e 2 minutos de síntese. As tabelas de regras dos restantes pares são recolhidas para apreciação escrita.",
      ],
      criterios: [
        "O plano de endereços não tem sobreposições e a tabela de regras indica prioridades coerentes.",
        "Cada grupo de segurança tem permissão específica e negação explícita, e está associado à sub-rede certa.",
        "A máquina foi criada dentro da sub-rede de aplicação, sem portas abertas pelo assistente.",
        "Existem teste positivo e teste negativo documentados na interface da máquina, este último com a regra que decidiu, ou registo honesto de teste pendente.",
        "A sub-rede de dados está descrita como configuração revista e conectividade não testada, sem afirmação de êxito.",
        "A limpeza respeita a ordem de dependências e está registada.",
      ],
      errosComuns: [
        "Criar a máquina antes da rede e ficar sem forma de a mudar de rede virtual.",
        "Concluir que o tráfego interno está bloqueado só porque existe uma regra de permissão específica.",
        "Aceitar a abertura de porta proposta pelo assistente de criação da máquina, ou deixar um segundo grupo de segurança na interface de rede, que se acumula com o da sub-rede.",
        "Dar por testada a filtragem da sub-rede de dados quando não existe nenhuma máquina lá dentro.",
        "Dar por provada a filtragem com um tempo de espera esgotado.",
        "Apagar a rede virtual antes da máquina e das interfaces, e concluir que «não deixa apagar».",
      ],
    },
  },
  m2l3: {
    objectivos: [
      "Distinguir uma base de dados instalada numa máquina virtual de uma base de dados gerida pelo fornecedor, indicando o que muda em responsabilidade e em trabalho.",
      "Explicar o que a plataforma como serviço assume por nós e o que continua do nosso lado.",
      "Publicar uma aplicação simples numa plataforma como serviço, no ambiente de formação, verificando o resultado e apagando o que foi criado.",
    ],
    explicacao: [
      "Uma base de dados pode correr de duas maneiras na nuvem. Instalada por nós numa máquina virtual, damos-lhe a versão que quisermos e mandamos em tudo — e ficamos com as actualizações, as cópias de segurança, a alta disponibilidade e a afinação a nosso cargo. Gerida pelo fornecedor, recebemos um ponto de ligação e o fornecedor trata do sistema operativo, das actualizações do motor, das cópias automáticas e, se for contratado, da réplica noutra zona. Continua a ser nossa a modelação dos dados, o desempenho das consultas, quem tem acesso e o cumprimento das regras de protecção de dados.",
      "A escolha entre relacional e não relacional mantém-se igual à de sempre: dados com estrutura estável e necessidade de consistência forte — processos, licenças, pagamentos — pedem base relacional; dados de forma variável e volume grande — registos de eventos, documentos, leituras de sensores — encaixam melhor em bases não relacionais. Na nuvem os dois tipos existem em versão gerida.",
      "A plataforma como serviço aplica a mesma ideia à aplicação. Entrega-se o código e a plataforma trata do servidor, do sistema operativo, do servidor de aplicação e do certificado de segurança do endereço, além de permitir aumentar o número de instâncias quando a procura sobe. Do nosso lado ficam o código, a configuração da aplicação, os segredos — que não vão no código, mas na configuração do serviço ou num cofre de segredos — e as ligações à base de dados. Para equipas pequenas costuma dar mais resultado por menos trabalho, e por isso interessa a serviços públicos com poucas pessoas na área informática — mas não é vantajoso em todos os casos: depende dos limites da plataforma e do plano contratado.",
      "As limitações também se devem conhecer. A plataforma impõe versões de linguagem suportadas, tempos máximos de resposta, e por vezes não permite instalar componentes de sistema. Uma aplicação antiga pode não caber sem alterações. É aí que entra a modernização: dividir a aplicação em partes independentes, os microserviços, trocar componentes locais por serviços geridos, e adoptar práticas de integração e entrega contínuas, em que cada alteração é construída e publicada por um processo automático e repetível. Modernizar tem custo e risco, e faz-se por etapas — nunca é obrigatório modernizar tudo para começar a usar nuvem.",
      "Uma nota sobre custos que vale para todo o módulo: o custo depende do plano contratado e há planos em que a capacidade fica reservada, consumindo mesmo com pouco tráfego. Verifica-se antes, no plano concreto, em vez de assumir. Nada é prometido como gratuito e, no laboratório, o que se cria é apagado no fim.",
    ],
    exemplo: {
      titulo: "A consulta pública de estado do processo, em Ondela (cenário fictício)",
      corpo: [
        "Ondela quer uma página onde o munícipe introduz o número do processo e vê o estado: recebido, em análise, deferido ou indeferido. Não há dados pessoais na resposta, apenas o estado.",
        "A equipa decide publicar essa página numa plataforma como serviço, ligada a uma base de dados gerida onde os estados são actualizados pelo sistema interno. O sistema interno, mais antigo, continua onde está: não é preciso modernizar tudo para pôr esta consulta no ar.",
        "Ficam definidos três pontos antes de avançar: quem pode alterar os estados, quanto tempo ficam guardados os registos de acesso e o que acontece à consulta quando a ligação do distrito cai. Cenário fictício, para exercício.",
      ],
    },
    actividade: {
      formato:
        "nos mesmos pares, um computador por par e alternância de quem executa; havendo equipamento, um computador por pessoa, conforme o máximo de dois formandos por computador fixado no Termo de Referência",
      enunciado: [
        "Primeira parte, em papel, 10 minutos: para a consulta de estado de Ondela, escrevam o que fica do lado do fornecedor e o que fica do lado da instituição, em duas colunas, incluindo segredos, cópias de segurança e controlo de acesso.",
        "Segunda parte, no ambiente de formação, 45 minutos: executar o laboratório de publicação de uma aplicação simples numa plataforma como serviço, trocando de executante a meio.",
        "Terceira parte, dentro do tempo de laboratório: apagar o que foi criado, pela ordem de dependências, e registar a eliminação.",
      ],
      produto:
        "tabela de responsabilidades partilhadas e evidência da aplicação a responder e depois eliminada, com o endereço público, as horas e o registo de quem executou cada metade.",
    },
    laboratorio: {
      titulo: "Publicar uma aplicação simples numa plataforma como serviço",
      percurso:
        "Azure App Service, em Linux, com a aplicação Node.js mínima fornecida com este curso. Método único de publicação: linha de comandos do Azure, com implantação a partir de ficheiro comprimido.",
      preRequisitos: [
        "Conta institucional de formação com limites de consumo e alertas definidos pelo formador, e grupo de recursos do exercício criado.",
        "Microsoft Azure — subscrição institucional de formação e grupo de recursos do exercício, com utilizador de formação limitado a esse grupo de recursos. Nada é necessário do lado da Amazon nesta lição.",
        "Aplicação de exemplo já disponível nesta plataforma, para descarregar: os ficheiros index.js e package.json estão em /exemplos/paas-node/index.js e /exemplos/paas-node/package.json. Usam apenas o módulo http do Node.js, sem dependências a instalar, sem base de dados, sem dados de pessoas e sem segredos no código. O código completo está transcrito mais abaixo.",
        "Linha de comandos do Azure instalada e sessão iniciada com a conta institucional de formação, feita pelo formador antes da sessão. Não se usam tokens, nem credenciais de publicação, nem autenticação básica.",
        "Programa para criar ficheiros comprimidos, disponível no sistema operativo da sala.",
        "Nenhum participante associa cartão de pagamento nem cria subscrição própria. O escalão de serviço a usar é o indicado pelo formador; o material não promete gratuitidade.",
        "Se a turma não tiver ambiente de desenvolvimento, o formador disponibiliza o código já preparado num arquivo, para carregamento directo.",
      ],
      codigo: [
        {
          ficheiro: "index.js",
          descarregarEm: "/exemplos/paas-node/index.js",
          corpo: "// Exemplo mínimo para o laboratório de plataforma como serviço.\n// Proposta pedagógica — por validar pela Ologa/ATDI. Sem dependências externas.\n// Usa apenas o módulo http do Node.js.\n\nconst http = require(\"http\");\n\nconst port = process.env.PORT || 8080;\nconst mensagem = process.env.MENSAGEM_EXEMPLO || \"Mensagem por definir na configuração do serviço.\";\n\nconst servidor = http.createServer((pedido, resposta) => {\n  // Registo mínimo: apenas o método HTTP. Não regista o caminho nem os\n  // parâmetros do endereço, que podem conter dados pessoais; não regista\n  // cabeçalhos, corpo, endereços nem qualquer dado que possa identificar\n  // uma pessoa.\n  console.log(pedido.method);\n\n  resposta.writeHead(200, { \"Content-Type\": \"text/plain; charset=utf-8\" });\n  resposta.end(\n    \"Laboratório de plataforma como serviço — exemplo de formação.\\n\" +\n      `Mensagem configurada: ${mensagem}\\n`,\n  );\n});\n\n// Escuta em todas as interfaces: exigido pela plataforma.\nservidor.listen(port, \"0.0.0.0\", () => {\n  console.log(`Servidor de exemplo à escuta na porta ${port}`);\n});\n",
        },
        {
          ficheiro: "package.json",
          descarregarEm: "/exemplos/paas-node/package.json",
          corpo: "{\n  \"name\": \"exemplo-paas-formacao\",\n  \"version\": \"1.0.0\",\n  \"private\": true,\n  \"description\": \"Exemplo mínimo de aplicação Node.js para o laboratório de plataforma como serviço do curso Computação em Nuvem.\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"start\": \"node index.js\"\n  },\n  \"engines\": {\n    \"node\": \">=20\"\n  },\n  \"dependencies\": {}\n}\n",
        },
      ],
      passos: [
        "Teste local, antes de qualquer publicação: descarregar os dois ficheiros do exemplo, colocá-los numa pasta e executar «node index.js». Abrir http://localhost:8080 e confirmar a resposta. Parar, executar de novo definindo a variável MENSAGEM_EXEMPLO e confirmar que o texto muda. Este teste é local e não usa nuvem nenhuma; serve para separar problemas do código de problemas da publicação.",
        "No portal do Azure, dentro do grupo de recursos do exercício, criar uma aplicação Web indicando pilha de execução Node.js e sistema operativo Linux, com nome que identifique a turma e o grupo.",
        "Escolher o plano de serviço indicado pelo formador e a região combinada. Não subir de escalão por iniciativa própria.",
        "Rever e criar. Esperar pela conclusão e abrir a página do recurso.",
        "Preparar o ficheiro comprimido: colocar index.js e package.json numa pasta vazia e comprimir os DOIS ficheiros de forma a ficarem na raiz do arquivo, e não dentro de uma subpasta. Verificar a listagem do arquivo antes de publicar.",
        "Publicar com um único comando, a partir da pasta onde está o arquivo: az webapp deploy --resource-group <grupo-de-recursos> --name <nome-da-aplicacao> --src-path exemplo-paas.zip --type zip",
        "Confirmar nas definições gerais da aplicação que a versão de Node.js corresponde à indicada no package.json e que o comando de arranque é «node index.js». O arquivo publicado não é construído automaticamente, por isso a aplicação tem de correr tal como está — é por essa razão que o exemplo não tem dependências a instalar.",
        "Abrir o endereço público atribuído à aplicação e confirmar que a página responde.",
        "Nas definições da aplicação, criar a variável de configuração MENSAGEM_EXEMPLO com um valor fictício, guardar, aguardar o reinício e recarregar a página: o texto apresentado muda. A variável não é segredo, mas demonstra o mecanismo — é assim que se tratam também as palavras-passe, fora do código.",
        "Confirmar nos registos da aplicação que o pedido feito no navegador aparece registado.",
        "Registar na ficha o endereço público, a hora da publicação e o escalão usado.",
        "Limpeza: apagar a aplicação Web. Quanto ao plano de serviço, apagar apenas se tiver sido criado para este exercício; se for partilhado ou já existisse, NÃO se apaga e regista-se na ficha. O plano continua a consumir mesmo sem aplicação, por isso o formador confirma no fim que não ficou nenhum plano exclusivo esquecido.",
      ],
      verificacao: [
        "O endereço público da aplicação abre no navegador e mostra a página de exemplo.",
        "A variável de configuração definida no portal é visível no comportamento da aplicação, sem constar do código.",
        "Os registos mostram o pedido correspondente ao acesso feito.",
        "Depois da limpeza, o endereço deixa de responder e o grupo de recursos do exercício fica apenas com os recursos partilhados que já lá estavam antes da sessão, se existirem.",
      ],
      problemas: [
        "Nome de aplicação já usado: o endereço é único; acrescentar o código da turma e do grupo.",
        "A página mostra erro de aplicação: quase sempre falta o ficheiro de arranque esperado ou a pilha de execução escolhida não corresponde ao código; verificar os registos antes de repetir a publicação.",
        "Publicação concluída mas página antiga: aguardar o reinício da aplicação ou forçá-lo; não publicar várias vezes seguidas às cegas.",
        "Escalão indisponível na região: escolher outra região da lista autorizada, mantendo o mesmo escalão.",
        "Plano de serviço esquecido depois de apagar a aplicação: é um recurso separado; se foi criado só para este exercício, apaga-se também.",
        "Comando recusado por falta de sessão: a sessão da linha de comandos é iniciada pelo formador com a conta institucional; os participantes não introduzem credenciais próprias.",
        "Arquivo com uma pasta a envolver os ficheiros: a aplicação não arranca; recriar o arquivo com index.js e package.json na raiz.",
      ],
      evidencia: [
        "Captura de ecrã da execução local do exemplo, antes de qualquer publicação.",
        "Captura de ecrã da página publicada, com o endereço visível.",
        "Captura de ecrã das definições de configuração mostrando a variável de exemplo, com valores fictícios apenas.",
        "Captura de ecrã da lista de recursos depois da limpeza, mostrando que a aplicação já não consta; se o plano de serviço era exclusivo do exercício, a captura mostra também que ele já não consta.",
        "Linha na ficha com endereço, escalão, hora de publicação e hora de eliminação.",
      ],
      limpeza: [
        "Apagar por ordem de dependências, apenas no Azure e apenas os recursos deste exercício: primeiro a aplicação Web, que depende do plano de serviço.",
        "Apagar o plano de serviço apenas se tiver sido criado para este exercício. Se o plano for partilhado com outros grupos ou já existisse, NÃO se apaga; regista-se na ficha que ficou por ser partilhado.",
        "Conferir que no grupo de recursos do exercício ficaram apenas os recursos partilhados anteriores à sessão, e registar o que foi apagado.",
      ],
    },
    sintese: [
      "Base de dados gerida: o fornecedor trata do motor e das cópias; nós tratamos dos dados, dos acessos e das consultas.",
      "Plataforma como serviço: entregamos código, a plataforma trata do servidor e do certificado do endereço.",
      "Os segredos ficam na configuração do serviço ou num cofre, nunca no código.",
      "A plataforma impõe limites, como versões suportadas; aplicações antigas podem precisar de alterações.",
      "Modernizar — microserviços, serviços geridos, entrega automática — faz-se por etapas e não é condição para começar.",
      "Conforme o plano, a capacidade pode ficar reservada e consumir mesmo sem tráfego: verifica-se antes, e no exercício apaga-se o que foi criado, incluindo o plano se tiver sido criado para o exercício.",
    ],
    verificacao: [
      {
        pergunta:
          "Com uma base de dados gerida, deixamos de ser responsáveis pela protecção dos dados pessoais que lá estão?",
        resposta:
          "Não. O fornecedor trata da infra-estrutura e do motor; a instituição continua responsável pelos dados, por quem lhes acede e pelo cumprimento das regras aplicáveis.",
        feedback:
          "Esta é a linha de responsabilidade partilhada que já apareceu no módulo 1 e que volta no módulo sobre protecção de dados.",
      },
      {
        pergunta:
          "Onde deve ficar a palavra-passe de ligação à base de dados numa aplicação publicada em plataforma como serviço?",
        resposta:
          "Na configuração do serviço ou num cofre de segredos, nunca escrita no código nem no material de formação.",
        feedback:
          "Segredos no código acabam quase sempre em repositórios partilhados, e a partir daí deixam de ser segredos.",
      },
    ],
    referencias: [
      {
        titulo: "Azure App Service — Quickstart: criar uma aplicação Web Node.js",
        url: "https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs",
        consultadoEm: "21 de Setembro de 2026",
      },
      {
        titulo: "Azure App Service — Implantar ficheiros comprimidos (nota: o envio pela interface Kudu não funciona em Linux e o arquivo não é construído por defeito)",
        url: "https://learn.microsoft.com/en-us/azure/app-service/deploy-zip",
        consultadoEm: "21 de Setembro de 2026",
      },
    ],
    guiao: {
      preparacao: [
        "Iniciar sessão na linha de comandos do Azure com a conta institucional antes da sessão, e confirmar que os participantes não precisam de introduzir credenciais.",
        "Descarregar os ficheiros do exemplo desta plataforma, executá-los localmente uma vez e confirmar a versão de Node.js e o comando de arranque configurados na aplicação Web.",
        "Organizar a sala em pares, com alternância de executante; se o ambiente falhar, registar a prática como pendente e reagendar, em vez de a substituir por demonstração.",
        "Indicar por escrito o escalão de serviço e a região autorizados, e não deixar a escolha aos grupos.",
        "Confirmar os limites de consumo e alertas da conta de formação antes de abrir o exercício.",
        "Reservar os últimos minutos do laboratório para apagar a aplicação e, apenas quando o plano de serviço tiver sido criado para o exercício, também o plano, com verificação recurso a recurso.",
        "Executar o percurso sozinho antes da aula: este guião ainda não foi executado.",
      ],
      conducao: [
        "Acolhimento, ligação às duas lições anteriores — já temos máquina e rede, agora vemos o caminho com menos gestão — e objectivos.",
        "Exposição de bases de dados geridas, plataforma como serviço, fronteira de responsabilidades, limites da plataforma e modernização por etapas.",
        "Actividade: 10 minutos de tabela de responsabilidades e 45 minutos de laboratório, com troca de executante a meio e limpeza incluída e verificada.",
        "Partilha por amostra: dois grupos apresentam 3 minutos cada, com 1 minuto de comentário, e 2 minutos de síntese. As tabelas dos restantes grupos são recolhidas para apreciação escrita.",
      ],
      criterios: [
        "A tabela separa correctamente o que é do fornecedor e o que é da instituição, incluindo segredos e acessos.",
        "A aplicação foi publicada e o endereço respondeu com o conteúdo do exemplo, com evidência recolhida, e ambas as pessoas do par executaram parte dos passos.",
        "A variável de configuração foi usada em vez de valor escrito no código.",
        "A limpeza inclui o plano de serviço quando foi criado para o exercício, e está registada.",
      ],
      errosComuns: [
        "Apagar o plano de serviço partilhado por outros grupos, ou esquecer o plano criado só para o exercício.",
        "Escrever valores sensíveis, ainda que fictícios, no código do exemplo.",
        "Concluir que a plataforma serve para tudo, sem verificar versões e limites.",
        "Confundir modernizar com refazer: a modernização faz-se por etapas.",
      ],
    },
  },
  m2l4: {
    objectivos: [
      "Distinguir disponibilidade, cópia de segurança e recuperação de desastre, e explicar porque é que uma não substitui a outra.",
      "Definir, para um serviço concreto, o tempo máximo de paragem aceitável e a perda máxima de dados aceitável.",
      "Elaborar um plano de cópias e um procedimento de restauro testável, com responsáveis e periodicidade.",
    ],
    explicacao: [
      "Três conceitos costumam ser confundidos. Disponibilidade é a capacidade de o serviço continuar a responder quando uma peça falha: consegue-se com várias instâncias, distribuídas por zonas diferentes, com um distribuidor de carga à frente. Cópia de segurança é a existência de uma versão anterior dos dados, que permite voltar atrás quando alguém apaga ou corrompe informação. Recuperação de desastre é a capacidade de repor o serviço inteiro noutro sítio quando o primeiro deixa de existir. Ter três instâncias da aplicação não protege contra alguém apagar a tabela de processos; ter cópias diárias não evita que o serviço esteja em baixo durante a manhã.",
      "Para planear, usam-se duas medidas. A primeira é o tempo máximo de paragem aceitável: quanto tempo pode o serviço estar indisponível sem consequência inaceitável. A segunda é a perda máxima de dados aceitável: quanto trabalho se admite perder, medido em tempo — uma hora, um dia. Estas duas medidas não são escolhas técnicas: são decisões de quem dirige o serviço, porque determinam custo. Um serviço que admite meio dia de paragem e uma hora de perda tem um desenho muito mais barato do que um que não admite paragem nenhuma.",
      "Do lado técnico, os instrumentos habituais são: várias instâncias em zonas diferentes da mesma região, para falhas locais; réplica noutra região, para desastre; cópias automáticas com retenção definida, para erro humano; e versões de objectos no armazenamento, para recuperar ficheiros apagados. Muitos serviços geridos oferecem cópias automáticas com um período de retenção, mas o período por omissão pode não corresponder ao que a instituição precisa — e a retenção por omissão nunca deve ser assumida sem verificação.",
      "Há uma regra que vale mais do que toda a tecnologia: uma cópia de segurança que nunca foi restaurada não é uma cópia de segurança, é uma esperança. O restauro tem de ser ensaiado, com periodicidade definida, para um ambiente separado, e o ensaio tem de ser registado: quem fez, quando, quanto tempo demorou e o que correu mal. É esse registo que permite dizer, com honestidade, quanto tempo demora a repor o serviço.",
      "Por fim, o plano tem de prever a comunicação. Quando um serviço público pára, as pessoas continuam a precisar dele. Saber quem avisa, por que meio e o que se faz manualmente enquanto o sistema não volta é parte do plano, e não um detalhe administrativo. Em contextos com ligação intermitente, o procedimento manual de recurso é especialmente importante.",
    ],
    exemplo: {
      titulo: "A manhã em que o portal de Ondela ficou em baixo (cenário fictício)",
      corpo: [
        "Numa terça-feira de manhã, o portal de licenciamento de Ondela deixa de responder. A equipa descobre que uma actualização mal sucedida corrompeu parte dos dados às 22 horas do dia anterior.",
        "A cópia automática mais recente é das 20 horas. Restaurar significa perder duas horas de registos, que terão de ser reintroduzidos a partir dos formulários em papel. O restauro demora 40 minutos, mas ninguém tinha ensaiado antes e passa-se mais uma hora a perceber o procedimento.",
        "Na revisão, o serviço define: perda máxima aceitável de uma hora, o que obriga a cópias de hora a hora; tempo máximo de paragem de duas horas; ensaio de restauro trimestral com registo; e um procedimento em papel para o atendimento continuar enquanto o sistema não volta. Cenário fictício, para exercício.",
      ],
    },
    actividade: {
      formato: "em grupos de quatro",
      enunciado: [
        "Escolham um serviço da vossa instituição, real na função mas descrito sem dados de pessoas.",
        "Definam e justifiquem o tempo máximo de paragem aceitável e a perda máxima de dados aceitável, dizendo quem, na instituição, tem competência para aprovar esses valores.",
        "Escrevam o plano de cópias: o que se copia, com que periodicidade, quanto tempo se guarda, onde fica guardado e quem verifica que a cópia foi feita.",
        "Escrevam o procedimento de restauro em passos numerados, incluindo como se confirma que o restauro correu bem, e marquem no calendário o primeiro ensaio.",
        "Acrescentem meia página de plano de comunicação e de recurso manual: quem avisa, por que meio, e o que o atendimento faz enquanto o serviço não volta.",
      ],
      produto:
        "plano de continuidade de duas páginas com as duas medidas justificadas, plano de cópias, procedimento de restauro numerado e plano de comunicação e recurso manual.",
    },
    sintese: [
      "Disponibilidade é continuar a responder; cópia é poder voltar atrás; recuperação de desastre é repor noutro sítio. São três coisas diferentes.",
      "Decidir quanto tempo o serviço pode estar parado e quanto trabalho se pode perder é decisão de direcção, porque determina o custo.",
      "Cópia que nunca foi restaurada não conta: o ensaio de restauro faz-se com periodicidade e fica registado.",
      "A retenção por omissão do fornecedor pode não servir; verifica-se sempre.",
      "O plano inclui avisar as pessoas e ter um procedimento manual enquanto o serviço não volta.",
    ],
    verificacao: [
      {
        pergunta:
          "Um serviço corre em três instâncias, em zonas diferentes. Está protegido contra a eliminação acidental de uma tabela de dados?",
        resposta:
          "Não. Várias instâncias protegem contra falha de infra-estrutura, não contra erro humano nos dados. Para isso é preciso cópia de segurança com retenção.",
        feedback:
          "As três instâncias replicariam a eliminação de imediato. É exactamente por isso que disponibilidade e cópia são planeadas em separado.",
      },
      {
        pergunta:
          "Quem deve decidir que o serviço pode estar parado no máximo duas horas?",
        resposta:
          "A direcção responsável pelo serviço, porque é uma decisão sobre risco e custo, informada pela equipa técnica.",
        feedback:
          "Quando esta decisão fica implícita, acaba por ser tomada por omissão, e descobre-se o valor real no dia da avaria.",
      },
    ],
    guiao: {
      preparacao: [
        "Imprimir a grelha do plano de continuidade, uma por grupo, com espaço para as duas medidas, o plano de cópias, o restauro e a comunicação.",
        "Preparar dois exemplos contrastantes para a exposição: um serviço que admite meio dia de paragem e outro que não admite nenhuma.",
        "Combinar com os grupos que nenhum serviço é descrito com dados de pessoas.",
        "Não há laboratório nesta lição: o tempo de actividade é integralmente de trabalho de planeamento em grupo.",
      ],
      conducao: [
        "Acolhimento, retoma do que já foi criado nas três lições anteriores e objectivos desta.",
        "Exposição dos três conceitos, das duas medidas, dos instrumentos técnicos e da regra do ensaio de restauro.",
        "Actividade em grupos de quatro: elaboração do plano de continuidade, com o formador a circular e a desafiar valores irrealistas.",
        "Partilha por amostra: dois grupos apresentam 3 minutos cada, com 1 minuto de comentário, e 2 minutos de síntese. Os planos dos restantes grupos são recolhidos para apreciação escrita.",
      ],
      criterios: [
        "As duas medidas estão quantificadas e justificadas, e está identificado quem as aprova.",
        "O plano de cópias diz o que, quando, onde, por quanto tempo e quem verifica.",
        "O procedimento de restauro está em passos numerados e inclui como confirmar que correu bem.",
        "Existe plano de comunicação e procedimento manual de recurso.",
      ],
      errosComuns: [
        "Escrever «sem paragem e sem perda» sem considerar o custo que isso implica.",
        "Confundir replicação com cópia de segurança.",
        "Guardar a cópia no mesmo sítio do original.",
        "Planear cópias e nunca ensaiar restauros.",
      ],
    },
  },
  m2l5: {
    objectivos: [
      "Desenhar uma arquitectura simples para um serviço público, indicando componentes, fluxos e fronteiras de segurança.",
      "Justificar, em cada componente, a escolha entre máquina virtual, contentor, execução sem servidor e serviço gerido.",
      "Identificar onde entram microserviços, práticas cloud-native e entrega automática, e o que fica para uma etapa posterior de modernização.",
    ],
    explicacao: [
      "Desenhar uma arquitectura é responder, por escrito, a cinco perguntas: que componentes existem, por onde entra o pedido, onde ficam os dados, que fronteiras de segurança separam as partes e o que acontece quando uma parte falha. Um desenho que não responda a estas cinco perguntas é um diagrama bonito, não uma arquitectura.",
      "A arquitectura mais comum num serviço público simples tem quatro camadas: entrada — o endereço público, com certificado e, se necessário, filtragem de pedidos; aplicação — uma ou mais instâncias, em plataforma como serviço ou em contentores; dados — base de dados gerida numa sub-rede privada, sem endereço público; e armazenamento de objectos, privado, para documentos e digitalizações. Entre camadas, regras de permissão mínima, como se viu na lição de redes.",
      "Microserviços são a divisão da aplicação em partes pequenas e independentes, cada uma com a sua responsabilidade e o seu ritmo de actualização. Resolvem problemas de equipas grandes e de sistemas que crescem; introduzem em troca complexidade de comunicação, de observação e de resolução de problemas. Para um serviço distrital com uma aplicação e duas pessoas na informática, uma aplicação única bem organizada é normalmente a decisão certa, e dividir só quando houver razão concreta.",
      "Cloud-native descreve o estilo de construir para este ambiente: componentes substituíveis, configuração fora do código, estado guardado em serviços próprios e não no disco da máquina, e capacidade de arrancar mais instâncias sem intervenção manual. DevOps é a prática de trabalho que acompanha: mesma equipa responsável por construir e por manter, alterações pequenas e frequentes, e um processo automático que constrói, testa e publica sempre da mesma maneira. O ganho não é a moda: é que a publicação deixa de depender da memória de uma pessoa.",
      "A modernização faz-se por etapas e cada etapa tem de valer por si. Uma sequência frequente: primeiro mover a aplicação como está, depois trocar componentes instalados por serviços geridos, depois automatizar a publicação, e só então, se houver razão, separar partes em serviços independentes. Escrever a ordem das etapas, com o benefício esperado de cada uma, é tão importante como o desenho final — e evita a promessa de que tudo muda ao mesmo tempo.",
      "Por último, o desenho tem de dizer o que fica de fora. Um bom documento de arquitectura tem uma secção de pressupostos e outra de pontos por apurar: ligação disponível no local, volume esperado, exigências de localização dos dados, competências da equipa. Nenhum deles é detalhe técnico — todos podem inverter a decisão.",
    ],
    exemplo: {
      titulo: "Arquitectura da consulta de processos de Ondela (cenário fictício)",
      corpo: [
        "Entrada: endereço público com certificado, apenas para a página de consulta. Aplicação: uma aplicação única em plataforma como serviço, com duas instâncias. Dados: base de dados gerida em sub-rede privada, sem endereço público, acessível apenas a partir da sub-rede da aplicação. Documentos: armazenamento de objectos privado, com acesso concedido à aplicação e a mais ninguém.",
        "Falhas previstas: se uma instância cair, a outra responde; se a base de dados falhar, a página mostra aviso e o atendimento passa ao procedimento manual; se a ligação do distrito cair, a consulta interna fica indisponível e o balcão usa a listagem impressa do dia.",
        "Etapas de modernização propostas: primeiro publicar a consulta; depois automatizar a publicação; só mais tarde, se o volume crescer, separar a componente de digitalizações. Pressupostos por confirmar: volume diário de consultas e exigências sobre onde os dados podem residir. Cenário fictício, para exercício.",
      ],
    },
    actividade: {
      formato: "em grupos de quatro, com apresentação por amostra",
      enunciado: [
        "Escolham um dos dois casos fictícios propostos pelo formador, ou o serviço que trabalharam na lição anterior.",
        "Desenhem a arquitectura em papel A3: componentes, setas de fluxo, fronteiras de rede e o que é privado.",
        "Numa folha à parte, justifiquem cada componente — porquê máquina virtual, contentor, execução sem servidor ou serviço gerido — em uma linha cada.",
        "Escrevam as etapas de modernização por ordem, com o benefício esperado de cada uma, e a secção de pressupostos e pontos por apurar.",
        "Verifiquem o desenho contra as cinco perguntas da exposição, e corrijam o que faltar.",
      ],
      produto:
        "desenho de arquitectura em A3, folha de justificações por componente, lista ordenada de etapas de modernização e secção de pressupostos e pontos por apurar.",
    },
    sintese: [
      "Uma arquitectura responde a cinco perguntas: que componentes, por onde entra, onde ficam os dados, que fronteiras e o que falha.",
      "O desenho simples tem quatro camadas: entrada, aplicação, dados privados e armazenamento de objectos privado.",
      "Microserviços resolvem problemas de escala e de equipa; para serviços pequenos, uma aplicação única bem organizada costuma bastar.",
      "Cloud-native e DevOps significam configuração fora do código, estado fora da máquina e publicação automática e repetível.",
      "A modernização faz-se por etapas, cada uma com benefício próprio.",
      "Um bom documento diz também o que ainda não se sabe.",
    ],
    verificacao: [
      {
        pergunta:
          "Um serviço distrital com uma aplicação e duas pessoas na informática deve começar por dividir o sistema em microserviços?",
        resposta:
          "Normalmente não. A divisão acrescenta complexidade de comunicação e de manutenção; justifica-se quando há razão concreta, como partes com ritmos de mudança muito diferentes.",
        feedback:
          "A decisão certa depende do problema a resolver, e não da modernidade do vocabulário.",
      },
      {
        pergunta:
          "Porque é que a base de dados não deve ter endereço público, mesmo com palavra-passe forte?",
        resposta:
          "Porque a exposição amplia a superfície de ataque sem necessidade: o acesso deve vir apenas da sub-rede da aplicação, por regra de permissão mínima.",
        feedback:
          "É a mesma regra da lição de redes, aplicada agora ao desenho global.",
      },
    ],
    guiao: {
      preparacao: [
        "Preparar folhas A3 e marcadores, e dois casos fictícios escritos, com volume e restrições diferentes.",
        "Afixar as cinco perguntas da arquitectura num cartaz visível durante toda a actividade.",
        "Recolher e devolver, no início, uma apreciação breve dos planos de continuidade da lição anterior.",
        "Não há laboratório nesta lição; o tempo de actividade é de desenho e justificação.",
        "Preparar a ponte para o módulo seguinte, sobre governação, segurança e custos, sem entrar no conteúdo.",
      ],
      conducao: [
        "Acolhimento, síntese do módulo até aqui — computação, armazenamento, rede, plataforma, continuidade — e objectivos.",
        "Exposição das cinco perguntas, do desenho de quatro camadas, de microserviços, cloud-native, DevOps e etapas de modernização.",
        "Actividade em grupos de quatro: desenho em A3, justificações, etapas e pressupostos, com verificação final contra as cinco perguntas.",
        "Partilha por amostra: dois grupos apresentam 3 minutos cada, com 1 minuto de comentário, e 2 minutos de síntese do módulo. Os desenhos dos restantes grupos ficam afixados e recebem apreciação escrita.",
      ],
      criterios: [
        "O desenho responde às cinco perguntas, incluindo o que acontece quando uma parte falha.",
        "Cada componente tem justificação própria e não apenas o nome de uma tecnologia.",
        "As etapas de modernização estão ordenadas e cada uma tem benefício próprio.",
        "Existem pressupostos e pontos por apurar escritos como tal.",
      ],
      errosComuns: [
        "Desenhar componentes sem indicar as fronteiras de rede nem o que é privado.",
        "Propor microserviços por defeito, sem problema concreto que os justifique.",
        "Apresentar pressupostos por confirmar como se fossem requisitos aprovados.",
        "Esquecer o comportamento do serviço em caso de falha e de ligação intermitente.",
      ],
    },
  },

  ...LICOES_M3,
};
