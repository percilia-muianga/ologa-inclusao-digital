/**
 * Banco de questões do curso «Computação em Nuvem» — VERSÃO 2 (renovação).
 *
 * Porquê uma versão nova: a versão 1 esteve acessível sem sessão na página de
 * gestão do banco. Foi retirada (continua guardada, fora do sorteio e sem
 * possibilidade de activação) e substituída por este conteúdo, escrito de raiz:
 * outros casos, outros dados, outros problemas, outros distractores e outro
 * raciocínio. Não é reescrita nem baralhamento da versão 1.
 *
 * Dois instrumentos separados:
 * - EXAME: 60 questões para uma prova proposta de 20 (secção 10 do TdR: banco
 *   com pelo menos o triplo das questões usadas em cada exame).
 * - PRE_POS: 10 questões de diagnóstico e pós-teste. NÃO certifica e não entra
 *   no sorteio do exame final.
 *
 * Todas entram INACTIVAS (rascunho por validar pela Ologa/ATDI).
 *
 * Distribuição desenhada para as quotas em vigor em src/lib/quotas-exame.ts
 * (6 M1 + 7 M2 + 5 M3 + 2 transversal; 8 escolha múltipla + 4 verdadeiro/falso
 * + 4 associação + 4 cenário; 8 fáceis + 8 médias + 4 difíceis):
 *   M1 18 = em 7 (3f/3me/1di) + vf 4 (2f/1me/1di) + cor 4 (2f/1me/1di) + cen 3 (1f/1me/1di)
 *   M2 21 = em 9 (4f/4me/1di) + vf 4 (2f/1me/1di) + cor 4 (1f/2me/1di) + cen 4 (1f/2me/1di)
 *   M3 15 = em 6 (2f/3me/1di) + vf 3 (1f/1me/1di) + cor 3 (1f/1me/1di) + cen 3 (1f/1me/1di)
 *   Transversal 6 = em 2 (1f/1me) + vf 1 (1f) + cor 1 (1me) + cen 2 (1f/1me)
 * Totais: 24 em, 12 vf, 12 cor, 12 cenário; 24 fáceis, 24 médias, 12 difíceis.
 *
 * Preços, câmbios e nomes de instituições são FICTÍCIOS, identificados como tal
 * no próprio enunciado, com todos os operandos visíveis e contas verificadas.
 *
 * Gabaritos e justificações vivem aqui, fora de src/ e fora de public/, e só
 * são carregados para a base de dados.
 */

export type QuestaoNuvemV2 = {
  m: "m1" | "m2" | "m3" | "transversal";
  t: "em" | "vf" | "cor";
  /** Cenário: caso concreto + decisão aplicada. Categoria pedagógica própria. */
  cen?: true;
  d: "f" | "me" | "di";
  e: string;
  opts?: string[];
  ind?: number;
  val?: boolean;
  pares?: { esquerda: string; direita: string }[];
  exp: string;
  /** Objectivo de aprendizagem e lição de origem. */
  obj: string;
};

export const EXAME_V2: QuestaoNuvemV2[] = [
  // ============================================================
  // MÓDULO 1 — Fundamentos de Computação em Nuvem (18)
  // ============================================================
  // ---- escolha múltipla: 3 fáceis, 3 médias, 1 difícil ----
  {
    m: "m1", t: "em", d: "f",
    e: "A factura mensal de um serviço de nuvem apresenta, linha a linha, as horas de máquina ligada, os gigabytes guardados e os gigabytes transferidos para fora. Que característica essencial da definição do NIST está a ser demonstrada por essa factura?",
    opts: [
      "Serviço medido",
      "Elasticidade rápida",
      "Partilha de recursos",
      "Acesso amplo pela rede",
    ], ind: 0,
    exp: "O serviço medido é a característica que permite medir, controlar e reportar o consumo, tornando possível facturar por unidade usada. A elasticidade descreve a capacidade de crescer e diminuir, não a medição; a partilha de recursos descreve o modelo multi-inquilino; o acesso amplo pela rede descreve o alcance a partir de vários aparelhos.",
    obj: "Reconhecer o serviço medido entre as cinco características essenciais. Lição 1 do módulo 1.",
  },
  {
    m: "m1", t: "em", d: "f",
    e: "Uma repartição usa um serviço de correio electrónico contratado como software como serviço (SaaS). Quem trata das actualizações de segurança do sistema operativo das máquinas onde esse correio corre?",
    opts: [
      "A repartição, através da sua equipa de informática",
      "O fornecedor do serviço",
      "Cada pessoa utilizadora, no seu computador",
      "Ninguém: em SaaS o sistema operativo não é actualizado",
    ], ind: 1,
    exp: "Em SaaS o fornecedor gere a infra-estrutura, o sistema operativo e a própria aplicação. À instituição cabem as contas, as permissões, a configuração da aplicação e os dados que lá coloca.",
    obj: "Distinguir responsabilidades por modelo de serviço. Lição 2 do módulo 1.",
  },
  {
    m: "m1", t: "em", d: "f",
    e: "Uma instituição mantém o sistema de processamento de salários em servidores próprios e coloca o portal de consulta pública num fornecedor de nuvem pública, com ligação entre os dois. Como se chama este modelo de implantação?",
    opts: ["Nuvem pública", "Nuvem privada", "Nuvem híbrida", "Nuvem comunitária"], ind: 2,
    exp: "Híbrida é a combinação de dois ou mais modelos de implantação que continuam distintos mas estão ligados entre si. Não é pública, porque parte fica em infra-estrutura própria; não é privada, porque parte está num fornecedor público; comunitária seria uma infra-estrutura partilhada por instituições com preocupações comuns.",
    obj: "Identificar o modelo de implantação a partir da descrição. Lição 3 do módulo 1.",
  },
  {
    m: "m1", t: "em", d: "me",
    e: "Durante três dias do mês, o portal de inscrições recebe dez vezes mais pedidos do que nos restantes dias. A instituição quer pagar a capacidade extra apenas nesses dias. Que combinação de características essenciais responde directamente a esta necessidade?",
    opts: [
      "Acesso amplo pela rede e partilha de recursos",
      "Elasticidade rápida e serviço medido",
      "Auto-serviço a pedido e acesso amplo pela rede",
      "Partilha de recursos e elasticidade rápida",
    ], ind: 1,
    exp: "A elasticidade rápida permite aumentar e reduzir a capacidade conforme a procura; o serviço medido é o que faz com que essa capacidade extra seja cobrada apenas enquanto existir. As outras características ajudam, mas não respondem ao «pagar só nesses dias».",
    obj: "Relacionar características essenciais com uma necessidade concreta do serviço. Lição 1 do módulo 1.",
  },
  {
    m: "m1", t: "em", d: "me",
    e: "Numa plataforma como serviço (PaaS) usada para publicar uma aplicação web, o que continua sob responsabilidade directa da instituição?",
    opts: [
      "A aplicação, as suas configurações e os dados",
      "As correcções de segurança do sistema operativo",
      "A manutenção física dos servidores",
      "A rede interna do centro de dados do fornecedor",
    ], ind: 0,
    exp: "Em PaaS o fornecedor trata da máquina, do sistema operativo e da plataforma de execução. A instituição continua responsável pelo código que publica, pelas variáveis de configuração e pelos dados que a aplicação trata.",
    obj: "Delimitar a fronteira de responsabilidade em PaaS. Lição 2 do módulo 1.",
  },
  {
    m: "m1", t: "em", d: "me",
    e: "O auto-serviço a pedido permite que qualquer pessoa com permissões crie recursos sem pedir autorização a um operador. Qual é a consequência de gestão que a instituição tem de acautelar por causa dessa característica?",
    opts: [
      "A criação de recursos deixa de gerar custo enquanto não for usada",
      "Podem ser criados recursos sem controlo, com custo e risco associados",
      "O fornecedor passa a aprovar cada recurso criado",
      "Deixa de ser possível medir o consumo por serviço",
    ], ind: 1,
    exp: "A facilidade de criar recursos é uma vantagem operacional e, ao mesmo tempo, um risco de governação: recursos criados sem regra consomem orçamento e alargam a superfície exposta. Por isso a instituição define quem pode criar o quê, com que etiquetas e com que revisão.",
    obj: "Antecipar implicações de governação do auto-serviço. Lições 1 e 4 do módulo 1.",
  },
  {
    m: "m1", t: "em", d: "di",
    e: "Quatro instituições do sector da saúde partilham uma infra-estrutura de nuvem operada por um terceiro, com requisitos comuns de segurança definidos entre elas e sem acesso de outras entidades. Segundo os modelos de implantação estudados, como se classifica melhor esta infra-estrutura, e porquê?",
    opts: [
      "Nuvem pública, porque é operada por um terceiro",
      "Nuvem privada, porque cada instituição tem a sua área reservada",
      "Nuvem comunitária, porque serve um conjunto fechado de instituições com requisitos comuns",
      "Nuvem híbrida, porque envolve mais do que uma instituição",
    ], ind: 2,
    exp: "O que classifica o modelo não é quem opera, mas a quem a infra-estrutura é destinada. Destinada a uma comunidade fechada de instituições com preocupações comuns, é comunitária — mesmo quando a operação está entregue a um terceiro. Híbrido exigiria a combinação de modelos distintos ligados entre si.",
    obj: "Classificar modelos de implantação por destinatário e não por operador. Lição 3 do módulo 1.",
  },
  // ---- verdadeiro/falso: 2 fáceis, 1 média, 1 difícil ----
  {
    m: "m1", t: "vf", d: "f",
    e: "Verdadeiro ou falso: «nuvem pública» significa que os dados lá guardados ficam acessíveis ao público em geral.",
    val: false,
    exp: "Falso. «Pública» refere-se ao facto de a infra-estrutura estar disponível ao público em geral para contratação, e não ao acesso aos dados. O acesso aos dados depende das permissões e das configurações definidas por quem contrata.",
    obj: "Corrigir o equívoco mais comum sobre nuvem pública. Lição 3 do módulo 1.",
  },
  {
    m: "m1", t: "vf", d: "f",
    e: "Verdadeiro ou falso: o acesso amplo pela rede significa que o serviço pode ser usado a partir de aparelhos diferentes, como computador, tablet ou telemóvel, desde que haja ligação.",
    val: true,
    exp: "Verdadeiro. Esta característica descreve a disponibilidade do serviço através da rede, por mecanismos padronizados, acessíveis a partir de aparelhos variados.",
    obj: "Reconhecer o acesso amplo pela rede. Lição 1 do módulo 1.",
  },
  {
    m: "m1", t: "vf", d: "me",
    e: "Verdadeiro ou falso: ao adoptar uma nuvem privada alojada na própria instituição, esta deixa de ter responsabilidades de manutenção da infra-estrutura.",
    val: false,
    exp: "Falso. Numa nuvem privada alojada na própria instituição, a manutenção física, a energia, a substituição de equipamento e as actualizações continuam a ser responsabilidade da instituição. O que muda é a forma de disponibilizar recursos, não o dono da manutenção.",
    obj: "Distinguir modelo de implantação de transferência de responsabilidade. Lições 3 e 4 do módulo 1.",
  },
  {
    m: "m1", t: "vf", d: "di",
    e: "Verdadeiro ou falso: pelo facto de existir elasticidade rápida, migrar um serviço para a nuvem reduz necessariamente o custo total desse serviço.",
    val: false,
    exp: "Falso. A elasticidade permite ajustar a capacidade à procura, o que pode reduzir desperdício; mas o custo total depende do dimensionamento escolhido, do tempo em que os recursos ficam ligados, do armazenamento acumulado, da transferência de dados para fora, do suporte contratado e de compromissos já assumidos. Sem gestão de consumo, o custo pode até aumentar.",
    obj: "Avaliar criticamente promessas de poupança. Lição 4 do módulo 1.",
  },
  // ---- associação: 2 fáceis, 1 média, 1 difícil ----
  {
    m: "m1", t: "cor", d: "f",
    e: "Associe cada característica essencial da definição do NIST à evidência prática que melhor a demonstra no dia-a-dia de uma instituição.",
    pares: [
      { esquerda: "Auto-serviço a pedido", direita: "A técnica cria uma máquina virtual no portal, sem abrir pedido a um operador" },
      { esquerda: "Acesso amplo pela rede", direita: "O sistema é usado do computador da repartição e do telemóvel em deslocação" },
      { esquerda: "Partilha de recursos", direita: "Várias instituições usam a mesma infra-estrutura física, com separação lógica" },
      { esquerda: "Elasticidade rápida", direita: "A capacidade sobe na campanha de inscrições e desce depois" },
      { esquerda: "Serviço medido", direita: "O relatório mostra horas, gigabytes e transferências consumidos no mês" },
    ],
    exp: "Cada característica tem uma evidência observável distinta: criar sem intermediário (auto-serviço), usar de vários aparelhos (acesso pela rede), partilhar infra-estrutura com separação lógica (partilha de recursos), acompanhar a procura (elasticidade) e medir o consumo (serviço medido).",
    obj: "Ligar cada característica essencial a evidência prática. Lição 1 do módulo 1.",
  },
  {
    m: "m1", t: "cor", d: "f",
    e: "Associe cada modelo de serviço ao exemplo que lhe corresponde.",
    pares: [
      { esquerda: "Infra-estrutura como serviço", direita: "Máquina virtual onde a instituição instala e actualiza o sistema operativo" },
      { esquerda: "Plataforma como serviço", direita: "Serviço onde se publica o código da aplicação sem gerir o servidor" },
      { esquerda: "Software como serviço", direita: "Aplicação de correio electrónico usada pelo navegador, gerida pelo fornecedor" },
      { esquerda: "Armazenamento de objectos", direita: "Contentor onde se guardam ficheiros acedidos por endereço, sem sistema de ficheiros" },
    ],
    exp: "A distinção prática está no que a instituição continua a gerir: máquina e sistema operativo (IaaS), apenas código e configuração (PaaS), apenas contas e dados (SaaS). O armazenamento de objectos é um serviço de dados, acedido por endereço.",
    obj: "Associar modelos de serviço a exemplos concretos. Lição 2 do módulo 1.",
  },
  {
    m: "m1", t: "cor", d: "me",
    e: "Numa repartição que usa os três modelos de serviço, associe cada tarefa à parte responsável por ela.",
    pares: [
      { esquerda: "Actualizar o sistema operativo de uma máquina virtual em IaaS", direita: "Instituição" },
      { esquerda: "Corrigir uma falha do motor de execução em PaaS", direita: "Fornecedor" },
      { esquerda: "Definir quem tem acesso a cada pasta numa aplicação SaaS", direita: "Instituição" },
      { esquerda: "Substituir um disco avariado no centro de dados", direita: "Fornecedor" },
      { esquerda: "Classificar os dados que vão ser carregados no serviço", direita: "Instituição" },
    ],
    exp: "A responsabilidade partilhada desloca-se com o modelo, mas há constantes: contas, permissões, classificação e conteúdo dos dados são sempre da instituição; a infra-estrutura física e as camadas geridas pelo fornecedor são dele.",
    obj: "Aplicar o modelo de responsabilidade partilhada a tarefas concretas. Lições 2 e 4 do módulo 1.",
  },
  {
    m: "m1", t: "cor", d: "di",
    e: "Associe cada situação ao modelo de implantação que melhor a descreve.",
    pares: [
      { esquerda: "Serviço aberto a qualquer entidade que o contrate, em infra-estrutura partilhada", direita: "Nuvem pública" },
      { esquerda: "Infra-estrutura destinada a uma só instituição, ainda que operada por terceiro", direita: "Nuvem privada" },
      { esquerda: "Infra-estrutura destinada a um grupo fechado de instituições com requisitos comuns", direita: "Nuvem comunitária" },
      { esquerda: "Sistema interno ligado a um portal público alojado noutro modelo", direita: "Nuvem híbrida" },
    ],
    exp: "O critério é o destinatário da infra-estrutura, não quem a opera nem onde está fisicamente. Uma nuvem privada pode ser operada por terceiro; uma híbrida exige dois modelos distintos ligados entre si.",
    obj: "Classificar modelos de implantação em casos próximos entre si. Lição 3 do módulo 1.",
  },
  // ---- cenários: 1 fácil, 1 média, 1 difícil ----
  {
    m: "m1", t: "em", cen: true, d: "f",
    e: "CENÁRIO (dados fictícios). A Direcção Distrital de Nampeta abre inscrições para bolsas durante duas semanas por ano. Nesse período o portal recebe cerca de 40 vezes mais visitas; no resto do ano fica quase parado. A direcção tem orçamento apertado e não quer comprar servidores. Que decisão é mais coerente com o que foi estudado?",
    opts: [
      "Comprar servidores dimensionados para o pico das duas semanas",
      "Usar um serviço de nuvem com capacidade ajustável, subindo no período de inscrições e descendo depois",
      "Manter o portal fechado fora do período de inscrições para poupar",
      "Contratar capacidade fixa mínima e aceitar que o portal fique indisponível no pico",
    ], ind: 1,
    exp: "O padrão é sazonal e conhecido: é o caso típico de elasticidade com serviço medido. Comprar para o pico deixa capacidade parada 50 semanas por ano; fechar o portal ou aceitar indisponibilidade prejudica o cidadão sem necessidade.",
    obj: "Decidir o modelo perante procura sazonal. Lição 5 do módulo 1.",
  },
  {
    m: "m1", t: "em", cen: true, d: "me",
    e: "CENÁRIO (dados fictícios). Numa administração distrital, a ligação à internet cai várias vezes por semana e o atendimento não pode parar, porque emite declarações no balcão. A equipa propõe passar todo o sistema de atendimento para SaaS acessível apenas pela internet. Qual é a análise mais correcta desta proposta?",
    opts: [
      "A proposta é adequada, porque SaaS funciona sem ligação à internet",
      "A proposta é adequada, porque a nuvem substitui a necessidade de rede local",
      "A proposta é arriscada: sem ligação o atendimento pára, pelo que é preciso prever funcionamento local ou registo em papel com sincronização posterior",
      "A proposta é arriscada apenas por causa do custo mensal do serviço",
    ], ind: 2,
    exp: "A dependência da ligação é o limite central da nuvem em contextos de conectividade fraca. A decisão correcta passa por manter uma forma de trabalhar quando a ligação cai — funcionamento local ou registo alternativo com sincronização — e não por assumir que o serviço está sempre disponível.",
    obj: "Avaliar limites da nuvem em contexto de conectividade fraca. Lições 4 e 5 do módulo 1.",
  },
  {
    m: "m1", t: "em", cen: true, d: "di",
    e: "CENÁRIO (dados fictícios). Uma instituição tem duas pessoas na área de informática e precisa de publicar, em dois meses, um formulário electrónico simples. A equipa hesita entre criar máquinas virtuais (IaaS) e publicar num serviço de plataforma (PaaS). Que argumento sustenta melhor a escolha de PaaS neste caso concreto?",
    opts: [
      "PaaS é sempre mais barato do que IaaS, em qualquer volume",
      "Com PaaS a equipa deixa de ser responsável pelos dados do formulário",
      "Com PaaS a equipa não gere sistema operativo nem correcções da máquina, o que reduz o trabalho de manutenção que duas pessoas teriam de assegurar",
      "Com IaaS não é possível publicar aplicações web",
    ], ind: 2,
    exp: "O argumento decisivo é a capacidade da equipa: PaaS retira à instituição a gestão do sistema operativo e das correcções da máquina. Não é verdade que seja sempre mais barato, os dados continuam da instituição, e IaaS também permite publicar aplicações — apenas com mais trabalho de manutenção.",
    obj: "Escolher o modelo de serviço em função da capacidade da equipa. Lições 2 e 5 do módulo 1.",
  },

  // ============================================================
  // MÓDULO 2 — Serviços e Arquitectura na Nuvem (21)
  // ============================================================
  // ---- escolha múltipla: 4 fáceis, 4 médias, 1 difícil ----
  {
    m: "m2", t: "em", d: "f",
    e: "Um contentor de armazenamento de objectos foi criado para receber cópias de documentos digitalizados. Qual é a configuração correcta de partida, segundo o exercício realizado no curso?",
    opts: [
      "Acesso público de leitura, para facilitar a consulta",
      "Acesso público de leitura e escrita, para permitir carregamentos",
      "Acesso bloqueado ao público, com permissões concedidas apenas a quem precisa",
      "Sem qualquer configuração de acesso, ficando ao critério do fornecedor",
    ], ind: 2,
    exp: "O ponto de partida é o contentor privado, com bloqueio de acesso público, e concessão explícita apenas a quem precisa. Abrir leitura ou escrita ao público expõe documentos e permite carregamentos não controlados.",
    obj: "Aplicar a configuração de partida de um contentor de objectos. Lição 1 do módulo 2.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "No exercício de rede, antes de criar a máquina virtual foram criadas a rede virtual, as sub-redes e os grupos de segurança. Qual é a razão desta ordem?",
    opts: [
      "Porque a máquina virtual só arranca depois de existirem regras de filtragem",
      "Porque a máquina nasce dentro de uma sub-rede já filtrada, em vez de ficar exposta enquanto as regras não existem",
      "Porque o fornecedor não permite criar máquinas antes de redes",
      "Porque a rede virtual atribui automaticamente o endereço público da máquina",
    ], ind: 1,
    exp: "A ordem protege a máquina desde o primeiro minuto: quando nasce, já está numa sub-rede com filtragem associada. Se fosse criada primeiro, ficaria um intervalo de tempo sem regras.",
    obj: "Justificar a ordem de criação dos recursos de rede. Lição 2 do módulo 2.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "Um serviço tem de recuperar de uma falha perdendo, no máximo, 30 minutos de dados. Que indicador está a ser definido?",
    opts: [
      "O objectivo de tempo de recuperação (RTO)",
      "O objectivo de ponto de recuperação (RPO)",
      "O acordo de nível de serviço (SLA)",
      "A janela de manutenção programada",
    ], ind: 1,
    exp: "O objectivo de ponto de recuperação mede quantos dados se aceita perder, medidos em tempo desde a última cópia utilizável. O tempo de recuperação mede quanto tempo o serviço pode estar indisponível.",
    obj: "Distinguir RPO de RTO. Lição 4 do módulo 2.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "Na aplicação de exemplo publicada em plataforma como serviço, a porta em que o programa escuta é definida por uma variável de ambiente fornecida pela plataforma. Porque é que o programa não deve fixar uma porta escolhida por si?",
    opts: [
      "Porque a plataforma encaminha o tráfego para a porta que ela própria indica ao programa",
      "Porque fixar a porta impede o programa de escrever registos",
      "Porque a porta fixa consome mais memória",
      "Porque a plataforma não permite programas que escutem em portas",
    ], ind: 0,
    exp: "A plataforma indica ao programa em que porta deve escutar, através de variável de ambiente, e encaminha o tráfego para essa porta. Um programa que fixe outra porta simplesmente não recebe pedidos.",
    obj: "Explicar a ligação entre a plataforma e a aplicação publicada. Lição 3 do módulo 2.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "Uma regra de negação explícita foi criada com prioridade 4000 e as regras de permissão do serviço com prioridade 100. Que efeito tem esta escolha de prioridades?",
    opts: [
      "As permissões são avaliadas primeiro; o que não corresponder a nenhuma delas é negado pela regra 4000",
      "A negação é avaliada primeiro e bloqueia todo o tráfego, inclusive o permitido",
      "As prioridades não influenciam a ordem de avaliação",
      "A regra 4000 substitui as regras predefinidas do fornecedor",
    ], ind: 0,
    exp: "Números mais baixos são avaliados primeiro. Assim, o tráfego previsto encontra a permissão em 100; o restante chega à negação explícita em 4000 e é bloqueado antes das regras predefinidas de prioridade muito alta.",
    obj: "Interpretar prioridades em regras de filtragem. Lição 2 do módulo 2.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "Depois de configurar as regras de rede, a equipa tentou ligar-se de um endereço não autorizado e a ligação ficou parada até expirar o tempo. Que conclusão é legítima retirar dessa observação?",
    opts: [
      "Fica provado que a regra de negação funcionou",
      "Fica provado que o servidor está desligado",
      "Nada fica provado quanto à filtragem: a espera pode ter outras causas, e a verificação deve ser feita pela avaliação de regras sobre a interface real",
      "Fica provado que o endereço de origem está mal configurado",
    ], ind: 2,
    exp: "Uma espera até expirar pode resultar de filtragem, mas também de rota inexistente, serviço parado ou problema na rede de origem. Por isso a verificação usa a avaliação das regras aplicadas à interface real da máquina, e o teste positivo a partir do endereço autorizado.",
    obj: "Distinguir prova de filtragem de mera ausência de resposta. Lição 2 do módulo 2.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "Numa arquitectura simples de três camadas, onde deve ficar a base de dados e porquê?",
    opts: [
      "Na mesma sub-rede do servidor de aplicação, para simplificar as regras",
      "Numa sub-rede própria, sem acesso a partir da internet, alcançável apenas a partir da camada de aplicação",
      "Numa sub-rede pública, com acesso directo dos utilizadores, para reduzir latência",
      "Fora de qualquer sub-rede, ligada apenas por endereço público",
    ], ind: 1,
    exp: "A separação por camadas limita o alcance de uma falha: a base de dados fica numa sub-rede própria, sem exposição à internet, e só aceita tráfego vindo da camada de aplicação, na porta necessária.",
    obj: "Desenhar a separação de camadas numa arquitectura simples. Lição 5 do módulo 2.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "A equipa configurou cópias de segurança diárias de uma base de dados e nunca fez qualquer restauro de teste. Qual é o risco central desta situação?",
    opts: [
      "As cópias ocupam espaço desnecessário",
      "Só se descobre se a cópia é utilizável no momento em que já é preciso restaurar",
      "As cópias diárias tornam o serviço mais lento durante o dia",
      "Não há risco, porque a existência da cópia garante a recuperação",
    ], ind: 1,
    exp: "Uma cópia só vale o que valer o restauro. Sem teste periódico de restauro, o objectivo de ponto de recuperação é uma intenção no papel: ficheiros corrompidos, incompletos ou impossíveis de ler só aparecem na hora da emergência.",
    obj: "Reconhecer a necessidade de testar restauros. Lição 4 do módulo 2.",
  },
  {
    m: "m2", t: "em", d: "di",
    e: "Uma máquina virtual foi criada e a sua interface de rede ficou, por lapso, com um grupo de segurança próprio, além do grupo já associado à sub-rede. O acesso administrativo autorizado deixou de funcionar. Qual é a explicação mais provável?",
    opts: [
      "Dois grupos de segurança não podem coexistir e a criação falhou",
      "O tráfego tem de ser permitido pelos dois conjuntos de regras; o grupo da interface não permite o acesso administrativo e bloqueia-o",
      "O grupo da sub-rede deixa de ser aplicado quando existe grupo na interface",
      "O endereço público da máquina foi removido ao associar o segundo grupo",
    ], ind: 1,
    exp: "Quando existem filtros na sub-rede e na interface, o tráfego de entrada tem de ser permitido em ambos. Um grupo adicional na interface sem a regra de acesso administrativo bloqueia a ligação, mesmo que a sub-rede a permita. Por isso, no exercício, a interface é criada explicitamente sem grupo próprio.",
    obj: "Diagnosticar bloqueios causados por filtros sobrepostos. Lição 2 do módulo 2.",
  },
  // ---- verdadeiro/falso: 2 fáceis, 1 média, 1 difícil ----
  {
    m: "m2", t: "vf", d: "f",
    e: "Verdadeiro ou falso: no exercício de rede, o acesso administrativo à máquina virtual deve ser permitido a partir de qualquer endereço da internet, para facilitar o trabalho da equipa.",
    val: false,
    exp: "Falso. O acesso administrativo é permitido apenas a partir do endereço de saída da sala de formação, indicado como endereço único. Abrir a porta administrativa a toda a internet expõe a máquina a tentativas contínuas de acesso.",
    obj: "Aplicar a restrição de origem no acesso administrativo. Lição 2 do módulo 2.",
  },
  {
    m: "m2", t: "vf", d: "f",
    e: "Verdadeiro ou falso: o armazenamento de objectos guarda ficheiros acedidos por um endereço próprio, e não através de um sistema de ficheiros com pastas como o de um disco.",
    val: true,
    exp: "Verdadeiro. No armazenamento de objectos cada ficheiro é um objecto com identificador e endereço; a aparência de «pastas» resulta do nome dado ao objecto, não de uma estrutura de directórios.",
    obj: "Distinguir armazenamento de objectos de disco. Lição 1 do módulo 2.",
  },
  {
    m: "m2", t: "vf", d: "me",
    e: "Verdadeiro ou falso: uma cópia de segurança guardada apenas na mesma máquina que contém os dados originais protege contra a perda dessa máquina.",
    val: false,
    exp: "Falso. Se a cópia vive na própria máquina, perde-se com ela. A cópia deve ficar em local separado dos dados originais, e o plano deve indicar onde está, quem a restaura e com que frequência o restauro é testado.",
    obj: "Avaliar a localização das cópias de segurança. Lição 4 do módulo 2.",
  },
  {
    m: "m2", t: "vf", d: "di",
    e: "Verdadeiro ou falso: o acordo de nível de serviço publicado pelo fornecedor para um serviço é, só por si, garantia de que o serviço da instituição terá essa disponibilidade.",
    val: false,
    exp: "Falso. O acordo cobre o comportamento do componente do fornecedor, nas condições que ele define, e normalmente traduz-se em compensação contratual, não em ausência de falhas. A disponibilidade efectiva do serviço da instituição depende também do desenho, das dependências, da rede local e das cópias e restauros.",
    obj: "Interpretar criticamente acordos de nível de serviço. Lições 4 e 5 do módulo 2.",
  },
  // ---- associação: 1 fácil, 2 médias, 1 difícil ----
  {
    m: "m2", t: "cor", d: "f",
    e: "Associe cada recurso criado no módulo à sua função.",
    pares: [
      { esquerda: "Rede virtual", direita: "Espaço de endereçamento próprio onde os recursos comunicam" },
      { esquerda: "Sub-rede", direita: "Divisão interna da rede, usada para separar camadas" },
      { esquerda: "Grupo de segurança de rede", direita: "Conjunto de regras que permite ou nega tráfego" },
      { esquerda: "Contentor de objectos", direita: "Local onde se guardam ficheiros acedidos por endereço" },
      { esquerda: "Serviço de plataforma", direita: "Local onde se publica a aplicação sem gerir o servidor" },
    ],
    exp: "Cada recurso tem uma função distinta: a rede virtual delimita o endereçamento, a sub-rede separa camadas, o grupo de segurança filtra o tráfego, o contentor guarda objectos e o serviço de plataforma executa a aplicação.",
    obj: "Identificar a função de cada recurso do laboratório. Lições 1 a 3 do módulo 2.",
  },
  {
    m: "m2", t: "cor", d: "me",
    e: "Associe cada situação ao indicador ou medida de continuidade que lhe corresponde.",
    pares: [
      { esquerda: "Aceitamos perder no máximo 15 minutos de registos", direita: "Objectivo de ponto de recuperação" },
      { esquerda: "O serviço tem de voltar em duas horas", direita: "Objectivo de tempo de recuperação" },
      { esquerda: "Cópia guardada em local separado dos dados originais", direita: "Medida de protecção contra perda do ambiente" },
      { esquerda: "Restauro experimentado todos os trimestres", direita: "Verificação de que a cópia é utilizável" },
    ],
    exp: "Perda tolerada de dados é o ponto de recuperação; tempo tolerado de paragem é o tempo de recuperação; a separação da cópia protege contra a perda do ambiente; o restauro de teste é o que confirma que a cópia serve.",
    obj: "Relacionar decisões de continuidade com os indicadores correctos. Lição 4 do módulo 2.",
  },
  {
    m: "m2", t: "cor", d: "me",
    e: "Associe cada regra de filtragem à decisão de desenho que a justifica numa arquitectura de três camadas.",
    pares: [
      { esquerda: "Permitir tráfego web de entrada na sub-rede pública", direita: "Os cidadãos acedem ao portal pela internet" },
      { esquerda: "Permitir tráfego da camada de aplicação para a porta da base de dados", direita: "A aplicação precisa de consultar dados" },
      { esquerda: "Negar explicitamente o restante tráfego de entrada na sub-rede de dados", direita: "A base de dados não deve ser alcançável de outros pontos" },
      { esquerda: "Permitir acesso administrativo apenas do endereço de saída da sala", direita: "A administração é feita por pessoas identificadas, de um local conhecido" },
    ],
    exp: "Cada regra responde a uma necessidade explícita do desenho. Regras sem necessidade correspondente são superfície exposta sem benefício.",
    obj: "Justificar cada regra de filtragem pela necessidade do serviço. Lições 2 e 5 do módulo 2.",
  },
  {
    m: "m2", t: "cor", d: "di",
    e: "Associe cada sintoma observado ao diagnóstico mais provável, de acordo com o que foi praticado no módulo.",
    pares: [
      { esquerda: "Ligação administrativa não responde, mesmo com regra de permissão na sub-rede", direita: "Existe um segundo filtro na interface de rede que não permite o acesso" },
      { esquerda: "A aplicação publicada devolve erro de arranque", direita: "O programa não está a escutar na porta indicada pela plataforma" },
      { esquerda: "Ficheiro do contentor não abre a partir do navegador sem sessão", direita: "O contentor está privado, como previsto" },
      { esquerda: "A cópia existe mas o restauro falha", direita: "A cópia nunca foi testada e pode estar incompleta" },
    ],
    exp: "Os quatro sintomas remetem para causas distintas praticadas no módulo: filtros sobrepostos, porta de escuta, contentor privado por desenho e cópia nunca verificada.",
    obj: "Diagnosticar problemas a partir de sintomas observados. Lições 1 a 4 do módulo 2.",
  },
  // ---- cenários: 1 fácil, 2 médias, 1 difícil ----
  {
    m: "m2", t: "em", cen: true, d: "f",
    e: "CENÁRIO (dados fictícios). Na Repartição de Águas de Chimbonila, os documentos digitalizados foram colocados num contentor de objectos com leitura pública, para que os técnicos os consultassem de casa. Um cidadão descobriu o endereço e acedeu a processos de terceiros. Qual é a correcção adequada?",
    opts: [
      "Mudar os nomes dos ficheiros para nomes difíceis de adivinhar",
      "Bloquear o acesso público ao contentor e conceder acesso apenas às contas dos técnicos autorizados",
      "Manter o acesso público e avisar os cidadãos de que não devem consultar",
      "Apagar os documentos e voltar ao papel",
    ], ind: 1,
    exp: "Nomes difíceis não são controlo de acesso: quem tiver o endereço acede. A correcção é bloquear o acesso público e conceder permissão explícita a quem precisa, mantendo o serviço a funcionar.",
    obj: "Corrigir uma exposição de armazenamento de objectos. Lição 1 do módulo 2.",
  },
  {
    m: "m2", t: "em", cen: true, d: "me",
    e: "CENÁRIO (dados fictícios). Um serviço distrital foi desenhado com uma máquina de aplicação e uma base de dados na mesma sub-rede, ambas com endereço público, «para facilitar o apoio remoto». O formador pede uma alteração mínima que reduza o risco sem parar o serviço. Qual propõe?",
    opts: [
      "Retirar o endereço público da base de dados e permitir o seu acesso apenas a partir da máquina de aplicação",
      "Mudar a porta da base de dados para um número pouco conhecido",
      "Criar uma segunda base de dados igual, como reserva",
      "Activar cópias de segurança de hora a hora",
    ], ind: 0,
    exp: "A alteração mínima e eficaz é retirar a exposição directa da base de dados e restringir a origem do tráfego à camada de aplicação. Mudar a porta é ocultação, não protecção; cópias e réplicas são úteis mas não reduzem a exposição.",
    obj: "Propor correcção de arquitectura com impacto mínimo. Lições 2 e 5 do módulo 2.",
  },
  {
    m: "m2", t: "em", cen: true, d: "me",
    e: "CENÁRIO (dados fictícios). A aplicação de exemplo foi publicada e responde correctamente. A equipa quer alterar a mensagem apresentada, sem tocar no código. Que caminho corresponde ao que foi praticado?",
    opts: [
      "Alterar a variável de ambiente que define a mensagem e reiniciar a aplicação",
      "Editar o ficheiro directamente no servidor pela consola do fornecedor",
      "Voltar a criar o serviço de plataforma de raiz",
      "Alterar a porta de escuta para que a mensagem mude",
    ], ind: 0,
    exp: "A mensagem é lida de uma variável de ambiente precisamente para poder ser alterada sem alterar o código. Recriar o serviço ou editar ficheiros no servidor contraria a prática de configuração externa ao código.",
    obj: "Separar configuração de código numa aplicação publicada. Lição 3 do módulo 2.",
  },
  {
    m: "m2", t: "em", cen: true, d: "di",
    e: "CENÁRIO (dados fictícios). Um sistema de registo de utentes exige recuperação com perda máxima de 15 minutos de dados e paragem máxima de 4 horas. A proposta actual tem cópia completa diária às 22h00, guardada no mesmo centro de dados, e nunca restaurada. Que conjunto de alterações responde aos dois objectivos?",
    opts: [
      "Manter a cópia diária e contratar suporte mais rápido do fornecedor",
      "Acrescentar cópias frequentes durante o dia, guardar em local separado e testar o restauro periodicamente, medindo o tempo que demora",
      "Duplicar a cópia diária, guardando duas vezes no mesmo local",
      "Reduzir o volume de dados para que a cópia diária baste",
    ], ind: 1,
    exp: "A perda máxima de 15 minutos exige cópias muito mais frequentes do que uma por dia; a paragem máxima de 4 horas exige saber quanto demora o restauro, o que só se sabe testando; e guardar no mesmo local não protege contra a perda do ambiente. As restantes opções não tocam em nenhum dos dois objectivos.",
    obj: "Alinhar plano de cópias com RPO e RTO declarados. Lição 4 do módulo 2.",
  },

  // ============================================================
  // MÓDULO 3 — Governação, Segurança e Custos (15)
  // ============================================================
  // ---- escolha múltipla: 2 fáceis, 3 médias, 1 difícil ----
  {
    m: "m3", t: "em", d: "f",
    e: "Qual das combinações seguintes constitui autenticação multifactor, tal como estudada no módulo?",
    opts: [
      "Palavra-passe seguida de uma segunda palavra-passe",
      "Palavra-passe seguida de pergunta de segurança",
      "Palavra-passe seguida de código gerado numa aplicação do telemóvel registado",
      "Nome de utilizador seguido de palavra-passe",
    ], ind: 2,
    exp: "Multifactor exige provas de categorias diferentes: algo que se sabe (palavra-passe) com algo que se tem (aparelho registado) ou algo que se é. Duas palavras-passe ou uma pergunta de segurança pertencem à mesma categoria — são dois passos, não multifactor.",
    obj: "Identificar multifactor por categorias de prova. Lição 1 do módulo 3.",
  },
  {
    m: "m3", t: "em", d: "f",
    e: "Uma instituição quer saber, mais tarde, quem alterou as permissões de um contentor de dados. Que medida assegura essa possibilidade?",
    opts: [
      "Cifrar os dados em repouso",
      "Registar os eventos de administração e guardar esses registos",
      "Aumentar a frequência das cópias de segurança",
      "Definir um alerta de orçamento",
    ], ind: 1,
    exp: "Só o registo de eventos permite reconstituir quem fez o quê e quando. A cifra protege a confidencialidade dos dados, as cópias protegem contra perda e os alertas de orçamento dizem respeito a custo.",
    obj: "Relacionar necessidade de prestação de contas com registo de eventos. Lição 3 do módulo 3.",
  },
  {
    m: "m3", t: "em", d: "me",
    e: "Um sistema usa uma identidade de aplicação para ler ficheiros de um contentor e escrever num segundo. Qual é a configuração mais conforme ao princípio do menor privilégio?",
    opts: [
      "Conceder à identidade permissões de administração na subscrição inteira",
      "Conceder leitura no primeiro contentor e escrita no segundo, e nada mais",
      "Usar a conta pessoal do técnico responsável pelo sistema",
      "Conceder leitura e escrita em todos os contentores, para evitar bloqueios futuros",
    ], ind: 1,
    exp: "O menor privilégio concede exactamente as operações necessárias, no âmbito necessário. Usar a conta pessoal de alguém confunde pessoa com sistema e quebra a prestação de contas; alargar «para evitar bloqueios» transforma um incidente pequeno num incidente grande.",
    obj: "Aplicar menor privilégio a identidades de aplicação. Lição 1 do módulo 3.",
  },
  {
    m: "m3", t: "em", d: "me",
    e: "A equipa cifra a base de dados em repouso e conclui que os dados ficam protegidos contra consulta indevida por pessoal interno. Que falha há neste raciocínio?",
    opts: [
      "A cifra em repouso não existe em serviços de base de dados",
      "A cifra em repouso protege contra acesso ao suporte físico ou aos ficheiros; quem tem acesso autorizado pela aplicação continua a ler os dados decifrados",
      "A cifra em repouso torna a base de dados inacessível a toda a gente",
      "A cifra em repouso substitui a necessidade de cópias de segurança",
    ], ind: 1,
    exp: "A cifra responde a um risco específico: leitura do suporte ou dos ficheiros por quem não passa pelos controlos de acesso. Contra uso indevido de permissões legítimas, o que vale é o controlo de acessos, a separação de funções e o registo de eventos.",
    obj: "Delimitar o que a criptografia protege. Lição 2 do módulo 3.",
  },
  {
    m: "m3", t: "em", d: "me",
    e: "Perante um incidente de acesso indevido, qual das acções seguintes deve anteceder qualquer tentativa de «limpar» o ambiente?",
    opts: [
      "Apagar os registos para evitar confusão",
      "Preservar os registos e as evidências disponíveis antes de alterar o ambiente",
      "Reinstalar imediatamente todos os servidores",
      "Comunicar publicamente o incidente antes de o analisar",
    ], ind: 1,
    exp: "Sem preservação de evidências perde-se a possibilidade de perceber o que aconteceu e até onde chegou o acesso. A sequência estudada é: detectar, triar, conter com autorização, preservar evidências, recuperar e retirar lições.",
    obj: "Ordenar correctamente a resposta a incidentes. Lição 3 do módulo 3.",
  },
  {
    m: "m3", t: "em", d: "di",
    e: "Uma instituição define um alerta de orçamento mensal e, no fim do mês, verifica que o valor foi ultrapassado apesar do alerta ter disparado a meio. Qual é a interpretação correcta?",
    opts: [
      "O alerta falhou tecnicamente e deve ser reconfigurado",
      "O alerta avisa, mas não suspende o consumo: a redução depende de uma decisão e de uma acção humanas ou automatizadas expressamente configuradas",
      "O alerta só funciona se o orçamento for anual",
      "O alerta suspende o consumo apenas em serviços de computação",
    ], ind: 1,
    exp: "Um alerta de orçamento é um aviso sobre o consumo previsto ou realizado. Não é um limite que corta serviços. Quem quiser travar consumo tem de decidir e agir — parar recursos, reduzir capacidade ou configurar acções automáticas específicas.",
    obj: "Distinguir alerta de orçamento de limite de consumo. Lição 4 do módulo 3.",
  },
  // ---- verdadeiro/falso: 1 fácil, 1 média, 1 difícil ----
  {
    m: "m3", t: "vf", d: "f",
    e: "Verdadeiro ou falso: os códigos de recuperação de uma conta são um segundo factor equivalente à aplicação de autenticação e podem ser usados no dia-a-dia.",
    val: false,
    exp: "Falso. Os códigos de recuperação são um mecanismo excepcional, para quando o factor habitual não está disponível. Guardam-se em local seguro conforme a política da instituição e não substituem o factor de uso corrente.",
    obj: "Classificar correctamente os códigos de recuperação. Lição 1 do módulo 3.",
  },
  {
    m: "m3", t: "vf", d: "me",
    e: "Verdadeiro ou falso: quando uma pessoa muda de funções dentro da instituição, basta acrescentar-lhe as permissões do novo cargo.",
    val: false,
    exp: "Falso. Acrescentar sem retirar acumula permissões ao longo da carreira e destrói a separação de funções. A revisão de acessos exige retirar o que deixou de ser necessário, no mesmo movimento em que se concede o novo.",
    obj: "Aplicar revisão e revogação de acessos. Lição 1 do módulo 3.",
  },
  {
    m: "m3", t: "vf", d: "di",
    e: "Verdadeiro ou falso: parar uma máquina virtual no portal garante sempre que ela deixa de gerar qualquer custo.",
    val: false,
    exp: "Falso. Uma máquina apenas parada, com capacidade ainda reservada, continua a facturar computação; só a paragem com libertação da capacidade (desalocação) interrompe a cobrança da computação em consumo. Mesmo assim, discos, endereços reservados, cópias e registos continuam a ser cobrados, e compromissos já assumidos, como capacidade reservada, planos de poupança ou licenças, continuam a pagar-se.",
    obj: "Distinguir máquina parada de máquina parada e desalocada, e reconhecer custos residuais. Lição 4 do módulo 3.",
  },
  // ---- associação: 1 fácil, 1 média, 1 difícil ----
  {
    m: "m3", t: "cor", d: "f",
    e: "Associe cada medida à finalidade principal que serve.",
    pares: [
      { esquerda: "Autenticação multifactor", direita: "Dificultar o uso de credenciais roubadas" },
      { esquerda: "Cifra dos dados em trânsito", direita: "Impedir a leitura do tráfego entre o cliente e o serviço" },
      { esquerda: "Registo de eventos de administração", direita: "Permitir saber depois quem fez o quê" },
      { esquerda: "Cópias de segurança testadas", direita: "Recuperar o serviço depois de uma perda de dados" },
    ],
    exp: "Cada medida responde a um risco diferente: uso de credenciais alheias, interceptação do tráfego, ausência de prestação de contas e perda de dados. Nenhuma substitui as outras.",
    obj: "Relacionar medidas de segurança com os riscos que mitigam. Lições 1 a 3 do módulo 3.",
  },
  {
    m: "m3", t: "cor", d: "me",
    e: "Associe cada componente de custo mensal ao serviço que o origina.",
    pares: [
      { esquerda: "Horas de máquina ligada", direita: "Computação" },
      { esquerda: "Gigabytes guardados no disco e no contentor", direita: "Armazenamento" },
      { esquerda: "Gigabytes transferidos para fora da nuvem", direita: "Saída de dados" },
      { esquerda: "Retenção de cópias e de registos", direita: "Continuidade e observabilidade" },
      { esquerda: "Plano contratado de apoio técnico", direita: "Suporte" },
    ],
    exp: "Ler uma factura exige separar estas parcelas. A saída de dados é a mais esquecida no planeamento, e o suporte é frequentemente um valor mínimo mensal independente do consumo.",
    obj: "Decompor a factura por origem de custo. Lição 4 do módulo 3.",
  },
  {
    m: "m3", t: "cor", d: "di",
    e: "Associe cada requisito de contratação ao elemento que o torna verificável.",
    pares: [
      { esquerda: "Disponibilidade do serviço", direita: "Percentagem comprometida, com exclusões e método de medição declarados" },
      { esquerda: "Recuperação após incidente", direita: "Objectivos de ponto e de tempo de recuperação, com teste previsto" },
      { esquerda: "Saída do contrato", direita: "Formato de exportação dos dados, prazo e responsabilidades na devolução" },
      { esquerda: "Apoio a pessoas com deficiência", direita: "Canais de apoio acessíveis e materiais em formatos alternativos previstos no contrato" },
    ],
    exp: "Um requisito só é exigível se estiver escrito de forma mensurável. Cada elemento da coluna direita é o que permite verificar o cumprimento; sem ele, o requisito é uma intenção.",
    obj: "Tornar mensuráveis requisitos de contratação. Lição 5 do módulo 3.",
  },
  // ---- cenários: 1 fácil, 1 média, 1 difícil ----
  {
    m: "m3", t: "em", cen: true, d: "f",
    e: "CENÁRIO (dados fictícios). Na Direcção Provincial de Mavúzia, três técnicos partilham a mesma conta de administração «para ser mais prático». Um recurso foi apagado e ninguém sabe quem o fez. Que correcção resolve a causa?",
    opts: [
      "Mudar a palavra-passe da conta partilhada todos os meses",
      "Criar uma conta nominal por técnico, com as permissões necessárias, e deixar de usar a conta partilhada",
      "Escrever num caderno quem usa a conta em cada dia",
      "Retirar a permissão de apagar recursos a toda a gente",
    ], ind: 1,
    exp: "Contas partilhadas impedem a prestação de contas: nenhum registo consegue atribuir a acção a uma pessoa. A correcção é a identidade nominal com permissões próprias. O caderno é um paliativo manual e retirar a permissão a todos paralisa o trabalho legítimo.",
    obj: "Ligar identidade nominal a prestação de contas. Lição 1 do módulo 3.",
  },
  {
    m: "m3", t: "em", cen: true, d: "me",
    e: "CENÁRIO (dados fictícios). Uma equipa detecta que uma chave de acesso de um sistema foi partilhada por correio electrónico com pessoas externas. O serviço está a funcionar e é usado pelo balcão de atendimento. Qual é a sequência mais adequada?",
    opts: [
      "Desligar imediatamente o serviço e só depois analisar",
      "Substituir a chave e revogar a antiga, registando o incidente e verificando nos registos se houve acessos indevidos",
      "Pedir por correio electrónico que as pessoas externas apaguem a mensagem",
      "Esperar pelo fim do expediente para não perturbar o atendimento",
    ], ind: 1,
    exp: "A chave exposta deve ser substituída e a antiga revogada, com registo do incidente e verificação de acessos nos registos. Desligar o serviço penaliza o cidadão sem necessidade imediata; pedir que apaguem a mensagem não retira o acesso; esperar mantém a janela aberta.",
    obj: "Responder a exposição de segredos sem parar o serviço desnecessariamente. Lições 2 e 3 do módulo 3.",
  },
  {
    m: "m3", t: "em", cen: true, d: "di",
    e: "CENÁRIO (preços FICTÍCIOS, para exercício). Um serviço tem: 300 horas de máquina a 0,12 USD por hora; 150 GB de armazenamento a 0,02 USD por GB; 50 GB de saída de dados a 0,09 USD por GB; e um plano de suporte com mínimo mensal de 20,00 USD. Qual é o total mensal em dólares?",
    opts: ["43,50 USD", "83,50 USD", "63,50 USD", "56,00 USD"], ind: 2,
    exp: "Computação: 300 × 0,12 = 36,00 USD. Armazenamento: 150 × 0,02 = 3,00 USD. Saída de dados: 50 × 0,09 = 4,50 USD. Consumo = 36,00 + 3,00 + 4,50 = 43,50 USD. Somando o mínimo mensal de suporte, 43,50 + 20,00 = 63,50 USD. A opção 43,50 USD esquece o suporte; 56,00 USD esquece a saída de dados e parte do armazenamento; 83,50 USD duplica o suporte.",
    obj: "Calcular um custo mensal com todos os operandos visíveis. Lição 4 do módulo 3.",
  },

  // ============================================================
  // TRANSVERSAL — Governo Digital Inclusivo e Acessibilidade (6)
  // ============================================================
  {
    m: "transversal", t: "em", d: "f",
    e: "Ao publicar um formulário electrónico de um serviço público, qual das opções torna o conteúdo mais acessível a quem usa leitor de ecrã?",
    opts: [
      "Disponibilizar o formulário como imagem digitalizada do papel",
      "Disponibilizar o formulário em texto estruturado, com campos identificados por etiquetas",
      "Disponibilizar o formulário apenas em vídeo explicativo",
      "Disponibilizar o formulário num ficheiro comprimido para descarregar",
    ], ind: 1,
    exp: "Texto estruturado, com etiquetas associadas a cada campo, pode ser lido e navegado por leitor de ecrã. Imagens digitalizadas não têm texto legível por programa; vídeo sem alternativa textual exclui quem não ouve ou não vê; um ficheiro comprimido não resolve nada quanto à acessibilidade do conteúdo.",
    obj: "Escolher formatos acessíveis ao publicar conteúdo de serviço público. Lições do módulo transversal sobre acessibilidade e informação.",
  },
  {
    m: "transversal", t: "em", d: "me",
    e: "Uma instituição vai migrar o seu portal de atendimento para a nuvem. Em que momento devem ser consideradas as necessidades de acessibilidade das pessoas utilizadoras?",
    opts: [
      "Apenas depois de o portal estar no ar, se houver reclamações",
      "Desde a definição dos requisitos, incluindo-os nos critérios de aceitação e nas condições de contratação",
      "Apenas na formação dos técnicos",
      "Apenas se existir orçamento disponível no fim do projecto",
    ], ind: 1,
    exp: "Considerar acessibilidade na definição de requisitos e nos critérios de aceitação evita refazer trabalho e evita excluir pessoas durante todo o período em que o serviço já está a funcionar. Deixar para depois transforma um requisito em correcção dispendiosa e tardia.",
    obj: "Integrar acessibilidade no ciclo de decisão do serviço. Lições do módulo transversal sobre acessibilidade e aquisição.",
  },
  {
    m: "transversal", t: "vf", d: "f",
    e: "Verdadeiro ou falso: disponibilizar a informação de um serviço público em mais do que um formato, por exemplo texto simples além do documento habitual, alarga o número de pessoas que consegue usá-la.",
    val: true,
    exp: "Verdadeiro. Formatos alternativos alcançam pessoas com deficiência visual, pessoas com ligação fraca, pessoas com aparelhos antigos e pessoas com menor literacia. É uma medida de alcance, não um extra decorativo.",
    obj: "Reconhecer o valor de formatos alternativos. Lições do módulo transversal sobre informação e comunicação.",
  },
  {
    m: "transversal", t: "cor", d: "me",
    e: "Associe cada barreira encontrada por pessoas utilizadoras à medida que a reduz.",
    pares: [
      { esquerda: "Documento digitalizado que o leitor de ecrã não lê", direita: "Publicar também em texto estruturado" },
      { esquerda: "Vídeo sem legendas para quem não ouve", direita: "Acrescentar legendas e transcrição em texto" },
      { esquerda: "Linguagem administrativa difícil de entender", direita: "Acrescentar síntese em leitura fácil" },
      { esquerda: "Ligação fraca no distrito impede carregar páginas pesadas", direita: "Disponibilizar versão leve, essencialmente em texto" },
    ],
    exp: "Cada barreira tem uma medida correspondente e verificável. A boa prática é identificar a barreira concreta e não responder com medidas genéricas que não a resolvem.",
    obj: "Escolher a medida adequada a cada barreira concreta. Lições do módulo transversal.",
  },
  {
    m: "transversal", t: "em", cen: true, d: "f",
    e: "CENÁRIO (dados fictícios). Um serviço passa a aceitar pedidos apenas por formulário em linha. Uma parte das pessoas utilizadoras não tem internet em casa nem telemóvel com dados. Que decisão mantém o serviço acessível a toda a gente?",
    opts: [
      "Manter apenas o formulário em linha e recomendar o uso de cibercafé",
      "Manter um canal presencial ou assistido, além do formulário em linha",
      "Adiar a digitalização do serviço por tempo indeterminado",
      "Aceitar pedidos por rede social como alternativa única",
    ], ind: 1,
    exp: "Digitalizar não pode significar excluir. Manter um canal presencial ou assistido preserva o acesso enquanto o canal digital cresce; empurrar as pessoas para cibercafés transfere-lhes o custo e o risco.",
    obj: "Decidir sobre canais sem excluir pessoas utilizadoras. Lições do módulo transversal.",
  },
  {
    m: "transversal", t: "em", cen: true, d: "me",
    e: "CENÁRIO (dados fictícios). Uma equipa vai contratar um sistema de gestão de filas de atendimento. Que exigência escrita no caderno de encargos torna a acessibilidade verificável no momento da entrega?",
    opts: [
      "Uma declaração genérica do fornecedor de que o sistema é moderno e inclusivo",
      "Critérios de aceitação concretos, como avisos sonoros e visuais em simultâneo e informação também em texto, verificados na recepção",
      "Um compromisso de melhorar a acessibilidade em versões futuras",
      "Uma cláusula que remete a acessibilidade para a formação dos operadores",
    ], ind: 1,
    exp: "O que torna a acessibilidade verificável são critérios concretos, verificáveis na entrega. Declarações genéricas, promessas futuras e remissão para formação não permitem aceitar ou recusar a entrega com fundamento.",
    obj: "Transformar acessibilidade em critério de aceitação verificável. Lições do módulo transversal sobre aquisição.",
  },
];

export const PRE_POS_V2: QuestaoNuvemV2[] = [
  {
    m: "m1", t: "em", d: "f",
    e: "DIAGNÓSTICO. Em poucas palavras, o que distingue a computação em nuvem de ter servidores próprios na instituição?",
    opts: [
      "Na nuvem usa-se capacidade de um fornecedor, a pedido e medida pelo consumo",
      "Na nuvem os dados deixam de pertencer à instituição",
      "Na nuvem não é preciso definir permissões de acesso",
      "Na nuvem não existe factura mensal",
    ], ind: 0,
    exp: "A diferença central é usar capacidade de terceiro, criada a pedido e medida pelo consumo, em vez de comprar e manter equipamento. Os dados continuam da instituição e as permissões continuam a ser definidas por ela.",
    obj: "Diagnóstico: noção inicial de nuvem.",
  },
  {
    m: "m1", t: "vf", d: "f",
    e: "DIAGNÓSTICO. Verdadeiro ou falso: em software como serviço a instituição continua responsável por decidir quem tem acesso aos dados.",
    val: true,
    exp: "Verdadeiro. Contas, permissões e conteúdo dos dados são sempre da instituição, seja qual for o modelo de serviço.",
    obj: "Diagnóstico: noção inicial de responsabilidade partilhada.",
  },
  {
    m: "m1", t: "em", d: "f",
    e: "DIAGNÓSTICO. Uma instituição mantém parte dos sistemas em casa e parte num fornecedor de nuvem, ligados entre si. Como se chama esse arranjo?",
    opts: ["Nuvem pública", "Nuvem híbrida", "Nuvem privada", "Centro de dados tradicional"], ind: 1,
    exp: "É nuvem híbrida: dois modelos distintos, ligados entre si.",
    obj: "Diagnóstico: modelos de implantação.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "DIAGNÓSTICO. Para que serve um grupo de regras de segurança de rede?",
    opts: [
      "Para guardar cópias de segurança",
      "Para permitir ou negar tráfego de entrada e de saída",
      "Para aumentar a memória da máquina",
      "Para cifrar os dados em repouso",
    ], ind: 1,
    exp: "Um grupo de regras de segurança de rede filtra o tráfego, permitindo ou negando conforme origem, destino, porta e protocolo.",
    obj: "Diagnóstico: noção inicial de filtragem de rede.",
  },
  {
    m: "m2", t: "vf", d: "f",
    e: "DIAGNÓSTICO. Verdadeiro ou falso: guardar documentos num contentor de armazenamento com acesso público de leitura é adequado para processos com dados pessoais.",
    val: false,
    exp: "Falso. Documentos com dados pessoais exigem contentor privado e acesso concedido apenas a quem precisa.",
    obj: "Diagnóstico: noção inicial de exposição de dados.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "DIAGNÓSTICO. O que mede o objectivo de tempo de recuperação?",
    opts: [
      "Quantos dados se aceita perder",
      "Quanto tempo o serviço pode ficar indisponível",
      "Quantas cópias são guardadas por semana",
      "Quanto custa a recuperação",
    ], ind: 1,
    exp: "O tempo de recuperação mede a paragem tolerada; a perda de dados tolerada é o ponto de recuperação.",
    obj: "Diagnóstico: noção inicial de continuidade.",
  },
  {
    m: "m3", t: "em", d: "f",
    e: "DIAGNÓSTICO. O que é o princípio do menor privilégio?",
    opts: [
      "Dar a cada pessoa ou sistema apenas as permissões necessárias à sua tarefa",
      "Dar a todos as mesmas permissões, para simplificar",
      "Reservar todas as permissões para uma só pessoa",
      "Conceder permissões amplas e retirá-las mais tarde",
    ], ind: 0,
    exp: "Menor privilégio é conceder exactamente o necessário, no âmbito necessário, e rever quando as funções mudam.",
    obj: "Diagnóstico: noção inicial de controlo de acesso.",
  },
  {
    m: "m3", t: "vf", d: "f",
    e: "DIAGNÓSTICO. Verdadeiro ou falso: um alerta de orçamento suspende automaticamente os serviços quando o valor é atingido.",
    val: false,
    exp: "Falso. O alerta avisa; a redução do consumo depende de uma decisão e de uma acção.",
    obj: "Diagnóstico: noção inicial de gestão de custos.",
  },
  {
    m: "m3", t: "em", d: "f",
    e: "DIAGNÓSTICO. Porque é importante registar os eventos de administração de um ambiente de nuvem?",
    opts: [
      "Para reduzir o custo do armazenamento",
      "Para poder saber depois quem fez cada alteração",
      "Para acelerar as máquinas virtuais",
      "Para dispensar as cópias de segurança",
    ], ind: 1,
    exp: "Os registos permitem reconstituir alterações e apoiar a resposta a incidentes.",
    obj: "Diagnóstico: noção inicial de registo e prestação de contas.",
  },
  {
    m: "transversal", t: "vf", d: "f",
    e: "DIAGNÓSTICO. Verdadeiro ou falso: publicar a informação de um serviço apenas como imagem digitalizada dificulta o acesso a quem usa leitor de ecrã.",
    val: true,
    exp: "Verdadeiro. A imagem não contém texto legível por programa; é necessária também uma versão em texto.",
    obj: "Diagnóstico: noção inicial de acessibilidade de conteúdo.",
  },
];
