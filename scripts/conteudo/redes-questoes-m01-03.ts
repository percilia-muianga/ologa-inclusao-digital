/**
 * Banco PRIVADO de Redes — módulos 1 a 3 (18 questões finais). Rascunho por
 * validar pela Ologa/ATDI. Não importado.
 */
import type { QuestaoRedes } from "./redes-questoes-tipos";

export const EXAME_REDES_M01_03: QuestaoRedes[] = [
  // ─── Módulo 1 — Fundamentos de Redes de Dados ───
  {
    cod: "RED-M01-L1-01", m: 1, l: 1, t: "em", d: "f",
    e: "Numa sessão de formador replicador, um formando pergunta o que o r1 reescreve quando reencaminha para a VLAN de servidores um pacote vindo do pc-adm. Qual resposta, dada com o vocabulário das camadas, está correcta?",
    opts: [
      "Os endereços MAC de origem e de destino da trama",
      "O endereço IP de destino que consta do pacote",
      "A porta TCP de destino que consta do segmento",
      "O endereço IP de origem que consta do pacote",
    ], ind: 0,
    exp: "Em cada troço a trama Ethernet é substituída por outra, com novos endereços MAC; o pacote IP mantém origem e destino (salvo NAT) e a porta TCP não é tocada pelo encaminhamento.",
    obj: "Explicar as camadas do modelo TCP/IP e a sua correspondência com o modelo OSI.",
    r: ["R01", "R18"], fonte: "rfc791",
  },
  {
    cod: "RED-M01-L2-01", m: 1, l: 2, t: "em", d: "me",
    e: "Qual é o último endereço útil da sub-rede 10.20.10.64/26?",
    opts: ["10.20.10.127", "10.20.10.126", "10.20.10.128", "10.20.10.62"], ind: 1,
    exp: "Um /26 tem 64 endereços: de .64 (rede) a .127 (difusão). Os úteis vão de .65 a .126. O .128 já pertence ao bloco seguinte e .62 ao anterior.",
    obj: "Calcular rede, difusão, primeiro e último endereço úteis de um prefixo IPv4.",
    r: ["R01"], fonte: "rfc4632",
  },
  {
    cod: "RED-M01-L2-02", m: 1, l: 2, t: "em", d: "di",
    e: "O endereço completo é 2001:0db8:0000:0000:0010:0000:0000:0001. Qual das formas abaixo é sintacticamente válida mas representa um endereço DIFERENTE?",
    opts: ["2001:db8::10:0:0:1", "2001:db8:0:10::1", "2001:db8:0:0:10::1", "2001:db8:0:0:10:0:0:1"], ind: 1,
    exp: "Expande-se cada forma para oito grupos. 2001:db8::10:0:0:1, 2001:db8:0:0:10::1 e a forma sem «::» dão o endereço original. 2001:db8:0:10::1 expande para 2001:db8:0:10:0:0:0:1: o 10 passa para o quarto grupo, logo é outro endereço. Só se pode usar «::» uma vez, e o número de grupos omitidos resulta do que falta para oito.",
    obj: "Ler um endereço IPv6 abreviado e o prefixo /64 habitual numa rede local.",
    r: ["R01"], fonte: "rfc3849",
  },
  {
    cod: "RED-M01-L3-01", m: 1, l: 3, t: "cor", d: "f",
    e: "Associe cada equipamento à decisão que toma, segundo a lição sobre meios físicos e equipamentos.",
    pares: [
      { esquerda: "Comutador", direita: "Reencaminha tramas pelo endereço MAC (camada 2)" },
      { esquerda: "Encaminhador", direita: "Liga redes diferentes pelo endereço IP (camada 3)" },
      { esquerda: "Ponto de acesso", direita: "Faz a ponte entre o rádio e o cabo" },
      { esquerda: "Firewall", direita: "Decide que tráfego passa entre zonas, por endereço, porta e estado" },
    ],
    exp: "Cada fabricante tem a sua linguagem, mas a função de cada equipamento é a mesma; no curso o Linux faz de comutador (bridge), encaminhador e firewall (nftables).",
    obj: "Explicar a função de comutador, encaminhador, ponto de acesso e firewall.",
    r: ["R02"], fonte: "iproute2",
  },
  {
    cod: "RED-M01-L4-01", m: 1, l: 4, t: "vf", d: "f",
    e: "Verdadeiro ou falso: como o UDP não estabelece ligação nem retransmite, uma aplicação que precise de fiabilidade sobre UDP tem de a garantir ela própria.",
    val: true,
    exp: "Verdadeiro. O UDP (RFC 768) envia sem confirmação nem retransmissão; a lição sublinha que, se a fiabilidade for necessária, passa para a aplicação. Isto não torna o UDP «mais rápido» em débito.",
    obj: "Explicar ARP, ICMP, TCP, UDP, DNS e DHCP e em que momento cada um aparece.",
    r: ["R03"], fonte: "rfc768",
  },
  {
    cod: "RED-M01-L5-01", m: 1, l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício: na DPE, o pc-adm não abre o servidor 10.10.20.53. O técnico recolheu: interface UP; endereço 10.10.10.10/24; rota por omissão «default via 10.10.10.254»; ping a 10.10.10.1 responde; ping a 10.10.20.53 não responde. A porta de ligação da VLAN 10 no desenho é 10.10.10.1. Qual é o diagnóstico e o passo seguinte correcto?",
    opts: [
      "Avaria física no cabo; trocar o cabo e só depois repetir os testes",
      "Falha de DNS; configurar outro servidor de nomes no posto afectado",
      "Porta de ligação errada; repor a rota por 10.10.10.1 e provar com ping",
      "Encaminhador r1 bloqueado; reiniciá-lo para limpar o estado anterior",
    ], ind: 2,
    exp: "A camada física e o endereço estão bem (a interface está UP e o r1 responde na mesma rede). O teste ao servidor foi feito por endereço IP, logo o DNS não entra. A rota por omissão aponta para .254, que não é a porta do desenho: corrige-se uma coisa, prova-se e regista-se. Reiniciar sem diagnóstico apagaria a evidência.",
    obj: "Aplicar um método de diagnóstico de baixo para cima, com hipótese e prova.",
    r: ["R04"], fonte: "iproute2",
  },

  // ─── Módulo 2 — Comutação e Segmentação ───
  {
    cod: "RED-M02-L1-01", m: 2, l: 1, t: "em", d: "f",
    e: "Um comutador de 24 portas tem todas as portas na mesma VLAN. Quantos domínios de difusão e de colisão existem?",
    opts: [
      "24 domínios de difusão e 1 domínio de colisão",
      "1 domínio de difusão e 24 domínios de colisão",
      "1 domínio de difusão e 1 domínio de colisão",
      "24 domínios de difusão e 24 de colisão",
    ], ind: 1,
    exp: "Cada porta de um comutador é um domínio de colisão separado; toda a VLAN é um único domínio de difusão.",
    obj: "Distinguir domínio de colisão e domínio de difusão.",
    r: ["R13"], fonte: "ieee8021q",
  },
  {
    cod: "RED-M02-L2-01", m: 2, l: 2, t: "cor", d: "f",
    e: "Associe cada elemento das redes locais virtuais da DPE à sua descrição.",
    pares: [
      { esquerda: "Porta de acesso", direita: "Pertence a uma VLAN e envia tramas sem etiqueta ao posto" },
      { esquerda: "Porta tronco", direita: "Transporta várias VLAN com etiqueta 802.1Q" },
      { esquerda: "Etiqueta 802.1Q", direita: "4 bytes com o número da VLAN, de 1 a 4094" },
      { esquerda: "VLAN 99", direita: "Rede de gestão dos equipamentos" },
    ],
    exp: "É o vocabulário usado nas práticas de VLAN e no plano de endereçamento da DPE (10 Administração, 20 Servidores, 30 Visitantes, 99 Gestão).",
    obj: "Explicar o que é uma VLAN e a etiqueta 802.1Q.",
    r: ["R03"], fonte: "ieee8021q",
  },
  {
    cod: "RED-M02-L2-02", m: 2, l: 2, t: "em", d: "me",
    e: "No comutador virtual, a1 (10.10.10.21/24) está numa porta de acesso da VLAN 10 e v1 (10.10.10.23/24) numa porta de acesso da VLAN 30. O ping de a1 para v1 falha. Porquê?",
    opts: [
      "Estão em domínios de difusão diferentes e o ARP não passa entre VLAN",
      "O endereço 10.10.10.23 não é válido num prefixo /24",
      "O comutador ainda não aprendeu o MAC de v1 e descarta a trama",
      "As portas de acesso só deixam passar tráfego com etiqueta 802.1Q",
    ], ind: 0,
    exp: "Mesmo com endereços da mesma sub-rede, as duas portas estão em VLAN diferentes: o pedido ARP de a1 nunca chega a v1. Um MAC desconhecido seria inundado, não descartado, e as portas de acesso trabalham sem etiqueta.",
    obj: "Provar que duas VLAN não comunicam sem encaminhamento.",
    r: ["R07"], fonte: "ieee8021q",
  },
  {
    cod: "RED-M02-L3-01", m: 2, l: 3, t: "em", d: "f",
    e: "Em que difere um comutador de camada 3 do encaminhamento entre VLAN com subinterfaces num encaminhador (router-on-a-stick)?",
    opts: [
      "Dispensa endereços IP nas VLAN que precisam de comunicar",
      "Junta as VLAN envolvidas num único domínio de difusão",
      "Dispensa a porta de ligação configurada em cada posto",
      "Encaminha internamente, com interfaces virtuais por VLAN",
    ], ind: 3,
    exp: "O comutador de camada 3 faz o mesmo encaminhamento internamente, com interfaces virtuais por VLAN e mais débito. Continua a haver endereços IP, porta de ligação e domínios de difusão separados.",
    obj: "Explicar a diferença para um comutador de camada 3.",
    r: ["R02"], fonte: "ieee8021q",
  },
  {
    cod: "RED-M02-L4-01", m: 2, l: 4, t: "vf", d: "me",
    e: "Verdadeiro ou falso: ligar dois comutadores com dois cabos, sem Spanning Tree nem agregação de ligações, aumenta a disponibilidade sem risco, porque o tráfego se reparte pelos dois cabos.",
    val: false,
    exp: "Falso. Dois cabos sem STP (ou sem agregação LACP) criam um ciclo de camada 2: as difusões circulam sem fim e a tabela MAC oscila — uma tempestade de difusão que pode derrubar a rede.",
    obj: "Explicar porque um ciclo na camada 2 derruba uma rede.",
    r: ["R04", "R17"], fonte: "ieee8021q",
  },
  {
    cod: "RED-M02-L5-01", m: 2, l: 5, t: "em", cen: true, d: "me",
    e: "Caso fictício: na auditoria de portas da DPE, a tabela de desenho aprovada diz que a porta sw-p7 pertence à VLAN 10 (Administração). A saída de «bridge vlan show» no comutador mostra sw-p7 com «99 PVID Egress Untagged». Qual é a conclusão e o passo seguinte correctos?",
    opts: [
      "Porta mal atribuída; repor a VLAN 10 conforme o desenho e registar",
      "Configuração válida; a saída do comando prevalece sobre o desenho",
      "Documento desactualizado; mudar a tabela para VLAN 99 e encerrar",
      "Falha de Spanning Tree; desactivar o STP para libertar a porta sw-p7",
    ], ind: 0,
    exp: "A configuração (PVID 99) não coincide com o desenho aprovado (VLAN 10): a porta está mal atribuída. Corrige-se conforme o desenho, confirma-se com nova leitura e regista-se. Alterar o documento para coincidir com o erro legitimaria a configuração errada; o STP não atribui VLAN.",
    obj: "Detectar portas mal atribuídas e VLAN em falta no tronco.",
    r: ["R05", "R07", "R15"], fonte: "nist800207",
  },

  // ─── Módulo 3 — Encaminhamento de Redes ───
  {
    cod: "RED-M03-L1-01", m: 3, l: 1, t: "em", d: "me",
    e: "Entradas instaladas no r1: 0.0.0.0/0 via 203.0.113.1; 10.20.0.0/16 via 10.255.0.2; 10.20.10.0/24 via 10.255.0.6. Qual próximo salto escolhe para o destino 10.20.11.5?",
    opts: ["Via 10.255.0.6", "Via 203.0.113.1", "É descartado", "Via 10.255.0.2"], ind: 3,
    exp: "10.20.11.5 não pertence a 10.20.10.0/24 (que vai de .10.0 a .10.255). A rota mais específica que o contém é 10.20.0.0/16. A rota por omissão só se usa quando nenhuma outra contém o destino.",
    obj: "Ler uma tabela de encaminhamento e aplicar a regra do prefixo mais longo.",
    r: ["R01"], fonte: "rfc4632",
  },
  {
    cod: "RED-M03-L2-01", m: 3, l: 2, t: "vf", d: "f",
    e: "Verdadeiro ou falso: rotas criadas apenas com o comando «ip route add» perdem-se quando o sistema reinicia; por isso a lição guarda-as no FRRouting com «write memory».",
    val: true,
    exp: "Verdadeiro. Os comandos ip route não são persistentes; o FRRouting guarda a configuração e oferece a consola vtysh.",
    obj: "Configurar rotas estáticas e por omissão de forma persistente com FRRouting.",
    r: ["R02"], fonte: "frr",
  },
  {
    cod: "RED-M03-L3-01", m: 3, l: 3, t: "cor", d: "f",
    e: "Associe cada protocolo ou elemento de encaminhamento à sua característica.",
    pares: [
      { esquerda: "RIP", direita: "Vector de distância: troca tabelas com os vizinhos" },
      { esquerda: "OSPF", direita: "Estado de ligação: cada encaminhador calcula o caminho mais curto" },
      { esquerda: "BGP", direita: "Entre organizações, com decisão por políticas" },
      { esquerda: "Área 0 do OSPF", direita: "Área única habitual em redes pequenas e médias" },
    ],
    exp: "A lição distingue vector de distância, estado de ligação e o BGP entre organizações; as áreas do OSPF limitam a base de dados em redes grandes.",
    obj: "Explicar o funcionamento de OSPF: vizinhos, estado de ligação, custo, áreas.",
    r: ["R01"], fonte: "rfc2328",
  },
  {
    cod: "RED-M03-L3-02", m: 3, l: 3, t: "em", d: "di",
    e: "Com OSPF, o r1 conhece três caminhos para a rede 10.30.0.0/24. Via r2: custos 10 e 10. Via r3: custos 1, 1 e 25. Via r4: custo 25, ligação directa. Que caminho instala e com que custo total?",
    opts: ["Via r4, custo 25", "Via r2, custo 20", "Via r3, custo 27", "Os três, repartidos"], ind: 1,
    exp: "O OSPF soma os custos de cada ligação e escolhe o menor total: r2 = 20, r4 = 25, r3 = 27. O número de saltos não conta por si; repartição só existiria com custos iguais.",
    obj: "Explicar o funcionamento de OSPF: vizinhos, estado de ligação, custo, áreas.",
    r: ["R01", "R02"], fonte: "rfc2328",
  },
  {
    cod: "RED-M03-L4-01", m: 3, l: 4, t: "em", d: "me",
    e: "A direcção quer publicar na «internet» simulada o servidor web 10.10.20.53, com NAT de destino no r1. Qual avaliação é correcta?",
    opts: [
      "O NAT esconde o servidor, pelo que não precisa de mais controlos",
      "O serviço fica exposto; filtrar só a porta necessária e manter actualizado",
      "O NAT de destino só funciona se o servidor tiver endereço público próprio",
      "Basta o NAT de origem já existente, sem nenhuma regra de destino nova",
    ], ind: 1,
    exp: "Publicar é uma decisão de exposição: o NAT de destino entrega os pedidos ao servidor interno, que passa a ser alcançável. O NAT não é, por si, controlo de segurança: acompanha-se de firewall e actualizações.",
    obj: "Reconhecer que NAT não substitui firewall.",
    r: ["R03", "R05"], fonte: "rfc3022",
  },
  {
    cod: "RED-M03-L5-01", m: 3, l: 5, t: "em", cen: true, d: "di",
    e: "Caso fictício: da delegação, «traceroute -n 10.10.20.53» no pc-del mostra 10.20.10.1, 10.255.0.1, 10.255.0.2, 10.255.0.1, 10.255.0.2… até ao limite de saltos. No r1, «ip route get 10.10.20.53» responde «via 10.255.0.2». O r2 envia 10.10.0.0/16 para 10.255.0.1. Qual é a causa e a correcção?",
    opts: [
      "Falta NAT no r1; acrescentar mascaramento para a rede da delegação",
      "Rota assimétrica; a firewall com estado do srv descarta as respostas",
      "Vizinhança OSPF em baixo; reiniciar o FRRouting nos dois encaminhadores",
      "Ciclo por rota específica no r1 para r2; retirá-la e repetir o traceroute",
    ], ind: 3,
    exp: "Os endereços repetem-se até acabar o TTL: é um ciclo. O r1 envia o destino para o r2 (rota mais específica, por exemplo um /32), e o r2 devolve-o ao r1. Retira-se a rota errada, prova-se com novo traceroute e regista-se a causa raiz. NAT não se usa entre redes internas.",
    obj: "Diagnosticar ausência de rota, rota assimétrica, ciclo de encaminhamento e NAT em falta.",
    r: ["R04", "R15"], fonte: "iproute2",
  },
];
