
-- ============================================================
-- 1. NOVOS CAMPOS EM instituicoes
-- ============================================================
ALTER TABLE public.instituicoes
  ADD COLUMN IF NOT EXISTS meta_conclusao_pct integer,
  ADD COLUMN IF NOT EXISTS meta_ganho_pontos integer,
  ADD COLUMN IF NOT EXISTS meta_equidade_max_pp integer,
  ADD COLUMN IF NOT EXISTS pedido_meta_cobertura_pct integer,
  ADD COLUMN IF NOT EXISTS pedido_prazo_meses integer;

ALTER TABLE public.instituicoes
  DROP CONSTRAINT IF EXISTS instituicoes_meta_conclusao_pct_intervalo;
ALTER TABLE public.instituicoes
  ADD CONSTRAINT instituicoes_meta_conclusao_pct_intervalo
  CHECK (meta_conclusao_pct IS NULL OR (meta_conclusao_pct BETWEEN 1 AND 100));

ALTER TABLE public.instituicoes
  DROP CONSTRAINT IF EXISTS instituicoes_meta_ganho_pontos_intervalo;
ALTER TABLE public.instituicoes
  ADD CONSTRAINT instituicoes_meta_ganho_pontos_intervalo
  CHECK (meta_ganho_pontos IS NULL OR (meta_ganho_pontos BETWEEN 1 AND 100));

ALTER TABLE public.instituicoes
  DROP CONSTRAINT IF EXISTS instituicoes_meta_equidade_max_pp_intervalo;
ALTER TABLE public.instituicoes
  ADD CONSTRAINT instituicoes_meta_equidade_max_pp_intervalo
  CHECK (meta_equidade_max_pp IS NULL OR (meta_equidade_max_pp BETWEEN 0 AND 100));

-- Backfill dos "pedido_" a partir dos valores actuais (só uma vez)
UPDATE public.instituicoes
  SET pedido_meta_cobertura_pct = meta_cobertura_pct
  WHERE pedido_meta_cobertura_pct IS NULL AND meta_cobertura_pct IS NOT NULL;
UPDATE public.instituicoes
  SET pedido_prazo_meses = prazo_meses
  WHERE pedido_prazo_meses IS NULL AND prazo_meses IS NOT NULL;

-- ============================================================
-- 2. TABELA DE PERCURSO (módulos acordados, com ordem)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.instituicao_modulos_percurso (
  instituicao_id uuid NOT NULL REFERENCES public.instituicoes(id) ON DELETE CASCADE,
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE RESTRICT,
  ordem integer NOT NULL CHECK (ordem > 0),
  criado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (instituicao_id, modulo_id),
  UNIQUE (instituicao_id, ordem)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.instituicao_modulos_percurso TO authenticated;
GRANT ALL ON public.instituicao_modulos_percurso TO service_role;

ALTER TABLE public.instituicao_modulos_percurso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS imp_admin_all ON public.instituicao_modulos_percurso;
CREATE POLICY imp_admin_all
  ON public.instituicao_modulos_percurso
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- 3. HISTÓRICO DE METAS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.metas_historico (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instituicao_id uuid NOT NULL REFERENCES public.instituicoes(id) ON DELETE CASCADE,
  campo text NOT NULL,
  valor_antigo text,
  valor_novo text,
  alterado_em timestamptz NOT NULL DEFAULT now(),
  alterado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS metas_historico_inst_idx
  ON public.metas_historico(instituicao_id, alterado_em DESC);

GRANT SELECT ON public.metas_historico TO authenticated;
GRANT ALL ON public.metas_historico TO service_role;

ALTER TABLE public.metas_historico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mh_select_admin ON public.metas_historico;
CREATE POLICY mh_select_admin
  ON public.metas_historico
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================
-- 4. TRIGGER DE AUDITORIA DE METAS
-- ============================================================
CREATE OR REPLACE FUNCTION public.instituicoes_auditar_metas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _campos text[] := ARRAY[
    'meta_cobertura_pct',
    'meta_conclusao_pct',
    'meta_ganho_pontos',
    'meta_equidade_max_pp',
    'prazo_meses'
  ];
  _campo text;
  _antigo text;
  _novo text;
  _old jsonb := to_jsonb(OLD);
  _new jsonb := to_jsonb(NEW);
BEGIN
  FOREACH _campo IN ARRAY _campos LOOP
    _antigo := _old ->> _campo;
    _novo := _new ->> _campo;
    IF _antigo IS DISTINCT FROM _novo THEN
      INSERT INTO public.metas_historico(instituicao_id, campo, valor_antigo, valor_novo, alterado_por)
      VALUES (NEW.id, _campo, _antigo, _novo, auth.uid());
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_instituicoes_auditar_metas ON public.instituicoes;
CREATE TRIGGER trg_instituicoes_auditar_metas
  AFTER UPDATE ON public.instituicoes
  FOR EACH ROW EXECUTE FUNCTION public.instituicoes_auditar_metas();

-- ============================================================
-- 5. NOVA FUNÇÃO PÚBLICA DE INDICADORES
-- ============================================================
DROP FUNCTION IF EXISTS public.get_indicadores_por_token(uuid);

CREATE OR REPLACE FUNCTION public.get_indicadores_por_token(_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inst public.instituicoes%ROWTYPE;
  _limite constant integer := 5;

  _inscritos integer := 0;
  _certificados integer := 0;
  _cobertura_pct numeric;
  _conclusao_pct numeric;

  _n_f integer := 0; _n_m integer := 0;
  _cert_f integer := 0; _cert_m integer := 0;
  _taxa_f numeric; _taxa_m numeric;
  _sexo_censurado boolean;
  _dif_sexo_pp numeric;

  _n_ca integer := 0; _n_sa integer := 0;
  _cert_ca integer := 0; _cert_sa integer := 0;
  _taxa_ca numeric; _taxa_sa numeric;
  _apoio_censurado boolean;
  _dif_apoio_pp numeric;

  _ganho_medio numeric;
  _ganho_n integer := 0;

  _dif_maxima_pp numeric;
  _equidade_disponivel boolean;

  _lista_certificados jsonb;
BEGIN
  SELECT * INTO _inst FROM public.instituicoes WHERE indicadores_token = _token LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Totais gerais (nunca censurados)
  SELECT COUNT(*)::int INTO _inscritos
    FROM public.formandos WHERE instituicao_id = _inst.id;

  SELECT COUNT(DISTINCT c.formando_id)::int INTO _certificados
    FROM public.certificados c
    JOIN public.formandos f ON f.id = c.formando_id
    WHERE f.instituicao_id = _inst.id;

  IF _inst.num_trabalhadores_total IS NOT NULL AND _inst.num_trabalhadores_total > 0 THEN
    _cobertura_pct := ROUND(100.0 * _inscritos / _inst.num_trabalhadores_total, 1);
  END IF;

  IF _inscritos > 0 THEN
    _conclusao_pct := ROUND(100.0 * _certificados / _inscritos, 1);
  END IF;

  -- Corte por sexo
  SELECT
    COUNT(*) FILTER (WHERE genero = 'feminino')::int,
    COUNT(*) FILTER (WHERE genero = 'masculino')::int
    INTO _n_f, _n_m
    FROM public.formandos WHERE instituicao_id = _inst.id;

  _sexo_censurado := (_n_f < _limite OR _n_m < _limite);

  IF NOT _sexo_censurado THEN
    SELECT
      COUNT(*) FILTER (WHERE f.genero = 'feminino' AND EXISTS (SELECT 1 FROM public.certificados c WHERE c.formando_id = f.id))::int,
      COUNT(*) FILTER (WHERE f.genero = 'masculino' AND EXISTS (SELECT 1 FROM public.certificados c WHERE c.formando_id = f.id))::int
      INTO _cert_f, _cert_m
      FROM public.formandos f WHERE f.instituicao_id = _inst.id;

    _taxa_f := ROUND(100.0 * _cert_f / NULLIF(_n_f, 0), 1);
    _taxa_m := ROUND(100.0 * _cert_m / NULLIF(_n_m, 0), 1);
    IF _taxa_f IS NOT NULL AND _taxa_m IS NOT NULL THEN
      _dif_sexo_pp := ABS(_taxa_f - _taxa_m);
    END IF;
  END IF;

  -- Corte por necessidade de apoio
  SELECT
    COUNT(*) FILTER (WHERE precisa_apoio = true)::int,
    COUNT(*) FILTER (WHERE precisa_apoio = false)::int
    INTO _n_ca, _n_sa
    FROM public.formandos WHERE instituicao_id = _inst.id;

  _apoio_censurado := (_n_ca < _limite OR _n_sa < _limite);

  IF NOT _apoio_censurado THEN
    SELECT
      COUNT(*) FILTER (WHERE f.precisa_apoio = true AND EXISTS (SELECT 1 FROM public.certificados c WHERE c.formando_id = f.id))::int,
      COUNT(*) FILTER (WHERE f.precisa_apoio = false AND EXISTS (SELECT 1 FROM public.certificados c WHERE c.formando_id = f.id))::int
      INTO _cert_ca, _cert_sa
      FROM public.formandos f WHERE f.instituicao_id = _inst.id;

    _taxa_ca := ROUND(100.0 * _cert_ca / NULLIF(_n_ca, 0), 1);
    _taxa_sa := ROUND(100.0 * _cert_sa / NULLIF(_n_sa, 0), 1);
    IF _taxa_ca IS NOT NULL AND _taxa_sa IS NOT NULL THEN
      _dif_apoio_pp := ABS(_taxa_ca - _taxa_sa);
    END IF;
  END IF;

  -- Ganho médio (apenas quem fez diagnóstico)
  WITH quiz_final AS (
    SELECT DISTINCT ON (q.formando_id, q.modulo_id)
      q.formando_id, q.pontuacao::numeric / NULLIF(q.total, 0) AS pct
    FROM public.progresso_quizzes q
    JOIN public.formandos f ON f.id = q.formando_id
    WHERE f.instituicao_id = _inst.id AND q.total > 0
    ORDER BY q.formando_id, q.modulo_id, q.tentado_em DESC
  ),
  media_quiz AS (
    SELECT formando_id, AVG(pct) AS pct_final FROM quiz_final GROUP BY formando_id
  ),
  ganhos AS (
    SELECT (mq.pct_final - (f.diagnostico_pontuacao::numeric / f.diagnostico_total)) * 100 AS g
    FROM public.formandos f
    JOIN media_quiz mq ON mq.formando_id = f.id
    WHERE f.instituicao_id = _inst.id
      AND f.diagnostico_total IS NOT NULL
      AND f.diagnostico_total > 0
  )
  SELECT ROUND(AVG(g)::numeric, 1), COUNT(*)::int
    INTO _ganho_medio, _ganho_n
    FROM ganhos;

  -- Equidade global: maior das duas diferenças disponíveis
  _dif_maxima_pp := GREATEST(COALESCE(_dif_sexo_pp, -1), COALESCE(_dif_apoio_pp, -1));
  IF _dif_maxima_pp < 0 THEN _dif_maxima_pp := NULL; END IF;
  _equidade_disponivel := _dif_maxima_pp IS NOT NULL;

  -- Lista de certificados (nome, módulo, data). Nada mais.
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'nome', f.nome,
    'modulo', m.titulo,
    'data', c.emitido_em
  ) ORDER BY c.emitido_em DESC), '[]'::jsonb)
    INTO _lista_certificados
    FROM public.certificados c
    JOIN public.formandos f ON f.id = c.formando_id
    JOIN public.modulos m ON m.id = c.modulo_id
    WHERE f.instituicao_id = _inst.id;

  RETURN jsonb_build_object(
    'instituicao', jsonb_build_object(
      'nome', _inst.nome,
      'provincia', _inst.provincia,
      'distrito', _inst.distrito,
      'num_trabalhadores_total', _inst.num_trabalhadores_total,
      'prazo_meses', _inst.prazo_meses,
      'declaracao_assinada', _inst.declaracao_assinada,
      'declaracao_assinada_em', _inst.declaracao_assinada_em
    ),
    'totais', jsonb_build_object(
      'inscritos', _inscritos,
      'certificados', _certificados
    ),
    'cobertura', jsonb_build_object(
      'real_pct', _cobertura_pct,
      'meta_pct', _inst.meta_cobertura_pct,
      'disponivel', _cobertura_pct IS NOT NULL
    ),
    'conclusao', jsonb_build_object(
      'real_pct', _conclusao_pct,
      'meta_pct', _inst.meta_conclusao_pct,
      'disponivel', _conclusao_pct IS NOT NULL
    ),
    'ganho', jsonb_build_object(
      'real_pontos', _ganho_medio,
      'meta_pontos', _inst.meta_ganho_pontos,
      'n', _ganho_n,
      'disponivel', _ganho_n > 0
    ),
    'equidade', jsonb_build_object(
      'dif_maxima_pp', _dif_maxima_pp,
      'meta_max_pp', _inst.meta_equidade_max_pp,
      'sexo_censurado', _sexo_censurado,
      'apoio_censurado', _apoio_censurado,
      'disponivel', _equidade_disponivel
    ),
    'compromisso', jsonb_build_object(
      'declaracao_assinada', _inst.declaracao_assinada,
      'assinada_em', _inst.declaracao_assinada_em
    ),
    'certificados_lista', _lista_certificados
  );
END $$;

GRANT EXECUTE ON FUNCTION public.get_indicadores_por_token(uuid) TO anon, authenticated;
