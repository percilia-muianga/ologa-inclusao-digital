/**
 * BANCO DE AVALIAÇÃO do curso «Redes Avançadas e Segurança Cibernética»
 * (Administração de Redes).
 *
 * Ficheiro PRIVADO: vive fora de src/ e de public/. Enunciados, gabaritos e
 * explicações nunca entram no pacote do navegador. Nada aqui foi importado
 * para a base de dados; o plano de linhas é função pura, sem escrita.
 *
 * Dois instrumentos separados:
 * - EXAME_REDES: 80 questões finais — 72 técnicas (6 por módulo, 12 módulos,
 *   as 60 lições cobertas) e 8 do módulo transversal (Lei n.º 10/2024).
 * - DIAGNOSTICO_REDES: 10 questões de diagnóstico e pós-teste, fora das 80 e
 *   fora do sorteio.
 *
 * A prova de 20 itens é PROPOSTA pedagógica, usada só em simulação; não há
 * configuração de exame real. Matriz e limites:
 * docs/matriz-banco-redes.md. Estado editorial: rascunho por validar pela
 * Ologa/ATDI.
 */
import type { QuestaoRedes } from "./redes-questoes-tipos";
import { EXAME_REDES_M01_03 } from "./redes-questoes-m01-03";
import { EXAME_REDES_M04_06 } from "./redes-questoes-m04-06";
import { EXAME_REDES_M07_09 } from "./redes-questoes-m07-09";
import { EXAME_REDES_M10_12 } from "./redes-questoes-m10-12";

export type { QuestaoRedes } from "./redes-questoes-tipos";

/** Obj. do transversal: não há objectivos escritos nos ficheiros de Redes; indica-se artigo e lição. */
const TRANSVERSAL: QuestaoRedes[] = [
  {
    cod: "RED-TR-L1-01", m: "transversal", l: 1, t: "em", d: "f",
    e: "A equipa de TI da DPE vai criar uma página interna para os funcionários pedirem assistência técnica. Qual prática corresponde ao desenho universal tratado na lição sobre o artigo 16?",
    opts: [
      "Prever desde o início o uso com teclado e com leitor de ecrã",
      "Publicar primeiro e ajustar só quando alguém se queixar",
      "Fazer uma segunda página, mais simples, para quem tiver deficiência",
      "Aceitar pedidos apenas pela página, sem outro canal de contacto",
    ], ind: 0,
    exp: "O desenho universal pensa o serviço para todas as pessoas desde o início, sem versões diminuídas nem correcções tardias.",
    obj: "Artigo 16 — Acessibilidade. Lição 1 do módulo transversal.",
    r: [], fonte: "lei102024",
  },
  {
    cod: "RED-TR-L1-02", m: "transversal", l: 1, t: "vf", d: "me",
    e: "Verdadeiro ou falso: um técnico de redes com baixa visão pede ampliação e maior contraste na consola de monitorização; atender o pedido é um exemplo de ajustamento razoável.",
    val: true,
    exp: "Verdadeiro. O ajustamento razoável adapta o posto ou o serviço à barreira concreta, sem excluir a pessoa da função.",
    obj: "Artigo 16 — Acessibilidade. Lição 1 do módulo transversal.",
    r: [], fonte: "lei102024",
  },
  {
    cod: "RED-TR-L2-01", m: "transversal", l: 2, t: "cor", d: "f",
    e: "A DPE vai anunciar uma interrupção programada da rede. Associe cada público à forma de aviso que lhe torna a informação acessível.",
    pares: [
      { esquerda: "Pessoas cegas", direita: "Texto digital legível por leitor de ecrã" },
      { esquerda: "Pessoas surdas", direita: "Aviso escrito, não apenas por altifalante" },
      { esquerda: "Pessoas com pouca prática de leitura", direita: "Mensagem curta em linguagem simples" },
      { esquerda: "Pessoas sem acesso à internet", direita: "Aviso afixado e dado no balcão" },
    ],
    exp: "O direito à informação implica formatos que pessoas diferentes consigam usar; um só canal deixa sempre alguém de fora.",
    obj: "Artigo 17 — Direito à informação e comunicação. Lição 2 do módulo transversal.",
    r: [], fonte: "lei102024",
  },
  {
    cod: "RED-TR-L3-01", m: "transversal", l: 3, t: "em", d: "me",
    e: "A DPE vai comprar uma plataforma de monitorização de rede cuja consola será usada por técnicos, incluindo um técnico cego. Segundo a lição sobre o artigo 20, onde entra a acessibilidade?",
    opts: [
      "Só depois da instalação, se o técnico cego pedir adaptações",
      "Apenas nas partes da plataforma que o público consegue ver",
      "Nos requisitos do caderno de encargos, na avaliação e na recepção",
      "Na escolha livre do fornecedor, que conhece melhor a matéria",
    ], ind: 2,
    exp: "A acessibilidade é requisito da aquisição, critério de avaliação das propostas e ponto de verificação na entrega; os funcionários também são utilizadores.",
    obj: "Artigo 20 — Aquisição de bens, serviços e obras. Lição 3 do módulo transversal.",
    r: [], fonte: "lei102024",
  },
  {
    cod: "RED-TR-L4-01", m: "transversal", l: 4, t: "cor", d: "me",
    e: "Numa sessão de formador replicador sobre redes, associe cada situação de um formando à adaptação que o inclui na actividade prática.",
    pares: [
      { esquerda: "Formando surdo na demonstração de comandos", direita: "Instruções escritas ou interpretação em língua de sinais" },
      { esquerda: "Formando cego no laboratório", direita: "Guião em texto acessível, usado com leitor de ecrã" },
      { esquerda: "Formando em cadeira de rodas", direita: "Bancada e sala acessíveis" },
      { esquerda: "Formando sem computador disponível", direita: "Alternativa em papel com a mesma tarefa" },
    ],
    exp: "A formação deve ter materiais acessíveis e actividades sem barreiras; dispensar a pessoa sem alternativa exclui, não adapta.",
    obj: "Artigo 24 — Direito à educação. Lição 4 do módulo transversal.",
    r: [], fonte: "lei102024",
  },
  {
    cod: "RED-TR-L5-01", m: "transversal", l: 5, t: "em", d: "me",
    e: "A ficha de inscrição no curso de Redes quer saber se o formando precisa de adaptações por deficiência, para preparar a sala e os materiais. Como deve ser feita a recolha, segundo a lição do artigo 30?",
    opts: [
      "Obrigatória, com as respostas afixadas na sala de formação",
      "Opcional e autodeclarada, com finalidade clara e acesso restrito",
      "Proibida, porque a lei impede qualquer recolha deste tipo",
      "Livre, com as respostas enviadas a todos os formadores do centro",
    ], ind: 1,
    exp: "A recolha tem finalidade clara, é opcional e autodeclarada, e a informação individual fica protegida; a lei promove a recolha, não a proíbe.",
    obj: "Artigo 30 — Colecta de dados. Lição 5 do módulo transversal.",
    r: [], fonte: "lei102024",
  },
  {
    cod: "RED-TR-L5-02", m: "transversal", l: 5, t: "vf", d: "f",
    e: "Verdadeiro ou falso: os dados de deficiência recolhidos na inscrição podem ser partilhados com toda a turma, para os colegas se organizarem melhor.",
    val: false,
    exp: "Falso. A informação individual sobre deficiência tem acesso restrito a quem precisa dela para a finalidade indicada.",
    obj: "Artigo 30 — Colecta de dados. Lição 5 do módulo transversal.",
    r: [], fonte: "lei102024",
  },
  {
    cod: "RED-TR-L6-01", m: "transversal", l: 6, t: "em", d: "f",
    e: "No relatório de formandos por distrito, um distrito tem 3 formandos com deficiência auditiva. O que recomenda a lição sobre o artigo 31 antes de divulgar?",
    opts: [
      "Publicar o número exacto, porque não aparece nenhum nome",
      "Publicar a lista dos 3 formandos para confirmar a contagem",
      "Substituir o número por uma estimativa arredondada para 10",
      "Agregar com outros distritos ou não divulgar aquela célula",
    ], ind: 3,
    exp: "Em grupos com menos de cinco pessoas, os números podem identificar pessoas; agrega-se ou não se divulga a célula.",
    obj: "Artigo 31 — Estatística. Lição 6 do módulo transversal.",
    r: [], fonte: "lei102024",
  },
];

export const EXAME_REDES: QuestaoRedes[] = [
  ...EXAME_REDES_M01_03, ...EXAME_REDES_M04_06, ...EXAME_REDES_M07_09, ...EXAME_REDES_M10_12, ...TRANSVERSAL,
];

/** Diagnóstico e pós-teste: separado, nunca entra no sorteio do exame final. */
export const DIAGNOSTICO_REDES: QuestaoRedes[] = [
  {
    cod: "RED-DIAG-01", m: 1, l: 2, t: "em", d: "f",
    e: "Diagnóstico. Quantos bits tem um endereço IPv4?",
    opts: ["16 bits", "32 bits", "64 bits", "128 bits"], ind: 1,
    exp: "Um endereço IPv4 tem 32 bits; o IPv6 tem 128.",
    obj: "Calcular rede, difusão, primeiro e último endereço úteis de um prefixo IPv4.", r: ["R01"], fonte: "rfc4632",
  },
  {
    cod: "RED-DIAG-02", m: 1, l: 4, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: o DNS serve para traduzir nomes, como srv.dpe.example, em endereços IP.",
    val: true,
    exp: "Verdadeiro. O curso trata o DNS no módulo 1 e configura uma zona no módulo 5.",
    obj: "Explicar ARP, ICMP, TCP, UDP, DNS e DHCP e em que momento cada um aparece.", r: ["R03"], fonte: "rfc1034",
  },
  {
    cod: "RED-DIAG-03", m: 2, l: 2, t: "em", d: "me",
    e: "Diagnóstico. Numa rede local, para que serve uma VLAN?",
    opts: [
      "Para cifrar o tráfego que passa entre dois comutadores",
      "Para aumentar o débito de cada porta do comutador",
      "Para separar redes lógicas dentro do mesmo comutador",
      "Para ligar a rede local à internet do operador",
    ], ind: 2,
    exp: "Uma VLAN separa grupos de portas em domínios de difusão diferentes; não cifra nem aumenta débito.",
    obj: "Explicar o que é uma VLAN e a etiqueta 802.1Q.", r: ["R03"], fonte: "ieee8021q",
  },
  {
    cod: "RED-DIAG-04", m: 3, l: 1, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: para chegar a uma rede diferente da sua, um computador envia os pacotes para a porta de ligação (gateway).",
    val: true,
    exp: "Verdadeiro. O módulo 3 mostra como cada encaminhador decide o próximo salto.",
    obj: "Distinguir rota ligada, estática e por omissão.", r: ["R01"], fonte: "rfc791",
  },
  {
    cod: "RED-DIAG-05", m: 4, l: 3, t: "em", d: "f",
    e: "Diagnóstico. Qual destas protecções de Wi-Fi já não deve ser usada?",
    opts: ["WEP", "WPA2 com AES", "WPA3", "802.1X"], ind: 0,
    exp: "O WEP está quebrado. O curso trata WPA2, WPA3 e 802.1X no módulo 4.",
    obj: "Configurar uma rede sem fios com WPA3-Personal (SAE) e modo de transição WPA2/WPA3.", r: ["R12"], fonte: "wifiwpa3",
  },
  {
    cod: "RED-DIAG-06", m: 6, l: 3, t: "vf", d: "f",
    e: "Diagnóstico. Verdadeiro ou falso: a autenticação multifactor combina, por exemplo, uma palavra-passe e um código gerado no telemóvel.",
    val: true,
    exp: "Verdadeiro. O módulo 6 explica os factores e o TOTP.",
    obj: "Explicar autenticação multifactor e o funcionamento de TOTP.", r: ["R12"], fonte: "nist80063",
  },
  {
    cod: "RED-DIAG-07", m: 7, l: 2, t: "em", d: "me",
    e: "Diagnóstico. Qual é a função principal de uma firewall entre duas zonas da rede?",
    opts: [
      "Atribuir endereços IP aos computadores da zona",
      "Traduzir nomes de servidores em endereços IP",
      "Guardar cópias das configurações dos equipamentos",
      "Permitir ou recusar tráfego segundo regras definidas",
    ], ind: 3,
    exp: "A firewall decide que tráfego passa entre zonas; o módulo 7 constrói uma política com nftables.",
    obj: "Distinguir filtragem sem estado e com estado.", r: ["R07"], fonte: "nist80041",
  },
  {
    cod: "RED-DIAG-08", m: 8, l: 5, t: "em", d: "me",
    e: "Diagnóstico. Para que serve o relatório escrito depois de um incidente de segurança?",
    opts: [
      "Para registar o que aconteceu e decidir o que melhorar",
      "Para identificar e castigar o funcionário responsável",
      "Para substituir a contenção feita durante o incidente",
      "Para apagar os registos técnicos que já não são úteis",
    ], ind: 0,
    exp: "O módulo 8 trata o relatório com cronologia, impacto e acções de melhoria.",
    obj: "Redigir um relatório de incidente com factos, cronologia, impacto e acções.", r: ["R15"], fonte: "nist80061",
  },
  {
    cod: "RED-DIAG-09", m: 10, l: 1, t: "vf", d: "me",
    e: "Diagnóstico. Verdadeiro ou falso: o comando ping mostra o tempo de ida e volta de um pacote até ao destino.",
    val: true,
    exp: "Verdadeiro. O módulo 10 distingue esse tempo (RTT) do atraso num só sentido.",
    obj: "Distinguir débito (throughput), débito útil (goodput), atraso de ida e volta (RTT), atraso unilateral, variação do atraso (jitter) e perda, e dizer o que cada ferramenta mede de facto.", r: ["R04"], fonte: "rfc2681",
  },
  {
    cod: "RED-DIAG-10", m: 12, l: 3, t: "vf", d: "me",
    e: "Diagnóstico. Verdadeiro ou falso: pode fazer-se um varrimento de portas ao servidor de outra instituição sem autorização escrita, desde que seja só para observar.",
    val: false,
    exp: "Falso. Sem autorização escrita, o varrimento de sistemas de terceiros é intrusão não autorizada. O módulo 12 começa pela autorização.",
    obj: "Preparar e assinar uma autorização de teste com âmbito, testes permitidos, janela, executantes e confidencialidade, antes de qualquer comando.", r: ["R10", "R16"], fonte: "nist800115",
  },
];

/**
 * Prova PROPOSTA, só para simulação. Não configura exame real.
 * Chaves de módulos = ordem real em curso_modulos (1–12 temáticos, 13 transversal).
 * Dois itens para os módulos centrais de administração (1, 3, 11) e de
 * segurança operacional (7, 8, 12); um item para os restantes — ver matriz.
 */
export const PROPOSTA_PROVA_REDES = {
  total: 20,
  minutos: 60,
  modulosPorOrdem: {
    1: 2, 2: 1, 3: 2, 4: 1, 5: 1, 6: 1, 7: 2, 8: 2, 9: 1, 10: 1, 11: 2, 12: 2, 13: 2,
  } as Record<number, number>,
  tipos: { escolha_multipla: 8, verdadeiro_falso: 4, correspondencia: 4, cenario: 4 },
  pct: { facil: 40, media: 40, dificil: 20 },
  nota: "Proposta pedagógica por validar pela Ologa/ATDI; não é número imposto pelo Termo de Referência.",
} as const;

export const ORDEM_TRANSVERSAL_REDES = 13;
export const ordemModuloRedes = (q: QuestaoRedes) => (q.m === "transversal" ? ORDEM_TRANSVERSAL_REDES : q.m);

const TIPOLOGIA = { em: "escolha_multipla", vf: "verdadeiro_falso", cor: "correspondencia" } as const;
const DIFICULDADE = { f: "facil", me: "media", di: "dificil" } as const;

export type LinhaPlanoRedes = {
  cod: string;
  ordemModulo: number;
  instrumento: "exame_final" | "pre_pos_teste";
  tipologia: (typeof TIPOLOGIA)[keyof typeof TIPOLOGIA];
  dificuldade: (typeof DIFICULDADE)[keyof typeof DIFICULDADE];
  enunciado: string;
  conteudo: Record<string, unknown>;
  resposta: Record<string, unknown>;
  explicacao: string;
  objectivo_associado: string;
  cenario: boolean;
  /** Explícitos: na tabela real os valores por omissão são activa=true e em_uso. */
  activa: false;
  estado_revisao: "rascunho";
  versao: "v1";
  codigo: string;
};

function corpo(q: QuestaoRedes) {
  if (q.t === "em") {
    if (!q.opts || q.ind === undefined || q.ind < 0 || q.ind >= q.opts.length)
      throw new Error(`Gabarito inválido: ${q.cod}`);
    return { conteudo: { opcoes: q.opts, ...(q.cen ? { cenario: true } : {}) }, resposta: { indice: q.ind } };
  }
  if (q.t === "vf") {
    if (q.val === undefined) throw new Error(`Gabarito inválido: ${q.cod}`);
    return { conteudo: q.cen ? { cenario: true } : {}, resposta: { valor: q.val } };
  }
  if (!q.pares || q.pares.length < 3) throw new Error(`Associação incompleta: ${q.cod}`);
  return { conteudo: { pares: q.pares }, resposta: { pares: q.pares } };
}

/** Plano de linhas para banco_questoes — função pura, sem escrita. */
export function planoLinhasRedes(): LinhaPlanoRedes[] {
  const linhas: LinhaPlanoRedes[] = [];
  const add = (q: QuestaoRedes, instrumento: LinhaPlanoRedes["instrumento"]) => {
    const { conteudo, resposta } = corpo(q);
    linhas.push({
      cod: q.cod,
      ordemModulo: ordemModuloRedes(q),
      instrumento,
      tipologia: TIPOLOGIA[q.t],
      dificuldade: DIFICULDADE[q.d],
      enunciado: q.e,
      conteudo,
      resposta,
      explicacao: q.exp,
      objectivo_associado: q.obj,
      cenario: Boolean(q.cen),
      activa: false,
      estado_revisao: "rascunho",
      versao: "v1",
      codigo: q.cod,
    });
  };
  for (const q of EXAME_REDES) add(q, "exame_final");
  for (const q of DIAGNOSTICO_REDES) add(q, "pre_pos_teste");
  return linhas;
}
