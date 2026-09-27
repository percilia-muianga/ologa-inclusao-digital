-- Revisão do pacote «Tecnologias Digitais do Governo» (SECURITY INVOKER).
-- Hash inclui IDs, ligações e campos de estado; exige exactamente 5 lições
-- existentes (ordens 1..5); recusa JSON null/tipos errados; confirmação final
-- registo a registo; não actualiza cursos quando nada muda; não marca as
-- lições com sinalização pública genérica (proposta_por_validar=false).
-- NÃO cria regras de escrita.

CREATE OR REPLACE FUNCTION public.rpc_estado_tecnologias_governo()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public AS $$
DECLARE
  _slug constant text := 'tecnologias-digitais-governo';
  _curso public.cursos%ROWTYPE;
  _licoes jsonb; _modulos jsonb; _texto text; _regra boolean;
BEGIN
  IF NOT public.e_admin_geral_ologa(auth.uid()) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso.id IS NULL THEN RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023'; END IF;

  SELECT coalesce(jsonb_agg(x ORDER BY x.ordem, x.id), '[]'::jsonb) INTO _licoes FROM (
    SELECT l.id, l.modulo_id, l.ordem, l.titulo, l.duracao, coalesce(l.duracao_minutos, 0) AS minutos,
           l.estado_conteudo, l.proposta_por_validar,
           coalesce(btrim(l.conteudo_elearning), '') <> '' AS tem_conteudo,
           md5(coalesce(l.conteudo_elearning,'') || '||' || coalesce(l.guiao_formador,'')) AS impressao
      FROM public.curso_modulos cm JOIN public.licoes l ON l.modulo_id = cm.modulo_id
     WHERE cm.curso_id = _curso.id AND cm.transversal = false) x;

  SELECT coalesce(jsonb_agg(y ORDER BY y.ordem, y.modulo_id), '[]'::jsonb) INTO _modulos FROM (
    SELECT cm.modulo_id, cm.ordem, cm.transversal, cm.obrigatorio, cm.carga_horaria_minutos AS minutos,
           md5(coalesce(m.descricao,'')) AS impressao,
           (SELECT count(*) FROM public.curso_modulos o WHERE o.modulo_id = cm.modulo_id) AS cursos_ligados
      FROM public.curso_modulos cm JOIN public.modulos m ON m.id = cm.modulo_id
     WHERE cm.curso_id = _curso.id) y;

  _regra := EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cursos'
                     AND cmd='UPDATE' AND qual ILIKE '%' || _slug || '%')
        AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='curso_modulos'
                     AND cmd='UPDATE' AND qual ILIKE '%' || _slug || '%');

  _texto := _licoes::text || _modulos::text || jsonb_build_object(
    'id', _curso.id, 'slug', _curso.slug,
    'carga_horaria', _curso.carga_horaria, 'modalidade', _curso.modalidade,
    'objectivos', md5(coalesce(_curso.objectivos,'')), 'publico_alvo', md5(coalesce(_curso.publico_alvo,'')),
    'pre_requisitos', md5(coalesce(_curso.pre_requisitos,'')), 'materiais', md5(coalesce(_curso.materiais,'')),
    'nota', md5(coalesce(_curso.carga_horaria_nota,'')),
    'minutos_avaliacao_orientacao', _curso.minutos_avaliacao_orientacao)::text;

  RETURN jsonb_build_object(
    'pacote', 'tecnologias-governo',
    'horas', _curso.carga_horaria,
    'minutos_avaliacao', _curso.minutos_avaliacao_orientacao,
    'regra_de_escrita_do_curso', _regra,
    'licoes', _licoes, 'modulos', _modulos,
    'hash', md5(_texto));
END $$;

CREATE OR REPLACE FUNCTION public.rpc_importar_tecnologias_governo(_payload jsonb, _hash_estado text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  _slug constant text := 'tecnologias-digitais-governo';
  _actor uuid := auth.uid();
  _curso uuid; _c jsonb; _licoes jsonb; _mod jsonb;
  _transversal int; _aval int; _horas int; _soma int; _tem int; _trans int;
  _estado jsonb; _l jsonb; _modulo uuid; _modtrans uuid; _actual public.licoes%ROWTYPE;
  _alteradas int := 0; _inalteradas int := 0; _conflitos text[] := '{}'; _n int;
  _ficha_alterada boolean := false; _modulos_alterados int := 0;
BEGIN
  IF _actor IS NULL THEN RAISE EXCEPTION 'SEM_SESSAO' USING ERRCODE='42501'; END IF;
  IF NOT public.e_admin_geral_ologa(_actor) THEN RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE='42501'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('pacote_tecnologias_governo'));

  -- Tipos estritos: JSON null ou tipos errados são recusados.
  IF jsonb_typeof(_payload) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'PAYLOAD_INCOMPLETO' USING ERRCODE='22023'; END IF;
  _c := _payload->'curso'; _licoes := _payload->'licoes'; _mod := _payload->'modulo';
  IF jsonb_typeof(_c) IS DISTINCT FROM 'object' OR jsonb_typeof(_mod) IS DISTINCT FROM 'object'
     OR jsonb_typeof(_licoes) IS DISTINCT FROM 'array'
     OR jsonb_typeof(_payload->'transversal_minutos') IS DISTINCT FROM 'number'
     OR jsonb_typeof(_c->'carga_horaria') IS DISTINCT FROM 'number'
     OR jsonb_typeof(_c->'minutos_avaliacao_orientacao') IS DISTINCT FROM 'number'
     OR jsonb_typeof(_mod->'minutos') IS DISTINCT FROM 'number'
     OR jsonb_typeof(_mod->'descricao') IS DISTINCT FROM 'string'
     OR EXISTS (SELECT 1 FROM unnest(ARRAY['modalidade','objectivos','publico_alvo','pre_requisitos','materiais','nota']) k
                WHERE jsonb_typeof(_c->k) IS DISTINCT FROM 'string') THEN
    RAISE EXCEPTION 'PAYLOAD_INCOMPLETO' USING ERRCODE='22023';
  END IF;
  IF jsonb_array_length(_licoes) <> 5
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(_licoes) v WHERE jsonb_typeof(v) IS DISTINCT FROM 'object'
                   OR jsonb_typeof(v->'ordem') IS DISTINCT FROM 'number'
                   OR jsonb_typeof(v->'minutos') IS DISTINCT FROM 'number'
                   OR jsonb_typeof(v->'titulo') IS DISTINCT FROM 'string'
                   OR jsonb_typeof(v->'elearning') IS DISTINCT FROM 'string'
                   OR jsonb_typeof(v->'guiao') IS DISTINCT FROM 'string') THEN
    RAISE EXCEPTION 'PAYLOAD_FORA_DO_ESPERADO' USING ERRCODE='22023';
  END IF;
  IF (SELECT array_agg((v->>'ordem')::int ORDER BY (v->>'ordem')::int) FROM jsonb_array_elements(_licoes) v)
     IS DISTINCT FROM ARRAY[1,2,3,4,5] THEN
    RAISE EXCEPTION 'PAYLOAD_FORA_DO_ESPERADO' USING ERRCODE='22023';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(_licoes) v
     WHERE btrim(v->>'titulo')='' OR btrim(v->>'elearning')='' OR btrim(v->>'guiao')='' OR (v->>'minutos')::int <= 0) THEN
    RAISE EXCEPTION 'LICAO_INVALIDA' USING ERRCODE='22023';
  END IF;
  _transversal := (_payload->>'transversal_minutos')::int;
  _horas := (_c->>'carga_horaria')::int; _aval := (_c->>'minutos_avaliacao_orientacao')::int;
  SELECT sum((v->>'minutos')::int) INTO _soma FROM jsonb_array_elements(_licoes) v;
  IF _horas <> 10 OR _transversal <> 120 OR _aval <> 120 OR _soma <> 360
     OR (_mod->>'minutos')::int <> 360 OR _soma + _transversal + _aval <> _horas*60 THEN
    RAISE EXCEPTION 'MINUTOS_INCOERENTES' USING ERRCODE='22023';
  END IF;
  IF btrim(_mod->>'descricao')='' OR btrim(_c->>'modalidade')='' OR btrim(_c->>'objectivos')=''
     OR btrim(_c->>'publico_alvo')='' OR btrim(_c->>'pre_requisitos')='' OR btrim(_c->>'materiais')=''
     OR btrim(_c->>'nota')='' THEN
    RAISE EXCEPTION 'FICHA_INCOMPLETA' USING ERRCODE='22023';
  END IF;

  SELECT id INTO _curso FROM public.cursos WHERE slug = _slug FOR UPDATE;
  IF _curso IS NULL THEN RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE='22023'; END IF;
  PERFORM 1 FROM public.curso_modulos WHERE curso_id=_curso FOR UPDATE;
  SELECT count(*) FILTER (WHERE NOT transversal), count(*) FILTER (WHERE transversal)
    INTO _tem, _trans FROM public.curso_modulos WHERE curso_id = _curso;
  IF _tem <> 1 OR _trans <> 1 THEN RAISE EXCEPTION 'ESTRUTURA_DE_MODULOS_INESPERADA' USING ERRCODE='22023'; END IF;
  SELECT modulo_id INTO _modulo FROM public.curso_modulos WHERE curso_id=_curso AND transversal=false AND ordem=1;
  SELECT modulo_id INTO _modtrans FROM public.curso_modulos WHERE curso_id=_curso AND transversal=true;
  IF _modulo IS NULL THEN RAISE EXCEPTION 'MODULO_NAO_LIGADO_AO_CURSO' USING ERRCODE='22023'; END IF;
  IF EXISTS (SELECT 1 FROM public.curso_modulos WHERE modulo_id=_modulo AND curso_id<>_curso) THEN
    RAISE EXCEPTION 'MODULO_PARTILHADO_COM_OUTRO_CURSO' USING ERRCODE='22023';
  END IF;
  PERFORM 1 FROM public.modulos WHERE id=_modulo FOR UPDATE;
  PERFORM 1 FROM public.licoes WHERE modulo_id=_modulo FOR UPDATE;

  -- Exactamente 5 lições existentes, ordens 1..5, sem duplicados.
  IF (SELECT array_agg(ordem ORDER BY ordem) FROM public.licoes WHERE modulo_id=_modulo)
     IS DISTINCT FROM ARRAY[1,2,3,4,5] THEN
    RAISE EXCEPTION 'LICOES_EXISTENTES_INESPERADAS' USING ERRCODE='22023';
  END IF;

  _estado := public.rpc_estado_tecnologias_governo();
  IF _hash_estado IS NULL OR (_estado->>'hash') IS DISTINCT FROM _hash_estado THEN
    RAISE EXCEPTION 'ESTADO_ALTERADO' USING ERRCODE='40001';
  END IF;
  IF NOT (_estado->>'regra_de_escrita_do_curso')::boolean THEN
    RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_CURSO' USING ERRCODE='42501';
  END IF;

  FOR _l IN SELECT * FROM jsonb_array_elements(_licoes) LOOP
    SELECT * INTO _actual FROM public.licoes WHERE modulo_id=_modulo AND ordem=(_l->>'ordem')::int;
    IF NOT FOUND THEN RAISE EXCEPTION 'LICAO_INEXISTENTE' USING ERRCODE='22023'; END IF;
    IF _actual.titulo IS NOT DISTINCT FROM (_l->>'titulo')
       AND _actual.duracao_minutos IS NOT DISTINCT FROM (_l->>'minutos')::int
       AND _actual.conteudo_elearning IS NOT DISTINCT FROM (_l->>'elearning')
       AND _actual.guiao_formador IS NOT DISTINCT FROM (_l->>'guiao')
       AND _actual.estado_conteudo = 'disponivel' AND _actual.proposta_por_validar = false THEN
      _inalteradas := _inalteradas + 1; CONTINUE;
    END IF;
    IF coalesce(btrim(_actual.conteudo_elearning),'') <> '' THEN
      _conflitos := _conflitos || format('lição %s', _l->>'ordem'); CONTINUE;
    END IF;
    UPDATE public.licoes SET titulo=_l->>'titulo', duracao=(_l->>'minutos')||' minutos',
      duracao_minutos=(_l->>'minutos')::int, conteudo_elearning=_l->>'elearning',
      guiao_formador=_l->>'guiao', estado_conteudo='disponivel', proposta_por_validar=false
     WHERE id=_actual.id;
    GET DIAGNOSTICS _n = ROW_COUNT;
    IF _n <> 1 THEN RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_LICOES' USING ERRCODE='42501'; END IF;
    _alteradas := _alteradas + 1;
  END LOOP;
  IF array_length(_conflitos,1) > 0 THEN
    RAISE EXCEPTION 'CONFLITO_CONTEUDO_EXISTENTE: %', array_to_string(_conflitos,'; ') USING ERRCODE='23505';
  END IF;

  UPDATE public.modulos SET descricao=_mod->>'descricao' WHERE id=_modulo AND descricao IS DISTINCT FROM (_mod->>'descricao');
  GET DIAGNOSTICS _n = ROW_COUNT; _modulos_alterados := _modulos_alterados + _n;
  UPDATE public.curso_modulos SET carga_horaria_minutos=(_mod->>'minutos')::int
   WHERE curso_id=_curso AND modulo_id=_modulo AND carga_horaria_minutos IS DISTINCT FROM (_mod->>'minutos')::int;
  GET DIAGNOSTICS _n = ROW_COUNT; _modulos_alterados := _modulos_alterados + _n;
  -- Só as horas do transversal NESTE curso; o módulo transversal global não é tocado.
  UPDATE public.curso_modulos SET carga_horaria_minutos=_transversal
   WHERE curso_id=_curso AND modulo_id=_modtrans AND carga_horaria_minutos IS DISTINCT FROM _transversal;
  GET DIAGNOSTICS _n = ROW_COUNT; _modulos_alterados := _modulos_alterados + _n;

  -- Ficha: só actualiza (e só gera auditoria) se algum campo mudar.
  UPDATE public.cursos SET carga_horaria=_horas, modalidade=_c->>'modalidade', objectivos=_c->>'objectivos',
    publico_alvo=_c->>'publico_alvo', pre_requisitos=_c->>'pre_requisitos', materiais=_c->>'materiais',
    carga_horaria_nota=_c->>'nota', minutos_avaliacao_orientacao=_aval
   WHERE id=_curso
     AND (carga_horaria, modalidade, objectivos, publico_alvo, pre_requisitos, materiais, carga_horaria_nota, minutos_avaliacao_orientacao)
         IS DISTINCT FROM (_horas, _c->>'modalidade', _c->>'objectivos', _c->>'publico_alvo', _c->>'pre_requisitos',
                           _c->>'materiais', _c->>'nota', _aval);
  GET DIAGNOSTICS _n = ROW_COUNT; _ficha_alterada := _n = 1;

  -- Confirmação final registo a registo: qualquer escrita filtrada pelas políticas anula tudo.
  IF NOT EXISTS (SELECT 1 FROM public.cursos WHERE id=_curso AND carga_horaria=_horas AND modalidade=_c->>'modalidade'
        AND objectivos=_c->>'objectivos' AND publico_alvo=_c->>'publico_alvo' AND pre_requisitos=_c->>'pre_requisitos'
        AND materiais=_c->>'materiais' AND carga_horaria_nota=_c->>'nota' AND minutos_avaliacao_orientacao=_aval) THEN
    RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_CURSO' USING ERRCODE='42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.curso_modulos WHERE curso_id=_curso AND modulo_id=_modulo AND transversal=false
                   AND carga_horaria_minutos=(_mod->>'minutos')::int)
     OR NOT EXISTS (SELECT 1 FROM public.curso_modulos WHERE curso_id=_curso AND modulo_id=_modtrans AND transversal=true
                   AND carga_horaria_minutos=_transversal) THEN
    RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_CURSO' USING ERRCODE='42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.modulos WHERE id=_modulo AND descricao=_mod->>'descricao') THEN
    RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_MODULO' USING ERRCODE='42501';
  END IF;
  IF (SELECT count(*) FROM public.licoes l JOIN jsonb_array_elements(_licoes) v ON l.ordem=(v->>'ordem')::int
       WHERE l.modulo_id=_modulo AND l.titulo=v->>'titulo' AND l.duracao_minutos=(v->>'minutos')::int
         AND l.conteudo_elearning=v->>'elearning' AND l.guiao_formador=v->>'guiao'
         AND l.estado_conteudo='disponivel' AND l.proposta_por_validar=false) <> 5 THEN
    RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_LICOES' USING ERRCODE='42501';
  END IF;

  RETURN jsonb_build_object('pacote','tecnologias-governo','licoes_alteradas',_alteradas,
    'licoes_inalteradas',_inalteradas,'modulos_alterados',_modulos_alterados,
    'ficha_alterada',_ficha_alterada,'horas',_horas);
END $$;

REVOKE ALL ON FUNCTION public.rpc_estado_tecnologias_governo() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_importar_tecnologias_governo(jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_estado_tecnologias_governo() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_importar_tecnologias_governo(jsonb, text) TO authenticated;
