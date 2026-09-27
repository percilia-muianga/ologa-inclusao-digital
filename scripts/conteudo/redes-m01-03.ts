/**
 * Curso de Redes — módulos 1 a 3 (Fundamentos, Comutação, Encaminhamento).
 * Conteúdo fictício e didáctico; ver regras em redes-base.ts.
 */
import { SCRIPT_BASE, SCRIPT_REMOVER, TOPOLOGIA_BASE, type ConteudoLicao } from "./redes-base";

export const LICOES_M01_03: Record<string, ConteudoLicao> = {
  // ───────────────────────── MÓDULO 1 — Fundamentos ─────────────────────────
  "r-m01-l1": {
    objectivos: [
      "Explicar as camadas do modelo TCP/IP e a sua correspondência com o modelo OSI.",
      "Identificar, numa captura, cabeçalhos Ethernet, IP e TCP/UDP de um mesmo pacote.",
      "Criar e desfazer a rede de prática isolada usada em todo o curso.",
    ],
    explicacao: [
      {
        titulo: "Porque se fala em camadas",
        paragrafos: [
          "Uma comunicação em rede é dividida em funções independentes. Cada camada resolve um problema e entrega o resultado à camada seguinte: a aplicação produz dados; o transporte (TCP ou UDP) separa conversas por portas; a rede (IP) leva o pacote de um endereço a outro, atravessando encaminhadores; a ligação (Ethernet, Wi-Fi) leva a trama ao vizinho seguinte; a camada física transforma bits em sinal eléctrico, luz ou rádio.",
          "O modelo OSI tem sete camadas (física, ligação de dados, rede, transporte, sessão, apresentação, aplicação); o modelo TCP/IP, usado na prática, junta as três superiores numa camada de aplicação. O OSI continua útil como vocabulário de diagnóstico: dizer «o problema é de camada 2» significa que a trama não chega ao vizinho, mesmo que o endereço IP esteja certo.",
        ],
      },
      {
        titulo: "Encapsulamento",
        paragrafos: [
          "Quando o pc-adm pede uma página ao servidor, o pedido HTTP é colocado num segmento TCP (porta de destino 80), este num pacote IP (origem 10.10.10.10, destino 10.10.20.53) e este numa trama Ethernet (endereços MAC do pc-adm e do r1). Em cada encaminhador a trama é substituída por outra; o pacote IP mantém origem e destino (salvo NAT, módulo 3).",
          "Esta ideia explica porque é que o endereço MAC muda em cada troço e o IP não, e porque é que um filtro de firewall pode decidir por endereço IP (camada 3) ou por porta (camada 4).",
        ],
      },
    ],
    caso:
      "Na DPE (fictícia), o técnico Manuel recebe a queixa «a internet não funciona» vinda da Administração. Sem método, reinicia o encaminhador e interrompe toda a sede. Nesta lição a turma aprende a descrever o problema por camadas antes de agir.",
    pratica: {
      topologia: TOPOLOGIA_BASE,
      passos: [
        { accao: "Guarde o script base num ficheiro lab-base.sh, torne-o executável e corra-o como administrador do computador de prática.", comandos: [...SCRIPT_BASE, "", "# depois de guardar:", "chmod +x lab-base.sh && sudo ./lab-base.sh"] },
        { accao: "Guarde também o script de reversão lab-remover.sh.", comandos: SCRIPT_REMOVER },
        { accao: "Confirme os espaços de nomes criados e o endereço do pc-adm.", comandos: ["sudo ip netns list", "sudo ip -n pc-adm -brief addr"], saida: ["pc-adm-r1@if5   UP   10.10.10.10/24", "lo              UNKNOWN 127.0.0.1/8 ::1/128"] },
        { accao: "Numa segunda consola, capture no r1 enquanto o pc-adm envia um ping ao servidor.", comandos: ["sudo ip netns exec r1 tcpdump -ni r1-pc-adm -e -c 2 icmp", "sudo ip netns exec pc-adm ping -c 1 10.10.20.53"], saida: ["aa:aa:aa:00:00:10 > aa:aa:aa:00:00:01, ethertype IPv4 (0x0800), length 98: 10.10.10.10 > 10.10.20.53: ICMP echo request", "aa:aa:aa:00:00:01 > aa:aa:aa:00:00:10, ethertype IPv4 (0x0800), length 98: 10.10.20.53 > 10.10.10.10: ICMP echo reply"] },
        { accao: "Identifique na saída o que pertence à camada 2 (endereços MAC, ethertype) e à camada 3 (endereços IP). Os MAC reais do seu computador serão diferentes dos do exemplo." },
      ],
      sucesso: [
        "O comando ip netns list mostra os seis espaços de nomes.",
        "O ping do pc-adm ao srv recebe resposta (o r1 encaminha entre as duas redes).",
        "O formando aponta correctamente, na captura, os campos de camada 2 e de camada 3.",
      ],
      reversao: ["sudo ./lab-remover.sh apaga toda a rede de prática; o computador volta ao estado anterior (nenhuma alteração permanente)."],
    },
    papel: [
      { tarefa: "Ordene de cima para baixo as camadas TCP/IP e diga a unidade de dados de cada uma.", esperado: "Aplicação (dados/mensagem); transporte (segmento TCP ou datagrama UDP); rede/Internet (pacote); ligação (trama); física (bits)." },
      { tarefa: "Na saída de exemplo do passo 4, que campo muda quando o pacote passa do r1 para o srv?", esperado: "Os endereços MAC (nova trama no troço r1–srv). Os endereços IP 10.10.10.10 e 10.10.20.53 mantêm-se." },
      { tarefa: "Reescreva a queixa «a internet não funciona» em três perguntas por camadas.", esperado: "Física/ligação: o cabo ou o Wi-Fi está ligado e com ligação? Rede: o computador tem endereço e alcança a porta 10.10.10.1? Aplicação: o nome do sítio resolve (DNS) e o serviço responde?" },
    ],
    formativas: [
      { pergunta: "Um pacote vai do pc-adm (10.10.10.10) ao srv (10.10.20.53) passando pelo r1. O que se mantém de ponta a ponta?", opcoes: ["Os endereços MAC de origem e destino", "Os endereços IP de origem e destino", "O número da VLAN", "Nada se mantém"], certa: 1, comentario: "A camada 3 é de ponta a ponta; a trama (camada 2) é refeita em cada troço. A VLAN é local a cada ligação. A excepção é o NAT, que altera endereços IP de propósito." },
      { pergunta: "Um utilizador tem endereço IP correcto mas o cabo está partido. Em que camada está o problema?", opcoes: ["Aplicação", "Transporte", "Física", "Rede"], certa: 2, comentario: "Sem sinal não há trama nem pacote: a configuração IP pode estar perfeita e mesmo assim nada passa. Por isso o diagnóstico começa por baixo." },
    ],
    leituraFacil: [
      "A rede funciona por andares, chamados camadas.",
      "Cada andar faz um trabalho: o cabo leva sinal, o IP leva o pacote ao destino, a aplicação mostra a página.",
      "Quando algo falha, veja primeiro o andar de baixo.",
    ],
    guiao: {
      conducao: [
        "0–20 min: desenhar no quadro as camadas com o exemplo de uma carta (envelope dentro de envelope).",
        "20–60 min: duplas correm lab-base.sh, fazem a captura e marcam os campos a lápis numa cópia impressa da saída.",
        "60–70 min: questões formativas e verificação oral; todos correm lab-remover.sh no fim.",
      ],
      errosComuns: [
        "Confundir endereço MAC com endereço IP: pedir que digam qual muda em cada salto.",
        "Esquecer sudo: os espaços de nomes exigem privilégio de administrador no computador de prática.",
      ],
    },
    fontes: ["rfc791", "rfc1918", "rfc5737", "iproute2", "tcpdump"],
  },

  "r-m01-l2": {
    objectivos: [
      "Calcular rede, difusão, primeiro e último endereço úteis de um prefixo IPv4.",
      "Dividir um bloco em sub-redes de tamanhos diferentes (VLSM) sem sobreposição.",
      "Ler um endereço IPv6 abreviado e o prefixo /64 habitual numa rede local.",
    ],
    explicacao: [
      {
        titulo: "Prefixo e máscara",
        paragrafos: [
          "Um endereço IPv4 tem 32 bits. O prefixo /24 diz que os primeiros 24 bits identificam a rede e os 8 restantes os equipamentos: 2^8 = 256 endereços, dos quais 254 úteis (retira-se o endereço de rede e o de difusão). A máscara equivalente é 255.255.255.0.",
          "Para /26 sobram 6 bits: 64 endereços, 62 úteis. Os blocos /26 começam de 64 em 64: .0, .64, .128, .192. Em /30 há 4 endereços e 2 úteis — usado em ligações ponto a ponto como a 10.255.0.0/30 entre r1 e r2.",
        ],
      },
      {
        titulo: "Planear sem sobreposição",
        paragrafos: [
          "Ordena-se as necessidades da maior para a menor e reserva-se cada bloco no próximo limite livre. Deixar espaço para crescer é decisão de concepção: uma VLAN com 50 pessoas hoje merece /25 ou /24 se a instituição vai crescer.",
          "IPv6 tem 128 bits. Numa rede local o prefixo recomendado e habitual é /64 (RFC 7421), exigido pela autoconfiguração SLAAC (RFC 4862); ligações ponto-a-ponto podem usar /127 (RFC 6164). O endereço 2001:db8:10:10::1 abrevia 2001:0db8:0010:0010:0000:0000:0000:0001: zeros à esquerda caem e uma sequência de grupos a zero passa a «::» uma única vez.",
        ],
      },
    ],
    caso:
      "A delegação da DPE (fictícia) vai abrir uma sala de formação com 40 computadores, um balcão com 12 postos e 6 câmaras. O técnico recebe o bloco 10.20.0.0/22 e deve propor um plano sem sobreposições, com margem.",
    pratica: {
      topologia: ["pc-del (10.20.10.10/24) ligado a r2 (10.20.10.1/24). Nesta prática acrescentam-se endereços secundários a r2 para testar os cálculos."],
      passos: [
        { accao: "Com o script base activo, use o módulo ipaddress do Python para conferir o seu cálculo de 10.20.10.64/26.", comandos: ["python3 -c \"import ipaddress as i; n=i.ip_network('10.20.10.64/26'); print(n.network_address, n.broadcast_address, list(n.hosts())[0], list(n.hosts())[-1], n.num_addresses)\""], saida: ["10.20.10.64 10.20.10.127 10.20.10.65 10.20.10.126 64"] },
        { accao: "Verifique se dois blocos se sobrepõem antes de os atribuir.", comandos: ["python3 -c \"import ipaddress as i; print(i.ip_network('10.20.0.0/26').overlaps(i.ip_network('10.20.0.32/27')))\""], saida: ["True"] },
        { accao: "Atribua ao r2 um endereço de teste numa nova sub-rede e confirme a rota ligada que o sistema cria.", comandos: ["sudo ip -n r2 addr add 10.20.12.1/26 dev r2-pc-del", "sudo ip -n r2 route show 10.20.12.0/26"], saida: ["10.20.12.0/26 dev r2-pc-del proto kernel scope link src 10.20.12.1"] },
        { accao: "Acrescente um endereço IPv6 de documentação ao pc-adm e leia-o na forma abreviada.", comandos: ["sudo ip -n pc-adm -6 addr add 2001:db8:10:10::10/64 dev pc-adm-r1", "sudo ip -n pc-adm -6 -brief addr"], saida: ["pc-adm-r1@if5  UP  2001:db8:10:10::10/64 fe80::a8aa:aaff:fe00:10/64"] },
      ],
      sucesso: [
        "O plano do caso usa 10.20.0.0/26 (sala, 62 úteis), 10.20.0.64/27 (balcão, 30 úteis) e 10.20.0.96/28 (câmaras, 14 úteis), ou outra solução sem sobreposição e com margem justificada.",
        "Os cálculos manuais coincidem com a verificação em Python.",
      ],
      reversao: ["sudo ip -n r2 addr del 10.20.12.1/26 dev r2-pc-del", "sudo ip -n pc-adm -6 addr del 2001:db8:10:10::10/64 dev pc-adm-r1"],
    },
    papel: [
      { tarefa: "Para 10.10.30.128/25 indique rede, difusão, primeiro e último úteis.", esperado: "Rede 10.10.30.128; difusão 10.10.30.255; primeiro útil 10.10.30.129; último útil 10.10.30.254; 126 úteis." },
      { tarefa: "Proponha o plano do caso a partir de 10.20.0.0/22.", esperado: "Sala 40 → /26 (10.20.0.0/26); balcão 12 → /28 dá só 14 úteis, sem margem, por isso /27 (10.20.0.64/27); câmaras 6 → /28 (10.20.0.96/28); resto do /22 reservado para crescimento. Aceitar alternativas sem sobreposição e justificadas." },
      { tarefa: "Escreva por extenso 2001:db8:10:10::1.", esperado: "2001:0db8:0010:0010:0000:0000:0000:0001." },
    ],
    formativas: [
      { pergunta: "Quantos endereços úteis tem uma rede /27?", opcoes: ["32", "30", "62", "14"], certa: 1, comentario: "/27 deixa 5 bits: 32 endereços, menos rede e difusão = 30. 62 é de /26 e 14 de /28." },
      { pergunta: "O técnico quer dar 10.20.0.32/27 ao balcão, mas a sala já tem 10.20.0.0/26. O que acontece?", opcoes: ["Nada, são redes diferentes", "Há sobreposição: 10.20.0.32–63 pertence às duas", "Só há problema em IPv6", "O encaminhador escolhe automaticamente"], certa: 1, comentario: "10.20.0.0/26 vai de .0 a .63. Um /27 começado em .32 fica dentro dele: dois equipamentos podiam receber o mesmo endereço. É sempre um erro de concepção." },
    ],
    leituraFacil: [
      "O número depois da barra (/24, /26) diz o tamanho da rede.",
      "Quanto maior o número, mais pequena a rede.",
      "Duas redes não podem usar os mesmos endereços.",
    ],
    guiao: {
      conducao: [
        "0–20 min: resolver no quadro /24, /26 e /30 com a tabela das potências de 2.",
        "20–65 min: duplas resolvem o caso em papel e confirmam com Python e com o r2.",
        "65–75 min: formativas; cada dupla apresenta o seu plano em 1 minuto.",
      ],
      errosComuns: ["Contar o endereço de rede ou de difusão como útil.", "Começar um bloco /26 fora do múltiplo de 64 (por exemplo 10.20.0.40/26)."],
    },
    fontes: ["rfc4632", "rfc1918", "rfc3849", "rfc8200", "python", "iproute2", "rfc7421", "rfc4862", "rfc6164"],
  },

  "r-m01-l3": {
    objectivos: [
      "Distinguir cabo de cobre, fibra óptica e rádio pelas distâncias e usos.",
      "Explicar a função de comutador, encaminhador, ponto de acesso e firewall.",
      "Ler o estado físico de uma interface e o seu débito negociado.",
    ],
    explicacao: [
      {
        titulo: "Meios físicos",
        paragrafos: [
          "O cabo de par entrançado de cobre (categorias 5e, 6, 6A) serve ligações Ethernet até 100 metros por troço; a fibra multimodo serve centenas de metros dentro de um edifício ou campus; a fibra monomodo serve quilómetros, entre edifícios ou até ao operador. O rádio (Wi-Fi) liberta do cabo mas partilha o meio e sofre interferência (módulo 4).",
          "Na escolha pesam distância, interferência eléctrica (a fibra não a sofre), custo, protecção contra raios entre edifícios e manutenção disponível no distrito.",
        ],
      },
      {
        titulo: "Equipamentos e as suas camadas",
        paragrafos: [
          "Comutador (switch): liga equipamentos da mesma rede local e decide por endereço MAC (camada 2); os comutadores geridos permitem VLAN. Encaminhador (router): liga redes diferentes e decide por endereço IP (camada 3). Ponto de acesso: ponte entre rádio e cabo. Firewall: decide que tráfego passa entre zonas, por endereços, portas e estado das ligações.",
          "Cada fabricante tem a sua linguagem de configuração; os conceitos são os mesmos. Neste curso usa-se Linux, que faz de comutador (bridge), encaminhador e firewall (nftables), porque é gratuito e as ideias transferem-se para qualquer equipamento.",
        ],
      },
    ],
    caso:
      "A DPE (fictícia) vai ligar um novo armazém a 350 metros da sede. Um fornecedor propõe cabo de cobre entre os edifícios. O técnico deve responder com uma alternativa fundamentada.",
    pratica: {
      topologia: ["Rede base. Nesta prática cria-se uma ponte Linux (comutador virtual) br-lab no r1 e ligam-se dois postos de teste."],
      passos: [
        { accao: "Veja o estado de uma interface: estado da ligação e tipo.", comandos: ["sudo ip -n r1 -details link show r1-pc-adm"], saida: ["3: r1-pc-adm@if2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP", "    link/ether aa:aa:aa:00:00:01 brd ff:ff:ff:ff:ff:ff link-netns pc-adm", "    veth"] },
        { accao: "Num computador físico com placa Ethernet (não na rede de prática), o débito negociado lê-se com ethtool. Aqui só se mostra o exemplo.", saida: ["Speed: 1000Mb/s", "Duplex: Full", "Link detected: yes"] },
        { accao: "Crie um comutador virtual no r1 e dois postos de teste ligados a ele.", comandos: ["sudo ip netns add t1; sudo ip netns add t2", "sudo ip -n r1 link add br-lab type bridge", "for t in t1 t2; do sudo ip link add $t-br type veth peer name br-$t; sudo ip link set $t-br netns $t; sudo ip link set br-$t netns r1; sudo ip -n r1 link set br-$t master br-lab up; done", "sudo ip -n r1 link set br-lab up", "sudo ip -n t1 addr add 192.168.50.1/24 dev t1-br; sudo ip -n t1 link set t1-br up", "sudo ip -n t2 addr add 192.168.50.2/24 dev t2-br; sudo ip -n t2 link set t2-br up", "sudo ip netns exec t1 ping -c 2 192.168.50.2"] },
        { accao: "Veja a tabela de endereços MAC que o comutador aprendeu.", comandos: ["sudo ip netns exec r1 bridge fdb show br br-lab | grep -v permanent"], saida: ["aa:bb:cc:00:00:01 dev br-t1 master br-lab", "aa:bb:cc:00:00:02 dev br-t2 master br-lab"] },
      ],
      sucesso: ["t1 e t2 comunicam através de br-lab sem nenhum encaminhamento IP.", "A tabela fdb mostra um MAC aprendido em cada porta."],
      reversao: ["sudo ip netns del t1; sudo ip netns del t2; sudo ip -n r1 link del br-lab"],
    },
    papel: [
      { tarefa: "Responda ao fornecedor do caso.", esperado: "350 m excede os 100 m do cobre Ethernet por troço; entre edifícios o cobre também conduz sobretensões. Propor fibra (multimodo serve a distância com os débitos habituais; monomodo se houver previsão de maior distância), com conversores ou portas ópticas nos comutadores." },
      { tarefa: "Classifique: switch, router, ponto de acesso, firewall — que endereço usa cada um para decidir?", esperado: "Switch: MAC (camada 2). Router: IP (camada 3). Ponto de acesso: ponte rádio–cabo (camada 2). Firewall: IP, portas e estado (camadas 3–4, às vezes 7)." },
      { tarefa: "Na saída do passo 1, o que indica LOWER_UP?", esperado: "Que a camada física/ligação está activa (há portadora). UP sozinho indica só que a interface foi activada administrativamente." },
    ],
    formativas: [
      { pergunta: "Qual o meio mais adequado para ligar dois edifícios a 2 km?", opcoes: ["Cabo categoria 6", "Fibra monomodo", "Cabo telefónico", "Wi-Fi doméstico"], certa: 1, comentario: "A fibra monomodo é feita para quilómetros e é imune a interferência eléctrica. Uma ligação rádio ponto a ponto dedicada também pode ser opção, mas não um Wi-Fi doméstico." },
      { pergunta: "Dois computadores na mesma rede comunicam através de um comutador. O comutador precisa de rota IP?", opcoes: ["Sim, sempre", "Não, decide por endereço MAC", "Só em IPv6", "Só se tiver firewall"], certa: 1, comentario: "Dentro da mesma rede local a entrega é de camada 2. A rota IP só é precisa para chegar a outra rede, através de um encaminhador." },
    ],
    leituraFacil: ["Cabo de cobre: curto, até 100 metros.", "Fibra: longe e sem interferência.", "Comutador liga computadores; encaminhador liga redes."],
    guiao: {
      conducao: ["0–20 min: mostrar amostras de cabo e fibra (se houver) ou fotografias impressas.", "20–65 min: prática do comutador virtual e resposta ao caso.", "65–75 min: formativas."],
      errosComuns: ["Achar que o ponto de acesso é um encaminhador: em muitas casas o mesmo aparelho faz as duas coisas.", "Esquecer de activar (up) as portas da ponte."],
    },
    fontes: ["iproute2", "ieee8021q", "ieee80211"],
  },

  "r-m01-l4": {
    objectivos: [
      "Explicar ARP, ICMP, TCP, UDP, DNS e DHCP e em que momento cada um aparece.",
      "Reconhecer numa captura o aperto de mão TCP (SYN, SYN-ACK, ACK).",
      "Aplicar filtros de captura e de visualização simples.",
    ],
    explicacao: [
      {
        titulo: "Os protocolos de todos os dias",
        paragrafos: [
          "ARP descobre o MAC correspondente a um IP na mesma rede. ICMP transporta mensagens de controlo (eco para o ping, «destino inalcançável», «tempo excedido» usado pelo traceroute). TCP garante entrega ordenada e fiável, com ligação estabelecida por três mensagens (RFC 9293); UDP envia sem ligação, sem confirmação nem retransmissão (RFC 768). Por não esperar confirmações, UDP tem menos atraso de arranque e é adequado a consultas curtas (DNS) e a voz e vídeo em tempo real; não é, por si, «mais rápido» em débito — a fiabilidade, se necessária, passa para a aplicação.",
          "DNS traduz nomes em endereços (porta 53). DHCP entrega automaticamente endereço, máscara, porta de ligação e servidores DNS (portas 67/68). Serão configurados no módulo 5.",
        ],
      },
      {
        titulo: "Ver para perceber",
        paragrafos: [
          "tcpdump e Wireshark/tshark mostram os pacotes. Filtro de captura (sintaxe pcap) reduz o que se grava: «tcp port 80». Filtro de visualização (Wireshark) escolhe o que se mostra: «tcp.flags.syn == 1». Capturas podem conter dados pessoais: só em rede de prática ou com autorização.",
        ],
      },
    ],
    caso: "O pc-adm da DPE (fictícia) demora a abrir a intranet. O técnico quer saber se o atraso está na resolução do nome ou na ligação TCP.",
    pratica: {
      topologia: TOPOLOGIA_BASE,
      passos: [
        { accao: "Ponha um serviço web simples no srv (servidor de teste do Python, só para a prática).", comandos: ["Consola C (deixar aberta): sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53", "Esperar a linha «Serving HTTP on 10.10.20.53 port 80» antes do passo seguinte."] },
        { accao: "Limpe a cache ARP do pc-adm e capture ARP e TCP no r1 durante um pedido.", comandos: ["Consola B: sudo ip -n pc-adm neigh flush all", "Consola A: sudo ip netns exec r1 tcpdump -ni r1-pc-adm -w /tmp/m1l4.pcap 'arp or tcp port 80'", "Esperar na consola A a linha «tcpdump: listening on r1-pc-adm» antes de continuar.", "Consola B: sudo ip netns exec pc-adm python3 -c \"import urllib.request as u; print(u.urlopen('http://10.10.20.53/').status)\"", "Consola A: terminar a captura com Ctrl+C (termina apenas este tcpdump e fecha o ficheiro)."], saida: ["Consola A: tcpdump: listening on r1-pc-adm, link-type EN10MB (Ethernet), snapshot length 262144 bytes", "Consola B: 200"] },
        { accao: "Leia a captura com tshark.", comandos: ["tshark -r /tmp/m1l4.pcap -Y 'arp || tcp.flags.syn==1 || (tcp.flags==0x010 && tcp.seq==1 && tcp.ack==1 && tcp.len==0)' -T fields -e frame.number -e _ws.col.Info"], saida: ["1  Who has 10.10.10.1? Tell 10.10.10.10", "2  10.10.10.1 is at aa:aa:aa:00:00:01", "3  50412 → 80 [SYN] Seq=0", "4  80 → 50412 [SYN, ACK] Seq=0 Ack=1", "5  50412 → 80 [ACK] Seq=1 Ack=1 Len=0"] },
        { accao: "Nota sobre o filtro: tcp.flags.syn==1 sozinho mostra só SYN e SYN-ACK; o ACK final do aperto de mão não tem SYN, por isso acrescenta-se a condição «só ACK, números relativos 1/1, sem dados». Números de sequência relativos são o comportamento por omissão do Wireshark/tshark." },
        { accao: "Compare com um pedido DNS em UDP (será configurado no módulo 5): identifique na tabela do papel as diferenças TCP/UDP." },
      ],
      sucesso: ["O formando identifica ARP antes do TCP e o aperto de mão SYN, SYN-ACK, ACK.", "O ficheiro de captura é apagado no fim."],
      reversao: ["Na consola C, terminar o servidor de teste com Ctrl+C (termina só esse processo).", "rm -f /tmp/m1l4.pcap"],
    },
    papel: [
      { tarefa: "Porque aparece ARP antes do TCP na captura?", esperado: "O pc-adm precisa do MAC da porta de ligação 10.10.10.1 para construir a trama; o destino 10.10.20.53 está noutra rede, por isso pergunta pelo MAC do r1, não do srv." },
      { tarefa: "Complete: DNS usa ___ porta ___; DHCP usa ___ portas ___.", esperado: "DNS: porta 53, normalmente UDP para consultas; TCP é também obrigatório de suportar (RFC 7766) e usa-se, por exemplo, quando a resposta é truncada, em transferências de zona e com DNS sobre TLS (porta 853). DHCP: UDP portas 67 (servidor) e 68 (cliente)." },
      { tarefa: "Escreva um filtro de captura para apanhar só tráfego do pc-adm para a porta 443.", esperado: "src host 10.10.10.10 and tcp dst port 443" },
    ],
    formativas: [
      { pergunta: "O traceroute mostra os saltos porque os encaminhadores devolvem:", opcoes: ["TCP RST", "ICMP «tempo excedido»", "ARP reply", "DHCP ACK"], certa: 1, comentario: "Cada salto reduz o TTL; quando chega a zero, o encaminhador devolve ICMP «tempo excedido», revelando o seu endereço." },
      { pergunta: "Qual protocolo é mais indicado para uma chamada de voz?", opcoes: ["TCP, porque garante entrega", "UDP, porque um atraso de retransmissão é pior que uma pequena perda", "ARP", "ICMP"], certa: 1, comentario: "Na voz, um pacote retransmitido chega tarde demais para ser útil. Usa-se UDP (com RTP), aceitando pequenas perdas." },
    ],
    leituraFacil: ["ARP pergunta: quem tem este endereço?", "TCP confirma que os dados chegaram.", "UDP não confirma: serve para mensagens curtas e para voz ou vídeo ao vivo.", "DNS troca nomes por números."],
    guiao: {
      conducao: ["0–20 min: tabela dos protocolos com portas e exemplos.", "20–65 min: captura e leitura; quem tiver ambiente gráfico abre o ficheiro no Wireshark.", "65–80 min: formativas e verificação oral do aperto de mão (SYN, SYN-ACK, ACK) com a captura aberta; apagar o ficheiro de captura."],
      errosComuns: ["Achar que o pc-adm pede o MAC do servidor noutra rede.", "Deixar o servidor de teste a correr depois da aula."],
    },
    fontes: ["rfc826", "rfc792", "rfc9293", "rfc768", "rfc1034", "rfc7766", "rfc2131", "tcpdump", "wireshark"],
  },

  "r-m01-l5": {
    objectivos: [
      "Aplicar um método de diagnóstico de baixo para cima, com hipótese e prova.",
      "Usar ip, ping, traceroute e ss para localizar a falha.",
      "Registar o diagnóstico numa ficha curta reutilizável.",
    ],
    explicacao: [
      {
        titulo: "Método antes de ferramenta",
        paragrafos: [
          "1) Descrever o sintoma com factos (quem, onde, desde quando, o que funciona). 2) Verificar camada física/ligação (estado da interface). 3) Verificar configuração IP (endereço, máscara, porta de ligação). 4) Alcançar a porta de ligação, depois o destino, depois o nome. 5) Verificar o serviço (porta aberta). 6) Mudar uma coisa de cada vez, provar, registar.",
          "Mudar várias coisas ao mesmo tempo esconde a causa e pode criar novas falhas. Reiniciar sem diagnóstico pode apagar a evidência.",
        ],
      },
    ],
    caso: "Três queixas na DPE (fictícia): o pc-adm «não chega a nada», a delegação não chega à sede e o servidor web «está em baixo». O formador provoca as três avarias na rede de prática e as duplas encontram-nas.",
    pratica: {
      topologia: TOPOLOGIA_BASE,
      passos: [
        { accao: "Formador: provoque a avaria 1 (porta de ligação errada no pc-adm).", comandos: ["sudo ip -n pc-adm route replace default via 10.10.10.254"] },
        { accao: "Duplas: diagnostique de baixo para cima.", comandos: ["sudo ip -n pc-adm -brief link", "sudo ip -n pc-adm -brief addr", "sudo ip -n pc-adm route", "sudo ip netns exec pc-adm ping -c 2 10.10.10.1", "sudo ip netns exec pc-adm ping -c 2 10.10.20.53"], saida: ["default via 10.10.10.254 dev pc-adm-r1", "... 10.10.10.1: 2 packets transmitted, 2 received", "... 10.10.20.53: From 10.10.10.10 icmp_seq=1 Destination Host Unreachable"] },
        { accao: "Avaria 2: não há rotas entre sede e delegação (estado do script base). Confirme com traceroute a partir do pc-del.", comandos: ["sudo ip netns exec pc-del traceroute -n 10.10.20.53"], saida: [" 1  10.20.10.1  0.05 ms", " 2  * * *"] },
        { accao: "Avaria 3: o serviço web não está a escutar. Verifique as portas abertas no srv.", comandos: ["sudo ip netns exec srv ss -ltn"], saida: ["State  Recv-Q Send-Q Local Address:Port Peer Address:Port"] },
        { accao: "Corrija só a avaria 1 e prove; a avaria 2 resolve-se no módulo 3.", comandos: ["sudo ip -n pc-adm route replace default via 10.10.10.1", "sudo ip netns exec pc-adm ping -c 2 10.10.20.53"] },
      ],
      sucesso: ["Cada dupla escreve, para cada avaria, a camada, a prova e a correcção proposta.", "Nenhuma correcção é feita sem hipótese escrita."],
      reversao: ["sudo ip -n pc-adm route replace default via 10.10.10.1", "Ou reconstruir tudo: sudo ./lab-remover.sh && sudo ./lab-base.sh"],
    },
    papel: [
      { tarefa: "Avaria 1: que prova mostra que o problema é a porta de ligação?", esperado: "A rota por omissão aponta para 10.10.10.254 (inexistente), o ping a 10.10.10.1 funciona (ligação e endereço correctos) e o ping para outra rede falha com «Destination Host Unreachable»." },
      { tarefa: "Avaria 2: o que significa «* * *» no segundo salto?", esperado: "O r2 recebe o pacote mas não tem rota para 10.10.20.0/24 (ou as respostas não voltam); o problema é de encaminhamento entre r2 e r1." },
      { tarefa: "Preencha a ficha: sintoma / camada / prova / correcção / verificação / quem e quando.", esperado: "Ex.: «pc-adm sem acesso a outras redes» / 3 / rota por omissão 10.10.10.254 / corrigir para 10.10.10.1 / ping 10.10.20.53 com resposta / nome do técnico, data e hora." },
    ],
    formativas: [
      { pergunta: "O ping à porta de ligação funciona, mas o ping a outra rede não. O que se verifica a seguir?", opcoes: ["O cabo", "A rota por omissão e o encaminhamento", "O navegador", "A palavra-passe do utilizador"], certa: 1, comentario: "Se a porta de ligação responde, as camadas 1–2 e o endereço local estão bem. O próximo suspeito é a rota ou o encaminhador." },
      { pergunta: "Qual é a atitude certa perante várias hipóteses?", opcoes: ["Mudar tudo de uma vez para ganhar tempo", "Testar uma hipótese de cada vez e registar", "Reiniciar o encaminhador principal", "Esperar que resolva sozinho"], certa: 1, comentario: "Uma mudança de cada vez permite saber o que resolveu e evita novas avarias. Reiniciar pode apagar a evidência e afectar todos." },
    ],
    leituraFacil: ["Comece pelo cabo, depois o endereço, depois o destino.", "Mude uma coisa de cada vez.", "Escreva o que fez."],
    guiao: {
      conducao: ["0–20 min: método em seis passos no quadro.", "20–70 min: avarias provocadas, uma de cada vez, com 10–15 min cada.", "70–80 min: formativas e partilha das fichas."],
      errosComuns: ["Saltar logo para o serviço sem verificar a porta de ligação.", "Corrigir sem registar a prova."],
    },
    fontes: ["iproute2", "rfc792", "nist80061"],
  },

  // ───────────────────────── MÓDULO 2 — Comutação ─────────────────────────
  "r-m02-l1": {
    objectivos: [
      "Explicar como um comutador aprende endereços MAC e decide o reencaminhamento.",
      "Distinguir domínio de colisão e domínio de difusão.",
      "Ler e limpar a tabela de endereços de um comutador.",
    ],
    explicacao: [
      {
        titulo: "Aprender, reencaminhar, inundar",
        paragrafos: [
          "Quando chega uma trama, o comutador regista o MAC de origem e a porta por onde entrou (aprendizagem). Se conhece o MAC de destino, envia só por essa porta; se não conhece, ou se é difusão (ff:ff:ff:ff:ff:ff), envia por todas as outras portas da mesma rede (inundação). As entradas envelhecem (tipicamente 300 segundos) e desaparecem se o equipamento se calar.",
          "Cada porta de um comutador é um domínio de colisão separado; toda a rede local (a VLAN) é um domínio de difusão. Redes locais muito grandes sofrem com excesso de difusão: é uma das razões para segmentar em VLAN.",
        ],
      },
    ],
    caso: "Na DPE (fictícia), um portátil ligado ora à sala 1 ora à sala 2 perde a ligação durante uns segundos ao mudar. O técnico explica porquê com a tabela MAC.",
    pratica: {
      topologia: ["No r1, ponte br-lab com três portas (t1, t2, t3), rede 192.168.50.0/24 de teste (igual à lição 3 do módulo 1, com um terceiro posto)."],
      passos: [
        { accao: "Recrie a ponte da lição anterior com três postos.", comandos: ["sudo ip -n r1 link add br-lab type bridge && sudo ip -n r1 link set br-lab up", "for i in 1 2 3; do sudo ip netns add t$i; sudo ip link add t$i-br type veth peer name br-t$i; sudo ip link set t$i-br netns t$i; sudo ip link set br-t$i netns r1; sudo ip -n r1 link set br-t$i master br-lab up; sudo ip -n t$i addr add 192.168.50.$i/24 dev t$i-br; sudo ip -n t$i link set t$i-br up; done"] },
        { accao: "Veja o tempo de envelhecimento e a tabela antes e depois de tráfego.", comandos: ["sudo ip -n r1 -d link show br-lab | grep -o 'ageing_time [0-9]*'", "sudo ip netns exec r1 bridge fdb show br br-lab dynamic", "sudo ip netns exec t1 ping -c 1 192.168.50.3", "sudo ip netns exec r1 bridge fdb show br br-lab dynamic"], saida: ["ageing_time 30000", "(vazio antes do tráfego)", "aa:bb:cc:00:00:01 dev br-t1 master br-lab", "aa:bb:cc:00:00:03 dev br-t3 master br-lab"] },
        { accao: "Observe a inundação: capture no t2 enquanto t1 fala com t3 pela primeira vez (depois de limpar a tabela).", comandos: ["sudo ip netns exec r1 bridge fdb flush dev br-lab", "Consola A: sudo ip netns exec t2 tcpdump -ni t2-br -c 1 arp", "Esperar na consola A a linha «listening on t2-br»; o tcpdump termina sozinho após 1 pacote (-c 1).", "Consola B: sudo ip netns exec t1 arping -c 1 -I t1-br 192.168.50.3 || sudo ip netns exec t1 ping -c 1 192.168.50.3"], saida: ["ARP, Request who-has 192.168.50.3 tell 192.168.50.1"] },
      ],
      sucesso: ["O formando explica porque o t2 viu o pedido ARP (difusão) mas não o eco ICMP seguinte (unicast já aprendido).", "ageing_time 30000 é lido como 300,00 segundos (centésimos)."],
      reversao: ["for i in 1 2 3; do sudo ip netns del t$i; done; sudo ip -n r1 link del br-lab"],
    },
    papel: [
      { tarefa: "Explique o caso do portátil que muda de sala.", esperado: "O comutador ainda associa o MAC do portátil à porta antiga; as tramas vão para lá até o portátil transmitir na nova porta (a entrada é actualizada) ou até a entrada envelhecer. Normalmente resolve-se logo que o portátil envia tráfego." },
      { tarefa: "Uma rede com 800 postos numa só VLAN: que problema de difusão prever?", esperado: "Cada difusão (ARP, DHCP, descobertas) chega aos 800 postos, consumindo largura de banda e processamento; uma falha ou ciclo afecta todos. Propor segmentação em VLAN." },
      { tarefa: "Um comutador com 24 portas tem quantos domínios de colisão e de difusão (sem VLAN)?", esperado: "24 domínios de colisão e 1 domínio de difusão." },
    ],
    formativas: [
      { pergunta: "Um comutador recebe uma trama para um MAC que não conhece. O que faz?", opcoes: ["Descarta", "Envia por todas as outras portas da VLAN", "Envia ao encaminhador", "Pede o MAC por DNS"], certa: 1, comentario: "É a inundação: garante a entrega; quando o destino responder, o comutador aprende a porta dele." },
      { pergunta: "Qual o efeito de dividir uma rede grande em várias VLAN?", opcoes: ["Aumenta o domínio de difusão", "Reduz cada domínio de difusão", "Elimina a necessidade de encaminhador", "Desliga o ARP"], certa: 1, comentario: "Cada VLAN é um domínio de difusão próprio. Para comunicarem entre si passa a ser preciso encaminhamento (lição 3)." },
    ],
    leituraFacil: ["O comutador aprende onde está cada computador.", "Se não sabe, envia para todos.", "Redes muito grandes ficam lentas com mensagens para todos."],
    guiao: {
      conducao: ["0–20 min: explicar com um desenho de portas e uma tabela vazia que se vai preenchendo.", "20–60 min: prática.", "60–70 min: formativas."],
      errosComuns: ["Confundir tabela MAC do comutador com tabela ARP do computador.", "Ler ageing_time como segundos directos."],
    },
    fontes: ["ieee8021q", "iproute2"],
  },

  "r-m02-l2": {
    objectivos: [
      "Explicar o que é uma VLAN e a etiqueta 802.1Q.",
      "Configurar portas de acesso e portas tronco num comutador virtual.",
      "Provar que duas VLAN não comunicam sem encaminhamento.",
    ],
    explicacao: [
      {
        titulo: "Uma rede física, várias redes lógicas",
        paragrafos: [
          "Uma VLAN separa, no mesmo comutador, grupos de portas em domínios de difusão diferentes. Uma porta de acesso pertence a uma VLAN e envia tramas sem etiqueta ao posto. Uma porta tronco transporta várias VLAN entre comutadores ou até ao encaminhador, com a etiqueta 802.1Q (4 bytes, com o número da VLAN de 1 a 4094).",
          "Na DPE: VLAN 10 Administração, 20 Servidores, 30 Visitantes, 99 Gestão. Boa prática: não usar a VLAN 1 para utilizadores nem para gestão, e deixar portas não usadas numa VLAN sem saída.",
        ],
      },
    ],
    caso: "Os visitantes ligados à tomada da recepção da DPE (fictícia) conseguem ver as impressoras da Administração. O técnico propõe separar a recepção em VLAN 30.",
    pratica: {
      topologia: ["No r1, ponte br-vlan com filtragem de VLAN activa. Postos: a1 (VLAN 10, 10.10.10.21), a2 (VLAN 10, 10.10.10.22), v1 (VLAN 30, 10.10.30.21)."],
      passos: [
        { accao: "Crie o comutador com VLAN e três portas.", comandos: ["sudo ip -n r1 link add br-vlan type bridge vlan_filtering 1 && sudo ip -n r1 link set br-vlan up", "for p in a1 a2 v1; do sudo ip netns add $p; sudo ip link add $p-sw type veth peer name sw-$p; sudo ip link set $p-sw netns $p; sudo ip link set sw-$p netns r1; sudo ip -n r1 link set sw-$p master br-vlan up; sudo ip -n $p link set $p-sw up; done", "sudo ip -n a1 addr add 10.10.10.21/24 dev a1-sw; sudo ip -n a2 addr add 10.10.10.22/24 dev a2-sw; sudo ip -n v1 addr add 10.10.10.23/24 dev v1-sw"] },
        { accao: "Defina portas de acesso: a1 e a2 na VLAN 10, v1 na VLAN 30 (retirando a VLAN 1 por omissão).", comandos: ["for p in a1 a2; do sudo ip netns exec r1 bridge vlan del dev sw-$p vid 1; sudo ip netns exec r1 bridge vlan add dev sw-$p vid 10 pvid untagged; done", "sudo ip netns exec r1 bridge vlan del dev sw-v1 vid 1; sudo ip netns exec r1 bridge vlan add dev sw-v1 vid 30 pvid untagged", "sudo ip netns exec r1 bridge vlan show"], saida: ["port    vlan-id", "sw-a1   10 PVID Egress Untagged", "sw-a2   10 PVID Egress Untagged", "sw-v1   30 PVID Egress Untagged", "br-vlan 1 PVID Egress Untagged"] },
        { accao: "Prove a separação. Repare que v1 foi configurado de propósito com um endereço da VLAN 10 para mostrar que a separação é de camada 2, não de endereço.", comandos: ["sudo ip netns exec a1 ping -c 2 10.10.10.22", "sudo ip netns exec a1 ping -c 2 10.10.10.23"], saida: ["2 packets transmitted, 2 received", "2 packets transmitted, 0 received, +2 errors (Destination Host Unreachable)"] },
        { accao: "Corrija o endereço do v1 para a VLAN 30.", comandos: ["sudo ip -n v1 addr flush dev v1-sw && sudo ip -n v1 addr add 10.10.30.21/24 dev v1-sw"] },
      ],
      sucesso: ["a1 fala com a2 (mesma VLAN); a1 não fala com v1 mesmo com endereço da mesma rede.", "bridge vlan show corresponde ao plano."],
      reversao: ["for p in a1 a2 v1; do sudo ip netns del $p; done; sudo ip -n r1 link del br-vlan"],
    },
    papel: [
      { tarefa: "Desenhe em texto a configuração de portas para a recepção (2 tomadas) e a Administração (4 tomadas) num comutador de 8 portas com tronco na porta 8.", esperado: "Portas 1–4: acesso VLAN 10; portas 5–6: acesso VLAN 30; porta 7: não usada, desactivada ou numa VLAN sem saída; porta 8: tronco com VLAN 10, 20, 30 e 99 etiquetadas." },
      { tarefa: "Porque é que o v1 não alcança o a1 mesmo com endereço 10.10.10.23?", esperado: "As tramas do v1 entram na VLAN 30 e o comutador só as reencaminha para portas da VLAN 30; o pedido ARP nunca chega ao a1." },
      { tarefa: "Que valor tem a VLAN na etiqueta 802.1Q e quantos bits usa?", esperado: "Campo VID de 12 bits; valores úteis 1 a 4094." },
    ],
    formativas: [
      { pergunta: "Uma porta tronco serve para:", opcoes: ["Ligar um só computador", "Transportar várias VLAN etiquetadas entre equipamentos", "Dar acesso à internet", "Desligar a VLAN 1"], certa: 1, comentario: "A porta tronco leva as etiquetas 802.1Q para que o equipamento do outro lado saiba a que VLAN pertence cada trama." },
      { pergunta: "Qual é uma boa prática com portas não usadas?", opcoes: ["Deixá-las na VLAN de gestão", "Desactivá-las ou colocá-las numa VLAN sem saída", "Configurá-las como tronco", "Deixá-las na VLAN 1"], certa: 1, comentario: "Uma porta livre na VLAN de gestão ou em tronco é uma porta de entrada para quem se ligar à tomada." },
    ],
    leituraFacil: ["VLAN separa grupos no mesmo comutador.", "Visitantes numa VLAN, funcionários noutra.", "Para falarem entre si é preciso um encaminhador."],
    guiao: {
      conducao: ["0–20 min: explicar acesso vs tronco com o desenho de um corredor com portas.", "20–65 min: prática; conferir bridge vlan show dupla a dupla.", "65–75 min: formativas."],
      errosComuns: ["Esquecer de retirar a VLAN 1 por omissão.", "Achar que endereços da mesma rede bastam para comunicar."],
    },
    fontes: ["ieee8021q", "iproute2"],
  },

  "r-m02-l3": {
    objectivos: [
      "Configurar encaminhamento entre VLAN com subinterfaces (router-on-a-stick).",
      "Explicar a diferença para um comutador de camada 3.",
      "Verificar que o tráfego entre VLAN passa pelo encaminhador.",
    ],
    explicacao: [
      {
        titulo: "Uma porta, várias redes",
        paragrafos: [
          "Para que a VLAN 10 fale com a VLAN 20 é preciso encaminhamento IP. A forma mais simples: uma porta tronco do comutador ao encaminhador, que cria uma subinterface por VLAN (por exemplo eth0.10 com 10.10.10.1/24 e eth0.20 com 10.10.20.1/24). Cada posto usa a subinterface da sua VLAN como porta de ligação.",
          "Um comutador de camada 3 faz o mesmo internamente (interfaces virtuais por VLAN) com mais débito. O ponto de passagem entre VLAN é também o sítio natural para filtrar tráfego (módulo 7).",
        ],
      },
    ],
    caso: "Na DPE (fictícia), a Administração (VLAN 10) precisa de chegar ao servidor de ficheiros (VLAN 20), mas os visitantes (VLAN 30) não devem. Nesta lição liga-se o encaminhamento; a filtragem vem no módulo 7.",
    pratica: {
      topologia: ["Espaço sw (comutador) com br0 com VLAN; porta tronco sw-rt ligada a rt (encaminhador) com subinterfaces rt-sw.10 e rt-sw.20; postos a1 (VLAN 10, 10.10.10.21) e s1 (VLAN 20, 10.10.20.21)."],
      passos: [
        { accao: "Crie comutador, encaminhador e postos.", comandos: ["for n in sw rt a1 s1; do sudo ip netns add $n; done", "sudo ip -n sw link add br0 type bridge vlan_filtering 1 && sudo ip -n sw link set br0 up", "lig() { sudo ip link add $1-$2 type veth peer name $2-$1; sudo ip link set $1-$2 netns $1; sudo ip link set $2-$1 netns $2; sudo ip -n $1 link set $1-$2 up; sudo ip -n $2 link set $2-$1 up; }", "lig a1 sw; lig s1 sw; lig rt sw", "for p in sw-a1 sw-s1 sw-rt; do sudo ip -n sw link set $p master br0; sudo ip netns exec sw bridge vlan del dev $p vid 1; done", "sudo ip netns exec sw bridge vlan add dev sw-a1 vid 10 pvid untagged", "sudo ip netns exec sw bridge vlan add dev sw-s1 vid 20 pvid untagged", "sudo ip netns exec sw bridge vlan add dev sw-rt vid 10; sudo ip netns exec sw bridge vlan add dev sw-rt vid 20"] },
        { accao: "No encaminhador, crie as subinterfaces etiquetadas e active o encaminhamento.", comandos: ["sudo ip -n rt link add link rt-sw name rt-sw.10 type vlan id 10", "sudo ip -n rt link add link rt-sw name rt-sw.20 type vlan id 20", "sudo ip -n rt addr add 10.10.10.1/24 dev rt-sw.10; sudo ip -n rt addr add 10.10.20.1/24 dev rt-sw.20", "sudo ip -n rt link set rt-sw.10 up; sudo ip -n rt link set rt-sw.20 up", "sudo ip netns exec rt sysctl -qw net.ipv4.ip_forward=1"] },
        { accao: "Configure os postos e teste.", comandos: ["sudo ip -n a1 addr add 10.10.10.21/24 dev a1-sw; sudo ip -n a1 route add default via 10.10.10.1", "sudo ip -n s1 addr add 10.10.20.21/24 dev s1-sw; sudo ip -n s1 route add default via 10.10.20.1", "sudo ip netns exec a1 traceroute -n 10.10.20.21"], saida: [" 1  10.10.10.1  0.06 ms", " 2  10.10.20.21  0.08 ms"] },
        { accao: "Veja as etiquetas na porta tronco.", comandos: ["Consola A: sudo ip netns exec rt tcpdump -eni rt-sw -c 2 'vlan and icmp[icmptype] == icmp-echo'", "Esperar na consola A a linha «listening on rt-sw»; termina sozinho após 2 pacotes.", "Consola B: sudo ip netns exec a1 ping -c 1 10.10.20.21", "Nota: na interface tronco as tramas levam etiqueta 802.1Q; o filtro precisa de «vlan and …», porque «icmp» sozinho procura IPv4 logo após o cabeçalho Ethernet e não apanha tramas etiquetadas."], saida: ["... ethertype 802.1Q (0x8100), length 102: vlan 10, p 0, ethertype IPv4, 10.10.10.21 > 10.10.20.21: ICMP echo request", "... ethertype 802.1Q (0x8100), length 102: vlan 20, p 0, ethertype IPv4, 10.10.10.21 > 10.10.20.21: ICMP echo request"] },
      ],
      sucesso: ["traceroute mostra o salto pelo encaminhador.", "A captura mostra o mesmo pacote a entrar na VLAN 10 e a sair na VLAN 20."],
      reversao: ["for n in sw rt a1 s1; do sudo ip netns del $n; done"],
    },
    papel: [
      { tarefa: "Que porta de ligação configura um posto da VLAN 30?", esperado: "10.10.30.1, endereço da subinterface VLAN 30 do encaminhador." },
      { tarefa: "Na captura, porque o mesmo pacote aparece duas vezes com VLAN diferente?", esperado: "Entra pela subinterface .10 (VLAN 10) e sai, encaminhado, pela subinterface .20 (VLAN 20), na mesma porta física tronco." },
      { tarefa: "Vantagem e limite do router-on-a-stick.", esperado: "Vantagem: uma só porta física, barato. Limite: todo o tráfego entre VLAN partilha essa porta (gargalo); em redes maiores usa-se comutador de camada 3." },
    ],
    formativas: [
      { pergunta: "Sem encaminhador, um posto da VLAN 10 consegue falar com um da VLAN 20?", opcoes: ["Sim, se estiverem no mesmo comutador", "Não, é preciso encaminhamento IP", "Sim, com o mesmo cabo", "Só por Wi-Fi"], certa: 1, comentario: "VLAN diferentes são redes diferentes; só um equipamento de camada 3 as liga." },
      { pergunta: "Onde é mais natural aplicar a regra «visitantes não chegam aos servidores»?", opcoes: ["Em cada posto", "No ponto que encaminha entre VLAN", "No DNS", "No cabo"], certa: 1, comentario: "Todo o tráfego entre VLAN passa por aí; uma regra nesse ponto aplica-se a todos. Será feita com nftables no módulo 7." },
    ],
    leituraFacil: ["Cada VLAN precisa de uma porta de saída no encaminhador.", "Uma só ligação pode levar várias VLAN.", "É aí que se decide quem pode falar com quem."],
    guiao: {
      conducao: ["0–20 min: desenho com cores por VLAN.", "20–65 min: prática em duplas.", "65–75 min: formativas."],
      errosComuns: ["Esquecer de permitir as VLAN na porta tronco do comutador.", "Não activar ip_forward."],
    },
    fontes: ["ieee8021q", "iproute2"],
  },

  "r-m02-l4": {
    objectivos: [
      "Explicar porque um ciclo na camada 2 derruba uma rede.",
      "Descrever STP/RSTP: raiz, portas bloqueadas e convergência.",
      "Activar STP num comutador virtual e observar a porta bloqueada.",
    ],
    explicacao: [
      {
        titulo: "Redundância sem ciclos",
        paragrafos: [
          "Ligar dois comutadores por dois cabos dá redundância, mas cria um ciclo: as difusões circulam para sempre (tempestade de difusão) e a tabela MAC oscila. O protocolo Spanning Tree (802.1D, e a versão rápida RSTP em 802.1Q) elege um comutador raiz e bloqueia portas até restar uma árvore sem ciclos. Se uma ligação falha, uma porta bloqueada passa a reencaminhar.",
          "Boas práticas: escolher a raiz de propósito (prioridade mais baixa no comutador central), proteger portas de acesso para que um posto não se anuncie como comutador, e documentar as ligações redundantes. A agregação de ligações (LACP) é outra forma de redundância, somando cabos numa só ligação lógica.",
        ],
      },
    ],
    caso: "Um funcionário da DPE (fictícia) liga as duas pontas de um cabo a duas tomadas da mesma sala. Metade da sede fica sem rede. O técnico explica o sucedido e propõe protecção.",
    pratica: {
      topologia: ["Três comutadores virtuais sa, sb e sc ligados em triângulo (sa–sb, sb–sc, sc–sa), cada um uma ponte br0 num espaço de nomes próprio."],
      passos: [
        { accao: "Crie o triângulo com STP activo desde o início (nunca sem STP, para não criar uma tempestade no seu computador).", comandos: ["for s in sa sb sc; do sudo ip netns add $s; sudo ip -n $s link add br0 type bridge stp_state 1; done", "sudo ip -n sa link set br0 type bridge priority 4096", "lig() { sudo ip link add $1-$2 type veth peer name $2-$1; sudo ip link set $1-$2 netns $1; sudo ip link set $2-$1 netns $2; sudo ip -n $1 link set $1-$2 master br0 up; sudo ip -n $2 link set $2-$1 master br0 up; }", "lig sa sb; lig sb sc; lig sc sa", "for s in sa sb sc; do sudo ip -n $s link set br0 up; done", "sleep 35"] },
        { accao: "Veja o estado das portas; uma delas deve estar bloqueada.", comandos: ["for s in sa sb sc; do echo $s; sudo ip netns exec $s bridge link; done"], saida: ["sa", "... sa-sb master br0 state forwarding priority 32 cost 2", "... sa-sc master br0 state forwarding priority 32 cost 2", "sb", "... sb-sa master br0 state forwarding ...", "... sb-sc master br0 state forwarding ...", "sc", "... sc-sb master br0 state blocking ...", "... sc-sa master br0 state forwarding ..."] },
        { accao: "Simule a falha da ligação sa–sc e observe a porta bloqueada a passar a reencaminhar (o STP clássico do Linux demora cerca de 30 segundos).", comandos: ["sudo ip -n sa link set sa-sc down", "sleep 35; sudo ip netns exec sc bridge link"], saida: ["... sc-sb master br0 state forwarding ...", "... sc-sa master br0 state disabled ..."] },
      ],
      sucesso: ["Com as três ligações activas, há exactamente uma porta bloqueada.", "sa é a raiz (prioridade 4096).", "Após a falha, a rede continua ligada pela porta antes bloqueada."],
      reversao: ["for s in sa sb sc; do sudo ip netns del $s; done"],
    },
    papel: [
      { tarefa: "Explique o caso do cabo ligado a duas tomadas.", esperado: "Criou-se um ciclo de camada 2; sem STP (ou com portas de acesso sem protecção) as difusões multiplicaram-se e saturaram os comutadores. Protecção: STP/RSTP activo, protecção BPDU nas portas de acesso e controlo de tempestades." },
      { tarefa: "Porque escolher manualmente a raiz?", esperado: "Para que a árvore passe pelo comutador central e mais capaz; se ficar a eleição por omissão, pode ganhar um comutador pequeno de canto, com caminhos maus." },
      { tarefa: "Diferença entre STP e agregação de ligações.", esperado: "STP bloqueia caminhos redundantes (uma só ligação activa); a agregação junta várias ligações paralelas numa lógica, activas ao mesmo tempo." },
    ],
    formativas: [
      { pergunta: "O que faz o STP perante um ciclo?", opcoes: ["Desliga um comutador", "Bloqueia portas até não haver ciclos", "Aumenta a velocidade", "Cria VLAN"], certa: 1, comentario: "Mantém a redundância física, mas só uma árvore activa; em falha reactiva caminhos bloqueados." },
      { pergunta: "Qual a diferença prática entre STP clássico e RSTP?", opcoes: ["RSTP converge muito mais depressa", "RSTP não bloqueia portas", "STP só funciona em Wi-Fi", "Não há diferença"], certa: 0, comentario: "O STP clássico demora dezenas de segundos; o RSTP negoceia estados e converge tipicamente em poucos segundos. A ponte do Linux usa STP clássico no núcleo; RSTP exige um serviço adicional (mstpd)." },
    ],
    leituraFacil: ["Dois caminhos entre comutadores fazem um círculo.", "O círculo pode parar a rede toda.", "O STP fecha um caminho e abre-o se o outro cair."],
    guiao: {
      conducao: ["0–20 min: simular a tempestade com uma bola passada em círculo.", "20–70 min: prática, incluindo as esperas de convergência.", "70–80 min: formativas."],
      errosComuns: ["Criar o triângulo sem STP no computador de prática (pode sobrecarregá-lo).", "Não esperar a convergência antes de concluir."],
    },
    fontes: ["ieee8021q", "iproute2"],
  },

  "r-m02-l5": {
    objectivos: [
      "Verificar que a segmentação corresponde ao desenho documentado.",
      "Detectar portas mal atribuídas e VLAN em falta no tronco.",
      "Produzir uma tabela de verificação de segmentação.",
    ],
    explicacao: [
      {
        titulo: "Desenho, configuração, prova",
        paragrafos: [
          "Segmentar é uma decisão de segurança desde a concepção: separar Administração, Servidores, Visitantes e Gestão reduz o alcance de uma infecção e protege a gestão dos equipamentos. Mas uma configuração errada dá falsa segurança. Verifica-se em três planos: a configuração (que VLAN tem cada porta), o comportamento (quem alcança quem) e o documento (a tabela do desenho).",
          "Qualquer diferença entre os três é um achado: ou a configuração está errada, ou o documento está desactualizado. Ambos se corrigem, com registo.",
        ],
      },
    ],
    caso: "O documento da DPE (fictícia) diz que a porta 5 é da VLAN 30 (Visitantes). Um visitante, na porta 5, abre a página de gestão de um comutador. O técnico verifica.",
    pratica: {
      topologia: ["Comutador br-vlan com portas sw-a1 (plano: VLAN 10), sw-v1 (plano: VLAN 30), sw-g1 (plano: VLAN 99). O formador introduz um erro."],
      passos: [
        { accao: "Construa a rede (igual à lição 2, acrescentando g1 com 10.10.99.21) e aplique o plano.", comandos: ["sudo ip -n r1 link add br-vlan type bridge vlan_filtering 1 && sudo ip -n r1 link set br-vlan up", "for p in a1 v1 g1; do sudo ip netns add $p; sudo ip link add $p-sw type veth peer name sw-$p; sudo ip link set $p-sw netns $p; sudo ip link set sw-$p netns r1; sudo ip -n r1 link set sw-$p master br-vlan up; sudo ip -n $p link set $p-sw up; sudo ip netns exec r1 bridge vlan del dev sw-$p vid 1; done", "sudo ip netns exec r1 bridge vlan add dev sw-a1 vid 10 pvid untagged", "sudo ip netns exec r1 bridge vlan add dev sw-g1 vid 99 pvid untagged", "sudo ip -n a1 addr add 10.10.10.21/24 dev a1-sw; sudo ip -n v1 addr add 10.10.99.30/24 dev v1-sw; sudo ip -n g1 addr add 10.10.99.21/24 dev g1-sw"] },
        { accao: "Formador: introduza o erro — a porta do visitante fica na VLAN 99.", comandos: ["sudo ip netns exec r1 bridge vlan add dev sw-v1 vid 99 pvid untagged"] },
        { accao: "Duplas: compare configuração com o plano e teste o comportamento.", comandos: ["sudo ip netns exec r1 bridge vlan show", "sudo ip netns exec v1 ping -c 1 10.10.99.21"], saida: ["sw-a1  10 PVID Egress Untagged", "sw-v1  99 PVID Egress Untagged", "sw-g1  99 PVID Egress Untagged", "1 packets transmitted, 1 received"] },
        { accao: "Corrija e prove.", comandos: ["sudo ip netns exec r1 bridge vlan del dev sw-v1 vid 99", "sudo ip netns exec r1 bridge vlan add dev sw-v1 vid 30 pvid untagged", "sudo ip -n v1 addr flush dev v1-sw; sudo ip -n v1 addr add 10.10.30.21/24 dev v1-sw", "sudo ip netns exec v1 ping -c 1 -W 1 10.10.99.21"], saida: ["1 packets transmitted, 0 received"] },
      ],
      sucesso: ["A tabela de verificação tem uma linha por porta: VLAN planeada, VLAN configurada, teste feito, resultado, acção.", "Depois da correcção, v1 não alcança a VLAN 99."],
      reversao: ["for p in a1 v1 g1; do sudo ip netns del $p; done; sudo ip -n r1 link del br-vlan"],
    },
    papel: [
      { tarefa: "Preencha a tabela de verificação para as três portas, antes da correcção.", esperado: "sw-a1: plano 10 / configurada 10 / conforme. sw-v1: plano 30 / configurada 99 / NÃO conforme — visitante alcança gestão / corrigir para 30. sw-g1: plano 99 / configurada 99 / conforme." },
      { tarefa: "Que risco concreto criava o erro?", esperado: "Um visitante na rede de gestão pode tentar aceder às interfaces de administração dos equipamentos; se houver palavras-passe fracas ou falhas, compromete toda a rede." },
      { tarefa: "Além de corrigir a porta, o que se deve fazer?", esperado: "Registar o achado, verificar se houve acessos indevidos (registos dos equipamentos), actualizar o documento e rever as outras portas do mesmo comutador." },
    ],
    formativas: [
      { pergunta: "A configuração diz VLAN 99, o documento diz VLAN 30. Qual é a acção correcta?", opcoes: ["Mudar o documento para 99", "Confirmar a intenção, corrigir a configuração e registar", "Ignorar", "Desligar o comutador"], certa: 1, comentario: "O documento reflecte a decisão de desenho; a diferença é um achado a corrigir e registar, não a esconder." },
      { pergunta: "Para provar a segmentação, basta ler a configuração?", opcoes: ["Sim", "Não, é preciso também testar o comportamento", "Só em IPv6", "Só com firewall"], certa: 1, comentario: "Leitura e teste completam-se: a configuração pode ter efeitos inesperados e o teste mostra o que realmente acontece." },
    ],
    leituraFacil: ["Compare o papel com o que está configurado.", "Teste quem chega a quem.", "Se não bater certo, corrija e escreva."],
    guiao: {
      conducao: ["0–20 min: apresentar a tabela de verificação em branco.", "20–70 min: prática com erro introduzido; cada dupla entrega a tabela.", "70–80 min: formativas."],
      errosComuns: ["Corrigir sem registar.", "Testar só num sentido."],
    },
    fontes: ["ieee8021q", "iproute2", "nist800207"],
  },

  // ───────────────────────── MÓDULO 3 — Encaminhamento ─────────────────────────
  "r-m03-l1": {
    objectivos: [
      "Ler uma tabela de encaminhamento e aplicar a regra do prefixo mais longo.",
      "Distinguir rota ligada, estática e por omissão.",
      "Prever o caminho de um pacote antes de o testar.",
    ],
    explicacao: [
      {
        titulo: "Como o encaminhador decide",
        paragrafos: [
          "Para cada pacote, o encaminhador procura na tabela a rota com o prefixo mais longo que contém o destino. Se há 10.0.0.0/8 e 10.20.10.0/24, um pacote para 10.20.10.10 segue a /24. A rota 0.0.0.0/0 (por omissão) apanha tudo o que não tem rota mais específica.",
          "Rotas ligadas aparecem sozinhas quando se atribui um endereço a uma interface. As restantes são estáticas (escritas pelo técnico) ou dinâmicas (aprendidas por protocolo, lição 3). Cada decisão é local: cada encaminhador do caminho precisa de saber o próximo salto, e o caminho de volta também.",
        ],
      },
    ],
    caso: "Na DPE (fictícia), a delegação chega à sede mas as respostas não voltam. O técnico lembra que o encaminhamento é de ida e de volta.",
    pratica: {
      topologia: TOPOLOGIA_BASE,
      passos: [
        { accao: "Leia a tabela do r1 e identifique as rotas ligadas.", comandos: ["sudo ip -n r1 route"], saida: ["10.10.10.0/24 dev r1-pc-adm proto kernel scope link src 10.10.10.1", "10.10.20.0/24 dev r1-srv proto kernel scope link src 10.10.20.1", "10.255.0.0/30 dev r1-r2 proto kernel scope link src 10.255.0.1", "203.0.113.0/24 dev r1-isp proto kernel scope link src 203.0.113.2"] },
        { accao: "Pergunte ao núcleo que rota usaria para vários destinos.", comandos: ["sudo ip -n r1 route get 10.20.10.10", "sudo ip -n r1 route get 10.10.20.53"], saida: ["RTNETLINK answers: Network is unreachable", "10.10.20.53 dev r1-srv src 10.10.20.1"] },
        { accao: "Acrescente só a ida (r1 → delegação) e teste do srv para o pc-del.", comandos: ["sudo ip -n r1 route add 10.20.10.0/24 via 10.255.0.2", "sudo ip netns exec srv ping -c 2 -W 1 10.20.10.10"], saida: ["2 packets transmitted, 0 received"] },
        { accao: "Acrescente a volta no r2 e teste de novo.", comandos: ["sudo ip -n r2 route add 10.10.0.0/16 via 10.255.0.1", "sudo ip netns exec srv ping -c 2 10.20.10.10"], saida: ["2 packets transmitted, 2 received"] },
        { accao: "Demonstre o prefixo mais longo: rota /16 e /24 para destinos diferentes.", comandos: ["sudo ip -n r2 route get 10.10.20.53", "sudo ip -n r2 route get 10.20.10.10"], saida: ["10.10.20.53 via 10.255.0.1 dev r2-r1 src 10.255.0.2", "10.20.10.10 dev r2-pc-del src 10.20.10.1"] },
      ],
      sucesso: ["O formando prevê por escrito que o primeiro ping falha (sem volta) e o segundo funciona.", "Explica porque 10.20.10.10 usa a rota ligada /24 e não a /16."],
      reversao: ["sudo ip -n r1 route del 10.20.10.0/24", "sudo ip -n r2 route del 10.10.0.0/16"],
    },
    papel: [
      { tarefa: "Tabela: 0.0.0.0/0 via A; 10.0.0.0/8 via B; 10.20.0.0/16 via C; 10.20.10.0/24 via D. Qual o próximo salto para 10.20.10.5, 10.20.99.1, 10.1.1.1 e 8.8.8.8?", esperado: "D, C, B, A (prefixo mais longo que contém cada destino)." },
      { tarefa: "Explique o caso da delegação.", esperado: "Existe rota de ida mas o encaminhador do outro lado não tem rota de volta para a rede de origem; as respostas perdem-se ou vão pela rota por omissão." },
      { tarefa: "Porque o r2 usa 10.10.0.0/16 e não duas /24?", esperado: "Sumarização: uma rota cobre 10.10.10.0/24, 10.10.20.0/24, 10.10.30.0/24 e 10.10.99.0/24 da sede, simplificando a tabela, desde que nenhuma parte de 10.10.0.0/16 esteja noutro sítio." },
    ],
    formativas: [
      { pergunta: "Com rotas 10.0.0.0/8 e 10.10.20.0/24, para onde vai um pacote para 10.10.20.53?", opcoes: ["Pela /8", "Pela /24", "Pela rota por omissão", "É descartado"], certa: 1, comentario: "Vence o prefixo mais longo que contém o destino: /24." },
      { pergunta: "Um ping só funciona se existir:", opcoes: ["Rota de ida", "Rota de ida e de volta", "Rota por omissão em todos", "DNS"], certa: 1, comentario: "A resposta é outro pacote, com destino na origem; cada encaminhador do caminho de volta precisa de rota." },
    ],
    leituraFacil: ["O encaminhador escolhe a rota mais exacta.", "É preciso caminho de ida e de volta.", "A rota por omissão serve para tudo o resto."],
    guiao: {
      conducao: ["0–20 min: exercício de tabela no quadro.", "20–60 min: prática com previsões escritas antes de cada teste.", "60–70 min: formativas."],
      errosComuns: ["Esquecer a volta.", "Pensar que a rota por omissão é sempre usada."],
    },
    fontes: ["rfc4632", "rfc791", "iproute2"],
  },

  "r-m03-l2": {
    objectivos: [
      "Configurar rotas estáticas e por omissão de forma persistente com FRRouting.",
      "Comparar vantagens de rotas estáticas e dinâmicas.",
      "Configurar uma rota flutuante de reserva.",
    ],
    explicacao: [
      {
        titulo: "Estáticas: simples e previsíveis",
        paragrafos: [
          "Rotas estáticas não geram tráfego de protocolo e são previsíveis, mas não se adaptam a falhas e crescem mal. São adequadas em redes pequenas, em ramos com uma só saída (a delegação que só tem o r1) e como rota por omissão para o operador.",
          "A distância administrativa indica a preferência entre fontes de rota. Uma rota estática com distância maior (rota flutuante) só entra na tabela quando a principal desaparece. No FRRouting escreve-se com o valor no fim da linha ip route.",
        ],
      },
      {
        titulo: "Porquê FRRouting",
        paragrafos: [
          "Os comandos ip route perdem-se ao reiniciar. O FRRouting (pacote frr no Debian) guarda a configuração e fala a linguagem de vários protocolos, com a consola vtysh, semelhante à de muitos equipamentos comerciais; a sintaxe exacta de cada fabricante difere e deve ser confirmada no manual dele.",
        ],
      },
    ],
    caso: "A delegação da DPE (fictícia) tem uma ligação principal à sede e um acesso de reserva ao operador. Quer que a reserva só seja usada quando a principal cair.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Nesta lição acrescenta-se uma ligação de reserva r2–isp na rede 10.255.1.0/30: r2 = 10.255.1.2, isp = 10.255.1.1."],
      passos: [
        { accao: "O FRR pode correr uma instância por espaço de nomes (opção de «pathspace» do frrinit.sh, conforme a documentação FRR). Se não funcionar na sua versão, use as linhas ip route equivalentes indicadas no fim.", comandos: ["sudo mkdir -p /etc/frr/r2 && sudo cp /etc/frr/daemons /etc/frr/r2/ && sudo touch /etc/frr/r2/frr.conf /etc/frr/r2/vtysh.conf", "sudo chown -R frr:frr /etc/frr/r2", "sudo /usr/lib/frr/frrinit.sh start r2"] },
        { accao: "Crie a ligação de reserva.", comandos: ["sudo ip link add r2-isp type veth peer name isp-r2; sudo ip link set r2-isp netns r2; sudo ip link set isp-r2 netns isp", "sudo ip -n r2 addr add 10.255.1.2/30 dev r2-isp; sudo ip -n isp addr add 10.255.1.1/30 dev isp-r2", "sudo ip -n r2 link set r2-isp up; sudo ip -n isp link set isp-r2 up"] },
        { accao: "No vtysh do r2, configure rota por omissão principal pela sede e flutuante pelo operador (distância 200).", comandos: ["sudo vtysh -N r2", "configure terminal", " ip route 0.0.0.0/0 10.255.0.1", " ip route 0.0.0.0/0 10.255.1.1 200", "end", "write memory", "show ip route 0.0.0.0/0"], saida: ["Routing entry for 0.0.0.0/0", "  Known via \"static\", distance 1, metric 0, best", "  * 10.255.0.1, via r2-r1", "Routing entry for 0.0.0.0/0", "  Known via \"static\", distance 200, metric 0", "    10.255.1.1 inactive"] },
        { accao: "Simule a falha da ligação principal e veja a reserva entrar.", comandos: ["sudo ip -n r2 link set r2-r1 down", "sudo ip -n r2 route show default"], saida: ["default via 10.255.1.1 dev r2-isp proto static metric 20"] },
        { accao: "Equivalente sem FRR (não persistente), para quem não conseguir o passo 1.", comandos: ["sudo ip -n r2 route add default via 10.255.0.1 metric 1", "sudo ip -n r2 route add default via 10.255.1.1 metric 200"] },
      ],
      sucesso: ["Com a principal activa, a rota por omissão usa 10.255.0.1.", "Com a principal em baixo, a rota passa a 10.255.1.1.", "Ao repor a principal, volta a ser preferida."],
      reversao: ["sudo ip -n r2 link set r2-r1 up", "No vtysh: configure terminal / no ip route 0.0.0.0/0 10.255.1.1 200 / no ip route 0.0.0.0/0 10.255.0.1 / write memory", "sudo /usr/lib/frr/frrinit.sh stop r2; sudo ip -n r2 link del r2-isp"],
    },
    papel: [
      { tarefa: "Escreva as duas linhas de rota por omissão do r2 (principal e reserva) em sintaxe FRR.", esperado: "ip route 0.0.0.0/0 10.255.0.1 / ip route 0.0.0.0/0 10.255.1.1 200" },
      { tarefa: "Porque a rota flutuante não aparece activa enquanto a principal funciona?", esperado: "Tem distância administrativa 200, pior que 1; só é instalada quando a de distância 1 desaparece." },
      { tarefa: "Quando preferir estáticas a dinâmicas?", esperado: "Redes pequenas, ramos com uma só saída, rota para o operador, ou quando se quer controlo total. Dinâmicas quando há vários caminhos e mudanças frequentes." },
    ],
    formativas: [
      { pergunta: "Uma rota flutuante é:", opcoes: ["Uma rota que muda de destino", "Uma rota estática de reserva com distância maior", "Uma rota OSPF", "Uma rota IPv6"], certa: 1, comentario: "Fica «a flutuar» fora da tabela até a principal desaparecer." },
      { pergunta: "Qual é um limite das rotas estáticas?", opcoes: ["Não funcionam em Linux", "Não se adaptam sozinhas a falhas intermédias", "Usam muita largura de banda", "Só servem para IPv6"], certa: 1, comentario: "A rota flutuante só reage à queda da interface local; se a falha for mais longe no caminho, a rota estática continua activa. Isso resolve-se com dinâmicas ou com detecção como BFD." },
    ],
    leituraFacil: ["Rota estática é escrita à mão.", "A rota de reserva só entra quando a principal cai.", "O FRR guarda a configuração."],
    guiao: {
      conducao: ["0–20 min: distância administrativa com o exemplo de dois caminhos para a mesma vila.", "20–65 min: prática; quem tiver problemas com o passo 1 segue o passo 5.", "65–75 min: formativas."],
      errosComuns: ["Esquecer write memory.", "Confundir métrica com distância administrativa."],
    },
    fontes: ["frr", "iproute2", "rfc5880"],
  },

  "r-m03-l3": {
    objectivos: [
      "Explicar o funcionamento de OSPF: vizinhos, estado de ligação, custo, áreas.",
      "Configurar OSPF entre r1 e r2 com FRRouting.",
      "Verificar vizinhança e rotas aprendidas.",
    ],
    explicacao: [
      {
        titulo: "Protocolos de encaminhamento",
        paragrafos: [
          "Protocolos de vector de distância (como RIP) trocam tabelas com os vizinhos; protocolos de estado de ligação (como OSPF) trocam descrições das ligações e cada encaminhador calcula o caminho mais curto. Entre organizações usa-se BGP, que decide por políticas. Dentro de uma instituição, OSPF é um padrão aberto (RFC 2328) suportado por muitos fabricantes.",
          "No OSPF, os encaminhadores tornam-se vizinhos se concordarem em parâmetros (área, temporizadores, rede). O custo de cada ligação soma-se no caminho; escolhe-se o menor. Áreas limitam o tamanho da base de dados em redes grandes; redes pequenas e médias usam só a área 0. Boa prática de segurança: autenticação entre vizinhos e interfaces passivas onde não há encaminhadores.",
        ],
      },
    ],
    caso: "A DPE (fictícia) vai abrir mais três delegações. Manter rotas estáticas em todos os encaminhadores tornou-se propenso a erros. O técnico propõe OSPF na área 0.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Instâncias FRR r1 e r2 (ver lição 2). As rotas estáticas entre sede e delegação devem ser retiradas antes."],
      passos: [
        { accao: "Active o ospfd nas duas instâncias e arranque o FRR.", comandos: ["for r in r1 r2; do sudo mkdir -p /etc/frr/$r; sudo cp /etc/frr/daemons /etc/frr/$r/; sudo sed -i 's/^ospfd=no/ospfd=yes/' /etc/frr/$r/daemons; sudo touch /etc/frr/$r/frr.conf /etc/frr/$r/vtysh.conf; sudo chown -R frr:frr /etc/frr/$r; sudo /usr/lib/frr/frrinit.sh restart $r; done"] },
        { accao: "Configure o OSPF no r1 (a ligação para o isp não entra no OSPF; LAN passivas).", comandos: ["sudo vtysh -N r1", "configure terminal", "router ospf", " ospf router-id 10.255.0.1", " network 10.255.0.0/30 area 0", " network 10.10.10.0/24 area 0", " network 10.10.20.0/24 area 0", " passive-interface r1-pc-adm", " passive-interface r1-srv", "exit", "interface r1-r2", " ip ospf authentication message-digest", " ip ospf message-digest-key 1 md5 ChaveDeTreinoDPE", "end", "write memory"] },
        { accao: "Configure o r2 de forma simétrica.", comandos: ["sudo vtysh -N r2", "configure terminal", "router ospf", " ospf router-id 10.255.0.2", " network 10.255.0.0/30 area 0", " network 10.20.10.0/24 area 0", " passive-interface r2-pc-del", "exit", "interface r2-r1", " ip ospf authentication message-digest", " ip ospf message-digest-key 1 md5 ChaveDeTreinoDPE", "end", "write memory"] },
        { accao: "Verifique vizinhança e rotas.", comandos: ["sudo vtysh -N r1 -c 'show ip ospf neighbor'", "sudo vtysh -N r2 -c 'show ip route ospf'"], saida: ["Neighbor ID     Pri State           Up Time  Dead Time Address         Interface", "10.255.0.2        1 Full/DR         00:01:10   35.123s 10.255.0.2      r1-r2:10.255.0.1", "O>* 10.10.10.0/24 [110/20] via 10.255.0.1, r2-r1, weight 1, 00:00:58", "O>* 10.10.20.0/24 [110/20] via 10.255.0.1, r2-r1, weight 1, 00:00:58"] },
        { accao: "Prove de ponta a ponta.", comandos: ["sudo ip netns exec pc-del ping -c 2 10.10.20.53"] },
      ],
      sucesso: ["Vizinhança em estado Full.", "r2 aprende 10.10.10.0/24 e 10.10.20.0/24 com código O.", "pc-del alcança srv sem rotas estáticas."],
      reversao: ["for r in r1 r2; do sudo /usr/lib/frr/frrinit.sh stop $r; sudo rm -rf /etc/frr/$r; done", "A chave «ChaveDeTreinoDPE» é só de prática; numa rede real usar chave própria guardada em cofre."],
    },
    papel: [
      { tarefa: "Porque a ligação ao isp não entra no OSPF?", esperado: "Não se trocam rotas internas com o operador por OSPF; para a internet usa-se rota por omissão (ou BGP com política). Anunciar a rede interna ao exterior seria uma fuga de informação e um risco." },
      { tarefa: "O que significa [110/20] na rota do r2?", esperado: "110 é a distância administrativa do OSPF; 20 é o custo total do caminho (custo da ligação r2–r1 mais o da LAN)." },
      { tarefa: "A vizinhança não sobe. Liste três verificações.", esperado: "Mesma área e mesma rede na ligação; mesma chave e tipo de autenticação; interface não passiva; temporizadores iguais; conectividade IP na ligação (ping 10.255.0.2)." },
    ],
    formativas: [
      { pergunta: "O que faz passive-interface numa LAN de utilizadores?", opcoes: ["Desliga a LAN", "Anuncia a rede mas não envia mensagens OSPF para essa LAN", "Bloqueia o tráfego dos utilizadores", "Muda a área"], certa: 1, comentario: "A rede continua anunciada aos outros encaminhadores; só se evita falar OSPF onde não há vizinhos, reduzindo exposição." },
      { pergunta: "Porque autenticar o OSPF?", opcoes: ["Para ir mais depressa", "Para impedir que um equipamento não autorizado injecte rotas", "Para cifrar os dados dos utilizadores", "É obrigatório em IPv4"], certa: 1, comentario: "Sem autenticação, qualquer equipamento na ligação pode tornar-se vizinho e desviar tráfego. A autenticação não cifra os dados dos utilizadores." },
    ],
    leituraFacil: ["Com OSPF os encaminhadores contam uns aos outros as redes que têm.", "Escolhem o caminho mais barato.", "Só se fala OSPF com encaminhadores de confiança."],
    guiao: {
      conducao: ["0–20 min: comparar estáticas vs OSPF com o mapa das delegações.", "20–65 min: prática; se o FRR em espaço de nomes falhar, usar duas máquinas virtuais Debian com a mesma configuração.", "65–75 min: formativas."],
      errosComuns: ["Deixar rotas estáticas antigas que escondem o resultado do OSPF.", "Chaves diferentes nos dois lados."],
    },
    fontes: ["rfc2328", "frr"],
  },

  "r-m03-l4": {
    objectivos: [
      "Explicar NAT de origem (mascaramento) e de destino (reencaminhamento de porta).",
      "Configurar NAT no r1 com nftables.",
      "Reconhecer que NAT não substitui firewall.",
    ],
    explicacao: [
      {
        titulo: "Tradução de endereços",
        paragrafos: [
          "Os endereços privados (RFC 1918) não são encaminhados na internet. O NAT de origem troca o endereço privado pelo endereço público do encaminhador e guarda a correspondência numa tabela de estado, para que as respostas voltem ao posto certo. Muitos postos partilham um só endereço público, distinguidos pela porta (PAT).",
          "O NAT de destino publica um serviço interno: pedidos que chegam ao endereço público numa porta são enviados a um servidor interno. É uma decisão de exposição: só se publica o que é necessário, com firewall e actualizações. O NAT esconde endereços mas não é, por si, controlo de segurança.",
        ],
      },
    ],
    caso: "A DPE (fictícia) quer que a sede navegue através do único endereço fornecido pelo operador (203.0.113.2) e publicar o portal interno do srv na porta 80.",
    pratica: {
      topologia: TOPOLOGIA_BASE,
      passos: [
        { accao: "Confirme que, sem NAT, o servidor externo não sabe responder à rede privada.", comandos: ["sudo ip -n r1 route add default via 203.0.113.1", "sudo ip netns exec pc-adm ping -c 1 -W 1 198.51.100.10"], saida: ["1 packets transmitted, 0 received"] },
        { accao: "Crie a tabela NAT no r1 com mascaramento de saída pela interface do operador.", comandos: ["sudo ip netns exec r1 nft add table ip nat", "sudo ip netns exec r1 nft 'add chain ip nat postrouting { type nat hook postrouting priority srcnat; }'", "sudo ip netns exec r1 nft add rule ip nat postrouting oifname \"r1-isp\" ip saddr 10.10.0.0/16 masquerade", "sudo ip netns exec pc-adm ping -c 1 198.51.100.10"], saida: ["1 packets transmitted, 1 received"] },
        { accao: "Veja, no isp, que a origem aparece como 203.0.113.2.", comandos: ["Consola A: sudo ip netns exec isp tcpdump -ni isp-r1 -c 1 'icmp[icmptype] == icmp-echo'", "Esperar na consola A a linha «listening on isp-r1»; termina sozinho após 1 pacote.", "Consola B: sudo ip netns exec pc-adm ping -c 1 198.51.100.10"], saida: ["IP 203.0.113.2 > 198.51.100.10: ICMP echo request"] },
        { accao: "Publique o portal do srv na porta 80 (NAT de destino) e teste a partir do isp.", comandos: ["Consola C (deixar aberta): sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53", "Esperar a linha «Serving HTTP on 10.10.20.53 port 80» antes do passo seguinte.", "sudo ip netns exec r1 nft 'add chain ip nat prerouting { type nat hook prerouting priority dstnat; }'", "sudo ip netns exec r1 nft add rule ip nat prerouting iifname \"r1-isp\" tcp dport 80 dnat to 10.10.20.53", "sudo ip netns exec isp python3 -c \"import urllib.request as u; print(u.urlopen('http://203.0.113.2/').status)\"", "sudo ip netns exec r1 nft list table ip nat"], saida: ["200", "table ip nat {", "  chain postrouting { type nat hook postrouting priority srcnat; policy accept;", "    oifname \"r1-isp\" ip saddr 10.10.0.0/16 masquerade }", "  chain prerouting { type nat hook prerouting priority dstnat; policy accept;", "    iifname \"r1-isp\" tcp dport 80 dnat to 10.10.20.53 }", "}"] },
      ],
      sucesso: ["pc-adm alcança 198.51.100.10 apenas com NAT activo.", "O isp vê a origem 203.0.113.2.", "O portal responde no endereço público só na porta 80."],
      reversao: ["sudo ip netns exec r1 nft delete table ip nat", "sudo ip -n r1 route del default via 203.0.113.1", "Na consola C, terminar o servidor de teste com Ctrl+C (termina só esse processo)."],
    },
    papel: [
      { tarefa: "Porque o ping falhou antes do NAT?", esperado: "O servidor externo recebeu o pedido com origem 10.10.10.10 (privada); não tem rota para ela, por isso a resposta não volta." },
      { tarefa: "Escreva a regra de NAT de destino para publicar SSH do srv na porta 2222 externa.", esperado: "iifname \"r1-isp\" tcp dport 2222 dnat to 10.10.20.53:22 — e justificar se é mesmo necessário; preferir VPN (módulo 7) a publicar SSH." },
      { tarefa: "O NAT protege o portal publicado?", esperado: "Não. Quem chega à porta 80 pública chega ao portal. A protecção vem de firewall, actualizações, configuração segura e monitorização." },
    ],
    formativas: [
      { pergunta: "O mascaramento permite que muitos postos partilhem um endereço público porque:", opcoes: ["Usam MAC diferentes", "O encaminhador distingue as ligações pelas portas e guarda estado", "O operador atribui mais endereços", "Usa DNS"], certa: 1, comentario: "É a tabela de estado (conntrack no Linux) que guarda endereço e porta originais de cada ligação." },
      { pergunta: "Qual afirmação é correcta?", opcoes: ["NAT é uma firewall completa", "NAT de destino expõe um serviço interno e exige protecção adicional", "NAT cifra o tráfego", "NAT elimina a necessidade de rotas"], certa: 1, comentario: "Publicar um serviço é abrir uma porta de entrada; decidir o que publicar é uma decisão de segurança." },
    ],
    leituraFacil: ["Endereços internos não vão para a internet.", "O NAT troca-os pelo endereço da instituição.", "Publicar um serviço abre uma porta: proteja-a."],
    guiao: {
      conducao: ["0–20 min: explicar com o exemplo da recepcionista que troca o nome do remetente.", "20–70 min: prática.", "70–80 min: formativas."],
      errosComuns: ["Mascarar tráfego interno entre VLAN (regra sem oifname).", "Esquecer a rota por omissão do r1."],
    },
    fontes: ["rfc3022", "rfc1918", "nftables"],
  },

  "r-m03-l5": {
    objectivos: [
      "Diagnosticar ausência de rota, rota assimétrica, ciclo de encaminhamento e NAT em falta.",
      "Usar traceroute, ip route get, tcpdump e vtysh em sequência.",
      "Registar causa raiz e prevenção.",
    ],
    explicacao: [
      {
        titulo: "Quatro avarias típicas",
        paragrafos: [
          "Sem rota: o encaminhador responde «rede inalcançável» ou descarta. Rota assimétrica: a ida vai por um caminho e a volta por outro, e uma firewall com estado descarta a resposta. Ciclo: dois encaminhadores apontam um para o outro; o traceroute mostra endereços a repetir até o TTL acabar. NAT em falta: o pacote sai com origem privada e a resposta nunca volta.",
          "Em cada caso a prova é diferente: ip route get mostra a decisão; traceroute mostra o caminho; tcpdump nos dois lados mostra onde o pacote desaparece; show ip ospf neighbor mostra se o protocolo está de pé.",
        ],
      },
    ],
    caso: "Segunda-feira de manhã na DPE (fictícia): após uma alteração nocturna não documentada, a delegação não chega ao servidor. O formador provoca a avaria; as duplas encontram-na.",
    pratica: {
      topologia: TOPOLOGIA_BASE,
      passos: [
        { accao: "Prepare rotas estáticas correctas (sem FRR) e confirme que funcionam.", comandos: ["sudo ip -n r1 route add 10.20.10.0/24 via 10.255.0.2", "sudo ip -n r2 route add 10.10.0.0/16 via 10.255.0.1", "sudo ip netns exec pc-del ping -c 1 10.10.20.53"] },
        { accao: "Formador: provoque um ciclo com duas rotas específicas erradas: o r2 envia 10.10.20.0/24 para o r1 (correcto) e o r1 recebe uma rota /32 que devolve 10.10.20.53 ao r2.", comandos: ["sudo ip -n r2 route add 10.10.20.0/24 via 10.255.0.1", "sudo ip -n r1 route add 10.10.20.53/32 via 10.255.0.2"] },
        { accao: "Duplas: diagnostique.", comandos: ["sudo ip netns exec pc-del traceroute -n -m 6 10.10.20.53", "sudo ip -n r1 route get 10.10.20.53"], saida: [" 1  10.20.10.1", " 2  10.255.0.1", " 3  10.255.0.2", " 4  10.255.0.1", " 5  10.255.0.2", " 6  10.255.0.1", "10.10.20.53 via 10.255.0.2 dev r1-r2 src 10.255.0.1"] },
        { accao: "Corrija retirando a rota /32 indevida e prove.", comandos: ["sudo ip -n r1 route del 10.10.20.53/32", "sudo ip netns exec pc-del traceroute -n 10.10.20.53"], saida: [" 1  10.20.10.1", " 2  10.255.0.1", " 3  10.10.20.53"] },
      ],
      sucesso: ["O formando reconhece o ciclo pelos endereços alternados no traceroute.", "Usa ip route get para encontrar a rota /32 responsável.", "Entrega ficha com causa raiz e prevenção."],
      reversao: ["sudo ip -n r2 route del 10.10.20.0/24 via 10.255.0.1", "sudo ip -n r1 route del 10.20.10.0/24; sudo ip -n r2 route del 10.10.0.0/16", "Ou reconstruir: sudo ./lab-remover.sh && sudo ./lab-base.sh"],
    },
    papel: [
      { tarefa: "Como se reconhece um ciclo num traceroute?", esperado: "Os mesmos endereços repetem-se alternadamente (10.255.0.1, 10.255.0.2, …) até ao limite de saltos." },
      { tarefa: "Porque a rota /32 venceu a rota ligada /24?", esperado: "Prefixo mais longo: /32 é mais específico que 10.10.20.0/24, mesmo sendo errado." },
      { tarefa: "Proponha duas medidas de prevenção para o caso de segunda-feira.", esperado: "Alterações só com pedido aprovado e janela registada; cópia da configuração antes e depois (módulo 5 e 11); teste de verificação no fim da alteração; plano de reversão." },
    ],
    formativas: [
      { pergunta: "O pacote sai com origem 10.10.10.10 para a internet e nunca volta. Suspeito principal?", opcoes: ["Cabo", "NAT de origem em falta", "DNS", "VLAN"], certa: 1, comentario: "Endereços privados não são encaminhados na internet; sem tradução a resposta não tem caminho." },
      { pergunta: "Numa rota assimétrica com firewall com estado, o que costuma acontecer?", opcoes: ["Funciona melhor", "A firewall descarta respostas porque não viu o início da ligação", "O DNS falha", "O STP bloqueia"], certa: 1, comentario: "A firewall com estado espera ver os dois sentidos; se a volta passa por outro sítio, a tabela de estado não coincide." },
    ],
    leituraFacil: ["Se os mesmos endereços se repetem, há um círculo.", "A rota mais exacta ganha, mesmo errada.", "Registe o que causou o problema."],
    guiao: {
      conducao: ["0–20 min: as quatro avarias típicas.", "20–70 min: avaria provocada; se houver tempo, formador provoca também NAT em falta (retirar a regra masquerade da lição 4).", "70–80 min: formativas."],
      errosComuns: ["Parar no primeiro salto que responde.", "Corrigir sem procurar a causa (quem fez a alteração e porquê)."],
    },
    fontes: ["iproute2", "frr", "rfc792"],
  },
};
