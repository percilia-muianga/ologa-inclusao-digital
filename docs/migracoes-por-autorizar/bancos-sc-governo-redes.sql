-- PROPOSTA POR AUTORIZAR — NÃO APLICADA.
-- Importação dos bancos privados de avaliação de Segurança Cibernética Avançada,
-- Tecnologias Digitais do Governo e Administração de Redes.
-- Réplica fiel de rpc_estado_banco_ia / rpc_importar_banco_ia (definição lida da
-- base em modo leitura), alterando apenas: slug, nome do pacote, trinco e matriz
-- de módulos. Acrescenta a verificação explícita de sessão na função de estado.
--
-- Garantias: SECURITY INVOKER (sem SECURITY DEFINER), search_path = public,
-- só Administrador Geral Ologa (e_admin_geral_ologa), 90 questões exactas
-- (80 exame_final + 10 pre_pos_teste), nenhuma activa, inseridas sempre com
-- activa=false e estado_revisao='rascunho'; hash contra alterações concorrentes;
-- trinco de transacção; conflito anula tudo (nunca sobrescreve); questões iguais
-- contam como inalteradas (idempotente, sem writes); códigos alheios ou sem código
-- bloqueiam. A escrita em banco_questoes continua decidida pela política RLS já
-- existente «banco_escrever_gestao» (pode_gerir_programa, que inclui admin_ologa):
-- não é necessária nenhuma política nova. A auditoria é feita pelo registo de
-- auditoria já existente na tabela, se activo (a verificar antes de aplicar).
-- Não toca noutros cursos, em configurações de exame nem activa nada.

CREATE OR REPLACE FUNCTION public.rpc_estado_banco_sc()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  _slug constant text := 'seguranca-cibernetica-avancada';
  _curso uuid;
  _texto text;
  _total int;
  _activas int;
  _revistas int;
  _sem_codigo int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'SEM_SESSAO' USING ERRCODE = '42501';
  END IF;
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
    'pacote', 'banco-seguranca-cibernetica',
    'total', _total,
    'activas', _activas,
    'fora_de_rascunho', _revistas,
    'sem_codigo', _sem_codigo,
    'hash', md5(_texto)
  );
END $function$;

REVOKE ALL ON FUNCTION public.rpc_estado_banco_sc() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_estado_banco_sc() TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_importar_banco_sc(_payload jsonb, _hash_estado text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  _slug constant text := 'seguranca-cibernetica-avancada';
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

  PERFORM pg_advisory_xact_lock(hashtext('pacote_banco_sc'));

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
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 1) <> 24
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 2) <> 25
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 3) <> 23
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 4) <> 8
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

  _estado := public.rpc_estado_banco_sc();
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
    'pacote', 'banco-seguranca-cibernetica',
    'inseridas', _inseridas,
    'inalteradas', _inalteradas,
    'actualizadas', 0,
    'activadas', 0
  );
END $function$;

REVOKE ALL ON FUNCTION public.rpc_importar_banco_sc(jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_importar_banco_sc(jsonb, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_estado_banco_tdg()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  _slug constant text := 'tecnologias-digitais-governo';
  _curso uuid;
  _texto text;
  _total int;
  _activas int;
  _revistas int;
  _sem_codigo int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'SEM_SESSAO' USING ERRCODE = '42501';
  END IF;
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
    'pacote', 'banco-tecnologias-governo',
    'total', _total,
    'activas', _activas,
    'fora_de_rascunho', _revistas,
    'sem_codigo', _sem_codigo,
    'hash', md5(_texto)
  );
END $function$;

REVOKE ALL ON FUNCTION public.rpc_estado_banco_tdg() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_estado_banco_tdg() TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_importar_banco_tdg(_payload jsonb, _hash_estado text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  _slug constant text := 'tecnologias-digitais-governo';
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

  PERFORM pg_advisory_xact_lock(hashtext('pacote_banco_tdg'));

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
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 1) <> 72
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 2) <> 8
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

  _estado := public.rpc_estado_banco_tdg();
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
    'pacote', 'banco-tecnologias-governo',
    'inseridas', _inseridas,
    'inalteradas', _inalteradas,
    'actualizadas', 0,
    'activadas', 0
  );
END $function$;

REVOKE ALL ON FUNCTION public.rpc_importar_banco_tdg(jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_importar_banco_tdg(jsonb, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_estado_banco_redes()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  _slug constant text := 'redes-avancadas-seguranca-cibernetica';
  _curso uuid;
  _texto text;
  _total int;
  _activas int;
  _revistas int;
  _sem_codigo int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'SEM_SESSAO' USING ERRCODE = '42501';
  END IF;
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
    'pacote', 'banco-redes',
    'total', _total,
    'activas', _activas,
    'fora_de_rascunho', _revistas,
    'sem_codigo', _sem_codigo,
    'hash', md5(_texto)
  );
END $function$;

REVOKE ALL ON FUNCTION public.rpc_estado_banco_redes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_estado_banco_redes() TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_importar_banco_redes(_payload jsonb, _hash_estado text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  _slug constant text := 'redes-avancadas-seguranca-cibernetica';
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

  PERFORM pg_advisory_xact_lock(hashtext('pacote_banco_redes'));

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
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 1) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 2) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 3) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 4) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 5) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 6) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 7) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 8) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 9) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 10) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 11) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 12) <> 6
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'exame_final' AND (v ->> 'ordem_modulo')::int = 13) <> 8
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

  _estado := public.rpc_estado_banco_redes();
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
    'pacote', 'banco-redes',
    'inseridas', _inseridas,
    'inalteradas', _inalteradas,
    'actualizadas', 0,
    'activadas', 0
  );
END $function$;

REVOKE ALL ON FUNCTION public.rpc_importar_banco_redes(jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_importar_banco_redes(jsonb, text) TO authenticated;
