-- POR AUTORIZAR — NÃO APLICADA. Não é migração autoexecutável.
-- Duas regras de escrita (UPDATE) restritas a admin_ologa (perfis.papel, via
-- e_admin_geral_ologa) e ao curso 'redes-avancadas-seguranca-cibernetica'.
-- Mesmo padrão aprovado para Tecnologias Digitais do Governo (0026).
-- Não cria INSERT nem DELETE; não toca outros cursos; em curso_modulos só as
-- linhas deste curso (incluindo a linha que liga o transversal, para as
-- horas 120); a tabela modulos não é abrangida (o transversal global fica
-- intacto). Lições e descrições dos módulos usam as regras já existentes
-- licoes_update_admin / modulos_update_admin (is_admin = admin_ologa).
-- rpc_importar_redes só reconhece as regras se a condição contiver o slug;
-- sem elas falha fechada e nada grava.

CREATE POLICY "redes_admin_ologa_actualiza_ficha"
ON public.cursos
FOR UPDATE
TO authenticated
USING (
  slug = 'redes-avancadas-seguranca-cibernetica'
  AND public.e_admin_geral_ologa(auth.uid())
)
WITH CHECK (
  slug = 'redes-avancadas-seguranca-cibernetica'
  AND public.e_admin_geral_ologa(auth.uid())
);

CREATE POLICY "redes_admin_ologa_actualiza_modulos_do_curso"
ON public.curso_modulos
FOR UPDATE
TO authenticated
USING (
  curso_id = (SELECT c.id FROM public.cursos c WHERE c.slug = 'redes-avancadas-seguranca-cibernetica')
  AND public.e_admin_geral_ologa(auth.uid())
)
WITH CHECK (
  curso_id = (SELECT c.id FROM public.cursos c WHERE c.slug = 'redes-avancadas-seguranca-cibernetica')
  AND public.e_admin_geral_ologa(auth.uid())
);
