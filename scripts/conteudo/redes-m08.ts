/**
 * Curso de Redes — módulo 8 (Operação Segura e Resposta).
 * Conteúdo fictício e didáctico; ver regras em redes-base.ts.
 * Laboratórios NÃO executados neste ambiente: as saídas são exemplos didácticos.
 */
import { TOPOLOGIA_BASE, type ConteudoLicao } from "./redes-base";

export const LICOES_M08: Record<string, ConteudoLicao> = {
  "r-m08-l1": {
    objectivos: [
      "Definir o que é uma linha de base e que medidas a compõem.",
      "Recolher, durante um período curto, contagens de tráfego por protocolo e por par de endereços.",
      "Usar a linha de base para reconhecer um desvio.",
    ],
    explicacao: [
      {
        titulo: "O normal, escrito",
        paragrafos: [
          "Uma linha de base descreve o comportamento habitual da rede num período representativo: que equipamentos falam com quem, por que serviços, em que horas e com que volume. Sem ela, «tráfego estranho» é só impressão.",
          "Medidas úteis: débito por interface (hora a hora), protocolos mais frequentes, pares origem–destino mais activos, tempo de resposta dos serviços críticos, número de ligações novas por minuto. Regista-se também o que é normal mas raro (cópias de segurança nocturnas, actualizações ao fim do mês) para não gerar alarmes falsos.",
        ],
      },
    ],
    caso: "A DPE (fictícia) vai ligar alertas de volume anormal, mas ninguém sabe qual é o volume normal. Pede-se uma primeira linha de base de 5 minutos em ambiente de prática, como modelo para a medição real de uma semana.",
    pratica: {
      topologia: TOPOLOGIA_BASE,
      passos: [
        { accao: "Consola C: serviço de teste no srv (esperar «Serving HTTP»).", comandos: ["sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53"] },
        { accao: "Consola A: capture no r1, lado dos servidores, durante o período de medição.", comandos: ["sudo ip netns exec r1 tcpdump -ni r1-srv -w /tmp/base.pcap", "Esperar «listening on r1-srv» antes de gerar tráfego."] },
        { accao: "Consola B: gere tráfego «normal» — 30 pedidos web espaçados e 10 pings.", comandos: ["sudo ip netns exec pc-adm sh -c 'for i in $(seq 30); do python3 -c \"import urllib.request as u; u.urlopen(\\\"http://10.10.20.53/\\\")\"; sleep 5; done'", "sudo ip netns exec pc-adm ping -c 10 -i 2 10.10.20.53", "Depois, Ctrl+C na consola A."] },
        { accao: "Resuma a captura por protocolo e por conversa.", comandos: ["tshark -r /tmp/base.pcap -q -z io,phs", "tshark -r /tmp/base.pcap -q -z conv,ip"], saida: ["eth frames:~260 ... ip ... tcp frames:~240 ... http frames:60 ... icmp frames:20", "10.10.10.10 <-> 10.10.20.53  frames ~260  bytes ~110 kB"] },
      ],
      sucesso: ["A folha de linha de base tem: período, protocolos e percentagens, conversas principais, volume total.", "O formando indica duas limitações de uma medição de 5 minutos."],
      reversao: ["Ctrl+C na consola C", "rm -f /tmp/base.pcap"],
    },
    papel: [
      { tarefa: "Com a saída de exemplo, escreva a linha de base em quatro linhas.", esperado: "Período de 5 min; ~260 tramas; HTTP ~60 tramas e ICMP 20; uma única conversa relevante pc-adm ↔ srv; volume ~110 kB." },
      { tarefa: "Na semana seguinte aparecem 5000 tramas SMB entre pc-adm e 10.10.20.40 às 02h00. Qual é o primeiro passo?", esperado: "Verificar se é uma actividade conhecida (por exemplo cópia de segurança agendada) antes de tratar como incidente; se não for, abrir registo de evento." },
    ],
    formativas: [
      { pergunta: "Para que serve a linha de base?", opcoes: ["Para medir a velocidade máxima", "Para ter uma referência do normal e reconhecer desvios", "Para substituir a firewall", "Para apagar registos antigos"], certa: 1, comentario: "Sem referência não é possível dizer se um volume ou uma conversa é anormal." },
      { pergunta: "Porque uma medição de 5 minutos não chega para a linha de base real?", opcoes: ["Porque é ilegal", "Porque não inclui variações por hora, dia e fim de mês", "Porque o tshark falha", "Chega sempre"], certa: 1, comentario: "Usa-se um período representativo (uma semana ou mais) e registam-se actividades periódicas." },
    ],
    leituraFacil: ["Primeiro, anote como é a rede num dia normal.", "Depois, compare com o que vê agora.", "Diferença não quer dizer ataque: confirme."],
    guiao: {
      conducao: ["0–20 min: o que medir e porquê.", "20–60 min: prática e preenchimento da folha.", "60–70 min: formativas."],
      errosComuns: ["Confundir «raro» com «malicioso».", "Deixar a captura a correr e encher o disco."],
    },
    fontes: ["wireshark", "tcpdump", "nist80092"],
  },

  "r-m08-l2": {
    objectivos: [
      "Centralizar registos de vários equipamentos num servidor de prática.",
      "Filtrar registos por equipamento, gravidade e período.",
      "Relacionar eventos de fontes diferentes pela hora sincronizada.",
    ],
    explicacao: [
      {
        titulo: "Registos centralizados",
        paragrafos: [
          "Cada equipamento gera registos (syslog, RFC 5424) com data, anfitrião, aplicação, gravidade e mensagem. Guardados só no próprio equipamento, perdem-se se ele avariar ou for comprometido. Por isso enviam-se para um servidor central, com retenção definida, acesso restrito e hora sincronizada (NIST SP 800-92).",
          "Os registos contêm dados pessoais (utilizadores, endereços). O acesso é limitado a quem precisa, o período de retenção é aprovado e o tratamento respeita a Lei n.º 10/2024 e as regras internas da instituição.",
        ],
      },
    ],
    caso: "Após uma queixa de acesso indevido fictícia, a DPE precisa de juntar os registos da firewall do r1 e do servidor srv para o mesmo intervalo de 10 minutos.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Servidor de registos: rsyslog no srv em 10.10.20.14/24, UDP 514 (como no módulo 5, lição 2)."],
      passos: [
        { accao: "Prepare o recetor (repetir a configuração do módulo 5) numa consola F aberta.", comandos: ["sudo ip -n srv addr add 10.10.20.14/24 dev srv-r1", "sudo mkdir -p /tmp/registos", "sudo tee /tmp/rsyslog-srv.conf <<'EOF'", "module(load=\"imudp\")", "input(type=\"imudp\" address=\"10.10.20.14\" port=\"514\")", "template(name=\"PorAnfitriao\" type=\"string\" string=\"/tmp/registos/%HOSTNAME%.log\")", "*.* action(type=\"omfile\" dynaFile=\"PorAnfitriao\")", "EOF", "Consola F: sudo ip netns exec srv rsyslogd -n -f /tmp/rsyslog-srv.conf -i /tmp/rsyslog-srv.pid"] },
        { accao: "Envie eventos de teste de dois «equipamentos» com gravidades diferentes.", comandos: ["sudo ip netns exec r1 logger -n 10.10.20.14 -P 514 -d --rfc5424 -t firewall -p local0.warning --hostname r1 'DPE-recusa: IN=r1-r2 SRC=10.20.10.10 DST=10.10.20.53 DPT=22'", "sudo ip netns exec srv logger -n 10.10.20.14 -P 514 -d --rfc5424 -t sshd -p auth.info --hostname srv 'Connection closed by 10.20.10.10 port 51544'"] },
        { accao: "Filtre por equipamento e por endereço suspeito, e ordene pela hora.", comandos: ["ls /tmp/registos", "grep -h 10.20.10.10 /tmp/registos/*.log | sort"], saida: ["r1.log  srv.log", "2026-09-28T10:02:11+02:00 r1 firewall - DPE-recusa: IN=r1-r2 SRC=10.20.10.10 DST=10.10.20.53 DPT=22", "2026-09-28T10:02:14+02:00 srv sshd - Connection closed by 10.20.10.10 port 51544"] },
      ],
      sucesso: ["Há um ficheiro por equipamento.", "A linha do tempo junta os dois eventos na ordem certa.", "O formando explica porque a hora sincronizada é condição para esta análise."],
      reversao: ["Ctrl+C na consola F", "sudo rm -rf /tmp/registos /tmp/rsyslog-srv.conf", "sudo ip -n srv addr del 10.10.20.14/24 dev srv-r1"],
    },
    papel: [
      { tarefa: "Com as duas linhas de exemplo, escreva a linha do tempo e uma hipótese.", esperado: "10:02:11 firewall recusa SSH de 10.20.10.10 para o srv; 10:02:14 o srv regista ligação fechada da mesma origem. Hipótese: tentativa de SSH vinda da delegação; confirmar com o responsável e ver se a regra está correcta." },
      { tarefa: "Indique três regras de acesso ao servidor de registos.", esperado: "Só a equipa de TI autorizada lê; ninguém apaga ou altera (só acrescentar); retenção definida e aprovada; cópia protegida." },
    ],
    formativas: [
      { pergunta: "Porque se enviam registos para um servidor central?", opcoes: ["Para ocupar espaço", "Para não os perder se o equipamento falhar ou for comprometido, e para os correlacionar", "Porque o syslog o exige", "Para os publicar"], certa: 1, comentario: "Centralizar protege a prova e permite juntar eventos de fontes diferentes." },
      { pergunta: "Dois registos de equipamentos diferentes têm horas que não batem certo por 7 minutos. Causa mais provável?", opcoes: ["Ataque", "Relógios não sincronizados", "Cabo partido", "Firewall"], certa: 1, comentario: "Sem NTP, a linha do tempo fica errada; sincronizar a hora é pré-requisito." },
    ],
    leituraFacil: ["Todos os equipamentos enviam os registos para um só lugar.", "A hora tem de estar certa em todos.", "Só pessoas autorizadas lêem os registos."],
    guiao: {
      conducao: ["0–20 min: estrutura de uma linha syslog e gravidades.", "20–65 min: prática e linha do tempo.", "65–75 min: formativas."],
      errosComuns: ["Esquecer -d (UDP) no logger.", "Ignorar a protecção de dados pessoais nos registos."],
    },
    fontes: ["rfc5424", "rsyslog", "nist80092", "lei102024"],
  },

  "r-m08-l3": {
    objectivos: [
      "Reconhecer numa captura padrões de varrimento, volume anormal e resolução DNS invulgar.",
      "Separar facto observado de interpretação.",
      "Registar a análise de forma que outro técnico a possa repetir.",
    ],
    explicacao: [
      {
        titulo: "Padrões que merecem atenção",
        paragrafos: [
          "Varrimento: uma origem tenta muitas portas ou muitos endereços em pouco tempo, com muitas respostas RST ou sem resposta. Volume anormal: uma conversa muito acima da linha de base, sobretudo para fora da instituição. DNS invulgar: muitos nomes longos e aleatórios para o mesmo domínio.",
          "Cada padrão tem explicações legítimas (inventário de rede autorizado, cópia de segurança, actualização). A análise separa: o que a captura mostra (facto), o que isso pode significar (hipóteses) e o que falta verificar.",
        ],
      },
    ],
    caso: "A linha de base da DPE (fictícia) não tem tráfego da delegação para muitas portas do srv. Hoje o técnico recebeu um ficheiro de captura com esse comportamento.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Rotas sede–delegação estáticas, como no módulo 3."],
      passos: [
        { accao: "Prepare as rotas.", comandos: ["sudo ip -n r1 route add 10.20.10.0/24 via 10.255.0.2", "sudo ip -n r2 route add default via 10.255.0.1"] },
        { accao: "Consola A: capture no r1 (esperar «listening»).", comandos: ["sudo ip netns exec r1 tcpdump -ni r1-srv -w /tmp/anom.pcap 'tcp'"] },
        { accao: "Consola B: gere um varrimento didáctico de 30 portas no srv de prática e termine a captura.", comandos: ["sudo ip netns exec pc-del sh -c 'for p in $(seq 1 30); do timeout 1 bash -c \"</dev/tcp/10.10.20.53/$p\" 2>/dev/null; done'", "Ctrl+C na consola A."] },
        { accao: "Analise: número de SYN por origem, portas tentadas e respostas RST.", comandos: ["tshark -r /tmp/anom.pcap -Y 'tcp.flags.syn==1 && tcp.flags.ack==0' -T fields -e ip.src | sort | uniq -c", "tshark -r /tmp/anom.pcap -Y 'tcp.flags.syn==1 && tcp.flags.ack==0' -T fields -e tcp.dstport | sort -n | uniq | wc -l", "tshark -r /tmp/anom.pcap -Y 'tcp.flags.reset==1' | wc -l"], saida: ["     30 10.20.10.10", "30", "30"] },
      ],
      sucesso: ["Relatório com três secções: factos (30 SYN de 10.20.10.10 para 30 portas, 30 RST), hipóteses (varrimento; inventário autorizado), verificações pendentes.", "Os comandos usados estão no relatório."],
      reversao: ["sudo ip -n r1 route del 10.20.10.0/24 via 10.255.0.2; sudo ip -n r2 route del default via 10.255.0.1", "rm -f /tmp/anom.pcap"],
    },
    papel: [
      { tarefa: "Separe em «facto» e «interpretação»: «O pc-del atacou o servidor às 10h05 com 30 tentativas».", esperado: "Facto: às 10h05 houve 30 SYN de 10.20.10.10 para 30 portas do srv. Interpretação (a confirmar): tratar-se de ataque; pode ser inventário autorizado ou equipamento comprometido." },
      { tarefa: "Que três verificações faria a seguir?", esperado: "Perguntar à delegação se houve inventário autorizado; ver registos e processos do pc-del; comparar com alertas IDS e com a linha de base." },
    ],
    formativas: [
      { pergunta: "Muitos SYN para portas diferentes, respondidos com RST, indicam:", opcoes: ["Uma cópia de segurança", "Um possível varrimento de portas", "Uma falha de DNS", "Uma chamada de voz"], certa: 1, comentario: "RST é a resposta a portas fechadas; muitas tentativas em pouco tempo sugerem varrimento, que ainda tem de ser confirmado." },
      { pergunta: "Porque se incluem os comandos no relatório de análise?", opcoes: ["Para ficar maior", "Para que outro técnico possa repetir e verificar a análise", "Porque é obrigatório por lei", "Não se incluem"], certa: 1, comentario: "Uma análise repetível é mais fiável e aceite pela equipa e pela direcção." },
    ],
    leituraFacil: ["Procure o que foge ao normal.", "Escreva o que viu, separado do que acha.", "Confirme antes de acusar alguém."],
    guiao: {
      conducao: ["0–20 min: três padrões com exemplos de captura impressos.", "20–65 min: prática e relatório.", "65–75 min: formativas."],
      errosComuns: ["Escrever conclusões como factos.", "Varrer alvos fora da rede de prática — proibido."],
    },
    fontes: ["wireshark", "tcpdump", "nist80061"],
  },

  "r-m08-l4": {
    objectivos: [
      "Aplicar as fases de resposta a incidentes (preparação, detecção e análise, contenção, erradicação, recuperação, lições aprendidas).",
      "Conter um equipamento suspeito na rede de prática preservando a prova.",
      "Comunicar o incidente aos papéis certos, com factos.",
    ],
    explicacao: [
      {
        titulo: "Fases e decisões",
        paragrafos: [
          "O NIST SP 800-61 Rev. 3 enquadra a resposta nas funções do NIST CSF 2.0 (identificar, proteger, detectar, responder, recuperar, governar). Na prática, a equipa percorre: confirmar o incidente; conter (isolar sem destruir prova); erradicar a causa; recuperar o serviço e verificar; registar lições.",
          "Conter não é desligar tudo. Isolar pela rede (regra na firewall, porta em VLAN de quarentena) mantém o equipamento ligado e a memória intacta para análise. Cada acção fica no registo de incidente com hora, autor e motivo. Comunicação: responsável de TI, direcção e, quando aplicável, as entidades previstas no plano institucional.",
        ],
      },
    ],
    caso: "Confirmado (em exercício) que o pc-del da delegação fictícia da DPE está a varrer a sede. A direcção pede contenção imediata sem perder a prova.",
    pratica: {
      topologia: [...TOPOLOGIA_BASE, "Rotas sede–delegação estáticas."],
      passos: [
        { accao: "Abra o registo do incidente (papel ou ficheiro) com: número, hora de início, quem detectou, factos.", comandos: ["cat > /tmp/incidente-07.txt <<'EOF'", "Incidente 07 (exercicio) — aberto 2026-09-28 10:10 por tecnico A", "Factos: 30 SYN de 10.20.10.10 para o srv em 1 min (captura anom.pcap)", "EOF"] },
        { accao: "Prepare as rotas e confirme que o pc-del alcança a sede.", comandos: ["sudo ip -n r1 route add 10.20.10.0/24 via 10.255.0.2", "sudo ip -n r2 route add default via 10.255.0.1", "sudo ip netns exec pc-del ping -c 1 -W 1 10.10.20.53"], saida: ["1 packets transmitted, 1 received"] },
        { accao: "Contenção: no r2, isole o pc-del de tudo excepto da gestão (para análise remota posterior).", comandos: ["sudo ip netns exec r2 nft add table inet quarentena", "sudo ip netns exec r2 nft 'add chain inet quarentena forward { type filter hook forward priority -10; policy accept; }'", "sudo ip netns exec r2 nft add rule inet quarentena forward ip saddr 10.20.10.10 ip daddr != 10.10.99.0/24 counter drop comment \\\"incidente 07\\\"", "echo \"$(date -Is) contencao: regra quarentena em r2 (tecnico A)\" >> /tmp/incidente-07.txt"] },
        { accao: "Verifique a contenção e que a restante delegação não foi afectada (neste lab só existe o pc-del: registe essa limitação).", comandos: ["sudo ip netns exec pc-del ping -c 1 -W 1 10.10.20.53", "sudo ip netns exec r2 nft list table inet quarentena"], saida: ["1 packets transmitted, 0 received", "ip saddr 10.20.10.10 ip daddr != 10.10.99.0/24 counter packets 1 bytes 84 drop comment \"incidente 07\""] },
      ],
      sucesso: ["O pc-del está isolado sem ter sido desligado.", "O registo do incidente tem cada acção com hora e autor.", "O formando indica a fase seguinte (erradicação) e quem deve ser informado."],
      reversao: ["sudo ip netns exec r2 nft delete table inet quarentena", "sudo ip -n r1 route del 10.20.10.0/24 via 10.255.0.2; sudo ip -n r2 route del default via 10.255.0.1", "rm -f /tmp/incidente-07.txt"],
    },
    papel: [
      { tarefa: "Ordene as acções: recuperar serviço; conter; lições aprendidas; confirmar incidente; erradicar.", esperado: "Confirmar incidente → conter → erradicar → recuperar serviço → lições aprendidas." },
      { tarefa: "Porque é preferível isolar pela rede a desligar o pc-del da corrente?", esperado: "Mantém a memória e os processos para análise; desligar pode apagar indícios voláteis." },
    ],
    formativas: [
      { pergunta: "Qual acção é de contenção?", opcoes: ["Reinstalar o sistema", "Isolar o equipamento numa quarentena de rede", "Escrever as lições aprendidas", "Comprar novo antivírus"], certa: 1, comentario: "Conter limita o dano; reinstalar é erradicação/recuperação e vem depois da análise." },
      { pergunta: "O que deve constar de cada entrada do registo do incidente?", opcoes: ["Só a conclusão", "Hora, autor, acção e motivo", "O nome do culpado", "Nada, para não deixar rasto"], certa: 1, comentario: "O registo permite reconstruir o que foi feito e porquê, e sustenta a comunicação à direcção." },
    ],
    leituraFacil: ["Primeiro confirme.", "Depois isole o computador, sem o desligar.", "Anote tudo: hora, quem fez, o quê."],
    guiao: {
      conducao: ["0–20 min: as fases, com um cartão por fase para ordenar em grupo.", "20–70 min: exercício de mesa + prática de contenção.", "70–80 min: formativas e mini-reunião de lições aprendidas."],
      errosComuns: ["Desligar o equipamento por reflexo.", "Divulgar suspeitas sobre pessoas antes de haver factos."],
    },
    fontes: ["nist80061", "nistcsf", "nftables"],
  },

  "r-m08-l5": {
    objectivos: [
      "Redigir um relatório de incidente com factos, cronologia, impacto e acções.",
      "Transformar lições aprendidas em alterações concretas com responsável e prazo.",
      "Actualizar um procedimento operacional normalizado (SOP) a partir do incidente.",
    ],
    explicacao: [
      {
        titulo: "Do incidente à melhoria",
        paragrafos: [
          "O relatório final responde: o que aconteceu, quando, como foi detectado, o que foi afectado, o que se fez, qual é o estado actual e o que muda. Escreve-se para leitores diferentes: resumo de uma página para a direcção, anexo técnico para a equipa.",
          "Lições aprendidas só valem se virarem acções: «criar regra de alerta para varrimentos», responsável, prazo, forma de verificar. Os SOP (procedimentos normalizados) são actualizados e versionados; o próximo técnico de piquete segue o procedimento em vez de improvisar.",
        ],
      },
    ],
    caso: "O incidente 07 (exercício) da DPE fictícia está encerrado. A direcção pede o relatório e as melhorias até ao fim da semana.",
    pratica: {
      topologia: ["Sem rede: trabalho com o registo do incidente 07 da lição anterior (ou o modelo abaixo) e um editor de texto ou papel."],
      passos: [
        { accao: "Crie o esqueleto do relatório.", comandos: ["cat > /tmp/relatorio-07.md <<'EOF'", "# Relatório do incidente 07 (exercício)", "## Resumo para a direcção (máx. 10 linhas)", "## Cronologia (hora — facto — fonte)", "## Impacto (serviços, pessoas, dados)", "## Acções realizadas (contenção, erradicação, recuperação)", "## Estado actual", "## Lições aprendidas e acções (acção — responsável — prazo — verificação)", "## Anexos técnicos (comandos, capturas, registos)", "EOF"] },
        { accao: "Preencha a cronologia a partir do registo, só com factos e fonte de cada linha.", comandos: ["sed -n '1,20p' /tmp/relatorio-07.md"] },
        { accao: "Actualize o SOP «Suspeita de varrimento interno» com os passos que funcionaram; versione-o.", comandos: ["mkdir -p /tmp/sop && cd /tmp/sop && git init -q && git config user.name 'Tecnico Pratica' && git config user.email 'ti@dpe.example'", "cat > /tmp/sop/varrimento.md <<'EOF'", "# SOP — Suspeita de varrimento interno (v2)", "1. Confirmar com captura e registos (comandos em anexo).", "2. Contactar responsável do equipamento/delegação.", "3. Se não autorizado: quarentena de rede (regra modelo em anexo), sem desligar.", "4. Abrir registo de incidente; informar responsável de TI.", "5. Após análise: erradicar, recuperar, verificar, relatório.", "EOF", "git add varrimento.md && git commit -qm 'SOP varrimento v2 (lições do incidente 07)' && git log --oneline"], saida: ["a1 SOP varrimento v2 (lições do incidente 07)"] },
      ],
      sucesso: ["Relatório com resumo compreensível por quem não é técnico.", "Pelo menos três acções com responsável, prazo e verificação.", "SOP versionado."],
      reversao: ["rm -rf /tmp/sop /tmp/relatorio-07.md"],
    },
    papel: [
      { tarefa: "Reescreva para a direcção: «SYN flood-like scan c/ 30 RST do 10.20.10.10, contido via nft no r2».", esperado: "«Um computador da delegação tentou ligar-se a 30 serviços do servidor da sede num minuto. Foi isolado da rede às 10h12 sem ser desligado, para análise. Os serviços da sede não foram interrompidos.»" },
      { tarefa: "Transforme a lição «demorámos a perceber» numa acção verificável.", esperado: "Exemplo: «Activar alerta IDS para mais de 10 SYN/10 s da mesma origem interna — responsável: técnico B — prazo: 15 dias — verificação: teste em rede de prática gera alerta»." },
    ],
    formativas: [
      { pergunta: "Qual é a melhor forma de registar uma lição aprendida?", opcoes: ["«Ter mais cuidado»", "Acção concreta com responsável, prazo e verificação", "Uma lista de culpados", "Não registar para não expor a equipa"], certa: 1, comentario: "Sem responsável e prazo, a lição não muda nada." },
      { pergunta: "Porque se versiona o SOP?", opcoes: ["Por estética", "Para saber o que mudou, quando e porquê, e poder voltar atrás", "Porque o git é obrigatório", "Para esconder versões"], certa: 1, comentario: "Versões permitem auditoria e evitam que duas cópias diferentes circulem." },
    ],
    leituraFacil: ["Depois do problema, escreva o que aconteceu.", "Diga o que vai mudar, quem faz e até quando.", "Actualize o procedimento para a próxima vez."],
    guiao: {
      conducao: ["0–20 min: estrutura do relatório e exemplos de frases claras.", "20–70 min: redacção em duplas e revisão cruzada.", "70–80 min: formativas."],
      errosComuns: ["Relatório só técnico, ilegível para a direcção.", "Acções vagas sem responsável."],
    },
    fontes: ["nist80061", "nistcsf", "git"],
  },
};
