-- Andaime mínimo que reproduz o ambiente do projecto (papéis, auth.uid(),
-- perfis, utilizador_papeis, workshops) para aplicar, tal e qual como estão no
-- repositório, as partes de segurança das migrações 0013 e 0015.
-- Base EFÉMERA em /tmp. Nenhum dado real, nenhuma ligação à base do projecto.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;

CREATE SCHEMA auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
GRANT USAGE ON SCHEMA auth TO authenticated, anon, service_role;

CREATE TYPE public.papel_utilizador AS ENUM ('admin_ologa', 'gestor_instituicao', 'formando');
CREATE TYPE public.papel_sistema AS ENUM (
  'formando','formador','supervisor_provincial','coordenador_nacional','admin_atdi','auditor_atdi'
);

CREATE TABLE public.perfis (
  id uuid PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  papel public.papel_utilizador NOT NULL DEFAULT 'formando'
);
CREATE TABLE public.utilizador_papeis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utilizador_id uuid NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  papel public.papel_sistema NOT NULL,
  UNIQUE (utilizador_id, papel)
);
CREATE TABLE public.workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provincia text NOT NULL,
  duracao_horas numeric NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfis, public.utilizador_papeis, public.workshops
  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.utilizador_papeis TO anon;  -- é revogado pela 0015
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilizador_papeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

-- Políticas equivalentes às do projecto: cada pessoa gere o seu próprio perfil.
CREATE POLICY perfis_proprio_ler ON public.perfis FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY perfis_proprio_inserir ON public.perfis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY perfis_proprio_actualizar ON public.perfis FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY papeis_proprio_ler ON public.utilizador_papeis FOR SELECT TO authenticated
  USING (utilizador_id = auth.uid());
CREATE POLICY papeis_inserir ON public.utilizador_papeis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY papeis_apagar ON public.utilizador_papeis FOR DELETE TO authenticated USING (true);
CREATE POLICY perfis_admin ON public.perfis FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Mesmas assinaturas das funções reais.
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.perfis WHERE id = _uid AND papel = 'admin_ologa')
$$;
CREATE OR REPLACE FUNCTION public.tem_papel(_uid uuid, _papel public.papel_sistema) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.utilizador_papeis WHERE utilizador_id = _uid AND papel = _papel)
$$;
CREATE OR REPLACE FUNCTION public.e_admin_atdi(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT public.tem_papel(_uid, 'admin_atdi') $$;
CREATE OR REPLACE FUNCTION public.e_auditor_atdi(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT public.tem_papel(_uid, 'auditor_atdi') $$;
CREATE OR REPLACE FUNCTION public.e_equipa_formacao(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT public.tem_papel(_uid, 'formador') $$;
CREATE OR REPLACE FUNCTION public.listar_politicas_acesso() RETURNS TABLE(tabela text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT 'x'::text $$;
CREATE OR REPLACE FUNCTION public.listar_tabelas_protegidas() RETURNS TABLE(tabela text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT 'x'::text $$;
GRANT EXECUTE ON FUNCTION public.tem_papel(uuid, public.papel_sistema) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.e_admin_atdi(uuid) TO anon, authenticated;
