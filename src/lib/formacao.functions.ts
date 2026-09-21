import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { sessaoObrigatoria, type ContextoAutenticado } from '@/lib/guardas'

type EmitirCertificadoEntrada = z.infer<typeof emitirSchema>

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
    .eq('catalogo_publico', true)
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

/**
 * Um módulo pode pertencer a vários cursos (o transversal pertence aos seis).
 * Por isso não há «curso pai» — o contexto vem do percurso que a pessoa
 * seguiu e é sempre validado aqui: só é devolvido se o módulo estiver mesmo
 * ligado a esse curso. A ordem mostrada é a ordem dentro do curso, não o
 * índice global da base.
 */
export const obterModulo = createServerFn({ method: 'GET' })
  .inputValidator((i: { moduloId: string; cursoSlug?: string | null }) =>
    z.object({
      moduloId: z.string().uuid(),
      cursoSlug: z.string().trim().min(1).max(120).nullish(),
    }).parse(i))
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

    let contexto: {
      cursoSlug: string
      cursoTitulo: string
      ordemNoCurso: number
      transversal: boolean
      totalModulos: number
    } | null = null
    if (data.cursoSlug) {
      const curso = await s.from('cursos')
        .select('id, titulo').eq('slug', data.cursoSlug).maybeSingle()
      if (curso.error) throw curso.error
      if (curso.data) {
        const rel = await s.from('curso_modulos')
          .select('modulo_id, ordem, transversal')
          .eq('curso_id', curso.data.id).order('ordem')
        if (rel.error) throw rel.error
        const meu = (rel.data ?? []).find((r) => r.modulo_id === data.moduloId)
        if (meu) {
          contexto = {
            cursoSlug: data.cursoSlug,
            cursoTitulo: curso.data.titulo,
            ordemNoCurso: meu.ordem,
            transversal: !!meu.transversal,
            totalModulos: (rel.data ?? []).length,
          }
        }
      }
    }

    return { modulo: m.data, licoes: l.data ?? [], numeroPerguntas: q.count ?? 0, contexto }
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

/**
 * Emissão do certificado do módulo de literacia.
 *
 * Segurança: exige sessão real. A identidade do certificado vem do perfil
 * lido no servidor — nunca do nome enviado pelo cliente. O percurso por token
 * só é reutilizado quando o token pertence a um formando vinculado à conta
 * autenticada. O quiz é sempre recorrigido no servidor.
 */
export const emitirCertificado = createServerFn({ method: 'POST' })
  .middleware([sessaoObrigatoria])
  .inputValidator((i: unknown) => emitirSchema.parse(i))
  .handler(async ({ data, context }) => {
    const s = await admin()

    // identidade: sempre do servidor
    const { data: perfilSessao } = await (context as unknown as ContextoAutenticado).supabase
      .from('perfis')
      .select('nome')
      .eq('id', (context as unknown as ContextoAutenticado).userId)
      .maybeSingle()
    const nomeDoPerfil = (perfilSessao as { nome?: string } | null)?.nome?.trim()
    if (!nomeDoPerfil) throw new Error('PERFIL_INCOMPLETO')
    const perfilId = (context as unknown as ContextoAutenticado).userId

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

    // 3. resolver o formando SEMPRE pelo vínculo com a conta autenticada
    let formandoId: string
    let tokenPessoal: string

    const { data: vinculado } = await s.from('formandos')
      .select('id, token_pessoal').eq('perfil_id', perfilId).maybeSingle()

    if (data.tokenPessoal) {
      const { data: f, error } = await s.from('formandos')
        .select('id, token_pessoal, perfil_id').eq('token_pessoal', data.tokenPessoal).single()
      if (error || !f) throw new Error('TOKEN_INVALIDO')
      // Um token conhecido não é prova de titularidade.
      if (f.perfil_id !== perfilId) throw new Error('TOKEN_NAO_VINCULADO')
      formandoId = f.id
      tokenPessoal = f.token_pessoal
    } else if (vinculado) {
      formandoId = vinculado.id
      tokenPessoal = vinculado.token_pessoal
    } else {
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

      // Operação específica do servidor: recebe o actor já autenticado aqui e
      // vai buscar o nome ao perfil. O nome do cliente nunca é usado.
      const { data: novo, error } = await s.rpc('rpc_formando_criar', {
        _actor: perfilId,
        _instituicao_id: instituicaoIdResolvido,
        _genero: data.genero ?? null,
        _nivel_partida: data.nivelPartida ?? null,
        _precisa_apoio: data.precisaApoio ?? null,
        _apoios: data.apoiosAcessibilidade ?? null,
        _diagnostico_pontuacao: data.diagnostico?.pontuacao ?? null,
        _diagnostico_total: data.diagnostico?.total ?? null,
      } as never)
      if (error) throw error
      const linha = (novo as unknown as { form_id: string; form_token: string }[])[0]
      if (!linha) throw new Error('FORMANDO_NAO_CRIADO')
      formandoId = linha.form_id
      tokenPessoal = linha.form_token
    }

    // certificado já emitido para este módulo: devolve-o, não cria outro
    {
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
    }

    // 4. gravar progresso e a nota apurada no servidor, com actor verificado
    {
      const { error } = await s.rpc('rpc_progresso_certificacao', {
        _actor: perfilId,
        _formando_id: formandoId,
        _licoes: data.progresso.licoesConcluidasIds,
        _modulo_id: data.moduloId,
        _pontuacao: pontuacaoModulo,
        _total: totalModulo,
      } as never)
      if (error) throw error
    }

    // 5. emitir certificado — nome, instituição e título do módulo são lidos
    // dentro da operação, na base. Retry em colisão de codigo_verificacao.
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const { data: linhas, error } = await s.rpc('rpc_certificado_modulo_emitir', {
        _actor: perfilId,
        _formando_id: formandoId,
        _modulo_id: data.moduloId,
        _codigo: gerarCodigo(),
      } as never)

      const cert = (linhas as unknown as { cert_codigo: string; cert_emitido_em: string }[] | null)?.[0]
      if (!error && cert) {
        return {
          tokenPessoal,
          codigoVerificacao: cert.cert_codigo,
          emitidoEm: cert.cert_emitido_em,
          jaExistia: false,
        }
      }
      // 23505 = unique_violation
      const code = (error as { code?: string } | null)?.code
      if (error && code !== '23505') throw error

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
