-- Progresso de lições ligado à matrícula (turma_inscricoes), no servidor.
-- Aditiva: não altera nem apaga o progresso local anónimo nem a tabela
-- progresso_licoes já existente (que é do formando anónimo por token).

CREATE TABLE public.progresso_licoes_matricula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inscricao_id uuid NOT NULL REFERENCES public.turma_inscricoes(id) ON DELETE CASCADE,
  licao_id uuid NOT NULL REFERENCES public.licoes(id),
  concluida_em timestamptz NOT NULL DEFAULT now(),
  origem text NOT NULL DEFAULT 'formando',
  registado_por uuid,
  CONSTRAINT progresso_licoes_matricula_origem_valida
    CHECK (origem IN ('formando', 'importado_local')),
  CONSTRAINT progresso_licoes_matricula_unico UNIQUE (inscricao_id, licao_id)
);

COMMENT ON TABLE public.progresso_licoes_matricula IS
  'Conclusão de lições por matrícula. Nunca constitui presença, aprovação nem certificação.';

CREATE INDEX progresso_licoes_matricula_inscricao_idx
  ON public.progresso_licoes_matricula (inscricao_id);

GRANT SELECT, INSERT, DELETE ON public.progresso_licoes_matricula TO authenticated;
GRANT ALL ON public.progresso_licoes_matricula TO service_role;

ALTER TABLE public.progresso_licoes_matricula ENABLE ROW LEVEL SECURITY;

CREATE POLICY plm_select_proprio ON public.progresso_licoes_matricula
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.turma_inscricoes i
    WHERE i.id = progresso_licoes_matricula.inscricao_id
      AND i.perfil_id = auth.uid()
  ));

CREATE POLICY plm_insert_proprio ON public.progresso_licoes_matricula
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.turma_inscricoes i
    WHERE i.id = progresso_licoes_matricula.inscricao_id
      AND i.perfil_id = auth.uid()
  ));

CREATE POLICY plm_delete_proprio ON public.progresso_licoes_matricula
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.turma_inscricoes i
    WHERE i.id = progresso_licoes_matricula.inscricao_id
      AND i.perfil_id = auth.uid()
  ));

-- Leitura pela equipa de formação, segundo as atribuições já existentes.
CREATE POLICY plm_select_equipa ON public.progresso_licoes_matricula
  FOR SELECT TO authenticated
  USING (public.e_equipa_formacao(auth.uid()));

-- O formando passa a poder ler as suas próprias matrículas (faltava).
CREATE POLICY inscricoes_select_proprio ON public.turma_inscricoes
  FOR SELECT TO authenticated
  USING (perfil_id = auth.uid());

CREATE POLICY inscricoes_select_equipa ON public.turma_inscricoes
  FOR SELECT TO authenticated
  USING (public.e_equipa_formacao(auth.uid()));
