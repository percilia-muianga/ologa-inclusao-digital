-- Fixtures locais efémeras. Nomes inventados apenas para o teste, nunca
-- usados na base do projecto; a base é destruída no fim.
INSERT INTO auth.users(id, email) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'admin@teste.local'),
  ('00000000-0000-0000-0000-0000000000c1', 'coord@teste.local'),
  ('00000000-0000-0000-0000-0000000000f1', 'formando@teste.local'),
  ('00000000-0000-0000-0000-0000000000d1', 'auditor@teste.local');

INSERT INTO public.perfis(id, nome, email, papel) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'Conta A', 'admin@teste.local', 'admin_ologa'),
  ('00000000-0000-0000-0000-0000000000c1', 'Conta C', 'coord@teste.local', 'formando'),
  ('00000000-0000-0000-0000-0000000000f1', 'Conta F', 'formando@teste.local', 'formando'),
  ('00000000-0000-0000-0000-0000000000d1', 'Conta D', 'auditor@teste.local', 'formando');

INSERT INTO public.utilizador_papeis(utilizador_id, papel) VALUES
  ('00000000-0000-0000-0000-0000000000c1', 'coordenador_nacional'),
  ('00000000-0000-0000-0000-0000000000d1', 'auditor_atdi'),
  ('00000000-0000-0000-0000-0000000000f1', 'formando');

INSERT INTO public.cursos(id, ordem, slug, titulo, carga_horaria, modalidade, formandos_previstos)
VALUES ('00000000-0000-0000-0000-00000000c001', 99, 'curso-teste', 'Curso de teste', 10, 'presencial', 10);
