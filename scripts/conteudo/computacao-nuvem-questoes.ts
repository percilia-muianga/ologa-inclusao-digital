/**
 * Banco de questões ORIGINAL do curso «Computação em Nuvem» (30 h, presencial).
 *
 * Dois instrumentos distintos e separados:
 * - EXAME: 60 questões para uma prova proposta de 20 (secção 10 do TdR: banco
 *   com pelo menos o triplo das questões do exame).
 * - PRE_POS: 10 questões de diagnóstico e pós-teste. NÃO certifica.
 *
 * Estado: todas entram INACTIVAS (rascunho). Não activam prova nem
 * certificação enquanto a Ologa/ATDI não as validar.
 *
 * Os gabaritos e as justificações vivem aqui, fora de src/, e só são
 * carregados para a base de dados. Nunca entram no pacote do navegador.
 *
 * Distribuição proposta (proposta pedagógica, não imposição do TdR):
 * 18 M1 + 21 M2 + 15 M3 + 6 transversal = 60.
 * Tipologias: 24 escolha múltipla + 12 verdadeiro/falso + 12 associação +
 * 12 cenários (o cenário usa resposta de escolha múltipla, mas o enunciado
 * contém sempre caso e problema).
 *
 * Preços e câmbios usados em cenários de custo são FICTÍCIOS e estão
 * identificados como tal no próprio enunciado, com todos os operandos visíveis.
 */

export type QuestaoNuvem = {
  /** m1 | m2 | m3 | transversal */
  m: "m1" | "m2" | "m3" | "transversal";
  /** em = escolha múltipla, vf = verdadeiro/falso, cor = correspondência */
  t: "em" | "vf" | "cor";
  /** Marca as questões desenhadas como cenário (caso + problema). */
  cen?: true;
  /** f = fácil, me = média, di = difícil */
  d: "f" | "me" | "di";
  e: string;
  opts?: string[];
  ind?: number;
  val?: boolean;
  pares?: { esquerda: string; direita: string }[];
  exp: string;
  obj: string;
};

export const EXAME: QuestaoNuvem[] = [
  // ==================== Módulo 1 — Fundamentos (18) ====================
  // -- escolha múltipla (7) --
  {
    m: "m1", t: "em", d: "f",
    e: "Quantas são as características essenciais da computação em nuvem na definição do NIST e quais delas trata do pagamento conforme o uso?",
    opts: [
      "Três características; a partilha de recursos trata do pagamento",
      "Cinco características; o serviço medido trata do pagamento conforme o uso",
      "Cinco características; a elasticidade trata do pagamento conforme o uso",
      "Quatro características; o auto-serviço trata do pagamento",
    ], ind: 1,
    exp: "São cinco: auto-serviço a pedido, acesso amplo pela rede, partilha de recursos, elasticidade rápida e serviço medido. É o serviço medido que permite medir o consumo e facturar conforme o uso.",
    obj: "Enumerar as cinco características essenciais da definição do NIST.",
  },
  {
    m: "m1", t: "em", d: "f",
    e: "Num serviço de infra-estrutura como serviço (IaaS), de quem é a responsabilidade de actualizar o sistema operativo da máquina virtual?",
    opts: [
      "Do fornecedor de nuvem, sempre",
      "Da instituição cliente",
      "É partilhada em partes iguais, sem definição",
      "De nenhuma das partes: o sistema actualiza-se sozinho por omissão",
    ], ind: 1,
    exp: "Em IaaS o fornecedor responde pela camada física e pela virtualização; o sistema operativo, as aplicações e os dados são responsabilidade do cliente.",
    obj: "Aplicar o modelo de responsabilidade partilhada aos três modelos de serviço.",
  },
  {
    m: "m1", t: "em", d: "me",
    e: "Qual das afirmações descreve correctamente a diferença entre elasticidade rápida e partilha de recursos?",
    opts: [
      "São o mesmo conceito com nomes diferentes",
      "A elasticidade é aumentar e reduzir capacidade conforme a procura; a partilha é servir vários clientes a partir da mesma infra-estrutura",
      "A elasticidade só permite aumentar capacidade, nunca reduzir",
      "A partilha de recursos significa que os dados de vários clientes ficam no mesmo ficheiro",
    ], ind: 1,
    exp: "Elasticidade é variação de capacidade nos dois sentidos; partilha de recursos é o modelo de vários inquilinos sobre a mesma infra-estrutura, com isolamento lógico entre eles.",
    obj: "Distinguir as características essenciais entre si.",
  },
  {
    m: "m1", t: "em", d: "me",
    e: "Uma direcção provincial precisa de manter um sistema num centro de dados próprio por exigência interna escrita, mas quer usar capacidade adicional externa nos picos de campanha. Que modelo de implantação corresponde a esta escolha?",
    opts: ["Nuvem pública", "Nuvem privada", "Nuvem híbrida", "Nuvem comunitária"], ind: 2,
    exp: "Híbrida é a combinação de um ambiente próprio com um ambiente externo, com ligação entre os dois e regras escritas sobre o que corre em cada lado.",
    obj: "Escolher o modelo de implantação adequado a uma necessidade concreta.",
  },
  {
    m: "m1", t: "em", d: "f",
    e: "Que evolução técnica está na origem directa da possibilidade de criar e destruir servidores em minutos?",
    opts: [
      "O aumento da velocidade das impressoras",
      "A virtualização, que separa o servidor lógico da máquina física",
      "A substituição do cabo de cobre por fibra óptica",
      "A criação das folhas de cálculo",
    ], ind: 1,
    exp: "A virtualização permitiu que vários servidores lógicos corressem sobre a mesma máquina física e que fossem criados e destruídos por programa, sem intervenção no equipamento.",
    obj: "Situar a computação em nuvem na sua evolução histórica.",
  },
  {
    m: "m1", t: "em", d: "me",
    e: "Qual é o principal limite da computação em nuvem para um serviço público num distrito com ligação fraca e intermitente?",
    opts: [
      "O preço do armazenamento de objectos",
      "A dependência da ligação de rede para aceder ao serviço",
      "A impossibilidade técnica de criar máquinas virtuais",
      "A falta de modelos de implantação adequados",
    ], ind: 1,
    exp: "Sem ligação, a capacidade contratada não chega ao balcão. É por isso que a avaliação de conectividade e o plano para trabalhar sem rede vêm antes da escolha do fornecedor.",
    obj: "Identificar limites e riscos da adopção da nuvem no contexto moçambicano.",
  },
  {
    m: "m1", t: "em", d: "di",
    e: "Qual destes indicadores mostra que uma instituição está a usar a nuvem como simples centro de dados alugado, sem tirar partido do modelo?",
    opts: [
      "Mede o consumo mensal por serviço",
      "Mantém as máquinas ligadas com a mesma capacidade fixa todo o ano, independentemente da procura",
      "Usa armazenamento de objectos para ficheiros grandes",
      "Define responsáveis por cada recurso criado",
    ], ind: 1,
    exp: "Capacidade fixa todo o ano ignora a elasticidade e o serviço medido, que são justamente o que distingue o modelo de nuvem de um alojamento tradicional.",
    obj: "Avaliar criticamente a adopção do modelo de nuvem numa instituição.",
  },
  // -- verdadeiro/falso (4) --
  {
    m: "m1", t: "vf", d: "f",
    e: "Passar um sistema para a nuvem transfere para o fornecedor a responsabilidade pelos dados da instituição.",
    val: false,
    exp: "Em qualquer dos modelos de serviço, os dados e o controlo de quem lhes acede continuam a ser responsabilidade da instituição cliente.",
    obj: "Aplicar o modelo de responsabilidade partilhada.",
  },
  {
    m: "m1", t: "vf", d: "f",
    e: "O auto-serviço a pedido significa que a pessoa utilizadora pode obter capacidade sem esperar por intervenção humana do fornecedor.",
    val: true,
    exp: "É essa a característica: o pedido é atendido por um portal ou por interface de programação, dentro dos limites e permissões definidos.",
    obj: "Enumerar as cinco características essenciais da definição do NIST.",
  },
  {
    m: "m1", t: "vf", d: "f",
    e: "Em software como serviço (SaaS) a instituição deixa de precisar de gerir contas e permissões de acesso.",
    val: false,
    exp: "Mesmo em SaaS, quem entra, com que permissões e por quanto tempo continua a ser decisão e responsabilidade da instituição.",
    obj: "Aplicar o modelo de responsabilidade partilhada aos três modelos de serviço.",
  },
  {
    m: "m1", t: "vf", d: "f",
    e: "Nuvem privada significa obrigatoriamente que o equipamento está instalado nas salas da própria instituição.",
    val: false,
    exp: "Nuvem privada quer dizer uso exclusivo de uma organização; o equipamento pode estar alojado em instalações de terceiros.",
    obj: "Distinguir os modelos de implantação.",
  },
  // -- associação (4) --
  {
    m: "m1", t: "cor", d: "f",
    e: "Associe cada característica essencial do NIST à situação que a ilustra.",
    pares: [
      { esquerda: "Auto-serviço a pedido", direita: "A técnica cria a máquina virtual pelo portal, sem abrir pedido ao fornecedor" },
      { esquerda: "Acesso amplo pela rede", direita: "O sistema é usado do computador da repartição e do telemóvel em serviço externo" },
      { esquerda: "Elasticidade rápida", direita: "A capacidade sobe na semana do recenseamento e desce depois" },
      { esquerda: "Serviço medido", direita: "A factura mostra horas de computação e gigabytes armazenados no mês" },
    ],
    exp: "Cada característica tem uma manifestação prática distinta; confundi-las leva a contratar capacidade fixa e continuar a chamar-lhe nuvem.",
    obj: "Reconhecer as cinco características essenciais em situações reais.",
  },
  {
    m: "m1", t: "cor", d: "me",
    e: "Associe cada modelo de serviço ao que a instituição continua a gerir.",
    pares: [
      { esquerda: "IaaS", direita: "Sistema operativo, aplicação, configuração e dados" },
      { esquerda: "PaaS", direita: "Aplicação, configuração e dados, sem gerir o sistema operativo" },
      { esquerda: "SaaS", direita: "Dados, contas e permissões de utilização" },
      { esquerda: "Instalação local tradicional", direita: "Tudo, incluindo o equipamento físico e a energia" },
    ],
    exp: "A fronteira sobe do equipamento para a aplicação à medida que se passa de IaaS para SaaS; os dados e as permissões ficam sempre do lado da instituição.",
    obj: "Aplicar o modelo de responsabilidade partilhada aos três modelos de serviço.",
  },
  {
    m: "m1", t: "cor", d: "f",
    e: "Associe cada modelo de implantação à sua definição.",
    pares: [
      { esquerda: "Pública", direita: "Infra-estrutura de um fornecedor, partilhada por vários clientes" },
      { esquerda: "Privada", direita: "Infra-estrutura de uso exclusivo de uma organização" },
      { esquerda: "Híbrida", direita: "Combinação ligada de ambiente próprio e ambiente externo" },
      { esquerda: "Comunitária", direita: "Infra-estrutura partilhada por instituições com requisitos comuns" },
    ],
    exp: "A escolha do modelo decorre de requisitos escritos — legais, de desempenho e de custo — e não de preferência por um fornecedor.",
    obj: "Distinguir os modelos de implantação.",
  },
  {
    m: "m1", t: "cor", d: "di",
    e: "Associe cada necessidade de um serviço público ao modelo de serviço mais adequado.",
    pares: [
      { esquerda: "Usar correio electrónico institucional sem manter servidores", direita: "SaaS" },
      { esquerda: "Publicar uma aplicação própria sem administrar o servidor", direita: "PaaS" },
      { esquerda: "Instalar um sistema antigo que exige controlo do sistema operativo", direita: "IaaS" },
      { esquerda: "Guardar ficheiros grandes de consulta pouco frequente", direita: "Armazenamento de objectos" },
    ],
    exp: "A regra prática é escolher o modelo que resolve a necessidade com a menor superfície de administração possível.",
    obj: "Escolher o modelo de serviço adequado a uma necessidade concreta.",
  },
  // -- cenários (3) --
  {
    m: "m1", t: "em", cen: true, d: "me",
    e: "Caso fictício: a Direcção Distrital de Namuiri emite certidões. Durante onze meses do ano recebe cerca de 40 pedidos por dia; em Janeiro, com as matrículas escolares, recebe 600 por dia e o sistema fica indisponível. A direcção quer comprar servidores dimensionados para Janeiro. Qual é a análise correcta?",
    opts: [
      "A compra é a melhor decisão, porque garante capacidade no pico",
      "A capacidade fixa dimensionada para o pico fica subaproveitada onze meses; a elasticidade da nuvem responde melhor a este perfil de procura",
      "O problema resolve-se aumentando a velocidade da internet do distrito",
      "Deve limitar-se o número de pedidos diários em Janeiro",
    ], ind: 1,
    exp: "O perfil é de procura muito variável, exactamente o caso em que elasticidade e serviço medido produzem poupança e melhor serviço. A decisão exige ainda avaliar a ligação e o plano para trabalhar sem rede.",
    obj: "Justificar a escolha do modelo a partir do perfil de procura de um serviço.",
  },
  {
    m: "m1", t: "em", cen: true, d: "me",
    e: "Caso fictício: um município contratou software como serviço para gestão de taxas. Seis meses depois, uma trabalhadora que saiu continua a aceder ao sistema. O município alega que a culpa é do fornecedor. Que leitura é correcta?",
    opts: [
      "A alegação procede: em SaaS o fornecedor gere as contas",
      "A responsabilidade pela revogação de acessos é do município, que devia ter procedimento de saída ligado ao recursos humanos",
      "O problema não é grave porque o sistema é externo",
      "A solução é mudar de fornecedor",
    ], ind: 1,
    exp: "Contas, permissões e revogação ficam do lado do cliente em todos os modelos de serviço. Sem procedimento de saída escrito, o acesso sobrevive à pessoa.",
    obj: "Aplicar o modelo de responsabilidade partilhada a um incidente concreto.",
  },
  {
    m: "m1", t: "em", cen: true, d: "di",
    e: "Caso fictício: uma instituição pretende migrar para a nuvem um sistema que responde a consultas de balcão em tempo real, num distrito onde a ligação cai várias horas por semana. Qual é a decisão mais defensável?",
    opts: [
      "Migrar tudo de imediato, porque a nuvem é mais fiável do que o servidor local",
      "Não migrar nada, porque a nuvem exige ligação permanente",
      "Manter no distrito a parte que tem de funcionar sem rede, migrar o restante e escrever o procedimento de trabalho durante as quedas de ligação",
      "Migrar e pedir aos utentes que voltem quando houver rede",
    ], ind: 2,
    exp: "A resposta não é técnica mas de desenho de serviço: separa-se o que precisa de funcionar sem rede do que pode viver em linha, e escreve-se o procedimento de contingência. Esta é uma proposta pedagógica, a validar caso a caso.",
    obj: "Decidir a adopção da nuvem tendo em conta conectividade e continuidade do serviço.",
  },

  // ============ Módulo 2 — Serviços e Arquitectura (21) ============
  // -- escolha múltipla (9) --
  {
    m: "m2", t: "em", d: "f",
    e: "Ao criar um contentor de armazenamento de objectos para documentos internos, qual é a configuração correcta de acesso?",
    opts: [
      "Acesso público de leitura, para facilitar a partilha",
      "Contentor privado, com acesso concedido apenas a identidades autorizadas",
      "Acesso público de escrita, com aviso no nome do contentor",
      "Sem qualquer configuração: o valor por omissão é sempre seguro",
    ], ind: 1,
    exp: "Documentos internos exigem contentor privado. Bloquear o acesso público é uma definição a confirmar explicitamente, não algo que se presuma.",
    obj: "Configurar um contentor de armazenamento de objectos privado.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "Qual é a ordem correcta de criação dos recursos de rede antes de colocar uma máquina virtual em serviço?",
    opts: [
      "Máquina virtual, depois rede virtual, depois regras de segurança",
      "Rede virtual e sub-redes, depois grupos de regras de segurança, depois a máquina virtual na sub-rede correcta",
      "Regras de segurança, depois máquina virtual, depois rede virtual",
      "A ordem é indiferente",
    ], ind: 1,
    exp: "Criar primeiro a rede e as regras evita o período em que a máquina existe sem filtragem definida.",
    obj: "Sequenciar a criação de rede virtual, sub-redes, regras e máquina virtual.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "Numa regra de filtragem de rede que permite administração remota, que origem deve ser configurada numa sala de formação?",
    opts: [
      "Qualquer origem (0.0.0.0/0), para não bloquear ninguém",
      "O endereço público de saída da sala, em máscara /32",
      "A gama completa da operadora de internet",
      "A sub-rede de dados",
    ], ind: 1,
    exp: "Abrir administração remota ao mundo é o erro mais comum e mais explorado. A origem deve ser o endereço de saída conhecido, no âmbito mais estreito possível.",
    obj: "Escrever regras de filtragem com origem mínima necessária.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "Numa aplicação publicada em plataforma como serviço, qual é a forma correcta de a aplicação saber em que porta deve escutar?",
    opts: [
      "Fixar a porta 3000 no código",
      "Ler a variável de ambiente da porta fornecida pela plataforma e escutar em 0.0.0.0",
      "Perguntar ao utilizador na primeira execução",
      "Escutar em todas as portas simultaneamente",
    ], ind: 1,
    exp: "A plataforma atribui a porta e injecta-a por variável de ambiente; escutar apenas em endereço local impede a plataforma de encaminhar os pedidos.",
    obj: "Publicar uma aplicação simples em plataforma como serviço.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "Qual é a diferença entre objectivo de ponto de recuperação (RPO) e objectivo de tempo de recuperação (RTO)?",
    opts: [
      "RPO é o tempo até repor o serviço; RTO é a quantidade de dados que se aceita perder",
      "RPO é a quantidade de dados que se aceita perder, medida em tempo; RTO é o tempo máximo até o serviço voltar",
      "São o mesmo indicador com unidades diferentes",
      "RPO aplica-se a máquinas virtuais e RTO a bases de dados",
    ], ind: 1,
    exp: "RPO olha para trás, para a última cópia válida; RTO olha para a frente, para a duração da interrupção. São definidos pelo serviço, não pela equipa técnica sozinha.",
    obj: "Distinguir RPO de RTO e relacioná-los com necessidades do serviço.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "O que caracteriza uma arquitectura de microserviços por oposição a uma aplicação monolítica?",
    opts: [
      "Usa sempre menos recursos de computação",
      "A aplicação é dividida em serviços autónomos, com evolução e desdobramento independentes",
      "Elimina a necessidade de base de dados",
      "É obrigatoriamente serverless",
    ], ind: 1,
    exp: "A vantagem é a autonomia de evolução; o custo é a complexidade de integração, monitoria e depuração distribuída.",
    obj: "Caracterizar microserviços, serverless e práticas cloud-native.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "Uma cópia de segurança só pode ser considerada válida quando:",
    opts: [
      "O trabalho de cópia termina sem erro",
      "A restauração foi testada e o serviço voltou a funcionar com os dados repostos",
      "Existe espaço suficiente no destino",
      "A cópia está guardada na mesma máquina, para ser mais rápida",
    ], ind: 1,
    exp: "A cópia que nunca foi restaurada é uma hipótese, não uma garantia. O teste de restauração é parte do procedimento, com data e responsável.",
    obj: "Planear cópias de segurança e testes de restauração.",
  },
  {
    m: "m2", t: "em", d: "di",
    e: "Numa infra-estrutura em que os filtros de rede foram associados às sub-redes, o que deve ser definido na interface de rede da máquina virtual no momento da criação?",
    opts: [
      "Um segundo grupo de regras igual ao da sub-rede",
      "Nenhum grupo de segurança próprio na interface, para evitar filtragem sobreposta que bloqueie o acesso administrativo",
      "Um grupo que permita qualquer origem",
      "É indiferente, porque só conta o da sub-rede",
    ], ind: 1,
    exp: "Quando existem filtros na sub-rede e na interface, o tráfego tem de passar em ambos. Um segundo grupo criado por omissão é causa frequente de perda de acesso.",
    obj: "Evitar filtragem sobreposta ao criar uma máquina virtual.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "O que é infra-estrutura como código e que problema resolve?",
    opts: [
      "Escrever a aplicação em código aberto; resolve o custo de licenças",
      "Descrever os recursos em ficheiros versionados e criá-los a partir deles; resolve a divergência entre ambientes e a dependência de configuração manual",
      "Guardar o código na nuvem; resolve o risco de perda do computador",
      "Substituir a documentação por comentários no código",
    ], ind: 1,
    exp: "Configuração feita à mão não é reproduzível nem auditável. A descrição versionada permite recriar o ambiente e ver quem alterou o quê.",
    obj: "Explicar práticas cloud-native e DevOps aplicáveis a um serviço público.",
  },
  // -- verdadeiro/falso (4) --
  {
    m: "m2", t: "vf", d: "f",
    e: "Um contentor de armazenamento de objectos deixa de gerar custo assim que se deixa de lhe aceder.",
    val: false,
    exp: "O armazenamento é facturado pelo volume guardado e pelo tempo, mesmo sem qualquer acesso. Só a remoção dos objectos ou do contentor termina esse custo.",
    obj: "Relacionar recursos criados com o custo que geram.",
  },
  {
    m: "m2", t: "vf", d: "me",
    e: "Numa regra de filtragem, uma negação explícita escrita com prioridade mais alta do que a regra por omissão permite documentar a intenção sem depender do comportamento por omissão.",
    val: true,
    exp: "As regras por omissão existem, mas não mostram intenção nem ficam visíveis na revisão. A negação explícita, avaliada antes delas, torna a decisão legível e auditável.",
    obj: "Escrever regras de permissão e de negação explícita com prioridades coerentes.",
  },
  {
    m: "m2", t: "vf", d: "f",
    e: "Um pedido que fica sem resposta até expirar prova que a regra de filtragem está a bloquear o tráfego.",
    val: false,
    exp: "A ausência de resposta pode dever-se ao serviço estar parado, à máquina estar desligada ou à aplicação não escutar. Prova-se com avaliação das regras aplicadas à interface, não com espera.",
    obj: "Verificar regras de rede por avaliação de configuração e não por ausência de resposta.",
  },
  {
    m: "m2", t: "vf", d: "me",
    e: "Uma função serverless dispensa a instituição de pensar em limites de execução e em custo por invocação.",
    val: false,
    exp: "Não há servidor para administrar, mas há limites de tempo de execução, de memória e de concorrência, e o custo cresce com o número de invocações.",
    obj: "Caracterizar serverless, com vantagens e limites.",
  },
  // -- associação (4) --
  {
    m: "m2", t: "cor", d: "f",
    e: "Associe cada recurso ao papel que desempenha numa arquitectura simples.",
    pares: [
      { esquerda: "Rede virtual e sub-redes", direita: "Separar camadas e delimitar o que comunica com o quê" },
      { esquerda: "Grupo de regras de segurança", direita: "Permitir e negar tráfego por origem, destino e porta" },
      { esquerda: "Máquina virtual", direita: "Executar um sistema operativo sob controlo da instituição" },
      { esquerda: "Armazenamento de objectos", direita: "Guardar ficheiros acedidos por endereço, sem sistema de ficheiros" },
    ],
    exp: "Confundir o papel dos recursos leva a soluções caras: por exemplo, usar discos de máquina virtual para guardar ficheiros que pertencem a armazenamento de objectos.",
    obj: "Identificar o papel de cada recurso numa arquitectura de nuvem.",
  },
  {
    m: "m2", t: "cor", d: "me",
    e: "Associe cada necessidade de continuidade ao mecanismo adequado.",
    pares: [
      { esquerda: "Aceitar perder no máximo 1 hora de dados", direita: "Definir o RPO e a frequência das cópias" },
      { esquerda: "Repor o serviço em menos de 4 horas", direita: "Definir o RTO e ensaiar o procedimento de restauração" },
      { esquerda: "Sobreviver à falha de um centro de dados", direita: "Distribuir por zonas ou regiões diferentes" },
      { esquerda: "Recuperar de um apagamento acidental de ficheiros", direita: "Manter versões e cópias com retenção definida" },
    ],
    exp: "Cada risco tem um mecanismo próprio; replicação entre zonas não protege de apagamento, porque o apagamento também é replicado.",
    obj: "Planear disponibilidade, cópias de segurança e recuperação.",
  },
  {
    m: "m2", t: "cor", d: "me",
    e: "Associe cada conceito de arquitectura moderna à sua descrição.",
    pares: [
      { esquerda: "Microserviços", direita: "Serviços autónomos, cada um com a sua responsabilidade e ciclo de vida" },
      { esquerda: "Serverless", direita: "Código executado por evento, sem administrar servidores, facturado por invocação e duração" },
      { esquerda: "Contentores", direita: "Empacotar aplicação e dependências para correr igual em ambientes diferentes" },
      { esquerda: "Integração e entrega contínuas", direita: "Automatizar testes e publicação a cada alteração aprovada" },
    ],
    exp: "São conceitos complementares, não alternativas; nenhum deles corrige, por si, um processo de serviço mal desenhado.",
    obj: "Caracterizar microserviços, serverless, contentores e DevOps.",
  },
  {
    m: "m2", t: "cor", d: "di",
    e: "Associe cada passo do exercício de publicação em plataforma como serviço ao seu objectivo.",
    pares: [
      { esquerda: "Executar a aplicação no computador antes de publicar", direita: "Confirmar que responde e que lê a variável de ambiente" },
      { esquerda: "Criar o pacote com os ficheiros na raiz", direita: "Garantir que a plataforma encontra o ponto de entrada" },
      { esquerda: "Definir a variável de ambiente no serviço publicado", direita: "Alterar o comportamento sem tocar no código" },
      { esquerda: "Apagar os recursos exclusivos no fim", direita: "Terminar o custo criado para o exercício" },
    ],
    exp: "O guião é de laboratório escrito e ainda não executado; a limpeza remove apenas o que foi criado para o exercício, nunca recursos partilhados ou preexistentes.",
    obj: "Executar o guião de publicação numa plataforma como serviço.",
  },
  // -- cenários (4) --
  {
    m: "m2", t: "em", cen: true, d: "me",
    e: "Caso fictício: numa sala de formação, um grupo cria a máquina virtual e não consegue estabelecer sessão administrativa. As regras da sub-rede permitem essa porta a partir do endereço da sala. Qual é a primeira hipótese a verificar?",
    opts: [
      "A internet da sala está lenta",
      "Existe um segundo grupo de regras associado à interface de rede da máquina, criado por omissão, que não permite esse tráfego",
      "A máquina tem pouca memória",
      "O sistema operativo escolhido não suporta acesso remoto",
    ], ind: 1,
    exp: "Com filtros na sub-rede e na interface, o tráfego tem de ser permitido nos dois. É a causa mais frequente deste sintoma neste exercício.",
    obj: "Diagnosticar perda de acesso administrativo por filtragem sobreposta.",
  },
  {
    m: "m2", t: "em", cen: true, d: "me",
    e: "Caso fictício: um técnico quer provar que a sub-rede de dados não aceita tráfego vindo da internet. Não existe nenhuma máquina nessa sub-rede. O que pode ser afirmado no relatório do exercício?",
    opts: [
      "Que a conectividade foi testada e está bloqueada",
      "Que a configuração foi revista e a regra está escrita, ficando a conectividade por testar até existir destino real",
      "Que o bloqueio está provado porque o pedido expirou",
      "Que o teste é desnecessário",
    ], ind: 1,
    exp: "Sem destino não há teste de conectividade possível; há revisão de configuração. Registar o teste como pendente é a forma honesta de o documentar.",
    obj: "Distinguir regra desenhada, configurada e testada.",
  },
  {
    m: "m2", t: "em", cen: true, d: "di",
    e: "Caso fictício: um serviço de registo guarda 2 000 fotografias por mês em discos de máquinas virtuais, que exigem aumentar o disco a cada trimestre. As fotografias são consultadas raramente. Qual é a recomendação técnica?",
    opts: [
      "Comprimir as fotografias e manter nos discos",
      "Passar as fotografias para armazenamento de objectos, deixando na máquina apenas o sistema e a aplicação",
      "Criar uma máquina virtual adicional só para fotografias",
      "Apagar as fotografias com mais de um ano",
    ], ind: 1,
    exp: "Ficheiros consultados por endereço, raramente lidos e em crescimento contínuo, pertencem a armazenamento de objectos, que cresce sem redimensionamento e custa menos por gigabyte.",
    obj: "Escolher o serviço de armazenamento adequado ao padrão de uso.",
  },
  {
    m: "m2", t: "em", cen: true, d: "di",
    e: "Caso fictício: uma instituição replica a base de dados entre duas zonas e considera que já tem cópias de segurança. Numa segunda-feira, um comando errado apaga a tabela de utentes. Que conclusão se retira?",
    opts: [
      "A replicação resolveu o problema, bastando trocar de zona",
      "A replicação copia também o apagamento; são necessárias cópias com retenção e restauração testada",
      "A base de dados devia estar numa máquina virtual",
      "O erro não podia ter sido evitado",
    ], ind: 1,
    exp: "Replicação protege de falha de infra-estrutura, não de erro humano nem de acção maliciosa. São mecanismos diferentes para riscos diferentes.",
    obj: "Distinguir replicação de cópia de segurança com retenção.",
  },

  // ============ Módulo 3 — Governação, Segurança e Custos (15) ============
  // -- escolha múltipla (6) --
  {
    m: "m3", t: "em", d: "f",
    e: "Qual é a diferença entre autenticação e autorização?",
    opts: [
      "Autenticação define o que a pessoa pode fazer; autorização confirma quem é",
      "Autenticação confirma quem é a pessoa ou o sistema; autorização define o que pode fazer",
      "São palavras diferentes para o mesmo controlo",
      "Autenticação aplica-se a pessoas e autorização a ficheiros",
    ], ind: 1,
    exp: "Confirmar a identidade não diz nada sobre permissões. Exigir mais provas de identidade não corrige permissões excessivas.",
    obj: "Distinguir autenticação de autorização.",
  },
  {
    m: "m3", t: "em", d: "f",
    e: "Qual das combinações constitui autenticação multifactor?",
    opts: [
      "Palavra-passe seguida de pergunta de segurança",
      "Palavra-passe seguida de código gerado por aplicação no telemóvel",
      "Duas palavras-passe diferentes",
      "Palavra-passe introduzida duas vezes",
    ], ind: 1,
    exp: "Multifactor exige provas de categorias diferentes: algo que se sabe e algo que se tem. Palavra-passe e pergunta de segurança são ambas coisas que a pessoa sabe — são dois passos, não multifactor.",
    obj: "Distinguir autenticação em dois passos de autenticação multifactor.",
  },
  {
    m: "m3", t: "em", d: "f",
    e: "Uma identidade de aplicação que lê ficheiros de um único contentor deve receber que permissão?",
    opts: [
      "Administrador da subscrição, para evitar bloqueios",
      "Função de leitura, com âmbito limitado a esse contentor",
      "A mesma função da pessoa que a criou",
      "Nenhuma permissão, usando a conta de uma pessoa",
    ], ind: 1,
    exp: "Menor privilégio é a função mais limitada, no âmbito mais estreito. Usar a conta de uma pessoa para uma aplicação destrói a rastreabilidade e cai quando essa pessoa sai.",
    obj: "Aplicar o princípio do menor privilégio a identidades de aplicação.",
  },
  {
    m: "m3", t: "em", d: "f",
    e: "Que limite tem a cifra de dados em repouso gerida pela plataforma?",
    opts: [
      "Impede qualquer acesso indevido aos dados",
      "Protege contra acesso ao suporte físico, mas não impede que uma conta com permissão leia os dados normalmente",
      "Substitui a necessidade de cópias de segurança",
      "Torna desnecessário o registo de acessos",
    ], ind: 1,
    exp: "A cifra protege o suporte, não a autorização. Quem tem permissão lê em claro, por isso o controlo de acessos e o registo continuam indispensáveis.",
    obj: "Reconhecer os limites da criptografia na protecção de dados.",
  },
  {
    m: "m3", t: "em", d: "di",
    e: "Num incidente de segurança, qual é a ordem correcta de trabalho?",
    opts: [
      "Recuperar o serviço, depois preservar evidências, depois conter",
      "Triagem, contenção autorizada, preservação de evidências, recuperação e lições aprendidas",
      "Comunicar publicamente, depois investigar",
      "Apagar os registos afectados e recomeçar",
    ], ind: 1,
    exp: "Recuperar antes de preservar evidências destrói a informação necessária para perceber a causa; conter sem autorização pode interromper serviço ao cidadão sem decisão competente.",
    obj: "Ordenar as etapas de resposta a um incidente.",
  },
  {
    m: "m3", t: "em", d: "di",
    e: "Ao preparar a saída de um fornecedor de nuvem, que requisito contratual é mais determinante?",
    opts: [
      "O desconto por volume no primeiro ano",
      "A obrigação de devolver os dados em formato utilizável, com prazo, e o tratamento do custo de saída",
      "A marca do equipamento usado pelo fornecedor",
      "O número de funcionários do fornecedor",
    ], ind: 1,
    exp: "Sem formato utilizável, prazo e custo de saída acordados, a instituição fica presa por via prática mesmo com contrato terminado. Recomendação a validar com a área jurídica da instituição.",
    obj: "Identificar requisitos de portabilidade e saída na contratação.",
  },
  // -- verdadeiro/falso (3) --
  {
    m: "m3", t: "vf", d: "f",
    e: "Um alerta de orçamento suspende automaticamente o consumo quando o limite é atingido.",
    val: false,
    exp: "O alerta avisa; não trava. A suspensão exige uma acção definida e autorizada, ou um mecanismo criado de propósito para isso.",
    obj: "Reconhecer os limites dos alertas de orçamento.",
  },
  {
    m: "m3", t: "vf", d: "me",
    e: "Uma máquina virtual em estado parado mas ainda com capacidade atribuída pode continuar a gerar custo de computação.",
    val: true,
    exp: "Só a paragem com libertação da capacidade termina a facturação de computação por consumo. Discos, endereços e cópias continuam a ser facturados, e compromissos já assumidos mantêm-se.",
    obj: "Distinguir máquina parada de máquina parada e desalocada.",
  },
  {
    m: "m3", t: "vf", d: "me",
    e: "Códigos de recuperação impressos podem ser distribuídos às pessoas utilizadoras como segundo factor de uso corrente.",
    val: false,
    exp: "São mecanismo de recuperação excepcional, guardado em condições de segurança definidas na política, com registo de acesso e substituição depois de usados. Não substituem o factor habitual.",
    obj: "Aplicar correctamente os mecanismos de recuperação de acesso.",
  },
  // -- associação (3) --
  {
    m: "m3", t: "cor", d: "me",
    e: "Associe cada elemento da matriz de permissões ao que deve conter.",
    pares: [
      { esquerda: "Tipo de identidade", direita: "Conta humana nominal ou identidade de aplicação" },
      { esquerda: "Função atribuída", direita: "Nome que descreve a acção permitida, como leitor de custos" },
      { esquerda: "Âmbito", direita: "Subscrição, grupo de recursos ou recurso concreto" },
      { esquerda: "Revogação", direita: "Evento que obriga a retirar o acesso de imediato" },
    ],
    exp: "Uma matriz sem âmbito e sem evento de revogação documenta permissões que ninguém retira quando a pessoa muda de funções.",
    obj: "Elaborar uma matriz de permissões completa.",
  },
  {
    m: "m3", t: "cor", d: "me",
    e: "Associe cada componente do custo mensal ao que é medido.",
    pares: [
      { esquerda: "Computação", direita: "Horas em que a capacidade esteve atribuída à máquina" },
      { esquerda: "Armazenamento", direita: "Gigabytes guardados durante o mês" },
      { esquerda: "Saída de dados", direita: "Gigabytes transferidos para fora da rede do fornecedor" },
      { esquerda: "Registos", direita: "Volume de registos guardado e tempo de retenção" },
    ],
    exp: "Cada componente tem unidade própria; somar tudo sem mostrar os operandos impede a verificação da factura.",
    obj: "Decompor e verificar o custo mensal de um serviço na nuvem.",
  },
  {
    m: "m3", t: "cor", d: "di",
    e: "Associe cada risco de governação ao controlo que o reduz.",
    pares: [
      { esquerda: "Acessos que sobrevivem à saída de pessoal", direita: "Revisão periódica e revogação ligada aos recursos humanos" },
      { esquerda: "Segredo de base de dados num ficheiro de configuração", direita: "Cofre de segredos com acesso por função e registo" },
      { esquerda: "Incidente detectado semanas depois", direita: "Alertas com destinatário, gravidade e acção esperada" },
      { esquerda: "Factura muito acima do previsto", direita: "Orçamento com alertas e revisão mensal do consumo" },
    ],
    exp: "Cada risco exige um controlo próprio; nenhum destes é substituído por cifra de dados.",
    obj: "Relacionar riscos de governação com controlos concretos.",
  },
  // -- cenários (3) --
  {
    m: "m3", t: "em", cen: true, d: "me",
    e: "Caso fictício, com preços FICTÍCIOS para efeito de exercício: uma máquina virtual custa 0,10 USD por hora e esteve atribuída 220 horas no mês. Assume-se libertação da capacidade no tempo restante e ausência de compromissos contratuais. Qual é o custo de computação dessa máquina?",
    opts: ["2,20 USD", "22,00 USD", "72,00 USD", "220,00 USD"], ind: 1,
    exp: "220 h × 0,10 USD/h = 22,00 USD. O pressuposto de libertação da capacidade tem de ser declarado: se a máquina ficasse apenas parada com capacidade atribuída, as horas restantes continuariam a contar.",
    obj: "Calcular o custo de computação com todos os operandos visíveis.",
  },
  {
    m: "m3", t: "em", cen: true, d: "me",
    e: "Caso fictício, com preços FICTÍCIOS: o armazenamento de objectos custa 0,025 USD por gigabyte-mês e o serviço guarda 400 GB. O câmbio assumido no exercício é de 64 MZN por USD. Qual é o custo mensal em meticais?",
    opts: ["64,00 MZN", "640,00 MZN", "1 000,00 MZN", "256,00 MZN"], ind: 1,
    exp: "400 GB × 0,025 USD = 10,00 USD; 10,00 × 64 = 640,00 MZN. Preço e câmbio são pressupostos fictícios do exercício e têm de ser identificados como tal em qualquer estimativa.",
    obj: "Converter custos com câmbio identificado como pressuposto.",
  },
  {
    m: "m3", t: "em", cen: true, d: "di",
    e: "Caso fictício: após um incidente, a direcção pede que a equipa apague os registos do período afectado para «limpar o sistema». Qual é a resposta correcta?",
    opts: [
      "Apagar, porque a direcção autorizou",
      "Preservar os registos como evidência e explicar que a sua remoção impede apurar a causa e prestar contas",
      "Apagar apenas metade dos registos",
      "Apagar e comunicar depois",
    ], ind: 1,
    exp: "A preservação de evidências precede a recuperação e não é dispensável por conveniência. A recomendação de conservação e os prazos aplicáveis devem ser confirmados com a área jurídica da instituição.",
    obj: "Preservar evidências durante a resposta a um incidente.",
  },

  // ============ Transversal — Governo Digital Inclusivo (6) ============
  {
    m: "transversal", t: "em", d: "f",
    e: "Numa formação presencial com dois formandos por computador, qual é a prática correcta?",
    opts: [
      "A pessoa com mais experiência executa e a outra observa",
      "Alternar quem executa em cada passo ou secção, registando a alternância",
      "Cada par escolhe livremente e não se acompanha",
      "O formador executa e os formandos observam",
    ], ind: 1,
    exp: "Sem alternância registada, quem já sabia continua a praticar e quem precisava fica a assistir. O rácio de um computador por formando é o recomendado; dois é o limite.",
    obj: "Aplicar as regras de trabalho em par na formação prática.",
  },
  {
    m: "transversal", t: "em", d: "me",
    e: "Um segundo factor de autenticação que exige leitura rápida de um código num ecrã pequeno cria que problema de acessibilidade?",
    opts: [
      "Nenhum, porque a segurança tem prioridade",
      "Exclui pessoas com baixa visão ou dificuldade motora se não houver alternativa combinada e tempo suficiente",
      "Torna o sistema mais lento para todos",
      "Aumenta o custo da solução",
    ], ind: 1,
    exp: "Um mecanismo de segurança que exclui parte das pessoas trabalhadoras deixa de ser segurança e passa a ser barreira; a alternativa acessível combina-se antes e escreve-se.",
    obj: "Contextualizar a acessibilidade nas escolhas técnicas da formação.",
  },
  {
    m: "transversal", t: "vf", d: "f",
    e: "Nesta formação, os conteúdos estão disponíveis em Língua de Sinais Moçambicana e com legendagem em vídeo.",
    val: false,
    exp: "Ainda não estão. O curso disponibiliza texto, síntese em leitura fácil e leitura em voz alta pelo navegador; Língua de Sinais Moçambicana, vídeo e legendagem continuam pendentes, tal como a revisão por terceiros.",
    obj: "Reconhecer honestamente os recursos de acessibilidade existentes e pendentes.",
  },
  {
    m: "transversal", t: "cor", d: "me",
    e: "Associe cada apoio de acessibilidade à necessidade que responde.",
    pares: [
      { esquerda: "Síntese em leitura fácil", direita: "Compreensão do essencial por quem tem dificuldade de leitura" },
      { esquerda: "Leitura em voz alta do texto", direita: "Acesso ao conteúdo por quem tem baixa visão" },
      { esquerda: "Tempo adicional nas tarefas práticas", direita: "Participação de quem tem dificuldade motora" },
      { esquerda: "Material em texto sem depender de vídeo", direita: "Acesso em locais com ligação fraca" },
    ],
    exp: "Cada apoio responde a uma necessidade concreta e deve ser combinado antes da sessão, não improvisado no dia.",
    obj: "Relacionar apoios de acessibilidade com necessidades concretas.",
  },
  {
    m: "transversal", t: "em", cen: true, d: "me",
    e: "Caso fictício: numa turma de 30 formandos há 12 computadores disponíveis. Que decisão respeita as regras da formação?",
    opts: [
      "Formar grupos de três por computador para todos praticarem",
      "Reorganizar a sessão para no máximo dois formandos por computador, o que implica rever a composição da turma ou o número de postos, e registar a limitação",
      "Fazer a sessão apenas com demonstração do formador",
      "Deixar 6 formandos sem acesso ao computador",
    ], ind: 1,
    exp: "O limite de dois por computador não é flexível. Com 12 postos cabem 24 pessoas em prática; a diferença tem de ser resolvida na organização, e a limitação fica registada.",
    obj: "Organizar a sessão prática dentro do limite de dois formandos por computador.",
  },
  {
    m: "transversal", t: "em", cen: true, d: "di",
    e: "Caso fictício: numa partilha final, o formador tem 15 minutos e 15 grupos com produtos escritos. Que procedimento está previsto?",
    opts: [
      "Cada grupo apresenta em um minuto",
      "Seleccionar dois grupos para apresentação oral e recolher os restantes produtos por escrito, com devolução posterior",
      "Dispensar a partilha",
      "Prolongar a sessão para além do tempo previsto",
    ], ind: 1,
    exp: "A partilha por amostra de dois grupos, com recolha escrita dos restantes, mantém o tempo da sessão e não deixa trabalho por avaliar.",
    obj: "Gerir a partilha final dentro do tempo previsto.",
  },
];

/** Diagnóstico e pós-teste. Mede evolução; NÃO certifica. */
export const PRE_POS: QuestaoNuvem[] = [
  {
    m: "m1", t: "em", d: "f",
    e: "O que é, em termos simples, computação em nuvem?",
    opts: [
      "Guardar ficheiros num disco externo",
      "Usar capacidade de computação e armazenamento de um fornecedor, através da rede, pagando conforme o uso",
      "Ter internet mais rápida",
      "Usar programas gratuitos",
    ], ind: 1,
    exp: "O essencial é o acesso pela rede a capacidade que não é propriedade da instituição, com medição do consumo.",
    obj: "Definir computação em nuvem.",
  },
  {
    m: "m1", t: "vf", d: "f",
    e: "Na nuvem, a instituição deixa de ser responsável pelos seus dados.",
    val: false,
    exp: "Os dados e as permissões de acesso continuam sempre do lado da instituição.",
    obj: "Reconhecer a responsabilidade sobre os dados.",
  },
  {
    m: "m1", t: "em", d: "f",
    e: "Qual destes é um modelo de implantação?",
    opts: ["IaaS", "Nuvem híbrida", "Contentor", "Rede virtual"], ind: 1,
    exp: "Pública, privada, híbrida e comunitária são modelos de implantação; IaaS é modelo de serviço.",
    obj: "Distinguir modelo de serviço de modelo de implantação.",
  },
  {
    m: "m2", t: "em", d: "f",
    e: "Para que serve um grupo de regras de segurança de rede?",
    opts: [
      "Aumentar a velocidade da ligação",
      "Permitir e negar tráfego conforme origem, destino e porta",
      "Guardar cópias de segurança",
      "Medir o custo da rede",
    ], ind: 1,
    exp: "É o mecanismo de filtragem aplicado a sub-redes ou a interfaces de rede.",
    obj: "Reconhecer a função das regras de segurança de rede.",
  },
  {
    m: "m2", t: "vf", d: "f",
    e: "Um contentor de armazenamento com documentos internos deve ficar com acesso público de leitura.",
    val: false,
    exp: "Documentos internos exigem contentor privado, com acesso concedido apenas a identidades autorizadas.",
    obj: "Reconhecer a configuração correcta de um contentor privado.",
  },
  {
    m: "m2", t: "em", d: "me",
    e: "O que significa RTO no planeamento de continuidade?",
    opts: [
      "Quantidade de dados que se aceita perder",
      "Tempo máximo até o serviço voltar a funcionar",
      "Número de cópias guardadas",
      "Custo da recuperação",
    ], ind: 1,
    exp: "RTO é tempo de reposição; RPO é a quantidade de dados aceitável perder, medida em tempo.",
    obj: "Distinguir RPO de RTO.",
  },
  {
    m: "m3", t: "em", d: "f",
    e: "O que é o princípio do menor privilégio?",
    opts: [
      "Dar a todos a mesma permissão",
      "Atribuir a função mais limitada, no âmbito mais estreito, pelo tempo necessário",
      "Reduzir o número de contas",
      "Usar palavras-passe curtas",
    ], ind: 1,
    exp: "Menor privilégio é sobre o que a identidade pode fazer e onde, e por quanto tempo.",
    obj: "Definir o princípio do menor privilégio.",
  },
  {
    m: "m3", t: "vf", d: "f",
    e: "Cifrar os dados dispensa o controlo de quem lhes acede.",
    val: false,
    exp: "A cifra protege o suporte; quem tem permissão lê os dados em claro. Controlo de acessos e registo continuam necessários.",
    obj: "Reconhecer os limites da criptografia.",
  },
  {
    m: "m3", t: "em", d: "me",
    e: "Um alerta de orçamento serve para:",
    opts: [
      "Suspender automaticamente os serviços",
      "Avisar quando o consumo atinge um limite definido",
      "Reduzir o preço dos recursos",
      "Apagar recursos não utilizados",
    ], ind: 1,
    exp: "Avisa, não trava. A suspensão exige acção definida e autorizada.",
    obj: "Reconhecer a função dos alertas de orçamento.",
  },
  {
    m: "transversal", t: "vf", d: "f",
    e: "Nas sessões práticas podem trabalhar até três formandos por computador quando faltam postos.",
    val: false,
    exp: "O limite é de dois por computador, com alternância de quem executa; um por formando é o recomendado.",
    obj: "Aplicar o limite de formandos por computador.",
  },
];
