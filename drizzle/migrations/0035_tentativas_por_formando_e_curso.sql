-- O limite de tentativas conta-se por pessoa e por curso (todas as inscrições
-- da mesma conta nesse curso), para que mudar de turma não dê tentativas extra.
-- A conta é bloqueada durante a decisão para pedidos simultâneos.
CREATE OR REPLACE FUNCTION public.rpc_exame_tentativa_criar_matricula(
  _actor uuid, _inscricao_id uuid, _limite_em timestamptz, _total integer, _questoes jsonb)
RETURNS TABLE(tent_id uuid, tent_retomada boolean)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  _perfil uuid; _estado text; _turma uuid; _curso uuid; _fim date;
  _cfg record; _activas integer; _feitas integer; _formando uuid; _nome text; _nova uuid; _emcurso uuid;
BEGIN
  PERFORM public.marcar_actor_confiavel(_actor);
  PERFORM 1 FROM public.perfis WHERE id = _actor FOR UPDATE;
  SELECT i.perfil_id, i.estado, i.turma_id, t.curso_id, t.data_fim
    INTO _perfil, _estado, _turma, _curso, _fim
    FROM public.turma_inscricoes i JOIN public.turmas t ON t.id = i.turma_id
   WHERE i.id = _inscricao_id
   FOR UPDATE OF i;
  IF _perfil IS NULL OR _perfil <> _actor THEN
    RAISE EXCEPTION 'VINCULO_NAO_VERIFICADO' USING ERRCODE = '42501';
  END IF;
  IF _estado = 'desistiu' THEN RAISE EXCEPTION 'INSCRICAO_INACTIVA' USING ERRCODE = '42501'; END IF;

  SELECT * INTO _cfg FROM public.exame_configuracoes WHERE curso_id = _curso;
  IF NOT FOUND THEN RAISE EXCEPTION 'EXAME_NAO_CONFIGURADO' USING ERRCODE = '42501'; END IF;

  SELECT id INTO _emcurso FROM public.exame_tentativas
   WHERE inscricao_id = _inscricao_id AND estado = 'em_curso' AND limite_em > now()
   ORDER BY numero DESC LIMIT 1;
  IF _emcurso IS NOT NULL THEN
    RETURN QUERY SELECT _emcurso, true; RETURN;
  END IF;

  IF _fim IS NOT NULL AND now() > (_fim + make_interval(days => _cfg.prazo_dias))::timestamptz THEN
    RAISE EXCEPTION 'PRAZO_EXPIRADO' USING ERRCODE = '42501';
  END IF;
  SELECT count(*) INTO _feitas
    FROM public.exame_tentativas x JOIN public.turma_inscricoes i ON i.id = x.inscricao_id
   WHERE i.perfil_id = _actor AND x.curso_id = _curso;
  IF _feitas >= _cfg.tentativas_max THEN
    RAISE EXCEPTION 'TENTATIVAS_ESGOTADAS' USING ERRCODE = '42501';
  END IF;
  SELECT count(*) INTO _activas FROM public.banco_questoes
   WHERE curso_id = _curso AND activa AND instrumento = 'exame_final' AND estado_revisao = 'em_uso';
  IF _activas < _cfg.numero_questoes * 3 THEN
    RAISE EXCEPTION 'BANCO_INSUFICIENTE' USING ERRCODE = '42501';
  END IF;
  IF _total IS NULL OR _total <> _cfg.numero_questoes OR jsonb_array_length(_questoes) <> _total THEN
    RAISE EXCEPTION 'COMPOSICAO_INVALIDA' USING ERRCODE = '42501';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_to_recordset(_questoes) AS q(questao_id uuid)
              LEFT JOIN public.banco_questoes b ON b.id = q.questao_id
               AND b.curso_id = _curso AND b.activa AND b.instrumento = 'exame_final' AND b.estado_revisao = 'em_uso'
             WHERE b.id IS NULL) THEN
    RAISE EXCEPTION 'COMPOSICAO_INVALIDA' USING ERRCODE = '42501';
  END IF;

  SELECT f.id INTO _formando FROM public.formandos f WHERE f.perfil_id = _actor ORDER BY f.criado_em LIMIT 1;
  IF _formando IS NULL THEN
    SELECT btrim(p.nome) INTO _nome FROM public.perfis p WHERE p.id = _actor;
    IF _nome IS NULL OR _nome = '' THEN RAISE EXCEPTION 'PERFIL_INCOMPLETO' USING ERRCODE = '42501'; END IF;
    INSERT INTO public.formandos(nome, perfil_id) VALUES (_nome, _actor) RETURNING id INTO _formando;
  END IF;

  INSERT INTO public.exame_tentativas(formando_id, curso_id, turma_id, inscricao_id, numero, limite_em, total)
  VALUES (_formando, _curso, _turma, _inscricao_id, _feitas + 1, _limite_em, _total)
  RETURNING id INTO _nova;

  INSERT INTO public.exame_tentativa_questoes(
    tentativa_id, questao_id, ordem, modulo_id, tipologia, dificuldade,
    enunciado, apresentacao, resposta_correcta, explicacao)
  SELECT _nova, q.questao_id, q.ordem, q.modulo_id,
         q.tipologia::tipologia_questao, q.dificuldade::dificuldade_questao,
         q.enunciado, q.apresentacao, q.resposta_correcta, q.explicacao
    FROM jsonb_to_recordset(_questoes) AS q(
      questao_id uuid, ordem integer, modulo_id uuid, tipologia text,
      dificuldade text, enunciado text, apresentacao jsonb,
      resposta_correcta jsonb, explicacao text);

  RETURN QUERY SELECT _nova, false;
END $$;

REVOKE ALL ON FUNCTION public.rpc_exame_tentativa_criar_matricula(uuid, uuid, timestamptz, integer, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_exame_tentativa_criar_matricula(uuid, uuid, timestamptz, integer, jsonb) TO service_role;