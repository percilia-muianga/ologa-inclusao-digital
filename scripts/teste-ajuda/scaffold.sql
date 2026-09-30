-- Andaime mínimo e fictício: papéis, auth.uid(), perfis, lições, auditoria
-- (cópia das funções reais) e um armazenamento simulado (storage.objects com
-- RLS), para aplicar a migração 0031 tal e qual.
CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
GRANT USAGE ON SCHEMA auth TO authenticated, anon, service_role;
CREATE TABLE public.perfis (id uuid PRIMARY KEY, papel text NOT NULL);
CREATE TABLE public.licoes (id uuid PRIMARY KEY, titulo text NOT NULL);
GRANT SELECT ON public.licoes TO authenticated;
CREATE FUNCTION public.is_admin(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.perfis WHERE id = _uid AND papel = 'admin_ologa') $$;
CREATE TABLE public.registo_auditoria (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), utilizador_id uuid, accao text, entidade text, registo_id text,
 valor_anterior jsonb, valor_novo jsonb, campos_sensiveis_alterados text[], endereco_ip text, contexto_actor text, requisicao_id text, ocorrido_em timestamptz DEFAULT now());
CREATE FUNCTION public.endereco_ip_do_pedido() RETURNS text LANGUAGE sql STABLE AS $$ SELECT NULL::text $$;
CREATE FUNCTION public.actor_auditoria() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT auth.uid() $$;
CREATE FUNCTION public.auditar_alteracoes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $f$
DECLARE _antigo jsonb; _novo jsonb; _colunas text[] := '{}'; _chave text;
BEGIN
  _antigo := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END;
  _novo   := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END;
  IF TG_OP = 'UPDATE' THEN
    FOR _chave IN SELECT jsonb_object_keys(_novo) LOOP
      IF (_antigo -> _chave) IS DISTINCT FROM (_novo -> _chave) THEN _colunas := array_append(_colunas, _chave); END IF;
    END LOOP;
  ELSIF TG_OP = 'INSERT' THEN SELECT array_agg(k ORDER BY k) INTO _colunas FROM jsonb_object_keys(_novo) AS k; END IF;
  INSERT INTO public.registo_auditoria(utilizador_id, accao, entidade, registo_id, valor_novo, campos_sensiveis_alterados, endereco_ip, contexto_actor)
  VALUES (public.actor_auditoria(), lower(TG_OP), TG_TABLE_NAME, COALESCE(_novo->>'id', _antigo->>'id'),
    jsonb_build_object('colunas', to_jsonb(COALESCE(_colunas,'{}'::text[]))), NULLIF(_colunas,'{}'), public.endereco_ip_do_pedido(),
    CASE WHEN auth.uid() IS NOT NULL THEN 'sessao_autenticada' ELSE 'servidor_service_role' END);
  RETURN COALESCE(NEW, OLD);
END $f$;
CREATE SCHEMA storage; GRANT USAGE ON SCHEMA storage TO authenticated, anon;
CREATE TABLE storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text NOT NULL, name text NOT NULL, conteudo text, UNIQUE(bucket_id,name));
GRANT SELECT, INSERT ON storage.objects TO authenticated;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
