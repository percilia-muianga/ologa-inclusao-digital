/**
 * Banco de questões do curso «Princípios da Transformação Digital» — VERSÃO 2.
 *
 * Renovação integral: a versão 1 esteve acessível sem sessão na página de
 * gestão do banco e foi retirada (continua guardada, fora do sorteio, sem
 * possibilidade de activação). Este conteúdo foi escrito de raiz — outros
 * casos, outros dados, outros distractores, outro raciocínio — e avalia
 * resultados de aprendizagem das lições existentes do curso, incluindo o
 * módulo transversal partilhado, nunca instruções do guião do formador nem o
 * estado do projecto.
 *
 * Instrumentos separados:
 * - EXAME_TD_V2: 60 questões para a prova proposta de 20 (banco ≥ 3×).
 * - PRE_POS_TD_V2: 10 questões de diagnóstico e pós-teste. NÃO certifica e não
 *   entra no sorteio do exame final.
 *
 * Todas entram INACTIVAS (rascunho por validar pela Ologa/ATDI).
 *
 * MÓDULOS, por nome (para evitar erro de mapeamento):
 *   m1 = Fundamentos da Transformação Digital (ordem 111)
 *   m2 = Serviços Públicos Centrados no Cidadão (ordem 112)
 *   m3 = Implementação e Mudança Institucional (ordem 113)
 *   transversal = Governo Digital Inclusivo e Acessibilidade (ordem 200)
 *
 * Distribuição desenhada para as quotas em vigor em src/lib/quotas-exame.ts
 * (prova de 20: 6 Fundamentos + 6 Serviços Centrados no Cidadão +
 * 6 Implementação e Mudança + 2 Transversal; 8 escolha múltipla + 4
 * verdadeiro/falso + 4 associação + 2 ordenação + 2 cenários; 8 fáceis +
 * 8 médias + 4 difíceis). O cenário é categoria pedagógica própria e exclui a
 * classificação como escolha múltipla, mesmo usando esse formato de resposta.
 *
 * Banco: 18 + 18 + 18 + 6 por módulo; 24 escolha múltipla, 12 verdadeiro/falso,
 * 12 associação, 6 ordenação, 6 cenários; 24 fáceis, 24 médias, 12 difíceis.
 * Cada dimensão tem o triplo do que a prova consome, pelo que cada exame inclui
 * todos os módulos, todos os formatos e cenários.
 *
 * Nomes de instituições e números são FICTÍCIOS e estão identificados.
 * Gabaritos e justificações vivem fora de src/ e de public/.
 */

export type QuestaoTdV2 = {
  /**
   * m1 = Fundamentos, m2 = Serviços centrados no cidadão,
   * m3 = Implementação e mudança, transversal = Governo digital inclusivo
   */
  m: "m1" | "m2" | "m3" | "transversal";
  t: "em" | "vf" | "cor" | "ord";
  /** Cenário: categoria pedagógica própria, exclusiva face a escolha múltipla. */
  cen?: true;
  d: "f" | "me" | "di";
  e: string;
  opts?: string[];
  ind?: number;
  val?: boolean;
  pares?: { esquerda: string; direita: string }[];
  seq?: string[];
  exp: string;
  obj: string;
};

export const EXAME_TD_V2: QuestaoTdV2[] = [
  // ==========================================================
  // MÓDULO 1 — Fundamentos da Transformação Digital (18)
  // em 8 (3f/3me/2di) · vf 4 (2f/2me) · cor 3 (1f/1me/1di) · ord 1 (1f) · cen 2 (1me/1di)
  // ==========================================================
  {
    m: "m1", t: "em", d: "f",
    e: "Uma repartição passou a receber por correio electrónico o mesmo formulário que antes recebia em papel, mantendo exactamente os mesmos passos, carimbos e prazos. Como se classifica melhor esta mudança?",
    opts: [
      "Transformação digital, porque passou a usar meios digitais",
      "Digitalização de um processo, sem transformação do serviço",
      "Simplificação administrativa",
      "Inovação de serviço centrada no cidadão",
    ], ind: 1,
    exp: "Trocar o suporte sem alterar o processo é digitalizar. Há transformação digital quando muda a forma como o serviço é concebido e prestado, com ganho para quem o usa: menos passos, menos deslocações, menos documentos repetidos.",
    obj: "Distinguir digitalização de transformação digital. Lição 1 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "em", d: "f",
    e: "Qual das afirmações descreve melhor «valor público» no contexto de um serviço digital?",
    opts: [
      "O número de sistemas informáticos que a instituição possui",
      "O benefício efectivo que o serviço gera para as pessoas e para a sociedade",
      "O montante investido em equipamento no último ano",
      "A quantidade de formulários disponibilizados em linha",
    ], ind: 1,
    exp: "Valor público é o benefício efectivo produzido — tempo poupado às pessoas, acesso alargado, decisões melhor informadas, confiança. Investimento e número de sistemas são meios, não valor.",
    obj: "Definir valor público. Lição 3 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "em", d: "f",
    e: "No diagnóstico de maturidade digital de um serviço, o que é avaliado?",
    opts: [
      "Apenas a existência de computadores e de internet",
      "Vários aspectos, como processos, pessoas, dados, tecnologia e liderança",
      "Apenas a opinião da direcção sobre o serviço",
      "Apenas o número de pedidos recebidos por mês",
    ], ind: 1,
    exp: "A maturidade digital é multidimensional: processos, competências das pessoas, qualidade e uso dos dados, tecnologia disponível e apoio da liderança. Olhar só para equipamento dá uma leitura falsa.",
    obj: "Reconhecer as dimensões do diagnóstico de maturidade. Lição 4 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "em", d: "me",
    e: "Um serviço é elogiado por ter «tudo em linha», mas 60% das pessoas que o usam continuam a deslocar-se ao balcão para confirmar se o pedido foi recebido. Que leitura de maturidade é mais correcta?",
    opts: [
      "A maturidade é elevada, porque o serviço existe em linha",
      "A maturidade é limitada: o canal digital não fecha o ciclo, porque não devolve informação de estado às pessoas",
      "A maturidade não pode ser avaliada com esta informação",
      "A maturidade depende apenas do número de funcionários formados",
    ], ind: 1,
    exp: "Um canal digital que obriga a deslocação para confirmar estado não substituiu o percurso antigo: acrescentou um passo. A maturidade mede-se pelo percurso completo da pessoa, não pela existência do formulário.",
    obj: "Avaliar maturidade pelo percurso completo do serviço. Lições 2 e 4 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "em", d: "me",
    e: "Uma direcção quer justificar um projecto digital perante a sua tutela. Qual das formulações exprime melhor o valor público esperado?",
    opts: [
      "«Vamos adquirir 40 computadores novos e um servidor»",
      "«Vamos reduzir de três deslocações para uma o número de idas ao balcão necessárias para obter a declaração»",
      "«Vamos criar um portal moderno e atractivo»",
      "«Vamos formar a equipa em ferramentas digitais»",
    ], ind: 1,
    exp: "O valor público exprime-se como benefício mensurável para quem usa o serviço. Equipamento, aparência e formação são meios; podem ser necessários, mas não são o valor prometido.",
    obj: "Formular valor público de forma mensurável. Lição 3 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "em", d: "me",
    e: "Ao aplicar o diagnóstico de maturidade, a equipa conclui que a dimensão «dados» está muito atrás das restantes. Qual é a consequência prática mais importante dessa conclusão?",
    opts: [
      "O projecto deve avançar na mesma, porque os dados se resolvem depois",
      "As decisões e os indicadores do serviço vão assentar em informação pouco fiável enquanto essa dimensão não melhorar",
      "A instituição deve substituir todos os computadores",
      "A dimensão «dados» só interessa a serviços de estatística",
    ], ind: 1,
    exp: "Se os dados do serviço são incompletos ou inconsistentes, qualquer indicador construído sobre eles engana. Reconhecer essa fraqueza obriga a incluir no plano a correcção da recolha e do registo.",
    obj: "Interpretar o resultado de um diagnóstico por dimensões. Lição 4 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "em", d: "di",
    e: "Duas direcções apresentam resultados: a Direcção A reduziu o prazo médio de emissão de 12 para 5 dias, mantendo o número de pedidos atendidos; a Direcção B triplicou o número de visitas ao portal, com o prazo médio inalterado. Qual das leituras é mais defensável em termos de valor público?",
    opts: [
      "A Direcção B produziu mais valor, porque alcançou mais pessoas",
      "A Direcção A produziu valor observável para quem usa o serviço; as visitas da B são uso do canal, não prova de benefício",
      "As duas produziram exactamente o mesmo valor",
      "Nenhuma produziu valor, porque não houve investimento em tecnologia",
    ], ind: 1,
    exp: "Prazo de emissão é resultado sentido por quem espera o documento. Visitas são medida de utilização do canal e podem até indicar dificuldade em encontrar informação. Sem efeito no prazo ou no esforço da pessoa, o aumento de visitas não demonstra benefício.",
    obj: "Distinguir indicadores de uso de indicadores de resultado. Lições 3 e 4 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "em", d: "di",
    e: "Uma equipa argumenta que considerações éticas atrasam o projecto e devem ser tratadas no fim. Qual é a objecção mais sólida a esse argumento?",
    opts: [
      "As considerações éticas são opcionais em serviços internos",
      "Decisões com efeito sobre pessoas — que dados recolher, quem fica de fora, como se decide — ficam fixadas no desenho, e corrigi-las depois é mais caro e nem sempre possível",
      "A ética só se aplica a projectos com inteligência artificial",
      "As considerações éticas só dizem respeito à área jurídica",
    ], ind: 1,
    exp: "As escolhas com efeito ético ficam incorporadas no desenho: dados recolhidos, critérios aplicados, canais disponíveis e pessoas excluídas. Deixar para o fim significa, na prática, aceitar o que já foi decidido por omissão.",
    obj: "Justificar o tratamento antecipado de questões éticas. Lição 3 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "vf", d: "f",
    e: "Verdadeiro ou falso: colocar um formulário em linha é suficiente para afirmar que o serviço foi transformado.",
    val: false,
    exp: "Falso. Sem alteração do processo e sem benefício observável para quem usa o serviço, trata-se de digitalização do formulário.",
    obj: "Distinguir digitalização de transformação. Lição 1 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "vf", d: "f",
    e: "Verdadeiro ou falso: a transformação digital de um serviço público deve ter em conta as pessoas que não têm acesso à internet.",
    val: true,
    exp: "Verdadeiro. Um serviço público é para toda a gente; ignorar quem não tem acesso transforma uma melhoria em exclusão.",
    obj: "Reconhecer a exigência de inclusão. Lições 2 e 3 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "vf", d: "me",
    e: "Verdadeiro ou falso: um aumento no número de acessos ao portal demonstra, por si só, que o serviço melhorou para o cidadão.",
    val: false,
    exp: "Falso. Mais acessos podem resultar de dificuldade em encontrar informação, de repetição de tentativas ou de campanha de divulgação. Melhoria demonstra-se com indicadores de resultado, como prazo, número de deslocações ou taxa de pedidos concluídos.",
    obj: "Distinguir uso de resultado. Lição 3 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "vf", d: "me",
    e: "Verdadeiro ou falso: o apoio da liderança é uma das dimensões avaliadas no diagnóstico de maturidade digital, porque condiciona decisões, recursos e prioridades.",
    val: true,
    exp: "Verdadeiro. Sem decisão ao nível adequado, os projectos ficam dependentes do esforço individual e param quando surge o primeiro obstáculo de recursos ou de regra interna.",
    obj: "Reconhecer a liderança como dimensão de maturidade. Lição 4 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "cor", d: "f",
    e: "Associe cada situação ao conceito que melhor a descreve.",
    pares: [
      { esquerda: "Formulário em papel passa a ficheiro enviado por correio electrónico, com o mesmo circuito", direita: "Digitalização" },
      { esquerda: "Serviço passa a emitir a declaração sem exigir documentos que a instituição já tem", direita: "Transformação do serviço" },
      { esquerda: "Redução do tempo de espera sentido pelo cidadão", direita: "Valor público" },
      { esquerda: "Avaliação de processos, pessoas, dados, tecnologia e liderança", direita: "Diagnóstico de maturidade" },
    ],
    exp: "Cada conceito tem uma marca distinta: mudança de suporte (digitalização), mudança do próprio serviço (transformação), benefício sentido (valor público) e avaliação multidimensional (maturidade).",
    obj: "Associar conceitos fundamentais a situações. Lições 1, 3 e 4 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "cor", d: "me",
    e: "Associe cada indicador ao tipo a que pertence.",
    pares: [
      { esquerda: "Número de visitas ao portal", direita: "Indicador de uso" },
      { esquerda: "Prazo médio de emissão da declaração", direita: "Indicador de resultado" },
      { esquerda: "Número de funcionários formados", direita: "Indicador de actividade" },
      { esquerda: "Percentagem de pedidos concluídos sem deslocação", direita: "Indicador de resultado" },
      { esquerda: "Número de computadores instalados", direita: "Indicador de meios" },
    ],
    exp: "Meios e actividades descrevem o que a instituição fez; uso descreve a procura do canal; resultado descreve o efeito no percurso da pessoa. A prestação de contas séria apresenta resultados, sem esconder os meios.",
    obj: "Classificar indicadores por tipo. Lições 3 e 4 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "cor", d: "di",
    e: "Associe cada conclusão de um diagnóstico de maturidade à decisão que dela decorre com maior coerência.",
    pares: [
      { esquerda: "Processos escritos não correspondem ao que se faz no atendimento", direita: "Rever e actualizar o processo antes de o automatizar" },
      { esquerda: "Registos do serviço incompletos e guardados em ficheiros dispersos", direita: "Corrigir a recolha e o registo antes de construir indicadores" },
      { esquerda: "Pessoal sem competências para operar o novo sistema", direita: "Incluir formação e apoio no posto de trabalho no plano" },
      { esquerda: "Decisões dependentes de despacho que demora semanas", direita: "Acordar com a liderança um circuito de decisão mais curto" },
      { esquerda: "Equipamento insuficiente para o número de atendimentos", direita: "Dimensionar o investimento em meios com base na procura medida" },
    ],
    exp: "Cada fraqueza tem uma resposta própria, na dimensão onde foi detectada. O erro comum é responder a tudo com compra de equipamento ou com mais formação, deixando intactos o processo e o circuito de decisão.",
    obj: "Converter conclusões do diagnóstico em decisões. Lição 4 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "ord", d: "f",
    e: "Ordene os passos de uma abordagem coerente de transformação de um serviço, do primeiro ao último.",
    seq: [
      "Compreender o serviço actual e quem o usa",
      "Diagnosticar a maturidade e identificar prioridades",
      "Rever e simplificar o processo",
      "Desenhar e implementar a solução digital",
      "Medir os resultados e corrigir",
    ],
    exp: "A ordem evita o erro mais frequente: começar pela solução técnica. Primeiro compreende-se e diagnostica-se, depois simplifica-se, só então se implementa, e por fim mede-se para corrigir.",
    obj: "Sequenciar uma abordagem de transformação. Lições 1, 2 e 4 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "em", cen: true, d: "me",
    e: "CENÁRIO (dados fictícios). A Direcção Distrital de Nhamacoa emite licenças de ocupação de bancas de mercado. O processo actual exige três documentos, dos quais um é uma certidão emitida pela própria Direcção, e obriga a duas deslocações. A direcção anuncia que vai «digitalizar o serviço este trimestre» colocando os três documentos num formulário em linha, mantendo o resto igual. Que apreciação é mais rigorosa e que decisão a acompanha?",
    opts: [
      "A decisão é adequada: com o formulário em linha, as deslocações desaparecem por si",
      "A decisão trata do suporte e não do processo: convém primeiro deixar de exigir a certidão que a própria Direcção emite, e só depois desenhar o formulário para o que restar",
      "A decisão é adequada, porque digitalizar é sempre melhor do que simplificar",
      "A decisão deve ser abandonada, porque serviços de mercado não podem ser digitalizados",
    ], ind: 1,
    exp: "Colocar em linha um documento que a instituição já possui mantém o esforço do lado do cidadão e acrescenta um passo digital ao percurso antigo. A sequência correcta é rever o processo, eliminar a exigência interna e só depois digitalizar o que sobrar.",
    obj: "Aplicar a sequência rever-depois-digitalizar a um caso concreto. Lições 1 e 2 do módulo Fundamentos.",
  },
  {
    m: "m1", t: "em", cen: true, d: "di",
    e: "CENÁRIO (dados fictícios). Numa autarquia, o diagnóstico de maturidade obtém respostas opostas: a direcção afirma que o prazo médio de resposta é de 3 dias e o pessoal de atendimento afirma que ronda as duas semanas. Não existe registo sistemático de datas de entrada e de saída dos pedidos. A equipa tem de apresentar o diagnóstico na próxima semana. Qual é a conduta mais defensável?",
    opts: [
      "Apresentar o prazo indicado pela direcção, por ter visão de conjunto do serviço",
      "Apresentar a média das duas estimativas, para não tomar partido",
      "Registar a divergência como resultado, declarar que não há dados fiáveis de prazo e propor a medição das datas de entrada e saída durante um período definido",
      "Adiar o diagnóstico até existir um sistema informático que meça os prazos automaticamente",
    ], ind: 2,
    exp: "A divergência é, ela própria, um resultado do diagnóstico: mostra que o serviço não mede o que afirma. Escolher uma das versões ou fazer a média inventa um número; adiar tudo trava o trabalho. O caminho honesto é declarar a ausência de dados e propor uma medição simples e datada.",
    obj: "Tratar divergências e ausência de dados num diagnóstico. Lição 4 do módulo Fundamentos.",
  },

  // ==========================================================
  // MÓDULO 2 — Serviços Públicos Centrados no Cidadão (18)
  // em 8 (3f/4me/1di) · vf 4 (2f/1me/1di) · cor 3 (1f/1me/1di) · ord 2 (1f/1me) · cen 1 (1di)
  // ==========================================================
  {
    m: "m2", t: "em", d: "f",
    e: "Qual é a finalidade de mapear a jornada de um serviço público?",
    opts: [
      "Listar os programas informáticos usados pela instituição",
      "Ver, do ponto de vista da pessoa, todos os passos, contactos e esperas até obter o resultado",
      "Contar quantos funcionários trabalham no serviço",
      "Registar o orçamento gasto em cada etapa",
    ], ind: 1,
    exp: "A jornada é o percurso visto por quem usa o serviço: passos, documentos exigidos, deslocações, esperas e pontos de contacto. É isso que revela onde está o esforço desnecessário.",
    obj: "Definir o propósito do mapa de jornada. Lição 2 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "Antes de digitalizar um processo com 14 passos, dos quais 5 são repetições de verificações já feitas, o que recomenda o módulo?",
    opts: [
      "Digitalizar os 14 passos tal como estão",
      "Simplificar o processo, eliminando as repetições, e depois digitalizar o que restar",
      "Digitalizar apenas os 5 passos repetidos",
      "Aumentar o número de funcionários afectos ao processo",
    ], ind: 1,
    exp: "Digitalizar o desperdício apenas o torna mais rápido a produzir-se. Primeiro elimina-se o que não acrescenta nada — sobretudo verificações repetidas — e só depois se automatiza o processo simplificado.",
    obj: "Aplicar a simplificação antes da digitalização. Lição 3 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "Num mapa de jornada, o que representa um «ponto de dor»?",
    opts: [
      "Um momento em que a pessoa encontra dificuldade, espera ou esforço desnecessário",
      "Um passo executado por um funcionário experiente",
      "Uma etapa que envolve pagamento de taxa",
      "Um documento emitido pela instituição",
    ], ind: 0,
    exp: "Ponto de dor é o momento do percurso onde a pessoa perde tempo, se confunde ou desiste. É o alvo prioritário da simplificação.",
    obj: "Interpretar um mapa de jornada. Lição 2 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "Uma equipa mapeou a jornada apenas com base na descrição do regulamento interno. Que risco principal corre?",
    opts: [
      "O mapa fica demasiado detalhado",
      "O mapa descreve o processo previsto e não o percurso real, onde estão as esperas e as repetições",
      "O mapa não pode ser apresentado à direcção",
      "O mapa torna-se inválido ao fim de um mês",
    ], ind: 1,
    exp: "O regulamento descreve o que devia acontecer. O percurso real inclui esperas, idas e voltas, documentos pedidos duas vezes e informação que ninguém dá. Sem observação, o mapa confirma o que já se supunha.",
    obj: "Reconhecer a diferença entre processo previsto e percurso real. Lição 2 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "Num serviço, a exigência de uma certidão emitida pela própria instituição obriga a duas deslocações. Qual é a intervenção de simplificação mais adequada?",
    opts: [
      "Passar a emitir a certidão mais depressa",
      "Deixar de exigir a certidão e verificar internamente a informação",
      "Cobrar menos pela certidão",
      "Criar um formulário em linha para pedir a certidão",
    ], ind: 1,
    exp: "A melhor simplificação elimina o passo em vez de o acelerar ou digitalizar. Como a informação já está na instituição, exigir a certidão transfere para o cidadão um trabalho interno.",
    obj: "Escolher intervenções de simplificação eficazes. Lição 3 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "Um funcionário guarda cópias digitais de bilhetes de identidade de utentes na sua pasta pessoal do computador, «para facilitar futuros atendimentos». Qual é a apreciação correcta?",
    opts: [
      "É boa prática, porque acelera o atendimento",
      "É prática inadequada: cria cópias fora do sistema do serviço, sem controlo de acesso nem prazo de conservação",
      "É aceitável desde que o computador tenha palavra-passe",
      "É aceitável se o utente for cliente frequente",
    ], ind: 1,
    exp: "Cópias em pastas pessoais escapam ao controlo de acessos, às regras de conservação e ao registo de quem consultou. O dado deve viver no sistema do serviço, com acesso limitado e prazo definido.",
    obj: "Avaliar práticas de tratamento de dados no atendimento. Lição 4 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "Depois de simplificar um processo, a equipa quer confirmar que a mudança beneficiou as pessoas. Que verificação é mais directa?",
    opts: [
      "Perguntar à equipa interna se sente melhoria",
      "Comparar, antes e depois, o número de passos, de documentos e de deslocações exigidos, e o tempo até à conclusão",
      "Contar quantas reuniões foram feitas sobre o assunto",
      "Verificar se o novo processo está escrito no regulamento",
    ], ind: 1,
    exp: "A comparação antes/depois de passos, documentos, deslocações e tempo mede exactamente aquilo que se pretendeu reduzir. Percepções internas e formalização não demonstram benefício para quem usa o serviço.",
    obj: "Verificar o efeito de uma simplificação. Lições 2 e 3 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "em", d: "di",
    e: "Uma equipa recolheu opiniões através de um inquérito publicado no portal do serviço. Que limite metodológico deve declarar ao apresentar os resultados?",
    opts: [
      "Nenhum: o inquérito em linha representa toda a população",
      "Só respondeu quem já usa o portal e tem acesso à internet, pelo que ficam de fora precisamente as pessoas com mais dificuldade de acesso",
      "Os inquéritos em linha são proibidos no sector público",
      "O limite é apenas o número de perguntas do inquérito",
    ], ind: 1,
    exp: "A amostra está condicionada pelo canal: quem não chega ao portal não responde. Declarar esse limite é condição de honestidade, e corrigi-lo exige recolha por outros canais, como o atendimento presencial.",
    obj: "Reconhecer limites de amostragem na recolha de opinião. Lição 1 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "vf", d: "f",
    e: "Verdadeiro ou falso: o mapa de jornada descreve o percurso do ponto de vista de quem usa o serviço, e não da organização interna.",
    val: true,
    exp: "Verdadeiro. É essa mudança de ponto de vista que revela esperas, repetições e falta de informação que a visão interna não mostra.",
    obj: "Compreender a perspectiva do mapa de jornada. Lição 2 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "vf", d: "f",
    e: "Verdadeiro ou falso: pedir a uma pessoa um documento que a própria instituição já emitiu é um passo que deve ser questionado durante a simplificação.",
    val: true,
    exp: "Verdadeiro. É um dos casos mais comuns de esforço desnecessário transferido para o cidadão e um alvo imediato de simplificação.",
    obj: "Identificar exigências desnecessárias. Lição 3 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "vf", d: "me",
    e: "Verdadeiro ou falso: a conservação de dados pessoais deve ter prazo definido, mesmo quando os dados estão guardados em sistema seguro.",
    val: true,
    exp: "Verdadeiro. Segurança e conservação são exigências distintas: guardar bem não justifica guardar para sempre. Sem prazo, acumulam-se dados sem finalidade e aumenta o efeito de qualquer incidente.",
    obj: "Distinguir segurança de limitação da conservação. Lição 4 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "vf", d: "di",
    e: "Verdadeiro ou falso: se um processo for digitalizado tal como está, os pontos de dor identificados na jornada desaparecem automaticamente.",
    val: false,
    exp: "Falso. Passos repetidos, documentos exigidos em duplicado e falta de informação de estado mantêm-se no canal digital; podem até agravar-se, porque a pessoa deixa de ter alguém a quem perguntar.",
    obj: "Antecipar a persistência de pontos de dor após digitalização. Lições 2 e 3 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "cor", d: "f",
    e: "Associe cada elemento do trabalho centrado no cidadão à sua descrição.",
    pares: [
      { esquerda: "Perfil de pessoa utilizadora", direita: "Descrição de necessidades e dificuldades típicas de um grupo que usa o serviço" },
      { esquerda: "Mapa de jornada", direita: "Sequência de passos, esperas e contactos vividos até obter o resultado" },
      { esquerda: "Ponto de dor", direita: "Momento do percurso com dificuldade ou esforço desnecessário" },
      { esquerda: "Minimização de dados", direita: "Recolher apenas o necessário para prestar o serviço" },
    ],
    exp: "São quatro instrumentos distintos: quem usa, como usa, onde sofre e que dados se justificam. Confundi-los leva a diagnósticos vagos.",
    obj: "Associar instrumentos do desenho centrado no cidadão. Lições 1, 2 e 4 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "cor", d: "me",
    e: "Associe cada problema observado na jornada à intervenção mais adequada.",
    pares: [
      { esquerda: "Documento exigido que a instituição já possui", direita: "Eliminar a exigência e verificar internamente" },
      { esquerda: "Pessoa não sabe em que estado está o pedido", direita: "Informar o estado por canal acessível, incluindo aviso quando concluído" },
      { esquerda: "Mesma informação pedida em três formulários", direita: "Unificar a recolha num único momento" },
      { esquerda: "Pessoa sem internet não consegue submeter", direita: "Manter canal presencial ou assistido" },
    ],
    exp: "Cada problema tem uma resposta que o resolve na raiz. A digitalização isolada não responde a nenhum deles, se o passo desnecessário permanecer.",
    obj: "Escolher a intervenção adequada a cada problema. Lições 2 e 3 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "cor", d: "di",
    e: "Associe cada exigência de tratamento de dados no atendimento à prática que a cumpre.",
    pares: [
      { esquerda: "Recolher apenas o necessário para o serviço pedido", direita: "Formulário sem campos dispensáveis, revisto com a área responsável" },
      { esquerda: "Limitar quem consulta os dados", direita: "Acesso atribuído por função, e não conta partilhada pela equipa" },
      { esquerda: "Não conservar para além do necessário", direita: "Prazo de conservação escrito e eliminação verificada no fim do prazo" },
      { esquerda: "Informar a pessoa sobre a utilização dos seus dados", direita: "Aviso claro no momento da recolha, em linguagem simples" },
      { esquerda: "Permitir apurar quem consultou um processo", direita: "Registo de acessos conservado no sistema do serviço" },
    ],
    exp: "Cada exigência tem uma prática verificável. Guardar num sistema seguro não substitui prazo de conservação, nem acesso por função, nem informação à pessoa: são obrigações distintas e cumulativas.",
    obj: "Converter exigências de protecção de dados em práticas de atendimento. Lição 4 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "ord", d: "f",
    e: "Ordene as etapas do trabalho sobre um serviço, do primeiro ao último passo.",
    seq: [
      "Conhecer as pessoas que usam o serviço",
      "Mapear a jornada actual",
      "Identificar os pontos de dor",
      "Simplificar o processo",
      "Digitalizar o processo simplificado",
    ],
    exp: "A ordem garante que a tecnologia chega ao fim, depois de o processo já ter sido compreendido e limpo. Inverter a ordem produz serviços digitais que reproduzem problemas antigos.",
    obj: "Sequenciar o trabalho centrado no cidadão. Lições 1 a 3 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "ord", d: "me",
    e: "Ordene as etapas de uma recolha de informação junto de quem usa o serviço, do primeiro ao último passo.",
    seq: [
      "Definir a pergunta a que a recolha deve responder",
      "Escolher os canais de recolha, incluindo o presencial para quem não usa internet",
      "Recolher com registo das dificuldades observadas",
      "Organizar os resultados e declarar os limites da amostra",
      "Devolver as conclusões à equipa e usá-las na decisão",
    ],
    exp: "A recolha começa pela pergunta e não pelo questionário. A escolha dos canais determina quem fica de fora, e a declaração dos limites impede que resultados parciais sejam apresentados como representativos.",
    obj: "Sequenciar uma recolha junto de pessoas utilizadoras. Lição 1 do módulo Serviços Centrados no Cidadão.",
  },
  {
    m: "m2", t: "em", cen: true, d: "di",
    e: "CENÁRIO (dados fictícios). No Balcão Único de Muanavila, a jornada mostra: 1) pedido presencial; 2) espera de 4 dias por verificação interna; 3) nova deslocação para entregar um comprovativo já apresentado; 4) espera de 2 dias; 5) levantamento. A equipa só tem capacidade para uma intervenção este trimestre. Qual escolhe, e porquê?",
    opts: [
      "Criar um portal para o pedido inicial, mantendo os restantes passos",
      "Eliminar a exigência do comprovativo repetido, acabando com uma deslocação inteira",
      "Reduzir a espera de 2 dias para 1 dia",
      "Alargar o horário de atendimento do balcão",
    ], ind: 1,
    exp: "A eliminação do comprovativo repetido remove uma deslocação completa e a espera que a rodeia, sem depender de tecnologia nova. Digitalizar o pedido inicial mantém as duas deslocações seguintes; reduzir uma espera de 2 para 1 dia é um ganho menor; alargar o horário não retira passos.",
    obj: "Priorizar intervenções pelo impacto no percurso da pessoa. Lições 2 e 3 do módulo Serviços Centrados no Cidadão.",
  },

  // ==========================================================
  // MÓDULO 3 — Implementação e Mudança Institucional (18)
  // em 6 (2f/3me/1di) · vf 4 (2f/1me/1di) · cor 4 (2f/1me/1di) · ord 2 (1f/1me) · cen 2 (1me/1di)
  // ==========================================================
  {
    m: "m3", t: "em", d: "f",
    e: "O que deve conter, no mínimo, um plano de implementação útil?",
    opts: [
      "Apenas a lista de equipamento a adquirir",
      "Acções, responsáveis, prazos e indicadores de resultado",
      "Apenas o orçamento total do projecto",
      "Apenas o nome do sistema a instalar",
    ], ind: 1,
    exp: "Sem responsável não há quem responda; sem prazo não há quando; sem indicador não se sabe se resultou. É esse conjunto que torna um plano executável e verificável.",
    obj: "Identificar os elementos mínimos de um plano. Lição 1 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "em", d: "f",
    e: "Porque é importante definir responsabilidades de forma explícita num projecto de transformação?",
    opts: [
      "Para aumentar o número de reuniões",
      "Para que cada tarefa tenha alguém que responde por ela, evitando que fique sem dono",
      "Para reduzir o custo do projecto automaticamente",
      "Para dispensar o acompanhamento da direcção",
    ], ind: 1,
    exp: "Tarefas sem dono param no primeiro obstáculo. A definição explícita de responsabilidades diz quem decide, quem executa, quem é consultado e quem é informado.",
    obj: "Justificar a atribuição explícita de responsabilidades. Lição 2 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "em", d: "me",
    e: "Uma instituição tem 14 iniciativas digitais possíveis e capacidade para 3 no ano. Que critério de priorização é mais defensável?",
    opts: [
      "Começar pelas mais fáceis de anunciar publicamente",
      "Combinar o benefício esperado para quem usa o serviço com a capacidade real de execução e a dependência de outras iniciativas",
      "Começar pelas que exigem mais investimento, para garantir orçamento",
      "Distribuir uma iniciativa por cada departamento, para não gerar descontentamento",
    ], ind: 1,
    exp: "Priorizar exige cruzar valor esperado com exequibilidade e dependências. Critérios de visibilidade, de orçamento ou de repartição política entre departamentos conduzem a carteiras que não entregam resultado.",
    obj: "Aplicar critérios de priorização. Lição 1 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "em", d: "me",
    e: "Uma equipa de projecto é composta apenas por técnicos de informática. Que risco é mais provável?",
    opts: [
      "O sistema ficará tecnicamente inviável",
      "A solução responderá bem a requisitos técnicos e mal ao funcionamento real do serviço e ao atendimento",
      "O projecto terminará antes do prazo",
      "A direcção deixará de acompanhar o projecto",
    ], ind: 1,
    exp: "Falta na equipa quem conhece o processo, o atendimento e as regras do serviço. O resultado costuma ser tecnicamente correcto e operacionalmente desajustado.",
    obj: "Avaliar a composição de equipas de projecto. Lição 2 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "em", d: "me",
    e: "Que indicador serve melhor para acompanhar a adopção de um novo processo digital pelo pessoal do serviço?",
    opts: [
      "Número de sessões de formação realizadas",
      "Percentagem de pedidos tratados pelo novo processo, face ao total",
      "Número de computadores instalados",
      "Número de circulares enviadas sobre o tema",
    ], ind: 1,
    exp: "A adopção mede-se pelo uso efectivo. Formação, equipamento e comunicação são meios; podem estar todos cumpridos com adopção nula.",
    obj: "Escolher indicadores de adopção. Lições 3 e 4 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "em", d: "di",
    e: "Um plano define como indicador «sistema implementado até Dezembro». Que crítica técnica se aplica a este indicador, e como se corrige?",
    opts: [
      "Não há crítica: é claro e tem prazo",
      "Mede a conclusão de uma actividade, não o resultado para o serviço; corrige-se acrescentando um indicador de efeito, como redução do prazo de atendimento ou das deslocações",
      "O problema é apenas o prazo ser anual",
      "O problema é não indicar o custo do sistema",
    ], ind: 1,
    exp: "«Implementado» é marco de actividade: pode cumprir-se sem qualquer melhoria no serviço. Um plano verificável junta a esse marco pelo menos um indicador de efeito observável por quem usa o serviço.",
    obj: "Distinguir marcos de actividade de indicadores de resultado. Lições 1 e 4 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "vf", d: "f",
    e: "Verdadeiro ou falso: um plano de implementação sem responsáveis nomeados é difícil de executar e de acompanhar.",
    val: true,
    exp: "Verdadeiro. Sem responsável, nenhuma acção tem quem responda por ela, e o acompanhamento transforma-se em pedido genérico de informação.",
    obj: "Reconhecer a importância dos responsáveis no plano. Lição 1 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "vf", d: "f",
    e: "Verdadeiro ou falso: a resistência à mudança é frequentemente sinal de dificuldades reais no trabalho, e não apenas má vontade.",
    val: true,
    exp: "Verdadeiro. Muitas vezes traduz falta de formação, receio de errar, aumento de trabalho na transição ou instruções pouco claras. Tratar essas causas é mais eficaz do que insistir em comunicação.",
    obj: "Interpretar resistência à mudança. Lição 3 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "vf", d: "me",
    e: "Verdadeiro ou falso: definir indicadores antes de iniciar a implementação permite comparar a situação inicial com a posterior.",
    val: true,
    exp: "Verdadeiro. Sem medição inicial não há termo de comparação e qualquer afirmação de melhoria fica por demonstrar.",
    obj: "Justificar a medição inicial. Lição 4 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "vf", d: "di",
    e: "Verdadeiro ou falso: um indicador que a equipa pode melhorar sem alterar o serviço — por exemplo, contando de outra forma os pedidos concluídos — continua a ser um bom indicador de resultado.",
    val: false,
    exp: "Falso. Um indicador manipulável pela forma de contagem deixa de medir o que interessa. Um bom indicador tem definição escrita, fonte de dados identificada e regra de contagem estável ao longo do tempo.",
    obj: "Avaliar a qualidade de um indicador. Lição 4 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "cor", d: "f",
    e: "Associe cada elemento do plano à pergunta a que responde.",
    pares: [
      { esquerda: "Acção", direita: "O que vai ser feito" },
      { esquerda: "Responsável", direita: "Quem responde pela execução" },
      { esquerda: "Prazo", direita: "Até quando" },
      { esquerda: "Indicador", direita: "Como se saberá se resultou" },
    ],
    exp: "Cada elemento responde a uma pergunta distinta; a falta de qualquer um deles deixa o plano sem execução ou sem verificação.",
    obj: "Estruturar um plano de implementação. Lição 1 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "cor", d: "f",
    e: "Associe cada papel num projecto de transformação à responsabilidade que lhe corresponde.",
    pares: [
      { esquerda: "Direcção da instituição", direita: "Decidir prioridades e assegurar recursos" },
      { esquerda: "Responsável do serviço", direita: "Garantir que o novo processo funciona no atendimento" },
      { esquerda: "Equipa técnica", direita: "Configurar e manter a solução" },
      { esquerda: "Pessoal de atendimento", direita: "Usar o novo processo e comunicar as dificuldades encontradas" },
    ],
    exp: "Quando estes papéis não estão distinguidos, decisões ficam à espera de quem não as pode tomar e problemas de atendimento são tratados como questões técnicas.",
    obj: "Distribuir responsabilidades num projecto. Lição 2 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "cor", d: "me",
    e: "Associe cada dificuldade de implementação à medida que melhor responde.",
    pares: [
      { esquerda: "Pessoal continua a usar o processo antigo", direita: "Apoio no posto de trabalho e resolução das dificuldades encontradas" },
      { esquerda: "Tarefas do plano sem dono definido", direita: "Atribuição explícita de responsabilidades" },
      { esquerda: "Não se sabe se houve melhoria", direita: "Indicadores com medição inicial e posterior" },
      { esquerda: "Projecto depende de uma só pessoa", direita: "Documentação e repartição de responsabilidades" },
    ],
    exp: "Cada dificuldade tem uma resposta específica; respostas genéricas, como «mais comunicação», não resolvem nenhuma delas por si só.",
    obj: "Escolher medidas adequadas às dificuldades de implementação. Lições 2 a 4 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "cor", d: "di",
    e: "Associe cada resultado observado após a entrada em funcionamento à leitura mais rigorosa.",
    pares: [
      { esquerda: "Prazo médio caiu e a taxa de rejeição manteve-se", direita: "Melhoria confirmada, a sustentar e a monitorizar" },
      { esquerda: "Prazo médio caiu e a rejeição por erro de preenchimento subiu muito", direita: "Ganho com efeito adverso: corrigir instruções e validações" },
      { esquerda: "Uso do canal digital subiu e o prazo manteve-se", direita: "Mudança de canal sem benefício demonstrado" },
      { esquerda: "Nada mudou nos indicadores, mas a equipa relata menos retrabalho interno", direita: "Ganho interno por confirmar com medição própria" },
      { esquerda: "Indicador melhorou logo após alteração da regra de contagem", direita: "Resultado não comparável: verificar a definição do indicador" },
    ],
    exp: "A leitura séria cruza indicadores em vez de escolher o que favorece. Subidas de rejeição, mudanças de canal sem efeito e alterações de regra de contagem explicam muitos «sucessos» aparentes.",
    obj: "Interpretar resultados após a entrada em funcionamento. Lição 4 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "ord", d: "f",
    e: "Ordene as etapas de preparação das pessoas para um novo processo, do primeiro ao último passo.",
    seq: [
      "Explicar o que muda e porquê, com exemplos do trabalho real",
      "Formar quem vai usar o processo",
      "Acompanhar as primeiras semanas de utilização no posto de trabalho",
      "Recolher as dificuldades encontradas e corrigir instruções ou configurações",
      "Confirmar a adopção pelo uso efectivo do novo processo",
    ],
    exp: "A comunicação abre o caminho, mas a adopção ganha-se no acompanhamento e na correcção do que falha nas primeiras semanas. Confirmar pelo uso efectivo evita declarar adopção com base em formação dada.",
    obj: "Sequenciar a preparação das pessoas. Lição 3 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "ord", d: "me",
    e: "Ordene as etapas de implementação e sustentação, do primeiro ao último passo.",
    seq: [
      "Definir prioridades e âmbito com a direcção",
      "Organizar a equipa e atribuir responsabilidades",
      "Medir a situação inicial dos indicadores",
      "Executar e acompanhar a mudança junto das pessoas",
      "Avaliar resultados e definir a sustentação do serviço",
    ],
    exp: "Medir a situação inicial antes de executar é o passo mais esquecido; sem ele, a avaliação final não tem comparação. A sustentação fecha o ciclo, atribuindo dono ao serviço depois do projecto.",
    obj: "Sequenciar implementação e sustentação. Lições 1 a 4 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "em", cen: true, d: "me",
    e: "CENÁRIO (dados fictícios). Na Direcção Provincial de Chimoiane, o projecto terminou há seis meses: a equipa foi dissolvida, ninguém ficou responsável pelo serviço digital e os pedidos de correcção acumulam-se numa caixa de correio partilhada. O atendimento voltou a usar o processo antigo em parte dos casos. Que medida responde à causa?",
    opts: [
      "Repetir a formação inicial a todo o pessoal",
      "Atribuir a responsabilidade permanente do serviço a uma função definida, com circuito para tratar pedidos e correcções",
      "Emitir uma circular a proibir o uso do processo antigo",
      "Adquirir equipamento novo para o atendimento",
    ], ind: 1,
    exp: "O problema não é falta de formação nem de equipamento: é ausência de dono depois do projecto. Sem responsável e sem circuito para tratar correcções, o serviço degrada-se e as pessoas voltam ao que funciona. Proibir sem alternativa operacional não resolve.",
    obj: "Reconhecer e corrigir a falta de sustentação. Lições 2 e 4 do módulo Implementação e Mudança.",
  },
  {
    m: "m3", t: "em", cen: true, d: "di",
    e: "CENÁRIO (dados fictícios). Na Direcção Provincial de Tchindembo, o novo processo digital reduziu o prazo médio de 10 para 4 dias, mas o número de pedidos rejeitados por preenchimento incorrecto subiu de 5% para 22%. A direcção quer anunciar o resultado como sucesso. Que leitura e que acção são mais adequadas?",
    opts: [
      "Anunciar sucesso: o prazo melhorou e a rejeição é responsabilidade de quem preenche",
      "Reconhecer um efeito adverso: o formulário está a induzir erro, e a acção é melhorar instruções, validações e apoio no preenchimento, medindo de novo antes de anunciar",
      "Voltar imediatamente ao processo anterior",
      "Reduzir o número de campos ao acaso até a taxa de rejeição descer",
    ], ind: 1,
    exp: "Um ganho num indicador e uma deterioração noutro exigem leitura conjunta: 22% de rejeição significa retrabalho e nova espera para uma em cada cinco pessoas. A resposta é corrigir a causa do erro e medir outra vez — não anunciar vitória, não reverter tudo, nem cortar campos sem critério.",
    obj: "Interpretar indicadores em conjunto e decidir a correcção. Lição 4 do módulo Implementação e Mudança.",
  },

  // ==========================================================
  // TRANSVERSAL — Governo Digital Inclusivo e Acessibilidade (6)
  // em 2 (1f/1me) · cor 2 (1f/1me) · ord 1 (1f) · cen 1 (1me)
  // ==========================================================
  {
    m: "transversal", t: "em", d: "f",
    e: "Ao escrever a informação de um serviço público para o sítio da instituição, que prática torna o conteúdo mais fácil de usar por mais pessoas?",
    opts: [
      "Frases curtas, linguagem simples, títulos claros e explicação dos termos técnicos usados",
      "Texto longo em parágrafo único, com termos técnicos sem explicação",
      "Publicação apenas como documento digitalizado em imagem",
      "Uso exclusivo de siglas para poupar espaço",
    ], ind: 0,
    exp: "Linguagem simples, estrutura com títulos e explicação dos termos servem toda a gente, e são indispensáveis para quem tem baixa literacia ou usa leitor de ecrã. Imagens digitalizadas de texto não são lidas por essas ferramentas.",
    obj: "Aplicar princípios de conteúdo acessível num serviço público. Módulo transversal Governo Digital Inclusivo e Acessibilidade.",
  },
  {
    m: "transversal", t: "em", d: "me",
    e: "Uma equipa vai redesenhar o atendimento de um serviço e pergunta quando deve tratar da acessibilidade. Qual é a resposta mais correcta?",
    opts: [
      "No fim, depois de o serviço estar pronto, como ajuste final",
      "Desde o início, no levantamento de necessidades e no desenho, porque corrigir depois é mais caro e nem sempre possível",
      "Apenas se houver reclamação de uma pessoa com deficiência",
      "Apenas quando existir orçamento específico para o efeito",
    ], ind: 1,
    exp: "As escolhas que criam barreiras — formatos, canais, exigências de documentos, linguagem — ficam fixadas no desenho. Tratar a acessibilidade no fim transforma-a em remendo, e alguns problemas passam a ser irreparáveis sem refazer o serviço.",
    obj: "Situar a acessibilidade no momento certo do desenho do serviço. Módulo transversal Governo Digital Inclusivo e Acessibilidade.",
  },
  {
    m: "transversal", t: "cor", d: "f",
    e: "Associe cada barreira encontrada no acesso a um serviço público à medida que a reduz.",
    pares: [
      { esquerda: "Pessoa sem ligação à internet em casa", direita: "Manter atendimento presencial ou assistido" },
      { esquerda: "Pessoa que usa leitor de ecrã", direita: "Publicar o conteúdo em texto, e não como imagem digitalizada" },
      { esquerda: "Pessoa com baixa literacia", direita: "Instruções em linguagem simples, com exemplos" },
      { esquerda: "Pessoa com mobilidade reduzida", direita: "Evitar deslocações desnecessárias e garantir atendimento acessível no local" },
    ],
    exp: "Cada barreira tem uma medida própria. A mesma solução não serve para todas, e a ausência de alternativa transforma uma melhoria digital em exclusão.",
    obj: "Associar barreiras de acesso a medidas de inclusão. Módulo transversal Governo Digital Inclusivo e Acessibilidade.",
  },
  {
    m: "transversal", t: "cor", d: "me",
    e: "Associe cada decisão tomada durante a transformação de um serviço ao efeito que tem sobre a inclusão das pessoas utilizadoras.",
    pares: [
      { esquerda: "Encerrar o atendimento presencial ao mesmo tempo que abre o canal em linha", direita: "Exclui quem não tem acesso ou não consegue usar o canal digital" },
      { esquerda: "Exigir endereço de correio electrónico para qualquer pedido", direita: "Cria barreira a quem não tem endereço e obriga a pedir ajuda a terceiros" },
      { esquerda: "Disponibilizar a mesma informação em texto simples além do documento habitual", direita: "Alarga o número de pessoas que consegue usar a informação" },
      { esquerda: "Testar o formulário com pessoas com dificuldades diferentes antes de publicar", direita: "Permite corrigir barreiras antes de afectarem o atendimento" },
      { esquerda: "Escrever requisitos de acessibilidade no caderno de encargos", direita: "Torna a acessibilidade verificável no momento da entrega" },
    ],
    exp: "Inclusão resulta de decisões concretas, não de intenção declarada. Fechar canais e exigir meios que nem toda a gente tem produz exclusão, mesmo quando o objectivo é modernizar.",
    obj: "Avaliar o efeito de decisões de serviço sobre a inclusão. Módulo transversal Governo Digital Inclusivo e Acessibilidade.",
  },
  {
    m: "transversal", t: "ord", d: "f",
    e: "Ordene as etapas para publicar informação acessível sobre um serviço, do primeiro ao último passo.",
    seq: [
      "Identificar quem precisa da informação e que dificuldades enfrenta",
      "Escrever o conteúdo em linguagem simples, com estrutura e títulos",
      "Disponibilizar em formato de texto, evitando imagens de documentos",
      "Verificar com pessoas com dificuldades diferentes",
      "Corrigir o que foi apontado e publicar",
    ],
    exp: "A verificação com pessoas reais antes de publicar é o passo que distingue conteúdo acessível de conteúdo que se presume acessível. Corrigir depois da publicação deixa barreiras activas durante esse tempo.",
    obj: "Sequenciar a produção de conteúdo acessível. Módulo transversal Governo Digital Inclusivo e Acessibilidade.",
  },
  {
    m: "transversal", t: "em", cen: true, d: "me",
    e: "CENÁRIO (dados fictícios). O Serviço Provincial de Licenciamento de Namutequeliua passa a aceitar pedidos apenas por formulário em linha e encerra o guichet, com o argumento de que o processo ficou mais rápido. Nas duas semanas seguintes, o atendimento telefónico recebe muitos pedidos de ajuda de pessoas sem internet, sem endereço de correio electrónico ou com dificuldade em ler o formulário. Que decisão responde melhor ao problema?",
    opts: [
      "Manter apenas o canal em linha e aconselhar as pessoas a pedirem ajuda a familiares",
      "Reabrir um canal presencial ou assistido, simplificar a linguagem do formulário e disponibilizar a informação em texto simples",
      "Suspender o formulário em linha e voltar integralmente ao papel",
      "Publicar um vídeo explicativo como única forma de apoio",
    ], ind: 1,
    exp: "O ganho de rapidez não justifica excluir quem não consegue usar o único canal disponível. A resposta mantém o canal digital e repõe alternativa assistida, corrigindo ao mesmo tempo a linguagem e o formato da informação. Depender de familiares transfere o problema; voltar ao papel deita fora o ganho; um vídeo como apoio único cria nova barreira.",
    obj: "Decidir perante exclusão provocada por um canal único. Módulo transversal Governo Digital Inclusivo e Acessibilidade.",
  },
];

export const PRE_POS_TD_V2: QuestaoTdV2[] = [
  {
    m: "m1", t: "em", d: "f",
    e: "DIAGNÓSTICO. Qual das situações descreve transformação digital, e não apenas digitalização?",
    opts: [
      "Enviar por correio electrónico o mesmo formulário, com o mesmo circuito",
      "Deixar de exigir documentos que a instituição já tem e reduzir as deslocações do cidadão",
      "Comprar computadores novos para a repartição",
      "Digitalizar arquivos antigos em papel",
    ], ind: 1,
    exp: "Transformação envolve mudança do serviço e benefício para quem o usa; as restantes opções mudam o suporte ou os meios.",
    obj: "Diagnóstico: noção inicial de transformação digital.",
  },
  {
    m: "m1", t: "vf", d: "f",
    e: "DIAGNÓSTICO. Verdadeiro ou falso: um serviço público digital deve prever também quem não tem acesso à internet.",
    val: true,
    exp: "Verdadeiro. Sem alternativa, a digitalização exclui parte das pessoas utilizadoras.",
    obj: "Diagnóstico: noção inicial de inclusão.",
  },
  {
    m: "m1", t: "em", d: "f",
    e: "DIAGNÓSTICO. O que é «valor público» de um serviço?",
    opts: [
      "O benefício efectivo para as pessoas e para a sociedade",
      "O valor do orçamento executado",
      "O número de sistemas instalados",
      "O número de funcionários afectos",
    ], ind: 0,
    exp: "Valor público é o benefício produzido, não o investimento realizado.",
    obj: "Diagnóstico: noção inicial de valor público.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "DIAGNÓSTICO. Para que serve mapear a jornada de um serviço?",
    opts: [
      "Para listar os sistemas informáticos",
      "Para ver o percurso da pessoa, com passos, esperas e dificuldades",
      "Para calcular o orçamento anual",
      "Para avaliar o desempenho individual dos funcionários",
    ], ind: 1,
    exp: "O mapa de jornada mostra o percurso da pessoa que usa o serviço.",
    obj: "Diagnóstico: noção inicial de jornada.",
  },
  {
    m: "m2", t: "vf", d: "f",
    e: "DIAGNÓSTICO. Verdadeiro ou falso: convém simplificar um processo antes de o digitalizar.",
    val: true,
    exp: "Verdadeiro. Digitalizar passos desnecessários apenas os torna mais rápidos a acontecer.",
    obj: "Diagnóstico: noção inicial de simplificação.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "DIAGNÓSTICO. No atendimento, que dados pessoais devem ser recolhidos?",
    opts: [
      "Todos os que possam vir a ser úteis",
      "Apenas os necessários para prestar aquele serviço",
      "Os que o funcionário considerar interessantes",
      "Todos, desde que guardados em pasta pessoal",
    ], ind: 1,
    exp: "A regra prática é recolher o mínimo necessário para a finalidade do serviço.",
    obj: "Diagnóstico: noção inicial de minimização de dados.",
  },
  {
    m: "m3", t: "em", d: "f",
    e: "DIAGNÓSTICO. O que não pode faltar num plano de implementação?",
    opts: [
      "Acções, responsáveis, prazos e indicadores",
      "Apenas a lista de equipamento",
      "Apenas o nome do fornecedor",
      "Apenas o orçamento",
    ], ind: 0,
    exp: "Sem responsável, prazo e indicador, o plano não é executável nem verificável.",
    obj: "Diagnóstico: noção inicial de planeamento.",
  },
  {
    m: "m3", t: "vf", d: "f",
    e: "DIAGNÓSTICO. Verdadeiro ou falso: o número de sessões de formação realizadas mede a adopção de um novo processo.",
    val: false,
    exp: "Falso. A adopção mede-se pelo uso efectivo do novo processo, não pelas actividades realizadas.",
    obj: "Diagnóstico: noção inicial de indicadores de adopção.",
  },
  {
    m: "m3", t: "em", d: "f",
    e: "DIAGNÓSTICO. Porque convém medir os indicadores antes de iniciar a mudança?",
    opts: [
      "Para cumprir uma formalidade administrativa",
      "Para ter termo de comparação e poder demonstrar a melhoria depois",
      "Para justificar a compra de equipamento",
      "Para reduzir o número de reuniões",
    ], ind: 1,
    exp: "Sem medição inicial não há comparação possível e qualquer melhoria fica por demonstrar.",
    obj: "Diagnóstico: noção inicial de medição.",
  },
  {
    m: "transversal", t: "vf", d: "f",
    e: "DIAGNÓSTICO. Verdadeiro ou falso: publicar a informação de um serviço apenas como documento digitalizado em imagem dificulta o acesso a quem usa leitor de ecrã.",
    val: true,
    exp: "Verdadeiro. O leitor de ecrã não lê texto dentro de uma imagem; é preciso disponibilizar o conteúdo em texto.",
    obj: "Diagnóstico: noção inicial de conteúdo acessível.",
  },
];
