/**
 * Banco PRIVADO de Redes — módulos 10 a 12 (18 questões finais). Rascunho por
 * validar pela Ologa/ATDI. Não importado.
 */
import type { QuestaoRedes } from "./redes-questoes-tipos";

export const EXAME_REDES_M10_12: QuestaoRedes[] = [
  // ─── Módulo 10 — Qualidade de Serviço e Desempenho ───
  {
    cod: "RED-M10-L1-01", m: 10, l: 1, t: "cor", d: "f",
    e: "Associe cada medida de desempenho à sua definição, tal como qualificada na lição.",
    pares: [
      { esquerda: "Débito (throughput)", direita: "Bits por segundo num ponto, contando cabeçalhos" },
      { esquerda: "Débito útil (goodput)", direita: "Dados que chegam à aplicação, sem cabeçalhos nem retransmissões" },
      { esquerda: "RTT", direita: "Tempo de ida e volta, o que o ping mostra" },
      { esquerda: "Atraso unilateral", direita: "Tempo num só sentido, exige relógios sincronizados" },
    ],
    exp: "A lição insiste em não confundir estas medidas: dividir o RTT por dois não dá o atraso unilateral, e uma ligação de 10 Mbit/s nunca entrega 10 Mbit/s de ficheiro.",
    obj: "Distinguir débito (throughput), débito útil (goodput), atraso de ida e volta (RTT), atraso unilateral, variação do atraso (jitter) e perda, e dizer o que cada ferramenta mede de facto.",
    r: ["R04", "R09"], fonte: "rfc7679",
  },
  {
    cod: "RED-M10-L2-01", m: 10, l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: a marcação DSCP EF é um mecanismo de segurança, porque só o tráfego de voz autorizado consegue escrever essa marca.",
    val: false,
    exp: "Falso. Qualquer computador pode escrever EF nos seus pacotes. Por isso define-se uma fronteira de confiança onde as marcas recebidas são apagadas e reescritas pela equipa.",
    obj: "Justificar porque a marcação não cria largura de banda, só actua quando há congestionamento e não é um mecanismo de segurança.",
    r: ["R04"], fonte: "rfc2474",
  },
  {
    cod: "RED-M10-L2-02", m: 10, l: 2, t: "em", cen: true, d: "me",
    e: "Caso fictício: as chamadas entre a sede e a delegação têm cortes. A ligação é de 10 Mbit/s e, nas horas das queixas, a utilização medida na saída do r2 é de 30%, sem descartes nos contadores do tc. A medição mostra 3% de perda a partir do troço do operador. O técnico propõe marcar a voz com EF para resolver. Qual avaliação é correcta?",
    opts: [
      "A marcação EF resolve, porque a voz passa sempre à frente de tudo",
      "Basta aumentar a garantia da classe de voz no htb do r2 da delegação",
      "Sem fila local a prioridade não terá efeito; levar a perda ao operador",
      "A perda de 3% é aceitável para voz e os cortes vêm dos telefones",
    ], ind: 2,
    exp: "A prioridade só muda a ordem de saída quando há fila; com 30% de utilização e sem descartes, não há congestionamento local. A perda aparece no troço do operador: pede-se a análise com evidências. A referência de planeamento para voz é perda inferior a 1%.",
    obj: "Justificar porque a marcação não cria largura de banda, só actua quando há congestionamento e não é um mecanismo de segurança.",
    r: ["R04"], fonte: "rfc4594",
  },
  {
    cod: "RED-M10-L3-01", m: 10, l: 3, t: "em", d: "di",
    e: "Com o codec G.711 (64 kbit/s) e pacotes de 20 ms sobre RTP/UDP/IPv4, sem compressão de cabeçalhos, que débito ao nível IP ocupam 3 chamadas simultâneas, em cada sentido?",
    opts: ["240 kbit/s", "192 kbit/s", "261,6 kbit/s", "480 kbit/s"], ind: 0,
    exp: "50 pacotes/s com 160 bytes de voz + 12 (RTP) + 8 (UDP) + 20 (IPv4) = 200 bytes; 200 × 8 × 50 = 80 kbit/s por chamada; 3 × 80 = 240 kbit/s. 192 esquece os cabeçalhos; 261,6 é o valor ao nível Ethernet; 480 soma os dois sentidos.",
    obj: "Calcular o débito de uma chamada G.711 com 20 ms de pacote, ao nível IP e ao nível Ethernet, e o total para várias chamadas.",
    r: ["R04", "R13"], fonte: "itug711",
  },
  {
    cod: "RED-M10-L4-01", m: 10, l: 4, t: "em", d: "me",
    e: "Numa classe htb de 5 Mbit/s, a fila tem 500 pacotes de 1514 bytes à espera. Qual é, aproximadamente, o tempo de espera do último pacote da fila?",
    opts: ["Cerca de 0,15 s", "Cerca de 1,2 s", "Cerca de 12 s", "Cerca de 2,4 s"], ind: 1,
    exp: "500 × 1514 × 8 = 6 056 000 bits; a 5 000 000 bit/s são cerca de 1,2 s. É o excesso de fila (bufferbloat) que a gestão activa de fila fq_codel reduz; 2,4 s corresponderia a 1000 pacotes.",
    obj: "Reconhecer o excesso de fila (bufferbloat) e reduzi-lo com a gestão activa de fila fq_codel.",
    r: ["R04"], fonte: "rfc8290",
  },
  {
    cod: "RED-M10-L5-01", m: 10, l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício: um utilizador da delegação diz que o portal interno «está lento». O curl --write-out devolve: time_namelookup 3,50 s; time_connect 3,51 s; time_starttransfer 3,53 s; time_total 3,60 s. O ping por endereço ao servidor dá 0% de perda e os contadores do tc não mostram descartes. Onde está, provavelmente, a demora?",
    opts: [
      "No servidor web, que demora a produzir a primeira resposta",
      "Na ligação TCP, porque o valor de time_connect é de 3,51 s",
      "Na transferência, por limitação de débito na classe do htb",
      "Na resolução de nomes, que ocupa quase todo o tempo total",
    ], ind: 3,
    exp: "Os tempos do curl são acumulados desde o início. A resolução do nome leva 3,50 s; a ligação acrescenta só 0,01 s, o primeiro byte 0,02 s e a transferência 0,07 s. Aponta para DNS; confirma-se antes de corrigir.",
    obj: "Usar curl --write-out, ping, mtr, iperf3 e os contadores do tc para separar lentidão do servidor, perda na ligação e limitação de débito.",
    r: ["R04", "R15"], fonte: "curl",
  },

  // ─── Módulo 11 — Gestão e Monitorização de Redes ───
  {
    cod: "RED-M11-L1-01", m: 11, l: 1, t: "vf", d: "f",
    e: "Verdadeiro ou falso: para acelerar uma recuperação, a ficha de cada equipamento no inventário deve incluir as palavras-passe e cadeias SNMP de gestão.",
    val: false,
    exp: "Falso. A documentação não guarda segredos: palavras-passe, chaves e cadeias SNMP ficam num cofre de credenciais com acesso controlado; o inventário diz apenas onde estão.",
    obj: "Explicar para que servem o inventário de activos de rede, o diagrama lógico e a ficha de cada equipamento, e que informação nunca deve constar neles (palavras-passe, chaves).",
    r: ["R15", "R17"], fonte: "nist800128",
  },
  {
    cod: "RED-M11-L2-01", m: 11, l: 2, t: "em", d: "me",
    e: "Duas leituras de ifHCInOctets numa interface de 100 Mbit/s, com 300 segundos de intervalo, diferem em 450 000 000 bytes. Qual foi a utilização média de entrada nesse intervalo?",
    opts: ["1,5%", "48%", "12%", "3,75%"], ind: 2,
    exp: "450 000 000 × 8 = 3 600 000 000 bits; a dividir por 300 s dá 12 Mbit/s; 12 / 100 = 12%. O contador conta bytes, por isso multiplica-se por 8.",
    obj: "Calcular a utilização de uma interface a partir de contadores e definir um alerta com limiar, persistência e histerese justificados.",
    r: ["R09"], fonte: "rfc2863",
  },
  {
    cod: "RED-M11-L2-02", m: 11, l: 2, t: "em", cen: true, d: "di",
    e: "Caso fictício: o alerta de utilização da ligação da DPE abre quando 3 amostras seguidas passam de 80% e fecha quando uma amostra fica abaixo de 70%. As amostras, por ordem, foram: 85, 78, 82, 84, 83, 75, 72 e 69%. Em que amostras o alerta abre e fecha?",
    opts: [
      "Abre na 5.ª amostra e fecha na 8.ª",
      "Abre na 1.ª amostra e fecha na 2.ª",
      "Abre na 5.ª amostra e fecha na 6.ª",
      "Nunca abre, por causa da amostra de 78%",
    ], ind: 0,
    exp: "A amostra de 78% interrompe a primeira sequência; 82, 84 e 83 são três seguidas acima de 80%, logo abre na 5.ª. Com histerese, 75 e 72 não fecham (não ficam abaixo de 70%); fecha com 69%, na 8.ª.",
    obj: "Calcular a utilização de uma interface a partir de contadores e definir um alerta com limiar, persistência e histerese justificados.",
    r: ["R09"], fonte: "rfc2863",
  },
  {
    cod: "RED-M11-L3-01", m: 11, l: 3, t: "cor", d: "f",
    e: "Associe cada valor de uma mensagem syslog (RFC 5424) ao seu significado.",
    pares: [
      { esquerda: "Severidade 0", direita: "emerg — sistema inutilizável" },
      { esquerda: "Severidade 4", direita: "warning — aviso" },
      { esquerda: "Severidade 7", direita: "debug — depuração" },
      { esquerda: "Facilidade auth", direita: "Origem lógica: autenticação" },
    ],
    exp: "A severidade vai de 0 (emerg) a 7 (debug); a facilidade indica a origem lógica da mensagem (kern, auth, daemon, local0…).",
    obj: "Explicar a estrutura de uma mensagem syslog (RFC 5424: facilidade, severidade, data, origem, programa, mensagem) e porque se centralizam os registos.",
    r: ["R09"], fonte: "rfc5424",
  },
  {
    cod: "RED-M11-L4-01", m: 11, l: 4, t: "em", d: "me",
    e: "A exportação nocturna para o git mostra, no r2, uma regra nftables nova que não corresponde a nenhum pedido de alteração aprovado. Como se classifica e o que se faz?",
    opts: [
      "É uma alteração normal; o git já a registou e não há mais a fazer",
      "É uma falha do script; apagar o commit para limpar o histórico",
      "É um ataque confirmado; desligar o r2 até haver novo equipamento",
      "É um desvio; investigar a origem, repor a linha de base e verificar",
    ], ind: 3,
    exp: "Uma diferença sem pedido aprovado é um desvio: pode ser erro, remendo esquecido ou ataque, o que só a investigação esclarece. Repõe-se a linha de base e verifica-se. Apagar o commit destrói a evidência.",
    obj: "Detectar uma alteração não autorizada pela diferença no git e repor a linha de base, verificando depois.",
    r: ["R14", "R17"], fonte: "nist800128",
  },
  {
    cod: "RED-M11-L5-01", m: 11, l: 5, t: "em", cen: true, d: "me",
    e: "Caso fictício: com 12 meses de p95 mensal, a regressão linear indica que a ligação da DPE atinge o limiar de 70% dentro de 10 meses. Aprovação orçamental, concurso, instalação pelo operador e testes demoram, em conjunto, cerca de 8 meses. Qual decisão segue a lição?",
    opts: [
      "Esperar até o p95 passar de 70% para ter a certeza do problema",
      "Iniciar já o processo, revendo a projecção todos os trimestres",
      "Decidir só daqui a 8 meses, quando faltarem 2 para o limiar",
      "Trocar já a média pelo máximo mensal para adiar a decisão",
    ], ind: 1,
    exp: "Conta-se para trás a partir do mês previsto: com 8 meses de processo e o limiar a 10, a decisão é agora. A projecção é uma extrapolação e revê-se com o calendário de projectos conhecidos.",
    obj: "Projectar com regressão linear o mês em que a utilização atinge um limiar justificado, e explicar os limites da projecção.",
    r: ["R01", "R16"], fonte: "pythonstd",
  },

  // ─── Módulo 12 — Segurança Aplicada e Auditoria de Redes ───
  {
    cod: "RED-M12-L1-01", m: 12, l: 1, t: "cor", d: "f",
    e: "Associe cada princípio de controlo de acessos na rede ao que garante.",
    pares: [
      { esquerda: "Negação por omissão", direita: "Tudo é recusado excepto o expressamente autorizado" },
      { esquerda: "Menor privilégio", direita: "Só o necessário à função, pelo tempo necessário" },
      { esquerda: "Autenticação", direita: "Limita quem entra no serviço" },
      { esquerda: "Segmentação", direita: "Limita quem chega a quê ao nível da rede" },
    ],
    exp: "São camadas complementares: a firewall não sabe quem é a pessoa, só de onde vem o pacote; a autenticação não impede que alguém chegue à porta.",
    obj: "Explicar controlo de acessos na rede: identidade, autorização por função, menor privilégio, negação por omissão e segmentação como camadas complementares.",
    r: ["R07", "R12"], fonte: "nist800207",
  },
  {
    cod: "RED-M12-L2-01", m: 12, l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: a pontuação CVSS associada a um CVE mede o risco que essa vulnerabilidade representa para a instituição.",
    val: false,
    exp: "Falso. O CVSS resume a gravidade técnica; o risco na instituição depende também da exposição do equipamento, das correcções aplicadas e do impacto.",
    obj: "Explicar a gestão de vulnerabilidades dos equipamentos: inventário de versões, avisos do fabricante, identificadores CVE e janelas de actualização.",
    r: ["R06"], fonte: "firstcvss",
  },
  {
    cod: "RED-M12-L3-01", m: 12, l: 3, t: "em", d: "me",
    e: "No varrimento autorizado, a ferramenta infere uma versão de servidor web à qual associa um CVE. O registo de alterações do pacote instalado no srv mostra que a distribuição já aplicou a correcção desse CVE, mantendo o número de versão. Como se classifica o achado?",
    opts: [
      "Confirmado, porque a ferramenta identificou a versão do servidor",
      "Indício, porque nenhuma verificação posterior tem valor de prova",
      "Não aplicável, porque o servidor ficou fora do âmbito autorizado",
      "Falso positivo, porque a verificação mostra que não se aplica",
    ], ind: 3,
    exp: "A versão inferida era um indício; a verificação por outra via (registo de alterações do pacote) mostra que a correcção está aplicada, pelo que o achado é falso positivo, com a evidência registada.",
    obj: "Classificar cada achado como indício, confirmado ou falso positivo, com a verificação que o suporta, e produzir um plano de remediação com prioridades e reteste.",
    r: ["R06", "R10"], fonte: "nist800115",
  },
  {
    cod: "RED-M12-L4-01", m: 12, l: 4, t: "em", d: "me",
    e: "O controlo «retenção de registos de 90 dias» está no âmbito da auditoria. A equipa só obteve uma declaração verbal do responsável; o receptor de registos não pôde ser consultado. Que resultado se regista?",
    opts: [
      "Conforme, porque o responsável confirmou o cumprimento",
      "Não verificado (evidência insuficiente), com limitação e acção",
      "Não aplicável, porque faltou a prova durante a auditoria",
      "Não conforme, porque não havia registos para mostrar",
    ], ind: 1,
    exp: "Sem evidência, não se conclui cumprimento nem incumprimento: regista-se «não verificado (evidência insuficiente)», a limitação e a acção para concluir. «Não aplicável» só serve para controlos fora do âmbito, com justificação.",
    obj: "Recolher evidências reprodutíveis, registar «conforme», «não conforme», «parcial», «não verificado (evidência insuficiente)» ou, só para controlos fora do âmbito, «não aplicável» com justificação, e evitar conclusões sem prova.",
    r: ["R10", "R08"], fonte: "nist80053a",
  },
  {
    cod: "RED-M12-L4-02", m: 12, l: 4, t: "em", cen: true, d: "di",
    e: "Caso fictício: na auditoria à rede de prática da DPE, A01 tem saída do nft com «policy drop» e teste negativo recusado; A03 tem varrimento a mostrar telnet (23/tcp) aberto no r1; A07 trata da rede sem fios da delegação, excluída do âmbito aprovado por não existir; A05 (hora sincronizada) não pôde ser consultado. Qual conjunto de resultados é correcto?",
    opts: [
      "A01 conforme; A03 não conforme; A07 não aplicável justificado; A05 não verificado",
      "A01 conforme; A03 parcial; A07 não verificado; A05 não aplicável por falta de prova",
      "A01 não verificado; A03 não conforme; A07 conforme; A05 conforme por declaração",
      "A01 conforme; A03 não conforme; A07 não conforme; A05 não aplicável sem nota",
    ], ind: 0,
    exp: "A01 tem evidência de cumprimento; A03 tem evidência de incumprimento (gestão por protocolo não cifrado); A07 está fora do âmbito, com justificação sustentada; A05 não tem evidência, logo é «não verificado», com limitação e acção — nunca «não aplicável» por falta de prova.",
    obj: "Recolher evidências reprodutíveis, registar «conforme», «não conforme», «parcial», «não verificado (evidência insuficiente)» ou, só para controlos fora do âmbito, «não aplicável» com justificação, e evitar conclusões sem prova.",
    r: ["R10", "R08"], fonte: "nist80053a",
  },
  {
    cod: "RED-M12-L5-01", m: 12, l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício: o registo de acções da DPE tem 10 acções; 8 estão marcadas «fechada», mas só 6 têm reteste positivo. Uma das fechadas, «retirar telnet do r1», tem reteste com 23/tcp ainda aberto. Qual é o valor do indicador «acções concluídas com reteste positivo» e o estado correcto dessa acção?",
    opts: [
      "80%; a acção mantém-se fechada porque foi executada",
      "75%; a acção fica fechada com uma nota de observação",
      "60%; a acção reabre, porque o reteste não foi positivo",
      "100%; o indicador conta só as acções marcadas fechadas",
    ], ind: 2,
    exp: "O indicador conta as acções com reteste positivo sobre o total: 6 / 10 = 60%. Fechada não é eficaz: sem reteste positivo, a acção reabre.",
    obj: "Distinguir acção fechada de acção eficaz: sem reteste positivo, a acção reabre.",
    r: ["R08", "R15"], fonte: "nist800137",
  },
];
