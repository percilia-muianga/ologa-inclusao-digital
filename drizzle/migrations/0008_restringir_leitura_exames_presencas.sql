CREATE OR REPLACE FUNCTION public.e_equipa_formacao(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.is_admin(_uid), false)
      OR COALESCE(public.e_admin_atdi(_uid), false)
      OR COALESCE(public.e_auditor_atdi(_uid), false)
      OR public.tem_papel(_uid, 'formador')
      OR public.tem_papel(_uid, 'supervisor_provincial')
      OR public.tem_papel(_uid, 'coordenador_nacional')
$$;

GRANT EXECUTE ON FUNCTION public.e_equipa_formacao(uuid) TO authenticated;

DROP POLICY IF EXISTS "Equipa autenticada gere o banco de questoes" ON public.banco_questoes;
CREATE POLICY "Banco de questoes visivel a equipa de formacao"
  ON public.banco_questoes FOR SELECT TO authenticated
  USING (public.e_equipa_formacao(auth.uid()));

DROP POLICY IF EXISTS "Tentativas visiveis a equipa" ON public.exame_tentativas;
CREATE POLICY "Tentativas visiveis a equipa de formacao"
  ON public.exame_tentativas FOR SELECT TO authenticated
  USING (public.e_equipa_formacao(auth.uid()));

DROP POLICY IF EXISTS "Composicao de tentativas visivel a equipa" ON public.exame_tentativa_questoes;
CREATE POLICY "Composicao de tentativas visivel a equipa de formacao"
  ON public.exame_tentativa_questoes FOR SELECT TO authenticated
  USING (public.e_equipa_formacao(auth.uid()));

DROP POLICY IF EXISTS "Certificados de curso visiveis a equipa" ON public.certificados_curso;
CREATE POLICY "Certificados de curso visiveis a equipa de formacao"
  ON public.certificados_curso FOR SELECT TO authenticated
  USING (public.e_equipa_formacao(auth.uid()));

DROP POLICY IF EXISTS "Presencas visiveis a quem tem sessao iniciada" ON public.presencas;
CREATE POLICY "Presencas visiveis a equipa de formacao"
  ON public.presencas FOR SELECT TO authenticated
  USING (public.e_equipa_formacao(auth.uid()));
