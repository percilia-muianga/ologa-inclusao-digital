/**
 * Plano curricular — curso de Redes (slug redes-avancadas-seguranca-cibernetica).
 *
 * Carga adoptada: 80 horas (tabela da secção 14, p. 29 dos TdR). A secção 6.5,
 * p. 16, indica 120 horas: a contradição está registada em
 * docs/pontos-por-validar.md e aguarda clarificação da ATDI.
 *
 * A repartição de minutos é PROPOSTA PEDAGÓGICA INTERNA da equipa.
 * Este ficheiro só tem estrutura e tempos, nenhum conteúdo.
 */

export const SLUG_CURSO = "redes-avancadas-seguranca-cibernetica";
export const CARGA_HORARIA_HORAS = 80;
export const MODALIDADE = "presencial";
export const MINUTOS_TRANSVERSAL = 120;
export const BLOCOS_AVALIACAO = [
  { chave: "diagnostico", minutos: 20 },
  { chave: "revisao", minutos: 40 },
  { chave: "exame", minutos: 60 },
] as const;
export const MINUTOS_AVALIACAO_ORIENTACAO = BLOCOS_AVALIACAO.reduce((s, b) => s + b.minutos, 0);
export const MINUTOS_CONTEUDOS = CARGA_HORARIA_HORAS * 60 - MINUTOS_TRANSVERSAL - MINUTOS_AVALIACAO_ORIENTACAO; // 4560

/** Resultados e conteúdos da secção 6.5 (pp. 16–17), resumidos em chaves. */
export const RESULTADOS_TDR = {
  R01: "Conceber, configurar e administrar redes pequenas, médias e grandes",
  R02: "Configurar routers, switches, pontos de acesso e firewalls",
  R03: "Serviços de rede: DHCP, DNS, VPN, NAT, VLAN e autenticação",
  R04: "Diagnóstico, desempenho e disponibilidade",
  R05: "Segurança desde a concepção",
  R06: "Identificar vulnerabilidades e aplicar mitigação",
  R07: "IDS/IPS, ACL e segmentação",
  R08: "Políticas, normas e boas práticas",
  R09: "Monitorização, análise de tráfego e gestão",
  R10: "Avaliações básicas de segurança e auditoria técnica",
  R11: "Incidentes: contenção, análise, recuperação e relatório",
  R12: "Protecção de dados e identidades: MFA e cifra",
  R13: "LAN, WAN, WLAN, virtualização e nuvem",
  R14: "Automação com scripts básicos",
  R15: "Documentação: diagramas, procedimentos (SOP) e contingência",
  R16: "Trabalho em equipa, projectos, ética e confidencialidade",
  R17: "Continuidade e protecção de activos digitais",
  R18: "Competências profissionais e de formador replicador",
} as const;
export type ResultadoTdr = keyof typeof RESULTADOS_TDR;

export type TemposLicao = { explicacao: number; pratica: number; formativa: number };
export type LicaoPlano = {
  chave: string;
  modulo: number;
  ordem: number;
  titulo: string;
  minutos: number;
  tempos: TemposLicao;
  resultados: ResultadoTdr[];
};
export type ModuloPlano = { ordem: number; titulo: string; minutos: number; descricao: string };

const MINUTOS_POR_ORDEM = [70, 75, 75, 80, 80];
const TEMPOS: Record<number, TemposLicao> = {
  70: { explicacao: 20, pratica: 40, formativa: 10 },
  75: { explicacao: 20, pratica: 45, formativa: 10 },
  80: { explicacao: 20, pratica: 50, formativa: 10 },
};

/** Títulos iguais aos já existentes na plataforma (IDs preservados). */
const ESTRUTURA: { titulo: string; descricao: string; licoes: [string, ResultadoTdr[]][] }[] = [
  {
    titulo: "Fundamentos de Redes de Dados",
    descricao:
      "Modelos de camadas, endereçamento IPv4/IPv6 e sub-redes, meios físicos e equipamentos, protocolos essenciais e método de diagnóstico, praticados numa rede isolada fictícia.",
    licoes: [
      ["Modelos e camadas de comunicação", ["R01", "R18"]],
      ["Endereçamento IP e sub-redes", ["R01", "R15"]],
      ["Meios físicos e equipamentos de rede", ["R01", "R02", "R13"]],
      ["Protocolos essenciais de rede", ["R03", "R09"]],
      ["Diagnosticar uma ligação de rede", ["R04", "R15"]],
    ],
  },
  {
    titulo: "Comutação e Segmentação",
    descricao:
      "Funcionamento de comutadores, VLAN 802.1Q, encaminhamento entre VLAN, redundância na rede local e verificação da segmentação.",
    licoes: [
      ["Funcionamento de comutadores", ["R02", "R13"]],
      ["Redes locais virtuais", ["R03", "R07"]],
      ["Ligações entre redes locais virtuais", ["R02", "R03"]],
      ["Redundância na rede local", ["R04", "R17"]],
      ["Configurar e verificar a segmentação", ["R05", "R07", "R15"]],
    ],
  },
  {
    titulo: "Encaminhamento de Redes",
    descricao:
      "Tabela de encaminhamento, rotas estáticas e dinâmicas, OSPF com FRRouting, NAT e diagnóstico de encaminhamento.",
    licoes: [
      ["Princípios de encaminhamento", ["R01", "R02"]],
      ["Rotas estáticas e dinâmicas", ["R02", "R13"]],
      ["Protocolos de encaminhamento", ["R01", "R02"]],
      ["Tradução de endereços de rede", ["R03", "R05"]],
      ["Diagnosticar problemas de encaminhamento", ["R04", "R15"]],
    ],
  },
  {
    titulo: "Redes Sem Fios",
    descricao:
      "Fundamentos 802.11, planeamento de cobertura e capacidade, configuração segura WPA2/WPA3, autenticação 802.1X/RADIUS e diagnóstico de interferências.",
    licoes: [
      ["Fundamentos das redes sem fios", ["R13", "R02"]],
      ["Planeamento de cobertura e capacidade", ["R01", "R13"]],
      ["Configuração segura de acesso sem fios", ["R02", "R05", "R12"]],
      ["Autenticação de utilizadores e dispositivos", ["R03", "R12"]],
      ["Diagnosticar interferências e falhas", ["R04"]],
    ],
  },
  {
    titulo: "Serviços e Disponibilidade da Rede",
    descricao:
      "DNS e DHCP com ISC BIND e Kea, sincronização de tempo e registos, noções de qualidade de serviço, monitoria de disponibilidade e cópias de configuração.",
    licoes: [
      ["Serviços de nomes e endereçamento automático", ["R03"]],
      ["Sincronização de tempo e registos", ["R09", "R11"]],
      ["Qualidade de serviço", ["R04"]],
      ["Monitoria de desempenho e disponibilidade", ["R04", "R09"]],
      ["Cópias de configuração e recuperação", ["R17", "R15", "R14"]],
    ],
  },
  {
    titulo: "Introdução à Segurança Cibernética",
    descricao:
      "Ameaça, vulnerabilidade e risco; engenharia social; contas, palavras-passe e MFA; actualizações; reporte inicial de incidentes.",
    licoes: [
      ["Ameaças, vulnerabilidades e risco", ["R06", "R08"]],
      ["Engenharia social e fraude digital", ["R08", "R16"]],
      ["Segurança de contas e palavras-passe", ["R12", "R03"]],
      ["Actualizações e protecção dos equipamentos", ["R06", "R17"]],
      ["Reporte inicial de incidentes", ["R11", "R16"]],
    ],
  },
  {
    titulo: "Defesa de Redes",
    descricao:
      "Segmentação por zonas, firewall com nftables, acesso remoto seguro com WireGuard e SSH, detecção de intrusões com Suricata e reforço de configuração.",
    licoes: [
      ["Segmentação para reduzir o impacto", ["R05", "R07"]],
      ["Firewalls e filtragem de tráfego", ["R02", "R07"]],
      ["Acesso remoto seguro", ["R03", "R12"]],
      ["Detecção de intrusões", ["R07", "R09"]],
      ["Reforço da configuração de equipamentos", ["R05", "R06", "R08"]],
    ],
  },
  {
    titulo: "Operação Segura e Resposta",
    descricao:
      "Linha de base, recolha e análise de registos, investigação de anomalias de tráfego, resposta a incidentes (NIST SP 800-61) e melhoria documentada.",
    licoes: [
      ["Estabelecer uma linha de base da rede", ["R09", "R04"]],
      ["Recolher e analisar registos", ["R09", "R11"]],
      ["Investigar anomalias de tráfego", ["R09", "R11"]],
      ["Responder a um incidente de rede", ["R11", "R16"]],
      ["Documentar e melhorar a operação", ["R15", "R11"]],
    ],
  },
  {
    titulo: "Redes de Longa Distância",
    descricao:
      "Tecnologias WAN, VPN IPsec e WireGuard, ligação sede–delegações, redundância, acordos de nível de serviço e diagnóstico WAN.",
    licoes: [
      ["Tecnologias de ligação de longa distância", ["R13"]],
      ["Redes privadas virtuais", ["R03", "R12"]],
      ["Ligações entre instituições e delegações", ["R01", "R13"]],
      ["Redundância e contratos de ligação", ["R17", "R04"]],
      ["Diagnóstico de ligações de longa distância", ["R04"]],
    ],
  },
  {
    titulo: "Qualidade de Serviço e Desempenho",
    descricao:
      "Medição com ping, mtr e iperf3, marcação DSCP, voz e vídeo, controlo de largura de banda com tc e resolução de lentidão.",
    licoes: [
      ["Medir o desempenho de uma rede", ["R04", "R09"]],
      ["Prioridade de tráfego", ["R04"]],
      ["Voz e vídeo sobre a rede", ["R04", "R13"]],
      ["Gestão de largura de banda", ["R04", "R14"]],
      ["Resolver problemas de lentidão", ["R04", "R15"]],
    ],
  },
  {
    titulo: "Gestão e Monitorização de Redes",
    descricao:
      "Inventário e diagramas, monitorização com SNMP e alertas, análise de eventos, gestão de configurações com scripts e controlo de versões, planeamento de capacidade, virtualização e nuvem.",
    licoes: [
      ["Inventário e documentação da rede", ["R15", "R17"]],
      ["Monitorização e alertas", ["R09"]],
      ["Registos e análise de eventos", ["R09", "R11"]],
      ["Gestão de configurações e cópias de segurança", ["R14", "R17"]],
      ["Planeamento de capacidade", ["R01", "R13", "R16"]],
    ],
  },
  {
    titulo: "Segurança Aplicada e Auditoria de Redes",
    descricao:
      "Controlo de acessos, segurança dos equipamentos, testes de vulnerabilidade autorizados, auditoria técnica com lista de verificação e plano de melhoria contínua.",
    licoes: [
      ["Controlo de acessos na rede", ["R07", "R12"]],
      ["Segurança de equipamentos de rede", ["R05", "R06"]],
      ["Testes de vulnerabilidade", ["R06", "R10", "R16"]],
      ["Auditoria de segurança de redes", ["R10", "R08"]],
      ["Plano de melhoria contínua", ["R08", "R15", "R18"]],
    ],
  },
];

export const MODULOS_PLANO: ModuloPlano[] = ESTRUTURA.map((m, i) => ({
  ordem: i + 1,
  titulo: m.titulo,
  descricao: m.descricao,
  minutos: MINUTOS_POR_ORDEM.reduce((s, x) => s + x, 0),
}));

export const LICOES_PLANO: LicaoPlano[] = ESTRUTURA.flatMap((m, i) =>
  m.licoes.map(([titulo, resultados], j) => {
    const minutos = MINUTOS_POR_ORDEM[j]!;
    return {
      chave: `r-m${String(i + 1).padStart(2, "0")}-l${j + 1}`,
      modulo: i + 1,
      ordem: j + 1,
      titulo,
      minutos,
      tempos: TEMPOS[minutos]!,
      resultados,
    };
  }),
);

export const NOTA_CARGA =
  "80 horas presenciais: 76 horas de módulos temáticos (12 módulos de 6 h 20 min), 2 horas do módulo transversal de Governo Digital Inclusivo e Acessibilidade, e 2 horas de avaliação e orientação (diagnóstico 20 min, revisão 40 min, exame 60 min).";

export const FICHA_CURSO = {
  objectivos:
    "No fim do curso, o formando é capaz de: conceber, configurar e administrar redes pequenas, médias e grandes; configurar encaminhadores, comutadores, pontos de acesso e firewalls; pôr a funcionar e diagnosticar DHCP, DNS, VPN, NAT, VLAN e autenticação; garantir desempenho e disponibilidade; aplicar segurança desde a concepção, segmentação, ACL e detecção de intrusões; identificar vulnerabilidades e propor mitigação; monitorizar e analisar tráfego; realizar avaliações básicas de segurança e auditoria técnica; responder a incidentes (contenção, análise, recuperação e relatório); proteger dados e identidades com MFA e cifra; trabalhar com LAN, WAN, WLAN, virtualização e nuvem; automatizar tarefas com scripts básicos; documentar com diagramas, procedimentos e planos de contingência; e trabalhar em equipa com ética e confidencialidade, podendo replicar a formação.",
  publicoAlvo:
    "Técnicos de tecnologias de informação com base sólida em informática, técnicos de redes e de suporte, e formadores replicadores das instituições públicas.",
  preRequisitos:
    "Uso fluente de computador e de linha de comandos básica (navegar pastas, editar um ficheiro de texto); noções de sistema operativo; conhecimento de o que é um endereço IP. Quem não tiver linha de comandos faz, antes do módulo 1, a revisão guiada da lição «Modelos e camadas de comunicação» com o formador.",
  materiais:
    "Um computador por dupla com Debian 12 (instalado ou em máquina virtual, 2 núcleos, 4 GB de memória, 20 GB de disco), com os pacotes gratuitos iproute2, nftables, tcpdump, tshark/Wireshark, iputils-ping, traceroute, mtr-tiny, iperf3, dnsutils, bind9, kea-dhcp4-server, chrony, rsyslog, frr, wireguard-tools, suricata, snmp e snmpd, git e python3, instalados de antemão pela equipa técnica da instituição a partir do repositório oficial Debian (não é preciso comprar licenças). A rede de prática é isolada, criada dentro do próprio computador com espaços de nomes de rede (script base na lição 1 do módulo 1); nunca se liga à rede de produção. Para as lições de redes sem fios usa-se um ponto de acesso de prática desligado da rede institucional, se existir; caso contrário, a alternativa em papel. Fichas em papel com as topologias, tabelas de endereçamento e saídas de exemplo de cada lição, também em letra grande.",
};
