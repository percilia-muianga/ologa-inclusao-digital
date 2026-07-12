ALTER TABLE public.perfis ALTER COLUMN tem_deficiencia DROP NOT NULL;
ALTER TABLE public.perfis ALTER COLUMN tem_deficiencia DROP DEFAULT;
ALTER TABLE public.perfis ALTER COLUMN apoios_acessibilidade DROP NOT NULL;
ALTER TABLE public.perfis ALTER COLUMN apoios_acessibilidade DROP DEFAULT;