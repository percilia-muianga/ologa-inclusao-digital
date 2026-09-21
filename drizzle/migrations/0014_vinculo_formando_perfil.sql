-- Vínculo verificável entre o formando (percurso, certificados) e a conta
-- autenticada. Aditivo e anulável: nenhum registo existente é alterado.
ALTER TABLE public.formandos ADD COLUMN IF NOT EXISTS perfil_id uuid REFERENCES public.perfis(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_formandos_perfil ON public.formandos(perfil_id);

COMMENT ON COLUMN public.formandos.perfil_id IS
  'Conta autenticada titular deste percurso. Operações sensíveis por token só são aceites quando o titular da sessão coincide com esta coluna.';

CREATE POLICY formandos_ver_proprio ON public.formandos FOR SELECT TO authenticated
  USING (perfil_id = auth.uid());
