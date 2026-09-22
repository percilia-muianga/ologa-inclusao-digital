-- As funções novas ficam executáveis apenas por contas autenticadas. Retira-se
-- o direito implícito de PUBLIC e o de anon. A autorização real continua a ser
-- feita dentro de cada função (perfil admin_ologa) e pelas políticas RLS.
REVOKE ALL ON FUNCTION public.rpc_estado_seguranca_cibernetica() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_estado_banco_ia() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_importar_seguranca_cibernetica(jsonb, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rpc_importar_banco_ia(jsonb, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.e_admin_geral_ologa(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.rpc_estado_seguranca_cibernetica() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_estado_banco_ia() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_importar_seguranca_cibernetica(jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_importar_banco_ia(jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.e_admin_geral_ologa(uuid) TO authenticated;