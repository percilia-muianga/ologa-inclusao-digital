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
};
