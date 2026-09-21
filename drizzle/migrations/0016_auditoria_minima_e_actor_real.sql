-- Migração exclusivamente de segurança. Sem carga pedagógica.
-- Lacuna fechada: até aqui auditar_alteracoes() gravava as linhas OLD e NEW
-- inteiras (menos uma lista fixa de campos), guardando dados pessoais comuns e
-- enunciados. A partir daqui guardam-se apenas metadados. O histórico já
-- gravado não é apagado nem alterado.

ALTER TABLE public.registo_auditoria ADD COLUMN IF NOT EXISTS requisicao_id text;
COMMENT ON COLUMN public.registo_auditoria.requisicao_id IS
  'Identificador do pedido HTTP (cabeçalho x-request-id), quando existe. Metadado, nunca conteúdo.';

CREATE OR REPLACE FUNCTION public.auditar_alteracoes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _antigo jsonb;
  _novo jsonb;
  _colunas text[] := '{}';
  _chave text;
  _id text;
  _pedido text;
BEGIN
  _antigo := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END;
  _novo   := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END;

  IF TG_OP = 'UPDATE' THEN
    FOR _chave IN SELECT jsonb_object_keys(_novo) LOOP
      IF (_antigo -> _chave) IS DISTINCT FROM (_novo -> _chave) THEN
        _colunas := array_append(_colunas, _chave);
      END IF;
    END LOOP;
  ELSIF TG_OP = 'INSERT' THEN
    SELECT array_agg(k ORDER BY k) INTO _colunas FROM jsonb_object_keys(_novo) AS k;
  END IF;

  _id := COALESCE(_novo ->> 'id', _antigo ->> 'id');

  BEGIN
    _pedido := current_setting('request.headers', true)::json ->> 'x-request-id';
  EXCEPTION WHEN OTHERS THEN
    _pedido := NULL;
  END;

  INSERT INTO public.registo_auditoria(
    utilizador_id, accao, entidade, registo_id,
    valor_anterior, valor_novo, campos_sensiveis_alterados,
    endereco_ip, contexto_actor, requisicao_id
  ) VALUES (
    auth.uid(),
    lower(TG_OP),
    TG_TABLE_NAME,
    _id,
    NULL,
    jsonb_build_object('colunas', to_jsonb(COALESCE(_colunas, '{}'::text[]))),
    NULLIF(_colunas, '{}'),
    public.endereco_ip_do_pedido(),
    CASE WHEN auth.uid() IS NULL THEN 'servidor_service_role' ELSE 'sessao_autenticada' END,
    _pedido
  );

  RETURN COALESCE(NEW, OLD);
END $function$;

COMMENT ON FUNCTION public.auditar_alteracoes() IS
  'Regista apenas metadados: id do registo, operação, nomes das colunas alteradas (sem valores), momento, actor verificado (auth.uid) e identificador do pedido. Nunca valores, dados pessoais, enunciados, gabaritos ou tokens. Corre na mesma transacção da mutação.';

DROP TRIGGER IF EXISTS trg_auditar_certificados ON public.certificados;
CREATE TRIGGER trg_auditar_certificados
  AFTER INSERT OR UPDATE OR DELETE ON public.certificados
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

DROP TRIGGER IF EXISTS trg_auditar_certificados_curso ON public.certificados_curso;
CREATE TRIGGER trg_auditar_certificados_curso
  AFTER INSERT OR UPDATE OR DELETE ON public.certificados_curso
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.turmas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turma_sessoes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.turma_inscricoes TO authenticated;
GRANT SELECT, INSERT ON public.presencas TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.presenca_configuracoes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.banco_questoes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.exame_configuracoes TO authenticated;

DROP POLICY IF EXISTS turmas_escrever_gestao ON public.turmas;
CREATE POLICY turmas_escrever_gestao ON public.turmas FOR ALL TO authenticated
  USING (public.pode_gerir_programa(auth.uid()))
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS sessoes_escrever_gestao ON public.turma_sessoes;
CREATE POLICY sessoes_escrever_gestao ON public.turma_sessoes FOR ALL TO authenticated
  USING (public.pode_gerir_programa(auth.uid()))
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS inscricoes_inserir_gestao ON public.turma_inscricoes;
CREATE POLICY inscricoes_inserir_gestao ON public.turma_inscricoes FOR INSERT TO authenticated
  WITH CHECK (public.pode_gerir_programa(auth.uid()));
DROP POLICY IF EXISTS inscricoes_actualizar_gestao ON public.turma_inscricoes;
CREATE POLICY inscricoes_actualizar_gestao ON public.turma_inscricoes FOR UPDATE TO authenticated
  USING (public.pode_gerir_programa(auth.uid()))
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS presencas_inserir_gestao ON public.presencas;
CREATE POLICY presencas_inserir_gestao ON public.presencas FOR INSERT TO authenticated
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS presenca_config_escrever_gestao ON public.presenca_configuracoes;
CREATE POLICY presenca_config_escrever_gestao ON public.presenca_configuracoes FOR ALL TO authenticated
  USING (public.pode_gerir_programa(auth.uid()))
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS banco_escrever_gestao ON public.banco_questoes;
CREATE POLICY banco_escrever_gestao ON public.banco_questoes FOR ALL TO authenticated
  USING (public.pode_gerir_programa(auth.uid()))
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS exame_config_escrever_gestao ON public.exame_configuracoes;
CREATE POLICY exame_config_escrever_gestao ON public.exame_configuracoes FOR ALL TO authenticated
  USING (public.pode_gerir_programa(auth.uid()))
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

CREATE OR REPLACE FUNCTION public.exigir_actor_gestao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION
      'Escrita de gestão sem actor verificado é recusada (tabela %).', TG_TABLE_NAME
      USING ERRCODE = '42501';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'turmas','turma_sessoes','turma_inscricoes','presencas','presenca_configuracoes',
    'workshops','workshop_participantes','questionarios_satisfacao',
    'avaliacoes_conhecimento','inqueritos_eficacia','relatorios_mensais',
    'banco_questoes','exame_configuracoes'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_exigir_actor ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_exigir_actor BEFORE INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.exigir_actor_gestao()', t);
  END LOOP;
END $$;

COMMENT ON FUNCTION public.exigir_actor_gestao() IS
  'Recusa escritas de gestão sem sessão real. Certificados e tentativas de exame ficam fora desta regra: continuam a ser escritos pelo servidor de confiança com o titular verificado no servidor, e por isso aparecem na auditoria como servidor_service_role.';