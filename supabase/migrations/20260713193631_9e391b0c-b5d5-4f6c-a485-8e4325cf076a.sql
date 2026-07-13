
-- Políticas antigas dependentes de funções que vão desaparecer.
DROP POLICY IF EXISTS instituicoes_update_gestor ON public.instituicoes;
DROP POLICY IF EXISTS instituicoes_select_membros ON public.instituicoes;

-- 1. Tabelas do modelo antigo.
DROP TABLE IF EXISTS public.convites_colaborador CASCADE;
DROP TABLE IF EXISTS public.turma_formandos CASCADE;
DROP TABLE IF EXISTS public.turmas CASCADE;

-- 2. Dados existentes.
DELETE FROM public.certificados;
DELETE FROM public.progresso_licoes;
DELETE FROM public.progresso_quizzes;
DELETE FROM auth.users WHERE id IN (
  SELECT id FROM public.perfis WHERE papel <> 'admin_ologa'
);
DELETE FROM public.perfis WHERE papel <> 'admin_ologa';

-- 3. Recriar certificados/progresso.
DROP TABLE public.certificados;
DROP TABLE public.progresso_licoes;
DROP TABLE public.progresso_quizzes;

-- 4. Enxugar perfis.
DROP POLICY IF EXISTS perfis_select_gestor ON public.perfis;
DROP POLICY IF EXISTS perfis_insert_gestor ON public.perfis;
DROP POLICY IF EXISTS perfis_update_gestor ON public.perfis;
DROP POLICY IF EXISTS perfis_select_proprio ON public.perfis;
DROP POLICY IF EXISTS perfis_insert_proprio ON public.perfis;
DROP POLICY IF EXISTS perfis_update_proprio ON public.perfis;
DROP POLICY IF EXISTS perfis_select_admin ON public.perfis;
DROP POLICY IF EXISTS perfis_insert_admin ON public.perfis;
DROP POLICY IF EXISTS perfis_update_admin ON public.perfis;

ALTER TABLE public.perfis DROP CONSTRAINT IF EXISTS perfis_admin_sem_instituicao;
ALTER TABLE public.perfis DROP COLUMN IF EXISTS instituicao_id;
ALTER TABLE public.perfis DROP COLUMN IF EXISTS genero;
ALTER TABLE public.perfis DROP COLUMN IF EXISTS nivel_partida;
ALTER TABLE public.perfis DROP COLUMN IF EXISTS tem_deficiencia;
ALTER TABLE public.perfis DROP COLUMN IF EXISTS apoios_acessibilidade;
ALTER TABLE public.perfis DROP COLUMN IF EXISTS funcao;
ALTER TABLE public.perfis DROP COLUMN IF EXISTS palavra_passe_definida_em;
ALTER TABLE public.perfis
  ADD CONSTRAINT perfis_apenas_admin CHECK (papel = 'admin_ologa');

CREATE POLICY perfis_admin_all ON public.perfis
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP FUNCTION IF EXISTS public.is_gestor_de(uuid, uuid);
DROP FUNCTION IF EXISTS public.esta_em_turma(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_instituicao(uuid);
DROP FUNCTION IF EXISTS public.get_papel(uuid);
DROP FUNCTION IF EXISTS public.obter_estado_contas(uuid[]);

-- 5. Nova tabela formandos.
CREATE TABLE public.formandos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_pessoal uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  instituicao_id uuid REFERENCES public.instituicoes(id) ON DELETE SET NULL,
  nome text NOT NULL,
  genero public.genero,
  nivel_partida public.nivel_partida,
  precisa_apoio boolean,
  apoios_acessibilidade public.apoio_acessibilidade[],
  diagnostico_pontuacao integer CHECK (diagnostico_pontuacao IS NULL OR diagnostico_pontuacao >= 0),
  diagnostico_total integer CHECK (diagnostico_total IS NULL OR diagnostico_total > 0),
  criado_em timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (diagnostico_pontuacao IS NULL AND diagnostico_total IS NULL)
    OR (diagnostico_pontuacao IS NOT NULL AND diagnostico_total IS NOT NULL
        AND diagnostico_pontuacao <= diagnostico_total)
  )
);
CREATE INDEX idx_formandos_instituicao_id ON public.formandos(instituicao_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.formandos TO authenticated;
GRANT ALL ON public.formandos TO service_role;
ALTER TABLE public.formandos ENABLE ROW LEVEL SECURITY;
CREATE POLICY formandos_admin_all ON public.formandos
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. Certificados.
CREATE TABLE public.certificados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formando_id uuid NOT NULL REFERENCES public.formandos(id) ON DELETE RESTRICT,
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE RESTRICT,
  emitido_em timestamptz NOT NULL DEFAULT now(),
  codigo_verificacao text NOT NULL UNIQUE,
  nome_formando text NOT NULL,
  nome_instituicao text NOT NULL,
  titulo_modulo text NOT NULL,
  UNIQUE (formando_id, modulo_id)
);
CREATE INDEX idx_certificados_formando_id ON public.certificados(formando_id);
CREATE INDEX idx_certificados_modulo_id ON public.certificados(modulo_id);
GRANT SELECT, INSERT, DELETE ON public.certificados TO authenticated;
GRANT ALL ON public.certificados TO service_role;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
CREATE POLICY cert_admin_all ON public.certificados
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_certificados_impedir_update
  BEFORE UPDATE ON public.certificados
  FOR EACH ROW EXECUTE FUNCTION public.certificados_impedir_update();

-- 7. Progresso.
CREATE TABLE public.progresso_licoes (
  formando_id uuid NOT NULL REFERENCES public.formandos(id) ON DELETE CASCADE,
  licao_id uuid NOT NULL REFERENCES public.licoes(id) ON DELETE CASCADE,
  concluida_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (formando_id, licao_id)
);
CREATE INDEX idx_progresso_licoes_licao_id ON public.progresso_licoes(licao_id);
GRANT SELECT, INSERT, DELETE ON public.progresso_licoes TO authenticated;
GRANT ALL ON public.progresso_licoes TO service_role;
ALTER TABLE public.progresso_licoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY pl_admin_all ON public.progresso_licoes
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.progresso_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formando_id uuid NOT NULL REFERENCES public.formandos(id) ON DELETE CASCADE,
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  pontuacao integer NOT NULL CHECK (pontuacao >= 0),
  total integer NOT NULL CHECK (total > 0),
  tentado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_progresso_quizzes_formando_id ON public.progresso_quizzes(formando_id);
CREATE INDEX idx_progresso_quizzes_modulo_id ON public.progresso_quizzes(modulo_id);
GRANT SELECT, INSERT, DELETE ON public.progresso_quizzes TO authenticated;
GRANT ALL ON public.progresso_quizzes TO service_role;
ALTER TABLE public.progresso_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY pq_admin_all ON public.progresso_quizzes
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 8. get_indicadores_por_token com cortes e regra dos <5.
DROP FUNCTION IF EXISTS public.get_indicadores_por_token(uuid);
CREATE OR REPLACE FUNCTION public.get_indicadores_por_token(_token uuid)
RETURNS TABLE (
  nome text,
  provincia text,
  distrito text,
  num_trabalhadores_total integer,
  meta_cobertura_pct integer,
  prazo_meses integer,
  declaracao_assinada boolean,
  declaracao_assinada_em timestamptz,
  formandos_inscritos integer,
  formandos_certificados integer,
  taxa_conclusao_geral_pct numeric,
  sexo_censurado boolean,
  taxa_conclusao_feminino_pct numeric,
  taxa_conclusao_masculino_pct numeric,
  apoio_censurado boolean,
  taxa_conclusao_com_apoio_pct numeric,
  taxa_conclusao_sem_apoio_pct numeric,
  ganho_medio_pct numeric,
  ganho_n integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inst public.instituicoes%ROWTYPE;
  _n_f integer := 0;
  _n_m integer := 0;
  _n_ca integer := 0;
  _n_sa integer := 0;
  _limite constant integer := 5;
BEGIN
  SELECT * INTO _inst FROM public.instituicoes WHERE indicadores_token = _token LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  nome := _inst.nome;
  provincia := _inst.provincia;
  distrito := _inst.distrito;
  num_trabalhadores_total := _inst.num_trabalhadores_total;
  meta_cobertura_pct := _inst.meta_cobertura_pct;
  prazo_meses := _inst.prazo_meses;
  declaracao_assinada := _inst.declaracao_assinada;
  declaracao_assinada_em := _inst.declaracao_assinada_em;

  SELECT COUNT(*)::int INTO formandos_inscritos
    FROM public.formandos WHERE instituicao_id = _inst.id;

  SELECT COUNT(DISTINCT c.formando_id)::int INTO formandos_certificados
    FROM public.certificados c
    JOIN public.formandos f ON f.id = c.formando_id
    WHERE f.instituicao_id = _inst.id;

  IF formandos_inscritos > 0 THEN
    taxa_conclusao_geral_pct :=
      ROUND(100.0 * formandos_certificados / formandos_inscritos, 1);
  END IF;

  SELECT COUNT(*) FILTER (WHERE genero = 'feminino')::int,
         COUNT(*) FILTER (WHERE genero = 'masculino')::int
    INTO _n_f, _n_m
    FROM public.formandos WHERE instituicao_id = _inst.id;

  sexo_censurado := (_n_f < _limite OR _n_m < _limite);
  IF NOT sexo_censurado THEN
    SELECT ROUND(100.0 * COUNT(*) FILTER (
             WHERE genero = 'feminino'
               AND EXISTS (SELECT 1 FROM public.certificados c WHERE c.formando_id = f.id)
           ) / NULLIF(_n_f, 0), 1)
      INTO taxa_conclusao_feminino_pct
      FROM public.formandos f WHERE instituicao_id = _inst.id;
    SELECT ROUND(100.0 * COUNT(*) FILTER (
             WHERE genero = 'masculino'
               AND EXISTS (SELECT 1 FROM public.certificados c WHERE c.formando_id = f.id)
           ) / NULLIF(_n_m, 0), 1)
      INTO taxa_conclusao_masculino_pct
      FROM public.formandos f WHERE instituicao_id = _inst.id;
  END IF;

  SELECT COUNT(*) FILTER (WHERE precisa_apoio = true)::int,
         COUNT(*) FILTER (WHERE precisa_apoio = false)::int
    INTO _n_ca, _n_sa
    FROM public.formandos WHERE instituicao_id = _inst.id;

  apoio_censurado := (_n_ca < _limite OR _n_sa < _limite);
  IF NOT apoio_censurado THEN
    SELECT ROUND(100.0 * COUNT(*) FILTER (
             WHERE precisa_apoio = true
               AND EXISTS (SELECT 1 FROM public.certificados c WHERE c.formando_id = f.id)
           ) / NULLIF(_n_ca, 0), 1)
      INTO taxa_conclusao_com_apoio_pct
      FROM public.formandos f WHERE instituicao_id = _inst.id;
    SELECT ROUND(100.0 * COUNT(*) FILTER (
             WHERE precisa_apoio = false
               AND EXISTS (SELECT 1 FROM public.certificados c WHERE c.formando_id = f.id)
           ) / NULLIF(_n_sa, 0), 1)
      INTO taxa_conclusao_sem_apoio_pct
      FROM public.formandos f WHERE instituicao_id = _inst.id;
  END IF;

  WITH quiz_final AS (
    SELECT DISTINCT ON (q.formando_id, q.modulo_id)
      q.formando_id, q.pontuacao::numeric / q.total AS pct
    FROM public.progresso_quizzes q
    JOIN public.formandos f ON f.id = q.formando_id
    WHERE f.instituicao_id = _inst.id
    ORDER BY q.formando_id, q.modulo_id, q.tentado_em DESC
  ),
  media_quiz AS (
    SELECT formando_id, AVG(pct) AS pct_final
    FROM quiz_final GROUP BY formando_id
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
    INTO ganho_medio_pct, ganho_n
    FROM ganhos;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.get_indicadores_por_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_indicadores_por_token(uuid) TO anon, authenticated;

-- 9. get_totais_nacionais.
CREATE OR REPLACE FUNCTION public.get_totais_nacionais()
RETURNS TABLE (
  instituicoes_inscritas integer,
  formandos_certificados integer,
  distritos_abrangidos integer,
  declaracoes_assinadas integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*)::int FROM public.instituicoes),
    (SELECT COUNT(DISTINCT formando_id)::int FROM public.certificados),
    (SELECT COUNT(DISTINCT distrito)::int FROM public.instituicoes
       WHERE distrito IS NOT NULL AND distrito <> ''),
    (SELECT COUNT(*)::int FROM public.instituicoes WHERE declaracao_assinada = true);
$$;
