-- Ambiente mínimo equivalente ao do projecto (papéis, esquema auth, auth.uid).
-- Base efémera, sem dados reais.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;
CREATE ROLE supabase_auth_admin NOLOGIN;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA auth TO authenticated, anon, service_role;
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text);
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Tabelas e tipos que já existiam antes da primeira migração do repositório.
-- Reprodução mínima do esquema real: mesmas colunas e tipos usados pelas
-- migrações; sem dados.
CREATE TYPE public.papel_utilizador AS ENUM ('admin_ologa','gestor_instituicao','formando');
CREATE TYPE public.genero AS ENUM ('feminino','masculino','prefere_nao_indicar');
CREATE TYPE public.nivel_partida AS ENUM ('nenhum','basico','intermedio','prefere_nao_indicar');
CREATE TYPE public.apoio_acessibilidade AS ENUM ('lsm','leitura_facil','baixa_visao','audiodescricao','mobilidade','nenhum');
CREATE TYPE public.natureza_instituicao AS ENUM ('orgao_central','direcao_provincial','administracao_distrital','autarquia','ong','empresa','outro');
CREATE TYPE public.setor_instituicao AS ENUM ('admin_publica_central','admin_local','educacao','saude','financas','justica','agricultura','infraestruturas_transportes','energia','interior_seguranca','sociedade_civil_ong','setor_privado','outro');
CREATE TYPE public.meio_instituicao AS ENUM ('urbano','peri_urbano','rural');
CREATE TYPE public.conectividade AS ENUM ('boa','fraca','nenhuma');
CREATE TYPE public.modalidade AS ENUM ('presencial','virtual','misto');
CREATE TYPE public.percurso AS ENUM ('completo','fundacao','intermedio','avancado','avulsos');
CREATE TYPE public.sala_disponivel_opt AS ENUM ('sim','nao','nao_sei');
CREATE TYPE public.nivel_modulo AS ENUM ('basico','intermedio','avancado');

CREATE TABLE public.perfis (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text NOT NULL,
  papel public.papel_utilizador NOT NULL DEFAULT 'formando',
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.instituicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  natureza public.natureza_instituicao NOT NULL,
  setor public.setor_instituicao,
  provincia text, distrito text,
  meio public.meio_instituicao,
  conectividade public.conectividade,
  modalidade public.modalidade,
  ponto_focal_nome text, ponto_focal_email text,
  codigo_inscricao text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  setor_outro text,
  num_computadores integer,
  num_colaboradores_total integer NOT NULL DEFAULT 0,
  nivel_literacia public.nivel_partida,
  num_mulheres integer, num_homens integer, num_pcd integer,
  apoios_acessibilidade public.apoio_acessibilidade[],
  modulos_interesse uuid[],
  percurso public.percurso,
  sala_disponivel public.sala_disponivel_opt,
  observacoes text,
  consentimento boolean NOT NULL DEFAULT false
);
CREATE TABLE public.modulos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem integer NOT NULL DEFAULT 0,
  titulo text NOT NULL,
  nivel public.nivel_modulo NOT NULL DEFAULT 'basico',
  duracao text, descricao text, desenho_universal text, icone text, cor_fundo text
);
CREATE TABLE public.licoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 0,
  titulo text NOT NULL,
  duracao text, ilustracao_svg text, conteudo_elearning text, guiao_formador text
);
CREATE TABLE public.formandos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_pessoal uuid NOT NULL DEFAULT gen_random_uuid(),
  instituicao_id uuid REFERENCES public.instituicoes(id) ON DELETE SET NULL,
  nome text NOT NULL,
  genero public.genero,
  nivel_partida public.nivel_partida,
  precisa_apoio boolean,
  apoios_acessibilidade public.apoio_acessibilidade[],
  diagnostico_pontuacao integer, diagnostico_total integer,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.quiz_perguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  pergunta text NOT NULL, opcoes jsonb NOT NULL, resposta_correta_indice integer NOT NULL
);
CREATE TABLE public.progresso_licoes (
  formando_id uuid NOT NULL REFERENCES public.formandos(id) ON DELETE CASCADE,
  licao_id uuid NOT NULL REFERENCES public.licoes(id) ON DELETE CASCADE,
  concluida_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (formando_id, licao_id)
);
CREATE TABLE public.progresso_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formando_id uuid NOT NULL REFERENCES public.formandos(id) ON DELETE CASCADE,
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  pontuacao integer NOT NULL, total integer NOT NULL,
  tentado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.certificados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formando_id uuid NOT NULL REFERENCES public.formandos(id) ON DELETE CASCADE,
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  emitido_em timestamptz NOT NULL DEFAULT now(),
  codigo_verificacao text NOT NULL,
  nome_formando text NOT NULL, nome_instituicao text NOT NULL, titulo_modulo text NOT NULL
);
CREATE TABLE public.instituicao_modulos_percurso (
  instituicao_id uuid NOT NULL REFERENCES public.instituicoes(id) ON DELETE CASCADE,
  modulo_id uuid NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (instituicao_id, modulo_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
