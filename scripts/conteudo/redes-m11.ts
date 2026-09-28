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
};
