/**
 * Banco PRIVADO de Redes — módulos 4 a 6 (18 questões finais). Rascunho por
 * validar pela Ologa/ATDI. Não importado.
 */
import type { QuestaoRedes } from "./redes-questoes-tipos";

export const EXAME_REDES_M04_06: QuestaoRedes[] = [
  // ─── Módulo 4 — Redes Sem Fios ───
  {
    cod: "RED-M04-L1-01", m: 4, l: 1, t: "em", d: "f",
    e: "Comparando as bandas de 2,4 GHz e de 5 GHz no Wi-Fi, qual afirmação corresponde à lição?",
    opts: [
      "2,4 GHz tem mais canais sem sobreposição e menos interferência",
      "As duas bandas têm o mesmo alcance e o mesmo número de canais",
      "5 GHz tem mais canais e menos interferência, mas menor alcance",
      "5 GHz atravessa melhor as paredes e alcança mais longe",
    ], ind: 2,
    exp: "A 2,4 GHz alcança mais longe e atravessa melhor paredes, mas só tem três canais sem sobreposição (1, 6 e 11) e muita interferência; a 5 GHz tem mais canais e menos interferência, com menor alcance.",
    obj: "Explicar bandas (2,4, 5 e 6 GHz), canais, largura de canal e SSID.",
    r: ["R13"], fonte: "ieee80211",
  },
  {
    cod: "RED-M04-L2-01", m: 4, l: 2, t: "em", d: "me",
    e: "Uma sala de reuniões terá 25 clientes simultâneos a 3 Mbit/s cada. Com a capacidade útil prudente de 60 Mbit/s por rádio, usada na prática da lição, quantos rádios são necessários?",
    opts: ["1 rádio", "4 rádios", "3 rádios", "2 rádios"], ind: 3,
    exp: "25 × 3 = 75 Mbit/s; 75 / 60 = 1,25, arredondado para cima dá 2 rádios. O valor de 60 Mbit/s é prudente e deve ser confirmado na ficha técnica e no local.",
    obj: "Estimar número de pontos de acesso pela capacidade e não só pela área.",
    r: ["R01", "R13"], fonte: "python",
  },
  {
    cod: "RED-M04-L3-01", m: 4, l: 3, t: "cor", d: "f",
    e: "Associe cada protecção de rede sem fios à avaliação feita na lição.",
    pares: [
      { esquerda: "WEP", direita: "Quebrado; não deve ser usado" },
      { esquerda: "WPA2 com AES/CCMP", direita: "Mínimo aceitável hoje" },
      { esquerda: "WPA3 com SAE", direita: "Resiste a dicionário fora de linha e exige PMF" },
      { esquerda: "Modo de transição WPA2/WPA3", direita: "Admite clientes antigos, com menos protecção para eles" },
    ],
    exp: "WEP e WPA (TKIP) estão quebrados; WPA2 com AES é o mínimo; WPA3 troca a chave partilhada por SAE e exige protecção de tramas de gestão; o modo de transição é um compromisso.",
    obj: "Configurar uma rede sem fios com WPA3-Personal (SAE) e modo de transição WPA2/WPA3.",
    r: ["R05", "R12"], fonte: "wifiwpa3",
  },
  {
    cod: "RED-M04-L3-02", m: 4, l: 3, t: "vf", d: "f",
    e: "Verdadeiro ou falso: o WPS deve ficar ligado no ponto de acesso dos visitantes, para facilitar a ligação de quem chega à delegação.",
    val: false,
    exp: "Falso. Entre as boas práticas da lição está manter o WPS desligado, além de isolar os clientes na rede de visitantes.",
    obj: "Aplicar boas práticas: gestão desligada da rede de visitantes, WPS desligado, firmware actualizado.",
    r: ["R05"], fonte: "nist800153",
  },
  {
    cod: "RED-M04-L4-01", m: 4, l: 4, t: "em", d: "me",
    e: "Nos portáteis configurados com PEAP, o técnico desactivou a validação do certificado do servidor RADIUS para «evitar avisos». Que risco cria?",
    opts: [
      "Uma rede falsa pode recolher as credenciais dos utilizadores",
      "O servidor RADIUS deixa de conseguir atribuir VLAN por perfil",
      "O ponto de acesso passa a usar uma chave partilhada por todos",
      "Os portáteis deixam de conseguir obter endereço por DHCP",
    ], ind: 0,
    exp: "Em PEAP e EAP-TTLS a palavra-passe viaja num túnel TLS; se o cliente não validar o certificado do servidor, uma rede falsa pode apresentar-se e recolher credenciais.",
    obj: "Comparar chave partilhada, 802.1X e autenticação por certificado.",
    r: ["R12"], fonte: "ieee8021x",
  },
  {
    cod: "RED-M04-L5-01", m: 4, l: 5, t: "em", cen: true, d: "me",
    e: "Caso fictício: na sala de reuniões da DPE, os utilizadores queixam-se de Wi-Fi lento. As medições mostram sinal de −55 dBm, muitas retransmissões, ruído de fundo elevado e apenas 5 clientes ligados, com o tempo de ar pouco ocupado. Que causa sustentam estas evidências?",
    opts: [
      "Interferência: sinal bom, mas ruído alto e muitas retransmissões",
      "Cobertura: o sinal de −55 dBm é demasiado fraco para esta sala",
      "Capacidade: há demasiados clientes para o ponto de acesso da sala",
      "Endereçamento: o DHCP esgotou e os clientes não obtêm endereço",
    ], ind: 0,
    exp: "−55 dBm é sinal bom, por isso não é cobertura; 5 clientes com tempo de ar livre excluem capacidade; os clientes estão ligados, logo não é DHCP. Ruído alto com muitas retransmissões é o padrão de interferência.",
    obj: "Distinguir interferência, sinal fraco e falta de capacidade pelas evidências.",
    r: ["R04"], fonte: "ieee80211",
  },

  // ─── Módulo 5 — Serviços e Disponibilidade da Rede ───
  {
    cod: "RED-M05-L1-01", m: 5, l: 1, t: "cor", d: "f",
    e: "Associe cada registo DNS da zona dpe.example à sua função.",
    pares: [
      { esquerda: "A", direita: "Nome para endereço IPv4" },
      { esquerda: "AAAA", direita: "Nome para endereço IPv6" },
      { esquerda: "PTR", direita: "Endereço para nome" },
      { esquerda: "MX", direita: "Servidor de correio do domínio" },
    ],
    exp: "São os registos trabalhados na zona autoritativa de prática com BIND.",
    obj: "Explicar o processo DHCP (DORA) e os registos DNS A, AAAA, PTR, CNAME, MX.",
    r: ["R03"], fonte: "rfc1034",
  },
  {
    cod: "RED-M05-L1-02", m: 5, l: 1, t: "em", d: "me",
    e: "O servidor DHCP central da DPE está na VLAN 20 e já tem um âmbito para a nova VLAN 40, mas os postos da VLAN 40 não recebem endereço. As outras VLAN funcionam. Qual é a causa mais provável?",
    opts: [
      "O prazo da concessão configurado no servidor é demasiado longo",
      "Os registos PTR da zona DNS ainda não foram criados para a VLAN",
      "O servidor DHCP só pode servir postos da VLAN onde está instalado",
      "Falta o agente de reencaminhamento DHCP na interface da VLAN 40",
    ], ind: 3,
    exp: "O DHCPDISCOVER é enviado em difusão e a difusão não atravessa encaminhadores; um servidor central precisa de um agente de reencaminhamento (relay) em cada VLAN. As outras VLAN funcionam, o que indica que o servidor não está limitado à sua VLAN.",
    obj: "Explicar o processo DHCP (DORA) e os registos DNS A, AAAA, PTR, CNAME, MX.",
    r: ["R03"], fonte: "rfc2131",
  },
  {
    cod: "RED-M05-L2-01", m: 5, l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: se os relógios dos equipamentos diferirem vários minutos, a sequência dos acontecimentos reconstruída a partir dos registos pode ficar errada.",
    val: true,
    exp: "Verdadeiro. Para ordenar acontecimentos de vários equipamentos é preciso hora sincronizada (NTP); certificados e códigos TOTP também dependem da hora.",
    obj: "Configurar sincronização de tempo com chrony e explicar porque importa.",
    r: ["R09", "R11"], fonte: "rfc5905",
  },
  {
    cod: "RED-M05-L3-01", m: 5, l: 3, t: "vf", d: "di",
    e: "Verdadeiro ou falso: na ligação de 10 Mbit/s à sede, o r2 marca a voz como EF e dá-lhe uma fila prioritária limitada a 2 Mbit/s. Se num pico houver 3 Mbit/s de chamadas marcadas EF, todas as chamadas mantêm a qualidade, porque a voz tem prioridade.",
    val: false,
    exp: "Falso. A fila prioritária EF é limitada para não esgotar as outras classes: o que excede os 2 Mbit/s é descartado ou atrasado, e isso degrada chamadas. A prioridade só protege a voz enquanto o volume cabe no limite dimensionado; a QoS não cria largura de banda. É preciso dimensionar o limite ao número de chamadas ou controlar a admissão.",
    obj: "Relacionar os requisitos de voz, vídeo e dados com esses indicadores.",
    r: ["R04"], fonte: "rfc3246",
  },
  {
    cod: "RED-M05-L4-01", m: 5, l: 4, t: "em", d: "me",
    e: "Num mês de 30 dias, o objectivo de disponibilidade de um serviço é 99,5%. Qual é o tempo máximo de indisponibilidade admitido nesse mês?",
    opts: ["36 minutos", "3 h 36 min", "7 h 12 min", "1 h 12 min"], ind: 1,
    exp: "30 dias = 720 horas; 0,5% de 720 h = 3,6 h = 3 horas e 36 minutos. O valor só tem sentido se «indisponível» estiver definido e for medido sempre da mesma maneira.",
    obj: "Definir disponibilidade e calcular percentagens em tempo de indisponibilidade.",
    r: ["R04"], fonte: "nistcsf",
  },
  {
    cod: "RED-M05-L5-01", m: 5, l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício: depois do commit «r1: regra nova (pedido 123)» no repositório de configurações, a delegação 10.20.10.0/24 perdeu o acesso aos servidores. O commit anterior é «r1: configuração inicial aprovada». O chefe pede a reposição hoje, na janela aprovada das 17h. Qual sequência segue o procedimento da lição?",
    opts: [
      "Comparar com git diff, aplicar a versão anterior na janela, verificar e registar",
      "Apagar a regra à mão no r1 já, sem comparar versões, e fechar o pedido 123",
      "Aplicar a versão anterior de imediato e dar o caso como resolvido sem testar",
      "Apagar o repositório e recriá-lo com a configuração que está agora no r1",
    ], ind: 0,
    exp: "Recuperar: identificar a última versão boa, comparar com a actual, aplicar em janela aprovada, verificar o resultado (a delegação volta a chegar aos servidores) e registar. Recriar o repositório a partir da configuração errada perde a versão boa.",
    obj: "Restaurar uma configuração conhecida e verificar o resultado.",
    r: ["R17", "R15"], fonte: "git",
  },

  // ─── Módulo 6 — Introdução à Segurança Cibernética ───
  {
    cod: "RED-M06-L1-01", m: 6, l: 1, t: "cor", d: "f",
    e: "No registo de riscos da DPE, associe cada termo ao exemplo correcto.",
    pares: [
      { esquerda: "Activo", direita: "Servidor de ficheiros da direcção" },
      { esquerda: "Ameaça", direita: "Código malicioso que circula por anexos" },
      { esquerda: "Vulnerabilidade", direita: "Sistema operativo sem actualizações" },
      { esquerda: "Risco residual", direita: "O que sobra depois dos controlos" },
    ],
    exp: "Activo é o que tem valor; ameaça o que pode causar dano; vulnerabilidade a fraqueza aproveitada; o risco residual deve ser aceite por quem tem autoridade.",
    obj: "Distinguir activo, ameaça, vulnerabilidade, impacto e risco.",
    r: ["R06"], fonte: "nist80030",
  },
  {
    cod: "RED-M06-L1-02", m: 6, l: 1, t: "em", d: "me",
    e: "Numa matriz probabilidade × impacto de 1 a 3, o risco X tem probabilidade 2 e impacto 3; o risco Y tem probabilidade 3 e impacto 1. Qual deve ser tratado primeiro e porquê?",
    opts: [
      "Y, porque a probabilidade pesa sempre mais do que o impacto",
      "Os dois ao mesmo tempo, porque ambos têm probabilidade maior que 1",
      "X, porque o seu nível de risco (6) é superior ao de Y (3)",
      "Nenhum, porque os dois ficam abaixo do valor máximo de 9",
    ], ind: 2,
    exp: "Com a matriz da lição, risco = probabilidade × impacto: X = 6, Y = 3. Prioriza-se o maior; nenhuma das dimensões pesa sozinha.",
    obj: "Classificar riscos com uma matriz de probabilidade × impacto.",
    r: ["R06", "R08"], fonte: "nist80030",
  },
  {
    cod: "RED-M06-L2-01", m: 6, l: 2, t: "em", cen: true, d: "me",
    e: "Caso fictício: um funcionário da DPE recebe a mensagem «URGENTE: subsídio pendente», com remetente aparente tesouraria@dpe.example. Os cabeçalhos mostram Authentication-Results com spf=fail e dmarc=fail, e o texto pede que clique numa ligação. Segundo o procedimento da lição, o que deve fazer?",
    opts: [
      "Responder ao remetente a pedir que confirme se a mensagem é real",
      "Reencaminhá-la aos colegas para que também fiquem de sobreaviso",
      "Abrir a ligação para ver se a página parece oficial antes de agir",
      "Reportar a mensagem pelo canal definido, sem clicar nem reencaminhar",
    ], ind: 3,
    exp: "O remetente aparente pode ser forjado e a falha de SPF e DMARC indica que a mensagem não foi autenticada pelo domínio. O procedimento é reportar pelo canal definido, sem clicar, sem responder e sem reencaminhar a colegas.",
    obj: "Analisar cabeçalhos de uma mensagem suspeita (fictícia).",
    r: ["R08", "R16"], fonte: "nist80061",
  },
  {
    cod: "RED-M06-L3-01", m: 6, l: 3, t: "vf", d: "f",
    e: "Verdadeiro ou falso: um código TOTP é calculado a partir de um segredo partilhado e da hora actual, e muda habitualmente a cada 30 segundos.",
    val: true,
    exp: "Verdadeiro. É o funcionamento descrito na RFC 6238 e verificado na prática com o vector de teste da norma.",
    obj: "Explicar autenticação multifactor e o funcionamento de TOTP.",
    r: ["R12"], fonte: "rfc6238",
  },
  {
    cod: "RED-M06-L4-01", m: 6, l: 4, t: "vf", d: "f",
    e: "Verdadeiro ou falso: comutadores e encaminhadores ficam fora da gestão de actualizações, porque só servidores e postos de trabalho têm falhas exploráveis.",
    val: false,
    exp: "Falso. A lição lembra que os equipamentos de rede também têm firmware com falhas, e que equipamentos em fim de vida são um risco a registar e substituir.",
    obj: "Organizar a gestão de actualizações: inventário, prioridade, teste, aplicação, verificação.",
    r: ["R06", "R17"], fonte: "nist80040",
  },
  {
    cod: "RED-M06-L5-01", m: 6, l: 5, t: "em", d: "me",
    e: "Um posto da VLAN 10 comunica repetidamente com um endereço externo desconhecido e suspeita-se de código malicioso. Que primeira acção contém o problema preservando evidências?",
    opts: [
      "Desligar o posto da corrente para parar logo a comunicação",
      "Mudar a porta para a VLAN de quarentena, com o posto ligado",
      "Apagar os ficheiros suspeitos e reiniciar o posto em seguida",
      "Reinstalar o sistema operativo antes de fazer qualquer reporte",
    ], ind: 1,
    exp: "Isolar da rede (desligar o cabo ou mudar a porta para uma VLAN de quarentena) mantendo o equipamento ligado preserva a memória. Desligar a correr, apagar ou reinstalar destroem provas.",
    obj: "Conhecer os primeiros passos de contenção sem destruir provas.",
    r: ["R11"], fonte: "nist80061",
  },
];
