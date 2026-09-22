/**
 * Módulo 1 — Gestão Avançada do Risco Cibernético. Cinco lições.
 * Casos, instituições, endereços, registos e números: todos fictícios.
 */
import type { ConteudoLicao } from "./seguranca-cibernetica-base";
import { NIST_CSF, CISA_KEV, OWASP_WSTG } from "./seguranca-cibernetica-base";

// ---------------------------------------------------------------------------
// M1 L1 — Fundamentos avançados, activos críticos e risco cibernético (90 min)
// ---------------------------------------------------------------------------
const M1L1: ConteudoLicao = {
  objectivos: [
    "Classificar os oito activos da ficha da Direcção de Serviços Digitais de Muteva quanto a confidencialidade, integridade e disponibilidade, numa escala de baixo, médio e alto, justificando cada classificação com uma consequência concreta para o serviço ao cidadão.",
    "Identificar, no diagrama de dependências fornecido, pelo menos três dependências ocultas que não aparecem no inventário e explicar por que razão a falha de cada uma pára um serviço.",
    "Calcular o nível de risco de cinco cenários fornecidos multiplicando probabilidade por impacto na escala de 1 a 5 e ordenar os cenários pelo resultado.",
    "Associar cada uma das seis funções do quadro NIST de segurança cibernética a pelo menos um controlo já existente ou em falta na instituição fictícia.",
  ],
  explicacao: [
    "Segurança avançada não começa por ferramentas: começa por saber o que se tem e o que se perde se aquilo falhar. Um curso avançado distingue-se de uma acção de sensibilização exactamente aqui — não ficamos pelo conselho de «usar palavras-passe fortes», passamos a trabalhar com inventário, dependências, risco medido e controlos atribuídos a pessoas com nome.",
    "A tríade clássica continua a ser o esqueleto do raciocínio: confidencialidade (quem pode ver), integridade (o dado está correcto e não foi alterado sem autorização) e disponibilidade (está acessível quando é preciso). O que muda num nível avançado é que estas três propriedades se avaliam por activo e não em geral. Em muitas situações reforçam-se umas às outras — um controlo de acesso bem feito protege confidencialidade e integridade sem custo para a disponibilidade. Noutras situações, e só nessas, é preciso ponderar entre elas: isolar um sistema para conter um ataque protege a confidencialidade e reduz ou interrompe a disponibilidade daquele serviço enquanto durar o isolamento, e pode haver formas parciais de manter o atendimento por outra via; manter um serviço no ar durante uma intrusão preserva o atendimento e pode dificultar ou comprometer a recolha de evidência. Estas ponderações dependem do contexto de cada activo e não são um conflito automático. A decisão é de gestão da instituição, que continua responsável pelo serviço, deve estar escrita antes do incidente, e é isso que se treina.",
    "Inventário de activos é a base de tudo. Sem lista de sistemas, servidores, bases de dados, contas privilegiadas e ligações a terceiros, não é possível corrigir vulnerabilidades (não se sabe onde estão), nem detectar (não se sabe o que é normal), nem recuperar (não se sabe o que restaurar primeiro). Um inventário útil tem, por cada activo: responsável nomeado, onde corre, que dados trata, de que outros activos depende e qual o tempo máximo que o serviço aguenta parado.",
    "Risco, aqui, é uma estimativa e não um número exacto. Usamos risco = probabilidade × impacto, ambos numa escala de 1 a 5, porque é simples, é defensável perante a direcção e chega para ordenar. A escala tem de estar definida por escrito: o que significa impacto 4, quantas pessoas afecta, quantas horas de paragem. Sem essa definição, cada pessoa pontua à sua maneira e a ordenação deixa de significar alguma coisa. Este método não é imposto por nenhuma lei nem por nenhuma norma: é a convenção de trabalho desta formação.",
    "Para organizar o trabalho usamos as seis funções do quadro de segurança cibernética do NIST: Governar, Identificar, Proteger, Detectar, Responder e Recuperar. É um quadro de adesão voluntária, norte-americano na origem e usado internacionalmente como linguagem comum. Não é lei moçambicana, não impõe prazos, não confere certificação e a sua adopção é uma decisão da instituição. A utilidade prática é esta: obriga a verificar se há trabalho em todas as seis funções, incluindo aquelas que a instituição ainda não olhou. No caso fictício desta lição, o trabalho está concentrado em Proteger e quase nada existe em Detectar e Recuperar; se essa distribuição se repete noutras instituições é coisa a apurar em cada levantamento, e não um dado que aqui se afirme.",
  ],
  exemplo: {
    titulo: "Caso fictício: Direcção de Serviços Digitais do distrito de Muteva",
    corpo: [
      "A Direcção de Serviços Digitais de Muteva (instituição fictícia) atende cerca de 400 pessoas por dia em dois balcões e mantém um portal de marcação de atendimento. Tem seis servidores próprios numa sala técnica, uma ligação à internet de 50 megabits com um único fornecedor, um serviço de correio electrónico contratado a um fornecedor de nuvem e uma aplicação de registo de processos desenvolvida por uma empresa externa em 2021, com contrato de manutenção terminado em Março de 2026.",
      "A equipa de informática tem três pessoas: uma responsável, um administrador de sistemas e um técnico de apoio. Não há inventário escrito. Quando se pergunta quem é responsável pela base de dados de processos, a resposta é «a empresa que fez a aplicação» — e o contrato de manutenção terminou. Note-se que o fim do contrato de manutenção não significa, por si só, que o fornecedor deixe de ter qualquer obrigação: há deveres que podem subsistir conforme o que estiver escrito no contrato e na lei aplicável, como confidencialidade, devolução de dados ou garantias. O que é certo do lado de Muteva é que a responsabilidade pelo serviço e pelos dados dos cidadãos continua a ser da instituição, e que, sem responsável nomeado internamente, ninguém está a tratar daquele activo. O alcance exacto das obrigações do fornecedor é matéria a apreciar pela área jurídica da instituição, com o contrato à frente, e não se decide nesta lição.",
      "Em Julho de 2026 o disco do servidor de ficheiros encheu e o portal de marcação deixou de aceitar pedidos durante dois dias. Ninguém tinha previsto que o portal escrevia os anexos nesse servidor: não estava em lado nenhum. Foi uma dependência oculta, e é o tipo de coisa que o inventário serve para apanhar.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Inventário parcial de activos (dados fictícios)",
    nota:
      "Ficha de trabalho. As colunas de classificação estão propositadamente vazias: são preenchidas na actividade.",
    colunas: ["Código", "Activo", "Onde corre", "Dados que trata", "Responsável", "Paragem tolerada"],
    linhas: [
      ["A-01", "Portal de marcação de atendimento", "Servidor SRV-WEB, sala técnica", "Nome, contacto, motivo do pedido", "Administrador de sistemas", "4 horas"],
      ["A-02", "Base de dados de processos", "Servidor SRV-BD, sala técnica", "Processos de cidadãos desde 2021", "Sem responsável nomeado", "2 horas"],
      ["A-03", "Servidor de ficheiros e anexos", "Servidor SRV-FIC, sala técnica", "Documentos digitalizados", "Técnico de apoio", "8 horas"],
      ["A-04", "Correio electrónico institucional", "Fornecedor de nuvem", "Correspondência interna e externa", "Responsável de informática", "4 horas"],
      ["A-05", "Directório de contas e palavras-passe", "Servidor SRV-DIR, sala técnica", "Contas de 62 funcionários", "Administrador de sistemas", "1 hora"],
      ["A-06", "Cópias de segurança em disco externo", "Armário da sala técnica", "Cópia semanal de A-02 e A-03", "Técnico de apoio", "24 horas"],
      ["A-07", "Ligação à internet (fornecedor único)", "Sala técnica", "Todo o tráfego", "Responsável de informática", "2 horas"],
      ["A-08", "Computadores de atendimento (14 postos)", "Balcões 1 e 2", "Sessões de atendimento", "Técnico de apoio", "4 horas"],
    ],
  },
  anexos: [
    {
      titulo: "Anexo B — Dependências declaradas e cinco cenários de risco (dados fictícios)",
      nota: "Material de entrada da actividade. Nada aqui corresponde a uma instituição real.",
      corpo: [
        "Dependências declaradas pela equipa: o portal (A-01) depende da base de dados (A-02) e do directório (A-05); a base de dados (A-02) depende do servidor SRV-BD e da energia da sala técnica; o correio (A-04) depende da ligação à internet (A-07); as cópias (A-06) dependem de alguém ligar o disco à sexta-feira.",
        "Cenário 1 — Falha do único disco do servidor SRV-BD, sem cópia da semana corrente. Probabilidade estimada 3, impacto estimado 5.",
        "Cenário 2 — Conta do administrador de sistemas comprometida por reutilização de palavra-passe num serviço externo. Probabilidade 4, impacto 5.",
        "Cenário 3 — Corte da ligação à internet durante um dia útil. Probabilidade 4, impacto 3.",
        "Cenário 4 — Vulnerabilidade conhecida na aplicação de processos, sem contrato de manutenção para a corrigir. Probabilidade 3, impacto 4.",
        "Cenário 5 — Disco de cópias de segurança guardado na mesma sala dos servidores, destruído no mesmo incidente que os servidores. Probabilidade 2, impacto 5.",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de três pessoas, com as fichas dos anexos A e B em papel",
    enunciado: [
      "Passo 1 (12 minutos). Classifiquem cada um dos oito activos do anexo A quanto a confidencialidade, integridade e disponibilidade, em baixo, médio ou alto. Ao lado de cada classificação alta escrevam, numa frase, a consequência concreta para o cidadão que atende ao balcão.",
      "Passo 2 (10 minutos). Desenhem o mapa de dependências a partir do anexo B e marquem a vermelho pelo menos três dependências que não constam do inventário do anexo A. A dependência do portal em relação ao servidor de ficheiros, referida no caso, é uma delas — encontrem as outras.",
      "Passo 3 (10 minutos). Calculem probabilidade × impacto para os cinco cenários e ordenem-nos do maior para o menor risco. Escrevam o que fariam primeiro se só houvesse dinheiro para tratar dois.",
      "Passo 4 (8 minutos). Associem cada uma das seis funções do quadro NIST — Governar, Identificar, Proteger, Detectar, Responder, Recuperar — a um controlo existente ou em falta nesta instituição. Assinalem as funções onde não conseguem escrever nada: são as lacunas.",
    ],
    produto:
      "Uma folha por grupo com o inventário classificado, o mapa de dependências com as ligações ocultas marcadas, os cinco cenários ordenados por risco e a grelha das seis funções com lacunas assinaladas.",
    rubrica: [
      "As classificações altas vêm acompanhadas de consequência concreta, e não de adjectivos como «crítico» sem explicação.",
      "Foram encontradas pelo menos três dependências ausentes do inventário.",
      "As contas de risco estão certas e a ordenação corresponde aos valores calculados (cenário 2 com 20, cenário 1 com 15, cenário 3 e cenário 4 com 12, cenário 5 com 10).",
      "A grelha das seis funções assinala lacunas em vez de as disfarçar; identificar que não há nada em Detectar vale mais do que inventar um controlo.",
      "O grupo reconhece por escrito que probabilidade e impacto são estimativas da equipa e não medições.",
    ],
  },
  sintese: [
    "Primeiro saber o que se tem. Sem lista de sistemas não se protege, não se detecta e não se recupera.",
    "Cada activo tem um responsável com nome. «A empresa que fez» não é responsável se o contrato acabou.",
    "Risco é probabilidade vezes impacto. É uma estimativa e serve para ordenar o que se faz primeiro.",
    "Há dependências que ninguém escreveu. São as que partem o serviço.",
    "O quadro NIST tem seis funções e serve para ver onde não estamos a fazer nada.",
  ],
  verificacao: [
    {
      pergunta:
        "A equipa diz que a base de dados de processos é da responsabilidade da empresa que desenvolveu a aplicação, cujo contrato terminou em Março de 2026. Isto resolve a atribuição de responsabilidade? Justifique.",
      resposta:
        "Não. Sem contrato em vigor não há ninguém obrigado a responder, pelo que na prática o activo está sem responsável. A instituição tem de nomear internamente um responsável e, em paralelo, decidir se renova o contrato ou se assume a manutenção.",
      feedback:
        "O erro frequente é confundir quem construiu com quem responde hoje. Responsabilidade é sempre de uma pessoa da instituição, mesmo quando o trabalho técnico está contratado.",
    },
    {
      pergunta:
        "O cenário 2 (conta de administrador comprometida) tem risco 20 e o cenário 1 (falha de disco sem cópia) tem risco 15. Significa isto que a falha de disco pode ser ignorada?",
      resposta:
        "Não. A ordenação diz o que se trata primeiro quando os recursos são limitados, não o que se deixa de tratar. O cenário 1 continua com impacto 5 e exige tratamento logo a seguir.",
      feedback:
        "Ordenar risco é decidir sequência, não é apagar linhas. Um risco alto que fica para segundo lugar tem de ficar registado com prazo.",
    },
  ],
  referencias: [NIST_CSF],
  guiao: {
    preparacao: [
      "Imprimir os anexos A e B, um por grupo, e ter folhas grandes para o mapa de dependências.",
      "Preparar a definição escrita da escala de 1 a 5 para probabilidade e impacto e projectá-la durante toda a lição.",
      "Ter à mão a lista das seis funções do quadro NIST, em cartões, para a distribuição do passo 4.",
    ],
    conducao: [
      "Apresentar os objectivos e pedir a cada pessoa que escreva, em trinta segundos, qual o sistema cuja paragem mais se nota no atendimento. Recolher três respostas em voz alta.",
      "Expor a tríade aplicada a activos concretos, o inventário mínimo útil, a fórmula de risco com a escala definida e as seis funções do quadro. Usar o caso de Muteva como fio condutor e nomear explicitamente a dependência oculta do portal.",
      "Acompanhar os grupos nos quatro passos. Insistir em consequências concretas nas classificações altas e verificar as contas de risco grupo a grupo.",
      "Dois grupos apresentam a ordenação e as lacunas encontradas. Fechar com a ideia de que a lacuna mais comum é Detectar, que é o tema do módulo 2.",
    ],
    criterios: [
      "Inventário classificado com justificação nas classificações altas.",
      "Três ou mais dependências ocultas identificadas.",
      "Contas de risco correctas e ordenação coerente.",
      "Lacunas por função assinaladas com honestidade.",
    ],
    errosComuns: [
      "Classificar tudo como alto, o que torna a classificação inútil para decidir.",
      "Somar probabilidade e impacto em vez de multiplicar, o que altera a ordenação.",
      "Tratar a estimativa como medição e apresentá-la à direcção como número exacto.",
      "Esquecer que o disco de cópias na mesma sala falha no mesmo incidente que os servidores.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M1 L2 — Gestão de vulnerabilidades e teste de intrusão autorizado (90 min)
// ---------------------------------------------------------------------------
const M1L2: ConteudoLicao = {
  objectivos: [
    "Distinguir, por escrito e com um exemplo de cada, análise de vulnerabilidades, teste de intrusão e exercício de equipa vermelha, indicando o que cada um produz e o que cada um não prova.",
    "Priorizar as dez vulnerabilidades da ficha combinando gravidade técnica, exposição do sistema e presença no catálogo de vulnerabilidades exploradas conhecidas da CISA, produzindo uma fila de tratamento justificada.",
    "Redigir as regras de compromisso de um teste autorizado, com âmbito, alvos, janela temporal, técnicas proibidas, contacto de emergência e critério de paragem imediata.",
    "Identificar, na minuta fornecida, pelo menos quatro defeitos que tornariam o teste não autorizado ou impossível de documentar.",
  ],
  explicacao: [
    "Gestão de vulnerabilidades é um processo contínuo, não uma varredura anual. Tem cinco passos que se repetem: descobrir o que existe (que só funciona se houver inventário), analisar, priorizar, corrigir ou mitigar, e verificar que a correcção ficou feita. O passo que quase sempre falha é o último. Uma vulnerabilidade marcada como «corrigida» sem nova verificação é apenas uma esperança escrita numa folha.",
    "Priorizar é o coração do assunto, porque a lista é sempre maior do que a capacidade da equipa. Três entradas comandam a fila. Primeira, a gravidade técnica, normalmente expressa por uma pontuação de 0 a 10 — é útil, mas descreve a falha em abstracto, não o nosso ambiente. Segunda, a exposição: a mesma falha num servidor publicado na internet e numa máquina de teste isolada não tem o mesmo peso. Terceira, a existência de exploração observada no mundo real; para isso usamos o catálogo de vulnerabilidades exploradas conhecidas mantido pela CISA. Estar nesse catálogo significa que já houve exploração real registada, o que sobe a prioridade. Os prazos de correcção que esse catálogo indica vinculam organismos federais dos Estados Unidos e não instituições moçambicanas: aqui é entrada de decisão, não obrigação legal.",
    "Nem tudo se corrige. Quando não há correcção disponível — por exemplo, aplicação sem contrato de manutenção — mitiga-se: restringir o acesso à rede, colocar atrás de autenticação adicional, desligar a funcionalidade afectada, aumentar a vigilância sobre aquele sistema. A mitigação fica registada com prazo e com o nome de quem a assume, senão torna-se permanente por esquecimento.",
    "Teste de intrusão ético é outra coisa. A análise de vulnerabilidades diz «este serviço parece ter esta falha»; o teste de intrusão tenta demonstrar que a falha é explorável e o que se consegue a partir dela. Três palavras definem a ética aqui: autorização, âmbito e registo. Autorização escrita e prévia da direcção, com identificação das pessoas que executam. Âmbito explícito, com a lista dos alvos permitidos e a indicação clara do que fica de fora. Registo de tudo o que se fez, com data e hora, para que qualquer efeito observado depois possa ser atribuído ou excluído. Sem estes três elementos, a mesma acção técnica deixa de ser teste e passa a ser acesso não autorizado — com as consequências disciplinares e criminais que daí vêm, a apreciar pela área jurídica da instituição e pelas autoridades, nunca pelo técnico.",
    "Um teste de intrusão também não prova o que muita gente julga. Não prova que o sistema é seguro: prova que, naquelas condições, naquele momento e dentro daquele âmbito, encontrou-se ou não se encontrou caminho. Um relatório que conclui «sistema seguro» está mal escrito. O que se escreve é o que foi testado, como, o que se encontrou, com que evidência, e o que ficou por testar.",
  ],
  exemplo: {
    titulo: "Caso fictício: pedido de teste na Direcção de Serviços Digitais de Muteva",
    corpo: [
      "A direcção de Muteva pede à equipa de informática que «faça um teste de segurança, aproveitando o fim-de-semana, para ver se alguém consegue entrar». O pedido chega por mensagem de telemóvel, sem lista de sistemas e sem indicação de horas.",
      "O administrador de sistemas propõe começar de imediato pelo portal de marcação, que está publicado na internet, e testar também o correio electrónico, que é do fornecedor de nuvem. Propõe ainda experimentar palavras-passe comuns nas contas dos colegas «para mostrar o problema à direcção».",
      "Neste pedido há pelo menos quatro problemas sérios. Testar o serviço do fornecedor de nuvem envolve infra-estrutura de terceiros, que a direcção de Muteva não pode autorizar. Experimentar palavras-passe de contas de colegas sem consentimento e sem âmbito escrito é acesso a contas alheias. Uma mensagem de telemóvel não é autorização documentada. E não há janela temporal nem critério de paragem, pelo que, se o portal cair a meio, ninguém sabe quem manda parar.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Dez vulnerabilidades detectadas na varredura de 14 de Setembro (fictícias)",
    nota:
      "Os identificadores V-01 a V-10 são internos e fictícios. A coluna «Exploração observada» indica se o caso consta do catálogo de vulnerabilidades exploradas conhecidas.",
    colunas: ["Código", "Sistema", "Exposição", "Gravidade (0–10)", "Exploração observada", "Correcção disponível"],
    linhas: [
      ["V-01", "Portal de marcação (A-01)", "Publicado na internet", "9,8", "Sim", "Sim, actualização do fornecedor"],
      ["V-02", "Servidor de base de dados (A-02)", "Rede interna", "9,1", "Sim", "Não, sem contrato de manutenção"],
      ["V-03", "Directório de contas (A-05)", "Rede interna", "8,8", "Não", "Sim, configuração"],
      ["V-04", "Servidor de ficheiros (A-03)", "Rede interna", "7,5", "Não", "Sim, actualização"],
      ["V-05", "Portal de marcação (A-01)", "Publicado na internet", "6,1", "Não", "Sim, configuração"],
      ["V-06", "Computadores de atendimento (A-08)", "Rede interna", "7,8", "Sim", "Sim, actualização"],
      ["V-07", "Equipamento de rede da sala técnica", "Rede interna", "8,2", "Não", "Sim, actualização"],
      ["V-08", "Servidor de ficheiros (A-03)", "Rede interna", "5,3", "Não", "Sim, configuração"],
      ["V-09", "Máquina de teste desligada da rede", "Isolada", "9,9", "Sim", "Sim, actualização"],
      ["V-10", "Portal de marcação (A-01)", "Publicado na internet", "4,2", "Não", "Não, aceitação de risco proposta"],
    ],
  },
  anexos: [
    {
      titulo: "Anexo B — Minuta de autorização apresentada pela equipa (com defeitos propositados)",
      nota: "Documento fictício. Contém erros deliberados que a actividade pede para encontrar.",
      corpo: [
        "«Autorização para teste de segurança. A Direcção autoriza a equipa de informática a realizar testes de segurança aos sistemas da instituição e a outros que se mostrem necessários, durante o mês de Outubro, usando as técnicas que entender adequadas, incluindo testes às contas dos funcionários e aos serviços contratados a fornecedores externos.",
        "Os resultados serão apresentados no final. Em caso de problema, a equipa resolverá internamente. Assinado: a Direcção.»",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de três pessoas, com os anexos A e B em papel",
    enunciado: [
      "Passo 1 (15 minutos). Ordenem as dez vulnerabilidades do anexo A numa fila de tratamento. Combinem gravidade, exposição e exploração observada. Escrevam, ao lado de cada uma das três primeiras, a frase que justifica a posição. Atenção a V-09: tem a gravidade mais alta da lista.",
      "Passo 2 (10 minutos). Para V-02, que não tem correcção disponível, escrevam duas mitigações concretas, com responsável e prazo, e digam como se verificaria que a mitigação está mesmo activa.",
      "Passo 3 (15 minutos). Reescrevam a minuta do anexo B em regras de compromisso utilizáveis. Devem constar: alvos permitidos por nome, alvos expressamente excluídos, janela de datas e horas, técnicas proibidas, contacto de emergência com nome e número, critério de paragem imediata, e forma de registo das acções.",
      "Ao reescrever, listem à parte os defeitos da minuta original que corrigiram.",
    ],
    produto:
      "Uma fila de tratamento justificada, duas mitigações com responsável e prazo para V-02, e uma folha de regras de compromisso completa acompanhada da lista de defeitos corrigidos.",
    rubrica: [
      "V-09 não está no topo da fila: tem gravidade 9,9 mas está numa máquina isolada, logo a exposição baixa-a.",
      "V-01 está no topo ou muito perto: está publicada na internet, tem gravidade alta e tem exploração observada.",
      "As mitigações de V-02 são accionáveis e verificáveis, não são «ter cuidado» nem «avisar os utilizadores».",
      "As regras de compromisso excluem expressamente os serviços do fornecedor de nuvem e as contas pessoais dos colegas.",
      "Foram identificados pelo menos quatro defeitos da minuta original, incluindo a autorização aberta a «outros sistemas que se mostrem necessários».",
      "O grupo escreve que a presença no catálogo da CISA é entrada de priorização e não obrigação legal em Moçambique.",
    ],
  },
  sintese: [
    "Descobrir, analisar, priorizar, corrigir, verificar. O passo esquecido é verificar.",
    "Uma falha muito grave numa máquina isolada é menos urgente do que uma falha média publicada na internet.",
    "Se já houve exploração real no mundo, a falha sobe na fila.",
    "O que não se corrige, mitiga-se com prazo e com nome. Mitigação sem prazo torna-se permanente.",
    "Teste sem autorização escrita, âmbito e registo não é teste: é acesso não autorizado.",
  ],
  verificacao: [
    {
      pergunta:
        "V-09 tem gravidade 9,9 e exploração observada, mas está numa máquina de teste desligada da rede. Deve encabeçar a fila?",
      resposta:
        "Não. A exposição é nula enquanto a máquina estiver isolada, pelo que o risco actual é baixo. Deve ficar registada e ser corrigida antes de a máquina voltar a ser ligada à rede — essa condição tem de ficar escrita.",
      feedback:
        "A pontuação de gravidade descreve a falha, não o nosso ambiente. Priorizar só pela pontuação leva a gastar a equipa onde não há risco real.",
    },
    {
      pergunta:
        "A minuta autoriza testes «a outros sistemas que se mostrem necessários». Porque é que esta frase é inaceitável?",
      resposta:
        "Porque transforma o âmbito em algo indefinido e decidido pelo próprio executante. Sem lista fechada de alvos não é possível provar depois que uma acção estava autorizada, nem excluir a equipa quando algo falha noutro sistema.",
      feedback:
        "Âmbito aberto protege ninguém e expõe quem executa. O âmbito existe para proteger a instituição e também o técnico.",
    },
  ],
  referencias: [CISA_KEV, OWASP_WSTG],
  guiao: {
    preparacao: [
      "Imprimir os anexos A e B por grupo.",
      "Preparar um exemplo projectado de regras de compromisso bem escritas, para mostrar só no fecho.",
      "Rever antecipadamente o critério de V-09, que é a armadilha pedagógica da lição.",
    ],
    conducao: [
      "Ler em voz alta o pedido da direcção por mensagem de telemóvel e perguntar à sala o que está mal. Anotar as respostas sem corrigir ainda.",
      "Expor o ciclo de gestão de vulnerabilidades, os três critérios de priorização, a diferença entre análise, teste de intrusão e equipa vermelha, e os três elementos da ética: autorização, âmbito e registo.",
      "Acompanhar a priorização e insistir em V-09 com cada grupo. No passo 3, exigir nomes e horas concretas nas regras de compromisso.",
      "Dois grupos leem as suas regras de compromisso. Comparar com o exemplo projectado e fechar com a frase: um relatório de teste nunca conclui que o sistema é seguro.",
    ],
    criterios: [
      "Fila de tratamento coerente com exposição e exploração observada.",
      "Mitigações verificáveis para a falha sem correcção.",
      "Regras de compromisso completas, com exclusões explícitas.",
      "Quatro ou mais defeitos identificados na minuta.",
    ],
    errosComuns: [
      "Ordenar apenas pela pontuação de gravidade.",
      "Incluir serviços de fornecedores externos no âmbito sem autorização desses fornecedores.",
      "Escrever mitigações vagas do tipo «reforçar a segurança».",
      "Tratar os prazos do catálogo da CISA como obrigação legal em Moçambique.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M1 L3 — Endurecimento de sistemas operativos e redes (100 min, laboratório)
// ---------------------------------------------------------------------------
const M1L3: ConteudoLicao = {
  objectivos: [
    "Identificar, na listagem de serviços fornecida, os serviços desnecessários e justificar a desactivação de cada um pelo papel declarado da máquina.",
    "Escrever regras de filtragem que apliquem negação por omissão e permitam apenas os fluxos necessários entre os três segmentos do diagrama fornecido.",
    "Executar, em máquina virtual isolada, o endurecimento de um servidor Linux: desactivar serviços, aplicar regras de filtragem e confirmar por verificação observável que o resultado é o esperado.",
    "Repor a máquina no estado inicial a partir do instantâneo, confirmando que a reversão funcionou.",
  ],
  explicacao: [
    "Endurecer um sistema é reduzir a superfície de ataque: menos serviços a ouvir, menos contas com poder, menos caminhos abertos, configurações por omissão substituídas por configurações escolhidas. O princípio de partida é simples de enunciar e difícil de manter: só existe o que é necessário para o papel declarado da máquina, e o papel tem de estar escrito antes de se começar.",
    "Em sistemas operativos, o trabalho de base é sempre o mesmo, com nomes diferentes em Linux e em Windows: remover ou desactivar serviços que não pertencem ao papel; garantir que não há contas partilhadas nem contas de antigos funcionários; separar contas de administração das contas de uso diário; exigir autenticação forte no acesso remoto; ligar o registo de eventos e enviá-lo para fora da máquina; e manter as actualizações em dia. Enviar o registo para fora da máquina é essencial e costuma faltar: quem compromete o servidor apaga os registos locais.",
    "Em redes, a regra estruturante é negação por omissão: tudo o que não está expressamente permitido é bloqueado. O contrário — permitir tudo e ir bloqueando o que incomoda — parece mais prático no primeiro dia e torna-se impossível de auditar no primeiro ano. A segunda regra é a segmentação: os postos de atendimento não precisam de falar directamente com a base de dados; falam com a aplicação, e é a aplicação que fala com a base de dados. Segmentar limita o alcance de quem entra, que é a diferença entre um posto comprometido e a instituição comprometida.",
    "A terceira ideia é a defesa em profundidade. Nenhum controlo isolado é suficiente: filtragem, endurecimento do sistema, autenticação forte, registo e cópias funcionam em camadas, para que a falha de uma não signifique o fim. Quando se avalia uma proposta técnica, pergunta-se sempre: se este controlo falhar, o que é que ainda nos protege?",
    "Uma advertência prática antes do laboratório. Aplicar regras de filtragem numa máquina remota pode cortar o próprio acesso de quem está a configurar. Por isso se trabalha com instantâneo tirado antes, com acesso de consola disponível e com uma ordem de aplicação pensada. É exactamente isto que se treina no laboratório, e é o motivo pelo qual nada disto se experimenta em máquinas de produção.",
  ],
  exemplo: {
    titulo: "Caso fictício: o servidor SRV-FIC de Muteva depois da instalação",
    corpo: [
      "O servidor de ficheiros SRV-FIC foi instalado com a configuração por omissão e nunca foi revisto. O papel declarado é um só: guardar documentos digitalizados e servi-los à aplicação de processos.",
      "A listagem de serviços a ouvir mostra, no entanto, um servidor web, uma base de dados, um serviço de impressão, acesso remoto por palavra-passe aberto a toda a rede e um serviço de transferência de ficheiros sem cifra. Nenhum destes, excepto a partilha de ficheiros usada pela aplicação, pertence ao papel declarado.",
      "Não é um caso invulgar: a maior parte das instalações por omissão traz mais do que é preciso, e o que não se usa continua a ouvir na rede, continua desactualizado e continua a ser um caminho.",
    ],
  },
  anexos: [
    {
      titulo: "Anexo A — Listagem de serviços a ouvir em SRV-FIC (saída fictícia, formato simplificado)",
      nota:
        "Saída ilustrativa preparada para a aula. Não foi recolhida de nenhum sistema real; serve de material de entrada.",
      corpo: [
        "porta 22/tcp — acesso remoto seguro — a ouvir em 0.0.0.0 — autenticação por palavra-passe activa",
        "porta 21/tcp — transferência de ficheiros sem cifra — a ouvir em 0.0.0.0",
        "porta 80/tcp — servidor web — a ouvir em 0.0.0.0 — página por omissão da instalação",
        "porta 139/tcp e 445/tcp — partilha de ficheiros — a ouvir em 0.0.0.0",
        "porta 631/tcp — serviço de impressão — a ouvir em 0.0.0.0",
        "porta 3306/tcp — base de dados — a ouvir em 0.0.0.0 — sem utilização conhecida",
        "Contas locais com sessão permitida: raiz (acesso remoto directo permitido), admin, tecnico, antigo_estagiario (última utilização há 14 meses), partilha_geral (usada por três pessoas).",
      ],
    },
    {
      titulo: "Anexo B — Segmentos de rede do laboratório e fluxos necessários (fictícios)",
      nota: "Endereçamento do laboratório, usado nas regras de filtragem.",
      corpo: [
        "Segmento A — postos de atendimento: 10.20.1.0/24.",
        "Segmento B — servidores de aplicação: 10.20.2.0/24, onde está a aplicação de processos em 10.20.2.10.",
        "Segmento C — dados: 10.20.3.0/24, onde estão SRV-FIC em 10.20.3.20 e a base de dados em 10.20.3.30.",
        "Fluxos necessários declarados: postos falam com a aplicação em 10.20.2.10 na porta 443; a aplicação fala com SRV-FIC na porta 445 e com a base de dados na porta 5432; a estação de administração 10.20.1.200 acede aos servidores por acesso remoto seguro na porta 22; todas as máquinas enviam registos para o recolector em 10.20.2.50 na porta 514.",
        "Nada mais está declarado como necessário.",
      ],
    },
  ],
  actividade: {
    formato: "em pares, com os anexos A e B em papel, antes de tocar no ambiente",
    enunciado: [
      "Passo 1 (15 minutos). Sobre o anexo A, marquem cada serviço como necessário ou desnecessário para o papel declarado de SRV-FIC e escrevam a justificação numa linha. Façam o mesmo para as contas locais, indicando o que fazer a cada uma.",
      "Passo 2 (15 minutos). Escrevam, em linguagem corrente e em forma de tabela, o conjunto de regras de filtragem para os três segmentos do anexo B: origem, destino, porta, decisão. Comecem pela regra final de negação por omissão e construam para cima. Contem quantas regras de permissão são precisas.",
      "Passo 3 (15 minutos). Escrevam a ordem de aplicação das regras numa máquina a que se acede remotamente, de modo a não perder o próprio acesso, e indiquem o que fariam se o perdessem.",
    ],
    produto:
      "Uma folha por par com a listagem anotada, a tabela de regras de filtragem com negação por omissão e a ordem de aplicação segura.",
    rubrica: [
      "Todos os serviços fora do papel declarado estão marcados para desactivação, incluindo a base de dados sem utilização conhecida.",
      "A conta do antigo estagiário é removida e a conta partilhada é substituída por contas nominais; o acesso remoto directo da conta de raiz é desactivado.",
      "A tabela de regras termina em negação por omissão e permite exactamente os fluxos declarados — cinco regras de permissão são suficientes.",
      "Os postos não têm regra directa para o segmento de dados.",
      "A ordem de aplicação prevê o risco de perder o acesso e indica a consola como recurso.",
    ],
  },
  laboratorio: {
    titulo: "Endurecer SRV-FIC numa máquina virtual isolada",
    objectivo:
      "Aplicar, num servidor Linux de laboratório, a desactivação de serviços e as regras de filtragem escritas na actividade, confirmar o resultado por verificação observável e repor o estado inicial.",
    recursos: [
      "Programa de virtualização com suporte de instantâneos (VirtualBox 7.x ou equivalente disponível na instituição), instalado e testado antes da sessão.",
      "Imagem de máquina virtual «SRV-FIC-LAB» com uma distribuição Linux de longo prazo de suporte, preparada pelo formador com os serviços do anexo A activos e com as contas indicadas.",
      "Imagem de máquina virtual «EST-ADMIN» com ferramentas de linha de comandos para listar portas abertas e testar ligações.",
      "Rede virtual interna, sem interface ligada à rede física da sala, com os três segmentos do anexo B configurados.",
      "Ficha impressa com os comandos equivalentes para a distribuição usada, entregue no início do laboratório.",
    ],
    preparacao: [
      "Copiar as duas imagens para todos os computadores no dia anterior e arrancar uma vez cada uma para confirmar que abrem.",
      "Tirar um instantâneo chamado «inicial» em ambas as máquinas, com as máquinas desligadas.",
      "Confirmar que a rede virtual está marcada como interna e que a máquina não alcança a internet nem a rede da sala: é uma verificação obrigatória antes de começar.",
      "Deixar aberta a consola da máquina no programa de virtualização, para o caso de o acesso remoto se perder.",
    ],
    passos: [
      "Arrancar SRV-FIC-LAB e EST-ADMIN e confirmar, a partir de EST-ADMIN, que as portas do anexo A estão de facto a ouvir. Registar a lista observada na folha de laboratório.",
      "Em SRV-FIC-LAB, parar e desactivar os serviços marcados como desnecessários na actividade, um a um, registando o comando usado e o resultado.",
      "Remover a conta do antigo estagiário, converter a conta partilhada em contas nominais e desactivar o acesso remoto directo da conta de raiz, deixando a conta de administração nominal com acesso.",
      "Aplicar as regras de filtragem locais pela ordem definida no passo 3 da actividade: primeiro permitir explicitamente o acesso remoto da estação de administração, só depois a negação por omissão.",
      "A partir de EST-ADMIN, repetir a listagem de portas e tentar as ligações que devem estar bloqueadas e as que devem continuar permitidas. Registar cada resultado.",
      "Confirmar que o envio de registos para o recolector continua a funcionar depois das regras aplicadas.",
    ],
    verificacaoSucesso: [
      "A nova listagem a partir de EST-ADMIN mostra apenas as portas 22 e 445 acessíveis em SRV-FIC-LAB; as portas 21, 80, 631 e 3306 deixam de responder.",
      "A ligação por acesso remoto a partir de 10.20.1.200 continua a funcionar; a partir de um posto do segmento A é recusada.",
      "A tentativa de entrar directamente com a conta de raiz é recusada, e a conta nominal de administração entra.",
      "Os registos continuam a chegar ao recolector: há linha nova com a hora da última operação.",
      "A folha de laboratório fica preenchida com as duas listagens, antes e depois, e assinada pelo par que executou.",
    ],
    reversao: [
      "Desligar a máquina e restaurar o instantâneo «inicial» nas duas máquinas virtuais.",
      "Arrancar de novo SRV-FIC-LAB e confirmar, a partir de EST-ADMIN, que as portas do anexo A voltaram a estar a ouvir: é a prova de que a reversão funcionou.",
      "Deixar as máquinas desligadas no fim da sessão.",
    ],
    alternativaOffline: [
      "Trabalhar sobre a listagem impressa do anexo A e escrever, para cada serviço e conta, o comando que seria usado e o efeito esperado.",
      "Comparar a listagem «antes» fornecida com uma listagem «depois» impressa pelo formador e identificar as diferenças, explicando cada uma.",
      "Escrever a sequência de verificação que faria a seguir e o que provaria cada teste.",
      "Registar a lição como análise documental e o laboratório como pendente, a reagendar quando houver ambiente.",
    ],
  },
  sintese: [
    "Endurecer é tirar o que não é preciso. Primeiro escreve-se para que serve a máquina.",
    "Negação por omissão: bloquear tudo e abrir só o que está na lista.",
    "Os postos não falam com a base de dados. Falam com a aplicação.",
    "Os registos saem da máquina, senão quem entra apaga-os.",
    "Antes de mexer, tirar instantâneo. Depois de mexer, verificar. No fim, repor.",
  ],
  verificacao: [
    {
      pergunta:
        "Porque é que se aplica primeiro a regra que permite o acesso remoto da estação de administração e só depois a negação por omissão?",
      resposta:
        "Porque a negação por omissão fecha tudo o que não está expressamente permitido, incluindo a ligação que está a ser usada para configurar. Permitindo primeiro o acesso da estação de administração, a sessão sobrevive à aplicação da regra final.",
      feedback:
        "Este é o erro que mais vezes deixa um servidor inacessível. Em produção, além da ordem, prepara-se acesso por consola e uma janela de reversão automática.",
    },
    {
      pergunta:
        "Executar o laboratório com sucesso significa que o servidor real de ficheiros da instituição está protegido?",
      resposta:
        "Não. Significa que o par sabe executar o procedimento num ambiente controlado. Aplicar ao servidor real exige inventário actualizado, autorização, janela de manutenção, cópia de segurança verificada e plano de reversão.",
      feedback:
        "Distinguir competência demonstrada em laboratório de alteração autorizada em produção é parte do trabalho profissional, não uma formalidade.",
    },
  ],
  referencias: [NIST_CSF],
  guiao: {
    preparacao: [
      "Confirmar, no dia anterior, que as imagens arrancam em todos os computadores e que os instantâneos «inicial» existem.",
      "Verificar que a rede virtual está isolada; não iniciar o laboratório sem essa confirmação.",
      "Imprimir a folha de laboratório com espaço para as listagens antes e depois.",
    ],
    conducao: [
      "Mostrar a listagem do anexo A projectada e perguntar quantos daqueles serviços pertencem ao papel do servidor.",
      "Expor endurecimento, negação por omissão, segmentação e defesa em profundidade, terminando com o aviso sobre perder o próprio acesso.",
      "Conduzir primeiro a parte em papel e só depois autorizar o arranque das máquinas. Circular durante o laboratório e exigir o registo das duas listagens.",
      "Dois pares mostram o antes e o depois. Fechar com a reversão feita por todos e com a distinção entre laboratório e produção.",
    ],
    criterios: [
      "Listagem anotada coerente com o papel declarado.",
      "Cinco regras de permissão e negação por omissão no fim.",
      "Verificação de sucesso observada e registada, não apenas afirmada.",
      "Reversão confirmada com nova listagem.",
    ],
    errosComuns: [
      "Aplicar a negação por omissão em primeiro lugar e perder o acesso.",
      "Desactivar a partilha de ficheiros, que é o próprio papel da máquina.",
      "Dar o laboratório por concluído sem repetir a listagem a partir da segunda máquina.",
      "Esquecer a reversão e deixar as máquinas alteradas para a turma seguinte.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M1 L4 — Identidades, acessos e criptografia aplicada (100 min, laboratório)
// ---------------------------------------------------------------------------
const M1L4: ConteudoLicao = {
  objectivos: [
    "Reatribuir os acessos das doze contas da matriz fornecida segundo privilégio mínimo, separando contas de administração de contas de uso diário e eliminando contas partilhadas.",
    "Explicar a diferença entre cifra em trânsito, cifra em repouso e resumo criptográfico, indicando qual delas protege contra que ameaça concreta.",
    "Executar, em ambiente isolado, a substituição de autenticação por palavra-passe por autenticação por chave no acesso remoto e verificar que a palavra-passe deixou de ser aceite.",
    "Verificar a integridade de um ficheiro comparando resumos criptográficos e explicar o que a coincidência prova e o que não prova.",
  ],
  explicacao: [
    "Gestão de identidades e acessos responde a quatro perguntas em cadeia: quem é a pessoa (identificação), como prova que é ela (autenticação), o que pode fazer (autorização) e onde fica escrito o que fez (registo). Falhar a última anula as três primeiras, porque sem registo não se consegue atribuir nada a ninguém.",
    "Privilégio mínimo significa cada pessoa com o acesso estritamente necessário à função, e nada mais. Na prática há três padrões que quebram isto e aparecem em quase todas as instituições: contas partilhadas, que tornam impossível saber quem fez; contas de administração usadas para o trabalho diário, que expõem o poder máximo ao correio electrónico e à navegação; e acumulação de privilégios por mudança de funções, em que a pessoa muda de serviço e leva consigo os acessos antigos. Contra o último, a única defesa que funciona é a revisão periódica de acessos, com data marcada e com o responsável de cada área a confirmar, por escrito, quem continua a precisar de quê.",
    "A autenticação multifactor continua a ser o controlo com melhor relação entre custo e efeito contra credenciais roubadas. Não é infalível: há técnicas de fadiga de aprovações, em que a pessoa aceita um pedido só para parar as notificações, e há interposição em tempo real. Isso não é argumento para não a activar; é argumento para a configurar com cuidado e para continuar a vigiar os acessos.",
    "Na criptografia aplicada, o essencial para quem administra sistemas é saber que problema cada ferramenta resolve. Cifra em trânsito protege os dados enquanto viajam na rede: sem ela, quem observa o tráfego lê o que passa. Cifra em repouso protege os dados guardados em disco: é o que evita que um disco roubado ou descartado seja lido, mas não protege nada contra quem tem sessão iniciada legitimamente no sistema. Resumo criptográfico não protege confidencialidade nenhuma — serve para detectar alteração: se um bit muda, o resumo muda.",
    "Duas advertências importantes. Primeira: palavras-passe não devem ser guardadas nem cifradas nem em texto simples, mas sim através de funções próprias para o efeito, desenhadas para serem lentas e com valor aleatório por utilizador. Segunda: o problema difícil da criptografia não é escolher o algoritmo, é gerir as chaves — onde ficam, quem lhes acede, como se substituem e o que acontece quando se perdem. Uma cópia de segurança cifrada cuja chave se perdeu é uma cópia que não existe.",
  ],
  exemplo: {
    titulo: "Caso fictício: o que a matriz de acessos de Muteva revela",
    corpo: [
      "A responsável de informática de Muteva pediu a lista de contas com acesso à base de dados de processos. Apareceram doze, para uma equipa de três pessoas.",
      "Entre elas está «partilha_geral», usada por três funcionários do balcão; «admin», usada indistintamente pelos dois técnicos; «consultor_2021», criada para a empresa que desenvolveu a aplicação e nunca desactivada; e a conta pessoal do técnico de apoio, que é simultaneamente a conta com que lê correio electrónico e a conta com poder total na base de dados.",
      "Quando se perguntou quem tinha exportado uma tabela de processos em Agosto, a resposta possível foi: alguém que usava «admin». Não se conseguiu ir mais longe. É este o custo das contas partilhadas — não é teórico, é a impossibilidade de responder.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Matriz de acessos actual (fictícia)",
    nota: "Ficha de trabalho. A coluna «Decisão» é preenchida na actividade.",
    colunas: ["Conta", "Pessoa ou grupo", "Acessos actuais", "Último uso", "Decisão"],
    linhas: [
      ["admin", "Dois técnicos, partilhada", "Poder total em todos os servidores", "Hoje", ""],
      ["partilha_geral", "Três funcionários de balcão", "Leitura e escrita no servidor de ficheiros", "Hoje", ""],
      ["consultor_2021", "Empresa externa, contrato terminado", "Poder total na base de dados", "Há 7 meses", ""],
      ["j.matola", "Técnico de apoio", "Poder total na base de dados e correio electrónico", "Hoje", ""],
      ["a.chirindza", "Administradora de sistemas", "Poder total em todos os servidores e correio", "Hoje", ""],
      ["r.sitoe", "Responsável de informática", "Leitura de registos e correio", "Hoje", ""],
      ["estagiario1", "Estagiário de 2025, já saiu", "Leitura no servidor de ficheiros", "Há 14 meses", ""],
      ["backup_svc", "Serviço automático de cópias", "Leitura em todos os servidores", "Ontem", ""],
      ["portal_svc", "Serviço do portal de marcação", "Escrita na base de dados e no servidor de ficheiros", "Hoje", ""],
      ["auditor_ext", "Auditoria externa de 2024", "Leitura em todos os servidores", "Há 20 meses", ""],
      ["balcao2", "Posto de atendimento 2, partilhada", "Sessão no posto e leitura de ficheiros", "Hoje", ""],
      ["raiz", "Conta de sistema", "Acesso remoto directo permitido", "Há 3 meses", ""],
    ],
  },
  actividade: {
    formato: "em pares, com a matriz do anexo A em papel",
    enunciado: [
      "Passo 1 (20 minutos). Preencham a coluna «Decisão» para as doze contas. As decisões possíveis são: manter como está; converter em contas nominais; reduzir privilégios, indicando quais; desactivar; ou remover. Cada decisão leva uma justificação de uma linha.",
      "Passo 2 (15 minutos). Para as duas contas de serviço (backup_svc e portal_svc), escrevam que privilégios exactos são necessários ao trabalho de cada uma e como se controlaria o segredo que as autentica.",
      "Passo 3 (10 minutos). Escrevam o procedimento de revisão periódica de acessos: com que frequência, quem confirma, o que acontece a uma conta sem confirmação e onde fica o registo da revisão.",
    ],
    produto:
      "Matriz preenchida com decisão e justificação por conta, especificação dos privilégios das duas contas de serviço e procedimento de revisão periódica.",
    rubrica: [
      "As contas partilhadas (admin, partilha_geral, balcao2) são convertidas em nominais, não apenas «reforçadas».",
      "consultor_2021, estagiario1 e auditor_ext são desactivadas ou removidas, com justificação pelo fim do vínculo.",
      "A conta j.matola perde o poder total na base de dados ou passa a ter duas contas separadas: uma de uso diário e outra de administração.",
      "As contas de serviço recebem privilégio mínimo real: backup_svc precisa de leitura, não de escrita; portal_svc não precisa de poder de administração.",
      "O procedimento de revisão indica frequência, responsável e consequência da não confirmação.",
    ],
  },
  laboratorio: {
    titulo: "Autenticação por chave e verificação de integridade",
    objectivo:
      "Substituir a autenticação por palavra-passe por autenticação por chave no acesso remoto de uma máquina de laboratório, confirmar que a palavra-passe deixou de ser aceite e verificar a integridade de um ficheiro por comparação de resumos.",
    recursos: [
      "As máquinas virtuais «SRV-FIC-LAB» e «EST-ADMIN» da lição anterior, restauradas ao instantâneo «inicial».",
      "Cliente de acesso remoto seguro e ferramenta de geração de pares de chaves, já incluídos nas imagens.",
      "Ficheiro de exercício «relatorio-fic.txt» e o seu resumo criptográfico publicado, entregues em papel e copiados para EST-ADMIN pelo formador.",
      "Segunda cópia do mesmo ficheiro, alterada num único carácter, chamada «relatorio-fic-alterado.txt».",
    ],
    preparacao: [
      "Restaurar o instantâneo «inicial» nas duas máquinas e tirar novo instantâneo chamado «antes-chaves».",
      "Colocar os dois ficheiros de exercício em EST-ADMIN e imprimir a folha com o resumo publicado do ficheiro original.",
      "Confirmar de novo que a rede virtual está isolada.",
    ],
    passos: [
      "Em EST-ADMIN, gerar um par de chaves para a conta nominal de administração, protegendo a chave privada com frase-passe.",
      "Copiar a chave pública para SRV-FIC-LAB e confirmar que a ligação por chave funciona.",
      "Em SRV-FIC-LAB, desactivar a autenticação por palavra-passe no serviço de acesso remoto e recarregar o serviço, mantendo a sessão actual aberta como rede de segurança.",
      "A partir de EST-ADMIN, numa nova sessão, tentar entrar com palavra-passe e registar o resultado; entrar em seguida com a chave e registar o resultado.",
      "Calcular o resumo criptográfico de «relatorio-fic.txt» e compará-lo, carácter a carácter, com o resumo publicado na folha.",
      "Calcular o resumo de «relatorio-fic-alterado.txt» e comparar com o publicado, registando a diferença observada.",
    ],
    verificacaoSucesso: [
      "A tentativa de entrada com palavra-passe é recusada pelo servidor, com mensagem registada na folha de laboratório.",
      "A entrada com chave é aceite e a sessão abre com a conta nominal.",
      "O resumo de «relatorio-fic.txt» coincide exactamente com o resumo publicado.",
      "O resumo de «relatorio-fic-alterado.txt» é completamente diferente, apesar de o ficheiro diferir num só carácter.",
      "A folha de laboratório regista os quatro resultados e é assinada pelo par.",
    ],
    reversao: [
      "Restaurar o instantâneo «antes-chaves» nas duas máquinas.",
      "Confirmar que a autenticação por palavra-passe voltou a ser aceite, o que prova que a reposição funcionou.",
      "Apagar as chaves geradas em EST-ADMIN antes de restaurar, se o exercício tiver usado uma pasta partilhada.",
    ],
    alternativaOffline: [
      "Trabalhar sobre a folha impressa com a configuração do serviço de acesso remoto antes e depois, identificando a linha alterada e explicando o efeito.",
      "Comparar à vista os dois resumos impressos, do ficheiro original e do alterado, e contar quantos caracteres diferem.",
      "Escrever o que a coincidência de resumos prova e o que não prova, e como se protegeria a própria lista de resumos publicada.",
      "Registar a lição como análise documental e o laboratório como pendente, a reagendar.",
    ],
  },
  sintese: [
    "Cada pessoa tem a sua conta. Conta partilhada significa que ninguém responde.",
    "Quem administra tem duas contas: uma para o trabalho do dia, outra para administrar.",
    "Rever acessos com data marcada. Quem muda de serviço não leva os acessos antigos.",
    "Cifra em trânsito protege na rede; cifra em repouso protege o disco; resumo detecta alteração.",
    "A chave perdida transforma a cópia cifrada em cópia inútil. Guardar chaves é o trabalho difícil.",
  ],
  verificacao: [
    {
      pergunta:
        "O resumo criptográfico de um ficheiro descarregado coincide com o resumo publicado no sítio de onde foi descarregado. O que é que isto prova?",
      resposta:
        "Prova que o ficheiro que está na máquina é idêntico àquele a que corresponde o resumo publicado, ou seja, que não houve alteração nem corrupção na transferência. Não prova que o ficheiro é seguro nem que o sítio é de confiança: se quem publica o ficheiro também publica o resumo, quem controlar o sítio controla os dois.",
      feedback:
        "Integridade não é autenticidade nem inocuidade. Para ganhar garantia de origem é preciso assinatura com chave de quem publica, verificada contra uma chave obtida por outro caminho.",
    },
    {
      pergunta:
        "A base de dados está cifrada em repouso. A conta j.matola, com poder total, foi comprometida. A cifra em repouso protege os dados?",
      resposta:
        "Não. A cifra em repouso protege contra acesso ao disco fora do sistema — roubo, descarte, cópia física. Quem entra com uma sessão legítima e com privilégios lê os dados já decifrados pelo próprio sistema.",
      feedback:
        "Cada controlo tem uma ameaça-alvo. Contra credencial comprometida vale privilégio mínimo, autenticação multifactor, registo e detecção — não a cifra em repouso.",
    },
  ],
  referencias: [NIST_CSF],
  guiao: {
    preparacao: [
      "Restaurar instantâneos e preparar os dois ficheiros de exercício com resumos impressos.",
      "Imprimir a matriz do anexo A por par e a folha de laboratório com quatro espaços de registo.",
      "Testar a geração de chaves numa máquina antes da sessão, para confirmar tempos.",
    ],
    conducao: [
      "Abrir com a pergunta do caso: quem exportou a tabela em Agosto? Deixar a sala concluir que não é possível saber.",
      "Expor identificação, autenticação, autorização e registo; privilégio mínimo e os três padrões que o quebram; e os três usos da criptografia com a ameaça que cada um trata.",
      "Conduzir a matriz em papel e só depois o laboratório, insistindo em manter a sessão aberta enquanto se desactiva a autenticação por palavra-passe.",
      "Dois pares apresentam a matriz decidida. Fechar com a gestão de chaves e com o caso da cópia cifrada sem chave.",
    ],
    criterios: [
      "Matriz com decisões justificadas e contas partilhadas eliminadas.",
      "Privilégios de serviço reduzidos ao necessário.",
      "Laboratório com os quatro resultados registados.",
      "Distinção correcta entre integridade e autenticidade na verificação formativa.",
    ],
    errosComuns: [
      "Manter a conta partilhada «porque é prática» e limitar-se a trocar a palavra-passe.",
      "Desactivar a autenticação por palavra-passe antes de confirmar que a chave funciona.",
      "Confundir cifrar com resumir, e propor guardar palavras-passe cifradas.",
      "Dar por seguro um ficheiro só porque o resumo coincide.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M1 L5 — Segurança da computação em nuvem (100 min)
// ---------------------------------------------------------------------------
const M1L5: ConteudoLicao = {
  objectivos: [
    "Atribuir correctamente, para os três modelos de serviço, quem responde por cada uma das dez camadas da tabela fornecida, distinguindo o que é do fornecedor e o que é da instituição.",
    "Identificar, nas cinco configurações fictícias fornecidas, as que expõem dados e propor a correcção concreta de cada uma.",
    "Escrever as cláusulas mínimas de segurança de um contrato de serviço em nuvem: localização dos dados, registos, notificação de incidente, reversibilidade e fim do contrato.",
    "Explicar por que razão «está na nuvem» não é resposta à pergunta sobre cópias de segurança e indicar o que é preciso verificar.",
  ],
  explicacao: [
    "O modelo de responsabilidade partilhada é o ponto de partida: na nuvem, parte da segurança é do fornecedor e parte é da instituição, e a fronteira muda conforme o modelo de serviço. Em infra-estrutura como serviço, o fornecedor responde pelas instalações, pelo equipamento físico e pela camada de virtualização; a instituição responde pelo sistema operativo da máquina virtual, pelas actualizações, pela configuração de rede, pelas identidades e pelos dados. Em plataforma como serviço, o fornecedor sobe também ao sistema operativo e ao ambiente de execução. Em aplicação como serviço, o fornecedor gere quase tudo — mas nunca gere por nós as contas, os privilégios, as partilhas que criamos e os dados que decidimos lá colocar.",
    "Há uma constante nos três modelos: identidades, permissões e dados são sempre da instituição. A maior parte dos incidentes conhecidos em nuvem não vem de falhas do fornecedor, mas de configuração errada do cliente — um depósito de ficheiros deixado com leitura pública, uma chave de acesso colocada dentro do código, uma conta de administração sem segundo factor, uma partilha criada «temporariamente» para qualquer pessoa com o endereço.",
    "Registos merecem atenção especial. Muitos serviços não activam por omissão o registo detalhado de acessos, ou guardam-no por poucos dias. Se ninguém activou e ninguém verificou a retenção, no dia do incidente não há o que analisar. Activar registos, definir por quanto tempo ficam e confirmar que estão mesmo a ser escritos é trabalho da instituição, não do fornecedor.",
    "No contrato, cinco pontos fazem diferença prática: onde ficam fisicamente os dados e quem lhes pode aceder; que registos o fornecedor entrega e em quanto tempo; em quanto tempo e por que via notifica um incidente; como se exportam os dados durante a vigência do contrato, num formato utilizável; e o que acontece no fim — prazo de eliminação e prova de que foi feita. Convém escrever isto antes de contratar, porque depois a margem de negociação é pequena. Estas são boas práticas contratuais e de gestão; não estamos a enunciar obrigações legais nem prazos legais moçambicanos, matéria que cabe à área jurídica da instituição verificar em concreto.",
    "Finalmente, a frase que se ouve com frequência: «está na nuvem, está seguro». Não é uma resposta. A redundância do fornecedor protege contra falha de equipamento dele; não protege contra apagamento por engano, contra alteração maliciosa feita com credenciais válidas, nem contra a perda da própria conta. A pergunta certa é: existe cópia independente, com que frequência, guardada onde, e quando foi a última vez que alguém restaurou e confirmou que o restauro funcionou?",
  ],
  exemplo: {
    titulo: "Caso fictício: a migração do correio e do arquivo de Muteva",
    corpo: [
      "Muteva contratou correio electrónico em nuvem em 2024 e, em 2026, decidiu colocar o arquivo digitalizado num serviço de armazenamento do mesmo fornecedor, para libertar espaço no servidor de ficheiros.",
      "A migração foi feita por um técnico, num fim-de-semana, com uma conta de administração criada à pressa e sem segundo factor. Para que a aplicação de processos conseguisse ler os documentos, criou-se uma partilha do depósito de arquivo acessível «a qualquer pessoa com o endereço». Funcionou logo à primeira, e ninguém voltou ao assunto.",
      "Três meses depois, a responsável perguntou quem tinha descarregado documentos do arquivo no mês anterior. O registo detalhado de acessos nunca tinha sido activado. A resposta disponível foi: não se sabe.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Camadas e responsabilidade por modelo de serviço",
    nota:
      "Ficha de trabalho: as três colunas da direita são preenchidas com «fornecedor», «instituição» ou «partilhada».",
    colunas: ["Camada", "Infra-estrutura como serviço", "Plataforma como serviço", "Aplicação como serviço"],
    linhas: [
      ["Instalações físicas e energia", "", "", ""],
      ["Equipamento e armazenamento físico", "", "", ""],
      ["Camada de virtualização", "", "", ""],
      ["Sistema operativo da máquina virtual", "", "", ""],
      ["Actualizações do sistema operativo", "", "", ""],
      ["Ambiente de execução da aplicação", "", "", ""],
      ["Código da aplicação", "", "", ""],
      ["Configuração de rede e partilhas", "", "", ""],
      ["Contas, permissões e segundo factor", "", "", ""],
      ["Dados e sua classificação", "", "", ""],
    ],
  },
  anexos: [
    {
      titulo: "Anexo B — Cinco configurações do ambiente em nuvem de Muteva (fictícias)",
      nota: "Extractos simplificados, preparados para a aula. Nenhum corresponde a um ambiente real.",
      corpo: [
        "Configuração 1 — Depósito «muteva-arquivo»: acesso de leitura concedido a «qualquer pessoa com a ligação»; contém 41 200 documentos digitalizados de processos.",
        "Configuração 2 — Conta «admin-nuvem»: função de administração total; segundo factor desactivado; usada por dois técnicos.",
        "Configuração 3 — Chave de acesso do serviço do portal: escrita directamente no ficheiro de configuração da aplicação, que está guardado no repositório de código partilhado com a empresa externa.",
        "Configuração 4 — Registo detalhado de acessos ao depósito: desactivado. Registo de autenticação: activo, com retenção de 7 dias.",
        "Configuração 5 — Cópias de segurança: «asseguradas pelo fornecedor, com redundância em três centros de dados». Não existe cópia fora da conta do fornecedor; nunca foi feito um restauro de ensaio.",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de três pessoas, com os anexos A e B em papel",
    enunciado: [
      "Passo 1 (15 minutos). Preencham a tabela do anexo A com «fornecedor», «instituição» ou «partilhada» nas três colunas. Onde escreverem «partilhada», expliquem numa linha o que cabe a cada lado.",
      "Passo 2 (20 minutos). Para cada uma das cinco configurações do anexo B, digam se expõe dados ou não, qual é o risco em concreto e qual é a correcção. A correcção tem de ser executável: quem faz, o que altera e como se confirma que ficou feito.",
      "Passo 3 (10 minutos). Escrevam as cláusulas mínimas de segurança que Muteva devia ter exigido no contrato, cobrindo localização dos dados, registos entregues, notificação de incidente, exportação durante o contrato e eliminação no fim.",
    ],
    produto:
      "Tabela de responsabilidades preenchida, cinco fichas de correcção e uma folha com as cláusulas contratuais mínimas.",
    rubrica: [
      "Nas três colunas, contas, permissões e dados ficam sempre do lado da instituição.",
      "A configuração 1 é identificada como exposição grave e a correcção substitui a partilha aberta por acesso concedido à identidade da aplicação.",
      "A configuração 3 é tratada como segredo exposto: além de retirar a chave do código, prevê-se a substituição da chave, porque o que esteve no repositório deve considerar-se comprometido.",
      "A configuração 5 é identificada como ausência de cópia independente; a redundância do fornecedor não é aceite como resposta.",
      "As cláusulas contratuais são apresentadas como boas práticas de gestão, sem invocar prazos legais inexistentes.",
    ],
  },
  sintese: [
    "Na nuvem, parte da segurança é do fornecedor e parte é nossa. Contas, permissões e dados são sempre nossos.",
    "A maior parte dos problemas vem de configuração nossa, não de falha do fornecedor.",
    "Partilha «para qualquer pessoa com a ligação» é partilha pública.",
    "Chave dentro do código é chave comprometida: retirar e substituir.",
    "Redundância do fornecedor não é cópia de segurança. Cópia só conta se já foi restaurada e verificada.",
  ],
  verificacao: [
    {
      pergunta:
        "O fornecedor garante redundância em três centros de dados. A instituição precisa de cópias de segurança próprias?",
      resposta:
        "Sim. A redundância protege contra falha de equipamento do fornecedor, replicando também os apagamentos e as alterações feitas com credenciais válidas. Contra erro humano, acção maliciosa ou perda de acesso à conta é precisa cópia independente, com restauro de ensaio verificado.",
      feedback:
        "Replicação e cópia respondem a problemas diferentes. Quando a pergunta for «e se apagarmos por engano?», a redundância não ajuda.",
    },
    {
      pergunta:
        "Retirou-se a chave de acesso do ficheiro de configuração guardado no repositório. Está resolvido?",
      resposta:
        "Não. A chave esteve acessível a quem tinha o repositório e pode ter ficado no histórico. Tem de ser substituída por uma nova, guardada num cofre de segredos, e devem rever-se os registos de utilização da chave antiga.",
      feedback:
        "Segredo exposto é segredo queimado. A regra é substituir, não esconder.",
    },
  ],
  referencias: [NIST_CSF, CISA_KEV],
  guiao: {
    preparacao: [
      "Imprimir os anexos A e B por grupo.",
      "Preparar a tabela de responsabilidades já preenchida, para projectar apenas no fecho.",
      "Ter presente que este é um tema onde as pessoas trazem experiências reais: aceitar exemplos, sem identificar instituições.",
    ],
    conducao: [
      "Contar o caso da migração de Muteva e perguntar quem responde por cada erro cometido.",
      "Expor o modelo de responsabilidade partilhada nos três modelos de serviço, as configurações erradas mais frequentes, registos e retenção, e os cinco pontos do contrato.",
      "Acompanhar o preenchimento e exigir correcções executáveis no passo 2; verificar que a configuração 3 leva substituição de chave.",
      "Dois grupos apresentam correcções. Projectar a tabela preenchida e fechar com a pergunta sobre o último restauro verificado.",
    ],
    criterios: [
      "Tabela coerente nos três modelos.",
      "Cinco correcções executáveis, com forma de confirmação.",
      "Cláusulas contratuais completas nos cinco pontos.",
      "Nenhuma afirmação de obrigação legal inventada.",
    ],
    errosComuns: [
      "Atribuir ao fornecedor a responsabilidade pelas permissões e pelos dados.",
      "Corrigir a partilha aberta tornando-a «não listada», o que não a fecha.",
      "Aceitar a redundância como cópia de segurança.",
      "Prometer prazos legais de notificação que não estão verificados.",
    ],
  },
};

export const LICOES_M1: Record<string, ConteudoLicao> = {
  m1l1: M1L1,
  m1l2: M1L2,
  m1l3: M1L3,
  m1l4: M1L4,
  m1l5: M1L5,
};
