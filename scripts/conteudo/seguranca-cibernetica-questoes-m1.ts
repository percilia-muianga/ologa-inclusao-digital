/**
 * Banco privado — Segurança Cibernética Avançada — Módulo 1 «Gestão Avançada
 * do Risco Cibernético» (ordem 141). 24 itens de exame final.
 * Matriz: L1–L4 = em 2, vf 1, cor 1, cen 1 (f 2, me 2, di 1); L5 = em 2, vf 1, cen 1 (f 2, me 1, di 1).
 * Casos, instituições e números FICTÍCIOS. Rascunho por validar pela Ologa/ATDI.
 */
import { FONTE_KEV, FONTE_NIST, FONTE_WSTG, type QuestaoSC } from "./seguranca-cibernetica-questoes-tipos";

const L1: QuestaoSC[] = [
  {
    cod: "SC-M1L1-01", m: "m1", l: 1, t: "em", d: "f",
    e: "No quadro de segurança cibernética do NIST, versão estudada na lição, qual das funções abaixo trata de estabelecer a estratégia, os papéis, as políticas e a supervisão da gestão do risco?",
    opts: ["Identificar", "Governar", "Proteger", "Recuperar"], ind: 1,
    exp: "Governar é a função que enquadra as restantes: estratégia, papéis, políticas e supervisão. Identificar trata do conhecimento de activos e riscos; Proteger, das salvaguardas; Recuperar, do restabelecimento após incidente.",
    obj: "Associar as seis funções do quadro NIST a controlos da instituição. M1 L1.",
    fonte: FONTE_NIST,
  },
  {
    cod: "SC-M1L1-02", m: "m1", l: 1, t: "em", d: "me",
    e: "A equipa de uma direcção provincial classificou o registo de certidões emitidas. Qual das justificações sustenta correctamente a classificação de integridade «alta»?",
    opts: [
      "O registo contém nomes e números de documento que não devem ser divulgados a terceiros",
      "Uma alteração não detectada num registo faz emitir certidões com dados errados ao cidadão",
      "O servidor que guarda o registo fica fora de serviço várias vezes por mês",
      "O registo é consultado diariamente por muitos funcionários de balcão",
    ], ind: 1,
    exp: "Integridade responde à pergunta «o que acontece se o dado for alterado sem autorização ou por erro?». Divulgação indevida é confidencialidade; paragens são disponibilidade; o volume de consultas não classifica nenhuma das três.",
    obj: "Classificar activos em confidencialidade, integridade e disponibilidade com consequência concreta. M1 L1.",
  },
  {
    cod: "SC-M1L1-03", m: "m1", l: 1, t: "vf", d: "f",
    e: "Verdadeiro ou falso: aplicar o quadro de segurança cibernética do NIST numa instituição moçambicana cria, por si, uma obrigação legal nacional para essa instituição.",
    val: false,
    exp: "Falso. O quadro do NIST é de adesão voluntária, norte-americano na origem, e serve de linguagem comum. Não é lei moçambicana; só se torna exigível se um contrato ou uma norma interna o adoptar.",
    obj: "Situar o quadro NIST como referência voluntária. M1 L1.",
    fonte: FONTE_NIST,
  },
  {
    cod: "SC-M1L1-04", m: "m1", l: 1, t: "cor", d: "me",
    e: "Associe cada situação da instituição fictícia à propriedade de segurança que é principalmente afectada.",
    pares: [
      { esquerda: "Lista de beneficiários enviada por engano para um endereço externo", direita: "Confidencialidade" },
      { esquerda: "Montante de um pagamento alterado na base sem registo de quem o fez", direita: "Integridade" },
      { esquerda: "Portal de marcações inacessível durante um dia de atendimento", direita: "Disponibilidade" },
      { esquerda: "Operação feita com conta partilhada, sem se saber quem a executou", direita: "Responsabilização" },
    ],
    exp: "Cada situação liga-se à consequência dominante: divulgação, alteração, indisponibilidade e impossibilidade de atribuir uma acção a uma pessoa.",
    obj: "Relacionar consequências concretas com propriedades de segurança. M1 L1.",
  },
  {
    cod: "SC-M1L1-05", m: "m1", l: 1, t: "em", cen: true, d: "di",
    e: "Caso fictício. Na Direcção de Serviços Digitais de Chiquera, a escala de risco é probabilidade × impacto, de 1 a 5 cada. Cenário A: roubo de credenciais do administrador, probabilidade 3, impacto 5. Cenário B: falha do único disco do servidor de ficheiros, probabilidade 4, impacto 4. Cenário C: inundação da sala técnica, probabilidade 1, impacto 5. Qual é a ordem de tratamento que resulta da escala, do maior para o menor risco?",
    opts: ["A (15), B (16), C (5)", "B (16), A (15), C (5)", "A (15), C (5), B (16)", "B (16), C (5), A (15)"], ind: 1,
    exp: "B = 4 × 4 = 16; A = 3 × 5 = 15; C = 1 × 5 = 5. A ordem é B, A, C. O valor é uma estimativa para ordenar; não significa que C possa ser ignorado.",
    obj: "Calcular o nível de risco por probabilidade × impacto e ordenar cenários. M1 L1.",
  },
];

const L2: QuestaoSC[] = [
  {
    cod: "SC-M1L2-01", m: "m1", l: 2, t: "em", d: "f",
    e: "Qual é a diferença essencial entre uma análise de vulnerabilidades e um teste de intrusão?",
    opts: [
      "A análise identifica falhas prováveis; o teste tenta explorá-las para demonstrar o impacto real",
      "A análise é sempre manual; o teste é sempre feito com ferramentas automáticas de terceiros",
      "A análise dispensa autorização escrita; o teste precisa dela apenas quando o alvo está na internet",
      "A análise cobre só servidores; o teste cobre só aplicações web e os respectivos utilizadores",
    ], ind: 0,
    exp: "A análise de vulnerabilidades inventaria falhas prováveis; o teste de intrusão tenta explorá-las, dentro de um âmbito autorizado, para demonstrar o que um atacante conseguiria. Ambos exigem autorização escrita.",
    obj: "Distinguir análise de vulnerabilidades, teste de intrusão e equipa vermelha. M1 L2.",
    fonte: FONTE_WSTG,
  },
  {
    cod: "SC-M1L2-02", m: "m1", l: 2, t: "em", d: "me",
    e: "Duas vulnerabilidades têm a mesma gravidade técnica, 7,5. A primeira está num servidor exposto à internet e consta do catálogo de vulnerabilidades exploradas conhecidas da CISA; a segunda está num posto interno sem acesso à internet e não consta do catálogo. Qual é a decisão mais defensável?",
    opts: [
      "Tratar as duas no mesmo dia, porque a gravidade técnica é igual",
      "Tratar primeiro a do posto interno, porque é mais fácil de corrigir",
      "Tratar primeiro a do servidor exposto, pela exposição e pela exploração já observada",
      "Adiar as duas até haver uma versão corrigida para ambas as máquinas",
    ], ind: 2,
    exp: "A prioridade combina gravidade, exposição e evidência de exploração real. Com gravidade igual, a exposição à internet e a presença no catálogo da CISA colocam a primeira à frente.",
    obj: "Priorizar vulnerabilidades por gravidade, exposição e exploração conhecida. M1 L2.",
    fonte: FONTE_KEV,
  },
  {
    cod: "SC-M1L2-03", m: "m1", l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: um teste de intrusão feito sem autorização escrita, sem âmbito definido e sem registo das acções deixa de ser teste e passa a ser acesso não autorizado.",
    val: true,
    exp: "Verdadeiro. A autorização escrita, o âmbito e o registo são o que distingue um teste legítimo de um acesso não autorizado, mesmo com boas intenções.",
    obj: "Reconhecer as condições de legitimidade de um teste autorizado. M1 L2.",
  },
  {
    cod: "SC-M1L2-04", m: "m1", l: 2, t: "cor", d: "me",
    e: "Associe cada elemento das regras de compromisso de um teste autorizado ao seu propósito.",
    pares: [
      { esquerda: "Âmbito e lista de alvos", direita: "Delimitar exactamente que sistemas podem ser tocados" },
      { esquerda: "Janela temporal", direita: "Fixar quando o teste pode decorrer" },
      { esquerda: "Técnicas proibidas", direita: "Excluir acções que possam degradar o serviço" },
      { esquerda: "Critério de paragem imediata", direita: "Definir quando se interrompe e se avisa o contacto de emergência" },
    ],
    exp: "Cada elemento responde a um risco do teste: tocar em sistemas fora do âmbito, testar fora de horas acordadas, degradar o serviço ou continuar quando algo corre mal.",
    obj: "Redigir regras de compromisso com âmbito, janela, proibições e paragem. M1 L2.",
  },
  {
    cod: "SC-M1L2-05", m: "m1", l: 2, t: "em", cen: true, d: "di",
    e: "Caso fictício. A minuta de autorização de um teste ao portal de licenças de Ribáuè tem: alvo «portal-licencas.exemplo.mz e outros sistemas que se revelem relevantes»; janela «a combinar»; assinatura do técnico que vai testar; contacto de emergência em branco. Qual é a apreciação correcta?",
    opts: [
      "Serve, desde que o técnico registe as acções num relatório entregue no fim do teste",
      "Serve para o portal, mas não para os outros sistemas, que exigem outro documento",
      "Não serve só porque falta a janela; os restantes elementos estão aceitáveis como estão",
      "Não serve: âmbito aberto, janela indefinida, falta de assinatura de quem autoriza e sem contacto",
    ], ind: 3,
    exp: "A minuta tem quatro defeitos: âmbito aberto, janela indefinida, assinada por quem executa e não por quem tem poder para autorizar, e sem contacto de emergência. Com qualquer deles, o teste não fica autorizado nem documentável.",
    obj: "Identificar defeitos que tornam um teste não autorizado ou impossível de documentar. M1 L2.",
  },
];

const L3: QuestaoSC[] = [
  {
    cod: "SC-M1L3-01", m: "m1", l: 3, t: "em", d: "f",
    e: "O que significa aplicar «negação por omissão» numa política de filtragem entre segmentos de rede?",
    opts: [
      "Bloquear tudo e abrir apenas os fluxos que constam da lista de fluxos necessários",
      "Permitir tudo e bloquear apenas os endereços que já causaram problemas no passado",
      "Bloquear só o tráfego que vem da internet e deixar livre o tráfego entre segmentos",
      "Registar todo o tráfego sem bloquear nada até existir um alerta confirmado",
    ], ind: 0,
    exp: "Negação por omissão significa que o que não está expressamente permitido está bloqueado. As outras opções são listas de bloqueio parciais, que deixam passar o que ninguém previu.",
    obj: "Escrever regras de filtragem com negação por omissão. M1 L3.",
  },
  {
    cod: "SC-M1L3-02", m: "m1", l: 3, t: "em", d: "me",
    e: "Um servidor tem como papel declarado servir apenas a aplicação de gestão documental. A listagem mostra também um serviço de impressão partilhada, um servidor de correio local e o acesso remoto de administração. Que decisão segue o princípio do endurecimento?",
    opts: [
      "Manter os três serviços, porque desactivá-los pode afectar utilizadores desconhecidos",
      "Desactivar o acesso remoto, porque é o serviço mais visado em ataques conhecidos",
      "Desactivar impressão e correio, sem papel declarado, e restringir o acesso remoto à estação de administração",
      "Desactivar os três serviços e administrar a máquina apenas presencialmente na sala",
    ], ind: 2,
    exp: "Endurecer é retirar o que não serve o papel declarado e restringir o que é necessário. O acesso remoto é preciso para administrar, mas limitado à origem autorizada.",
    obj: "Justificar a desactivação de serviços pelo papel declarado da máquina. M1 L3.",
  },
  {
    cod: "SC-M1L3-03", m: "m1", l: 3, t: "vf", d: "f",
    e: "Verdadeiro ou falso: guardar os registos de um servidor apenas no próprio servidor é suficiente, porque quem invade raramente os altera.",
    val: false,
    exp: "Falso. Apagar ou alterar registos locais é prática comum de quem invade. Os registos devem ser enviados para fora da máquina, para um destino que o atacante não controle.",
    obj: "Justificar o envio dos registos para fora da máquina. M1 L3.",
  },
  {
    cod: "SC-M1L3-04", m: "m1", l: 3, t: "cor", d: "me",
    e: "Associe cada passo do laboratório de endurecimento ao seu propósito.",
    pares: [
      { esquerda: "Tirar instantâneo antes de mexer", direita: "Permitir repor o estado inicial" },
      { esquerda: "Permitir a origem da administração antes da regra de negação", direita: "Evitar perder o acesso remoto durante a mudança" },
      { esquerda: "Verificar a partir de outra máquina", direita: "Confirmar de forma observável o efeito das regras" },
      { esquerda: "Repor o instantâneo no fim", direita: "Devolver o laboratório ao ponto de partida" },
    ],
    exp: "A ordem protege contra o bloqueio acidental e a verificação observável mostra o efeito real; a reposição garante que o ambiente fica como estava.",
    obj: "Executar e reverter o endurecimento em ambiente isolado. M1 L3.",
  },
  {
    cod: "SC-M1L3-05", m: "m1", l: 3, t: "vf", cen: true, d: "di",
    e: "Caso fictício. Numa instituição de Mocuba há três segmentos: postos de trabalho, servidores de aplicação e servidor de base de dados. A política proposta permite aos postos o acesso à aplicação na porta 443, permite à aplicação o acesso à base de dados na porta 5432, permite aos postos o acesso directo à base de dados na porta 5432 «para relatórios» e nega tudo o resto. Verdadeiro ou falso: esta política cumpre o princípio de que os postos falam com a aplicação e não com a base de dados.",
    val: false,
    exp: "Falso. A terceira regra abre o acesso directo dos postos à base de dados, o que contraria o princípio estudado. Os relatórios devem passar pela aplicação ou por um serviço próprio, não por acesso directo dos postos.",
    obj: "Aplicar a segmentação entre postos, aplicação e base de dados. M1 L3.",
  },
];

const L4: QuestaoSC[] = [
  {
    cod: "SC-M1L4-01", m: "m1", l: 4, t: "em", d: "f",
    e: "Qual é a prática de gestão de acessos recomendada para quem administra sistemas?",
    opts: [
      "Usar uma única conta com todos os poderes, para não esquecer credenciais",
      "Partilhar a conta de administração com o colega de turno para cobrir ausências",
      "Pedir poderes de administração apenas por telefone e anotá-los num caderno",
      "Ter uma conta para o trabalho diário e outra, separada, só para administrar",
    ], ind: 3,
    exp: "Separar a conta de uso diário da conta de administração reduz a exposição dos poderes elevados. Conta partilhada impede saber quem fez o quê.",
    obj: "Reatribuir acessos segundo privilégio mínimo e separação de contas. M1 L4.",
  },
  {
    cod: "SC-M1L4-02", m: "m1", l: 4, t: "em", d: "me",
    e: "Um ficheiro de instalação foi descarregado e o seu resumo criptográfico coincide com o resumo publicado na mesma página de onde foi descarregado. O que se pode concluir?",
    opts: [
      "Que o ficheiro está livre de software malicioso e pode ser instalado sem mais análise",
      "Que o ficheiro recebido é igual ao publicado nessa página, mas não que a página é fidedigna",
      "Que o ficheiro foi assinado pelo fabricante e que a assinatura é válida e verificada",
      "Que a ligação usada no descarregamento estava cifrada de ponta a ponta sem falhas",
    ], ind: 1,
    exp: "O resumo coincidente prova que o ficheiro recebido é igual ao que a página publica. Se a página tiver sido alterada, o ficheiro e o resumo podem ter sido trocados juntos. Não prova ausência de código malicioso nem assinatura.",
    obj: "Explicar o que a coincidência de resumos prova e o que não prova. M1 L4.",
  },
  {
    cod: "SC-M1L4-03", m: "m1", l: 4, t: "vf", d: "f",
    e: "Verdadeiro ou falso: se a chave de uma cópia de segurança cifrada se perder, a cópia torna-se inutilizável, mesmo estando íntegra.",
    val: true,
    exp: "Verdadeiro. Sem a chave, os dados cifrados não se recuperam. Por isso a guarda e a recuperação das chaves são parte do plano de cópias.",
    obj: "Relacionar a gestão de chaves com a utilidade da cifra. M1 L4.",
  },
  {
    cod: "SC-M1L4-04", m: "m1", l: 4, t: "cor", d: "me",
    e: "Associe cada mecanismo criptográfico à ameaça contra a qual protege.",
    pares: [
      { esquerda: "Cifra em trânsito", direita: "Intercepção dos dados enquanto atravessam a rede" },
      { esquerda: "Cifra em repouso", direita: "Leitura de um disco ou cópia retirados do local" },
      { esquerda: "Resumo criptográfico", direita: "Alteração não detectada de um ficheiro" },
      { esquerda: "Autenticação por chave no acesso remoto", direita: "Adivinhação repetida de palavras-passe" },
    ],
    exp: "Cada mecanismo cobre uma ameaça diferente; nenhum substitui os outros. A cifra em repouso, por exemplo, não protege contra uma conta legítima comprometida.",
    obj: "Distinguir cifra em trânsito, cifra em repouso e resumo criptográfico. M1 L4.",
  },
  {
    cod: "SC-M1L4-05", m: "m1", l: 4, t: "em", cen: true, d: "di",
    e: "Caso fictício. A matriz de acessos de um serviço de Manica tem 12 contas: 2 contas partilhadas «balcao1» e «balcao2», usadas por 6 pessoas; 1 conta de administração usada no dia-a-dia pelo técnico; e 9 contas individuais, das quais 2 pertencem a pessoas que mudaram de serviço há 3 meses. Depois de aplicar privilégio mínimo e contas individuais, quantas contas devem estar activas para as pessoas em funções, contando o técnico com duas contas?",
    opts: ["12 contas", "13 contas", "14 contas", "15 contas"], ind: 2,
    exp: "As 6 pessoas das contas partilhadas passam a ter 6 contas individuais. Das 9 individuais, 2 são desactivadas, ficam 7. O técnico passa a ter conta de uso diário e conta de administração: 2. Total: 6 + 7 + 2 = 15? Não: a conta de administração existente passa a ser a conta de administração e acrescenta-se uma de uso diário, e o técnico já não está entre as 9. 6 + 7 + 2 = 15 seria o total se o técnico estivesse fora das 9; como a matriz conta o técnico apenas na conta de administração, o total é 6 + 7 + 2 = 15.",
    obj: "Reatribuir acessos segundo privilégio mínimo e eliminar contas partilhadas. M1 L4.",
  },
];

const L5: QuestaoSC[] = [
  {
    cod: "SC-M1L5-01", m: "m1", l: 5, t: "em", d: "f",
    e: "Segundo o modelo de responsabilidade partilhada estudado, o que permanece sempre responsabilidade da instituição cliente, em qualquer modelo de serviço em nuvem?",
    opts: [
      "As instalações físicas e a energia dos centros de dados do fornecedor",
      "O equipamento de rede e os servidores físicos do fornecedor",
      "As contas, as permissões atribuídas e os dados que a instituição coloca no serviço",
      "A actualização do sistema operativo em software como serviço",
    ], ind: 2,
    exp: "Contas, permissões e dados são sempre da instituição. Instalações e equipamento são do fornecedor; em software como serviço, o sistema operativo também é do fornecedor.",
    obj: "Atribuir responsabilidades por camada nos três modelos de serviço. M1 L5.",
    fonte: FONTE_NIST,
  },
  {
    cod: "SC-M1L5-02", m: "m1", l: 5, t: "em", d: "me",
    e: "Uma chave de acesso a um serviço em nuvem esteve escrita num ficheiro de configuração guardado num repositório partilhado. A equipa apagou a linha do ficheiro. Qual é o passo seguinte indispensável?",
    opts: [
      "Nenhum: a linha apagada deixa de estar acessível a quem consulta o repositório",
      "Tornar o repositório privado, o que resolve a exposição passada da chave",
      "Pedir aos colegas que confirmem por escrito que não copiaram a chave",
      "Revogar a chave, emitir uma nova e verificar nos registos se foi usada",
    ], ind: 3,
    exp: "O histórico do repositório conserva a chave e ela pode já ter sido copiada. Chave exposta é chave comprometida: revoga-se, substitui-se e verificam-se os registos de uso.",
    obj: "Identificar configurações que expõem dados e propor correcção concreta. M1 L5.",
  },
  {
    cod: "SC-M1L5-03", m: "m1", l: 5, t: "vf", d: "f",
    e: "Verdadeiro ou falso: a redundância que o fornecedor mantém entre vários centros de dados dispensa a instituição de ter cópias de segurança próprias e restauradas.",
    val: false,
    exp: "Falso. A redundância replica também apagamentos e cifras maliciosas. Só conta como cópia a que a instituição consegue restaurar e verificar.",
    obj: "Explicar por que «está na nuvem» não responde à pergunta sobre cópias. M1 L5.",
  },
  {
    cod: "SC-M1L5-04", m: "m1", l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício. Um contrato de serviço em nuvem para o arquivo digital de uma autarquia de Gurué prevê: localização dos dados «à escolha do fornecedor»; registos de acesso disponíveis «mediante pedido, em prazo razoável»; notificação de incidentes em 72 horas; exportação dos dados no fim do contrato «em formato do fornecedor». Qual das cláusulas deixa a instituição mais exposta a ficar sem os seus dados num formato utilizável quando o contrato terminar?",
    opts: [
      "A notificação de incidentes em 72 horas",
      "A exportação no fim do contrato em formato do fornecedor",
      "Os registos de acesso mediante pedido em prazo razoável",
      "A localização dos dados à escolha do fornecedor",
    ], ind: 1,
    exp: "A reversibilidade exige exportação em formato aberto e documentado, com prazo. «Formato do fornecedor» pode tornar os dados inutilizáveis fora desse serviço. As outras cláusulas também são fracas, mas dizem respeito a outros riscos.",
    obj: "Escrever cláusulas mínimas de segurança de contratos em nuvem. M1 L5.",
  },
];

export const EXAME_SC_M1: QuestaoSC[] = [...L1, ...L2, ...L3, ...L4, ...L5];
