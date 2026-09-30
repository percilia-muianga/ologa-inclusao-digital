CREATE TABLE public.licao_materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  licao_id uuid NOT NULL REFERENCES public.licoes(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('pdf','apresentacao','video','legenda')),
  titulo text NOT NULL CHECK (length(trim(titulo)) >= 3),
  descricao_acessivel text,
  idioma text NOT NULL DEFAULT 'pt',
  legenda_de uuid REFERENCES public.licao_materiais(id) ON DELETE SET NULL,
  ficheiro_path text NOT NULL,
  nome_original text NOT NULL,
  mime text NOT NULL,
  tamanho_bytes bigint NOT NULL CHECK (tamanho_bytes > 0),
  ordem integer NOT NULL DEFAULT 1,
  disponivel boolean NOT NULL DEFAULT false,
  versao integer NOT NULL DEFAULT 1,
  criado_em timestamptz NOT NULL DEFAULT now(),
  actualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX licao_materiais_licao_idx ON public.licao_materiais(licao_id, ordem);

GRANT SELECT, INSERT, UPDATE ON public.licao_materiais TO authenticated;
GRANT ALL ON public.licao_materiais TO service_role;
ALTER TABLE public.licao_materiais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "licao_materiais_select" ON public.licao_materiais FOR SELECT TO authenticated
  USING (disponivel OR public.is_admin(auth.uid()));
CREATE POLICY "licao_materiais_insert_admin" ON public.licao_materiais FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "licao_materiais_update_admin" ON public.licao_materiais FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER auditar_licao_materiais
  AFTER INSERT OR UPDATE OR DELETE ON public.licao_materiais
  FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

CREATE POLICY "materiais_licoes_admin_ler" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'materiais-licoes' AND (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.licao_materiais m WHERE m.ficheiro_path = storage.objects.name AND m.disponivel)
  ));
CREATE POLICY "materiais_licoes_admin_inserir" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'materiais-licoes' AND public.is_admin(auth.uid()));