-- Migração exclusivamente de segurança. Sem carga pedagógica.
--
-- Lacuna fechada: emissão de certificados, tentativas de exame e criação de
-- formandos eram escritas pelo servidor de confiança sem pessoa identificada,
-- ficando na auditoria apenas como "servidor_service_role".
--
-- A partir daqui essas escritas passam por operações específicas (uma por
-- acção, com campos fixos) que só o servidor de confiança pode executar e que
-- recebem o identificador da conta já autenticada no servidor. A operação
-- valida o vínculo (formandos.perfil_id = actor) ou a administração, marca o
-- actor em contexto LOCAL da própria transacção e a auditoria grava esse actor.
-- Nenhuma operação aceita tabela, coluna ou SQL arbitrários.

-- 1. Contexto de actor de confiança ------------------------------------------
-- Só é aceite quando quem escreve é mesmo o papel service_role e não existe
-- sessão autenticada. Um cliente "authenticated" não tem como definir estes
-- parâmetros: não tem EXECUTE em nenhuma destas operações e a API de dados só
-- permite definir parâmetros do espaço "request.*".

CREATE OR REPLACE FUNCTION public.marcar_actor_confiavel(_actor uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user <> 'service_role' THEN
    RAISE EXCEPTION 'Contexto de actor de confiança reservado ao servidor.'
      USING ERRCODE = '42501';
  END IF;
  IF _actor IS NULL THEN
    RAISE EXCEPTION 'Actor em falta.' USING ERRCODE = '42501';
  END IF;
  PERFORM set_config('app.actor_id', _actor::text, true);
  PERFORM set_config('app.actor_confianca', 'service_role', true);
END $$;

REVOKE ALL ON FUNCTION public.marcar_actor_confiavel(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.marcar_actor_confiavel(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.actor_auditoria()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE _a uuid;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    RETURN auth.uid();
  END IF;
  -- Sem sessão: só se aceita o actor marcado dentro da transacção por uma
  -- operação de confiança. Nunca vindo do cliente.
  IF COALESCE(current_setting('app.actor_confianca', true), '') <> 'service_role' THEN
    RETURN NULL;
  END IF;
  BEGIN
    _a := NULLIF(current_setting('app.actor_id', true), '')::uuid;
  EXCEPTION WHEN OTHERS THEN
    _a := NULL;
  END;
  RETURN _a;
END $$;

CREATE OR REPLACE FUNCTION public.auditar_alteracoes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _antigo jsonb;
  _novo jsonb;
  _colunas text[] := '{}';
  _chave text;
  _id text;
  _pedido text;
  _actor uuid;
  _contexto text;
BEGIN
  _antigo := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END;
  _novo   := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END;

  IF TG_OP = 'UPDATE' THEN
    FOR _chave IN SELECT jsonb_object_keys(_novo) LOOP
      IF (_antigo -> _chave) IS DISTINCT FROM (_novo -> _chave) THEN
        _colunas := array_append(_colunas, _chave);
      END IF;
    END LOOP;
  ELSIF TG_OP = 'INSERT' THEN
    SELECT array_agg(k ORDER BY k) INTO _colunas FROM jsonb_object_keys(_novo) AS k;
  END IF;

  _id := COALESCE(_novo ->> 'id', _antigo ->> 'id');

  BEGIN
    _pedido := current_setting('request.headers', true)::json ->> 'x-request-id';
  EXCEPTION WHEN OTHERS THEN
    _pedido := NULL;
  END;

  _actor := public.actor_auditoria();
  _contexto := CASE
    WHEN auth.uid() IS NOT NULL THEN 'sessao_autenticada'
    WHEN _actor IS NOT NULL THEN 'servidor_rpc_actor_verificado'
    ELSE 'servidor_service_role'
  END;

  INSERT INTO public.registo_auditoria(
    utilizador_id, accao, entidade, registo_id,
    valor_anterior, valor_novo, campos_sensiveis_alterados,
    endereco_ip, contexto_actor, requisicao_id
  ) VALUES (
    _actor,
    lower(TG_OP),
    TG_TABLE_NAME,
    _id,
    NULL,
    jsonb_build_object('colunas', to_jsonb(COALESCE(_colunas, '{}'::text[]))),
    NULLIF(_colunas, '{}'),
    public.endereco_ip_do_pedido(),
    _contexto,
    _pedido
  );

  RETURN COALESCE(NEW, OLD);
END $function$;

COMMENT ON FUNCTION public.auditar_alteracoes() IS
  'Regista apenas metadados: id do registo, operação, nomes das colunas alteradas (sem valores), momento, actor e identificador do pedido. O actor é auth.uid() quando há sessão; sem sessão só é aceite o actor marcado na mesma transacção por uma operação de confiança executada pelo papel service_role. Nunca valores, dados pessoais, enunciados, gabaritos ou tokens.';

-- formandos passa a ter registo de metadados como as restantes entidades.
DROP TRIGGER IF EXISTS trg_auditar_formandos ON public.formandos;
CREATE TRIGGER trg_auditar_formandos
  AFTER INSERT OR UPDATE OR DELETE ON public.formandos
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

DROP TRIGGER IF EXISTS trg_auditar_progresso_quizzes ON public.progresso_quizzes;
CREATE TRIGGER trg_auditar_progresso_quizzes
  AFTER INSERT OR UPDATE OR DELETE ON public.progresso_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

-- 2. Verificação de vínculo ---------------------------------------------------

CREATE OR REPLACE FUNCTION public.actor_e_titular(_actor uuid, _formando_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.formandos f
    WHERE f.id = _formando_id AND f.perfil_id IS NOT NULL AND f.perfil_id = _actor
  )
$$;

CREATE OR REPLACE FUNCTION public.actor_e_administracao(_actor uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(public.is_admin(_actor), false)
      OR COALESCE(public.e_admin_atdi(_actor), false)
$$;

-- 3. Operações específicas ----------------------------------------------------
-- Cada uma escreve um conjunto fixo de colunas numa entidade determinada.
-- Nenhuma recebe nome, data de nascimento, correio electrónico ou token.

-- 3.1 Criar o registo de formando da própria conta.
CREATE OR REPLACE FUNCTION public.rpc_formando_criar(
  _actor uuid,
  _instituicao_id uuid,
  _genero genero,
  _nivel_partida nivel_partida,
  _precisa_apoio boolean,
  _apoios apoio_acessibilidade[],
  _diagnostico_pontuacao integer,
  _diagnostico_total integer
)
RETURNS TABLE (form_id uuid, form_token uuid)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _nome text;
  _existente uuid;
BEGIN
  PERFORM public.marcar_actor_confiavel(_actor);

  SELECT btrim(p.nome) INTO _nome FROM public.perfis p WHERE p.id = _actor;
  IF _nome IS NULL OR _nome = '' THEN
    RAISE EXCEPTION 'PERFIL_INCOMPLETO' USING ERRCODE = '42501';
  END IF;

  SELECT f.id INTO _existente FROM public.formandos f WHERE f.perfil_id = _actor LIMIT 1;
  IF _existente IS NOT NULL THEN
    RETURN QUERY SELECT f.id, f.token_pessoal FROM public.formandos f WHERE f.id = _existente;
    RETURN;
  END IF;

  RETURN QUERY
  WITH ins AS (
    INSERT INTO public.formandos(
      nome, perfil_id, instituicao_id, genero, nivel_partida,
      precisa_apoio, apoios_acessibilidade, diagnostico_pontuacao, diagnostico_total
    ) VALUES (
      _nome, _actor, _instituicao_id, _genero, _nivel_partida,
      _precisa_apoio, _apoios, _diagnostico_pontuacao, _diagnostico_total
    )
    RETURNING id, token_pessoal
  )
  SELECT ins.id, ins.token_pessoal FROM ins;
END $$;

-- 3.2 Progresso e nota do módulo, apurados no servidor.
CREATE OR REPLACE FUNCTION public.rpc_progresso_certificacao(
  _actor uuid,
  _formando_id uuid,
  _licoes uuid[],
  _modulo_id uuid,
  _pontuacao integer,
  _total integer
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM public.marcar_actor_confiavel(_actor);
  IF NOT public.actor_e_titular(_actor, _formando_id) THEN
    RAISE EXCEPTION 'VINCULO_NAO_VERIFICADO' USING ERRCODE = '42501';
  END IF;

  IF _licoes IS NOT NULL AND array_length(_licoes, 1) > 0 THEN
    INSERT INTO public.progresso_licoes(formando_id, licao_id)
    SELECT _formando_id, l FROM unnest(_licoes) AS l
    ON CONFLICT (formando_id, licao_id) DO NOTHING;
  END IF;

  INSERT INTO public.progresso_quizzes(formando_id, modulo_id, pontuacao, total)
  VALUES (_formando_id, _modulo_id, _pontuacao, _total);
END $$;

-- 3.3 Emitir certificado de módulo (literacia).
CREATE OR REPLACE FUNCTION public.rpc_certificado_modulo_emitir(
  _actor uuid,
  _formando_id uuid,
  _modulo_id uuid,
  _codigo text
)
RETURNS TABLE (cert_codigo text, cert_emitido_em timestamptz)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _nome_formando text;
  _nome_inst text := '';
  _titulo text;
BEGIN
  PERFORM public.marcar_actor_confiavel(_actor);
  IF NOT (public.actor_e_titular(_actor, _formando_id)
          OR public.actor_e_administracao(_actor)) THEN
    RAISE EXCEPTION 'VINCULO_NAO_VERIFICADO' USING ERRCODE = '42501';
  END IF;

  SELECT f.nome, COALESCE(i.nome, '')
    INTO _nome_formando, _nome_inst
    FROM public.formandos f
    LEFT JOIN public.instituicoes i ON i.id = f.instituicao_id
   WHERE f.id = _formando_id;
  IF _nome_formando IS NULL THEN
    RAISE EXCEPTION 'FORMANDO_INEXISTENTE' USING ERRCODE = '42501';
  END IF;

  SELECT m.titulo INTO _titulo FROM public.modulos m WHERE m.id = _modulo_id;

  RETURN QUERY
  WITH ins AS (
    INSERT INTO public.certificados(
      formando_id, modulo_id, codigo_verificacao,
      nome_formando, nome_instituicao, titulo_modulo
    ) VALUES (
      _formando_id, _modulo_id, _codigo,
      _nome_formando, _nome_inst, COALESCE(_titulo, '')
    )
    RETURNING codigo_verificacao, emitido_em
  )
  SELECT ins.codigo_verificacao, ins.emitido_em FROM ins;
END $$;

-- 3.4 Abrir tentativa de exame com as questões já sorteadas no servidor.
CREATE OR REPLACE FUNCTION public.rpc_exame_tentativa_criar(
  _actor uuid,
  _formando_id uuid,
  _curso_id uuid,
  _turma_id uuid,
  _numero integer,
  _limite_em timestamptz,
  _total integer,
  _questoes jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE _tentativa uuid;
BEGIN
  PERFORM public.marcar_actor_confiavel(_actor);
  IF NOT public.actor_e_titular(_actor, _formando_id) THEN
    RAISE EXCEPTION 'VINCULO_NAO_VERIFICADO' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.exame_tentativas(formando_id, curso_id, turma_id, numero, limite_em, total)
  VALUES (_formando_id, _curso_id, _turma_id, _numero, _limite_em, _total)
  RETURNING id INTO _tentativa;

  INSERT INTO public.exame_tentativa_questoes(
    tentativa_id, questao_id, ordem, modulo_id, tipologia, dificuldade,
    enunciado, apresentacao, resposta_correcta, explicacao
  )
  SELECT _tentativa, q.questao_id, q.ordem, q.modulo_id,
         q.tipologia::tipologia_questao, q.dificuldade::dificuldade_questao,
         q.enunciado, q.apresentacao, q.resposta_correcta, q.explicacao
    FROM jsonb_to_recordset(_questoes) AS q(
      questao_id uuid, ordem integer, modulo_id uuid, tipologia text,
      dificuldade text, enunciado text, apresentacao jsonb,
      resposta_correcta jsonb, explicacao text
    );

  RETURN _tentativa;
END $$;

-- 3.5 Guardar resposta da própria tentativa.
CREATE OR REPLACE FUNCTION public.rpc_exame_resposta_guardar(
  _actor uuid,
  _tentativa_id uuid,
  _questao_id uuid,
  _resposta jsonb
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE _formando uuid;
BEGIN
  PERFORM public.marcar_actor_confiavel(_actor);
  SELECT t.formando_id INTO _formando FROM public.exame_tentativas t WHERE t.id = _tentativa_id;
  IF _formando IS NULL OR NOT public.actor_e_titular(_actor, _formando) THEN
    RAISE EXCEPTION 'VINCULO_NAO_VERIFICADO' USING ERRCODE = '42501';
  END IF;

  UPDATE public.exame_tentativa_questoes
     SET resposta_dada = _resposta, respondido_em = now()
   WHERE id = _questao_id AND tentativa_id = _tentativa_id;
END $$;

-- 3.6 Fechar a tentativa com a correcção feita no servidor.
CREATE OR REPLACE FUNCTION public.rpc_exame_tentativa_submeter(
  _actor uuid,
  _tentativa_id uuid,
  _correccoes jsonb,
  _pontuacao integer,
  _total integer,
  _nota_pct numeric,
  _estado estado_tentativa
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE _formando uuid;
BEGIN
  PERFORM public.marcar_actor_confiavel(_actor);
  SELECT t.formando_id INTO _formando FROM public.exame_tentativas t WHERE t.id = _tentativa_id;
  IF _formando IS NULL OR NOT public.actor_e_titular(_actor, _formando) THEN
    RAISE EXCEPTION 'VINCULO_NAO_VERIFICADO' USING ERRCODE = '42501';
  END IF;
  IF _estado NOT IN ('submetida', 'expirada') THEN
    RAISE EXCEPTION 'ESTADO_NAO_PERMITIDO' USING ERRCODE = '42501';
  END IF;

  UPDATE public.exame_tentativa_questoes AS q
     SET correcta = c.correcta
    FROM jsonb_to_recordset(_correccoes) AS c(id uuid, correcta boolean)
   WHERE q.id = c.id AND q.tentativa_id = _tentativa_id;

  UPDATE public.exame_tentativas
     SET estado = _estado,
         submetido_em = now(),
         pontuacao = _pontuacao,
         total = _total,
         nota_pct = _nota_pct
   WHERE id = _tentativa_id;
END $$;

-- 3.7 Emitir certificado de curso. Título, carga, província e datas são lidos
-- da base; nota e assiduidade vêm já apuradas no servidor.
CREATE OR REPLACE FUNCTION public.rpc_certificado_curso_emitir(
  _actor uuid,
  _formando_id uuid,
  _curso_id uuid,
  _turma_id uuid,
  _tentativa_id uuid,
  _codigo text,
  _nota_final_pct numeric,
  _assiduidade_pct numeric,
  _base base_assiduidade,
  _assiduidade_estrita_pct numeric,
  _assiduidade_ajustada_pct numeric
)
RETURNS TABLE (cert_codigo text, cert_emitido_em timestamptz)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _nome text;
  _titulo text;
  _carga integer;
  _prov text;
  _desig text;
  _ini date;
  _fim date;
BEGIN
  PERFORM public.marcar_actor_confiavel(_actor);
  IF NOT (public.actor_e_titular(_actor, _formando_id)
          OR public.actor_e_administracao(_actor)) THEN
    RAISE EXCEPTION 'VINCULO_NAO_VERIFICADO' USING ERRCODE = '42501';
  END IF;

  SELECT f.nome INTO _nome FROM public.formandos f WHERE f.id = _formando_id;
  IF _nome IS NULL THEN
    RAISE EXCEPTION 'FORMANDO_INEXISTENTE' USING ERRCODE = '42501';
  END IF;

  SELECT c.titulo, c.carga_horaria INTO _titulo, _carga
    FROM public.cursos c WHERE c.id = _curso_id;

  IF _turma_id IS NOT NULL THEN
    SELECT t.provincia, t.designacao, t.data_inicio, t.data_fim
      INTO _prov, _desig, _ini, _fim
      FROM public.turmas t WHERE t.id = _turma_id;
  END IF;

  RETURN QUERY
  WITH ins AS (
  INSERT INTO public.certificados_curso(
    formando_id, curso_id, turma_id, tentativa_id, codigo_verificacao,
    nome_formando, titulo_curso, carga_horaria, provincia, turma_designacao,
    data_inicio, data_fim, nota_final_pct, assiduidade_pct, base_assiduidade,
    assiduidade_estrita_pct, assiduidade_ajustada_pct
  ) VALUES (
    _formando_id, _curso_id, _turma_id, _tentativa_id, _codigo,
    _nome, COALESCE(_titulo, ''), COALESCE(_carga, 0), _prov, _desig,
    _ini, _fim, _nota_final_pct, _assiduidade_pct, _base,
    _assiduidade_estrita_pct, _assiduidade_ajustada_pct
  )
  RETURNING codigo_verificacao, emitido_em
  )
  SELECT ins.codigo_verificacao, ins.emitido_em FROM ins;
END $$;

-- 4. Privilégios: só o servidor de confiança executa estas operações. --------
DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.rpc_formando_criar(uuid,uuid,genero,nivel_partida,boolean,apoio_acessibilidade[],integer,integer)',
    'public.rpc_progresso_certificacao(uuid,uuid,uuid[],uuid,integer,integer)',
    'public.rpc_certificado_modulo_emitir(uuid,uuid,uuid,text)',
    'public.rpc_exame_tentativa_criar(uuid,uuid,uuid,uuid,integer,timestamptz,integer,jsonb)',
    'public.rpc_exame_resposta_guardar(uuid,uuid,uuid,jsonb)',
    'public.rpc_exame_tentativa_submeter(uuid,uuid,jsonb,integer,integer,numeric,estado_tentativa)',
    'public.rpc_certificado_curso_emitir(uuid,uuid,uuid,uuid,uuid,text,numeric,numeric,base_assiduidade,numeric,numeric)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.actor_auditoria() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.actor_e_titular(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.actor_e_administracao(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.actor_e_titular(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.actor_e_administracao(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.actor_auditoria() TO service_role;

COMMENT ON FUNCTION public.rpc_formando_criar(uuid,uuid,genero,nivel_partida,boolean,apoio_acessibilidade[],integer,integer) IS
  'Cria o registo de formando da própria conta. O nome é lido do perfil, nunca recebido do cliente.';
COMMENT ON FUNCTION public.rpc_certificado_curso_emitir(uuid,uuid,uuid,uuid,uuid,text,numeric,numeric,base_assiduidade,numeric,numeric) IS
  'Emite certificado de curso com actor verificado. Nota e assiduidade são apuradas no servidor; título, carga, província e datas são lidos da base.';

-- 5. Escrita directa por conta de utilizador deixa de ser possível nestas
-- entidades: só as operações acima, com actor verificado, as escrevem.
REVOKE INSERT, UPDATE, DELETE ON public.certificados FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.certificados_curso FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.exame_tentativas FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.exame_tentativa_questoes FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.formandos FROM anon, authenticated;