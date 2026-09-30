#!/bin/bash
# Inscrição por código e limite de vagas perante pedidos simultâneos.
# Corre sobre a base EFÉMERA criada por correr.sh. Contas e turma inventadas,
# destruídas com a base no fim.
set -u
P="psql -h ${PGDIR} -p ${PGPORTA} -U postgres -d postgres -X -q -t -A -v ON_ERROR_STOP=1"
OK=0; MAU=0
COORD=00000000-0000-0000-0000-0000000000c1
F1=00000000-0000-0000-0000-0000000000f1
T=00000000-0000-0000-0000-00000000e0a1
TF=00000000-0000-0000-0000-00000000e0a2

verifica() { # nome, obtido, esperado
  if [ "$2" = "$3" ]; then echo "ok     $1"; OK=$((OK+1));
  else echo "FALHA  $1 -> obtido [$2] esperado [$3]"; MAU=$((MAU+1)); fi
}
# SQL como pessoa autenticada, confirmando a transacção
como() { # uid, sql
  $P <<SQL 2>&1 | tr '\n' ' ' | sed 's/ *$//'
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '$1';
$2
COMMIT;
SQL
}
res() { sed -n 's/.*"resultado": *"\([a-z_]*\)".*/\1/p'; }

# 31 contas de formando fictícias (f1 já existe) + turma aberta + turma planeada
$P <<SQL >/dev/null
INSERT INTO auth.users(id,email)
  SELECT ('00000000-0000-0000-0000-0000000100'||lpad(g::text,2,'0'))::uuid, 'f'||g||'@teste.local' FROM generate_series(1,31) g;
INSERT INTO public.perfis(id,nome,email,papel)
  SELECT ('00000000-0000-0000-0000-0000000100'||lpad(g::text,2,'0'))::uuid, 'Formando '||g, 'f'||g||'@teste.local','formando' FROM generate_series(1,31) g;
SQL
como "$COORD" "INSERT INTO public.turmas(id,curso_id,designacao,codigo_inscricao,provincia,distrito,modalidade,estado) VALUES
 ('$T','00000000-0000-0000-0000-00000000c001','Turma aberta','ABCD2345','Maputo','KaMpfumo','presencial','inscricoes_abertas'),
 ('$TF','00000000-0000-0000-0000-00000000c001','Turma planeada','PLAN2345','Maputo','KaMpfumo','presencial','planeada');" >/dev/null
u() { echo "00000000-0000-0000-0000-0000000100$(printf %02d "$1")"; }

echo "— inscrição por código —"
verifica "sem sessão é recusada" \
  "$(como "" "SELECT public.rpc_inscrever_por_codigo('ABCD2345');" | grep -c SEM_SESSAO)" "1"
verifica "anónimo não pode chamar a função" \
  "$($P -c "SET ROLE anon; SELECT public.rpc_inscrever_por_codigo('ABCD2345');" 2>&1 | grep -c 'permission denied')" "1"
verifica "código inválido" "$(como "$(u 1)" "SELECT public.rpc_inscrever_por_codigo('ZZZZ9999');" | res)" "codigo_invalido"
verifica "inscrições fechadas (turma planeada)" "$(como "$(u 1)" "SELECT public.rpc_inscrever_por_codigo('plan2345');" | res)" "inscricoes_fechadas"
verifica "consulta da turma mostra só dados da turma e vagas" \
  "$(como "$(u 1)" "SELECT public.rpc_turma_por_codigo('abcd-2345')->>'resultado', public.rpc_turma_por_codigo('ABCD2345')->'turma'->>'vagasLivres', (public.rpc_turma_por_codigo('ABCD2345')::text ~ 'f2@teste')::text;")" "encontrada|30|false"
verifica "formando inscreve-se" "$(como "$(u 1)" "SELECT public.rpc_inscrever_por_codigo('abcd2345');" | res)" "inscrito"
verifica "repetição do pedido não duplica" "$(como "$(u 1)" "SELECT public.rpc_inscrever_por_codigo('ABCD2345');" | res)" "ja_inscrito"
verifica "uma única linha para essa conta" \
  "$($P -c "SELECT count(*) FROM public.turma_inscricoes WHERE turma_id='$T' AND perfil_id='$(u 1)';")" "1"
verifica "identidade vem da sessão (perfil_id = auth.uid())" \
  "$($P -c "SELECT perfil_id FROM public.turma_inscricoes WHERE turma_id='$T' AND perfil_id='$(u 1)';")" "$(u 1)"
verifica "inserir directamente em nome de outra pessoa é recusado" \
  "$(como "$(u 2)" "INSERT INTO public.turma_inscricoes(turma_id,perfil_id,nome) VALUES ('$T','$(u 3)','Outra');" | grep -c 'row-level security')" "1"
verifica "formando não vê inscrições de outros" \
  "$(como "$(u 2)" "SELECT count(*) FROM public.turma_inscricoes WHERE turma_id='$T';")" "0"
verifica "formando vê a sua própria inscrição" \
  "$(como "$(u 1)" "SELECT count(*) FROM public.turma_inscricoes WHERE turma_id='$T';")" "1"
verifica "auditoria regista a inscrição com o próprio formando" \
  "$($P -c "SELECT count(*)>0 FROM public.registo_auditoria WHERE entidade='turma_inscricoes' AND accao ILIKE '%INSERT%' AND utilizador_id='$(u 1)';")" "t"

echo "— limite de 30 —"
for g in $(seq 2 29); do como "$(u "$g")" "SELECT public.rpc_inscrever_por_codigo('ABCD2345');" >/dev/null; done
verifica "29 ocupadas antes da corrida" \
  "$($P -c "SELECT count(*) FROM public.turma_inscricoes WHERE turma_id='$T' AND estado<>'desistiu';")" "29"

# Duas inscrições para a ÚLTIMA vaga ao mesmo tempo. A primeira segura a
# transacção 2 s depois de inscrever; a segunda arranca durante esse tempo.
( como "$(u 30)" "SELECT public.rpc_inscrever_por_codigo('ABCD2345'); SELECT pg_sleep(2);" > /tmp/corrida-a.txt ) &
sleep 0.5
( como "$(u 31)" "SELECT public.rpc_inscrever_por_codigo('ABCD2345');" > /tmp/corrida-b.txt ) &
wait
A=$(res < /tmp/corrida-a.txt); B=$(res < /tmp/corrida-b.txt)
verifica "corrida pela última vaga: uma entra, outra recebe turma cheia" "$A/$B" "inscrito/turma_cheia"
verifica "30 inscritos, nunca 31" \
  "$($P -c "SELECT count(*) FROM public.turma_inscricoes WHERE turma_id='$T' AND estado<>'desistiu';")" "30"

echo "— gestão e reactivação —"
verifica "gestão não ultrapassa o limite" \
  "$(como "$COORD" "INSERT INTO public.turma_inscricoes(turma_id,nome) VALUES ('$T','Extra');" | grep -c TURMA_CHEIA)" "1"
como "$COORD" "UPDATE public.turma_inscricoes SET estado='desistiu' WHERE turma_id='$T' AND perfil_id='$(u 2)';" >/dev/null
# Corrida entre gestão e reactivação pela vaga libertada
( como "$COORD" "INSERT INTO public.turma_inscricoes(turma_id,nome) VALUES ('$T','Pela gestão'); SELECT 'GESTAO_OK'; SELECT pg_sleep(2);" > /tmp/corrida-c.txt ) &
sleep 0.5
( como "$COORD" "UPDATE public.turma_inscricoes SET estado='inscrito' WHERE turma_id='$T' AND perfil_id='$(u 2)'; SELECT 'REACT_OK';" > /tmp/corrida-d.txt ) &
wait
verifica "corrida gestão × reactivação: só uma ocupa a vaga" \
  "$(grep -c GESTAO_OK /tmp/corrida-c.txt)/$(grep -c TURMA_CHEIA /tmp/corrida-d.txt)" "1/1"
verifica "continua com 30" \
  "$($P -c "SELECT count(*) FROM public.turma_inscricoes WHERE turma_id='$T' AND estado<>'desistiu';")" "30"
verifica "reactivação pelo formando recusa com turma cheia" \
  "$(como "$(u 2)" "SELECT public.rpc_inscrever_por_codigo('ABCD2345');" | res)" "turma_cheia"
verifica "email repetido na mesma turma é recusado" \
  "$(como "$COORD" "UPDATE public.turma_inscricoes SET estado='desistiu' WHERE nome='Pela gestão'; INSERT INTO public.turma_inscricoes(turma_id,nome,email) VALUES ('$T','Dup','F3@teste.local');" | grep -c 'duplicate key')" "1"

echo
echo "inscrição — passaram: $OK   falharam: $MAU"
[ "$MAU" -eq 0 ] || exit 1
