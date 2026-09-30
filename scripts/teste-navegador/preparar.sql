-- Dados de ensaio para o AMBIENTE SEPARADO (rascunho/remix). Nunca na base partilhada.
-- Guarda: recusa se existir qualquer turma não marcada como demonstração.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.turmas WHERE dados_de_demonstracao = false) THEN
    RAISE EXCEPTION 'Recusado: esta base já tem turmas reais. Use o ambiente separado.';
  END IF;
END $$;

-- Executar como a conta de gestão (auth.uid() tem de existir: gatilho de actor).
INSERT INTO public.turmas (curso_id, designacao, provincia, distrito, modalidade, estado, dados_de_demonstracao)
SELECT id, 'Ensaio — inscrições abertas', 'Maputo Cidade', 'KaMpfumo', 'presencial', 'inscricoes_abertas', true
  FROM public.cursos ORDER BY ordem LIMIT 1;
INSERT INTO public.turmas (curso_id, designacao, provincia, distrito, modalidade, estado, dados_de_demonstracao)
SELECT id, 'Ensaio — planeada', 'Maputo Cidade', 'KaMpfumo', 'presencial', 'planeada', true
  FROM public.cursos ORDER BY ordem LIMIT 1;

SELECT designacao, codigo_inscricao, estado FROM public.turmas WHERE dados_de_demonstracao;
