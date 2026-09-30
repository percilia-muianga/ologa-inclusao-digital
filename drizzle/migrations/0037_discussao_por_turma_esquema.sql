-- Discussão pedagógica por turma: dúvidas dos formandos, respostas do formador
-- responsável e moderação pela gestão autorizada. Sem eliminação: a moderação
-- oculta com motivo. Todas as alterações passam pelo registo de auditoria.

CREATE OR REPLACE FUNCTION public.discussao_papel(_uid uuid, _turma uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN _uid IS NULL THEN NULL
    WHEN public.pode_gerir_programa(_uid) THEN 'moderacao'
    WHEN EXISTS (SELECT 1 FROM public.turmas t WHERE t.id = _turma AND t.formador_principal_id = _uid) THEN 'formador'
    WHEN EXISTS (SELECT 1 FROM public.turma_inscricoes i WHERE i.turma_id = _turma AND i.perfil_id = _uid AND i.estado <> 'desistiu') THEN 'formando'
    ELSE NULL END
$$;
REVOKE EXECUTE ON FUNCTION public.discussao_papel(uuid, uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.discussao_papel(uuid, uuid) TO authenticated, service_role;

CREATE TABLE public.discussao_topicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.perfis(id) ON DELETE CASCADE,
  autor_nome text NOT NULL DEFAULT '',
  titulo text NOT NULL CHECK (length(trim(titulo)) BETWEEN 3 AND 200),
  mensagem text NOT NULL CHECK (length(trim(mensagem)) BETWEEN 5 AND 5000),
  estado text NOT NULL DEFAULT 'aberta' CHECK (estado IN ('aberta','respondida','resolvida')),
  oculto boolean NOT NULL DEFAULT false,
  moderacao_motivo text CHECK (moderacao_motivo IS NULL OR length(trim(moderacao_motivo)) BETWEEN 3 AND 500),
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX discussao_topicos_turma_idx ON public.discussao_topicos(turma_id, criado_em DESC);
GRANT SELECT, INSERT, UPDATE ON public.discussao_topicos TO authenticated;
GRANT ALL ON public.discussao_topicos TO service_role;
ALTER TABLE public.discussao_topicos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.discussao_respostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topico_id uuid NOT NULL REFERENCES public.discussao_topicos(id) ON DELETE CASCADE,
  turma_id uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.perfis(id) ON DELETE CASCADE,
  autor_nome text NOT NULL DEFAULT '',
  papel_autor text NOT NULL DEFAULT 'formando' CHECK (papel_autor IN ('formando','formador','moderacao')),
  mensagem text NOT NULL CHECK (length(trim(mensagem)) BETWEEN 2 AND 5000),
  oculto boolean NOT NULL DEFAULT false,
  moderacao_motivo text CHECK (moderacao_motivo IS NULL OR length(trim(moderacao_motivo)) BETWEEN 3 AND 500),
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX discussao_respostas_topico_idx ON public.discussao_respostas(topico_id, criado_em);
GRANT SELECT, INSERT, UPDATE ON public.discussao_respostas TO authenticated;
GRANT ALL ON public.discussao_respostas TO service_role;
ALTER TABLE public.discussao_respostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discussao_topicos_ler" ON public.discussao_topicos FOR SELECT TO authenticated
  USING (public.discussao_papel(auth.uid(), turma_id) IS NOT NULL
         AND (NOT oculto OR autor_id = auth.uid() OR public.discussao_papel(auth.uid(), turma_id) IN ('formador','moderacao')));
CREATE POLICY "discussao_topicos_criar" ON public.discussao_topicos FOR INSERT TO authenticated
  WITH CHECK (autor_id = auth.uid() AND public.discussao_papel(auth.uid(), turma_id) IS NOT NULL
              AND estado = 'aberta' AND NOT oculto AND moderacao_motivo IS NULL);
CREATE POLICY "discussao_topicos_actualizar" ON public.discussao_topicos FOR UPDATE TO authenticated
  USING (autor_id = auth.uid() OR public.discussao_papel(auth.uid(), turma_id) IN ('formador','moderacao'))
  WITH CHECK (public.discussao_papel(auth.uid(), turma_id) IS NOT NULL);

CREATE POLICY "discussao_respostas_ler" ON public.discussao_respostas FOR SELECT TO authenticated
  USING (public.discussao_papel(auth.uid(), turma_id) IS NOT NULL
         AND (NOT oculto OR autor_id = auth.uid() OR public.discussao_papel(auth.uid(), turma_id) IN ('formador','moderacao')));
CREATE POLICY "discussao_respostas_criar" ON public.discussao_respostas FOR INSERT TO authenticated
  WITH CHECK (autor_id = auth.uid() AND public.discussao_papel(auth.uid(), turma_id) IS NOT NULL
              AND NOT oculto AND moderacao_motivo IS NULL);
CREATE POLICY "discussao_respostas_moderar" ON public.discussao_respostas FOR UPDATE TO authenticated
  USING (public.discussao_papel(auth.uid(), turma_id) = 'moderacao')
  WITH CHECK (public.discussao_papel(auth.uid(), turma_id) = 'moderacao');

CREATE OR REPLACE FUNCTION public.discussao_topicos_regras()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_papel text := public.discussao_papel(auth.uid(), NEW.turma_id);
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.autor_nome := COALESCE((SELECT nome FROM public.perfis WHERE id = NEW.autor_id), '');
    NEW.criado_em := now(); NEW.actualizado_em := now();
    RETURN NEW;
  END IF;
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.turma_id <> OLD.turma_id OR NEW.autor_id <> OLD.autor_id OR NEW.autor_nome <> OLD.autor_nome
     OR NEW.titulo <> OLD.titulo OR NEW.mensagem <> OLD.mensagem OR NEW.criado_em <> OLD.criado_em THEN
    RAISE EXCEPTION 'DISCUSSAO_CAMPO_PROTEGIDO' USING ERRCODE = '42501';
  END IF;
  IF (NEW.oculto IS DISTINCT FROM OLD.oculto OR NEW.moderacao_motivo IS DISTINCT FROM OLD.moderacao_motivo)
     AND v_papel IS DISTINCT FROM 'moderacao' THEN
    RAISE EXCEPTION 'DISCUSSAO_SO_MODERACAO' USING ERRCODE = '42501';
  END IF;
  IF NEW.oculto AND NEW.moderacao_motivo IS NULL THEN
    RAISE EXCEPTION 'DISCUSSAO_MOTIVO_OBRIGATORIO' USING ERRCODE = '23514';
  END IF;
  IF NEW.estado IS DISTINCT FROM OLD.estado AND v_papel = 'formando' THEN
    IF OLD.autor_id <> auth.uid() OR NEW.estado NOT IN ('resolvida','aberta') THEN
      RAISE EXCEPTION 'DISCUSSAO_ESTADO_NAO_PERMITIDO' USING ERRCODE = '42501';
    END IF;
  END IF;
  NEW.actualizado_em := now();
  RETURN NEW;
END $$;
CREATE TRIGGER discussao_topicos_regras BEFORE INSERT OR UPDATE ON public.discussao_topicos
  FOR EACH ROW EXECUTE FUNCTION public.discussao_topicos_regras();

CREATE OR REPLACE FUNCTION public.discussao_respostas_regras()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_top public.discussao_topicos%ROWTYPE; v_papel text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT * INTO v_top FROM public.discussao_topicos WHERE id = NEW.topico_id FOR UPDATE;
    IF NOT FOUND OR v_top.turma_id <> NEW.turma_id THEN
      RAISE EXCEPTION 'DISCUSSAO_TOPICO_INVALIDO' USING ERRCODE = '42501';
    END IF;
    v_papel := public.discussao_papel(NEW.autor_id, NEW.turma_id);
    IF v_top.oculto AND v_papel IS DISTINCT FROM 'moderacao' THEN
      RAISE EXCEPTION 'DISCUSSAO_TOPICO_OCULTO' USING ERRCODE = '42501';
    END IF;
    NEW.papel_autor := COALESCE(v_papel, 'formando');
    NEW.autor_nome := COALESCE((SELECT nome FROM public.perfis WHERE id = NEW.autor_id), '');
    NEW.criado_em := now();
    IF NEW.papel_autor IN ('formador','moderacao') AND v_top.estado = 'aberta' THEN
      UPDATE public.discussao_topicos SET estado = 'respondida' WHERE id = v_top.id;
    ELSIF NEW.papel_autor = 'formando' AND v_top.estado <> 'aberta' AND NEW.autor_id = v_top.autor_id THEN
      UPDATE public.discussao_topicos SET estado = 'aberta' WHERE id = v_top.id;
    END IF;
    RETURN NEW;
  END IF;
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.topico_id <> OLD.topico_id OR NEW.turma_id <> OLD.turma_id OR NEW.autor_id <> OLD.autor_id
     OR NEW.autor_nome <> OLD.autor_nome OR NEW.papel_autor <> OLD.papel_autor
     OR NEW.mensagem <> OLD.mensagem OR NEW.criado_em <> OLD.criado_em THEN
    RAISE EXCEPTION 'DISCUSSAO_CAMPO_PROTEGIDO' USING ERRCODE = '42501';
  END IF;
  IF NEW.oculto AND NEW.moderacao_motivo IS NULL THEN
    RAISE EXCEPTION 'DISCUSSAO_MOTIVO_OBRIGATORIO' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER discussao_respostas_regras BEFORE INSERT OR UPDATE ON public.discussao_respostas
  FOR EACH ROW EXECUTE FUNCTION public.discussao_respostas_regras();

CREATE TRIGGER auditar_discussao_topicos AFTER INSERT OR UPDATE OR DELETE ON public.discussao_topicos
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();
CREATE TRIGGER auditar_discussao_respostas AFTER INSERT OR UPDATE OR DELETE ON public.discussao_respostas
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

CREATE OR REPLACE FUNCTION public.rpc_discussao_turmas()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH base AS (
    SELECT t.id, t.designacao, t.provincia, t.distrito, t.estado, c.titulo AS curso,
           public.discussao_papel(auth.uid(), t.id) AS papel
      FROM public.turmas t JOIN public.cursos c ON c.id = t.curso_id
     WHERE auth.uid() IS NOT NULL
       AND (public.pode_gerir_programa(auth.uid())
            OR t.formador_principal_id = auth.uid()
            OR EXISTS (SELECT 1 FROM public.turma_inscricoes i WHERE i.turma_id = t.id AND i.perfil_id = auth.uid() AND i.estado <> 'desistiu'))
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'turmaId', b.id, 'designacao', b.designacao, 'curso', b.curso, 'provincia', b.provincia,
    'distrito', b.distrito, 'estadoTurma', b.estado, 'papel', b.papel,
    'total', (SELECT count(*) FROM public.discussao_topicos d WHERE d.turma_id = b.id AND (NOT d.oculto OR b.papel <> 'formando')),
    'semResposta', (SELECT count(*) FROM public.discussao_topicos d WHERE d.turma_id = b.id AND d.estado = 'aberta' AND NOT d.oculto),
    'minhasPorResolver', (SELECT count(*) FROM public.discussao_topicos d WHERE d.turma_id = b.id AND d.autor_id = auth.uid() AND d.estado <> 'resolvida')
  ) ORDER BY b.curso, b.designacao), '[]'::jsonb) FROM base b
$$;
REVOKE EXECUTE ON FUNCTION public.rpc_discussao_turmas() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_discussao_turmas() TO authenticated;