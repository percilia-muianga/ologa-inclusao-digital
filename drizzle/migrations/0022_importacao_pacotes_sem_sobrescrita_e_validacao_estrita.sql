-- Revisão correctiva do importador de pacotes fixos.
--
-- Mudanças:
--  1. O pacote de IA deixa de actualizar questões existentes. Só insere
--     códigos em falta. Qualquer diferença num código já existente é conflito
--     e anula o pacote inteiro: revisão humana nunca é sobreposta.
--  2. Validação estrita do pacote também dentro da base: matriz das 80 finais
--     (36/36/8 por módulo, 32/16/16 por tipo mais 16 de cenário, 32/32/16 por
--     dificuldade), módulo obrigatório, conteúdo e resposta não nulos, campos
--     de lista não nulos e códigos exactamente os 90 previstos.
--  3. Segurança Cibernética: soma de minutos POR módulo, exactamente três
--     módulos temáticos e um transversal, horas nunca nulas.
--  4. Bloqueio das linhas existentes (FOR UPDATE) ANTES de comparar a
--     impressão digital, para impedir corrida com edição normal, que não usa
--     o trinco de pacote.
--  5. A impressão digital do banco passa a incluir código, módulo, objectivo,
--     cenário e versão.

CREATE OR REPLACE FUNCTION public.rpc_estado_banco_ia()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _slug constant text := 'introducao-inteligencia-artificial';
  _curso uuid;
  _texto text;
  _total int;
  _activas int;
  _revistas int;
  _sem_codigo int;
BEGIN
  IF NOT public.e_admin_geral_ologa(auth.uid()) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso IS NULL THEN
    RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023';
  END IF;

  SELECT count(*), count(*) FILTER (WHERE activa),
         count(*) FILTER (WHERE estado_revisao <> 'rascunho'),
         count(*) FILTER (WHERE codigo IS NULL)
    INTO _total, _activas, _revistas, _sem_codigo
    FROM public.banco_questoes WHERE curso_id = _curso;

  SELECT coalesce(string_agg(t, '|' ORDER BY t), '') INTO _texto FROM (
    SELECT coalesce(codigo, 'sem-codigo:' || id::text) || ':' || md5(
             coalesce(modulo_id::text, '-') || '#' || instrumento::text || '#'
             || tipologia::text || '#' || dificuldade::text || '#'
             || enunciado || '#' || conteudo::text || '#' || resposta::text || '#'
             || coalesce(explicacao, '') || '#' || coalesce(objectivo_associado, '') || '#'
             || cenario::text || '#' || activa::text || '#' || estado_revisao || '#' || versao
           ) AS t
      FROM public.banco_questoes WHERE curso_id = _curso
  ) z;

  RETURN jsonb_build_object(
    'pacote', 'banco-inteligencia-artificial',
    'total', _total,
    'activas', _activas,
    'fora_de_rascunho', _revistas,
    'sem_codigo', _sem_codigo,
    'hash', md5(_texto)
  );
END $$;

CREATE OR REPLACE FUNCTION public.rpc_importar_banco_ia(
  _payload jsonb,
  _hash_estado text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _slug constant text := 'introducao-inteligencia-artificial';
  _actor uuid := auth.uid();
  _curso uuid;
  _questoes jsonb := _payload -> 'questoes';
  _estado jsonb;
  _q jsonb;
  _modulo uuid;
  _a public.banco_questoes%ROWTYPE;
  _inseridas int := 0;
  _inalteradas int := 0;
  _conflitos text[] := '{}';
BEGIN
  IF _actor IS NULL THEN
    RAISE EXCEPTION 'SEM_SESSAO' USING ERRCODE = '42501';
  END IF;
  IF NOT public.e_admin_geral_ologa(_actor) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('pacote_banco_ia'));

  IF _questoes IS NULL OR jsonb_typeof(_questoes) <> 'array'
     OR jsonb_array_length(_questoes) <> 90 THEN
    RAISE EXCEPTION 'PAYLOAD_FORA_DO_ESPERADO' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(DISTINCT v ->> 'codigo') FROM jsonb_array_elements(_questoes) v) <> 90 THEN
    RAISE EXCEPTION 'CODIGOS_REPETIDOS' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(_questoes) v
     WHERE coalesce(btrim(v ->> 'codigo'), '') = ''
        OR coalesce(btrim(v ->> 'enunciado'), '') = ''
        OR coalesce(btrim(v ->> 'versao'), '') = ''
        OR coalesce(btrim(v ->> 'explicacao'), '') = ''
        OR (v ->> 'instrumento') IS NULL
        OR (v ->> 'instrumento') NOT IN ('exame_final', 'pre_pos_teste')
        OR (v ->> 'tipologia') IS NULL
        OR (v ->> 'tipologia') NOT IN ('escolha_multipla','verdadeiro_falso','resposta_curta','correspondencia','ordenacao')
        OR (v ->> 'dificuldade') IS NULL
        OR (v ->> 'dificuldade') NOT IN ('facil','media','dificil')
        OR (v -> 'conteudo') IS NULL OR jsonb_typeof(v -> 'conteudo') = 'null'
        OR (v -> 'resposta') IS NULL OR jsonb_typeof(v -> 'resposta') = 'null'
        OR (v ->> 'ordem_modulo') IS NULL
        OR (v ->> 'cenario') IS NULL
        OR coalesce((v ->> 'activa')::boolean, false) = true
  ) THEN
    RAISE EXCEPTION 'QUESTAO_INVALIDA' USING ERRCODE = '22023';
  END IF;

  -- Matriz das 80 questões finais e das 10 de diagnóstico.
  IF (SELECT count(*) FROM jsonb_array_elements(_questoes) v WHERE v ->> 'instrumento' = 'exame_final') <> 80
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v WHERE v ->> 'instrumento' = 'pre_pos_teste') <> 10
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 1) <> 36
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 2) <> 36
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 3) <> 8
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'cenario')::boolean) <> 16
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND NOT (v ->> 'cenario')::boolean
            AND v ->> 'tipologia' = 'escolha_multipla') <> 32
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND NOT (v ->> 'cenario')::boolean
            AND v ->> 'tipologia' = 'verdadeiro_falso') <> 16
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND NOT (v ->> 'cenario')::boolean
            AND v ->> 'tipologia' = 'correspondencia') <> 16
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND v ->> 'dificuldade' = 'facil') <> 32
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND v ->> 'dificuldade' = 'media') <> 32
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND v ->> 'dificuldade' = 'dificil') <> 16 THEN
    RAISE EXCEPTION 'MATRIZ_INVALIDA' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso IS NULL THEN
    RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023';
  END IF;

  -- Bloqueia as questões existentes deste curso ANTES de comparar o estado:
  -- uma edição normal, que não usa o trinco de pacote, fica em espera.
  PERFORM 1 FROM public.banco_questoes WHERE curso_id = _curso FOR UPDATE;

  _estado := public.rpc_estado_banco_ia();
  IF _hash_estado IS NULL OR (_estado ->> 'hash') IS DISTINCT FROM _hash_estado THEN
    RAISE EXCEPTION 'ESTADO_ALTERADO' USING ERRCODE = '40001';
  END IF;

  -- Questões deste curso sem código, ou com código fora dos 90 previstos:
  -- dados inesperados, o pacote não avança.
  IF EXISTS (SELECT 1 FROM public.banco_questoes WHERE curso_id = _curso AND codigo IS NULL) THEN
    RAISE EXCEPTION 'QUESTOES_SEM_CODIGO' USING ERRCODE = '23505';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.banco_questoes b
     WHERE b.curso_id = _curso
       AND b.codigo NOT IN (SELECT btrim(v ->> 'codigo') FROM jsonb_array_elements(_questoes) v)
  ) THEN
    RAISE EXCEPTION 'CODIGO_INESPERADO_NA_BASE' USING ERRCODE = '23505';
  END IF;

  FOR _q IN SELECT * FROM jsonb_array_elements(_questoes) LOOP
    SELECT cm.modulo_id INTO _modulo
      FROM public.curso_modulos cm
     WHERE cm.curso_id = _curso AND cm.ordem = (_q ->> 'ordem_modulo')::int;
    IF _modulo IS NULL THEN
      RAISE EXCEPTION 'MODULO_NAO_LIGADO_AO_CURSO' USING ERRCODE = '22023';
    END IF;

    SELECT * INTO _a FROM public.banco_questoes
     WHERE curso_id = _curso AND codigo = btrim(_q ->> 'codigo');

    IF FOUND THEN
      -- Nunca se sobrepõe uma questão existente. Igual conta como inalterada;
      -- diferente é conflito e anula o pacote inteiro.
      IF NOT _a.activa
         AND _a.estado_revisao = 'rascunho'
         AND _a.modulo_id IS NOT DISTINCT FROM _modulo
         AND _a.instrumento = (_q ->> 'instrumento')::instrumento_avaliacao
         AND _a.tipologia = (_q ->> 'tipologia')::tipologia_questao
         AND _a.dificuldade = (_q ->> 'dificuldade')::dificuldade_questao
         AND _a.enunciado IS NOT DISTINCT FROM btrim(_q ->> 'enunciado')
         AND _a.conteudo IS NOT DISTINCT FROM (_q -> 'conteudo')
         AND _a.resposta IS NOT DISTINCT FROM (_q -> 'resposta')
         AND _a.explicacao IS NOT DISTINCT FROM (_q ->> 'explicacao')
         AND _a.objectivo_associado IS NOT DISTINCT FROM (_q ->> 'objectivo_associado')
         AND _a.cenario IS NOT DISTINCT FROM (_q ->> 'cenario')::boolean
         AND _a.versao IS NOT DISTINCT FROM (_q ->> 'versao') THEN
        _inalteradas := _inalteradas + 1;
        CONTINUE;
      END IF;
      _conflitos := _conflitos || (_q ->> 'codigo');
      CONTINUE;
    END IF;

    INSERT INTO public.banco_questoes(
      curso_id, modulo_id, codigo, instrumento, tipologia, dificuldade, enunciado,
      conteudo, resposta, explicacao, objectivo_associado, cenario,
      activa, estado_revisao, versao, autor_id, autor_nome
    ) VALUES (
      _curso, _modulo, btrim(_q ->> 'codigo'),
      (_q ->> 'instrumento')::instrumento_avaliacao,
      (_q ->> 'tipologia')::tipologia_questao,
      (_q ->> 'dificuldade')::dificuldade_questao,
      btrim(_q ->> 'enunciado'),
      _q -> 'conteudo', _q -> 'resposta',
      _q ->> 'explicacao', _q ->> 'objectivo_associado',
      (_q ->> 'cenario')::boolean,
      false, 'rascunho', _q ->> 'versao', _actor, _q ->> 'autor_nome'
    );
    _inseridas := _inseridas + 1;
  END LOOP;

  IF array_length(_conflitos, 1) > 0 THEN
    RAISE EXCEPTION 'CONFLITO_QUESTOES_DIFERENTES: %', array_to_string(_conflitos, ', ')
      USING ERRCODE = '23505';
  END IF;

  RETURN jsonb_build_object(
    'pacote', 'banco-inteligencia-artificial',
    'inseridas', _inseridas,
    'inalteradas', _inalteradas,
    'actualizadas', 0,
    'activadas', 0
  );
END $$;

CREATE OR REPLACE FUNCTION public.rpc_importar_seguranca_cibernetica(
  _payload jsonb,
  _hash_estado text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _slug constant text := 'seguranca-cibernetica-avancada';
  _actor uuid := auth.uid();
  _curso uuid;
  _curso_json jsonb := _payload -> 'curso';
  _licoes jsonb := _payload -> 'licoes';
  _modulos jsonb := _payload -> 'modulos';
  _transversal int;
  _minutos_aval int;
  _horas int;
  _soma_licoes int;
  _soma_modulos int;
  _tematicos int;
  _transversais int;
  _estado jsonb;
  _l jsonb;
  _m jsonb;
  _modulo uuid;
  _actual public.licoes%ROWTYPE;
  _alteradas int := 0;
  _inalteradas int := 0;
  _modulos_alterados int := 0;
  _conflitos text[] := '{}';
BEGIN
  IF _actor IS NULL THEN
    RAISE EXCEPTION 'SEM_SESSAO' USING ERRCODE = '42501';
  END IF;
  IF NOT public.e_admin_geral_ologa(_actor) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('pacote_seguranca_cibernetica'));

  IF _curso_json IS NULL OR _licoes IS NULL OR _modulos IS NULL
     OR jsonb_typeof(_licoes) <> 'array' OR jsonb_typeof(_modulos) <> 'array'
     OR (_payload ->> 'transversal_minutos') IS NULL
     OR (_curso_json ->> 'carga_horaria') IS NULL
     OR (_curso_json ->> 'minutos_avaliacao_orientacao') IS NULL THEN
    RAISE EXCEPTION 'PAYLOAD_INCOMPLETO' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(_licoes) <> 15 OR jsonb_array_length(_modulos) <> 3 THEN
    RAISE EXCEPTION 'PAYLOAD_FORA_DO_ESPERADO' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(DISTINCT (v ->> 'modulo_ordem') || '-' || (v ->> 'ordem'))
        FROM jsonb_array_elements(_licoes) v) <> 15 THEN
    RAISE EXCEPTION 'LICOES_REPETIDAS' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(_licoes) v
     WHERE (v ->> 'modulo_ordem') IS NULL OR (v ->> 'ordem') IS NULL
        OR (v ->> 'modulo_ordem')::int NOT BETWEEN 1 AND 3
        OR (v ->> 'ordem')::int NOT BETWEEN 1 AND 5
        OR coalesce(btrim(v ->> 'titulo'), '') = ''
        OR coalesce(btrim(v ->> 'elearning'), '') = ''
        OR coalesce(btrim(v ->> 'guiao'), '') = ''
        OR (v ->> 'minutos') IS NULL
        OR (v ->> 'minutos')::int <= 0
  ) THEN
    RAISE EXCEPTION 'LICAO_INVALIDA' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(DISTINCT (v ->> 'ordem')::int) FROM jsonb_array_elements(_modulos) v) <> 3
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(_modulos) v
                 WHERE (v ->> 'ordem') IS NULL OR (v ->> 'minutos') IS NULL
                    OR (v ->> 'ordem')::int NOT BETWEEN 1 AND 3
                    OR (v ->> 'minutos')::int <= 0
                    OR coalesce(btrim(v ->> 'descricao'), '') = '') THEN
    RAISE EXCEPTION 'MODULO_INVALIDO' USING ERRCODE = '22023';
  END IF;

  _transversal := (_payload ->> 'transversal_minutos')::int;
  _horas := (_curso_json ->> 'carga_horaria')::int;
  _minutos_aval := (_curso_json ->> 'minutos_avaliacao_orientacao')::int;
  SELECT sum((v ->> 'minutos')::int) INTO _soma_licoes FROM jsonb_array_elements(_licoes) v;
  SELECT sum((v ->> 'minutos')::int) INTO _soma_modulos FROM jsonb_array_elements(_modulos) v;

  -- A soma das lições tem de bater certo MÓDULO A MÓDULO, não só no total.
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(_modulos) m
     WHERE (m ->> 'minutos')::int IS DISTINCT FROM (
       SELECT coalesce(sum((v ->> 'minutos')::int), -1)
         FROM jsonb_array_elements(_licoes) v
        WHERE (v ->> 'modulo_ordem')::int = (m ->> 'ordem')::int
     )
  ) THEN
    RAISE EXCEPTION 'MINUTOS_POR_MODULO_INCOERENTES' USING ERRCODE = '22023';
  END IF;

  -- 30 horas: 1560 minutos de módulos temáticos + 120 transversal + 120 avaliação.
  IF _horas <> 30 OR _transversal <> 120 OR _minutos_aval <> 120
     OR _soma_licoes <> 1560 OR _soma_modulos <> 1560
     OR _soma_modulos + _transversal + _minutos_aval <> _horas * 60 THEN
    RAISE EXCEPTION 'MINUTOS_INCOERENTES' USING ERRCODE = '22023';
  END IF;
  IF coalesce(btrim(_curso_json ->> 'modalidade'), '') = ''
     OR coalesce(btrim(_curso_json ->> 'objectivos'), '') = ''
     OR coalesce(btrim(_curso_json ->> 'publico_alvo'), '') = ''
     OR coalesce(btrim(_curso_json ->> 'pre_requisitos'), '') = ''
     OR coalesce(btrim(_curso_json ->> 'materiais'), '') = ''
     OR coalesce(btrim(_curso_json ->> 'nota'), '') = '' THEN
    RAISE EXCEPTION 'FICHA_INCOMPLETA' USING ERRCODE = '22023';
  END IF;

  -- Bloqueia a ficha do curso antes de ler o estado.
  SELECT id INTO _curso FROM public.cursos WHERE slug = _slug FOR UPDATE;
  IF _curso IS NULL THEN
    RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023';
  END IF;

  -- Exactamente três módulos temáticos e um transversal.
  SELECT count(*) FILTER (WHERE NOT transversal), count(*) FILTER (WHERE transversal)
    INTO _tematicos, _transversais
    FROM public.curso_modulos WHERE curso_id = _curso;
  IF _tematicos <> 3 OR _transversais <> 1 THEN
    RAISE EXCEPTION 'ESTRUTURA_DE_MODULOS_INESPERADA' USING ERRCODE = '22023';
  END IF;

  -- Nenhum dos três módulos temáticos pode estar ligado a outro curso.
  IF EXISTS (
    SELECT 1 FROM public.curso_modulos cm
      JOIN public.curso_modulos o ON o.modulo_id = cm.modulo_id AND o.curso_id <> cm.curso_id
     WHERE cm.curso_id = _curso AND cm.transversal = false
  ) THEN
    RAISE EXCEPTION 'MODULO_PARTILHADO_COM_OUTRO_CURSO' USING ERRCODE = '22023';
  END IF;

  -- Bloqueia relações, módulos temáticos e lições antes de comparar o estado.
  PERFORM 1 FROM public.curso_modulos WHERE curso_id = _curso FOR UPDATE;
  PERFORM 1 FROM public.modulos m
    WHERE m.id IN (SELECT modulo_id FROM public.curso_modulos
                    WHERE curso_id = _curso AND transversal = false) FOR UPDATE;
  PERFORM 1 FROM public.licoes l
    WHERE l.modulo_id IN (SELECT modulo_id FROM public.curso_modulos
                           WHERE curso_id = _curso AND transversal = false) FOR UPDATE;

  _estado := public.rpc_estado_seguranca_cibernetica();
  IF _hash_estado IS NULL OR (_estado ->> 'hash') IS DISTINCT FROM _hash_estado THEN
    RAISE EXCEPTION 'ESTADO_ALTERADO' USING ERRCODE = '40001';
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

    IF coalesce(btrim(_actual.conteudo_elearning), '') <> '' THEN
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
     WHERE curso_id = _curso AND ordem = (_m ->> 'ordem')::int AND transversal = false
       AND carga_horaria_minutos IS DISTINCT FROM (_m ->> 'minutos')::int;
  END LOOP;

  UPDATE public.curso_modulos SET carga_horaria_minutos = _transversal
   WHERE curso_id = _curso AND transversal = true
     AND carga_horaria_minutos IS DISTINCT FROM _transversal;

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

  RETURN jsonb_build_object(
    'pacote', 'seguranca-cibernetica',
    'licoes_alteradas', _alteradas,
    'licoes_inalteradas', _inalteradas,
    'modulos_alterados', _modulos_alterados,
    'horas', _horas
  );
END $$;

-- Direitos mínimos, repostos depois de recriar as funções.
REVOKE ALL ON FUNCTION public.rpc_estado_banco_ia() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_importar_banco_ia(jsonb, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_importar_seguranca_cibernetica(jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_estado_banco_ia() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_importar_banco_ia(jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_importar_seguranca_cibernetica(jsonb, text) TO authenticated;