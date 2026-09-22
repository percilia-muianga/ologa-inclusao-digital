/**
 * Conteúdo original das lições do curso «Introdução à Inteligência Artificial».
 *
 * Estado editorial (validação pedagógica pendente, materiais por produzir):
 * registado em docs/pontos-por-validar.md, não exibido na plataforma.
 * Todos os casos, nomes, instituições, números e textos de exemplo são
 * FICTÍCIOS e servem apenas de exercício. Não há pessoas reais, não há
 * estatísticas oficiais e não há conclusões jurídicas.
 *
 * Este ficheiro vive fora de src/ para não entrar no pacote do navegador; é
 * lido apenas pelo seed (scripts/seed-inteligencia-artificial.ts).
 *
 * Este ficheiro contém o módulo 1; as quatro lições do módulo 2 vivem em
 * inteligencia-artificial-m2.ts e são reunidas aqui em LICOES.
 */

import type { TemposLicao } from "../../src/lib/plano-inteligencia-artificial";
import { LICOES_M2, DESCRICAO_M2 } from "./inteligencia-artificial-m2";

/** Fonte consultada, com data. `resumo` é síntese original da equipa. */
export type Referencia = {
  titulo: string;
  url: string;
  consultadoEm: string;
  resumo?: string;
};

export type Pratica = {
  titulo: string;
  /** O que se faz, em uma frase. */
  objectivo: string;
  preRequisitos: string[];
  passos: string[];
  registo: string[];
  /** Caminho alternativo quando a ferramenta não está disponível. */
  contingencia: string[];
};

export type ConteudoLicao = {
  objectivos: string[];
  explicacao: string[];
  exemplo: { titulo: string; corpo: string[] };
  /** Tabela de dados fornecida por inteiro, quando a actividade precisa dela. */
  tabela?: { titulo: string; nota: string; colunas: string[]; linhas: string[][] };
  /** Texto fictício completo fornecido aos formandos. */
  anexos?: { titulo: string; nota: string; corpo: string[] }[];
  /** Os minutos não são escritos aqui: vêm de TemposLicao (fonte única). */
  actividade: { formato: string; enunciado: string[]; produto: string; rubrica: string[] };
  pratica?: Pratica;
  sintese: string[];
  verificacao: { pergunta: string; resposta: string; feedback: string }[];
  referencias?: Referencia[];
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

const lista = (itens: string[]) => `<ul>${itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

const paragrafos = (itens: string[]) => itens.map((p) => `<p>${esc(p)}</p>`).join("");

/**
 * Nota factual que acompanha cada lição. O estado editorial (validação
 * pedagógica, materiais por produzir, decisões por confirmar) NÃO é exibido ao
 * formando: fica registado em docs/pontos-por-validar.md.
 */
export const NOTA_CASOS_HTML =
  "<p><em>Todos os casos, nomes, instituições e números usados nesta lição são " +
  "fictícios e servem apenas de exercício.</em></p>";

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
  const m = minutosPorBloco(t);
  return `<ul>${BLOCOS_TEMPO.map((b, i) => `<li>${b}: ${m[i]} minutos.</li>`).join("")}</ul>`;
}

function faixas(t: TemposLicao): string[] {
  let inicio = 0;
  return minutosPorBloco(t).map((m) => {
    const faixa = `${inicio}–${inicio + m} min`;
    inicio += m;
    return faixa;
  });
}

const ORGANIZACAO_HTML =
  "<p><strong>Como trabalhamos na sala:</strong> recomenda-se um computador por pessoa. " +
  "Quando não for possível, no máximo duas pessoas por computador, alternando quem " +
  "executa a meio da actividade, de modo que ambas façam. Na partilha apresentam apenas " +
  "dois grupos, com tempo limitado; os restantes entregam por escrito e recebem " +
  "comentário do formador. Marcar a lição como concluída é registo de aprendizagem e " +
  "não é registo de assiduidade.</p>";

function tabelaHtml(c: ConteudoLicao): string {
  const t = c.tabela;
  if (!t) return "";
  return [
    `<h3>${esc(t.titulo)}</h3>`,
    `<p>${esc(t.nota)}</p>`,
    "<table><thead><tr>",
    t.colunas.map((x) => `<th scope="col">${esc(x)}</th>`).join(""),
    "</tr></thead><tbody>",
    t.linhas.map((l) => `<tr>${l.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join(""),
    "</tbody></table>",
  ].join("");
}

function anexosHtml(c: ConteudoLicao): string {
  if (!c.anexos?.length) return "";
  return c.anexos
    .map(
      (a) =>
        `<h3>${esc(a.titulo)}</h3><p><em>${esc(a.nota)}</em></p>${paragrafos(a.corpo)}`,
    )
    .join("");
}

const CONDICOES_PRATICA =
  "<p><strong>Condições desta prática.</strong> A ferramenta de inteligência artificial é " +
  "institucional e previamente autorizada pela entidade; as contas e as permissões são " +
  "preparadas pelo formador antes da sessão. Não se pede a ninguém que crie conta pessoal " +
  "nem que pague, e não se promete que qualquer ferramenta seja gratuita. Nunca se " +
  "introduzem dados reais de pessoas: todos os textos usados são fictícios e estão " +
  "fornecidos no material.</p>";

function praticaHtml(c: ConteudoLicao): string {
  const p = c.pratica;
  if (!p) return "";
  return [
    `<h3>Prática assistida — ${esc(p.titulo)}</h3>`,
    CONDICOES_PRATICA,
    `<p><strong>Objectivo:</strong> ${esc(p.objectivo)}</p>`,
    "<h4>Pré-requisitos preparados pelo formador</h4>",
    lista(p.preRequisitos),
    "<h4>Passos</h4>",
    `<ol>${p.passos.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`,
    "<h4>O que fica registado</h4>",
    lista(p.registo),
    "<h4>Se a ferramenta não estiver disponível</h4>",
    lista(p.contingencia),
  ].join("");
}

function referenciasHtml(c: ConteudoLicao): string {
  if (!c.referencias?.length) return "";
  return (
    "<h3>Referências consultadas</h3><ul>" +
    c.referencias
      .map(
        (r) =>
          `<li>${esc(r.titulo)} — <a href="${esc(r.url)}" rel="noreferrer noopener" target="_blank">${esc(r.url)}</a> (consultado em ${esc(r.consultadoEm)}).` +
          (r.resumo ? `<br><em>Síntese da equipa:</em> ${esc(r.resumo)}` : "") +
          "</li>",
      )
      .join("") +
    "</ul>"
  );
}

export function montarElearning(c: ConteudoLicao, minutos: number, tempos: TemposLicao): string {
  return [
    `<p><strong>Duração prevista:</strong> ${minutos} minutos, em sessão presencial.</p>`,
    NOTA_CASOS_HTML,
    "<h3>Como o tempo desta lição está distribuído</h3>",
    grelhaTempos(tempos),
    ORGANIZACAO_HTML,
    "<h3>Objectivos da lição</h3>",
    lista(c.objectivos),
    "<h3>Explicação</h3>",
    paragrafos(c.explicacao),
    `<h3>${esc(c.exemplo.titulo)}</h3>`,
    paragrafos(c.exemplo.corpo),
    tabelaHtml(c),
    anexosHtml(c),
    "<h3>Actividade prática</h3>",
    `<p>Trabalho ${esc(c.actividade.formato)}, com ${tempos.actividade} minutos de trabalho, seguidos de ${tempos.partilha} minutos de partilha e síntese em plenário.</p>`,
    paragrafos(c.actividade.enunciado),
    `<p><strong>Produto esperado:</strong> ${esc(c.actividade.produto)}</p>`,
    "<h4>Como o produto é apreciado</h4>",
    lista(c.actividade.rubrica),
    praticaHtml(c),
    "<h3>Síntese em leitura fácil</h3>",
    lista(c.sintese),
    "<h3>Verificação formativa</h3>",
    "<p>Estas perguntas não contam para a nota final e não são perguntas do exame final. Servem para a pessoa formanda confirmar o que percebeu.</p>",
    `<ol>${c.verificacao.map((v) => `<li>${esc(v.pergunta)}</li>`).join("")}</ol>`,
    "<h3>Respostas comentadas da verificação formativa</h3>",
    "<p>As respostas abaixo pertencem às perguntas de verificação formativa desta lição. " +
      "<strong>Não são perguntas nem respostas do exame final</strong> e não têm efeito na nota. " +
      "Tente responder primeiro e só depois compare.</p>",
    c.verificacao
      .map(
        (v, i) =>
          `<h4>Pergunta ${i + 1}. ${esc(v.pergunta)}</h4>` +
          `<p><strong>Resposta:</strong> ${esc(v.resposta)}</p>` +
          `<p><strong>Comentário:</strong> ${esc(v.feedback)}</p>`,
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
    `<h3>Guião do formador — ${esc(titulo)}</h3>`,
    `<p><strong>Duração prevista:</strong> ${minutos} minutos, em sessão presencial. Os tempos abaixo somam ${minutos} minutos e são os mesmos que a pessoa formanda vê no conteúdo da lição.</p>`,
    "<h4>Preparação</h4>",
    lista(c.guiao.preparacao),
    "<h4>Condução</h4>",
    `<ol>${c.guiao.conducao
      .map((passo, i) => `<li><strong>${faixa[i]} (${BLOCOS_TEMPO[i]}):</strong> ${esc(passo)}</li>`)
      .join("")}</ol>`,
    "<h4>Critérios de apreciação do produto da actividade</h4>",
    lista(c.guiao.criterios),
    "<h4>Erros comuns a antecipar</h4>",
    lista(c.guiao.errosComuns),
    "<h4>Respostas comentadas da verificação formativa (não é o exame)</h4>",
    `<ol>${c.verificacao
      .map(
        (v) =>
          `<li><strong>${esc(v.pergunta)}</strong><br>Resposta: ${esc(v.resposta)}<br>Comentário: ${esc(v.feedback)}</li>`,
      )
      .join("")}</ol>`,
    "<p><strong>Separação pedagógica:</strong> este guião não contém perguntas nem " +
      "respostas do exame final; as respostas acima são apenas da verificação formativa. " +
      "O exame final é gerado no momento em que a pessoa formanda o inicia e o gabarito " +
      "fica sempre apenas no servidor.</p>",
  ].join("");
}

const OECD = {
  titulo: "OECD AI Principles — definição de sistema de inteligência artificial",
  url: "https://oecd.ai/en/ai-principles",
  consultadoEm: "21 de Setembro de 2026",
};
const NIST = {
  titulo: "NIST AI Risk Management Framework — quadro voluntário de gestão de risco",
  url: "https://www.nist.gov/itl/ai-risk-management-framework",
  consultadoEm: "21 de Setembro de 2026",
};

// ---------------------------------------------------------------------------
// M1 L1 — O que é inteligência artificial
// ---------------------------------------------------------------------------

const M1L1: ConteudoLicao = {
  objectivos: [
    "Explicar, por palavras próprias e em duas frases, o que é um sistema de inteligência artificial, usando a ideia de inferir saídas a partir de dados de entrada.",
    "Classificar correctamente pelo menos seis dos oito casos fornecidos na ficha como automação por regras escritas por pessoas ou como sistema que infere a partir de dados, justificando cada escolha numa frase.",
    "Nomear três limites da inteligência artificial e dar, para cada um, um exemplo de consequência num serviço público.",
    "Identificar, num texto gerado por computador fornecido na ficha, pelo menos duas afirmações que precisam de ser confirmadas na fonte antes de serem usadas.",
  ],
  explicacao: [
    "Comecemos por uma descrição de trabalho. Um sistema de inteligência artificial é um sistema baseado em máquina que, a partir de dados que recebe, infere como produzir saídas — por exemplo previsões, classificações, recomendações, textos ou imagens — e essas saídas podem influenciar decisões e ambientes reais. Esta é uma paráfrase, em palavras nossas, da descrição usada nos Princípios de Inteligência Artificial da OCDE. Duas ideias dessa descrição merecem atenção: o grau de autonomia varia de sistema para sistema, e a capacidade de se adaptar depois de instalado também varia. Há sistemas que não se adaptam nada depois de entrarem em serviço.",
    "A palavra que faz o trabalho pesado é «inferir». Inferir significa tirar uma conclusão a partir de exemplos, e não seguir uma regra que alguém escreveu à mão. Se uma folha de cálculo multiplica a área de um terreno por um valor por metro quadrado e devolve a taxa a pagar, isso é automação: alguém escreveu a fórmula, e a fórmula faz sempre o mesmo. Isso é útil, é rápido e é auditável — mas não é inteligência artificial. Convém dizê-lo com clareza, porque circula a ideia contrária: nem toda a regra é inteligência artificial, e nem todo o algoritmo é inteligência artificial. Um algoritmo é apenas um procedimento com passos definidos; ordenar uma lista por ordem alfabética é um algoritmo e não tem nada de inteligência artificial.",
    "Um pouco de história, sem mitologia. O termo «inteligência artificial» aparece em meados do século XX, associado a um encontro académico de 1956 nos Estados Unidos. Seguiram-se décadas com ciclos: períodos de grande entusiasmo e financiamento, seguidos de períodos de desilusão quando os resultados prometidos não chegaram. Nas últimas duas décadas, três coisas mudaram ao mesmo tempo — passou a haver muito mais dados registados em formato digital, muito mais capacidade de cálculo acessível, e métodos de treino melhores. É essa combinação, e não uma descoberta isolada, que explica o que vemos hoje.",
    "Hoje é útil distinguir duas famílias. A primeira é a inteligência artificial estreita: sistemas treinados para uma tarefa específica, como reconhecer se uma fotografia de um documento está legível, prever quais pedidos têm maior probabilidade de virem incompletos, ou transcrever voz em texto. Fazem essa tarefa e mais nenhuma. A segunda é a inteligência artificial generativa: sistemas que produzem conteúdo novo — texto, imagem, som, código — a partir de uma instrução escrita. Um assistente de escrita que redige um rascunho de ofício pertence a esta segunda família. Ambas são estreitas no sentido em que não têm compreensão, intenção nem responsabilidade: a responsabilidade é sempre de quem usa e de quem decide.",
    "É preciso desfazer um equívoco frequente: a ideia de que a inteligência artificial «aprende sempre enquanto é usada». Na maior parte dos casos não é assim. O sistema é treinado antes, com um conjunto de dados, e depois é instalado. Durante o uso limita-se a aplicar o que aprendeu. Só passa a comportar-se de outra maneira se houver um novo treino, decidido e autorizado por alguém. Alguns sistemas são de facto configurados para se actualizarem com dados novos, mas isso é uma decisão de desenho, com riscos próprios, e não uma propriedade automática de tudo o que se chama inteligência artificial.",
    "Vantagens, quando o uso é adequado: tratar volumes de texto ou de registos que nenhuma equipa conseguiria ler em tempo útil; propor um primeiro rascunho que a pessoa depois corrige; encontrar padrões que não são visíveis a olho; tornar serviços mais acessíveis, por exemplo transcrevendo áudio ou lendo texto em voz alta. Limites, que são igualmente reais: o sistema só é tão bom quanto os dados com que foi treinado; erra de formas difíceis de prever; não explica facilmente porque respondeu aquilo; e reproduz desigualdades que existam nos dados. O quadro voluntário de gestão de risco de inteligência artificial do NIST organiza precisamente este trabalho — identificar, medir e reduzir riscos ao longo de todo o ciclo de vida do sistema. É voluntário: é uma referência de boa prática, não uma lei.",
    "Um facto que interessa a toda a gente que trabalha com documentos: a fluência de uma saída não garante que ela seja verdadeira. Um sistema generativo produz texto bem construído, com boa gramática e tom seguro, mesmo quando a informação está errada ou foi inventada. O texto pode conter um número de diploma que não existe, uma data trocada ou uma citação atribuída a quem nunca a disse — e nada na aparência do texto avisa. Por isso a regra de trabalho é simples e não tem excepção: tudo o que vier de um sistema destes é rascunho, e tudo o que for facto verificável confirma-se na fonte antes de sair do serviço.",
  ],
  exemplo: {
    titulo: "Caso fictício — o balcão de licenças de Muanzo",
    corpo: [
      "A Direcção Distrital Fictícia de Muanzo atende pedidos de licença de ocupação de espaço para bancas de mercado. Tudo o que se segue é inventado para esta aula: o distrito, a direcção, os números e as pessoas não existem.",
      "A direcção tem três coisas novas no balcão e chama às três «o novo sistema inteligente». Vale a pena separá-las. A primeira calcula a taxa a pagar: pega na área da banca, multiplica pelo valor da tabela aprovada e acrescenta uma percentagem se a banca ficar junto à entrada principal. Está escrita numa folha de cálculo por uma técnica da direcção e faz sempre exactamente o mesmo.",
      "A segunda olha para cada pedido que entra e estima a probabilidade de esse pedido vir a ser devolvido por falta de documentos. Foi construída a partir de mil e duzentos pedidos antigos, com a indicação de quais tinham sido devolvidos, e aprendeu sozinha que combinações de características costumam aparecer nos pedidos devolvidos. Ninguém escreveu essas combinações à mão.",
      "A terceira recebe um resumo de três linhas escrito pelo técnico e devolve um rascunho de ofício de indeferimento, com fundamentação redigida. O texto sai bem escrito. Na semana passada saiu bem escrito e citou um artigo de um regulamento distrital que não existe.",
      "Das três, a primeira é automação por regras. A segunda e a terceira inferem a partir de exemplos: são sistemas de inteligência artificial. E a terceira mostra o problema central desta lição — a qualidade da escrita não diz nada sobre a veracidade do conteúdo. Se aquele ofício tivesse saído sem leitura, teria fundamentado uma decisão administrativa num artigo inventado.",
    ],
  },
  tabela: {
    titulo: "Ficha de trabalho — oito casos para classificar",
    nota:
      "Casos fictícios, preparados para esta aula. A coluna da direita fica em branco e é preenchida pelo grupo.",
    colunas: ["N.º", "Caso", "Classificação e justificação"],
    linhas: [
      ["1", "Uma folha de cálculo soma as taxas devidas segundo a tabela aprovada e devolve o total.", ""],
      ["2", "Um sistema estima, a partir de dez mil pedidos antigos, quais os novos pedidos com maior risco de ficarem incompletos.", ""],
      ["3", "Um filtro de correio move para uma pasta todas as mensagens cujo assunto contenha a palavra «licença».", ""],
      ["4", "Uma aplicação transcreve em texto a gravação áudio de uma reunião, em português.", ""],
      ["5", "Um portal recusa o formulário quando o campo do número de identificação tem menos de nove dígitos.", ""],
      ["6", "Um assistente redige um rascunho de ofício a partir de três linhas de instrução escritas pelo técnico.", ""],
      ["7", "Um relógio de ponto marca falta quando a entrada é registada depois das oito horas.", ""],
      ["8", "Um sistema agrupa sozinho os pedidos recebidos em conjuntos parecidos entre si, sem que alguém tenha dito quais são os grupos.", ""],
    ],
  },
  anexos: [
    {
      titulo: "Anexo — texto gerado por computador, para verificação",
      nota:
        "Texto fictício, produzido para esta aula como exemplo de saída gerada. Contém afirmações que têm de ser confirmadas na fonte. Não é um documento real e não cita legislação real.",
      corpo: [
        "«Informa-se que o pedido de licença de ocupação n.º 118/2026 foi indeferido. O indeferimento fundamenta-se no artigo 14.º do Regulamento Distrital de Ocupação de Espaço Público de Muanzo, que fixa em quarenta e cinco dias o prazo máximo de instrução do processo. Verificou-se ainda que o requerente não apresentou a declaração de conformidade sanitária, documento exigido desde a revisão de 2023. Mais se informa que, segundo os dados da Direcção, noventa e dois por cento dos pedidos com esta falta são indeferidos. Do presente indeferimento cabe recurso no prazo de dez dias úteis.»",
      ],
    },
  ],
  actividade: {
    formato: "em pares, com ficha em papel — não é necessário computador",
    enunciado: [
      "Parte A. Peguem na ficha dos oito casos, acima. Para cada caso, escrevam na terceira coluna uma de duas classificações: «automação por regras escritas por pessoas» ou «sistema que infere a partir de dados». Acrescentem uma frase de justificação. A pergunta que ajuda a decidir é sempre a mesma: alguém escreveu à mão a regra que produz este resultado, ou o comportamento foi obtido a partir de exemplos?",
      "Parte B. Escolham dois dos casos que classificaram como sistemas que inferem e escrevam, para cada um, um risco concreto para o serviço e uma medida simples de controlo. Exemplo de formato: «Risco: o sistema marca como incompletos sobretudo pedidos de um bairro; Medida: comparar mensalmente as taxas de marcação por bairro.»",
      "Parte C. Leiam o anexo com o texto gerado por computador. Sublinhem pelo menos duas afirmações que não podem ser aceites sem confirmação e escrevam, ao lado de cada uma, onde é que se confirmaria: em que documento, com que serviço, com que pessoa responsável.",
      "A meio do tempo, quem estava a escrever passa a caneta à outra pessoa. As duas partes têm de escrever.",
    ],
    produto:
      "Uma ficha por par, com os oito casos classificados e justificados, dois riscos com a respectiva medida de controlo, e o anexo anotado com pelo menos duas afirmações a confirmar e a indicação de onde se confirma cada uma.",
    rubrica: [
      "Classificação correcta de pelo menos seis dos oito casos.",
      "Justificações que falam de onde vem o comportamento do sistema (regra escrita ou exemplos), e não apenas «é moderno» ou «usa computador».",
      "Dois riscos concretos, ligados ao caso escolhido, com uma medida de controlo que a direcção consiga mesmo executar.",
      "Pelo menos duas afirmações do anexo assinaladas, com a fonte de confirmação indicada de forma útil (documento, serviço ou responsável, e não «na internet»).",
      "Participação das duas pessoas do par, visível na alternância da escrita.",
    ],
  },
  sintese: [
    "Inteligência artificial é um sistema que, a partir de dados, infere resultados: previsões, classificações, recomendações ou textos.",
    "Inferir é tirar conclusões a partir de exemplos. Não é seguir uma regra escrita à mão.",
    "Uma fórmula, um filtro ou uma validação de formulário são automação. Não são inteligência artificial.",
    "Nem todo o algoritmo é inteligência artificial.",
    "A maioria destes sistemas é treinada antes e não aprende sozinha durante o uso.",
    "A inteligência artificial ajuda a tratar muita informação e a preparar rascunhos.",
    "A inteligência artificial erra, depende dos dados com que foi treinada e não explica bem as suas respostas.",
    "Um texto bem escrito pode estar errado. A boa escrita não prova que a informação é verdadeira.",
    "Antes de usar, a pessoa confirma os factos na fonte. A responsabilidade é de quem decide.",
  ],
  verificacao: [
    {
      pergunta:
        "Uma direcção usa uma folha de cálculo que aplica a tabela de taxas aprovada e devolve o valor a pagar. Isto é um sistema de inteligência artificial? Porquê?",
      resposta:
        "Não. É automação por uma regra que uma pessoa escreveu; o sistema não infere nada a partir de exemplos.",
      feedback:
        "O critério não é ser informático nem ser recente. O critério é a origem do comportamento: aqui a fórmula foi escrita à mão e aplica-se sempre igual. Seria diferente se o valor fosse estimado a partir de casos anteriores.",
    },
    {
      pergunta:
        "Um colega diz: «este assistente de escrita vai melhorando sozinho à medida que o usamos todos os dias». Que resposta dá, e que cuidado é preciso ter com o texto que ele produz?",
      resposta:
        "Em regra não melhora sozinho: foi treinado antes e, durante o uso, aplica o que aprendeu. Só muda se houver um novo treino decidido e autorizado. Quanto ao texto, mesmo bem escrito pode conter factos errados ou inventados, por isso tudo é confirmado na fonte antes de sair do serviço.",
    feedback:
        "As duas partes desta resposta são as duas ideias que mais evitam problemas no dia-a-dia: o sistema não se corrige sozinho, e a fluência não é prova de verdade.",
    },
  ],
  referencias: [OECD, NIST],
  guiao: {
    preparacao: [
      "Imprimir a ficha dos oito casos e o anexo com o texto gerado, um exemplar por par.",
      "Confirmar a projecção e o contraste da sala; ler em voz alta o texto do anexo para quem não vê bem o ecrã.",
      "Preparar dois exemplos locais próprios, não fictícios do material, apenas se tiver a certeza dos factos; caso contrário usar só os casos da ficha.",
      "Não é necessária ligação à internet nem ferramenta de inteligência artificial nesta lição.",
    ],
    conducao: [
      "Apresentar os objectivos e perguntar à turma que exemplos de inteligência artificial já usaram ou ouviram falar. Anotar três no quadro sem os corrigir ainda — voltam no fim.",
      "Expor a descrição de sistema de inteligência artificial e a ideia de inferência; a distinção entre automação por regras e sistema que infere; a breve história; inteligência artificial estreita e generativa; o equívoco de «aprende sozinha com o uso»; vantagens e limites; e o facto de que texto fluente não é texto verdadeiro. Usar o caso de Muanzo como fio condutor.",
      "Lançar a actividade em pares, partes A, B e C. Circular pela sala. Aos 30 minutos, avisar em voz alta que é o momento de trocar quem escreve. Aos 50 minutos, avisar que faltam 10.",
      "Chamar dois grupos a apresentar, três minutos cada, um sobre a parte A e outro sobre a parte C. Recolher as fichas dos restantes para comentário escrito. Fechar voltando aos três exemplos escritos no quadro no início e classificando-os com a turma.",
    ],
    criterios: [
      "Seis ou mais casos correctamente classificados.",
      "Justificações centradas na origem do comportamento do sistema.",
      "Riscos concretos, com medida de controlo executável pela direcção.",
      "Duas ou mais afirmações do anexo assinaladas, com fonte de confirmação identificada.",
    ],
    errosComuns: [
      "Classificar como inteligência artificial tudo o que é digital ou recente.",
      "Confundir «tem um algoritmo» com «é inteligência artificial».",
      "Assumir que o sistema aprende com cada utilização.",
      "Aceitar o texto do anexo por estar bem redigido — é exactamente a armadilha do exercício.",
      "Deixar uma só pessoa do par escrever a ficha inteira.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M1 L2 — Dados, algoritmos e modelos
// ---------------------------------------------------------------------------

const M1L2: ConteudoLicao = {
  objectivos: [
    "Distinguir, com exemplos do conjunto fornecido, característica de rótulo, e algoritmo de modelo.",
    "Identificar pelo menos cinco problemas no mini-conjunto de dados fornecido e classificar cada um como qualidade, representatividade, privacidade ou vazamento de dados.",
    "Descrever, por palavras próprias, para que serve cada um dos conjuntos de treino, validação e teste, e o que é a inferência.",
    "Propor, para cada problema identificado, uma correcção concreta antes de o conjunto ser usado.",
  ],
  explicacao: [
    "Nesta lição olhamos para a matéria-prima. Sem dados não há aprendizagem automática, e a maior parte dos problemas que aparecem nos sistemas não nasce do método: nasce dos dados.",
    "Comecemos pelo vocabulário. Cada linha de uma tabela é um caso, por exemplo um pedido de licença. Cada coluna que descreve o caso é uma característica: o distrito, o número de dias que o pedido esperou, se os documentos estavam completos. A coluna que queremos prever chama-se rótulo: no nosso exemplo, se o pedido foi devolvido ou não. Treinar um sistema é mostrar-lhe muitos casos com as características e o rótulo já conhecido, para que ele encontre relações entre uns e outro.",
    "Algoritmo e modelo não são a mesma coisa, e a confusão entre os dois gera mal-entendidos. O algoritmo é o procedimento de aprendizagem: o conjunto de passos que percorre os dados e ajusta números. O modelo é o resultado desse procedimento: o objecto já treinado, com os números ajustados, que se aplica a casos novos. Uma comparação útil: o algoritmo é a receita e o processo de cozinhar; o modelo é o prato que saiu. A mesma receita, com ingredientes diferentes, dá pratos diferentes.",
    "A qualidade dos dados é a primeira coisa a verificar, e verifica-se a olho antes de qualquer cálculo. Valores em falta, valores impossíveis — uma idade de 187 anos, um prazo de menos três dias —, a mesma informação escrita de várias maneiras («Muanzo», «muanzo», «Muanzo Sede»), linhas duplicadas, datas trocadas. Nada disto exige saber programar para ser detectado. Exige ler a tabela.",
    "A representatividade é um problema diferente e mais traiçoeiro, porque os dados podem estar tecnicamente correctos e ainda assim não servirem. Se nove em cada dez registos vierem de um único distrito, o modelo aprende sobretudo esse distrito e comporta-se pior nos outros — mas os números da avaliação global podem parecer bons, porque também os casos de teste vêm quase todos do mesmo sítio. A pergunta a fazer é sempre: quem está a mais e quem está a menos nesta tabela, comparado com as pessoas que o serviço realmente atende?",
    "O vazamento de dados é o erro mais embaraçoso, porque produz resultados excelentes e falsos. Acontece quando entra no treino uma informação que, na vida real, só existe depois de o resultado ser conhecido. Se a tabela tiver uma coluna «data de emissão da licença», o modelo descobre imediatamente que quem tem data de emissão foi deferido, e acerta quase sempre — mas no momento em que o pedido dá entrada essa coluna está vazia, e o modelo é inútil. Também há vazamento quando os mesmos casos aparecem no treino e no teste: o sistema é avaliado com perguntas cuja resposta já viu.",
    "Para evitar iludirmo-nos, os dados dividem-se em três partes, antes de começar. O conjunto de treino é onde o modelo aprende. O conjunto de validação serve para comparar alternativas e afinar escolhas, ainda durante o desenvolvimento. O conjunto de teste fica guardado, intocado, e usa-se uma única vez no fim, para estimar o desempenho com casos que o sistema nunca viu. Depois disto tudo vem a inferência, que é simplesmente o uso: dar ao modelo já treinado um caso novo e receber a saída. Treino e inferência são momentos diferentes — no dia-a-dia do serviço acontece inferência, não treino.",
    "Uma palavra sobre privacidade, que se desenvolve no módulo 2 e já obriga aqui. Um conjunto de dados para formação ou para ensaio não precisa de nomes, números de identificação, moradas nem contactos. O princípio prático é recolher e conservar apenas o que é necessário para o fim em causa. Nesta aula, e em todas as actividades deste curso, trabalhamos exclusivamente com dados inventados. Sobre o enquadramento legal aplicável em Moçambique, quem responde é a área jurídica da instituição; este curso não dá pareceres jurídicos.",
  ],
  exemplo: {
    titulo: "Caso fictício — a tabela que a Direcção de Muanzo quer usar",
    corpo: [
      "A Direcção Distrital Fictícia de Muanzo quer um sistema que avise, logo à entrada, quando um pedido de licença tem risco elevado de ser devolvido por falta de documentos. Pediu ao sector de informática a tabela dos pedidos do ano passado.",
      "O que chegou foi um ficheiro exportado à pressa, com dez linhas de amostra para começar. A técnica responsável imprimiu a amostra e sentou-se a lê-la antes de mandar seguir. Fez bem: numa tabela de dez linhas encontrou problemas suficientes para travar o trabalho.",
      "A amostra está a seguir, completa. Repare-se que há uma coluna «resultado», que é o rótulo, e uma coluna «data de emissão da licença», que só é preenchida depois de a decisão estar tomada.",
    ],
  },
  tabela: {
    titulo: "Mini-conjunto de dados fictício — dez pedidos de licença",
    nota:
      "Dados inteiramente inventados para esta aula. Nenhuma pessoa, número ou instituição é real. A tabela está completa: não é preciso programar nem consultar mais nada para fazer a actividade.",
    colunas: [
      "N.º do pedido",
      "Nome do requerente",
      "Idade",
      "Distrito",
      "Dias até à decisão",
      "Documentos completos",
      "Data de emissão da licença",
      "Resultado (rótulo)",
    ],
    linhas: [
      ["001", "Amélia Fictícia Chirindza", "34", "Muanzo", "12", "sim", "18/02/2026", "deferido"],
      ["002", "Bento Fictício Macuácua", "0", "Muanzo", "9", "sim", "02/03/2026", "deferido"],
      ["003", "Carla Fictícia Nhantumbo", "41", "", "21", "não", "", "devolvido"],
      ["004", "Duarte Fictício Sitoe", "29", "Muanzo", "-3", "sim", "11/03/2026", "deferido"],
      ["005", "Elsa Fictícia Matola", "52", "muanzo sede", "17", "não", "", "devolvido"],
      ["006", "Filipe Fictício Cossa", "187", "Muanzo", "14", "sim", "20/03/2026", "deferido"],
      ["007", "Amélia Fictícia Chirindza", "34", "Muanzo", "12", "sim", "18/02/2026", "deferido"],
      ["008", "Gil Fictício Muianga", "38", "Muanzo", "10", "sim", "25/03/2026", "deferido"],
      ["009", "Hélia Fictícia Zandamela", "45", "Muanzo", "8", "sim", "27/03/2026", "deferido"],
      ["010", "Ivo Fictício Tembe", "31", "Nhamize", "19", "não", "", "devolvido"],
    ],
  },
  actividade: {
    formato: "em pares, com a tabela em papel — não é necessário programar nem usar computador",
    enunciado: [
      "Parte A. Identifiquem na tabela pelo menos cinco problemas. Para cada um escrevam: o número da linha ou o nome da coluna onde está, o problema em uma frase, e a classificação — qualidade dos dados, representatividade, privacidade, ou vazamento de dados.",
      "Parte B. Para cada problema identificado, escrevam a correcção concreta a fazer antes de o conjunto ser usado. A correcção tem de ser executável por quem prepara os dados; «melhorar os dados» não é uma correcção.",
      "Parte C. Respondam em três frases: se este conjunto fosse usado tal como está, e o resultado parecesse excelente, porque é que esse excelente resultado não seria de confiança? Usem as palavras «vazamento» e «representatividade».",
      "Parte D. Separem, numa linha cada: qual é o rótulo desta tabela; duas colunas que são características legítimas; e uma coluna que não deve entrar no treino, com a razão.",
      "A meio do tempo, troquem quem escreve.",
    ],
    produto:
      "Uma ficha por par com, no mínimo, cinco problemas identificados e classificados, uma correcção concreta para cada um, a resposta da parte C em três frases, e a separação pedida na parte D.",
    rubrica: [
      "Cinco ou mais problemas encontrados, com a linha ou coluna indicada.",
      "Classificação correcta de pelo menos quatro deles nas quatro categorias dadas.",
      "Correcções executáveis, e não intenções genéricas.",
      "Na parte C, reconhecer que a coluna da data de emissão provoca vazamento e que nove em dez registos serem de um só distrito compromete a representatividade.",
      "Na parte D, identificar «resultado» como rótulo e apontar pelo menos uma coluna a excluir, com razão.",
      "Participação das duas pessoas do par.",
    ],
  },
  sintese: [
    "Cada linha da tabela é um caso. Cada coluna que descreve o caso é uma característica.",
    "A coluna que queremos prever chama-se rótulo.",
    "O algoritmo é o procedimento que aprende. O modelo é o resultado já treinado.",
    "Antes de treinar, lê-se a tabela: valores em falta, valores impossíveis, nomes escritos de várias maneiras, linhas repetidas.",
    "Se quase todos os registos vierem do mesmo sítio ou do mesmo tipo de pessoa, o sistema não serve para os outros.",
    "Vazamento de dados é usar no treino uma informação que só existe depois de a decisão estar tomada. Dá resultados óptimos e falsos.",
    "Os dados dividem-se em treino, validação e teste. O teste fica guardado e usa-se só no fim.",
    "Inferência é usar o modelo já treinado num caso novo.",
    "Num conjunto de ensaio não se põem nomes nem números de identificação. Recolhe-se só o necessário.",
  ],
  verificacao: [
    {
      pergunta:
        "Na tabela da aula, porque é que a coluna «data de emissão da licença» não pode entrar no treino de um sistema que avisa à entrada do pedido?",
      resposta:
        "Porque essa data só existe depois de o pedido ser deferido. É vazamento de dados: o modelo acertaria quase sempre no ensaio e seria inútil no balcão, onde a coluna está vazia.",
      feedback:
        "O teste prático é sempre este: no momento em que o sistema tem de responder, esta informação já existe? Se não existe, não pode entrar no treino.",
    },
    {
      pergunta:
        "Qual é a diferença entre algoritmo e modelo, e porque é que dois serviços podem usar o mesmo algoritmo e obter modelos com comportamentos diferentes?",
      resposta:
        "O algoritmo é o procedimento de aprendizagem; o modelo é o objecto treinado que resulta desse procedimento. Com dados diferentes, o mesmo algoritmo produz modelos diferentes, porque o que o modelo aprendeu vem dos dados.",
      feedback:
        "Daqui decorre uma consequência prática: perguntar «que algoritmo usaram?» diz pouco. A pergunta útil é «com que dados foi treinado, e quem está representado nesses dados?».",
    },
  ],
  referencias: [OECD, NIST],
  guiao: {
    preparacao: [
      "Imprimir a tabela das dez linhas em formato legível, um exemplar por par, com letra grande.",
      "Preparar a mesma tabela em projecção para a exposição.",
      "Ter uma versão da tabela em ficheiro de texto simples para quem usa leitor de ecrã.",
      "Não é necessária ligação à internet nem qualquer ferramenta de inteligência artificial nesta lição.",
    ],
    conducao: [
      "Retomar a lição anterior numa pergunta: se a inteligência artificial aprende com exemplos, o que acontece se os exemplos estiverem errados? Apresentar os objectivos.",
      "Expor característica e rótulo; algoritmo e modelo; qualidade; representatividade; vazamento de dados; treino, validação, teste e inferência; e a regra de minimização de dados. Projectar a tabela e mostrar ao vivo dois dos problemas, deixando os restantes para a turma.",
      "Lançar a actividade em pares, partes A a D. Circular e resistir a apontar os problemas: fazer perguntas em vez de dar respostas. Avisar da troca de quem escreve aos 30 minutos e do fim aos 50.",
      "Chamar dois grupos, três minutos cada: um apresenta a lista de problemas, outro apresenta a parte C. Recolher as restantes fichas. Fechar com a lista completa dos problemas plantados na tabela.",
    ],
    criterios: [
      "Cinco ou mais problemas encontrados e localizados.",
      "Classificação correcta na maioria dos casos.",
      "Correcções concretas e executáveis.",
      "Vazamento e representatividade correctamente explicados na parte C.",
    ],
    errosComuns: [
      "Confundir dado em falta com dado errado — convém separar, porque a correcção é diferente.",
      "Não reparar na linha duplicada, por estar afastada da original.",
      "Achar que ter nomes na tabela é inofensivo por ser «só para ensaio».",
      "Tratar a representatividade como um detalhe estatístico e não como um problema de justiça no atendimento.",
      "Procurar uma solução informática quando o que falta é ler a tabela.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M1 L3 — Aprendizagem automática em linguagem simples
// ---------------------------------------------------------------------------

const M1L3: ConteudoLicao = {
  objectivos: [
    "Distinguir aprendizagem supervisionada, não supervisionada e por reforço, dando um exemplo próprio de cada uma num serviço público.",
    "Explicar porque é que a inteligência artificial generativa não é uma quarta categoria separada destas três.",
    "Calcular, a partir da tabela de resultados fornecida, a taxa de acerto, o número de falsos positivos e o número de falsos negativos, e interpretar o que cada um significa para as pessoas atendidas.",
    "Reconhecer sobreajustamento a partir da diferença entre o desempenho no treino e no conjunto reservado.",
  ],
  explicacao: [
    "Aprendizagem automática é o conjunto de métodos que permite a um sistema melhorar o seu desempenho numa tarefa a partir de exemplos, em vez de seguir regras escritas à mão. Há três formas principais de organizar essa aprendizagem, e distinguem-se pelo tipo de informação que se dá ao sistema.",
    "Na aprendizagem supervisionada, damos exemplos com a resposta certa já indicada. Mostram-se milhares de pedidos com a indicação de quais foram devolvidos, e o sistema aprende a prever essa indicação em pedidos novos. É a forma mais comum na administração pública, porque muitas tarefas são exactamente assim: classificar, encaminhar, prever um resultado que já foi registado no passado.",
    "Na aprendizagem não supervisionada não há resposta certa indicada. Dão-se os casos e pede-se ao sistema que encontre estrutura: que agrupe os pedidos parecidos entre si, ou que assinale os que são muito diferentes de todos os outros. É útil para explorar. Tem uma limitação importante: os grupos que saem não têm nome nem significado garantido. Cabe às pessoas olhar para cada grupo e decidir se corresponde a algo real ou a um acaso dos dados.",
    "Na aprendizagem por reforço, o sistema toma decisões em sequência, num ambiente, e recebe um sinal de recompensa que mede se a sequência de decisões está a correr bem. Aprende tentando e ajustando. Convém desfazer aqui um equívoco comum: aprendizagem por reforço não é simplesmente «o utilizador carrega em gosto ou não gosto». É um processo de treino, com um ambiente definido, um conjunto de acções possíveis e uma função de recompensa escolhida por alguém. As preferências humanas podem ser usadas para construir esse sinal, mas o sinal não é o clique — e a escolha do que se recompensa determina o comportamento que sai. Recompensar «fechar processos depressa» produz um sistema diferente de recompensar «fechar processos correctamente».",
    "E a inteligência artificial generativa, onde entra? Não é uma quarta categoria ao lado destas três, e não é mutuamente exclusiva delas. É uma família de modelos definida pelo que produz — conteúdo novo — e não pela forma como aprende. Na prática, esses modelos são treinados sobretudo prevendo a continuação de textos existentes, o que é uma forma de supervisão gerada a partir dos próprios dados, e depois costumam ser afinados com métodos que incorporam preferências humanas, incluindo variantes de reforço. Ou seja: a generativa usa estas formas de aprendizagem, não se opõe a elas.",
    "Ainda sobre a generativa, repete-se o que ficou dito na primeira lição porque é o equívoco mais persistente: um assistente generativo não aprende automaticamente com cada conversa. Ele pode ter memória do que foi dito dentro daquela conversa, o que dá a impressão de aprendizagem, mas isso desaparece quando a conversa termina e não altera o modelo. Alterar o modelo exige um novo treino, decidido, preparado e autorizado.",
    "Passemos ao que corre mal. O sobreajustamento acontece quando o modelo decora particularidades dos exemplos de treino, incluindo ruído e acasos, em vez de aprender o padrão geral. Reconhece-se de uma maneira simples: o desempenho no conjunto de treino é muito bom e no conjunto reservado é bastante pior. Um modelo que acerta 98 por cento nos casos que viu e 85 por cento nos casos que nunca viu está a mostrar esse sinal. A medida que conta é sempre a do conjunto reservado, porque é a que se parece com a realidade.",
    "Depois, os erros. Um classificador engana-se de duas maneiras diferentes, e elas não custam o mesmo. Falso positivo é assinalar algo que afinal não era: marcar como incompleto um pedido que estava completo. O custo recai sobre o requerente, que é incomodado sem razão, e sobre o funcionário, que perde tempo. Falso negativo é deixar passar o que devia ser assinalado: um pedido incompleto que segue e só é travado semanas depois. O custo é o atraso e o retrabalho. Decidir qual dos dois erros é mais tolerável não é uma decisão técnica — é uma decisão de serviço, e tem de ser tomada por quem responde pelo serviço, não pelo sistema.",
    "Por fim, a taxa de acerto sozinha engana. Se apenas dois em cada dez pedidos forem incompletos, um sistema que nunca assinala nada acerta oito em cada dez. Oitenta por cento parece bom e o sistema não serve para nada, porque nunca faz aquilo para que foi criado. É por isso que se olha sempre para a repartição dos erros, e não apenas para a percentagem global.",
  ],
  exemplo: {
    titulo: "Caso fictício — o aviso de pedido incompleto, posto à prova",
    corpo: [
      "A Direcção Distrital Fictícia de Muanzo mandou treinar o tal sistema que avisa quando um pedido parece incompleto. A equipa fez as coisas com cuidado: guardou 200 pedidos num conjunto reservado, que o sistema nunca viu durante o treino, e só no fim usou esse conjunto para medir.",
      "Dos 200 pedidos reservados, 40 estavam efectivamente incompletos e 160 estavam completos. Todos estes números são inventados para a aula.",
      "O sistema assinalou 50 pedidos como incompletos. Desses 50, 30 estavam mesmo incompletos e 20 estavam completos. Dos 150 que não assinalou, 140 estavam completos e 10 estavam incompletos e passaram.",
      "No conjunto de treino, o mesmo sistema tinha acertado 98 por cento das vezes. No conjunto reservado, a história é outra — e é essa que conta.",
    ],
  },
  tabela: {
    titulo: "Resultados no conjunto reservado — 200 pedidos",
    nota:
      "Números fictícios, todos fornecidos. A tabela está completa: os cálculos da actividade fazem-se com estes valores e com uma calculadora simples.",
    colunas: [
      "",
      "Estava mesmo incompleto",
      "Estava completo",
      "Total da linha",
    ],
    linhas: [
      ["O sistema assinalou", "30", "20", "50"],
      ["O sistema não assinalou", "10", "140", "150"],
      ["Total da coluna", "40", "160", "200"],
    ],
  },
  actividade: {
    formato:
      "em pares, com a tabela em papel e calculadora simples — não é necessário programar",
    enunciado: [
      "Parte A. Classifiquem, em uma linha cada, três tarefas como supervisionada, não supervisionada ou por reforço, e justifiquem: (i) prever quais pedidos serão devolvidos, a partir de dez mil pedidos antigos já classificados; (ii) agrupar sozinho as reclamações recebidas em conjuntos parecidos, sem categorias definidas; (iii) afinar, por tentativa e ajuste com um sinal de recompensa definido pelo serviço, a ordem por que os processos são distribuídos pelos técnicos.",
      "Parte B. Com a tabela dos 200 pedidos, calculem e escrevam: a taxa de acerto do sistema; o número de falsos positivos; o número de falsos negativos; a proporção de pedidos incompletos que o sistema conseguiu apanhar. Mostrem a conta feita, com todos os números à vista.",
      "Parte C. Calculem a taxa de acerto de um «sistema preguiçoso» que nunca assinala nada. Comparem com a alínea anterior e escrevam duas frases sobre o que isto mostra acerca de usar a taxa de acerto sozinha.",
      "Parte D. Escrevam qual dos dois erros — falso positivo ou falso negativo — é mais grave neste serviço concreto, quem suporta o custo de cada um, e quem na direcção deve tomar essa decisão. Não há resposta única; há justificação melhor e pior.",
      "Parte E. O sistema acerta 98 por cento no treino e o valor que calcularam no conjunto reservado. Escrevam o nome deste fenómeno e uma frase a explicar porque é que o valor do conjunto reservado é o que conta.",
      "A meio do tempo, troquem quem escreve e quem usa a calculadora.",
    ],
    produto:
      "Uma ficha por par com: três tarefas classificadas e justificadas; os quatro valores da parte B com as contas visíveis; a comparação da parte C; a decisão fundamentada da parte D; e o nome e a explicação da parte E.",
    rubrica: [
      "Taxa de acerto correcta: (30 + 140) dividido por 200 = 170 dividido por 200 = 0,85, isto é, 85 por cento.",
      "Falsos positivos: 20. Falsos negativos: 10.",
      "Proporção de incompletos apanhados: 30 dividido por 40 = 0,75, isto é, 75 por cento.",
      "Sistema preguiçoso: 160 dividido por 200 = 0,80, isto é, 80 por cento — apenas 5 pontos abaixo do sistema treinado, apesar de nunca assinalar nada.",
      "Parte D com identificação de quem suporta o custo de cada erro e atribuição da decisão à direcção do serviço, não ao sistema.",
      "Parte E identifica sobreajustamento e justifica a primazia do conjunto reservado.",
      "Contas visíveis, com todos os operandos escritos.",
    ],
  },
  sintese: [
    "Aprendizagem supervisionada: mostram-se exemplos com a resposta certa.",
    "Aprendizagem não supervisionada: não há resposta certa; o sistema procura grupos e casos estranhos.",
    "Aprendizagem por reforço: o sistema decide em sequência e recebe um sinal de recompensa definido por alguém. Não é o gosto ou não gosto do utilizador.",
    "A inteligência artificial generativa não é uma quarta categoria: usa estas formas de aprender e define-se por produzir conteúdo novo.",
    "Um assistente generativo não aprende sozinho com cada conversa. Só muda com um novo treino autorizado.",
    "Sobreajustamento: o sistema decora o treino e falha nos casos novos. Vê-se quando o treino é muito melhor do que o conjunto reservado.",
    "Falso positivo: assinalar o que estava certo. Falso negativo: deixar passar o que estava errado.",
    "Os dois erros não custam o mesmo. Quem decide qual é mais tolerável é o serviço, não o sistema.",
    "A taxa de acerto sozinha engana. Olha-se sempre para os dois tipos de erro.",
  ],
  verificacao: [
    {
      pergunta:
        "Um sistema de aviso de pedidos incompletos tem 85 por cento de acerto e um sistema que nunca assinala nada tem 80 por cento. Porque é que a diferença de cinco pontos não conta a história toda?",
      resposta:
        "Porque a taxa de acerto é dominada pelos casos completos, que são a maioria. O sistema treinado apanha 30 dos 40 pedidos incompletos, ou seja 75 por cento, enquanto o preguiçoso não apanha nenhum. É nessa diferença, e no número de falsos positivos e falsos negativos, que está o valor real.",
      feedback:
        "Sempre que uma das respostas for muito mais frequente do que a outra, a percentagem global esconde o desempenho naquilo que interessa.",
    },
    {
      pergunta:
        "Um colega afirma: «a inteligência artificial generativa é um tipo de aprendizagem diferente dos outros três, e aprende connosco todos os dias». O que corrige nesta frase?",
      resposta:
        "Duas coisas. Primeiro, a generativa não é uma categoria separada: define-se por produzir conteúdo novo e, na forma como aprende, apoia-se em supervisão obtida dos próprios dados e, muitas vezes, em afinação com preferências humanas, incluindo reforço. Segundo, não aprende connosco no uso diário: pode lembrar-se do que foi dito dentro de uma conversa, mas isso não altera o modelo, que só muda com um novo treino autorizado.",
      feedback:
        "A distinção entre memória da conversa e alteração do modelo evita expectativas erradas e evita também que se ponham dados sensíveis numa conversa a pensar que «o sistema depois esquece».",
    },
  ],
  referencias: [OECD, NIST],
  guiao: {
    preparacao: [
      "Imprimir a tabela dos 200 pedidos e o enunciado das cinco partes, um exemplar por par.",
      "Confirmar que há calculadoras simples para todos os pares, ou autorizar a calculadora do telemóvel.",
      "Preparar no quadro o esquema de quatro células da tabela de resultados, para desenhar durante a exposição.",
      "Não é necessária ligação à internet nem ferramenta de inteligência artificial nesta lição.",
    ],
    conducao: [
      "Retomar a lição dos dados numa pergunta curta: com os dados arrumados, como é que o sistema aprende? Apresentar os objectivos.",
      "Expor as três formas de aprendizagem com exemplos do serviço; situar a generativa em relação a elas e desfazer os dois equívocos; explicar sobreajustamento; desenhar no quadro a tabela de quatro células e nomear falso positivo e falso negativo; mostrar com um exemplo rápido porque é que a taxa de acerto sozinha engana.",
      "Lançar a actividade em pares, partes A a E. Circular e verificar sobretudo se as contas estão escritas com todos os operandos à vista. Avisar da troca aos 30 minutos e do fim aos 50.",
      "Chamar dois grupos, três minutos cada: um apresenta a parte B e a parte C, outro apresenta a parte D. Recolher as fichas restantes. Fechar confirmando no quadro os valores 85 por cento, 20, 10, 75 por cento e 80 por cento.",
    ],
    criterios: [
      "Os quatro valores da parte B correctos, com contas visíveis.",
      "Comparação da parte C feita com números, não por impressão.",
      "Parte D atribui a decisão sobre a tolerância ao erro à direcção do serviço.",
      "Parte E nomeia sobreajustamento e justifica a primazia do conjunto reservado.",
      "As três tarefas da parte A correctamente classificadas e justificadas.",
    ],
    errosComuns: [
      "Trocar falso positivo com falso negativo; insistir em ler a tabela linha a linha.",
      "Calcular a taxa de acerto somando as células erradas — pedir sempre a conta escrita.",
      "Concluir que o sistema é bom só por ter 85 por cento.",
      "Dizer que a aprendizagem por reforço é o utilizador carregar em gosto.",
      "Tratar a escolha entre falso positivo e falso negativo como questão técnica.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M1 L4 — Aplicações da inteligência artificial
// ---------------------------------------------------------------------------

const M1L4: ConteudoLicao = {
  objectivos: [
    "Identificar três tarefas administrativas em que uma ferramenta de inteligência artificial pode apoiar o trabalho e duas em que não deve ser usada sem decisão superior, justificando.",
    "Escrever uma instrução inicial e uma instrução melhorada para a mesma tarefa, indicando pelo menos três elementos acrescentados na segunda.",
    "Comparar uma saída gerada com o documento de origem e registar todos os pontos em que a saída se afasta da fonte.",
    "Registar, na folha de registo, as edições feitas e decidir de forma fundamentada se a saída é aproveitável, aproveitável com correcções, ou inutilizável.",
  ],
  explicacao: [
    "Nesta lição saímos dos conceitos e olhamos para o trabalho. Onde é que estas ferramentas ajudam mesmo, no dia-a-dia de um serviço público, e onde é que atrapalham ou criam risco?",
    "Há três tarefas em que o apoio é mais claro. A primeira é resumir: pegar num documento longo, uma acta, um relatório, um conjunto de respostas, e obter um resumo que a pessoa depois confere. A segunda é rever texto: corrigir concordância, encurtar frases, tornar um parágrafo mais claro, propor uma versão em linguagem simples para quem vai ler. A terceira é classificar e encaminhar: olhar para muitas entradas — reclamações, pedidos, mensagens — e propor a que sector pertence cada uma. Em todas estas, o padrão é o mesmo: a ferramenta propõe, a pessoa decide.",
    "Há tarefas onde não se entra sem decisão superior e sem regras escritas. Decidir sobre direitos de pessoas — deferir, indeferir, aplicar sanção — não se delega a uma ferramenta destas. Tratar dados pessoais reais numa ferramenta externa é outro caso: não se faz sem autorização expressa da instituição e sem saber onde ficam os dados. Produzir fundamentação jurídica é um terceiro: o sistema escreve fundamentações convincentes e inventa artigos com a mesma facilidade. E há um quarto, menos óbvio: avaliar pessoas, seja desempenho, seja selecção. Nestes casos, o que a ferramenta pode fazer é, quando muito, preparar material de leitura para quem decide — nunca a decisão.",
    "Um bom uso e um mau uso do mesmo caso, para ficar claro. Bom: o técnico recebe quarenta respostas a uma consulta pública, pede um resumo dos temas mais repetidos, lê o resumo, vai às respostas originais confirmar os três temas principais, e escreve ele próprio o relatório citando as respostas. Mau: o técnico pede o relatório completo, lê por alto, acha que está bem escrito e envia. No segundo caso, o que segue para cima pode conter temas que ninguém referiu e omitir o que foi mais dito, e ninguém o saberá.",
    "A verificação humana não é um princípio vago; é um conjunto de gestos concretos. Confirmar cada facto, número, data, nome e referência contra a fonte original. Perguntar o que ficou de fora, e não só se o que está escrito é verdadeiro. Reescrever pelo menos as passagens sensíveis com as próprias palavras, para garantir que foram compreendidas. E deixar registo de que a verificação foi feita e por quem — porque a responsabilidade pelo documento é de quem assina, sempre.",
    "Sobre a instrução que se dá à ferramenta, também chamada pedido ou prompt: a diferença entre uma saída pobre e uma saída útil está quase sempre aí. Uma instrução fraca diz «resume esta acta». Uma instrução melhor diz quem é o destinatário, para que serve o texto, que extensão deve ter, que estrutura seguir, o que incluir obrigatoriamente, o que não inventar, e o que fazer quando a informação não estiver no documento — por exemplo, escrever «não consta» em vez de preencher. Este último ponto reduz muito o número de invenções, mas não as elimina; a verificação continua obrigatória.",
    "Por fim, o enquadramento honesto do que se segue. A prática desta lição usa uma ferramenta institucional previamente autorizada pela entidade, preparada pelo formador antes da sessão. Não se cria conta pessoal, não se paga nada, não se promete que a ferramenta seja gratuita e não se introduz um único dado real de pessoa: o texto usado é fictício e está fornecido no material. Se a ferramenta não estiver disponível no dia, a lição faz-se na mesma, em análise documental sobre saídas exemplificativas etiquetadas como simuladas — e a prática real fica registada como pendente, para ser reagendada dentro do horário replaneado. Nesse caso não se diz, em documento nenhum, que a prática foi realizada.",
  ],
  exemplo: {
    titulo: "Caso fictício — resumir a acta do conselho técnico de Muanzo",
    corpo: [
      "A Direcção Distrital Fictícia de Muanzo tem de enviar, até sexta-feira, um extracto das deliberações da última reunião do seu conselho técnico. A acta completa está no anexo A, mais abaixo, e é fictícia.",
      "Um técnico pediu a um assistente de escrita que resumisse a acta. A saída que recebeu está no anexo B. É uma saída exemplificativa, preparada para esta aula e etiquetada como simulada: não foi produzida por nenhuma ferramenta durante a preparação deste material.",
      "O anexo B lê-se bem. Tem um tom institucional correcto e uma estrutura arrumada. E afasta-se da acta em vários pontos. Encontrá-los é o trabalho de hoje — e é exactamente o trabalho que uma pessoa tem de fazer, todas as vezes, antes de aproveitar uma saída destas.",
    ],
  },
  anexos: [
    {
      titulo: "Anexo A — acta fictícia, documento de origem",
      nota:
        "Documento inteiramente inventado para esta aula. Nenhuma pessoa, órgão, data ou deliberação é real. É este o texto que se dá à ferramenta.",
      corpo: [
        "ACTA N.º 4/2026 — Conselho Técnico da Direcção Distrital Fictícia de Muanzo.",
        "Aos doze dias do mês de Março de dois mil e vinte e seis, pelas nove horas, reuniu-se na sala de reuniões da Direcção o Conselho Técnico, sob a presidência da senhora Directora, Amélia Fictícia Chirindza. Estiveram presentes cinco membros: a presidente; o chefe da Repartição de Licenciamento, Bento Fictício Macuácua; a chefe da Repartição Administrativa, Carla Fictícia Nhantumbo; o técnico de informática, Duarte Fictício Sitoe; e a técnica de atendimento, Elsa Fictícia Matola. Faltou, com justificação apresentada, o chefe da Repartição de Fiscalização.",
        "Ponto um. Análise da fila de pedidos de licença de ocupação. O chefe da Repartição de Licenciamento informou que estavam pendentes duzentos e dez pedidos, dos quais setenta e quatro aguardavam documentos em falta. Deliberou-se, por unanimidade, notificar por escrito todos os requerentes com documentos em falta, concedendo o prazo de trinta dias para regularização, findo o qual o processo é arquivado.",
        "Ponto dois. Atendimento nas sextas-feiras. A técnica de atendimento propôs a abertura do balcão até às quinze horas às sextas-feiras, em vez das treze horas actuais. Após discussão, deliberou-se, com quatro votos a favor e uma abstenção, aprovar a alteração a título experimental por três meses, com avaliação em Junho.",
        "Ponto três. Pedido de material informático. O técnico de informática apresentou a necessidade de substituição de quatro computadores do balcão. Deliberou-se solicitar à Repartição Administrativa o levantamento das condições do equipamento existente e apresentar proposta fundamentada na próxima reunião. Não foi aprovada qualquer despesa nesta sessão.",
        "Nada mais havendo a tratar, a reunião foi encerrada pelas onze horas e quinze minutos, da qual se lavrou a presente acta.",
      ],
    },
    {
      titulo: "Anexo B — saída exemplificativa, ETIQUETADA COMO SIMULADA",
      nota:
        "SAÍDA SIMULADA. Texto escrito pela equipa para servir de exemplo de resumo gerado. Não foi produzido por nenhuma ferramenta de inteligência artificial e não representa o desempenho de nenhum produto concreto. Serve apenas para o exercício de comparação com a fonte.",
      corpo: [
        "«Resumo das deliberações do Conselho Técnico da Direcção Distrital de Muanzo, reunido a 12 de Março de 2026 com a presença de seis membros, sob presidência da Directora.",
        "Primeiro, o Conselho analisou a fila de licenciamento, que conta duzentos e dez processos pendentes, setenta e quatro deles incompletos, e deliberou notificar os requerentes com prazo de quinze dias para regularização, sob pena de arquivamento.",
        "Segundo, foi aprovado por unanimidade o alargamento do atendimento às sextas-feiras até às quinze horas, proposta apresentada pelo chefe da Repartição de Licenciamento, com carácter definitivo.",
        "Terceiro, o Conselho aprovou a aquisição de quatro computadores para o balcão de atendimento, bem como a respectiva dotação orçamental.",
        "A reunião decorreu entre as nove e as onze horas e quinze minutos.»",
      ],
    },
  ],
  actividade: {
    formato:
      "em pares, com os anexos em papel; a prática assistida faz-se ao computador, no máximo duas pessoas por posto, alternando quem escreve",
    enunciado: [
      "Parte A, sem computador. Escrevam três tarefas do vosso serviço em que uma ferramenta destas pode apoiar, e duas em que não deve ser usada sem decisão superior. Uma frase de justificação para cada.",
      "Parte B, sem computador. Comparem o anexo B com o anexo A, frase a frase. Listem todos os pontos em que a saída se afasta da fonte, indicando em cada caso o que diz o anexo B e o que diz de facto a acta. Classifiquem cada desvio como número errado, facto invertido, atribuição trocada, ou informação acrescentada que não está na fonte.",
      "Parte C. Escrevam uma instrução inicial curta para pedir o resumo desta acta. Depois escrevam uma instrução melhorada, e sublinhem nela pelo menos três elementos que acrescentaram — por exemplo destinatário, extensão, estrutura, obrigação de indicar «não consta» quando a informação não estiver no documento, proibição de acrescentar deliberações.",
      "Parte D, prática assistida ao computador, se a ferramenta institucional estiver disponível. Executem a instrução inicial e depois a instrução melhorada, sobre o texto do anexo A. São no mínimo duas execuções por par, alternando a pessoa que escreve entre a primeira e a segunda. Comparem cada saída com o anexo A e preencham a folha de registo.",
      "Parte E. Decidam e escrevam: a melhor saída obtida é aproveitável como está, aproveitável com correcções, ou inutilizável? Fundamentem em duas frases, apoiadas no que registaram.",
      "Não se escreve na ferramenta nenhum dado real de pessoa, serviço ou processo. Usa-se exclusivamente o texto fictício do anexo A.",
    ],
    produto:
      "Uma ficha por par com: as cinco tarefas da parte A; a lista de desvios da parte B, classificados; as duas instruções da parte C com os acréscimos sublinhados; a folha de registo da parte D preenchida para cada execução, ou a indicação de prática pendente; e a decisão fundamentada da parte E.",
    rubrica: [
      "Na parte B, encontrar pelo menos quatro desvios. Os desvios plantados são: seis membros presentes quando a acta diz cinco; prazo de quinze dias quando a acta diz trinta; alargamento do atendimento dado como unânime e definitivo quando a acta diz quatro votos a favor, uma abstenção e três meses a título experimental; proposta atribuída ao chefe da Repartição de Licenciamento quando foi da técnica de atendimento; e aquisição de computadores com dotação orçamental dada como aprovada quando a acta diz expressamente que não foi aprovada qualquer despesa.",
      "Classificação correcta da maioria dos desvios nas quatro categorias dadas.",
      "Instrução melhorada com três ou mais elementos acrescentados, identificados.",
      "Folha de registo preenchida com erros encontrados, edições feitas e tempo gasto, em cada execução — ou, não havendo ferramenta, a marcação explícita de prática pendente.",
      "Decisão da parte E fundamentada no registo e não na impressão de qualidade do texto.",
      "Alternância efectiva de quem escreve, visível no registo.",
    ],
  },
  pratica: {
    titulo: "Resumir a acta fictícia com uma ferramenta institucional autorizada",
    objectivo:
      "Comparar o efeito de uma instrução fraca e de uma instrução bem construída sobre o mesmo texto fictício, e treinar a verificação da saída contra a fonte.",
    preRequisitos: [
      "Ferramenta de inteligência artificial institucional, previamente autorizada pela entidade para uso em formação.",
      "Contas, acessos e permissões criados pelo formador antes da sessão. Nenhuma pessoa formanda cria conta pessoal, nem regista número de telemóvel, nem introduz meio de pagamento.",
      "Confirmação, pelo formador, de que a ferramenta está acessível a partir da rede da sala no dia da sessão.",
      "Cópias impressas dos anexos A e B e da folha de registo, em número suficiente.",
      "Regra escrita e afixada: só entra na ferramenta o texto fictício do anexo A.",
    ],
    passos: [
      "Abrir a ferramenta com a conta institucional preparada pelo formador.",
      "Primeira execução: colar o texto do anexo A e dar a instrução inicial curta escrita na parte C. Guardar ou copiar a saída para a ficha.",
      "Comparar essa saída com o anexo A e anotar na folha de registo todos os pontos em que se afasta da fonte.",
      "Trocar a pessoa que escreve.",
      "Segunda execução: colar de novo o texto do anexo A e dar a instrução melhorada. Guardar a saída.",
      "Comparar a segunda saída com o anexo A, anotar os desvios e as edições necessárias para a tornar utilizável.",
      "Se houver tempo, uma terceira execução com a instrução melhorada e uma alteração à escolha do par, para observar se a saída muda entre execuções com a mesma instrução.",
      "Fechar a sessão da ferramenta e não guardar nada fora da ficha de trabalho.",
    ],
    registo: [
      "Qual das instruções foi usada em cada execução, e quem escreveu.",
      "Número de afirmações da saída que não se confirmam no anexo A, com a lista dessas afirmações.",
      "Informação da acta que ficou de fora da saída.",
      "Edições feitas para tornar a saída utilizável, e tempo gasto nessas edições.",
      "Decisão final: aproveitável, aproveitável com correcções, ou inutilizável.",
      "Nenhuma captura de ecrã que mostre nomes de conta, endereços de correio electrónico ou identificadores da instituição.",
    ],
    contingencia: [
      "Se a ferramenta institucional não estiver disponível ou não estiver autorizada, a lição faz-se apenas em análise documental, com o anexo B, que está etiquetado como saída simulada.",
      "Nesse caso cumprem-se as partes A, B, C e E, e a parte D não se executa.",
      "Na ficha e no registo da sessão escreve-se, literalmente, «prática com ferramenta: PENDENTE — a reagendar». Não se escreve, em documento nenhum, que a prática foi realizada.",
      "O formador propõe uma data de reagendamento dentro do horário replaneado do curso e comunica-a à coordenação.",
      "As saídas exemplificativas usadas permanecem identificadas como simuladas em todos os documentos e não podem ser apresentadas como resultado de nenhuma ferramenta.",
    ],
  },
  sintese: [
    "Estas ferramentas ajudam sobretudo a resumir, a rever texto e a classificar documentos.",
    "A ferramenta propõe. A pessoa decide e assina.",
    "Não se usam para decidir sobre direitos das pessoas, nem para fundamentação jurídica, nem para avaliar pessoas, sem decisão superior e regras escritas.",
    "Não se introduzem dados reais de pessoas. Nesta aula usa-se só texto inventado.",
    "Uma instrução boa diz para quem é, para que serve, que tamanho tem, o que incluir e o que fazer quando a informação não existe no documento.",
    "Verificar é confrontar cada número, data, nome e referência com o documento original.",
    "Também se verifica o que ficou de fora, não só o que está escrito.",
    "Um texto bem escrito pode inventar deliberações que nunca existiram.",
    "Se a ferramenta não estiver disponível, escreve-se que a prática ficou pendente. Não se diz que foi feita.",
  ],
  verificacao: [
    {
      pergunta:
        "O anexo B diz que o alargamento do atendimento às sextas-feiras foi aprovado por unanimidade e com carácter definitivo. O que diz a acta, e como classifica este desvio?",
      resposta:
        "A acta diz que foi aprovado com quatro votos a favor e uma abstenção, a título experimental por três meses, com avaliação em Junho. É um facto invertido: a saída transformou uma decisão condicionada e não unânime numa decisão firme e unânime.",
      feedback:
        "Este é o tipo de desvio mais perigoso, porque é plausível e ninguém estranha ao ler. Só se apanha com o documento de origem ao lado.",
    },
    {
      pergunta:
        "No dia da sessão, a ferramenta institucional não está acessível. Um colega sugere escrever no relatório que a turma fez a prática usando o anexo B como saída. O que responde?",
      resposta:
        "Não se escreve isso. O anexo B é uma saída simulada, escrita pela equipa, e não foi produzida por nenhuma ferramenta. Faz-se a análise documental, regista-se «prática com ferramenta: PENDENTE — a reagendar» e propõe-se data dentro do horário replaneado.",
      feedback:
        "Registar uma prática que não aconteceu compromete o relatório inteiro do curso. A análise documental é trabalho válido — desde que seja chamada pelo nome.",
    },
  ],
  referencias: [OECD, NIST],
  guiao: {
    preparacao: [
      "Confirmar, com a entidade, se existe ferramenta de inteligência artificial institucional autorizada para esta sessão; obter essa autorização por escrito antes do dia.",
      "Criar previamente as contas e os acessos necessários; testar a partir da rede da sala. Nenhuma pessoa formanda cria conta, regista telemóvel ou introduz meio de pagamento.",
      "Imprimir o anexo A, o anexo B e a folha de registo, um conjunto por par, com letra grande.",
      "Afixar na sala a regra: só entra na ferramenta o texto fictício do anexo A.",
      "Preparar o caminho alternativo desde já, mesmo que a ferramenta pareça disponível, e saber qual a data de reagendamento possível dentro do horário replaneado.",
    ],
    conducao: [
      "Apresentar os objectivos e perguntar quem já usou um assistente de escrita e para quê. Recolher dois exemplos, sem julgar.",
      "Expor as três tarefas em que estas ferramentas apoiam e as tarefas em que não se entra sem decisão superior; o par de bom uso e mau uso; os gestos concretos da verificação humana; e o que distingue uma instrução fraca de uma instrução bem construída. Apresentar o caso de Muanzo e os dois anexos, dizendo com todas as letras que o anexo B é uma saída simulada.",
      "Lançar a actividade. Partes A, B e C em papel, primeiros 25 minutos. Parte D ao computador, 25 minutos, com troca obrigatória de quem escreve entre a primeira e a segunda execução. Parte E nos últimos 10 minutos. Se a ferramenta não estiver disponível, anunciá-lo no início da actividade, alargar o tempo das partes B e C e registar a prática como pendente.",
      "Chamar dois grupos, quatro minutos cada: um apresenta a lista de desvios da parte B, outro apresenta as duas instruções da parte C e o que mudou entre elas. Recolher as fichas restantes. Fechar com a lista completa dos cinco desvios plantados e com a regra final: a assinatura é de quem verifica.",
    ],
    criterios: [
      "Quatro ou mais desvios encontrados na parte B, com o que diz a fonte indicado ao lado.",
      "Instrução melhorada com três ou mais elementos acrescentados e identificados.",
      "Folha de registo preenchida por execução, ou prática marcada como pendente de forma explícita.",
      "Decisão da parte E apoiada no registo.",
      "Nenhum dado real introduzido na ferramenta.",
    ],
    errosComuns: [
      "Aceitar o anexo B por estar bem escrito e procurar apenas erros de língua.",
      "Não notar a informação acrescentada — a dotação orçamental que nunca foi aprovada é o desvio mais esquecido.",
      "Escrever uma instrução melhorada que continua sem dizer o que fazer quando a informação não consta do documento.",
      "Colar na ferramenta um documento real do serviço «só para experimentar».",
      "Deixar a mesma pessoa executar as duas execuções.",
      "Descrever a análise documental como prática realizada.",
    ],
  },
};

export const LICOES: Record<string, ConteudoLicao> = {
  m1l1: M1L1,
  m1l2: M1L2,
  m1l3: M1L3,
  m1l4: M1L4,
  ...LICOES_M2,
};

/**
 * Descrições dos módulos. Só entram na base quando TODAS as lições do módulo
 * estiverem escritas. O módulo 2 passou a estar escrito nesta etapa.
 */
export const DESCRICOES_MODULO: Record<string, string> = {
  m1: "Quatro lições sobre os fundamentos da inteligência artificial: o que é e o que não é, com a distinção entre automação por regras e sistemas que inferem a partir de dados, uma breve história e o facto de que texto fluente não é texto verdadeiro; dados, características, rótulos, qualidade, representatividade, vazamento de dados e a diferença entre algoritmo e modelo, sobre um mini-conjunto fictício fornecido por inteiro; aprendizagem supervisionada, não supervisionada e por reforço em linguagem simples, com sobreajustamento e erros de falso positivo e falso negativo calculados sobre uma tabela fornecida; e aplicações ao trabalho administrativo, com uma prática assistida de resumo de um documento fictício.",
  m2: DESCRICAO_M2,
};
