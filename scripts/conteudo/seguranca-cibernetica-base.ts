/**
 * Tipos e geradores de texto das lições do curso «Segurança Cibernética
 * Avançada».
 *
 * Todos os casos, nomes, instituições, endereços, registos e números usados
 * nas lições são FICTÍCIOS e servem apenas de exercício. Não há sistemas
 * reais, não há dados de pessoas reais e não há conclusões jurídicas.
 *
 * Este ficheiro vive fora de src/ para não entrar no pacote do navegador: é
 * lido apenas pelo integrador restrito deste curso.
 */

import type { TemposLicao } from "../../src/lib/plano-seguranca-cibernetica";

/** Fonte consultada, com data. `resumo` é síntese original da equipa. */
export type Referencia = {
  titulo: string;
  url: string;
  consultadoEm: string;
  resumo?: string;
};

/**
 * Laboratório executado em ambiente isolado. É prática efectiva: só conta como
 * realizada quando é executada na sessão e o formador regista a verificação de
 * sucesso. Ler o texto não é executar o laboratório.
 */
export type Laboratorio = {
  titulo: string;
  objectivo: string;
  /** Minutos do bloco de trabalho prático ocupados pelo laboratório. */
  minutos: number;
  /** Recursos com versão ou forma de obtenção, preparados ANTES da sessão. */
  recursos: string[];
  /** Material didáctico autocontido entregue com o curso, sem dependências externas. */
  materialFornecido?: string[];
  /**
   * Dependências que NÃO são entregues com o curso e que alguém tem de
   * preparar. Enquanto faltarem, o laboratório fica pendente.
   */
  dependenciasPorPreparar: string[];
  preparacao: string[];
  passos: string[];
  /** Como se confirma, de forma observável, que o laboratório correu bem. */
  verificacaoSucesso: string[];
  /** Como se devolve a máquina ao estado inicial. */
  reversao: string[];
  /** Caminho de análise offline, que NÃO substitui a execução. */
  alternativaOffline: string[];
};

export type ConteudoLicao = {
  objectivos: string[];
  explicacao: string[];
  exemplo: { titulo: string; corpo: string[] };
  tabela?: { titulo: string; nota: string; colunas: string[]; linhas: string[][] };
  /** Material de entrada fornecido por inteiro: registos, configurações, minutas. */
  anexos?: { titulo: string; nota: string; corpo: string[] }[];
  /** Listagens completas entregues com a lição (código didáctico, pedidos e respostas). */
  listagens?: { titulo: string; nota: string; linhas: string[] }[];
  /** Exercício em papel. Não é laboratório e não se declara prática executada. */
  actividade: { formato: string; enunciado: string[]; produto: string; rubrica: string[] };
  laboratorio?: Laboratorio;
  sintese: string[];
  verificacao: { pergunta: string; resposta: string; feedback: string }[];
  referencias?: Referencia[];
  guiao: {
    preparacao: string[];
    conducao: [string, string, string, string];
    criterios: string[];
    errosComuns: string[];
  };
};

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const lista = (itens: string[]) => `<ul>${itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
const numerada = (itens: string[]) => `<ol>${itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>`;
const paragrafos = (itens: string[]) => itens.map((p) => `<p>${esc(p)}</p>`).join("");

export const NOTA_CASOS_HTML =
  "<p><em>Todos os casos, instituições, endereços, registos e números usados nesta lição são " +
  "fictícios e servem apenas de exercício.</em></p>";

export const BLOCOS_TEMPO = [
  "Acolhimento e objectivos",
  "Exposição",
  "Trabalho prático",
  "Partilha e síntese",
] as const;

export function minutosPorBloco(t: TemposLicao): number[] {
  return [t.acolhimento, t.exposicao, t.actividade, t.partilha];
}

function grelhaTempos(t: TemposLicao): string {
  const m = minutosPorBloco(t);
  return `<ul>${BLOCOS_TEMPO.map((b, i) => `<li>${b}: ${m[i]} minutos.</li>`).join("")}</ul>`;
}

function faixas(t: TemposLicao): string[] {
  let inicio = 0;
  return minutosPorBloco(t).map((m) => {
    const faixa = `${inicio}–${inicio + m} min`;
    inicio += m;
    return faixa;
  });
}

const ORGANIZACAO_HTML =
  "<p><strong>Como trabalhamos na sala:</strong> um computador por pessoa. Quando não for " +
  "possível, no máximo duas pessoas por computador, alternando quem executa a meio do " +
  "trabalho, de modo que ambas façam. Na partilha apresentam dois grupos, com tempo " +
  "limitado; os restantes entregam por escrito e recebem comentário do formador. Marcar a " +
  "lição como concluída é registo de aprendizagem e não é registo de assiduidade.</p>";

/** Regras de autorização e segurança, iguais em todas as lições. */
export const REGRAS_LABORATORIO_HTML =
  "<p><strong>Regras do laboratório, sem excepção.</strong> Todos os alvos são máquinas " +
  "virtuais do próprio laboratório, numa rede isolada e sem ligação à rede de produção da " +
  "instituição. Nunca se usa como alvo um sistema real da instituição, de outra entidade ou " +
  "de terceiros na internet, mesmo para «experimentar». Qualquer exercício de teste exige " +
  "autorização escrita prévia da direcção, com âmbito, janela de tempo e pessoas " +
  "identificadas. Não se descarrega, não se distribui e não se executa software malicioso " +
  "real: a análise de ameaças é feita sobre indicadores, registos e descrições fornecidos no " +
  "material. Não se pede conta pessoal nem pagamento de serviços.</p>";

const AVISO_PRATICA_HTML =
  "<p><strong>Exercício em papel.</strong> Esta parte é análise documental sobre material " +
  "fornecido. Não é o laboratório e não pode ser registada como prática executada em " +
  "ambiente.</p>";

function tabelaHtml(c: ConteudoLicao): string {
  const t = c.tabela;
  if (!t) return "";
  return [
    `<h3>${esc(t.titulo)}</h3>`,
    `<p>${esc(t.nota)}</p>`,
    "<table><thead><tr>",
    t.colunas.map((x) => `<th scope="col">${esc(x)}</th>`).join(""),
    "</tr></thead><tbody>",
    t.linhas.map((l) => `<tr>${l.map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`).join(""),
    "</tbody></table>",
  ].join("");
}

function anexosHtml(c: ConteudoLicao): string {
  if (!c.anexos?.length) return "";
  return c.anexos
    .map((a) => `<h3>${esc(a.titulo)}</h3><p><em>${esc(a.nota)}</em></p>${paragrafos(a.corpo)}`)
    .join("");
}

function laboratorioHtml(c: ConteudoLicao): string {
  const l = c.laboratorio;
  if (!l) return "";
  return [
    `<h3>Laboratório em ambiente isolado — ${esc(l.titulo)}</h3>`,
    REGRAS_LABORATORIO_HTML,
    `<p><strong>Objectivo:</strong> ${esc(l.objectivo)}</p>`,
    "<h4>Recursos e versões, preparados antes da sessão</h4>",
    lista(l.recursos),
    "<h4>Preparação prévia, a cargo do formador</h4>",
    lista(l.preparacao),
    "<h4>Passos</h4>",
    numerada(l.passos),
    "<h4>Verificação de sucesso</h4>",
    lista(l.verificacaoSucesso),
    "<h4>Reversão ao estado inicial</h4>",
    lista(l.reversao),
    "<h4>Se o ambiente não estiver disponível: análise offline</h4>",
    "<p>A análise offline permite estudar o material e chegar às mesmas conclusões no papel, " +
      "mas <strong>não equivale à execução</strong>. Quando se recorre a ela, a lição é " +
      "registada como análise documental e o laboratório fica pendente, para ser reagendado.</p>",
    lista(l.alternativaOffline),
  ].join("");
}

function referenciasHtml(c: ConteudoLicao): string {
  if (!c.referencias?.length) return "";
  return (
    "<h3>Referências consultadas</h3><ul>" +
    c.referencias
      .map(
        (r) =>
          `<li>${esc(r.titulo)} — <a href="${esc(r.url)}" rel="noreferrer noopener" target="_blank">${esc(r.url)}</a> (consultado em ${esc(r.consultadoEm)}).` +
          (r.resumo ? `<br><em>Síntese da equipa:</em> ${esc(r.resumo)}` : "") +
          "</li>",
      )
      .join("") +
    "</ul><p>Estas referências são quadros e guias técnicos internacionais de adesão " +
    "voluntária. Não são lei moçambicana, não criam prazos nem obrigações legais e não " +
    "conferem qualquer certificação.</p>"
  );
}

export function montarElearning(c: ConteudoLicao, minutos: number, tempos: TemposLicao): string {
  return [
    `<p><strong>Duração prevista:</strong> ${minutos} minutos, em sessão presencial.</p>`,
    NOTA_CASOS_HTML,
    "<h3>Como o tempo desta lição está distribuído</h3>",
    grelhaTempos(tempos),
    ORGANIZACAO_HTML,
    "<h3>Objectivos da lição</h3>",
    lista(c.objectivos),
    "<h3>Explicação</h3>",
    paragrafos(c.explicacao),
    `<h3>${esc(c.exemplo.titulo)}</h3>`,
    paragrafos(c.exemplo.corpo),
    tabelaHtml(c),
    anexosHtml(c),
    "<h3>Trabalho prático</h3>",
    `<p>Trabalho ${esc(c.actividade.formato)}, com ${tempos.actividade} minutos de trabalho, seguidos de ${tempos.partilha} minutos de partilha e síntese em plenário.</p>`,
    AVISO_PRATICA_HTML,
    paragrafos(c.actividade.enunciado),
    `<p><strong>Produto esperado:</strong> ${esc(c.actividade.produto)}</p>`,
    "<h4>Como o produto é apreciado</h4>",
    lista(c.actividade.rubrica),
    laboratorioHtml(c),
    "<h3>Síntese em leitura fácil</h3>",
    lista(c.sintese),
    "<h3>Verificação formativa</h3>",
    "<p>Estas perguntas não contam para a nota final e não são perguntas do exame final. Servem para a pessoa formanda confirmar o que percebeu.</p>",
    numerada(c.verificacao.map((v) => v.pergunta)),
    "<h3>Respostas comentadas da verificação formativa</h3>",
    "<p>As respostas abaixo pertencem às perguntas de verificação formativa desta lição. " +
      "<strong>Não são perguntas nem respostas do exame final</strong> e não têm efeito na nota. " +
      "Tente responder primeiro e só depois compare.</p>",
    c.verificacao
      .map(
        (v, i) =>
          `<h4>Pergunta ${i + 1}. ${esc(v.pergunta)}</h4>` +
          `<p><strong>Resposta:</strong> ${esc(v.resposta)}</p>` +
          `<p><strong>Comentário:</strong> ${esc(v.feedback)}</p>`,
      )
      .join(""),
    referenciasHtml(c),
  ].join("");
}

export function montarGuiao(
  c: ConteudoLicao,
  titulo: string,
  minutos: number,
  tempos: TemposLicao,
): string {
  const faixa = faixas(tempos);
  return [
    `<h3>Guião do formador — ${esc(titulo)}</h3>`,
    `<p><strong>Duração prevista:</strong> ${minutos} minutos, em sessão presencial. Os tempos abaixo somam ${minutos} minutos e são os mesmos que a pessoa formanda vê no conteúdo da lição.</p>`,
    "<h4>Preparação</h4>",
    lista(c.guiao.preparacao),
    "<h4>Condução</h4>",
    `<ol>${c.guiao.conducao
      .map((passo, i) => `<li><strong>${faixa[i]} (${BLOCOS_TEMPO[i]}):</strong> ${esc(passo)}</li>`)
      .join("")}</ol>`,
    "<h4>Critérios de apreciação do produto</h4>",
    lista(c.guiao.criterios),
    "<h4>Erros comuns a antecipar</h4>",
    lista(c.guiao.errosComuns),
    c.laboratorio
      ? "<h4>Registo do laboratório</h4><p>O laboratório só é dado como realizado quando " +
        "for executado na sessão e a verificação de sucesso for observada. Se o ambiente " +
        "falhar, regista-se «PENDENTE — a reagendar» e a análise offline é registada como " +
        "análise documental, nunca como prática executada.</p>"
      : "",
    "<h4>Respostas comentadas da verificação formativa (não é o exame)</h4>",
    `<ol>${c.verificacao
      .map(
        (v) =>
          `<li><strong>${esc(v.pergunta)}</strong><br>Resposta: ${esc(v.resposta)}<br>Comentário: ${esc(v.feedback)}</li>`,
      )
      .join("")}</ol>`,
    "<p><strong>Separação pedagógica:</strong> este guião não contém perguntas nem respostas " +
      "do exame final; as respostas acima são apenas da verificação formativa.</p>",
  ].join("");
}

// Fontes primárias usadas no curso, com data de consulta.
export const NIST_CSF: Referencia = {
  titulo: "NIST Cybersecurity Framework — quadro voluntário de segurança cibernética",
  url: "https://www.nist.gov/cyberframework",
  consultadoEm: "22 de Setembro de 2026",
  resumo:
    "Quadro de adesão voluntária organizado em seis funções: Governar, Identificar, Proteger, Detectar, Responder e Recuperar. Serve para organizar o trabalho de segurança e conversar sobre risco com a direcção; não é lei nem certificação.",
};

export const CISA_KEV: Referencia = {
  titulo: "CISA Known Exploited Vulnerabilities Catalog — vulnerabilidades exploradas conhecidas",
  url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
  consultadoEm: "22 de Setembro de 2026",
  resumo:
    "Catálogo público de vulnerabilidades com exploração observada no mundo real. Usa-se como entrada para priorizar correcções: uma falha que consta do catálogo sobe na fila. Os prazos que o catálogo indica aplicam-se a organismos federais dos Estados Unidos e não a instituições moçambicanas.",
};

export const OWASP_WSTG: Referencia = {
  titulo: "OWASP Web Security Testing Guide — guia de testes de segurança de aplicações web",
  url: "https://owasp.org/projects/web-security-testing-guide",
  consultadoEm: "22 de Setembro de 2026",
  resumo:
    "Guia aberto que descreve, por categorias, o que testar numa aplicação web e como registar o que se encontra. Dá estrutura ao teste autorizado e ao relatório; é uma referência comunitária, não uma norma obrigatória.",
};
