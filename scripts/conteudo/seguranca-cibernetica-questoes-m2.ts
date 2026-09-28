/**
 * Banco privado — Segurança Cibernética Avançada — Módulo 2 «Protecção,
 * Detecção e Resposta» (ordem 142). 25 itens de exame final.
 * Matriz: cada uma das 5 lições = em 2, vf 1, cor 1, cen 1 (f 2, me 2, di 1).
 * Casos, instituições e números FICTÍCIOS. Rascunho por validar pela Ologa/ATDI.
 */
import { FONTE_KEV, FONTE_NIST, FONTE_WSTG, type QuestaoSC } from "./seguranca-cibernetica-questoes-tipos";

const L1: QuestaoSC[] = [
  {
    cod: "SC-M2L1-01", m: "m2", l: 1, t: "em", d: "f",
    e: "Numa aplicação web, onde tem de ser verificada a autorização de cada pedido para que a protecção seja efectiva?",
    opts: [
      "No servidor, em cada pedido, antes de devolver ou alterar o dado",
      "No navegador, escondendo os botões a que o utilizador não tem direito",
      "Na rede, filtrando os endereços que não pertencem à instituição",
      "Na base de dados, através de um índice sobre a coluna do utilizador",
    ], ind: 0,
    exp: "A verificação de autorização pertence ao servidor, pedido a pedido. Esconder elementos no navegador não impede que alguém chame directamente o endereço do recurso.",
    obj: "Classificar falhas de controlo de acesso e escrever casos de teste. M2 L1.",
    fonte: FONTE_WSTG,
  },
  {
    cod: "SC-M2L1-02", m: "m2", l: 1, t: "em", d: "me",
    e: "Uma ocorrência descreve que, mudando o número no endereço da página de detalhe, um utilizador vê o processo de outra pessoa. A que categoria de falha pertence e qual é a correcção adequada?",
    opts: [
      "Configuração por omissão; corrige-se removendo a página de detalhe do menu",
      "Exposição de dados; corrige-se cifrando o número do processo no endereço",
      "Controlo de acesso; corrige-se verificando no servidor se o processo pertence a quem pede",
      "Autenticação; corrige-se exigindo nova introdução da palavra-passe nessa página",
    ], ind: 2,
    exp: "É falha de controlo de acesso: falta a verificação de propriedade no servidor. Ocultar a ligação ou disfarçar o número não impede o acesso directo ao recurso.",
    obj: "Classificar ocorrências por categoria de falha aplicacional. M2 L1.",
    fonte: FONTE_WSTG,
  },
  {
    cod: "SC-M2L1-03", m: "m2", l: 1, t: "vf", d: "f",
    e: "Verdadeiro ou falso: tendo testado duas áreas de uma aplicação e encontrado duas falhas, o relatório pode afirmar que as restantes áreas estão seguras.",
    val: false,
    exp: "Falso. O relatório diz o que foi testado, como e o que ficou por testar. Ausência de teste não é prova de ausência de falha, e nenhum relatório declara uma aplicação segura.",
    obj: "Redigir achados sem afirmar que a aplicação é segura. M2 L1.",
  },
  {
    cod: "SC-M2L1-04", m: "m2", l: 1, t: "cor", d: "me",
    e: "Associe cada elemento de um caso de teste, no formato do guia de testes da OWASP, ao que descreve.",
    pares: [
      { esquerda: "Objectivo", direita: "O que o teste procura demonstrar" },
      { esquerda: "Pré-condição", direita: "Estado e contas necessários antes de começar" },
      { esquerda: "Resultado esperado", direita: "Comportamento correcto contra o qual se compara" },
      { esquerda: "Evidência a recolher", direita: "Registo observável que sustenta o achado" },
    ],
    exp: "Um caso de teste sem pré-condição não é repetível e sem evidência não sustenta o achado no relatório.",
    obj: "Escrever casos de teste no formato do guia da OWASP. M2 L1.",
    fonte: FONTE_WSTG,
  },
  {
    cod: "SC-M2L1-05", m: "m2", l: 1, t: "em", cen: true, d: "me",
    e: "Caso fictício. Num teste autorizado à aplicação de licenciamento de Namaacha, a conta de perfil «balcão» acede ao endereço de aprovação reservado ao perfil «chefia» e a operação é concluída com sucesso. A empresa responde que vai retirar o item «Aprovar» do menu do perfil «balcão». Como deve o achado ser registado?",
    opts: [
      "Como resolvido, porque o perfil «balcão» deixa de ter caminho para a operação",
      "Como falha de controlo de acesso ainda por corrigir, porque a verificação no servidor continua ausente",
      "Como risco aceite, porque o perfil «balcão» pertence à própria instituição",
      "Como falha de configuração do servidor de aplicação, a tratar pela equipa de infra-estrutura",
    ], ind: 1,
    exp: "Retirar o item do menu altera a interface, não a verificação. O endereço continua a poder ser chamado directamente. O achado mantém-se por corrigir até haver verificação no servidor e reteste.",
    obj: "Redigir achados com impacto, reprodução, evidência e recomendação. M2 L1.",
    fonte: FONTE_WSTG,
  },
];

const L2: QuestaoSC[] = [
  {
    cod: "SC-M2L2-01", m: "m2", l: 2, t: "em", d: "f",
    e: "Para que serve o inventário de componentes de uma aplicação, com versões, no dia em que se divulga uma falha grave numa biblioteca?",
    opts: [
      "Para saber, sem adivinhar, se a instituição usa o componente afectado e em que sistemas",
      "Para calcular o custo de licenciamento das bibliotecas usadas pela aplicação",
      "Para provar ao fornecedor que a aplicação foi desenvolvida segundo o que o contrato estabelece",
      "Para substituir a análise de dependências feita na cadeia de entrega",
    ], ind: 0,
    exp: "Sem inventário de componentes, no dia da divulgação ninguém sabe se é afectado. Serve para responder à pergunta «usamos isto e onde?».",
    obj: "Exigir inventário de componentes em contratos e na cadeia de entrega. M2 L2.",
  },
  {
    cod: "SC-M2L2-02", m: "m2", l: 2, t: "em", d: "di",
    e: "Uma análise automática de dependências não encontrou falhas graves. Que conclusão é legítima?",
    opts: [
      "Que a aplicação não tem falhas graves e pode entrar em produção sem outras verificações",
      "Que as dependências conhecidas não têm falhas graves registadas nas bases consultadas",
      "Que o código escrito pela equipa está livre de falhas de controlo de acesso",
      "Que a configuração do servidor está correcta e endurecida",
    ], ind: 1,
    exp: "Cada verificação tem pontos cegos. A análise de dependências só fala de componentes conhecidos e de falhas já registadas; não cobre o código próprio, a configuração nem a lógica de autorização.",
    obj: "Situar o que cada verificação automática detecta e não detecta. M2 L2.",
  },
  {
    cod: "SC-M2L2-03", m: "m2", l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: fazer com que qualquer aviso da cadeia de entrega interrompa a entrega é sempre a opção mais segura.",
    val: false,
    exp: "Falso. Bloquear tudo leva a que alguém desligue as verificações ou as contorne. A cadeia distingue o que bloqueia, por critério definido, do que apenas avisa e fica registado.",
    obj: "Definir critérios de bloqueio e de aviso com justificação. M2 L2.",
  },
  {
    cod: "SC-M2L2-04", m: "m2", l: 2, t: "cor", d: "me",
    e: "Associe cada verificação automática ao que ela procura.",
    pares: [
      { esquerda: "Análise estática do código", direita: "Padrões inseguros no código escrito pela equipa" },
      { esquerda: "Análise de dependências", direita: "Falhas conhecidas em componentes de terceiros" },
      { esquerda: "Procura de segredos", direita: "Chaves e palavras-passe escritas no repositório" },
      { esquerda: "Análise dinâmica da aplicação a correr", direita: "Comportamentos inseguros observáveis em execução" },
    ],
    exp: "As quatro verificações são complementares e nenhuma substitui as outras; cada uma tem um ponto cego que as restantes ajudam a cobrir.",
    obj: "Situar cada verificação no ponto certo da cadeia de entrega. M2 L2.",
  },
  {
    cod: "SC-M2L2-05", m: "m2", l: 2, t: "em", cen: true, d: "di",
    e: "Caso fictício. O relatório de dependências da aplicação de gestão documental de Milange indica uma falha grave, com exploração já observada, no motor de modelos que a aplicação usa. O projecto desse motor foi abandonado e não há versão corrigida. Qual é a decisão mais defensável?",
    opts: [
      "Aceitar o risco sem prazo definido, por não existir correcção disponível do lado do projecto",
      "Aguardar que a comunidade retome o projecto e publique uma versão corrigida",
      "Substituir o componente ou isolar a funcionalidade, com prazo, responsável e reteste",
      "Manter o componente e acrescentar um aviso na página inicial da aplicação",
    ], ind: 2,
    exp: "Sem correcção do fornecedor, resta substituir ou mitigar isolando a funcionalidade, sempre com prazo, dono e verificação posterior. Aceitação sem prazo transforma-se em permanente.",
    obj: "Decidir entre actualizar, substituir, mitigar ou aceitar com prazo. M2 L2.",
    fonte: FONTE_KEV,
  },
];

const L3: QuestaoSC[] = [
  {
    cod: "SC-M2L3-01", m: "m2", l: 3, t: "em", d: "f",
    e: "Com orçamento limitado, que fontes de registo convém recolher primeiro, segundo a lição?",
    opts: [
      "Os registos de impressão e de utilização de disco dos postos de trabalho",
      "Os registos de autenticação e de alterações de contas e permissões",
      "Os registos de temperatura e energia da sala técnica",
      "Os registos de navegação na internet de cada funcionário",
    ], ind: 1,
    exp: "Quase todas as intrusões passam por autenticação e por alteração de contas ou permissões. São as fontes que permitem detectar mais com menos.",
    obj: "Escolher fontes de registo por capacidade de detecção. M2 L3.",
  },
  {
    cod: "SC-M2L3-02", m: "m2", l: 3, t: "em", d: "me",
    e: "Que elementos tem de conter uma regra de detecção para ser aplicável e afinável?",
    opts: [
      "Nome, autor, data de criação e nível de gravidade atribuído",
      "Fonte de registo, formato do ficheiro, codificação e período de retenção",
      "Condição, limiar, janela temporal e acção esperada",
      "Descrição do incidente, responsável pela resposta e prazo de resolução",
    ], ind: 2,
    exp: "A regra precisa de saber o que procurar, a partir de que quantidade, em que intervalo e o que fazer quando dispara. Sem limiar e janela não se afina nem se estima o ruído.",
    obj: "Escrever regras de detecção com condição, limiar, janela e acção. M2 L3.",
  },
  {
    cod: "SC-M2L3-03", m: "m2", l: 3, t: "vf", d: "f",
    e: "Verdadeiro ou falso: uma autenticação bem sucedida, com a palavra-passe correcta, nunca deve ser tratada como sinal de intrusão.",
    val: false,
    exp: "Falso. Credenciais roubadas produzem autenticações válidas. O que levanta suspeita é o contexto: hora, origem, equipamento e o que é feito depois de entrar.",
    obj: "Reconstituir uma sequência e identificar quando o acesso deixa de ser normal. M2 L3.",
  },
  {
    cod: "SC-M2L3-04", m: "m2", l: 3, t: "cor", d: "me",
    e: "Associe cada condição necessária à detecção ao efeito da sua ausência.",
    pares: [
      { esquerda: "Registos gerados nas fontes", direita: "Sem eles não há nada que analisar" },
      { esquerda: "Recolha centralizada", direita: "Sem ela cada registo fica isolado e não se correlaciona" },
      { esquerda: "Horas sincronizadas", direita: "Sem elas a cronologia entre máquinas fica errada" },
      { esquerda: "Alguém que analise os alertas", direita: "Sem isso os alertas acumulam-se sem resposta" },
    ],
    exp: "A detecção falha por qualquer uma destas quatro faltas, mesmo quando as restantes estão asseguradas.",
    obj: "Identificar as condições necessárias à detecção. M2 L3.",
    fonte: FONTE_NIST,
  },
  {
    cod: "SC-M2L3-05", m: "m2", l: 3, t: "em", cen: true, d: "me",
    e: "Caso fictício. Numa semana de actividade considerada normal, uma regra nova de correlação gerou 180 alertas no serviço de Nampula. A equipa de segurança tem 2 pessoas, que conseguem analisar cerca de 10 alertas por dia útil. Qual é a decisão correcta?",
    opts: [
      "Manter a regra e acumular os alertas para revisão mensal, quando houver tempo",
      "Desligar definitivamente a regra, por gerar mais alertas do que a equipa consegue tratar",
      "Afinar a regra, ajustando limiar, janela e exclusões justificadas, e voltar a medir",
      "Encaminhar todos os alertas por correio à direcção, para decisão caso a caso",
    ], ind: 2,
    exp: "180 alertas por semana contra cerca de 50 analisáveis é ruído insustentável. A regra afina-se e volta a medir-se; desligá-la perde a detecção e acumulá-los equivale a não a ter.",
    obj: "Estimar o efeito de uma regra em falsos positivos e afiná-la. M2 L3.",
  },
];

const L4: QuestaoSC[] = [
  {
    cod: "SC-M2L4-01", m: "m2", l: 4, t: "em", d: "f",
    e: "Na recolha de evidência num sistema suspeito, qual é a ordem correcta?",
    opts: [
      "Primeiro o que desaparece — memória, ligações, processos, sessões — e depois o disco",
      "Primeiro o disco completo e só depois, se sobrar tempo, a memória do sistema",
      "Primeiro desligar a máquina da corrente e depois recolher tudo com calma",
      "Primeiro os ficheiros do utilizador e depois os registos do sistema operativo",
    ], ind: 0,
    exp: "Recolhe-se por ordem de volatilidade: o que se perde ao desligar vem primeiro. Desligar a máquina destrói a memória e as sessões em curso.",
    obj: "Executar a recolha ordenada de evidência volátil e não volátil. M2 L4.",
  },
  {
    cod: "SC-M2L4-02", m: "m2", l: 4, t: "em", d: "di",
    e: "Porque é que um endereço de rede associado a um ataque é um indicador menos durável do que o resumo criptográfico de um ficheiro encontrado?",
    opts: [
      "Porque o endereço é mais difícil de registar e de pesquisar nos sistemas de detecção da instituição",
      "Porque quem ataca muda de endereço com facilidade, enquanto o resumo muda só se o ficheiro mudar",
      "Porque o resumo identifica a pessoa responsável pelo ataque de forma inequívoca",
      "Porque os endereços não podem ser guardados por motivos de protecção de dados",
    ], ind: 1,
    exp: "Endereços são descartáveis e trocam-se em minutos. O resumo é determinado pelo conteúdo do ficheiro: só muda se o ficheiro for alterado. Nenhum dos dois identifica uma pessoa.",
    obj: "Classificar indicadores de compromisso por durabilidade. M2 L4.",
  },
  {
    cod: "SC-M2L4-03", m: "m2", l: 4, t: "vf", d: "f",
    e: "Verdadeiro ou falso: nesta formação analisa-se software malicioso real, executado em máquina virtual isolada.",
    val: false,
    exp: "Falso. Não se descarrega, não se distribui e não se executa software malicioso real. Trabalha-se com indicadores, registos e ficheiros inertes fornecidos no material.",
    obj: "Conhecer os limites de segurança da análise nesta formação. M2 L4.",
  },
  {
    cod: "SC-M2L4-04", m: "m2", l: 4, t: "cor", d: "me",
    e: "Associe cada família de software malicioso ao traço que a distingue.",
    pares: [
      { esquerda: "Software de resgate", direita: "Cifra ficheiros e exige pagamento, exfiltrando dados antes" },
      { esquerda: "Verme", direita: "Propaga-se sozinho pela rede, sem acção de alguém" },
      { esquerda: "Cavalo de Tróia", direita: "Depende de alguém o executar, disfarçado de programa útil" },
      { esquerda: "Minerador", direita: "Consome recursos da máquina para produzir criptomoeda" },
    ],
    exp: "A distinção faz-se pelo efeito produzido e pelo modo de propagação, e não pelo nome comercial atribuído por cada fabricante.",
    obj: "Distinguir famílias de software malicioso pelo efeito e propagação. M2 L4.",
  },
  {
    cod: "SC-M2L4-05", m: "m2", l: 4, t: "em", cen: true, d: "me",
    e: "Caso fictício. Ao detectar actividade estranha no servidor de base de dados de Mueda, a equipa desliga-o imediatamente da corrente «para parar o ataque». Que consequência principal tem esta decisão para a análise posterior?",
    opts: [
      "Nenhuma, desde que o disco seja copiado logo a seguir com uma ferramenta adequada",
      "Perde-se a evidência volátil: memória, processos, ligações e sessões em curso",
      "Perdem-se os registos de sistema, que são apagados no encerramento forçado",
      "Perde-se a possibilidade de calcular resumos criptográficos dos ficheiros do disco",
    ], ind: 1,
    exp: "Desligar preserva o disco mas destrói a memória e o estado em curso, onde estão frequentemente as chaves, os processos e as ligações do atacante. Isolar da rede trava sem destruir essa evidência.",
    obj: "Justificar a ordem de recolha perante decisões de contenção. M2 L4.",
  },
];

const L5: QuestaoSC[] = [
  {
    cod: "SC-M2L5-01", m: "m2", l: 5, t: "em", d: "f",
    e: "Qual é a diferença entre conter e erradicar, na resposta a um incidente?",
    opts: [
      "Conter é travar a propagação já; erradicar é remover a presença do atacante e fechar a entrada",
      "Conter é avisar a direcção por escrito; erradicar é comunicar publicamente o incidente aos cidadãos afectados",
      "Conter é restaurar cópias; erradicar é apagar os registos afectados pelo incidente",
      "Conter é escrever o relatório; erradicar é aplicar as recomendações desse relatório",
    ], ind: 0,
    exp: "Conter limita o dano imediato. Erradicar remove contas, tarefas e chaves do atacante e fecha a via de entrada. Só depois se recupera.",
    obj: "Sequenciar contenção, erradicação e recuperação. M2 L5.",
    fonte: FONTE_NIST,
  },
  {
    cod: "SC-M2L5-02", m: "m2", l: 5, t: "em", d: "me",
    e: "Que condição tem de estar cumprida antes de repor um sistema em serviço depois de um incidente com credenciais comprometidas?",
    opts: [
      "Que o sistema tenha sido reiniciado pelo menos uma vez sem quaisquer erros no arranque",
      "Que a direcção tenha aprovado por escrito o texto do comunicado público",
      "Que as credenciais tenham sido substituídas e a via de entrada esteja fechada",
      "Que o relatório final do incidente esteja concluído e entregue à tutela",
    ], ind: 2,
    exp: "Repor com as credenciais antigas ou com a entrada aberta devolve o acesso ao atacante. O relatório e a comunicação são importantes, mas não são o critério técnico de regresso ao serviço.",
    obj: "Definir o critério de regresso ao serviço. M2 L5.",
  },
  {
    cod: "SC-M2L5-03", m: "m2", l: 5, t: "vf", d: "f",
    e: "Verdadeiro ou falso: o registo cronológico de decisões deve ser escrito durante o incidente, com hora, decisão, fundamento e responsável.",
    val: true,
    exp: "Verdadeiro. Reconstituir de memória no fim produz lacunas e erros. O registo escrito durante o incidente sustenta a análise posterior e a prestação de contas.",
    obj: "Escrever o registo cronológico de decisões do incidente. M2 L5.",
  },
  {
    cod: "SC-M2L5-04", m: "m2", l: 5, t: "cor", d: "di",
    e: "Associe cada momento do ciclo de resposta a incidentes à acção que lhe corresponde.",
    pares: [
      { esquerda: "Preparar", direita: "Ter plano, contactos e cópias antes de haver incidente" },
      { esquerda: "Conter", direita: "Travar a propagação sem destruir evidência" },
      { esquerda: "Erradicar", direita: "Remover acessos do atacante e fechar a via de entrada" },
      { esquerda: "Aprender", direita: "Rever o sucedido e corrigir plano e detecções" },
    ],
    exp: "Dos seis momentos, preparar é o único que se faz antes do incidente; aprender é o que impede a repetição.",
    obj: "Sequenciar os momentos da resposta a incidentes. M2 L5.",
    fonte: FONTE_NIST,
  },
  {
    cod: "SC-M2L5-05", m: "m2", l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício. Depois de um incidente no serviço de registo civil de Vilankulo, há duas cópias da base de dados: uma de 12 de Setembro, mais recente, nunca restaurada nem verificada, e uma de 29 de Agosto, restaurada e verificada num ensaio. Sabe-se que o acesso indevido começou a 10 de Setembro. Qual é a escolha correcta e porquê?",
    opts: [
      "A de 12 de Setembro, por ser a mais recente e perder menos informação",
      "A de 29 de Agosto, por ser anterior ao acesso indevido e ter sido verificada",
      "Qualquer uma, desde que a base seja analisada por antivírus antes de entrar em serviço",
      "Nenhuma: deve recriar-se a base de raiz a partir dos processos em papel",
    ], ind: 1,
    exp: "A cópia de 12 de Setembro é posterior ao início do acesso indevido e pode conter alterações do atacante; além disso nunca foi verificada. A de 29 de Agosto é anterior e provada, ao custo da informação do período intermédio, que tem de ser reconstituída.",
    obj: "Decidir a recuperação ponderando perda de dados e integridade. M2 L5.",
  },
];

export const EXAME_SC_M2: QuestaoSC[] = [...L1, ...L2, ...L3, ...L4, ...L5];
