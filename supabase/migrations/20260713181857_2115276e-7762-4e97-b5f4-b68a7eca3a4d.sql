-- 1. Novos campos em instituicoes
ALTER TABLE public.instituicoes
  ADD COLUMN num_trabalhadores_total integer,
  ADD COLUMN meta_cobertura_pct integer,
  ADD COLUMN prazo_meses integer,
  ADD COLUMN declaracao_assinada boolean NOT NULL DEFAULT false,
  ADD COLUMN declaracao_assinada_em timestamptz,
  ADD COLUMN indicadores_token uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE public.instituicoes
  ADD CONSTRAINT instituicoes_num_trabalhadores_total_nao_negativo
    CHECK (num_trabalhadores_total IS NULL OR num_trabalhadores_total >= 0),
  ADD CONSTRAINT instituicoes_meta_cobertura_pct_intervalo
    CHECK (meta_cobertura_pct IS NULL OR (meta_cobertura_pct BETWEEN 1 AND 100)),
  ADD CONSTRAINT instituicoes_prazo_meses_positivo
    CHECK (prazo_meses IS NULL OR prazo_meses > 0),
  ADD CONSTRAINT instituicoes_indicadores_token_unico UNIQUE (indicadores_token);

CREATE INDEX IF NOT EXISTS instituicoes_indicadores_token_idx
  ON public.instituicoes (indicadores_token);

-- 2. Remover o prazo categórico antigo
ALTER TABLE public.instituicoes DROP COLUMN prazo;
DROP TYPE IF EXISTS public.prazo_pretendido;

-- 3. Função para obter os indicadores de UMA instituição via token
CREATE OR REPLACE FUNCTION public.get_indicadores_por_token(_token uuid)
RETURNS TABLE(
  nome text,
  provincia text,
  distrito text,
  num_trabalhadores_total integer,
  num_colaboradores_total integer,
  meta_cobertura_pct integer,
  prazo_meses integer,
  declaracao_assinada boolean,
  declaracao_assinada_em timestamptz,
  formandos_certificados integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    i.nome,
    i.provincia,
    i.distrito,
    i.num_trabalhadores_total,
    i.num_colaboradores_total,
    i.meta_cobertura_pct,
    i.prazo_meses,
    i.declaracao_assinada,
    i.declaracao_assinada_em,
    (
      SELECT COUNT(DISTINCT c.perfil_id)::int
      FROM public.certificados c
      JOIN public.perfis p ON p.id = c.perfil_id
      WHERE p.instituicao_id = i.id
    ) AS formandos_certificados
  FROM public.instituicoes i
  WHERE i.indicadores_token = _token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_indicadores_por_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_indicadores_por_token(uuid) TO anon, authenticated;

-- 4. Função para os totais nacionais do painel público
CREATE OR REPLACE FUNCTION public.get_totais_nacionais()
RETURNS TABLE(
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
    (SELECT COUNT(DISTINCT perfil_id)::int FROM public.certificados),
    (SELECT COUNT(DISTINCT distrito)::int FROM public.instituicoes WHERE distrito IS NOT NULL AND distrito <> ''),
    (SELECT COUNT(*)::int FROM public.instituicoes WHERE declaracao_assinada = true);
$$;

REVOKE ALL ON FUNCTION public.get_totais_nacionais() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_totais_nacionais() TO anon, authenticated;