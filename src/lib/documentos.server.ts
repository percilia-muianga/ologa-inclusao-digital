// Geração server-side dos documentos do 7B. Nunca escrever à mão: tudo sai dos dados.
// Regra: estes documentos atestam a formação feita. Não certificam conformidade legal.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const A4: [number, number] = [595.28, 841.89];
const MARGEM = 48;
const COR_TEXTO = rgb(0.11, 0.13, 0.17);
const COR_SUAVE = rgb(0.35, 0.4, 0.45);
const COR_MARCA = rgb(0.76, 0.02, 0);
const COR_LINHA = rgb(0.85, 0.87, 0.9);

type Contexto = { pdf: PDFDocument; page: PDFPage; y: number; regular: PDFFont; bold: PDFFont };

function novaPagina(ctx: Contexto): Contexto {
  ctx.page = ctx.pdf.addPage(A4);
  ctx.y = A4[1] - MARGEM;
  desenharRodape(ctx);
  ctx.y = A4[1] - MARGEM;
  return ctx;
}

function garantirEspaco(ctx: Contexto, altura: number) {
  if (ctx.y - altura < MARGEM + 60) novaPagina(ctx);
}

function quebrarLinhas(texto: string, font: PDFFont, tamanho: number, largura: number): string[] {
  const palavras = texto.split(/\s+/);
  const linhas: string[] = [];
  let atual = "";
  for (const w of palavras) {
    const tentativa = atual ? `${atual} ${w}` : w;
    if (font.widthOfTextAtSize(tentativa, tamanho) > largura && atual) {
      linhas.push(atual);
      atual = w;
    } else {
      atual = tentativa;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function escreverParagrafo(
  ctx: Contexto,
  texto: string,
  opts: { tamanho?: number; bold?: boolean; cor?: ReturnType<typeof rgb>; espacoDepois?: number } = {},
) {
  const tamanho = opts.tamanho ?? 10.5;
  const font = opts.bold ? ctx.bold : ctx.regular;
  const cor = opts.cor ?? COR_TEXTO;
  const larguraUtil = A4[0] - MARGEM * 2;
  const linhas = quebrarLinhas(texto, font, tamanho, larguraUtil);
  for (const linha of linhas) {
    garantirEspaco(ctx, tamanho + 4);
    ctx.page.drawText(linha, { x: MARGEM, y: ctx.y - tamanho, size: tamanho, font, color: cor });
    ctx.y -= tamanho + 4;
  }
  ctx.y -= opts.espacoDepois ?? 4;
}

function titulo(ctx: Contexto, texto: string, tamanho = 18) {
  garantirEspaco(ctx, tamanho + 12);
  ctx.page.drawText(texto, { x: MARGEM, y: ctx.y - tamanho, size: tamanho, font: ctx.bold, color: COR_TEXTO });
  ctx.y -= tamanho + 8;
}

function subtitulo(ctx: Contexto, texto: string) {
  garantirEspaco(ctx, 20);
  ctx.page.drawText(texto, { x: MARGEM, y: ctx.y - 12, size: 12, font: ctx.bold, color: COR_MARCA });
  ctx.y -= 18;
  ctx.page.drawLine({
    start: { x: MARGEM, y: ctx.y + 4 },
    end: { x: A4[0] - MARGEM, y: ctx.y + 4 },
    thickness: 0.5,
    color: COR_LINHA,
  });
  ctx.y -= 6;
}

function linhaEtiquetaValor(ctx: Contexto, etiqueta: string, valor: string) {
  garantirEspaco(ctx, 16);
  ctx.page.drawText(etiqueta, { x: MARGEM, y: ctx.y - 11, size: 9.5, font: ctx.bold, color: COR_SUAVE });
  ctx.page.drawText(valor, { x: MARGEM + 170, y: ctx.y - 11, size: 10.5, font: ctx.regular, color: COR_TEXTO });
  ctx.y -= 16;
}

function desenharRodape(ctx: Contexto) {
  const y = MARGEM - 20;
  ctx.page.drawLine({
    start: { x: MARGEM, y: y + 26 },
    end: { x: A4[0] - MARGEM, y: y + 26 },
    thickness: 0.5,
    color: COR_LINHA,
  });
  const linhas = [
    "Este documento atesta a formação realizada. Não constitui certificação de conformidade legal.",
    "Ologa · Plataforma de Literacia Digital com Desenho Universal · inclusaodigital.ologa.com",
  ];
  linhas.forEach((t, i) => {
    ctx.page.drawText(t, {
      x: MARGEM,
      y: y + 12 - i * 10,
      size: 8,
      font: ctx.regular,
      color: COR_SUAVE,
    });
  });
}

async function novoDocumento(): Promise<Contexto> {
  const pdf = await PDFDocument.create();
  pdf.setCreator("Ologa");
  pdf.setProducer("Ologa");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage(A4);
  const ctx: Contexto = { pdf, page, y: A4[1] - MARGEM, regular, bold };
  desenharRodape(ctx);
  ctx.y = A4[1] - MARGEM;
  return ctx;
}

function cabecalhoMarca(ctx: Contexto, sub: string) {
  ctx.page.drawText("OLOGA", { x: MARGEM, y: A4[1] - MARGEM + 4, size: 11, font: ctx.bold, color: COR_MARCA });
  ctx.page.drawText(sub, {
    x: MARGEM,
    y: A4[1] - MARGEM - 8,
    size: 9,
    font: ctx.regular,
    color: COR_SUAVE,
  });
  ctx.y = A4[1] - MARGEM - 30;
}

// ---------- Carregamento de dados ----------

export type DadosDocumento = Awaited<ReturnType<typeof carregarDadosPorToken>>;

export async function carregarDadosPorToken(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: inst } = await supabaseAdmin
    .from("instituicoes")
    .select("*")
    .eq("indicadores_token", token)
    .maybeSingle();
  if (!inst) return null;
  return await construirDados(inst.id);
}

export async function carregarDadosPorId(id: string) {
  return await construirDados(id);
}

async function construirDados(instituicaoId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: inst }, formandosRes, certRes, percursoRes] = await Promise.all([
    supabaseAdmin.from("instituicoes").select("*").eq("id", instituicaoId).single(),
    supabaseAdmin
      .from("formandos")
      .select("id, nome, genero, precisa_apoio, apoios_acessibilidade, diagnostico_pontuacao, diagnostico_total")
      .eq("instituicao_id", instituicaoId),
    supabaseAdmin
      .from("certificados")
      .select("formando_id, modulo_id, emitido_em, modulos(titulo)")
      .in(
        "formando_id",
        (
          await supabaseAdmin.from("formandos").select("id").eq("instituicao_id", instituicaoId)
        ).data?.map((r) => r.id) ?? [],
      ),
    supabaseAdmin
      .from("instituicao_modulos_percurso")
      .select("ordem, modulos(titulo)")
      .eq("instituicao_id", instituicaoId)
      .order("ordem", { ascending: true }),
  ]);

  if (!inst) return null;
  const formandos = formandosRes.data ?? [];
  const certs = (certRes.data ?? []) as {
    formando_id: string;
    modulo_id: string;
    emitido_em: string;
    modulos: { titulo: string } | null;
  }[];

  const idsCert = new Set(certs.map((c) => c.formando_id));
  const concluidos = formandos.filter((f) => idsCert.has(f.id)).length;

  const modulosRealizados = Array.from(
    new Map(certs.map((c) => [c.modulo_id, c.modulos?.titulo ?? "—"])).values(),
  );

  const nMulheres = formandos.filter((f) => f.genero === "feminino").length;
  const nMulheresConc = formandos.filter((f) => f.genero === "feminino" && idsCert.has(f.id)).length;

  const nApoio = formandos.filter((f) => f.precisa_apoio === true).length;
  const nApoioConc = formandos.filter((f) => f.precisa_apoio === true && idsCert.has(f.id)).length;
  const apoiosPrestados = new Set<string>();
  for (const f of formandos) {
    if (f.precisa_apoio) for (const a of (f.apoios_acessibilidade ?? []) as string[]) apoiosPrestados.add(a);
  }

  // Média de avaliações finais por formando (média das taxas dos quizzes finais)
  const { data: quizzes } = await supabaseAdmin
    .from("progresso_quizzes")
    .select("formando_id, modulo_id, pontuacao, total, tentado_em")
    .in(
      "formando_id",
      formandos.map((f) => f.id),
    )
    .order("tentado_em", { ascending: false });
  const vistos = new Set<string>();
  const finais: number[] = [];
  for (const q of quizzes ?? []) {
    if (!q.total) continue;
    const k = `${q.formando_id}|${q.modulo_id}`;
    if (vistos.has(k)) continue;
    vistos.add(k);
    finais.push((q.pontuacao ?? 0) / q.total);
  }
  const mediaAvaliacoes = finais.length ? Math.round((finais.reduce((a, b) => a + b, 0) / finais.length) * 100) : null;

  // Antes/depois: quem partiu do zero (diagnostico com pct baixo — usamos nivel_partida quando disponível)
  const zero = formandos.filter((f) => {
    if (!f.diagnostico_total || f.diagnostico_total <= 0) return false;
    return (f.diagnostico_pontuacao ?? 0) / f.diagnostico_total < 0.2;
  });
  const zeroConc = zero.filter((f) => idsCert.has(f.id)).length;

  // Cumprimentos
  const inscritos = formandos.length;
  const coberturaReal = inst.num_trabalhadores_total
    ? Math.round((inscritos / inst.num_trabalhadores_total) * 1000) / 10
    : null;
  const conclusaoReal = inscritos > 0 ? Math.round((concluidos / inscritos) * 1000) / 10 : null;

  const percurso = (percursoRes.data ?? []).map(
    (r) => (r as unknown as { modulos: { titulo: string } | null }).modulos?.titulo ?? "—",
  );

  const periodoInicio = inst.criado_em ? new Date(inst.criado_em) : null;
  const emissoes = certs.map((c) => new Date(c.emitido_em)).sort((a, b) => a.getTime() - b.getTime());
  const periodoFim = emissoes.length ? emissoes[emissoes.length - 1] : null;

  return {
    inst,
    formandos,
    idsCert,
    concluidos,
    inscritos,
    modulosRealizados,
    percurso,
    nMulheres,
    nMulheresConc,
    nApoio,
    nApoioConc,
    apoiosPrestados: Array.from(apoiosPrestados),
    mediaAvaliacoes,
    zero: zero.length,
    zeroConc,
    coberturaReal,
    conclusaoReal,
    periodoInicio,
    periodoFim,
    certs,
  };
}


// ---------- PDFs ----------

function fmtData(d: Date | null | string | null) {
  if (!d) return "—";
  const data = typeof d === "string" ? new Date(d) : d;
  return data.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
}

function fmtNumero(n: number | null) {
  return n == null ? "—" : String(n);
}

function fmtPct(n: number | null) {
  return n == null ? "—" : `${n}%`;
}

function cumprimento(real: number | null, meta: number | null, regra: "maior" | "menor"): string {
  if (real == null || meta == null) return "—";
  const v = regra === "maior" ? real / meta : meta === 0 ? (real === 0 ? 1 : 0) : meta / real;
  return `${Math.round(v * 100)}%`;
}

export async function gerarRelatorio(d: NonNullable<DadosDocumento>): Promise<Uint8Array> {
  const ctx = await novoDocumento();
  cabecalhoMarca(ctx, "Relatório de capacitação");
  titulo(ctx, d.inst.nome, 20);
  escreverParagrafo(
    ctx,
    `${[d.inst.distrito, d.inst.provincia].filter(Boolean).join(", ") || "Localização não indicada"} · Período: ${fmtData(d.periodoInicio)} a ${fmtData(d.periodoFim)}`,
    { cor: COR_SUAVE, tamanho: 10, espacoDepois: 10 },
  );

  subtitulo(ctx, "Identificação");
  linhaEtiquetaValor(ctx, "Instituição", d.inst.nome);
  linhaEtiquetaValor(ctx, "Código de inscrição", d.inst.codigo_inscricao);
  linhaEtiquetaValor(
    ctx,
    "Trabalhadores no total",
    fmtNumero(d.inst.num_trabalhadores_total),
  );
  linhaEtiquetaValor(ctx, "Prazo acordado", d.inst.prazo_meses ? `${d.inst.prazo_meses} meses` : "—");

  ctx.y -= 6;
  subtitulo(ctx, "Módulos realizados");
  if (d.modulosRealizados.length === 0) {
    escreverParagrafo(ctx, "Ainda sem módulos concluídos.", { cor: COR_SUAVE });
  } else {
    for (const m of d.modulosRealizados) escreverParagrafo(ctx, `• ${m}`);
  }

  ctx.y -= 6;
  subtitulo(ctx, "Formandos");
  linhaEtiquetaValor(ctx, "Inscritos", String(d.inscritos));
  linhaEtiquetaValor(ctx, "Concluíram", String(d.concluidos));
  if (d.formandos.length > 0) {
    ctx.y -= 4;
    escreverParagrafo(ctx, "Lista nominal:", { bold: true, tamanho: 10, espacoDepois: 2 });
    for (const f of d.formandos) {
      escreverParagrafo(ctx, `• ${f.nome} — ${d.idsCert.has(f.id) ? "concluiu" : "em curso"}`, {
        tamanho: 10,
        espacoDepois: 0,
      });
    }
  }

  ctx.y -= 8;
  subtitulo(ctx, "Indicadores — Meta vs. Real");
  const linhasInd: [string, string, string, string][] = [
    ["1. Cobertura", fmtPct(d.inst.meta_cobertura_pct), d.coberturaReal == null ? "—" : `${d.coberturaReal}%`, cumprimento(d.coberturaReal, d.inst.meta_cobertura_pct, "maior")],
    ["2. Conclusão", fmtPct(d.inst.meta_conclusao_pct), d.conclusaoReal == null ? "—" : `${d.conclusaoReal}%`, cumprimento(d.conclusaoReal, d.inst.meta_conclusao_pct, "maior")],
    ["3. Ganho (pontos)", fmtNumero(d.inst.meta_ganho_pontos), "—", "—"],
    ["4. Equidade (pp máx.)", fmtNumero(d.inst.meta_equidade_max_pp), "—", "—"],
    ["5. Compromisso", "Assinada", d.inst.declaracao_assinada ? "Assinada" : "Por assinar", d.inst.declaracao_assinada ? "100%" : "0%"],
  ];
  const col = [MARGEM, MARGEM + 180, MARGEM + 300, MARGEM + 400];
  garantirEspaco(ctx, 16);
  ["Indicador", "Meta", "Real", "Cumprimento"].forEach((h, i) => {
    ctx.page.drawText(h, { x: col[i], y: ctx.y - 11, size: 9.5, font: ctx.bold, color: COR_SUAVE });
  });
  ctx.y -= 16;
  for (const l of linhasInd) {
    garantirEspaco(ctx, 14);
    l.forEach((c, i) =>
      ctx.page.drawText(c, { x: col[i], y: ctx.y - 11, size: 10, font: ctx.regular, color: COR_TEXTO }),
    );
    ctx.y -= 14;
  }

  ctx.y -= 8;
  subtitulo(ctx, "Participação de mulheres");
  linhaEtiquetaValor(ctx, "Formandas mulheres", String(d.nMulheres));
  linhaEtiquetaValor(ctx, "Concluíram", String(d.nMulheresConc));

  ctx.y -= 4;
  subtitulo(ctx, "Formandos com necessidade de apoio");
  if (d.nApoio < 5) {
    escreverParagrafo(ctx, "Menos de 5 formandos com necessidade de apoio — dados suprimidos para proteger a identificação individual.", { cor: COR_SUAVE });
  } else {
    linhaEtiquetaValor(ctx, "Total", String(d.nApoio));
    linhaEtiquetaValor(ctx, "Concluíram", String(d.nApoioConc));
    linhaEtiquetaValor(
      ctx,
      "Apoios prestados",
      d.apoiosPrestados.length ? d.apoiosPrestados.join(", ") : "—",
    );
  }

  ctx.y -= 4;
  subtitulo(ctx, "Avaliações");
  linhaEtiquetaValor(ctx, "Média nas avaliações finais", d.mediaAvaliacoes == null ? "—" : `${d.mediaAvaliacoes}%`);

  ctx.y -= 4;
  subtitulo(ctx, "Antes e depois");
  linhaEtiquetaValor(ctx, "Partiram do zero", String(d.zero));
  linhaEtiquetaValor(ctx, "Desses, concluíram", String(d.zeroConc));

  return await ctx.pdf.save();
}

export async function gerarCertificadoInstituicao(d: NonNullable<DadosDocumento>): Promise<Uint8Array> {
  const ctx = await novoDocumento();
  cabecalhoMarca(ctx, "Certificado da instituição");
  ctx.y -= 40;
  titulo(ctx, "Certificado", 28);
  ctx.y -= 10;
  escreverParagrafo(
    ctx,
    "A Ologa certifica que a instituição abaixo identificada capacitou os seus colaboradores em literacia digital com desenho universal, através da plataforma Ologa.",
    { tamanho: 12, espacoDepois: 12 },
  );

  ctx.y -= 12;
  escreverParagrafo(ctx, d.inst.nome, { tamanho: 20, bold: true, espacoDepois: 4 });
  escreverParagrafo(
    ctx,
    [d.inst.distrito, d.inst.provincia].filter(Boolean).join(", ") || "",
    { cor: COR_SUAVE, tamanho: 11, espacoDepois: 18 },
  );

  escreverParagrafo(ctx, "Colaboradores capacitados", { bold: true, tamanho: 11, cor: COR_SUAVE, espacoDepois: 2 });
  escreverParagrafo(ctx, String(d.concluidos), { tamanho: 36, bold: true, espacoDepois: 6 });

  escreverParagrafo(ctx, "Período de capacitação", { bold: true, tamanho: 11, cor: COR_SUAVE, espacoDepois: 2 });
  escreverParagrafo(ctx, `${fmtData(d.periodoInicio)} — ${fmtData(d.periodoFim)}`, { tamanho: 13, espacoDepois: 18 });

  escreverParagrafo(ctx, "Módulos realizados", { bold: true, tamanho: 11, cor: COR_SUAVE, espacoDepois: 2 });
  if (d.modulosRealizados.length === 0) {
    escreverParagrafo(ctx, "—", { cor: COR_SUAVE });
  } else {
    for (const m of d.modulosRealizados) escreverParagrafo(ctx, `• ${m}`, { tamanho: 11, espacoDepois: 0 });
  }

  ctx.y -= 24;
  escreverParagrafo(ctx, `Emitido em ${fmtData(new Date())}`, { cor: COR_SUAVE, tamanho: 10, espacoDepois: 2 });
  escreverParagrafo(
    ctx,
    `Código de verificação: ${d.inst.codigo_inscricao} · Verifique em inclusaodigital.ologa.com/verificar`,
    { cor: COR_SUAVE, tamanho: 10 },
  );
  return await ctx.pdf.save();
}

export async function gerarDeclaracaoDesenhoUniversal(d: NonNullable<DadosDocumento>): Promise<Uint8Array> {
  const ctx = await novoDocumento();
  cabecalhoMarca(ctx, "Declaração de formação com desenho universal");
  ctx.y -= 40;
  titulo(ctx, "Declaração", 26);
  ctx.y -= 12;

  const texto = `Declara-se que ${d.inst.nome} capacitou ${d.concluidos} colaboradores através de um programa de literacia digital desenhado segundo os princípios do desenho universal, disponibilizado em formato de texto, leitura fácil, áudio, alto contraste e com interpretação em Língua de Sinais Moçambicana.`;
  escreverParagrafo(ctx, texto, { tamanho: 13, espacoDepois: 20 });

  linhaEtiquetaValor(ctx, "Instituição", d.inst.nome);
  linhaEtiquetaValor(ctx, "Localização", [d.inst.distrito, d.inst.provincia].filter(Boolean).join(", ") || "—");
  linhaEtiquetaValor(ctx, "Colaboradores capacitados", String(d.concluidos));
  linhaEtiquetaValor(ctx, "Período", `${fmtData(d.periodoInicio)} — ${fmtData(d.periodoFim)}`);
  linhaEtiquetaValor(ctx, "Data de emissão", fmtData(new Date()));
  linhaEtiquetaValor(ctx, "Código de verificação", d.inst.codigo_inscricao);

  ctx.y -= 20;
  escreverParagrafo(
    ctx,
    "Ologa — Plataforma de Literacia Digital com Desenho Universal",
    { bold: true, tamanho: 11 },
  );
  return await ctx.pdf.save();
}
