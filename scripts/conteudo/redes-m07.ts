/**
 * Curso de Redes — módulo 7 (Defesa de Redes).
 * Conteúdo fictício e didáctico; ver regras em redes-base.ts.
 * Laboratórios NÃO executados neste ambiente: as saídas são exemplos didácticos.
 */
import { TOPOLOGIA_BASE, type ConteudoLicao } from "./redes-base";

export const LICOES_M07: Record<string, ConteudoLicao> = {
  "r-m07-l1": {
    objectivos: [
      "Explicar como a segmentação por zonas limita a propagação de um incidente.",
      "Desenhar uma matriz de fluxos permitidos entre zonas da rede da DPE.",
      "Verificar, com testes antes/depois, que só os fluxos aprovados passam.",
    ],
    explicacao: [
      {
        titulo: "Zonas e confiança",
        paragrafos: [
          "Uma zona é um conjunto de equipamentos com a mesma função e o mesmo nível de exposição: postos da Administração, servidores, visitantes, gestão dos equipamentos, ligação ao operador. Entre zonas, o tráfego passa por um ponto de controlo (encaminhador com firewall) onde se aplica uma regra explícita.",
          "O objectivo não é impedir todo o erro, mas reduzir o alcance: se um posto de visitante for comprometido, não deve conseguir chegar à rede de gestão nem aos servidores internos. É a mesma ideia do NIST SP 800-207 (confiança zero): a localização na rede, só por si, não dá confiança.",
        ],
      },
      {
        titulo: "Matriz de fluxos",
        paragrafos: [
          "Antes de escrever regras, escreve-se uma tabela: origem, destino, serviço (protocolo e porta), justificação, responsável. Tudo o que não está na tabela fica recusado por omissão. A tabela é aprovada pela direcção de TI e revista quando surgem serviços novos.",
          "Exemplo na DPE (fictícia): Administração → Servidores em TCP 80/443 e UDP/TCP 53; Visitantes → Internet em TCP 80/443 e DNS; Gestão → equipamentos em SSH (TCP 22) só a partir de 10.10.99.0/24; Visitantes → qualquer rede interna: recusado.",
        ],
      },
    ],
    caso: "Um portátil de visitante na DPE (fictícia) foi infectado e começou a procurar serviços na rede. A direcção pede prova de que ele não alcança os servidores nem a gestão.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Acrescenta-se ao r1 um posto de visitante vis (10.10.30.30/24, porta 10.10.30.1) e um endereço de gestão 10.10.99.1/24 no lo do r1.",
      ],
      passos: [
        { accao: "Crie o posto de visitante e o endereço de gestão.", comandos: ["sudo ip netns add vis", "sudo ip link add vis-r1 type veth peer name r1-vis", "sudo ip link set vis-r1 netns vis; sudo ip link set r1-vis netns r1", "sudo ip -n vis addr add 10.10.30.30/24 dev vis-r1; sudo ip -n vis link set vis-r1 up; sudo ip -n vis link set lo up", "sudo ip -n r1 addr add 10.10.30.1/24 dev r1-vis; sudo ip -n r1 link set r1-vis up", "sudo ip -n vis route add default via 10.10.30.1", "sudo ip -n r1 addr add 10.10.99.1/24 dev lo"] },
        { accao: "Teste ANTES das regras: registe na folha o que passa.", comandos: ["sudo ip netns exec vis ping -c 1 -W 1 10.10.20.53", "sudo ip netns exec vis ping -c 1 -W 1 10.10.99.1"], saida: ["1 packets transmitted, 1 received", "1 packets transmitted, 1 received"] },
        { accao: "Aplique a regra de zona: visitantes não entram em redes internas.", comandos: ["sudo ip netns exec r1 nft add table inet zonas", "sudo ip netns exec r1 nft 'add chain inet zonas forward { type filter hook forward priority 0; policy accept; }'", "sudo ip netns exec r1 nft 'add chain inet zonas input { type filter hook input priority 0; policy accept; }'", "sudo ip netns exec r1 nft add rule inet zonas forward iifname \"r1-vis\" ip daddr 10.0.0.0/8 counter drop", "sudo ip netns exec r1 nft add rule inet zonas input iifname \"r1-vis\" ip daddr 10.10.99.0/24 counter drop"] },
        { accao: "Teste DEPOIS e leia os contadores.", comandos: ["sudo ip netns exec vis ping -c 1 -W 1 10.10.20.53", "sudo ip netns exec vis ping -c 1 -W 1 10.10.99.1", "sudo ip netns exec pc-adm ping -c 1 -W 1 10.10.20.53", "sudo ip netns exec r1 nft list table inet zonas"], saida: ["1 packets transmitted, 0 received", "1 packets transmitted, 0 received", "1 packets transmitted, 1 received", "iifname \"r1-vis\" ip daddr 10.0.0.0/8 counter packets 1 bytes 84 drop"] },
      ],
      sucesso: ["Visitante deixa de alcançar servidores e gestão; a Administração continua a alcançar o servidor.", "A folha tem a tabela antes/depois assinada pela dupla."],
      reversao: ["sudo ip netns exec r1 nft delete table inet zonas", "sudo ip -n r1 addr del 10.10.99.1/24 dev lo", "sudo ip netns del vis"],
    },
    papel: [
      { tarefa: "Preencha a matriz de fluxos para quatro zonas (Administração, Servidores, Visitantes, Gestão) com pelo menos seis linhas.", esperado: "Cada linha tem origem, destino, serviço e justificação; Visitantes → redes internas aparece como recusado; Gestão só a partir de 10.10.99.0/24; tudo o resto recusado por omissão." },
      { tarefa: "Na saída do passo 4, quantos pacotes do visitante foram bloqueados pela regra forward?", esperado: "1 pacote (84 bytes), o eco ICMP do teste ao servidor." },
    ],
    formativas: [
      { pergunta: "Qual é o principal benefício da segmentação por zonas?", opcoes: ["Aumenta a velocidade da rede", "Limita o alcance de um equipamento comprometido", "Dispensa actualizações", "Elimina a necessidade de palavras-passe"], certa: 1, comentario: "A segmentação não impede a infecção, mas reduz o que o atacante alcança a partir do ponto comprometido." },
      { pergunta: "Numa matriz de fluxos, o que acontece a um fluxo não listado?", opcoes: ["Passa, porque ninguém o proibiu", "Fica recusado por omissão", "Passa só de noite", "Depende do utilizador"], certa: 1, comentario: "A regra por omissão é recusar; cada excepção precisa de justificação e responsável." },
    ],
    leituraFacil: ["A rede divide-se em zonas.", "Entre zonas, só passa o que está autorizado.", "Se um computador for atacado, o problema fica na zona dele."],
    guiao: {
      conducao: ["0–20 min: desenhar as zonas da DPE no quadro e construir a matriz com a turma.", "20–60 min: prática com testes antes/depois registados em folha.", "60–70 min: formativas e comparação das matrizes."],
      errosComuns: ["Escrever regras antes da matriz.", "Testar só o que deve ser bloqueado e esquecer o que deve continuar a passar."],
    },
    fontes: ["nist800207", "nist80041", "nftables", "iproute2"],
  },

  "r-m07-l2": {
    objectivos: [
      "Distinguir filtragem sem estado e com estado.",
      "Escrever uma política nftables com recusa por omissão e excepções justificadas.",
      "Aplicar e reverter a política sem perder o acesso de gestão.",
    ],
    explicacao: [
      {
        titulo: "Filtragem com estado",
        paragrafos: [
          "Uma firewall com estado acompanha as ligações: se o pedido saiu autorizado, a resposta é aceite porque pertence a uma ligação «established». Assim não é preciso abrir portas altas para as respostas. No nftables usa-se «ct state established,related accept».",
          "Ordem habitual: aceitar ligações estabelecidas; descartar pacotes inválidos; aceitar as excepções da matriz; registar e recusar o resto. Uma política é revista como código: comentário por regra, número do pedido e responsável (NIST SP 800-41).",
        ],
      },
      {
        titulo: "Não se trancar fora",
        paragrafos: [
          "Ao alterar a firewall de um equipamento remoto, o risco é cortar a própria sessão. Boas práticas: aplicar o ficheiro inteiro de uma vez (nft -f é atómico: ou aplica tudo ou nada), ter consola alternativa e um temporizador que repõe a versão anterior se não houver confirmação.",
        ],
      },
    ],
    caso: "A DPE (fictícia) quer que o servidor srv aceite apenas HTTP da Administração e SSH da Gestão, recusando o resto e registando tentativas.",
    pratica: {
      topologia: TOPOLOGIA_BASE,
      passos: [
        { accao: "Consola C (deixar aberta): sirva a página de teste no srv e espere «Serving HTTP».", comandos: ["sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53"] },
        { accao: "Acrescente as rotas sede–delegação (como no módulo 3), para o teste de recusa ser real.", comandos: ["sudo ip -n r1 route add 10.20.10.0/24 via 10.255.0.2", "sudo ip -n r2 route add default via 10.255.0.1", "sudo ip netns exec pc-del ping -c 1 -W 1 10.10.20.53"], saida: ["1 packets transmitted, 1 received"] },
        { accao: "Escreva a política no ficheiro /tmp/r1-politica.nft.", comandos: ["sudo tee /tmp/r1-politica.nft <<'EOF'", "flush ruleset", "table inet filtro {", "  chain forward {", "    type filter hook forward priority 0; policy drop;", "    ct state established,related accept comment \"respostas\"", "    ct state invalid drop", "    ip saddr 10.10.10.0/24 ip daddr 10.10.20.53 tcp dport 80 accept comment \"Adm->portal, pedido 101\"", "    ip saddr 10.10.99.0/24 ip daddr 10.10.20.53 tcp dport 22 accept comment \"Gestao->SSH, pedido 102\"", "    log prefix \"DPE-recusa: \" limit rate 5/minute counter drop", "  }", "}", "EOF", "sudo ip netns exec r1 nft -c -f /tmp/r1-politica.nft && echo sintaxe-ok"], saida: ["sintaxe-ok"] },
        { accao: "Guarde a política actual e aplique a nova com reposição automática em 120 s (consola B).", comandos: ["sudo ip netns exec r1 nft list ruleset > /tmp/r1-anterior.nft", "sudo ip netns exec r1 nft -f /tmp/r1-politica.nft", "Consola B: sleep 120 && sudo ip netns exec r1 sh -c 'nft flush ruleset; nft -f /tmp/r1-anterior.nft'", "(se tudo estiver bem, cancele o temporizador com Ctrl+C na consola B antes dos 120 s)"] },
        { accao: "Teste os fluxos permitidos e recusados.", comandos: ["sudo ip netns exec pc-adm python3 -c \"import urllib.request as u; print(u.urlopen('http://10.10.20.53/', timeout=3).status)\"", "sudo ip netns exec pc-del ping -c 1 -W 1 10.10.20.53", "sudo ip netns exec r1 nft list chain inet filtro forward"], saida: ["200", "1 packets transmitted, 0 received", "log prefix \"DPE-recusa: \" limit rate 5/minute counter packets 1 bytes 84 drop"] },
      ],
      sucesso: ["HTTP da Administração funciona; o ping da delegação é recusado e contado.", "Cada regra tem comentário com o pedido.", "O formando explica porque nft -f é aplicado de uma vez."],
      reversao: ["sudo ip netns exec r1 sh -c 'nft flush ruleset; nft -f /tmp/r1-anterior.nft'", "Ctrl+C na consola C", "sudo ip -n r1 route del 10.20.10.0/24 via 10.255.0.2; sudo ip -n r2 route del default via 10.255.0.1", "rm -f /tmp/r1-politica.nft /tmp/r1-anterior.nft"],
    },
    papel: [
      { tarefa: "Porque é que, com «policy drop», o pc-adm continua a receber a página, se nenhuma regra aceita tráfego do srv para o pc-adm?", esperado: "A resposta pertence a uma ligação já aceite; a regra «ct state established,related accept» deixa-a passar." },
      { tarefa: "Reescreva a regra de SSH para aceitar só o posto 10.10.99.21.", esperado: "ip saddr 10.10.99.21 ip daddr 10.10.20.53 tcp dport 22 accept comment \"...\"" },
    ],
    formativas: [
      { pergunta: "Porque se limita a taxa da regra de registo?", opcoes: ["Para poupar electricidade", "Para que um ataque não encha os registos e o disco", "Porque a lei proíbe registos", "Para acelerar o ping"], certa: 1, comentario: "Sem limite, uma varrimento de portas gera milhares de linhas por segundo e esconde eventos importantes." },
      { pergunta: "Qual é a vantagem de aplicar a política com nft -f de um ficheiro?", opcoes: ["Fica mais bonita", "A aplicação é atómica: ou entra tudo ou nada", "Desliga o registo", "Não precisa de privilégios"], certa: 1, comentario: "Evita um estado intermédio em que metade das regras está aplicada e a gestão fica cortada." },
    ],
    leituraFacil: ["A firewall deixa passar só o que foi autorizado.", "As respostas a pedidos autorizados passam sozinhas.", "Guarde sempre a versão anterior antes de mudar."],
    guiao: {
      conducao: ["0–20 min: com/sem estado com o exemplo da portaria que regista quem saiu.", "20–65 min: prática com temporizador de reposição.", "65–75 min: formativas."],
      errosComuns: ["Esquecer «established,related» e partir todas as respostas.", "Aplicar regra a regra num equipamento remoto."],
    },
    fontes: ["nist80041", "nftables", "iproute2"],
  },

  "r-m07-l3": {
    objectivos: [
      "Explicar porque o acesso remoto deve passar por um canal cifrado e autenticado.",
      "Configurar um túnel WireGuard de prática entre um posto remoto e a rede de gestão.",
      "Endurecer o SSH com chaves e restrições no servidor.",
    ],
    explicacao: [
      {
        titulo: "VPN e SSH",
        paragrafos: [
          "Uma VPN cria um canal cifrado entre dois pontos através de uma rede não confiável. O WireGuard usa pares de chaves públicas: cada lado conhece a chave pública do outro e a lista de endereços que pode usar dentro do túnel (AllowedIPs). O SSH (RFC 4253) cifra uma sessão de administração num único servidor.",
          "Regras práticas: autenticação por chave em vez de palavra-passe; desactivar entrada directa como root; limitar quem pode entrar (AllowUsers); expor a gestão só dentro da VPN; registar ligações. As chaves privadas nunca saem do equipamento onde foram geradas.",
        ],
      },
    ],
    caso: "O técnico de piquete da DPE (fictícia) precisa de administrar o srv a partir de casa. A direcção só aceita se a gestão não ficar exposta na «Internet».",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Posto remoto «casa» ligado ao isp (203.0.113.50/24). Túnel WireGuard 10.10.98.0/24: r1 = 10.10.98.1, casa = 10.10.98.2, porta UDP 51820 no r1."],
      passos: [
        { accao: "Crie o posto remoto.", comandos: ["sudo ip netns add casa", "sudo ip link add casa-isp type veth peer name isp-casa", "sudo ip link set casa-isp netns casa; sudo ip link set isp-casa netns isp", "sudo ip -n casa addr add 203.0.113.50/24 dev casa-isp; sudo ip -n casa link set casa-isp up; sudo ip -n casa link set lo up", "sudo ip -n isp link add br-isp type bridge; sudo ip -n isp link set isp-r1 master br-isp; sudo ip -n isp link set isp-casa master br-isp", "sudo ip -n isp addr flush dev isp-r1; sudo ip -n isp addr add 203.0.113.1/24 dev br-isp; sudo ip -n isp link set br-isp up; sudo ip -n isp link set isp-casa up"] },
        { accao: "Gere as chaves em cada lado (ficam em /tmp da prática; não as copie para fora).", comandos: ["umask 077; wg genkey | tee /tmp/r1.key | wg pubkey > /tmp/r1.pub", "umask 077; wg genkey | tee /tmp/casa.key | wg pubkey > /tmp/casa.pub"] },
        { accao: "Configure o túnel no r1 e na casa.", comandos: ["sudo ip -n r1 link add wg0 type wireguard", "sudo ip netns exec r1 wg set wg0 listen-port 51820 private-key /tmp/r1.key peer $(cat /tmp/casa.pub) allowed-ips 10.10.98.2/32", "sudo ip -n r1 addr add 10.10.98.1/24 dev wg0; sudo ip -n r1 link set wg0 up", "sudo ip -n casa link add wg0 type wireguard", "sudo ip netns exec casa wg set wg0 private-key /tmp/casa.key peer $(cat /tmp/r1.pub) endpoint 203.0.113.2:51820 allowed-ips 10.10.98.0/24,10.10.20.0/24 persistent-keepalive 25", "sudo ip -n casa addr add 10.10.98.2/24 dev wg0; sudo ip -n casa link set wg0 up", "sudo ip -n casa route add 10.10.20.0/24 dev wg0"] },
        { accao: "Verifique o aperto de mão e o acesso ao srv só pelo túnel.", comandos: ["sudo ip netns exec casa ping -c 1 10.10.20.53", "sudo ip netns exec r1 wg show wg0 latest-handshakes"], saida: ["1 packets transmitted, 1 received", "(chave pública da casa)\t1759012345"] },
        { accao: "Endurecimento SSH (ficheiro de exemplo para o srv; ler e discutir, aplicar só se o srv tiver OpenSSH de prática).", comandos: ["cat > /tmp/sshd-dpe.conf <<'EOF'", "PermitRootLogin no", "PasswordAuthentication no", "KbdInteractiveAuthentication no", "PubkeyAuthentication yes", "AllowUsers tecnico", "ListenAddress 10.10.20.53", "LogLevel VERBOSE", "EOF", "sshd -t -f /tmp/sshd-dpe.conf && echo sintaxe-ok"], saida: ["sintaxe-ok"] },
      ],
      sucesso: ["wg show mostra aperto de mão recente.", "O ping da casa ao srv passa pelo túnel.", "O formando justifica cada linha do sshd-dpe.conf."],
      reversao: ["sudo ip -n r1 link del wg0; sudo ip netns del casa", "sudo ip -n isp link set isp-r1 nomaster; sudo ip -n isp link del br-isp; sudo ip -n isp addr add 203.0.113.1/24 dev isp-r1", "rm -f /tmp/r1.key /tmp/r1.pub /tmp/casa.key /tmp/casa.pub /tmp/sshd-dpe.conf"],
    },
    papel: [
      { tarefa: "Explique a função de AllowedIPs em cada lado do túnel desta prática.", esperado: "No r1, só aceita do par pacotes com origem 10.10.98.2; na casa, envia pelo túnel o que se destina a 10.10.98.0/24 e 10.10.20.0/24 e aceita respostas dessas redes." },
      { tarefa: "Porque «PasswordAuthentication no» reduz o risco?", esperado: "Impede ataques de adivinhação de palavras-passe; só entra quem tem a chave privada correspondente a uma chave autorizada." },
    ],
    formativas: [
      { pergunta: "Onde deve ficar a chave privada do WireGuard?", opcoes: ["No correio electrónico da equipa", "Apenas no equipamento que a gerou, com permissões restritas", "No site da instituição", "Num papel colado ao monitor"], certa: 1, comentario: "A chave pública pode ser partilhada; a privada identifica o equipamento e nunca sai dele." },
      { pergunta: "Qual é a melhor forma de expor a gestão dos equipamentos a um técnico remoto?", opcoes: ["Abrir SSH para toda a Internet", "Só através de VPN, com autenticação por chave", "Partilhar a palavra-passe por mensagem", "Desligar a firewall durante o piquete"], certa: 1, comentario: "A VPN reduz a superfície exposta; a chave substitui palavras-passe adivinháveis." },
    ],
    leituraFacil: ["Acesso de fora passa por um túnel cifrado.", "Use chaves, não palavras-passe.", "A chave secreta nunca sai do computador."],
    guiao: {
      conducao: ["0–20 min: VPN com o exemplo de um corredor fechado dentro de um mercado.", "20–65 min: prática; quem não tiver o módulo wireguard no núcleo faz os passos em papel com as saídas indicadas.", "65–75 min: formativas."],
      errosComuns: ["Trocar chave privada por pública na configuração.", "Esquecer a rota para 10.10.20.0/24 na casa."],
    },
    fontes: ["wireguard", "openssh", "rfc4253", "nist80077", "iproute2"],
  },

  "r-m07-l4": {
    objectivos: [
      "Distinguir IDS e IPS, detecção por assinatura e por anomalia.",
      "Escrever e testar uma regra local Suricata na rede de prática.",
      "Interpretar um alerta e decidir o passo seguinte sem conclusões precipitadas.",
    ],
    explicacao: [
      {
        titulo: "Detectar e prevenir",
        paragrafos: [
          "Um IDS observa uma cópia do tráfego e gera alertas; um IPS está no caminho e pode descartar pacotes. Detecção por assinatura procura padrões conhecidos; por anomalia compara com o comportamento normal (a linha de base do módulo 8).",
          "Um alerta é um indício, não uma prova. Pode ser falso positivo (tráfego legítimo parecido) e a ausência de alerta não prova ausência de ataque (falso negativo). Cada alerta é confirmado com outras fontes: registos, captura, dono do equipamento.",
        ],
      },
      {
        titulo: "Regras Suricata",
        paragrafos: [
          "Formato: acção protocolo origem porta -> destino porta (opções). Exemplo: alert icmp any any -> 10.10.20.53 any (msg:\"...\"; itype:8; sid:1000001; rev:1;). Os sid de 1000000 a 1999999 são reservados a regras locais. Regras de terceiros devem vir de fontes oficiais e ser testadas antes de ligar o modo IPS.",
        ],
      },
    ],
    caso: "Na DPE (fictícia) suspeita-se de varrimentos vindos da delegação. Antes de bloquear, o técnico quer um alerta fiável.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Suricata em modo IDS no r1, a observar a interface r1-r2 (tráfego vindo da delegação)."],
      passos: [
        { accao: "Crie rotas estáticas para haver tráfego sede–delegação (como no módulo 3).", comandos: ["sudo ip -n r1 route add 10.20.10.0/24 via 10.255.0.2", "sudo ip -n r2 route add default via 10.255.0.1"] },
        { accao: "Escreva as regras locais.", comandos: ["mkdir -p /tmp/suri", "cat > /tmp/suri/local.rules <<'EOF'", "alert icmp 10.20.10.0/24 any -> 10.10.20.53 any (msg:\"DPE pratica: eco ICMP da delegacao ao srv\"; itype:8; sid:1000001; rev:1;)", "alert tcp 10.20.10.0/24 any -> 10.10.20.0/24 any (msg:\"DPE pratica: muitos SYN da delegacao\"; flags:S,12; threshold: type both, track by_src, count 10, seconds 10; sid:1000002; rev:1;)", "EOF"] },
        { accao: "Consola A: arranque o Suricata só com estas regras e espere a mensagem de motor iniciado.", comandos: ["sudo ip netns exec r1 suricata -i r1-r2 -S /tmp/suri/local.rules -l /tmp/suri"], saida: ["... Engine started."] },
        { accao: "Consola B: gere tráfego e leia os alertas.", comandos: ["sudo ip netns exec pc-del ping -c 1 10.10.20.53", "sudo ip netns exec pc-del sh -c 'for p in $(seq 20 40); do timeout 1 bash -c \"</dev/tcp/10.10.20.53/$p\" 2>/dev/null; done'", "cat /tmp/suri/fast.log"], saida: ["[1:1000001:1] DPE pratica: eco ICMP da delegacao ao srv [Classification: (null)] [Priority: 3] {ICMP} 10.20.10.10:8 -> 10.10.20.53:0", "[1:1000002:1] DPE pratica: muitos SYN da delegacao [Priority: 3] {TCP} 10.20.10.10:41822 -> 10.10.20.53:29"] },
      ],
      sucesso: ["fast.log contém os dois alertas com sid locais.", "O formando escreve em duas linhas o que o alerta prova e o que não prova."],
      reversao: ["Ctrl+C na consola A", "sudo ip -n r1 route del 10.20.10.0/24 via 10.255.0.2; sudo ip -n r2 route del default via 10.255.0.1", "rm -rf /tmp/suri"],
    },
    papel: [
      { tarefa: "O alerta 1000002 apareceu. Liste três verificações antes de bloquear 10.20.10.10.", esperado: "Confirmar com o responsável da delegação se há inventário ou teste autorizado; ver registos do srv e captura; verificar se o equipamento é conhecido e se o comportamento se repete." },
      { tarefa: "Porque é que a regra 1000002 usa threshold?", esperado: "Para alertar só quando há 10 SYN em 10 s da mesma origem, evitando um alerta por cada ligação normal." },
    ],
    formativas: [
      { pergunta: "Um IDS não gerou alertas durante uma semana. O que se pode concluir?", opcoes: ["Não houve ataques", "Nada de definitivo: pode haver falsos negativos ou regras em falta", "O IDS está avariado de certeza", "A rede é segura"], certa: 1, comentario: "A ausência de alerta não prova ausência de ataque; revê-se cobertura das regras e visibilidade." },
      { pergunta: "Diferença essencial entre IDS e IPS:", opcoes: ["O IPS só funciona em Wi-Fi", "O IPS está no caminho e pode descartar; o IDS observa e alerta", "O IDS é sempre mais caro", "Não há diferença"], certa: 1, comentario: "Por estar no caminho, um IPS mal afinado pode bloquear tráfego legítimo; começa-se em modo de detecção." },
    ],
    leituraFacil: ["O IDS observa e avisa.", "O IPS pode bloquear.", "Um aviso tem de ser confirmado antes de agir."],
    guiao: {
      conducao: ["0–20 min: assinatura vs anomalia; falso positivo e falso negativo com exemplos do dia-a-dia.", "20–70 min: prática; se o Suricata não estiver instalado, a turma analisa as regras e o fast.log de exemplo no papel.", "70–80 min: formativas e discussão das três verificações."],
      errosComuns: ["Tratar o alerta como prova.", "Ligar modo IPS sem período de observação."],
    },
    fontes: ["suricata", "nist80061", "iproute2"],
  },

  "r-m07-l5": {
    objectivos: [
      "Aplicar uma lista de verificação de reforço a um encaminhador Linux de prática.",
      "Identificar serviços expostos desnecessários e fechá-los.",
      "Registar as alterações com antes/depois e forma de reverter.",
    ],
    explicacao: [
      {
        titulo: "Reforço da configuração",
        paragrafos: [
          "Reforçar é reduzir o que pode falhar ou ser explorado: remover serviços que não se usam, fechar portas, trocar credenciais por omissão, desactivar protocolos inseguros (Telnet, HTTP de gestão, SNMP v1/v2c com comunidades conhecidas), actualizar, sincronizar a hora e enviar registos para um servidor central.",
          "Faz-se com uma lista escrita, aprovada e versionada (por exemplo, a partir do Manual de Segurança Debian ou das guias do fabricante), aplicada igual em todos os equipamentos do mesmo tipo e verificada depois. Cada alteração tem uma forma de reverter.",
        ],
      },
    ],
    caso: "Uma auditoria interna fictícia da DPE encontrou no r1 um serviço de gestão em texto claro e o encaminhamento IPv6 activo sem uso. Pede-se correcção documentada.",
    pratica: {
      topologia: TOPOLOGIA_BASE,
      passos: [
        { accao: "Prepare a situação encontrada pela auditoria (IPv6 a encaminhar sem uso).", comandos: ["sudo ip netns exec r1 sysctl -qw net.ipv6.conf.all.forwarding=1"] },
        { accao: "Consola C: simule um serviço de gestão inseguro no r1 (servidor HTTP de teste na porta 8080).", comandos: ["sudo ip netns exec r1 python3 -m http.server 8080 --bind 0.0.0.0"] },
        { accao: "Consola B: inventário ANTES — portas à escuta e parâmetros.", comandos: ["sudo ip netns exec r1 ss -lntup", "sudo ip netns exec r1 sysctl net.ipv6.conf.all.forwarding net.ipv4.conf.all.accept_redirects net.ipv4.conf.all.send_redirects"], saida: ["tcp LISTEN 0 5 0.0.0.0:8080 0.0.0.0:* users:((\"python3\",pid=4121,fd=3))", "net.ipv6.conf.all.forwarding = 1", "net.ipv4.conf.all.accept_redirects = 1", "net.ipv4.conf.all.send_redirects = 1"] },
        { accao: "Aplique o reforço: pare o serviço (Ctrl+C na consola C) e ajuste parâmetros.", comandos: ["sudo ip netns exec r1 sysctl -qw net.ipv6.conf.all.forwarding=0", "sudo ip netns exec r1 sysctl -qw net.ipv4.conf.all.accept_redirects=0", "sudo ip netns exec r1 sysctl -qw net.ipv4.conf.all.send_redirects=0"] },
        { accao: "Verifique DEPOIS e confirme que o encaminhamento IPv4 continua.", comandos: ["sudo ip netns exec r1 ss -lntup", "sudo ip netns exec pc-adm ping -c 1 10.10.20.53"], saida: ["(sem serviços à escuta)", "1 packets transmitted, 1 received"] },
      ],
      sucesso: ["A folha de alterações tem, para cada item: antes, depois, motivo, forma de reverter.", "O IPv4 continua a funcionar."],
      reversao: ["Repor os valores anotados no inventário ANTES (nesta prática: accept_redirects=1 e send_redirects=1; o IPv6 fica desligado, que é o valor inicial do espaço de nomes)", "sudo ip netns exec r1 sysctl -qw net.ipv4.conf.all.accept_redirects=1", "sudo ip netns exec r1 sysctl -qw net.ipv4.conf.all.send_redirects=1"],
    },
    papel: [
      { tarefa: "Preencha uma lista de reforço com 8 itens para um encaminhador (sem comandos, só verificação).", esperado: "Por exemplo: credenciais por omissão trocadas; gestão só por SSH e só da VLAN 99; Telnet/HTTP de gestão desligados; SNMPv3 ou SNMP desligado; hora sincronizada; registos centralizados; firmware/pacotes actualizados; cópia de configuração versionada; serviços não usados desligados." },
      { tarefa: "Porque se desactivam redireccionamentos ICMP num encaminhador de fronteira?", esperado: "Um redireccionamento aceite pode alterar rotas a pedido de terceiros; num ambiente com rotas definidas não são necessários." },
    ],
    formativas: [
      { pergunta: "Qual destas práticas NÃO faz parte de um reforço?", opcoes: ["Desligar serviços não usados", "Manter a palavra-passe de fábrica para facilitar suporte", "Registar alterações", "Actualizar o software"], certa: 1, comentario: "Credenciais por omissão são públicas nos manuais; trocá-las é dos primeiros passos." },
      { pergunta: "Porque se verifica o serviço principal depois de reforçar?", opcoes: ["Por formalidade", "Porque uma alteração pode quebrar uma função necessária", "Para aumentar os registos", "Não é necessário"], certa: 1, comentario: "Reforço sem verificação pode criar uma avaria; o antes/depois inclui o que deve continuar a funcionar." },
    ],
    leituraFacil: ["Desligue o que não usa.", "Troque as palavras-passe de fábrica.", "Anote o que mudou e como desfazer."],
    guiao: {
      conducao: ["0–20 min: construir a lista de reforço com a turma.", "20–70 min: prática com folha de alterações.", "70–80 min: formativas e troca de folhas entre duplas para revisão."],
      errosComuns: ["Mudar parâmetros sem registar o valor anterior.", "Desligar o encaminhamento IPv4 por engano."],
    },
    fontes: ["debian", "nist80040", "iproute2"],
  },
};
