/**
 * Curso de Redes — módulo 12 (Segurança Aplicada e Auditoria de Redes).
 * Conteúdo fictício e didáctico; ver regras em redes-base.ts.
 * Laboratórios NÃO executados neste ambiente: as saídas são exemplos didácticos,
 * não resultados medidos. Pré-requisito comum: rede DPE criada com lab-base.sh
 * (módulo 1, lição 1) numa máquina virtual Debian 12 descartável, após a
 * pré-verificação de nomes (lab-verificar.sh); rotas sede–delegação do módulo 3.
 * Pacotes adicionais deste módulo: nmap, nftables, python3, openssh-server,
 * openssh-client, git.
 * REGRA ABSOLUTA deste módulo: qualquer teste corre SÓ dentro dos espaços de
 * nomes da rede de prática (âmbito autorizado: 10.10.10.0/24, 10.10.20.0/24,
 * 10.20.10.0/24, 10.255.0.0/30 e 203.0.113.0/24, endereços reservados para
 * documentação pelos RFC 1918 e RFC 5737). Nunca contra endereços públicos,
 * contra a rede da instituição, nem a partir do sistema da VM fora dos espaços
 * de nomes. Todas as credenciais e chaves são fictícias e criadas na aula.
 * Nenhuma lição altera ou reinicia serviços do sistema da VM.
 */
import { TOPOLOGIA_BASE, type ConteudoLicao } from "./redes-base";

/** Pré-verificação e declaração de âmbito, comum às cinco lições. */
const PRE_M12 = {
  accao:
    "Pré-verificação e âmbito (não altera nada): confirme as ferramentas, a rede de prática e que a pasta do módulo está livre. Leia em voz alta a declaração de âmbito: «os testes desta aula só se aplicam aos espaços de nomes da rede de prática; qualquer outro endereço está fora do âmbito autorizado». Todos os comandos de teste começam por «ip netns exec <nome>»: um comando sem esse prefixo sairia da rede de prática e não deve ser executado.",
  comandos: [
    "for d in nmap nft python3 ssh ssh-keygen sshd git; do command -v $d >/dev/null || echo \"Em falta: $d\"; done",
    "ip netns list | grep -cE '^(pc-adm|srv|r1|r2|pc-del|isp)( |$)'",
    "sudo ip netns exec pc-adm ping -c 2 10.10.20.53 | tail -1",
    "test -e /tmp/dpe-m12 && echo 'ATENÇÃO: /tmp/dpe-m12 já existe' || echo 'pasta livre'",
  ],
  saida: ["(nenhuma linha «Em falta»)", "6", "rtt min/avg/max/mdev = 0.05/0.07/0.09/0.02 ms", "pasta livre"],
};

/** Regras de segmentação e controlo de acessos da lição 1 (nftables em r1). */
const NFT_ACESSOS = [
  "table inet m12acessos {",
  "  chain fwd {",
  "    type filter hook forward priority 0; policy drop;",
  "    ct state established,related accept",
  "    # gestão: só o posto de administração fala com o srv em SSH",
  "    iifname \"r1-pc-adm\" ip saddr 10.10.10.10 ip daddr 10.10.20.53 tcp dport 22 counter accept comment \"gestao-ssh\"",
  "    # utilizadores da delegação: só o serviço web do srv",
  "    iifname \"r1-r2\" ip saddr 10.20.10.0/24 ip daddr 10.10.20.53 tcp dport 80 counter accept comment \"delegacao-web\"",
  "    # diagnóstico: eco ICMP permitido de e para a rede de prática",
  "    icmp type { echo-request, echo-reply } counter accept comment \"diagnostico\"",
  "    counter comment \"recusado\"",
  "  }",
  "}",
];

const SCRIPT_VERIFICAR_R1 = `#!/bin/sh
# verificar-r1.sh — lista de verificação SÓ DE LEITURA do encaminhador r1 (rede de prática DPE).
# Uso: sudo sh verificar-r1.sh     Código de saída: 0 sem falhas, 1 com falhas, 2 erro de execução.
set -u
[ "$(id -u)" = 0 ] || { echo "ERRO: executar com sudo." >&2; exit 2; }
ip netns list | awk '{print $1}' | grep -qx r1 || { echo "ERRO: espaço de nomes r1 não existe." >&2; exit 2; }
falhas=0
verif() {  # descrição, valor obtido, valor esperado
  if [ "$2" = "$3" ]; then echo "OK     $1 ($2)"
  else echo "FALHA  $1 (obtido: $2; esperado: $3)"; falhas=$((falhas + 1)); fi
}
s() { ip netns exec r1 sysctl -n "$1" 2>/dev/null || echo "?"; }
verif "Filtro de caminho inverso, rp_filter (all)" "$(s net.ipv4.conf.all.rp_filter)" 1
verif "Não aceitar redirecções ICMP (all)" "$(s net.ipv4.conf.all.accept_redirects)" 0
verif "Não enviar redirecções ICMP (all)" "$(s net.ipv4.conf.all.send_redirects)" 0
verif "Não aceitar encaminhamento pela origem (all)" "$(s net.ipv4.conf.all.accept_source_route)" 0
verif "Serviços à escuta no r1 (TCP/UDP)" "$(ip netns exec r1 ss -Htuln | wc -l)" 0
pol=$(ip netns exec r1 nft list chain inet m12equip entrada 2>/dev/null | grep -o 'policy [a-z]*' || echo "sem-cadeia")
verif "Política da cadeia de entrada do r1" "$pol" "policy drop"
echo "Total de falhas: $falhas"
[ "$falhas" -eq 0 ]`.split("\n");

const NFT_EQUIP = [
  "table inet m12equip {",
  "  chain entrada {",
  "    type filter hook input priority 0; policy drop;",
  "    iifname \"lo\" accept",
  "    ct state established,related accept",
  "    icmp type { echo-request, destination-unreachable, time-exceeded } counter accept comment \"diagnostico\"",
  "    iifname \"r1-pc-adm\" ip saddr 10.10.10.10 tcp dport 22 counter accept comment \"gestao-ssh-futura\"",
  "    counter comment \"entrada-recusada\"",
  "  }",
  "}",
];

/** Autorização de teste (documento fictício preenchido na aula, antes de qualquer varrimento). */
const AUTORIZACAO = [
  "AUTORIZAÇÃO DE TESTE TÉCNICO (exercício de aula — documento fictício)",
  "Instituição: Direcção Provincial de Exemplo (DPE), fictícia.",
  "Âmbito autorizado: SÓ os espaços de nomes da rede de prática desta VM:",
  "  10.10.10.0/24, 10.10.20.0/24, 10.20.10.0/24, 10.255.0.0/30, 203.0.113.0/24.",
  "Fora do âmbito (proibido): qualquer outro endereço, a rede da instituição,",
  "  a Internet, e o sistema da VM fora dos espaços de nomes.",
  "Testes permitidos: descoberta de equipamentos e portas, identificação de",
  "  serviços e versões. NÃO permitido: exploração, ataques de negação de",
  "  serviço, tentativas de adivinhar palavras-passe, alteração de dados.",
  "Janela: durante esta sessão de formação, com o formador presente.",
  "Executantes: ____________________  Data: ____________",
  "Autoriza (formador/responsável): ____________________",
  "Confidencialidade: os resultados são do exercício, não se divulgam fora da",
  "  turma e são apagados no fim (VM descartável).",
];

/** Lista de verificação de auditoria (12 controlos), em CSV, preenchida na aula. */
const LISTA_AUDITORIA = [
  "id,controlo,fonte,como_verificar,evidencia_minima,resultado,observacao",
  "A01,Segmentação: negação por omissão no encaminhamento,NIST SP 800-41,ver política da cadeia forward,saída do nft com policy drop,,",
  "A02,Acesso de gestão limitado à origem autorizada,NIST SP 800-41,regra específica + teste negativo,contador da regra e saída do teste,,",
  "A03,Gestão por protocolo cifrado (sem telnet/HTTP de gestão),NIST SP 800-41,varrimento de portas do equipamento,ficheiro do varrimento,,",
  "A04,Autenticação administrativa sem palavra-passe partilhada,NIST SP 800-63B,config do serviço + tentativa recusada,config e mensagem de recusa,,",
  "A05,Serviços desnecessários desactivados,NIST SP 800-41,lista de portas à escuta no equipamento,saída de ss,,",
  "A06,Parâmetros de encaminhamento endurecidos,NIST SP 800-41,lista de verificação da lição 2,saída OK/FALHA,,",
  "A07,Registos enviados para receptor central,NIST SP 800-92,evento de teste visível no receptor,linha do registo,,",
  "A08,Hora sincronizada em todos os equipamentos,RFC 5905,comparar horas,saídas de data dos equipamentos,,",
  "A09,Monitorização com alerta definido e responsável,NIST SP 800-137,ficha do alerta,ficha com limiar e responsável,,",
  "A10,Configurações exportadas e versionadas,NIST SP 800-128,histórico de versões,registo com data e autor,,",
  "A11,Cópia de segurança com integridade e reposição testada,NIST SP 800-34,soma verificada e reposição,saída da verificação e da reposição,,",
  "A12,Inventário actualizado e sem credenciais,NIST SP 800-128,comparar inventário com recolha,CSV e lista de diferenças,,",
];

export const LICOES_M12: Record<string, ConteudoLicao> = {
  "r-m12-l1": {
    objectivos: [
      "Explicar controlo de acessos na rede: identidade, autorização por função, menor privilégio, negação por omissão e segmentação como camadas complementares.",
      "Escrever e aplicar, na rede de prática, um conjunto de regras nftables que só permite o que está autorizado, com contadores para evidência.",
      "Substituir a autenticação por palavra-passe num serviço SSH de prática por chave, e explicar o papel do segundo factor e da cifra na protecção de identidades.",
      "Recolher evidência de que uma regra funciona (contador, teste positivo e teste negativo) e distinguir «não consegui ligar» de «está bloqueado pela regra».",
    ],
    explicacao: [
      {
        titulo: "Quem, a quê e como",
        paragrafos: [
          "Controlo de acessos responde a três perguntas: quem é (identidade autenticada), a que pode aceder (autorização) e em que condições (rede, horário, equipamento). O menor privilégio dá a cada pessoa ou sistema apenas o necessário para a sua função, durante o tempo necessário. A negação por omissão inverte a lógica: tudo é recusado excepto o que está expressamente autorizado, o que torna os esquecimentos seguros em vez de perigosos.",
          "A segmentação (módulos 4 e 8) limita quem chega a quê ao nível da rede; a autenticação limita quem entra no serviço. São camadas diferentes: uma regra de firewall não sabe quem é a pessoa, só de onde vem o pacote; a autenticação não impede que alguém chegue à porta do serviço. O modelo de confiança zero (NIST SP 800-207) parte do princípio de que estar «dentro da rede» não é credencial.",
        ],
      },
      {
        titulo: "Identidades e provas",
        paragrafos: [
          "Palavras-passe sozinhas são o elo mais fraco: são reutilizadas, adivinhadas e experimentadas em massa. Chaves criptográficas para acesso administrativo (SSH) e um segundo factor para o acesso das pessoas reduzem muito o risco (NIST SP 800-63B; TOTP no RFC 6238). A cifra do canal protege as credenciais em trânsito; sem ela, qualquer captura na rede as revela (módulo 9, lição 2).",
          "Uma regra só está verificada quando há evidência: o teste que deve passar passa, o teste que deve falhar falha, e o contador da regra mostra os pacotes. Sem o teste negativo pode estar a funcionar por acaso; sem o contador não se sabe qual regra actuou. Um tempo de espera esgotado pode ser bloqueio, serviço parado ou rota em falta: confirma-se sempre com o contador ou com a captura.",
        ],
      },
    ],
    caso: "Na DPE (fictícia), qualquer computador da delegação chega a qualquer porta do servidor e a administração faz-se por SSH com palavra-passe partilhada entre três técnicos. O chefe aprova por escrito, para a rede de prática: a delegação só acede ao serviço web; a administração por SSH só a partir do posto de administração e só com chave; tudo o resto recusado, com registo. Todos os dados, chaves e endereços são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Âmbito autorizado: apenas os espaços de nomes acima. Nada fora deles.",
        "Serviços de prática no srv: servidor web (porto 80) e um servidor SSH próprio no porto 22, iniciado em primeiro plano com configuração e chaves criadas na aula em /tmp/dpe-m12/l1 (não é o SSH do sistema da VM).",
        "Regras: tabela nftables «m12acessos» no r1, criada e removida nesta lição.",
        "Nota sobre a VM de preparação: instalar openssh-server no Debian pode activar o serviço ssh do sistema, normalmente em todas as interfaces da VM. Não se presume: na preparação verifica-se só com leitura (systemctl is-active ssh; sudo ss -tlnp 'sport = :22'; sudo nft list ruleset) e regista-se na ficha da VM, com os pacotes instalados. Esta lição não altera nem reinicia esse serviço; o servidor de prática corre dentro do srv, com pilha de rede própria.",
      ],
      passos: [
        PRE_M12,
        { accao: "Prepare a pasta, as chaves do servidor SSH de prática e uma chave de utilizador para o pc-adm (frases de acesso vazias: são chaves descartáveis de aula, apagadas na reversão).", comandos: ["mkdir -p /tmp/dpe-m12/l1 && cd /tmp/dpe-m12/l1", "ssh-keygen -q -t ed25519 -f hospedeiro_ed25519 -N ''", "ssh-keygen -q -t ed25519 -f tecnico_ed25519 -C 'tecnico-pratica' -N ''", "cp tecnico_ed25519.pub authorized_keys", "chmod 600 hospedeiro_ed25519 tecnico_ed25519 authorized_keys"] },
        { accao: "Escreva a configuração do servidor SSH de prática (sem palavra-passe, só chave) e valide a sintaxe.", comandos: ["cat > sshd-pratica.conf <<'EOF'", "Port 22", "ListenAddress 10.10.20.53", "HostKey /tmp/dpe-m12/l1/hospedeiro_ed25519", "PidFile /tmp/dpe-m12/l1/sshd.pid", "PasswordAuthentication no", "KbdInteractiveAuthentication no", "PermitRootLogin prohibit-password", "PubkeyAuthentication yes", "AuthorizedKeysFile /tmp/dpe-m12/l1/authorized_keys", "LogLevel VERBOSE", "# StrictModes no: só na prática, porque os ficheiros ficam em /tmp (pasta partilhada) e o sshd recusaria o caminho; em produção manter StrictModes yes", "StrictModes no", "EOF", "test -d /run/sshd && echo '/run/sshd existe' || { sudo install -d -m 755 /run/sshd && echo '/run/sshd criado nesta lição' | tee /tmp/dpe-m12/l1/criado-run-sshd; }", "sudo /usr/sbin/sshd -t -f /tmp/dpe-m12/l1/sshd-pratica.conf && echo sintaxe-ok"], saida: ["/run/sshd existe", "sintaxe-ok"] },
        { accao: "Consolas C e D: servidor web e servidor SSH de prática, ambos em primeiro plano dentro do srv (esperar «Serving HTTP» e «Server listening on 10.10.20.53 port 22»).", comandos: ["C: sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53", "D: sudo ip netns exec srv /usr/sbin/sshd -D -e -f /tmp/dpe-m12/l1/sshd-pratica.conf"], saida: ["Serving HTTP on 10.10.20.53 port 80 …", "Server listening on 10.10.20.53 port 22."] },
        { accao: "Antes das regras: mostre que a delegação chega ao SSH do servidor (situação actual, indesejada). O objectivo é só ver que a porta responde.", comandos: ["sudo ip netns exec pc-del nmap -Pn -p 22,80 10.10.20.53"], saida: ["PORT   STATE SERVICE", "22/tcp open  ssh", "80/tcp open  http"] },
        { accao: "Aplique as regras de controlo de acessos no r1 (texto completo abaixo) e confirme que ficaram activas.", comandos: ["cat > /tmp/dpe-m12/l1/acessos.nft <<'EOF'", ...NFT_ACESSOS, "EOF", "sudo ip netns exec r1 nft -f /tmp/dpe-m12/l1/acessos.nft", "sudo ip netns exec r1 nft list table inet m12acessos | head -n 6"], saida: ["table inet m12acessos {", "  chain fwd {", "    type filter hook forward priority filter; policy drop;", "    ct state established,related accept", "    iifname \"r1-pc-adm\" ip saddr 10.10.10.10 ip daddr 10.10.20.53 tcp dport 22 counter packets 0 bytes 0 accept comment \"gestao-ssh\"", "    …"] },
        { accao: "Testes positivos (devem passar): web a partir da delegação; SSH com chave a partir do posto de administração.", comandos: ["sudo ip netns exec pc-del curl -s -o /dev/null -w '%{http_code}\\n' http://10.10.20.53/", "sudo ip netns exec pc-adm ssh -i /tmp/dpe-m12/l1/tecnico_ed25519 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/tmp/dpe-m12/l1/known_hosts $(id -un)@10.10.20.53 'echo ligado-com-chave'"], saida: ["200", "Warning: Permanently added '10.10.20.53' (ED25519) to the list of known hosts.", "ligado-com-chave"] },
        { accao: "Testes negativos (devem falhar): SSH a partir da delegação e SSH sem chave a partir do posto de administração.", comandos: ["sudo ip netns exec pc-del nmap -Pn -p 22 --host-timeout 20s 10.10.20.53", "sudo ip netns exec pc-adm ssh -o BatchMode=yes -o PreferredAuthentications=password -o PubkeyAuthentication=no -o StrictHostKeyChecking=no -o UserKnownHostsFile=/tmp/dpe-m12/l1/known_hosts $(id -un)@10.10.20.53 'echo nao-devia-aparecer'"], saida: ["22/tcp filtered ssh", "Permission denied (publickey)."] },
        { accao: "Evidência: contadores das regras. Confirme que o tempo esgotado do teste anterior corresponde à regra «recusado» e não a um serviço parado.", comandos: ["sudo ip netns exec r1 nft list table inet m12acessos | grep -E 'comment|counter'"], saida: ["… counter packets 4 bytes 320 accept comment \"gestao-ssh\"", "… counter packets 12 bytes 1440 accept comment \"delegacao-web\"", "… counter packets 6 bytes 504 accept comment \"diagnostico\"", "… counter packets 3 bytes 180 comment \"recusado\"", "(o contador «recusado» cresceu durante o teste negativo: é a evidência do bloqueio)"] },
        { accao: "Escreva a ficha de evidência: regra, teste positivo, teste negativo, contador antes e depois, data, quem executou e âmbito autorizado.", comandos: ["nano /tmp/dpe-m12/l1/evidencias.txt"] },
      ],
      sucesso: [
        "A delegação acede ao serviço web e não ao SSH; o posto de administração acede ao SSH só com chave.",
        "O acesso por palavra-passe é recusado com «Permission denied (publickey)».",
        "Cada regra tem teste positivo, teste negativo e contador registados na ficha de evidência.",
        "A dupla explica a diferença entre «filtered» (bloqueado antes de chegar) e «closed» (chegou, serviço não responde nessa porta).",
        "Nenhum comando foi executado fora dos espaços de nomes da rede de prática.",
      ],
      reversao: [
        "sudo ip netns exec r1 nft delete table inet m12acessos",
        "Ctrl+C nas consolas C (web) e D (SSH de prática). Não usar pkill/killall. Confirmar: sudo ip netns pids srv não lista python3 nem sshd.",
        "Se a pasta /run/sshd foi criada nesta lição (existe /tmp/dpe-m12/l1/criado-run-sshd) e o serviço ssh do sistema não estiver instalado, pode retirá-la com sudo rmdir /run/sshd; caso contrário, deixá-la.",
        "rm -r /tmp/dpe-m12/l1 (chaves descartáveis, configuração, regras e evidências; guardar antes o que for preciso).",
        "Verificar: sudo ip netns exec r1 nft list tables não mostra m12acessos; o serviço SSH do sistema da VM não foi tocado.",
      ],
    },
    papel: [
      { tarefa: "Escreva, por palavras, as quatro regras da política do caso, começando pela negação por omissão.", esperado: "1) Por omissão, recusar todo o encaminhamento. 2) Aceitar ligações já estabelecidas. 3) Aceitar SSH (porto 22) só de 10.10.10.10 para 10.10.20.53. 4) Aceitar web (porto 80) só de 10.20.10.0/24 para 10.10.20.53. Mais o eco ICMP para diagnóstico, com contador em todas." },
      { tarefa: "Com a saída de exemplo, diga o que prova cada evidência do teste negativo.", esperado: "«22/tcp filtered» mostra que o pacote não obteve resposta nem recusa: foi descartado no caminho. O contador «recusado» a subir 3 pacotes prova que foi a regra por omissão do r1, e não um serviço parado ou uma rota em falta." },
      { tarefa: "Um técnico pede acesso SSH ao servidor a partir da delegação «durante esta semana, para um trabalho». O que faz?", esperado: "Pedido escrito e aprovado com justificação, endereço de origem concreto, porto, prazo e reversão; regra específica com comentário e data; registo no controlo de alterações (módulo 11, lição 4); no fim do prazo, retirar a regra e confirmar com teste negativo. Nunca abrir a toda a rede da delegação nem sem prazo." },
      { tarefa: "Porque a chave SSH não substitui o segundo factor no acesso das pessoas aos sistemas?", esperado: "A chave protege o acesso administrativo ao equipamento, mas se o portátil do técnico for comprometido a chave vai com ele. Para as pessoas, o segundo factor (por exemplo um código temporário) acrescenta uma prova independente; para as chaves, protege-se o ficheiro com frase de acesso e limita-se a origem." },
    ],
    formativas: [
      { pergunta: "O que significa negação por omissão numa política de acessos?", opcoes: ["Recusar o acesso a quem falha a palavra-passe", "Recusar tudo o que não estiver expressamente autorizado", "Negar o acesso fora do horário", "Apagar as regras antigas"], certa: 1, comentario: "Com negação por omissão, um serviço esquecido fica inacessível (falha segura). Com permissão por omissão, o esquecimento deixa uma porta aberta." },
      { pergunta: "Um teste de porta devolveu «filtered» e o contador «recusado» subiu. O que se conclui?", opcoes: ["O serviço está avariado", "A regra de recusa do encaminhador bloqueou o pacote", "A rota está em falta", "A chave SSH expirou"], certa: 1, comentario: "O contador liga o resultado à regra concreta. Sem ele, «filtered» poderia ser rota em falta ou serviço parado; por isso o teste negativo vem sempre com evidência." },
    ],
    leituraFacil: [
      "Cada pessoa só deve aceder ao que precisa.",
      "Tudo o que não está autorizado fica bloqueado.",
      "A administração do servidor usa uma chave, não uma palavra-passe.",
      "Teste o que deve funcionar e o que não deve funcionar.",
      "Guarde a prova de cada teste.",
      "Só se testa a rede de prática da aula.",
    ],
    guiao: {
      conducao: [
        "0–20 min: identidade, autorização, menor privilégio e negação por omissão; segmentação e autenticação como camadas; chaves, segundo factor e cifra; o que é evidência.",
        "20–60 min: prática em duplas (chaves e SSH de prática, estado inicial, regras, testes positivos e negativos, contadores, ficha de evidência); quem não tiver laboratório escreve a política e interpreta as evidências em papel.",
        "60–70 min: formativas e correcção comentada; leitura em voz alta da declaração de âmbito.",
      ],
      errosComuns: [
        "Testar fora dos espaços de nomes da rede de prática.",
        "Fazer só o teste positivo e dar a regra por verificada.",
        "Concluir «bloqueado» a partir de um tempo esgotado, sem contador nem captura.",
        "Abrir uma regra à rede inteira quando basta um endereço, ou sem prazo.",
        "Esquecer de remover a tabela m12acessos no fim (as lições seguintes falhariam).",
      ],
    },
    fontes: ["nftables", "openssh", "rfc4253", "rfc6238", "nist80063", "nist800207", "nmap", "rfc1918", "rfc5737"],
  },

  "r-m12-l2": {
    objectivos: [
      "Explicar o endurecimento de equipamentos de rede: plano de gestão protegido, serviços mínimos, parâmetros seguros, credenciais únicas, registos centralizados, hora certa e actualizações.",
      "Verificar um encaminhador de prática com uma lista de verificação automática, só de leitura, que devolve OK/FALHA com o valor obtido e o esperado.",
      "Aplicar correcções justificadas (parâmetros do núcleo, retirada de serviço desnecessário, cadeia de entrada com negação por omissão) e repetir a verificação como reteste.",
      "Explicar a gestão de vulnerabilidades dos equipamentos: inventário de versões, avisos do fabricante, identificadores CVE e janelas de actualização.",
    ],
    explicacao: [
      {
        titulo: "Proteger o próprio equipamento",
        paragrafos: [
          "Um encaminhador ou comutador comprometido compromete toda a rede que passa por ele. Segurança desde a concepção significa começar pela configuração mínima: desligar serviços não usados (páginas web de gestão antigas, telnet, SNMP v1/v2c), permitir a gestão só a partir da rede de gestão e por protocolos cifrados (SSH, SNMPv3), trocar todas as credenciais de fábrica por credenciais únicas guardadas em cofre, enviar registos para o receptor central e sincronizar a hora (módulo 11).",
          "Há também parâmetros de encaminhamento a endurecer. O filtro de caminho inverso (rp_filter) descarta pacotes com endereço de origem impossível para a interface de entrada, dificultando a falsificação de origem; em redes com encaminhamento assimétrico pode descartar tráfego legítimo, por isso escolhe-se com conhecimento da topologia. Redirecções ICMP permitem a outro equipamento alterar a tabela de encaminhamento e normalmente desactivam-se num encaminhador. No Linux, para o rp_filter conta o maior valor entre «all» e o da interface; a lista desta lição verifica só «all», o que é uma simplificação declarada.",
        ],
      },
      {
        titulo: "Vulnerabilidades e actualizações",
        paragrafos: [
          "Os fabricantes publicam avisos de segurança; cada vulnerabilidade conhecida recebe um identificador CVE e, muitas vezes, uma pontuação CVSS que resume a gravidade técnica, não o risco na instituição. A gestão de actualizações (NIST SP 800-40) começa pelo inventário de modelos e versões (módulo 11, lição 1), acompanha os avisos, avalia a exposição de cada equipamento, testa, aplica numa janela aprovada com plano de reversão e confirma.",
          "Uma lista de verificação só vale se cada item tiver um valor esperado justificado, se correr sem alterar nada e se for repetida depois da correcção (reteste). Um OK significa «este item, neste momento, tem o valor esperado»; não significa que o equipamento esteja seguro em geral.",
        ],
      },
    ],
    caso: "Na DPE (fictícia), o encaminhador da sede (r1 na rede de prática) foi instalado há anos: tem uma página de gestão antiga sem cifra no porto 8080, parâmetros de fábrica e nenhuma protecção de entrada. O chefe aprova uma verificação e as correcções na rede de prática, para depois preparar a mudança real com pedido de alteração. Todos os dados são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Âmbito autorizado: apenas os espaços de nomes acima; alvo desta lição: o r1.",
        "Serviço desnecessário simulado: servidor web em primeiro plano no r1, porto 8080, iniciado pelo formador para representar a página de gestão antiga.",
        "Correcções: parâmetros sysctl dentro do espaço de nomes r1 (não afectam a VM) e tabela nftables «m12equip» no r1.",
        "Nota: esta lista pressupõe o r1 da rede base, sem FRR. Se o r1 correr FRR (módulos 3 e 5), há serviços à escuta legítimos: ajustar o valor esperado e justificá-lo.",
      ],
      passos: [
        PRE_M12,
        { accao: "Formador, consola F: inicie o serviço desnecessário simulado no r1 (esperar «Serving HTTP»).", comandos: ["F: sudo ip netns exec r1 python3 -m http.server 8080 --bind 0.0.0.0 --directory /usr/share/doc/nftables"], saida: ["Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ..."] },
        { accao: "Guarde os valores iniciais dos parâmetros (para poder repor) e grave a lista de verificação (texto completo abaixo).", comandos: ["mkdir -p /tmp/dpe-m12/l2 && cd /tmp/dpe-m12/l2", "for k in net.ipv4.conf.all.rp_filter net.ipv4.conf.all.accept_redirects net.ipv4.conf.all.send_redirects; do echo \"$k=$(sudo ip netns exec r1 sysctl -n $k)\"; done | tee valores-iniciais.txt", "cat > verificar-r1.sh <<'EOF'", ...SCRIPT_VERIFICAR_R1, "EOF"], saida: ["net.ipv4.conf.all.rp_filter=0", "net.ipv4.conf.all.accept_redirects=1", "net.ipv4.conf.all.send_redirects=1", "(os valores iniciais num espaço de nomes novo podem variar com a versão do núcleo; guarde os que vir)"] },
        { accao: "Verificação inicial (só leitura). Complete com a visão de um terceiro: o que o posto de administração vê aberto no r1.", comandos: ["sudo sh verificar-r1.sh; echo \"código=$?\"", "sudo ip netns exec pc-adm nmap -Pn -p 22,23,80,161,8080 10.10.10.1"], saida: ["FALHA  Filtro de caminho inverso, rp_filter (all) (obtido: 0; esperado: 1)", "FALHA  Não aceitar redirecções ICMP (all) (obtido: 1; esperado: 0)", "FALHA  Não enviar redirecções ICMP (all) (obtido: 1; esperado: 0)", "OK     Não aceitar encaminhamento pela origem (all) (0)", "FALHA  Serviços à escuta no r1 (TCP/UDP) (obtido: 1; esperado: 0)", "FALHA  Política da cadeia de entrada do r1 (obtido: sem-cadeia; esperado: policy drop)", "Total de falhas: 5", "código=1", "8080/tcp open  http-proxy", "22/tcp closed ssh  (e restantes closed)"] },
        { accao: "Classifique cada falha (gravidade, justificação, correcção) na folha de remediação antes de corrigir.", comandos: ["nano /tmp/dpe-m12/l2/remediacao.txt"] },
        { accao: "Correcções: parâmetros do núcleo no r1; retirada do serviço desnecessário (Ctrl+C na consola F); cadeia de entrada com negação por omissão (texto completo abaixo).", comandos: ["sudo ip netns exec r1 sysctl -w net.ipv4.conf.all.rp_filter=1 net.ipv4.conf.all.accept_redirects=0 net.ipv4.conf.all.send_redirects=0", "F: Ctrl+C", "cat > equip.nft <<'EOF'", ...NFT_EQUIP, "EOF", "sudo ip netns exec r1 nft -f equip.nft"], saida: ["net.ipv4.conf.all.rp_filter = 1", "net.ipv4.conf.all.accept_redirects = 0", "net.ipv4.conf.all.send_redirects = 0"] },
        { accao: "Reteste: a mesma lista e a mesma visão de terceiro. Confirme também que o encaminhamento continua a funcionar (a cadeia de entrada não afecta o tráfego que atravessa o r1).", comandos: ["sudo sh verificar-r1.sh; echo \"código=$?\"", "sudo ip netns exec pc-adm nmap -Pn -p 22,23,80,161,8080 10.10.10.1", "sudo ip netns exec pc-del ping -c 2 10.10.20.53 | tail -1"], saida: ["OK     Filtro de caminho inverso, rp_filter (all) (1)", "OK     Não aceitar redirecções ICMP (all) (0)", "OK     Não enviar redirecções ICMP (all) (0)", "OK     Não aceitar encaminhamento pela origem (all) (0)", "OK     Serviços à escuta no r1 (TCP/UDP) (0)", "OK     Política da cadeia de entrada do r1 (policy drop)", "Total de falhas: 0", "código=0", "8080/tcp filtered http-proxy  (e restantes filtered)", "rtt min/avg/max/mdev = 0.06/0.07/0.08/0.01 ms"] },
        { accao: "Exercício de vulnerabilidades (em papel, com dados fictícios): o inventário diz que o encaminhador real tem o sistema versão 4.2.1; o aviso fictício do fabricante DPE-SA-2026-07 afecta 4.0 a 4.2.3 na página de gestão web, corrigido em 4.2.4. Preencha a ficha de decisão.", comandos: ["nano /tmp/dpe-m12/l2/ficha-vulnerabilidade.txt"] },
      ],
      sucesso: [
        "A verificação inicial mostra 5 falhas com valor obtido e esperado; o reteste mostra 0 falhas e código 0.",
        "O visto de terceiro passa de 8080 «open» para «filtered», e o encaminhamento continua a funcionar.",
        "A folha de remediação tem, para cada falha, gravidade, justificação e correcção, preenchida antes de corrigir.",
        "A ficha de vulnerabilidade indica exposição, medida provisória (desligar a página de gestão), actualização numa janela aprovada e reteste.",
      ],
      reversao: [
        "sudo ip netns exec r1 nft delete table inet m12equip",
        "Repor os valores iniciais guardados, um a um: por exemplo sudo ip netns exec r1 sysctl -w net.ipv4.conf.all.rp_filter=0 (usar os valores de /tmp/dpe-m12/l2/valores-iniciais.txt).",
        "Confirmar que a consola F já não tem o servidor web (Ctrl+C feito) e que sudo ip netns pids r1 não lista python3.",
        "rm -r /tmp/dpe-m12/l2. Nada foi alterado fora do espaço de nomes r1.",
      ],
    },
    papel: [
      { tarefa: "Para cada falha da verificação inicial de exemplo, indique gravidade (alta/média/baixa), porquê e a correcção.", esperado: "Página de gestão sem cifra em 8080: alta (credenciais em claro, superfície de ataque) — retirar o serviço. Sem cadeia de entrada: alta — negação por omissão com excepções para diagnóstico e gestão. rp_filter 0: média — activar, confirmando que não há encaminhamento assimétrico. Aceitar redirecções: média — desactivar. Enviar redirecções: baixa — desactivar. (Outras gradações são aceitáveis se justificadas.)" },
      { tarefa: "Ficha de decisão para o aviso fictício DPE-SA-2026-07 (versão 4.2.1 afectada; correcção em 4.2.4).", esperado: "Afectado: sim (4.2.1 está entre 4.0 e 4.2.3). Exposição: a página de gestão web está activa? Se sim, medida provisória imediata: desligá-la ou limitá-la à rede de gestão. Correcção: actualizar para 4.2.4 numa janela aprovada, com cópia da configuração e plano de reversão. Reteste: confirmar versão e que a página não está exposta. Registo no inventário." },
      { tarefa: "Um colega diz: «a lista deu 0 falhas, o encaminhador está seguro». Corrija.", esperado: "Quer dizer só que os 6 itens verificados têm o valor esperado neste momento. Não cobre versões vulneráveis, credenciais, registos, hora, cópias de configuração, nem itens que a lista não inclui; e só verifica «all» no rp_filter." },
      { tarefa: "Porque se guardam os valores iniciais antes de corrigir?", esperado: "Para poder repor exactamente o estado anterior se a correcção causar problemas (plano de reversão) e para documentar a diferença antes/depois como evidência." },
    ],
    formativas: [
      { pergunta: "Porque se retira uma página de gestão web antiga sem cifra de um encaminhador?", opcoes: ["Porque ocupa largura de banda", "Porque expõe credenciais em claro e aumenta a superfície de ataque sem necessidade", "Porque o nmap a detecta", "Porque impede o encaminhamento"], certa: 1, comentario: "Cada serviço activo é uma porta de entrada possível. A gestão faz-se por protocolos cifrados, a partir da rede de gestão; o resto desliga-se." },
      { pergunta: "O que significa um resultado «OK» numa lista de verificação automática?", opcoes: ["Que o equipamento está seguro", "Que aquele item tinha o valor esperado no momento da verificação", "Que não há vulnerabilidades CVE", "Que a auditoria terminou"], certa: 1, comentario: "Uma lista cobre só os itens que contém, no momento em que corre. Complementa-se com inventário de versões, avisos do fabricante e revisão humana." },
    ],
    leituraFacil: [
      "Os equipamentos de rede também precisam de protecção.",
      "Desligue os serviços que não são usados.",
      "A gestão faz-se só a partir de computadores autorizados.",
      "Uma lista automática verifica cada ponto.",
      "Depois de corrigir, verifique outra vez.",
      "Actualize os equipamentos quando o fabricante avisar.",
    ],
    guiao: {
      conducao: [
        "0–20 min: plano de gestão, serviços mínimos, credenciais, registos e hora; rp_filter e redirecções com limites; CVE, CVSS e gestão de actualizações; o que vale um OK.",
        "20–65 min: prática em duplas (serviço simulado, valores iniciais, verificação, classificação, correcções, reteste, ficha de vulnerabilidade); quem não tiver laboratório classifica as falhas e preenche as fichas em papel.",
        "65–75 min: formativas e correcção comentada.",
      ],
      errosComuns: [
        "Corrigir sem guardar os valores iniciais nem classificar as falhas.",
        "Não repetir a verificação depois de corrigir.",
        "Activar rp_filter estrito numa rede com encaminhamento assimétrico sem avaliar.",
        "Confundir a cadeia de entrada (tráfego para o r1) com a de encaminhamento (tráfego que atravessa o r1).",
        "Tratar a pontuação CVSS como o risco da instituição.",
      ],
    },
    fontes: ["nist80040", "nist80041", "nist800128", "firstcvss", "cve", "nftables", "iproute2", "nmap"],
  },

  "r-m12-l3": {
    objectivos: [
      "Distinguir descoberta, varrimento de portas, identificação de versões, análise de vulnerabilidades e teste de intrusão, e situar cada um no processo do NIST SP 800-115.",
      "Preparar e assinar uma autorização de teste com âmbito, testes permitidos, janela, executantes e confidencialidade, antes de qualquer comando.",
      "Executar um varrimento autorizado na rede de prática, guardar a evidência e comparar com a linha de base esperada.",
      "Classificar cada achado como indício, confirmado ou falso positivo, com a verificação que o suporta, e produzir um plano de remediação com prioridades e reteste.",
    ],
    explicacao: [
      {
        titulo: "Tipos de teste e limites legais e éticos",
        paragrafos: [
          "Descoberta identifica que equipamentos existem; varrimento de portas mostra que portas respondem; identificação de versões tenta saber que programa e versão atendem; análise de vulnerabilidades compara o que se encontrou com listas de falhas conhecidas; teste de intrusão tenta explorar falhas para demonstrar impacto. Cada nível é mais intrusivo e exige autorização mais explícita. O NIST SP 800-115 descreve planeamento, execução, análise e relatório.",
          "Sem autorização escrita, um varrimento contra sistemas de terceiros é uma intrusão não autorizada, com consequências disciplinares e legais. A autorização define o âmbito (endereços exactos), o que é permitido e proibido, a janela, quem executa, quem é o contacto durante o teste e as regras de confidencialidade dos resultados. Nesta aula o âmbito são apenas os espaços de nomes da rede de prática, com endereços reservados para documentação (RFC 1918 e RFC 5737). Resultados de testes são informação sensível: guardam-se com acesso restrito e apagam-se quando deixam de ser necessários.",
        ],
      },
      {
        titulo: "Indício não é vulnerabilidade confirmada",
        paragrafos: [
          "Uma ferramenta diz o que observou, muitas vezes por inferência. «Porta 80 aberta» é facto observado; «servidor X versão Y» é inferência a partir de respostas e pode enganar; «versão Y é vulnerável ao CVE-…» é hipótese que depende da versão real, das opções activas e das correcções aplicadas pela distribuição, que às vezes mantém o número de versão. Por isso cada achado é classificado: indício (a ferramenta sugere), confirmado (verificado por outra via: configuração, inventário, teste controlado dentro do âmbito) ou falso positivo (verificação mostra que não se aplica).",
          "Um varrimento também não vê tudo: portas filtradas podem esconder serviços, um serviço pode estar parado no momento, e a ferramenta não conhece configurações internas nem permissões. Um relatório honesto diz o que foi testado, quando, com que ferramenta e parâmetros, e o que ficou por cobrir. A remediação prioriza por exposição e impacto no serviço, não pela ordem em que os achados apareceram, e termina sempre com reteste.",
        ],
      },
    ],
    caso: "A DPE (fictícia) vai receber uma auditoria externa. O chefe pede à equipa um teste interno prévio, apenas na rede de prática, para saber o que está exposto no servidor e nos encaminhadores e preparar correcções. Uma dupla é a equipa de teste; outra prepara a autorização e a verificação dos achados. Todos os dados são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Âmbito autorizado (repetido em cada comando pelo prefixo ip netns exec): apenas os espaços de nomes da rede de prática.",
        "Alvos: srv (10.10.20.53) e r1 (10.10.10.1 e 10.255.0.1). Posto de teste: pc-adm.",
        "Serviços de exercício iniciados na aula no srv: web no porto 80 e um serviço de texto no porto 2323 (simula um serviço de gestão antigo, sem cifra).",
        "Limite: o varrimento vê apenas o que responde no momento; não substitui a revisão de configuração nem o inventário de versões.",
      ],
      passos: [
        PRE_M12,
        { accao: "Preencha e assine a autorização de teste (texto completo abaixo). Nenhum comando de varrimento antes disto. Leia em voz alta a lista de endereços do âmbito.", comandos: ["mkdir -p /tmp/dpe-m12/l3 && cd /tmp/dpe-m12/l3", "cat > autorizacao.txt <<'EOF'", ...AUTORIZACAO, "EOF", "nano autorizacao.txt"] },
        { accao: "Consolas C e D: serviços de exercício no srv (esperar «Serving HTTP» e a consola ficar ocupada no segundo).", comandos: ["C: sudo ip netns exec srv python3 -m http.server 80 --bind 10.10.20.53", "D: sudo ip netns exec srv python3 -c \"import socketserver,socket;socketserver.TCPServer.allow_reuse_address=True;s=socketserver.TCPServer(('10.10.20.53',2323),socketserver.BaseRequestHandler);print('gestao-antiga a escutar em 2323',flush=True);s.serve_forever()\""], saida: ["Serving HTTP on 10.10.20.53 port 80 …", "gestao-antiga a escutar em 2323"] },
        { accao: "Etapa 1 — descoberta na rede do servidor (só ping ARP/ICMP, sem portas).", comandos: ["sudo ip netns exec pc-adm nmap -sn 10.10.20.0/24 -oN descoberta.txt", "tail -n 4 descoberta.txt"], saida: ["Nmap scan report for 10.10.20.1", "Host is up (0.00018s latency).", "Nmap scan report for 10.10.20.53", "Nmap done: 256 IP addresses (2 hosts up) scanned in 2.31 seconds"] },
        { accao: "Etapa 2 — portas mais comuns no srv, com registo em ficheiro.", comandos: ["sudo ip netns exec pc-adm nmap -Pn --top-ports 100 10.10.20.53 -oN portas-srv.txt", "grep -E '^[0-9]+/tcp' portas-srv.txt"], saida: ["80/tcp   open  http", "(as restantes portas do top 100 aparecem como closed e não são listadas individualmente)"] },
        { accao: "Etapa 3 — portas não habituais: o serviço antigo não está no top 100. Varra o intervalo acordado.", comandos: ["sudo ip netns exec pc-adm nmap -Pn -p 1-3000 10.10.20.53 -oN portas-srv-1-3000.txt", "grep -E '^[0-9]+/tcp +open' portas-srv-1-3000.txt"], saida: ["80/tcp   open  http", "2323/tcp open  3d-nfsd", "(o nome do serviço vem da lista de portas conhecidas do nmap: é um palpite, não uma identificação)"] },
        { accao: "Etapa 4 — identificação de versões apenas nas portas encontradas (mais intrusivo: permitido pela autorização).", comandos: ["sudo ip netns exec pc-adm nmap -Pn -sV -p 80,2323 10.10.20.53 -oN versoes-srv.txt", "grep -E '^[0-9]+/tcp' versoes-srv.txt"], saida: ["80/tcp   open  http    SimpleHTTPServer 0.6 (Python 3.11.2)", "2323/tcp open  unknown", "(o nmap não identificou o serviço de 2323: fica como indício por esclarecer)"] },
        { accao: "Etapa 5 — varrimento do encaminhador e comparação com a linha de base (o r1 deve ter os serviços mínimos da lição 2).", comandos: ["sudo ip netns exec pc-adm nmap -Pn -p 1-1024 10.10.10.1 -oN portas-r1.txt", "grep -cE '^[0-9]+/tcp +open' portas-r1.txt"], saida: ["0", "(nenhuma porta aberta no r1: coerente com a linha de base)"] },
        { accao: "Verificação dos achados a partir do próprio alvo (outra via, dentro do âmbito): que processos estão à escuta no srv?", comandos: ["sudo ip netns exec srv ss -tlnp"], saida: ["LISTEN 0 5 10.10.20.53:80   0.0.0.0:* users:((\"python3\",pid=2311,fd=3))", "LISTEN 0 5 10.10.20.53:2323 0.0.0.0:* users:((\"python3\",pid=2318,fd=3))", "(confirma as duas portas e mostra que o «3d-nfsd» era só um palpite do nome)"] },
        { accao: "Preencha a tabela de achados (indício/confirmado/falso positivo, com a verificação) e o plano de remediação com prioridade, responsável, prazo e reteste.", comandos: ["nano /tmp/dpe-m12/l3/achados.txt", "nano /tmp/dpe-m12/l3/remediacao.txt"] },
      ],
      sucesso: [
        "A autorização está preenchida e assinada antes do primeiro varrimento, e todos os comandos correram dentro dos espaços de nomes.",
        "Cada etapa deixou ficheiro de evidência com data, ferramenta e parâmetros.",
        "A tabela classifica: porta 80 aberta (confirmado), porta 2323 aberta (confirmado), «3d-nfsd» (falso positivo do nome), «SimpleHTTPServer 0.6» (indício, confirmado pelo ss), r1 sem portas abertas (confirmado, coerente com a linha de base).",
        "O plano de remediação prioriza o serviço sem cifra do porto 2323 e prevê reteste com o mesmo comando.",
        "A dupla nomeia pelo menos duas coisas que o varrimento não cobriu.",
      ],
      reversao: [
        "Ctrl+C nas consolas C e D. Não usar pkill/killall. Confirmar: sudo ip netns pids srv não lista python3.",
        "Os ficheiros de resultado são sensíveis: mostrar ao formador, e depois rm -r /tmp/dpe-m12/l3.",
        "Nada foi alterado nos alvos: as etapas só observaram (nenhum comando de exploração foi executado).",
      ],
    },
    papel: [
      { tarefa: "Classifique, com justificação, estes quatro achados de exemplo: (a) 80/tcp open; (b) 2323/tcp open «3d-nfsd»; (c) «SimpleHTTPServer 0.6 (Python 3.11.2)»; (d) r1 sem portas abertas.", esperado: "(a) Confirmado: a porta respondeu e o ss mostra o processo. (b) Porta aberta: confirmado; o nome «3d-nfsd»: falso positivo, vem da lista de portas conhecidas. (c) Indício, depois confirmado pelo ss no alvo; note-se que versões anunciadas podem enganar. (d) Confirmado para as portas 1-1024 no momento do teste; não prova que não haja portas acima de 1024." },
      { tarefa: "Escreva o plano de remediação para o serviço de gestão antiga no porto 2323.", esperado: "Prioridade alta (serviço de gestão sem cifra, acessível à rede). Medida imediata: limitar o acesso à rede de gestão por regra de firewall. Correcção: substituir por acesso cifrado (SSH) e desligar o serviço antigo. Responsável: equipa de redes. Prazo: fictício, por exemplo 15 dias. Reteste: repetir «nmap -Pn -p 2323» e confirmar «filtered» ou serviço ausente, e registar a evidência." },
      { tarefa: "Um formando quer testar «só um bocadinho» um servidor da instituição, fora da rede de prática. Responda.", esperado: "Não. Está fora do âmbito autorizado; seria uma intrusão não autorizada, com consequências disciplinares e legais, e pode perturbar serviços reais. Se houver necessidade, pede-se autorização escrita própria, com âmbito, janela e contacto." },
      { tarefa: "Indique três limitações a escrever no relatório deste teste.", esperado: "Só foram varridas as portas TCP indicadas (não todas, nem UDP); só se viu o que respondia naquele momento; não houve revisão de configurações, permissões, contas nem versões instaladas; não se testou exploração, por isso o impacto real não foi demonstrado." },
    ],
    formativas: [
      { pergunta: "A ferramenta diz «2323/tcp open 3d-nfsd». O que se pode afirmar?", opcoes: ["Que há um serviço 3d-nfsd vulnerável", "Que a porta 2323 respondeu; o nome é apenas o palpite da lista de portas conhecidas", "Que o servidor está comprometido", "Nada, o resultado é inútil"], certa: 1, comentario: "A porta aberta é facto observado; o nome do serviço, sem identificação de versão, é convenção. Confirma-se no próprio alvo, por exemplo com ss." },
      { pergunta: "O que tem de existir antes de qualquer varrimento?", opcoes: ["Uma cópia de segurança", "Autorização escrita com âmbito, testes permitidos, janela e contactos", "Um servidor de registos", "Um relatório preliminar"], certa: 1, comentario: "Sem autorização com âmbito definido, o teste é uma intrusão não autorizada. A autorização também protege quem executa." },
    ],
    leituraFacil: [
      "Nunca teste uma rede sem autorização escrita.",
      "A autorização diz que endereços pode testar.",
      "Primeiro veja que computadores existem.",
      "Depois veja que portas respondem.",
      "O que a ferramenta diz pode estar errado: confirme.",
      "Escreva o que encontrou, como corrigir e quando vai verificar de novo.",
    ],
    guiao: {
      conducao: [
        "0–20 min: tipos de teste e grau de intrusão; autorização, âmbito, ética e confidencialidade; indício, confirmado e falso positivo; limitações; remediação e reteste.",
        "20–65 min: prática em duplas (autorização assinada, serviços de exercício, cinco etapas com evidência, verificação no alvo, tabela de achados e plano); quem não tiver laboratório classifica os achados de exemplo e escreve o plano em papel.",
        "65–75 min: formativas e correcção comentada; recolha e destruição das evidências.",
      ],
      errosComuns: [
        "Começar a varrer antes de ter a autorização preenchida.",
        "Escrever no relatório o nome do serviço sugerido pela ferramenta como se fosse identificação.",
        "Chamar vulnerabilidade a um indício não verificado.",
        "Esquecer as portas fora das mais comuns (o serviço do porto 2323 não estaria no top 100).",
        "Deixar os ficheiros de resultado acessíveis a quem não é da equipa.",
        "Sair do âmbito: qualquer comando sem «ip netns exec» está fora da rede de prática.",
      ],
    },
    fontes: ["nist800115", "nist80030", "firstcvss", "cve", "nmap", "iproute2", "rfc1918", "rfc5737"],
  },

  "r-m12-l4": {
    objectivos: [
      "Distinguir auditoria de teste técnico: a auditoria compara a realidade com um referencial (política, norma, contrato) e produz conclusões rastreáveis a evidências.",
      "Preparar uma lista de verificação com controlo, fonte, método, evidência mínima e resultado, e aplicá-la à rede de prática.",
      "Recolher evidências reprodutíveis, registar «conforme», «não conforme», «parcial» ou «não aplicável» com justificação, e evitar conclusões sem prova.",
      "Escrever conclusões e recomendações priorizadas, com responsável, prazo e reteste, e conhecer os limites da auditoria realizada.",
    ],
    explicacao: [
      {
        titulo: "Auditar é comparar com um referencial",
        paragrafos: [
          "Um teste técnico procura o que está exposto; uma auditoria verifica se a realidade cumpre o referencial: a política interna, uma norma como a ISO/IEC 27001, guias como os do NIST, ou as obrigações de um contrato. Cada item da auditoria é um controlo com uma fonte identificada, um método de verificação e a evidência mínima que o sustenta. Sem referencial, a auditoria vira opinião.",
          "Os resultados usam uma escala clara: conforme (evidência mostra que cumpre), não conforme (evidência mostra que não cumpre), parcial (cumpre em parte, com o que falta identificado) e não aplicável (com justificação). Cada resultado aponta para um ficheiro ou saída guardada, de forma a que outra pessoa possa repetir a verificação e chegar ao mesmo resultado. O NIST SP 800-53A descreve exactamente esta lógica de examinar, entrevistar e testar.",
        ],
      },
      {
        titulo: "Independência, prova e limites",
        paragrafos: [
          "Quem audita não deve auditar o seu próprio trabalho: no mínimo, uma dupla verifica o trabalho da outra. A auditoria não altera o sistema; se algo tiver de ser corrigido, isso é remediação e faz-se depois, com pedido de alteração. Durante a auditoria, as evidências são tratadas como informação sensível.",
          "O relatório indica âmbito, data, método, referencial, equipa, resultados por controlo com evidência, conclusões e recomendações priorizadas com responsável, prazo e reteste. Indica também as limitações: o que não foi verificado, o que dependeu de declaração de terceiros e o que foi observado apenas num momento. Uma recomendação sem prazo nem responsável não é uma recomendação: é um desejo.",
        ],
      },
    ],
    caso: "A DPE (fictícia) vai ser auditada pela tutela dentro de um mês. O chefe pede uma auditoria interna à rede de prática, com 12 controlos aprovados, para saber o que está conforme e preparar as correcções. Duas duplas trocam de papel: a dupla A audita a rede configurada pela dupla B, e vice-versa. Todos os dados são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Âmbito da auditoria (declarado): rede de prática desta VM, controlos A01 a A12 da lista aprovada; sem alterações ao sistema durante a auditoria.",
        "Estado a auditar: cada dupla repõe, antes da troca, as configurações das lições 1 e 2 deste módulo (tabelas m12acessos e m12equip, SSH de prática) — a lista de verificação da lição 2 fica disponível.",
        "Os controlos A07 a A12 referem-se a práticas do módulo 11: nesta aula verificam-se pela evidência guardada nessas lições ou marcam-se «não aplicável» com justificação, se a dupla não as tiver conservado.",
      ],
      passos: [
        PRE_M12,
        { accao: "Prepare a pasta e a lista de verificação (texto completo abaixo). Leia a coluna «evidência mínima» antes de começar: é o que tem de guardar.", comandos: ["mkdir -p /tmp/dpe-m12/l4/evidencias && cd /tmp/dpe-m12/l4", "cat > lista-auditoria.csv <<'EOF'", ...LISTA_AUDITORIA, "EOF", "column -s, -t lista-auditoria.csv | head -n 5"] },
        { accao: "Registe o âmbito e a hora de início; declare que a auditoria não altera o sistema.", comandos: ["printf 'Auditoria interna (exercício)\\nAmbito: rede de pratica, controlos A01-A12\\nInicio: %s\\nEquipa: dupla A (audita a configuracao da dupla B)\\nRegra: so leitura; nenhuma alteracao ao sistema\\n' \"$(date '+%F %T')\" | tee evidencias/00-ambito.txt"], saida: ["Auditoria interna (exercício)", "Inicio: 2026-09-28 13:05:12"] },
        { accao: "A01 e A02 — segmentação e acesso de gestão: examine as regras e faça o teste negativo. Guarde as saídas.", comandos: ["sudo ip netns exec r1 nft list table inet m12acessos | tee evidencias/A01-A02-regras.txt | grep -E 'policy|comment'", "sudo ip netns exec pc-del nmap -Pn -p 22 --host-timeout 20s 10.10.20.53 | tee evidencias/A02-teste-negativo.txt | grep 22/tcp"], saida: ["type filter hook forward priority filter; policy drop;", "… comment \"gestao-ssh\"", "… comment \"delegacao-web\"", "… comment \"recusado\"", "22/tcp filtered ssh"] },
        { accao: "A03, A04 e A05 — portas do equipamento, autenticação administrativa e serviços à escuta.", comandos: ["sudo ip netns exec pc-adm nmap -Pn -p 1-1024 10.10.10.1 | tee evidencias/A03-portas-r1.txt | grep -cE '^[0-9]+/tcp +open'", "grep -E 'PasswordAuthentication|PubkeyAuthentication|PermitRootLogin' /tmp/dpe-m12/l1/sshd-pratica.conf | tee evidencias/A04-config-ssh.txt", "sudo ip netns exec pc-adm ssh -o BatchMode=yes -o PreferredAuthentications=password -o PubkeyAuthentication=no -o StrictHostKeyChecking=no -o UserKnownHostsFile=/tmp/dpe-m12/l4/known_hosts $(id -un)@10.10.20.53 true 2>&1 | tee -a evidencias/A04-config-ssh.txt", "sudo ip netns exec r1 ss -tuln | tee evidencias/A05-escuta-r1.txt"], saida: ["0", "PermitRootLogin prohibit-password", "PasswordAuthentication no", "PubkeyAuthentication yes", "Permission denied (publickey).", "(nenhuma linha LISTEN no r1)"] },
        { accao: "A06 — parâmetros endurecidos: use a lista da lição 2 (só leitura) e guarde a saída.", comandos: ["sudo sh /tmp/dpe-m12/l2/verificar-r1.sh | tee evidencias/A06-parametros.txt; echo \"código=$?\""], saida: ["Total de falhas: 0", "código=0"] },
        { accao: "A07 a A12 — práticas do módulo 11: verifique a evidência guardada dessas lições. Se não existir nesta VM, marque «não aplicável (evidência não conservada nesta VM)» — não invente resultado.", comandos: ["ls -l /tmp/dpe-m11 2>/dev/null || echo 'evidências do módulo 11 não conservadas nesta VM'", "for n in pc-adm srv r1 r2; do printf '%s: ' $n; sudo ip netns exec $n date '+%F %T'; done | tee evidencias/A08-horas.txt"], saida: ["evidências do módulo 11 não conservadas nesta VM", "pc-adm: 2026-09-28 13:12:40", "srv: 2026-09-28 13:12:40", "r1: 2026-09-28 13:12:40", "r2: 2026-09-28 13:12:40", "(todos os espaços de nomes partilham o relógio da VM: A08 conforme nesta rede, mas isto não demonstra sincronização entre equipamentos reais — limitação a registar)"] },
        { accao: "Preencha as colunas «resultado» e «observação» da lista, apontando o ficheiro de evidência de cada controlo.", comandos: ["nano lista-auditoria.csv"] },
        { accao: "Escreva o relatório: âmbito, data, método, referencial, equipa, resultados, conclusões, recomendações priorizadas (responsável, prazo, reteste) e limitações.", comandos: ["nano relatorio-auditoria.txt"] },
      ],
      sucesso: [
        "Os 12 controlos têm resultado, e cada resultado aponta um ficheiro de evidência ou uma justificação de «não aplicável».",
        "Nenhuma configuração foi alterada durante a auditoria (verificável: não há comandos de alteração nos registos da consola).",
        "As recomendações estão priorizadas e têm responsável, prazo e reteste.",
        "O relatório declara pelo menos três limitações, incluindo a do relógio partilhado e a dos controlos do módulo 11 não verificados.",
        "A dupla auditada consegue repetir qualquer verificação e obter o mesmo resultado.",
      ],
      reversao: [
        "A auditoria não alterou nada; não há configuração a repor.",
        "As evidências são sensíveis: mostrar ao formador e depois rm -r /tmp/dpe-m12/l4.",
        "As configurações das lições 1 e 2 ficam para a lição 5 ou removem-se com as reversões dessas lições.",
      ],
    },
    papel: [
      { tarefa: "Classifique (conforme/não conforme/parcial/não aplicável) e justifique: (a) A02 com regra específica e teste negativo «filtered»; (b) A04 com PasswordAuthentication no, mas a chave privada guardada sem frase de acesso; (c) A11 sem qualquer cópia nesta VM; (d) A08 com todos os relógios iguais por partilharem a VM.", esperado: "(a) Conforme: evidência de regra e teste negativo. (b) Parcial: a autenticação por palavra-passe está desactivada, mas a protecção da chave é fraca; falta frase de acesso ou protecção equivalente. (c) Não conforme, se o referencial exige cópias; ou não aplicável se o âmbito excluir cópias — a justificação tem de constar. (d) Conforme no âmbito da rede de prática, com limitação registada: não demonstra sincronização em equipamentos reais." },
      { tarefa: "Escreva duas recomendações priorizadas a partir dos achados de exemplo.", esperado: "1) Alta: proteger a chave administrativa com frase de acesso e limitar a origem do acesso. Responsável: equipa de redes. Prazo: 15 dias (fictício). Reteste: tentar usar a chave sem frase e confirmar recusa. 2) Média: instituir cópia semanal das configurações com verificação de integridade e reposição testada. Responsável: equipa de redes. Prazo: 30 dias. Reteste: repor numa pasta de teste e comparar." },
      { tarefa: "Um auditor escreve «a rede está segura». Reescreva de forma defensável.", esperado: "«Dos 12 controlos do âmbito, 9 conformes, 2 parciais e 1 não conforme, verificados em 28-09-2026 na rede de prática, com as evidências indicadas. Fora do âmbito: aplicações, postos de trabalho, rede sem fios e procedimentos de pessoal.»" },
      { tarefa: "Porque a dupla não deve auditar a sua própria configuração?", esperado: "Falta independência: tende a confirmar o que fez, conhece os atalhos que tomou e pode saltar verificações. A troca entre duplas aproxima-se da separação entre quem executa e quem verifica." },
    ],
    formativas: [
      { pergunta: "Qual é a diferença essencial entre um teste técnico e uma auditoria?", opcoes: ["A auditoria usa mais ferramentas", "A auditoria compara a realidade com um referencial e sustenta cada conclusão numa evidência", "O teste técnico não precisa de autorização", "Não há diferença"], certa: 1, comentario: "O teste procura exposições; a auditoria verifica cumprimento face a política, norma ou contrato, com resultados rastreáveis a evidências." },
      { pergunta: "Um controlo não pôde ser verificado por falta de dados. O que se escreve?", opcoes: ["Conforme, para não atrasar", "Não aplicável ou não verificado, com justificação e indicação do que falta", "Não conforme, sempre", "Nada"], certa: 1, comentario: "Inventar um resultado destrói a credibilidade da auditoria. Regista-se o que impediu a verificação e o que seria preciso para a concluir." },
    ],
    leituraFacil: [
      "Auditar é comparar o que existe com as regras escritas.",
      "Cada resposta precisa de uma prova guardada.",
      "Escreva: cumpre, não cumpre, cumpre em parte ou não se aplica.",
      "Quem fez o trabalho não deve ser quem verifica.",
      "A auditoria não muda nada: só observa.",
      "Diga também o que não foi verificado.",
    ],
    guiao: {
      conducao: [
        "0–20 min: auditoria vs teste técnico; referencial e controlos; escala de resultados; evidência reprodutível; independência; estrutura do relatório e limitações.",
        "20–70 min: prática em duplas cruzadas (lista, âmbito, controlos A01 a A12 com evidência, preenchimento, relatório); quem não tiver laboratório classifica os achados de exemplo e escreve recomendações em papel.",
        "70–80 min: formativas, correcção comentada e troca de relatórios entre duplas.",
      ],
      errosComuns: [
        "Concluir sem apontar a evidência.",
        "Corrigir problemas durante a auditoria em vez de os registar.",
        "Marcar «conforme» por declaração verbal.",
        "Auditar a própria configuração.",
        "Recomendações sem responsável, prazo nem reteste.",
        "Esquecer de declarar as limitações, incluindo o relógio partilhado da VM.",
      ],
    },
    fontes: ["nist80053a", "isoiec27001", "nist80041", "nist80092", "nist800128", "nist80034", "rfc5905", "nmap", "nftables"],
  },
};
