-- Versionamento do banco de questões e metadado explícito de cenário.
-- Nada é apagado: as questões retiradas continuam na base, com os seus
-- gabaritos e explicações, e as tentativas históricas ficam intactas.

ALTER TABLE public.banco_questoes
  ADD COLUMN IF NOT EXISTS versao text NOT NULL DEFAULT 'v1',
  ADD COLUMN IF NOT EXISTS estado_revisao text NOT NULL DEFAULT 'em_uso',
  ADD COLUMN IF NOT EXISTS retirada_em timestamptz,
  ADD COLUMN IF NOT EXISTS retirada_motivo text,
  ADD COLUMN IF NOT EXISTS cenario boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.banco_questoes.versao IS 'Versão do banco a que a questão pertence (ex.: v1, v2).';
COMMENT ON COLUMN public.banco_questoes.estado_revisao IS 'em_uso | retirada. Retirada = fora do sorteio, do rácio de prontidão e impedida de activação.';
COMMENT ON COLUMN public.banco_questoes.cenario IS 'Classificação pedagógica: questão de caso/cenário, mesmo usando escolha múltipla como formato de resposta.';

ALTER TABLE public.banco_questoes
  DROP CONSTRAINT IF EXISTS banco_questoes_estado_revisao_valido;
ALTER TABLE public.banco_questoes
  ADD CONSTRAINT banco_questoes_estado_revisao_valido
  CHECK (estado_revisao IN ('em_uso', 'retirada'));

-- Metadado de cenário a partir do que já estava gravado no conteúdo.
UPDATE public.banco_questoes
   SET cenario = true
 WHERE cenario = false
   AND (conteudo ->> 'cenario') = 'true';

CREATE INDEX IF NOT EXISTS banco_questoes_estado_revisao_idx
  ON public.banco_questoes (curso_id, instrumento, estado_revisao, activa);

-- Uma questão retirada nunca pode ficar activa, seja qual for o caminho.
CREATE OR REPLACE FUNCTION public.banco_questoes_bloquear_activacao_retirada()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.estado_revisao = 'retirada' AND NEW.activa THEN
    RAISE EXCEPTION 'Questão retirada não pode ser activada. Crie uma nova versão.';
  END IF;
  IF NEW.estado_revisao = 'retirada' AND NEW.retirada_em IS NULL THEN
    NEW.retirada_em := now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_banco_questoes_bloquear_activacao_retirada ON public.banco_questoes;
CREATE TRIGGER trg_banco_questoes_bloquear_activacao_retirada
  BEFORE INSERT OR UPDATE ON public.banco_questoes
  FOR EACH ROW EXECUTE FUNCTION public.banco_questoes_bloquear_activacao_retirada();