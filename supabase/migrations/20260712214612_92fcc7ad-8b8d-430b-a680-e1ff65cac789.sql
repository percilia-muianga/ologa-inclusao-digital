
-- Enums novos
CREATE TYPE public.setor_instituicao AS ENUM (
  'admin_publica_central',
  'admin_local',
  'educacao',
  'saude',
  'financas',
  'justica',
  'agricultura',
  'infraestruturas_transportes',
  'energia',
  'interior_seguranca',
  'sociedade_civil_ong',
  'setor_privado',
  'outro'
);

CREATE TYPE public.percurso AS ENUM (
  'completo',
  'fundacao',
  'intermedio',
  'avancado',
  'avulsos'
);

CREATE TYPE public.prazo_pretendido AS ENUM (
  'breve',
  'entre_1_3_meses',
  'entre_3_6_meses',
  'mais_6_meses',
  'nao_definido'
);

CREATE TYPE public.sala_disponivel_opt AS ENUM ('sim', 'nao', 'nao_sei');

-- Converter setor de texto para enum (tabela está vazia — seguro)
ALTER TABLE public.instituicoes
  ALTER COLUMN setor DROP DEFAULT,
  ALTER COLUMN setor TYPE public.setor_instituicao USING NULL;

-- Novos campos
ALTER TABLE public.instituicoes
  ADD COLUMN setor_outro text,
  ADD COLUMN num_computadores integer,
  ADD COLUMN num_colaboradores_total integer NOT NULL DEFAULT 0,
  ADD COLUMN nivel_literacia public.nivel_partida,
  ADD COLUMN num_mulheres integer,
  ADD COLUMN num_homens integer,
  ADD COLUMN num_pcd integer,
  ADD COLUMN apoios_acessibilidade public.apoio_acessibilidade[],
  ADD COLUMN modulos_interesse uuid[],
  ADD COLUMN percurso public.percurso,
  ADD COLUMN prazo public.prazo_pretendido,
  ADD COLUMN sala_disponivel public.sala_disponivel_opt,
  ADD COLUMN observacoes text,
  ADD COLUMN consentimento boolean NOT NULL DEFAULT false;

-- Restrições básicas de integridade
ALTER TABLE public.instituicoes
  ADD CONSTRAINT instituicoes_num_colaboradores_total_nao_negativo
    CHECK (num_colaboradores_total >= 0),
  ADD CONSTRAINT instituicoes_num_computadores_nao_negativo
    CHECK (num_computadores IS NULL OR num_computadores >= 0),
  ADD CONSTRAINT instituicoes_num_mulheres_nao_negativo
    CHECK (num_mulheres IS NULL OR num_mulheres >= 0),
  ADD CONSTRAINT instituicoes_num_homens_nao_negativo
    CHECK (num_homens IS NULL OR num_homens >= 0),
  ADD CONSTRAINT instituicoes_num_pcd_nao_negativo
    CHECK (num_pcd IS NULL OR num_pcd >= 0);
