ALTER TABLE public.perfis ADD COLUMN nome text, ADD COLUMN email text;
INSERT INTO public.perfis(id,papel,nome,email) VALUES
 ('00000000-0000-0000-0000-0000000000ad','admin_ologa','Admin Ficticio','admin@exemplo.test'),
 ('00000000-0000-0000-0000-0000000000f1','formando','Formando A','a@exemplo.test'),
 ('00000000-0000-0000-0000-0000000000f2','formando','Formando B','b@exemplo.test');
