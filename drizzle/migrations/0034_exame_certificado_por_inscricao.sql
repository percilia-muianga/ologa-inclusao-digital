-- Liga tentativas de exame e certificados de curso à inscrição na turma.
ALTER TABLE public.exame_tentativas
  ADD COLUMN IF NOT EXISTS inscricao_id uuid REFERENCES public.turma_inscricoes(id);
ALTER TABLE public.certificados_curso
  ADD COLUMN IF NOT EXISTS inscricao_id uuid REFERENCES public.turma_inscricoes(id);

-- Associação de registos antigos só quando é inequívoca: a tentativa/certificado
-- já tem turma e o formando (pela conta) tem exactamente uma inscrição activa
-- nessa turma. Casos ambíguos ficam por associar (inscricao_id nulo).
UPDATE public.exame_tentativas t
   SET inscricao_id = (SELECT i.id FROM public.turma_inscricoes i JOIN public.formandos f ON f.perfil_id = i.perfil_id
                        WHERE f.id = t.formando_id AND i.turma_id = t.turma_id AND i.estado <> 'desistiu')
 WHERE t.inscricao_id IS NULL AND t.turma_id IS NOT NULL
   AND (SELECT count(*) FROM public.turma_inscricoes i JOIN public.formandos f ON f.perfil_id = i.perfil_id
         WHERE f.id = t.formando_id AND i.turma_id = t.turma_id AND i.estado <> 'desistiu') = 1;
UPDATE public.certificados_curso c
   SET inscricao_id = (SELECT i.id FROM public.turma_inscricoes i JOIN public.formandos f ON f.perfil_id = i.perfil_id
                        WHERE f.id = c.formando_id AND i.turma_id = c.turma_id AND i.estado <> 'desistiu')
 WHERE c.inscricao_id IS NULL AND c.turma_id IS NOT NULL
   AND (SELECT count(*) FROM public.turma_inscricoes i JOIN public.formandos f ON f.perfil_id = i.perfil_id
         WHERE f.id = c.formando_id AND i.turma_id = c.turma_id AND i.estado <> 'desistiu') = 1;

CREATE UNIQUE INDEX IF NOT EXISTS exame_tentativas_inscricao_numero_key
  ON public.exame_tentativas(inscricao_id, numero) WHERE inscricao_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS certificados_curso_inscricao_key
  ON public.certificados_curso(inscricao_id) WHERE inscricao_id IS NOT NULL;

-- Abertura de tentativa pela inscrição do próprio formando. Regras no servidor:
-- titular da inscrição, inscrição activa, exame configurado, banco activo com
-- o triplo, prazo após o fim da turma e número máximo de tentativas.
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
  SELECT count(*) INTO _feitas FROM public.exame_tentativas WHERE inscricao_id = _inscricao_id;
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

-- Emissão do certificado pela inscrição. Nota lida da melhor tentativa
-- submetida DESTA inscrição; assiduidade apurada no servidor. Idempotente:
-- se já existir certificado para a inscrição (ou formando+curso), devolve-o.
CREATE OR REPLACE FUNCTION public.rpc_certificado_curso_emitir_matricula(
  _actor uuid, _inscricao_id uuid, _codigo text, _assiduidade_pct numeric,
  _base base_assiduidade, _assiduidade_estrita_pct numeric, _assiduidade_ajustada_pct numeric)
RETURNS TABLE(cert_codigo text, cert_emitido_em timestamptz, cert_ja_existia boolean)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  _perfil uuid; _estado text; _turma uuid; _curso uuid; _fim date; _cfg record;
  _formando uuid; _tent uuid; _nota numeric; _nome text; _titulo text; _carga integer;
  _prov text; _desig text; _ini date; _cod text; _em timestamptz;
BEGIN
  PERFORM public.marcar_actor_confiavel(_actor);
  SELECT i.perfil_id, i.estado, i.turma_id, t.curso_id, t.data_fim, t.provincia, t.designacao, t.data_inicio
    INTO _perfil, _estado, _turma, _curso, _fim, _prov, _desig, _ini
    FROM public.turma_inscricoes i JOIN public.turmas t ON t.id = i.turma_id
   WHERE i.id = _inscricao_id
   FOR UPDATE OF i;
  IF _perfil IS NULL OR _perfil <> _actor THEN
    RAISE EXCEPTION 'VINCULO_NAO_VERIFICADO' USING ERRCODE = '42501';
  END IF;
  IF _estado = 'desistiu' THEN RAISE EXCEPTION 'INSCRICAO_INACTIVA' USING ERRCODE = '42501'; END IF;

  SELECT f.id, f.nome INTO _formando, _nome FROM public.formandos f
   WHERE f.perfil_id = _actor ORDER BY f.criado_em LIMIT 1;
  IF _formando IS NULL THEN RAISE EXCEPTION 'SEM_EXAME_SUBMETIDO' USING ERRCODE = '42501'; END IF;

  SELECT c.codigo_verificacao, c.emitido_em INTO _cod, _em FROM public.certificados_curso c
   WHERE c.inscricao_id = _inscricao_id OR (c.formando_id = _formando AND c.curso_id = _curso)
   LIMIT 1;
  IF _cod IS NOT NULL THEN RETURN QUERY SELECT _cod, _em, true; RETURN; END IF;

  SELECT * INTO _cfg FROM public.exame_configuracoes WHERE curso_id = _curso;
  IF NOT FOUND THEN RAISE EXCEPTION 'EXAME_NAO_CONFIGURADO' USING ERRCODE = '42501'; END IF;

  SELECT t.id, t.nota_pct INTO _tent, _nota FROM public.exame_tentativas t
   WHERE t.inscricao_id = _inscricao_id AND t.formando_id = _formando
     AND t.estado = 'submetida' AND t.nota_pct IS NOT NULL
   ORDER BY t.nota_pct DESC, t.submetido_em LIMIT 1;
  IF _tent IS NULL THEN RAISE EXCEPTION 'SEM_EXAME_SUBMETIDO' USING ERRCODE = '42501'; END IF;
  IF _nota < _cfg.nota_minima_pct THEN RAISE EXCEPTION 'NOTA_INSUFICIENTE' USING ERRCODE = '42501'; END IF;
  IF _assiduidade_pct IS NULL OR _assiduidade_pct < _cfg.assiduidade_minima_pct THEN
    RAISE EXCEPTION 'ASSIDUIDADE_INSUFICIENTE' USING ERRCODE = '42501';
  END IF;

  SELECT c.titulo, c.carga_horaria INTO _titulo, _carga FROM public.cursos c WHERE c.id = _curso;

  RETURN QUERY
  WITH ins AS (
    INSERT INTO public.certificados_curso(
      formando_id, curso_id, turma_id, inscricao_id, tentativa_id, codigo_verificacao,
      nome_formando, titulo_curso, carga_horaria, provincia, turma_designacao,
      data_inicio, data_fim, nota_final_pct, assiduidade_pct, base_assiduidade,
      assiduidade_estrita_pct, assiduidade_ajustada_pct)
    VALUES (
      _formando, _curso, _turma, _inscricao_id, _tent, _codigo,
      _nome, COALESCE(_titulo, ''), COALESCE(_carga, 0), _prov, _desig,
      _ini, _fim, _nota, _assiduidade_pct, _base,
      _assiduidade_estrita_pct, _assiduidade_ajustada_pct)
    RETURNING codigo_verificacao, emitido_em)
  SELECT ins.codigo_verificacao, ins.emitido_em, false FROM ins;
END $$;

REVOKE ALL ON FUNCTION public.rpc_exame_tentativa_criar_matricula(uuid, uuid, timestamptz, integer, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rpc_certificado_curso_emitir_matricula(uuid, uuid, text, numeric, base_assiduidade, numeric, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_exame_tentativa_criar_matricula(uuid, uuid, timestamptz, integer, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_certificado_curso_emitir_matricula(uuid, uuid, text, numeric, base_assiduidade, numeric, numeric) TO service_role;

COMMENT ON FUNCTION public.rpc_exame_tentativa_criar(uuid, uuid, uuid, uuid, integer, timestamptz, integer, jsonb)
  IS 'DEPRECATED: substituída por rpc_exame_tentativa_criar_matricula (ligação à inscrição).';
COMMENT ON FUNCTION public.rpc_certificado_curso_emitir(uuid, uuid, uuid, uuid, uuid, text, numeric, numeric, base_assiduidade, numeric, numeric)
  IS 'DEPRECATED: substituída por rpc_certificado_curso_emitir_matricula (ligação à inscrição).';

-- Versões anteriores recuperáveis das fichas de curso.
CREATE TABLE IF NOT EXISTS public.cursos_fichas_versoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL REFERENCES public.cursos(id),
  objectivos text, publico_alvo text, pre_requisitos text, materiais text,
  carga_horaria integer NOT NULL,
  motivo text NOT NULL,
  guardado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cursos_fichas_versoes TO authenticated;
GRANT ALL ON public.cursos_fichas_versoes TO service_role;
ALTER TABLE public.cursos_fichas_versoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gestão lê versões das fichas" ON public.cursos_fichas_versoes
  FOR SELECT TO authenticated USING (public.pode_ler_gestao(auth.uid()));
INSERT INTO public.cursos_fichas_versoes(curso_id, objectivos, publico_alvo, pre_requisitos, materiais, carga_horaria, motivo)
SELECT id, objectivos, publico_alvo, pre_requisitos, materiais, carga_horaria,
       'Cópia antes da retirada de notas internas (30/09/2026)'
  FROM public.cursos;