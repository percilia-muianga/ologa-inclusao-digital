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
};
