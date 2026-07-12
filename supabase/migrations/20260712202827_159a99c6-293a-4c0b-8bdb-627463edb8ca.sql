
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.quiz_perguntas FROM authenticated;
GRANT SELECT (id, modulo_id, pergunta, opcoes) ON public.quiz_perguntas TO authenticated;
