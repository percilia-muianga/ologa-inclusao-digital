-- Importação de conteúdos preparados — versão SECURITY INVOKER.
--
-- Porquê esta migração: as funções da migração 0018 eram SECURITY DEFINER e
-- contornavam a ausência de políticas de escrita em cursos e curso_modulos,
-- aceitavam um actor vindo do cliente e permitiam substituição forçada. A
-- execução dessas funções foi revogada na 0019. Aqui repõe-se o mecanismo com
-- segurança normal: as funções correm com os direitos de quem chama
-- (SECURITY INVOKER), portanto as políticas da base decidem sempre.
--
-- Para cursos e curso_modulos não existiam políticas de escrita. Em vez de
-- contornar com privilégio, criam-se políticas mínimas e legítimas:
--   * só o perfil Administrador Geral Ologa (perfis.papel = 'admin_ologa');
--   * só as linhas do curso 'seguranca-cibernetica-avancada';
--   * só as colunas necessárias (direito de UPDATE por coluna).
-- Nenhuma outra tabela é aberta, nenhum outro perfil ganha escrita e a chave de
-- serviço não é usada.
--
-- Auditoria: passa a existir gatilho de auditoria em cursos, curso_modulos,
-- licoes e modulos, com a função de auditoria já existente, que regista apenas
-- o nome das colunas alteradas — nunca valores, nunca gabaritos.

-- 1. Perfil explícito -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.e_admin_geral_ologa(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _uid IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.perfis WHERE id = _uid AND papel = 'admin_ologa'
  )
$$;
GRANT EXECUTE ON FUNCTION public.e_admin_geral_ologa(uuid) TO authenticated;
COMMENT ON FUNCTION public.e_admin_geral_ologa(uuid) IS 'Verdadeiro apenas para perfis.papel = admin_ologa. Nenhum outro perfil ou papel é aceite.';

-- 2. Código estável do item de avaliação ------------------------------------
ALTER TABLE public.banco_questoes ADD COLUMN IF NOT EXISTS codigo text;
COMMENT ON COLUMN public.banco_questoes.codigo IS 'Código interno estável do item (identidade da questão). O enunciado é mutável e não serve de identidade.';
CREATE UNIQUE INDEX IF NOT EXISTS banco_questoes_codigo_unico
  ON public.banco_questoes (curso_id, codigo) WHERE codigo IS NOT NULL;

-- 3. Políticas mínimas de escrita, limitadas ao curso alvo -------------------
GRANT UPDATE (
  carga_horaria, modalidade, objectivos, publico_alvo, pre_requisitos,
  materiais, carga_horaria_nota, minutos_avaliacao_orientacao
) ON public.cursos TO authenticated;

CREATE POLICY cursos_update_admin_geral_sc ON public.cursos
  FOR UPDATE TO authenticated
  USING (public.e_admin_geral_ologa(auth.uid()) AND slug = 'seguranca-cibernetica-avancada')
  WITH CHECK (public.e_admin_geral_ologa(auth.uid()) AND slug = 'seguranca-cibernetica-avancada');

GRANT UPDATE (carga_horaria_minutos) ON public.curso_modulos TO authenticated;

CREATE POLICY curso_modulos_update_admin_geral_sc ON public.curso_modulos
  FOR UPDATE TO authenticated
  USING (
    public.e_admin_geral_ologa(auth.uid())
    AND EXISTS (SELECT 1 FROM public.cursos c WHERE c.id = curso_id AND c.slug = 'seguranca-cibernetica-avancada')
  )
  WITH CHECK (
    public.e_admin_geral_ologa(auth.uid())
    AND EXISTS (SELECT 1 FROM public.cursos c WHERE c.id = curso_id AND c.slug = 'seguranca-cibernetica-avancada')
  );

-- 4. Auditoria nas tabelas de conteúdo --------------------------------------
DROP TRIGGER IF EXISTS trg_auditar_cursos ON public.cursos;
CREATE TRIGGER trg_auditar_cursos AFTER INSERT OR UPDATE OR DELETE ON public.cursos
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();
DROP TRIGGER IF EXISTS trg_auditar_curso_modulos ON public.curso_modulos;
CREATE TRIGGER trg_auditar_curso_modulos AFTER INSERT OR UPDATE OR DELETE ON public.curso_modulos
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();
DROP TRIGGER IF EXISTS trg_auditar_licoes ON public.licoes;
CREATE TRIGGER trg_auditar_licoes AFTER INSERT OR UPDATE OR DELETE ON public.licoes
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();
DROP TRIGGER IF EXISTS trg_auditar_modulos ON public.modulos;
CREATE TRIGGER trg_auditar_modulos AFTER INSERT OR UPDATE OR DELETE ON public.modulos
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

-- 5. Estado actual, com impressão digital (hash) -----------------------------
CREATE OR REPLACE FUNCTION public.rpc_estado_seguranca_cibernetica()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  _slug constant text := 'seguranca-cibernetica-avancada';
  _curso public.cursos%ROWTYPE;
  _licoes jsonb;
  _modulos jsonb;
  _texto text;
BEGIN
  IF NOT public.e_admin_geral_ologa(auth.uid()) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso.id IS NULL THEN
    RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023';
  END IF;

  SELECT coalesce(jsonb_agg(x ORDER BY x.modulo_ordem, x.ordem), '[]'::jsonb) INTO _licoes
  FROM (
    SELECT cm.ordem AS modulo_ordem, l.ordem AS ordem, l.titulo,
           coalesce(l.duracao_minutos, 0) AS minutos,
           l.estado_conteudo,
           coalesce(btrim(l.conteudo_elearning), '') <> '' AS tem_conteudo,
           md5(coalesce(l.conteudo_elearning, '') || '||' || coalesce(l.guiao_formador, '')) AS impressao
      FROM public.curso_modulos cm
      JOIN public.licoes l ON l.modulo_id = cm.modulo_id
     WHERE cm.curso_id = _curso.id AND cm.transversal = false
  ) x;

  SELECT coalesce(jsonb_agg(y ORDER BY y.ordem), '[]'::jsonb) INTO _modulos
  FROM (
    SELECT cm.ordem, cm.transversal, cm.carga_horaria_minutos AS minutos,
           md5(coalesce(m.descricao, '')) AS impressao,
           (SELECT count(*) FROM public.curso_modulos o WHERE o.modulo_id = cm.modulo_id) AS cursos_ligados
      FROM public.curso_modulos cm
      JOIN public.modulos m ON m.id = cm.modulo_id
     WHERE cm.curso_id = _curso.id
  ) y;

  _texto := _licoes::text || _modulos::text || jsonb_build_object(
    'carga_horaria', _curso.carga_horaria,
    'modalidade', _curso.modalidade,
    'objectivos', md5(coalesce(_curso.objectivos, '')),
    'publico_alvo', md5(coalesce(_curso.publico_alvo, '')),
    'pre_requisitos', md5(coalesce(_curso.pre_requisitos, '')),
    'materiais', md5(coalesce(_curso.materiais, '')),
    'nota', md5(coalesce(_curso.carga_horaria_nota, '')),
    'minutos_avaliacao_orientacao', _curso.minutos_avaliacao_orientacao
  )::text;

  RETURN jsonb_build_object(
    'pacote', 'seguranca-cibernetica',
    'curso', jsonb_build_object(
      'carga_horaria', _curso.carga_horaria,
      'modalidade', _curso.modalidade,
      'ficha_preenchida', coalesce(btrim(_curso.objectivos), '') <> '',
      'minutos_avaliacao_orientacao', _curso.minutos_avaliacao_orientacao
    ),
    'licoes', _licoes,
    'modulos', _modulos,
    'hash', md5(_texto)
  );
END $$;
GRANT EXECUTE ON FUNCTION public.rpc_estado_seguranca_cibernetica() TO authenticated;

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
BEGIN
  IF NOT public.e_admin_geral_ologa(auth.uid()) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso IS NULL THEN
    RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023';
  END IF;

  SELECT count(*), count(*) FILTER (WHERE activa), count(*) FILTER (WHERE estado_revisao <> 'rascunho')
    INTO _total, _activas, _revistas
    FROM public.banco_questoes WHERE curso_id = _curso;

  SELECT coalesce(string_agg(t, '|' ORDER BY t), '') INTO _texto FROM (
    SELECT coalesce(codigo, id::text) || ':' || md5(
             enunciado || conteudo::text || resposta::text || coalesce(explicacao, '')
             || tipologia::text || dificuldade::text || instrumento::text
             || activa::text || estado_revisao || versao
           ) AS t
      FROM public.banco_questoes WHERE curso_id = _curso
  ) z;

  RETURN jsonb_build_object(
    'pacote', 'banco-inteligencia-artificial',
    'total', _total,
    'activas', _activas,
    'fora_de_rascunho', _revistas,
    'hash', md5(_texto)
  );
END $$;
GRANT EXECUTE ON FUNCTION public.rpc_estado_banco_ia() TO authenticated;

-- 6. Importação do pacote de Segurança Cibernética ---------------------------
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

  -- Um pacote de cada vez: a segunda chamada espera e vê o estado já alterado.
  PERFORM pg_advisory_xact_lock(hashtext('pacote_seguranca_cibernetica'));

  IF _curso_json IS NULL OR _licoes IS NULL OR _modulos IS NULL
     OR (_payload ->> 'transversal_minutos') IS NULL THEN
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
     WHERE (v ->> 'modulo_ordem')::int NOT BETWEEN 1 AND 3
        OR (v ->> 'ordem')::int NOT BETWEEN 1 AND 5
        OR coalesce(btrim(v ->> 'titulo'), '') = ''
        OR coalesce(btrim(v ->> 'elearning'), '') = ''
        OR coalesce(btrim(v ->> 'guiao'), '') = ''
        OR coalesce((v ->> 'minutos')::int, 0) <= 0
  ) THEN
    RAISE EXCEPTION 'LICAO_INVALIDA' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(DISTINCT (v ->> 'ordem')::int) FROM jsonb_array_elements(_modulos) v) <> 3
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(_modulos) v
                 WHERE (v ->> 'ordem')::int NOT BETWEEN 1 AND 3
                    OR coalesce(btrim(v ->> 'descricao'), '') = '') THEN
    RAISE EXCEPTION 'MODULO_INVALIDO' USING ERRCODE = '22023';
  END IF;

  _transversal := (_payload ->> 'transversal_minutos')::int;
  _horas := (_curso_json ->> 'carga_horaria')::int;
  _minutos_aval := (_curso_json ->> 'minutos_avaliacao_orientacao')::int;
  SELECT sum((v ->> 'minutos')::int) INTO _soma_licoes FROM jsonb_array_elements(_licoes) v;
  SELECT sum((v ->> 'minutos')::int) INTO _soma_modulos FROM jsonb_array_elements(_modulos) v;

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

  SELECT id INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso IS NULL THEN
    RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023';
  END IF;

  -- O estado tem de ser exactamente o que foi mostrado na pré-visualização.
  _estado := public.rpc_estado_seguranca_cibernetica();
  IF _hash_estado IS NULL OR (_estado ->> 'hash') IS DISTINCT FROM _hash_estado THEN
    RAISE EXCEPTION 'ESTADO_ALTERADO' USING ERRCODE = '40001';
  END IF;

  -- Nenhum dos três módulos temáticos pode estar ligado a outro curso.
  IF EXISTS (
    SELECT 1 FROM public.curso_modulos cm
      JOIN public.curso_modulos o ON o.modulo_id = cm.modulo_id AND o.curso_id <> cm.curso_id
     WHERE cm.curso_id = _curso AND cm.transversal = false
  ) THEN
    RAISE EXCEPTION 'MODULO_PARTILHADO_COM_OUTRO_CURSO' USING ERRCODE = '22023';
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

    -- Conteúdo já existente e diferente: aborta o pacote inteiro. Não há
    -- opção de ignorar nem de substituir.
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

  -- Módulo transversal: apenas a carga horária DESTE curso. O módulo em si, que
  -- é partilhado por todos os cursos, nunca é alterado aqui.
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
GRANT EXECUTE ON FUNCTION public.rpc_importar_seguranca_cibernetica(jsonb, text) TO authenticated;

-- 7. Importação do banco de avaliação de IA ----------------------------------
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
  _actualizadas int := 0;
  _inalteradas int := 0;
  _conflitos int := 0;
BEGIN
  IF _actor IS NULL THEN
    RAISE EXCEPTION 'SEM_SESSAO' USING ERRCODE = '42501';
  END IF;
  IF NOT public.e_admin_geral_ologa(_actor) THEN
    RAISE EXCEPTION 'SEM_PERMISSAO_ADMIN_GERAL' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('pacote_banco_ia'));

  IF _questoes IS NULL OR jsonb_array_length(_questoes) <> 90 THEN
    RAISE EXCEPTION 'PAYLOAD_FORA_DO_ESPERADO' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(DISTINCT v ->> 'codigo') FROM jsonb_array_elements(_questoes) v) <> 90 THEN
    RAISE EXCEPTION 'CODIGOS_REPETIDOS' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(*) FROM jsonb_array_elements(_questoes) v
       WHERE v ->> 'instrumento' = 'exame_final') <> 80
     OR (SELECT count(*) FROM jsonb_array_elements(_questoes) v
          WHERE v ->> 'instrumento' = 'pre_pos_teste') <> 10 THEN
    RAISE EXCEPTION 'MATRIZ_INVALIDA' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(_questoes) v
     WHERE coalesce(btrim(v ->> 'codigo'), '') = ''
        OR coalesce(btrim(v ->> 'enunciado'), '') = ''
        OR coalesce(btrim(v ->> 'versao'), '') = ''
        OR (v ->> 'instrumento') NOT IN ('exame_final', 'pre_pos_teste')
        OR (v ->> 'tipologia') NOT IN ('escolha_multipla','verdadeiro_falso','resposta_curta','correspondencia','ordenacao')
        OR (v ->> 'dificuldade') NOT IN ('facil','media','dificil')
        OR (v -> 'conteudo') IS NULL OR (v -> 'resposta') IS NULL
        OR (v ->> 'ordem_modulo') IS NULL
        OR coalesce((v ->> 'activa')::boolean, false) = true
  ) THEN
    RAISE EXCEPTION 'QUESTAO_INVALIDA' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO _curso FROM public.cursos WHERE slug = _slug;
  IF _curso IS NULL THEN
    RAISE EXCEPTION 'CURSO_INEXISTENTE' USING ERRCODE = '22023';
  END IF;

  _estado := public.rpc_estado_banco_ia();
  IF _hash_estado IS NULL OR (_estado ->> 'hash') IS DISTINCT FROM _hash_estado THEN
    RAISE EXCEPTION 'ESTADO_ALTERADO' USING ERRCODE = '40001';
  END IF;

  FOR _q IN SELECT * FROM jsonb_array_elements(_questoes) LOOP
    SELECT cm.modulo_id INTO _modulo
      FROM public.curso_modulos cm
     WHERE cm.curso_id = _curso AND cm.ordem = (_q ->> 'ordem_modulo')::int;

    SELECT * INTO _a FROM public.banco_questoes
     WHERE curso_id = _curso AND codigo = btrim(_q ->> 'codigo');

    IF FOUND THEN
      -- Já em uso ou já revista: o pacote inteiro é recusado.
      IF _a.activa OR _a.estado_revisao IS DISTINCT FROM 'rascunho' THEN
        _conflitos := _conflitos + 1;
        CONTINUE;
      END IF;
      -- Exactamente igual: não se toca em autor nem em datas.
      IF _a.instrumento = (_q ->> 'instrumento')::instrumento_avaliacao
         AND _a.tipologia = (_q ->> 'tipologia')::tipologia_questao
         AND _a.dificuldade = (_q ->> 'dificuldade')::dificuldade_questao
         AND _a.enunciado IS NOT DISTINCT FROM btrim(_q ->> 'enunciado')
         AND _a.conteudo IS NOT DISTINCT FROM (_q -> 'conteudo')
         AND _a.resposta IS NOT DISTINCT FROM (_q -> 'resposta')
         AND _a.explicacao IS NOT DISTINCT FROM (_q ->> 'explicacao')
         AND _a.objectivo_associado IS NOT DISTINCT FROM (_q ->> 'objectivo_associado')
         AND _a.cenario IS NOT DISTINCT FROM coalesce((_q ->> 'cenario')::boolean, false)
         AND _a.versao IS NOT DISTINCT FROM (_q ->> 'versao')
         AND _a.modulo_id IS NOT DISTINCT FROM _modulo THEN
        _inalteradas := _inalteradas + 1;
        CONTINUE;
      END IF;
      UPDATE public.banco_questoes SET
        modulo_id = _modulo,
        instrumento = (_q ->> 'instrumento')::instrumento_avaliacao,
        tipologia = (_q ->> 'tipologia')::tipologia_questao,
        dificuldade = (_q ->> 'dificuldade')::dificuldade_questao,
        enunciado = btrim(_q ->> 'enunciado'),
        conteudo = _q -> 'conteudo',
        resposta = _q -> 'resposta',
        explicacao = _q ->> 'explicacao',
        objectivo_associado = _q ->> 'objectivo_associado',
        cenario = coalesce((_q ->> 'cenario')::boolean, false),
        activa = false,
        estado_revisao = 'rascunho',
        versao = _q ->> 'versao',
        autor_id = _actor,
        autor_nome = _q ->> 'autor_nome',
        actualizado_em = now()
      WHERE id = _a.id;
      _actualizadas := _actualizadas + 1;
    ELSE
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
        coalesce((_q ->> 'cenario')::boolean, false),
        false, 'rascunho', _q ->> 'versao', _actor, _q ->> 'autor_nome'
      );
      _inseridas := _inseridas + 1;
    END IF;
  END LOOP;

  IF _conflitos > 0 THEN
    RAISE EXCEPTION 'CONFLITO_QUESTOES_EM_USO: % questões já activas ou já revistas', _conflitos
      USING ERRCODE = '23505';
  END IF;

  RETURN jsonb_build_object(
    'pacote', 'banco-inteligencia-artificial',
    'inseridas', _inseridas,
    'actualizadas', _actualizadas,
    'inalteradas', _inalteradas,
    'activadas', 0
  );
END $$;
GRANT EXECUTE ON FUNCTION public.rpc_importar_banco_ia(jsonb, text) TO authenticated;