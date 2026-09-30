CREATE TABLE public.faq_perguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta text NOT NULL CHECK (length(trim(pergunta)) >= 5),
  resposta text NOT NULL CHECK (length(trim(resposta)) >= 5),
  categoria text NOT NULL DEFAULT 'geral',
  ordem integer NOT NULL DEFAULT 1,
  publicada boolean NOT NULL DEFAULT false,
  versao integer NOT NULL DEFAULT 1,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq_perguntas TO anon;
GRANT SELECT, INSERT, UPDATE ON public.faq_perguntas TO authenticated;
GRANT ALL ON public.faq_perguntas TO service_role;
ALTER TABLE public.faq_perguntas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faq_select_publicadas" ON public.faq_perguntas FOR SELECT TO anon, authenticated
  USING (publicada OR public.is_admin(auth.uid()));
CREATE POLICY "faq_insert_admin" ON public.faq_perguntas FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "faq_update_admin" ON public.faq_perguntas FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER auditar_faq_perguntas AFTER INSERT OR UPDATE OR DELETE ON public.faq_perguntas
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

CREATE TABLE public.pedidos_suporte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.perfis(id) ON DELETE CASCADE,
  categoria text NOT NULL CHECK (categoria IN ('acesso','conteudo','acessibilidade','tecnico','outro')),
  assunto text NOT NULL CHECK (length(trim(assunto)) BETWEEN 3 AND 200),
  mensagem text NOT NULL CHECK (length(trim(mensagem)) BETWEEN 5 AND 5000),
  estado text NOT NULL DEFAULT 'aberto' CHECK (estado IN ('aberto','em_curso','resolvido')),
  resposta text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pedidos_suporte_autor_idx ON public.pedidos_suporte(autor_id, criado_em DESC);
GRANT SELECT, INSERT, UPDATE ON public.pedidos_suporte TO authenticated;
GRANT ALL ON public.pedidos_suporte TO service_role;
ALTER TABLE public.pedidos_suporte ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suporte_insert_proprio" ON public.pedidos_suporte FOR INSERT TO authenticated
  WITH CHECK (autor_id = auth.uid() AND estado = 'aberto' AND resposta IS NULL);
CREATE POLICY "suporte_select_proprio_ou_admin" ON public.pedidos_suporte FOR SELECT TO authenticated
  USING (autor_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "suporte_update_admin" ON public.pedidos_suporte FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER auditar_pedidos_suporte AFTER INSERT OR UPDATE OR DELETE ON public.pedidos_suporte
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();