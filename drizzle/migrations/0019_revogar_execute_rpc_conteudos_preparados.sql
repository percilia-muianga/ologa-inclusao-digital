-- Correcção imediata de exposição: retirar o direito de execução das duas RPC de
-- importação de conteúdos criadas na migração 0018, enquanto são reescritas.
REVOKE ALL ON FUNCTION public.rpc_conteudos_seguranca_cibernetica(uuid, jsonb, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_conteudos_seguranca_cibernetica(uuid, jsonb, boolean) FROM anon;
REVOKE ALL ON FUNCTION public.rpc_conteudos_seguranca_cibernetica(uuid, jsonb, boolean) FROM authenticated;

REVOKE ALL ON FUNCTION public.rpc_conteudos_banco_ia(uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpc_conteudos_banco_ia(uuid, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.rpc_conteudos_banco_ia(uuid, jsonb) FROM authenticated;

COMMENT ON FUNCTION public.rpc_conteudos_seguranca_cibernetica(uuid, jsonb, boolean) IS 'DEPRECATED: SECURITY DEFINER com actor confiado e substituição forçada; execução revogada, substituída por rpc_importar_seguranca_cibernetica (SECURITY INVOKER).';
COMMENT ON FUNCTION public.rpc_conteudos_banco_ia(uuid, jsonb) IS 'DEPRECATED: SECURITY DEFINER com actor confiado e identidade por enunciado; execução revogada, substituída por rpc_importar_banco_ia (SECURITY INVOKER).';