CREATE TYPE public.tipologia_questao AS ENUM ('escolha_multipla','verdadeiro_falso','resposta_curta','correspondencia','ordenacao');
CREATE TYPE public.dificuldade_questao AS ENUM ('facil','media','dificil');
CREATE TYPE public.estado_tentativa AS ENUM ('em_curso','submetida','expirada');

CREATE TABLE public.banco_questoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL REFERENCES public.cursos(id),
  modulo_id uuid REFERENCES public.modulos(id),
  tipologia public.tipologia_questao NOT NULL,
  dificuldade public.dificuldade_questao NOT NULL,
  enunciado text NOT NULL,
  conteudo jsonb NOT NULL DEFAULT '{}'::jsonb,
  resposta jsonb NOT NULL DEFAULT '{}'::jsonb,
  explicacao text NOT NULL DEFAULT '',
  activa boolean NOT NULL DEFAULT true,
  autor_id uuid REFERENCES public.perfis(id),
  autor_nome text NOT NULL DEFAULT '',
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.banco_questoes TO authenticated;
GRANT ALL ON public.banco_questoes TO service_role;
ALTER TABLE public.banco_questoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipa autenticada gere o banco de questoes" ON public.banco_questoes
  FOR SELECT TO authenticated USING (true);

CREATE TABLE public.exame_configuracoes (
  curso_id uuid PRIMARY KEY REFERENCES public.cursos(id),
  numero_questoes integer NOT NULL DEFAULT 20,
  minutos integer NOT NULL DEFAULT 60,
  pct_facil integer NOT NULL DEFAULT 40,
  pct_media integer NOT NULL DEFAULT 40,
  pct_dificil integer NOT NULL DEFAULT 20,
  nota_minima_pct integer NOT NULL DEFAULT 60,
  assiduidade_minima_pct integer NOT NULL DEFAULT 80,
  prazo_dias integer NOT NULL DEFAULT 30,
  tentativas_max integer NOT NULL DEFAULT 2,
  actualizado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.exame_configuracoes TO authenticated;
GRANT ALL ON public.exame_configuracoes TO service_role;
ALTER TABLE public.exame_configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Configuracao de exame visivel a equipa" ON public.exame_configuracoes
  FOR SELECT TO authenticated USING (true);

CREATE TABLE public.exame_tentativas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formando_id uuid NOT NULL REFERENCES public.formandos(id),
  curso_id uuid NOT NULL REFERENCES public.cursos(id),
  turma_id uuid REFERENCES public.turmas(id),
  numero integer NOT NULL DEFAULT 1,
  estado public.estado_tentativa NOT NULL DEFAULT 'em_curso',
  iniciado_em timestamptz NOT NULL DEFAULT now(),
  limite_em timestamptz NOT NULL,
  submetido_em timestamptz,
  pontuacao integer,
  total integer,
  nota_pct numeric,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_exame_tentativas_formando ON public.exame_tentativas(formando_id, curso_id);
GRANT SELECT ON public.exame_tentativas TO authenticated;
GRANT ALL ON public.exame_tentativas TO service_role;
ALTER TABLE public.exame_tentativas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tentativas visiveis a equipa" ON public.exame_tentativas
  FOR SELECT TO authenticated USING (true);

CREATE TABLE public.exame_tentativa_questoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tentativa_id uuid NOT NULL REFERENCES public.exame_tentativas(id) ON DELETE CASCADE,
  questao_id uuid NOT NULL REFERENCES public.banco_questoes(id),
  ordem integer NOT NULL,
  modulo_id uuid,
  tipologia public.tipologia_questao NOT NULL,
  dificuldade public.dificuldade_questao NOT NULL,
  enunciado text NOT NULL,
  apresentacao jsonb NOT NULL DEFAULT '{}'::jsonb,
  resposta_correcta jsonb NOT NULL DEFAULT '{}'::jsonb,
  explicacao text NOT NULL DEFAULT '',
  resposta_dada jsonb,
  correcta boolean,
  respondido_em timestamptz
);
CREATE INDEX idx_tentativa_questoes_tentativa ON public.exame_tentativa_questoes(tentativa_id, ordem);
GRANT SELECT ON public.exame_tentativa_questoes TO authenticated;
GRANT ALL ON public.exame_tentativa_questoes TO service_role;
ALTER TABLE public.exame_tentativa_questoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Composicao de tentativas visivel a equipa" ON public.exame_tentativa_questoes
  FOR SELECT TO authenticated USING (true);

CREATE TABLE public.certificados_curso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formando_id uuid NOT NULL REFERENCES public.formandos(id),
  curso_id uuid NOT NULL REFERENCES public.cursos(id),
  turma_id uuid REFERENCES public.turmas(id),
  tentativa_id uuid REFERENCES public.exame_tentativas(id),
  codigo_verificacao text NOT NULL UNIQUE,
  nome_formando text NOT NULL,
  titulo_curso text NOT NULL,
  carga_horaria integer NOT NULL DEFAULT 0,
  provincia text,
  turma_designacao text,
  data_inicio date,
  data_fim date,
  nota_final_pct numeric NOT NULL,
  assiduidade_pct numeric NOT NULL,
  emitido_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (formando_id, curso_id)
);
GRANT SELECT ON public.certificados_curso TO authenticated;
GRANT ALL ON public.certificados_curso TO service_role;
ALTER TABLE public.certificados_curso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certificados de curso visiveis a equipa" ON public.certificados_curso
  FOR SELECT TO authenticated USING (true);