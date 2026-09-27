/**
 * Curso de Redes — módulos 4 a 6 (Sem fios, Serviços, Introdução à Segurança).
 * Conteúdo fictício e didáctico; ver regras em redes-base.ts.
 */
import { TOPOLOGIA_BASE, type ConteudoLicao } from "./redes-base";

const SEM_AP =
  "Se a sala não tiver um ponto de acesso de prática desligado da rede institucional, faça os passos em papel: as saídas de exemplo e as respostas esperadas estão abaixo.";

export const LICOES_M04_06: Record<string, ConteudoLicao> = {
  // ───────────────────────── MÓDULO 4 — Redes sem fios ─────────────────────────
  "r-m04-l1": {
    objectivos: [
      "Explicar bandas (2,4, 5 e 6 GHz), canais, largura de canal e SSID.",
      "Distinguir as gerações 802.11 pelo que mudam na prática, sem decorar números de marketing.",
      "Ler uma lista de redes vizinhas e identificar sobreposição de canais.",
    ],
    explicacao: [
      {
        titulo: "Rádio é um meio partilhado",
        paragrafos: [
          "No Wi-Fi todos os equipamentos no mesmo canal partilham o mesmo ar: só um transmite de cada vez. A banda de 2,4 GHz alcança mais longe e atravessa melhor paredes, mas tem só três canais sem sobreposição (1, 6 e 11) e muita interferência (micro-ondas, Bluetooth). A banda de 5 GHz tem muitos mais canais e menos interferência, com menor alcance. A de 6 GHz, quando permitida pela regulação nacional e suportada pelos equipamentos, acrescenta canais limpos.",
          "SSID é o nome da rede; BSSID é o endereço do ponto de acesso que o anuncia. Canais mais largos (40, 80 MHz) dão mais débito a um cliente, mas consomem mais espectro e aumentam a interferência entre pontos de acesso vizinhos. As gerações 802.11n/ac/ax (Wi-Fi 4/5/6) melhoram eficiência e débito; o débito real é sempre bem inferior ao anunciado.",
        ],
      },
      {
        titulo: "Regulação",
        paragrafos: [
          "A potência e os canais permitidos dependem do regulador nacional; o equipamento deve estar configurado com o código de país correcto. Confirme com a entidade reguladora das comunicações antes de usar canais ou potências fora do habitual.",
        ],
      },
    ],
    caso: "Na sala de reuniões da DPE (fictícia), o Wi-Fi fica lento quando há reunião. O técnico faz um levantamento e descobre cinco redes vizinhas na banda de 2,4 GHz.",
    pratica: {
      topologia: ["Um portátil Linux de prática com placa Wi-Fi (só leitura, sem se ligar a nenhuma rede) ou, na falta dele, a saída de exemplo abaixo."],
      passos: [
        { accao: "Liste as redes vizinhas apenas em modo de leitura (não se liga a nenhuma).", comandos: ["nmcli -f SSID,BSSID,CHAN,FREQ,SIGNAL,SECURITY device wifi list"], saida: ["SSID          BSSID              CHAN  FREQ      SIGNAL  SECURITY", "DPE-Func      02:00:00:00:10:01  6     2437 MHz  78      WPA2 WPA3", "DPE-Visit     02:00:00:00:10:02  6     2437 MHz  77      WPA2", "Loja-Vizinha  02:00:00:00:99:01  4     2427 MHz  60      WPA2", "Casa-12       02:00:00:00:99:02  9     2452 MHz  45      WPA2", "DPE-Func      02:00:00:00:20:01  36    5180 MHz  52      WPA2 WPA3"] },
        { accao: SEM_AP },
        { accao: "Registe numa tabela: SSID, canal, banda, sinal, segurança. Marque as sobreposições (canais a menos de 5 de distância em 2,4 GHz sobrepõem-se)." },
      ],
      sucesso: ["O formando identifica que os canais 4 e 9 sobrepõem-se ao canal 6 da DPE.", "Propõe mover os clientes para 5 GHz e manter 2,4 GHz em 1, 6 ou 11."],
      reversao: ["Nenhuma: a prática é só de leitura. Não se alteram redes de terceiros."],
    },
    papel: [
      { tarefa: "Com a saída de exemplo, que redes interferem com DPE-Func em 2,4 GHz?", esperado: "Loja-Vizinha (canal 4) e Casa-12 (canal 9) sobrepõem-se parcialmente ao canal 6; DPE-Visit está no mesmo canal 6 (partilha o tempo de ar)." },
      { tarefa: "Proponha uma melhoria sem comprar equipamento.", esperado: "Anunciar DPE-Func também e preferencialmente em 5 GHz (canal 36 já existe), usar canal de 20 MHz em 2,4 GHz, manter visitantes e funcionários no mesmo ponto mas limitar o débito de visitantes (módulo 10)." },
      { tarefa: "SSID vs BSSID: qual identifica o aparelho?", esperado: "O BSSID (endereço do rádio). Vários pontos de acesso podem anunciar o mesmo SSID." },
    ],
    formativas: [
      { pergunta: "Quais são os canais de 2,4 GHz sem sobreposição habitualmente usados?", opcoes: ["1, 2 e 3", "1, 6 e 11", "36, 40 e 44", "Todos"], certa: 1, comentario: "Em 2,4 GHz os canais estão a 5 MHz de distância e cada um ocupa cerca de 20 MHz; 1, 6 e 11 não se sobrepõem." },
      { pergunta: "Porque é que um canal de 80 MHz nem sempre é melhor?", opcoes: ["É ilegal", "Ocupa mais espectro e aumenta a interferência entre vizinhos", "Não funciona em 5 GHz", "Reduz a segurança"], certa: 1, comentario: "Dá mais débito a um cliente em ambiente limpo, mas com muitos pontos de acesso próximos é preferível canais mais estreitos." },
    ],
    leituraFacil: ["O Wi-Fi usa rádio, partilhado por todos.", "2,4 GHz vai longe; 5 GHz é mais rápido e tem mais canais.", "Evite redes vizinhas no mesmo canal."],
    guiao: {
      conducao: ["0–20 min: explicar bandas com a imagem de uma estrada com faixas.", "20–60 min: levantamento (ou papel).", "60–70 min: formativas."],
      errosComuns: ["Ligar-se a redes de terceiros durante o levantamento.", "Confundir sinal forte com rede rápida."],
    },
    fontes: ["ieee80211", "nist800153"],
  },

  "r-m04-l2": {
    objectivos: [
      "Planear cobertura e capacidade para uma sala ou piso.",
      "Estimar número de pontos de acesso pela capacidade e não só pela área.",
      "Documentar o plano com mapa textual e tabela de canais.",
    ],
    explicacao: [
      {
        titulo: "Cobertura não é capacidade",
        paragrafos: [
          "Cobertura: o sinal chega com qualidade suficiente (referência prática de –67 dBm ou melhor para dados e voz). Capacidade: o ponto de acesso aguenta o número de utilizadores e o tipo de uso. Uma sala de formação com 40 portáteis precisa de capacidade, mesmo que um só ponto a cubra.",
          "Método: 1) listar zonas e uso (formação, escritórios, recepção); 2) estimar clientes simultâneos e débito por cliente; 3) dividir pela capacidade útil prudente de cada rádio (confirmar na ficha técnica e testar no local); 4) posicionar com sobreposição de 15–20% entre células; 5) atribuir canais alternados; 6) validar com levantamento no local.",
        ],
      },
    ],
    caso: "A DPE (fictícia) vai equipar o primeiro piso: sala de formação (40 formandos), três escritórios (12 pessoas), recepção (visitantes, até 15). Pede-se o plano.",
    pratica: {
      topologia: ["Planta textual do piso: corredor de 30 m no sentido este–oeste; a norte, sala de formação (12 × 8 m) a oeste e três escritórios (4 × 4 m) a leste; a sul, recepção (8 × 6 m) ao centro. Paredes de alvenaria entre salas."],
      passos: [
        { accao: "Faça a folha de capacidade em Python (sem instalar nada) e ajuste os números.", comandos: ["cat > /tmp/capacidade.py <<'EOF'", "zonas = {'formacao': (40, 2.0), 'escritorios': (12, 3.0), 'recepcao': (15, 1.0)}  # clientes, Mbit/s por cliente", "capacidade_util_por_radio = 60  # Mbit/s, valor prudente a confirmar no local", "for z, (n, d) in zonas.items():", "    total = n * d", "    radios = -(-total // capacidade_util_por_radio)", "    print(f'{z}: {total:.0f} Mbit/s -> {radios:.0f} rádio(s)')", "EOF", "python3 /tmp/capacidade.py"], saida: ["formacao: 80 Mbit/s -> 2 rádio(s)", "escritorios: 36 Mbit/s -> 1 rádio(s)", "recepcao: 15 Mbit/s -> 1 rádio(s)"] },
        { accao: "Transforme o resultado num plano: posições, bandas e canais. Use a tabela do papel como modelo." },
      ],
      sucesso: ["O plano indica 3 pontos de acesso (2 rádios de 5 GHz na formação podem ser 1 ponto com dois rádios ou 2 pontos), canais alternados e justificação.", "Assume que os valores de capacidade são estimativas a validar no local."],
      reversao: ["rm -f /tmp/capacidade.py"],
    },
    papel: [
      { tarefa: "Proponha posições e canais.", esperado: "PA1 no tecto da sala de formação, 5 GHz canal 36 e 2,4 GHz canal 1; PA2 na mesma sala, extremidade oposta, 5 GHz canal 44 (se a capacidade exigir); PA3 no corredor junto aos escritórios, 5 GHz canal 52 (ou 149 conforme regulação) e 2,4 GHz canal 6; recepção servida por PA3 ou PA4 com 2,4 GHz canal 11 e SSID de visitantes." },
      { tarefa: "Porque não pôr um único ponto de acesso potente no corredor?", esperado: "Paredes de alvenaria atenuam; e um só rádio divide o tempo por todos os clientes: 67 clientes num rádio dão mau desempenho, mesmo com bom sinal." },
      { tarefa: "Como validar o plano depois da instalação?", esperado: "Levantamento de sinal em cada sala (nível e canal), teste de débito com vários clientes, registo em tabela e ajuste de potência/canais." },
    ],
    formativas: [
      { pergunta: "Uma sala com 40 portáteis tem bom sinal mas é lenta. A causa mais provável é:", opcoes: ["Cobertura insuficiente", "Capacidade insuficiente", "DNS", "Cabo"], certa: 1, comentario: "Sinal bom mostra que a cobertura está boa; o problema é o número de clientes a partilhar o mesmo rádio." },
      { pergunta: "Porque aumentar a potência ao máximo é má prática?", opcoes: ["Gasta electricidade", "Cria células enormes que interferem com vizinhos e clientes ficam presos a pontos distantes", "É proibido sempre", "Desliga o 5 GHz"], certa: 1, comentario: "O cliente também tem de responder; potência alta no ponto de acesso cria assimetria e interferência." },
    ],
    leituraFacil: ["Contar quantas pessoas vão usar o Wi-Fi.", "Muitas pessoas precisam de mais pontos de acesso.", "Testar no local depois de instalar."],
    guiao: {
      conducao: ["0–20 min: cobertura vs capacidade com o exemplo de uma torneira e vários baldes.", "20–65 min: plano em grupos com a planta impressa.", "65–75 min: formativas."],
      errosComuns: ["Planear só pela área.", "Apresentar estimativas como medidas."],
    },
    fontes: ["ieee80211", "nist800153", "python"],
  },

  "r-m04-l3": {
    objectivos: [
      "Configurar uma rede sem fios com WPA3-Personal (SAE) e modo de transição WPA2/WPA3.",
      "Separar funcionários e visitantes por SSID e VLAN.",
      "Aplicar boas práticas: gestão desligada da rede de visitantes, WPS desligado, firmware actualizado.",
    ],
    explicacao: [
      {
        titulo: "Protecções de uma rede sem fios",
        paragrafos: [
          "WEP e WPA (TKIP) estão quebrados e não devem ser usados. WPA2 com AES/CCMP é o mínimo; WPA3 substitui a troca de chave partilhada por SAE, resistente a ataques de dicionário fora de linha, e exige protecção de tramas de gestão (PMF). O modo de transição permite clientes antigos WPA2 ao lado de WPA3, com menor protecção para esses.",
          "Boas práticas: SSID de visitantes numa VLAN própria (30) só com saída para a internet; isolamento de clientes nos visitantes; frase-passe longa e mudada periodicamente para visitantes; WPS desligado; interface de gestão do ponto de acesso só na VLAN 99; firmware actualizado.",
        ],
      },
    ],
    caso: "O ponto de acesso da recepção da DPE (fictícia) usa WPA2 com a frase-passe «dpe2020» há quatro anos, partilhada com todos os visitantes e funcionários. Pede-se uma configuração nova.",
    pratica: {
      topologia: ["Ponto de acesso de prática com hostapd num computador Linux com placa Wi-Fi compatível com modo AP, ligado por cabo apenas à rede de prática. VLAN 10 (funcionários) e 30 (visitantes)."],
      passos: [
        { accao: SEM_AP },
        { accao: "Ficheiro hostapd para funcionários (WPA2/WPA3 transição, PMF). Substitua wlan0 pelo nome da sua placa. A frase-passe é só de prática.", comandos: ["# /etc/hostapd/dpe-func.conf", "interface=wlan0", "bridge=br-func", "driver=nl80211", "country_code=MZ", "ssid=DPE-Func-Pratica", "hw_mode=a", "channel=36", "ieee80211n=1", "ieee80211ac=1", "wpa=2", "wpa_key_mgmt=WPA-PSK SAE", "rsn_pairwise=CCMP", "ieee80211w=1", "sae_require_mfp=1", "wpa_passphrase=Pratica-Frase-Longa-Nao-Real-2026", "wps_state=0"] },
        { accao: "Visitantes: SSID próprio, isolamento de clientes, ligação à VLAN 30.", comandos: ["# /etc/hostapd/dpe-visit.conf (excerto)", "ssid=DPE-Visit-Pratica", "bridge=br-visit", "ap_isolate=1", "wpa=2", "wpa_key_mgmt=SAE", "ieee80211w=2", "wpa_passphrase=Visitas-Semana-40-Pratica"] },
        { accao: "Arranque em primeiro plano para ver erros e confirme os clientes associados.", comandos: ["sudo hostapd -d /etc/hostapd/dpe-func.conf", "sudo hostapd_cli -i wlan0 all_sta"], saida: ["wlan0: AP-ENABLED", "wlan0: STA 02:00:00:00:aa:01 IEEE 802.11: associated", "wlan0: AP-STA-CONNECTED 02:00:00:00:aa:01"] },
      ],
      sucesso: ["Cliente WPA3 associa-se com PMF.", "Cliente de visitantes não alcança outro cliente de visitantes (isolamento) nem a VLAN 10.", "A gestão do ponto de acesso não é acessível a partir da VLAN 30."],
      reversao: ["Parar o hostapd (Ctrl+C) e apagar os ficheiros de prática em /etc/hostapd/.", "Nunca reutilizar as frases-passe de prática em redes reais."],
    },
    papel: [
      { tarefa: "Liste quatro problemas da configuração do caso.", esperado: "Frase curta e previsível; partilhada entre visitantes e funcionários (mesma rede); não mudada há anos; WPA2 sem PMF; provavelmente sem separação de VLAN nem isolamento." },
      { tarefa: "O que muda o SAE em relação à chave partilhada do WPA2?", esperado: "Com WPA2-PSK, quem captura o aperto de mão pode testar palavras fora de linha; com SAE cada tentativa exige interacção com o ponto de acesso, travando ataques de dicionário fora de linha." },
      { tarefa: "Porque ap_isolate=1 nos visitantes?", esperado: "Impede que um visitante ataque ou veja os dispositivos de outro visitante na mesma rede." },
    ],
    formativas: [
      { pergunta: "Qual é o mínimo aceitável hoje para uma rede de funcionários?", opcoes: ["WEP", "WPA com TKIP", "WPA2 com AES, preferindo WPA3", "Rede aberta com portal"], certa: 2, comentario: "WEP e TKIP estão quebrados. WPA2-AES é o mínimo; WPA3 acrescenta SAE e PMF obrigatório." },
      { pergunta: "Onde deve estar a interface de gestão do ponto de acesso?", opcoes: ["Na rede de visitantes", "Numa VLAN de gestão restrita", "Aberta à internet", "Em qualquer rede"], certa: 1, comentario: "Quem alcança a gestão pode alterar a configuração de toda a rede sem fios." },
    ],
    leituraFacil: ["Use WPA3 ou pelo menos WPA2.", "Visitantes numa rede separada.", "Frase-passe longa e mudada com frequência."],
    guiao: {
      conducao: ["0–20 min: histórico das protecções e porque WEP/TKIP caíram.", "20–65 min: configuração (ou papel).", "65–75 min: formativas."],
      errosComuns: ["Deixar WPS ligado.", "Colocar visitantes na mesma VLAN dos funcionários."],
    },
    fontes: ["wifiwpa3", "ieee80211", "nist800153"],
  },

  "r-m04-l4": {
    objectivos: [
      "Explicar 802.1X com EAP e RADIUS: suplicante, autenticador, servidor.",
      "Configurar um servidor FreeRADIUS de prática e testar com radtest.",
      "Comparar chave partilhada, 802.1X e autenticação por certificado.",
    ],
    explicacao: [
      {
        titulo: "Cada pessoa com a sua credencial",
        paragrafos: [
          "Com uma chave partilhada, quando alguém sai da instituição é preciso mudar a chave de todos. Com 802.1X cada utilizador (ou dispositivo) autentica-se individualmente: o cliente (suplicante) fala EAP com o ponto de acesso ou comutador (autenticador), que pergunta ao servidor RADIUS se aceita. Pode-se desactivar uma conta sem afectar as outras e atribuir VLAN por perfil.",
          "Os métodos mais usados são EAP-TLS (certificado em cada dispositivo, mais forte) e PEAP ou EAP-TTLS (palavra-passe dentro de um túnel TLS; o cliente tem de validar o certificado do servidor, senão uma rede falsa recolhe credenciais). O RADIUS deve ficar na VLAN de servidores, com segredo partilhado forte entre autenticador e servidor.",
        ],
      },
    ],
    caso: "A DPE (fictícia) quer que o acesso sem fios dos funcionários seja individual e que as contas de quem sai sejam desactivadas no mesmo dia.",
    pratica: {
      topologia: ["srv (10.10.20.53) com FreeRADIUS de prática; r1 faz de «autenticador» e envia pedidos de teste com radtest. Pacotes adicionais: freeradius e freeradius-utils (repositório Debian)."],
      passos: [
        { accao: "Declare o cliente RADIUS (o autenticador r1) com um segredo de prática.", comandos: ["sudo tee -a /etc/freeradius/3.0/clients.conf <<'EOF'", "client r1-pratica {", "    ipaddr = 10.10.20.1", "    secret = SegredoRadiusDePratica-Longo-2026", "}", "EOF"] },
        { accao: "Crie dois utilizadores de prática (fictícios).", comandos: ["sudo tee -a /etc/freeradius/3.0/mods-config/files/authorize <<'EOF'", "ana.pratica  Cleartext-Password := \"Senha-Pratica-Ana-1\"", "             Tunnel-Type = VLAN, Tunnel-Medium-Type = IEEE-802, Tunnel-Private-Group-Id = 10", "EOF"] },
        { accao: "Arranque o servidor em modo de depuração dentro do srv.", comandos: ["sudo ip netns exec srv freeradius -X"], saida: ["Listening on auth address 10.10.20.53 port 1812 bound to server default", "Ready to process requests"] },
        { accao: "Noutra consola, teste a partir do r1.", comandos: ["sudo ip netns exec r1 radtest ana.pratica Senha-Pratica-Ana-1 10.10.20.53 0 SegredoRadiusDePratica-Longo-2026", "sudo ip netns exec r1 radtest ana.pratica errada 10.10.20.53 0 SegredoRadiusDePratica-Longo-2026"], saida: ["Received Access-Accept Id 12 from 10.10.20.53:1812 to 10.10.20.1:40001 length 38", "        Tunnel-Private-Group-Id:0 = \"10\"", "Received Access-Reject Id 13 from 10.10.20.53:1812 to 10.10.20.1:40002 length 20"] },
      ],
      sucesso: ["Credencial correcta → Access-Accept com VLAN 10; errada → Access-Reject.", "O formando explica onde, numa rede real, ficariam suplicante, autenticador e servidor."],
      reversao: ["Retirar as linhas acrescentadas a clients.conf e authorize; parar o freeradius (Ctrl+C).", "As senhas em texto claro servem só para a prática; em produção usar directório de utilizadores e EAP-TLS ou PEAP com validação de certificado."],
    },
    papel: [
      { tarefa: "Identifique suplicante, autenticador e servidor no Wi-Fi da DPE.", esperado: "Suplicante: portátil ou telemóvel do funcionário. Autenticador: ponto de acesso. Servidor: RADIUS na VLAN 20 (10.10.20.53)." },
      { tarefa: "Porque é perigoso não validar o certificado do servidor em PEAP?", esperado: "Um ponto de acesso falso com o mesmo SSID pode apresentar outro certificado e recolher as credenciais dos funcionários." },
      { tarefa: "O que acontece à rede quando a Ana sai da instituição?", esperado: "Desactiva-se só a conta dela; ninguém mais muda de credencial." },
    ],
    formativas: [
      { pergunta: "Em 802.1X, quem decide se o utilizador entra?", opcoes: ["O ponto de acesso sozinho", "O servidor de autenticação (RADIUS)", "O DNS", "O cliente"], certa: 1, comentario: "O autenticador só transporta o diálogo EAP e aplica a decisão do servidor." },
      { pergunta: "Qual método é mais forte?", opcoes: ["Chave partilhada", "EAP-TLS com certificados por dispositivo", "Rede aberta", "Filtragem por MAC"], certa: 1, comentario: "EAP-TLS dispensa palavras-passe e autentica os dois lados. A filtragem por MAC é fácil de contornar porque o MAC pode ser imitado." },
    ],
    leituraFacil: ["Cada pessoa entra com o seu nome e senha.", "Quem sai, perde só o seu acesso.", "Confirme que a rede é mesmo da instituição."],
    guiao: {
      conducao: ["0–20 min: papéis 802.1X com uma dramatização de três pessoas.", "20–70 min: prática FreeRADIUS.", "70–80 min: formativas."],
      errosComuns: ["Segredo RADIUS diferente nos dois lados (o servidor ignora o pedido).", "Esquecer que freeradius -X mostra a razão do erro."],
    },
    fontes: ["ieee8021x", "rfc2865", "nist800153"],
  },

  "r-m04-l5": {
    objectivos: [
      "Diagnosticar falhas de associação, autenticação e endereçamento em Wi-Fi.",
      "Distinguir interferência, sinal fraco e falta de capacidade pelas evidências.",
      "Registar o diagnóstico com recomendações.",
    ],
    explicacao: [
      {
        titulo: "Em que fase falha?",
        paragrafos: [
          "Uma ligação sem fios passa por: descoberta (o cliente vê o SSID), associação, autenticação (chave ou 802.1X), obtenção de endereço (DHCP) e tráfego. Cada fase tem evidências próprias nos registos do cliente e do ponto de acesso. «Não liga» pode ser frase-passe errada, servidor RADIUS inalcançável, âmbito DHCP esgotado ou canal saturado.",
          "Sinais: sinal abaixo de cerca de –75 dBm → cobertura; muitas retransmissões e ruído alto com sinal bom → interferência; muitos clientes e tempo de ar ocupado → capacidade.",
        ],
      },
    ],
    caso: "Três queixas na DPE (fictícia): (a) um visitante não consegue ligar; (b) funcionários na sala de formação ligam mas não navegam; (c) no escritório do fundo a ligação cai.",
    pratica: {
      topologia: ["Registos de exemplo de um cliente Linux (wpa_supplicant/NetworkManager) e de um ponto de acesso hostapd, fornecidos abaixo."],
      passos: [
        { accao: "Leia o registo (a).", saida: ["wlan0: SME: Trying to authenticate with 02:00:00:00:10:02 (SSID='DPE-Visit')", "wlan0: Trying to associate with 02:00:00:00:10:02", "wlan0: Associated with 02:00:00:00:10:02", "wlan0: WPA: 4-Way Handshake failed - pre-shared key may be incorrect", "wlan0: CTRL-EVENT-SSID-TEMP-DISABLED id=0 ssid=\"DPE-Visit\" auth_failures=1"] },
        { accao: "Leia o registo (b).", saida: ["wlan0: CTRL-EVENT-CONNECTED - Connection to 02:00:00:00:10:01 completed", "NetworkManager: dhcp4 (wlan0): activation: beginning transaction (timeout in 45 seconds)", "NetworkManager: dhcp4 (wlan0): state changed timeout", "kea-dhcp4: ALLOC_ENGINE_V4_ALLOC_FAIL [hwtype=1 02:00:00:00:aa:37] failed to allocate an IPv4 address after 64 attempt(s)"] },
        { accao: "Leia o registo (c).", comandos: ["iw dev wlan0 link"], saida: ["Connected to 02:00:00:00:20:01 (on wlan0)", "        SSID: DPE-Func", "        freq: 5260", "        signal: -81 dBm", "        tx bitrate: 6.5 MBit/s"] },
        { accao: "Para cada caso escreva: fase que falha, evidência, causa provável, acção, verificação." },
      ],
      sucesso: ["(a) autenticação — frase-passe; (b) endereçamento — âmbito DHCP esgotado; (c) cobertura — sinal fraco.", "Cada acção proposta tem verificação."],
      reversao: ["Nenhuma: análise de registos de exemplo."],
    },
    papel: [
      { tarefa: "Caso (a).", esperado: "Fase: autenticação (aperto de mão de 4 vias falhou). Causa provável: frase-passe errada ou mudada. Acção: confirmar a frase-passe da semana com o visitante. Verificação: CTRL-EVENT-CONNECTED." },
      { tarefa: "Caso (b).", esperado: "Fase: endereçamento. Evidência: DHCP expira e o Kea não consegue atribuir endereço. Causa: âmbito esgotado (40 portáteis + telemóveis). Acção: alargar o âmbito ou reduzir o tempo de concessão para a sala de formação (módulo 5). Verificação: cliente recebe endereço e navega." },
      { tarefa: "Caso (c).", esperado: "Fase: tráfego/cobertura. Evidência: sinal –81 dBm e débito 6,5 Mbit/s. Causa: fora da célula útil. Acção: acrescentar ou reposicionar ponto de acesso; verificar paredes. Verificação: novo levantamento com sinal ≥ –67 dBm." },
    ],
    formativas: [
      { pergunta: "O cliente associa-se mas o aperto de mão de 4 vias falha. Causa mais provável?", opcoes: ["DNS", "Frase-passe errada", "Cabo", "Rota por omissão"], certa: 1, comentario: "O aperto de mão de 4 vias só tem sucesso se ambos derivarem a mesma chave da frase-passe." },
      { pergunta: "Sinal –55 dBm, mas muitas retransmissões e lentidão. Suspeito?", opcoes: ["Cobertura", "Interferência ou saturação do canal", "Frase-passe", "Certificado"], certa: 1, comentario: "Com bom sinal, a lentidão aponta para ruído no canal ou demasiados clientes." },
    ],
    leituraFacil: ["Primeiro veja em que passo falha.", "Senha errada, falta de endereço ou sinal fraco são coisas diferentes.", "Escreva a prova de cada conclusão."],
    guiao: {
      conducao: ["0–20 min: as cinco fases da ligação sem fios.", "20–70 min: análise dos três registos em grupos.", "70–80 min: formativas."],
      errosComuns: ["Culpar sempre o ponto de acesso.", "Não verificar o servidor DHCP."],
    },
    fontes: ["ieee80211", "kea", "nist800153"],
  },

  // ───────────────────────── MÓDULO 5 — Serviços ─────────────────────────
  "r-m05-l1": {
    objectivos: [
      "Configurar uma zona DNS autoritativa com BIND e um âmbito DHCP com Kea.",
      "Explicar o processo DHCP (DORA) e os registos DNS A, AAAA, PTR, CNAME, MX.",
      "Verificar os dois serviços com dig e com um cliente DHCP.",
    ],
    explicacao: [
      {
        titulo: "DHCP",
        paragrafos: [
          "O cliente envia DHCPDISCOVER em difusão, o servidor responde DHCPOFFER, o cliente pede com DHCPREQUEST e o servidor confirma com DHCPACK (DORA). A concessão tem tempo limitado. Como a difusão não atravessa encaminhadores, um servidor central precisa de agentes de reencaminhamento (DHCP relay) em cada VLAN. Endereços de servidores e equipamentos de rede são fixos ou reservados.",
        ],
      },
      {
        titulo: "DNS",
        paragrafos: [
          "Um servidor autoritativo responde pela sua zona (dpe.example); um resolvedor recursivo procura respostas para os clientes. Registos: A (nome → IPv4), AAAA (→ IPv6), PTR (IP → nome), CNAME (sinónimo), MX (correio). O número de série da zona deve aumentar em cada alteração. Não se deve deixar um resolvedor recursivo aberto à internet.",
        ],
      },
    ],
    caso: "Na DPE (fictícia), os postos da Administração têm endereços escritos à mão e colisões frequentes; os utilizadores decoram endereços IP. Pede-se DHCP para a VLAN 10 e DNS interno.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Kea corre no r1 (serve a VLAN 10 directamente, sem relay nesta prática); BIND corre no srv. Pacotes: kea-dhcp4-server, bind9, dnsutils, isc-dhcp-client."],
      passos: [
        { accao: "Configuração Kea de prática para a VLAN 10.", comandos: ["sudo tee /tmp/kea-dpe.json <<'EOF'", "{ \"Dhcp4\": {", "  \"interfaces-config\": { \"interfaces\": [ \"r1-pc-adm\" ] },", "  \"lease-database\": { \"type\": \"memfile\", \"name\": \"/tmp/kea-leases4.csv\" },", "  \"valid-lifetime\": 3600,", "  \"subnet4\": [ { \"id\": 10, \"subnet\": \"10.10.10.0/24\",", "     \"pools\": [ { \"pool\": \"10.10.10.100 - 10.10.10.199\" } ],", "     \"option-data\": [", "       { \"name\": \"routers\", \"data\": \"10.10.10.1\" },", "       { \"name\": \"domain-name-servers\", \"data\": \"10.10.20.53\" },", "       { \"name\": \"domain-name\", \"data\": \"dpe.example\" } ] } ] } }", "EOF", "sudo ip netns exec r1 kea-dhcp4 -t /tmp/kea-dpe.json && sudo ip netns exec r1 kea-dhcp4 -c /tmp/kea-dpe.json &"] },
        { accao: "No pc-adm, retire o endereço fixo e peça um por DHCP.", comandos: ["sudo ip -n pc-adm addr flush dev pc-adm-r1", "sudo ip netns exec pc-adm dhclient -v pc-adm-r1", "sudo ip -n pc-adm -brief addr"], saida: ["DHCPDISCOVER on pc-adm-r1 to 255.255.255.255 port 67", "DHCPOFFER of 10.10.10.100 from 10.10.10.1", "DHCPREQUEST for 10.10.10.100 on pc-adm-r1 to 255.255.255.255 port 67", "DHCPACK of 10.10.10.100 from 10.10.10.1", "pc-adm-r1@if5  UP  10.10.10.100/24"] },
        { accao: "Zona DNS de prática no srv.", comandos: ["sudo mkdir -p /tmp/bind && sudo tee /tmp/bind/named.conf <<'EOF'", "options { directory \"/tmp/bind\"; listen-on { 10.10.20.53; }; recursion no; allow-transfer { none; }; pid-file \"/tmp/bind/named.pid\"; };", "zone \"dpe.example\" { type primary; file \"db.dpe.example\"; };", "EOF", "sudo tee /tmp/bind/db.dpe.example <<'EOF'", "$TTL 3600", "@   IN SOA ns1.dpe.example. ti.dpe.example. ( 2026092701 3600 900 604800 300 )", "    IN NS  ns1.dpe.example.", "ns1 IN A   10.10.20.53", "srv IN A   10.10.20.53", "intranet IN CNAME srv", "r1  IN A   10.10.99.1", "EOF", "sudo named-checkconf /tmp/bind/named.conf && sudo named-checkzone dpe.example /tmp/bind/db.dpe.example", "sudo ip netns exec srv named -u bind -c /tmp/bind/named.conf -g &"], saida: ["zone dpe.example/IN: loaded serial 2026092701", "OK"] },
        { accao: "Teste a resolução a partir do pc-adm.", comandos: ["sudo ip netns exec pc-adm dig @10.10.20.53 intranet.dpe.example +short"], saida: ["srv.dpe.example.", "10.10.20.53"] },
      ],
      sucesso: ["pc-adm recebe endereço do âmbito 10.10.10.100–199, porta 10.10.10.1 e DNS 10.10.20.53.", "intranet.dpe.example resolve para 10.10.20.53.", "named-checkzone devolve OK."],
      reversao: ["sudo pkill kea-dhcp4; sudo pkill named; rm -rf /tmp/bind /tmp/kea-dpe.json /tmp/kea-leases4.csv", "sudo ip netns exec pc-adm dhclient -r pc-adm-r1; sudo ip -n pc-adm addr add 10.10.10.10/24 dev pc-adm-r1; sudo ip -n pc-adm route replace default via 10.10.10.1"],
    },
    papel: [
      { tarefa: "Ordene e explique as mensagens DORA.", esperado: "DISCOVER (cliente procura servidor, difusão), OFFER (servidor propõe endereço), REQUEST (cliente aceita), ACK (servidor confirma a concessão)." },
      { tarefa: "Porque o âmbito começa em .100 e não em .2?", esperado: "Reserva .1–.99 para porta de ligação, impressoras e equipamentos com endereço fixo ou reservado, evitando colisões." },
      { tarefa: "Alterou-se a zona mas os clientes não vêem o novo registo. O que verificar?", esperado: "Se o número de série aumentou; se a zona foi recarregada (rndc reload ou reinício); se as caches ainda têm o valor antigo (TTL)." },
    ],
    formativas: [
      { pergunta: "Porque um servidor DHCP central precisa de relay nas outras VLAN?", opcoes: ["Por causa do DNS", "Porque a difusão DHCPDISCOVER não atravessa encaminhadores", "Porque o DHCP usa TCP", "Não precisa"], certa: 1, comentario: "O relay recebe a difusão na VLAN e reencaminha-a em unicast para o servidor, indicando de que rede veio." },
      { pergunta: "Qual o risco de um servidor DNS recursivo aberto à internet?", opcoes: ["Nenhum", "Pode ser usado em ataques de amplificação e envenenamento de cache", "Fica mais lento", "Apaga a zona"], certa: 1, comentario: "Por isso na prática usa-se recursion no no servidor autoritativo e limita-se o resolvedor aos clientes internos." },
    ],
    leituraFacil: ["O DHCP dá endereços automaticamente.", "O DNS troca nomes por números.", "Servidores e impressoras têm endereço fixo."],
    guiao: {
      conducao: ["0–20 min: DORA e registos DNS.", "20–65 min: prática Kea e BIND.", "65–70 min: formativas."],
      errosComuns: ["Esquecer o ponto final nos nomes completos da zona.", "Não aumentar o número de série."],
    },
    fontes: ["rfc2131", "rfc1034", "kea", "bind"],
  },

  "r-m05-l2": {
    objectivos: [
      "Configurar sincronização de tempo com chrony e explicar porque importa.",
      "Centralizar registos com rsyslog num servidor.",
      "Reconhecer os campos de um registo syslog (facilidade, gravidade, hora, anfitrião).",
    ],
    explicacao: [
      {
        titulo: "Sem hora certa não há investigação",
        paragrafos: [
          "Para reconstruir um incidente é preciso ordenar acontecimentos de vários equipamentos. Se os relógios diferem minutos, a sequência fica errada. Também certificados, autenticação por códigos temporários (TOTP) e Kerberos dependem da hora. Usa-se NTP: um ou dois servidores internos sincronizam com fontes fiáveis e todos os equipamentos sincronizam com eles.",
          "Registos locais perdem-se se o equipamento avariar ou for comprometido. Centralizá-los (syslog para 10.10.20.14) protege a evidência e facilita a análise. A retenção deve seguir a política da instituição e a legislação aplicável; registos podem conter dados pessoais e têm acesso restrito.",
        ],
      },
    ],
    caso: "Na análise de um acesso suspeito na DPE (fictícia), o registo do encaminhador diz 09:02 e o do servidor 08:47. Ninguém sabe o que aconteceu primeiro.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Servidor de registos: acrescentar endereço 10.10.20.14/24 ao srv."],
      passos: [
        { accao: "Veja o estado de sincronização do computador de prática (o chrony corre no sistema, não no espaço de nomes).", comandos: ["chronyc tracking", "chronyc sources -v"], saida: ["Reference ID    : C0000201 (ntp1.exemplo)", "Stratum         : 3", "System time     : 0.000021 seconds fast of NTP time", "Leap status     : Normal"] },
        { accao: "Configuração de um servidor NTP interno (excerto de /etc/chrony/chrony.conf para um servidor da DPE — só leitura nesta prática).", comandos: ["pool pool.ntp.org iburst maxsources 4", "allow 10.10.0.0/16", "local stratum 10", "makestep 1 3"] },
        { accao: "Servidor de registos: rsyslog a receber em UDP 514 dentro do srv.", comandos: ["sudo ip -n srv addr add 10.10.20.14/24 dev srv-r1", "sudo tee /tmp/rsyslog-srv.conf <<'EOF'", "module(load=\"imudp\")", "input(type=\"imudp\" address=\"10.10.20.14\" port=\"514\")", "template(name=\"PorAnfitriao\" type=\"string\" string=\"/tmp/registos/%HOSTNAME%.log\")", "*.* action(type=\"omfile\" dynaFile=\"PorAnfitriao\")", "EOF", "sudo mkdir -p /tmp/registos", "sudo ip netns exec srv rsyslogd -n -f /tmp/rsyslog-srv.conf -i /tmp/rsyslog-srv.pid &"] },
        { accao: "Envie um registo de teste a partir do r1 e confirme a chegada.", comandos: ["sudo ip netns exec r1 logger -n 10.10.20.14 -P 514 -d -t teste-dpe -p local0.warning 'Teste de registo centralizado'", "sudo cat /tmp/registos/*.log"], saida: ["2026-09-28T09:00:01+02:00 r1 teste-dpe: Teste de registo centralizado"] },
      ],
      sucesso: ["chronyc tracking mostra Leap status Normal.", "O registo de teste chega ao servidor com hora e origem."],
      reversao: ["sudo pkill -f rsyslog-srv.conf; sudo rm -rf /tmp/registos /tmp/rsyslog-srv.conf", "sudo ip -n srv addr del 10.10.20.14/24 dev srv-r1"],
    },
    papel: [
      { tarefa: "Explique porque o caso não se resolve sem NTP.", esperado: "Com 15 minutos de diferença não se sabe se o acesso ao servidor foi antes ou depois do evento no encaminhador; a sequência causal fica incerta." },
      { tarefa: "Decomponha <180>: facilidade e gravidade.", esperado: "180 = 22 × 8 + 4: facilidade 22 (local6), gravidade 4 (warning)." },
      { tarefa: "Duas regras de protecção dos registos centralizados.", esperado: "Acesso restrito a quem precisa e registado; retenção definida pela política e pela lei; integridade (cópias, envio em TLS quando disponível); hora sincronizada." },
    ],
    formativas: [
      { pergunta: "Porque se usam dois servidores NTP internos?", opcoes: ["Para ir mais rápido", "Para redundância e comparação de fontes", "Porque a lei obriga", "Para o DNS"], certa: 1, comentario: "Com uma só fonte, se ela falhar ou derivar, todos derivam juntos." },
      { pergunta: "Um atacante que entra num servidor apaga os registos locais. O que preserva a evidência?", opcoes: ["Reiniciar o servidor", "Registos enviados em tempo real para um servidor central protegido", "Mudar a senha", "Desligar o NTP"], certa: 1, comentario: "Os registos já enviados ficam fora do alcance do atacante, desde que o servidor central tenha acesso restrito." },
    ],
    leituraFacil: ["Todos os equipamentos devem ter a mesma hora.", "Os registos vão para um servidor central.", "Os registos são confidenciais."],
    guiao: {
      conducao: ["0–20 min: caso das horas diferentes.", "20–65 min: prática.", "65–75 min: formativas."],
      errosComuns: ["Deixar cada equipamento com a sua hora manual.", "Abrir o servidor de registos a todas as redes."],
    },
    fontes: ["rfc5905", "rfc5424", "chrony", "rsyslog", "nist80092"],
  },

  "r-m05-l3": {
    objectivos: [
      "Explicar latência, variação de latência (jitter), perda e débito.",
      "Relacionar os requisitos de voz, vídeo e dados com esses indicadores.",
      "Observar o efeito de atraso e perda simulados com tc netem.",
    ],
    explicacao: [
      {
        titulo: "O que é qualidade para cada aplicação",
        paragrafos: [
          "Latência é o tempo de ida; jitter é a variação desse tempo; perda é a percentagem de pacotes que não chega; débito é a quantidade de dados por segundo. Transferências de ficheiros toleram latência mas querem débito. Voz tolera pouco débito mas é sensível a latência, jitter e perda: referências práticas usadas na indústria apontam para latência de ida até cerca de 150 ms e perda inferior a 1% para boa qualidade.",
          "Qualidade de serviço (QoS) é o conjunto de técnicas para dar tratamento diferente a tráfego diferente quando há congestionamento: classificar, marcar, pôr em filas com prioridade e limitar. Não cria largura de banda: só decide quem espera. O módulo 10 aprofunda a marcação e o controlo de débito.",
        ],
      },
    ],
    caso: "Na delegação da DPE (fictícia), as videochamadas com a sede cortam à tarde, quando se enviam relatórios grandes.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Rotas estáticas entre sede e delegação (módulo 3, lição 1)."],
      passos: [
        { accao: "Ponha as rotas e meça a latência de base.", comandos: ["sudo ip -n r1 route add 10.20.10.0/24 via 10.255.0.2; sudo ip -n r2 route add 10.10.0.0/16 via 10.255.0.1", "sudo ip netns exec pc-del ping -c 10 -q 10.10.20.53"], saida: ["10 packets transmitted, 10 received, 0% packet loss", "rtt min/avg/max/mdev = 0.041/0.060/0.090/0.014 ms"] },
        { accao: "Simule a ligação da delegação: 80 ms de atraso com 20 ms de variação e 2% de perda.", comandos: ["sudo ip netns exec r2 tc qdisc add dev r2-r1 root netem delay 80ms 20ms loss 2%", "sudo ip netns exec pc-del ping -c 50 -q 10.10.20.53"], saida: ["50 packets transmitted, 49 received, 2% packet loss", "rtt min/avg/max/mdev = 61.2/80.9/101.7/11.4 ms"] },
        { accao: "Interprete: com esta ligação, uma chamada de voz tem qualidade aceitável? Justifique com os três indicadores." },
      ],
      sucesso: ["O formando lê latência média, variação (mdev) e perda.", "Relaciona com os requisitos de voz e propõe QoS ou mais capacidade."],
      reversao: ["sudo ip netns exec r2 tc qdisc del dev r2-r1 root", "sudo ip -n r1 route del 10.20.10.0/24; sudo ip -n r2 route del 10.10.0.0/16"],
    },
    papel: [
      { tarefa: "Com a saída do passo 2, avalie a voz.", esperado: "Latência de ida ~40 ms (metade de 80,9 ms de ida e volta), variação ~11 ms e 2% de perda: latência e variação razoáveis, perda acima do desejável. Qualidade degradada; tratar perda (congestionamento) e dar prioridade à voz." },
      { tarefa: "Explique o caso da tarde.", esperado: "Os relatórios enchem a ligação; as filas crescem, aumentando latência, jitter e perda para a videochamada. Solução: QoS (prioridade à voz/vídeo, limite às transferências) e/ou agendar envios." },
      { tarefa: "QoS aumenta a largura de banda?", esperado: "Não. Só reparte a existente quando há congestionamento." },
    ],
    formativas: [
      { pergunta: "Qual indicador é mais crítico para uma chamada de voz?", opcoes: ["Débito máximo", "Latência, jitter e perda", "Tamanho do disco", "Número de VLAN"], certa: 1, comentario: "A voz usa pouco débito, mas atrasos e perdas notam-se logo." },
      { pergunta: "O mdev no resultado do ping indica:", opcoes: ["A perda", "A variação da latência", "O débito", "O TTL"], certa: 1, comentario: "É uma medida da dispersão dos tempos, aproximação útil ao jitter." },
    ],
    leituraFacil: ["Atraso, variação e perda estragam as chamadas.", "Ficheiros grandes podem encher a ligação.", "QoS dá prioridade, não dá mais velocidade."],
    guiao: {
      conducao: ["0–20 min: indicadores com o exemplo de uma conversa por rádio.", "20–65 min: prática com netem.", "65–75 min: formativas."],
      errosComuns: ["Confundir ida e volta com ida.", "Esquecer de retirar o netem."],
    },
    fontes: ["iproute2", "rfc4594", "rfc3550"],
  },

  "r-m05-l4": {
    objectivos: [
      "Definir disponibilidade e calcular percentagens em tempo de indisponibilidade.",
      "Montar uma verificação periódica simples de serviços com script.",
      "Distinguir monitoria activa (sondas) de passiva (registos, contadores).",
    ],
    explicacao: [
      {
        titulo: "Medir para gerir",
        paragrafos: [
          "Disponibilidade = tempo em funcionamento / tempo total. 99% ao ano são cerca de 3 dias e 15 horas de paragem; 99,9% cerca de 8 horas e 46 minutos. Um objectivo só faz sentido se for medido da mesma maneira todos os meses e se houver definição do que conta como «indisponível».",
          "Monitoria activa envia sondas (ping, pedido HTTP, consulta DNS) e mede a resposta. Monitoria passiva recolhe contadores (SNMP, módulo 11) e registos. Ferramentas completas existem (várias gratuitas); aqui faz-se uma sonda mínima para perceber o princípio.",
        ],
      },
    ],
    caso: "A direcção da DPE (fictícia) pergunta «quanto tempo o portal esteve em baixo no mês passado?» e ninguém sabe responder.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Servidor web de teste no srv; sonda corre no pc-adm (futuro servidor de monitorização 10.10.20.16)."],
      passos: [
        { accao: "Ponha o serviço e a sonda.", comandos: ["sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53 &", "cat > /tmp/sonda.sh <<'EOF'", "#!/bin/sh", "# sonda.sh — regista uma linha por minuto: data;alvo;estado;ms", "alvo=http://10.10.20.53/", "while true; do", "  t0=$(date +%s%3N)", "  if python3 -c \"import urllib.request as u; u.urlopen('$alvo', timeout=3)\" 2>/dev/null; then e=OK; else e=FALHA; fi", "  echo \"$(date -Is);$alvo;$e;$(( $(date +%s%3N) - t0 ))\" >> /tmp/sonda.csv", "  sleep 60", "done", "EOF", "chmod +x /tmp/sonda.sh; sudo ip netns exec pc-adm /tmp/sonda.sh &"] },
        { accao: "Provoque uma paragem de 3 minutos e reponha.", comandos: ["sudo pkill -f 'http.server 80'; sleep 180; sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53 &"] },
        { accao: "Calcule a disponibilidade do período.", comandos: ["awk -F';' '{t++; if($3==\"OK\") ok++} END {printf \"%d amostras, %.1f%% disponível\\n\", t, 100*ok/t}' /tmp/sonda.csv"], saida: ["10 amostras, 70.0% disponível"] },
      ],
      sucesso: ["A sonda regista FALHA durante a paragem e OK depois.", "O formando calcula a disponibilidade e explica o limite da amostragem por minuto."],
      reversao: ["sudo pkill -f sonda.sh; sudo pkill -f 'http.server 80'; rm -f /tmp/sonda.sh /tmp/sonda.csv"],
    },
    papel: [
      { tarefa: "Quanto tempo de paragem permite 99,5% num mês de 30 dias?", esperado: "0,5% de 43 200 minutos = 216 minutos (3 h 36 min)." },
      { tarefa: "Porque a sonda por minuto não vê uma falha de 20 segundos?", esperado: "Amostragem: entre duas sondas a falha pode começar e acabar sem ser observada. Mais frequência dá mais precisão e mais carga." },
      { tarefa: "Defina «indisponível» para o portal da DPE.", esperado: "Ex.: a página inicial não responde com código 200 em menos de 3 segundos a partir da rede interna, em duas sondas seguidas." },
    ],
    formativas: [
      { pergunta: "99,9% de disponibilidade anual corresponde a cerca de:", opcoes: ["8 horas e 46 minutos de paragem", "3 dias", "1 minuto", "36 horas"], certa: 0, comentario: "0,1% de 8760 horas ≈ 8,76 horas." },
      { pergunta: "Qual é monitoria passiva?", opcoes: ["Enviar ping", "Ler contadores SNMP e registos", "Pedir uma página", "Consultar DNS"], certa: 1, comentario: "Passiva observa o que o equipamento já regista; activa gera um pedido de teste." },
    ],
    leituraFacil: ["Disponível quer dizer: está a funcionar.", "Uma sonda testa o serviço de minuto a minuto.", "Assim sabemos quanto tempo esteve parado."],
    guiao: {
      conducao: ["0–20 min: cálculo de percentagens.", "20–70 min: sonda e paragem provocada (enquanto espera, grupos fazem o papel).", "70–80 min: formativas."],
      errosComuns: ["Confundir 99,9% com «quase sempre».", "Deixar a sonda a correr."],
    },
    fontes: ["iproute2", "nistcsf"],
  },

  "r-m05-l5": {
    objectivos: [
      "Guardar configurações de equipamentos com data e controlo de versões (git).",
      "Restaurar uma configuração conhecida e verificar o resultado.",
      "Escrever um procedimento curto de recuperação.",
    ],
    explicacao: [
      {
        titulo: "Uma avaria de configuração recupera-se com a última cópia boa",
        paragrafos: [
          "Cada equipamento tem uma configuração que representa horas de trabalho. Deve haver cópia depois de cada alteração, guardada fora do equipamento, com data, autor e motivo. O git regista versões e permite ver diferenças (git diff) e voltar atrás. As cópias contêm segredos (chaves, senhas cifradas): guardam-se em repositório interno com acesso restrito, nunca em serviços públicos.",
          "Recuperação: 1) identificar a última versão boa; 2) comparar com a actual; 3) aplicar em janela aprovada; 4) verificar; 5) registar. Testar a recuperação periodicamente: uma cópia nunca restaurada é uma esperança, não uma garantia.",
        ],
      },
    ],
    caso: "Depois de uma alteração de firewall no r1 da DPE (fictícia), a delegação deixou de chegar ao servidor. Não havia cópia da configuração anterior.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Configuração nftables simples no r1 (tabela filter) guardada num repositório git local /tmp/configs."],
      passos: [
        { accao: "Aplique uma configuração inicial e guarde-a no git.", comandos: ["mkdir -p /tmp/configs && cd /tmp/configs && git init -q && git config user.name 'Tecnico Pratica' && git config user.email 'ti@dpe.example'", "sudo ip netns exec r1 nft add table inet filter", "sudo ip netns exec r1 nft 'add chain inet filter forward { type filter hook forward priority 0; policy accept; }'", "sudo ip netns exec r1 nft list ruleset > /tmp/configs/r1.nft && git add r1.nft && git commit -qm 'r1: configuração inicial aprovada'"] },
        { accao: "Faça uma alteração «infeliz» e guarde-a.", comandos: ["sudo ip netns exec r1 nft add rule inet filter forward ip saddr 10.20.10.0/24 drop", "sudo ip netns exec r1 nft list ruleset > /tmp/configs/r1.nft && git commit -qam 'r1: regra nova (pedido 123)'", "git diff HEAD~1 HEAD"], saida: ["+		ip saddr 10.20.10.0/24 drop"] },
        { accao: "Restaure a versão anterior e aplique.", comandos: ["git show HEAD~1:r1.nft > /tmp/r1-bom.nft", "sudo ip netns exec r1 nft flush ruleset && sudo ip netns exec r1 nft -f /tmp/r1-bom.nft", "sudo ip netns exec r1 nft list ruleset | grep -c drop"], saida: ["0"] },
        { accao: "Guarde a reposição como nova versão (não se apaga o histórico).", comandos: ["sudo ip netns exec r1 nft list ruleset > /tmp/configs/r1.nft && git commit -qam 'r1: reposição da versão aprovada (incidente 7)' && git log --oneline"], saida: ["c3 r1: reposição da versão aprovada (incidente 7)", "b2 r1: regra nova (pedido 123)", "a1 r1: configuração inicial aprovada"] },
      ],
      sucesso: ["O histórico mostra as três versões com motivo.", "Depois da reposição não existe a regra drop e a delegação volta a comunicar (quando houver rotas)."],
      reversao: ["sudo ip netns exec r1 nft flush ruleset; rm -rf /tmp/configs /tmp/r1-bom.nft"],
    },
    papel: [
      { tarefa: "Escreva o procedimento de recuperação em 5 passos para o caso.", esperado: "1) Confirmar sintoma e hora da alteração; 2) obter a última versão aprovada do repositório; 3) comparar com a actual (diff); 4) aplicar a versão aprovada em janela autorizada; 5) verificar conectividade e registar no histórico e no relatório." },
      { tarefa: "Porque não se apaga a versão errada do histórico?", esperado: "O histórico é evidência do que aconteceu e ajuda a análise; a correcção é uma nova versão." },
      { tarefa: "Onde não guardar as cópias?", esperado: "Em repositórios públicos, em correio pessoal ou em pens sem cifra: contêm segredos e desenho da rede." },
    ],
    formativas: [
      { pergunta: "O que prova que uma cópia de configuração serve?", opcoes: ["Existir o ficheiro", "Ter sido restaurada e verificada em teste", "Ter data recente", "Ser grande"], certa: 1, comentario: "Só um teste de restauro prova que a cópia está completa e utilizável." },
      { pergunta: "Qual a vantagem do git para configurações?", opcoes: ["Cifra automaticamente", "Regista versões, autores e diferenças", "Substitui o firewall", "Faz cópias para a internet"], certa: 1, comentario: "O git não cifra; o repositório deve estar num local protegido." },
    ],
    leituraFacil: ["Guarde a configuração depois de cada mudança.", "Escreva quem mudou e porquê.", "Teste se consegue repor."],
    guiao: {
      conducao: ["0–20 min: caso sem cópia.", "20–70 min: prática git e nftables.", "70–80 min: formativas."],
      errosComuns: ["Guardar sem motivo na mensagem.", "Repor sem verificar."],
    },
    fontes: ["git", "nftables", "nist80034"],
  },

  // ───────────────────────── MÓDULO 6 — Introdução à Segurança ─────────────────────────
  "r-m06-l1": {
    objectivos: [
      "Distinguir activo, ameaça, vulnerabilidade, impacto e risco.",
      "Classificar riscos com uma matriz de probabilidade × impacto.",
      "Propor controlos proporcionais e registar o risco residual.",
    ],
    explicacao: [
      {
        titulo: "Vocabulário",
        paragrafos: [
          "Activo é o que tem valor (servidor de processos, base de dados de funcionários, a própria ligação à internet). Ameaça é o que pode causar dano (pessoa mal-intencionada, falha eléctrica, erro humano). Vulnerabilidade é a fraqueza que a ameaça aproveita (serviço desactualizado, senha fraca, falta de UPS). Risco combina a probabilidade de a ameaça explorar a vulnerabilidade e o impacto se isso acontecer.",
          "Tratar o risco: reduzir (controlos), transferir (contrato, seguro), evitar (não fazer a actividade) ou aceitar formalmente. O risco que sobra depois dos controlos é o residual e deve ser aceite por quem tem autoridade, não pelo técnico sozinho. Guias como NIST SP 800-30 e o NIST CSF 2.0 dão estrutura a este trabalho.",
        ],
      },
    ],
    caso: "Inventário parcial da DPE (fictícia): servidor de ficheiros com sistema sem actualizações há 18 meses; comutador central sem UPS; portal publicado na internet; senhas de administração iguais em todos os equipamentos.",
    pratica: {
      topologia: ["Exercício de análise (sem rede). Uma folha de cálculo ou papel com a matriz 3 × 3 (baixo/médio/alto)."],
      passos: [
        { accao: "Construa o registo de riscos em CSV (abre em qualquer folha de cálculo).", comandos: ["cat > /tmp/riscos.csv <<'EOF'", "id;activo;ameaca;vulnerabilidade;prob(1-3);impacto(1-3);risco;controlo;dono;residual", "R1;servidor de ficheiros;código malicioso;sistema sem actualizações;3;3;9;actualizar e segmentar;chefe TI;", "R2;comutador central;corte de energia;sem UPS;2;3;6;UPS e procedimento;chefe TI;", "EOF", "column -s';' -t /tmp/riscos.csv"] },
        { accao: "Complete R3 (portal) e R4 (senhas iguais), calcule o risco (prob × impacto) e ordene do maior para o menor." },
      ],
      sucesso: ["Quatro riscos completos, ordenados, cada um com controlo proporcional e dono.", "Pelo menos um risco com proposta de aceitação formal do residual."],
      reversao: ["rm -f /tmp/riscos.csv"],
    },
    papel: [
      { tarefa: "Complete R3 e R4.", esperado: "R3: portal / exploração de falha web / exposição à internet e possível desactualização / prob 2–3 / impacto 3 / risco 6–9 / actualizações, firewall, monitorização, cópias. R4: todos os equipamentos / roubo de uma senha / senha reutilizada / prob 2 / impacto 3 / risco 6 / senhas únicas em cofre, MFA onde possível, contas nominais." },
      { tarefa: "Classifique: «sistema sem actualizações» é ameaça ou vulnerabilidade?", esperado: "Vulnerabilidade. A ameaça é quem ou o que a pode explorar." },
      { tarefa: "Quem aceita o risco residual?", esperado: "O responsável do activo com autoridade (por exemplo, a direcção), com registo; o técnico propõe e informa." },
    ],
    formativas: [
      { pergunta: "O risco depende de:", opcoes: ["Só da ameaça", "Probabilidade e impacto", "Só do custo do equipamento", "Do número de VLAN"], certa: 1, comentario: "Uma ameaça provável com impacto pequeno pode ser menos prioritária que uma rara com impacto enorme." },
      { pergunta: "Qual é uma forma de tratar risco?", opcoes: ["Esconder", "Reduzir, transferir, evitar ou aceitar formalmente", "Ignorar sempre", "Apagar os registos"], certa: 1, comentario: "Aceitar é legítimo se for formal, informado e registado." },
    ],
    leituraFacil: ["Activo: o que tem valor.", "Vulnerabilidade: o ponto fraco.", "Risco: a chance de dano e o tamanho do dano."],
    guiao: {
      conducao: ["0–20 min: vocabulário com exemplos da instituição (fictícios).", "20–60 min: registo de riscos em grupos.", "60–70 min: formativas."],
      errosComuns: ["Confundir ameaça com vulnerabilidade.", "Técnico a aceitar risco em nome da direcção."],
    },
    fontes: ["nist80030", "nistcsf"],
  },

  "r-m06-l2": {
    objectivos: [
      "Reconhecer sinais de engenharia social por correio, telefone e presencial.",
      "Analisar cabeçalhos de uma mensagem suspeita (fictícia).",
      "Aplicar o procedimento de reporte sem clicar nem reencaminhar a colegas.",
    ],
    explicacao: [
      {
        titulo: "O alvo é a pessoa",
        paragrafos: [
          "A engenharia social explora confiança, urgência, medo ou autoridade: «sou do departamento de TI, preciso da sua senha agora», «a sua conta será suspensa hoje». Formas comuns: correio de phishing, mensagens em aplicações, chamadas telefónicas, pens deixadas à porta, alguém que entra atrás de um funcionário numa porta com cartão.",
          "Defesas: nenhuma equipa de TI pede senhas; confirmar pedidos invulgares por outro canal conhecido; não abrir anexos inesperados; reportar em vez de apagar. O técnico de redes contribui com filtros de correio, DNS e formação, mas a decisão final é da pessoa que recebe.",
        ],
      },
    ],
    caso: "Uma funcionária da DPE (fictícia) recebe mensagem «Tesouraria — pagamento de subsídio pendente» com ligação para confirmar dados bancários até às 12h.",
    pratica: {
      topologia: ["Mensagem fictícia em texto (formato .eml) para análise num editor de texto; não se abre em programa de correio nem se seguem ligações."],
      passos: [
        { accao: "Guarde e leia a mensagem fictícia só como texto.", comandos: ["cat > /tmp/suspeita.eml <<'EOF'", "Return-Path: <aviso@tesouraria-dpe-pagamentos.example>", "Received: from mail.envio-massivo.example (198.51.100.77) by mx.dpe.example", "From: \"Tesouraria DPE\" <tesouraria@dpe.example>", "Reply-To: pagamentos.urgente@correio-gratis.example", "Subject: URGENTE: subsídio pendente - confirme até às 12h", "Authentication-Results: mx.dpe.example; spf=fail smtp.mailfrom=tesouraria-dpe-pagamentos.example; dkim=none; dmarc=fail header.from=dpe.example", "", "Caro funcionário, confirme os seus dados bancários em http://dpe-pagamentos.example/login até às 12h ou perderá o subsídio.", "EOF", "grep -iE '^(From|Reply-To|Return-Path|Received|Authentication-Results):' /tmp/suspeita.eml"] },
        { accao: "Liste as incoerências entre os campos e escreva o reporte para a equipa de TI (modelo no papel)." },
      ],
      sucesso: ["Identificadas pelo menos cinco incoerências.", "O reporte não contém a ligação clicável (escrita com [.] em vez de ponto) e não é reencaminhado a colegas."],
      reversao: ["rm -f /tmp/suspeita.eml"],
    },
    papel: [
      { tarefa: "Liste os sinais de fraude.", esperado: "Urgência e ameaça; pedido de dados bancários; Reply-To para domínio de correio gratuito; Return-Path e servidor de envio diferentes do domínio da DPE; SPF e DMARC falhados; ligação para domínio que não é dpe.example." },
      { tarefa: "Escreva o reporte.", esperado: "«Recebi às 09:40 mensagem com assunto “URGENTE: subsídio pendente”, remetente aparente tesouraria@dpe.example, que pede dados bancários em dpe-pagamentos[.]example. Não cliquei nem respondi. Anexo a mensagem como ficheiro.» Enviado ao endereço de reporte de TI, sem reencaminhar a colegas." },
      { tarefa: "Um «técnico» telefona e pede a senha para «actualizar a conta». O que responder?", esperado: "Recusar; a TI nunca pede senhas; desligar e ligar para o número conhecido da TI para confirmar; reportar." },
    ],
    formativas: [
      { pergunta: "O «From» mostra tesouraria@dpe.example. Isso prova que é legítima?", opcoes: ["Sim", "Não, o campo pode ser falsificado; ver autenticação e outros cabeçalhos", "Só se tiver logótipo", "Sim, se vier de manhã"], certa: 1, comentario: "O remetente visível é fácil de imitar; SPF, DKIM e DMARC e o caminho de entrega dão melhores pistas." },
      { pergunta: "Clicou por engano numa ligação suspeita. O que fazer primeiro?", opcoes: ["Esconder", "Reportar de imediato à TI e, se introduziu a senha, mudá-la a partir de um canal seguro", "Apagar a mensagem", "Desligar a internet do edifício"], certa: 1, comentario: "Rapidez no reporte reduz o dano. Culpabilizar faz as pessoas esconder; a cultura deve incentivar o reporte." },
    ],
    leituraFacil: ["Desconfie de pressa e ameaças.", "A TI nunca pede a sua senha.", "Reporte sem clicar."],
    guiao: {
      conducao: ["0–20 min: exemplos (fictícios) de mensagens e chamadas.", "20–65 min: análise da mensagem e reporte.", "65–75 min: formativas."],
      errosComuns: ["Reencaminhar a mensagem a colegas «para avisar».", "Abrir a ligação «só para ver»."],
    },
    fontes: ["nist80061", "nistcsf"],
  },

  "r-m06-l3": {
    objectivos: [
      "Aplicar boas práticas de palavras-passe segundo NIST SP 800-63B.",
      "Explicar autenticação multifactor e o funcionamento de TOTP.",
      "Separar contas de uso diário das contas de administração.",
    ],
    explicacao: [
      {
        titulo: "Senhas que resistem",
        paragrafos: [
          "Orientações actuais (NIST SP 800-63B): preferir frases longas a regras de complexidade arbitrárias; comparar com listas de senhas comprometidas; não obrigar a mudanças periódicas sem motivo, mas mudar logo que haja suspeita; limitar tentativas; nunca guardar em texto claro. Um gestor de senhas aprovado pela instituição ajuda a ter senhas únicas.",
          "MFA combina algo que se sabe (senha), algo que se tem (telemóvel, chave física) e algo que se é (biometria). TOTP (RFC 6238) gera um código de 6 dígitos a partir de um segredo partilhado e da hora actual, mudando a cada 30 segundos. Chaves físicas resistem melhor ao phishing que códigos. Administradores usam conta nominal separada, com MFA, só para administração.",
        ],
      },
    ],
    caso: "Na DPE (fictícia), todos os técnicos entram nos equipamentos com a conta «admin» e a mesma senha, que está num papel colado ao monitor.",
    pratica: {
      topologia: ["Só o computador de prática, sem rede. Implementação TOTP didáctica com a biblioteca padrão do Python (não é para uso em produção)."],
      passos: [
        { accao: "Crie o gerador TOTP didáctico conforme a RFC 6238 (HMAC-SHA1, 30 s, 6 dígitos).", comandos: ["cat > /tmp/totp.py <<'EOF'", "import base64, hmac, hashlib, struct, time, sys", "def totp(segredo_b32, t=None, passo=30, digitos=6):", "    k = base64.b32decode(segredo_b32)", "    c = int((time.time() if t is None else t) // passo)", "    h = hmac.new(k, struct.pack('>Q', c), hashlib.sha1).digest()", "    o = h[-1] & 0x0F", "    n = (struct.unpack('>I', h[o:o+4])[0] & 0x7FFFFFFF) % 10**digitos", "    return str(n).zfill(digitos)", "# Vector de teste da RFC 6238 (segredo ASCII '12345678901234567890', t=59) deve dar 287082", "print(totp(base64.b32encode(b'12345678901234567890').decode(), t=59))", "print(totp('JBSWY3DPEHPK3PXP'))  # segredo de prática, fictício", "EOF", "python3 /tmp/totp.py"], saida: ["287082", "(um código de 6 dígitos que muda a cada 30 segundos)"] },
        { accao: "Verifique a força relativa de duas senhas pelo número de combinações (cálculo, não medição).", comandos: ["python3 -c \"import math; print(round(8*math.log2(94)), 'bits para 8 caracteres aleatórios'); print(round(5*math.log2(7776)), 'bits para 5 palavras aleatórias de uma lista de 7776')\""], saida: ["52 bits para 8 caracteres aleatórios", "65 bits para 5 palavras aleatórias de uma lista de 7776"] },
      ],
      sucesso: ["O vector da RFC dá 287082 (prova de que a implementação está conforme).", "O formando explica porque o código muda e porque depende da hora certa (módulo 5)."],
      reversao: ["rm -f /tmp/totp.py"],
    },
    papel: [
      { tarefa: "Proponha a correcção do caso.", esperado: "Contas nominais por técnico; senhas únicas e longas guardadas em cofre/gestor aprovado; MFA para administração; desactivar ou renomear a conta genérica «admin»; retirar o papel; registo de quem acede." },
      { tarefa: "Porque o TOTP falha se o relógio do telemóvel estiver 2 minutos atrasado?", esperado: "O código depende do intervalo de 30 s actual; com 2 minutos de diferença cliente e servidor calculam intervalos diferentes (os servidores só toleram pequena margem)." },
      { tarefa: "Frase-passe ou senha curta complexa: qual e porquê?", esperado: "Frase longa com palavras aleatórias: mais combinações e mais fácil de lembrar, se não for uma frase conhecida." },
    ],
    formativas: [
      { pergunta: "Segundo o NIST SP 800-63B, forçar mudança de senha a cada 30 dias sem motivo é:", opcoes: ["Recomendado", "Desaconselhado; mudar quando há indício de comprometimento", "Obrigatório", "Irrelevante"], certa: 1, comentario: "Mudanças forçadas levam a senhas previsíveis (Maio2026!, Junho2026!)." },
      { pergunta: "Qual factor resiste melhor ao phishing?", opcoes: ["Código por SMS", "Chave física FIDO2 ligada ao domínio", "Pergunta secreta", "Senha longa"], certa: 1, comentario: "A chave física só responde ao sítio verdadeiro; um código pode ser escrito numa página falsa." },
    ],
    leituraFacil: ["Use frases longas e diferentes em cada sítio.", "Use um segundo factor, como um código no telemóvel.", "Cada técnico tem a sua conta."],
    guiao: {
      conducao: ["0–20 min: mitos das senhas.", "20–65 min: TOTP e cálculos.", "65–75 min: formativas."],
      errosComuns: ["Achar que complexidade curta vence comprimento.", "Partilhar o segredo TOTP por mensagem."],
    },
    fontes: ["nist80063", "rfc6238", "python"],
  },

  "r-m06-l4": {
    objectivos: [
      "Organizar a gestão de actualizações: inventário, prioridade, teste, aplicação, verificação.",
      "Verificar actualizações pendentes num sistema Debian.",
      "Proteger equipamentos: serviços mínimos, cópias antes de actualizar, plano de reversão.",
    ],
    explicacao: [
      {
        titulo: "Actualizar é gerir risco",
        paragrafos: [
          "Muitos ataques exploram falhas já corrigidas pelos fabricantes. Gerir actualizações (NIST SP 800-40) começa pelo inventário (o que existe e que versão tem), segue para a prioridade (falha explorada activamente? equipamento exposto?), o teste num equipamento representativo, a aplicação numa janela combinada, a verificação e o registo.",
          "Equipamentos de rede também têm firmware com falhas. Antes de actualizar, guarda-se a configuração (módulo 5) e define-se como voltar atrás. Equipamentos sem suporte do fabricante (fim de vida) tornam-se um risco a registar e substituir.",
        ],
      },
    ],
    caso: "A DPE (fictícia) tem 3 servidores Debian, 12 comutadores de duas gerações e um encaminhador cujo fabricante anunciou fim de suporte. Pede-se um plano mensal.",
    pratica: {
      topologia: ["O próprio computador de prática Debian 12 (comandos só de leitura, excepto se o formador autorizar a actualização)."],
      passos: [
        { accao: "Actualize a lista de pacotes e veja o que está pendente.", comandos: ["sudo apt update", "apt list --upgradable 2>/dev/null | head"], saida: ["Listing...", "openssl/stable-security 3.0.x-deb12uY amd64 [upgradable from: 3.0.x-deb12uX]", "(versões ilustrativas)"] },
        { accao: "Veja a origem de uma actualização e o registo de alterações (changelog) antes de decidir.", comandos: ["apt-cache policy openssl", "apt changelog openssl | head -n 20"] },
        { accao: "Liste serviços à escuta e identifique os desnecessários.", comandos: ["sudo ss -ltnup"] },
        { accao: "Registe no plano: data, pacote, motivo, teste feito, janela, resultado, reversão." },
      ],
      sucesso: ["Lista de pendentes lida e classificada (segurança ou não).", "Plano mensal com as cinco etapas e o encaminhador em fim de vida registado como risco."],
      reversao: ["Não houve alteração (só leitura). Se o formador autorizou actualizar: o registo de /var/log/apt/history.log mostra o que mudou."],
    },
    papel: [
      { tarefa: "Escreva o plano mensal do caso.", esperado: "Semana 1: inventário e leitura dos avisos de segurança; semana 2: teste num servidor e num comutador de cada geração; semana 3: aplicação em janela aprovada, com cópia de configuração antes; semana 4: verificação e relatório. Encaminhador em fim de vida: registo de risco, controlos compensatórios (acesso de gestão restrito) e proposta de substituição." },
      { tarefa: "Uma falha crítica está a ser explorada activamente e afecta o portal publicado. Espera-se pela janela mensal?", esperado: "Não. Aplica-se o procedimento de urgência: mitigar ou actualizar logo, com aprovação rápida e registo." },
      { tarefa: "Porque desligar serviços não usados?", esperado: "Cada serviço à escuta é superfície de ataque e precisa de actualizações; menos serviços, menos risco." },
    ],
    formativas: [
      { pergunta: "Qual o primeiro passo da gestão de actualizações?", opcoes: ["Actualizar tudo já", "Inventário do que existe e das versões", "Comprar equipamento novo", "Desligar a internet"], certa: 1, comentario: "Sem inventário não se sabe o que está exposto nem o que falta actualizar." },
      { pergunta: "Um equipamento sem suporte do fabricante deve ser:", opcoes: ["Ignorado", "Registado como risco, isolado e com plano de substituição", "Exposto à internet", "Reiniciado todos os dias"], certa: 1, comentario: "Sem correcções futuras, o risco aumenta com o tempo." },
    ],
    leituraFacil: ["Saber o que temos.", "Testar antes de actualizar.", "Guardar a configuração e saber voltar atrás."],
    guiao: {
      conducao: ["0–20 min: ciclo de actualizações.", "20–65 min: prática e plano.", "65–80 min: formativas e discussão."],
      errosComuns: ["Actualizar em produção sem cópia.", "Esquecer firmware dos equipamentos de rede."],
    },
    fontes: ["nist80040", "debian"],
  },

  "r-m06-l5": {
    objectivos: [
      "Reconhecer o que é um incidente de segurança e o que não é.",
      "Fazer o reporte inicial com os factos mínimos e preservar evidências.",
      "Conhecer os primeiros passos de contenção sem destruir provas.",
    ],
    explicacao: [
      {
        titulo: "Os primeiros minutos contam",
        paragrafos: [
          "Incidente é um acontecimento que compromete, ou pode comprometer, a confidencialidade, integridade ou disponibilidade de informação ou serviços: conta usada por terceiros, código malicioso, fuga de dados, indisponibilidade provocada. O reporte inicial deve dizer: quem reporta, quando se detectou, o que se observou, que sistemas, o que já se fez. Não se especula; separa-se facto de hipótese.",
          "Preservar evidências: não desligar a correr um equipamento suspeito sem orientação (a memória perde-se); anotar horas; fotografar ecrãs; não apagar ficheiros nem mensagens. A contenção inicial pode ser isolar da rede (desligar o cabo ou mudar a porta para uma VLAN de quarentena), mantendo o equipamento ligado. O módulo 8 desenvolve a resposta completa.",
        ],
      },
    ],
    caso: "Às 10h15, o computador de um funcionário da DPE (fictícia) mostra uma mensagem a pedir pagamento para recuperar ficheiros. O funcionário liga ao técnico.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "pc-adm faz de computador afectado; VLAN de quarentena simulada retirando a rota por omissão e o endereço."],
      passos: [
        { accao: "Registe a hora de início e o estado de rede do equipamento antes de mexer.", comandos: ["date -Is | tee /tmp/incidente.txt", "sudo ip -n pc-adm -brief addr | tee -a /tmp/incidente.txt", "sudo ip netns exec pc-adm ss -tunp | tee -a /tmp/incidente.txt"] },
        { accao: "Isole da rede sem desligar o equipamento (simulação: interface desactivada).", comandos: ["sudo ip -n pc-adm link set pc-adm-r1 down", "echo \"$(date -Is) isolado da rede por (nome do técnico)\" | tee -a /tmp/incidente.txt"] },
        { accao: "Preencha o reporte inicial com factos (modelo no papel) e envie à equipa/coordenação de resposta conforme o procedimento da instituição." },
      ],
      sucesso: ["Evidências de estado recolhidas antes do isolamento.", "Equipamento isolado mas ligado.", "Reporte com factos, sem especulação."],
      reversao: ["sudo ip -n pc-adm link set pc-adm-r1 up", "rm -f /tmp/incidente.txt (na prática; num caso real o ficheiro é evidência e guarda-se)"],
    },
    papel: [
      { tarefa: "Preencha o reporte inicial do caso.", esperado: "Reporta: técnico X, 10h20. Detecção: 10h15 pelo utilizador. Observado: mensagem a pedir pagamento para recuperar ficheiros; ficheiros com extensão alterada. Sistemas: posto da Administração (nome/endereço). Acções: posto isolado da rede às 10h22, mantido ligado; nada apagado. Hipótese (a confirmar): código de sequestro de dados. Próximos passos: aguardar orientação da equipa de resposta." },
      { tarefa: "Porque não desligar logo o computador?", esperado: "Perdem-se evidências em memória (processos, ligações, possivelmente chaves); isolar da rede trava a propagação sem destruir provas." },
      { tarefa: "Isto é incidente? «O portal esteve lento 5 minutos durante uma actualização planeada.»", esperado: "Normalmente não é incidente de segurança (evento planeado); regista-se como evento operacional." },
    ],
    formativas: [
      { pergunta: "Qual é uma boa acção de contenção inicial?", opcoes: ["Formatar o disco", "Isolar o equipamento da rede mantendo-o ligado", "Pagar o resgate", "Apagar a mensagem"], certa: 1, comentario: "Isolar trava a propagação; formatar destrói provas; pagar não garante recuperação e alimenta o crime." },
      { pergunta: "O reporte inicial deve:", opcoes: ["Culpar alguém", "Descrever factos, horas, sistemas e acções já feitas", "Esperar ter todas as respostas", "Ser feito só no fim do dia"], certa: 1, comentario: "Rapidez e factos; as hipóteses ficam marcadas como tal." },
    ],
    leituraFacil: ["Se algo estranho acontecer, avise logo.", "Tire o cabo de rede, não desligue o computador.", "Escreva o que viu e a que horas."],
    guiao: {
      conducao: ["0–20 min: o que é e não é incidente.", "20–70 min: simulação e reporte.", "70–80 min: formativas."],
      errosComuns: ["Desligar o equipamento da corrente.", "Misturar suposições com factos."],
    },
    fontes: ["nist80061", "nistcsf", "lei102024"],
  },
};
