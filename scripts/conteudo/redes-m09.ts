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
        { accao: "Simule a ligação móvel do operador A. O netem só atrasa os pacotes que saem de r2-r1; aplicando 60 ms num só sentido, a ida e volta fica perto de 60 ms.", comandos: ["sudo ip netns exec r2 tc qdisc add dev r2-r1 root netem delay 60ms 10ms", "sudo ip netns exec pc-del ping -c 5 10.10.20.53"], saida: ["rtt min/avg/max/mdev = 51.2/60.4/69.8/6.1 ms"] },
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

  "r-m09-l2": {
    objectivos: [
      "Explicar o que uma rede privada virtual (VPN) protege e o que não protege numa ligação que atravessa o operador.",
      "Comparar IPsec e WireGuard quanto a normas, configuração e compatibilidade entre fabricantes.",
      "Configurar um túnel WireGuard entre sede e delegação e provar, por captura, que o tráfego interno segue cifrado.",
    ],
    explicacao: [
      {
        titulo: "Um túnel cifrado por cima de um caminho que não controlamos",
        paragrafos: [
          "Quando a ligação sede–delegação passa pelo operador ou pela Internet, quem estiver no caminho pode ler ou alterar pacotes não protegidos. Uma VPN entre locais (site-to-site) encapsula os pacotes internos dentro de pacotes cifrados e autenticados entre os dois encaminhadores. O conteúdo e os endereços internos deixam de ser visíveis no caminho; continuam visíveis os endereços das pontas do túnel, o volume e a hora do tráfego.",
          "A VPN não substitui a firewall nem a segurança dos postos: um computador infectado na delegação continua a chegar à sede, agora por um canal cifrado. Por isso filtra-se também o que pode entrar pelo túnel.",
        ],
      },
      {
        titulo: "IPsec e WireGuard",
        paragrafos: [
          "IPsec é uma arquitectura normalizada pelo IETF (RFC 4301), suportada pela generalidade dos encaminhadores e firewalls de fabricantes; tem muitas opções (IKEv2, algoritmos, modos), o que dá flexibilidade mas exige que as duas pontas acordem exactamente os mesmos parâmetros. É a escolha habitual quando uma ponta é equipamento de outro fabricante ou do operador.",
          "WireGuard usa um conjunto fixo de algoritmos modernos e chaves públicas trocadas entre as pontas, com configuração curta; está incluído no núcleo Linux desde a versão 5.6. Não é, até à data da consulta, uma norma IETF, e o suporte em equipamentos de fabricantes varia: confirma-se na documentação do equipamento concreto. Em ambos os casos, as chaves privadas nunca saem do equipamento e as recomendações de algoritmos seguem orientações oficiais actualizadas (NIST SP 800-77 para IPsec).",
        ],
      },
    ],
    caso: "Na DPE (fictícia) a ligação r1–r2 passa a ser fornecida por um operador externo. A direcção pede garantia de que os documentos trocados entre a delegação e o servidor srv não possam ser lidos no caminho. O técnico propõe um túnel WireGuard entre r1 e r2, com endereços de túnel 10.255.2.1 e 10.255.2.2.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Caminho do operador (não confiável): r1 10.255.0.1 — r2 10.255.0.2.",
        "Túnel wg0: r1 10.255.2.1/30 (porta UDP 51820) — r2 10.255.2.2/30.",
        "Depois da prática: 10.20.10.0/24 e 10.10.0.0/16 passam pelo wg0 em vez do caminho directo.",
      ],
      passos: [
        { accao: "Pré-verificação: o módulo wireguard existe e wg0 não está em uso nos dois encaminhadores.", comandos: ["sudo modprobe wireguard && echo modulo-ok", "sudo ip -n r1 link show wg0 2>/dev/null && echo 'wg0 JA EXISTE em r1: parar'", "sudo ip -n r2 link show wg0 2>/dev/null && echo 'wg0 JA EXISTE em r2: parar'"], saida: ["modulo-ok", "(nenhuma outra linha: pode continuar)"] },
        { accao: "Consola A: capture no caminho do operador antes do túnel e gere um pedido do pc-del ao srv (ver o texto em claro).", comandos: ["Consola C: sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53", "Consola A: sudo ip netns exec r2 tcpdump -ni r2-r1 -A 'tcp port 80'  (esperar «listening on r2-r1»)", "Consola B: sudo ip netns exec pc-del python3 -c \"import urllib.request as u; u.urlopen('http://10.10.20.53/').read()\"", "Ctrl+C na consola A."], saida: ["IP 10.20.10.10.51022 > 10.10.20.53.80: Flags [P.] ... GET / HTTP/1.1", "(o pedido é legível no caminho do operador)"] },
        { accao: "Gere as chaves (em /tmp da máquina de prática, só leitura do root).", comandos: ["sudo sh -c 'umask 077; wg genkey | tee /tmp/m9-r1.key | wg pubkey > /tmp/m9-r1.pub'", "sudo sh -c 'umask 077; wg genkey | tee /tmp/m9-r2.key | wg pubkey > /tmp/m9-r2.pub'"] },
        { accao: "Crie o túnel nas duas pontas.", comandos: [
          "sudo ip -n r1 link add wg0 type wireguard",
          "sudo ip netns exec r1 wg set wg0 listen-port 51820 private-key /tmp/m9-r1.key peer $(sudo cat /tmp/m9-r2.pub) endpoint 10.255.0.2:51820 allowed-ips 10.255.2.2/32,10.20.10.0/24",
          "sudo ip -n r1 addr add 10.255.2.1/30 dev wg0 && sudo ip -n r1 link set wg0 up",
          "sudo ip -n r2 link add wg0 type wireguard",
          "sudo ip netns exec r2 wg set wg0 listen-port 51820 private-key /tmp/m9-r2.key peer $(sudo cat /tmp/m9-r1.pub) endpoint 10.255.0.1:51820 allowed-ips 10.255.2.1/32,10.10.0.0/16",
          "sudo ip -n r2 addr add 10.255.2.2/30 dev wg0 && sudo ip -n r2 link set wg0 up",
        ] },
        { accao: "Desvie as rotas internas para o túnel.", comandos: ["sudo ip -n r1 route replace 10.20.10.0/24 via 10.255.2.2 dev wg0", "sudo ip -n r2 route replace 10.10.0.0/16 via 10.255.2.1 dev wg0", "sudo ip netns exec pc-del traceroute -n 10.10.20.53"], saida: [" 1  10.20.10.1  0.05 ms", " 2  10.255.2.1  0.40 ms", " 3  10.10.20.53  0.45 ms"] },
        { accao: "Repita a captura no caminho do operador e o mesmo pedido.", comandos: ["Consola A: sudo ip netns exec r2 tcpdump -ni r2-r1 'udp port 51820 or tcp port 80'", "Consola B: repetir o pedido do pc-del.", "sudo ip netns exec r1 wg show wg0 latest-handshakes"], saida: ["IP 10.255.0.2.51820 > 10.255.0.1.51820: UDP, length 128", "IP 10.255.0.1.51820 > 10.255.0.2.51820: UDP, length 96", "(nenhuma linha tcp port 80 no caminho do operador)", "(chave pública de r2)\t1759055000"] },
      ],
      sucesso: [
        "Antes do túnel, o pedido HTTP é legível no caminho; depois, só aparecem pacotes UDP 51820 entre 10.255.0.1 e 10.255.0.2.",
        "O traceroute mostra 10.255.2.1 como segundo salto.",
        "O formando indica o que continua visível ao operador (endereços das pontas, volume, hora).",
      ],
      reversao: [
        "sudo ip -n r1 route replace 10.20.10.0/24 via 10.255.0.2",
        "sudo ip -n r2 route replace 10.10.0.0/16 via 10.255.0.1",
        "sudo ip -n r1 link del wg0; sudo ip -n r2 link del wg0",
        "sudo rm -f /tmp/m9-r1.key /tmp/m9-r1.pub /tmp/m9-r2.key /tmp/m9-r2.pub",
        "Ctrl+C nas consolas A e C. Verificar: sudo ip netns exec pc-del traceroute -n 10.10.20.53 volta a mostrar 10.255.0.1 no segundo salto.",
      ],
    },
    papel: [
      { tarefa: "Compare as duas capturas de exemplo: o que via o operador antes e depois do túnel?", esperado: "Antes: endereços internos 10.20.10.10 e 10.10.20.53, porta 80 e o texto «GET / HTTP/1.1». Depois: só UDP 51820 entre 10.255.0.2 e 10.255.0.1, com tamanhos e horas; o conteúdo e os endereços internos deixam de ser visíveis." },
      { tarefa: "Na linha allowed-ips do r1 está 10.255.2.2/32,10.20.10.0/24. Explique o que acontece se faltar 10.20.10.0/24.", esperado: "O WireGuard não aceita pacotes vindos do túnel com origem na delegação nem envia para lá tráfego destinado a 10.20.10.0/24: a delegação deixa de chegar à sede pelo túnel, embora o aperto de mão possa existir." },
      { tarefa: "A delegação vai ligar-se a um encaminhador de outro fabricante que só suporta IPsec. Que muda na proposta?", esperado: "Usar IPsec com IKEv2, acordando os mesmos parâmetros nas duas pontas, com base na documentação do equipamento e em NIST SP 800-77; o princípio (túnel cifrado entre locais e filtragem do que entra) mantém-se." },
    ],
    formativas: [
      { pergunta: "Com um túnel VPN entre sede e delegação, o que o operador ainda consegue ver?", opcoes: ["O conteúdo dos documentos", "Os endereços internos dos postos", "Os endereços públicos das pontas, o volume e a hora do tráfego", "Nada, o tráfego fica invisível"], certa: 2, comentario: "A cifra esconde o conteúdo e os endereços internos, mas não a existência do tráfego entre as duas pontas." },
      { pergunta: "Um posto infectado na delegação liga-se à sede pela VPN. A VPN impede o ataque?", opcoes: ["Sim, porque o tráfego é cifrado", "Não; a VPN protege o caminho, não os postos — é preciso filtrar e proteger os equipamentos", "Sim, se for IPsec", "Sim, se a chave for longa"], certa: 1, comentario: "Cifrar o canal não verifica a intenção do tráfego; firewall no túnel e segurança dos postos continuam necessárias." },
    ],
    leituraFacil: [
      "Uma VPN é um túnel fechado por cima do caminho do operador.",
      "Quem está no caminho não consegue ler o que vai dentro do túnel.",
      "A VPN não limpa um computador infectado.",
      "As chaves secretas nunca saem do equipamento.",
    ],
    guiao: {
      conducao: [
        "0–20 min: o que a VPN protege e não protege; IPsec e WireGuard; o caso da DPE.",
        "20–65 min: prática (captura antes, túnel, captura depois); quem não tiver o módulo wireguard no núcleo compara as duas capturas impressas e responde às tarefas em papel.",
        "65–75 min: formativas e correcção comentada.",
      ],
      errosComuns: [
        "Esquecer as redes internas em allowed-ips.",
        "Copiar chaves privadas por correio ou para fora da máquina de prática.",
        "Dizer que a VPN «esconde tudo»: o volume e as pontas continuam visíveis.",
      ],
    },
    fontes: ["wireguard", "rfc4301", "nist80077", "iproute2", "tcpdump"],
  },

  "r-m09-l3": {
    objectivos: [
      "Comparar topologias em estrela (sede ao centro) e em malha para ligar várias delegações.",
      "Planear o endereçamento de delegações de forma a permitir rotas resumidas.",
      "Acrescentar uma segunda delegação à rede de prática e limitar, na sede, o tráfego directo entre delegações ao necessário.",
    ],
    explicacao: [
      {
        titulo: "Estrela ou malha",
        paragrafos: [
          "Na estrela cada delegação liga-se só à sede; o tráfego entre delegações passa pela sede. É simples de gerir e de controlar (um só ponto de filtragem), mas a sede torna-se ponto único de falha e o caminho entre delegações é mais longo. Na malha as delegações ligam-se também entre si; o caminho é mais curto e há alternativas, mas cresce o número de ligações e de túneis a gerir (n delegações exigem até n×(n−1)/2 ligações).",
          "Para instituições públicas com serviços centralizados na sede, a estrela é normalmente o ponto de partida; acrescenta-se malha parcial só onde há tráfego intenso entre delegações ou necessidade de alternativa.",
        ],
      },
      {
        titulo: "Endereçamento que se resume",
        paragrafos: [
          "Se todas as delegações usarem blocos contíguos (10.20.0.0/16 dividido em /24 por delegação: 10.20.10.0/24, 10.20.20.0/24, …), a sede pode anunciar uma rota resumida 10.20.0.0/16 em vez de uma por delegação (RFC 4632). Menos rotas significa tabelas mais pequenas e menos erros. O plano deve ser escrito antes de abrir a segunda delegação.",
          "Ligar redes de instituições diferentes exige também acordo escrito: quem é responsável por cada ponta, que serviços podem passar, contactos e procedimento em caso de incidente. Endereços privados sobrepostos entre instituições resolvem-se com replaneamento ou NAT, decidido nesse acordo.",
        ],
      },
    ],
    caso: "A DPE (fictícia) abre uma segunda delegação com a rede 10.20.20.0/24, encaminhador r3 e posto pc-del2, ligada à sede pela WAN 10.255.3.0/30 (r1 = 10.255.3.1, r3 = 10.255.3.2). As delegações só precisam de aceder aos serviços da sede; a comunicação directa entre delegações deve ser recusada salvo ping de diagnóstico.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Novo: r3 (encaminhador da delegação 2) ligado a r1 por 10.255.3.0/30 e a pc-del2 (10.20.20.10/24, porta 10.20.20.1).",
        "Estrela: delegação 1 e delegação 2 só se ligam a r1.",
      ],
      passos: [
        { accao: "Pré-verificação: os nomes novos não existem na máquina.", comandos: ["for n in r3 pc-del2; do ip netns list | grep -qw \"$n\" && echo \"$n JA EXISTE: parar\"; done; echo verificado"], saida: ["verificado"] },
        { accao: "Crie a delegação 2 (espaços de nomes e ligações).", comandos: [
          "sudo ip netns add r3; sudo ip netns add pc-del2",
          "sudo ip link add r1-r3 type veth peer name r3-r1; sudo ip link set r1-r3 netns r1; sudo ip link set r3-r1 netns r3",
          "sudo ip link add r3-pc-del2 type veth peer name pc-del2-r3; sudo ip link set r3-pc-del2 netns r3; sudo ip link set pc-del2-r3 netns pc-del2",
          "sudo ip -n r1 addr add 10.255.3.1/30 dev r1-r3; sudo ip -n r3 addr add 10.255.3.2/30 dev r3-r1",
          "sudo ip -n r3 addr add 10.20.20.1/24 dev r3-pc-del2; sudo ip -n pc-del2 addr add 10.20.20.10/24 dev pc-del2-r3",
          "for n in r3 pc-del2; do sudo ip -n $n link set lo up; done; sudo ip -n r1 link set r1-r3 up; sudo ip -n r3 link set r3-r1 up; sudo ip -n r3 link set r3-pc-del2 up; sudo ip -n pc-del2 link set pc-del2-r3 up",
          "sudo ip netns exec r3 sysctl -qw net.ipv4.ip_forward=1",
        ] },
        { accao: "Rotas em estrela: a delegação 2 envia tudo o que é interno para a sede; a sede conhece a nova rede.", comandos: ["sudo ip -n pc-del2 route add default via 10.20.20.1", "sudo ip -n r3 route add 10.0.0.0/8 via 10.255.3.1", "sudo ip -n r1 route add 10.20.20.0/24 via 10.255.3.2", "sudo ip -n r2 route add 10.20.20.0/24 via 10.255.0.1", "sudo ip netns exec pc-del2 ping -c 2 10.10.20.53", "sudo ip netns exec pc-del2 traceroute -n 10.20.10.10"], saida: ["2 packets transmitted, 2 received", " 1  10.20.20.1  0.05 ms", " 2  10.255.3.1  0.07 ms", " 3  10.255.0.2  0.09 ms", " 4  10.20.10.10  0.10 ms"] },
        { accao: "Na sede, recuse o tráfego entre delegações excepto ping (tabela própria, fácil de remover).", comandos: [
          "sudo ip netns exec r1 nft add table inet m9deleg",
          "sudo ip netns exec r1 nft add chain inet m9deleg fwd '{ type filter hook forward priority 0; policy accept; }'",
          "sudo ip netns exec r1 nft add rule inet m9deleg fwd ip saddr 10.20.0.0/16 ip daddr 10.20.0.0/16 icmp type echo-request accept",
          "sudo ip netns exec r1 nft add rule inet m9deleg fwd ip saddr 10.20.0.0/16 ip daddr 10.20.0.0/16 ct state established,related accept",
          "sudo ip netns exec r1 nft add rule inet m9deleg fwd ip saddr 10.20.0.0/16 ip daddr 10.20.0.0/16 counter drop",
        ] },
        { accao: "Teste: ping entre delegações passa; web da delegação 2 para a 1 é recusado; web para a sede continua.", comandos: ["Consola C: sudo ip netns exec pc-del python3 -m http.server 80 --bind 10.20.10.10", "sudo ip netns exec pc-del2 ping -c 1 10.20.10.10", "sudo ip netns exec pc-del2 python3 -c \"import urllib.request as u; u.urlopen('http://10.20.10.10/', timeout=3)\"", "sudo ip netns exec r1 nft list chain inet m9deleg fwd"], saida: ["1 packets transmitted, 1 received", "TimeoutError: timed out  (ou urlopen error timed out)", "... counter packets 2 bytes 120 drop"] },
      ],
      sucesso: [
        "pc-del2 chega ao srv e o traceroute para a delegação 1 passa pela sede (10.255.3.1).",
        "O pedido web entre delegações falha e o contador drop aumenta; o ping passa.",
        "A dupla escreve a rota resumida que a sede poderia anunciar (10.20.0.0/16).",
      ],
      reversao: [
        "Ctrl+C na consola C.",
        "sudo ip netns exec r1 nft delete table inet m9deleg",
        "sudo ip -n r2 route del 10.20.20.0/24 via 10.255.0.1",
        "sudo ip -n r1 route del 10.20.20.0/24 via 10.255.3.2",
        "sudo ip netns del pc-del2; sudo ip netns del r3  (só estes dois nomes, criados nesta lição; apagar o espaço r3 remove também a ponta r1-r3)",
        "Verificar: sudo ip -n r1 link show r1-r3 deve responder «does not exist».",
      ],
    },
    papel: [
      { tarefa: "A DPE vai ter 6 delegações. Quantas ligações exige a estrela e quantas a malha completa?", esperado: "Estrela: 6 (uma por delegação). Malha completa entre sede e 6 delegações (7 locais): 7×6/2 = 21." },
      { tarefa: "Atribua redes às delegações 3 e 4 e escreva a rota resumida.", esperado: "Delegação 3: 10.20.30.0/24; delegação 4: 10.20.40.0/24. Rota resumida na sede e para fora: 10.20.0.0/16 (cobre 10.20.0.0 a 10.20.255.255)." },
      { tarefa: "Com a saída de exemplo do nft, explique porque o pedido web falhou e o ping passou.", esperado: "A regra aceita echo-request entre 10.20.0.0/16 e respostas de ligações estabelecidas; o pedido web (TCP 80) não é aceite e cai na última regra, que o recusa e conta 2 pacotes (tentativas SYN)." },
    ],
    formativas: [
      { pergunta: "Qual é a principal desvantagem da topologia em estrela?", opcoes: ["Exige mais ligações do que a malha", "A sede é ponto único de falha e o tráfego entre delegações faz um caminho mais longo", "Não permite VPN", "Não permite rotas resumidas"], certa: 1, comentario: "A estrela concentra controlo e simplicidade na sede, à custa de dependência dela; reduz-se com ligação alternativa na sede." },
      { pergunta: "Porque se atribuem às delegações blocos contíguos dentro de 10.20.0.0/16?", opcoes: ["Por obrigação legal", "Para poder usar uma só rota resumida e reduzir erros", "Para ter mais velocidade", "Para não precisar de encaminhador"], certa: 1, comentario: "Blocos contíguos permitem agregação (RFC 4632): uma rota em vez de muitas." },
    ],
    leituraFacil: [
      "Estrela: todas as delegações ligam-se à sede.",
      "Malha: as delegações também se ligam entre si.",
      "Dê a cada delegação um bloco de endereços em sequência.",
      "Escreva um acordo antes de ligar redes de instituições diferentes.",
    ],
    guiao: {
      conducao: [
        "0–20 min: estrela e malha; endereçamento contíguo e rotas resumidas; acordo entre instituições.",
        "20–65 min: prática da segunda delegação e filtragem na sede; quem não tiver o laboratório responde em papel com as saídas impressas.",
        "65–75 min: formativas e correcção comentada.",
      ],
      errosComuns: [
        "Esquecer a rota de volta no r2 para a nova delegação.",
        "Filtrar tudo entre delegações e perder o ping de diagnóstico.",
        "Apagar espaços de nomes que não foram criados nesta lição.",
      ],
    },
    fontes: ["rfc4632", "rfc1918", "iproute2", "nftables"],
  },
};
