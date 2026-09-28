-- POR AUTORIZAR — NÃO APLICADA. Não é migração autoexecutável: fica em docs/
-- até autorização expressa. Aplicar só depois de aprovada, tal como está.
--
-- Pacote fixo «Administração de Redes e Segurança Cibernética»
-- (slug 'redes-avancadas-seguranca-cibernetica', curso ae6347fd-007b-498f-a6f6-7b3c13b180db).
-- Duas funções SECURITY INVOKER (as políticas RLS decidem sempre), no mesmo
-- padrão das de «Tecnologias Digitais do Governo» (0024/0025):
--  - rpc_estado_redes(): só leitura; devolve contagens, impressões md5 e hash.
--  - rpc_importar_redes(payload, hash): uma única transacção (a chamada RPC);
--    qualquer excepção anula tudo. Trinco consultivo, hash do estado visto
--    (recusa alterações concorrentes), IDs exactos de curso/12 módulos/60
--    lições, recusa de conteúdo existente diferente, sem escritas quando nada
--    muda, confirmação final registo a registo. Auditoria pelos gatilhos
--    trg_auditar_* já existentes (actor = auth.uid()).
-- NÃO cria regras de escrita (ver politicas-redes.sql). Sem elas, a
-- importação falha fechada (SEM_REGRA_DE_ESCRITA_CURSO) e nada grava.
-- O módulo transversal global (tabela modulos) nunca é alterado; só a linha
-- curso_modulos deste curso que o liga (horas: 120).

CREATE OR REPLACE FUNCTION public.rpc_estado_redes()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public AS $$
DECLARE
  _slug constant text := 'redes-avancadas-seguranca-cibernetica';
  _curso public.cursos%ROWTYPE;
  _licoes jsonb; _modulos jsonb; _texto text; _regra boolean;
BEGIN
  IF NOT public.e_admin_geral_ologa(auth.uid()) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso.id IS NULL THEN RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023'; END IF;

  SELECT coalesce(jsonb_agg(x ORDER BY x.modulo_ordem, x.ordem, x.id), '[]'::jsonb) INTO _licoes FROM (
    SELECT l.id, l.modulo_id, cm.ordem AS modulo_ordem, l.ordem, l.titulo, l.duracao,
           coalesce(l.duracao_minutos, 0) AS minutos, l.estado_conteudo, l.proposta_por_validar,
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
    'pacote', 'redes',
    'horas', _curso.carga_horaria,
    'minutos_avaliacao', _curso.minutos_avaliacao_orientacao,
    'licoes_com_conteudo', (SELECT count(*) FROM jsonb_array_elements(_licoes) v WHERE (v->>'tem_conteudo')::boolean),
    'regra_de_escrita_do_curso', _regra,
    'licoes', _licoes, 'modulos', _modulos,
    'hash', md5(_texto));
END $$;

CREATE OR REPLACE FUNCTION public.rpc_importar_redes(_payload jsonb, _hash_estado text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE
  _slug constant text := 'redes-avancadas-seguranca-cibernetica';
  _id_curso constant uuid := 'ae6347fd-007b-498f-a6f6-7b3c13b180db';
  _id_trans constant uuid := '3d0dd3a0-a53b-4800-a032-68527d708eb1';
  _actor uuid := auth.uid();
  _curso uuid; _c jsonb; _licoes jsonb; _mods jsonb; _tr jsonb;
  _transversal int; _aval int; _horas int; _soma int; _tem int; _trans int;
  _estado jsonb; _l jsonb; _m jsonb; _actual public.licoes%ROWTYPE;
  _alteradas int := 0; _inalteradas int := 0; _conflitos text[] := '{}'; _n int;
  _ficha_alterada boolean := false; _modulos_alterados int := 0;
BEGIN
  IF _actor IS NULL THEN RAISE EXCEPTION 'SEM_SESSAO' USING ERRCODE='42501'; END IF;
  IF NOT public.e_admin_geral_ologa(_actor) THEN RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE='42501'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('pacote_redes'));

  -- Tipos estritos.
  IF jsonb_typeof(_payload) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'PAYLOAD_INCOMPLETO' USING ERRCODE='22023'; END IF;
  _c := _payload->'curso'; _licoes := _payload->'licoes'; _mods := _payload->'modulos'; _tr := _payload->'transversal';
  IF jsonb_typeof(_c) IS DISTINCT FROM 'object' OR jsonb_typeof(_tr) IS DISTINCT FROM 'object'
     OR jsonb_typeof(_mods) IS DISTINCT FROM 'array' OR jsonb_typeof(_licoes) IS DISTINCT FROM 'array'
     OR jsonb_typeof(_tr->'minutos') IS DISTINCT FROM 'number' OR jsonb_typeof(_tr->'id') IS DISTINCT FROM 'string'
     OR jsonb_typeof(_c->'carga_horaria') IS DISTINCT FROM 'number'
     OR jsonb_typeof(_c->'minutos_avaliacao_orientacao') IS DISTINCT FROM 'number'
     OR EXISTS (SELECT 1 FROM unnest(ARRAY['id','slug','modalidade','objectivos','publico_alvo','pre_requisitos','materiais','nota']) k
                WHERE jsonb_typeof(_c->k) IS DISTINCT FROM 'string') THEN
    RAISE EXCEPTION 'PAYLOAD_INCOMPLETO' USING ERRCODE='22023';
  END IF;
  IF (_c->>'slug') IS DISTINCT FROM _slug OR (_c->>'id')::uuid IS DISTINCT FROM _id_curso
     OR (_tr->>'id')::uuid IS DISTINCT FROM _id_trans THEN
    RAISE EXCEPTION 'IDS_INESPERADOS' USING ERRCODE='22023';
  END IF;
  IF jsonb_array_length(_mods) <> 12
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(_mods) v WHERE jsonb_typeof(v) IS DISTINCT FROM 'object'
                   OR jsonb_typeof(v->'id') IS DISTINCT FROM 'string' OR jsonb_typeof(v->'ordem') IS DISTINCT FROM 'number'
                   OR jsonb_typeof(v->'minutos') IS DISTINCT FROM 'number' OR jsonb_typeof(v->'descricao') IS DISTINCT FROM 'string'
                   OR btrim(v->>'descricao') = '')
     OR (SELECT array_agg((v->>'ordem')::int ORDER BY (v->>'ordem')::int) FROM jsonb_array_elements(_mods) v)
        IS DISTINCT FROM ARRAY[1,2,3,4,5,6,7,8,9,10,11,12]
     OR (SELECT count(DISTINCT v->>'id') FROM jsonb_array_elements(_mods) v) <> 12 THEN
    RAISE EXCEPTION 'PAYLOAD_FORA_DO_ESPERADO' USING ERRCODE='22023';
  END IF;
  IF jsonb_array_length(_licoes) <> 60
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(_licoes) v WHERE jsonb_typeof(v) IS DISTINCT FROM 'object'
                   OR jsonb_typeof(v->'id') IS DISTINCT FROM 'string' OR jsonb_typeof(v->'modulo_id') IS DISTINCT FROM 'string'
                   OR jsonb_typeof(v->'modulo_ordem') IS DISTINCT FROM 'number' OR jsonb_typeof(v->'ordem') IS DISTINCT FROM 'number'
                   OR jsonb_typeof(v->'minutos') IS DISTINCT FROM 'number' OR jsonb_typeof(v->'titulo') IS DISTINCT FROM 'string'
                   OR jsonb_typeof(v->'elearning') IS DISTINCT FROM 'string' OR jsonb_typeof(v->'guiao') IS DISTINCT FROM 'string')
     OR (SELECT count(DISTINCT v->>'id') FROM jsonb_array_elements(_licoes) v) <> 60
     OR (SELECT count(DISTINCT ((v->>'modulo_ordem') || '-' || (v->>'ordem'))) FROM jsonb_array_elements(_licoes) v
          WHERE (v->>'modulo_ordem')::int BETWEEN 1 AND 12 AND (v->>'ordem')::int BETWEEN 1 AND 5) <> 60
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(_licoes) v
                 WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(_mods) m
                                    WHERE m->>'id' = v->>'modulo_id' AND m->>'ordem' = v->>'modulo_ordem')) THEN
    RAISE EXCEPTION 'PAYLOAD_FORA_DO_ESPERADO' USING ERRCODE='22023';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(_licoes) v
     WHERE btrim(v->>'titulo')='' OR btrim(v->>'elearning')='' OR btrim(v->>'guiao')='' OR (v->>'minutos')::int <= 0) THEN
    RAISE EXCEPTION 'LICAO_INVALIDA' USING ERRCODE='22023';
  END IF;

  -- Horas: 60 lições = 4560; cada módulo = soma das suas lições (380); +120 transversal +120 avaliação = 4800.
  _transversal := (_tr->>'minutos')::int;
  _horas := (_c->>'carga_horaria')::int; _aval := (_c->>'minutos_avaliacao_orientacao')::int;
  SELECT sum((v->>'minutos')::int) INTO _soma FROM jsonb_array_elements(_licoes) v;
  IF _horas <> 80 OR _transversal <> 120 OR _aval <> 120 OR _soma <> 4560
     OR _soma + _transversal + _aval <> _horas*60
     OR (SELECT sum((m->>'minutos')::int) FROM jsonb_array_elements(_mods) m) <> 4560 THEN
    RAISE EXCEPTION 'MINUTOS_INCOERENTES' USING ERRCODE='22023';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(_mods) m
              WHERE (m->>'minutos')::int <> (SELECT sum((v->>'minutos')::int) FROM jsonb_array_elements(_licoes) v
                                              WHERE v->>'modulo_id' = m->>'id')) THEN
    RAISE EXCEPTION 'MINUTOS_POR_MODULO_INCOERENTES' USING ERRCODE='22023';
  END IF;
  IF btrim(_c->>'modalidade')='' OR btrim(_c->>'objectivos')='' OR btrim(_c->>'publico_alvo')=''
     OR btrim(_c->>'pre_requisitos')='' OR btrim(_c->>'materiais')='' OR btrim(_c->>'nota')='' THEN
    RAISE EXCEPTION 'FICHA_INCOMPLETA' USING ERRCODE='22023';
  END IF;

  -- Curso e estrutura na base: IDs exactos.
  SELECT id INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso IS NULL THEN RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE='22023'; END IF;
  IF _curso <> _id_curso THEN RAISE EXCEPTION 'IDS_INESPERADOS' USING ERRCODE='22023'; END IF;
  -- Sem as regras de escrita deste curso, falha fechada antes de qualquer trinco de linha
  -- (FOR UPDATE sob RLS só vê linhas abrangidas por uma regra UPDATE).
  IF NOT (EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cursos'
                   AND cmd='UPDATE' AND qual ILIKE '%' || _slug || '%')
      AND EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='curso_modulos'
                   AND cmd='UPDATE' AND qual ILIKE '%' || _slug || '%')) THEN
    RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_CURSO' USING ERRCODE='42501';
  END IF;
  PERFORM 1 FROM public.cursos WHERE id = _curso FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_CURSO' USING ERRCODE='42501'; END IF;
  PERFORM 1 FROM public.curso_modulos WHERE curso_id=_curso FOR UPDATE;
  SELECT count(*) FILTER (WHERE NOT transversal), count(*) FILTER (WHERE transversal)
    INTO _tem, _trans FROM public.curso_modulos WHERE curso_id = _curso;
  IF _tem <> 12 OR _trans <> 1 THEN RAISE EXCEPTION 'ESTRUTURA_DE_MODULOS_INESPERADA' USING ERRCODE='22023'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.curso_modulos WHERE curso_id=_curso AND transversal=true AND modulo_id=_id_trans) THEN
    RAISE EXCEPTION 'IDS_INESPERADOS' USING ERRCODE='22023';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(_mods) m
              WHERE NOT EXISTS (SELECT 1 FROM public.curso_modulos cm WHERE cm.curso_id=_curso AND cm.transversal=false
                                  AND cm.modulo_id=(m->>'id')::uuid AND cm.ordem=(m->>'ordem')::int)) THEN
    RAISE EXCEPTION 'MODULO_NAO_LIGADO_AO_CURSO' USING ERRCODE='22023';
  END IF;
  IF EXISTS (SELECT 1 FROM public.curso_modulos o JOIN jsonb_array_elements(_mods) m ON o.modulo_id=(m->>'id')::uuid
              WHERE o.curso_id <> _curso) THEN
    RAISE EXCEPTION 'MODULO_PARTILHADO_COM_OUTRO_CURSO' USING ERRCODE='22023';
  END IF;
  PERFORM 1 FROM public.modulos m JOIN jsonb_array_elements(_mods) v ON m.id=(v->>'id')::uuid FOR UPDATE OF m;
  PERFORM 1 FROM public.licoes l JOIN jsonb_array_elements(_mods) v ON l.modulo_id=(v->>'id')::uuid FOR UPDATE OF l;

  -- Exactamente as 60 lições esperadas: mesmos IDs, módulos e ordens, sem extras.
  IF (SELECT count(*) FROM public.licoes l JOIN jsonb_array_elements(_mods) v ON l.modulo_id=(v->>'id')::uuid) <> 60
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(_licoes) v
                 WHERE NOT EXISTS (SELECT 1 FROM public.licoes l WHERE l.id=(v->>'id')::uuid
                                     AND l.modulo_id=(v->>'modulo_id')::uuid AND l.ordem=(v->>'ordem')::int)) THEN
    RAISE EXCEPTION 'LICOES_EXISTENTES_INESPERADAS' USING ERRCODE='22023';
  END IF;

  _estado := public.rpc_estado_redes();
  IF _hash_estado IS NULL OR (_estado->>'hash') IS DISTINCT FROM _hash_estado THEN
    RAISE EXCEPTION 'ESTADO_ALTERADO' USING ERRCODE='40001';
  END IF;
  IF NOT (_estado->>'regra_de_escrita_do_curso')::boolean THEN
    RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_CURSO' USING ERRCODE='42501';
  END IF;

  FOR _l IN SELECT * FROM jsonb_array_elements(_licoes) LOOP
    SELECT * INTO _actual FROM public.licoes WHERE id=(_l->>'id')::uuid;
    IF _actual.titulo IS NOT DISTINCT FROM (_l->>'titulo')
       AND _actual.duracao_minutos IS NOT DISTINCT FROM (_l->>'minutos')::int
       AND _actual.conteudo_elearning IS NOT DISTINCT FROM (_l->>'elearning')
       AND _actual.guiao_formador IS NOT DISTINCT FROM (_l->>'guiao')
       AND _actual.estado_conteudo = 'disponivel' AND _actual.proposta_por_validar = false THEN
      _inalteradas := _inalteradas + 1; CONTINUE;
    END IF;
    IF coalesce(btrim(_actual.conteudo_elearning),'') <> '' OR coalesce(btrim(_actual.guiao_formador),'') <> ''
       OR _actual.titulo IS DISTINCT FROM (_l->>'titulo') THEN
      _conflitos := _conflitos || format('módulo %s lição %s', _l->>'modulo_ordem', _l->>'ordem'); CONTINUE;
    END IF;
    UPDATE public.licoes SET duracao=(_l->>'minutos')||' minutos',
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

  FOR _m IN SELECT * FROM jsonb_array_elements(_mods) LOOP
    UPDATE public.modulos SET descricao=_m->>'descricao'
     WHERE id=(_m->>'id')::uuid AND descricao IS DISTINCT FROM (_m->>'descricao');
    GET DIAGNOSTICS _n = ROW_COUNT; _modulos_alterados := _modulos_alterados + _n;
    UPDATE public.curso_modulos SET carga_horaria_minutos=(_m->>'minutos')::int
     WHERE curso_id=_curso AND modulo_id=(_m->>'id')::uuid AND transversal=false
       AND carga_horaria_minutos IS DISTINCT FROM (_m->>'minutos')::int;
    GET DIAGNOSTICS _n = ROW_COUNT; _modulos_alterados := _modulos_alterados + _n;
  END LOOP;
  -- Só as horas do transversal NESTE curso; o módulo transversal global não é tocado.
  UPDATE public.curso_modulos SET carga_horaria_minutos=_transversal
   WHERE curso_id=_curso AND modulo_id=_id_trans AND transversal=true AND carga_horaria_minutos IS DISTINCT FROM _transversal;
  GET DIAGNOSTICS _n = ROW_COUNT; _modulos_alterados := _modulos_alterados + _n;

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
  IF (SELECT count(*) FROM public.curso_modulos cm JOIN jsonb_array_elements(_mods) m ON cm.modulo_id=(m->>'id')::uuid
       WHERE cm.curso_id=_curso AND cm.carga_horaria_minutos=(m->>'minutos')::int) <> 12
     OR NOT EXISTS (SELECT 1 FROM public.curso_modulos WHERE curso_id=_curso AND modulo_id=_id_trans AND transversal=true
                   AND carga_horaria_minutos=_transversal)
     OR (SELECT sum(carga_horaria_minutos) FROM public.curso_modulos WHERE curso_id=_curso) + _aval <> _horas*60 THEN
    RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_CURSO' USING ERRCODE='42501';
  END IF;
  IF (SELECT count(*) FROM public.modulos mo JOIN jsonb_array_elements(_mods) m ON mo.id=(m->>'id')::uuid
       WHERE mo.descricao=m->>'descricao') <> 12 THEN
    RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_MODULO' USING ERRCODE='42501';
  END IF;
  IF (SELECT count(*) FROM public.licoes l JOIN jsonb_array_elements(_licoes) v ON l.id=(v->>'id')::uuid
       WHERE l.titulo=v->>'titulo' AND l.duracao_minutos=(v->>'minutos')::int
         AND l.conteudo_elearning=v->>'elearning' AND l.guiao_formador=v->>'guiao'
         AND l.estado_conteudo='disponivel' AND l.proposta_por_validar=false) <> 60 THEN
    RAISE EXCEPTION 'SEM_REGRA_DE_ESCRITA_LICOES' USING ERRCODE='42501';
  END IF;

  RETURN jsonb_build_object('pacote','redes','licoes_alteradas',_alteradas,
    'licoes_inalteradas',_inalteradas,'modulos_alterados',_modulos_alterados,
    'ficha_alterada',_ficha_alterada,'horas',_horas);
END $$;

REVOKE ALL ON FUNCTION public.rpc_estado_redes() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_importar_redes(jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_estado_redes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_importar_redes(jsonb, text) TO authenticated;
