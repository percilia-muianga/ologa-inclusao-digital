CREATE TRIGGER trg_auditar_turmas
AFTER INSERT OR UPDATE OR DELETE ON public.turmas
FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

CREATE TRIGGER trg_auditar_turma_sessoes
AFTER INSERT OR UPDATE OR DELETE ON public.turma_sessoes
FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

CREATE TRIGGER trg_auditar_turma_inscricoes
AFTER INSERT OR UPDATE OR DELETE ON public.turma_inscricoes
FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();

CREATE TRIGGER trg_auditar_workshops
AFTER INSERT OR UPDATE OR DELETE ON public.workshops
FOR EACH ROW EXECUTE FUNCTION public.auditar_alteracoes();