-- Reforço das barreiras contra escalada de privilégio. Só segurança.

-- 1. perfis: qualquer INSERT feito por uma sessão autenticada que não seja da
-- administração fica limitado ao próprio perfil e ao papel 'formando'.
-- (Antes, uma linha inserida com id de outra pessoa não passava pela barreira.)
CREATE OR REPLACE FUNCTION public.perfis_proteger_papel()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;  -- servidor de confiança (service_role): auditado à parte
  END IF;
  _admin := COALESCE(public.is_admin(auth.uid()), false)
         OR COALESCE(public.e_admin_atdi(auth.uid()), false);

  IF TG_OP = 'UPDATE' AND NEW.papel IS DISTINCT FROM OLD.papel AND NOT _admin THEN
    RAISE EXCEPTION 'Alteração de papel reservada à administração.';
  END IF;

  IF TG_OP = 'INSERT' AND NOT _admin THEN
    IF NEW.id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Um utilizador só pode criar o seu próprio perfil.';
    END IF;
    IF NEW.papel IS DISTINCT FROM 'formando'::papel_utilizador THEN
      RAISE EXCEPTION 'Um utilizador não pode criar o seu perfil com papel elevado.';
    END IF;
  END IF;

  RETURN NEW;
END $$;

-- 2. utilizador_papeis: separar explicitamente os ramos por operação, para que
-- o DELETE não dependa de NEW (registo inexistente) e continue fail-closed.
CREATE OR REPLACE FUNCTION public.papeis_proteger_atribuicao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  _admin := COALESCE(public.is_admin(auth.uid()), false)
         OR COALESCE(public.e_admin_atdi(auth.uid()), false);
  IF _admin THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT'
     AND NEW.utilizador_id = auth.uid()
     AND NEW.papel = 'formando'::papel_sistema THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Atribuição de papéis reservada à administração.';
END $$;

-- 3. Privilégios mínimos: a atribuição de papéis nunca é escrita pelo cliente.
REVOKE INSERT, UPDATE, DELETE ON public.utilizador_papeis FROM anon;
REVOKE UPDATE (papel) ON public.perfis FROM anon;