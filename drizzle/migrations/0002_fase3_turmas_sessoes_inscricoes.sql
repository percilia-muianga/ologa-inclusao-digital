-- Fase 3: turmas, cronogramas de sessões e inscrições
-- Não altera nem remove nada do que já existe.

DO $$ BEGIN
  CREATE TYPE public.estado_turma AS ENUM ('planeada','inscricoes_abertas','a_decorrer','concluida','cancelada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Código de inscrição legível e ditável: sem O, 0, I, 1, L
CREATE OR REPLACE FUNCTION public.gerar_codigo_turma()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path TO 'public'
AS $$
DECLARE
  _alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  _codigo text;
  _i integer;
BEGIN
  LOOP
    _codigo := '';
    FOR _i IN 1..8 LOOP
      _codigo := _codigo || substr(_alfabeto, 1 + floor(random() * length(_alfabeto))::int, 1);
      IF _i = 4 THEN _codigo := _codigo || '-'; END IF;
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.turmas WHERE codigo_inscricao = _codigo);
  END LOOP;
  RETURN _codigo;
END $$;

CREATE TABLE IF NOT EXISTS public.turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL REFERENCES public.cursos(id) ON DELETE RESTRICT,
  designacao text NOT NULL,
  codigo_inscricao text NOT NULL UNIQUE,
  provincia text NOT NULL,
  distrito text NOT NULL,
  local_formacao text,
  modalidade text NOT NULL DEFAULT 'presencial',
  formador_principal_nome text,
  formador_principal_id uuid REFERENCES public.perfis(id) ON DELETE SET NULL,
  formadores_auxiliares text[] NOT NULL DEFAULT '{}',
  data_inicio date,
  data_fim date,
  limite_formandos integer NOT NULL DEFAULT 30,
  estado public.estado_turma NOT NULL DEFAULT 'planeada',
  observacoes text,
  dados_de_demonstracao boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT turmas_modalidade_valida CHECK (modalidade IN ('presencial','virtual','misto')),
  CONSTRAINT turmas_limite_positivo CHECK (limite_formandos > 0),
  CONSTRAINT turmas_datas_coerentes CHECK (data_fim IS NULL OR data_inicio IS NULL OR data_fim >= data_inicio)
);

ALTER TABLE public.turmas ALTER COLUMN codigo_inscricao SET DEFAULT public.gerar_codigo_turma();

CREATE TABLE IF NOT EXISTS public.turma_sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  data date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  tema text NOT NULL,
  formador_nome text,
  modalidade text NOT NULL DEFAULT 'presencial',
  dados_de_demonstracao boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sessoes_horas_coerentes CHECK (hora_fim > hora_inicio),
  CONSTRAINT sessoes_modalidade_valida CHECK (modalidade IN ('presencial','virtual','misto'))
);

CREATE TABLE IF NOT EXISTS public.turma_inscricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  perfil_id uuid REFERENCES public.perfis(id) ON DELETE SET NULL,
  nome text NOT NULL,
  email text,
  estado text NOT NULL DEFAULT 'inscrito',
  dados_de_demonstracao boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inscricoes_estado_valido CHECK (estado IN ('inscrito','desistiu','concluiu'))
);

CREATE INDEX IF NOT EXISTS idx_turmas_curso ON public.turmas(curso_id);
CREATE INDEX IF NOT EXISTS idx_turmas_provincia ON public.turmas(provincia);
CREATE INDEX IF NOT EXISTS idx_turmas_estado ON public.turmas(estado);
CREATE INDEX IF NOT EXISTS idx_sessoes_turma ON public.turma_sessoes(turma_id, ordem);
CREATE INDEX IF NOT EXISTS idx_inscricoes_turma ON public.turma_inscricoes(turma_id);

GRANT SELECT ON public.turmas TO anon, authenticated;
GRANT SELECT ON public.turma_sessoes TO anon, authenticated;
GRANT SELECT ON public.turma_inscricoes TO authenticated;
GRANT ALL ON public.turmas TO service_role;
GRANT ALL ON public.turma_sessoes TO service_role;
GRANT ALL ON public.turma_inscricoes TO service_role;

ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turma_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turma_inscricoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY turmas_leitura_publica ON public.turmas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY sessoes_leitura_publica ON public.turma_sessoes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY inscricoes_admin ON public.turma_inscricoes FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));