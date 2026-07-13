
CREATE TABLE public.convites_colaborador (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id uuid NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  criado_em timestamptz NOT NULL DEFAULT now(),
  expira_em timestamptz NOT NULL,
  usado_em timestamptz,
  invalidado_em timestamptz
);

CREATE INDEX idx_convites_colaborador_perfil ON public.convites_colaborador (perfil_id);

GRANT ALL ON public.convites_colaborador TO service_role;
-- deliberadamente sem GRANT para anon nem authenticated

ALTER TABLE public.convites_colaborador ENABLE ROW LEVEL SECURITY;
-- sem políticas: acesso apenas via service_role em funções de servidor
