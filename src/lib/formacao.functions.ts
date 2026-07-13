import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const admin = async () =>
  (await import('@/integrations/supabase/client.server')).supabaseAdmin

const NOTA_MINIMA = 2 / 3 // 67% (dois terços)

// ---------- catálogo (leitura pública) ----------

type ModuloBase = {
  id: string
  ordem: number
  titulo: string
  nivel: string
  duracao: string | null
  descricao: string | null
  desenho_universal: string | null
  icone: string | null
  cor_fundo: string | null
}

export const listarModulos = createServerFn({ method: 'GET' }).handler(async () => {
  const s = await admin()
  const { data, error } = await s.from('modulos')
    .select('id, ordem, titulo, nivel, duracao, descricao, desenho_universal, icone, cor_fundo, licoes(id)')
    .order('ordem')
  if (error) throw error
  const linhas = (data ?? []) as (ModuloBase & { licoes: { id: string }[] | null })[]
  return linhas.map(({ licoes, ...rest }) => ({
    ...rest,
    numeroLicoes: (licoes ?? []).length,
  }))
})

// (Nenhum endpoint público devolve nomes/ids de instituições. A associação
// é feita por código escrito pelo formando; a resolução vive dentro de
// emitirCertificado.)

export const obterModulo = createServerFn({ method: 'GET' })
  .inputValidator((i: { moduloId: string }) =>
    z.object({ moduloId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const s = await admin()
    const [m, l, q] = await Promise.all([
      s.from('modulos').select('*').eq('id', data.moduloId).single(),
      s.from('licoes').select('id, ordem, titulo, duracao')
        .eq('modulo_id', data.moduloId).order('ordem'),
      s.from('quiz_perguntas').select('id', { count: 'exact', head: true })
        .eq('modulo_id', data.moduloId),
    ])
    if (m.error) throw m.error
    if (l.error) throw l.error
    return { modulo: m.data, licoes: l.data ?? [], numeroPerguntas: q.count ?? 0 }
  })

// guiao_formador é público — separador visível no HTML de referência
export const obterLicao = createServerFn({ method: 'GET' })
  .inputValidator((i: { licaoId: string }) =>
    z.object({ licaoId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const s = await admin()
    const { data: licao, error } = await s.from('licoes')
      .select('id, modulo_id, ordem, titulo, duracao, ilustracao_svg, conteudo_elearning, guiao_formador')
      .eq('id', data.licaoId).single()
    if (error) throw error
    return licao
  })

// ---------- quiz ----------

export const obterQuiz = createServerFn({ method: 'GET' })
  .inputValidator((i: { moduloId: string }) =>
    z.object({ moduloId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const s = await admin()
    const { data: perguntas, error } = await s.from('quiz_perguntas')
      .select('id, pergunta, opcoes')       // resposta_correta_indice fica no servidor
      .eq('modulo_id', data.moduloId)
    if (error) throw error
    return perguntas ?? []
  })

const respostasSchema = z.object({
  moduloId: z.string().uuid(),
  respostas: z.array(z.object({
    perguntaId: z.string().uuid(),
    indice: z.number().int().min(0),
  })),
})

export const submeterQuiz = createServerFn({ method: 'POST' })
  .inputValidator((i: unknown) => respostasSchema.parse(i))
  .handler(async ({ data }) => {
    const s = await admin()
    const { data: perguntas, error } = await s.from('quiz_perguntas')
      .select('id, resposta_correta_indice').eq('modulo_id', data.moduloId)
    if (error) throw error
    const gab = new Map(perguntas!.map(p => [p.id, p.resposta_correta_indice]))
    const correcoes = data.respostas.map(r => ({
      perguntaId: r.perguntaId,
      indiceCorreto: gab.get(r.perguntaId) ?? -1,
      acertou: gab.get(r.perguntaId) === r.indice,
    }))
    return {
      pontuacao: correcoes.filter(c => c.acertou).length,
      total: perguntas!.length,
      correcoes,
    }
  })

// ---------- diagnóstico (mesma mecânica; sem gabarito no retorno) ----------

export const submeterDiagnostico = createServerFn({ method: 'POST' })
  .inputValidator((i: unknown) => respostasSchema.parse(i))
  .handler(async ({ data }) => {
    const s = await admin()
    const { data: perguntas, error } = await s.from('quiz_perguntas')
      .select('id, resposta_correta_indice').eq('modulo_id', data.moduloId)
    if (error) throw error
    const gab = new Map(perguntas!.map(p => [p.id, p.resposta_correta_indice]))
    const pontuacao = data.respostas.filter(r => gab.get(r.perguntaId) === r.indice).length
    return { pontuacao, total: perguntas!.length }
  })

// ---------- emitir certificado (única escrita) ----------

const emitirSchema = z.object({
  moduloId: z.string().uuid(),

  // se vier, reutiliza o formando existente (não cria novo)
  tokenPessoal: z.string().uuid().nullable().optional(),

  // dados de perfil — obrigatórios só quando não há tokenPessoal
  nome: z.string().trim().min(2).max(120).optional(),
  codigoInstituicao: z.string().trim().min(1).max(64).nullable().optional(),
  genero: z.enum(['feminino', 'masculino', 'prefere_nao_indicar']).nullable().optional(),
  nivelPartida: z.enum(['nenhum', 'basico', 'intermedio', 'prefere_nao_indicar']).nullable().optional(),
  precisaApoio: z.boolean().nullable().optional(),
  apoiosAcessibilidade: z.array(
    z.enum(['lsm', 'leitura_facil', 'baixa_visao', 'audiodescricao', 'mobilidade', 'nenhum'])
  ).nullable().optional(),
  diagnostico: z.object({
    pontuacao: z.number().int().min(0),
    total: z.number().int().positive(),
  }).nullable().optional(),

  progresso: z.object({
    licoesConcluidasIds: z.array(z.string().uuid()),
    quizzes: z.array(z.object({
      moduloId: z.string().uuid(),
      respostas: z.array(z.object({
        perguntaId: z.string().uuid(),
        indice: z.number().int().min(0),
      })),
    })),
  }),
})

function gerarCodigo() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()
}

export const emitirCertificado = createServerFn({ method: 'POST' })
  .inputValidator((i: unknown) => emitirSchema.parse(i))
  .handler(async ({ data }) => {
    const s = await admin()

    // 1. validar que TODAS as lições do módulo estão na lista de concluídas
    const { data: licoesModulo, error: eL } = await s.from('licoes')
      .select('id').eq('modulo_id', data.moduloId)
    if (eL) throw eL
    const idsClient = new Set(data.progresso.licoesConcluidasIds)
    const faltam = (licoesModulo ?? []).filter(l => !idsClient.has(l.id))
    if (faltam.length > 0) throw new Error('LICOES_INCOMPLETAS')

    // 2. recorrigir o quiz do módulo pedido no servidor (nunca aceitar nota do cliente)
    const respostasModulo = data.progresso.quizzes.find(q => q.moduloId === data.moduloId)
    if (!respostasModulo) throw new Error('QUIZ_NAO_SUBMETIDO')
    const { data: perg, error: eP } = await s.from('quiz_perguntas')
      .select('id, resposta_correta_indice').eq('modulo_id', data.moduloId)
    if (eP) throw eP
    const gab = new Map(perg!.map(p => [p.id, p.resposta_correta_indice]))
    const totalModulo = perg!.length
    const pontuacaoModulo = respostasModulo.respostas
      .filter(r => gab.get(r.perguntaId) === r.indice).length
    if (totalModulo === 0 || pontuacaoModulo / totalModulo < NOTA_MINIMA) {
      throw new Error('QUIZ_INSUFICIENTE')
    }

    // 3. resolver formando: reutilizar por token, ou criar novo
    let formandoId: string
    let tokenPessoal: string

    if (data.tokenPessoal) {
      const { data: f, error } = await s.from('formandos')
        .select('id, token_pessoal').eq('token_pessoal', data.tokenPessoal).single()
      if (error || !f) throw new Error('TOKEN_INVALIDO')
      formandoId = f.id
      tokenPessoal = f.token_pessoal

      // se já existe certificado para este módulo, devolve-o (não cria outro)
      const { data: cert } = await s.from('certificados')
        .select('codigo_verificacao, emitido_em')
        .eq('formando_id', formandoId).eq('modulo_id', data.moduloId).maybeSingle()
      if (cert) {
        return {
          tokenPessoal,
          codigoVerificacao: cert.codigo_verificacao,
          emitidoEm: cert.emitido_em,
          jaExistia: true,
        }
      }
    } else {
      if (!data.nome) throw new Error('NOME_OBRIGATORIO')

      // Resolver código escrito → instituicao_id. Erro genérico se inválido:
      // não revela se a instituição existe.
      let instituicaoIdResolvido: string | null = null
      const codigo = data.codigoInstituicao?.trim().toUpperCase() || null
      if (codigo) {
        const { data: inst } = await s.from('instituicoes')
          .select('id').eq('codigo_inscricao', codigo).maybeSingle()
        if (!inst) throw new Error('CODIGO_INVALIDO')
        instituicaoIdResolvido = inst.id
      }

      const { data: novo, error } = await s.from('formandos').insert({
        nome: data.nome,
        instituicao_id: instituicaoIdResolvido,
        genero: data.genero ?? null,
        nivel_partida: data.nivelPartida ?? null,
        precisa_apoio: data.precisaApoio ?? null,
        apoios_acessibilidade: data.apoiosAcessibilidade ?? null,
        diagnostico_pontuacao: data.diagnostico?.pontuacao ?? null,
        diagnostico_total: data.diagnostico?.total ?? null,
      }).select('id, token_pessoal, instituicao_id').single()
      if (error) throw error
      formandoId = novo.id
      tokenPessoal = novo.token_pessoal
    }

    // 4. gravar progresso (idempotente: ignorar duplicados no upsert)
    if (data.progresso.licoesConcluidasIds.length) {
      const { error } = await s.from('progresso_licoes').upsert(
        data.progresso.licoesConcluidasIds.map(id => ({
          formando_id: formandoId, licao_id: id,
        })),
        { onConflict: 'formando_id,licao_id', ignoreDuplicates: true },
      )
      if (error) throw error
    }
    // grava só a nota do módulo que se está a certificar (a nota final validada)
    {
      const { error } = await s.from('progresso_quizzes').insert({
        formando_id: formandoId,
        modulo_id: data.moduloId,
        pontuacao: pontuacaoModulo,
        total: totalModulo,
      })
      if (error) throw error
    }

    // 5. buscar nome do módulo e da instituição (snapshot no certificado)
    const { data: modulo } = await s.from('modulos')
      .select('titulo').eq('id', data.moduloId).single()

    let nomeInstituicao = ''
    const { data: f } = await s.from('formandos')
      .select('nome, instituicao_id').eq('id', formandoId).single()
    const nomeFormando = f?.nome ?? (data.nome ?? '')
    if (f?.instituicao_id) {
      const { data: inst } = await s.from('instituicoes')
        .select('nome').eq('id', f.instituicao_id).single()
      nomeInstituicao = inst?.nome ?? ''
    }

    // 6. emitir certificado — retry em colisão de codigo_verificacao (UNIQUE)
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const codigo = gerarCodigo()
      const { data: cert, error } = await s.from('certificados').insert({
        formando_id: formandoId,
        modulo_id: data.moduloId,
        codigo_verificacao: codigo,
        nome_formando: nomeFormando,
        nome_instituicao: nomeInstituicao,
        titulo_modulo: modulo?.titulo ?? '',
      }).select('codigo_verificacao, emitido_em').single()

      if (!error) {
        return {
          tokenPessoal,
          codigoVerificacao: cert.codigo_verificacao,
          emitidoEm: cert.emitido_em,
          jaExistia: false,
        }
      }
      // 23505 = unique_violation
      const code = (error as { code?: string }).code
      if (code !== '23505') throw error

      // se colidiu em (formando_id, modulo_id), devolve o existente
      const { data: existente } = await s.from('certificados')
        .select('codigo_verificacao, emitido_em')
        .eq('formando_id', formandoId).eq('modulo_id', data.moduloId).maybeSingle()
      if (existente) {
        return {
          tokenPessoal,
          codigoVerificacao: existente.codigo_verificacao,
          emitidoEm: existente.emitido_em,
          jaExistia: true,
        }
      }
      // senão foi colisão de codigo_verificacao — nova tentativa
    }
    throw new Error('CERTIFICADO_COLISAO_CODIGO')
  })
