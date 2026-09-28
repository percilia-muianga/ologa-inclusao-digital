/**
 * Banco privado — Segurança Cibernética Avançada — Módulo 3 «Continuidade,
 * Incidentes e Conformidade» (ordem 143). 23 itens de exame final.
 * Matriz por lição, tipo e dificuldade: docs/matriz-banco-seguranca-cibernetica.md.
 * Casos, instituições e números FICTÍCIOS. Rascunho por validar pela Ologa/ATDI.
 */
import { FONTE_NIST, type QuestaoSC } from "./seguranca-cibernetica-questoes-tipos";

const L1: QuestaoSC[] = [
  {
    cod: "SC-M3L1-01", m: "m3", l: 1, t: "em", d: "f",
    e: "Qual é a principal razão para ter um plano de resposta a incidentes escrito e aprovado antes de qualquer incidente?",
    opts: [
      "Evitar discutir quem decide e como se comunica no momento em que o incidente acontece",
      "Cumprir uma formalidade exigida a todas as instituições pelo quadro do NIST",
      "Permitir que a equipa técnica actue sem informar a direcção em nenhum caso",
      "Substituir as cópias de segurança por procedimentos de recuperação manuais",
    ], ind: 0,
    exp: "O plano existe para que as decisões sobre funções, comunicação e accionamento já estejam tomadas. O quadro do NIST é voluntário e não impõe formalidades legais.",
    obj: "Preencher as secções de um plano de resposta a incidentes. M3 L1.",
  },
  {
    cod: "SC-M3L1-02", m: "m3", l: 1, t: "em", d: "di",
    e: "Um plano de resposta indica para cada função um nome, um endereço de correio institucional e o telefone fixo do gabinete. Que lacuna é mais grave numa madrugada de incidente em que o correio está entre os sistemas afectados?",
    opts: [
      "A falta da lista dos sistemas críticos atribuídos a cada função da equipa",
      "A falta de substituto e de contacto alternativo que não dependa dos sistemas afectados",
      "A falta de indicação do cargo de cada pessoa no organigrama da instituição",
      "A falta de um modelo de relatório final a preencher depois do incidente",
    ], ind: 1,
    exp: "De madrugada o telefone do gabinete não atende e o correio está afectado: ninguém é alcançado. A lista de sistemas e o modelo de relatório são lacunas reais, mas menos urgentes; sem substituto e sem contacto por outra via, o plano falha logo no primeiro passo.",
    obj: "Identificar lacunas que tornariam um plano inútil. M3 L1.",
  },
  {
    cod: "SC-M3L1-03", m: "m3", l: 1, t: "vf", d: "f",
    e: "Verdadeiro ou falso: sem registo de cadeia de custódia, uma evidência tecnicamente correcta pode deixar de servir para processos disciplinares ou judiciais.",
    val: true,
    exp: "Verdadeiro. A cadeia de custódia regista quem recolheu, quando, como e por que mãos passou a evidência. Sem esse registo, a integridade da evidência não pode ser demonstrada.",
    obj: "Escrever o procedimento de preservação de evidência com registo de custódia. M3 L1.",
  },
  {
    cod: "SC-M3L1-04", m: "m3", l: 1, t: "cor", d: "me",
    e: "Associe cada campo do registo de cadeia de custódia ao que documenta.",
    pares: [
      { esquerda: "Resumo criptográfico calculado na recolha", direita: "Estado do item no momento em que foi recolhido" },
      { esquerda: "Identificação de quem recolheu", direita: "Pessoa que responde pela recolha" },
      { esquerda: "Transferências com data e assinatura", direita: "Passagem do item entre pessoas ou locais" },
      { esquerda: "Local e condições de guarda", direita: "Onde o item esteve e quem lhe podia aceder" },
    ],
    exp: "Juntos, estes campos permitem demonstrar que o item analisado é o mesmo que foi recolhido e que não foi alterado.",
    obj: "Escrever o procedimento de preservação de evidência. M3 L1.",
  },
  {
    cod: "SC-M3L1-05", m: "m3", l: 1, t: "em", cen: true, d: "di",
    e: "Caso fictício. Durante a recolha de evidência num posto do serviço de finanças de Cuamba, a equipa percebe que o caso pode vir a ter consequências disciplinares para um funcionário. O que deve mudar no procedimento técnico?",
    opts: [
      "Nada no procedimento técnico, mas a partir daí o rigor da custódia e da documentação passa a ser decisivo",
      "A recolha deve parar até a área jurídica decidir se o funcionário pode ser informado",
      "O funcionário deve ser chamado para assistir à recolha e assinar o registo técnico",
      "A equipa deve apagar os dados pessoais não relacionados antes de continuar a recolha",
    ], ind: 0,
    exp: "O procedimento correcto já é o mesmo para qualquer caso: ordem de recolha, resumos, cópias de trabalho e custódia. Perante possíveis consequências disciplinares, o rigor dessa documentação torna-se decisivo e a área jurídica é envolvida, mas a técnica não se altera nem se destroem dados.",
    obj: "Aplicar a preservação de evidência com vista a uso posterior. M3 L1.",
  },
];

const L2: QuestaoSC[] = [
  {
    cod: "SC-M3L2-01", m: "m3", l: 2, t: "em", d: "f",
    e: "Numa comunicação sobre um incidente em curso, que estrutura ajuda a não afirmar mais do que está apurado?",
    opts: [
      "Separar o que se sabe, o que se está a apurar e o que se vai fazer",
      "Começar pelas causas prováveis e só depois descrever os efeitos observados",
      "Usar termos técnicos precisos, para evitar interpretações erradas pelo público",
      "Esperar pelo relatório final antes de comunicar qualquer informação",
    ], ind: 0,
    exp: "Separar factos, apuramento e acções evita afirmações não verificadas. Esperar pelo relatório final deixa as pessoas sem informação durante dias.",
    obj: "Escrever mensagens coerentes para destinatários diferentes. M3 L2.",
  },
  {
    cod: "SC-M3L2-02", m: "m3", l: 2, t: "em", d: "me",
    e: "O portal de atendimento está em baixo por causa de um incidente. Qual das medidas torna o aviso ao público acessível a quem não usa internet?",
    opts: [
      "Publicar o aviso nas redes sociais da instituição com letra grande",
      "Afixar o aviso impresso em letra grande no balcão e dizê-lo em voz alta a quem chega",
      "Enviar o aviso por correio electrónico a todos os cidadãos que se registaram anteriormente no portal",
      "Colocar o aviso na página inicial do portal assim que este voltar a funcionar",
    ], ind: 1,
    exp: "Se o canal digital falhou, o aviso tem de chegar por meios que não dependam dele: papel legível e voz no local, com linguagem simples.",
    obj: "Aplicar critérios de acessibilidade à mensagem pública. M3 L2.",
  },
  {
    cod: "SC-M3L2-03", m: "m3", l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: quando chega a hora de uma actualização prometida e não há informação nova, deve-se adiar a comunicação até haver novidades.",
    val: false,
    exp: "Falso. Comunica-se à hora prometida, dizendo que ainda não há novidade, o que se está a fazer e quando será a próxima actualização. O silêncio cria desconfiança e rumores.",
    obj: "Definir o calendário de actualizações. M3 L2.",
  },
  {
    cod: "SC-M3L2-04", m: "m3", l: 2, t: "cor", d: "me",
    e: "Associe cada afirmação feita cedo num incidente à razão pela qual não deve ser feita sem apuramento.",
    pares: [
      { esquerda: "«Os dados não foram acedidos»", direita: "A análise dos registos ainda não terminou" },
      { esquerda: "«O problema está resolvido»", direita: "A situação ainda está em contenção" },
      { esquerda: "«Foi um ataque de fora»", direita: "A origem ainda não está determinada" },
      { esquerda: "«Não há risco para os cidadãos»", direita: "O impacto sobre os dados ainda é desconhecido" },
    ],
    exp: "Cada afirmação antecipa uma conclusão que depende de trabalho ainda não feito. Se se revelar falsa, a credibilidade da instituição é afectada.",
    obj: "Identificar afirmações não apuradas e reescrevê-las. M3 L2.",
  },
  {
    cod: "SC-M3L2-05", m: "m3", l: 2, t: "em", cen: true, d: "me",
    e: "Caso fictício. O serviço de emissão de licenças de Montepuez sofreu um incidente às 07h40. Às 10h00, a equipa sabe que o sistema foi isolado e que há actividade anormal numa conta de administração; ainda não sabe se houve acesso a dados pessoais. Qual das frases pode ser dita ao público às 10h00?",
    opts: [
      "«Os dados dos cidadãos estão protegidos e não foram acedidos.»",
      "«O serviço foi alvo de um ataque externo, já neutralizado pela equipa.»",
      "«O serviço está suspenso; estamos a apurar se houve acesso a dados e daremos nova informação às 13h00.»",
      "«O problema foi resolvido e o serviço volta a funcionar ainda hoje de manhã.»",
    ], ind: 2,
    exp: "Às 10h00 apenas se sabe que o serviço está suspenso e que se está a apurar. As outras frases afirmam factos não verificados: ausência de acesso, origem externa e resolução.",
    obj: "Escrever mensagens públicas sem afirmações não apuradas. M3 L2.",
  },
];

const L3: QuestaoSC[] = [
  {
    cod: "SC-M3L3-01", m: "m3", l: 3, t: "em", d: "f",
    e: "O que indica a perda máxima de dados tolerável de um serviço?",
    opts: [
      "O tempo máximo que o serviço pode estar parado antes de causar dano grave",
      "O volume total de dados que o serviço guarda nos seus servidores",
      "O intervalo de informação recente que se pode perder sem dano inaceitável",
      "O número de cópias de segurança que devem ser guardadas fora do local",
    ], ind: 2,
    exp: "A perda máxima tolerável mede quanta informação recente se pode perder; determina a frequência das cópias. O tempo de paragem tolerável é outra medida.",
    obj: "Definir paragem e perda máximas toleráveis por serviço. M3 L3.",
  },
  {
    cod: "SC-M3L3-02", m: "m3", l: 3, t: "em", d: "f",
    e: "Qual das configurações cumpre a regra de três cópias, dois suportes e uma fora do local?",
    opts: [
      "Dados no servidor, uma cópia no mesmo disco e outra numa pasta partilhada do mesmo servidor",
      "Dados no servidor, uma cópia em disco externo na sala e outra noutro edifício",
      "Dados no servidor e duas cópias em dois discos externos guardados na mesma gaveta",
      "Dados no servidor e uma cópia num serviço de sincronização que replica apagamentos",
    ], ind: 1,
    exp: "Três cópias (original e duas), em pelo menos dois suportes diferentes, com uma fora do local. A lição acrescenta que uma deve estar desligada da rede.",
    obj: "Avaliar esquemas de cópias contra a regra 3-2-1. M3 L3.",
  },
  {
    cod: "SC-M3L3-03", m: "m3", l: 3, t: "vf", d: "me",
    e: "Verdadeiro ou falso: um restauro pode considerar-se verificado logo que o programa de restauro termina sem erros, mesmo que ninguém abra nem compare os dados restaurados.",
    val: false,
    exp: "Falso. Terminar sem erros diz que o processo correu, não que os dados estão íntegros e utilizáveis. A verificação exige comparar resumos e abrir ou ler os dados restaurados.",
    obj: "Verificar a integridade e utilidade de um restauro. M3 L3.",
  },
  {
    cod: "SC-M3L3-04", m: "m3", l: 3, t: "cor", d: "di",
    e: "Associe cada serviço fictício à frequência mínima de cópia coerente com a perda máxima tolerável indicada.",
    pares: [
      { esquerda: "Perda tolerável de 1 hora", direita: "Cópia pelo menos de hora a hora" },
      { esquerda: "Perda tolerável de 1 dia", direita: "Cópia pelo menos diária" },
      { esquerda: "Perda tolerável de 1 semana", direita: "Cópia pelo menos semanal" },
      { esquerda: "Perda tolerável de 15 minutos", direita: "Replicação ou registo contínuo de transacções" },
    ],
    exp: "O intervalo entre cópias não pode ser maior do que a perda tolerável. Abaixo da hora, cópias periódicas deixam de ser práticas e recorre-se a registo contínuo ou replicação, sem dispensar cópias restauráveis.",
    obj: "Explicar como a perda máxima tolerável determina a frequência das cópias. M3 L3.",
  },
  {
    cod: "SC-M3L3-05", m: "m3", l: 3, t: "em", cen: true, d: "di",
    e: "Caso fictício. No laboratório, o restauro de uma cópia do sistema de processos de Lichinga, com 1 500 registos e sem documentos anexos, demorou 55 minutos. A base real tem 41 200 registos e 180 gigabytes de documentos. O tempo máximo de paragem tolerável declarado é de 2 horas. Qual é a conclusão correcta?",
    opts: [
      "O objectivo de 2 horas está cumprido, porque 55 minutos é menos de metade desse tempo",
      "O ensaio não permite concluir que as 2 horas se cumprem; é preciso medir um restauro com volume real",
      "O objectivo está cumprido desde que o restauro real seja feito no mesmo equipamento",
      "O objectivo é impossível de cumprir e deve ser aumentado para 24 horas sem mais medições",
    ], ind: 1,
    exp: "O volume real é cerca de 27 vezes maior em registos e inclui 180 gigabytes de documentos que o ensaio não tinha. O resultado não extrapola; é preciso medir com volume representativo antes de decidir se as 2 horas são realistas.",
    obj: "Comparar o tempo real de restauro com a paragem tolerável declarada. M3 L3.",
  },
];

const L4: QuestaoSC[] = [
  {
    cod: "SC-M3L4-01", m: "m3", l: 4, t: "cor", d: "me",
    e: "Associe cada secção do relatório de incidente produzido no laboratório integrado ao que deve conter.",
    pares: [
      { esquerda: "Cronologia", direita: "Acontecimentos e decisões com hora" },
      { esquerda: "Factos observados", direita: "O que foi visto e verificado, separado de hipóteses" },
      { esquerda: "Estado final", direita: "Situação dos sistemas no fecho do exercício" },
      { esquerda: "Recomendações", direita: "Melhorias com responsável e prazo" },
    ],
    exp: "O relatório separa o que foi observado do que se supõe e termina com recomendações atribuídas e datadas, para que possam ser acompanhadas.",
    obj: "Produzir um relatório de incidente com cronologia, factos, decisões e recomendações. M3 L4.",
  },
  {
    cod: "SC-M3L4-02", m: "m3", l: 4, t: "em", cen: true, d: "me",
    e: "Caso fictício. No laboratório integrado do curso, uma equipa de Chimoio percebe, 25 minutos depois do alerta inicial, que ainda não iniciou o registo cronológico. O que deve fazer?",
    opts: [
      "Continuar o exercício e reconstituir a cronologia de memória no fim, quando houver tempo",
      "Recomeçar o exercício desde o alerta, para que a cronologia fique completa",
      "Iniciar já o registo, reconstituir os primeiros 25 minutos com as horas disponíveis e assinalar essa reconstituição",
      "Omitir a cronologia no relatório, explicando que a equipa se concentrou na contenção",
    ], ind: 2,
    exp: "O registo começa de imediato; o período anterior reconstitui-se a partir de fontes com hora (registos, mensagens) e fica identificado como reconstituído. Omitir ou adiar degrada a fiabilidade do relatório.",
    obj: "Justificar decisões do exercício por referência ao plano e ao observado. M3 L4.",
  },
  {
    cod: "SC-M3L4-03", m: "m3", l: 4, t: "vf", cen: true, d: "di",
    e: "Caso fictício. Uma equipa do serviço provincial de Inhambane conteve, restaurou e entregou o relatório dentro dos 100 minutos do laboratório integrado, com 3 máquinas virtuais e dados de ensaio. Verdadeiro ou falso: este resultado permite concluir que a instituição está preparada para um incidente real.",
    val: false,
    exp: "Falso. O exercício mostra a capacidade da equipa num ambiente controlado e reduzido. Um incidente real envolve mais sistemas, dados reais, pressão, dependências e comunicação externa. O exercício deve gerar melhorias, não uma declaração de preparação.",
    obj: "Identificar melhorias ao plano a partir do exercício integrado. M3 L4.",
  },
];

const L5: QuestaoSC[] = [
  {
    cod: "SC-M3L5-01", m: "m3", l: 5, t: "em", d: "f",
    e: "Qual destes documentos obriga directamente o pessoal de uma instituição pública, pela sua própria natureza?",
    opts: [
      "Um guia técnico internacional de testes de aplicações",
      "Um quadro voluntário de segurança cibernética",
      "A política de segurança da informação aprovada pela própria instituição",
      "Uma norma internacional ainda não adoptada por contrato nem por lei",
    ], ind: 2,
    exp: "A política interna aprovada obriga o pessoal da instituição, e a lei obriga pela sua força própria. Normas, quadros e guias são voluntários salvo se um contrato, uma política ou uma lei os tornar exigíveis.",
    obj: "Distinguir norma, quadro, guia, política interna e obrigação legal. M3 L5.",
  },
  {
    cod: "SC-M3L5-02", m: "m3", l: 5, t: "em", d: "me",
    e: "A política de segurança da instituição exige cifra de disco em todos os computadores. Um computador que controla um equipamento de laboratório, fornecido pelo fabricante, perde o suporte técnico se o disco for cifrado. Qual é o caminho correcto?",
    opts: [
      "Retirar a exigência da política, porque não pode ser cumprida por todos os computadores",
      "Manter o computador sem registo nenhum, até ser substituído no próximo ciclo orçamental",
      "Pedir uma excepção formal, com medidas compensatórias, responsável, prazo e revisão",
      "Cifrar o disco na mesma e negociar depois com o fabricante a reposição do suporte",
    ], ind: 2,
    exp: "A política prevê excepções formais: justificadas, com medidas que compensem o risco, com dono e com prazo de revisão. Alterar a política ou ignorar o caso esvazia a regra.",
    obj: "Escrever uma política com regras obrigatórias e regime de excepções. M3 L5.",
  },
  {
    cod: "SC-M3L5-03", m: "m3", l: 5, t: "vf", d: "f",
    e: "Verdadeiro ou falso: seguir o quadro de segurança cibernética do NIST confere à instituição certificação e conformidade legal.",
    val: false,
    exp: "Falso. Aplicar um quadro voluntário organiza o trabalho, mas não dá certificação nem conformidade com a lei. Essa leitura jurídica cabe à área jurídica da instituição.",
    obj: "Situar quadros voluntários face à certificação e à lei. M3 L5.",
    fonte: FONTE_NIST,
  },
  {
    cod: "SC-M3L5-04", m: "m3", l: 5, t: "cor", d: "me",
    e: "Associe cada elemento de uma recomendação do plano de melhoria à sua função.",
    pares: [
      { esquerda: "Responsável", direita: "Pessoa que responde pela execução" },
      { esquerda: "Prazo", direita: "Data até à qual a acção deve estar concluída" },
      { esquerda: "Evidência de conclusão", direita: "Prova verificável de que a acção foi feita" },
      { esquerda: "Indicador", direita: "Medida que mostra o efeito da acção ao longo do tempo" },
    ],
    exp: "Sem responsável, prazo e evidência, a recomendação fica «em curso» para sempre; sem indicador, não se sabe se teve efeito.",
    obj: "Construir o plano de melhoria com responsável, prazo, evidência e indicador. M3 L5.",
  },
  {
    cod: "SC-M3L5-05", m: "m3", l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício. A direcção de uma instituição de Tete quer um indicador de gestão de vulnerabilidades. Os dados disponíveis são: data de detecção e data de correcção de cada vulnerabilidade crítica; não há registo de horas de trabalho da equipa. No último trimestre houve 8 vulnerabilidades críticas, 6 corrigidas em menos de 15 dias e 2 corrigidas em 40 dias. Qual é o indicador calculável com estes dados e o seu valor?",
    opts: [
      "Horas médias da equipa por vulnerabilidade corrigida: 12 horas por correcção",
      "Percentagem de críticas corrigidas em menos de 15 dias: 75 %",
      "Custo médio por vulnerabilidade corrigida: 20 000 meticais por correcção",
      "Percentagem de críticas corrigidas em menos de 15 dias: 60 %",
    ], ind: 1,
    exp: "Com datas de detecção e correcção calcula-se a percentagem corrigida dentro do prazo: 6 em 8 = 75 %. As alternativas com horas e custos usam dados que a instituição não regista, pelo que não são calculáveis; a de 60 % tem a conta errada.",
    obj: "Definir indicadores mensuráveis com os dados que existem. M3 L5.",
  },
];

export const EXAME_SC_M3: QuestaoSC[] = [...L1, ...L2, ...L3, ...L4, ...L5];
