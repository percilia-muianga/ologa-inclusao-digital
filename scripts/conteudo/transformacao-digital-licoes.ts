/**
 * Conteúdo original das 12 lições dos módulos próprios do curso
 * «Princípios da Transformação Digital» (24 h, virtual).
 *
 * Estado: PROPOSTA PEDAGÓGICA — por validar pela Ologa/ATDI.
 * Nenhum caso aqui descrito é um registo real: os cenários são fictícios e
 * servem apenas de exercício. Não contém estatísticas nem conclusões
 * jurídicas que não estejam expressamente assinaladas como a verificar.
 *
 * Este ficheiro vive fora de src/ para não entrar no pacote do navegador por
 * engano; é lido apenas pelo seed (scripts/seed-transformacao-digital.ts).
 */

import type { TemposLicao } from "../../src/lib/plano-transformacao-digital";

export type ConteudoLicao = {
  objectivos: string[];
  explicacao: string[];
  exemplo: { titulo: string; corpo: string[] };
  /** Os minutos não são escritos aqui: vêm de TemposLicao (fonte única). */
  actividade: { formato: string; enunciado: string[]; produto: string };
  sintese: string[];
  verificacao: { pergunta: string; resposta: string; feedback: string }[];
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

/** Grelha de tempos comum ao conteúdo e ao guião — evita duas contas diferentes. */
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

export function montarElearning(
  c: ConteudoLicao,
  minutos: number,
  tempos: TemposLicao,
): string {
  return [
    AVISO_HTML,
    `<p><strong>Duração prevista:</strong> ${minutos} minutos.</p>`,
    "<h3>Como o tempo desta lição está distribuído</h3>",
    grelhaTempos(tempos),
    "<h3>Objectivos de aprendizagem</h3>",
    "<p>No fim desta lição, a pessoa formanda deve ser capaz de:</p>",
    lista(c.objectivos),
    "<h3>Explicação</h3>",
    paragrafos(c.explicacao),
    `<h3>Exemplo no contexto dos serviços públicos</h3>`,
    `<p><em>Cenário fictício, elaborado para exercício. Não corresponde a nenhuma instituição ou pessoa real.</em></p>`,
    `<h4>${esc(c.exemplo.titulo)}</h4>`,
    paragrafos(c.exemplo.corpo),
    "<h3>Actividade prática</h3>",
    `<p><strong>Tempo:</strong> ${tempos.actividade} minutos de trabalho, ${esc(
      c.actividade.formato,
    )}, seguidos de ${tempos.partilha} minutos de partilha e síntese em plenário.</p>`,
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
    `<p><strong>Duração prevista:</strong> ${minutos} minutos, em sessão virtual.</p>`,
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
      "Distinguir digitação, digitalização e transformação digital, dando um exemplo de cada.",
      "Identificar três mudanças institucionais que a transformação digital exige além da tecnologia.",
      "Nomear cinco tecnologias associadas à transformação digital e o problema que cada uma procura resolver.",
    ],
    explicacao: [
      "Transformação digital não é comprar equipamento nem pôr um formulário em linha. É a mudança na forma como uma instituição concebe, presta e avalia os seus serviços, usando meios digitais para servir melhor as pessoas. A tecnologia é o meio; o fim é o serviço.",
      "Ajuda distinguir três degraus. Digitação é passar para o computador aquilo que estava em papel, mantendo o mesmo processo. Digitalização é usar meios digitais para executar o processo existente, poupando deslocações e tempo. Transformação digital é rever o próprio processo à luz daquilo de que a pessoa precisa, eliminando passos que só existiam por causa do papel.",
      "Por isso a transformação digital toca em quatro camadas ao mesmo tempo: as pessoas e as suas competências; os processos e as regras que os sustentam; os dados e a forma como circulam entre serviços; e, por fim, a tecnologia. Quando só a última camada muda, o resultado costuma ser um serviço em linha que continua a exigir as mesmas idas ao balcão.",
      "As tecnologias mais citadas neste domínio respondem a problemas diferentes. A computação em nuvem responde ao problema de ter capacidade de cálculo e armazenamento sem manter uma sala de servidores. Os grandes volumes de dados respondem ao problema de decidir com base em evidência e não em impressão. A inteligência artificial responde ao problema de tratar casos repetitivos em grande número e de encontrar padrões. A Internet das coisas responde ao problema de recolher informação do mundo físico sem alguém a registar à mão. A cadeia de blocos responde ao problema de garantir que um registo partilhado não é alterado sem rasto.",
      "Nenhuma destas tecnologias resolve, por si, um processo mal desenhado. Automatizar um procedimento confuso produz confusão mais depressa. Daí a ordem de trabalho que este curso adopta: perceber o serviço, simplificar o processo, e só depois escolher a tecnologia.",
    ],
    exemplo: {
      titulo: "A certidão do Serviço Distrital de Ondela (cenário fictício)",
      corpo: [
        "O Serviço Distrital de Ondela emite uma certidão que exige três deslocações: uma para pedir, uma para pagar, uma para levantar. A direcção decide colocar o formulário em linha. Passados dois meses, as pessoas continuam a deslocar-se três vezes: preenchem em linha, mas ainda têm de levar o comprovativo em papel, pagar ao balcão e levantar presencialmente.",
        "O formulário em linha foi digitalização, não transformação. A transformação começaria por perguntar porque é que são precisas três deslocações: o comprovativo existe porque os dois sistemas não comunicam; o pagamento ao balcão existe porque não há meio electrónico aceite; o levantamento existe porque a certidão precisa de carimbo húmido por exigência interna que ninguém reviu há anos.",
        "Removidos esses três motivos, o serviço passaria a uma deslocação ou a nenhuma — sem que fosse preciso comprar mais tecnologia do que aquela que já existe.",
      ],
    },
    actividade: {
      formato: "individual",
      enunciado: [
        "Escolha um serviço prestado pela instituição onde trabalha e que conheça bem.",
        "Escreva, em três colunas, o que nesse serviço é digitação, o que é digitalização e o que seria transformação digital.",
        "Para cada passo que classificou como digitação ou digitalização, escreva numa linha porque é que esse passo existe. Se não souber, escreva «motivo por apurar» — isso também é resultado.",
      ],
      produto:
        "uma tabela de três colunas com, pelo menos, seis passos classificados e o motivo de cada passo que não chegou a transformação digital.",
    },
    sintese: [
      "Transformação digital é mudar o serviço, não só o equipamento.",
      "Digitação copia o papel. Digitalização acelera o processo antigo. Transformação digital pergunta se o processo ainda faz sentido.",
      "Mudam quatro coisas ao mesmo tempo: pessoas, processos, dados e tecnologia.",
      "Automatizar um processo mau dá um processo mau mais rápido.",
    ],
    verificacao: [
      {
        pergunta: "Colocar um formulário em PDF no sítio da instituição é transformação digital?",
        resposta: "Não. É digitalização, e por vezes apenas digitação.",
        feedback:
          "O critério é saber se o processo mudou para a pessoa. Se continua a haver as mesmas deslocações e os mesmos documentos, o processo não mudou.",
      },
      {
        pergunta: "Qual é a camada que costuma ficar esquecida nos projectos digitais?",
        resposta: "As pessoas e os processos — as regras internas que sustentam cada passo.",
        feedback:
          "A tecnologia é a camada mais visível e a mais fácil de contratar; por isso é a que avança primeiro e, muitas vezes, sozinha.",
      },
      {
        pergunta: "Que problema procura resolver a computação em nuvem?",
        resposta:
          "Ter capacidade de armazenamento e de cálculo sem manter infra-estrutura própria.",
        feedback:
          "Note que isto levanta, em contrapartida, questões de localização e de protecção dos dados, tratadas no módulo 2.",
      },
    ],
    guiao: {
      preparacao: [
        "Confirmar que todas as pessoas conseguem ouvir e ver a apresentação antes de começar.",
        "Ter um exemplo de serviço da própria instituição para usar caso o grupo hesite.",
        "Preparar a tabela de três colunas num documento partilhado e em ficheiro de texto simples, para quem tiver ligação fraca.",
      ],
      conducao: [
        "Acolhimento, objectivos da lição e regra de participação.",
        "Exposição dos três degraus e das quatro camadas, com perguntas ao grupo a cada bloco.",
        "Actividade prática individual, com apoio a pedido.",
        "Partilha de dois ou três trabalhos e síntese.",
      ],
      criterios: [
        "Classifica correctamente pelo menos quatro dos seis passos.",
        "Distingue claramente digitalização de transformação digital em, pelo menos, um passo.",
        "Indica o motivo de cada passo ou assume expressamente que o motivo está por apurar.",
        "Usa um serviço real da sua instituição e não um exemplo genérico.",
      ],
      errosComuns: [
        "Confundir «ter sítio na internet» com transformação digital.",
        "Listar tecnologias em vez de descrever o serviço.",
        "Inventar o motivo de um passo em vez de assinalar que não o conhece.",
      ],
    },
  },

  m1l2: {
    objectivos: [
      "Explicar por que razão a administração pública tem constrangimentos próprios que o sector privado não tem.",
      "Relacionar uma política pública de governo digital com uma decisão concreta de um serviço.",
      "Identificar três competências digitais que a equipa de um serviço precisa de ter.",
    ],
    explicacao: [
      "No sector público, o serviço não pode escolher os seus utentes. Não há segmento preferido nem cliente dispensável: quem tem telemóvel e quem não tem, quem lê com facilidade e quem não lê, quem vive na cidade e quem vive longe de uma antena. Esta é a primeira diferença com peso prático: uma solução que funcione apenas para parte da população não é uma solução aceitável.",
      "A segunda diferença é a legalidade. Um serviço público existe porque uma norma o criou e define o que pode e não pode fazer. Mudar o processo significa, muitas vezes, mudar ou interpretar norma — e isso tem tempos e responsáveis próprios. Um projecto digital que ignore este percurso fica bloqueado a meio.",
      "A terceira diferença é a prestação de contas. O sector público responde perante órgãos de controlo, perante o orçamento e perante o cidadão. Isto obriga a registar decisões, a manter rasto do que foi feito e a poder explicar o critério usado — exigência que condiciona, por exemplo, o uso de sistemas automáticos cuja decisão não se consegue justificar.",
      "As políticas públicas de governo digital procuram dar coerência a estas peças: definem prioridades, normas comuns de interoperabilidade, requisitos de segurança e metas de competências. Para um serviço concreto, uma política só é útil quando se traduz numa decisão: que dados posso reutilizar de outro organismo, que norma técnica devo seguir, que formação a minha equipa tem direito a receber.",
      "Competências digitais, aqui, não são só saber usar um programa. São, no mínimo, três: saber procurar e avaliar informação; saber tratar e proteger dados; e saber trabalhar com um serviço digital de ponta a ponta, incluindo o que fazer quando ele falha. Sem a terceira, a instituição fica dependente de quem instalou o sistema.",
    ],
    exemplo: {
      titulo: "A direcção provincial que quis reutilizar dados (cenário fictício)",
      corpo: [
        "Uma direcção provincial pretende deixar de pedir ao cidadão uma declaração que outro organismo já emitiu. Tecnicamente é simples: bastaria consultar o registo do outro organismo.",
        "Na prática, a equipa descobre três questões antes de qualquer linha de código: se existe base legal para a consulta; se há norma técnica comum entre os dois sistemas; e quem responde se o dado consultado estiver errado.",
        "A equipa decide avançar por fases: primeiro documenta a base legal com o sector jurídico, depois acorda o formato de troca com o outro organismo, e só então altera o formulário. O projecto demora mais três meses, mas não fica parado a meio.",
      ],
    },
    actividade: {
      formato: "em pares",
      enunciado: [
        "Escolham um passo de um serviço que gostariam de eliminar.",
        "Escrevam que norma, decisão ou prática interna sustenta esse passo. Se não souberem, escrevam quem na instituição saberia.",
        "Escrevam o percurso mínimo para o eliminar: quem decide, que documento é preciso, e quanto tempo estimam.",
      ],
      produto:
        "uma ficha de uma página com o passo, o seu fundamento (ou o responsável por o esclarecer) e o percurso de decisão em três etapas.",
    },
    sintese: [
      "O serviço público serve toda a gente. Não pode escolher os utentes.",
      "Mudar o serviço quase sempre implica mexer em normas ou em práticas escritas.",
      "É preciso poder explicar as decisões e guardar o registo delas.",
      "A equipa precisa de saber usar o serviço digital e de saber o que fazer quando ele falha.",
    ],
    verificacao: [
      {
        pergunta: "Porque é que um serviço público não pode escolher o canal digital como único canal?",
        resposta: "Porque parte da população não lhe tem acesso e o serviço é devido a todos.",
        feedback:
          "A pergunta não é se o digital é melhor, é se alguém fica de fora quando o canal antigo desaparece.",
      },
      {
        pergunta: "Qual é o primeiro passo antes de reutilizar dados de outro organismo?",
        resposta: "Verificar a base legal e o responsável pela qualidade do dado.",
        feedback:
          "A parte técnica costuma ser a mais fácil; o acordo institucional é o que determina o prazo.",
      },
    ],
    guiao: {
      preparacao: [
        "Pedir com antecedência que cada pessoa traga um serviço da sua instituição.",
        "Ter à mão os nomes das políticas e normas nacionais aplicáveis, sem as interpretar juridicamente na sessão.",
      ],
      conducao: [
        "Retoma da lição anterior e ligação ao tema.",
        "Exposição das três diferenças e do papel das políticas públicas.",
        "Actividade em pares, em salas separadas.",
        "Partilha e registo das dúvidas jurídicas para encaminhamento.",
      ],
      criterios: [
        "Identifica um passo concreto e não uma queixa genérica.",
        "Indica o fundamento do passo ou quem o pode esclarecer.",
        "O percurso de decisão nomeia pessoas ou órgãos, não «a instituição».",
        "A estimativa de tempo é justificada, ainda que aproximada.",
      ],
      errosComuns: [
        "Tratar como obrigação legal uma prática interna nunca escrita.",
        "Propor eliminar um passo sem saber quem o criou.",
        "Emitir conclusões jurídicas na sessão: devem ser encaminhadas para o sector competente.",
      ],
    },
  },

  m1l3: {
    objectivos: [
      "Definir valor público e distingui-lo de poupança orçamental.",
      "Identificar, num serviço concreto, um impacto social, um impacto económico e um risco ético ou jurídico.",
      "Nomear dois impactos ambientais positivos e dois negativos da digitalização de um serviço.",
    ],
    explicacao: [
      "Valor público é o benefício que o serviço produz para a sociedade: tempo devolvido às pessoas, direitos efectivamente exercidos, decisões mais justas, confiança na instituição. Poupança é apenas uma das formas de valor, e nem sempre a mais importante. Um serviço que poupa dinheiro e afasta metade dos utentes destruiu valor público.",
      "Os impactos sociais de um projecto digital repartem-se de forma desigual. Quem tem telemóvel, dados móveis e à-vontade com formulários ganha logo; quem não tem pode ficar pior do que antes, se o canal presencial encolher ao mesmo tempo. Por isso a pergunta útil não é «quantos passaram a usar o canal digital» mas «o que aconteceu a quem não passou».",
      "Os impactos económicos incluem o custo de investimento, o custo de operação que fica para sempre, a poupança de deslocações para os utentes e os efeitos sobre quem presta serviços em redor do balcão. Muitos projectos comparam apenas o investimento e esquecem o custo de manutenção, que é recorrente.",
      "Os aspectos éticos e jurídicos aparecem sobretudo em três pontos: que dados pessoais são recolhidos e para quê; quem decide e com que critério, em especial quando há apoio automático à decisão; e que rasto fica para permitir reclamação e revisão. Um sistema que não permita contestar uma decisão levanta um problema que é anterior à tecnologia.",
      "Quanto ao ambiente, a digitalização tem dois sentidos. Do lado positivo: menos deslocações, menos consumo de papel, melhor planeamento de recursos com dados de utilização. Do lado negativo: consumo de energia dos centros de dados, equipamento que se torna obsoleto e produz resíduos eléctricos e electrónicos, e o custo ambiental de fabricar aparelhos novos. Sustentabilidade, neste contexto, é escolher soluções duráveis, reaproveitar equipamento e prever o destino do que é substituído.",
    ],
    exemplo: {
      titulo: "O atendimento que fechou às quintas-feiras (cenário fictício)",
      corpo: [
        "Um serviço municipal fictício lança o pedido em linha e, para libertar pessoal, fecha o balcão às quintas-feiras. Nos números internos, o projecto parece bem sucedido: pedidos em linha a crescer e fila mais curta.",
        "Três meses depois, o serviço nota que baixou o número total de pedidos. A explicação provável é que uma parte das pessoas deixou de conseguir pedir, e não que deixou de precisar.",
        "Neste cenário, o indicador que faltava era simples: número total de pedidos por mês, por canal, comparado com o período anterior. Sem ele, a redução de procura é lida como sucesso.",
      ],
    },
    actividade: {
      formato: "em grupos de três",
      enunciado: [
        "Escolham um serviço em processo de digitalização.",
        "Preencham uma grelha com quatro colunas: impacto social, impacto económico, risco ético ou jurídico, impacto ambiental.",
        "Para cada coluna, escrevam quem ganha, quem pode perder e que indicador permitiria perceber se isso está a acontecer.",
      ],
      produto:
        "uma grelha de quatro colunas, com pelo menos um indicador verificável por coluna e a identificação de quem pode perder.",
    },
    sintese: [
      "Valor público não é o mesmo que poupar dinheiro.",
      "Pergunte sempre o que acontece a quem não usa o canal digital.",
      "O custo de manter o sistema não acaba no dia em que ele arranca.",
      "Digitalizar pode poupar papel e deslocações, mas gasta energia e cria lixo electrónico.",
    ],
    verificacao: [
      {
        pergunta: "Um serviço passou a receber menos pedidos depois de digitalizar. Isso é bom sinal?",
        resposta: "Não necessariamente. Pode significar que pessoas deixaram de conseguir pedir.",
        feedback:
          "É preciso separar a procura que desapareceu por deixar de ser necessária daquela que foi bloqueada por barreiras.",
      },
      {
        pergunta: "Indique um impacto ambiental negativo da digitalização.",
        resposta:
          "O consumo de energia dos centros de dados e os resíduos de equipamento substituído.",
        feedback:
          "O balanço ambiental depende das escolhas: equipamento durável e reaproveitado muda o resultado.",
      },
    ],
    guiao: {
      preparacao: [
        "Preparar a grelha de quatro colunas em formato acessível e em texto simples.",
        "Ter exemplos de indicadores simples para desbloquear grupos parados.",
      ],
      conducao: [
        "Pergunta de abertura: o que é um serviço que valeu a pena?",
        "Exposição dos quatro tipos de impacto.",
        "Trabalho de grupo com a grelha.",
        "Apresentação de uma grelha e discussão de quem pode perder.",
      ],
      criterios: [
        "Identifica pelo menos um grupo que pode perder com a mudança.",
        "Cada indicador proposto é observável com dados que a instituição tem ou pode recolher.",
        "Distingue investimento inicial de custo recorrente.",
        "Não confunde poupança orçamental com valor público.",
      ],
      errosComuns: [
        "Listar apenas benefícios.",
        "Usar indicadores que ninguém consegue medir.",
        "Tratar o ambiente só pelo lado do papel poupado.",
      ],
    },
  },

  m1l4: {
    objectivos: [
      "Aplicar uma grelha de maturidade digital a um serviço, justificando cada nível atribuído.",
      "Distinguir maturidade de infra-estrutura de maturidade de processo e de dados.",
      "Produzir três prioridades a partir de um diagnóstico.",
    ],
    explicacao: [
      "Diagnóstico de maturidade serve para responder a uma pergunta prática: onde é que esta instituição está hoje, e qual é o passo seguinte realista? Não é uma classificação para comparar instituições nem um exercício de nota.",
      "É útil avaliar por dimensões separadas, porque uma instituição pode estar avançada numa e atrasada noutra. Propomos cinco: infra-estrutura e conectividade; processos e simplificação; dados e interoperabilidade; pessoas e competências; e governação, isto é, quem decide e com que acompanhamento.",
      "Para cada dimensão, quatro níveis chegam: inicial, quando depende de esforço individual; em desenvolvimento, quando há prática escrita mas não generalizada; estabelecido, quando é prática corrente e acompanhada; e optimizado, quando é revisto com base em dados. Atribuir nível sem justificação escrita torna o diagnóstico inútil três meses depois.",
      "O erro mais frequente é medir só a infra-estrutura, porque é a dimensão mais fácil de contar. Uma instituição com bons computadores e processos por escrever está em nível inicial de processo, e é aí que o próximo investimento rende mais.",
      "Do diagnóstico saem prioridades, não desejos. Uma prioridade útil tem três partes: o que muda, para quem, e como se saberá que mudou. Três prioridades bem escritas valem mais do que quinze intenções.",
    ],
    exemplo: {
      titulo: "Diagnóstico de um serviço distrital (cenário fictício)",
      corpo: [
        "Um serviço distrital fictício avalia-se assim: infra-estrutura em nível estabelecido, porque tem ligação estável e computadores suficientes; processos em nível inicial, porque cada técnico tem a sua forma de tratar o mesmo pedido; dados em nível inicial, porque o registo é feito em folhas de cálculo pessoais; pessoas em desenvolvimento, porque houve formação mas sem plano; governação em nível inicial, porque não há responsável identificado.",
        "A leitura é imediata: comprar mais equipamento não é o passo seguinte. As prioridades saem das dimensões mais atrasadas — escrever o procedimento do pedido mais frequente, centralizar o registo e nomear um responsável.",
      ],
    },
    actividade: {
      formato: "individual, com validação em pares",
      enunciado: [
        "Avalie o seu serviço nas cinco dimensões, atribuindo um dos quatro níveis.",
        "Escreva uma linha de justificação por dimensão, com um facto observável.",
        "Formule três prioridades no formato: o que muda, para quem, como se saberá.",
      ],
      produto:
        "uma ficha de diagnóstico com cinco níveis justificados e três prioridades no formato indicado.",
    },
    sintese: [
      "Diagnóstico serve para saber o passo seguinte, não para dar nota.",
      "Avalie cinco coisas em separado: equipamento, processos, dados, pessoas e quem decide.",
      "Cada nível precisa de uma justificação escrita.",
      "Uma prioridade diz o que muda, para quem e como se saberá.",
    ],
    verificacao: [
      {
        pergunta: "Uma instituição com bom equipamento está digitalmente madura?",
        resposta: "Não. Equipamento é só uma das cinco dimensões.",
        feedback:
          "É frequente encontrar boa infra-estrutura com processos por escrever; nesse caso o investimento seguinte não é em equipamento.",
      },
      {
        pergunta: "O que falta a esta prioridade: «melhorar o atendimento»?",
        resposta: "Falta dizer o que muda, para quem, e como se saberá que mudou.",
        feedback: "Sem estas três partes não é possível acompanhar nem prestar contas.",
      },
    ],
    guiao: {
      preparacao: [
        "Distribuir a grelha de maturidade antes da sessão, em texto simples.",
        "Preparar dois exemplos de justificação bem escrita e dois mal escritos.",
      ],
      conducao: [
        "Enquadrar o diagnóstico como instrumento de decisão.",
        "Apresentar dimensões e níveis com exemplos.",
        "Diagnóstico individual e validação em pares.",
        "Recolha das prioridades e fecho do módulo 1.",
      ],
      criterios: [
        "Todas as cinco dimensões têm nível atribuído e justificação com facto observável.",
        "As prioridades incidem sobre dimensões atrasadas e não sobre a mais fácil.",
        "Cada prioridade tem as três partes exigidas.",
      ],
      errosComuns: [
        "Atribuir níveis altos por simpatia com a própria instituição.",
        "Justificar com opinião em vez de facto.",
        "Escrever prioridades que dependem apenas de orçamento novo.",
      ],
    },
  },

  m2l1: {
    objectivos: [
      "Recolher informação sobre quem usa um serviço, usando pelo menos dois métodos diferentes.",
      "Descrever três perfis de utentes com necessidades distintas, incluindo barreiras de acesso.",
      "Distinguir o que as pessoas dizem do que as pessoas fazem.",
    ],
    explicacao: [
      "Desenhar um serviço sem conhecer quem o usa é desenhar para a pessoa que o desenha. A primeira tarefa é, por isso, recolher informação sobre os utentes reais: quem são, o que precisam de resolver, o que já tentaram, o que os impede.",
      "Dois métodos simples chegam para começar. Conversa estruturada: dez a quinze perguntas abertas, feitas a pessoas que acabaram de usar o serviço, no próprio local. Observação: estar ao lado de quem usa o serviço e registar o que acontece, sem ajudar nem corrigir. Os dois em conjunto valem mais do que qualquer um isolado, porque as pessoas descrevem mal aquilo que fazem por hábito.",
      "Um perfil de utente útil não é um retrato demográfico. É a combinação de uma necessidade, de um contexto e de uma barreira: «precisa da certidão para a matrícula do filho, só pode vir de manhã, não tem dados móveis». Três perfis diferentes chegam para expor a maior parte dos problemas de desenho.",
      "As barreiras de acesso devem ser tratadas com o mesmo cuidado que as funcionais: literacia, língua, visão, audição, mobilidade, custo dos dados móveis, distância, e o simples receio de errar num formulário oficial. Uma barreira que não é registada não é resolvida.",
      "Finalmente, registe sempre a origem da informação. «Achamos que as pessoas preferem» não é informação; «de quinze pessoas ouvidas na segunda-feira, onze disseram» é informação, com o seu limite reconhecido.",
    ],
    exemplo: {
      titulo: "O que a observação mostrou e a conversa não (cenário fictício)",
      corpo: [
        "Numa recolha fictícia, treze das quinze pessoas ouvidas disseram que preenchiam o formulário sozinhas. A observação mostrou que nove pediram ajuda a alguém na fila ou ao segurança.",
        "Não se trata de as pessoas mentirem: pedir ajuda numa fila é banal e não fica na memória como dificuldade. A equipa concluiu que o formulário exigia apoio na prática, e reescreveu as três perguntas onde a ajuda era pedida com mais frequência.",
      ],
    },
    actividade: {
      formato: "individual",
      enunciado: [
        "Escreva um guião de dez perguntas abertas para utentes do seu serviço.",
        "Escreva uma grelha de observação com cinco comportamentos a registar.",
        "Descreva três perfis de utentes do seu serviço, cada um com necessidade, contexto e barreira.",
      ],
      produto:
        "guião de dez perguntas, grelha de observação com cinco itens e três perfis descritos em três frases cada.",
    },
    sintese: [
      "Fale com quem usa o serviço e observe o que faz.",
      "O que as pessoas dizem nem sempre é o que fazem.",
      "Um perfil útil junta necessidade, contexto e barreira.",
      "Registe sempre de onde veio a informação.",
    ],
    verificacao: [
      {
        pergunta: "Porque é que a observação complementa a conversa?",
        resposta: "Porque as pessoas não se recordam de dificuldades que consideram banais.",
        feedback: "Hábito e vergonha explicam a maior parte das diferenças entre o dito e o feito.",
      },
      {
        pergunta: "«Mulher, 34 anos, do distrito» é um perfil de utente suficiente?",
        resposta: "Não. Falta a necessidade, o contexto e a barreira.",
        feedback: "Dados demográficos sozinhos não indicam o que é preciso mudar no serviço.",
      },
    ],
    guiao: {
      preparacao: [
        "Ter um guião-exemplo de perguntas abertas e um de perguntas fechadas, para contraste.",
        "Combinar antecipadamente as regras de recolha: consentimento, anonimato e não recolher dados desnecessários.",
      ],
      conducao: [
        "Abertura do módulo 2 e objectivos.",
        "Métodos de recolha e construção de perfis.",
        "Actividade prática com apoio individual.",
        "Partilha de um perfil por grupo e síntese.",
      ],
      criterios: [
        "As perguntas são abertas e não sugerem a resposta.",
        "A grelha de observação regista comportamentos, não opiniões.",
        "Cada perfil tem necessidade, contexto e barreira distintos dos restantes.",
        "Pelo menos um perfil contempla uma barreira de acessibilidade.",
      ],
      errosComuns: [
        "Perguntas fechadas disfarçadas de abertas.",
        "Perfis que descrevem o funcionário e não o utente.",
        "Recolher dados pessoais que não são necessários ao exercício.",
      ],
    },
  },

  m2l2: {
    objectivos: [
      "Mapear a jornada de um serviço público do primeiro contacto ao resultado.",
      "Identificar pontos de fricção e o seu custo em tempo e deslocações para o utente.",
      "Propor duas melhorias de baixo custo a partir do mapa.",
    ],
    explicacao: [
      "A jornada é a sequência daquilo que a pessoa faz, desde o momento em que percebe que precisa do serviço até ao momento em que tem o resultado na mão. Inclui passos que a instituição não vê: procurar informação, pedir dinheiro emprestado para o transporte, faltar ao trabalho, voltar no dia seguinte.",
      "Mapear é registar cada passo com quatro colunas: o que a pessoa faz, com quem interage, quanto tempo demora e o que pode correr mal. O mapa revela quase sempre que a maior parte do tempo do utente é passada à espera ou a deslocar-se, e não a ser atendida.",
      "Ponto de fricção é um passo que consome tempo ou provoca desistência sem produzir valor. Exemplos comuns: informação contraditória à entrada, documentos exigidos que a instituição já possui, horários que obrigam a faltar ao trabalho, e a exigência de voltar apenas para levantar.",
      "Nem todos os pontos de fricção exigem tecnologia. Colocar informação correcta à entrada, aceitar cópia digital de um documento, ou avisar por mensagem que o processo está pronto são melhorias de baixo custo com efeito imediato na jornada.",
      "O mapa serve também de instrumento de prestação de contas: permite mostrar, antes e depois, o número de deslocações e o tempo total exigido ao utente. É uma medida simples, compreensível para qualquer pessoa e difícil de contestar.",
    ],
    exemplo: {
      titulo: "Onze passos, três deslocações (cenário fictício)",
      corpo: [
        "O mapa de um serviço fictício revelou onze passos e três deslocações. Dos onze, quatro existiam para confirmar informação que a instituição já tinha em sistema.",
        "A equipa eliminou dois desses passos sem qualquer alteração informática, bastando uma instrução interna. Os outros dois exigiam ligação entre dois sistemas e foram registados como projecto a médio prazo.",
        "O resultado no mapa foi passar de três deslocações para duas, com um ganho estimado de uma manhã de trabalho por utente.",
      ],
    },
    actividade: {
      formato: "em grupos de três",
      enunciado: [
        "Mapeiem a jornada de um serviço, do primeiro contacto ao resultado, com as quatro colunas indicadas.",
        "Assinalem os pontos de fricção e estimem o tempo perdido em cada um.",
        "Proponham duas melhorias que não exijam software novo.",
      ],
      produto:
        "mapa de jornada com todos os passos, pontos de fricção assinalados, e duas melhorias de baixo custo com o ganho estimado.",
    },
    sintese: [
      "A jornada começa antes de a pessoa chegar ao balcão.",
      "Registe o que a pessoa faz, com quem fala, quanto demora e o que pode correr mal.",
      "Muitos passos existem só por hábito.",
      "Há melhorias que não precisam de tecnologia nenhuma.",
    ],
    verificacao: [
      {
        pergunta: "A jornada de um serviço começa no atendimento?",
        resposta: "Não. Começa quando a pessoa percebe que precisa do serviço e procura informação.",
        feedback: "Grande parte da desistência acontece antes do primeiro contacto com a instituição.",
      },
      {
        pergunta: "Indique uma melhoria de jornada que não exige tecnologia.",
        resposta:
          "Deixar de exigir um documento que a instituição já possui, ou corrigir a informação à entrada.",
        feedback: "Melhorias de instrução interna costumam ser as mais rápidas a produzir efeito.",
      },
    ],
    guiao: {
      preparacao: [
        "Preparar um mapa-exemplo incompleto, para o grupo detectar o que falta.",
        "Ter cronómetro e regras de tempo por grupo.",
      ],
      conducao: [
        "Retoma dos perfis da lição anterior.",
        "Método de mapeamento e tipos de fricção.",
        "Mapeamento em grupo.",
        "Apresentação de um mapa e crítica construtiva.",
      ],
      criterios: [
        "O mapa inclui passos anteriores ao primeiro contacto com a instituição.",
        "Cada ponto de fricção tem tempo estimado.",
        "As duas melhorias propostas não dependem de software novo.",
        "O ganho é expresso em deslocações ou em tempo do utente.",
      ],
      errosComuns: [
        "Mapear o procedimento interno em vez da experiência do utente.",
        "Propor «um sistema» como melhoria.",
        "Esquecer o passo do pagamento e do levantamento.",
      ],
    },
  },

  m2l3: {
    objectivos: [
      "Aplicar três critérios de simplificação a um procedimento.",
      "Eliminar ou fundir pelo menos dois passos de um processo, justificando.",
      "Explicar por que razão simplificar antes de digitalizar reduz custo e risco.",
    ],
    explicacao: [
      "Digitalizar um processo cristaliza-o. Cada passo torna-se um ecrã, cada exigência torna-se um campo obrigatório, cada excepção torna-se código. Se o processo estava confuso, a confusão passa a estar escrita em sistema e fica mais cara de corrigir.",
      "Três critérios chegam para simplificar a maior parte dos procedimentos. Primeiro: este passo produz decisão? Se ninguém decide nada com a informação recolhida, o passo é candidato a eliminação. Segundo: a instituição já tem este dado? Se tem, pedi-lo de novo é transferir para o utente um custo que é interno. Terceiro: este passo protege alguém de um risco real? Se sim, mantém-se, mas escreve-se qual é o risco.",
      "Fundir passos é muitas vezes mais viável do que eliminar: um único momento de entrega em vez de dois, uma verificação no acto em vez de uma verificação diferida. A pergunta é sempre a mesma: o que é que isto custa à pessoa que está do outro lado.",
      "A simplificação tem um limite legítimo: controlo interno e prestação de contas. O objectivo não é remover verificações, é remover verificações que não verificam nada. Por isso todo o passo mantido deve ter escrito o risco que cobre — se não se consegue escrever, provavelmente não cobre nenhum.",
      "Finalmente, simplificar antes de digitalizar reduz o custo do projecto: menos ecrãs, menos campos, menos regras, menos manutenção. É a decisão que mais poupa dinheiro em todo o percurso, e não custa nada além de tempo de análise.",
    ],
    exemplo: {
      titulo: "O campo que ninguém lia (cenário fictício)",
      corpo: [
        "Num formulário fictício com vinte e dois campos, a equipa perguntou, campo a campo, quem usava aquela informação. Nove campos não tinham utilizador conhecido.",
        "Três foram eliminados de imediato. Quatro ficaram em suspenso à espera de confirmação de outro sector. Dois eram exigência de um relatório trimestral e mantiveram-se, com o motivo escrito ao lado.",
        "O formulário passou a dezanove campos antes de qualquer trabalho informático, e a decisão ficou documentada para quem vier depois.",
      ],
    },
    actividade: {
      formato: "individual, com revisão cruzada em pares",
      enunciado: [
        "Escolha um formulário ou procedimento do seu serviço.",
        "Aplique os três critérios a cada passo ou campo e classifique: eliminar, fundir, manter.",
        "Para cada passo mantido, escreva numa linha o risco que ele cobre.",
      ],
      produto:
        "lista de passos classificados com, no mínimo, dois passos eliminados ou fundidos, e o risco escrito para cada passo mantido.",
    },
    sintese: [
      "Simplifique antes de digitalizar. Depois fica mais caro.",
      "Pergunte: alguém decide alguma coisa com isto?",
      "Não peça o que a instituição já tem.",
      "Se mantém um passo, escreva que risco ele evita.",
    ],
    verificacao: [
      {
        pergunta: "Porque é que digitalizar um processo confuso sai caro?",
        resposta: "Porque cada passo confuso passa a ser código e regras que custam a manter e a corrigir.",
        feedback: "Corrigir depois exige mudar sistema, formação e instruções, não só o procedimento.",
      },
      {
        pergunta: "Qual é o limite da simplificação?",
        resposta: "Os controlos que cobrem um risco real e a prestação de contas.",
        feedback: "O teste prático é conseguir escrever, numa linha, o risco que o passo cobre.",
      },
    ],
    guiao: {
      preparacao: [
        "Pedir que cada pessoa traga um formulário real do serviço.",
        "Preparar exemplos de riscos bem e mal escritos.",
      ],
      conducao: [
        "Ligação ao mapa de jornada da lição anterior.",
        "Os três critérios e o limite do controlo interno.",
        "Aplicação individual e revisão cruzada em pares.",
        "Recolha dos casos em que a simplificação exige decisão superior.",
      ],
      criterios: [
        "Classifica todos os passos, sem deixar nenhum por decidir sem justificação.",
        "Elimina ou funde pelo menos dois passos.",
        "Escreve o risco coberto por cada passo mantido, em linguagem clara.",
        "Assinala os passos cuja alteração exige decisão de outra entidade.",
      ],
      errosComuns: [
        "Manter passos por hábito, sem conseguir dizer que risco cobrem.",
        "Eliminar controlos com fundamento legal.",
        "Confundir simplificar com reduzir garantias ao utente.",
      ],
    },
  },

  m2l4: {
    objectivos: [
      "Distinguir dado pessoal de dado não pessoal num formulário concreto.",
      "Aplicar o princípio da recolha mínima e o da finalidade a um serviço.",
      "Identificar três medidas básicas de segurança ao alcance de um serviço sem equipa informática própria.",
    ],
    explicacao: [
      "Dado pessoal é qualquer informação que permita identificar uma pessoa, directamente ou por cruzamento. O nome é evidente; o número de um processo associado a uma morada também é. O critério prático é perguntar: com esta informação e as outras que temos, consigo chegar a uma pessoa concreta?",
      "Dois princípios orientam a recolha. Recolha mínima: pede-se apenas o que é necessário à finalidade declarada. Finalidade: o que foi recolhido para uma coisa não é usado para outra sem fundamento. São princípios simples de enunciar e exigentes de cumprir, porque a tentação de recolher «porque pode vir a ser útil» é permanente.",
      "Segurança, num serviço sem equipa informática própria, começa por três medidas ao alcance de qualquer direcção. Primeira: controlo de acesso — cada pessoa tem a sua conta, ninguém partilha palavra-passe, e o acesso é retirado quando alguém muda de funções. Segunda: cópias de segurança verificadas — uma cópia que nunca foi restaurada não é uma cópia. Terceira: registo de quem acedeu a quê, para permitir apurar responsabilidade.",
      "A estas acresce uma quarta, comportamental e das mais eficazes: não enviar listas de dados pessoais por canais pessoais de mensagens, nem guardá-las em aparelhos particulares. A maior parte das fugas de informação em serviços pequenos não resulta de ataque técnico, mas de conveniência.",
      "Quando se recorre a serviços na nuvem, acrescem três perguntas ao contrato: onde ficam os dados, quem lhes pode aceder do lado do fornecedor, e como são devolvidos ou apagados no fim. Não são questões técnicas, são questões de contrato, e devem estar escritas antes da adesão.",
      "Nota de enquadramento: os requisitos legais aplicáveis à protecção de dados devem ser confirmados com o sector jurídico da instituição. Esta lição apresenta princípios e boas práticas, não constitui parecer jurídico.",
    ],
    exemplo: {
      titulo: "A lista que circulou por mensagem (cenário fictício)",
      corpo: [
        "Num cenário fictício, uma técnica envia por aplicação de mensagens a lista de inscritos, com nomes e contactos, para um colega que estava fora do serviço. É rápido e resolve o problema do dia.",
        "A lista fica guardada em dois telemóveis pessoais e numa cópia automática da aplicação. Quando um dos telemóveis é vendido, ninguém sabe dizer onde está a lista nem quem lhe acedeu.",
        "A falha não foi técnica. Foi a ausência de um canal interno tão cómodo quanto o pessoal — e é aí que a solução tem de ser procurada.",
      ],
    },
    actividade: {
      formato: "em pares",
      enunciado: [
        "Peguem num formulário do serviço e assinalem que campos são dados pessoais.",
        "Para cada campo, escrevam a finalidade e quem precisa de lhe aceder.",
        "Escrevam três medidas de segurança que a vossa direcção consegue adoptar este mês, sem orçamento novo.",
      ],
      produto:
        "formulário anotado com campos de dados pessoais, finalidade e acessos, mais três medidas exequíveis com responsável e prazo.",
    },
    sintese: [
      "Dado pessoal é o que permite chegar a uma pessoa.",
      "Peça só o que precisa e use só para o que declarou.",
      "Cada pessoa com a sua conta. Não partilhe palavras-passe.",
      "Não guarde listas de pessoas em telemóveis pessoais.",
      "Uma cópia de segurança que nunca foi testada não conta.",
    ],
    verificacao: [
      {
        pergunta: "Um número de processo é dado pessoal?",
        resposta: "Pode ser, se permitir chegar a uma pessoa por cruzamento com outra informação.",
        feedback: "O critério não é o tipo de campo, é a possibilidade de identificação.",
      },
      {
        pergunta: "Qual é a medida de segurança mais barata e mais esquecida?",
        resposta: "Retirar o acesso a quem mudou de funções ou saiu.",
        feedback: "Contas activas de quem já não trabalha no serviço são das falhas mais comuns.",
      },
      {
        pergunta: "Que perguntas fazer antes de contratar um serviço na nuvem?",
        resposta: "Onde ficam os dados, quem lhes acede do lado do fornecedor e como são devolvidos ou apagados.",
        feedback: "São cláusulas de contrato e devem ficar escritas antes da adesão.",
      },
    ],
    guiao: {
      preparacao: [
        "Confirmar com o sector jurídico da instituição que enquadramento pode ser referido, sem emitir parecer na sessão.",
        "Preparar um formulário-exemplo com campos manifestamente desnecessários.",
      ],
      conducao: [
        "Abertura e recolha de receios do grupo sobre dados.",
        "Princípios de recolha mínima e finalidade, e as medidas básicas de segurança.",
        "Actividade em pares.",
        "Compromissos concretos e fecho do módulo 2.",
      ],
      criterios: [
        "Identifica correctamente os campos que são dados pessoais.",
        "Cada campo tem finalidade escrita e lista de quem acede.",
        "As três medidas têm responsável e prazo e não dependem de orçamento novo.",
        "Não são emitidas conclusões jurídicas; as dúvidas ficam encaminhadas.",
      ],
      errosComuns: [
        "Considerar dado pessoal apenas o nome.",
        "Propor medidas que exigem equipa informática inexistente.",
        "Responder a dúvidas jurídicas de improviso.",
      ],
    },
  },

  m3l1: {
    objectivos: [
      "Traduzir um diagnóstico num plano com três objectivos e prazos.",
      "Aplicar dois critérios de priorização a uma lista de iniciativas.",
      "Identificar dependências e riscos de cada iniciativa escolhida.",
    ],
    explicacao: [
      "Estratégia, aqui, é a escolha do que não se vai fazer este ano. Instituições com quinze projectos simultâneos costumam concluir poucos; a limitação raramente é de ideias, é de atenção da direcção e de pessoas disponíveis.",
      "Dois critérios de priorização bastam e são defensáveis perante terceiros. Primeiro: valor para o utente — quantas pessoas beneficiam e quanto lhes é devolvido em tempo ou em acesso. Segundo: exequibilidade — depende de nós ou de terceiros, exige norma nova, exige orçamento novo, exige competência que não temos. Cruzados, os dois critérios produzem uma ordem que se explica em duas frases.",
      "Um plano útil cabe numa página: três objectivos, cada um com resultado esperado, responsável, prazo e indicador. Planos extensos protegem quem os escreve e não ajudam quem os executa.",
      "Dependências devem ser explícitas: iniciativa que depende de outro organismo, de aquisição, de alteração de norma ou de formação prévia. A dependência não impede o arranque, mas determina por onde se começa: normalmente pelo pedido formal que tem o prazo mais longo.",
      "Riscos registam-se com a mesma disciplina: o que pode correr mal, qual é o sinal de que está a correr mal, e o que se faz nesse caso. Três riscos bem acompanhados valem mais do que uma matriz com trinta.",
    ],
    exemplo: {
      titulo: "Quinze ideias, três decisões (cenário fictício)",
      corpo: [
        "Uma direcção fictícia lista quinze iniciativas. Ao cruzar valor com exequibilidade, sobram três: reescrever a informação à entrada do serviço, eliminar a exigência de um documento interno e nomear responsável pelo registo de dados.",
        "As três dependem apenas da própria direcção, custam tempo e não orçamento, e produzem efeito em semanas. As restantes doze ficam numa lista datada, para reavaliação no trimestre seguinte — não são apagadas, são adiadas com registo.",
      ],
    },
    actividade: {
      formato: "em grupos de três",
      enunciado: [
        "Partindo do diagnóstico do módulo 1, listem oito iniciativas possíveis.",
        "Classifiquem cada uma quanto a valor para o utente e exequibilidade, numa escala de três níveis.",
        "Escrevam o plano de uma página com as três escolhidas: resultado, responsável, prazo, indicador, dependências e riscos.",
      ],
      produto:
        "plano de uma página com três objectivos completos e a lista datada das iniciativas adiadas.",
    },
    sintese: [
      "Estratégia é decidir o que não se faz este ano.",
      "Escolha pelo valor para o utente e pela exequibilidade.",
      "O plano cabe numa página: resultado, responsável, prazo, indicador.",
      "Escreva as dependências e comece pelo pedido mais demorado.",
    ],
    verificacao: [
      {
        pergunta: "Porque é que um plano com quinze projectos costuma falhar?",
        resposta: "Porque a atenção da direcção e as pessoas disponíveis são limitadas.",
        feedback: "Reduzir o número em curso aumenta a taxa de conclusão sem custo adicional.",
      },
      {
        pergunta: "O que fazer às iniciativas não escolhidas?",
        resposta: "Guardar numa lista datada para reavaliação, em vez de as apagar.",
        feedback: "Manter registo evita que a mesma discussão se repita de três em três meses.",
      },
    ],
    guiao: {
      preparacao: [
        "Recolher previamente os diagnósticos do módulo 1 para os grupos partirem de material próprio.",
        "Preparar a grelha valor/exequibilidade em formato acessível.",
      ],
      conducao: [
        "Abertura do módulo 3 e ligação ao diagnóstico.",
        "Critérios de priorização e estrutura do plano de uma página.",
        "Trabalho de grupo.",
        "Apresentação de um plano e crítica pelos critérios.",
      ],
      criterios: [
        "Os três objectivos têm resultado, responsável, prazo e indicador.",
        "A priorização está justificada pelos dois critérios.",
        "As dependências identificam entidades concretas.",
        "Cada risco tem sinal de alerta e resposta prevista.",
      ],
      errosComuns: [
        "Escolher iniciativas pela facilidade e não pelo valor.",
        "Indicadores que só existem no fim do projecto.",
        "Responsáveis colectivos, do tipo «o sector».",
      ],
    },
  },

  m3l2: {
    objectivos: [
      "Distribuir responsabilidades de um projecto digital por papéis definidos.",
      "Identificar lacunas de competências da equipa e a forma de as cobrir.",
      "Explicar a diferença entre responsável pelo serviço e responsável pelo sistema.",
    ],
    explicacao: [
      "Projectos digitais falham mais por falta de dono do que por falta de tecnologia. É preciso distinguir dois papéis que frequentemente se confundem: o responsável pelo serviço, que responde pelo resultado para o utente e decide regras; e o responsável pelo sistema, que responde pelo funcionamento técnico. Quando os dois são a mesma pessoa, ou quando não existe o primeiro, as decisões de serviço passam a ser tomadas por critério técnico.",
      "Quatro papéis chegam para a maior parte dos casos: quem decide, quem executa, quem é consultado e quem é informado. Escrever isto para cada decisão importante evita a paralisia de espera mútua e o seu contrário, a decisão tomada por quem não tinha mandato.",
      "As competências necessárias dividem-se em três grupos: competências de serviço, como conhecer o procedimento e a norma; competências de dados, como saber registar, verificar e interpretar; e competências digitais de base, comuns a toda a equipa. A lacuna mais frequente é a segunda e a menos reconhecida também.",
      "Cobrir uma lacuna nem sempre é formar. Pode ser contratar apoio pontual, partilhar competência com outro organismo, ou simplificar o processo até ao ponto em que a competência deixa de ser necessária. A última opção é a mais barata e a mais esquecida.",
      "Finalmente, a dependência de um único fornecedor ou de uma única pessoa é um risco de continuidade. O mínimo exigível é documentação escrita do que existe, acesso administrativo em posse da instituição e mais do que uma pessoa capaz de executar cada tarefa crítica.",
    ],
    exemplo: {
      titulo: "O sistema que só uma pessoa sabia usar (cenário fictício)",
      corpo: [
        "Num serviço fictício, apenas um técnico sabia gerar o mapa mensal a partir do sistema. Durante a sua ausência de duas semanas, o mapa não foi produzido e a direcção decidiu sem dados.",
        "A resposta adoptada teve três partes: escrever o procedimento em duas páginas, formar uma segunda pessoa, e guardar as credenciais administrativas em cofre da instituição e não com o técnico.",
        "Nenhuma das três exigiu investimento; exigiram decisão e uma manhã de trabalho.",
      ],
    },
    actividade: {
      formato: "individual, com discussão final",
      enunciado: [
        "Escolha uma das três iniciativas do plano da lição anterior.",
        "Preencha uma matriz de papéis para as cinco decisões mais importantes dessa iniciativa.",
        "Liste as competências necessárias, assinale as lacunas e indique como cobre cada uma: formar, contratar, partilhar ou simplificar.",
      ],
      produto:
        "matriz de papéis com cinco decisões e quadro de competências com a forma de cobertura de cada lacuna.",
    },
    sintese: [
      "Quem responde pelo serviço não é a mesma pessoa que responde pelo sistema.",
      "Para cada decisão, escreva quem decide, quem executa, quem é consultado e quem é informado.",
      "Nem toda a lacuna se resolve com formação.",
      "Se só uma pessoa sabe fazer, isso é um risco.",
    ],
    verificacao: [
      {
        pergunta: "O que acontece quando não há responsável pelo serviço?",
        resposta: "As decisões de serviço passam a ser tomadas por critério técnico.",
        feedback: "O resultado típico é um sistema que funciona bem e um serviço que não melhora.",
      },
      {
        pergunta: "Indique uma forma de cobrir uma lacuna de competências que não seja formação.",
        resposta: "Simplificar o processo até a competência deixar de ser necessária.",
        feedback: "Também são válidas a contratação pontual e a partilha com outro organismo.",
      },
    ],
    guiao: {
      preparacao: [
        "Levar a matriz de papéis já desenhada, com um exemplo preenchido.",
        "Recolher os planos da lição anterior.",
      ],
      conducao: [
        "Retoma do plano e dos responsáveis nomeados.",
        "Papéis, competências e risco de dependência.",
        "Trabalho individual com apoio.",
        "Discussão dos casos de dependência de uma só pessoa.",
      ],
      criterios: [
        "Cada uma das cinco decisões tem um único decisor identificado.",
        "Distingue responsável pelo serviço de responsável pelo sistema.",
        "Pelo menos uma lacuna é coberta sem recurso a formação.",
        "Identifica pelo menos um risco de dependência e a respectiva mitigação.",
      ],
      errosComuns: [
        "Colocar a mesma pessoa como decisora de tudo.",
        "Confundir consultado com informado.",
        "Ignorar as credenciais administrativas na análise de dependência.",
      ],
    },
  },

  m3l3: {
    objectivos: [
      "Identificar três causas de resistência à mudança num serviço concreto.",
      "Desenhar um plano de comunicação interna com três mensagens e três canais.",
      "Definir o apoio necessário nas primeiras semanas de utilização.",
    ],
    explicacao: [
      "A resistência à mudança raramente é teimosia. Tem quase sempre três causas concretas: receio de perder competência reconhecida, receio de perder controlo sobre o próprio trabalho e experiência anterior de mudanças que pioraram o dia-a-dia. Quem conduz a mudança deve tratar estas causas como informação e não como obstáculo.",
      "A adopção depende mais das primeiras duas semanas do que de toda a formação prévia. Se, nas primeiras vezes em que usa o sistema novo, a pessoa fica bloqueada sem ajuda, volta ao método antigo e não volta a tentar. Por isso o apoio próximo nos primeiros dias vale mais do que horas de sala.",
      "A comunicação interna deve responder às três perguntas que as pessoas fazem, por esta ordem: o que muda no meu trabalho, o que ganho ou perco, e quem me ajuda quando falhar. Comunicação que começa pela estratégia e nunca chega a estas perguntas não produz adopção.",
      "Ajuda identificar pessoas de referência dentro da equipa: colegas com credibilidade prática que experimentam primeiro e ajudam os restantes. Têm mais efeito do que qualquer circular, e custam apenas o reconhecimento do seu tempo.",
      "Por fim, a mudança de comportamentos do lado dos utentes segue a mesma lógica: informação no ponto de contacto, no momento em que é útil, e um caminho alternativo garantido para quem não consegue usar o novo canal. Uma mudança que obriga sem alternativa gera exclusão e desconfiança.",
    ],
    exemplo: {
      titulo: "As duas primeiras semanas (cenário fictício)",
      corpo: [
        "Num serviço fictício, o novo registo é lançado com uma formação de três horas e um manual. Ao fim de duas semanas, metade da equipa voltou à folha de cálculo antiga.",
        "Na segunda tentativa, a direcção muda a abordagem: duas pessoas de referência ficam disponíveis nas primeiras duas semanas, o manual é reduzido a uma página com as cinco operações mais frequentes, e há um ponto diário de cinco minutos para dúvidas.",
        "A diferença entre as duas tentativas não foi a formação nem o sistema. Foi a presença de apoio no momento da dificuldade.",
      ],
    },
    actividade: {
      formato: "em grupos de três",
      enunciado: [
        "Identifiquem três causas prováveis de resistência à iniciativa que escolheram.",
        "Escrevam três mensagens de comunicação interna, cada uma respondendo a uma das três perguntas que as pessoas fazem, e escolham o canal de cada uma.",
        "Desenhem o apoio das duas primeiras semanas: quem, quando, como se pede ajuda.",
      ],
      produto:
        "plano de adopção com causas de resistência, três mensagens com canal, e o esquema de apoio das duas primeiras semanas.",
    },
    sintese: [
      "Resistir à mudança tem motivos. Ouça-os.",
      "As duas primeiras semanas decidem se a mudança pega.",
      "Diga o que muda no trabalho, o que se ganha e quem ajuda quando falha.",
      "Colegas de referência ajudam mais do que circulares.",
      "Garanta sempre um caminho alternativo para quem não consegue usar o canal novo.",
    ],
    verificacao: [
      {
        pergunta: "Porque é que a formação prévia, sozinha, não garante adopção?",
        resposta: "Porque a desistência acontece na primeira dificuldade real, se não houver apoio próximo.",
        feedback: "O apoio nas primeiras duas semanas tem mais efeito do que horas adicionais de sala.",
      },
      {
        pergunta: "Qual é a primeira pergunta que as pessoas fazem perante uma mudança?",
        resposta: "O que muda no meu trabalho.",
        feedback: "Começar pela estratégia institucional costuma perder a audiência antes desta resposta.",
      },
    ],
    guiao: {
      preparacao: [
        "Recolher exemplos reais de mudanças anteriores na instituição, sem personalizar culpas.",
        "Preparar modelos curtos de mensagem interna.",
      ],
      conducao: [
        "Recolha de experiências anteriores de mudança no grupo.",
        "Causas de resistência e lógica das primeiras duas semanas.",
        "Trabalho de grupo sobre o plano de adopção.",
        "Leitura em voz alta de uma mensagem por grupo e crítica.",
      ],
      criterios: [
        "As causas de resistência são específicas do serviço e não genéricas.",
        "Cada mensagem responde a uma das três perguntas e é compreensível numa leitura.",
        "O apoio das duas primeiras semanas nomeia pessoas e horários.",
        "Está previsto um caminho alternativo para utentes que não usem o canal novo.",
      ],
      errosComuns: [
        "Tratar resistência como má vontade.",
        "Mensagens escritas em linguagem administrativa.",
        "Planos de apoio sem pessoas concretas.",
      ],
    },
  },

  m3l4: {
    objectivos: [
      "Definir três indicadores de resultado para uma iniciativa, com fonte de dados e periodicidade.",
      "Distinguir indicador de actividade de indicador de resultado.",
      "Planear a revisão periódica e a sustentabilidade da solução, incluindo o destino do equipamento substituído.",
    ],
    explicacao: [
      "Indicador de actividade conta o que a instituição fez: sessões realizadas, sistemas instalados, pessoas formadas. Indicador de resultado conta o que mudou para quem usa o serviço: deslocações poupadas, tempo até à resposta, proporção de pedidos concluídos à primeira. Os primeiros são fáceis de recolher e não dizem se valeu a pena.",
      "Um indicador útil tem quatro elementos: o que mede, como se calcula, de onde vêm os dados e de quanto em quanto tempo é lido. Sem a fonte, o indicador morre no primeiro mês; sem periodicidade, ninguém o lê.",
      "Convém incluir sempre um indicador de equidade, isto é, que mostre se o benefício se distribuiu ou se concentrou. Por exemplo, comparar o tempo de resposta entre quem usou o canal digital e quem usou o balcão. Sem este indicador, uma média favorável pode esconder um grupo a piorar.",
      "Sustentabilidade tem três dimensões práticas. Financeira: quem paga a manutenção depois do projecto. Técnica: quem actualiza e quem corrige. Ambiental: que destino tem o equipamento substituído e como se prolonga a vida do que existe. Um projecto que não responde às três termina quando termina o financiamento.",
      "Por fim, a melhoria contínua precisa de um momento marcado: uma revisão trimestral, curta, com os indicadores à frente e três decisões possíveis — manter, corrigir ou parar. A opção de parar tem de existir, ou a revisão é apenas um relatório.",
    ],
    exemplo: {
      titulo: "A média que escondia um grupo (cenário fictício)",
      corpo: [
        "Num exemplo fictício, o tempo médio de resposta de um serviço baixa de doze para sete dias após a digitalização. O resultado é celebrado.",
        "Separando por canal, verifica-se que os pedidos digitais passaram a quatro dias e os pedidos de balcão subiram para catorze, porque o pessoal foi deslocado para o novo canal.",
        "A média melhorou e um grupo piorou. O indicador de equidade foi o que permitiu ver isto a tempo de corrigir a afectação de pessoal.",
      ],
    },
    actividade: {
      formato: "em grupos de três",
      enunciado: [
        "Definam três indicadores de resultado para a iniciativa escolhida, com os quatro elementos exigidos.",
        "Acrescentem um indicador de equidade e expliquem que desigualdade permitiria detectar.",
        "Escrevam o plano de sustentabilidade: quem paga a manutenção, quem corrige, e qual o destino do equipamento substituído.",
      ],
      produto:
        "quadro de quatro indicadores completos e plano de sustentabilidade com responsáveis nomeados.",
    },
    sintese: [
      "Contar o que fizemos não é o mesmo que medir o que mudou.",
      "Cada indicador precisa de fonte de dados e de data de leitura.",
      "Inclua um indicador que mostre se alguém ficou para trás.",
      "Decida desde já quem paga a manutenção e para onde vai o equipamento antigo.",
      "Na revisão, «parar» tem de ser uma opção possível.",
    ],
    verificacao: [
      {
        pergunta: "«Número de pessoas formadas» é indicador de resultado?",
        resposta: "Não. É indicador de actividade.",
        feedback: "O resultado seria, por exemplo, a proporção de pedidos concluídos à primeira depois da formação.",
      },
      {
        pergunta: "Para que serve um indicador de equidade?",
        resposta: "Para mostrar se o benefício se distribuiu ou se concentrou num grupo.",
        feedback: "Uma média favorável pode esconder a deterioração de um canal ou de um grupo de utentes.",
      },
      {
        pergunta: "Indique uma dimensão de sustentabilidade frequentemente esquecida.",
        resposta: "O destino do equipamento substituído e o prolongamento da vida do existente.",
        feedback: "É também a dimensão com efeito ambiental mais directo.",
      },
    ],
    guiao: {
      preparacao: [
        "Levar exemplos de indicadores de actividade e de resultado para o grupo classificar.",
        "Confirmar se a instituição tem procedimento de abate de equipamento, sem pressupor.",
      ],
      conducao: [
        "Distinção entre actividade e resultado, com exemplos do grupo.",
        "Elementos de um indicador, equidade e sustentabilidade.",
        "Trabalho de grupo.",
        "Fecho do módulo 3 e preparação da revisão e do exame final.",
      ],
      criterios: [
        "Os três indicadores são de resultado e têm os quatro elementos.",
        "O indicador de equidade identifica a desigualdade concreta que permite detectar.",
        "O plano de sustentabilidade nomeia responsáveis nas três dimensões.",
        "Está prevista uma revisão periódica com data.",
      ],
      errosComuns: [
        "Apresentar indicadores de actividade como resultado.",
        "Indicadores sem fonte de dados identificada.",
        "Ignorar o destino do equipamento substituído.",
      ],
    },
  },
};
