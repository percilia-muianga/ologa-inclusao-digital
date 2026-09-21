/**
 * Conteúdo original das cinco lições do módulo 3 do curso
 * «Computação em Nuvem» — «Governação, Segurança e Custos».
 *
 * Estado: PROPOSTA PEDAGÓGICA — por validar pela Ologa/ATDI.
 * Casos, dados e preços são FICTÍCIOS e servem apenas de exercício.
 * Nenhuma lição deste módulo cria recursos na nuvem: os exercícios são de
 * análise e de simulação documental, feitos em papel ou em folha de cálculo.
 *
 * Este ficheiro vive fora de src/ para não entrar no pacote do navegador; é
 * lido apenas pelo seed (scripts/seed-computacao-nuvem.ts).
 */

import type { ConteudoLicao } from "./computacao-nuvem-licoes";

const CONSULTADO = "21 de Setembro de 2026";

const AVISO_SEM_LABORATORIO =
  "Exercício de análise e simulação documental, feito em papel ou em folha de cálculo. " +
  "Nesta lição não se criam nem se alteram recursos na nuvem e não se declara nenhum " +
  "laboratório como executado.";

const REGRA_EQUIPAMENTO =
  "Recomenda-se um computador por pessoa. Quando não for possível, no máximo duas " +
  "pessoas por computador, alternando quem escreve a cada parte do exercício, de modo " +
  "que ambas trabalhem no teclado.";

/* ------------------------------------------------------------------ */
/* Tabela de preços FICTÍCIOS e cálculo verificado da lição 4 (custos) */
/* ------------------------------------------------------------------ */

export const PRECOS_FICTICIOS = {
  vmHora: 0.1, // USD por hora com a máquina ligada (2 vCPU, 8 GB)
  discoGbMes: 0.12, // USD por GB por mês, cobrado mesmo com a máquina parada
  objectosGbMes: 0.025, // USD por GB por mês
  saidaGb: 0.09, // USD por GB de saída para a internet
  saidaGratisGb: 10, // GB de saída sem custo por mês
  entradaGb: 0, // entrada de dados sem custo
  backupGbMes: 0.05, // USD por GB por mês
  logsGbIngerido: 0.5, // USD por GB de registos recebidos
  suportePct: 0.1, // 10 % do consumo do mês
  suporteMinimoUsd: 25, // valor mínimo mensal do plano de suporte
  cambioMznPorUsd: 64, // pressuposto fictício de câmbio
} as const;

export const CENARIO_CUSTOS = {
  diasDoMes: 30,
  vmPortal: { horas: 720, descricao: "portal ligado 24 horas por dia, 30 dias" },
  vmRelatorios: { horas: 220, descricao: "máquina de relatórios ligada 10 horas por dia, 22 dias úteis" },
  discosPortalGb: 128,
  discosRelatoriosGb: 64,
  discosGb: 192, // 128 GB do portal + 64 GB da máquina de relatórios
  objectosGb: 400,
  saidaGb: 150,
  backupGb: 200,
  logsGb: 30,
} as const;

export type LinhaCusto = { rubrica: string; operandos: string; subtotalUsd: number };

export function calcularCustoMensal() {
  const p = PRECOS_FICTICIOS;
  const c = CENARIO_CUSTOS;
  const horasVm = c.vmPortal.horas + c.vmRelatorios.horas;
  const saidaFacturavel = Math.max(0, c.saidaGb - p.saidaGratisGb);

  const linhas: LinhaCusto[] = [
    {
      rubrica: "Computação (máquinas virtuais ligadas)",
      operandos: `(${c.vmPortal.horas} h + ${c.vmRelatorios.horas} h) × ${p.vmHora} USD/h = ${horasVm} h × ${p.vmHora}`,
      subtotalUsd: horasVm * p.vmHora,
    },
    {
      rubrica: "Discos ligados às máquinas",
      operandos: `${c.discosGb} GB × ${p.discoGbMes} USD/GB/mês`,
      subtotalUsd: c.discosGb * p.discoGbMes,
    },
    {
      rubrica: "Armazenamento de objectos",
      operandos: `${c.objectosGb} GB × ${p.objectosGbMes} USD/GB/mês`,
      subtotalUsd: c.objectosGb * p.objectosGbMes,
    },
    {
      rubrica: "Saída de dados para a internet",
      operandos: `(${c.saidaGb} GB − ${p.saidaGratisGb} GB sem custo) × ${p.saidaGb} USD/GB = ${saidaFacturavel} GB × ${p.saidaGb}`,
      subtotalUsd: saidaFacturavel * p.saidaGb,
    },
    {
      rubrica: "Cópias de segurança",
      operandos: `${c.backupGb} GB × ${p.backupGbMes} USD/GB/mês`,
      subtotalUsd: c.backupGb * p.backupGbMes,
    },
    {
      rubrica: "Registos (logs) recebidos",
      operandos: `${c.logsGb} GB × ${p.logsGbIngerido} USD/GB`,
      subtotalUsd: c.logsGb * p.logsGbIngerido,
    },
  ];

  const consumo = Math.round(linhas.reduce((s, l) => s + l.subtotalUsd, 0) * 100) / 100;
  const suporteCalculado = Math.round(consumo * p.suportePct * 100) / 100;
  const suporte = Math.max(suporteCalculado, p.suporteMinimoUsd);
  const totalUsd = Math.round((consumo + suporte) * 100) / 100;
  const totalMzn = Math.round(totalUsd * p.cambioMznPorUsd * 100) / 100;

  return { linhas, consumo, suporteCalculado, suporte, totalUsd, totalMzn };
}

const n = (v: number) =>
  v.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CUSTO = calcularCustoMensal();

const TABELA_PRECOS_TEXTO = [
  `Máquina virtual padrão (2 vCPU, 8 GB de memória): ${PRECOS_FICTICIOS.vmHora} USD por hora ligada.`,
  `Disco ligado à máquina: ${PRECOS_FICTICIOS.discoGbMes} USD por GB por mês, cobrado mesmo com a máquina parada.`,
  `Armazenamento de objectos: ${PRECOS_FICTICIOS.objectosGbMes} USD por GB por mês.`,
  `Saída de dados para a internet: ${PRECOS_FICTICIOS.saidaGb} USD por GB, com os primeiros ${PRECOS_FICTICIOS.saidaGratisGb} GB do mês sem custo.`,
  `Entrada de dados: ${PRECOS_FICTICIOS.entradaGb} USD por GB.`,
  `Cópias de segurança: ${PRECOS_FICTICIOS.backupGbMes} USD por GB por mês.`,
  `Registos (logs) recebidos pelo serviço de monitoria: ${PRECOS_FICTICIOS.logsGbIngerido} USD por GB.`,
  `Plano de suporte: ${PRECOS_FICTICIOS.suportePct * 100} % do consumo do mês, com mínimo de ${PRECOS_FICTICIOS.suporteMinimoUsd} USD.`,
  `Câmbio de referência assumido para o exercício: ${PRECOS_FICTICIOS.cambioMznPorUsd} MZN por 1 USD.`,
  "Todos estes preços são FICTÍCIOS, arredondados e construídos para o exercício. Não são preços de nenhum fornecedor e não servem para orçamentar nada.",
];

const SOLUCAO_TEXTO = [
  ...CUSTO.linhas.map((l) => `${l.rubrica}: ${l.operandos} = ${n(l.subtotalUsd)} USD.`),
  `Consumo do mês (soma das rubricas) = ${n(CUSTO.consumo)} USD.`,
  `Suporte = ${PRECOS_FICTICIOS.suportePct * 100} % de ${n(CUSTO.consumo)} = ${n(CUSTO.suporteCalculado)} USD; como é inferior ao mínimo de ${PRECOS_FICTICIOS.suporteMinimoUsd} USD, cobra-se o mínimo: ${n(CUSTO.suporte)} USD.`,
  `Total do mês = ${n(CUSTO.consumo)} + ${n(CUSTO.suporte)} = ${n(CUSTO.totalUsd)} USD.`,
  `Convertido ao câmbio assumido: ${n(CUSTO.totalUsd)} × ${PRECOS_FICTICIOS.cambioMznPorUsd} = ${n(CUSTO.totalMzn)} MZN.`,
];

/* ------------------------------------------------------------------ */

export const LICOES_M3: Record<string, ConteudoLicao> = {
  m3l1: {
    objectivos: [
      "Distinguir autenticação de autorização e explicar, com exemplo próprio, o que cada uma resolve.",
      "Aplicar o princípio do menor privilégio escolhendo função e âmbito adequados para os seis intervenientes — pessoas e sistemas — de um serviço público.",
      "Elaborar uma matriz de permissões completa que inclua contas humanas, identidades de aplicação, separação de tarefas, autenticação multifactor e prazos de revisão e revogação.",
    ],
    explicacao: [
      "Autenticação e autorização são duas perguntas diferentes e são respondidas por mecanismos diferentes. A autenticação responde a «quem é esta pessoa ou este sistema?» e apoia-se em algo que se sabe (uma palavra-passe), algo que se tem (um telemóvel, uma chave física) ou algo que se é (uma característica biométrica). A autorização responde a «o que é que esta identidade, já reconhecida, pode fazer, e sobre que recursos?». Um erro frequente na administração pública é resolver bem a primeira e descuidar a segunda: toda a gente entra com a sua conta pessoal, mas toda a gente é administradora de tudo. Nesse desenho, uma única conta comprometida — ou um único engano de boa-fé — chega para apagar o que existe.",
      "A autorização nas plataformas de nuvem organiza-se, em regra, em três peças: uma identidade (a pessoa, o grupo ou a identidade de uma aplicação), um conjunto de acções permitidas (a função, também chamada papel) e o conjunto de recursos onde essa função se aplica (o âmbito). O âmbito é hierárquico: atribuir uma função no nível mais alto da hierarquia faz com que ela desça a tudo o que está por baixo. A recomendação da documentação do Azure sobre boas práticas de controlo de acesso baseado em funções é precisamente esta: atribuir a função mais limitada que resolve a necessidade, no âmbito mais estreito que resolve a necessidade, e preferir funções específicas em vez da função de proprietário. Quem precisa de ler as facturas de um projecto não precisa de poder apagar máquinas desse projecto; quem precisa de reiniciar uma máquina não precisa de poder alterar as regras de rede.",
      "O princípio do menor privilégio ganha força quando é acompanhado de separação de tarefas. Separação de tarefas quer dizer que actos com consequências grandes não dependem de uma só pessoa: quem pede a criação de um recurso não é quem aprova a despesa; quem administra as identidades não é, ao mesmo tempo, quem audita os registos de acesso; quem desenvolve não é quem autoriza a colocação em produção. Nas instituições pequenas, com poucas pessoas técnicas, a separação completa nem sempre é possível. Nesse caso escreve-se o que é possível — por exemplo, exigir uma segunda aprovação por escrito do responsável do serviço — e regista-se a limitação em vez de a esconder.",
      "Convém não confundir duas expressões que costumam ser usadas como sinónimos. «Autenticação em dois passos» quer dizer apenas que são pedidas duas provas seguidas; «autenticação multifactor» exige que essas provas pertençam a categorias diferentes — algo que se sabe, algo que se tem, algo que se é. Pedir uma palavra-passe e, a seguir, uma pergunta de segurança são dois passos, mas continuam a ser duas coisas que a pessoa sabe: não é multifactor e cai com o mesmo tipo de compromisso. O que deve ser exigido em todas as contas com permissões administrativas, e é boa prática exigir em todas as contas humanas, é multifactor. O segundo factor mais acessível costuma ser uma aplicação geradora de códigos no telemóvel, que funciona sem ligação à internet e por isso serve bem onde a rede é fraca; chaves físicas são outra opção da mesma categoria. Os códigos de recuperação impressos NÃO são um segundo factor equivalente nem um método de uso corrente: são um mecanismo de recuperação excepcional, para quando o factor habitual se perde, e têm de ser guardados em condições de segurança definidas na política da instituição, com registo de quem lhes acede e substituição depois de usados. É preciso ter em conta a acessibilidade: pessoas com baixa visão ou com dificuldade motora podem precisar de mais tempo para introduzir códigos, de códigos com contraste adequado ou de um método alternativo previamente combinado. Um segundo factor que exclui parte dos trabalhadores não é segurança, é barreira.",
      "Contas humanas e identidades de aplicação não se governam da mesma maneira. Uma pessoa tem nome, vínculo, chefia e data de saída; uma aplicação, um serviço agendado ou um script de cópias de segurança tem uma identidade própria que não deve ser a conta pessoal de ninguém. Quando um programa corre com a conta de uma pessoa, acontecem dois problemas: o registo de auditoria deixa de dizer quem fez o quê, e o dia em que essa pessoa sai da instituição o serviço pára. As plataformas oferecem identidades próprias para aplicações, algumas geridas pela própria plataforma sem segredo para guardar. Sempre que existir essa possibilidade, é preferível a uma chave escrita num ficheiro de configuração.",
      "Por fim, permissões são coisa viva: precisam de revisão e de revogação. Revisão é olhar periodicamente para quem tem o quê e confirmar que ainda faz sentido — trimestral para permissões administrativas é uma periodicidade razoável de propor. Revogação é retirar o acesso quando termina o motivo: fim de contrato, mudança de funções, fim de um projecto, fim de um estágio. O momento mais esquecido é a mudança interna de funções, em que a pessoa acumula as permissões novas sobre as antigas; ao fim de alguns anos acumulou acesso a quase tudo. A regra prática é acrescentar sempre com prazo e retirar o que deixou de ser necessário no mesmo acto administrativo que muda as funções.",
    ],
    exemplo: {
      titulo: "A Direcção Distrital de Serviços de Ondela e o portal de licenciamento (cenário fictício)",
      corpo: [
        "A Direcção Distrital de Serviços de Ondela tem um portal de licenciamento a correr na nuvem. Trabalham nele seis intervenientes: a directora, que precisa de ver o consumo e aprovar despesa; um técnico de sistemas, que cria e reinicia máquinas; uma técnica de base de dados, que só trabalha sobre a base de dados do portal; um fornecedor externo contratado por três meses para migrar dados; um serviço automático de cópias de segurança que corre todas as noites; e uma estagiária que produz relatórios de atendimento a partir de dados já anonimizados.",
        "Hoje todos entram com a mesma conta partilhada «admin.ondela», cuja palavra-passe está escrita num papel dentro da gaveta da secretária. Quando algo corre mal, ninguém consegue dizer quem fez a alteração. Quando o fornecedor terminar o contrato, não há nada para revogar — a palavra-passe continuará a servir.",
        "O caso é fictício e serve de exercício. Não descreve nenhuma instituição existente.",
      ],
    },
    actividade: {
      formato: "em pares",
      enunciado: [
        AVISO_SEM_LABORATORIO,
        REGRA_EQUIPAMENTO,
        "A partir do caso de Ondela, construam uma matriz de permissões completa com uma linha por interveniente: directora, técnico de sistemas, técnica de base de dados, fornecedor externo, serviço automático de cópias de segurança e estagiária.",
        "Cada linha deve ter, obrigatoriamente, sete colunas preenchidas: (1) tipo de identidade — conta humana nominal ou identidade de aplicação; (2) o que precisa mesmo de fazer, em linguagem de tarefa e não de tecnologia; (3) função atribuída, com nome que descreva a acção permitida, por exemplo «leitor de custos» ou «operador de máquinas virtuais»; (4) âmbito — toda a subscrição, apenas o grupo de recursos do portal, ou apenas um recurso concreto; (5) autenticação multifactor exigida sim ou não, com justificação e indicação da categoria do segundo factor; (6) prazo de validade do acesso e data de revisão; (7) evento que obriga a revogar imediatamente.",
        "Acrescentem duas linhas finais: uma que identifique um par de tarefas que não deve ficar na mesma pessoa, explicando porquê, e outra que declare o que não é possível separar nesta direcção por falta de pessoal, com a medida compensatória proposta.",
        "Nenhuma linha pode ficar com «administrador de tudo» sem uma justificação escrita. Se faltar informação para decidir, escrevam «por apurar» e indiquem a quem seria preciso perguntar.",
        "Rubrica de apreciação, sobre 10 pontos: 3 pontos pela matriz completa, com os seis intervenientes e as sete colunas preenchidas; 3 pontos pelo ajuste entre a tarefa e a função e o âmbito escolhidos, sem permissões a mais; 2 pontos pelo tratamento correcto do serviço automático como identidade de aplicação e não como conta de pessoa; 1 ponto pela separação de tarefas identificada e justificada; 1 ponto pelos prazos de revisão e pelos eventos de revogação. Perde 1 ponto qualquer matriz que invente informação em vez de escrever «por apurar».",
      ],
      produto:
        "uma matriz de permissões com seis intervenientes e sete colunas preenchidas, mais duas linhas sobre separação de tarefas e sobre a limitação assumida, pronta a ser discutida com a chefia.",
    },
    sintese: [
      "Autenticação é saber quem é. Autorização é saber o que pode fazer.",
      "Menor privilégio: a função mais limitada, no âmbito mais estreito, durante o tempo necessário.",
      "Dois passos não é o mesmo que multifactor: as duas provas têm de ser de categorias diferentes.",
      "Códigos de recuperação servem para casos excepcionais, guardados com segurança; não são o segundo factor do dia-a-dia.",
      "O âmbito desce na hierarquia: o que é dado no nível de cima vale para tudo o que está por baixo.",
      "Contas partilhadas apagam a responsabilidade: cada pessoa tem a sua conta, com o seu nome.",
      "Programas e serviços automáticos usam identidades de aplicação, nunca a conta de uma pessoa.",
      "Autenticação multifactor para todas as contas administrativas: duas provas de categorias diferentes, com alternativa acessível combinada.",
      "Tarefas com grande consequência não ficam todas na mesma pessoa; quando não for possível separar, escreve-se a limitação.",
      "Permissões revêem-se com data marcada e revogam-se quando termina o motivo.",
    ],
    verificacao: [
      {
        pergunta:
          "Uma pessoa precisa de ver quanto custou o portal no mês passado. Que função e que âmbito lhe atribui?",
        resposta:
          "Uma função apenas de leitura de custos, no âmbito do grupo de recursos ou do projecto do portal — nunca uma função de administração, nem no âmbito de toda a subscrição.",
        feedback:
          "Ver despesa não exige poder alterar recursos. Escolher o âmbito mais estreito limita o dano de um engano ou de uma conta comprometida.",
      },
      {
        pergunta:
          "Porque é que o serviço nocturno de cópias de segurança não deve correr com a conta do técnico de sistemas?",
        resposta:
          "Porque a auditoria deixa de distinguir quem agiu, o serviço herda todas as permissões da pessoa e pára no dia em que essa conta for desactivada.",
        feedback:
          "Identidades de aplicação existem para isto: permissões próprias, mínimas, e ciclo de vida separado do das pessoas.",
      },
    ],
    referencias: [
      {
        titulo: "Microsoft Learn — Best practices for Azure RBAC",
        url: "https://learn.microsoft.com/en-us/azure/role-based-access-control/best-practices",
        consultadoEm: CONSULTADO,
      },
      {
        titulo: "NIST SP 800-145, The NIST Definition of Cloud Computing",
        url: "https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-145.pdf",
        consultadoEm: CONSULTADO,
      },
    ],
    guiao: {
      preparacao: [
        "Imprimir a matriz de permissões em branco, uma por par, com as sete colunas já tituladas; o exercício pode ser feito inteiramente em papel.",
        "Escrever no quadro a tríade identidade + função + âmbito e mantê-la visível durante toda a lição.",
        "Preparar um exemplo de função demasiado ampla e outro de função ajustada, para mostrar a diferença em concreto.",
        "Confirmar que ninguém precisa de entrar em nenhuma plataforma: nesta lição não se criam nem se alteram recursos na nuvem.",
        "Combinar previamente, com quem precisar, a alternativa acessível ao segundo factor de autenticação, para que o tema seja tratado sem expor ninguém.",
      ],
      conducao: [
        "Acolhimento, objectivos e pergunta inicial: quem, na sala, já usou uma conta partilhada de administração e o que correu bem ou mal.",
        "Exposição: autenticação e autorização; identidade, função e âmbito; hierarquia do âmbito; menor privilégio; separação de tarefas; multifactor, distinguindo-o de dois passos, com alternativa acessível; contas humanas e identidades de aplicação; revisão e revogação.",
        "Actividade em pares sobre o caso de Ondela, alternando quem escreve a cada três linhas da matriz; circular para travar o reflexo de dar função de administrador a todos.",
        "Partilha por amostra: dois pares apresentam 3 minutos cada, com 2 minutos de comentário e síntese. As matrizes dos restantes pares ficam afixadas e recebem apreciação escrita do formador.",
      ],
      criterios: [
        "Os seis intervenientes têm linha própria e as sete colunas estão preenchidas.",
        "As funções propostas correspondem às tarefas e nenhum acesso amplo fica sem justificação escrita.",
        "O serviço nocturno é tratado como identidade de aplicação.",
        "O acesso do fornecedor externo tem prazo e evento de revogação.",
        "A limitação de pessoal, quando existe, está escrita com medida compensatória em vez de ser escondida.",
      ],
      errosComuns: [
        "Dar função de proprietário «para não complicar» e só depois pensar em restringir.",
        "Atribuir permissões no âmbito mais alto sem reparar que descem a tudo o que está por baixo.",
        "Confundir autenticar com autorizar: achar que exigir multifactor resolve o excesso de permissões.",
        "Deixar o acesso do fornecedor sem data de fim.",
        "Esquecer a revisão na mudança interna de funções, acumulando permissões antigas com novas.",
      ],
    },
  },

  m3l2: {
    objectivos: [
      "Classificar um conjunto de dados de um serviço público em três níveis de sensibilidade e justificar cada classificação.",
      "Distinguir criptografia em trânsito de criptografia em repouso e indicar o que cada uma protege e o que não protege.",
      "Elaborar um plano de protecção de dados, sem usar dados reais, que cubra minimização, retenção, gestão de chaves e segredos, controlo de acessos e cópias de segurança.",
    ],
    explicacao: [
      "Proteger dados na nuvem começa antes de qualquer configuração técnica: começa por saber que dados existem e quanto valem. Classificar é atribuir a cada conjunto de dados um nível de sensibilidade — por exemplo público, interno e confidencial — e derivar desse nível as regras de tratamento. Dados públicos são os que podem ser divulgados sem dano: um horário de atendimento, uma lista de documentos exigidos. Dados internos circulam dentro da instituição e o seu conhecimento por terceiros causa incómodo ou vantagem indevida. Dados confidenciais são os que, divulgados, causam dano a pessoas concretas: dados de saúde, dados de identificação, situação familiar, dados sobre deficiência. Sem esta classificação, a instituição trata tudo com o mesmo cuidado — o que na prática significa tratar tudo com o cuidado do dado menos sensível.",
      "A seguir vem a minimização, que é a medida mais barata e a mais esquecida: recolher apenas o que é necessário para a finalidade, e guardar apenas enquanto for necessário. Cada campo a mais num formulário é um risco a mais, um custo a mais de armazenamento e uma obrigação a mais de protecção. Uma pergunta útil para cada campo é: se este dado desaparecer, que decisão deixa de ser possível? Se não houver resposta, o campo não deveria estar a ser recolhido. A retenção é a mesma ideia no tempo: definir por escrito quanto tempo cada conjunto de dados é conservado, o que acontece no fim desse prazo — apagar, anonimizar ou arquivar — e quem executa essa operação. Um plano de retenção que não diz quem executa não é executado.",
      "A criptografia protege os dados de quem não deve conseguir lê-los, e trabalha em dois momentos distintos. Em trânsito, protege os dados enquanto viajam pela rede — entre o navegador e o serviço, ou entre dois serviços — normalmente com protocolo TLS; sem isso, quem estiver na rede no meio do caminho pode ler ou alterar o que passa. Em repouso, protege os dados gravados em discos, em contentores de objectos, em cópias de segurança e em bases de dados; nas grandes plataformas de nuvem, a documentação de referência descreve a cifra em repouso como comportamento por omissão em vários serviços de armazenamento, com possibilidade de o cliente gerir as suas próprias chaves. O que a criptografia em repouso protege é sobretudo o cenário de alguém aceder ao suporte físico ou a cópias em bruto.",
      "É importante ser honesto sobre os limites da criptografia, porque há muita expectativa mal colocada. A cifra em repouso não impede o acesso indevido de quem tem permissão válida na plataforma: para esse utilizador, o sistema decifra os dados de forma transparente. Não protege contra uma aplicação mal construída que mostre dados a quem não deve, nem contra uma exportação feita por alguém autorizado, nem contra uma ligação partilhada publicamente por engano. Não protege contra a perda da chave — perder a chave é perder os dados. E não substitui a minimização: dado que não existe não precisa de ser cifrado. A criptografia é uma camada entre várias, não um selo que dispensa as restantes.",
      "As chaves e os segredos exigem governação própria. Chaves de cifra, palavras-passe de bases de dados, credenciais de integração e tokens de aplicações não pertencem a ficheiros de configuração, a mensagens de correio electrónico, a grupos de conversa nem a repositórios de código. Guardam-se num cofre de segredos da plataforma, com acesso atribuído por função e registo de quem os leu. Convém definir por escrito quem pode criar, ler, substituir e destruir cada segredo, com que periodicidade é substituído e o que se faz quando uma pessoa com esse acesso sai da instituição. Nas contas em que a plataforma gere a chave por omissão, a instituição deve saber que assim é e registar a decisão; nas contas em que a instituição gere a chave, tem de existir procedimento de guarda e de recuperação, porque a responsabilidade passa a ser sua.",
      "Por fim, protecção de dados inclui os acessos e as cópias de segurança, que são frequentemente o ponto mais fraco. De pouco vale cifrar a base de dados se a exportação diária fica num contentor de objectos aberto ao público, ou se as cópias são copiadas para um disco externo que anda na mala de alguém. As cópias herdam a classificação dos dados que contêm: se o original é confidencial, a cópia é confidencial, e o mesmo se aplica aos ambientes de teste. Usar dados reais de pessoas para testar é uma prática a evitar; dados de teste devem ser inventados ou despersonalizados. É o que fazemos neste curso, e é também por isso que o plano de protecção que vamos escrever a seguir não usa nenhum dado real.",
    ],
    exemplo: {
      titulo: "O registo de apoio social de Ondela (cenário fictício)",
      corpo: [
        "O Serviço Distrital de Acção Social de Ondela mantém um registo de candidaturas a apoio social. Cada candidatura tem nome, número de documento de identificação, morada, agregado familiar, rendimento declarado, informação sobre deficiência quando aplicável e uma cópia digitalizada do documento de identificação. O formulário pede ainda o nome da escola dos filhos e a profissão dos avós, campos que ninguém consegue explicar para que servem.",
        "O sistema corre na nuvem. Todas as noites é exportado um ficheiro com todas as candidaturas do dia para um contentor de objectos, de onde uma técnica o descarrega para preparar um relatório em folha de cálculo, que guarda no seu computador pessoal. A palavra-passe da base de dados está escrita num ficheiro de configuração dentro da máquina virtual, e a mesma palavra-passe é usada no ambiente de testes, que contém uma cópia integral dos dados reais.",
        "O caso é fictício. Serve para exercício de análise e não descreve nenhum registo existente.",
      ],
    },
    actividade: {
      formato: "em pares",
      enunciado: [
        AVISO_SEM_LABORATORIO,
        REGRA_EQUIPAMENTO,
        "Não se usam dados reais nesta actividade. Trabalha-se apenas sobre o caso fictício de Ondela; se algum par quiser aproximar-se da sua instituição, descreve categorias de dados («nome», «número de documento»), nunca dados de pessoas concretas.",
        "Parte 1 — classificação e minimização. Listem os campos do registo de candidaturas e, para cada um, indiquem o nível (público, interno ou confidencial), a finalidade em uma frase e a decisão: manter, anonimizar ou deixar de recolher. Os campos sem finalidade demonstrada devem ser propostos para eliminação.",
        "Parte 2 — retenção. Definam, para três conjuntos de dados (candidaturas activas, candidaturas indeferidas e cópias digitalizadas de documentos), o prazo de conservação proposto, o destino no fim do prazo e o responsável pela execução. Prazos que dependam de norma que não conhecem escrevem-se como «por confirmar com a área jurídica».",
        "Parte 3 — criptografia. Indiquem o que deve estar cifrado em trânsito e o que deve estar cifrado em repouso, e escrevam duas ameaças concretas que a criptografia NÃO resolve neste caso.",
        "Parte 4 — chaves e segredos. Proponham onde passam a estar a palavra-passe da base de dados e as credenciais de integração, quem pode lê-las, de quanto em quanto tempo são substituídas e o que acontece quando alguém com esse acesso sai.",
        "Parte 5 — acessos e cópias. Corrijam o percurso da exportação nocturna e do relatório em folha de cálculo, e escrevam a regra que passa a valer para o ambiente de testes.",
        "Rubrica de apreciação, sobre 10 pontos: 2 pontos pela classificação coerente de todos os campos; 2 pontos pela minimização, com pelo menos dois campos propostos para eliminação e a razão; 2 pontos pela retenção com prazo, destino e responsável; 2 pontos pela distinção correcta entre trânsito e repouso e pelas duas ameaças não resolvidas pela criptografia; 1 ponto pela solução de guarda de segredos com periodicidade de substituição; 1 ponto pela correcção do percurso das cópias e do ambiente de testes. Perde 2 pontos qualquer trabalho que utilize dados reais de pessoas.",
      ],
      produto:
        "um plano de protecção de dados com cinco partes, construído sobre o caso fictício e sem qualquer dado real de pessoas.",
    },
    sintese: [
      "Primeiro saber que dados existem e quanto são sensíveis; só depois escolher medidas.",
      "Recolher só o necessário e guardar só o tempo necessário é a protecção mais barata.",
      "Em trânsito protege os dados na viagem pela rede; em repouso protege os dados gravados.",
      "A cifra não impede o acesso de quem tem permissão a mais nem o envio de um ficheiro para fora.",
      "Perder a chave é perder os dados: a guarda e a recuperação de chaves escrevem-se.",
      "Palavras-passe e chaves ficam num cofre de segredos, nunca em ficheiros nem em conversas.",
      "As cópias de segurança e os ambientes de teste têm a mesma sensibilidade dos dados que contêm.",
      "Para testar, usam-se dados inventados.",
    ],
    verificacao: [
      {
        pergunta:
          "A base de dados está cifrada em repouso. Uma conta com permissão de leitura exporta toda a tabela de candidaturas e envia-a por correio electrónico. A criptografia impediu alguma coisa?",
        resposta:
          "Não impediu nada. Para quem tem permissão válida, o sistema decifra os dados de forma transparente; o problema é de permissões, de minimização e de controlo de exportações.",
        feedback:
          "É o limite mais importante a reter: a cifra em repouso protege sobretudo o acesso ao suporte e às cópias em bruto, não o excesso de permissões.",
      },
      {
        pergunta:
          "Porque é que o ambiente de testes com uma cópia integral dos dados reais é um problema, mesmo estando dentro da instituição?",
        resposta:
          "Porque o ambiente de testes costuma ter menos controlos, mais pessoas com acesso e menos vigilância, mas os dados mantêm a mesma sensibilidade do original.",
        feedback:
          "A regra prática é despersonalizar ou inventar os dados de teste; a cópia integral só se justifica com controlos equivalentes aos da produção e decisão escrita.",
      },
    ],
    referencias: [
      {
        titulo: "Microsoft Learn — Azure encryption overview",
        url: "https://learn.microsoft.com/en-us/azure/security/fundamentals/encryption-overview",
        consultadoEm: CONSULTADO,
      },
      {
        titulo: "Microsoft Learn — Best practices for Azure RBAC",
        url: "https://learn.microsoft.com/en-us/azure/role-based-access-control/best-practices",
        consultadoEm: CONSULTADO,
      },
    ],
    guiao: {
      preparacao: [
        "Imprimir a lista de campos do caso de Ondela e a grelha das cinco partes, uma por par.",
        "Escrever no quadro os três níveis de classificação, com um exemplo de cada, retirado de serviços públicos e não de empresas.",
        "Preparar dois exemplos curtos do que a criptografia não resolve, para usar se o grupo atribuir à cifra poderes que ela não tem.",
        "Lembrar, no início, a regra do curso: nenhum dado real de pessoas entra em nenhum exercício.",
        "Nesta lição não se abre nenhuma plataforma nem se altera nenhum recurso na nuvem.",
      ],
      conducao: [
        "Acolhimento, objectivos e devolução breve da apreciação escrita das matrizes de permissões da lição anterior.",
        "Exposição: classificação, minimização e retenção; cifra em trânsito e em repouso; limites da criptografia; cofre de chaves e segredos; acessos, cópias e ambientes de teste.",
        "Actividade em pares sobre as cinco partes do plano, alternando quem escreve a cada parte; circular para verificar que ninguém introduz dados reais e que a parte dos limites da cifra não é saltada.",
        "Partilha por amostra: dois pares apresentam 3 minutos cada, com 2 minutos de comentário e síntese. Os planos dos restantes pares ficam afixados e recebem apreciação escrita.",
      ],
      criterios: [
        "Todos os campos estão classificados e pelo menos dois são propostos para eliminação com razão escrita.",
        "Cada prazo de retenção tem destino e responsável, ou está honestamente marcado como por confirmar.",
        "Trânsito e repouso estão distinguidos e são indicadas duas ameaças que a cifra não resolve.",
        "Os segredos saem dos ficheiros de configuração e passam a ter dono, periodicidade e procedimento de saída.",
        "Nenhum dado real de pessoas foi utilizado.",
      ],
      errosComuns: [
        "Classificar tudo como confidencial, o que na prática impede priorizar.",
        "Tratar a criptografia como solução única e dispensar a revisão de permissões.",
        "Esquecer que a exportação nocturna e a folha de cálculo no computador pessoal são o ponto mais exposto.",
        "Definir prazos de retenção sem indicar quem executa a eliminação.",
        "Copiar dados reais para o ambiente de testes por ser mais rápido.",
      ],
    },
  },

  m3l3: {
    objectivos: [
      "Distinguir registos, métricas e alertas, e indicar para que serve cada um na deteção de um problema.",
      "Analisar um conjunto de eventos fictícios e produzir uma triagem fundamentada, com classificação de gravidade e hipótese explicativa.",
      "Redigir as etapas de resposta a um incidente — contenção autorizada, preservação de evidências, recuperação e lições aprendidas — indicando quem decide cada passo.",
    ],
    explicacao: [
      "Monitorar um serviço na nuvem assenta em três materiais diferentes, que se confundem com frequência. Os registos, também chamados logs, são o relato do que aconteceu: entradas com data, hora, origem, identidade e acção. As métricas são medidas numéricas ao longo do tempo: percentagem de utilização do processador, número de pedidos por minuto, tempo de resposta, espaço livre em disco, número de erros. Os alertas são regras que vigiam métricas ou registos e avisam alguém quando uma condição se verifica. Os três são complementares: a métrica mostra que algo mudou, o registo explica o que foi, e o alerta garante que alguém fica a saber sem ter de estar a olhar para o ecrã.",
      "Um alerta só é útil se tiver destinatário, gravidade e acção esperada. Um alerta enviado para uma caixa de correio que ninguém lê é pior do que não ter alerta, porque cria a ilusão de vigilância. Convém escrever para cada alerta quem o recebe, em que horário, o que deve fazer nos primeiros quinze minutos e a quem escala se não conseguir resolver. Também convém limitar o número de alertas: quando tudo alerta, ninguém repara em nada — é o efeito de fadiga de alertas, e é uma das causas mais comuns de incidentes que só são notados dias depois. Três a cinco alertas bem escolhidos, com destinatário claro, valem mais do que trinta.",
      "Triagem é a decisão inicial sobre o que se está a passar, feita com informação incompleta. Pergunta-se: que serviço está afectado e quantas pessoas sente o efeito? É degradação de desempenho, indisponibilidade total, ou suspeita de acesso indevido? Há dados pessoais envolvidos? O que mudou nas últimas horas — uma actualização, uma alteração de permissões, uma nova regra de rede? A triagem termina com uma classificação de gravidade e uma hipótese, ambas escritas com a hora. Escrever a hora de cada decisão é o que permite, dias depois, reconstituir o que se passou; a memória das pessoas, em situação de pressão, é pouco fiável.",
      "A contenção é a fase mais delicada, e neste curso trata-se sempre de contenção autorizada. Conter é limitar o dano — suspender uma conta suspeita, revogar uma chave, retirar um serviço de circulação, bloquear uma origem de rede. Cada uma destas acções tem consequências para o serviço público e algumas são, elas próprias, decisões de gestão: quem autoriza tirar de serviço um portal de licenciamento não é quem descobriu o problema. Por isso a lista de acções de contenção deve estar escrita antes do incidente, com o nome de quem pode autorizar cada uma e a alternativa quando essa pessoa não está contactável. E há um cuidado técnico importante: conter não é apagar. Destruir a máquina afectada resolve o sintoma e elimina a prova.",
      "Preservar evidências significa guardar, antes de reparar, aquilo que permite depois perceber o que aconteceu: exportar os registos do período, guardar uma imagem do disco em vez de o reformatar, anotar quem esteve ligado e a que horas, registar as alterações feitas durante a resposta. As evidências devem ser guardadas com acesso restrito, porque contêm frequentemente dados sensíveis, e nunca circulam em grupos de conversa. Aqui vale também a regra de honestidade deste curso: o que não foi verificado escreve-se como hipótese, não como facto.",
      "A recuperação é o regresso ao funcionamento normal, e faz-se por ordem: repor o serviço a partir de uma fonte de confiança, confirmar que o caminho de entrada usado pelo atacante ou pela avaria está fechado, repor as credenciais que possam ter sido expostas e só depois reabrir o acesso. Por fim, as lições aprendidas: uma reunião curta, dias depois, que produz um documento com o que aconteceu, o que funcionou, o que falhou e três a cinco acções com responsável e prazo. Esta reunião não procura culpados — procura causas. Uma cultura que castiga quem reporta produz incidentes silenciosos, que são os mais caros. Neste curso não se praticam técnicas ofensivas nem se executam comandos de ataque: trabalhamos apenas sobre registos fictícios, em análise documental.",
    ],
    exemplo: {
      titulo: "Eventos de uma madrugada no portal de Ondela (registos fictícios)",
      corpo: [
        "Os eventos seguintes são inventados para este exercício, com formato simplificado. Não provêm de nenhum sistema real.",
        "02:14 — autenticacao: 47 tentativas falhadas na conta «admin.ondela», origem única fora do país. 02:19 — autenticacao: entrada bem sucedida na conta «admin.ondela», mesma origem, sem segundo factor registado.",
        "02:23 — autorizacao: atribuída função de administrador à identidade «svc-relatorios», âmbito toda a subscrição, por «admin.ondela». 02:26 — armazenamento: contentor «candidaturas-exportacao» alterado de privado para leitura pública, por «admin.ondela».",
        "02:31 — rede: nova regra de permissão na sub-rede de dados, porta 5432, origem qualquer, prioridade 110, por «admin.ondela». 02:40 a 03:05 — armazenamento: 1 240 descarregamentos do ficheiro «export-2026-09-12.csv», origens várias.",
        "03:10 — métrica: saída de dados para a internet sobe de 0,4 GB/hora para 11 GB/hora. 03:12 — alerta de orçamento: consumo mensal atinge 80 % do valor definido; notificação enviada para a caixa geral do departamento.",
        "07:45 — atendimento: primeira chamada de um cidadão a dizer que o portal está muito lento. 08:02 — sistemas: técnico inicia sessão e verifica que a máquina do portal tem o processador a 97 %.",
      ],
    },
    actividade: {
      formato: "em pares",
      enunciado: [
        AVISO_SEM_LABORATORIO,
        REGRA_EQUIPAMENTO,
        "Esta actividade é exclusivamente de análise de registos fictícios. Não se executa nenhuma técnica ofensiva, não se corre nenhum comando contra nenhum sistema e não se altera nenhum recurso na nuvem.",
        "Parte 1 — leitura. Reconstituam a sequência dos eventos numa linha de tempo, indicando para cada momento o que é facto registado e o que é interpretação vossa. Identifiquem qual foi, na vossa leitura, o primeiro evento verdadeiramente grave e porquê.",
        "Parte 2 — triagem. Classifiquem a gravidade em baixa, média, alta ou crítica, justificando com o efeito sobre as pessoas e sobre os dados. Escrevam uma hipótese explicativa, começada por «hipótese:», e listem três informações que precisariam de obter para a confirmar ou afastar.",
        "Parte 3 — contenção autorizada. Proponham até cinco acções de contenção, por ordem de execução, indicando para cada uma quem autoriza, o efeito esperado no serviço ao cidadão e o risco de a executar. Pelo menos uma acção deve ter consequência visível para o público e exigir decisão de direcção.",
        "Parte 4 — evidências. Indiquem o que guardam antes de reparar, onde guardam, quem tem acesso e durante quanto tempo. Escrevam uma acção que NÃO devem fazer por destruir prova.",
        "Parte 5 — recuperação e lições aprendidas. Ordenem os passos do regresso ao normal e escrevam três acções de melhoria, cada uma com responsável proposto e prazo. Pelo menos uma deve corrigir um problema visível nos registos que não é técnico, mas de organização.",
        "Rubrica de apreciação, sobre 10 pontos: 2 pontos pela linha de tempo com separação entre facto e interpretação; 2 pontos pela gravidade justificada e pela hipótese escrita como hipótese; 2 pontos pelas acções de contenção com autorização identificada e efeito no serviço; 2 pontos pelas evidências preservadas e pela acção destrutiva evitada; 2 pontos pelas lições aprendidas com responsável e prazo. Perde 2 pontos qualquer trabalho que apresente interpretações como factos registados.",
      ],
      produto:
        "uma ficha de incidente com linha de tempo, triagem, plano de contenção autorizada, plano de preservação de evidências e três acções de melhoria com responsável e prazo.",
    },
    sintese: [
      "Registos contam o que aconteceu. Métricas medem. Alertas avisam alguém.",
      "Um alerta sem destinatário e sem acção esperada é apenas ruído.",
      "Triagem: que serviço, quantas pessoas, que dados, o que mudou — sempre com a hora escrita.",
      "Conter é limitar o dano; algumas acções de contenção têm de ser autorizadas pela direcção.",
      "Conter não é apagar: destruir a máquina afectada elimina a prova.",
      "Guardar as evidências antes de reparar, com acesso restrito.",
      "Recuperar por ordem: repor, fechar o caminho usado, trocar credenciais, reabrir.",
      "As lições aprendidas procuram causas e não culpados, com responsável e prazo.",
    ],
    verificacao: [
      {
        pergunta:
          "Nos registos fictícios, o alerta de orçamento disparou às 03:12. Porque é que isso não foi suficiente para deter o problema?",
        resposta:
          "Porque foi enviado para uma caixa geral do departamento, sem destinatário responsável nem acção esperada, e de madrugada ninguém o leu; além disso um alerta de orçamento avisa sobre despesa, não suspende consumo.",
        feedback:
          "Este é o ponto de organização escondido no exercício: a melhoria mais eficaz aqui não é técnica, é definir quem recebe o quê e o que faz a seguir.",
      },
      {
        pergunta:
          "A equipa quer apagar imediatamente a máquina virtual afectada para «ficar tudo limpo». Que objecção levanta?",
        resposta:
          "Apagar destrói as evidências e impede perceber o que aconteceu e se o caminho de entrada foi fechado; deve isolar-se a máquina e guardar registos e imagem do disco antes de qualquer reparação.",
        feedback:
          "Isolar e preservar primeiro; recuperar depois, a partir de uma fonte de confiança.",
      },
    ],
    referencias: [
      {
        titulo: "Microsoft Learn — Best practices for Azure RBAC",
        url: "https://learn.microsoft.com/en-us/azure/role-based-access-control/best-practices",
        consultadoEm: CONSULTADO,
      },
      {
        titulo: "Microsoft Learn — Tutorial: create and manage budgets (alertas de orçamento)",
        url: "https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets",
        consultadoEm: CONSULTADO,
      },
    ],
    guiao: {
      preparacao: [
        "Imprimir a folha de eventos fictícios e a ficha de incidente em branco, uma por par; o exercício é integralmente em papel ou em folha de cálculo.",
        "Escrever no quadro a distinção entre registo, métrica e alerta, e mantê-la visível.",
        "Anunciar no início, com clareza, que não se pratica nenhuma técnica ofensiva e que os registos são inventados.",
        "Preparar a ligação às duas lições anteriores: a conta partilhada e a ausência de segundo factor aparecem nos registos de propósito.",
        "Nesta lição não se abre nenhuma plataforma nem se altera nenhum recurso na nuvem.",
      ],
      conducao: [
        "Acolhimento, objectivos e pergunta inicial: como é que a vossa instituição fica hoje a saber que um serviço parou?",
        "Exposição: registos, métricas e alertas; fadiga de alertas; triagem com hora escrita; contenção autorizada; preservação de evidências; recuperação ordenada; lições aprendidas sem procura de culpados.",
        "Actividade em pares sobre os registos fictícios, alternando quem escreve a cada parte; circular para exigir a separação entre facto e interpretação e para travar propostas de apagar a máquina.",
        "Partilha por amostra: dois pares apresentam 3 minutos cada, com 2 minutos de comentário e síntese. As fichas dos restantes pares ficam afixadas e recebem apreciação escrita.",
      ],
      criterios: [
        "A linha de tempo distingue factos registados de interpretações.",
        "A gravidade é justificada pelo efeito sobre pessoas e dados, e não apenas pela indisponibilidade.",
        "Cada acção de contenção tem quem autoriza e efeito previsto no serviço ao cidadão.",
        "As evidências são preservadas antes da reparação e há uma acção destrutiva explicitamente evitada.",
        "Pelo menos uma lição aprendida corrige um problema de organização e tem responsável e prazo.",
      ],
      errosComuns: [
        "Escrever a hipótese como se fosse conclusão provada.",
        "Propor apagar ou reinstalar antes de guardar registos e imagem de disco.",
        "Esquecer que suspender um serviço público é decisão com impacto e precisa de autorização.",
        "Concentrar todas as melhorias em tecnologia e não corrigir o encaminhamento dos alertas.",
        "Confundir o alerta de orçamento com um travão automático de consumo.",
      ],
    },
  },

  m3l4: {
    objectivos: [
      "Identificar as principais rubricas de custo de um serviço na nuvem: computação, armazenamento, rede e saída de dados, cópias de segurança, registos e suporte.",
      "Calcular o custo mensal de um cenário fictício a partir de uma tabela de preços dada, apresentando todos os operandos e o resultado em dólares e em meticais, com os pressupostos escritos.",
      "Propor medidas de optimização com poupança estimada, distinguindo o que reduz custo do que apenas o adia, e explicar os limites dos alertas de orçamento.",
    ],
    explicacao: [
      "A factura de um serviço na nuvem não tem uma linha só. Tem, tipicamente, seis famílias de rubricas. A computação paga-se sobretudo por tempo com a máquina ligada, e por tamanho da máquina. O armazenamento paga-se por capacidade ocupada e por tempo, havendo classes mais baratas para dados pouco consultados. A rede é o ponto que mais surpreende: a entrada de dados costuma não ser cobrada, mas a saída para a internet é cobrada por gigabyte, e tráfego entre regiões também pode ser cobrado. As cópias de segurança pagam-se por volume guardado e por tempo de retenção. Os registos de monitoria pagam-se por volume recebido e por tempo de conservação — guardar tudo, sempre, sai caro. E o suporte costuma ser um plano à parte, muitas vezes com percentagem do consumo e com valor mínimo mensal.",
      "Há três verdades incómodas que convém dizer cedo. A primeira: parar uma máquina virtual não elimina todos os custos associados, e «parar» não quer sempre dizer a mesma coisa. A documentação do Azure sobre estados e facturação de máquinas virtuais distingue o estado «parada» (Stopped), em que a máquina continua com a capacidade reservada e a computação CONTINUA a ser facturada, do estado «parada e desalocada» (Stopped/Deallocated), em que a capacidade é libertada e a computação por consumo deixa de ser facturada. Mesmo desalocada, o disco continua a ocupar espaço e a ser cobrado, e endereços reservados, cópias e licenças associadas podem continuar a contar; e, se existirem compromissos contratuais — capacidade reservada, planos de poupança, licenças subscritas —, esses continuam a ser pagos independentemente de a máquina estar ligada ou não. Desligar a máquina pelo sistema operativo, de dentro, costuma deixá-la no primeiro estado, não no segundo. Para deixar de pagar tudo, é preciso eliminar os recursos — depois de confirmar que não são precisos e de guardar o que interessa. A segunda: os alertas de orçamento avisam, não travam. Um orçamento definido na plataforma envia notificação quando o consumo atinge determinadas percentagens do valor previsto; por si, não suspende serviços nem impede que a despesa continue a crescer. A documentação do próprio fornecedor descreve o orçamento como instrumento de aviso, e qualquer acção automática tem de ser configurada à parte, com todos os riscos que suspender um serviço público acarreta. A terceira: o preço listado não é a despesa total — falta o câmbio, faltam impostos quando aplicáveis, falta o tempo de pessoas.",
      "Por isso, todo o cálculo de custos tem de trazer os pressupostos à superfície. Quantas horas por dia a máquina está mesmo ligada? Quantos dias tem o mês considerado? Que volume de saída de dados se prevê, e com que base? Qual o câmbio usado e de que data? Um orçamento em que estes números não estão escritos não pode ser discutido nem corrigido: só pode ser acreditado ou rejeitado. Escrever os pressupostos é o que transforma uma estimativa numa proposta discutível. E quando um número não é conhecido, escreve-se «por apurar» e indica-se como será apurado — nunca se preenche com um valor bonito.",
      "A optimização faz-se por camadas, começando pelo que não tem risco. Primeiro, eliminar o que não é usado: discos órfãos de máquinas já apagadas, endereços reservados sem uso, ambientes de demonstração esquecidos, cópias antigas fora da política de retenção. Depois, ajustar o que está sobredimensionado: máquinas com processador quase sempre abaixo de dez por cento, bases de dados com capacidade muito acima do uso real. A seguir, ajustar horários: ambientes de teste e de formação raramente precisam de estar ligados de noite e ao fim-de-semana. Depois, arrumar os dados: mover para classes de armazenamento mais baratas o que é raramente consultado, reduzir a retenção de registos para o que é realmente necessário, comprimir exportações. Só no fim se consideram compromissos de longo prazo — capacidade reservada por um ou três anos — porque estes trocam flexibilidade por desconto e, num serviço público, exigem previsibilidade que nem sempre existe.",
      "É útil distinguir três tipos de medida, porque são frequentemente confundidos na mesma lista. Há medidas que reduzem o custo de forma permanente, como apagar um disco órfão. Há medidas que adiam ou deslocam o custo, como mover dados para uma classe mais barata com custo de leitura mais alto: se os dados forem muito consultados, a poupança desaparece. E há medidas que reduzem risco sem reduzir custo, como criar um orçamento com alertas — valiosas, mas que não devem ser somadas à coluna da poupança. Uma proposta de optimização honesta separa estas três colunas.",
      "Finalmente, a governação do custo é uma responsabilidade partilhada e precisa de dono. Convém haver etiquetas nos recursos que identifiquem o serviço, a direcção responsável e o projecto, para que a factura possa ser repartida e discutida; sem isso, a despesa aparece como um bloco único que ninguém consegue explicar. Convém haver revisão mensal do consumo com a direcção, com comparação entre previsto e realizado e explicação dos desvios. E convém que quem cria recursos saiba o que custam — muitos excessos nascem de boa-fé técnica, não de desleixo.",
    ],
    exemplo: {
      titulo: "A factura mensal do portal de Ondela (preços e consumo FICTÍCIOS)",
      corpo: [
        "A tabela de preços que se segue é inventada para este exercício. Os valores são redondos de propósito, para que o cálculo possa ser feito à mão. Não correspondem aos preços de nenhum fornecedor e não servem para orçamentar nada.",
        ...TABELA_PRECOS_TEXTO,
        `Consumo declarado no mês, também fictício, para um mês de ${CENARIO_CUSTOS.diasDoMes} dias: ${CENARIO_CUSTOS.vmPortal.descricao}, ou seja ${CENARIO_CUSTOS.vmPortal.horas} horas; ${CENARIO_CUSTOS.vmRelatorios.descricao}, ou seja ${CENARIO_CUSTOS.vmRelatorios.horas} horas; ${CENARIO_CUSTOS.discosPortalGb} GB de disco na máquina do portal e ${CENARIO_CUSTOS.discosRelatoriosGb} GB de disco na máquina de relatórios, ou seja ${CENARIO_CUSTOS.discosGb} GB de discos no total; ${CENARIO_CUSTOS.objectosGb} GB em armazenamento de objectos; ${CENARIO_CUSTOS.saidaGb} GB de saída de dados para a internet; ${CENARIO_CUSTOS.backupGb} GB de cópias de segurança; ${CENARIO_CUSTOS.logsGb} GB de registos recebidos pelo serviço de monitoria.`,
        "Repare-se em dois detalhes que costumam ser esquecidos no cálculo: os primeiros gigabytes de saída não são cobrados, pelo que a saída facturável é menor do que a saída total; e o plano de suporte tem um valor mínimo, que se aplica quando a percentagem calculada fica abaixo desse mínimo.",
      ],
    },
    actividade: {
      formato: "em pares",
      enunciado: [
        AVISO_SEM_LABORATORIO,
        REGRA_EQUIPAMENTO,
        "Trabalho em papel ou em folha de cálculo, a partir da tabela de preços fictícios e do consumo declarado acima. Nenhum recurso é criado e nenhuma factura real é consultada.",
        "Parte 1 — cálculo. Preencham uma tabela com uma linha por rubrica: computação, discos, armazenamento de objectos, saída de dados, cópias de segurança, registos e suporte. Em cada linha têm de escrever os operandos usados — quantidade, preço unitário e resultado — e não apenas o total. Apresentem o consumo do mês, o valor do suporte, o total em dólares e o total convertido em meticais ao câmbio assumido.",
        "Parte 2 — pressupostos. Escrevam a lista dos pressupostos do vosso cálculo, incluindo o número de dias do mês, as horas de funcionamento assumidas, os gigabytes de saída sem custo e o câmbio. Marquem com «por apurar» qualquer número que, num caso real, teria de ser confirmado e indiquem onde seria confirmado.",
        "Parte 3 — optimização. Proponham cinco medidas para reduzir o custo mensal deste cenário. Para cada uma indiquem a poupança estimada em dólares, como a estimaram, o risco para o serviço e a classificação da medida: reduz custo de forma permanente, adia ou desloca o custo, ou reduz risco sem reduzir custo. As três colunas não se somam entre si.",
        "Parte 4 — limites. Respondam por escrito a duas perguntas: (a) se a direcção definir um orçamento com alerta aos 80 %, o consumo pára quando o alerta dispara? (b) se a máquina de relatórios ficar parada E DESALOCADA durante todo o mês seguinte — pressuposto expresso deste exercício: a capacidade é libertada e não existe nenhum compromisso contratual de capacidade reservada, plano de poupança ou licença subscrita associado a essa máquina —, quanto deixamos de pagar e que custos continuam a ser cobrados? Apresentem a conta. Escrevam também o que mudaria na resposta se a máquina ficasse apenas parada, sem ser desalocada.",
        "Rubrica de apreciação, sobre 10 pontos: 3 pontos pelo cálculo correcto com todos os operandos visíveis; 1 ponto pelo tratamento correcto dos gigabytes de saída sem custo; 1 ponto pelo tratamento correcto do mínimo do plano de suporte; 1 ponto pela conversão com câmbio identificado como pressuposto; 2 pontos pelas cinco medidas com poupança estimada e classificação nas três colunas; 2 pontos pelas duas respostas da parte 4, com a conta feita. Perde 2 pontos qualquer trabalho que apresente um total sem mostrar os operandos.",
      ],
      produto:
        "uma folha de cálculo de custos com todos os operandos visíveis, lista de pressupostos, cinco medidas de optimização classificadas em três colunas e as respostas fundamentadas sobre os limites dos alertas de orçamento e da paragem de máquinas.",
    },
    sintese: [
      "A factura tem várias rubricas: computação, armazenamento, rede e saída, cópias, registos e suporte.",
      "A entrada de dados costuma não pagar; a saída para a internet paga.",
      "Parar não é o mesmo que desalocar: só a máquina desalocada deixa de pagar computação por consumo.",
      "Mesmo desalocada, o disco continua a ser cobrado.",
      "Compromissos já assumidos (capacidade reservada, licenças) continuam a pagar-se com a máquina desligada.",
      "Os alertas de orçamento avisam; não suspendem o consumo.",
      "Todo o cálculo mostra os operandos, os pressupostos e o câmbio usado.",
      "Optimizar começa por apagar o que não é usado e ajustar o que está grande demais.",
      "Reduzir custo, adiar custo e reduzir risco são três coisas diferentes e não se somam.",
      "Etiquetar os recursos permite saber de quem é cada despesa.",
    ],
    verificacao: [
      {
        pergunta:
          "A direcção definiu um orçamento mensal com aviso aos 80 % e aos 100 %. Em que medida isso protege a instituição de uma despesa inesperada?",
        resposta:
          "Protege por aviso apenas: a notificação chega a quem estiver indicado, mas o consumo continua. Travar exige acção humana ou uma automatização configurada à parte, decidida com cuidado num serviço público.",
        feedback:
          "Por isso o alerta precisa de destinatário responsável e de acção esperada, como se viu na lição de monitoria.",
      },
      {
        pergunta:
          `No cenário fictício, porque é que o plano de suporte fica em ${n(CUSTO.suporte)} USD e não em ${n(CUSTO.suporteCalculado)} USD?`,
        resposta: `Porque ${PRECOS_FICTICIOS.suportePct * 100} % de ${n(CUSTO.consumo)} USD dá ${n(CUSTO.suporteCalculado)} USD, valor inferior ao mínimo mensal de ${PRECOS_FICTICIOS.suporteMinimoUsd} USD previsto na tabela; aplica-se o mínimo.`,
        feedback:
          "Valores mínimos e escalões são a origem mais frequente de erro nos orçamentos feitos à pressa.",
      },
    ],
    referencias: [
      {
        titulo: "Microsoft Learn — Estados e facturação de máquinas virtuais no Azure",
        url: "https://learn.microsoft.com/en-us/azure/virtual-machines/states-billing",
        consultadoEm: CONSULTADO,
      },
      {
        titulo: "Microsoft Learn — Tutorial: create and manage Azure budgets",
        url: "https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets",
        consultadoEm: CONSULTADO,
      },
    ],
    guiao: {
      preparacao: [
        "Imprimir a tabela de preços fictícios e a grelha de cálculo em branco, uma por par; onde houver computador, pode usar-se folha de cálculo.",
        "Escrever no quadro as seis famílias de rubricas e mantê-las visíveis.",
        "Ter calculadora disponível e confirmar que ninguém fica impedido de participar por não a ter.",
        "Nesta lição não se abre nenhuma plataforma, não se consulta nenhuma factura real e não se cria nenhum recurso.",
        "Solução de referência do cálculo, para correcção em plenário (todos os valores são fictícios):",
        ...SOLUCAO_TEXTO,
        `Resposta de referência da parte 4(b), sob o pressuposto expresso de máquina parada E DESALOCADA, com capacidade libertada e sem compromissos contratuais associados: deixam de se pagar ${CENARIO_CUSTOS.vmRelatorios.horas} h × ${PRECOS_FICTICIOS.vmHora} USD/h = ${n(CENARIO_CUSTOS.vmRelatorios.horas * PRECOS_FICTICIOS.vmHora)} USD de computação. Se a máquina ficasse apenas parada, sem desalocação, essa poupança NÃO se verificaria. Em qualquer dos casos, o disco de ${CENARIO_CUSTOS.discosRelatoriosGb} GB dessa máquina continua a ser cobrado: ${CENARIO_CUSTOS.discosRelatoriosGb} GB × ${PRECOS_FICTICIOS.discoGbMes} USD/GB/mês = ${n(CENARIO_CUSTOS.discosRelatoriosGb * PRECOS_FICTICIOS.discoGbMes)} USD, e as cópias e os registos associados também continuam se não forem alterados. A poupança líquida na computação não é, portanto, a eliminação de toda a despesa dessa máquina.`,
      ],
      conducao: [
        "Acolhimento, objectivos e pergunta inicial: quem já viu uma factura de serviços informáticos que não conseguiu explicar?",
        "Exposição: as seis famílias de rubricas; entrada e saída de dados; parar não é desalocar e desalocar não é eliminar; orçamentos avisam mas não travam; pressupostos e câmbio; camadas de optimização; as três colunas de medidas; etiquetagem e revisão mensal.",
        "Actividade em pares: cálculo, pressupostos, optimização e limites, alternando quem escreve a cada parte; circular para verificar que os operandos estão visíveis e que os gigabytes sem custo e o mínimo do suporte foram tratados.",
        "Correcção do cálculo em plenário com a solução de referência, partilha por amostra de dois pares sobre as medidas de optimização e síntese. As folhas dos restantes pares ficam afixadas e recebem apreciação escrita.",
      ],
      criterios: [
        "Todas as rubricas aparecem com quantidade, preço unitário e resultado.",
        "A saída sem custo e o mínimo do plano de suporte estão correctamente aplicados.",
        "O câmbio aparece identificado como pressuposto e não como facto.",
        "As cinco medidas estão classificadas nas três colunas e as poupanças não são somadas indevidamente.",
        "As respostas sobre o alerta de orçamento e sobre a paragem da máquina estão correctas e com conta feita.",
      ],
      errosComuns: [
        "Apresentar apenas o total, sem mostrar como se chegou lá.",
        "Cobrar a saída total em vez da saída facturável, esquecendo os gigabytes sem custo.",
        "Aplicar a percentagem do suporte e ignorar o valor mínimo.",
        "Assumir que parar a máquina elimina toda a despesa associada.",
        "Confundir máquina parada com máquina desalocada: só a segunda liberta a computação por consumo.",
        "Somar na mesma coluna poupanças reais e medidas que apenas reduzem risco.",
        "Usar um câmbio sem dizer qual é nem de quando é.",
      ],
    },
  },

  m3l5: {
    objectivos: [
      "Redigir requisitos mensuráveis para a contratação de um serviço de nuvem, distinguindo requisito de desejo.",
      "Interpretar um nível de serviço acordado e as suas exclusões, e relacionar objectivos de recuperação com necessidades do serviço público.",
      "Comparar duas propostas fictícias com uma grelha de critérios e produzir uma recomendação fundamentada, identificando o que fica por validar.",
    ],
    explicacao: [
      "Um requisito só serve para alguma coisa se puder ser verificado. «O serviço deve ser rápido» não é requisito; «o tempo de resposta mediano das páginas de consulta não deve exceder dois segundos, medido a partir de Maputo e de Nampula, em horário útil» é requisito, porque se pode medir e porque diz onde e quando. A regra prática é escrever cada requisito com três elementos: o que se exige, como se mede e qual o valor ou limite. Convém ainda separar o que é obrigatório do que é valorizado: uma lista em que tudo é obrigatório reduz a concorrência e pode deixar a instituição sem propostas admissíveis; uma lista em que nada é obrigatório não protege ninguém.",
      "O nível de serviço acordado, muitas vezes designado pela sigla inglesa SLA, é o compromisso do fornecedor quanto à disponibilidade e, por vezes, quanto ao desempenho e ao tempo de resposta do apoio. Três cuidados. Primeiro, o que conta como indisponibilidade está definido no próprio documento e pode ser mais estreito do que a experiência do utilizador: um serviço lento pode não contar como indisponível. Segundo, as exclusões costumam ser extensas — manutenções programadas, falhas da ligação do cliente, casos de força maior, utilização fora das condições previstas. Terceiro, a compensação por incumprimento é tipicamente um crédito na factura, não uma indemnização pelo prejuízo causado ao serviço público; para um serviço de atendimento ao cidadão, um crédito de cinco por cento não repara nada. Ler as exclusões é mais importante do que ler a percentagem.",
      "Dois números merecem discussão própria, porque são frequentemente copiados sem se perceber o que exigem. O objectivo de ponto de recuperação, RPO, é quanto trabalho a instituição aceita perder, medido em tempo: um RPO de uma hora significa aceitar perder até uma hora de dados introduzidos. O objectivo de tempo de recuperação, RTO, é em quanto tempo o serviço tem de voltar a funcionar. Ambos custam dinheiro: quanto mais curtos, mais cara é a solução. Por isso definem-se por serviço e não por instituição — o registo de candidaturas a apoio social pode justificar um RPO curto, enquanto o sítio informativo tolera um RPO de um dia. Estes valores devem sair de uma conversa com quem presta o serviço, não do que estava escrito no caderno de encargos anterior.",
      "A portabilidade e a saída são o capítulo mais esquecido e o que mais custa quando falha. Antes de entrar, escreve-se como se sai: em que formatos os dados podem ser exportados, com que periodicidade, em quanto tempo, a que custo, com que apoio do fornecedor, e o que acontece aos dados depois de terminado o contrato — prazo de eliminação e prova dessa eliminação. Convém exigir que a exportação seja demonstrada durante a vigência do contrato, e não apenas prometida; uma exportação que nunca foi ensaiada é uma promessa por verificar. Convém também acautelar a dependência técnica: quanto mais o serviço assentar em componentes específicos de um fornecedor, mais caro é mudar. Isso não é razão para os evitar sempre, mas é razão para os escolher conscientemente e para registar o custo estimado de saída.",
      "Localização dos dados e responsabilidades são o quarto bloco. É preciso saber em que país ou países os dados ficam guardados, onde são processados, onde ficam as cópias de segurança, quem tem acesso técnico a partir de onde e em que condições o fornecedor pode aceder ao conteúdo. É preciso saber também o que a instituição continua a ter de fazer: nas nuvens públicas, a responsabilidade é partilhada, e a configuração, as permissões e os dados são quase sempre responsabilidade do cliente. Um contrato pode exigir notificação de incidentes de segurança em prazo definido, com conteúdo mínimo, e exigir que subcontratações sejam comunicadas. Atenção a um limite deste curso: o enquadramento jurídico concreto aplicável a cada contratação — legislação de contratação pública, protecção de dados e requisitos sectoriais — tem de ser confirmado com a área jurídica da instituição. Aqui trabalha-se a formulação técnica dos requisitos; não se produzem pareceres jurídicos nem se inventam obrigações legais.",
      "A acessibilidade e o apoio entram nos requisitos como qualquer outro critério e não como boa intenção final. Pode exigir-se que as interfaces destinadas a pessoas utilizadoras respeitem critérios reconhecidos de acessibilidade, que o fornecedor apresente uma declaração de conformidade com identificação do que não cumpre, que existam alternativas de texto e navegação por teclado, e que o apoio esteja disponível em português, em horário definido, por mais do que um canal — telefone, correio electrónico e um canal escrito assíncrono — porque nem todas as pessoas conseguem usar todos os canais. Uma nota importante de honestidade: a meta de 99,5 % de disponibilidade que consta do Termo de Referência aplica-se à plataforma objecto daquele concurso. Não é um valor a copiar automaticamente para qualquer contratação de serviços de nuvem: o nível exigido define-se caso a caso, em função da criticidade do serviço e do que se está disposto a pagar.",
    ],
    exemplo: {
      titulo: "Duas propostas para o arquivo digital de Ondela (propostas fictícias)",
      corpo: [
        "O Distrito de Ondela quer contratar serviço de nuvem para um arquivo digital de processos, com consulta interna diária e consulta pública ocasional. Recebeu duas propostas, ambas inventadas para este exercício.",
        "Proposta A: disponibilidade anunciada de 99,9 %, com exclusão de manutenções programadas até 8 horas por mês e de falhas de ligação do cliente; compensação de 10 % de crédito na factura por mês em incumprimento; cópias de segurança diárias com retenção de 14 dias; exportação de dados em formato próprio do fornecedor, mediante pedido, em prazo não especificado; dados alojados em dois centros de dados fora do país, sem indicação de quais; apoio em inglês por correio electrónico, com resposta em 24 horas úteis; sem declaração de acessibilidade.",
        "Proposta B: disponibilidade anunciada de 99,5 %, com exclusão de manutenções programadas até 4 horas por mês, comunicadas com 7 dias de antecedência; compensação de 5 % de crédito; cópias de segurança de 6 em 6 horas com retenção de 30 dias; exportação em formatos abertos, a pedido, em 5 dias úteis, com um ensaio de exportação por ano incluído no contrato; dados alojados em dois centros de dados, com país indicado no contrato e cópias na mesma jurisdição; apoio em português por telefone e correio electrónico em horário útil, com resposta em 8 horas úteis; declaração de acessibilidade com lista do que não cumpre e plano de correcção.",
        "Nenhuma das propostas indica o custo de saída no fim do contrato nem o prazo de eliminação dos dados após o termo.",
      ],
    },
    actividade: {
      formato: "em pares",
      enunciado: [
        AVISO_SEM_LABORATORIO,
        REGRA_EQUIPAMENTO,
        "Exercício de análise documental sobre propostas fictícias. Não se contacta nenhum fornecedor, não se produz nenhuma peça de procedimento real e não se emitem conclusões jurídicas.",
        "Parte 1 — requisitos. Escrevam oito requisitos para esta contratação, cada um com três elementos: o que se exige, como se verifica e qual o valor ou limite. Marquem cada requisito como obrigatório ou valorizado. Pelo menos um requisito deve ser de acessibilidade e pelo menos um de apoio em português.",
        "Parte 2 — recuperação. Definam o RPO e o RTO propostos para o arquivo digital, justificando com o efeito de uma falha sobre o atendimento, e digam que consequência esses valores têm sobre a frequência das cópias de segurança.",
        "Parte 3 — saída. Escrevam três cláusulas sobre portabilidade e saída: formato e prazo de exportação, ensaio de exportação durante o contrato, e destino e prazo de eliminação dos dados no fim. Indiquem também como estimariam o custo de mudar de fornecedor.",
        "Parte 4 — comparação. Construam uma grelha com os critérios que escolheram, atribuam a cada proposta «cumpre», «cumpre parcialmente» ou «não cumpre» e escrevam uma recomendação de meia página. A recomendação tem de indicar o que ficaria por esclarecer com cada concorrente e o que teria de ser confirmado com a área jurídica da instituição.",
        "Atenção: não copiem automaticamente o valor de 99,5 % do Termo de Referência da plataforma para este contrato. Escolham o nível que este serviço justifica e escrevam a razão da escolha.",
        "Rubrica de apreciação, sobre 10 pontos: 3 pontos pelos oito requisitos mensuráveis, com forma de verificação e separação entre obrigatório e valorizado; 2 pontos pelo RPO e RTO justificados e ligados à frequência das cópias; 2 pontos pelas três cláusulas de saída e pela estimativa de custo de mudança; 2 pontos pela grelha comparativa preenchida e pela recomendação fundamentada; 1 ponto pela identificação honesta do que fica por esclarecer e do que é matéria jurídica. Perde 2 pontos qualquer trabalho que afirme obrigações legais concretas sem base dada no exercício.",
      ],
      produto:
        "um caderno de requisitos com oito requisitos mensuráveis, valores de RPO e RTO justificados, três cláusulas de saída e uma grelha comparativa com recomendação fundamentada e pontos por validar.",
    },
    sintese: [
      "Requisito é o que se pode verificar: o que se exige, como se mede, que valor.",
      "Separar o que é obrigatório do que é valorizado.",
      "No nível de serviço, as exclusões contam mais do que a percentagem anunciada.",
      "A compensação por incumprimento costuma ser crédito na factura, não reparação do prejuízo.",
      "RPO é quanto trabalho se aceita perder; RTO é em quanto tempo o serviço volta.",
      "Antes de entrar, escrever como se sai: formato, prazo, ensaio, eliminação e prova.",
      "Saber onde ficam os dados, onde ficam as cópias e quem lhes pode aceder.",
      "Acessibilidade e apoio em português são requisitos, não boas intenções.",
      "O valor de 99,5 % do Termo de Referência é daquela plataforma; cada contrato define o seu.",
      "Matéria jurídica confirma-se com a área jurídica da instituição.",
    ],
    verificacao: [
      {
        pergunta:
          "Uma proposta anuncia 99,9 % de disponibilidade e outra 99,5 %. Basta este número para escolher a melhor?",
        resposta:
          "Não. É preciso ver o que conta como indisponibilidade, quais são as exclusões, quanto tempo de manutenção programada fica de fora, como se comprova o incumprimento e o que se recebe em compensação.",
        feedback:
          "No caso fictício, a proposta com percentagem mais baixa tem menos horas de manutenção excluídas, cópias mais frequentes e saída mais segura.",
      },
      {
        pergunta:
          "Porque é que exigir um ensaio de exportação durante o contrato é diferente de exigir que a exportação seja possível?",
        resposta:
          "Porque a possibilidade fica por verificar até ao dia em que é precisa; o ensaio prova o formato, o prazo e a integridade enquanto ainda há relação contratual para corrigir problemas.",
        feedback:
          "É a mesma lógica das cópias de segurança: só conta o que foi testado.",
      },
    ],
    referencias: [
      {
        titulo: "Microsoft Learn — Azure encryption overview",
        url: "https://learn.microsoft.com/en-us/azure/security/fundamentals/encryption-overview",
        consultadoEm: CONSULTADO,
      },
      {
        titulo: "Microsoft Learn — Best practices for Azure RBAC",
        url: "https://learn.microsoft.com/en-us/azure/role-based-access-control/best-practices",
        consultadoEm: CONSULTADO,
      },
    ],
    guiao: {
      preparacao: [
        "Imprimir as duas propostas fictícias e a grelha comparativa em branco, uma por par.",
        "Escrever no quadro os três elementos de um requisito verificável e mantê-los visíveis.",
        "Preparar dois exemplos de requisito mal escrito, para o grupo corrigir em conjunto no início da exposição.",
        "Dizer com clareza que não se emitem pareceres jurídicos e que a matéria legal é confirmada com a área jurídica da instituição.",
        "Lembrar que a meta de 99,5 % do Termo de Referência é da plataforma daquele concurso e não se aplica automaticamente a qualquer fornecedor.",
        "Nesta lição não se abre nenhuma plataforma e não se contacta nenhum fornecedor.",
      ],
      conducao: [
        "Acolhimento, objectivos e devolução breve da apreciação escrita do exercício de custos.",
        "Exposição: requisitos verificáveis; obrigatório e valorizado; nível de serviço e exclusões; RPO e RTO; portabilidade, saída e custo de mudança; localização dos dados e responsabilidade partilhada; acessibilidade e apoio; limite jurídico do curso.",
        "Actividade em pares sobre as duas propostas fictícias, alternando quem escreve a cada parte; circular para transformar desejos em requisitos mensuráveis e travar afirmações jurídicas inventadas.",
        "Partilha por amostra: dois pares apresentam a recomendação 3 minutos cada, com 2 minutos de comentário e síntese final do módulo. Os cadernos dos restantes pares ficam afixados e recebem apreciação escrita.",
      ],
      criterios: [
        "Os oito requisitos têm forma de verificação e valor ou limite, e estão separados entre obrigatórios e valorizados.",
        "Existe pelo menos um requisito de acessibilidade e um de apoio em português.",
        "O RPO e o RTO estão justificados pelo efeito no atendimento e ligados à frequência das cópias.",
        "As cláusulas de saída cobrem formato, prazo, ensaio e eliminação com prova.",
        "A recomendação identifica o que fica por esclarecer e o que é matéria jurídica, em vez de afirmar obrigações inventadas.",
      ],
      errosComuns: [
        "Escrever desejos — «serviço fiável», «bom apoio» — em vez de requisitos verificáveis.",
        "Escolher a proposta pela percentagem de disponibilidade sem ler as exclusões.",
        "Copiar a meta de 99,5 % do Termo de Referência para qualquer contrato.",
        "Definir RPO de minutos para todos os serviços, sem olhar ao custo.",
        "Deixar a saída do contrato por escrever e descobrir o custo de mudança já tarde.",
        "Afirmar obrigações legais concretas sem confirmação da área jurídica.",
      ],
    },
  },
};
