/**
 * Base comum do curso de Redes: tipos, rede de prática fictícia, fontes e
 * montagem do HTML das lições.
 *
 * REGRAS DESTE CONTEÚDO
 *  - A instituição, nomes, endereços e casos são FICTÍCIOS.
 *  - Endereços só de gamas privadas (RFC 1918) ou reservadas a documentação
 *    (RFC 5737 e RFC 3849); domínio reservado «dpe.example» (RFC 2606).
 *  - As saídas mostradas são EXEMPLOS DIDÁCTICOS escritos para a rede fictícia,
 *    não resultados de execução.
 *  - Nunca se usam alvos reais, credenciais reais nem a rede de produção.
 *  - As 2 questões formativas por lição são públicas e comentadas; não fazem
 *    parte de nenhum banco de exame.
 *
 * Vive fora de src/ para não entrar no pacote do navegador.
 */
import type { LicaoPlano } from "../../src/lib/plano-redes";
import { RESULTADOS_TDR } from "../../src/lib/plano-redes";

export type Formativa = { pergunta: string; opcoes: string[]; certa: number; comentario: string };
export type Passo = { accao: string; comandos?: string[]; saida?: string[] };

export type ConteudoLicao = {
  objectivos: string[];
  explicacao: { titulo: string; paragrafos: string[] }[];
  caso: string;
  pratica: {
    topologia: string[];
    passos: Passo[];
    sucesso: string[];
    reversao: string[];
  };
  papel: { tarefa: string; esperado: string }[];
  formativas: [Formativa, Formativa];
  leituraFacil: string[];
  guiao: { conducao: string[]; errosComuns: string[] };
  fontes: FonteChave[];
};

/** Plano de endereçamento único, usado por todas as lições. */
export const ENDERECAMENTO = [
  "Instituição fictícia: Direcção Provincial de Exemplo (DPE), com sede e uma delegação distrital. Domínio: dpe.example.",
  "VLAN 10 Administração — 10.10.10.0/24, porta de ligação 10.10.10.1 (r1).",
  "VLAN 20 Servidores — 10.10.20.0/24, porta 10.10.20.1; DNS 10.10.20.53; DHCP 10.10.20.67; registos 10.10.20.14; monitorização 10.10.20.16.",
  "VLAN 30 Visitantes (sem fios) — 10.10.30.0/24, porta 10.10.30.1.",
  "VLAN 99 Gestão dos equipamentos — 10.10.99.0/24, porta 10.10.99.1.",
  "Ligação sede–delegação — 10.255.0.0/30: r1 = 10.255.0.1, r2 = 10.255.0.2.",
  "Delegação — 10.20.10.0/24, porta 10.20.10.1 (r2).",
  "«Internet» simulada — 203.0.113.0/24: operador isp = 203.0.113.1, r1 = 203.0.113.2; servidor externo de teste 198.51.100.10.",
  "IPv6 (documentação) — 2001:db8:10::/48 na sede; VLAN 10 = 2001:db8:10:10::/64.",
];

export const TOPOLOGIA_BASE = [
  "pc-adm (10.10.10.10) — ligado a r1 pela VLAN 10.",
  "srv (10.10.20.53) — ligado a r1 pela VLAN 20.",
  "r1 (encaminhador da sede) — ligado a pc-adm, srv, r2 e isp.",
  "r2 (encaminhador da delegação) — ligado a r1 e a pc-del (10.20.10.10).",
  "isp (operador simulado) — ligado a r1 e ao servidor externo 198.51.100.10 (endereço dentro de isp).",
];

/** Script base: cria a rede isolada com espaços de nomes. Executar como root num Debian 12 de prática. */
export const SCRIPT_BASE = [
  "#!/bin/sh",
  "# lab-base.sh — rede de prática isolada DPE (fictícia). Só em computador de prática.",
  "set -e",
  "for n in pc-adm srv r1 r2 pc-del isp; do ip netns add $n; done",
  "ligar() { ip link add $1-$2 type veth peer name $2-$1; ip link set $1-$2 netns $1; ip link set $2-$1 netns $2; }",
  "ligar pc-adm r1; ligar srv r1; ligar r1 r2; ligar r2 pc-del; ligar r1 isp",
  "ip -n pc-adm addr add 10.10.10.10/24 dev pc-adm-r1",
  "ip -n r1 addr add 10.10.10.1/24 dev r1-pc-adm",
  "ip -n srv addr add 10.10.20.53/24 dev srv-r1",
  "ip -n r1 addr add 10.10.20.1/24 dev r1-srv",
  "ip -n r1 addr add 10.255.0.1/30 dev r1-r2",
  "ip -n r2 addr add 10.255.0.2/30 dev r2-r1",
  "ip -n r2 addr add 10.20.10.1/24 dev r2-pc-del",
  "ip -n pc-del addr add 10.20.10.10/24 dev pc-del-r2",
  "ip -n r1 addr add 203.0.113.2/24 dev r1-isp",
  "ip -n isp addr add 203.0.113.1/24 dev isp-r1",
  "ip -n isp addr add 198.51.100.10/32 dev lo",
  "for n in pc-adm srv r1 r2 pc-del isp; do ip -n $n link set lo up; for i in $(ip -n $n -o link show | awk -F': ' '{print $2}' | cut -d@ -f1 | grep -v '^lo$'); do ip -n $n link set $i up; done; done",
  "ip netns exec r1 sysctl -qw net.ipv4.ip_forward=1",
  "ip netns exec r2 sysctl -qw net.ipv4.ip_forward=1",
  "ip -n pc-adm route add default via 10.10.10.1",
  "ip -n srv route add default via 10.10.20.1",
  "ip -n pc-del route add default via 10.20.10.1",
  "echo 'Rede DPE criada (sem rotas entre sede e delegação: ver módulo 3).'",
];

export const SCRIPT_REMOVER = [
  "#!/bin/sh",
  "# lab-remover.sh — apaga toda a rede de prática (reversão total).",
  "for n in pc-adm srv r1 r2 pc-del isp; do ip netns del $n 2>/dev/null || true; done",
];

export const FONTES = {
  rfc791: { titulo: "IETF RFC 791 — Internet Protocol", url: "https://www.rfc-editor.org/rfc/rfc791" },
  rfc1918: { titulo: "IETF RFC 1918 — Address Allocation for Private Internets", url: "https://www.rfc-editor.org/rfc/rfc1918" },
  rfc5737: { titulo: "IETF RFC 5737 — IPv4 Address Blocks Reserved for Documentation", url: "https://www.rfc-editor.org/rfc/rfc5737" },
  rfc3849: { titulo: "IETF RFC 3849 — IPv6 Address Prefix Reserved for Documentation", url: "https://www.rfc-editor.org/rfc/rfc3849" },
  rfc4632: { titulo: "IETF RFC 4632 — Classless Inter-domain Routing (CIDR)", url: "https://www.rfc-editor.org/rfc/rfc4632" },
  rfc8200: { titulo: "IETF RFC 8200 — Internet Protocol, Version 6 (IPv6)", url: "https://www.rfc-editor.org/rfc/rfc8200" },
  rfc792: { titulo: "IETF RFC 792 — Internet Control Message Protocol", url: "https://www.rfc-editor.org/rfc/rfc792" },
  rfc826: { titulo: "IETF RFC 826 — An Ethernet Address Resolution Protocol", url: "https://www.rfc-editor.org/rfc/rfc826" },
  rfc9293: { titulo: "IETF RFC 9293 — Transmission Control Protocol", url: "https://www.rfc-editor.org/rfc/rfc9293" },
  rfc768: { titulo: "IETF RFC 768 — User Datagram Protocol", url: "https://www.rfc-editor.org/rfc/rfc768" },
  rfc1034: { titulo: "IETF RFC 1034/1035 — Domain Names", url: "https://www.rfc-editor.org/rfc/rfc1034" },
  rfc7766: { titulo: "IETF RFC 7766 — DNS Transport over TCP", url: "https://www.rfc-editor.org/rfc/rfc7766" },
  rfc7421: { titulo: "IETF RFC 7421 — Analysis of the 64-bit Boundary in IPv6 Addressing", url: "https://www.rfc-editor.org/rfc/rfc7421" },
  rfc4862: { titulo: "IETF RFC 4862 — IPv6 Stateless Address Autoconfiguration", url: "https://www.rfc-editor.org/rfc/rfc4862" },
  rfc6164: { titulo: "IETF RFC 6164 — Using 127-Bit IPv6 Prefixes on Inter-Router Links", url: "https://www.rfc-editor.org/rfc/rfc6164" },
  rfc2131: { titulo: "IETF RFC 2131 — Dynamic Host Configuration Protocol", url: "https://www.rfc-editor.org/rfc/rfc2131" },
  rfc2328: { titulo: "IETF RFC 2328 — OSPF Version 2", url: "https://www.rfc-editor.org/rfc/rfc2328" },
  rfc3022: { titulo: "IETF RFC 3022 — Traditional IP Network Address Translator", url: "https://www.rfc-editor.org/rfc/rfc3022" },
  rfc5905: { titulo: "IETF RFC 5905 — Network Time Protocol Version 4", url: "https://www.rfc-editor.org/rfc/rfc5905" },
  rfc5424: { titulo: "IETF RFC 5424 — The Syslog Protocol", url: "https://www.rfc-editor.org/rfc/rfc5424" },
  rfc2474: { titulo: "IETF RFC 2474 — Differentiated Services Field", url: "https://www.rfc-editor.org/rfc/rfc2474" },
  rfc4594: { titulo: "IETF RFC 4594 — Configuration Guidelines for DiffServ Service Classes", url: "https://www.rfc-editor.org/rfc/rfc4594" },
  rfc3550: { titulo: "IETF RFC 3550 — RTP: A Transport Protocol for Real-Time Applications", url: "https://www.rfc-editor.org/rfc/rfc3550" },
  rfc3411: { titulo: "IETF RFC 3411/3414 — Arquitectura SNMP e modelo de segurança USM (SNMPv3)", url: "https://www.rfc-editor.org/rfc/rfc3411" },
  rfc4301: { titulo: "IETF RFC 4301 — Security Architecture for the Internet Protocol (IPsec)", url: "https://www.rfc-editor.org/rfc/rfc4301" },
  rfc2865: { titulo: "IETF RFC 2865 — RADIUS", url: "https://www.rfc-editor.org/rfc/rfc2865" },
  rfc4253: { titulo: "IETF RFC 4253 — SSH Transport Layer Protocol", url: "https://www.rfc-editor.org/rfc/rfc4253" },
  rfc6238: { titulo: "IETF RFC 6238 — TOTP: Time-Based One-Time Password", url: "https://www.rfc-editor.org/rfc/rfc6238" },
  rfc5880: { titulo: "IETF RFC 5880 — Bidirectional Forwarding Detection", url: "https://www.rfc-editor.org/rfc/rfc5880" },
  rfc5798: { titulo: "IETF RFC 5798 — Virtual Router Redundancy Protocol (VRRP) v3", url: "https://www.rfc-editor.org/rfc/rfc5798" },
  ieee8021q: { titulo: "IEEE 802.1Q — Bridges and Bridged Networks (VLAN, STP/RSTP)", url: "https://standards.ieee.org/ieee/802.1Q/" },
  ieee80211: { titulo: "IEEE 802.11 — Wireless LAN", url: "https://standards.ieee.org/ieee/802.11/" },
  ieee8021x: { titulo: "IEEE 802.1X — Port-Based Network Access Control", url: "https://standards.ieee.org/ieee/802.1X/" },
  wifiwpa3: { titulo: "Wi-Fi Alliance — WPA3 Specification", url: "https://www.wi-fi.org/discover-wi-fi/security" },
  iproute2: { titulo: "Linux iproute2 — páginas de manual ip(8), ip-netns(8), bridge(8), tc(8)", url: "https://man7.org/linux/man-pages/man8/ip.8.html" },
  nftables: { titulo: "Projecto nftables — wiki oficial", url: "https://wiki.nftables.org/" },
  frr: { titulo: "FRRouting — documentação oficial (zebra, staticd, ospfd, vrrpd, vtysh)", url: "https://docs.frrouting.org/" },
  kea: { titulo: "ISC Kea DHCP — Administrator Reference Manual", url: "https://kea.readthedocs.io/" },
  bind: { titulo: "ISC BIND 9 — Administrator Reference Manual", url: "https://bind9.readthedocs.io/" },
  wireshark: { titulo: "Wireshark — User's Guide e referência de filtros de visualização", url: "https://www.wireshark.org/docs/" },
  tcpdump: { titulo: "tcpdump/libpcap — manual tcpdump(1) e pcap-filter(7)", url: "https://www.tcpdump.org/manpages/" },
  chrony: { titulo: "chrony — documentação oficial", url: "https://chrony-project.org/documentation.html" },
  rsyslog: { titulo: "rsyslog — documentação oficial", url: "https://www.rsyslog.com/doc/" },
  wireguard: { titulo: "WireGuard — documentação e wg(8)", url: "https://www.wireguard.com/quickstart/" },
  openssh: { titulo: "OpenSSH — manuais sshd_config(5) e ssh-keygen(1)", url: "https://www.openssh.com/manual.html" },
  suricata: { titulo: "Suricata — User Guide (OISF)", url: "https://docs.suricata.io/" },
  iperf3: { titulo: "iperf3 — documentação (ESnet)", url: "https://software.es.net/iperf/" },
  netsnmp: { titulo: "Net-SNMP — manuais snmpd.conf(5), snmpget(1)", url: "http://www.net-snmp.org/docs/man/" },
  nmap: { titulo: "Nmap Reference Guide", url: "https://nmap.org/book/man.html" },
  debian: { titulo: "Debian 12 «bookworm» — Manual de Segurança e pacotes oficiais", url: "https://www.debian.org/doc/manuals/securing-debian-manual/" },
  git: { titulo: "Git — documentação oficial", url: "https://git-scm.com/doc" },
  python: { titulo: "Python 3 — módulo ipaddress e subprocess (documentação oficial)", url: "https://docs.python.org/3/library/ipaddress.html" },
  nistcsf: { titulo: "NIST Cybersecurity Framework 2.0", url: "https://www.nist.gov/cyberframework" },
  nist80061: { titulo: "NIST SP 800-61 Rev. 3 — Incident Response Recommendations", url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final" },
  nist80063: { titulo: "NIST SP 800-63B — Digital Identity Guidelines: Authentication", url: "https://pages.nist.gov/800-63-4/sp800-63b.html" },
  nist80040: { titulo: "NIST SP 800-40 Rev. 4 — Enterprise Patch Management Planning", url: "https://csrc.nist.gov/pubs/sp/800/40/r4/final" },
  nist80041: { titulo: "NIST SP 800-41 Rev. 1 — Guidelines on Firewalls and Firewall Policy", url: "https://csrc.nist.gov/pubs/sp/800/41/r1/final" },
  nist80092: { titulo: "NIST SP 800-92 — Guide to Computer Security Log Management", url: "https://csrc.nist.gov/pubs/sp/800/92/final" },
  nist800115: { titulo: "NIST SP 800-115 — Technical Guide to Information Security Testing and Assessment", url: "https://csrc.nist.gov/pubs/sp/800/115/final" },
  nist80034: { titulo: "NIST SP 800-34 Rev. 1 — Contingency Planning Guide", url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final" },
  nist800153: { titulo: "NIST SP 800-153 — Guidelines for Securing WLANs", url: "https://csrc.nist.gov/pubs/sp/800/153/final" },
  nist80030: { titulo: "NIST SP 800-30 Rev. 1 — Guide for Conducting Risk Assessments", url: "https://csrc.nist.gov/pubs/sp/800/30/r1/final" },
  nist800207: { titulo: "NIST SP 800-207 — Zero Trust Architecture", url: "https://csrc.nist.gov/pubs/sp/800/207/final" },
  nist80077: { titulo: "NIST SP 800-77 Rev. 1 — Guide to IPsec VPNs", url: "https://csrc.nist.gov/pubs/sp/800/77/r1/final" },
  lei102024: { titulo: "Lei n.º 10/2024 (Moçambique) — referência do programa para protecção de dados e serviços digitais", nota: "Citada apenas como enquadramento geral do programa; não se interpretam artigos nesta lição." },
} as const satisfies Record<string, { titulo: string; url?: string; nota?: string }>;
export type FonteChave = keyof typeof FONTES;

const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const ul = (xs: string[]) => `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
const ol = (xs: string[]) => `<ol>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`;
const pre = (xs: string[], rotulo: string) =>
  `<pre aria-label="${esc(rotulo)}" tabindex="0"><code>${esc(xs.join("\n"))}</code></pre>`;

export function montarElearning(c: ConteudoLicao, l: LicaoPlano): string {
  const t = l.tempos;
  const p: string[] = [];
  p.push(
    `<p><strong>Duração:</strong> ${l.minutos} minutos (explicação ${t.explicacao}, prática guiada ${t.pratica}, verificação ${t.formativa}). Resultados dos TdR trabalhados: ${esc(l.resultados.map((r) => RESULTADOS_TDR[r]).join("; "))}.</p>`,
  );
  p.push(`<h2>Objectivos</h2>${ul(c.objectivos)}`);
  for (const e of c.explicacao) p.push(`<h2>${esc(e.titulo)}</h2>${e.paragrafos.map((x) => `<p>${esc(x)}</p>`).join("")}`);
  p.push(`<h2>Caso fictício</h2><p>${esc(c.caso)}</p>`);
  p.push(
    `<h2>Prática guiada em rede isolada</h2><p>Rede de prática fictícia, criada dentro de um computador de prática com o script base (módulo 1, lição 1). Nunca use estes passos na rede de produção nem contra endereços reais. As saídas mostradas são exemplos didácticos, não resultados de uma execução.</p><h3>Topologia (descrição em texto)</h3>${ul(c.pratica.topologia)}`,
  );
  p.push(
    `<h3>Passos</h3><ol>${c.pratica.passos
      .map(
        (s, i) =>
          `<li><p>${esc(s.accao)}</p>${s.comandos?.length ? pre(s.comandos, `Comandos do passo ${i + 1}`) : ""}${s.saida?.length ? `<p>Saída de exemplo (didáctica):</p>${pre(s.saida, `Saída de exemplo do passo ${i + 1}`)}` : ""}</li>`,
      )
      .join("")}</ol>`,
  );
  p.push(`<h3>Critérios de sucesso</h3>${ul(c.pratica.sucesso)}<h3>Como desfazer (reversão)</h3>${ul(c.pratica.reversao)}`);
  p.push(
    `<h2>Alternativa em papel: tarefas e respostas esperadas</h2><dl>${c.papel
      .map((x) => `<dt><strong>${esc(x.tarefa)}</strong></dt><dd>${esc(x.esperado)}</dd>`)
      .join("")}</dl>`,
  );
  p.push(
    `<h2>Verifique o que aprendeu</h2>${c.formativas
      .map(
        (f, i) =>
          `<h3>Questão ${i + 1}</h3><p>${esc(f.pergunta)}</p>${ol(f.opcoes)}<details><summary>Ver resposta comentada</summary><p>Resposta: ${esc(f.opcoes[f.certa] ?? "")}</p><p>${esc(f.comentario)}</p></details>`,
      )
      .join("")}`,
  );
  p.push(`<h2>Em leitura fácil</h2>${ul(c.leituraFacil)}`);
  p.push(
    `<h2>Fontes</h2>${ul(
      c.fontes.map((k) => {
        const f = FONTES[k] as { titulo: string; url?: string; nota?: string };
        return `${f.titulo}${f.url ? ` (${f.url})` : ""}${f.nota ? ` — ${f.nota}` : ""}`;
      }),
    )}`,
  );
  return p.join("\n");
}

export function montarGuiao(c: ConteudoLicao, l: LicaoPlano): string {
  const t = l.tempos;
  return [
    `<h2>Guião do formador — ${esc(l.titulo)}</h2>`,
    `<p>${l.minutos} minutos, presencial: explicação ${t.explicacao} min, prática guiada ${t.pratica} min, verificação ${t.formativa} min.</p>`,
    `<h3>Preparação</h3>${ul([
      "Confirmar, na véspera, que cada computador de prática tem Debian 12 e os pacotes da ficha do curso, e que NÃO está ligado à rede de produção durante a prática.",
      "Correr lab-remover.sh e depois lab-base.sh (módulo 1, lição 1) para começar de uma rede limpa.",
      "Imprimir a topologia, a tabela de endereçamento e as saídas de exemplo desta lição (também em letra grande).",
    ])}`,
    `<h3>Plano de endereçamento da rede de prática</h3>${ul(ENDERECAMENTO)}`,
    `<h3>Condução</h3>${ul(c.guiao.conducao)}`,
    `<h3>Erros comuns a corrigir</h3>${ul(c.guiao.errosComuns)}`,
    `<h3>Acessibilidade e baixo consumo</h3>${ul([
      "Todos os comandos podem ser escritos e lidos só com o teclado; ler em voz alta cada comando e cada saída para quem usa leitor de ecrã.",
      "A prática não precisa de internet: a rede é criada dentro do computador. Quem não tiver computador faz a alternativa em papel, com as mesmas respostas esperadas.",
      "Aceitar respostas orais; dar tempo extra; trabalhar em duplas mistas.",
    ])}`,
    `<h3>Ética e confidencialidade</h3>${ul([
      "Nada desta lição é executado contra redes, sistemas ou endereços reais sem autorização escrita.",
      "Nunca copiar para a sala configurações, palavras-passe ou registos reais da instituição.",
    ])}`,
  ].join("\n");
}
