/**
 * Curso de Redes — módulo 10 (Qualidade de Serviço e Desempenho).
 * Conteúdo fictício e didáctico; ver regras em redes-base.ts.
 * Laboratórios NÃO executados neste ambiente: as saídas são exemplos didácticos,
 * não resultados medidos. Pré-requisito comum: rede DPE criada com lab-base.sh
 * (módulo 1, lição 1) numa máquina virtual Debian 12 descartável, após a
 * pré-verificação de nomes (lab-verificar.sh); rotas sede–delegação do módulo 3
 * aplicadas. Pacotes adicionais deste módulo: iperf3, mtr-tiny, curl.
 * Limites das simulações: tc netem e tc htb correm no mesmo núcleo Linux da VM;
 * os números dependem do processador da VM e não representam uma ligação real
 * de operador. Servem para comparar cenários, não para prometer valores.
 * Cada lição altera apenas filas (qdisc) das interfaces da rede DPE, tabelas
 * nftables com prefixo «qos_lab» e ficheiros em /tmp/dpe-m10; a reversão
 * remove só isso.
 */
import { TOPOLOGIA_BASE, type ConteudoLicao } from "./redes-base";

/** Pré-verificação comum às cinco lições (não cria nem apaga nada). */
const PRE_M10 = {
  accao:
    "Pré-verificação (não altera nada): confirme ferramentas, que a rede DPE existe, que a delegação chega ao srv e que as interfaces WAN só têm a fila por omissão. Se alguma interface já tiver outra fila, pare: pode pertencer a outra lição não revertida — reverta-a primeiro.",
  comandos: [
    "for d in iperf3 mtr curl tc nft tshark; do command -v $d >/dev/null || echo \"Em falta: $d\"; done",
    "ip netns list | grep -E '^(r1|r2|srv|pc-del)( |$)'",
    "sudo ip netns exec pc-del ping -c 3 10.10.20.53",
    "sudo ip netns exec r1 tc qdisc show dev r1-r2; sudo ip netns exec r2 tc qdisc show dev r2-r1",
    "sudo ip netns exec r2 nft list tables | grep qos_lab || echo 'sem tabelas qos_lab'",
  ],
  saida: [
    "(nenhuma linha «Em falta»)",
    "r1 (id: 2) … r2 (id: 3) … srv (id: 1) … pc-del (id: 4)",
    "3 packets transmitted, 3 received, 0% packet loss",
    "qdisc noqueue 0: root refcnt 2",
    "qdisc noqueue 0: root refcnt 2",
    "sem tabelas qos_lab",
  ],
};

export const LICOES_M10: Record<string, ConteudoLicao> = {
  "r-m10-l1": {
    objectivos: [
      "Distinguir débito (throughput), débito útil (goodput), atraso de ida e volta (RTT), atraso unilateral, variação do atraso (jitter) e perda, e dizer o que cada ferramenta mede de facto.",
      "Medir RTT com ping, caminho e perda por salto com mtr, e débito TCP e UDP com iperf3, na rede de prática.",
      "Registar medições com hora, origem, destino, ferramenta, parâmetros e número de repetições, sem extrapolar para além do que foi medido.",
    ],
    explicacao: [
      {
        titulo: "O que se mede e com que palavras",
        paragrafos: [
          "Débito (throughput) é a quantidade de bits que atravessa um ponto por segundo, contando cabeçalhos. Débito útil (goodput) é só a parte que chega à aplicação: sem cabeçalhos Ethernet, IP e TCP e sem retransmissões. Numa ligação Ethernet com pacotes TCP de 1500 bytes, os cabeçalhos ocupam cerca de 5 % a 6 %; por isso uma ligação de 10 Mbit/s nunca entrega 10 Mbit/s de ficheiro. O RFC 6349 descreve como testar débito TCP de forma comparável.",
          "Atraso de ida e volta (RTT, RFC 2681) é o tempo entre enviar um pacote e receber a resposta; é o que o ping mostra. Atraso unilateral (RFC 7679) é o tempo só num sentido e exige relógios sincronizados nas duas pontas, com erro conhecido; dividir o RTT por dois só é aproximação se os dois sentidos forem iguais, o que numa WAN nem sempre acontece. Variação do atraso (jitter, RFC 3393 para a métrica IPPM; o RTP usa a estimativa do RFC 3550) mede o quanto o atraso muda de pacote para pacote. Perda (RFC 7680) é a percentagem de pacotes enviados que não chegam.",
        ],
      },
      {
        titulo: "O que cada ferramenta mostra — e o que não mostra",
        paragrafos: [
          "ping envia ICMP Echo e mostra RTT e perda de ICMP. Encaminhadores podem tratar ICMP com prioridade baixa ou limitá-lo; uma perda de ping num salto intermédio não prova perda para o tráfego real. mtr combina traceroute e ping salto a salto; lê-se sempre a partir do destino (módulo 9, lição 5). iperf3 cria tráfego de teste entre um cliente e um servidor iperf3: em TCP mostra o débito de dados da aplicação (próximo do goodput) e as retransmissões; em UDP envia ao ritmo pedido (-b) e o servidor relata jitter e perda.",
          "Uma medição só vale nas condições em que foi feita: hora, caminho, tamanho dos pacotes, duração, número de fluxos e carga da rede. Um teste de 10 segundos às 10h00 não descreve a ligação às 15h00. Repete-se várias vezes e regista-se mínimo, mediana e máximo. Um teste de débito também ocupa a ligação: numa rede de produção só se faz com autorização e fora do horário de serviço.",
        ],
      },
    ],
    caso: "A delegação distrital da Direcção Provincial de Exemplo (DPE, fictícia) queixa-se de que «a rede está lenta». O chefe pede números antes de contactar o operador. A equipa vai medir, na rede de prática que reproduz a sede e a delegação, RTT, perda por salto e débito, e aprender a escrever um registo de medição que outra pessoa consiga repetir. Todos os valores são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "A ligação r1–r2 (10.255.0.0/30) representa a WAN sede–delegação.",
        "Nesta lição a WAN é limitada a 10 Mbit/s e 40 ms num sentido com tc netem em r2-r1, só dentro do espaço de nomes r2. Nota: o netem com «rate» limita o débito ao nível do pacote IP e mais cabeçalho Ethernet; não imita todas as propriedades de uma ligação real.",
      ],
      passos: [
        PRE_M10,
        { accao: "Crie a pasta própria da lição para guardar resultados (só esta pasta é apagada na reversão).", comandos: ["mkdir -p /tmp/dpe-m10/l1"] },
        { accao: "Simule a WAN: 40 ms e 10 Mbit/s na saída de r2 para r1 (sentido delegação → sede).", comandos: ["sudo ip netns exec r2 tc qdisc add dev r2-r1 root netem delay 40ms rate 10mbit", "sudo ip netns exec r2 tc qdisc show dev r2-r1"], saida: ["qdisc netem 8001: root refcnt 2 limit 1000 delay 40ms rate 10Mbit"] },
        { accao: "RTT: 20 pings, um a cada 0,2 s. Guarde a saída. Observe que o atraso foi posto só num sentido, mas o ping mede ida e volta.", comandos: ["sudo ip netns exec pc-del ping -c 20 -i 0.2 10.10.20.53 | tee /tmp/dpe-m10/l1/ping.txt | tail -2"], saida: ["20 packets transmitted, 20 received, 0% packet loss, time 3805ms", "rtt min/avg/max/mdev = 40.1/40.3/40.9/0.2 ms"] },
        { accao: "Caminho salto a salto com mtr (20 ciclos, relatório).", comandos: ["sudo ip netns exec pc-del mtr -n -r -c 20 10.10.20.53 | tee /tmp/dpe-m10/l1/mtr.txt"], saida: ["HOST                Loss%  Snt   Avg  Best  Wrst", "1. 10.20.10.1         0.0%   20   0.1   0.0   0.2", "2. 10.255.0.1         0.0%   20  40.2  40.1  40.6", "3. 10.10.20.53        0.0%   20  40.3  40.1  40.8"] },
        { accao: "Consola C: inicie o servidor iperf3 no srv. A opção -1 faz o servidor terminar sozinho depois de um teste (esperar «Server listening on 5201»).", comandos: ["sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53"], saida: ["Server listening on 5201"] },
        { accao: "Débito TCP delegação → sede durante 10 s. Anote o débito do receptor e as retransmissões (Retr).", comandos: ["sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -t 10 | tee /tmp/dpe-m10/l1/tcp.txt | tail -4"], saida: ["[ ID] Interval       Transfer     Bitrate         Retr", "[  5] 0.00-10.00 sec  11.2 MBytes  9.40 Mbits/sec    0   sender", "[  5] 0.00-10.04 sec  11.1 MBytes  9.28 Mbits/sec        receiver", "(9,3 Mbit/s de dados da aplicação numa ligação limitada a 10 Mbit/s: a diferença são cabeçalhos)"] },
        { accao: "Consola C: volte a iniciar o servidor (terminou após o teste). Débito UDP a 2 Mbit/s: o servidor relata jitter e perda.", comandos: ["sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53", "sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -u -b 2M -t 10 | tee /tmp/dpe-m10/l1/udp.txt | tail -3"], saida: ["[ ID] Interval       Transfer     Bitrate         Jitter    Lost/Total Datagrams", "[  5] 0.00-10.04 sec  2.38 MBytes  1.99 Mbits/sec  0.041 ms  0/1726 (0%)  receiver"] },
        { accao: "Acrescente 1 % de perda à simulação e repita só o TCP (servidor iniciado de novo na consola C). Compare o débito.", comandos: ["sudo ip netns exec r2 tc qdisc change dev r2-r1 root netem delay 40ms rate 10mbit loss 1%", "sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53", "sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -t 10 | tee /tmp/dpe-m10/l1/tcp-perda.txt | tail -3"], saida: ["[  5] 0.00-10.00 sec  4.10 MBytes  3.44 Mbits/sec   93   sender", "[  5] 0.00-10.04 sec  3.98 MBytes  3.33 Mbits/sec        receiver", "(o valor exacto varia em cada execução e com o algoritmo de congestionamento do núcleo)"] },
        { accao: "Escreva o registo de medição em /tmp/dpe-m10/l1/registo.txt: data e hora, origem, destino, ferramenta e parâmetros, duração, repetições, resultado, condições (simulação netem indicada).", comandos: ["nano /tmp/dpe-m10/l1/registo.txt"] },
      ],
      sucesso: [
        "A dupla apresenta RTT (mín./média/máx.), perda por salto, débito TCP do receptor, jitter e perda UDP, cada um com a ferramenta e os parâmetros usados.",
        "O formando explica porque o iperf3 mostra menos de 10 Mbit/s numa ligação de 10 Mbit/s sem perda.",
        "O formando explica porque 1 % de perda reduz muito o débito TCP e porque o ping não mostra isso por si só.",
        "O registo permite a outra dupla repetir o teste nas mesmas condições.",
      ],
      reversao: [
        "sudo ip netns exec r2 tc qdisc del dev r2-r1 root",
        "Se o servidor iperf3 ainda estiver à espera na consola C: Ctrl+C nessa consola (não usar pkill/killall).",
        "Guardar o registo fora da VM, se necessário, e depois: rm -r /tmp/dpe-m10/l1",
        "Verificar: sudo ip netns exec r2 tc qdisc show dev r2-r1 deve mostrar só «qdisc noqueue»; sudo ip netns pids srv não deve listar nenhum iperf3.",
      ],
    },
    papel: [
      { tarefa: "Com as saídas de exemplo, preencha: medida | ferramenta | valor. (RTT médio, perda até ao destino, débito TCP receptor sem perda, débito TCP receptor com 1 % de perda, jitter UDP).", esperado: "RTT médio | ping | 40,3 ms. Perda até ao destino | mtr | 0 %. TCP sem perda | iperf3 | 9,28 Mbit/s. TCP com 1 % de perda | iperf3 | 3,33 Mbit/s. Jitter UDP | iperf3 -u | 0,041 ms." },
      { tarefa: "Uma ligação de 10 Mbit/s transfere ficheiros a 9,3 Mbit/s. O operador está a falhar o contrato?", esperado: "Não necessariamente. O iperf3 mostra débito útil da aplicação; os cabeçalhos Ethernet, IP e TCP ocupam cerca de 5–6 % em pacotes de 1500 bytes. Só se compara com o contrato depois de saber como o operador define a velocidade (normalmente ao nível da ligação) e medindo várias vezes." },
      { tarefa: "O ping mostra RTT de 80 ms. Um colega escreve no relatório «atraso unilateral = 40 ms». Está correcto?", esperado: "Só como aproximação e se os dois sentidos forem simétricos. O atraso unilateral mede-se com relógios sincronizados nas duas pontas (RFC 7679). No relatório deve escrever «RTT = 80 ms (ping)»." },
      { tarefa: "Escreva um registo de medição completo para o teste TCP sem perda.", esperado: "Exemplo: 2026-09-28 10:15; origem pc-del 10.20.10.10; destino srv 10.10.20.53; iperf3 3.x TCP, 1 fluxo, 10 s, sentido delegação→sede; 1 repetição (deviam ser pelo menos 3); resultado receptor 9,28 Mbit/s, 0 retransmissões; condições: rede de prática com netem 40 ms e 10 Mbit/s em r2-r1." },
    ],
    formativas: [
      { pergunta: "O que mostra o valor «Bitrate» do receptor num teste TCP do iperf3?", opcoes: ["O débito total da ligação, incluindo todos os cabeçalhos", "O débito de dados da aplicação que chegou, próximo do débito útil (goodput)", "O atraso unilateral", "A largura de banda contratada ao operador"], certa: 1, comentario: "O iperf3 conta os bytes que a aplicação de teste enviou e recebeu. Cabeçalhos e retransmissões não entram, por isso o valor fica abaixo do débito da ligação. Não diz nada sobre o contrato." },
      { pergunta: "O ping mostra 0 % de perda, mas o iperf3 TCP cai de 9 para 3 Mbit/s. Qual é a explicação mais provável na simulação?", opcoes: ["O ping está avariado", "Com 1 % de perda, 20 pings podem não perder nenhum, mas o TCP reduz a janela a cada perda e o débito cai", "O servidor iperf3 é lento", "A VLAN está errada"], certa: 1, comentario: "Uma amostra pequena de pings não detecta perdas de 1 % de forma fiável; o TCP reage a cada perda reduzindo o ritmo. Por isso medem-se várias grandezas e com amostras suficientes." },
    ],
    leituraFacil: [
      "Medir a rede é ver números, não opiniões.",
      "O ping mede quanto tempo um pacote vai e volta.",
      "O iperf3 mede quantos dados passam por segundo.",
      "Os dados úteis são sempre um pouco menos do que a velocidade da ligação.",
      "Uma perda pequena de pacotes pode deixar tudo muito lento.",
      "Escreva sempre quando, onde e como mediu.",
    ],
    guiao: {
      conducao: [
        "0–20 min: débito e débito útil; RTT e atraso unilateral; jitter e perda; o que ping, mtr e iperf3 medem e não medem; caso da delegação.",
        "20–60 min: prática em duplas (pré-verificação, netem, ping, mtr, iperf3 TCP e UDP, perda 1 %, registo); quem não tiver laboratório preenche a tabela e o registo em papel com as saídas de exemplo.",
        "60–70 min: formativas e correcção comentada; comparar registos entre duplas.",
      ],
      errosComuns: [
        "Chamar «largura de banda» ao resultado do iperf3 e compará-lo directamente com o contrato.",
        "Escrever RTT/2 como atraso unilateral medido.",
        "Tirar conclusões de um único teste curto.",
        "Esquecer de remover o netem; as lições seguintes ficariam lentas e com resultados errados.",
        "Fazer testes de débito na rede de produção sem autorização e em horário de serviço.",
      ],
    },
    fontes: ["rfc2681", "rfc7679", "rfc3393", "rfc7680", "rfc6349", "rfc3550", "iperf3", "mtr", "tcqdisc", "iproute2"],
  },

  "r-m10-l2": {
    objectivos: [
      "Explicar o modelo de serviços diferenciados (DiffServ): classificação, marcação DSCP, comportamento por salto e fronteira de confiança.",
      "Marcar tráfego de voz com DSCP EF num encaminhador com nftables e dar-lhe prioridade numa fila htb com tc, só na ligação congestionada.",
      "Justificar porque a marcação não cria largura de banda, só actua quando há congestionamento e não é um mecanismo de segurança.",
    ],
    explicacao: [
      {
        titulo: "DiffServ: marcar e tratar",
        paragrafos: [
          "No cabeçalho IP há um campo de 6 bits chamado DSCP (RFC 2474). O valor não faz nada sozinho: cada equipamento que o lê aplica um comportamento por salto (PHB) configurado pelo administrador (arquitectura no RFC 2475). O RFC 4594 sugere classes: EF (46, RFC 3246) para voz, AF41 (34) para videoconferência, CS0/predefinido (0) para o resto, e classes de menor prioridade para cópias de segurança.",
          "Três passos: classificar (reconhecer o tráfego, por exemplo porto UDP ou endereço do servidor de voz), marcar (escrever o DSCP) e tratar (colocar cada marca numa fila com regras próprias na interface de saída). Se um equipamento do caminho ignorar ou apagar a marca, o tratamento pára aí. Na Internet pública os operadores normalmente não respeitam marcas de clientes; numa WAN de operador, só vale o que estiver no contrato.",
        ],
      },
      {
        titulo: "O que a prioridade não faz",
        paragrafos: [
          "A prioridade só muda a ordem de saída quando há fila, isto é, quando chega mais tráfego do que a ligação consegue enviar. Sem congestionamento, todas as filas estão vazias e a marcação não tem efeito visível. A prioridade também não aumenta a capacidade: numa ligação de 2 Mbit/s, dar prioridade à voz tira tempo às outras aplicações. Se a voz marcada exceder a capacidade reservada, também sofre.",
          "A marcação não é segurança. Qualquer computador pode escrever EF nos seus pacotes; se a rede confiar cegamente, um programa de descarregamentos marcado EF passa à frente da voz. Por isso define-se uma fronteira de confiança: no primeiro equipamento controlado pela equipa, apagam-se as marcas recebidas dos postos e volta-se a marcar segundo a política. O DSCP também não cifra nem autentica nada.",
        ],
      },
    ],
    caso: "Na delegação da DPE (fictícia), as chamadas de voz para a sede cortam quando alguém envia relatórios grandes. A WAN simulada tem 2 Mbit/s. A política aprovada pelo chefe diz: a voz (fictícia, UDP porto 5202) recebe EF e até 500 kbit/s garantidos; o resto partilha o que sobra; marcas vindas dos postos não são aceites. Todos os valores são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "A ligação r1–r2 representa a WAN; na saída r2-r1 (delegação → sede) cria-se congestionamento com htb a 2 Mbit/s.",
        "Voz simulada: iperf3 UDP a 300 kbit/s para o porto 5202 do srv. Tráfego pesado: iperf3 TCP para o porto 5201.",
        "Marcação em r2 com a tabela nftables «qos_lab» (nome reservado desta lição).",
      ],
      passos: [
        PRE_M10,
        { accao: "Crie a ligação congestionável: htb a 2 Mbit/s com duas classes (1:10 voz, garantia 500 kbit/s; 1:20 restante, 1500 kbit/s), ambas podendo usar até 2 Mbit/s. Por omissão tudo vai para 1:20. Ainda não há filtro: a voz vai para 1:20.", comandos: ["sudo ip netns exec r2 tc qdisc add dev r2-r1 root handle 1: htb default 20", "sudo ip netns exec r2 tc class add dev r2-r1 parent 1: classid 1:1 htb rate 2mbit", "sudo ip netns exec r2 tc class add dev r2-r1 parent 1:1 classid 1:10 htb rate 500kbit ceil 2mbit prio 0", "sudo ip netns exec r2 tc class add dev r2-r1 parent 1:1 classid 1:20 htb rate 1500kbit ceil 2mbit prio 1", "sudo ip netns exec r2 tc class show dev r2-r1"], saida: ["class htb 1:1 root rate 2Mbit ceil 2Mbit …", "class htb 1:10 parent 1:1 prio 0 rate 500Kbit ceil 2Mbit …", "class htb 1:20 parent 1:1 prio 1 rate 1500Kbit ceil 2Mbit …"] },
        { accao: "Consolas C e D: dois servidores iperf3 no srv, um por porto (esperar «Server listening» em cada).", comandos: ["C: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53 -p 5201", "D: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53 -p 5202"] },
        { accao: "Medição sem prioridade. Consola B: tráfego pesado TCP durante 30 s. Logo a seguir, na consola A: voz simulada durante 20 s. Anote jitter e perda da voz.", comandos: ["B: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -p 5201 -t 30", "A: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -p 5202 -u -b 300k -l 200 -t 20 | tail -2"], saida: ["[  5] 0.00-20.00 sec  …  297 Kbits/sec  21.7 ms  412/3750 (11%)  receiver", "(jitter e perda altos: a voz espera na mesma fila que o TCP; os números variam em cada execução)"] },
        { accao: "Acrescente o filtro que envia DSCP EF (46; byte TOS 0xb8) para a classe 1:10. Sem marcação ainda, nada muda — confirme repetindo o passo anterior se houver tempo.", comandos: ["sudo ip netns exec r2 tc filter add dev r2-r1 parent 1: protocol ip prio 1 u32 match ip dsfield 0xb8 0xfc flowid 1:10"] },
        { accao: "Fronteira de confiança e marcação em r2: primeiro apagar todas as marcas que chegam dos postos da delegação; depois marcar EF só a voz (UDP 5202). A ordem das regras importa.", comandos: ["sudo ip netns exec r2 nft add table ip qos_lab", "sudo ip netns exec r2 nft add chain ip qos_lab marcar '{ type filter hook prerouting priority mangle; policy accept; }'", "sudo ip netns exec r2 nft add rule ip qos_lab marcar iifname \"r2-pc-del\" ip dscp set cs0", "sudo ip netns exec r2 nft add rule ip qos_lab marcar iifname \"r2-pc-del\" udp dport 5202 ip dscp set ef", "sudo ip netns exec r2 nft list table ip qos_lab"], saida: ["table ip qos_lab {", "  chain marcar {", "    type filter hook prerouting priority mangle; policy accept;", "    iifname \"r2-pc-del\" ip dscp set cs0", "    iifname \"r2-pc-del\" udp dport 5202 ip dscp set ef", "  }", "}"] },
        { accao: "Consola E: confirme a marca depois de r2, capturando na entrada de r1 (esperar «Capturing on 'r1-r2'»). Reinicie os servidores nas consolas C e D e repita a medição do passo 3.", comandos: ["E: sudo ip netns exec r1 tshark -i r1-r2 -c 5 -f 'udp port 5202' -T fields -e ip.dsfield.dscp", "(repetir consolas C, D, B e A do passo 3)"], saida: ["46", "46", "46", "46", "46", "A: [  5] 0.00-20.00 sec  …  299 Kbits/sec  0.35 ms  0/3750 (0%)  receiver", "B: débito TCP cerca de 1,6 Mbit/s (a voz usa parte dos 2 Mbit/s)"] },
        { accao: "Teste da fronteira de confiança: um posto tenta marcar o TCP pesado como EF (-S 0xb8). Capture na consola E durante o teste. A marca deve chegar a r1 como 0.", comandos: ["E: sudo ip netns exec r1 tshark -i r1-r2 -c 5 -f 'tcp port 5201' -T fields -e ip.dsfield.dscp", "C: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53 -p 5201", "B: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -p 5201 -t 5 -S 0xb8"], saida: ["0", "0", "0", "0", "0"] },
        { accao: "Veja os contadores por classe: a classe 1:10 tem os bytes da voz, a 1:20 os do TCP e as descartadas (dropped).", comandos: ["sudo ip netns exec r2 tc -s class show dev r2-r1"], saida: ["class htb 1:10 … Sent 752000 bytes 3760 pkt (dropped 0, overlimits 0 requeues 0)", "class htb 1:20 … Sent 9870000 bytes 6520 pkt (dropped 87, overlimits 0 requeues 0)"] },
      ],
      sucesso: [
        "A dupla mostra jitter e perda da voz antes e depois da prioridade, com os mesmos parâmetros.",
        "A captura mostra DSCP 46 na voz e 0 no TCP marcado pelo posto.",
        "O formando explica porque o débito TCP desceu quando a voz passou a ter prioridade e porque, sem o TCP a correr, não haveria diferença.",
        "O formando justifica a regra que apaga marcas dos postos com um exemplo de abuso.",
      ],
      reversao: [
        "sudo ip netns exec r2 nft delete table ip qos_lab",
        "sudo ip netns exec r2 tc qdisc del dev r2-r1 root (remove também classes e filtros)",
        "Ctrl+C nas consolas C, D e E se algum processo ainda estiver à espera (não usar pkill/killall).",
        "Verificar: tc qdisc show dev r2-r1 mostra só «qdisc noqueue»; nft list tables em r2 não mostra qos_lab; ip netns pids srv não lista iperf3.",
      ],
    },
    papel: [
      { tarefa: "Com as saídas de exemplo, preencha: cenário | jitter da voz | perda da voz | débito TCP. (sem prioridade; com EF e classe 1:10).", esperado: "Sem prioridade | 21,7 ms | 11 % | quase 2 Mbit/s menos a voz. Com EF | 0,35 ms | 0 % | cerca de 1,6 Mbit/s." },
      { tarefa: "O chefe pergunta: «Se marcarmos tudo como EF, tudo fica rápido?» Responda.", esperado: "Não. Se tudo for EF, tudo cai na mesma fila e ninguém tem prioridade; a capacidade continua 2 Mbit/s. A prioridade só serve para escolher quem espera menos quando há congestionamento." },
      { tarefa: "Porque a regra «ip dscp set cs0» vem antes da regra que marca EF? O que aconteceria se estivessem ao contrário?", esperado: "As regras são avaliadas por ordem e ambas alteram o pacote. Ao contrário, a voz seria marcada EF e logo a seguir apagada para CS0, perdendo a prioridade." },
      { tarefa: "Um fornecedor diz que o DSCP EF «protege» as chamadas contra escutas. Comente.", esperado: "Errado. O DSCP é um número no cabeçalho, visível e alterável; não cifra nem autentica. A confidencialidade exige cifra (por exemplo SRTP ou uma VPN)." },
    ],
    formativas: [
      { pergunta: "Numa ligação sem congestionamento, o que muda ao marcar a voz com EF?", opcoes: ["A voz passa a ter mais largura de banda", "Praticamente nada: sem fila, todos os pacotes saem logo", "A voz fica cifrada", "O RTT reduz para metade"], certa: 1, comentario: "A prioridade reordena filas. Sem fila não há o que reordenar. A marcação também não aumenta capacidade nem cifra." },
      { pergunta: "Porque se apagam as marcas DSCP que chegam dos postos de trabalho?", opcoes: ["Porque o DSCP ocupa demasiados bytes", "Porque qualquer posto pode marcar-se como EF e roubar prioridade à voz", "Porque o nftables não lê DSCP", "Porque a lei obriga"], certa: 1, comentario: "A marcação não prova nada sobre quem enviou. A fronteira de confiança fica no primeiro equipamento gerido, que volta a marcar segundo a política aprovada." },
    ],
    leituraFacil: [
      "Pode dar prioridade a alguns pacotes, como a voz.",
      "O encaminhador põe uma marca no pacote.",
      "A prioridade só ajuda quando a ligação está cheia.",
      "A prioridade não aumenta a velocidade total.",
      "A marca não protege os dados: não é segurança.",
      "Não confie nas marcas que vêm dos computadores.",
    ],
    guiao: {
      conducao: [
        "0–20 min: DSCP e PHB; classes do RFC 4594; classificar, marcar, tratar; fronteira de confiança; o que a prioridade não faz.",
        "20–65 min: prática em duplas (htb sem filtro, medição, filtro, marcação nftables, captura, repetição, teste de abuso, contadores); quem não tiver laboratório preenche a tabela em papel e responde às tarefas.",
        "65–75 min: formativas e correcção comentada.",
      ],
      errosComuns: [
        "Testar a prioridade sem criar congestionamento e concluir que «não funciona».",
        "Marcar os pacotes mas não criar filtro/fila que use a marca.",
        "Pôr a regra de marcação EF antes da regra que apaga marcas.",
        "Confundir o valor DSCP (46) com o byte TOS completo (0xb8 = 184).",
        "Prometer à direcção que a QoS «aumenta a largura de banda» ou «dá segurança».",
      ],
    },
    fontes: ["rfc2474", "rfc2475", "rfc4594", "rfc3246", "tcqdisc", "nftables", "iperf3", "wireshark"],
  },

  "r-m10-l3": {
    objectivos: [
      "Explicar porque voz e vídeo em tempo real são sensíveis a atraso unilateral, jitter e perda, e o papel do RTP e do tampão de jitter.",
      "Calcular o débito de uma chamada G.711 com 20 ms de pacote, ao nível IP e ao nível Ethernet, e o total para várias chamadas.",
      "Montar um orçamento de atraso unilateral e compará-lo com a referência da Recomendação ITU-T G.114, sabendo que é uma referência de planeamento e não uma garantia.",
      "Simular voz com iperf3 UDP e observar o efeito de jitter e perda, reconhecendo os limites da simulação.",
    ],
    explicacao: [
      {
        titulo: "Tempo real: porque não basta ter débito",
        paragrafos: [
          "Numa chamada, a voz é cortada em pedaços de poucos milissegundos, codificada e enviada em pacotes RTP sobre UDP (RFC 3550). Um pacote que chega tarde demais para ser tocado conta como perdido; não vale a pena retransmiti-lo. Por isso, voz e vídeo usam UDP e são muito mais sensíveis a atraso, jitter e perda do que uma transferência de ficheiros.",
          "O receptor guarda alguns pacotes num tampão de jitter antes de tocar, para compensar chegadas irregulares. Um tampão maior tolera mais jitter, mas acrescenta atraso. A Recomendação ITU-T G.114 indica, para planeamento, que um atraso unilateral de boca a ouvido até cerca de 150 ms é aceitável para a maioria das conversas e que acima de 400 ms não deve ser usado em planeamento geral. É uma referência de planeamento; a qualidade percebida depende também do codec, da perda e do eco.",
        ],
      },
      {
        titulo: "Contas de uma chamada",
        paragrafos: [
          "O codec G.711 (ITU-T) produz 64 kbit/s de voz. Com pacotes de 20 ms há 50 pacotes por segundo, cada um com 160 bytes de voz. Somam-se cabeçalhos RTP (12 bytes), UDP (8) e IPv4 (20): 200 bytes por pacote, ou seja 200 × 8 × 50 = 80 kbit/s ao nível IP, em cada sentido. Em Ethernet somam-se 18 bytes de cabeçalho e verificação: 218 × 8 × 50 = 87,2 kbit/s. Uma VPN ou IPv6 acrescentam mais cabeçalhos; compressão de cabeçalhos ou outros codecs reduzem. As contas servem para planear, e confirmam-se medindo.",
          "O vídeo não tem débito fixo: depende do codec, da resolução, do movimento na imagem e da adaptação feita pela aplicação. Os números de planeamento tiram-se da documentação da plataforma usada e de medições, nunca de uma tabela genérica. O orçamento de atraso unilateral soma: codificação e empacotamento (por exemplo 20 ms), rede num sentido, tampão de jitter e descodificação.",
        ],
      },
    ],
    caso: "A DPE (fictícia) quer 8 chamadas de voz simultâneas entre a delegação e a sede e uma videoconferência semanal. A WAN simulada tem 40 ms num sentido. O técnico tem de dizer quanto débito reservar para a voz, se o atraso cabe no orçamento e o que acontece com jitter e perda. Todos os valores são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "A ligação r1–r2 representa a WAN; atraso, jitter e perda simulados com tc netem na saída r2-r1 (delegação → sede).",
        "Voz simulada: iperf3 UDP com datagramas de 172 bytes (160 de voz + 12 de RTP simulados) a 68,8 kbit/s de dados, o que dá 50 pacotes por segundo. Não é RTP verdadeiro: o iperf3 mede jitter e perda como o RTP, mas não há codec nem tampão.",
        "Limite da simulação: com jitter, o netem pode reordenar pacotes; numa ligação real a reordenação pode ser menor ou maior.",
      ],
      passos: [
        PRE_M10,
        { accao: "Cenário 1 — atraso fixo de 40 ms num sentido. Confirme com ping (a ida e volta fica perto de 40 ms, porque o regresso não tem atraso simulado).", comandos: ["sudo ip netns exec r2 tc qdisc add dev r2-r1 root netem delay 40ms", "sudo ip netns exec pc-del ping -c 10 -i 0.2 10.10.20.53 | tail -1"], saida: ["rtt min/avg/max/mdev = 40.1/40.2/40.4/0.1 ms"] },
        { accao: "Consola C: servidor iperf3 (esperar «Server listening on 5201»). Consola A: voz simulada durante 20 s.", comandos: ["C: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53", "A: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -u -b 68.8K -l 172 -t 20 | tail -2"], saida: ["[  5] 0.00-20.04 sec  168 KBytes  68.7 Kbits/sec  0.030 ms  0/1000 (0%)  receiver", "(1000 datagramas em 20 s = 50 por segundo)"] },
        { accao: "Cenário 2 — acrescente jitter: 40 ms ± 15 ms. Repita o teste (reinicie o servidor na consola C).", comandos: ["sudo ip netns exec r2 tc qdisc change dev r2-r1 root netem delay 40ms 15ms", "C: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53", "A: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -u -b 68.8K -l 172 -t 20 | tail -2"], saida: ["[  5] 0.00-20.05 sec  168 KBytes  68.6 Kbits/sec  9.84 ms  0/1000 (0%)  receiver", "(podem surgir avisos de pacotes fora de ordem: efeito do netem com jitter)"] },
        { accao: "Cenário 3 — jitter e 2 % de perda. Repita o teste.", comandos: ["sudo ip netns exec r2 tc qdisc change dev r2-r1 root netem delay 40ms 15ms loss 2%", "C: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53", "A: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -u -b 68.8K -l 172 -t 20 | tail -2"], saida: ["[  5] 0.00-20.05 sec  165 KBytes  67.3 Kbits/sec  10.1 ms  21/1000 (2.1%)  receiver"] },
        { accao: "Confirme na captura o tamanho dos pacotes de voz simulada (consola E, esperar «Capturing on»; repetir o teste de 5 s). O comprimento IP deve ser 200 bytes (172 + 8 UDP + 20 IP).", comandos: ["E: sudo ip netns exec r1 tshark -i r1-r2 -c 3 -f 'udp port 5201' -T fields -e ip.len -e frame.len", "C: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53", "A: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -u -b 68.8K -l 172 -t 5"], saida: ["200\t214", "200\t214", "200\t214", "(frame.len = 214: a captura não inclui os 4 bytes de verificação Ethernet; somados dão os 218 usados nas contas)"] },
        { accao: "Preencha o orçamento de atraso unilateral para os cenários 1 e 2 com: empacotamento 20 ms, rede (40 ms), tampão de jitter (cenário 1: 20 ms; cenário 2: 60 ms, cerca de 4 vezes o jitter simulado de ±15 ms), descodificação 5 ms (valor fictício de exemplo).", comandos: ["nano /tmp/dpe-m10-l3-orcamento.txt"] },
      ],
      sucesso: [
        "A dupla tem uma tabela cenário | jitter | perda | orçamento de atraso unilateral, com a indicação de que são valores simulados.",
        "O formando calcula 87,2 kbit/s por chamada G.711/20 ms em Ethernet e o total para 8 chamadas (697,6 kbit/s por sentido).",
        "O formando explica porque um tampão de jitter maior evita cortes mas aumenta o atraso.",
        "O formando diz que o valor da G.114 é referência de planeamento, não promessa de qualidade.",
      ],
      reversao: [
        "sudo ip netns exec r2 tc qdisc del dev r2-r1 root",
        "Ctrl+C nas consolas C e E se algum processo ainda estiver à espera (não usar pkill/killall).",
        "rm /tmp/dpe-m10-l3-orcamento.txt (depois de guardar a tabela, se necessário).",
        "Verificar: tc qdisc show dev r2-r1 mostra só «qdisc noqueue»; ip netns pids srv e ip netns pids r1 não listam iperf3 nem tshark.",
      ],
    },
    papel: [
      { tarefa: "Calcule o débito de uma chamada G.711 com pacotes de 20 ms: ao nível IP e em Ethernet. Depois, para 8 chamadas.", esperado: "Por pacote: 160 + 12 + 8 + 20 = 200 bytes; 50 pacotes/s → 80 kbit/s ao nível IP. Ethernet: 218 bytes → 87,2 kbit/s. 8 chamadas: 640 kbit/s (IP) ou 697,6 kbit/s (Ethernet) em cada sentido, sem contar VPN." },
      { tarefa: "Orçamento de atraso unilateral: cenário 1 (20 + 40 + 20 + 5) e cenário 2 (20 + 40 + 60 + 5). Cabem na referência de 150 ms da G.114?", esperado: "Cenário 1: 85 ms. Cenário 2: 125 ms. Ambos abaixo de 150 ms, mas o cenário 2 tem menos margem. É referência de planeamento; a perda de 2 % do cenário 3 prejudica a qualidade mesmo com atraso aceitável." },
      { tarefa: "Com as saídas de exemplo, preencha: cenário | jitter | perda.", esperado: "1 (40 ms fixo): 0,030 ms | 0 %. 2 (±15 ms): 9,84 ms | 0 %. 3 (±15 ms e 2 %): 10,1 ms | 2,1 %." },
      { tarefa: "Um colega propõe reservar 64 kbit/s por chamada «porque o G.711 é 64 kbit/s». O que falta?", esperado: "Os cabeçalhos: 64 kbit/s é só a voz. Ao nível IP são 80 kbit/s e em Ethernet 87,2 kbit/s; numa VPN ainda mais. Reservar 64 kbit/s deixaria as chamadas a perder pacotes." },
    ],
    formativas: [
      { pergunta: "Porque não se retransmitem pacotes de voz perdidos numa chamada?", opcoes: ["Porque o UDP proíbe", "Porque o pacote retransmitido chegaria tarde demais para ser tocado", "Porque a voz é cifrada", "Porque o DSCP EF impede"], certa: 1, comentario: "Em tempo real, um pacote atrasado é inútil. A aplicação prefere esconder a falta do que esperar por uma retransmissão." },
      { pergunta: "O que acontece ao aumentar o tampão de jitter do telefone?", opcoes: ["Menos cortes por chegadas irregulares, mas mais atraso de boca a ouvido", "Mais débito disponível", "Menos perda na rede", "Nada"], certa: 0, comentario: "O tampão espera pelos pacotes atrasados, o que evita cortes, mas cada milissegundo de espera soma-se ao atraso unilateral. A perda na rede continua igual." },
    ],
    leituraFacil: [
      "A voz e o vídeo precisam de chegar a tempo.",
      "Um pacote de voz atrasado já não serve.",
      "Uma chamada usa mais do que 64 kbit/s por causa dos cabeçalhos.",
      "O telefone guarda alguns pacotes para evitar cortes, mas isso atrasa.",
      "Há uma referência para o atraso: cerca de 150 ms num sentido.",
      "A simulação ajuda a comparar, mas não é uma ligação real.",
    ],
    guiao: {
      conducao: [
        "0–20 min: RTP sobre UDP; atraso unilateral, jitter e perda; tampão de jitter; referência G.114; contas do G.711; vídeo sem débito fixo.",
        "20–65 min: prática em duplas (três cenários netem, captura do tamanho, orçamento); quem não tiver laboratório faz as contas e as tabelas em papel.",
        "65–75 min: formativas e correcção comentada; discutir o caso das 8 chamadas.",
      ],
      errosComuns: [
        "Reservar só 64 kbit/s por chamada G.711.",
        "Usar o RTT do ping como atraso unilateral sem dizer que é aproximação.",
        "Apresentar o valor da G.114 como garantia de boa qualidade.",
        "Dar números fixos de débito para vídeo sem consultar a plataforma nem medir.",
        "Confundir o iperf3 UDP com uma chamada real (não há codec nem tampão).",
      ],
    },
    fontes: ["rfc3550", "itug114", "itug711", "rfc7679", "rfc3393", "rfc768", "iperf3", "tcqdisc", "wireshark"],
  },

  "r-m10-l4": {
    objectivos: [
      "Distinguir modelação (shaping, que atrasa em fila) de policiamento (policing, que descarta), e saber que ambos só actuam no sentido e no equipamento onde estão configurados.",
      "Configurar com tc htb uma divisão da WAN por classes com garantia mínima e limite máximo, e confirmar com contadores.",
      "Reconhecer o excesso de fila (bufferbloat) e reduzi-lo com a gestão activa de fila fq_codel.",
      "Calcular o débito útil máximo de uma classe a partir do débito configurado e dos cabeçalhos.",
    ],
    explicacao: [
      {
        titulo: "Modelar ou policiar",
        paragrafos: [
          "Modelar (shaping) é guardar numa fila os pacotes que excedem o ritmo definido e enviá-los mais tarde: o tráfego sai liso, mas ganha atraso. Policiar (policing) é descartar ou remarcar o excesso logo à chegada: não há fila, mas o TCP vê perdas, retransmite e pode ficar com débito irregular. Os operadores costumam policiar à entrada da sua rede; por isso convém modelar do lado da instituição um pouco abaixo do débito contratado, para que a fila fique num equipamento que a equipa controla.",
          "O tc só controla a saída de uma interface. Para controlar o que chega à delegação, modela-se na saída da sede (ou usa-se um dispositivo intermédio). O htb do Linux divide um débito por classes: cada uma tem uma taxa garantida (rate) e pode usar até um tecto (ceil) quando as outras não precisam. A garantia vale só dentro deste equipamento; não controla o que o operador faz depois.",
        ],
      },
      {
        titulo: "Filas grandes e gestão activa de fila",
        paragrafos: [
          "Uma fila grande evita perdas, mas quando enche todos os pacotes esperam: uma ligação de 5 Mbit/s com 1000 pacotes de 1514 bytes em fila acumula até cerca de 2,4 s de espera. É o excesso de fila (bufferbloat): descarregar um ficheiro torna chamadas e páginas web lentíssimas. A gestão activa de fila CoDel (RFC 8289) descarta ou marca pacotes quando o tempo de permanência na fila fica alto durante algum tempo; o FQ-CoDel (RFC 8290) separa também os fluxos em filas pequenas, para que um fluxo pesado não atrase os leves.",
          "Contas de débito útil: o htb conta o pacote com o cabeçalho Ethernet (14 bytes na captura, sem verificação). Um segmento TCP com 1448 bytes de dados ocupa 1514 bytes. Numa classe de 5 Mbit/s, o máximo de dados úteis é 5 × 1448 / 1514 ≈ 4,78 Mbit/s. Numa WAN real, a forma como o operador conta os bytes pode ser outra; confirma-se no contrato.",
        ],
      },
    ],
    caso: "A sede da DPE (fictícia) envia para a delegação cópias de segurança nocturnas que se prolongam pela manhã e deixam o sistema de gestão documental (servidor web no srv, porto 80) inutilizável. A WAN contratada (simulada) tem 5 Mbit/s. A política aprovada: gestão documental com 3 Mbit/s garantidos, o resto com 2 Mbit/s garantidos, ambos podendo usar até 5 Mbit/s quando o outro não precisa. Todos os valores são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Sentido controlado: sede → delegação, na saída r1-r2 do espaço de nomes r1. Os testes usam iperf3 -R: o cliente fica em pc-del e o srv envia os dados.",
        "Gestão documental simulada: iperf3 no porto 80 do srv. Cópias de segurança simuladas: iperf3 no porto 5201.",
        "Limite da simulação: tudo corre no mesmo processador da VM; com processadores lentos, o limite pode ser o próprio processador e não o htb.",
      ],
      passos: [
        PRE_M10,
        { accao: "Limite de 5 Mbit/s na saída r1-r2 com uma só classe e uma fila simples grande (pfifo de 1000 pacotes).", comandos: ["sudo ip netns exec r1 tc qdisc add dev r1-r2 root handle 1: htb default 20", "sudo ip netns exec r1 tc class add dev r1-r2 parent 1: classid 1:1 htb rate 5mbit", "sudo ip netns exec r1 tc class add dev r1-r2 parent 1:1 classid 1:20 htb rate 5mbit", "sudo ip netns exec r1 tc qdisc add dev r1-r2 parent 1:20 handle 20: pfifo limit 1000"] },
        { accao: "Excesso de fila: consola C servidor iperf3 (esperar «Server listening»); consola B descarga de 30 s; na consola A, durante a descarga, ping ao srv.", comandos: ["C: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53 -p 5201", "B: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -p 5201 -R -t 30", "A: sudo ip netns exec pc-del ping -c 20 10.10.20.53 | tail -1"], saida: ["A: rtt min/avg/max/mdev = 310.4/1180.6/2351.2/620.3 ms", "B: [  5] 0.00-30.00 sec  16.8 MBytes  4.70 Mbits/sec  receiver", "(o ping de regresso espera atrás dos pacotes da descarga; valores variam em cada execução)"] },
        { accao: "Troque a fila da classe por fq_codel e repita o passo anterior.", comandos: ["sudo ip netns exec r1 tc qdisc replace dev r1-r2 parent 1:20 handle 20: fq_codel", "(repetir C, B e A)"], saida: ["A: rtt min/avg/max/mdev = 0.9/4.8/9.7/2.1 ms", "B: [  5] 0.00-30.00 sec  16.7 MBytes  4.68 Mbits/sec  receiver", "(débito útil quase igual; atraso muito menor)"] },
        { accao: "Aplique a política: classe 1:10 (gestão documental, porto de origem 80) com 3 Mbit/s garantidos e classe 1:20 ajustada para 2 Mbit/s garantidos; ambas com tecto 5 Mbit/s e fq_codel.", comandos: ["sudo ip netns exec r1 tc class change dev r1-r2 parent 1:1 classid 1:20 htb rate 2mbit ceil 5mbit", "sudo ip netns exec r1 tc class add dev r1-r2 parent 1:1 classid 1:10 htb rate 3mbit ceil 5mbit", "sudo ip netns exec r1 tc qdisc add dev r1-r2 parent 1:10 handle 10: fq_codel", "sudo ip netns exec r1 tc filter add dev r1-r2 parent 1: protocol ip prio 1 u32 match ip sport 80 0xffff flowid 1:10"] },
        { accao: "Dois fluxos ao mesmo tempo: consolas C e D com servidores nos portos 5201 e 80; consola B cópias (40 s); consola A gestão documental (20 s), iniciada logo depois.", comandos: ["C: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53 -p 5201", "D: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53 -p 80", "B: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -p 5201 -R -t 40", "A: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -p 80 -R -t 20 | tail -2"], saida: ["A: [  5] 0.00-20.00 sec  6.80 MBytes  2.85 Mbits/sec  receiver", "B: débito por intervalo cerca de 4,7 Mbit/s antes e depois de A, cerca de 1,9 Mbit/s enquanto A corre"] },
        { accao: "Contadores por classe (bytes enviados, descartes, excessos).", comandos: ["sudo ip netns exec r1 tc -s class show dev r1-r2"], saida: ["class htb 1:10 parent 1:1 leaf 10: prio 0 rate 3Mbit ceil 5Mbit … Sent 7210000 bytes …", "class htb 1:20 parent 1:1 leaf 20: prio 0 rate 2Mbit ceil 5Mbit … Sent 41300000 bytes …"] },
        { accao: "Contraste com policiamento: retire a modelação e policie a 1 Mbit/s o que entra em r1 vindo de r2 (sentido delegação → sede). Repita um iperf3 normal (sem -R) e observe as retransmissões.", comandos: ["sudo ip netns exec r1 tc qdisc del dev r1-r2 root", "sudo ip netns exec r1 tc qdisc add dev r1-r2 ingress", "sudo ip netns exec r1 tc filter add dev r1-r2 parent ffff: protocol ip prio 1 u32 match u32 0 0 police rate 1mbit burst 20k drop", "C: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53 -p 5201", "B: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -p 5201 -t 10 | tail -3"], saida: ["[  5] 0.00-10.00 sec  1.12 MBytes  0.94 Mbits/sec  187   sender", "[  5] 0.00-10.02 sec  1.05 MBytes  0.88 Mbits/sec        receiver", "(muitas retransmissões: o excesso é descartado, não esperado em fila)"] },
      ],
      sucesso: [
        "A dupla mostra o RTT sob carga com pfifo e com fq_codel, com débito útil semelhante.",
        "A dupla mostra que, com os dois fluxos, a gestão documental recebe pelo menos cerca de 2,8 Mbit/s de débito útil e que as cópias usam os 5 Mbit/s quando estão sozinhas.",
        "O formando explica a diferença entre modelação e policiamento usando as retransmissões observadas.",
        "O formando calcula ≈ 4,78 Mbit/s como débito útil máximo de uma classe de 5 Mbit/s.",
      ],
      reversao: [
        "sudo ip netns exec r1 tc qdisc del dev r1-r2 ingress",
        "sudo ip netns exec r1 tc qdisc del dev r1-r2 root 2>/dev/null (só se a modelação ainda existir)",
        "Ctrl+C nas consolas C e D se algum servidor ainda estiver à espera (não usar pkill/killall).",
        "Verificar: sudo ip netns exec r1 tc qdisc show dev r1-r2 mostra só «qdisc noqueue» (sem «ingress»); ip netns pids srv não lista iperf3.",
      ],
    },
    papel: [
      { tarefa: "Com as saídas de exemplo, preencha: fila | RTT médio sob carga | débito útil. (pfifo 1000; fq_codel).", esperado: "pfifo 1000 | ≈ 1181 ms | 4,70 Mbit/s. fq_codel | ≈ 4,8 ms | 4,68 Mbit/s. O débito quase não muda; o atraso cai muito." },
      { tarefa: "Quanto tempo de espera acumulam, no máximo, 1000 pacotes de 1514 bytes numa ligação de 5 Mbit/s?", esperado: "1000 × 1514 × 8 = 12 112 000 bits; a 5 000 000 bit/s dá cerca de 2,4 s." },
      { tarefa: "Escreva as classes htb para uma WAN de 10 Mbit/s: videoconferência 3 Mbit/s garantidos, gestão documental 4 Mbit/s, resto 3 Mbit/s, todas com tecto 10 Mbit/s.", esperado: "Classe mãe 1:1 rate 10mbit; 1:10 rate 3mbit ceil 10mbit; 1:20 rate 4mbit ceil 10mbit; 1:30 rate 3mbit ceil 10mbit (default 30); soma das garantias = 10 Mbit/s; fq_codel em cada classe; filtros por endereço/porto de cada serviço." },
      { tarefa: "O director pede para «garantir 3 Mbit/s à gestão documental até à delegação» configurando só o r1. O que fica garantido e o que não fica?", esperado: "Fica garantido que, à saída do r1 da sede, a gestão documental tem pelo menos 3 Mbit/s quando pede. Não fica garantido o que acontece na rede do operador nem no sentido delegação → sede; isso exige configurar o r2 e/ou constar do contrato." },
    ],
    formativas: [
      { pergunta: "Qual é a principal diferença entre modelação (shaping) e policiamento (policing)?", opcoes: ["A modelação cifra o tráfego", "A modelação guarda o excesso em fila; o policiamento descarta-o ou remarca-o", "O policiamento aumenta o débito", "Não há diferença"], certa: 1, comentario: "Modelar alisa o tráfego à custa de atraso; policiar descarta e provoca retransmissões TCP, como se viu no último passo." },
      { pergunta: "Com fq_codel, o RTT sob carga caiu de mais de 1 s para poucos milissegundos. O que aconteceu?", opcoes: ["A ligação passou a ter mais largura de banda", "A fila deixou de acumular pacotes durante muito tempo e os fluxos leves não esperam atrás do pesado", "O ICMP passou a ser prioritário por lei", "O iperf3 parou"], certa: 1, comentario: "O débito útil é quase igual; o que mudou foi o tempo de permanência na fila. O CoDel reage ao atraso na fila e o FQ separa os fluxos." },
    ],
    leituraFacil: [
      "Pode dividir a ligação entre serviços.",
      "Cada serviço tem um mínimo garantido e um máximo.",
      "Uma fila muito grande deixa tudo lento.",
      "O fq_codel mantém a fila curta.",
      "Modelar põe em fila. Policiar deita fora.",
      "Só controla a saída do seu equipamento, não a rede do operador.",
    ],
    guiao: {
      conducao: [
        "0–20 min: modelação e policiamento; só a saída se controla; classes htb com rate e ceil; excesso de fila; CoDel e FQ-CoDel; contas de débito útil.",
        "20–70 min: prática em duplas (pfifo e ping sob carga, fq_codel, política por classes com dois fluxos, contadores, policiamento); quem não tiver laboratório faz as contas e as classes em papel.",
        "70–80 min: formativas e correcção comentada.",
      ],
      errosComuns: [
        "Configurar a modelação na interface errada (só a saída é controlada).",
        "Fazer a soma das garantias exceder o débito da classe mãe.",
        "Modelar exactamente ao débito contratado e deixar a fila no equipamento do operador.",
        "Prometer uma garantia que depende da rede do operador.",
        "Esquecer de remover a fila ingress: o passo final deixa a delegação limitada a 1 Mbit/s.",
      ],
    },
    fontes: ["tcqdisc", "iproute2", "rfc8289", "rfc8290", "rfc2475", "rfc6349", "iperf3"],
  },

  "r-m10-l5": {
    objectivos: [
      "Aplicar um método de diagnóstico de lentidão: delimitar o sintoma, medir por etapas (resolução de nomes, ligação, primeira resposta, transferência), comparar com uma referência e confirmar a causa antes de corrigir.",
      "Usar curl --write-out, ping, mtr, iperf3 e os contadores do tc para separar lentidão do servidor, perda na ligação e limitação de débito.",
      "Escrever um relatório de incidente de desempenho com evidências, causa provável, correcção, verificação e limites das medições.",
    ],
    explicacao: [
      {
        titulo: "«Está lento» não é um diagnóstico",
        paragrafos: [
          "Primeiro delimita-se: que serviço, que utilizadores, desde quando, sempre ou a certas horas, e comparado com quê. Depois divide-se o tempo de um pedido em etapas. O curl mostra, com --write-out, o tempo de resolução do nome (time_namelookup), de ligação TCP (time_connect), até ao primeiro byte da resposta (time_starttransfer) e total (time_total), e a velocidade média de transferência. Os tempos do curl são acumulados desde o início do pedido.",
          "Leitura típica: resolução alta aponta para DNS; ligação alta aponta para rede ou servidor sobrecarregado a aceitar ligações; primeiro byte alto com ligação rápida aponta para a aplicação ou o servidor; transferência lenta com primeiro byte rápido aponta para débito, perda ou filas no caminho. São indícios, não provas: cada hipótese confirma-se com outra medição independente (ping e mtr para perda e atraso, iperf3 para débito, contadores do equipamento para descartes).",
        ],
      },
      {
        titulo: "Confirmar, corrigir, verificar, registar",
        paragrafos: [
          "Mede-se antes de mexer, muda-se uma coisa de cada vez e volta-se a medir com os mesmos parâmetros. Sem uma referência (medição de quando estava normal) não se sabe o que é «lento». Nos equipamentos que a equipa gere, os contadores (por exemplo tc -s qdisc show: sent, dropped, overlimits) mostram se há descartes ou filas; nos equipamentos do operador, pede-se a informação com evidências.",
          "O relatório diz o que foi medido, com que ferramenta e quando; distingue facto medido de hipótese; e indica limites (amostra pequena, horário, simulação). Uma medição feita na rede de prática nunca se apresenta como medição da rede real.",
        ],
      },
    ],
    caso: "Na delegação da DPE (fictícia), três pessoas dizem em dias diferentes que «descarregar relatórios do srv está lento». O formador, sem revelar, activa uma de três falhas na rede de prática. As duplas diagnosticam com medições, identificam a causa, pedem a correcção ao formador e verificam. Todos os valores são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Serviço: servidor web de teste no srv, porto 80, a servir um ficheiro de 1 000 000 bytes em /tmp/dpe-m10/l5.",
        "Falhas escondidas (só o formador aplica, uma de cada vez, sempre na saída r1-r2, sentido sede → delegação, ou no próprio servidor): A — atraso 20 ms e 3 % de perda (netem); B — limitação a 512 kbit/s (tbf); C — servidor que espera 2 s antes de responder.",
        "Limite da simulação: cada falha é artificial e isolada; na realidade podem coexistir várias causas.",
      ],
      passos: [
        PRE_M10,
        { accao: "Prepare a pasta própria, o ficheiro de teste e o servidor lento (este só é usado na falha C).", comandos: ["mkdir -p /tmp/dpe-m10/l5", "head -c 1000000 /dev/zero > /tmp/dpe-m10/l5/relatorio.bin", "cat > /tmp/dpe-m10/l5/lento.py <<'EOF'", "import functools, http.server, time", "class H(http.server.SimpleHTTPRequestHandler):", "    def do_GET(self):", "        time.sleep(2)", "        super().do_GET()", "http.server.ThreadingHTTPServer(('10.10.20.53', 80), functools.partial(H, directory='/tmp/dpe-m10/l5')).serve_forever()", "EOF"] },
        { accao: "Consola C: servidor web normal (esperar «Serving HTTP»). Meça a referência três vezes e registe.", comandos: ["C: sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53 --directory /tmp/dpe-m10/l5", "for i in 1 2 3; do sudo ip netns exec pc-del curl -o /dev/null -s -w 'ligacao=%{time_connect} primeiro_byte=%{time_starttransfer} total=%{time_total} bytes_s=%{speed_download}\\n' http://10.10.20.53/relatorio.bin; done"], saida: ["ligacao=0.000210 primeiro_byte=0.001310 total=0.004920 bytes_s=203252032", "(três linhas semelhantes; é a referência na rede de prática, não um valor real)"] },
        { accao: "Formador (consola própria, sem mostrar): aplica UMA falha. Para C, faz Ctrl+C no servidor normal da consola C e inicia o servidor lento.", comandos: ["A: sudo ip netns exec r1 tc qdisc add dev r1-r2 root netem delay 20ms loss 3%", "B: sudo ip netns exec r1 tc qdisc add dev r1-r2 root tbf rate 512kbit burst 16kb latency 400ms", "C: sudo ip netns exec srv python3 /tmp/dpe-m10/l5/lento.py"] },
        { accao: "Etapa 1 — decompor o pedido com curl (três repetições). Compare com a referência.", comandos: ["for i in 1 2 3; do sudo ip netns exec pc-del curl -o /dev/null -s -w 'ligacao=%{time_connect} primeiro_byte=%{time_starttransfer} total=%{time_total} bytes_s=%{speed_download}\\n' http://10.10.20.53/relatorio.bin; done"], saida: ["Falha A: ligacao=0.020400 primeiro_byte=0.041200 total=2.310000 bytes_s=432900", "Falha B: ligacao=0.000300 primeiro_byte=0.001600 total=15.980000 bytes_s=62578", "Falha C: ligacao=0.000220 primeiro_byte=2.003100 total=2.007400 bytes_s=498156"] },
        { accao: "Etapa 2 — atraso e perda: ping com amostra suficiente e mtr.", comandos: ["sudo ip netns exec pc-del ping -c 100 -i 0.1 10.10.20.53 | tail -2", "sudo ip netns exec pc-del mtr -n -r -c 50 10.10.20.53"], saida: ["Falha A: 100 transmitted, 97 received, 3% packet loss; rtt avg 20.3 ms; mtr: perda a partir do salto 2 (10.255.0.1) e no destino", "Falha B: 0% packet loss; rtt avg 0.08 ms (sem carga, a limitação não se vê no ping)", "Falha C: 0% packet loss; rtt avg 0.07 ms"] },
        { accao: "Etapa 3 — débito no sentido sede → delegação (consola D: servidor iperf3; esperar «Server listening»).", comandos: ["D: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53 -p 5201", "sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -p 5201 -R -t 10 | tail -3"], saida: ["Falha A: sender … 3.9 Mbits/sec  Retr 212; receiver 3.8 Mbits/sec", "Falha B: sender … 0.50 Mbits/sec  Retr 4; receiver 0.49 Mbits/sec", "Falha C: receiver com o débito da referência (a rede está normal)"] },
        { accao: "Etapa 4 — confirmar no equipamento gerido (r1): contadores da fila de saída.", comandos: ["sudo ip netns exec r1 tc -s qdisc show dev r1-r2"], saida: ["Falha A: qdisc netem 8001: root … delay 20ms loss 3% … Sent … (dropped 212 …)", "Falha B: qdisc tbf 8002: root … rate 512Kbit burst 16Kb lat 400ms … (dropped 4, overlimits 1840 …)", "Falha C: qdisc noqueue 0: root (nenhuma fila configurada)"] },
        { accao: "Etapa 5 — conclusão e pedido de correcção ao formador (que remove a falha: comandos na reversão). Repita a Etapa 1 para verificar que voltou à referência. Escreva o relatório.", comandos: ["nano /tmp/dpe-m10/l5/relatorio-incidente.txt"] },
      ],
      sucesso: [
        "Para cada falha, a dupla identifica a etapa anómala no curl e confirma com pelo menos uma medição independente (ping/mtr, iperf3 ou contadores).",
        "A dupla distingue as três causas: perda na ligação (A), limitação de débito (B), servidor lento (C).",
        "A dupla verifica após a correcção, com os mesmos comandos, que os tempos voltaram à referência.",
        "O relatório separa factos medidos de hipóteses e indica que as medições são da rede de prática.",
      ],
      reversao: [
        "Falhas A ou B: sudo ip netns exec r1 tc qdisc del dev r1-r2 root",
        "Falha C: Ctrl+C na consola onde corre lento.py (não usar pkill/killall).",
        "Ctrl+C nas consolas C e D se algum servidor ainda estiver activo.",
        "Guardar o relatório fora da VM, se necessário, e depois: rm -r /tmp/dpe-m10/l5 (remove ficheiro de teste, lento.py e relatório).",
        "Verificar: tc qdisc show dev r1-r2 mostra só «qdisc noqueue»; ip netns pids srv não lista python3 nem iperf3.",
      ],
    },
    papel: [
      { tarefa: "Para cada linha de curl de exemplo (falhas A, B e C), diga que etapa está anómala e qual a hipótese.", esperado: "A: ligação e primeiro byte cerca de 20–40 ms (atraso) e transferência lenta → atraso e perda na ligação. B: ligação e primeiro byte normais, transferência muito lenta (≈ 62 kB/s ≈ 0,5 Mbit/s) → limitação de débito. C: ligação normal, primeiro byte 2 s, transferência rápida → servidor/aplicação." },
      { tarefa: "Na falha B o ping sem carga era normal. Porque isso não descarta um problema de rede?", esperado: "O ping sem carga usa muito pouco débito e não enche a fila; uma limitação de débito só se revela com transferências (iperf3, curl) ou com ping durante a carga, e nos contadores (overlimits) do equipamento." },
      { tarefa: "Escreva o relatório de incidente para a falha A.", esperado: "Sintoma: descargas lentas na delegação. Medições (rede de prática, data/hora): curl total 2,31 s vs referência 0,005 s; ping 100 amostras 3 % perda, RTT 20,3 ms; mtr perda a partir do salto 2; iperf3 -R 3,8 Mbit/s com 212 retransmissões; tc em r1 mostra netem com loss 3 %. Causa: perda e atraso na saída r1-r2 (simulados). Correcção: remoção da fila netem. Verificação: curl voltou à referência. Limites: falha artificial, amostras curtas." },
      { tarefa: "Um colega reinicia o servidor e o encaminhador «para ver se resolve» antes de medir. Que problemas isso cria?", esperado: "Perdem-se as evidências (contadores, estado), não se sabe qual acção resolveu, pode causar interrupção desnecessária e o problema pode voltar sem explicação. Primeiro mede-se, depois muda-se uma coisa de cada vez." },
    ],
    formativas: [
      { pergunta: "O curl mostra ligação em 0,2 ms e primeiro byte em 2 s. Onde procurar primeiro?", opcoes: ["No cabo de rede", "No servidor ou na aplicação, porque a ligação TCP foi rápida e a espera é pela resposta", "No DNS", "Na VLAN"], certa: 1, comentario: "A rede estabeleceu a ligação depressa; o tempo gasto até ao primeiro byte é, sobretudo, processamento do servidor. Confirma-se com medições de rede normais e com os registos do servidor." },
      { pergunta: "Porque se mede com os mesmos comandos antes e depois da correcção?", opcoes: ["Para gastar tempo", "Para comparar de forma justa e provar que a correcção resolveu o problema", "Porque o curl só funciona assim", "Para apagar os registos"], certa: 1, comentario: "Sem a mesma medição antes e depois, não há evidência de que a mudança resolveu nada; pode ter sido coincidência (por exemplo, a carga ter baixado)." },
    ],
    leituraFacil: [
      "Primeiro pergunte: o quê, quem, quando.",
      "Meça antes de mudar qualquer coisa.",
      "Divida o pedido em partes: ligar, esperar resposta, receber.",
      "Confirme a causa com outra medição.",
      "Mude uma coisa de cada vez e volte a medir.",
      "Escreva o que mediu e o que ainda é só uma ideia.",
    ],
    guiao: {
      conducao: [
        "0–20 min: delimitar o sintoma; etapas de um pedido com curl; leituras típicas e porque são indícios; confirmar, corrigir, verificar, registar.",
        "20–70 min: prática em duplas com rotação das falhas A, B e C (referência, curl, ping/mtr, iperf3, contadores, conclusão, verificação, relatório); quem não tiver laboratório diagnostica em papel com as saídas de exemplo.",
        "70–80 min: formativas e correcção comentada; comparar relatórios.",
      ],
      errosComuns: [
        "Mexer em configurações antes de medir e perder as evidências.",
        "Concluir «a rede está boa» só com um ping sem carga.",
        "Ler os tempos do curl como parciais (são acumulados desde o início).",
        "Aplicar duas correcções ao mesmo tempo.",
        "Apresentar medições da rede de prática como se fossem da rede real.",
        "Esquecer a reversão da falha antes da próxima dupla.",
      ],
    },
    fontes: ["curl", "mtr", "iperf3", "tcqdisc", "iproute2", "rfc2681", "rfc7680", "rfc6349", "nist80061"],
  },
};
