-- Andaime mínimo que reproduz o ambiente do projecto: papéis, auth.uid()
-- e as tabelas de que a migração 0010 depende. A migração é aplicada a
-- seguir, tal e qual como está no repositório.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;

CREATE SCHEMA auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
GRANT USAGE ON SCHEMA auth TO authenticated, anon, service_role;

CREATE TABLE public.turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL,
  designacao text NOT NULL
);
CREATE TABLE public.turma_inscricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL REFERENCES public.turmas(id),
  perfil_id uuid,
  nome text NOT NULL,
  estado text NOT NULL DEFAULT 'activa'
);
CREATE TABLE public.licoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL,
  titulo text NOT NULL
);
GRANT SELECT ON public.turma_inscricoes, public.turmas, public.licoes TO authenticated;
ALTER TABLE public.turma_inscricoes ENABLE ROW LEVEL SECURITY;

-- Mesma assinatura da função real; aqui decidida por uma lista de teste.
CREATE TABLE public.equipa_teste (uid uuid PRIMARY KEY);
CREATE OR REPLACE FUNCTION public.e_equipa_formacao(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.equipa_teste WHERE uid = _uid)
$$;
