# Linha de base dos conteúdos e das configurações (verificação de integridade)

Documento interno. Não contém segredos, nem enunciados, nem gabaritos, nem
dados pessoais — apenas contagens e impressões digitais agregadas.

Serve para comparar o estado antes e depois de qualquer trabalho técnico. A
consulta abaixo é **só de leitura** e reproduzível: dá sempre o mesmo resultado
enquanto os conteúdos não mudarem.

## Consulta (executar tal e qual, sem alterações)

```sql
select 'banco_questoes' as tabela, count(*) as linhas,
       md5(string_agg(t.id::text || '|' || t.actualizado_em::text, ',' order by t.id)) as impressao
from public.banco_questoes t
union all
select 'exame_configuracoes', count(*),
       coalesce(md5(string_agg(c.curso_id::text || '|' || c.actualizado_em::text, ',' order by c.curso_id)), '(vazio)')
from public.exame_configuracoes c
union all
select 'licoes', count(*), md5(string_agg(l.id::text, ',' order by l.id)) from public.licoes l
union all
select 'cursos', count(*), md5(string_agg(cu.id::text, ',' order by cu.id)) from public.cursos cu
union all
select 'perfis', count(*), md5(string_agg(pf.id::text || '|' || pf.papel::text, ',' order by pf.id)) from public.perfis pf;
```

## Valores de referência

Registados no fim dos trabalhos de segurança (migrações 0013 a 0016):

| conjunto | linhas | impressão |
|---|---|---|
| banco_questoes | 298 | 3ea9c9cea6e1877a0ed773cbc1880074 |
| exame_configuracoes | 0 | (vazio) |
| licoes | 165 | 81f9e76b21d41735eabadba20ea18f99 |
| cursos | 6 | ace308a24a43bcd5545a6072478defe0 |
| perfis | 2 | 292db44a3762c2cc391a3e2c0f313c0e |

Notas honestas:

- A impressão de um turno anterior (`8bbb3b75…`) foi calculada com uma fórmula
  que não ficou registada, por isso **não é comparável** com esta. A partir
  daqui a fórmula é esta, escrita acima.
- `exame_configuracoes` está vazia porque nenhuma prova foi configurada nem
  activada. O valor 0 é o estado real e deve manter-se assim.
- A impressão do banco de questões inclui a data de actualização de cada
  questão. Continua a reflectir a escrita acidental de um turno anterior
  (importação de sementes que só mexeu em datas); essa alteração não foi
  revertida, conforme decidido.

## Linha de estado dos conteúdos de Inteligência Artificial (22/09/2026)

| item | ficheiro privado | integrado na base | activado |
| --- | --- | --- | --- |
| Lições do módulo 2 (4) | sim | sim (integração editorial restrita) | não aplicável |
| Banco de avaliação (80 + 10) | sim | **não** — ver PV-05 | **não** |
| Configuração de exame | não existe | não existe (tabela vazia) | **não** |

As três colunas são estados distintos: escrever o ficheiro não é integrar na
base, e integrar na base não é activar. O banco de Inteligência Artificial está
apenas na primeira coluna.

## Segurança Cibernética Avançada — estado a 22 de Setembro de 2026

Nenhuma escrita foi feita na base de dados por causa deste curso. As 15 lições
mantêm os identificadores, as ordens e o estado `por_fornecer` registados na
linha de base acima; os três módulos mantêm 600 minutos cada em
`curso_modulos` e a ficha do curso mantém-se vazia. O conteúdo escrito vive
apenas em ficheiros privados fora de `src/` e a sincronização está pendente de
sessão de administrador — ver PV-06 em `docs/pontos-por-validar.md`.
