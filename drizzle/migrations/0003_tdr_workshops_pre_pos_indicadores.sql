
-- Correcções ao Termo de Referência: locais de formação, distritos, workshops,
-- pré/pós-teste, satisfação, eficácia, relatórios mensais e rácio de equipamento.

-- 1. Locais de formação (11 capitais provinciais do TdR)
CREATE TABLE public.locais_formacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem integer NOT NULL,
  provincia text NOT NULL UNIQUE,
  local text NOT NULL
);
GRANT SELECT ON public.locais_formacao TO anon, authenticated;
GRANT ALL ON public.locais_formacao TO service_role;
ALTER TABLE public.locais_formacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locais de formação são públicos" ON public.locais_formacao FOR SELECT USING (true);

-- 2. Distritos do TdR (77 distritos, agrupados por província)
CREATE TABLE public.distritos_tdr (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provincia text NOT NULL,
  ordem_provincia integer NOT NULL,
  ordem integer NOT NULL,
  nome text NOT NULL,
  UNIQUE (provincia, nome)
);
GRANT SELECT ON public.distritos_tdr TO anon, authenticated;
GRANT ALL ON public.distritos_tdr TO service_role;
ALTER TABLE public.distritos_tdr ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Distritos do TdR são públicos" ON public.distritos_tdr FOR SELECT USING (true);

-- 3. Workshops (distintos das turmas: sem certificação nem regra de assiduidade)
CREATE TYPE public.tipo_workshop AS ENUM ('provincial', 'distrital');
CREATE TYPE public.estado_workshop AS ENUM ('planeado', 'confirmado', 'realizado', 'cancelado');

CREATE TABLE public.workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo public.tipo_workshop NOT NULL,
  provincia text NOT NULL,
  distrito text,
  local text,
  data date,
  duracao_horas numeric(4,1) NOT NULL DEFAULT 6,
  facilitador_nome text,
  participantes_previstos integer NOT NULL DEFAULT 0,
  participantes_efectivos integer NOT NULL DEFAULT 0,
  estado public.estado_workshop NOT NULL DEFAULT 'planeado',
  observacoes text,
  dados_de_demonstracao boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_workshops_provincia ON public.workshops (provincia);
CREATE INDEX idx_workshops_tipo ON public.workshops (tipo);
GRANT SELECT, INSERT, UPDATE ON public.workshops TO anon, authenticated;
GRANT ALL ON public.workshops TO service_role;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workshops visíveis para avaliação" ON public.workshops FOR SELECT USING (true);
CREATE POLICY "Workshops podem ser criados nesta fase" ON public.workshops FOR INSERT WITH CHECK (true);
CREATE POLICY "Workshops podem ser actualizados nesta fase" ON public.workshops FOR UPDATE USING (true) WITH CHECK (true);

-- 4. Participantes de workshop (registo leve, sem certificação)
CREATE TABLE public.workshop_participantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid NOT NULL REFERENCES public.workshops(id),
  nome text NOT NULL,
  entidade text,
  provincia text,
  distrito text,
  genero public.genero_utilizador,
  contacto text,
  origem_offline boolean NOT NULL DEFAULT false,
  duplicado_provavel boolean NOT NULL DEFAULT false,
  dados_de_demonstracao boolean NOT NULL DEFAULT false,
  registado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_workshop_participantes_workshop ON public.workshop_participantes (workshop_id);
GRANT SELECT, INSERT, UPDATE ON public.workshop_participantes TO anon, authenticated;
GRANT ALL ON public.workshop_participantes TO service_role;
ALTER TABLE public.workshop_participantes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participantes visíveis para avaliação" ON public.workshop_participantes FOR SELECT USING (true);
CREATE POLICY "Participantes podem ser registados nesta fase" ON public.workshop_participantes FOR INSERT WITH CHECK (true);
CREATE POLICY "Participantes podem ser corrigidos nesta fase" ON public.workshop_participantes FOR UPDATE USING (true) WITH CHECK (true);

-- Nunca apagar registos: marcar duplicados prováveis (mesmo nome e contacto na mesma sessão)
CREATE OR REPLACE FUNCTION public.workshop_marcar_duplicado()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.workshop_participantes p
    WHERE p.workshop_id = NEW.workshop_id
      AND p.id <> NEW.id
      AND lower(btrim(p.nome)) = lower(btrim(NEW.nome))
      AND COALESCE(btrim(p.contacto), '') = COALESCE(btrim(NEW.contacto), '')
  ) THEN
    NEW.duplicado_provavel := true;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_workshop_marcar_duplicado
BEFORE INSERT ON public.workshop_participantes
FOR EACH ROW EXECUTE FUNCTION public.workshop_marcar_duplicado();

-- 5. Pré-teste e pós-teste (distintos do exame final de certificação)
CREATE TYPE public.momento_avaliacao AS ENUM ('pre', 'pos');

CREATE TABLE public.avaliacoes_conhecimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  momento public.momento_avaliacao NOT NULL,
  curso_id uuid REFERENCES public.cursos(id),
  turma_id uuid REFERENCES public.turmas(id),
  workshop_id uuid REFERENCES public.workshops(id),
  formando_id uuid REFERENCES public.formandos(id),
  participante_id uuid REFERENCES public.workshop_participantes(id),
  pontuacao integer NOT NULL,
  total integer NOT NULL,
  provincia text,
  distrito text,
  dados_de_demonstracao boolean NOT NULL DEFAULT false,
  realizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_avaliacoes_curso ON public.avaliacoes_conhecimento (curso_id);
CREATE INDEX idx_avaliacoes_workshop ON public.avaliacoes_conhecimento (workshop_id);
GRANT SELECT, INSERT ON public.avaliacoes_conhecimento TO anon, authenticated;
GRANT ALL ON public.avaliacoes_conhecimento TO service_role;
ALTER TABLE public.avaliacoes_conhecimento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Avaliações visíveis para avaliação" ON public.avaliacoes_conhecimento FOR SELECT USING (true);
CREATE POLICY "Avaliações podem ser registadas nesta fase" ON public.avaliacoes_conhecimento FOR INSERT WITH CHECK (true);

-- Banco de perguntas por tema de workshop
CREATE TABLE public.workshop_perguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tema text NOT NULL,
  pergunta text NOT NULL,
  opcoes jsonb NOT NULL,
  resposta_correta_indice integer NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.workshop_perguntas TO anon, authenticated;
GRANT ALL ON public.workshop_perguntas TO service_role;
ALTER TABLE public.workshop_perguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perguntas de workshop visíveis" ON public.workshop_perguntas FOR SELECT USING (true);

-- 6. Satisfação dos participantes
CREATE TABLE public.questionarios_satisfacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid REFERENCES public.turmas(id),
  workshop_id uuid REFERENCES public.workshops(id),
  provincia text,
  pontuacao integer NOT NULL,
  comentario text,
  dados_de_demonstracao boolean NOT NULL DEFAULT false,
  respondido_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.questionarios_satisfacao TO anon, authenticated;
GRANT ALL ON public.questionarios_satisfacao TO service_role;
ALTER TABLE public.questionarios_satisfacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Satisfação visível para avaliação" ON public.questionarios_satisfacao FOR SELECT USING (true);
CREATE POLICY "Satisfação pode ser registada nesta fase" ON public.questionarios_satisfacao FOR INSERT WITH CHECK (true);

-- 7. Inquérito de eficácia aos três meses (recolha pela ATDI, registo na plataforma)
CREATE TABLE public.inqueritos_eficacia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid REFERENCES public.turmas(id),
  workshop_id uuid REFERENCES public.workshops(id),
  curso_id uuid REFERENCES public.cursos(id),
  provincia text,
  nome_participante text,
  aplica_competencias boolean NOT NULL,
  observacoes text,
  realizado_em date NOT NULL DEFAULT current_date,
  registado_por text,
  dados_de_demonstracao boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.inqueritos_eficacia TO anon, authenticated;
GRANT ALL ON public.inqueritos_eficacia TO service_role;
ALTER TABLE public.inqueritos_eficacia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eficácia visível para avaliação" ON public.inqueritos_eficacia FOR SELECT USING (true);
CREATE POLICY "Eficácia pode ser registada nesta fase" ON public.inqueritos_eficacia FOR INSERT WITH CHECK (true);

-- 8. Relatório mensal Ambiental, Social, de Saúde e Segurança
CREATE TABLE public.relatorios_mensais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano integer NOT NULL,
  mes integer NOT NULL,
  provincia text,
  incidentes text,
  reclamacoes text,
  medidas_correctivas text,
  nao_conformidades text,
  acomodacoes_solicitadas text,
  acomodacoes_concedidas text,
  formatos_alternativos text,
  barreiras_identificadas text,
  barreiras_resolvidas text,
  dados_de_demonstracao boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_relatorios_mensais_periodo ON public.relatorios_mensais (ano, mes);
GRANT SELECT, INSERT, UPDATE ON public.relatorios_mensais TO anon, authenticated;
GRANT ALL ON public.relatorios_mensais TO service_role;
ALTER TABLE public.relatorios_mensais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Relatórios mensais visíveis para avaliação" ON public.relatorios_mensais FOR SELECT USING (true);
CREATE POLICY "Relatórios mensais podem ser criados nesta fase" ON public.relatorios_mensais FOR INSERT WITH CHECK (true);
CREATE POLICY "Relatórios mensais podem ser corrigidos nesta fase" ON public.relatorios_mensais FOR UPDATE USING (true) WITH CHECK (true);

-- 9. Turma: computadores da sala (limite de 30 formandos mantém-se)
ALTER TABLE public.turmas ADD COLUMN num_computadores integer;

-- 10. Parâmetros configuráveis do programa (metas de workshops e limites)
CREATE TABLE public.configuracoes_programa (
  chave text PRIMARY KEY,
  valor text NOT NULL,
  descricao text,
  actualizado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.configuracoes_programa TO anon, authenticated;
GRANT ALL ON public.configuracoes_programa TO service_role;
ALTER TABLE public.configuracoes_programa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Configurações visíveis" ON public.configuracoes_programa FOR SELECT USING (true);
CREATE POLICY "Configurações editáveis nesta fase" ON public.configuracoes_programa FOR UPDATE USING (true) WITH CHECK (true);
