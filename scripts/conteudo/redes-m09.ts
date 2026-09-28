/**
 * Curso de Redes — módulo 9 (Redes de Longa Distância).
 * Conteúdo fictício e didáctico; ver regras em redes-base.ts.
 * Laboratórios NÃO executados neste ambiente: as saídas são exemplos didácticos,
 * não resultados medidos. Pré-requisito comum: rede DPE criada com lab-base.sh
 * (módulo 1, lição 1) numa máquina virtual Debian 12 descartável, após a
 * pré-verificação de nomes; rotas sede–delegação do módulo 3 aplicadas.
 */
import { TOPOLOGIA_BASE, type ConteudoLicao } from "./redes-base";

export const LICOES_M09: Record<string, ConteudoLicao> = {
  "r-m09-l1": {
    objectivos: [
      "Distinguir rede local e rede de longa distância pelo alcance, pelo proprietário do meio e pelas características da ligação.",
      "Comparar as tecnologias de ligação mais comuns (fibra, rádio ponto-a-ponto, ligação móvel, satélite, circuito dedicado do operador) por débito, atraso, disponibilidade e custo relativo.",
      "Medir, numa ligação simulada, como o atraso e a perda alteram a experiência de um serviço.",
    ],
    explicacao: [
      {
        titulo: "O que muda quando a ligação sai do edifício",
        paragrafos: [
          "Numa rede local a instituição é dona dos cabos e dos comutadores, as distâncias são curtas e o débito é alto. Numa rede de longa distância (WAN) o meio pertence normalmente a um operador, a distância é grande e cada megabit é pago. O técnico deixa de controlar o caminho: passa a controlar o contrato, os equipamentos das pontas e a forma como o tráfego é enviado.",
          "Quatro medidas descrevem uma ligação WAN: débito (quantos bits por segundo passam), atraso (tempo de ida e volta, RTT), variação do atraso (jitter) e perda de pacotes. Uma ligação pode ter débito alto e mesmo assim ser má para chamadas de voz, se tiver atraso ou jitter elevados.",
        ],
      },
      {
        titulo: "Tecnologias comuns e compromissos",
        paragrafos: [
          "Fibra óptica do operador: débito alto e atraso baixo, mas depende de a fibra chegar ao local. Rádio ponto-a-ponto: útil entre edifícios com linha de vista; sensível a obstáculos e chuva forte em algumas frequências. Ligação móvel (4G/5G): rápida de instalar, com débito e atraso variáveis consoante a cobertura e a carga da célula. Satélite geoestacionário: chega a zonas remotas, mas o atraso de ida e volta é tipicamente superior a 500 ms por causa da distância ao satélite; constelações de órbita baixa têm atrasos menores. Circuito dedicado ou serviço de rede privada do operador: características garantidas por contrato, custo mais alto.",
          "Não há tecnologia «melhor» em absoluto. Escolhe-se pelo serviço que vai passar, pela disponibilidade no local, pelo orçamento e pela necessidade de alternativa. Os valores concretos de débito, atraso e preço vêm sempre da proposta escrita do operador e de medições no local.",
        ],
      },
    ],
    caso: "A Direcção Provincial de Exemplo (DPE, fictícia) vai abrir uma delegação distrital. O operador A oferece ligação móvel (débito anunciado 20 Mbit/s, atraso típico 60 ms); o operador B oferece satélite geoestacionário (10 Mbit/s, atraso típico 600 ms). A delegação usará o sistema de gestão documental na sede e fará videochamadas semanais. Todos os valores são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "A ligação r1–r2 (10.255.0.0/30) representa a WAN sede–delegação.",
        "Simulação: o atraso e a perda são introduzidos com tc netem na interface r2-r1 (só dentro do espaço de nomes r2).",
      ],
      passos: [
        { accao: "Pré-requisito: confirme que a delegação chega ao srv (rotas do módulo 3).", comandos: ["sudo ip netns exec pc-del ping -c 3 10.10.20.53"], saida: ["3 packets transmitted, 3 received, 0% packet loss", "rtt min/avg/max/mdev = 0.05/0.07/0.09/0.02 ms"] },
        { accao: "Consola C: inicie um serviço web de teste no srv (esperar «Serving HTTP»).", comandos: ["sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53"] },
        { accao: "Meça o tempo de um pedido web sem simulação.", comandos: ["sudo ip netns exec pc-del python3 -c \"import time,urllib.request as u; t=time.time(); u.urlopen('http://10.10.20.53/').read(); print(round((time.time()-t)*1000),'ms')\""], saida: ["3 ms"] },
        { accao: "Simule a ligação móvel do operador A (atraso 30 ms em cada sentido → cerca de 60 ms de ida e volta, com o atraso só em r2 aplicado à saída; por isso usa-se 60 ms num só lado).", comandos: ["sudo ip netns exec r2 tc qdisc add dev r2-r1 root netem delay 60ms 10ms", "sudo ip netns exec pc-del ping -c 5 10.10.20.53"], saida: ["rtt min/avg/max/mdev = 51.2/60.4/69.8/6.1 ms"] },
        { accao: "Repita o pedido web e anote.", comandos: ["sudo ip netns exec pc-del python3 -c \"import time,urllib.request as u; t=time.time(); u.urlopen('http://10.10.20.53/').read(); print(round((time.time()-t)*1000),'ms')\""], saida: ["125 ms (cerca de duas idas e voltas: estabelecer a ligação TCP e o pedido)"] },
        { accao: "Simule o satélite do operador B (600 ms) e repita as duas medições.", comandos: ["sudo ip netns exec r2 tc qdisc change dev r2-r1 root netem delay 600ms 20ms", "sudo ip netns exec pc-del ping -c 5 10.10.20.53"], saida: ["rtt min/avg/max/mdev = 582.0/601.3/619.5/13.2 ms", "Pedido web: cerca de 1210 ms"] },
        { accao: "Acrescente 2 % de perda à simulação do operador A e observe o ping.", comandos: ["sudo ip netns exec r2 tc qdisc change dev r2-r1 root netem delay 60ms 10ms loss 2%", "sudo ip netns exec pc-del ping -c 50 -i 0.2 10.10.20.53"], saida: ["50 packets transmitted, 49 received, 2% packet loss (o número exacto varia em cada execução)"] },
      ],
      sucesso: [
        "A tabela da dupla tem, para cada cenário, RTT médio, tempo do pedido web e perda.",
        "O formando explica porque o pedido web demora cerca de duas vezes o RTT.",
        "A dupla recomenda um operador para o caso, com duas razões e um risco.",
      ],
      reversao: [
        "sudo ip netns exec r2 tc qdisc del dev r2-r1 root",
        "Ctrl+C na consola C (servidor web).",
        "Verificar: sudo ip netns exec r2 tc qdisc show dev r2-r1 deve mostrar só a fila por omissão (noqueue ou pfifo_fast).",
      ],
    },
    papel: [
      { tarefa: "Com as saídas de exemplo, preencha: cenário | RTT médio | pedido web. (sem simulação, operador A, operador B).", esperado: "Sem simulação: 0,07 ms | 3 ms. Operador A: 60 ms | 125 ms. Operador B: 601 ms | 1210 ms." },
      { tarefa: "Qual operador recomenda para a delegação do caso? Dê duas razões e um risco.", esperado: "Operador A (móvel): atraso de 60 ms serve para a gestão documental e para videochamadas; débito anunciado maior. Risco: débito e atraso variam com a cobertura e a carga da célula; é preciso medir no local e prever alternativa. O satélite fica como alternativa se não houver cobertura móvel." },
      { tarefa: "Uma ligação tem 100 Mbit/s mas 5 % de perda. Serve para chamadas de voz?", esperado: "Dificilmente: a perda corta a voz e o TCP abranda por causa das retransmissões. O débito alto não compensa a perda." },
    ],
    formativas: [
      { pergunta: "Numa ligação por satélite geoestacionário, o que mais prejudica uma videochamada?", opcoes: ["O débito, que é sempre inferior a 1 Mbit/s", "O atraso de ida e volta elevado", "A falta de endereço IP", "O número de VLAN"], certa: 1, comentario: "O atraso de centenas de milissegundos resulta da distância ao satélite; o débito pode ser suficiente, mas a conversa fica com pausas. Constelações de órbita baixa têm atrasos menores." },
      { pergunta: "Porque um pedido web demorou cerca de 125 ms numa ligação com 60 ms de RTT?", opcoes: ["Porque o servidor é lento", "Porque são precisas pelo menos duas idas e voltas: estabelecer a ligação TCP e enviar o pedido", "Porque o tc duplica os pacotes", "Porque o DNS falhou"], certa: 1, comentario: "O aperto de mão TCP gasta uma ida e volta antes do pedido; com HTTPS seriam ainda mais idas e voltas. Por isso o atraso pesa tanto nas WAN." },
    ],
    leituraFacil: [
      "Uma rede de longa distância liga edifícios longe uns dos outros.",
      "O caminho normalmente é do operador, não da instituição.",
      "Veja quatro coisas: velocidade, atraso, variação do atraso e perda.",
      "Muita velocidade não chega se o atraso ou a perda forem altos.",
    ],
    guiao: {
      conducao: [
        "0–20 min: LAN e WAN; as quatro medidas; tecnologias e compromissos, com o caso da delegação.",
        "20–60 min: prática em duplas (quem não tiver o laboratório segue as saídas de exemplo impressas e preenche a tabela em papel); discussão da recomendação.",
        "60–70 min: formativas e correcção comentada.",
      ],
      errosComuns: [
        "Confiar só no débito anunciado e ignorar atraso e perda.",
        "Esquecer de remover o netem: as lições seguintes ficariam lentas.",
        "Tratar valores de catálogo como garantidos sem contrato nem medição no local.",
      ],
    },
    fontes: ["iproute2", "rfc9293", "rfc792", "debian"],
  },
};
