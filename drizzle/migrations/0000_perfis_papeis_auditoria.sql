-- 1. Papéis do sistema -------------------------------------------------
CREATE TYPE public.papel_sistema AS ENUM (
  'formando',
  'formador',
  'supervisor_provincial',
  'coordenador_nacional',
  'admin_atdi',
  'auditor_atdi'
);

CREATE TYPE public.genero_utilizador AS ENUM (
  'feminino',
  'masculino',
  'outro',
  'prefere_nao_indicar'
);

-- 2. Extensão do perfil (aditiva, nada é removido) -----------------------
ALTER TABLE public.perfis
  ADD COLUMN telefone text,
  ADD COLUMN entidade_empregadora text,
  ADD COLUMN provincia text,
  ADD COLUMN distrito text,
  ADD COLUMN cargo text,
  ADD COLUMN genero public.genero_utilizador,
  ADD COLUMN tipo_deficiencia text,
  ADD COLUMN conta_de_teste boolean NOT NULL DEFAULT false,
  ADD COLUMN actualizado_em timestamptz NOT NULL DEFAULT now();

-- 3. Tabela de papéis ----------------------------------------------------
CREATE TABLE public.utilizador_papeis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utilizador_id uuid NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  papel public.papel_sistema NOT NULL,
  atribuido_em timestamptz NOT NULL DEFAULT now(),
  atribuido_por uuid,
  UNIQUE (utilizador_id, papel)
);

GRANT SELECT ON public.utilizador_papeis TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.utilizador_papeis TO authenticated;
GRANT ALL ON public.utilizador_papeis TO service_role;
ALTER TABLE public.utilizador_papeis ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.tem_papel(_uid uuid, _papel public.papel_sistema)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.utilizador_papeis
    WHERE utilizador_id = _uid AND papel = _papel
  )
$$;

CREATE OR REPLACE FUNCTION public.e_admin_atdi(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.tem_papel(_uid, 'admin_atdi') $$;

CREATE OR REPLACE FUNCTION public.e_auditor_atdi(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.tem_papel(_uid, 'auditor_atdi') $$;

CREATE POLICY up_ver_proprio ON public.utilizador_papeis
  FOR SELECT TO authenticated
  USING (utilizador_id = auth.uid());

CREATE POLICY up_ver_admin_auditor ON public.utilizador_papeis
  FOR SELECT TO authenticated
  USING (public.e_admin_atdi(auth.uid()) OR public.e_auditor_atdi(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY up_gerir_admin ON public.utilizador_papeis
  FOR ALL TO authenticated
  USING (public.e_admin_atdi(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.e_admin_atdi(auth.uid()) OR public.is_admin(auth.uid()));

-- 4. Registo de auditoria imutável --------------------------------------
CREATE TABLE public.registo_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utilizador_id uuid,
  accao text NOT NULL,
  entidade text NOT NULL,
  registo_id text,
  valor_anterior jsonb,
  valor_novo jsonb,
  campos_sensiveis_alterados text[],
  ocorrido_em timestamptz NOT NULL DEFAULT now(),
  endereco_ip text
);

CREATE INDEX idx_registo_auditoria_ocorrido ON public.registo_auditoria (ocorrido_em DESC);
CREATE INDEX idx_registo_auditoria_entidade ON public.registo_auditoria (entidade, registo_id);

GRANT SELECT ON public.registo_auditoria TO authenticated;
GRANT ALL ON public.registo_auditoria TO service_role;
ALTER TABLE public.registo_auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY ra_ver_admin_auditor ON public.registo_auditoria
  FOR SELECT TO authenticated
  USING (public.e_admin_atdi(auth.uid()) OR public.e_auditor_atdi(auth.uid()) OR public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.registo_auditoria_imutavel()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'O registo de auditoria é imutável: não pode ser alterado nem eliminado.';
END $$;

CREATE TRIGGER trg_registo_auditoria_imutavel
  BEFORE UPDATE OR DELETE ON public.registo_auditoria
  FOR EACH ROW EXECUTE FUNCTION public.registo_auditoria_imutavel();

-- Endereço IP do pedido, quando disponível
CREATE OR REPLACE FUNCTION public.endereco_ip_do_pedido()
RETURNS text LANGUAGE plpgsql STABLE SET search_path = public
AS $$
DECLARE _h text;
BEGIN
  BEGIN
    _h := current_setting('request.headers', true);
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
  IF _h IS NULL OR _h = '' THEN RETURN NULL; END IF;
  RETURN COALESCE(
    split_part(_h::jsonb ->> 'x-forwarded-for', ',', 1),
    _h::jsonb ->> 'cf-connecting-ip'
  );
END $$;

-- Gatilho genérico de auditoria.
-- EXCEPÇÃO EXPLÍCITA: o campo tipo_deficiencia é dado sensível de saúde.
-- Regista-se apenas que houve alteração, nunca o valor anterior nem o novo.
CREATE OR REPLACE FUNCTION public.auditar_alteracoes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _campos_sensiveis constant text[] := ARRAY['tipo_deficiencia'];
  _antigo jsonb;
  _novo jsonb;
  _sensiveis text[] := '{}';
  _campo text;
  _id text;
BEGIN
  _antigo := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END;
  _novo   := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END;

  FOREACH _campo IN ARRAY _campos_sensiveis LOOP
    IF (_antigo ? _campo) OR (_novo ? _campo) THEN
      IF (_antigo -> _campo) IS DISTINCT FROM (_novo -> _campo) THEN
        _sensiveis := array_append(_sensiveis, _campo);
      END IF;
      _antigo := _antigo - _campo;
      _novo := _novo - _campo;
    END IF;
  END LOOP;

  _id := COALESCE(_novo ->> 'id', _antigo ->> 'id');

  INSERT INTO public.registo_auditoria(
    utilizador_id, accao, entidade, registo_id,
    valor_anterior, valor_novo, campos_sensiveis_alterados, endereco_ip
  ) VALUES (
    auth.uid(),
    lower(TG_OP),
    TG_TABLE_NAME,
    _id,
    _antigo,
    _novo,
    NULLIF(_sensiveis, '{}'),
    public.endereco_ip_do_pedido()
  );

  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_auditar_perfis
  AFTER INSERT OR UPDATE OR DELETE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

CREATE TRIGGER trg_auditar_utilizador_papeis
  AFTER INSERT OR UPDATE OR DELETE ON public.utilizador_papeis
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

-- 5. Registo de acesso a campos sensíveis (quem audita também é auditado)
CREATE TABLE public.registo_acesso_sensivel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultado_por uuid,
  perfil_consultado uuid,
  campos text[] NOT NULL,
  contexto text,
  ocorrido_em timestamptz NOT NULL DEFAULT now(),
  endereco_ip text
);

CREATE INDEX idx_acesso_sensivel_ocorrido ON public.registo_acesso_sensivel (ocorrido_em DESC);

GRANT SELECT ON public.registo_acesso_sensivel TO authenticated;
GRANT ALL ON public.registo_acesso_sensivel TO service_role;
ALTER TABLE public.registo_acesso_sensivel ENABLE ROW LEVEL SECURITY;

CREATE POLICY ras_ver_admin_auditor ON public.registo_acesso_sensivel
  FOR SELECT TO authenticated
  USING (public.e_admin_atdi(auth.uid()) OR public.e_auditor_atdi(auth.uid()) OR public.is_admin(auth.uid()));

CREATE TRIGGER trg_acesso_sensivel_imutavel
  BEFORE UPDATE OR DELETE ON public.registo_acesso_sensivel
  FOR EACH ROW EXECUTE FUNCTION public.registo_auditoria_imutavel();

CREATE OR REPLACE FUNCTION public.registar_acesso_sensivel(
  _perfil_consultado uuid, _campos text[], _contexto text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  INSERT INTO public.registo_acesso_sensivel(consultado_por, perfil_consultado, campos, contexto, endereco_ip)
  VALUES (auth.uid(), _perfil_consultado, _campos, _contexto, public.endereco_ip_do_pedido());
END $$;

-- 6. Políticas do perfil: próprio, administrador e auditor ---------------
CREATE POLICY perfis_ver_proprio ON public.perfis
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY perfis_actualizar_proprio ON public.perfis
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY perfis_ver_admin_auditor ON public.perfis
  FOR SELECT TO authenticated
  USING (public.e_admin_atdi(auth.uid()) OR public.e_auditor_atdi(auth.uid()));

CREATE POLICY perfis_gerir_admin_atdi ON public.perfis
  FOR ALL TO authenticated
  USING (public.e_admin_atdi(auth.uid()))
  WITH CHECK (public.e_admin_atdi(auth.uid()));

-- 7. Matriz de permissões lida das regras reais da base de dados ---------
CREATE OR REPLACE FUNCTION public.listar_politicas_acesso()
RETURNS TABLE(
  tabela text,
  politica text,
  operacao text,
  papeis text,
  condicao text,
  condicao_escrita text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog
AS $$
  SELECT
    p.tablename::text,
    p.policyname::text,
    p.cmd::text,
    array_to_string(p.roles, ', '),
    COALESCE(p.qual, ''),
    COALESCE(p.with_check, '')
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND (public.e_admin_atdi(auth.uid()) OR public.e_auditor_atdi(auth.uid()) OR public.is_admin(auth.uid()))
  ORDER BY p.tablename, p.policyname
$$;

CREATE OR REPLACE FUNCTION public.listar_tabelas_protegidas()
RETURNS TABLE(tabela text, rls_activa boolean, numero_politicas integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_catalog
AS $$
  SELECT
    c.relname::text,
    c.relrowsecurity,
    (SELECT COUNT(*)::int FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = c.relname)
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
    AND (public.e_admin_atdi(auth.uid()) OR public.e_auditor_atdi(auth.uid()) OR public.is_admin(auth.uid()))
  ORDER BY c.relname
$$;
