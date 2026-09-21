-- Fase 4 — Marcação de presenças, sessões virtuais e assiduidade.
-- Nenhuma marcação é apagada: as marcações somam-se e os conflitos ficam
-- assinalados para revisão manual, como na folha de registo dos workshops.

CREATE TYPE public.estado_presenca AS ENUM ('presente', 'ausente', 'justificado');
CREATE TYPE public.origem_presenca AS ENUM ('manual', 'calculada', 'correccao');

CREATE TABLE public.presencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id UUID NOT NULL REFERENCES public.turma_sessoes(id),
  turma_id UUID NOT NULL REFERENCES public.turmas(id),
  inscricao_id UUID NOT NULL REFERENCES public.turma_inscricoes(id),
  nome_formando TEXT NOT NULL,
  estado public.estado_presenca NOT NULL,
  motivo TEXT,
  origem public.origem_presenca NOT NULL DEFAULT 'manual',
  origem_offline BOOLEAN NOT NULL DEFAULT false,
  aparelho TEXT,
  minutos_permanencia INTEGER,
  progresso_pct INTEGER,
  justificacao_correccao TEXT,
  marcado_por UUID,
  marcado_por_nome TEXT,
  conflito BOOLEAN NOT NULL DEFAULT false,
  dados_de_demonstracao BOOLEAN NOT NULL DEFAULT false,
  registado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX presencas_sessao_idx ON public.presencas (sessao_id);
CREATE INDEX presencas_turma_idx ON public.presencas (turma_id);
CREATE INDEX presencas_inscricao_idx ON public.presencas (inscricao_id);

GRANT SELECT, INSERT ON public.presencas TO authenticated;
GRANT ALL ON public.presencas TO service_role;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Presencas visiveis a quem tem sessao iniciada"
  ON public.presencas FOR SELECT TO authenticated USING (true);

-- Configuração das presenças em sessões virtuais, por curso.
CREATE TABLE public.presenca_configuracoes (
  curso_id UUID PRIMARY KEY REFERENCES public.cursos(id),
  limiar_permanencia_pct INTEGER NOT NULL DEFAULT 75,
  limiar_progresso_pct INTEGER NOT NULL DEFAULT 75,
  actualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.presenca_configuracoes TO authenticated;
GRANT ALL ON public.presenca_configuracoes TO service_role;
ALTER TABLE public.presenca_configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Configuracao de presencas legivel"
  ON public.presenca_configuracoes FOR SELECT TO authenticated USING (true);

-- Conflito: a mesma sessão marcada para o mesmo formando em dois aparelhos,
-- com estados diferentes. Guardam-se as duas e assinalam-se ambas.
CREATE OR REPLACE FUNCTION public.presencas_marcar_conflito()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.origem = 'correccao' THEN
    RETURN NEW;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.presencas p
    WHERE p.sessao_id = NEW.sessao_id
      AND p.inscricao_id = NEW.inscricao_id
      AND p.estado IS DISTINCT FROM NEW.estado
      AND p.origem <> 'correccao'
  ) THEN
    NEW.conflito := true;
    UPDATE public.presencas p
      SET conflito = true
      WHERE p.sessao_id = NEW.sessao_id
        AND p.inscricao_id = NEW.inscricao_id
        AND p.origem <> 'correccao';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER presencas_conflito
  BEFORE INSERT ON public.presencas
  FOR EACH ROW EXECUTE FUNCTION public.presencas_marcar_conflito();

CREATE TRIGGER presencas_auditoria
  AFTER INSERT OR UPDATE ON public.presencas
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();
