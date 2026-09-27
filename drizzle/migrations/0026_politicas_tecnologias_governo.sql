CREATE POLICY "tdg_admin_ologa_actualiza_ficha"
ON public.cursos
FOR UPDATE
TO authenticated
USING (
  slug = 'tecnologias-digitais-governo'
  AND public.e_admin_geral_ologa(auth.uid())
)
WITH CHECK (
  slug = 'tecnologias-digitais-governo'
  AND public.e_admin_geral_ologa(auth.uid())
);

CREATE POLICY "tdg_admin_ologa_actualiza_modulos_do_curso"
ON public.curso_modulos
FOR UPDATE
TO authenticated
USING (
  curso_id = (SELECT c.id FROM public.cursos c WHERE c.slug = 'tecnologias-digitais-governo')
  AND public.e_admin_geral_ologa(auth.uid())
)
WITH CHECK (
  curso_id = (SELECT c.id FROM public.cursos c WHERE c.slug = 'tecnologias-digitais-governo')
  AND public.e_admin_geral_ologa(auth.uid())
);