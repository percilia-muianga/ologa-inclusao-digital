-- APLICADA em 27-09-2026 como drizzle/migrations/0026_politicas_tecnologias_governo.sql, após autorização expressa.
-- Duas regras de escrita (UPDATE) restritas a admin_ologa (perfis.papel, via
-- e_admin_geral_ologa) e ao curso 'tecnologias-digitais-governo'.
-- Não cria INSERT/DELETE; não toca outros cursos nem o módulo transversal global
-- (a tabela modulos não é abrangida; em curso_modulos só as linhas deste curso).
-- A importação (rpc_importar_tecnologias_governo) só reconhece as regras se o
-- texto da condição contiver o slug; sem elas falha fechada e nada grava.

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
