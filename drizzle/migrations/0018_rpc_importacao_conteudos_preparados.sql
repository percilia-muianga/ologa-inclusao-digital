-- Importação de conteúdos preparados, pela área reservada, com sessão real.
--
-- Porquê funções na base: as tabelas cursos e curso_modulos não têm política de
-- escrita (só leitura pública), e a importação de um pacote tem de ser tudo ou
-- nada. Cada função é o próprio limite da transacção: qualquer erro anula
-- integralmente o pacote.
--
-- Limites fixos, escritos aqui e não recebidos do cliente:
--  - o actor tem de ser a sessão autenticada (auth.uid()) e Administrador Geral;
--  - o curso é fixo pelo slug dentro da função; nenhum identificador de tabela,
--    linha ou curso vem de fora;
--  - nunca se cria nem apaga lições, módulos ou cursos;
--  - nenhuma questão é activada e nenhuma configuração de exame é tocada.

CREATE OR REPLACE FUNCTION public.rpc_conteudos_seguranca_cibernetica(
  _actor uuid,
  _payload jsonb,
  _confirmar_substituicao boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _slug constant text := 'seguranca-cibernetica-avancada';
  _curso uuid;
  _curso_json jsonb := _payload -> 'curso';
  _licoes jsonb := _payload -> 'licoes';
  _modulos jsonb := _payload -> 'modulos';
  _transversal int;
  _minutos_aval int;
  _horas int;
  _soma_licoes int;
  _soma_modulos int;
  _l jsonb;
  _m jsonb;
  _modulo uuid;
  _actual public.licoes%ROWTYPE;
  _alteradas int := 0;
  _inalteradas int := 0;
  _modulos_alterados int := 0;
  _conflitos text[] := '{}';
BEGIN
  IF auth.uid() IS NULL OR _actor IS NULL OR _actor <> auth.uid() THEN
    RAISE EXCEPTION 'ACTOR_INVALIDO' USING ERRCODE = '42501';
  END IF;
  IF NOT public.is_admin(_actor) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE = '42501';
  END IF;

  IF _curso_json IS NULL OR _licoes IS NULL OR _modulos IS NULL
     OR (_payload ->> 'transversal_minutos') IS NULL THEN
    RAISE EXCEPTION 'PAYLOAD_INCOMPLETO' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(_licoes) <> 15 OR jsonb_array_length(_modulos) <> 3 THEN
    RAISE EXCEPTION 'PAYLOAD_FORA_DO_ESPERADO' USING ERRCODE = '22023';
  END IF;

  _transversal := (_payload ->> 'transversal_minutos')::int;
  _horas := (_curso_json ->> 'carga_horaria')::int;
  _minutos_aval := (_curso_json ->> 'minutos_avaliacao_orientacao')::int;
  SELECT sum((v ->> 'minutos')::int) INTO _soma_licoes FROM jsonb_array_elements(_licoes) v;
  SELECT sum((v ->> 'minutos')::int) INTO _soma_modulos FROM jsonb_array_elements(_modulos) v;

  IF _soma_licoes IS DISTINCT FROM _soma_modulos
     OR _soma_modulos + _transversal + _minutos_aval <> _horas * 60 THEN
    RAISE EXCEPTION 'MINUTOS_INCOERENTES' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso IS NULL THEN
    RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023';
  END IF;

  FOR _l IN SELECT * FROM jsonb_array_elements(_licoes) LOOP
    SELECT cm.modulo_id INTO _modulo
      FROM public.curso_modulos cm
     WHERE cm.curso_id = _curso
       AND cm.ordem = (_l ->> 'modulo_ordem')::int
       AND cm.transversal = false;
    IF _modulo IS NULL THEN
      RAISE EXCEPTION 'MODULO_NAO_LIGADO_AO_CURSO' USING ERRCODE = '22023';
    END IF;

    SELECT * INTO _actual FROM public.licoes
     WHERE modulo_id = _modulo AND ordem = (_l ->> 'ordem')::int;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'LICAO_INEXISTENTE' USING ERRCODE = '22023';
    END IF;

    IF _actual.titulo IS NOT DISTINCT FROM (_l ->> 'titulo')
       AND _actual.duracao_minutos IS NOT DISTINCT FROM (_l ->> 'minutos')::int
       AND _actual.conteudo_elearning IS NOT DISTINCT FROM (_l ->> 'elearning')
       AND _actual.guiao_formador IS NOT DISTINCT FROM (_l ->> 'guiao') THEN
      _inalteradas := _inalteradas + 1;
      CONTINUE;
    END IF;

    -- Conteúdo já publicado e diferente do preparado: não se sobrepõe sem
    -- confirmação expressa de quem está a importar.
    IF COALESCE(_actual.conteudo_elearning, '') <> ''
       AND _actual.estado_conteudo = 'disponivel'
       AND NOT _confirmar_substituicao THEN
      _conflitos := _conflitos || format('módulo %s, lição %s', _l ->> 'modulo_ordem', _l ->> 'ordem');
      CONTINUE;
    END IF;

    UPDATE public.licoes SET
      titulo = _l ->> 'titulo',
      duracao = (_l ->> 'minutos') || ' minutos',
      duracao_minutos = (_l ->> 'minutos')::int,
      conteudo_elearning = _l ->> 'elearning',
      guiao_formador = _l ->> 'guiao',
      estado_conteudo = 'disponivel',
      proposta_por_validar = false
    WHERE id = _actual.id;
    _alteradas := _alteradas + 1;
  END LOOP;

  IF array_length(_conflitos, 1) > 0 THEN
    RAISE EXCEPTION 'CONFLITO_CONTEUDO_EXISTENTE: %', array_to_string(_conflitos, '; ')
      USING ERRCODE = '23505';
  END IF;

  FOR _m IN SELECT * FROM jsonb_array_elements(_modulos) LOOP
    SELECT cm.modulo_id INTO _modulo
      FROM public.curso_modulos cm
     WHERE cm.curso_id = _curso
       AND cm.ordem = (_m ->> 'ordem')::int
       AND cm.transversal = false;
    IF _modulo IS NULL THEN
      RAISE EXCEPTION 'MODULO_NAO_LIGADO_AO_CURSO' USING ERRCODE = '22023';
    END IF;

    UPDATE public.modulos SET descricao = _m ->> 'descricao'
     WHERE id = _modulo AND descricao IS DISTINCT FROM (_m ->> 'descricao');
    IF FOUND THEN _modulos_alterados := _modulos_alterados + 1; END IF;

    UPDATE public.curso_modulos SET carga_horaria_minutos = (_m ->> 'minutos')::int
     WHERE curso_id = _curso AND ordem = (_m ->> 'ordem')::int;
  END LOOP;

  -- Módulo transversal: só a carga horária DESTE curso. O módulo em si, que é
  -- partilhado por todos os cursos, não é alterado.
  UPDATE public.curso_modulos SET carga_horaria_minutos = _transversal
   WHERE curso_id = _curso AND transversal = true;

  UPDATE public.cursos SET
    carga_horaria = _horas,
    modalidade = _curso_json ->> 'modalidade',
    objectivos = _curso_json ->> 'objectivos',
    publico_alvo = _curso_json ->> 'publico_alvo',
    pre_requisitos = _curso_json ->> 'pre_requisitos',
    materiais = _curso_json ->> 'materiais',
    carga_horaria_nota = _curso_json ->> 'nota',
    minutos_avaliacao_orientacao = _minutos_aval
  WHERE id = _curso;

  INSERT INTO public.registo_auditoria(
    utilizador_id, accao, entidade, registo_id, valor_novo, contexto_actor, endereco_ip
  ) VALUES (
    _actor, 'importacao_conteudos', 'cursos', _curso::text,
    jsonb_build_object(
      'pacote', 'seguranca-cibernetica',
      'licoes_alteradas', _alteradas,
      'licoes_inalteradas', _inalteradas,
      'modulos_alterados', _modulos_alterados,
      'substituicao_confirmada', _confirmar_substituicao
    ),
    'sessao_autenticada', public.endereco_ip_do_pedido()
  );

  RETURN jsonb_build_object(
    'pacote', 'seguranca-cibernetica',
    'licoes_alteradas', _alteradas,
    'licoes_inalteradas', _inalteradas,
    'modulos_alterados', _modulos_alterados,
    'horas', _horas
  );
END $$;

GRANT EXECUTE ON FUNCTION public.rpc_conteudos_seguranca_cibernetica(uuid, jsonb, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_conteudos_banco_ia(
  _actor uuid,
  _payload jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _slug constant text := 'introducao-inteligencia-artificial';
  _curso uuid;
  _questoes jsonb := _payload -> 'questoes';
  _q jsonb;
  _modulo uuid;
  _id uuid;
  _activa boolean;
  _estado text;
  _inseridas int := 0;
  _actualizadas int := 0;
  _conflitos int := 0;
BEGIN
  IF auth.uid() IS NULL OR _actor IS NULL OR _actor <> auth.uid() THEN
    RAISE EXCEPTION 'ACTOR_INVALIDO' USING ERRCODE = '42501';
  END IF;
  IF NOT public.is_admin(_actor) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE = '42501';
  END IF;
  IF _questoes IS NULL OR jsonb_array_length(_questoes) <> 90 THEN
    RAISE EXCEPTION 'PAYLOAD_FORA_DO_ESPERADO' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso IS NULL THEN
    RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023';
  END IF;

  FOR _q IN SELECT * FROM jsonb_array_elements(_questoes) LOOP
    IF (_q ->> 'instrumento') NOT IN ('exame_final', 'pre_pos_teste')
       OR COALESCE(btrim(_q ->> 'enunciado'), '') = '' THEN
      RAISE EXCEPTION 'QUESTAO_INVALIDA' USING ERRCODE = '22023';
    END IF;

    SELECT cm.modulo_id INTO _modulo
      FROM public.curso_modulos cm
     WHERE cm.curso_id = _curso AND cm.ordem = (_q ->> 'ordem_modulo')::int;

    SELECT b.id, b.activa, b.estado_revisao INTO _id, _activa, _estado
      FROM public.banco_questoes b
     WHERE b.curso_id = _curso
       AND b.instrumento = (_q ->> 'instrumento')::instrumento_avaliacao
       AND btrim(b.enunciado) = btrim(_q ->> 'enunciado')
     LIMIT 1;

    IF _id IS NOT NULL THEN
      -- Questão já em uso ou já revista: não se sobrepõe.
      IF _activa OR _estado IS DISTINCT FROM 'rascunho' THEN
        _conflitos := _conflitos + 1;
        CONTINUE;
      END IF;
      UPDATE public.banco_questoes SET
        modulo_id = _modulo,
        tipologia = (_q ->> 'tipologia')::tipologia_questao,
        dificuldade = (_q ->> 'dificuldade')::dificuldade_questao,
        conteudo = _q -> 'conteudo',
        resposta = _q -> 'resposta',
        explicacao = _q ->> 'explicacao',
        objectivo_associado = _q ->> 'objectivo_associado',
        cenario = COALESCE((_q ->> 'cenario')::boolean, false),
        activa = false,
        estado_revisao = 'rascunho',
        versao = _q ->> 'versao',
        autor_id = _actor,
        autor_nome = _q ->> 'autor_nome',
        actualizado_em = now()
      WHERE id = _id;
      _actualizadas := _actualizadas + 1;
    ELSE
      INSERT INTO public.banco_questoes(
        curso_id, modulo_id, instrumento, tipologia, dificuldade, enunciado,
        conteudo, resposta, explicacao, objectivo_associado, cenario,
        activa, estado_revisao, versao, autor_id, autor_nome
      ) VALUES (
        _curso, _modulo,
        (_q ->> 'instrumento')::instrumento_avaliacao,
        (_q ->> 'tipologia')::tipologia_questao,
        (_q ->> 'dificuldade')::dificuldade_questao,
        btrim(_q ->> 'enunciado'),
        _q -> 'conteudo', _q -> 'resposta',
        _q ->> 'explicacao', _q ->> 'objectivo_associado',
        COALESCE((_q ->> 'cenario')::boolean, false),
        false, 'rascunho', _q ->> 'versao', _actor, _q ->> 'autor_nome'
      );
      _inseridas := _inseridas + 1;
    END IF;
  END LOOP;

  IF _conflitos > 0 THEN
    RAISE EXCEPTION 'CONFLITO_QUESTOES_EM_USO: % questões já activas ou já revistas', _conflitos
      USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.registo_auditoria(
    utilizador_id, accao, entidade, registo_id, valor_novo, contexto_actor, endereco_ip
  ) VALUES (
    _actor, 'importacao_conteudos', 'banco_questoes', _curso::text,
    jsonb_build_object(
      'pacote', 'banco-inteligencia-artificial',
      'inseridas', _inseridas,
      'actualizadas', _actualizadas,
      'activadas', 0
    ),
    'sessao_autenticada', public.endereco_ip_do_pedido()
  );

  RETURN jsonb_build_object(
    'pacote', 'banco-inteligencia-artificial',
    'inseridas', _inseridas,
    'actualizadas', _actualizadas,
    'activadas', 0
  );
END $$;

GRANT EXECUTE ON FUNCTION public.rpc_conteudos_banco_ia(uuid, jsonb) TO authenticated;