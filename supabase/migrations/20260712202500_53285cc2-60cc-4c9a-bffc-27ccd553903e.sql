
-- search_path no trigger
CREATE OR REPLACE FUNCTION public.certificados_impedir_update()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Certificados são imutáveis e não podem ser alterados.';
END;
$$;

-- Restringir EXECUTE das funções SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.get_papel(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_instituicao(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_gestor_de(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.esta_em_turma(UUID, UUID) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_papel(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_instituicao(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_gestor_de(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.esta_em_turma(UUID, UUID) TO authenticated, service_role;
