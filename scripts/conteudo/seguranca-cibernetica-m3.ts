/**
 * Módulo 3 — Continuidade, Incidentes e Conformidade. Cinco lições.
 * Casos, instituições, endereços, registos e números: todos fictícios.
 */
import type { ConteudoLicao } from "./seguranca-cibernetica-base";
import { NIST_CSF, CISA_KEV, OWASP_WSTG } from "./seguranca-cibernetica-base";

// ---------------------------------------------------------------------------
// M3 L1 — Plano de resposta e cadeia de custódia (90 min)
// ---------------------------------------------------------------------------
const M3L1: ConteudoLicao = {
  objectivos: [
    "Preencher as sete secções obrigatórias de um plano de resposta a incidentes para a instituição fictícia, com nomes de funções, contactos alternativos e critérios de accionamento.",
    "Definir os níveis de gravidade e, para cada um, quem decide, em quanto tempo se reúne a equipa e quem é informado.",
    "Escrever o procedimento de preservação de evidência que acompanha o plano, com ordem de recolha, registo de custódia e regra de trabalho sobre cópias.",
    "Identificar, no plano fictício fornecido, pelo menos cinco lacunas que o tornariam inútil numa madrugada.",
  ],
  explicacao: [
    "Um plano de resposta a incidentes serve para tirar decisões do momento de pânico e passá-las para um momento de calma. Se durante o incidente for preciso discutir quem manda, o plano falhou antes de começar. Sete secções resolvem a maior parte: âmbito e definição do que conta como incidente; funções e responsabilidades com nomes; níveis de gravidade e critérios de accionamento; contactos e canais alternativos; procedimentos por tipo de incidente; preservação de evidência; e comunicação, interna e externa.",
    "Funções, não pessoas apenas: coordenação do incidente, análise técnica, comunicação, ligação à direcção, registo cronológico. Numa equipa de três pessoas, uma acumula funções — o que importa é que esteja escrito quem acumula o quê e quem substitui cada um. Um plano com um único nome em todas as linhas falha no dia em que essa pessoa está de férias ou é ela própria a conta comprometida.",
    "Canais alternativos são frequentemente esquecidos. Se o incidente afecta o correio electrónico institucional, convocar a equipa por correio institucional não funciona. O plano tem de indicar um segundo canal acordado, com números de telefone verificados, e essa lista tem de existir em papel, porque pode não haver acesso aos sistemas.",
    "A preservação de evidência entra no plano e não num documento à parte, porque as decisões de contenção afectam a evidência. A regra escrita antes: recolher primeiro o volátil, calcular resumo criptográfico no momento, trabalhar sobre cópias, preencher a folha de custódia por peça. Quando houver hipótese de consequências disciplinares ou de participação às autoridades, quem decide é a direcção com apoio jurídico; a equipa técnica recolhe, preserva e documenta, e não decide sozinha nem antecipa qualificações jurídicas.",
    "Por fim, um plano que nunca foi ensaiado é uma intenção. O ensaio de mesa, de noventa minutos, com um cenário e as pessoas reais, revela em cada edição o mesmo tipo de problemas: contactos desactualizados, ninguém sabe onde estão as cópias, ninguém tem acesso fora do horário, e a lista de sistemas críticos não existe. É trabalho barato com retorno alto.",
  ],
  exemplo: {
    titulo: "Caso fictício: o plano de Muteva, aprovado em 2023 e nunca usado",
    corpo: [
      "Muteva tem um plano de resposta a incidentes de quatro páginas, aprovado em 2023. Define incidente como «qualquer evento que afecte os sistemas», nomeia como responsável «o sector de informática» e manda «comunicar de imediato à direcção».",
      "Não tem níveis de gravidade, não tem contactos, não diz quem decide fora do horário, não fala de evidência e não indica onde estão as cópias de segurança. Na madrugada de 3 de Setembro, ninguém o abriu — e, se o tivesse aberto, não teria encontrado uma única instrução accionável.",
      "Não é um plano mau por falta de vontade: é um plano escrito para ser aprovado, e não para ser usado. A diferença nota-se nos detalhes aborrecidos: nomes, números, horas e critérios.",
    ],
  },
  anexos: [
    {
      titulo: "Anexo A — Plano de resposta actual de Muteva (extracto fictício com lacunas)",
      nota: "Material de entrada. Contém lacunas deliberadas que a actividade pede para encontrar.",
      corpo: [
        "«1. Objecto. O presente plano estabelece os procedimentos a adoptar em caso de incidente informático.",
        "2. Definição. Considera-se incidente qualquer evento que afecte o normal funcionamento dos sistemas.",
        "3. Responsabilidade. Compete ao sector de informática detectar, analisar e resolver os incidentes.",
        "4. Comunicação. Todos os incidentes são comunicados de imediato à direcção.",
        "5. Recuperação. Os sistemas são repostos logo que possível, com recurso às cópias de segurança.",
        "6. Disposições finais. O presente plano é revisto sempre que necessário.»",
      ],
    },
    {
      titulo: "Anexo B — Dados da instituição para preencher o plano (fictícios)",
      nota: "Usar exclusivamente estes dados; não inventar contactos nem entidades.",
      corpo: [
        "Equipa de informática: r.sitoe (responsável, telefone 82-000-0001), a.chirindza (administradora de sistemas, 82-000-0002), j.matola (técnico de apoio, 82-000-0003).",
        "Direcção: directora de serviços (82-000-0010), chefe de gabinete (82-000-0011).",
        "Horário de funcionamento: 07h30 às 15h30, de segunda a sexta-feira. Fora deste horário não há escala definida.",
        "Sistemas críticos por ordem declarada: directório de contas, base de dados de processos, portal de marcação, servidor de ficheiros, correio electrónico.",
        "Cópias: disco externo no armário da sala técnica, cópia semanal à sexta-feira, feita manualmente pelo técnico de apoio; chave do armário com o responsável.",
        "Fornecedores: empresa de desenvolvimento da aplicação (contrato terminado), fornecedor de correio em nuvem (apoio por portal), fornecedor de internet (linha de apoio 800-000-000).",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de três pessoas, com os anexos A e B em papel",
    enunciado: [
      "Passo 1 (10 minutos). Leiam o anexo A e listem as lacunas que tornariam o plano inútil numa madrugada. Escrevam pelo menos cinco, cada uma com a consequência prática.",
      "Passo 2 (20 minutos). Escrevam as sete secções do plano novo usando apenas os dados do anexo B. Nas funções, indiquem titular e substituto. Nos níveis de gravidade, indiquem quem decide, em quanto tempo a equipa se reúne e quem é informado.",
      "Passo 3 (10 minutos). Escrevam o procedimento de preservação de evidência que acompanha o plano, em não mais de dez linhas, e a regra sobre quem decide em matéria de participação a terceiros.",
    ],
    produto:
      "Lista de lacunas com consequências, plano de sete secções preenchido com dados do anexo B e procedimento de preservação de evidência.",
    rubrica: [
      "Entre as lacunas identificadas estão a ausência de níveis de gravidade, de contactos, de decisor fora do horário, de canal alternativo e de tratamento de evidência.",
      "Cada função tem titular e substituto; nenhuma linha fica com uma só pessoa.",
      "O plano prevê canal alternativo ao correio institucional, com números do anexo B.",
      "Os níveis de gravidade têm critério observável e não apenas adjectivos.",
      "O procedimento de evidência inclui ordem de volatilidade, resumo no momento da recolha e trabalho sobre cópias.",
      "A decisão de participar a terceiros é atribuída à direcção com apoio jurídico, sem invocar prazos legais inventados.",
    ],
  },
  sintese: [
    "O plano existe para não se discutir quem manda durante o incidente.",
    "Cada função tem titular e substituto. Um nome sozinho falha no dia de férias.",
    "Se o correio estiver em baixo, o plano tem de dizer por onde se fala. Em papel.",
    "Recolher a evidência pela ordem certa faz parte do plano, não é assunto à parte.",
    "Plano nunca ensaiado é intenção. Um ensaio de mesa por ano revela sempre falhas.",
  ],
  verificacao: [
    {
      pergunta:
        "O plano diz «comunicar de imediato à direcção». Porque é que isto não chega?",
      resposta:
        "Porque não diz a quem, por que via, com que informação mínima, nem o que fazer se não houver resposta. Fora do horário, «a direcção» não é um contacto. Uma instrução accionável indica nome, número, canal alternativo e prazo para escalar.",
      feedback:
        "A qualidade de um plano mede-se pela quantidade de decisões que já não é preciso tomar durante o incidente.",
    },
    {
      pergunta:
        "Durante a recolha, a equipa percebe que o caso pode ter consequências disciplinares. O que muda no procedimento técnico?",
      resposta:
        "O procedimento técnico não muda: continua a recolher pela ordem de volatilidade, com resumos e folhas de custódia. O que muda é quem decide os passos seguintes — a direcção, com apoio jurídico — e o rigor no registo, porque a evidência pode ser examinada por terceiros.",
      feedback:
        "A equipa técnica não qualifica juridicamente nem decide participações. Recolhe, preserva e documenta, para que quem decide possa decidir com base sólida.",
    },
  ],
  referencias: [NIST_CSF],
  guiao: {
    preparacao: [
      "Imprimir os anexos A e B por grupo.",
      "Preparar um modelo de plano de sete secções, para projectar apenas no fecho.",
      "Ter presente que os grupos tendem a inventar contactos: reforçar que só se usam os dados do anexo B.",
    ],
    conducao: [
      "Ler o anexo A em voz alta, devagar, e perguntar o que fariam às 02h11 com aquele documento na mão.",
      "Expor as sete secções, funções com substitutos, níveis de gravidade, canais alternativos e preservação de evidência.",
      "Acompanhar a escrita das secções; exigir números e horas concretas e recusar formulações genéricas.",
      "Dois grupos leem os níveis de gravidade. Projectar o modelo e fechar com o ensaio de mesa anual.",
    ],
    criterios: [
      "Cinco ou mais lacunas com consequência prática.",
      "Plano com funções, substitutos, critérios e contactos.",
      "Procedimento de evidência conciso e correcto.",
      "Decisões jurídicas atribuídas a quem tem mandato.",
    ],
    errosComuns: [
      "Inventar entidades ou contactos que não constam do anexo B.",
      "Escrever níveis de gravidade sem critério observável.",
      "Esquecer o canal alternativo quando o correio está afectado.",
      "Atribuir à equipa técnica decisões que são da direcção.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M3 L2 — Comunicação inclusiva durante um incidente (90 min)
// ---------------------------------------------------------------------------
const M3L2: ConteudoLicao = {
  objectivos: [
    "Escrever três mensagens sobre o mesmo incidente — para o público no balcão, para o pessoal interno e para a direcção — mantendo os factos coerentes e adaptando o que cada destinatário precisa de saber.",
    "Aplicar critérios de acessibilidade à mensagem pública: linguagem simples, frases curtas, aviso legível impresso, leitura em voz alta e alternativa para quem não usa internet.",
    "Identificar, nos três comunicados fictícios fornecidos, as afirmações que não podem ser feitas por não estarem apuradas e reescrevê-las.",
    "Definir o calendário de actualizações e o que se diz quando ainda não há informação nova.",
  ],
  explicacao: [
    "Durante um incidente comunica-se sempre, mesmo quando não há novidades — o silêncio é preenchido por rumor. A regra que sustenta tudo é a separação entre o que se sabe, o que se está a apurar e o que se vai fazer a seguir. Misturar estas três coisas produz comunicados que envelhecem mal e que obrigam a desmentidos.",
    "Cada destinatário precisa de coisas diferentes, a partir dos mesmos factos. O cidadão no balcão precisa de saber se é atendido hoje, como, e quando voltar; não precisa de saber que servidor está em baixo. O pessoal interno precisa de saber o que não deve fazer — não usar determinado sistema, não reencaminhar mensagens, não tentar resolver por iniciativa própria — e a quem comunicar o que observar. A direcção precisa de impacto, prazo estimado, decisões pendentes e riscos. Os factos têm de ser os mesmos nas três mensagens: versões diferentes descobrem-se sempre e destroem a confiança.",
    "Acessibilidade não é um extra da comunicação de incidente; é o que determina se a informação chega. Se o portal está em baixo, publicar apenas no portal não comunica nada. A mensagem pública precisa de existir em papel afixado à entrada, em letra grande e com bom contraste, dita em voz alta por quem recebe as pessoas, com linguagem simples e frases curtas, e com uma alternativa concreta para quem não usa internet nem telemóvel. Quem tem baixa visão, quem não lê com facilidade e quem não fala a língua do aviso são exactamente as pessoas que ficam de fora quando isto é esquecido.",
    "Há afirmações que não se podem fazer nas primeiras horas, e que aparecem com frequência: «os dados não foram acedidos» quando ainda não se analisou; «o problema está resolvido» quando se está em contenção; «foi um ataque de fora» quando não está apurado; «não há risco para os cidadãos» quando não se sabe. Substituem-se por formulações verdadeiras e úteis: o que está confirmado, o que está em apuramento, e quando haverá informação nova.",
    "Por fim, a comunicação a entidades externas — reguladores, parceiros, autoridades — é decisão da direcção, com apoio jurídico, e não da equipa técnica. Esta formação não indica prazos legais nem obrigações de notificação: essa verificação faz-se em concreto, na data, com a área jurídica da instituição.",
  ],
  exemplo: {
    titulo: "Caso fictício: os avisos do dia 14 em Muteva",
    corpo: [
      "Às 10h00 do dia 14, com o incidente ainda em contenção, foi afixado à entrada um papel A4 impresso em letra pequena: «Serviços informáticos em manutenção. Agradecemos a compreensão.»",
      "Às 10h30, uma mensagem interna dizia: «Houve um ataque informático. Os dados não foram comprometidos. Já está tudo controlado.» Nenhuma destas três frases estava apurada nesse momento.",
      "No balcão, as pessoas continuavam a chegar sem saber se seriam atendidas. Quem não lia o papel — por não ver bem, por não ler com facilidade, ou por não passar pela entrada principal — não recebeu informação nenhuma. O atendimento manual em papel existia, mas ninguém o anunciou.",
    ],
  },
  anexos: [
    {
      titulo: "Anexo A — Factos apurados às 10h00 do dia 14 (fictícios)",
      nota: "Base factual comum às três mensagens. Não acrescentar nada que não conste desta lista.",
      corpo: [
        "Confirmado: uma conta de administração foi usada indevidamente na madrugada de 3 de Setembro.",
        "Confirmado: foi criada uma conta adicional com privilégios e foram exportados 41 200 registos de processos.",
        "Confirmado: houve transferência de 2,4 gigabytes para um destino externo.",
        "Confirmado: o atendimento presencial pode continuar em papel, a ritmo mais lento, nos dois balcões.",
        "Em apuramento: que dados concretos estavam nos registos exportados e se incluem documentos digitalizados.",
        "Em apuramento: se outras contas foram usadas indevidamente.",
        "Previsto: o portal de marcação em linha fica indisponível até nova informação; próxima actualização às 16h00.",
        "Não determinado: a origem e a autoria do acesso.",
      ],
    },
    {
      titulo: "Anexo B — Três comunicados propostos (fictícios, com afirmações indevidas)",
      nota: "Material de entrada para correcção.",
      corpo: [
        "Comunicado 1, para afixar: «Sistema em manutenção. Voltamos em breve.»",
        "Comunicado 2, para o pessoal: «Fomos vítimas de um ataque externo. Os dados dos cidadãos não foram acedidos. A situação está controlada e resolvida.»",
        "Comunicado 3, para a direcção: «Tudo sob controlo, sem impacto relevante. O sector de informática está a tratar do assunto e informará quando estiver concluído.»",
      ],
    },
  ],
  actividade: {
    formato: "em grupos de três pessoas, com os anexos A e B em papel",
    enunciado: [
      "Passo 1 (10 minutos). Marquem, nos três comunicados do anexo B, todas as afirmações que não são sustentadas pelo anexo A. Escrevam ao lado por que razão cada uma é indevida.",
      "Passo 2 (20 minutos). Reescrevam as três mensagens a partir dos factos do anexo A. A pública deve caber numa folha, em frases curtas, dizer se há atendimento hoje e como, e indicar quando haverá informação nova.",
      "Passo 3 (10 minutos). Escrevam a lista de verificação de acessibilidade da mensagem pública e o calendário de actualizações, incluindo a frase-tipo a usar quando, à hora marcada, ainda não houver informação nova.",
    ],
    produto:
      "Anexo B anotado, três mensagens reescritas e uma folha com a lista de acessibilidade e o calendário de actualizações.",
    rubrica: [
      "Foram marcadas, no mínimo, as afirmações «ataque externo», «dados não acedidos», «resolvida» e «sem impacto relevante».",
      "A mensagem pública diz que há atendimento presencial em papel, a ritmo mais lento, e a hora da próxima actualização.",
      "As três mensagens assentam nos mesmos factos, sem contradições entre elas.",
      "A lista de acessibilidade inclui letra grande e contraste, afixação em mais do que um ponto, leitura em voz alta por quem recebe, linguagem simples e alternativa para quem não usa internet.",
      "A frase-tipo para «sem novidades» mantém a confiança sem inventar progresso.",
      "Nenhuma mensagem afirma obrigação legal de notificação nem prazos legais.",
    ],
  },
  sintese: [
    "Separar sempre: o que se sabe, o que se está a apurar, o que se vai fazer.",
    "Mesmos factos para todos; só muda o que cada destinatário precisa de saber.",
    "Se o portal está em baixo, o aviso tem de estar em papel e ser dito em voz alta.",
    "Letra grande, frases curtas, e uma alternativa para quem não usa internet.",
    "Comunicar mesmo sem novidades, à hora prometida.",
  ],
  verificacao: [
    {
      pergunta:
        "Porque é que «os dados dos cidadãos não foram acedidos» não pode ser dito às 10h00 do dia 14?",
      resposta:
        "Porque está confirmado que 41 200 registos foram exportados e que houve transferência para fora; o que está em apuramento é o conteúdo concreto. A afirmação é contrariada pelos factos conhecidos e teria de ser desmentida mais tarde.",
      feedback:
        "Uma negação prematura custa mais do que o silêncio prudente. Diz-se o que está confirmado e o que está em apuramento, com hora da próxima actualização.",
    },
    {
      pergunta:
        "Chegou a hora da actualização prometida e não há informação nova. O que se comunica?",
      resposta:
        "Comunica-se à mesma: confirma-se que não há elementos novos, repete-se o que está em apuramento, mantém-se a informação prática sobre o atendimento e marca-se a hora seguinte.",
      feedback:
        "Cumprir a hora prometida, mesmo sem novidades, é o que sustenta a credibilidade das actualizações seguintes.",
    },
  ],
  referencias: [NIST_CSF],
  guiao: {
    preparacao: [
      "Imprimir os anexos A e B por grupo e uma folha A4 em branco para a mensagem pública.",
      "Levar um exemplo de aviso em letra grande e bom contraste para comparar no fecho.",
      "Combinar com a sala que nada é acrescentado ao anexo A.",
    ],
    conducao: [
      "Mostrar o aviso das 10h00 em letra pequena e perguntar quem, na fila, ficaria sem informação.",
      "Expor a separação entre confirmado, em apuramento e próximos passos; as necessidades de cada destinatário; e os critérios de acessibilidade.",
      "Acompanhar a reescrita e recusar qualquer afirmação não sustentada pelo anexo A.",
      "Dois grupos leem a mensagem pública em voz alta — a leitura em voz alta é o próprio teste. Fechar com a frase-tipo de «sem novidades».",
    ],
    criterios: [
      "Afirmações indevidas identificadas.",
      "Mensagens coerentes entre si e assentes nos factos.",
      "Mensagem pública legível, curta e prática.",
      "Calendário de actualizações definido.",
    ],
    errosComuns: [
      "Tranquilizar com afirmações ainda não apuradas.",
      "Escrever para o cidadão com vocabulário técnico.",
      "Publicar só no portal que está indisponível.",
      "Falhar a hora prometida por não haver novidades.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M3 L3 — Continuidade, cópias e restauro verificado (100 min, laboratório)
// ---------------------------------------------------------------------------
const M3L3: ConteudoLicao = {
  objectivos: [
    "Definir, para os cinco serviços da ficha, o tempo máximo de paragem tolerável e a perda máxima de dados tolerável, e explicar como cada valor determina a frequência das cópias.",
    "Avaliar o esquema de cópias fornecido contra a regra de três cópias, dois suportes e uma fora do local, identificando o que falha.",
    "Executar, em ambiente isolado, o restauro de uma cópia e verificar por comparação de resumos e por leitura dos dados que o restauro é íntegro e utilizável.",
    "Registar o tempo real de restauro medido e compará-lo com o tempo de paragem tolerável declarado.",
  ],
  explicacao: [
    "Continuidade responde a duas perguntas por serviço. Quanto tempo o serviço pode estar parado antes de o dano ser inaceitável? E quanta informação se pode perder, medida em tempo, desde a última cópia? A primeira determina a preparação para repor depressa; a segunda determina a frequência das cópias. Declarar quatro horas de paragem tolerável e fazer cópias uma vez por semana é uma contradição — significa aceitar perder até uma semana de trabalho.",
    "A regra prática mais conhecida é três cópias, em dois tipos de suporte diferentes, com pelo menos uma fora do local. Cada elemento cobre uma falha: várias cópias cobrem corrupção; suportes diferentes cobrem defeito comum de um tipo de suporte; a cópia fora do local cobre incêndio, inundação e furto. Hoje acrescenta-se um quarto elemento: pelo menos uma cópia inalterável ou desligada, porque software de resgate procura e cifra as cópias acessíveis a partir da rede.",
    "A parte que quase sempre falta é a verificação. Uma cópia que nunca foi restaurada é uma hipótese. Verificar tem três níveis: confirmar que o trabalho de cópia terminou sem erro; confirmar que a cópia se lê e que os resumos coincidem; e restaurar para um ambiente separado e abrir os dados, confirmando que a aplicação funciona com eles. Só o terceiro nível prova alguma coisa útil, e é o que se treina no laboratório.",
    "Continuidade não é só técnica. Um serviço público pode continuar a funcionar em modo degradado — atendimento em papel, com registo posterior — e isso tem de estar preparado: formulários impressos, sequência de números, instruções para quem atende e regra de reconciliação quando o sistema voltar. Se a reconciliação não estiver pensada, o retorno gera duplicados e perde-se informação.",
    "Finalmente, o tempo de restauro mede-se, não se estima. A primeira vez que uma equipa restaura a sério costuma demorar muito mais do que o esperado: procurar o suporte, encontrar a chave de cifra, instalar a ferramenta, esperar a cópia dos dados. Medir uma vez por ano, com cronómetro, e comparar com o tempo declarado é o exercício que torna o plano realista.",
  ],
  exemplo: {
    titulo: "Caso fictício: as cópias de Muteva vistas de perto",
    corpo: [
      "Muteva faz uma cópia semanal, à sexta-feira, para um disco externo guardado no armário da sala técnica — a mesma sala onde estão os servidores. A cópia é manual e depende de o técnico de apoio estar presente.",
      "Não há cópia fora do local, não há segundo tipo de suporte, e não há cópia desligada da rede durante a semana. A cópia de 12 de Setembro existe mas nunca foi lida. O último restauro verificado foi a 29 de Agosto.",
      "Quando se perguntou quanto tempo demoraria repor a base de dados de processos, a resposta foi «umas duas horas». Ninguém tinha cronometrado. A base tem 41 200 registos e 180 gigabytes de documentos associados.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Serviços, tolerâncias declaradas e esquema de cópias actual (fictício)",
    nota: "Ficha de trabalho. As duas últimas colunas são preenchidas na actividade.",
    colunas: ["Serviço", "Paragem tolerável declarada", "Cópia actual", "Perda máxima real", "Contradição?"],
    linhas: [
      ["Directório de contas", "1 hora", "Semanal, disco externo na sala técnica", "", ""],
      ["Base de dados de processos", "2 horas", "Semanal, disco externo na sala técnica", "", ""],
      ["Portal de marcação", "4 horas", "Semanal, disco externo na sala técnica", "", ""],
      ["Servidor de ficheiros", "8 horas", "Semanal, disco externo na sala técnica", "", ""],
      ["Correio electrónico em nuvem", "4 horas", "Nenhuma própria; redundância do fornecedor", "", ""],
    ],
  },
  actividade: {
    formato: "em grupos de três pessoas, com o anexo A em papel",
    enunciado: [
      "Passo 1 (10 minutos). Preencham as duas colunas em falta: a perda máxima real que o esquema actual permite e se há contradição com a paragem tolerável declarada. Escrevam, para os dois casos mais graves, a frequência de cópia que seria coerente.",
      "Passo 2 (10 minutos). Avaliem o esquema actual contra a regra de três cópias, dois suportes, uma fora do local, e uma inalterável ou desligada. Digam o que falha e proponham um esquema corrigido executável com os meios da instituição.",
      "Passo 3 (5 minutos). Escrevam o procedimento de atendimento em modo degradado para o balcão: que formulário, que numeração, que instruções e como se faz a reconciliação quando o sistema voltar.",
    ],
    produto:
      "Anexo A preenchido, avaliação do esquema de cópias com proposta corrigida e procedimento de modo degradado com regra de reconciliação.",
    rubrica: [
      "A perda máxima real é identificada como até sete dias em todos os serviços com cópia semanal.",
      "A contradição é assinalada em todos os serviços: nenhuma paragem tolerável declarada é compatível com cópia semanal manual.",
      "A avaliação identifica a ausência de cópia fora do local, de segundo suporte e de cópia desligada, e o facto de o disco estar na mesma sala dos servidores.",
      "O correio em nuvem é identificado como sem cópia própria; a redundância do fornecedor não é aceite como cópia.",
      "O procedimento de modo degradado inclui numeração e reconciliação, evitando duplicados no retorno.",
    ],
  },
  laboratorio: {
    minutos: 20,
    titulo: "Restaurar e verificar uma cópia, medindo o tempo real",
    objectivo:
      "Restaurar uma cópia de base de dados para um ambiente separado, verificar a integridade por resumos e a utilidade por leitura dos dados, e medir o tempo total.",
    recursos: [
      "Máquina virtual «REST-LAB» com o motor de base de dados instalado e vazio, preparada pelo formador.",
      "Ficheiro de cópia «processos-29ago.dump» com dados fictícios (1 500 registos de exercício) e o respectivo resumo criptográfico publicado em papel.",
      "Ficheiro de cópia «processos-12set.dump», propositadamente truncado, com o resumo publicado que NÃO corresponde ao ficheiro.",
      "Cronómetro ou relógio com segundos, e folha de laboratório com campos para tempo de cada etapa.",
    ],
    dependenciasPorPreparar: [
      "A máquina «REST-LAB» com o motor de base de dados instalado não é entregue com o curso.",
      "Os ficheiros «processos-29ago.dump», «processos-12set.dump» truncado e os resumos publicados são gerados pelo formador com dados fictícios; o curso entrega o procedimento, os critérios e a folha de tempos.",
      "Este laboratório ainda não foi executado numa sala com formandos nem testado pela equipa autora: os 20 minutos previstos e os resultados descritos são estimativa a confirmar na primeira execução, e devem ser corrigidos no guião depois dela.",
    ],
    preparacao: [
      "Arrancar REST-LAB no dia anterior e confirmar que o motor de base de dados inicia e que a ferramenta de restauro está disponível.",
      "Tirar instantâneo «inicial» com a base vazia.",
      "Copiar os dois ficheiros de cópia para a máquina e imprimir a folha com os dois resumos publicados.",
      "Confirmar o isolamento da rede virtual.",
    ],
    passos: [
      "Iniciar o cronómetro e registar a hora de início na folha.",
      "Calcular o resumo criptográfico de «processos-29ago.dump» e compará-lo com o publicado. Registar o resultado antes de restaurar.",
      "Restaurar essa cópia para REST-LAB, registando o tempo que a operação demora.",
      "Abrir os dados restaurados e executar três verificações de conteúdo: contar os registos, ler o registo mais antigo e ler o mais recente. Registar os três resultados.",
      "Repetir a verificação de resumo para «processos-12set.dump» e registar a não coincidência; não restaurar este ficheiro.",
      "Parar o cronómetro e registar o tempo total, desde o início até à confirmação de que os dados são legíveis.",
    ],
    verificacaoSucesso: [
      "O resumo de «processos-29ago.dump» coincide com o publicado.",
      "O restauro termina sem erro e a contagem devolve 1 500 registos.",
      "Os registos mais antigo e mais recente são legíveis e coerentes com o esperado.",
      "O resumo de «processos-12set.dump» não coincide com o publicado, e o grupo regista que essa cópia não é utilizável.",
      "O tempo total está registado em minutos e é comparado, por escrito, com as duas horas de paragem tolerável declaradas.",
    ],
    reversao: [
      "Restaurar o instantâneo «inicial» de REST-LAB, deixando a base vazia.",
      "Confirmar que a base está vazia depois da reposição.",
      "Apagar os ficheiros de cópia copiados para a máquina.",
    ],
    alternativaOffline: [
      "Comparar à vista os resumos impressos dos dois ficheiros com os resumos publicados e identificar qual não coincide.",
      "Percorrer no papel o registo de uma operação de restauro fornecida pelo formador, com as marcas de tempo de cada etapa, e somar o tempo total.",
      "Comparar esse tempo com a paragem tolerável declarada e escrever a conclusão.",
      "Registar a lição como análise documental e o laboratório como pendente, a reagendar.",
    ],
  },
  sintese: [
    "Duas perguntas por serviço: quanto tempo pode estar parado e quanta informação se pode perder.",
    "Cópia semanal com duas horas de paragem tolerável é uma contradição.",
    "Três cópias, dois suportes, uma fora do local, e uma desligada da rede.",
    "Cópia nunca restaurada é uma esperança. Restaurar e abrir os dados é que prova.",
    "Medir o tempo de restauro com relógio. A primeira vez demora sempre mais do que se pensa.",
  ],
  verificacao: [
    {
      pergunta:
        "O relatório da ferramenta diz «cópia concluída com sucesso» todas as semanas. Isto prova que a instituição consegue recuperar?",
      resposta:
        "Não. Prova que o trabalho de cópia terminou sem erro registado. Não prova que o ficheiro se lê, que está completo, que a chave de cifra existe, nem que a aplicação funciona com os dados restaurados. Só o restauro de ensaio, com leitura dos dados, prova isso.",
      feedback:
        "É exactamente o caso do ficheiro de 12 de Setembro do laboratório: a cópia existe, o relatório não acusou nada, e o ficheiro não serve.",
    },
    {
      pergunta:
        "O restauro no laboratório demorou 55 minutos com 1 500 registos. A base real tem 41 200 registos e 180 gigabytes de documentos. O que se conclui para a paragem tolerável de duas horas?",
      resposta:
        "Que a tolerância declarada não está demonstrada. O tempo cresce com o volume e com a procura do suporte e da chave, pelo que é preciso medir com dados de volume realista antes de manter as duas horas ou de as rever.",
      feedback:
        "Extrapolar linearmente também não é seguro. O valor honesto vem de uma medição com volume próximo do real, registada e datada.",
    },
  ],
  referencias: [NIST_CSF],
  guiao: {
    preparacao: [
      "Preparar os dois ficheiros de cópia, um íntegro e um truncado, com os resumos impressos.",
      "Confirmar que o restauro demora um tempo compatível com o bloco de laboratório.",
      "Imprimir o anexo A e a folha de laboratório com campos de tempo.",
    ],
    conducao: [
      "Perguntar quantas pessoas da sala restauraram uma cópia nos últimos doze meses. Registar o número no quadro.",
      "Expor as duas tolerâncias, a regra das três cópias com o quarto elemento, os três níveis de verificação e o modo degradado.",
      "Conduzir a parte em papel, depois o laboratório com cronómetro; insistir na verificação do resumo antes de restaurar.",
      "Comparar os tempos medidos pelos grupos e confrontá-los com as duas horas declaradas. Fechar com a medição anual.",
    ],
    criterios: [
      "Contradições identificadas em todos os serviços.",
      "Esquema corrigido executável com os meios existentes.",
      "Laboratório com resumos verificados e tempo medido.",
      "Comparação escrita entre tempo medido e tolerância declarada.",
    ],
    errosComuns: [
      "Restaurar sem verificar o resumo primeiro.",
      "Aceitar «cópia concluída com sucesso» como prova de recuperação.",
      "Guardar a única cópia na mesma sala dos servidores.",
      "Esquecer a reconciliação depois do atendimento em papel.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M3 L4 — Laboratório integrado: do alerta ao relatório (100 min, laboratório)
// ---------------------------------------------------------------------------
const M3L4: ConteudoLicao = {
  objectivos: [
    "Percorrer, em equipa e dentro do tempo, a sequência completa de um incidente de laboratório: alerta, triagem, recolha de evidência, contenção, decisão de recuperação e relatório.",
    "Justificar cada decisão tomada durante o exercício por referência ao que estava escrito no plano e ao que foi observado, e não por intuição.",
    "Produzir um relatório de incidente de duas páginas com cronologia, factos, evidência recolhida, decisões, estado final e recomendações.",
    "Identificar, na revisão final, pelo menos três melhorias concretas ao plano e às regras de detecção, com responsável e prazo.",
  ],
  explicacao: [
    "Esta lição não introduz matéria nova: junta o que foi trabalhado nas catorze anteriores e submete-o à prova do tempo e da pressão. A aprendizagem está na sequência completa, que raramente se experimenta antes de um incidente real.",
    "A equipa organiza-se por funções antes de começar, como definido na lição sobre o plano: coordenação, análise técnica, registo cronológico e comunicação. A função de registo é a que mais vezes é sacrificada e a que mais falta faz depois — sem cronologia escrita em tempo real, o relatório é reconstituição de memória.",
    "A triagem responde a três perguntas em poucos minutos: isto é um incidente ou um falso positivo? qual a gravidade segundo a matriz? e há algo a conter já? Não é o momento de perceber tudo; é o momento de decidir se se acorda alguém e se se corta alguma coisa.",
    "Durante o exercício, cada decisão tem de ser fundamentada e registada com hora. É aqui que se vê se as lições anteriores foram assimiladas: conter sem apagar a memória, escolher a cópia anterior ao comprometimento, trocar credenciais antes de repor, e não afirmar em comunicado o que não está apurado.",
    "O tempo é parte do exercício e não um detalhe de organização. Numa situação real há pressão de várias direcções ao mesmo tempo: a direcção quer uma resposta, os balcões querem saber se atendem, e a análise técnica ainda não tem conclusões. A disciplina que resolve isto é decidir o que é suficiente para o passo seguinte, em vez de esperar pela certeza. Contém-se com informação incompleta, comunica-se o que está confirmado, e continua-se a apurar. Quem espera pela certeza para agir perde, normalmente, a janela de contenção.",
    "O relatório final não é burocracia: é o que permite à instituição aprender e responder a quem pergunta. Duas páginas chegam, desde que tenham cronologia, factos separados de hipóteses, evidência com custódia, decisões com fundamento, estado final e recomendações com responsável e prazo. O que transforma o relatório em melhoria é a revisão feita a frio, dias depois, com a pergunta certa: não «de quem foi a culpa», mas «que condição permitiu que isto acontecesse e não fosse detectado». Culpar pessoas faz com que o incidente seguinte seja escondido; corrigir condições faz com que seja detectado mais cedo.",
  ],
  exemplo: {
    titulo: "Caso fictício: cenário do exercício — alerta das 08h47",
    corpo: [
      "Durante o exercício, o recolector de registos do laboratório gera um alerta às 08h47: cinco autenticações falhadas seguidas de sucesso na conta «j.matola», a partir de um endereço da rede de laboratório que não corresponde ao posto habitual.",
      "Minutos depois há um segundo alerta: criação de uma tarefa agendada em SRV-FIC-LAB e uma ligação de saída persistente. Os balcões do cenário estão abertos e a direcção fictícia pede informação às 09h30, a meio do exercício.",
      "O cenário é conduzido pelo formador, que entrega novos elementos em envelopes à medida que o tempo passa. Nada disto envolve sistemas reais: todo o exercício decorre nas máquinas virtuais do laboratório.",
    ],
  },
  anexos: [
    {
      titulo: "Anexo A — Envelopes do exercício (conteúdo fictício, entregue pelo formador)",
      nota: "Os grupos não abrem os envelopes antes da hora indicada pelo formador.",
      corpo: [
        "Envelope 1 (minuto 0) — Texto do alerta das 08h47 e ligação para a consola do recolector do laboratório.",
        "Envelope 2 (minuto 10) — Saída da listagem de processos de SRV-FIC-LAB, com um processo de demonstração inofensivo a correr de pasta temporária.",
        "Envelope 3 (minuto 20) — Pergunta da direcção: «temos de fechar o atendimento?», a responder por escrito em três frases.",
        "Envelope 4 (minuto 30) — Informação de que a cópia mais recente é posterior ao primeiro alerta e nunca foi restaurada.",
        "Envelope 5 (minuto 40) — Novo alerta indicando tentativa de acesso a partir de uma segunda conta.",
      ],
    },
    {
      titulo: "Anexo B — Grelha de avaliação do exercício (usada pelo formador e pelos grupos)",
      nota: "Os grupos recebem a grelha no início e avaliam-se a si próprios no fim.",
      corpo: [
        "Funções atribuídas e registo cronológico iniciado nos primeiros cinco minutos.",
        "Triagem feita com a matriz de gravidade e decisão de contenção fundamentada.",
        "Evidência recolhida pela ordem de volatilidade, com resumos e folhas de custódia.",
        "Resposta à direcção assente apenas em factos apurados.",
        "Decisão de cópia justificada e credenciais trocadas antes da reposição.",
        "Relatório entregue dentro do tempo, com as seis secções pedidas.",
      ],
    },
  ],
  actividade: {
    formato: "em equipas de quatro a cinco pessoas, com funções atribuídas, em exercício cronometrado",
    enunciado: [
      "Passo 1 (5 minutos). Atribuam funções — coordenação, análise técnica, registo cronológico, comunicação — e abram a folha de registo com a hora de início.",
      "Passo 2 (15 minutos). Conduzam o incidente à medida que os envelopes chegam. Cada decisão entra na folha com hora, fundamento e quem decidiu. A resposta à direcção é escrita, em três frases, apenas com factos apurados.",
      "Passo 3 (5 minutos). Escrevam o relatório de duas páginas com as seis secções: cronologia, factos, evidência com custódia, decisões com fundamento, estado final e recomendações com responsável e prazo.",
    ],
    produto:
      "Folha de registo cronológico completa, resposta escrita à direcção e relatório de incidente com as seis secções.",
    rubrica: [
      "O registo cronológico começou nos primeiros cinco minutos e tem horas reais, não reconstituídas no fim.",
      "A triagem usa a matriz de gravidade e não a impressão pessoal.",
      "A contenção preserva a evidência volátil quando ainda há recolha por fazer, e a escolha é justificada.",
      "A resposta à direcção não contém afirmações não apuradas.",
      "A cópia escolhida é anterior ao alerta inicial e a troca de credenciais antecede qualquer reposição.",
      "As recomendações têm responsável e prazo; recomendações sem dono não contam.",
    ],
  },
  laboratorio: {
    minutos: 20,
    titulo: "Exercício integrado nas máquinas virtuais do laboratório",
    objectivo:
      "Executar o ciclo completo de resposta num incidente simulado, usando o recolector, as máquinas e os procedimentos das lições anteriores.",
    recursos: [
      "As máquinas virtuais «SIEM-LAB», «SRV-FIC-LAB», «EST-FORENSE» e «REST-LAB» das lições anteriores, restauradas aos instantâneos iniciais.",
      "Ficheiro de registos do cenário «ensaio-integrado.log», preparado pelo formador com a sequência do exercício.",
      "Processo de demonstração inofensivo, o mesmo da lição de forense, com código-fonte disponível em papel.",
      "Envelopes do anexo A impressos e selados, folhas de registo cronológico, folhas de custódia e cronómetro.",
    ],
    dependenciasPorPreparar: [
      "Depende de todas as máquinas das lições anteriores («SIEM-LAB», «SRV-FIC-LAB», «EST-FORENSE», «REST-LAB»). Cada laboratório anterior que tenha ficado pendente reduz este exercício à parte documental correspondente.",
      "O ficheiro «ensaio-integrado.log» é montado pelo formador a partir do cenário entregue; não vem pronto com o curso.",
      "Este laboratório ainda não foi executado numa sala com formandos nem testado pela equipa autora: os 20 minutos previstos e os resultados descritos são estimativa a confirmar na primeira execução, e devem ser corrigidos no guião depois dela.",
    ],
    preparacao: [
      "Restaurar os instantâneos iniciais de todas as máquinas e confirmar que arrancam e comunicam entre si na rede isolada.",
      "Importar previamente «ensaio-integrado.log» para SIEM-LAB e confirmar que a regra criada na lição de monitorização dispara com ele.",
      "Confirmar, mais uma vez, o isolamento da rede virtual.",
      "Preparar os cinco envelopes e o relógio do exercício.",
    ],
    passos: [
      "Arrancar as máquinas e confirmar o alerta inicial no recolector, registando a hora observada.",
      "Fazer a triagem com a matriz de gravidade e decidir, por escrito, se há contenção imediata a executar.",
      "Recolher a evidência em SRV-FIC-LAB pela ordem de volatilidade, com resumos e folhas de custódia, como na lição de forense.",
      "Executar a contenção decidida — isolar a máquina na rede virtual, suspender a conta comprometida — registando hora e efeito observado.",
      "Restaurar em REST-LAB a cópia escolhida e verificar a integridade por resumo antes de a dar por boa.",
      "Encerrar o exercício com o estado final registado e o relatório escrito dentro do tempo.",
    ],
    verificacaoSucesso: [
      "O alerta inicial foi observado na consola do recolector e a hora registada coincide com a do cenário.",
      "Existem pelo menos quatro peças de evidência com folha de custódia e resumo coincidente.",
      "A contenção executada é observável: a máquina isolada deixa de comunicar e a conta suspensa deixa de autenticar.",
      "O restauro em REST-LAB conclui e a verificação de resumo confirma a integridade da cópia escolhida.",
      "O relatório de duas páginas é entregue no tempo, com as seis secções e a cronologia coerente com as folhas de registo.",
    ],
    reversao: [
      "Restaurar os instantâneos iniciais das quatro máquinas.",
      "Confirmar que o recolector volta ao estado sem regras nem ficheiros importados e que REST-LAB volta a ter a base vazia.",
      "Recolher envelopes, folhas de custódia e registos para a revisão final da lição seguinte.",
    ],
    alternativaOffline: [
      "Conduzir o exercício integralmente em mesa, com os cinco envelopes e as saídas impressas de registos, processos e ligações.",
      "Manter o cronómetro, as funções e o registo cronológico: a parte de decisão treina-se igualmente em mesa.",
      "Escrever o relatório com a evidência impressa, indicando expressamente que a recolha não foi executada em ambiente.",
      "Registar a lição como exercício de mesa e o laboratório como pendente, a reagendar.",
    ],
  },
  sintese: [
    "Primeiro distribuir funções e começar a escrever as horas. Depois pensar.",
    "Triagem: é incidente? que gravidade? há algo a cortar já?",
    "Cada decisão fica escrita com hora, motivo e quem decidiu.",
    "À direcção só se diz o que está apurado.",
    "O relatório tem cronologia, factos, evidência, decisões, estado e recomendações com dono e prazo.",
  ],
  verificacao: [
    {
      pergunta:
        "A meio do exercício a equipa percebe que não iniciou o registo cronológico. O que se faz?",
      resposta:
        "Começa-se imediatamente, marcando com clareza o que é registo em tempo real e o que é reconstituição a partir de memória e de registos das máquinas. Não se escreve reconstituição como se fosse observação directa.",
      feedback:
        "A honestidade da cronologia é o que lhe dá valor. Misturar reconstituição com observação compromete o relatório inteiro.",
    },
    {
      pergunta:
        "A equipa conseguiu conter, restaurar e escrever o relatório dentro do tempo. Pode concluir que a instituição está preparada para um incidente real?",
      resposta:
        "Não. Pode concluir que, neste cenário, com estas pessoas presentes, com o ambiente a funcionar e em horário de trabalho, a sequência foi cumprida. Um incidente real acontece com pessoas ausentes, sistemas em produção e pressão externa; o exercício mede preparação, não garante resultado.",
      feedback:
        "É a mesma distinção de todo o curso: competência demonstrada em laboratório não é o mesmo que capacidade organizacional comprovada em produção.",
    },
  ],
  referencias: [NIST_CSF, OWASP_WSTG],
  guiao: {
    preparacao: [
      "Restaurar todas as máquinas e confirmar a comunicação entre elas na rede isolada.",
      "Preparar e selar os cinco envelopes; combinar os tempos de entrega.",
      "Imprimir folhas de registo, folhas de custódia e a grelha de avaliação do anexo B.",
    ],
    conducao: [
      "Atribuir funções e arrancar o cronómetro. Não explicar o cenário: ele chega pelo envelope 1.",
      "Recordar em duas frases a matriz de gravidade e a ordem de volatilidade, e nada mais: a lição é de execução.",
      "Conduzir o exercício entregando os envelopes à hora e assumindo o papel da direcção no minuto 20.",
      "Encerrar com a grelha de auto-avaliação preenchida por cada equipa e três melhorias com dono e prazo.",
    ],
    criterios: [
      "Registo cronológico iniciado cedo e mantido.",
      "Decisões fundamentadas e coerentes com as lições anteriores.",
      "Evidência com custódia completa.",
      "Relatório entregue no tempo com as seis secções.",
    ],
    errosComuns: [
      "Mergulhar na análise técnica sem atribuir funções nem registar horas.",
      "Responder à direcção com tranquilizações não apuradas.",
      "Restaurar a cópia mais recente por ser a mais recente.",
      "Deixar as recomendações sem responsável e sem prazo.",
    ],
  },
};

// ---------------------------------------------------------------------------
// M3 L5 — Normas, políticas e melhoria contínua (100 min)
// ---------------------------------------------------------------------------
const M3L5: ConteudoLicao = {
  objectivos: [
    "Distinguir, com exemplos, norma internacional, quadro voluntário, guia técnico, política interna e obrigação legal, indicando de onde vem a força de cada um.",
    "Escrever uma política de segurança da informação de uma página com âmbito, princípios, responsabilidades, regras obrigatórias, excepções e revisão.",
    "Construir o plano de melhoria a partir das recomendações do exercício integrado, com responsável, prazo, evidência de conclusão e indicador.",
    "Definir quatro indicadores de segurança mensuráveis com os dados que a instituição realmente tem.",
  ],
  explicacao: [
    "Há que separar coisas que se confundem com frequência. Uma norma internacional é um documento técnico publicado por um organismo de normalização, cuja adopção é voluntária salvo se um contrato ou uma lei a tornar exigível. Um quadro como o de segurança cibernética do NIST organiza o trabalho em funções e também é de adesão voluntária. Um guia como o de testes de aplicações da OWASP é uma referência comunitária aberta. Uma política interna é aprovada pela direcção e vincula quem trabalha na instituição. Uma obrigação legal decorre de lei ou regulamento aplicável, e a sua identificação é matéria jurídica, a verificar em concreto com a área jurídica da instituição — esta formação não enuncia obrigações nem prazos legais moçambicanos e não confere qualquer certificação.",
    "Uma política de segurança útil cabe numa página e é lida. Precisa de âmbito (a quem e a que sistemas se aplica), princípios (privilégio mínimo, responsabilidade nominal, registo), responsabilidades por função, um conjunto curto de regras obrigatórias, um mecanismo de excepção com prazo e aprovação, e uma data de revisão. Políticas de trinta páginas com tudo lá dentro não são cumpridas nem verificadas, e a sua existência dá uma falsa sensação de cobertura.",
    "O mecanismo de excepção é o que distingue uma política aplicável de uma política ignorada. Haverá sempre casos em que a regra não pode ser cumprida — um sistema antigo que não suporta segundo factor, por exemplo. Se não existir forma de registar a excepção, com prazo e com quem a autorizou, o que acontece é o incumprimento silencioso e generalizado.",
    "Melhoria contínua faz-se com uma lista curta e viva, não com relatórios anuais. Cada linha tem: o que se vai fazer, quem, até quando, qual a evidência que prova a conclusão, e que indicador melhora. Sem evidência de conclusão, as listas enchem-se de itens «em curso» há dois anos.",
    "Os indicadores devem ser poucos e construídos com dados que existam. Quatro que costumam ser exequíveis: percentagem de sistemas críticos com cópia restaurada e verificada nos últimos noventa dias; tempo mediano entre a divulgação de uma falha grave com exploração observada e a sua correcção nos sistemas expostos; número de contas privilegiadas e quantas delas foram confirmadas na última revisão de acessos; e número de ensaios de resposta realizados no ano, com melhorias fechadas. Um indicador que ninguém consegue calcular com os dados disponíveis é um indicador inútil, por muito bem que soe em relatório.",
  ],
  exemplo: {
    titulo: "Caso fictício: o que ficou por fazer em Muteva, doze semanas depois",
    corpo: [
      "Doze semanas depois do incidente, Muteva tem uma lista de vinte e três recomendações, das quais quinze estão «em curso», seis «por iniciar» e duas concluídas. Nenhuma tem prazo e apenas quatro têm responsável.",
      "A direcção aprovou entretanto uma política de segurança de vinte e oito páginas, adaptada de um modelo encontrado na internet, que menciona certificações e procedimentos que a instituição não tem. Ninguém a leu por inteiro e nenhuma das regras é verificada.",
      "As duas recomendações concluídas foram as que tinham dono: trocar as credenciais de administração e passar a guardar uma cópia fora da sala técnica. Não é coincidência.",
    ],
  },
  tabela: {
    titulo: "Anexo A — Dez afirmações para classificar (fictícias)",
    nota:
      "Classificar cada uma como norma internacional, quadro voluntário, guia técnico, política interna, obrigação contratual ou afirmação indevida.",
    colunas: ["Afirmação", "Classificação"],
    linhas: [
      ["«O quadro de segurança cibernética do NIST organiza o trabalho em seis funções.»", ""],
      ["«A nossa instituição está certificada por aplicar o quadro NIST.»", ""],
      ["«O guia de testes da OWASP indica categorias de teste para aplicações web.»", ""],
      ["«Todos os servidores desta instituição têm de enviar registos para o recolector central.»", ""],
      ["«O catálogo de vulnerabilidades exploradas conhecidas obriga-nos a corrigir em 15 dias.»", ""],
      ["«O contrato com o fornecedor exige notificação de incidente em 24 horas.»", ""],
      ["«As normas internacionais de segurança da informação são de adopção voluntária, salvo quando exigidas por contrato ou por lei aplicável.»", ""],
      ["«Como seguimos boas práticas internacionais, estamos em conformidade legal.»", ""],
      ["«A política interna determina que contas de administração não são usadas para trabalho diário.»", ""],
      ["«Aplicar o guia da OWASP garante que a aplicação fica segura.»", ""],
    ],
  },
  actividade: {
    formato: "em grupos de três pessoas, com o anexo A e as recomendações do exercício integrado",
    enunciado: [
      "Passo 1 (10 minutos). Classifiquem as dez afirmações do anexo A e, para as que forem indevidas, escrevam a formulação correcta.",
      "Passo 2 (20 minutos). Escrevam a política de segurança de uma página para a instituição fictícia, com âmbito, princípios, responsabilidades, cinco a sete regras obrigatórias, mecanismo de excepção e data de revisão.",
      "Passo 3 (15 minutos). Transformem as recomendações que a vossa equipa escreveu no exercício integrado num plano de melhoria com responsável, prazo, evidência de conclusão e indicador associado. Definam também os quatro indicadores que a instituição consegue calcular com os dados que tem.",
    ],
    produto:
      "Anexo A classificado com correcções, política de uma página e plano de melhoria com indicadores.",
    rubrica: [
      "As afirmações 2, 5, 8 e 10 são classificadas como indevidas e reescritas: não há certificação por aplicar um quadro; o catálogo não obriga instituições moçambicanas; boas práticas não equivalem a conformidade legal; e nenhum guia garante segurança.",
      "A política cabe numa página e tem mecanismo de excepção com prazo e aprovação.",
      "As regras obrigatórias são verificáveis: cada uma permite dizer se está cumprida ou não.",
      "Cada linha do plano de melhoria tem responsável, prazo e evidência de conclusão.",
      "Os quatro indicadores são calculáveis com os dados disponíveis e o grupo diz de onde vem cada número.",
    ],
  },
  sintese: [
    "Norma, quadro, guia, política e lei são coisas diferentes. Só a política interna e a lei obrigam, cada uma à sua maneira.",
    "Aplicar um quadro internacional não dá certificação nem conformidade legal.",
    "A política cabe numa página e diz o que é obrigatório, quem responde e como se pede excepção.",
    "Sem prazo, sem dono e sem prova de conclusão, a recomendação fica «em curso» para sempre.",
    "Poucos indicadores, calculáveis com os dados que existem.",
  ],
  verificacao: [
    {
      pergunta:
        "Um relatório interno afirma que a instituição «está em conformidade por seguir boas práticas internacionais». Que problema tem esta frase?",
      resposta:
        "Confunde adesão voluntária a boas práticas com conformidade legal. Seguir um quadro internacional pode melhorar a segurança e não diz nada sobre cumprimento de leis ou contratos, que é matéria a verificar em concreto com a área jurídica.",
      feedback:
        "A frase correcta é descritiva: «adoptámos o quadro X como referência de organização do trabalho», sem qualquer conclusão jurídica.",
    },
    {
      pergunta:
        "Um sistema antigo não suporta autenticação multifactor, exigida pela política. Qual é o caminho correcto?",
      resposta:
        "Registar uma excepção formal, com justificação técnica, medidas compensatórias — restringir o acesso à rede, reduzir o número de contas, reforçar a vigilância — prazo de validade e aprovação de quem tem mandato, com data de reavaliação.",
      feedback:
        "Excepção registada é gestão; excepção silenciosa é incumprimento. A diferença está em existir prazo e alguém que a autorizou.",
    },
  ],
  referencias: [NIST_CSF, CISA_KEV, OWASP_WSTG],
  guiao: {
    preparacao: [
      "Imprimir o anexo A por grupo e recolher as recomendações produzidas na lição anterior.",
      "Levar um exemplo de política de uma página, para projectar apenas no fecho.",
      "Preparar a lista dos quatro indicadores exequíveis, para comparação final.",
    ],
    conducao: [
      "Ler o caso das vinte e três recomendações e perguntar quais foram concluídas e porquê.",
      "Expor a distinção entre norma, quadro, guia, política e lei; a estrutura da política de uma página; excepções; e indicadores calculáveis.",
      "Acompanhar a escrita da política, recusando regras não verificáveis, e o plano de melhoria, exigindo dono e prazo em cada linha.",
      "Dois grupos leem a política. Projectar o exemplo e fechar o curso com a lista de melhorias e a data da próxima revisão.",
    ],
    criterios: [
      "Classificações correctas e reformulação das afirmações indevidas.",
      "Política de uma página com excepções e revisão.",
      "Plano de melhoria com dono, prazo e evidência.",
      "Indicadores calculáveis com dados existentes.",
    ],
    errosComuns: [
      "Afirmar conformidade ou certificação por seguir referências internacionais.",
      "Escrever políticas longas e não verificáveis.",
      "Definir indicadores que ninguém consegue calcular.",
      "Deixar melhorias sem dono, repetindo o problema do caso.",
    ],
  },
};

export const LICOES_M3: Record<string, ConteudoLicao> = {
  m3l1: M3L1,
  m3l2: M3L2,
  m3l3: M3L3,
  m3l4: M3L4,
  m3l5: M3L5,
};
