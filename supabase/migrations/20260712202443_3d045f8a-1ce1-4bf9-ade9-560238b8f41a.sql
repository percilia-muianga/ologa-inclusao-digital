
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.papel_utilizador AS ENUM ('admin_ologa','gestor_instituicao','formando');
CREATE TYPE public.natureza_instituicao AS ENUM ('orgao_central','direcao_provincial','administracao_distrital','autarquia','ong','empresa','outro');
CREATE TYPE public.meio_instituicao AS ENUM ('urbano','peri_urbano','rural');
CREATE TYPE public.conectividade AS ENUM ('boa','fraca','nenhuma');
CREATE TYPE public.modalidade AS ENUM ('presencial','virtual','misto');
CREATE TYPE public.genero AS ENUM ('feminino','masculino','prefere_nao_indicar');
CREATE TYPE public.nivel_partida AS ENUM ('nenhum','basico','intermedio');
CREATE TYPE public.apoio_acessibilidade AS ENUM ('lsm','leitura_facil','baixa_visao','audiodescricao','mobilidade');
CREATE TYPE public.nivel_modulo AS ENUM ('basico','intermedio','avancado');

-- =========================
-- TABELAS
-- =========================

-- INSTITUICOES
CREATE TABLE public.instituicoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  natureza public.natureza_instituicao NOT NULL,
  setor TEXT,
  provincia TEXT,
  distrito TEXT,
  meio public.meio_instituicao,
  conectividade public.conectividade,
  modalidade public.modalidade,
  ponto_focal_nome TEXT,
  ponto_focal_email TEXT,
  codigo_inscricao TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instituicoes TO authenticated;
GRANT ALL ON public.instituicoes TO service_role;
ALTER TABLE public.instituicoes ENABLE ROW LEVEL SECURITY;

-- PERFIS
CREATE TABLE public.perfis (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  papel public.papel_utilizador NOT NULL,
  instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE RESTRICT,
  genero public.genero,
  nivel_partida public.nivel_partida,
  tem_deficiencia BOOLEAN NOT NULL DEFAULT false,
  apoios_acessibilidade public.apoio_acessibilidade[] NOT NULL DEFAULT '{}',
  funcao TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT perfis_admin_sem_instituicao CHECK (
    (papel = 'admin_ologa' AND instituicao_id IS NULL)
    OR (papel <> 'admin_ologa' AND instituicao_id IS NOT NULL)
  )
);
CREATE INDEX idx_perfis_instituicao_id ON public.perfis(instituicao_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfis TO authenticated;
GRANT ALL ON public.perfis TO service_role;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Funções SECURITY DEFINER (evitam recursão nas políticas de perfis)
CREATE OR REPLACE FUNCTION public.get_papel(_uid UUID)
RETURNS public.papel_utilizador
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT papel FROM public.perfis WHERE id = _uid $$;

CREATE OR REPLACE FUNCTION public.get_instituicao(_uid UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT instituicao_id FROM public.perfis WHERE id = _uid $$;

CREATE OR REPLACE FUNCTION public.is_admin(_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.perfis WHERE id = _uid AND papel = 'admin_ologa') $$;

CREATE OR REPLACE FUNCTION public.is_gestor_de(_uid UUID, _instituicao UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.perfis
  WHERE id = _uid AND papel = 'gestor_instituicao' AND instituicao_id = _instituicao
) $$;

-- TURMAS
CREATE TABLE public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instituicao_id UUID NOT NULL REFERENCES public.instituicoes(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  modalidade public.modalidade NOT NULL,
  data_inicio DATE,
  data_fim DATE
);
CREATE INDEX idx_turmas_instituicao_id ON public.turmas(instituicao_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turmas TO authenticated;
GRANT ALL ON public.turmas TO service_role;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

-- TURMA_FORMANDOS
CREATE TABLE public.turma_formandos (
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  perfil_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  PRIMARY KEY (turma_id, perfil_id)
);
CREATE INDEX idx_turma_formandos_perfil_id ON public.turma_formandos(perfil_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turma_formandos TO authenticated;
GRANT ALL ON public.turma_formandos TO service_role;
ALTER TABLE public.turma_formandos ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: formando pertence a turma?
CREATE OR REPLACE FUNCTION public.esta_em_turma(_uid UUID, _turma UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.turma_formandos WHERE turma_id = _turma AND perfil_id = _uid
) $$;

-- MODULOS
CREATE TABLE public.modulos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  nivel public.nivel_modulo NOT NULL,
  duracao TEXT,
  descricao TEXT,
  desenho_universal TEXT,
  icone TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modulos TO authenticated;
GRANT ALL ON public.modulos TO service_role;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;

-- LICOES
CREATE TABLE public.licoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE RESTRICT,
  ordem INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  duracao TEXT,
  ilustracao_svg TEXT,
  conteudo_elearning TEXT,
  guiao_formador TEXT
);
CREATE INDEX idx_licoes_modulo_id ON public.licoes(modulo_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.licoes TO authenticated;
GRANT ALL ON public.licoes TO service_role;
ALTER TABLE public.licoes ENABLE ROW LEVEL SECURITY;

-- QUIZ_PERGUNTAS
-- Nota: a coluna `resposta_correta_indice` NUNCA é entregue ao cliente.
-- Os grants ao role `authenticated` são a nível de coluna, excluindo essa coluna.
CREATE TABLE public.quiz_perguntas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE RESTRICT,
  pergunta TEXT NOT NULL,
  opcoes JSONB NOT NULL,
  resposta_correta_indice INTEGER NOT NULL
);
CREATE INDEX idx_quiz_perguntas_modulo_id ON public.quiz_perguntas(modulo_id);
-- Sem GRANT ALL nem SELECT completo para authenticated: só as colunas seguras.
GRANT SELECT (id, modulo_id, pergunta, opcoes) ON public.quiz_perguntas TO authenticated;
GRANT ALL ON public.quiz_perguntas TO service_role;
ALTER TABLE public.quiz_perguntas ENABLE ROW LEVEL SECURITY;

-- PROGRESSO_LICOES
CREATE TABLE public.progresso_licoes (
  perfil_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  licao_id UUID NOT NULL REFERENCES public.licoes(id) ON DELETE CASCADE,
  concluida_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (perfil_id, licao_id)
);
CREATE INDEX idx_progresso_licoes_licao_id ON public.progresso_licoes(licao_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progresso_licoes TO authenticated;
GRANT ALL ON public.progresso_licoes TO service_role;
ALTER TABLE public.progresso_licoes ENABLE ROW LEVEL SECURITY;

-- PROGRESSO_QUIZZES (todas as tentativas)
CREATE TABLE public.progresso_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  perfil_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  pontuacao INTEGER NOT NULL,
  total INTEGER NOT NULL,
  tentado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_progresso_quizzes_perfil_id ON public.progresso_quizzes(perfil_id);
CREATE INDEX idx_progresso_quizzes_modulo_id ON public.progresso_quizzes(modulo_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progresso_quizzes TO authenticated;
GRANT ALL ON public.progresso_quizzes TO service_role;
ALTER TABLE public.progresso_quizzes ENABLE ROW LEVEL SECURITY;

-- CERTIFICADOS (imutáveis; instantâneo dos dados no momento da emissão)
CREATE TABLE public.certificados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  perfil_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE RESTRICT,
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE RESTRICT,
  emitido_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  codigo_verificacao TEXT NOT NULL UNIQUE,
  nome_formando TEXT NOT NULL,
  nome_instituicao TEXT NOT NULL,
  titulo_modulo TEXT NOT NULL,
  UNIQUE (perfil_id, modulo_id)
);
CREATE INDEX idx_certificados_perfil_id ON public.certificados(perfil_id);
CREATE INDEX idx_certificados_modulo_id ON public.certificados(modulo_id);
-- SELECT/DELETE apenas; sem INSERT/UPDATE via role authenticated (só servidor).
GRANT SELECT ON public.certificados TO authenticated;
GRANT ALL ON public.certificados TO service_role;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

-- Trigger de imutabilidade dos certificados
CREATE OR REPLACE FUNCTION public.certificados_impedir_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Certificados são imutáveis e não podem ser alterados.';
END;
$$;
CREATE TRIGGER trg_certificados_impedir_update
BEFORE UPDATE ON public.certificados
FOR EACH ROW EXECUTE FUNCTION public.certificados_impedir_update();

-- =========================
-- POLICIES
-- =========================

-- INSTITUICOES
CREATE POLICY "instituicoes_select_admin" ON public.instituicoes FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "instituicoes_select_membros" ON public.instituicoes FOR SELECT TO authenticated
  USING (id = public.get_instituicao(auth.uid()));
-- Sem INSERT: a inscrição pública tem de passar por função de servidor (SECURITY DEFINER).
CREATE POLICY "instituicoes_update_admin" ON public.instituicoes FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "instituicoes_update_gestor" ON public.instituicoes FOR UPDATE TO authenticated
  USING (public.is_gestor_de(auth.uid(), id)) WITH CHECK (public.is_gestor_de(auth.uid(), id));
CREATE POLICY "instituicoes_delete_admin" ON public.instituicoes FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- PERFIS
CREATE POLICY "perfis_select_proprio" ON public.perfis FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "perfis_select_gestor" ON public.perfis FOR SELECT TO authenticated
  USING (public.is_gestor_de(auth.uid(), instituicao_id));
CREATE POLICY "perfis_select_admin" ON public.perfis FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "perfis_insert_proprio" ON public.perfis FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "perfis_insert_gestor" ON public.perfis FOR INSERT TO authenticated
  WITH CHECK (public.is_gestor_de(auth.uid(), instituicao_id));
CREATE POLICY "perfis_insert_admin" ON public.perfis FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "perfis_update_proprio" ON public.perfis FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "perfis_update_gestor" ON public.perfis FOR UPDATE TO authenticated
  USING (public.is_gestor_de(auth.uid(), instituicao_id))
  WITH CHECK (public.is_gestor_de(auth.uid(), instituicao_id));
CREATE POLICY "perfis_update_admin" ON public.perfis FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- TURMAS
CREATE POLICY "turmas_select_admin" ON public.turmas FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "turmas_select_gestor" ON public.turmas FOR SELECT TO authenticated
  USING (public.is_gestor_de(auth.uid(), instituicao_id));
CREATE POLICY "turmas_select_formando" ON public.turmas FOR SELECT TO authenticated
  USING (public.esta_em_turma(auth.uid(), id));

CREATE POLICY "turmas_insert_gestor" ON public.turmas FOR INSERT TO authenticated
  WITH CHECK (public.is_gestor_de(auth.uid(), instituicao_id));
CREATE POLICY "turmas_insert_admin" ON public.turmas FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "turmas_update_gestor" ON public.turmas FOR UPDATE TO authenticated
  USING (public.is_gestor_de(auth.uid(), instituicao_id))
  WITH CHECK (public.is_gestor_de(auth.uid(), instituicao_id));
CREATE POLICY "turmas_update_admin" ON public.turmas FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "turmas_delete_gestor" ON public.turmas FOR DELETE TO authenticated
  USING (public.is_gestor_de(auth.uid(), instituicao_id));
CREATE POLICY "turmas_delete_admin" ON public.turmas FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- TURMA_FORMANDOS
CREATE POLICY "tf_select_proprio" ON public.turma_formandos FOR SELECT TO authenticated
  USING (perfil_id = auth.uid());
CREATE POLICY "tf_select_gestor" ON public.turma_formandos FOR SELECT TO authenticated
  USING (public.is_gestor_de(auth.uid(),
    (SELECT instituicao_id FROM public.turmas WHERE id = turma_id)));
CREATE POLICY "tf_select_admin" ON public.turma_formandos FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "tf_insert_gestor" ON public.turma_formandos FOR INSERT TO authenticated
  WITH CHECK (public.is_gestor_de(auth.uid(),
    (SELECT instituicao_id FROM public.turmas WHERE id = turma_id)));
CREATE POLICY "tf_insert_admin" ON public.turma_formandos FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "tf_delete_gestor" ON public.turma_formandos FOR DELETE TO authenticated
  USING (public.is_gestor_de(auth.uid(),
    (SELECT instituicao_id FROM public.turmas WHERE id = turma_id)));
CREATE POLICY "tf_delete_admin" ON public.turma_formandos FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- MODULOS
CREATE POLICY "modulos_select_autenticados" ON public.modulos FOR SELECT TO authenticated USING (true);
CREATE POLICY "modulos_insert_admin" ON public.modulos FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "modulos_update_admin" ON public.modulos FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "modulos_delete_admin" ON public.modulos FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- LICOES
CREATE POLICY "licoes_select_autenticados" ON public.licoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "licoes_insert_admin" ON public.licoes FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "licoes_update_admin" ON public.licoes FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "licoes_delete_admin" ON public.licoes FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- QUIZ_PERGUNTAS
CREATE POLICY "quiz_select_autenticados" ON public.quiz_perguntas FOR SELECT TO authenticated USING (true);
CREATE POLICY "quiz_insert_admin" ON public.quiz_perguntas FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "quiz_update_admin" ON public.quiz_perguntas FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "quiz_delete_admin" ON public.quiz_perguntas FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- PROGRESSO_LICOES
CREATE POLICY "pl_select_proprio" ON public.progresso_licoes FOR SELECT TO authenticated
  USING (perfil_id = auth.uid());
CREATE POLICY "pl_select_gestor" ON public.progresso_licoes FOR SELECT TO authenticated
  USING (public.is_gestor_de(auth.uid(),
    (SELECT instituicao_id FROM public.perfis WHERE id = perfil_id)));
CREATE POLICY "pl_select_admin" ON public.progresso_licoes FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "pl_insert_proprio" ON public.progresso_licoes FOR INSERT TO authenticated
  WITH CHECK (perfil_id = auth.uid());
CREATE POLICY "pl_update_proprio" ON public.progresso_licoes FOR UPDATE TO authenticated
  USING (perfil_id = auth.uid()) WITH CHECK (perfil_id = auth.uid());
CREATE POLICY "pl_delete_admin" ON public.progresso_licoes FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- PROGRESSO_QUIZZES
CREATE POLICY "pq_select_proprio" ON public.progresso_quizzes FOR SELECT TO authenticated
  USING (perfil_id = auth.uid());
CREATE POLICY "pq_select_gestor" ON public.progresso_quizzes FOR SELECT TO authenticated
  USING (public.is_gestor_de(auth.uid(),
    (SELECT instituicao_id FROM public.perfis WHERE id = perfil_id)));
CREATE POLICY "pq_select_admin" ON public.progresso_quizzes FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
CREATE POLICY "pq_insert_proprio" ON public.progresso_quizzes FOR INSERT TO authenticated
  WITH CHECK (perfil_id = auth.uid());
CREATE POLICY "pq_update_proprio" ON public.progresso_quizzes FOR UPDATE TO authenticated
  USING (perfil_id = auth.uid()) WITH CHECK (perfil_id = auth.uid());
CREATE POLICY "pq_delete_admin" ON public.progresso_quizzes FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- CERTIFICADOS
CREATE POLICY "cert_select_proprio" ON public.certificados FOR SELECT TO authenticated
  USING (perfil_id = auth.uid());
CREATE POLICY "cert_select_gestor" ON public.certificados FOR SELECT TO authenticated
  USING (public.is_gestor_de(auth.uid(),
    (SELECT instituicao_id FROM public.perfis WHERE id = perfil_id)));
CREATE POLICY "cert_select_admin" ON public.certificados FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
-- Sem INSERT nem UPDATE via authenticated: emissão só pelo servidor (service_role).
-- Trigger adicional bloqueia qualquer UPDATE, mesmo via service_role.
CREATE POLICY "cert_delete_admin" ON public.certificados FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));
