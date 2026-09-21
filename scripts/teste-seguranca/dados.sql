-- Fixtures efémeras, inventadas só para o teste. Não correspondem a ninguém.
INSERT INTO public.perfis (id, nome, email, papel) VALUES
  ('00000000-0000-0000-0000-0000000000a1', 'Teste A', 'a@exemplo.invalid', 'formando'),
  ('00000000-0000-0000-0000-0000000000b1', 'Teste B', 'b@exemplo.invalid', 'formando'),
  ('00000000-0000-0000-0000-0000000000ad', 'Teste Admin', 'admin@exemplo.invalid', 'admin_ologa'),
  ('00000000-0000-0000-0000-0000000000cd', 'Teste Auditor', 'auditor@exemplo.invalid', 'formando');

-- O auditor recebe o papel pelo servidor de confiança (sem auth.uid()), como na realidade.
INSERT INTO public.utilizador_papeis (utilizador_id, papel)
VALUES ('00000000-0000-0000-0000-0000000000cd', 'auditor_atdi');
