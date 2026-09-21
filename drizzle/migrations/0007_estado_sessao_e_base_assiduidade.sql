-- Estado próprio da sessão: deixa de se inferir da data.
CREATE TYPE public.estado_sessao AS ENUM ('agendada', 'realizada', 'cancelada', 'adiada');

ALTER TABLE public.turma_sessoes
  ADD COLUMN estado public.estado_sessao NOT NULL DEFAULT 'agendada',
  ADD COLUMN motivo_estado text,
  ADD COLUMN estado_actualizado_em timestamptz,
  ADD COLUMN estado_actualizado_por_nome text;

-- Qual das duas taxas de assiduidade vale para certificação, por curso.
CREATE TYPE public.base_assiduidade AS ENUM ('estrita', 'ajustada');

ALTER TABLE public.presenca_configuracoes
  ADD COLUMN base_assiduidade public.base_assiduidade NOT NULL DEFAULT 'estrita';

-- Proveniência dos valores das sessões virtuais: introduzidos à mão.
ALTER TABLE public.presencas
  ADD COLUMN valor_introduzido_manualmente boolean NOT NULL DEFAULT false,
  ADD COLUMN introduzido_por_nome text,
  ADD COLUMN introduzido_em timestamptz;

-- O certificado passa a dizer expressamente qual a base usada.
ALTER TABLE public.certificados_curso
  ADD COLUMN base_assiduidade public.base_assiduidade NOT NULL DEFAULT 'estrita',
  ADD COLUMN assiduidade_estrita_pct numeric,
  ADD COLUMN assiduidade_ajustada_pct numeric;