/**
 * Banco PRIVADO de Redes — módulos 7 a 9 (18 questões finais). Rascunho por
 * validar pela Ologa/ATDI. Não importado.
 */
import type { QuestaoRedes } from "./redes-questoes-tipos";

export const EXAME_REDES_M07_09: QuestaoRedes[] = [
  // ─── Módulo 7 — Defesa de Redes ───
  {
    cod: "RED-M07-L1-01", m: 7, l: 1, t: "cor", d: "me",
    e: "Aplique a matriz de fluxos fictícia da DPE (lição de segmentação) e associe cada pedido de ligação à decisão correcta.",
    pares: [
      { esquerda: "pc-adm 10.10.10.10 → srv 10.10.20.53, TCP 443", direita: "Permitido: Administração para servidores web" },
      { esquerda: "Visitante 10.10.30.30 → srv 10.10.20.53, TCP 80", direita: "Recusado: visitantes não entram na rede interna" },
      { esquerda: "Posto 10.10.99.5 → r1, TCP 22", direita: "Permitido: SSH a partir da rede de gestão" },
      { esquerda: "pc-adm 10.10.10.10 → r1, TCP 22", direita: "Recusado: SSH só a partir de 10.10.99.0/24" },
    ],
    exp: "A matriz lista origem, destino e serviço permitidos; tudo o que não está listado é recusado por omissão. O SSH aos equipamentos só é aceite a partir da rede de gestão.",
    obj: "Desenhar uma matriz de fluxos permitidos entre zonas da rede da DPE.",
    r: ["R05", "R07"], fonte: "nist800207",
  },
  {
    cod: "RED-M07-L2-01", m: 7, l: 2, t: "em", d: "di",
    e: "Cadeia forward com «policy drop», por esta ordem: (1) ct state invalid drop; (2) iifname \"vlan10\" oifname \"vlan99\" drop; (3) ct state established,related accept; (4) iifname \"vlan99\" oifname \"vlan10\" tcp dport 22 accept; (5) log e drop. Um técnico na VLAN 99 abre SSH para um servidor na VLAN 10. O que acontece?",
    opts: [
      "Liga: a regra 4 aceita o pedido e a regra 3 aceita as respostas",
      "Falha: a regra 4 nunca é avaliada porque a regra 1 descarta o pedido",
      "Falha: a resposta vinda da VLAN 10 cai na regra 2 antes da regra 3",
      "Liga só depois de a regra 5 registar a primeira tentativa recusada",
    ], ind: 2,
    exp: "O pedido (VLAN 99 → VLAN 10) passa a 1, a 2 e a 3 e é aceite pela 4. A resposta (VLAN 10 → VLAN 99) é avaliada por ordem: não é inválida, mas coincide com a regra 2 e é descartada antes de chegar à regra 3. Por isso a lição coloca a aceitação de ligações estabelecidas no início. A regra 5 só regista e recusa.",
    obj: "Escrever uma política nftables com recusa por omissão e excepções justificadas.",
    r: ["R02", "R07"], fonte: "nftables",
  },
  {
    cod: "RED-M07-L3-01", m: 7, l: 3, t: "cor", d: "f",
    e: "Associe cada elemento do acesso remoto seguro (WireGuard e SSH) à regra correcta da lição.",
    pares: [
      { esquerda: "AllowedIPs do WireGuard", direita: "Endereços que o par pode usar dentro do túnel" },
      { esquerda: "Chave privada", direita: "Nunca sai do equipamento onde foi gerada" },
      { esquerda: "Entrada directa como root no SSH", direita: "Desactivada" },
      { esquerda: "AllowUsers no SSH", direita: "Limita quem pode entrar" },
    ],
    exp: "As regras práticas da lição: chaves em vez de palavras-passe, root sem entrada directa, lista de utilizadores permitidos e gestão exposta só dentro da VPN.",
    obj: "Endurecer o SSH com chaves e restrições no servidor.",
    r: ["R03", "R12"], fonte: "openssh",
  },
  {
    cod: "RED-M07-L4-01", m: 7, l: 4, t: "vf", d: "f",
    e: "Verdadeiro ou falso: um alerta do Suricata é, por si só, prova de que houve um ataque.",
    val: false,
    exp: "Falso. Um alerta é um indício: pode ser falso positivo e confirma-se com outras fontes (registos, captura, dono do equipamento).",
    obj: "Distinguir IDS e IPS, detecção por assinatura e por anomalia.",
    r: ["R07"], fonte: "suricata",
  },
  {
    cod: "RED-M07-L4-02", m: 7, l: 4, t: "em", cen: true, d: "di",
    e: "Caso fictício: às 10h04 o Suricata no r1 regista o sid 1000002 «muitos SYN da delegação»: 21 tentativas de 10.20.10.10 para as portas 20 a 40 do srv, em 10 segundos. O posto pertence a um técnico da delegação. Ninguém avisou de nenhum inventário de rede. Qual é o passo seguinte adequado?",
    opts: [
      "Declarar ataque confirmado e reinstalar já o posto 10.20.10.10",
      "Confirmar com registos, captura e o dono antes de concluir",
      "Bloquear em definitivo toda a rede 10.20.10.0/24 na firewall",
      "Ignorar o alerta, porque a origem é um posto de um técnico interno",
    ], ind: 1,
    exp: "O alerta é um indício com explicações possíveis (inventário autorizado, erro de configuração, código malicioso). Confirma-se com outras fontes e com o dono antes de concluir; reinstalar destrói prova e bloquear toda a delegação é desproporcionado sem análise. Ignorar por ser interno também é erro.",
    obj: "Interpretar um alerta e decidir o passo seguinte sem conclusões precipitadas.",
    r: ["R07", "R09"], fonte: "suricata",
  },
  {
    cod: "RED-M07-L5-01", m: 7, l: 5, t: "em", d: "me",
    e: "No r1 de prática, «ss -lntup» mostra um servidor web em 0.0.0.0:8080 que não consta do inventário nem da lista de reforço. Qual é a acção correcta?",
    opts: [
      "Mantê-lo, porque serviços em portas altas não representam risco",
      "Mudar o serviço para outra porta alta, para que fique menos visível",
      "Fechá-lo, registar antes e depois e verificar o serviço principal",
      "Reiniciar o r1 e ver se o serviço desaparece por si próprio",
    ], ind: 2,
    exp: "Reforçar é reduzir o que pode falhar ou ser explorado: fecha-se o serviço desnecessário, regista-se o estado antes e depois com forma de reverter e verifica-se que o serviço principal continua a funcionar. Mudar de porta não reduz a exposição.",
    obj: "Identificar serviços expostos desnecessários e fechá-los.",
    r: ["R05", "R06"], fonte: "debian",
  },

  // ─── Módulo 8 — Operação Segura e Resposta ───
  {
    cod: "RED-M08-L1-01", m: 8, l: 1, t: "em", d: "f",
    e: "Porque é que a linha de base da DPE regista também as cópias de segurança nocturnas e as actualizações de fim do mês?",
    opts: [
      "Porque só esses períodos têm volume suficiente para ser medido",
      "Porque a lei exige que se registem todas as cópias de segurança",
      "Porque é durante essas tarefas que a rede fica sem monitorização",
      "Porque são normais mas raras e, sem registo, geram falsos alarmes",
    ], ind: 3,
    exp: "A linha de base descreve o comportamento habitual; o que é normal mas raro também se escreve, para que não seja tomado por anomalia.",
    obj: "Definir o que é uma linha de base e que medidas a compõem.",
    r: ["R09"], fonte: "nist80092",
  },
  {
    cod: "RED-M08-L2-01", m: 8, l: 2, t: "cor", d: "f",
    e: "Associe cada campo de um registo syslog (RFC 5424) ao que informa.",
    pares: [
      { esquerda: "Gravidade", direita: "Nível de importância, por exemplo warning" },
      { esquerda: "Anfitrião", direita: "Equipamento que gerou o registo" },
      { esquerda: "Aplicação", direita: "Programa de origem, por exemplo sshd" },
      { esquerda: "Data e hora", direita: "Momento do evento, fiável só com relógio sincronizado" },
    ],
    exp: "Estes campos permitem filtrar por equipamento, gravidade e período e relacionar eventos de fontes diferentes.",
    obj: "Filtrar registos por equipamento, gravidade e período.",
    r: ["R09"], fonte: "rfc5424",
  },
  {
    cod: "RED-M08-L3-01", m: 8, l: 3, t: "em", d: "di",
    e: "Numa captura de 40 segundos, o tshark mostra 30 SYN de 10.20.10.10 para 30 portas diferentes do srv; 28 recebem RST e 2 recebem SYN-ACK (portas 22 e 80). Qual registo de análise separa correctamente facto, hipótese e verificação em falta?",
    opts: [
      "Facto: 30 portas, 28 RST; hipótese: varrimento; falta: confirmar se foi autorizado",
      "Facto: ataque a partir da delegação; hipótese: nenhuma; falta: nada a verificar",
      "Facto: posto infectado; hipótese: 30 portas; falta: reinstalar o posto afectado",
      "Facto: portas 22 e 80 vulneráveis; hipótese: RST; falta: publicar o relatório",
    ], ind: 0,
    exp: "O que a captura mostra são contagens e respostas; «varrimento» é a interpretação provável; falta verificar explicações legítimas, como um inventário autorizado. «Ataque», «infectado» ou «vulnerável» não decorrem só destes números.",
    obj: "Separar facto observado de interpretação.",
    r: ["R09", "R11"], fonte: "wireshark",
  },
  {
    cod: "RED-M08-L4-01", m: 8, l: 4, t: "cor", d: "di",
    e: "No incidente 07 (exercício), cada acção descreve um objectivo e não a ferramenta usada. Associe cada acção à fase de resposta em que o seu objectivo se enquadra.",
    pares: [
      { esquerda: "Isolar o posto na VLAN de quarentena sem o desligar, para preservar a memória", direita: "Contenção" },
      { esquerda: "Reinstalar o posto a partir de imagem limpa depois de identificar a persistência", direita: "Erradicação" },
      { esquerda: "Repor o posto e vigiar 48 h comparando o tráfego com a linha de base", direita: "Recuperação" },
      { esquerda: "Rever o playbook porque a quarentena demorou 2 h por falta de acesso", direita: "Lições aprendidas" },
    ],
    exp: "Classifica-se pelo objectivo: travar a propagação preservando prova é contenção; eliminar a causa (a persistência) é erradicação; repor e confirmar o funcionamento normal é recuperação, mesmo que inclua vigilância; corrigir o procedimento a partir do que falhou é lição aprendida. As acções usam ferramentas semelhantes (VLAN, imagem, tráfego), por isso a palavra-chave não basta.",
    obj: "Aplicar as fases de resposta a incidentes (preparação, detecção e análise, contenção, erradicação, recuperação, lições aprendidas).",
    r: ["R11"], fonte: "nist80061",
  },
  {
    cod: "RED-M08-L4-02", m: 8, l: 4, t: "em", cen: true, d: "di",
    e: "Caso fictício: às 10h10 confirma-se o varrimento vindo de 10.20.10.10, um de 40 postos da delegação. O técnico de serviço propõe desligar o r2, cortando toda a delegação, e contar o sucedido ao responsável no dia seguinte. Qual alternativa segue a lição?",
    opts: [
      "Desligar o r2 como proposto e avisar a direcção só no fim da semana",
      "Desligar o posto da corrente e apagar os registos da captura feita",
      "Quarentena só para 10.20.10.10, registando hora, autor e motivo, e avisar já",
      "Não conter nada até haver um relatório final aprovado pela direcção",
    ], ind: 2,
    exp: "Conter não é desligar tudo: isolar só o equipamento suspeito pela rede mantém os outros 39 postos a trabalhar e a memória do posto intacta. Cada acção fica registada com hora, autor e motivo, e comunica-se com factos ao responsável de TI sem demora.",
    obj: "Comunicar o incidente aos papéis certos, com factos.",
    r: ["R11", "R16"], fonte: "nist80061",
  },
  {
    cod: "RED-M08-L5-01", m: 8, l: 5, t: "vf", d: "me",
    e: "Verdadeiro ou falso: no relatório do incidente, a lição aprendida «ter mais cuidado com varrimentos» cumpre o que a lição pede para a melhoria da operação.",
    val: false,
    exp: "Falso. Uma lição aprendida só vale se virar acção concreta, com responsável, prazo e forma de verificar — por exemplo «criar regra de alerta para varrimentos», com dono e data.",
    obj: "Transformar lições aprendidas em alterações concretas com responsável e prazo.",
    r: ["R15", "R11"], fonte: "nist80061",
  },

  // ─── Módulo 9 — Redes de Longa Distância ───
  {
    cod: "RED-M09-L1-01", m: 9, l: 1, t: "cor", d: "f",
    e: "Associe cada tecnologia de ligação de longa distância ao compromisso descrito na lição.",
    pares: [
      { esquerda: "Satélite geoestacionário", direita: "Chega a zonas remotas; ida e volta acima de 500 ms" },
      { esquerda: "Fibra óptica do operador", direita: "Débito alto e atraso baixo, se a fibra chegar ao local" },
      { esquerda: "Ligação móvel 4G/5G", direita: "Rápida de instalar; débito e atraso variáveis" },
      { esquerda: "Rádio ponto-a-ponto", direita: "Exige linha de vista; sensível a obstáculos" },
    ],
    exp: "Não há tecnologia melhor em absoluto; escolhe-se pelo serviço, pelo local e pelo custo.",
    obj: "Comparar as tecnologias de ligação mais comuns (fibra, rádio ponto-a-ponto, ligação móvel, satélite, circuito dedicado do operador) por débito, atraso, disponibilidade e custo relativo.",
    r: ["R13"], fonte: "iproute2",
  },
  {
    cod: "RED-M09-L2-01", m: 9, l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: segundo a lição, o WireGuard é uma norma IETF com suporte garantido nos equipamentos de todos os fabricantes.",
    val: false,
    exp: "Falso. À data da consulta indicada na lição, o WireGuard não é norma IETF e o suporte varia por equipamento; o IPsec é a arquitectura normalizada (RFC 4301).",
    obj: "Comparar IPsec e WireGuard quanto a normas, configuração e compatibilidade entre fabricantes.",
    r: ["R03"], fonte: "wireguard",
  },
  {
    cod: "RED-M09-L2-02", m: 9, l: 2, t: "em", d: "me",
    e: "A delegação vai ligar-se por VPN a um encaminhador do operador, de outro fabricante, cuja documentação não menciona WireGuard. Qual escolha segue a lição?",
    opts: [
      "WireGuard, porque tem configuração mais curta em qualquer ponta",
      "Nenhuma VPN, porque a ligação do operador já é privada por natureza",
      "Uma VPN própria com algoritmos escolhidos só pela equipa da delegação",
      "IPsec, acordando exactamente os mesmos parâmetros nas duas pontas",
    ], ind: 3,
    exp: "O IPsec é a escolha habitual quando uma ponta é equipamento de outro fabricante ou do operador; as duas pontas têm de acordar exactamente os mesmos parâmetros. O suporte de WireGuard confirma-se na documentação do equipamento concreto.",
    obj: "Comparar IPsec e WireGuard quanto a normas, configuração e compatibilidade entre fabricantes.",
    r: ["R03", "R12"], fonte: "rfc4301",
  },
  {
    cod: "RED-M09-L3-01", m: 9, l: 3, t: "em", d: "me",
    e: "A instituição tem a sede e 5 delegações. Se todos os locais fossem ligados em malha completa, quantas ligações seriam necessárias?",
    opts: ["15 ligações", "6 ligações", "30 ligações", "10 ligações"], ind: 0,
    exp: "São 6 locais: 6 × (6 − 1) / 2 = 15. Em estrela bastariam 5. Por isso a lição parte da estrela e acrescenta malha parcial só onde se justifica.",
    obj: "Comparar topologias em estrela (sede ao centro) e em malha para ligar várias delegações.",
    r: ["R01", "R13"], fonte: "iproute2",
  },
  {
    cod: "RED-M09-L4-01", m: 9, l: 4, t: "em", cen: true, d: "me",
    e: "Caso fictício: o contrato da ligação da delegação garante 99,5% de disponibilidade mensal. Em Setembro (30 dias), a monitoria própria da DPE registou 5 horas de falha; o relatório do operador indica 99,6%. Qual conclusão e acção seguem a lição?",
    opts: [
      "Cumpriu; o relatório do operador prevalece sobre qualquer medição",
      "A medição própria excede as 3,6 h admitidas; pedir o método do operador",
      "Cumpriu; 5 horas é menos de 0,5% de um ano inteiro de serviço",
      "Não há conclusão possível sem trocar já de operador de ligação",
    ], ind: 1,
    exp: "0,5% de 720 horas são 3,6 horas; 5 horas excedem esse limite (cerca de 99,3%). Com medição própria, a instituição pode comparar e perguntar como o operador mede e se exclui manutenções. O contrato é mensal, não anual.",
    obj: "Calcular o tempo de indisponibilidade admitido por uma percentagem de disponibilidade num contrato.",
    r: ["R04", "R17"], fonte: "nist80034",
  },
  {
    cod: "RED-M09-L5-01", m: 9, l: 5, t: "em", cen: true, d: "me",
    e: "Caso fictício: a partir da delegação da DPE, o ping ao srv funciona e as páginas pequenas abrem, mas a transferência de um ficheiro de 200 kB pára sempre. O túnel tem MTU 1400 e o r1 descarta as mensagens ICMP «fragmentation needed». Qual é o diagnóstico mais sustentado e a correcção?",
    opts: [
      "Problema de MTU; permitir esse ICMP e ajustar o MSS no túnel",
      "Servidor lento; aumentar o tempo limite do pedido na delegação",
      "Perda na operadora; abrir avaria sem mais recolha de evidência",
      "Túnel congestionado; aplicar QoS para dar prioridade ao ficheiro",
    ], ind: 0,
    exp: "Pacotes pequenos passam e grandes param, com o ICMP «fragmentation needed» bloqueado: é o padrão de problema de MTU. Corrige-se deixando passar o ICMP necessário e ajustando o MSS. Um servidor lento ou congestionamento não explicam que só os pacotes grandes falhem.",
    obj: "Diagnosticar um problema de MTU (pedidos pequenos passam, transferências grandes param) e corrigi-lo com ajuste do MSS.",
    r: ["R04"], fonte: "rfc792",
  },
];
