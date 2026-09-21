-- Distinguir instrumentos de avaliação: exame final certificador vs pré/pós-teste.
CREATE TYPE public.instrumento_avaliacao AS ENUM ('exame_final', 'pre_pos_teste');

ALTER TABLE public.banco_questoes
  ADD COLUMN instrumento public.instrumento_avaliacao NOT NULL DEFAULT 'exame_final';

-- Objectivo de aprendizagem associado a cada questão (secção 10 do TdR).
ALTER TABLE public.banco_questoes
  ADD COLUMN objectivo_associado text;

-- Minutos de avaliação e orientação que não pertencem a nenhum módulo
-- (diagnóstico, revisão/pós-teste, orientação e exame final).
ALTER TABLE public.cursos
  ADD COLUMN minutos_avaliacao_orientacao integer NOT NULL DEFAULT 0;

-- Duração da lição em minutos, para somas verificáveis.
ALTER TABLE public.licoes
  ADD COLUMN duracao_minutos integer;

-- Conteúdo em estado de proposta pedagógica, por validar pela Ologa/ATDI.
ALTER TABLE public.licoes
  ADD COLUMN proposta_por_validar boolean NOT NULL DEFAULT false;