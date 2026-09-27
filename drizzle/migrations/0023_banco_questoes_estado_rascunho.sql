-- Causa da falha do pacote IA: a regra só aceitava 'em_uso'/'retirada' e o
-- importador grava 'rascunho'. 'rascunho' fica fora do sorteio (que filtra
-- 'em_uso'), pelo que aceitar este estado não torna nenhuma questão utilizável.
ALTER TABLE public.banco_questoes
  DROP CONSTRAINT banco_questoes_estado_revisao_valido,
  ADD CONSTRAINT banco_questoes_estado_revisao_valido
  CHECK (estado_revisao IN ('rascunho', 'em_uso', 'retirada'));
COMMENT ON COLUMN public.banco_questoes.estado_revisao IS 'rascunho | em_uso | retirada. Rascunho = por rever, fora do sorteio. Retirada = fora do sorteio e não reactivável.';