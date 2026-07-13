CREATE OR REPLACE FUNCTION public.obter_estado_contas(_ids uuid[])
RETURNS TABLE (id uuid, tem_password boolean, ultimo_acesso timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT u.id,
         (u.encrypted_password IS NOT NULL) AS tem_password,
         u.last_sign_in_at AS ultimo_acesso
  FROM auth.users u
  WHERE u.id = ANY(_ids)
$$;

REVOKE ALL ON FUNCTION public.obter_estado_contas(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.obter_estado_contas(uuid[]) TO service_role;
