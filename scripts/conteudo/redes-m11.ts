/**
 * Curso de Redes — módulo 11 (Gestão e Monitorização de Redes).
 * Conteúdo fictício e didáctico; ver regras em redes-base.ts.
 * Laboratórios NÃO executados neste ambiente: as saídas são exemplos didácticos,
 * não resultados medidos. Pré-requisito comum: rede DPE criada com lab-base.sh
 * (módulo 1, lição 1) numa máquina virtual Debian 12 descartável, após a
 * pré-verificação de nomes (lab-verificar.sh); rotas sede–delegação do módulo 3.
 * Pacotes adicionais deste módulo: python3, git, snmp, snmpd, rsyslog, bsdutils
 * (logger), iperf3. Todos os ficheiros ficam em /tmp/dpe-m11; os serviços de
 * prática (snmpd, rsyslogd) correm em primeiro plano dentro do espaço de nomes
 * srv, com configuração própria, e param com Ctrl+C. Nenhuma lição altera ou
 * reinicia serviços do sistema da VM. Segredos mostrados são fictícios e só
 * servem para esta rede de prática.
 */
import { TOPOLOGIA_BASE, type ConteudoLicao } from "./redes-base";

/** Pré-verificação comum (não cria nem apaga nada). */
const PRE_M11 = {
  accao:
    "Pré-verificação (não altera nada): ferramentas presentes, rede DPE activa, delegação chega ao srv e a pasta de trabalho do módulo ainda não existe (se existir, pode ter dados de outra pessoa ou de outra lição: pare e confirme antes de continuar).",
  comandos: [
    "for d in python3 git snmpget snmpwalk snmpd rsyslogd logger iperf3 sha256sum; do command -v $d >/dev/null || echo \"Em falta: $d\"; done",
    "ip netns list | grep -cE '^(pc-adm|srv|r1|r2|pc-del|isp)( |$)'",
    "sudo ip netns exec pc-del ping -c 2 10.10.20.53 | tail -2",
    "test -e /tmp/dpe-m11 && echo 'ATENÇÃO: /tmp/dpe-m11 já existe' || echo 'pasta livre'",
  ],
  saida: ["(nenhuma linha «Em falta»)", "6", "2 packets transmitted, 2 received, 0% packet loss", "pasta livre"],
};

const SCRIPT_INVENTARIO = `#!/usr/bin/env python3
"""inventario.py — inventário IPv4 da rede de prática DPE (fictícia).
Uso: sudo python3 inventario.py SAIDA.csv
Lê cada espaço de nomes com 'ip -j addr' e escreve um CSV. Não altera nada."""
import csv, json, subprocess, sys

NOMES = ["pc-adm", "srv", "r1", "r2", "pc-del", "isp"]

def ler(ns):
    try:
        r = subprocess.run(["ip", "-n", ns, "-j", "addr", "show"],
                           capture_output=True, text=True, check=True, timeout=10)
        return json.loads(r.stdout)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, json.JSONDecodeError) as e:
        print(f"ERRO ao ler {ns}: {getattr(e, 'stderr', '') or e}".strip(), file=sys.stderr)
        return None

if len(sys.argv) != 2:
    sys.exit("Uso: sudo python3 inventario.py SAIDA.csv")
linhas, donos, falhas = [], {}, 0
for ns in NOMES:
    dados = ler(ns)
    if dados is None:
        falhas += 1
        continue
    for itf in dados:
        if itf["ifname"] == "lo":
            continue
        for a in itf.get("addr_info", []):
            if a.get("family") != "inet":
                continue
            linhas.append([ns, itf["ifname"], itf.get("address", ""),
                           f"{a['local']}/{a['prefixlen']}", itf.get("operstate", "")])
            donos.setdefault(a["local"], []).append(ns)
try:
    with open(sys.argv[1], "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["equipamento", "interface", "mac", "ipv4", "estado"])
        w.writerows(linhas)
except OSError as e:
    sys.exit(f"ERRO ao escrever {sys.argv[1]}: {e}")
for ip, ns in donos.items():
    if len(ns) > 1:
        print(f"AVISO: {ip} repetido em {', '.join(ns)}")
print(f"{len(linhas)} endereços inventariados; {falhas} equipamento(s) com erro.")
sys.exit(1 if falhas else 0)`.split("\n");

/** Configuração do agente SNMP de prática (só SNMPv3 authPriv; sem comunidades v1/v2c). */
const SNMPD_CONF = [
  "agentaddress udp:10.10.20.53:161",
  "rouser monitor priv",
  "sysLocation Rede de pratica DPE (ficticia)",
  "sysContact ti@dpe.example",
];
/** Utilizador USM com segredos FICTÍCIOS, lido do directório persistente próprio. */
const SNMPD_UTILIZADOR = ['createUser monitor SHA-256 "PraticaAuth-2026-fict" AES "PraticaPriv-2026-fict"'];
/** Configuração do cliente, para não escrever segredos na linha de comando. */
const SNMP_CLIENTE = [
  "defVersion 3",
  "defSecurityName monitor",
  "defSecurityLevel authPriv",
  "defAuthType SHA-256",
  "defAuthPassphrase PraticaAuth-2026-fict",
  "defPrivType AES",
  "defPrivPassphrase PraticaPriv-2026-fict",
];

const SCRIPT_MONITOR = `#!/usr/bin/env python3
"""monitor.py — utilização de entrada de uma interface por SNMPv3 (rede de prática DPE).
Uso: sudo ip netns exec pc-adm env SNMPCONFPATH=... SNMP_PERSISTENT_DIR=... python3 monitor.py
Alerta: acima de 80 % em 3 ciclos seguidos; volta ao normal abaixo de 70 % em 2 ciclos."""
import os, subprocess, sys, time

ALVO, IFNAME, CAP_BPS = "10.10.20.53", "srv-r1", 10_000_000  # capacidade DECLARADA
LIM_ALTO, LIM_BAIXO, N_ALTO, N_BAIXO, INTERVALO = 0.80, 0.70, 3, 2, 10
OID_NOME = "1.3.6.1.2.1.31.1.1.1.1"   # IF-MIB::ifName
OID_IN = "1.3.6.1.2.1.31.1.1.1.6"     # IF-MIB::ifHCInOctets (contador de 64 bits)

def snmp(cmd, oid):
    r = subprocess.run([cmd, "-On", "-Oq", ALVO, oid], capture_output=True, text=True, timeout=10)
    if r.returncode != 0 or not r.stdout.strip() or "No Such" in r.stdout:
        raise RuntimeError((r.stderr or r.stdout).strip() or "sem resposta")
    return r.stdout.strip().splitlines()

def hora():
    return time.strftime("%H:%M:%S")

if "SNMPCONFPATH" not in os.environ:
    sys.exit("Defina SNMPCONFPATH com a configuração do cliente (passo 3).")
try:
    idx = next(l.split()[0].rsplit(".", 1)[1] for l in snmp("snmpwalk", OID_NOME)
               if l.split()[-1].strip('"') == IFNAME)
except StopIteration:
    sys.exit(f"Interface {IFNAME} não encontrada no agente.")
except (RuntimeError, subprocess.TimeoutExpired) as e:
    sys.exit(f"ERRO SNMP: {e}")
print(f"{IFNAME} = ifIndex {idx}; capacidade declarada {CAP_BPS // 1_000_000} Mbit/s; Ctrl+C para parar")

anterior, altos, baixos, falhas, estado = None, 0, 0, 0, "NORMAL"
while True:
    try:
        valor = int(snmp("snmpget", f"{OID_IN}.{idx}")[0].split()[-1])
        agora, falhas = time.monotonic(), 0
    except (RuntimeError, subprocess.TimeoutExpired, ValueError) as e:
        falhas += 1
        print(f"{hora()} SEM DADOS ({e})")
        if falhas == 3:
            print(f"{hora()} ALERTA: agente não responde há 3 ciclos")
        time.sleep(INTERVALO)
        continue
    if anterior and valor < anterior[0]:
        print(f"{hora()} contador recuou (reinício do agente?): amostra ignorada")
    elif anterior:
        util = (valor - anterior[0]) * 8 / (agora - anterior[1]) / CAP_BPS
        altos = altos + 1 if util > LIM_ALTO else 0
        baixos = baixos + 1 if util < LIM_BAIXO else 0
        if estado == "NORMAL" and altos >= N_ALTO:
            estado = "ALERTA"
            print(f"{hora()} ALERTA: entrada em {IFNAME} acima de 80 % em {N_ALTO} ciclos seguidos")
        elif estado == "ALERTA" and baixos >= N_BAIXO:
            estado = "NORMAL"
            print(f"{hora()} NORMAL: entrada abaixo de 70 % em {N_BAIXO} ciclos seguidos")
        print(f"{hora()} utilização {util:6.1%}  estado {estado}")
    anterior = (valor, agora)
    time.sleep(INTERVALO)`.split("\n");

/** Receptor rsyslog de prática: só UDP 514 em 10.10.20.14, ficheiros por IP de origem. */
const RSYSLOG_CONF = [
  'global(workDirectory="/tmp/dpe-m11/l3/trabalho")',
  'module(load="imudp")',
  'input(type="imudp" address="10.10.20.14" port="514")',
  'template(name="PorOrigem" type="string" string="/tmp/dpe-m11/l3/registos/%fromhost-ip%.log")',
  'template(name="Linha" type="string" string="%timegenerated:::date-rfc3339% %fromhost-ip% %syslogseverity-text% %programname% %msg%\\n")',
  '*.* action(type="omfile" dynaFile="PorOrigem" template="Linha")',
];

const SCRIPT_ANALISAR = `#!/usr/bin/env python3
"""analisar.py — resumo de registos e detecção de falhas de autenticação repetidas.
Uso: python3 analisar.py FICHEIRO [FICHEIRO ...]
Formato (modelo «Linha» do rsyslog desta lição): DATA IP_ORIGEM SEVERIDADE PROGRAMA MENSAGEM
Regra: 5 ou mais «Failed password» da mesma origem em 60 s -> ALERTA."""
import collections, datetime, re, sys

LIMIAR, JANELA = 5, datetime.timedelta(seconds=60)
if len(sys.argv) < 2:
    sys.exit("Uso: python3 analisar.py FICHEIRO [FICHEIRO ...]")
contagem, falhas = collections.Counter(), collections.defaultdict(list)
invalidas = lidos = 0
for nome in sys.argv[1:]:
    try:
        f = open(nome, encoding="utf-8", errors="replace")
    except OSError as e:
        print(f"ERRO: {e}", file=sys.stderr)
        continue
    lidos += 1
    with f:
        for linha in f:
            partes = linha.rstrip("\\n").split(" ", 4)
            try:
                quando = datetime.datetime.fromisoformat(partes[0])
                origem, sev, prog, msg = partes[1:5]
            except (ValueError, IndexError):
                invalidas += 1
                continue
            contagem[(origem, sev)] += 1
            m = re.search(r"Failed password .* from (\\S+)", msg)
            if prog == "sshd" and m:
                falhas[m.group(1)].append(quando)
if not lidos:
    sys.exit("Nenhum ficheiro lido.")
print("Eventos por origem e severidade:")
for (origem, sev), n in sorted(contagem.items()):
    print(f"  {origem:<12} {sev:<8} {n}")
for ip, tempos in falhas.items():
    tempos.sort()
    for i in range(len(tempos) - LIMIAR + 1):
        if tempos[i + LIMIAR - 1] - tempos[i] <= JANELA:
            print(f"ALERTA: {LIMIAR}+ falhas de autenticação de {ip} em 60 s (desde {tempos[i]:%H:%M:%S})")
            break
print(f"Linhas ignoradas por formato inválido: {invalidas}")`.split("\n");

const SCRIPT_EXPORTAR = `#!/bin/sh
# exportar.sh — exporta o estado de r1 e r2 para texto e regista no git (rede de prática DPE).
# Uso: sudo sh /tmp/dpe-m11/l4/exportar.sh      Só lê os equipamentos; nunca os altera.
set -eu
DEST=/tmp/dpe-m11/l4/configs
[ "$(id -u)" = 0 ] || { echo "ERRO: executar com sudo." >&2; exit 1; }
[ -d "$DEST/.git" ] || { echo "ERRO: repositório $DEST não existe (ver passo 2)." >&2; exit 1; }
for n in r1 r2; do
  ip netns list | awk '{print $1}' | grep -qx "$n" || { echo "ERRO: espaço de nomes $n não existe." >&2; exit 1; }
  mkdir -p "$DEST/$n"
  # o sufixo @ifN muda sempre que a rede é recriada; retira-se para não gerar falsas diferenças
  ip -n "$n" -br addr show | sed 's/@[^ ]*//' > "$DEST/$n/enderecos.txt"
  ip -n "$n" route show > "$DEST/$n/rotas.txt"
  ip netns exec "$n" nft list ruleset > "$DEST/$n/nftables.txt"
  ip netns exec "$n" tc qdisc show > "$DEST/$n/filas.txt"
done
cd "$DEST"
git add -A
if git diff --cached --quiet; then
  echo "Sem alterações desde a última exportação."
else
  git commit -qm "Exportação $(date '+%F %T') por \${SUDO_USER:-root}"
  echo "Alterações registadas:"
  git show --stat --format='%h %s' HEAD
fi`.split("\n");

export const LICOES_M11: Record<string, ConteudoLicao> = {
  "r-m11-l1": {
    objectivos: [
      "Explicar para que servem o inventário de activos de rede, o diagrama lógico e a ficha de cada equipamento, e que informação nunca deve constar neles (palavras-passe, chaves).",
      "Gerar automaticamente um inventário IPv4 da rede de prática com um script Python com tratamento de erros, e detectar endereços repetidos.",
      "Comparar o inventário gerado com a documentação existente e registar as diferenças como pendências com responsável.",
    ],
    explicacao: [
      {
        titulo: "Inventário, diagrama e ficha",
        paragrafos: [
          "Só se gere o que se conhece. O inventário lista cada equipamento com função, localização, responsável, interfaces, endereços, versão do sistema, garantia e contrato de suporte. O diagrama lógico mostra como os equipamentos se ligam (redes, VLAN, encaminhadores, ligações ao operador); o diagrama físico mostra bastidores, tomadas e cabos. A ficha de equipamento junta o que é preciso para o substituir ou recuperar. Estes documentos sustentam a continuidade de serviço (NIST SP 800-34) e a gestão de configurações (NIST SP 800-128).",
          "A documentação não guarda segredos: palavras-passe, chaves e cadeias SNMP ficam num cofre de credenciais com acesso controlado; no inventário escreve-se apenas onde estão e quem as gere. Um inventário também é informação sensível — mostra a quem ataca o que existe — e deve ter acesso restrito.",
        ],
      },
      {
        titulo: "Automatizar e confrontar",
        paragrafos: [
          "Um inventário escrito à mão desactualiza-se. Recolher dados dos próprios equipamentos (aqui com 'ip -j', que devolve JSON; em equipamentos reais por SNMP, API ou exportação de configuração) dá uma fotografia do estado real. A fotografia não substitui a documentação: não diz a função, o dono, nem se aquele endereço devia existir. Por isso compara-se o gerado com o documentado e cada diferença vira uma pendência: corrigir o documento ou corrigir o equipamento, com responsável e prazo.",
          "Um script de recolha deve falhar de forma clara: dizer qual equipamento não respondeu, não escrever um ficheiro meio vazio sem aviso e terminar com código de erro, para que quem o agenda perceba que algo correu mal.",
        ],
      },
    ],
    caso: "A DPE (fictícia) recebeu um técnico novo. O único diagrama tem dois anos e a folha de endereços diz que a delegação usa 10.20.20.0/24. O chefe pede um inventário actualizado da rede de prática que reproduz a sede e a delegação, e uma lista de diferenças para decidir o que corrigir. Todos os dados são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Documento «antigo» fictício a confrontar: delegação 10.20.20.0/24; ligação WAN 10.255.0.0/30; servidor 10.10.20.53; sem referência ao operador simulado (isp).",
        "O script ignora o endereço 198.51.100.10/32 da interface lo do isp (as interfaces lo são excluídas de propósito); a lacuna é discutida no fim.",
      ],
      passos: [
        PRE_M11,
        { accao: "Crie a pasta de trabalho do módulo e grave o script de inventário (texto completo abaixo).", comandos: ["mkdir -p /tmp/dpe-m11/l1 && cd /tmp/dpe-m11/l1", "cat > inventario.py <<'EOF'", ...SCRIPT_INVENTARIO, "EOF"] },
        { accao: "Execute o script e veja o CSV.", comandos: ["sudo python3 inventario.py inventario.csv; echo \"código=$?\"", "column -s, -t inventario.csv"], saida: ["10 endereços inventariados; 0 equipamento(s) com erro.", "código=0", "equipamento  interface  mac                ipv4            estado", "pc-adm       pc-adm-r1  0a:1b:…:01         10.10.10.10/24  UP", "srv          srv-r1     0a:1b:…:02         10.10.20.53/24  UP", "r1           r1-pc-adm  …                  10.10.10.1/24   UP", "r1           r1-srv     …                  10.10.20.1/24   UP", "r1           r1-r2      …                  10.255.0.1/30   UP", "r1           r1-isp     …                  203.0.113.2/24  UP", "r2           r2-r1      …                  10.255.0.2/30   UP", "r2           r2-pc-del  …                  10.20.10.1/24   UP", "pc-del       pc-del-r2  …                  10.20.10.10/24  UP", "isp          isp-r1     …                  203.0.113.1/24  UP", "(os endereços MAC variam em cada VM)"] },
        { accao: "Teste o tratamento de erros: destino onde não se pode escrever. O script deve dizer porquê e terminar com código diferente de 0.", comandos: ["sudo python3 inventario.py /pasta-inexistente/x.csv; echo \"código=$?\""], saida: ["ERRO ao escrever /pasta-inexistente/x.csv: [Errno 2] No such file or directory: '/pasta-inexistente/x.csv'", "código=1"] },
        { accao: "Teste a detecção de repetidos: acrescente temporariamente, no pc-del, um endereço igual ao do srv; corra o script; retire o endereço logo a seguir.", comandos: ["sudo ip -n pc-del addr add 10.10.20.53/32 dev pc-del-r2", "sudo python3 inventario.py teste.csv", "sudo ip -n pc-del addr del 10.10.20.53/32 dev pc-del-r2"], saida: ["AVISO: 10.10.20.53 repetido em srv, pc-del", "11 endereços inventariados; 0 equipamento(s) com erro."] },
        { accao: "Escreva o diagrama lógico em texto e a lista de diferenças face ao documento antigo, com responsável e prazo (fictícios).", comandos: ["nano /tmp/dpe-m11/l1/diagrama.txt", "nano /tmp/dpe-m11/l1/diferencas.txt"] },
      ],
      sucesso: [
        "O CSV lista os 10 endereços IPv4 das interfaces não-lo, com estado UP.",
        "O script termina com código 1 e mensagem clara quando não consegue escrever, e avisa o endereço repetido.",
        "A lista de diferenças inclui pelo menos: rede da delegação (10.20.10.0/24 real vs 10.20.20.0/24 documentada), ligação ao operador em falta no documento, e o endereço em lo do isp não inventariado pelo script.",
        "Nenhum documento produzido contém palavras-passe ou chaves.",
      ],
      reversao: [
        "Confirmar que o endereço de teste foi retirado: sudo ip -n pc-del addr show dev pc-del-r2 mostra só 10.20.10.10/24 (se não, sudo ip -n pc-del addr del 10.10.20.53/32 dev pc-del-r2).",
        "Guardar os ficheiros fora da VM, se necessário, e depois: rm -r /tmp/dpe-m11/l1 (se for a última lição do módulo nesta VM: rm -r /tmp/dpe-m11).",
      ],
    },
    papel: [
      { tarefa: "A partir da saída de exemplo do CSV, desenhe o diagrama lógico com redes e encaminhadores.", esperado: "pc-adm (10.10.10.10) — rede 10.10.10.0/24 — r1; srv (10.10.20.53) — 10.10.20.0/24 — r1; r1 (10.255.0.1) — WAN 10.255.0.0/30 — r2 (10.255.0.2); r2 — 10.20.10.0/24 — pc-del (10.20.10.10); r1 (203.0.113.2) — 203.0.113.0/24 — isp (203.0.113.1)." },
      { tarefa: "Liste as diferenças entre o CSV de exemplo e o documento antigo, e para cada uma diga se corrige o documento ou o equipamento.", esperado: "1) Delegação 10.20.10.0/24 no equipamento vs 10.20.20.0/24 no documento → confirmar com o responsável; muito provavelmente corrigir o documento. 2) Ligação r1–isp não documentada → acrescentar ao documento. 3) 198.51.100.10/32 em lo do isp não aparece no CSV → limitação do script; documentar ou melhorar o script." },
      { tarefa: "Um colega quer pôr a palavra-passe de administração de cada encaminhador numa coluna do inventário «para facilitar». Responda.", esperado: "Não. O inventário é partilhado e mostra toda a rede; as credenciais ficam num cofre com acesso controlado e registo. No inventário indica-se só o cofre e o responsável." },
      { tarefa: "Que campos acrescentaria à ficha de equipamento do r1 que o script não consegue recolher?", esperado: "Função, localização, responsável, fabricante/modelo e número de série, versão do sistema, data de aquisição e garantia, contrato de suporte, dependências (serviços que param se falhar) e procedimento de recuperação." },
    ],
    formativas: [
      { pergunta: "Porque o script termina com código 1 quando um equipamento não responde?", opcoes: ["Para apagar o CSV", "Para que quem o executa ou agenda saiba que o inventário está incompleto", "Porque o Python obriga", "Para reiniciar o equipamento"], certa: 1, comentario: "Um inventário incompleto que parece completo é perigoso. O código de saída e a mensagem de erro permitem detectar a falha automaticamente." },
      { pergunta: "O inventário gerado automaticamente substitui a documentação?", opcoes: ["Sim, completamente", "Não: mostra o estado real, mas não a função, o responsável nem se o estado está correcto; compara-se com o documentado", "Sim, se tiver endereços MAC", "Não, porque o JSON é ilegível"], certa: 1, comentario: "A recolha mostra o que existe; a documentação diz o que devia existir e porquê. As diferenças entre os dois são as pendências a resolver." },
    ],
    leituraFacil: [
      "O inventário é a lista de tudo o que há na rede.",
      "O diagrama mostra como tudo está ligado.",
      "Um programa pode recolher a lista automaticamente.",
      "Compare a lista nova com os papéis antigos.",
      "Nunca escreva palavras-passe no inventário.",
    ],
    guiao: {
      conducao: [
        "0–20 min: inventário, diagrama lógico e físico, ficha de equipamento; o que não se escreve; recolha automática e confronto com a documentação.",
        "20–60 min: prática em duplas (script, CSV, teste de erro, teste de repetido, diagrama e diferenças); quem não tiver laboratório faz o diagrama e as diferenças em papel a partir do CSV de exemplo.",
        "60–70 min: formativas e correcção comentada.",
      ],
      errosComuns: [
        "Tratar o CSV gerado como documentação completa.",
        "Esquecer de retirar o endereço repetido de teste.",
        "Guardar credenciais no inventário ou no diagrama.",
        "Scripts que falham em silêncio e deixam um ficheiro incompleto.",
      ],
    },
    fontes: ["nist80034", "nist800128", "iproute2", "pythonstd", "rfc1918", "rfc5737"],
  },

  "r-m11-l2": {
    objectivos: [
      "Explicar a arquitectura SNMP (gestor, agente, MIB, OID) e porque se prefere SNMPv3 com autenticação e cifra (authPriv) às comunidades v1/v2c.",
      "Configurar um agente SNMPv3 de prática, isolado no espaço de nomes srv, e consultá-lo com um cliente que não expõe segredos na linha de comando.",
      "Calcular a utilização de uma interface a partir de contadores e definir um alerta com limiar, persistência e histerese justificados.",
      "Distinguir falta de dados (agente sem resposta) de valor normal, e tratar reinícios de contador.",
    ],
    explicacao: [
      {
        titulo: "SNMP e segurança",
        paragrafos: [
          "No SNMP, o gestor pergunta e o agente, no equipamento, responde. Cada valor tem um identificador numérico (OID) definido numa MIB; por exemplo, a IF-MIB (RFC 2863) define ifName (nome da interface) e ifHCInOctets (bytes recebidos, contador de 64 bits). Os contadores só crescem; a utilização calcula-se pela diferença entre duas leituras a dividir pelo tempo entre elas.",
          "SNMPv1 e v2c usam uma «comunidade» enviada em claro: quem capturar o tráfego fica a conhecê-la. SNMPv3 com o modelo USM (RFC 3414, arquitectura no RFC 3411) acrescenta utilizadores, autenticação e cifra: o nível authPriv autentica (aqui HMAC-SHA-256, RFC 7860) e cifra (AES, RFC 3826). Mesmo assim, o agente só deve responder na rede de gestão, com acesso de leitura limitado e segredos guardados num cofre. Nesta prática o agente escuta só em 10.10.20.53, dentro do espaço de nomes srv: não fica visível na rede da VM nem da instituição.",
        ],
      },
      {
        titulo: "Alertas que merecem ser atendidos",
        paragrafos: [
          "Um alerta útil diz o quê, onde, desde quando e o que fazer, e tem um responsável. Limiar sem persistência gera alarmes por picos de segundos; persistência (várias amostras seguidas) confirma que o problema dura. Histerese — limiar de entrada maior do que o de saída, aqui 80 % e 70 % — evita que o alerta ligue e desligue sem parar quando o valor anda à volta do limiar. Os números justificam-se pelo serviço: acima de cerca de 80 % de utilização sustentada, as filas crescem e o atraso sobe (módulo 10), por isso é altura de investigar, não de entrar em pânico.",
          "Na prática usam-se ciclos de 10 s para caber na aula; em produção são comuns amostras de 1 a 5 minutos. «Sem dados» é um estado próprio: não é zero nem normal. A capacidade usada no cálculo é a declarada pela equipa (contrato ou velocidade da porta); nas interfaces virtuais da prática o valor reportado pelo agente não corresponde a uma ligação real.",
        ],
      },
    ],
    caso: "Na DPE (fictícia), a ligação ao servidor fica saturada sem que ninguém saiba até os utilizadores reclamarem. O chefe aprova: monitorizar por SNMPv3 authPriv a interface do srv, capacidade declarada 10 Mbit/s; alertar acima de 80 % em 3 amostras seguidas e voltar ao normal abaixo de 70 % em 2 amostras; alertar se o agente não responder em 3 amostras. Todos os valores e segredos são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Agente SNMP: snmpd em primeiro plano no espaço de nomes srv, a escutar só em 10.10.20.53 UDP 161, com configuração e directório persistente próprios em /tmp/dpe-m11/l2.",
        "Gestor: script monitor.py no pc-adm. Tráfego de carga: iperf3 UDP do pc-del para o srv.",
        "Nota: no Debian, instalar o pacote snmpd activa o serviço do sistema a escutar em 127.0.0.1. Esta lição não usa nem altera esse serviço; como a VM é descartável, a situação fica registada.",
      ],
      passos: [
        PRE_M11,
        { accao: "Prepare a pasta, a configuração do agente, o utilizador USM (segredos fictícios) e a configuração do cliente. Restrinja as permissões dos ficheiros com segredos.", comandos: ["mkdir -p /tmp/dpe-m11/l2/agente-persist /tmp/dpe-m11/l2/cliente /tmp/dpe-m11/l2/cliente-persist && cd /tmp/dpe-m11/l2", "cat > snmpd.conf <<'EOF'", ...SNMPD_CONF, "EOF", "cat > agente-persist/snmpd.conf <<'EOF'", ...SNMPD_UTILIZADOR, "EOF", "cat > cliente/snmp.conf <<'EOF'", ...SNMP_CLIENTE, "EOF", "chmod 600 agente-persist/snmpd.conf cliente/snmp.conf"] },
        { accao: "Consola C: inicie o agente em primeiro plano no srv, só com esta configuração (-C ignora os ficheiros do sistema). Espere pela linha «NET-SNMP version … ».", comandos: ["C: sudo ip netns exec srv env SNMP_PERSISTENT_DIR=/tmp/dpe-m11/l2/agente-persist snmpd -f -Lo -C -c /tmp/dpe-m11/l2/snmpd.conf"], saida: ["NET-SNMP version 5.9.3"] },
        { accao: "Consulte o agente a partir do pc-adm: tempo de funcionamento e nomes das interfaces (OIDs numéricos, pois o Debian não instala todas as MIB por omissão).", comandos: ["export CLI='env SNMPCONFPATH=/tmp/dpe-m11/l2/cliente SNMP_PERSISTENT_DIR=/tmp/dpe-m11/l2/cliente-persist'", "sudo ip netns exec pc-adm $CLI snmpget -On 10.10.20.53 1.3.6.1.2.1.1.3.0", "sudo ip netns exec pc-adm $CLI snmpwalk -On 10.10.20.53 1.3.6.1.2.1.31.1.1.1.1"], saida: [".1.3.6.1.2.1.1.3.0 = Timeticks: (2310) 0:00:23.10", ".1.3.6.1.2.1.31.1.1.1.1.1 = STRING: lo", ".1.3.6.1.2.1.31.1.1.1.1.2 = STRING: srv-r1", "(o número de índice pode variar)"] },
        { accao: "Confirme a segurança: sem cifra, com segredo errado e com comunidade v2c o agente recusa ou não responde.", comandos: ["sudo ip netns exec pc-adm $CLI snmpget -l authNoPriv 10.10.20.53 1.3.6.1.2.1.1.3.0", "sudo ip netns exec pc-adm $CLI snmpget -A SegredoErrado-000 10.10.20.53 1.3.6.1.2.1.1.3.0", "sudo ip netns exec pc-adm snmpget -v2c -c public -t 1 -r 0 10.10.20.53 1.3.6.1.2.1.1.3.0"], saida: ["Error in packet … Reason: authorizationError (access denied to that object)", "snmpget: Authentication failure (incorrect password, community or key)", "Timeout: No Response from 10.10.20.53"] },
        { accao: "Grave o script de monitorização (texto completo abaixo) e inicie-o na consola M.", comandos: ["cat > monitor.py <<'EOF'", ...SCRIPT_MONITOR, "EOF", "M: sudo ip netns exec pc-adm env SNMPCONFPATH=/tmp/dpe-m11/l2/cliente SNMP_PERSISTENT_DIR=/tmp/dpe-m11/l2/cliente-persist python3 /tmp/dpe-m11/l2/monitor.py"], saida: ["srv-r1 = ifIndex 2; capacidade declarada 10 Mbit/s; Ctrl+C para parar", "12:00:10 utilização   0.0%  estado NORMAL"] },
        { accao: "Gere carga de cerca de 9 Mbit/s durante 60 s (consola D: servidor iperf3, esperar «Server listening»; consola B: cliente) e observe o alerta e o regresso ao normal.", comandos: ["D: sudo ip netns exec srv iperf3 -s -1 -B 10.10.20.53", "B: sudo ip netns exec pc-del iperf3 -c 10.10.20.53 -u -b 9M -t 60"], saida: ["12:00:20 utilização  92.4%  estado NORMAL", "12:00:30 utilização  92.6%  estado NORMAL", "12:00:40 ALERTA: entrada em srv-r1 acima de 80 % em 3 ciclos seguidos", "12:00:40 utilização  92.5%  estado ALERTA", "…", "12:01:30 utilização   8.1%  estado ALERTA", "12:01:40 NORMAL: entrada abaixo de 70 % em 2 ciclos seguidos", "(a percentagem inclui cabeçalhos Ethernet, IP e UDP, por isso passa um pouco dos 90 %)"] },
        { accao: "Teste a falta de dados: Ctrl+C no agente (consola C) e observe três ciclos; volte a iniciar o agente com o mesmo comando do passo 3 e observe o tratamento do contador.", comandos: ["C: Ctrl+C; depois repetir o comando do passo 3"], saida: ["12:02:10 SEM DADOS (Timeout: No Response from 10.10.20.53.)", "12:02:20 SEM DADOS (…)", "12:02:30 SEM DADOS (…)", "12:02:30 ALERTA: agente não responde há 3 ciclos", "12:02:50 utilização   0.0%  estado NORMAL"] },
      ],
      sucesso: [
        "O agente responde em authPriv e recusa authNoPriv, segredo errado e v2c.",
        "Nenhum segredo aparece na linha de comando nem nos registos da dupla; os ficheiros com segredos têm permissões 600.",
        "O alerta dispara só depois de 3 amostras acima de 80 % e desliga só depois de 2 abaixo de 70 %.",
        "A falta de resposta aparece como «SEM DADOS» e gera o alerta próprio; o script não inventa valores.",
        "A dupla escreve, para o alerta de utilização, a acção esperada e o responsável.",
      ],
      reversao: [
        "Ctrl+C nas consolas M (monitor), C (agente) e D (iperf3, se ainda estiver à espera). Não usar pkill/killall.",
        "Verificar: sudo ip netns pids srv e sudo ip netns pids pc-adm não listam snmpd, iperf3 nem python3.",
        "rm -r /tmp/dpe-m11/l2 (apaga configurações, segredos fictícios e script). O serviço snmpd do sistema da VM não foi tocado.",
      ],
    },
    papel: [
      { tarefa: "Duas leituras de ifHCInOctets com 10 s de intervalo: 1 000 000 e 12 500 000. Capacidade declarada 10 Mbit/s. Calcule a utilização.", esperado: "(12 500 000 − 1 000 000) × 8 / 10 = 9 200 000 bit/s = 9,2 Mbit/s → 92 %." },
      { tarefa: "Sequência de utilizações (uma por ciclo): 85, 60, 90, 88, 83, 75, 72, 65, 68 %. Em que ciclo dispara e em que ciclo desliga o alerta, com as regras do caso?", esperado: "Dispara no 5.º ciclo (90, 88, 83: três seguidas acima de 80 %; o 85 foi interrompido pelo 60). Os ciclos 6 e 7 (75, 72) não baixam de 70 %. Desliga no 9.º ciclo (65 e 68: duas seguidas abaixo de 70 %)." },
      { tarefa: "Porque não se usa SNMPv2c com a comunidade «public» nesta rede?", esperado: "A comunidade vai em claro e é conhecida; qualquer pessoa na rede lê os dados e, se houver escrita, altera. SNMPv3 authPriv autentica o utilizador e cifra o conteúdo." },
      { tarefa: "O script não conseguiu ler o agente durante 3 ciclos. Um colega quer mostrar «0 %» no painel nesses ciclos. Comente.", esperado: "Errado: 0 % significaria ligação parada mas medida. A falta de dados é outro estado e deve gerar o alerta «agente não responde»; mostrar 0 % esconde o problema." },
    ],
    formativas: [
      { pergunta: "Para que serve a histerese (80 % para entrar em alerta, 70 % para sair)?", opcoes: ["Para aumentar a largura de banda", "Para evitar que o alerta ligue e desligue repetidamente quando o valor oscila perto do limiar", "Para cifrar o SNMP", "Para reduzir o número de OID"], certa: 1, comentario: "Com um só limiar, um valor a oscilar entre 79 e 81 % geraria um alerta a cada ciclo. Limiares diferentes para entrar e sair estabilizam o estado." },
      { pergunta: "Qual o nível de segurança SNMPv3 que autentica e cifra?", opcoes: ["noAuthNoPriv", "authNoPriv", "authPriv", "v2c"], certa: 2, comentario: "authPriv usa autenticação (por exemplo HMAC-SHA-256) e cifra (AES). authNoPriv autentica mas deixa o conteúdo legível; v2c usa comunidade em claro." },
    ],
    leituraFacil: [
      "A monitorização vigia a rede o tempo todo.",
      "O SNMP pergunta números aos equipamentos.",
      "Use a versão 3 com palavra-passe e cifra.",
      "O alerta só toca se o problema durar.",
      "Sem resposta não é zero: é outro alerta.",
      "Cada alerta deve dizer o que fazer e quem faz.",
    ],
    guiao: {
      conducao: [
        "0–20 min: gestor, agente, MIB e OID; contadores e cálculo de utilização; v2c em claro vs v3 authPriv; alertas com limiar, persistência, histerese e responsável.",
        "20–65 min: prática em duplas (agente isolado, consultas, testes de segurança, script, carga, falta de dados); quem não tiver laboratório resolve as contas e a sequência de alertas em papel.",
        "65–75 min: formativas e correcção comentada.",
      ],
      errosComuns: [
        "Deixar comunidades v2c activas «por compatibilidade».",
        "Escrever segredos na linha de comando (ficam no histórico e na lista de processos).",
        "Pôr o agente a escutar em todas as interfaces.",
        "Alertar em cada pico sem persistência nem histerese.",
        "Mostrar «0 %» quando não há dados.",
        "Esquecer que a capacidade é declarada pela equipa, não medida pelo SNMP.",
      ],
    },
    fontes: ["rfc3411", "rfc2863", "rfc3826", "rfc7860", "netsnmp", "pythonstd", "iperf3"],
  },

  "r-m11-l3": {
    objectivos: [
      "Explicar a estrutura de uma mensagem syslog (RFC 5424: facilidade, severidade, data, origem, programa, mensagem) e porque se centralizam os registos.",
      "Montar um receptor rsyslog de prática, isolado, que guarda um ficheiro por origem, e enviar-lhe eventos de r1 e r2.",
      "Analisar registos com um script que resume por origem e severidade e detecta falhas de autenticação repetidas, tratando linhas inválidas.",
      "Reconhecer limites: relógios dessincronizados, perda de mensagens em UDP, falta de autenticação e cifra no transporte, e retenção.",
    ],
    explicacao: [
      {
        titulo: "Syslog e centralização",
        paragrafos: [
          "Cada mensagem syslog tem facilidade (a origem lógica: kern, auth, daemon, local0…), severidade de 0 (emerg) a 7 (debug), data, nome ou endereço de quem enviou, programa e texto (RFC 5424). Guardar os registos só no próprio equipamento é arriscado: perdem-se se o equipamento avariar e quem o comprometer pode apagá-los. Um receptor central guarda cópias, permite comparar equipamentos na mesma linha temporal e aplicar regras de detecção (NIST SP 800-92).",
          "Para comparar tempos, todos os relógios têm de estar sincronizados por NTP (RFC 5905; por exemplo com chrony). O receptor pode registar a hora a que recebeu (timegenerated) e a hora indicada pelo emissor (timereported); nesta prática usa-se a hora de recepção, porque todos os espaços de nomes partilham o relógio da VM. O syslog em UDP é simples mas pode perder mensagens sem aviso e não autentica nem cifra; em produção prefere-se TCP com TLS, suportado pelo rsyslog, numa rede de gestão.",
        ],
      },
      {
        titulo: "Das linhas aos eventos",
        paragrafos: [
          "Ninguém lê milhares de linhas. Primeiro resume-se (quantos eventos por origem e severidade) para ver o que mudou; depois aplicam-se regras com critério explícito, por exemplo «5 ou mais falhas de autenticação da mesma origem em 60 s». O número vem da política: poucas falhas seguidas são típicas de engano humano; muitas em pouco tempo sugerem tentativa automática. Qualquer regra tem falsos positivos e falsos negativos; ajusta-se com o histórico e regista-se a justificação.",
          "A análise trata linhas que não seguem o formato esperado sem parar e conta-as: um aumento de linhas inválidas também é um sinal (formato mudou, fonte nova, mensagem truncada). Registos contêm dados pessoais (utilizadores, endereços): define-se quem os lê e por quanto tempo se guardam.",
        ],
      },
    ],
    caso: "Na DPE (fictícia), um encaminhador da delegação reiniciou-se de madrugada e ninguém soube porquê: os registos estavam só no equipamento e perderam-se. O chefe aprova um receptor central na rede de gestão e pede uma regra para detectar tentativas repetidas de acesso aos encaminhadores. Todos os eventos são fictícios e gerados na aula.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Receptor: rsyslogd em primeiro plano no srv, num endereço extra 10.10.20.14/24 acrescentado só para esta lição, UDP 514, configuração própria em /tmp/dpe-m11/l3.",
        "Emissores: r1 (chega ao receptor como 10.10.20.1) e r2 (chega como 10.255.0.2, via rotas do módulo 3), com o comando logger.",
        "Não se altera o rsyslog do sistema da VM.",
      ],
      passos: [
        PRE_M11,
        { accao: "Prepare pastas, configuração do receptor e o endereço extra do srv (confirme antes que 10.10.20.14 não está em uso).", comandos: ["sudo ip netns exec srv ping -c 1 -W 1 10.10.20.14 >/dev/null && echo 'EM USO: parar' || echo 'livre'", "mkdir -p /tmp/dpe-m11/l3/registos /tmp/dpe-m11/l3/trabalho && cd /tmp/dpe-m11/l3", "cat > rsyslog.conf <<'EOF'", ...RSYSLOG_CONF, "EOF", "sudo ip -n srv addr add 10.10.20.14/24 dev srv-r1"], saida: ["livre"] },
        { accao: "Consola F: valide a configuração e inicie o receptor em primeiro plano, com ficheiro de PID próprio.", comandos: ["sudo rsyslogd -N1 -f /tmp/dpe-m11/l3/rsyslog.conf", "F: sudo ip netns exec srv rsyslogd -n -f /tmp/dpe-m11/l3/rsyslog.conf -i /tmp/dpe-m11/l3/rsyslogd.pid"], saida: ["rsyslogd: version 8.2302.0, config validation run (level 1), master config /tmp/dpe-m11/l3/rsyslog.conf", "rsyslogd: End of config validation run. Bye."] },
        { accao: "Envie eventos fictícios: r2 avisa uma queda de ligação; r1 regista 6 falhas de autenticação da mesma origem em poucos segundos e uma gravação de configuração.", comandos: ["sudo ip netns exec r2 logger -n 10.10.20.14 -P 514 -d --rfc5424 -t kernel -p kern.warning 'r2-r1: link down (simulado)'", "for i in 1 2 3 4 5 6; do sudo ip netns exec r1 logger -n 10.10.20.14 -P 514 -d --rfc5424 -t sshd -p auth.warning \"Failed password for invalid user admin from 10.20.10.10 port 5012$i ssh2\"; sleep 2; done", "sudo ip netns exec r1 logger -n 10.10.20.14 -P 514 -d --rfc5424 -t config -p local0.info 'configuracao gravada por tecnico1 (simulado)'", "ls registos/; tail -n 3 registos/10.10.20.1.log"], saida: ["10.10.20.1.log  10.255.0.2.log", "2026-09-28T12:10:12.401+02:00 10.10.20.1 warning sshd  Failed password for invalid user admin from 10.20.10.10 port 50126 ssh2", "2026-09-28T12:10:13.020+02:00 10.10.20.1 info config  configuracao gravada por tecnico1 (simulado)", "(fuso e horas variam)"] },
        { accao: "Acrescente uma linha estragada para testar a robustez e grave o script de análise (texto completo abaixo).", comandos: ["echo 'linha sem formato' >> registos/10.10.20.1.log", "cat > analisar.py <<'EOF'", ...SCRIPT_ANALISAR, "EOF"] },
        { accao: "Analise todos os ficheiros e também um ficheiro inexistente, para ver a mensagem de erro sem parar a análise.", comandos: ["python3 analisar.py registos/*.log registos/nao-existe.log; echo \"código=$?\""], saida: ["ERRO: [Errno 2] No such file or directory: 'registos/nao-existe.log'", "Eventos por origem e severidade:", "  10.10.20.1   info     1", "  10.10.20.1   warning  6", "  10.255.0.2   warning  1", "ALERTA: 5+ falhas de autenticação de 10.20.10.10 em 60 s (desde 12:10:02)", "Linhas ignoradas por formato inválido: 1", "código=0"] },
        { accao: "Escreva a ficha da regra: critério, justificação, acção esperada (confirmar com o responsável de r1, ver se 10.20.10.10 é um posto conhecido, bloquear se não autorizado), responsável e retenção proposta dos registos.", comandos: ["nano /tmp/dpe-m11/l3/regra-falhas.txt"] },
      ],
      sucesso: [
        "Existem dois ficheiros, um por origem, com as linhas no formato do modelo.",
        "O script conta 8 eventos válidos, ignora 1 linha inválida, avisa o ficheiro inexistente e emite o alerta das falhas.",
        "A dupla explica porque a regra usa a origem (10.20.10.10) e não o emissor (10.10.20.1).",
        "A ficha da regra tem critério, justificação, acção, responsável e retenção.",
      ],
      reversao: [
        "Ctrl+C na consola F (receptor). Não usar pkill/killall. Confirmar: sudo ip netns pids srv não lista rsyslogd.",
        "sudo ip -n srv addr del 10.10.20.14/24 dev srv-r1",
        "rm -r /tmp/dpe-m11/l3 (registos fictícios, configuração, script). O rsyslog do sistema da VM não foi tocado.",
      ],
    },
    papel: [
      { tarefa: "Linhas de exemplo: falhas sshd de 10.20.10.10 às 12:10:02, :04, :06, :08, :10, :12. Com a regra «5 em 60 s», há alerta? E se as falhas fossem às 12:00, 12:02, 12:04, 12:06, 12:08?", esperado: "Primeiro caso: sim, 5 falhas entre 12:10:02 e 12:10:10 (8 s). Segundo caso: não, as 5 falhas espalham-se por 8 minutos; nenhuma janela de 60 s tem 5." },
      { tarefa: "Resuma por origem e severidade as linhas da saída de exemplo.", esperado: "10.10.20.1: 6 warning (sshd) e 1 info (config). 10.255.0.2: 1 warning (kernel). Mais 1 linha inválida." },
      { tarefa: "O relógio de r2 está 7 minutos adiantado e o receptor usa a hora do emissor. Que problema surge na investigação da queda?", esperado: "Os eventos de r2 aparecem fora de ordem face aos de r1 e do servidor; conclusões de causa e efeito ficam erradas. Solução: NTP em todos os equipamentos e, na análise, saber que hora se está a usar." },
      { tarefa: "Porque é perigoso guardar os registos só no próprio encaminhador?", esperado: "Perdem-se com avaria ou reinício (como no caso) e quem comprometer o equipamento pode apagá-los. O receptor central guarda cópias com acesso controlado." },
    ],
    formativas: [
      { pergunta: "Qual é uma limitação do syslog sobre UDP?", opcoes: ["Não tem severidade", "Pode perder mensagens sem aviso e não autentica nem cifra", "Só funciona em IPv6", "Exige SNMPv3"], certa: 1, comentario: "O UDP não confirma a entrega. Em produção usa-se TCP com TLS e uma rede de gestão; o transporte deve constar da política de registos." },
      { pergunta: "Porque o script conta as linhas inválidas em vez de parar?", opcoes: ["Para esconder erros", "Para continuar a análise e mostrar que algo mudou no formato ou na fonte", "Porque o Python não consegue parar", "Para apagar as linhas"], certa: 1, comentario: "Uma linha estragada não deve impedir a análise das restantes; mas o número de linhas inválidas é informação útil e é mostrado." },
    ],
    leituraFacil: [
      "Os equipamentos escrevem mensagens chamadas registos.",
      "Guarde os registos num servidor central.",
      "Todos os relógios têm de ter a mesma hora.",
      "Um programa pode contar e procurar problemas nos registos.",
      "Muitas palavras-passe erradas em pouco tempo é um alerta.",
      "Os registos têm dados pessoais: guarde com cuidado.",
    ],
    guiao: {
      conducao: [
        "0–20 min: estrutura syslog e severidades; centralização; NTP e horas; UDP vs TCP com TLS; resumos e regras com critério; dados pessoais e retenção.",
        "20–65 min: prática em duplas (receptor isolado, eventos, linha estragada, análise, ficha da regra); quem não tiver laboratório resolve as tarefas em papel com as linhas de exemplo.",
        "65–75 min: formativas e correcção comentada.",
      ],
      errosComuns: [
        "Confundir o emissor do registo (r1) com a origem do ataque (10.20.10.10).",
        "Ignorar a sincronização dos relógios.",
        "Pôr o receptor a escutar em todos os endereços ou fora da rede de gestão.",
        "Esquecer de retirar o endereço extra 10.10.20.14 do srv.",
        "Guardar registos sem prazo de retenção nem controlo de acesso.",
      ],
    },
    fontes: ["rfc5424", "rfc5905", "nist80092", "rsyslog", "chrony", "pythonstd"],
  },

  "r-m11-l4": {
    objectivos: [
      "Explicar gestão de configurações: linha de base aprovada, controlo de alterações, detecção de desvios e registo de quem mudou o quê e quando.",
      "Exportar automaticamente o estado de r1 e r2 para ficheiros de texto versionados em git, com um script de shell com tratamento de erros.",
      "Detectar uma alteração não autorizada pela diferença no git e repor a linha de base, verificando depois.",
      "Fazer uma cópia de segurança com soma de verificação, testar a reposição e explicar a regra 3-2-1 e porque segredos não entram no repositório.",
    ],
    explicacao: [
      {
        titulo: "Linha de base, alterações e desvios",
        paragrafos: [
          "A linha de base é a configuração aprovada de cada equipamento. Qualquer mudança passa por um pedido: o quê, porquê, risco, plano de reversão, aprovação, execução e verificação. Um desvio é uma diferença entre o equipamento e a linha de base que não tem pedido aprovado — pode ser um erro, um remendo esquecido ou um ataque. O NIST SP 800-128 descreve este ciclo.",
          "Exportar as configurações para texto e guardá-las num sistema de controlo de versões (git) dá histórico completo: cada exportação é um registo com data e autor, e 'git diff' mostra linha a linha o que mudou. Em equipamentos reais exporta-se a configuração do fabricante (por SSH, API ou ficheiro); nesta prática exportam-se endereços, rotas, regras nftables e filas.",
        ],
      },
      {
        titulo: "Cópias de segurança que se conseguem repor",
        paragrafos: [
          "Uma cópia só vale se a reposição tiver sido testada. A regra 3-2-1 é uma prática corrente: 3 cópias, em 2 suportes diferentes, 1 fora do local. Uma soma de verificação (SHA-256) guardada com a cópia permite confirmar que o ficheiro não se estragou nem foi alterado. Os planos de contingência (NIST SP 800-34) definem o que se copia, com que frequência e em quanto tempo se tem de repor.",
          "Configurações exportadas podem conter segredos (chaves, cadeias SNMP, palavras-passe). Esses segredos não entram no repositório: ficam num cofre, e o repositório tem regras de exclusão (.gitignore) e revisão antes de cada envio. O próprio repositório e as cópias têm acesso restrito, porque descrevem toda a rede.",
        ],
      },
    ],
    caso: "Na DPE (fictícia), numa sexta-feira a delegação deixou de chegar a um serviço e ninguém sabia o que tinha mudado. Descobriu-se depois uma rota acrescentada «para testar» e esquecida. O chefe aprova: exportação diária das configurações para git, verificação de desvios e cópia semanal com reposição testada. Todos os dados são fictícios.",
    pratica: {
      topologia: [
        ...TOPOLOGIA_BASE,
        "Repositório: /tmp/dpe-m11/l4/configs (git, só na VM). Cópias: /tmp/dpe-m11/l4/copias. Teste de reposição: /tmp/dpe-m11/l4/reposicao.",
        "A alteração não autorizada é uma rota fictícia 10.99.0.0/24 no r1, acrescentada pelo formador e retirada na própria lição.",
      ],
      passos: [
        PRE_M11,
        { accao: "Crie o repositório com identidade local (só para este repositório), a exclusão de segredos e o script de exportação (texto completo abaixo).", comandos: ["sudo mkdir -p /tmp/dpe-m11/l4/configs /tmp/dpe-m11/l4/copias && cd /tmp/dpe-m11/l4", "sudo git -C configs init -q && sudo git -C configs config user.name 'Tecnico Pratica' && sudo git -C configs config user.email 'ti@dpe.example'", "printf '*.segredo\\n*.key\\n' | sudo tee configs/.gitignore >/dev/null", "sudo tee exportar.sh >/dev/null <<'EOF'", ...SCRIPT_EXPORTAR, "EOF"] },
        { accao: "Primeira exportação: é a linha de base aprovada.", comandos: ["sudo sh exportar.sh", "sudo git -C configs log --oneline"], saida: ["Alterações registadas:", "3f2a1c0 Exportação 2026-09-28 12:20:05 por formando", " .gitignore         | 2 ++", " r1/enderecos.txt   | 5 +++++", " r1/rotas.txt       | 5 +++++", " …", " 9 files changed, …", "3f2a1c0 Exportação 2026-09-28 12:20:05 por formando"] },
        { accao: "Repita sem mudanças: o script não cria registos vazios.", comandos: ["sudo sh exportar.sh"], saida: ["Sem alterações desde a última exportação."] },
        { accao: "Formador (sem avisar): acrescenta uma rota não autorizada. Formandos: exportem e vejam a diferença.", comandos: ["Formador: sudo ip -n r1 route add 10.99.0.0/24 via 10.255.0.2", "sudo sh exportar.sh", "sudo git -C configs diff HEAD~1 -- r1/rotas.txt"], saida: ["Alterações registadas:", "8b7e9d2 Exportação 2026-09-28 12:24:40 por formando", " r1/rotas.txt | 1 +", "+10.99.0.0/24 via 10.255.0.2 dev r1-r2"] },
        { accao: "Sem pedido aprovado para esta rota: reponha a linha de base (retirar a rota), exporte e confirme que o estado volta a ser igual à linha de base.", comandos: ["sudo ip -n r1 route del 10.99.0.0/24 via 10.255.0.2", "sudo sh exportar.sh", "sudo git -C configs diff $(sudo git -C configs rev-list --max-parents=0 HEAD) HEAD -- r1/ r2/ && echo 'igual à linha de base'"], saida: ["Alterações registadas:", "c41d5aa Exportação 2026-09-28 12:26:02 por formando", " r1/rotas.txt | 1 -", "igual à linha de base"] },
        { accao: "Teste do tratamento de erros: sem sudo o script recusa e termina com código 1 (a verificação do repositório em falta funciona da mesma forma).", comandos: ["sh exportar.sh; echo \"código=$?\""], saida: ["ERRO: executar com sudo.", "código=1"] },
        { accao: "Cópia de segurança com soma SHA-256 e teste de reposição numa pasta separada.", comandos: ["cd /tmp/dpe-m11/l4 && sudo tar -czf copias/configs-$(date +%F).tar.gz -C /tmp/dpe-m11/l4 configs", "cd copias && sudo sh -c 'sha256sum configs-*.tar.gz > SHA256SUMS' && sha256sum -c SHA256SUMS", "sudo mkdir -p ../reposicao && sudo tar -xzf configs-*.tar.gz -C ../reposicao", "sudo diff -r ../configs ../reposicao/configs && echo 'reposição idêntica'", "sudo git -C ../reposicao/configs log --oneline | wc -l"], saida: ["configs-2026-09-28.tar.gz: OK", "reposição idêntica", "3"] },
      ],
      sucesso: [
        "O histórico git tem a linha de base, o desvio e a reposição, cada um com data e autor.",
        "A diferença mostra exactamente a rota 10.99.0.0/24; depois da reposição, r1 e r2 estão iguais à linha de base.",
        "O script recusa correr sem sudo e não cria registos quando nada mudou.",
        "A soma SHA-256 confere e a reposição é idêntica, com o histórico completo.",
        "A dupla explica a regra 3-2-1 e onde ficariam as outras duas cópias numa instituição real.",
      ],
      reversao: [
        "Confirmar que a rota de teste não ficou: sudo ip -n r1 route show 10.99.0.0/24 não deve mostrar nada (se mostrar: sudo ip -n r1 route del 10.99.0.0/24 via 10.255.0.2).",
        "Guardar o que for preciso fora da VM e depois: sudo rm -r /tmp/dpe-m11/l4 (repositório, cópias e reposição, todos só da lição).",
      ],
    },
    papel: [
      { tarefa: "Interprete esta diferença do git em r1/rotas.txt: «+10.99.0.0/24 via 10.255.0.2 dev r1-r2» e «-10.20.10.0/24 via 10.255.0.2 dev r1-r2». Que impacto tem e o que faz?", esperado: "Foi acrescentada uma rota para 10.99.0.0/24 e retirada a rota para a delegação 10.20.10.0/24: a sede deixou de chegar à delegação. Verificar se há pedido aprovado; se não, repor a linha de base (repor a rota da delegação, retirar a nova), exportar e confirmar." },
      { tarefa: "Escreva um pedido de alteração para acrescentar legitimamente uma rota nova no r1.", esperado: "O quê: rota X via Y em r1. Porquê: serviço/pedido. Risco: afectar o encaminhamento existente. Janela: data e hora. Reversão: comando para retirar a rota. Verificação: ping/traceroute e exportação para git. Aprovação: responsável de TI. Executor: nome." },
      { tarefa: "A cópia semanal existe há um ano, mas nunca foi reposta. O que falta e porquê?", esperado: "Falta testar a reposição (e verificar a soma): sem isso não se sabe se a cópia está completa, legível ou se o procedimento funciona dentro do tempo exigido." },
      { tarefa: "Um colega quer guardar no repositório o ficheiro com a palavra-passe SNMPv3 «para ter tudo junto». Responda.", esperado: "Não: o histórico git guarda para sempre qualquer segredo que lá entre, e o repositório é partilhado. Segredos no cofre; o repositório tem .gitignore para *.segredo/*.key e revisão antes de cada registo." },
    ],
    formativas: [
      { pergunta: "O que é um desvio de configuração?", opcoes: ["Uma rota com métrica alta", "Uma diferença entre o estado do equipamento e a linha de base que não tem alteração aprovada", "Uma cópia de segurança antiga", "Um erro de sintaxe no git"], certa: 1, comentario: "O desvio pode ser um esquecimento, um erro ou um ataque; detecta-se comparando o estado exportado com a linha de base e trata-se com repor ou aprovar." },
      { pergunta: "Porque se calcula e guarda uma soma SHA-256 com cada cópia?", opcoes: ["Para cifrar a cópia", "Para confirmar mais tarde que o ficheiro está íntegro, sem corrupção nem alteração", "Para comprimir mais", "Para dispensar o teste de reposição"], certa: 1, comentario: "A soma confirma a integridade; não cifra nem substitui o teste de reposição. Para detectar alteração maliciosa, a soma deve ser guardada separadamente da cópia." },
    ],
    leituraFacil: [
      "Guarde a configuração aprovada de cada equipamento.",
      "Um programa exporta a configuração todos os dias.",
      "O git mostra o que mudou, quando e quem.",
      "Uma mudança sem autorização volta atrás.",
      "Uma cópia só serve se já a experimentou repor.",
      "Palavras-passe não entram no git.",
    ],
    guiao: {
      conducao: [
        "0–20 min: linha de base, pedido de alteração, desvios; exportação para git; cópias, 3-2-1, somas e teste de reposição; segredos fora do repositório.",
        "20–70 min: prática em duplas (repositório, linha de base, desvio, reposição, teste de erro, cópia e reposição); quem não tiver laboratório interpreta as diferenças e escreve o pedido de alteração em papel.",
        "70–80 min: formativas e correcção comentada.",
      ],
      errosComuns: [
        "Configurar a identidade git para todo o sistema em vez de só no repositório da prática.",
        "Guardar segredos no repositório.",
        "Nunca testar a reposição das cópias.",
        "Guardar a soma SHA-256 no mesmo sítio e sem protecção, e confiar nela contra alteração maliciosa.",
        "Deixar a rota de teste 10.99.0.0/24 no r1.",
      ],
    },
    fontes: ["nist800128", "nist80034", "git", "iproute2", "nftables", "debian"],
  },
};
