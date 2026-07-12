
REVOKE ALL ON public.instituicoes FROM anon;
REVOKE ALL ON public.perfis FROM anon;
REVOKE ALL ON public.turmas FROM anon;
REVOKE ALL ON public.turma_formandos FROM anon;
REVOKE ALL ON public.modulos FROM anon;
REVOKE ALL ON public.licoes FROM anon;
REVOKE ALL ON public.quiz_perguntas FROM anon;
REVOKE ALL ON public.progresso_licoes FROM anon;
REVOKE ALL ON public.progresso_quizzes FROM anon;
REVOKE ALL ON public.certificados FROM anon;
-- Impedir que novas tabelas criadas em `public` recebam privilégios para `anon` por defeito
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
