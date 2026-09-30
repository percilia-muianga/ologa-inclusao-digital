# Ensaio no navegador — inscrição por código (ambiente separado)

Objectivo: percorrer no navegador criar turma → código → formando entra →
introduz o código → confirma → «As minhas turmas» → lições, com base,
armazenamento e contas **separados** da base partilhada (pré-visualização e
site publicado usam a mesma base; ali não se criam dados fictícios).

## Acção externa necessária (uma vez)

Criar um ambiente com backend próprio. Opções, por ordem de preferência:

1. **Rascunho (draft) do projecto no Lovable** — cada rascunho tem base,
   armazenamento e autenticação próprios; as migrações do repositório são
   aplicadas lá. Pedir no chat: «criar um rascunho para o ensaio de inscrição».
2. **Remix do projecto** (Settings → Remix) com Lovable Cloud activo — cópia com
   backend novo e vazio.

Nenhuma destas acções é feita automaticamente: dependem de uma decisão da
utilizadora, porque criam um ambiente novo.

## Preparação dentro do ambiente separado

1. Confirmar que as migrações até `0033_inscricao_por_codigo_vagas_atomicas.sql`
   estão aplicadas.
2. Criar duas contas pelo ecrã «Criar conta»: uma para a gestão e outra para o
   formando (emails de ensaio próprios desse ambiente).
3. Dar o papel `coordenador_nacional` à conta de gestão (Painel → Utilizadores).
4. Correr `preparar.sql` **apenas** nesse ambiente (recusa correr se já houver
   turmas reais — ver a guarda no início do ficheiro).
5. Correr `python3 e2e_inscricao.py` com as variáveis `BASE_URL`,
   `FORMANDO_EMAIL`, `FORMANDO_SENHA` do ambiente separado.

## O que o ensaio verifica

- código inválido → mensagem «não corresponde a nenhuma turma»;
- turma planeada → «inscrições não estão abertas»;
- turma aberta → confirmação com curso, turma, local, datas e vagas;
- após confirmar → aparece em «As minhas turmas» com «Continuar para as lições»;
- repetir o código → «Já está inscrito(a)».

A corrida pela última vaga, a tentativa sem sessão e em nome de outra pessoa
são verificadas na base efémera (`scripts/teste-integracao/testes-inscricao.sh`),
onde o paralelismo é controlável.
