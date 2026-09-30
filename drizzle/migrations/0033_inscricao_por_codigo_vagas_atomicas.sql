-- Inscrição por código e limite de vagas atómico.
-- 1) Sem inscrições duplicadas da mesma conta (ou do mesmo email) na mesma turma.
CREATE UNIQUE INDEX IF NOT EXISTS turma_inscricoes_turma_perfil_uniq
  ON public.turma_inscricoes (turma_id, perfil_id) WHERE perfil_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS turma_inscricoes_turma_email_uniq
  ON public.turma_inscricoes (turma_id, lower(email)) WHERE email IS NOT NULL;

-- 2) Limite de vagas verificado dentro da própria escrita, com a turma
--    bloqueada: pedidos simultâneos ficam em fila e só entram enquanto houver
--    vaga. Abrange qualquer caminho (formando, gestão, reactivação, mudança de turma).
CREATE OR REPLACE FUNCTION public.inscricoes_controlar_vagas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limite integer;
  v_activos integer;
BEGIN
  IF NEW.estado = 'desistiu' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.estado <> 'desistiu' AND OLD.turma_id = NEW.turma_id THEN
    RETURN NEW; -- já ocupava vaga nesta turma
  END IF;

  SELECT limite_formandos INTO v_limite
    FROM public.turmas WHERE id = NEW.turma_id FOR UPDATE;
  IF v_limite IS NULL THEN
    RAISE EXCEPTION 'TURMA_INEXISTENTE' USING ERRCODE = 'P0001';
  END IF;

  SELECT count(*) INTO v_activos
    FROM public.turma_inscricoes
   WHERE turma_id = NEW.turma_id AND estado <> 'desistiu' AND id <> NEW.id;
  IF v_activos >= v_limite THEN
    RAISE EXCEPTION 'TURMA_CHEIA' USING ERRCODE = 'P0001',
      DETAIL = format('%s de %s vagas ocupadas', v_activos, v_limite);
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.inscricoes_controlar_vagas() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_inscricoes_controlar_vagas ON public.turma_inscricoes;
CREATE TRIGGER trg_inscricoes_controlar_vagas
  BEFORE INSERT OR UPDATE OF estado, turma_id ON public.turma_inscricoes
  FOR EACH ROW EXECUTE FUNCTION public.inscricoes_controlar_vagas();

-- 3) Consulta da turma pelo código: devolve apenas dados públicos da turma e o
--    número de vagas livres; nunca nomes nem contactos de outros formandos.
CREATE OR REPLACE FUNCTION public.rpc_turma_por_codigo(_codigo text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  t record;
  v_activos integer;
  v_minha text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'SEM_SESSAO' USING ERRCODE = '42501';
  END IF;
  SELECT tu.id, tu.designacao, tu.codigo_inscricao, tu.provincia, tu.distrito,
         tu.local_formacao, tu.modalidade, tu.estado, tu.data_inicio, tu.data_fim,
         tu.limite_formandos, c.titulo AS curso_titulo, c.slug AS curso_slug
    INTO t
    FROM public.turmas tu JOIN public.cursos c ON c.id = tu.curso_id
   WHERE replace(tu.codigo_inscricao,'-','') = replace(upper(btrim(_codigo)),'-','');
  IF NOT FOUND THEN
    RETURN jsonb_build_object('resultado', 'codigo_invalido');
  END IF;
  SELECT count(*) INTO v_activos FROM public.turma_inscricoes
   WHERE turma_id = t.id AND estado <> 'desistiu';
  SELECT estado INTO v_minha FROM public.turma_inscricoes
   WHERE turma_id = t.id AND perfil_id = v_uid;
  RETURN jsonb_build_object(
    'resultado', 'encontrada',
    'turma', jsonb_build_object(
      'id', t.id, 'designacao', t.designacao, 'codigo', t.codigo_inscricao,
      'provincia', t.provincia, 'distrito', t.distrito, 'local', t.local_formacao,
      'modalidade', t.modalidade, 'estado', t.estado,
      'dataInicio', t.data_inicio, 'dataFim', t.data_fim,
      'cursoTitulo', t.curso_titulo, 'cursoSlug', t.curso_slug,
      'vagasLivres', greatest(t.limite_formandos - v_activos, 0)),
    'minhaInscricao', v_minha);
END $$;
REVOKE ALL ON FUNCTION public.rpc_turma_por_codigo(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_turma_por_codigo(text) TO authenticated;

-- 4) Inscrição do próprio formando. A identidade vem SEMPRE de auth.uid();
--    não há parâmetro de pessoa. Nome e email vêm do perfil da conta.
CREATE OR REPLACE FUNCTION public.rpc_inscrever_por_codigo(_codigo text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  t record;
  p record;
  v_existente record;
  v_tem boolean;
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'SEM_SESSAO' USING ERRCODE = '42501';
  END IF;
  SELECT id, nome, email INTO p FROM public.perfis WHERE id = v_uid;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('resultado', 'sem_perfil');
  END IF;

  -- Bloqueia a turma: estado e vagas decididos em fila com outros pedidos.
  SELECT id, estado, curso_id INTO t FROM public.turmas
   WHERE replace(codigo_inscricao,'-','') = replace(upper(btrim(_codigo)),'-','') FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('resultado', 'codigo_invalido');
  END IF;

  SELECT id, estado INTO v_existente FROM public.turma_inscricoes
   WHERE turma_id = t.id AND perfil_id = v_uid;
  v_tem := FOUND;
  IF v_tem AND v_existente.estado <> 'desistiu' THEN
    RETURN jsonb_build_object('resultado', 'ja_inscrito', 'inscricaoId', v_existente.id, 'turmaId', t.id);
  END IF;

  IF t.estado <> 'inscricoes_abertas' THEN
    RETURN jsonb_build_object('resultado', 'inscricoes_fechadas', 'estadoTurma', t.estado);
  END IF;

  BEGIN
    IF v_tem THEN
      UPDATE public.turma_inscricoes SET estado = 'inscrito'
       WHERE id = v_existente.id RETURNING id INTO v_id;
    ELSE
      INSERT INTO public.turma_inscricoes (turma_id, perfil_id, nome, email)
      VALUES (t.id, v_uid, p.nome, NULLIF(p.email, ''))
      RETURNING id INTO v_id;
    END IF;
  EXCEPTION
    WHEN raise_exception THEN
      IF SQLERRM = 'TURMA_CHEIA' THEN
        RETURN jsonb_build_object('resultado', 'turma_cheia');
      END IF;
      RAISE;
    WHEN unique_violation THEN
      RETURN jsonb_build_object('resultado', 'ja_inscrito', 'turmaId', t.id);
  END;

  RETURN jsonb_build_object('resultado', 'inscrito', 'inscricaoId', v_id, 'turmaId', t.id);
END $$;
REVOKE ALL ON FUNCTION public.rpc_inscrever_por_codigo(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_inscrever_por_codigo(text) TO authenticated;
