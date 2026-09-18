CREATE TABLE public.cursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem integer NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  carga_horaria integer NOT NULL CHECK (carga_horaria > 0),
  modalidade text NOT NULL CHECK (modalidade IN ('presencial', 'virtual', 'misto')),
  formandos_previstos integer NOT NULL CHECK (formandos_previstos > 0),
  abrangencia text,
  objectivos text,
  publico_alvo text,
  pre_requisitos text,
  materiais text,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cursos TO anon, authenticated;
GRANT ALL ON public.cursos TO service_role;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY cursos_leitura_publica ON public.cursos FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.curso_modulos (
  curso_id uuid NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE RESTRICT,
  ordem integer NOT NULL,
  carga_horaria_minutos integer NOT NULL CHECK (carga_horaria_minutos > 0),
  obrigatorio boolean NOT NULL DEFAULT true,
  transversal boolean NOT NULL DEFAULT false,
  PRIMARY KEY (curso_id, modulo_id),
  UNIQUE (curso_id, ordem)
);
GRANT SELECT ON public.curso_modulos TO anon, authenticated;
GRANT ALL ON public.curso_modulos TO service_role;
ALTER TABLE public.curso_modulos ENABLE ROW LEVEL SECURITY;
CREATE POLICY curso_modulos_leitura_publica ON public.curso_modulos FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE public.modulos ADD COLUMN catalogo_publico boolean NOT NULL DEFAULT true;
ALTER TABLE public.licoes ADD COLUMN estado_conteudo text NOT NULL DEFAULT 'disponivel';
ALTER TABLE public.licoes ADD CONSTRAINT licoes_estado_conteudo_valido CHECK (estado_conteudo IN ('por_fornecer', 'disponivel'));

CREATE INDEX idx_curso_modulos_curso_ordem ON public.curso_modulos(curso_id, ordem);
CREATE INDEX idx_curso_modulos_modulo ON public.curso_modulos(modulo_id);
CREATE INDEX idx_licoes_estado_conteudo ON public.licoes(estado_conteudo);