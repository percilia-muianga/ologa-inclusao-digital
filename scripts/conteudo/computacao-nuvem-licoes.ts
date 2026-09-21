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

export type ConteudoLicao = {
  objectivos: string[];
  explicacao: string[];
  exemplo: { titulo: string; corpo: string[] };
  /** Os minutos não são escritos aqui: vêm de TemposLicao (fonte única). */
  actividade: { formato: string; enunciado: string[]; produto: string };
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
        "Apresentem em três minutos. O grupo que ouve faz uma pergunta que ponha à prova um pressuposto.",
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
        "Preparar o cronómetro das apresentações de três minutos e a regra de uma pergunta por grupo.",
      ],
      conducao: [
        "Acolhimento, retoma dos três blocos do módulo — características, modelos de serviço, modelos de implantação — e objectivos desta lição.",
        "Exposição dos seis critérios, das três regras de método e da estrutura da recomendação em quatro partes.",
        "Actividade em grupos de quatro: aplicação dos critérios e redacção da ficha de recomendação.",
        "Apresentações de três minutos com uma pergunta por grupo, e síntese final do módulo em leitura fácil.",
      ],
      criterios: [
        "Aplica os seis critérios e não apenas os dois mais fáceis.",
        "A recomendação tem as quatro partes, incluindo o que falta apurar.",
        "Os pressupostos estão escritos como pressupostos, e não como factos.",
        "Responde à pergunta do outro grupo sem abandonar a fundamentação nem a defender de forma rígida.",
      ],
      errosComuns: [
        "Escolher o modelo primeiro e procurar os critérios que o justificam depois.",
        "Deixar de fora o custo de migração e de formação na comparação.",
        "Apresentar pressupostos por confirmar como se fossem decisões já tomadas.",
      ],
    },
  },
};
