/**
 * BANCO DE AVALIAÇÃO do curso «Segurança Cibernética Avançada».
 *
 * Ficheiro PRIVADO: vive fora de src/ e fora de public/. Enunciados, gabaritos
 * e explicações nunca entram no pacote do navegador. Nada aqui foi importado
 * para a base de dados; o plano de linhas abaixo é função pura, sem escrita.
 *
 * Dois instrumentos separados:
 * - EXAME_SC: 80 questões finais. Regra do Termo de Referência (secção 10,
 *   como registada na matriz interna): banco com pelo menos o triplo das
 *   questões de cada exame. A prova de 20 itens em 60 minutos é PROPOSTA
 *   PEDAGÓGICA, usada aqui só em simulação; não há configuração de exame real.
 * - DIAGNOSTICO_SC: 10 questões de diagnóstico e pós-teste, que não integram
 *   as 80 e não entram no sorteio do exame.
 *
 * Matriz do banco (80):
 *   Módulo 1 (141) = 24, Módulo 2 (142) = 25, Módulo 3 (143) = 23, transversal (200) = 8.
 *   Tipos: 32 escolha múltipla, 16 verdadeiro/falso, 16 associação, 16 cenário.
 *   Dificuldade: 32 fáceis, 32 médias, 16 difíceis.
 * Prova proposta (20): 6 + 6 + 6 + 2 por módulo; 8/4/4/4 por tipo; 8/8/4 por
 * dificuldade. Cada estrato do banco tem pelo menos o triplo do que a prova
 * consome (módulos 24/25/23 ≥ 18 e 8 ≥ 6; tipos 32/16/16/16 ≥ 24/12/12/12;
 * dificuldades 32/32/16 ≥ 24/24/12).
 *
 * Os cenários são fictícios e trazem os dados no próprio enunciado. Não se
 * afirma legislação moçambicana de segurança cibernética; a única lei citada é
 * a Lei n.º 10/2024, nos mesmos artigos já usados nas lições do módulo
 * transversal. Quadros e guias internacionais são tratados como voluntários.
 *
 * Estado editorial: rascunho por validar pela Ologa/ATDI.
 */
import type { QuestaoSC } from "./seguranca-cibernetica-questoes-tipos";
import { EXAME_SC_M1 } from "./seguranca-cibernetica-questoes-m1";
import { EXAME_SC_M2 } from "./seguranca-cibernetica-questoes-m2";
import { EXAME_SC_M3 } from "./seguranca-cibernetica-questoes-m3";

export type { QuestaoSC } from "./seguranca-cibernetica-questoes-tipos";

const TRANSVERSAL: QuestaoSC[] = [
  {
    cod: "SC-TR-L1-01", m: "transversal", l: 1, t: "em", d: "f",
    e: "Uma instituição vai substituir o formulário de pedido de acesso ao sistema por um novo formulário em linha, com verificação de segurança adicional. Segundo o artigo 16 da Lei n.º 10/2024, estudado no módulo transversal, que cuidado deve acompanhar a mudança?",
    opts: [
      "Que o formulário continue a poder ser preenchido só com teclado e lido por leitor de ecrã",
      "Que o formulário exija sempre a leitura de imagens distorcidas para travar programas automáticos",
      "Que o formulário só funcione no navegador mais recente, por ser o mais seguro disponível",
      "Que o formulário seja preenchido apenas no balcão, para evitar pedidos fraudulentos",
    ], ind: 0,
    exp: "O artigo 16, como apresentado na lição, assenta no desenho universal e no ajustamento razoável. Controlos de segurança não podem excluir quem usa teclado ou leitor de ecrã.",
    obj: "Conciliar controlos de segurança com acessibilidade. Lição 1 do módulo transversal.",
  },
  {
    cod: "SC-TR-L1-02", m: "transversal", l: 1, t: "cor", d: "me",
    e: "Associe cada controlo de segurança à forma de o manter acessível.",
    pares: [
      { esquerda: "Verificação por imagem distorcida", direita: "Alternativa que não dependa da visão" },
      { esquerda: "Sessão que expira por inactividade", direita: "Aviso prévio e possibilidade de prolongar" },
      { esquerda: "Código de verificação enviado por mensagem", direita: "Via alternativa para quem não recebe mensagens" },
      { esquerda: "Mensagem de erro de autenticação", direita: "Texto claro, lido pelo leitor de ecrã" },
    ],
    exp: "Cada controlo pode criar uma barreira; o ajustamento mantém a segurança sem excluir quem precisa de outra forma de acesso.",
    obj: "Aplicar desenho universal e ajustamento razoável a controlos de segurança. Lição 1 do módulo transversal.",
  },
  {
    cod: "SC-TR-L2-01", m: "transversal", l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: segundo o artigo 17 da Lei n.º 10/2024, como apresentado na lição, as entidades que prestam serviços públicos devem procurar disponibilizar informação em formatos acessíveis, o que inclui os avisos sobre interrupções do serviço.",
    val: true,
    exp: "Verdadeiro. Um aviso de interrupção é informação ao público e deve ser disponibilizado em formatos que pessoas diferentes consigam usar.",
    obj: "Aplicar o direito à informação a avisos de incidente. Lição 2 do módulo transversal.",
  },
  {
    cod: "SC-TR-L3-01", m: "transversal", l: 3, t: "em", d: "me",
    e: "Na contratação de um novo sistema de autenticação para o portal de uma instituição, qual é a prática coerente com a lição sobre o artigo 20 da Lei n.º 10/2024?",
    opts: [
      "Escolher o sistema mais seguro e tratar a acessibilidade depois da entrada em produção",
      "Incluir requisitos de acessibilidade no caderno de encargos, avaliá-los e verificá-los na entrega",
      "Deixar ao fornecedor a decisão sobre acessibilidade, por ser matéria técnica especializada",
      "Exigir acessibilidade só nos ecrãs públicos e não nos ecrãs de autenticação",
    ], ind: 1,
    exp: "A lição indica: requisitos desde o caderno de encargos, avaliação antes de contratar e verificação na entrega. A autenticação é a porta de entrada do serviço e não pode ser excluída.",
    obj: "Incorporar acessibilidade nas aquisições de sistemas de segurança. Lição 3 do módulo transversal.",
  },
  {
    cod: "SC-TR-L4-01", m: "transversal", l: 4, t: "em", d: "f",
    e: "Numa acção de formação em segurança cibernética, que medida está alinhada com a lição sobre o artigo 24 da Lei n.º 10/2024?",
    opts: [
      "Entregar os guiões de laboratório apenas em imagem digitalizada, para evitar cópias",
      "Exigir o uso do rato em todas as actividades, por ser mais rápido nas ferramentas",
      "Disponibilizar os guiões em texto acessível e permitir concluir actividades sem rato",
      "Dispensar as pessoas com deficiência dos laboratórios práticos sem outra alternativa",
    ], ind: 2,
    exp: "A lição pede materiais acessíveis e actividades que não criem barreiras, incluindo concluir sem rato. Dispensar sem alternativa exclui, não adapta.",
    obj: "Planear formação acessível. Lição 4 do módulo transversal.",
  },
  {
    cod: "SC-TR-L5-01", m: "transversal", l: 5, t: "em", d: "me",
    e: "Um formulário de inscrição recolhe o tipo de deficiência para planear apoios. Que prática combina a lição sobre o artigo 30 da Lei n.º 10/2024 com boa segurança da informação?",
    opts: [
      "Tornar o campo obrigatório e visível a todos os funcionários, para facilitar o atendimento",
      "Tornar o campo opcional e autodeclarado, restringir o acesso e usar apenas dados agregados nos relatórios",
      "Guardar o campo numa folha de cálculo partilhada, com cópia enviada por correio a cada serviço",
      "Não recolher nada, porque qualquer recolha deste dado é proibida pela lei",
    ], ind: 1,
    exp: "A lição prevê recolha com finalidade clara, opcional e autodeclarada, protecção da informação individual e relatórios que não identificam pessoas. A lei promove a recolha; não a proíbe.",
    obj: "Recolher dados sobre deficiência com minimização e protecção. Lição 5 do módulo transversal.",
  },
  {
    cod: "SC-TR-L6-01", m: "transversal", l: 6, t: "vf", d: "f",
    e: "Verdadeiro ou falso: num painel de indicadores desagregados por tipo de deficiência, mostrar um grupo com 2 pessoas num distrito pequeno pode permitir identificá-las.",
    val: true,
    exp: "Verdadeiro. Grupos muito pequenos permitem identificar pessoas. A lição dá o exemplo de mostrar grupos com menos de cinco pessoas como informação insuficiente para divulgação.",
    obj: "Proteger grupos pequenos na divulgação de indicadores. Lição 6 do módulo transversal.",
  },
  {
    cod: "SC-TR-L6-02", m: "transversal", l: 6, t: "cor", d: "me",
    e: "Associe cada situação na divulgação de estatísticas ao cuidado de protecção adequado.",
    pares: [
      { esquerda: "Célula com 3 pessoas", direita: "Apresentar como informação insuficiente para divulgação" },
      { esquerda: "Ficheiro de trabalho com registos individuais", direita: "Acesso restrito e fora da publicação" },
      { esquerda: "Cruzamento de género, distrito e tipo de deficiência", direita: "Verificar se o cruzamento cria grupos identificáveis" },
      { esquerda: "Relatório público agregado", direita: "Publicar sem nomes nem identificadores individuais" },
    ],
    exp: "A desagregação é exigida, mas a divulgação protege as pessoas: supressão de grupos pequenos, restrição dos dados individuais e verificação dos cruzamentos.",
    obj: "Conciliar desagregação estatística com protecção de dados. Lição 6 do módulo transversal.",
  },
];

/** Banco do exame final: 80 questões. Nenhuma está na base de dados. */
export const EXAME_SC: QuestaoSC[] = [...EXAME_SC_M1, ...EXAME_SC_M2, ...EXAME_SC_M3, ...TRANSVERSAL];

/**
 * Diagnóstico e pós-teste: 10 questões de baixo impacto, separadas das 80.
 * Não entram no sorteio do exame e não certificam.
 */
export const DIAGNOSTICO_SC: QuestaoSC[] = [
  {
    cod: "SC-DIAG-01", m: "m1", l: 1, t: "em", d: "f",
    e: "Diagnóstico. Numa avaliação de risco simples, como se costuma obter o nível de risco de um cenário?",
    opts: [
      "Combinando a probabilidade de acontecer com o impacto se acontecer",
      "Contando quantos computadores a instituição tem ligados à rede",
      "Somando o custo de todos os equipamentos informáticos da instituição",
      "Verificando se o antivírus está instalado em todos os postos",
    ], ind: 0,
    exp: "O risco combina probabilidade e impacto. O curso trabalha esta ideia com uma escala de 1 a 5.",
    obj: "Sondagem inicial sobre noção de risco.",
  },
  {
    cod: "SC-DIAG-02", m: "m1", l: 3, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: desactivar serviços que um servidor não precisa reduz as possibilidades de ataque a esse servidor.",
    val: true,
    exp: "Verdadeiro. Cada serviço activo é uma porta possível. O curso chama a isto endurecimento.",
    obj: "Sondagem inicial sobre endurecimento de sistemas.",
  },
  {
    cod: "SC-DIAG-03", m: "m1", l: 4, t: "em", d: "f",
    e: "Diagnóstico. Qual destas práticas torna mais difícil saber quem fez uma operação num sistema?",
    opts: [
      "Cada pessoa ter a sua própria conta individual",
      "Várias pessoas usarem a mesma conta partilhada",
      "Rever periodicamente os acessos de cada pessoa",
      "Retirar os acessos a quem muda de serviço",
    ], ind: 1,
    exp: "Com conta partilhada não se sabe quem fez o quê. As outras práticas ajudam a responsabilização.",
    obj: "Sondagem inicial sobre gestão de identidades.",
  },
  {
    cod: "SC-DIAG-04", m: "m1", l: 5, t: "vf", d: "me",
    e: "Diagnóstico. Verdadeiro ou falso: quando um sistema passa para a nuvem, toda a segurança passa a ser responsabilidade do fornecedor.",
    val: false,
    exp: "Falso. Parte da segurança é do fornecedor e parte continua da instituição, como contas, permissões e dados.",
    obj: "Sondagem inicial sobre responsabilidade partilhada.",
  },
  {
    cod: "SC-DIAG-05", m: "m2", l: 1, t: "em", d: "me",
    e: "Diagnóstico. Numa aplicação web, esconder um botão ao utilizador que não o deve usar é suficiente para o impedir de fazer a operação?",
    opts: [
      "Sim, porque sem o botão o utilizador não tem forma de fazer o pedido",
      "Sim, desde que a página tenha sido desenvolvida por uma empresa certificada",
      "Não, porque o servidor tem de verificar a autorização em cada pedido",
      "Não, porque o botão deveria ficar visível mas desactivado a cinzento",
    ], ind: 2,
    exp: "O pedido pode ser feito directamente, sem o botão. A verificação tem de ser feita no servidor.",
    obj: "Sondagem inicial sobre controlo de acesso em aplicações.",
  },
  {
    cod: "SC-DIAG-06", m: "m2", l: 3, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: para detectar ataques é útil juntar os registos de vários sistemas num mesmo local de análise.",
    val: true,
    exp: "Verdadeiro. Juntar registos permite relacionar acontecimentos entre sistemas. O curso trabalha esta ideia com o SIEM.",
    obj: "Sondagem inicial sobre monitorização e registos.",
  },
  {
    cod: "SC-DIAG-07", m: "m2", l: 4, t: "em", d: "me",
    e: "Diagnóstico. Um computador parece ter sido atacado. Qual das acções pode destruir informação útil para perceber o que aconteceu?",
    opts: [
      "Anotar a hora e o que se observou no ecrã",
      "Desligá-lo da corrente de imediato",
      "Avisar o responsável de segurança",
      "Fotografar o ecrã antes de mexer",
    ], ind: 1,
    exp: "Desligar da corrente apaga a memória e as ligações em curso. As outras acções preservam informação.",
    obj: "Sondagem inicial sobre preservação de evidência.",
  },
  {
    cod: "SC-DIAG-08", m: "m2", l: 5, t: "em", d: "f",
    e: "Diagnóstico. Numa resposta a incidente, o que significa «conter»?",
    opts: [
      "Escrever o relatório final do incidente",
      "Travar o incidente para não se espalhar",
      "Comprar equipamento novo para substituir o antigo",
      "Comunicar o incidente à imprensa",
    ], ind: 1,
    exp: "Conter é travar a propagação. O relatório e a comunicação vêm noutros momentos.",
    obj: "Sondagem inicial sobre resposta a incidentes.",
  },
  {
    cod: "SC-DIAG-09", m: "m3", l: 3, t: "vf", d: "me",
    e: "Diagnóstico. Verdadeiro ou falso: uma cópia de segurança que nunca foi restaurada já dá a certeza de que os dados se recuperam.",
    val: false,
    exp: "Falso. Só o restauro verificado prova que a cópia serve.",
    obj: "Sondagem inicial sobre cópias de segurança.",
  },
  {
    cod: "SC-DIAG-10", m: "m3", l: 5, t: "em", d: "me",
    e: "Diagnóstico. Qual destes documentos é uma regra interna aprovada pela própria instituição?",
    opts: [
      "Um guia internacional de boas práticas",
      "A política de segurança da informação",
      "Um artigo de revista técnica especializada",
      "O manual de instruções de um equipamento",
    ], ind: 1,
    exp: "A política de segurança é aprovada pela instituição e obriga o seu pessoal. Os outros documentos são referências.",
    obj: "Sondagem inicial sobre políticas e normas.",
  },
];

/** Prova PROPOSTA, só para simulação. Não configura exame real. */
export const PROPOSTA_PROVA_SC = {
  total: 20,
  minutos: 60,
  modulosPorOrdem: { 141: 6, 142: 6, 143: 6, 200: 2 } as Record<number, number>,
  tipos: { escolha_multipla: 8, verdadeiro_falso: 4, correspondencia: 4, cenario: 4 },
  pct: { facil: 40, media: 40, dificil: 20 },
  nota: "Proposta pedagógica por validar pela Ologa/ATDI; não é número imposto pelo Termo de Referência.",
} as const;

export const ORDEM_MODULO_SC = { m1: 141, m2: 142, m3: 143, transversal: 200 } as const;
const TIPOLOGIA = { em: "escolha_multipla", vf: "verdadeiro_falso", cor: "correspondencia" } as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;

export type LinhaPlanoSC = {
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

function corpo(q: QuestaoSC) {
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
export function planoLinhasSC(): LinhaPlanoSC[] {
  const linhas: LinhaPlanoSC[] = [];
  const add = (q: QuestaoSC, instrumento: LinhaPlanoSC["instrumento"]) => {
    const { conteudo, resposta } = corpo(q);
    linhas.push({
      cod: q.cod,
      ordemModulo: ORDEM_MODULO_SC[q.m],
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
  for (const q of EXAME_SC) add(q, "exame_final");
  for (const q of DIAGNOSTICO_SC) add(q, "pre_pos_teste");
  return linhas;
}
