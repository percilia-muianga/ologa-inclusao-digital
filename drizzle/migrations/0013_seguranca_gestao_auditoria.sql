-- ============================================================
-- Migração exclusivamente de segurança. Sem carga pedagógica.
-- Não cria contas, não atribui papéis, não altera questões nem conteúdos.
-- ============================================================

-- 1. Funções de decisão reutilizáveis -------------------------------------
CREATE OR REPLACE FUNCTION public.pode_gerir_programa(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(public.is_admin(_uid), false)
      OR COALESCE(public.e_admin_atdi(_uid), false)
      OR public.tem_papel(_uid, 'coordenador_nacional')
$$;

CREATE OR REPLACE FUNCTION public.pode_ler_gestao(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(public.pode_gerir_programa(_uid), false)
      OR COALESCE(public.e_auditor_atdi(_uid), false)
$$;

REVOKE EXECUTE ON FUNCTION public.pode_gerir_programa(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.pode_ler_gestao(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.pode_gerir_programa(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pode_ler_gestao(uuid) TO authenticated;

-- 2. Fechar as funções de sondagem de papéis a utilizadores anónimos ------
REVOKE EXECUTE ON FUNCTION public.tem_papel(uuid, papel_sistema) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.e_admin_atdi(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.e_auditor_atdi(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.e_equipa_formacao(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.listar_politicas_acesso() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.listar_tabelas_protegidas() FROM anon, PUBLIC;

-- 3. Barreira contra escalada de privilégio em perfis ---------------------
-- Ninguém altera o seu próprio papel. Só administração autenticada
-- (is_admin / admin ATDI) ou o servidor de confiança (service_role, em que
-- auth.uid() é nulo) pode mudar a coluna papel.
CREATE OR REPLACE FUNCTION public.perfis_proteger_papel()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.papel IS DISTINCT FROM OLD.papel THEN
    IF auth.uid() IS NOT NULL
       AND NOT (public.is_admin(auth.uid()) OR public.e_admin_atdi(auth.uid())) THEN
      RAISE EXCEPTION 'Alteração de papel reservada à administração.';
    END IF;
  END IF;
  IF TG_OP = 'INSERT' AND auth.uid() IS NOT NULL AND NEW.id = auth.uid()
     AND NEW.papel IS DISTINCT FROM 'formando'::papel_utilizador
     AND NOT (public.is_admin(auth.uid()) OR public.e_admin_atdi(auth.uid())) THEN
    RAISE EXCEPTION 'Um utilizador não pode criar o seu perfil com papel elevado.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_perfis_proteger_papel ON public.perfis;
CREATE TRIGGER trg_perfis_proteger_papel
  BEFORE INSERT OR UPDATE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.perfis_proteger_papel();

-- A mesma barreira para a atribuição de papéis do sistema.
CREATE OR REPLACE FUNCTION public.papeis_proteger_atribuicao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT (public.is_admin(auth.uid()) OR public.e_admin_atdi(auth.uid()))
     AND NOT (TG_OP = 'INSERT' AND NEW.utilizador_id = auth.uid()
              AND NEW.papel = 'formando'::papel_sistema) THEN
    RAISE EXCEPTION 'Atribuição de papéis reservada à administração.';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS trg_papeis_proteger_atribuicao ON public.utilizador_papeis;
CREATE TRIGGER trg_papeis_proteger_atribuicao
  BEFORE INSERT OR UPDATE OR DELETE ON public.utilizador_papeis
  FOR EACH ROW EXECUTE FUNCTION public.papeis_proteger_atribuicao();

-- 4. Substituir as políticas permissivas "nesta fase" ---------------------
DROP POLICY IF EXISTS "Workshops visíveis para avaliação" ON public.workshops;
DROP POLICY IF EXISTS "Workshops podem ser criados nesta fase" ON public.workshops;
DROP POLICY IF EXISTS "Workshops podem ser actualizados nesta fase" ON public.workshops;
CREATE POLICY workshops_ler_gestao ON public.workshops FOR SELECT TO authenticated
  USING (public.pode_ler_gestao(auth.uid()));
CREATE POLICY workshops_escrever_gestao ON public.workshops FOR ALL TO authenticated
  USING (public.pode_gerir_programa(auth.uid()))
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS "Participantes visíveis para avaliação" ON public.workshop_participantes;
DROP POLICY IF EXISTS "Participantes podem ser registados nesta fase" ON public.workshop_participantes;
DROP POLICY IF EXISTS "Participantes podem ser corrigidos nesta fase" ON public.workshop_participantes;
CREATE POLICY participantes_ler_gestao ON public.workshop_participantes FOR SELECT TO authenticated
  USING (public.pode_ler_gestao(auth.uid()));
CREATE POLICY participantes_escrever_gestao ON public.workshop_participantes FOR ALL TO authenticated
  USING (public.pode_gerir_programa(auth.uid()))
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS "Satisfação visível para avaliação" ON public.questionarios_satisfacao;
DROP POLICY IF EXISTS "Satisfação pode ser registada nesta fase" ON public.questionarios_satisfacao;
CREATE POLICY satisfacao_ler_gestao ON public.questionarios_satisfacao FOR SELECT TO authenticated
  USING (public.pode_ler_gestao(auth.uid()));
CREATE POLICY satisfacao_inserir_gestao ON public.questionarios_satisfacao FOR INSERT TO authenticated
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS "Avaliações visíveis para avaliação" ON public.avaliacoes_conhecimento;
DROP POLICY IF EXISTS "Avaliações podem ser registadas nesta fase" ON public.avaliacoes_conhecimento;
CREATE POLICY avaliacoes_ler_gestao ON public.avaliacoes_conhecimento FOR SELECT TO authenticated
  USING (public.pode_ler_gestao(auth.uid()));
CREATE POLICY avaliacoes_inserir_gestao ON public.avaliacoes_conhecimento FOR INSERT TO authenticated
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS "Eficácia visível para avaliação" ON public.inqueritos_eficacia;
DROP POLICY IF EXISTS "Eficácia pode ser registada nesta fase" ON public.inqueritos_eficacia;
CREATE POLICY eficacia_ler_gestao ON public.inqueritos_eficacia FOR SELECT TO authenticated
  USING (public.pode_ler_gestao(auth.uid()));
CREATE POLICY eficacia_inserir_gestao ON public.inqueritos_eficacia FOR INSERT TO authenticated
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS "Relatórios mensais visíveis para avaliação" ON public.relatorios_mensais;
DROP POLICY IF EXISTS "Relatórios mensais podem ser criados nesta fase" ON public.relatorios_mensais;
DROP POLICY IF EXISTS "Relatórios mensais podem ser corrigidos nesta fase" ON public.relatorios_mensais;
CREATE POLICY relatorios_ler_gestao ON public.relatorios_mensais FOR SELECT TO authenticated
  USING (public.pode_ler_gestao(auth.uid()));
CREATE POLICY relatorios_escrever_gestao ON public.relatorios_mensais FOR ALL TO authenticated
  USING (public.pode_gerir_programa(auth.uid()))
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS "Configurações editáveis nesta fase" ON public.configuracoes_programa;
DROP POLICY IF EXISTS "Configurações visíveis" ON public.configuracoes_programa;
CREATE POLICY configuracoes_ler_gestao ON public.configuracoes_programa FOR SELECT TO authenticated
  USING (public.pode_ler_gestao(auth.uid()));
CREATE POLICY configuracoes_escrever_gestao ON public.configuracoes_programa FOR ALL TO authenticated
  USING (public.pode_gerir_programa(auth.uid()))
  WITH CHECK (public.pode_gerir_programa(auth.uid()));

DROP POLICY IF EXISTS turmas_leitura_publica ON public.turmas;
CREATE POLICY turmas_ler_gestao ON public.turmas FOR SELECT TO authenticated
  USING (public.pode_ler_gestao(auth.uid()) OR public.e_equipa_formacao(auth.uid()));

DROP POLICY IF EXISTS sessoes_leitura_publica ON public.turma_sessoes;
CREATE POLICY sessoes_ler_gestao ON public.turma_sessoes FOR SELECT TO authenticated
  USING (public.pode_ler_gestao(auth.uid()) OR public.e_equipa_formacao(auth.uid()));

-- 5. Auditoria das mutações sensíveis -------------------------------------
-- Coluna de contexto: distingue acções feitas com sessão real das acções
-- feitas pelo servidor de confiança (service_role, auth.uid() nulo).
ALTER TABLE public.registo_auditoria ADD COLUMN IF NOT EXISTS contexto_actor text;

CREATE OR REPLACE FUNCTION public.auditar_alteracoes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _campos_sensiveis constant text[] := ARRAY['tipo_deficiencia'];
  -- Nunca guardar gabaritos, respostas nem explicações no registo.
  _campos_proibidos constant text[] := ARRAY['resposta','explicacao','conteudo','resposta_correcta','resposta_dada','token_pessoal','indicadores_token'];
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

  FOREACH _campo IN ARRAY _campos_proibidos LOOP
    _antigo := _antigo - _campo;
    _novo := _novo - _campo;
  END LOOP;

  _id := COALESCE(_novo ->> 'id', _antigo ->> 'id');

  INSERT INTO public.registo_auditoria(
    utilizador_id, accao, entidade, registo_id,
    valor_anterior, valor_novo, campos_sensiveis_alterados, endereco_ip, contexto_actor
  ) VALUES (
    auth.uid(),
    lower(TG_OP),
    TG_TABLE_NAME,
    _id,
    _antigo,
    _novo,
    NULLIF(_sensiveis, '{}'),
    public.endereco_ip_do_pedido(),
    CASE WHEN auth.uid() IS NULL THEN 'servidor_service_role' ELSE 'sessao_autenticada' END
  );

  RETURN COALESCE(NEW, OLD);
END $function$;

DROP TRIGGER IF EXISTS trg_auditar_banco_questoes ON public.banco_questoes;
CREATE TRIGGER trg_auditar_banco_questoes AFTER INSERT OR UPDATE OR DELETE ON public.banco_questoes
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

DROP TRIGGER IF EXISTS trg_auditar_exame_configuracoes ON public.exame_configuracoes;
CREATE TRIGGER trg_auditar_exame_configuracoes AFTER INSERT OR UPDATE OR DELETE ON public.exame_configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

DROP TRIGGER IF EXISTS trg_auditar_certificados ON public.certificados;
CREATE TRIGGER trg_auditar_certificados AFTER INSERT OR DELETE ON public.certificados
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

DROP TRIGGER IF EXISTS trg_auditar_certificados_curso ON public.certificados_curso;
CREATE TRIGGER trg_auditar_certificados_curso AFTER INSERT OR DELETE ON public.certificados_curso
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

DROP TRIGGER IF EXISTS trg_auditar_exame_tentativas ON public.exame_tentativas;
CREATE TRIGGER trg_auditar_exame_tentativas AFTER INSERT OR UPDATE OR DELETE ON public.exame_tentativas
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

DROP TRIGGER IF EXISTS trg_auditar_presenca_configuracoes ON public.presenca_configuracoes;
CREATE TRIGGER trg_auditar_presenca_configuracoes AFTER INSERT OR UPDATE OR DELETE ON public.presenca_configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

COMMENT ON COLUMN public.registo_auditoria.contexto_actor IS
  'Origem verificada da acção: sessao_autenticada (auth.uid presente) ou servidor_service_role (sem identidade de pessoa). Nunca vem do cliente.';
