#!/bin/bash
# Discussão pedagógica por turma: acesso, respostas, acompanhamento e moderação.
# Corre sobre a base EFÉMERA criada por correr.sh; contas e turmas inventadas.
set -u
P="psql -h ${PGDIR} -p ${PGPORTA} -U postgres -d postgres -X -q -t -A -v ON_ERROR_STOP=1"
OK=0; MAU=0
COORD=00000000-0000-0000-0000-0000000000c1
AUD=00000000-0000-0000-0000-0000000000d1
FA=00000000-0000-0000-0000-0000000d15a1   # formando turma A
FB=00000000-0000-0000-0000-0000000d15b1   # formando turma B
FX=00000000-0000-0000-0000-0000000d15c1   # desistiu da turma A
PA=00000000-0000-0000-0000-0000000d15f1   # formador da turma A
PB=00000000-0000-0000-0000-0000000d15f2   # formador da turma B
TA=00000000-0000-0000-0000-0000000d1aa1
TB=00000000-0000-0000-0000-0000000d1bb1

verifica() { if [ "$2" = "$3" ]; then echo "ok     $1"; OK=$((OK+1)); else echo "FALHA  $1 -> obtido [$2] esperado [$3]"; MAU=$((MAU+1)); fi; }
como() {
  $P <<SQL 2>&1 | tr '\n' ' ' | sed 's/ *$//'
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '$1';
$2
COMMIT;
SQL
}
recusa() { grep -Eqi "violates row-level|DISCUSSAO_|permission denied|ERROR" <<<"$1" && echo recusado || echo aceite; }

$P <<SQL >/dev/null
INSERT INTO auth.users(id,email) VALUES ('$FA','fa@t.local'),('$FB','fb@t.local'),('$FX','fx@t.local'),('$PA','pa@t.local'),('$PB','pb@t.local');
INSERT INTO public.perfis(id,nome,email) VALUES ('$FA','Formando A','fa@t.local'),('$FB','Formando B','fb@t.local'),('$FX','Formando X','fx@t.local'),('$PA','Formador A','pa@t.local'),('$PB','Formador B','pb@t.local');
INSERT INTO public.utilizador_papeis(utilizador_id,papel) VALUES ('$PA','formador'),('$PB','formador');
INSERT INTO public.turmas(id,curso_id,designacao,codigo_inscricao,provincia,distrito,modalidade,estado,formador_principal_id)
  VALUES ('$TA','00000000-0000-0000-0000-00000000c001','Turma A','DDDA2345','Niassa','Lichinga','presencial','a_decorrer','$PA'),
         ('$TB','00000000-0000-0000-0000-00000000c001','Turma B','DDDB2345','Tete','Tete','presencial','a_decorrer','$PB');
INSERT INTO public.turma_inscricoes(turma_id,perfil_id,nome,email,estado) VALUES
  ('$TA','$FA','Formando A','fa@t.local','inscrito'),('$TB','$FB','Formando B','fb@t.local','inscrito'),
  ('$TA','$FX','Formando X','fx@t.local','desistiu');
SQL

echo "— acesso por turma —"
verifica "formando A cria dúvida na sua turma" "$(recusa "$(como $FA "INSERT INTO public.discussao_topicos(turma_id,autor_id,titulo,mensagem) VALUES ('$TA','$FA','Dúvida sobre sub-redes','Como calcular a máscara /26?');")")" "aceite"
T1=$($P -c "SELECT id FROM public.discussao_topicos WHERE turma_id='$TA' LIMIT 1;")
verifica "nome do autor vem da base, não do pedido" "$(recusa "$(como $FA "INSERT INTO public.discussao_topicos(turma_id,autor_id,autor_nome,titulo,mensagem) VALUES ('$TA','$FA','Formador A','Outra dúvida','Mensagem de teste');")")/$($P -c "SELECT count(*) FROM public.discussao_topicos WHERE autor_nome='Formador A';")" "aceite/0"
verifica "formando B não cria dúvida na turma A" "$(recusa "$(como $FB "INSERT INTO public.discussao_topicos(turma_id,autor_id,titulo,mensagem) VALUES ('$TA','$FB','Intrusão','Mensagem de teste');")")" "recusado"
verifica "formando A não publica em nome de B" "$(recusa "$(como $FA "INSERT INTO public.discussao_topicos(turma_id,autor_id,titulo,mensagem) VALUES ('$TA','$FB','Falso','Mensagem de teste');")")" "recusado"
verifica "formando B não lê dúvidas da turma A" "$(como $FB "SELECT count(*) FROM public.discussao_topicos WHERE turma_id='$TA';")" "0"
verifica "inscrição anulada perde acesso" "$(como $FX "SELECT count(*) FROM public.discussao_topicos WHERE turma_id='$TA';")" "0"
verifica "formador B não lê a turma A" "$(como $PB "SELECT count(*) FROM public.discussao_topicos WHERE turma_id='$TA';")" "0"
verifica "formador B não responde na turma A" "$(recusa "$(como $PB "INSERT INTO public.discussao_respostas(topico_id,turma_id,autor_id,mensagem) VALUES ('$T1','$TA','$PB','Resposta indevida');")")" "recusado"
verifica "resposta com turma trocada é recusada" "$(recusa "$(como $FB "INSERT INTO public.discussao_respostas(topico_id,turma_id,autor_id,mensagem) VALUES ('$T1','$TB','$FB','Truque');")")" "recusado"
verifica "sem sessão não lê" "$(como '' "SELECT count(*) FROM public.discussao_topicos;")" "0"
verifica "anónimo sem permissão" "$(recusa "$($P -c "SET ROLE anon; SELECT count(*) FROM public.discussao_topicos;" 2>&1)")" "recusado"
verifica "lista de turmas do formando B só tem B" "$(como $FB "SELECT string_agg(e->>'designacao', ',') FROM jsonb_array_elements(public.rpc_discussao_turmas()) e;")" "Turma B"
verifica "lista do formador A só tem A, papel formador" "$(como $PA "SELECT string_agg((e->>'designacao')||':'||(e->>'papel'), ',') FROM jsonb_array_elements(public.rpc_discussao_turmas()) e;")" "Turma A:formador"

echo "— resposta e acompanhamento —"
verifica "formador A responde" "$(recusa "$(como $PA "INSERT INTO public.discussao_respostas(topico_id,turma_id,autor_id,mensagem) VALUES ('$T1','$TA','$PA','Use 255.255.255.192.');")")" "aceite"
verifica "dúvida passa a respondida; papel formador gravado" "$($P -c "SELECT estado FROM public.discussao_topicos WHERE id='$T1';")/$($P -c "SELECT papel_autor FROM public.discussao_respostas WHERE topico_id='$T1';")" "respondida/formador"
verifica "formando não se declara formador" "$(como $FA "INSERT INTO public.discussao_respostas(topico_id,turma_id,autor_id,papel_autor,mensagem) VALUES ('$T1','$TA','$FA','formador','Obrigado, percebi.'); SELECT papel_autor FROM public.discussao_respostas WHERE autor_id='$FA';")" "formando"
verifica "nova mensagem do autor reabre a dúvida" "$($P -c "SELECT estado FROM public.discussao_topicos WHERE id='$T1';")" "aberta"
verifica "autor marca como resolvida" "$(recusa "$(como $FA "UPDATE public.discussao_topicos SET estado='resolvida' WHERE id='$T1';")")/$($P -c "SELECT estado FROM public.discussao_topicos WHERE id='$T1';")" "aceite/resolvida"
verifica "autor não altera título depois de publicar" "$(recusa "$(como $FA "UPDATE public.discussao_topicos SET titulo='Mudado' WHERE id='$T1';")")" "recusado"
verifica "autor não se auto-marca respondida" "$(recusa "$(como $FA "UPDATE public.discussao_topicos SET estado='respondida' WHERE id='$T1';")")" "recusado"
verifica "formando não oculta" "$(recusa "$(como $FA "UPDATE public.discussao_topicos SET oculto=true, moderacao_motivo='x x x' WHERE id='$T1';")")" "recusado"
verifica "formador não oculta" "$(recusa "$(como $PA "UPDATE public.discussao_topicos SET oculto=true, moderacao_motivo='Fora do tema' WHERE id='$T1';")")" "recusado"
verifica "ninguém elimina" "$(recusa "$(como $COORD "DELETE FROM public.discussao_topicos WHERE id='$T1';")")" "recusado"

echo "— moderação —"
R1=$($P -c "SELECT id FROM public.discussao_respostas WHERE autor_id='$FA' LIMIT 1;")
verifica "ocultar exige motivo" "$(recusa "$(como $COORD "UPDATE public.discussao_respostas SET oculto=true WHERE id='$R1';")")" "recusado"
verifica "coordenação oculta resposta com motivo" "$(recusa "$(como $COORD "UPDATE public.discussao_respostas SET oculto=true, moderacao_motivo='Dados pessoais' WHERE id='$R1';")")" "aceite"
verifica "coordenação não altera a mensagem" "$(recusa "$(como $COORD "UPDATE public.discussao_respostas SET mensagem='Reescrita' WHERE id='$R1';")")" "recusado"
verifica "auditor não modera" "$(recusa "$(como $AUD "UPDATE public.discussao_respostas SET oculto=false, moderacao_motivo=NULL WHERE id='$R1';")")/$($P -c "SELECT oculto FROM public.discussao_respostas WHERE id='$R1';")" "aceite/t"
como $COORD "UPDATE public.discussao_topicos SET oculto=true, moderacao_motivo='Tema repetido' WHERE id='$T1';" >/dev/null
verifica "tópico oculto: autor ainda vê, formando B não" "$(como $FA "SELECT count(*) FROM public.discussao_topicos WHERE id='$T1';")" "1"
verifica "tópico oculto não aceita novas respostas do formando" "$(recusa "$(como $FA "INSERT INTO public.discussao_respostas(topico_id,turma_id,autor_id,mensagem) VALUES ('$T1','$TA','$FA','Mais uma');")")" "recusado"
verifica "auditoria regista criação, resposta e moderação" "$($P -c "SELECT count(DISTINCT entidade) FROM public.registo_auditoria WHERE entidade IN ('discussao_topicos','discussao_respostas');")/$($P -c "SELECT count(*)>0 FROM public.registo_auditoria WHERE entidade='discussao_respostas' AND utilizador_id='$COORD';")" "2/t"

echo
echo "discussão — passaram: $OK   falharam: $MAU"
[ "$MAU" -eq 0 ] || exit 1
