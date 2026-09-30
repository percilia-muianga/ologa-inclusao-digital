#!/bin/bash
# Exame final e certificado ligados à inscrição na turma.
# Corre sobre a base EFÉMERA criada por correr.sh. Contas, turmas e questões
# inventadas, destruídas com a base no fim.
set -u
P="psql -h ${PGDIR} -p ${PGPORTA} -U postgres -d postgres -X -q -t -A -v ON_ERROR_STOP=1"
OK=0; MAU=0
COORD=00000000-0000-0000-0000-0000000000c1
F1=00000000-0000-0000-0000-0000000000f1
G1=00000000-0000-0000-0000-0000000200a1
G2=00000000-0000-0000-0000-0000000200a2
G3=00000000-0000-0000-0000-0000000200a3
C=00000000-0000-0000-0000-00000000c001
T1=00000000-0000-0000-0000-00000000e1a1
T2=00000000-0000-0000-0000-00000000e1a2

verifica() {
  if [ "$2" = "$3" ]; then echo "ok     $1"; OK=$((OK+1));
  else echo "FALHA  $1 -> obtido [$2] esperado [$3]"; MAU=$((MAU+1)); fi
}
como() { # uid, sql — pessoa autenticada
  $P <<SQL 2>&1 | tr '\n' ' ' | sed 's/ *$//'
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '$1';
$2
COMMIT;
SQL
}
servidor() { # sql — como o servidor da plataforma (service_role)
  $P <<SQL 2>&1 | tr '\n' ' ' | sed 's/ *$//'
BEGIN;
SET LOCAL ROLE service_role;
$1
COMMIT;
SQL
}
erro() { grep -oE '[A-Z][A-Z_]{5,}' | head -1; }
insc() { $P -c "SELECT id FROM public.turma_inscricoes WHERE perfil_id='$1' AND turma_id='$2';"; }
QS="(SELECT jsonb_agg(jsonb_build_object('questao_id',id,'ordem',rn,'tipologia','verdadeiro_falso','dificuldade','facil','enunciado','x','apresentacao','{}'::jsonb,'resposta_correcta','{}'::jsonb,'explicacao','')) FROM (SELECT id, row_number() OVER () rn FROM public.banco_questoes WHERE curso_id='$C' AND enunciado LIKE 'EXM%' LIMIT 2) q)"
criar() { # actor, inscricao
  servidor "SELECT tent_id||'/'||tent_retomada FROM public.rpc_exame_tentativa_criar_matricula('$1','$2', now()+interval '1 hour', 2, $QS);"
}
submeter() { # actor, tentativa, nota
  servidor "SELECT public.rpc_exame_tentativa_submeter('$1','$2','[]'::jsonb,1,2,$3,'submetida');"
}
emitir() { # actor, inscricao, codigo, assiduidade
  servidor "SELECT cert_codigo||'/'||cert_ja_existia FROM public.rpc_certificado_curso_emitir_matricula('$1','$2','$3',$4,'estrita',$4,$4);"
}

$P <<SQL >/dev/null
INSERT INTO auth.users(id,email) VALUES ('$G1','g1@teste.local'),('$G2','g2@teste.local'),('$G3','g3@teste.local');
INSERT INTO public.perfis(id,nome,email,papel) VALUES
 ('$G1','Pessoa G1','g1@teste.local','formando'),('$G2','Pessoa G2','g2@teste.local','formando'),('$G3','Pessoa G3','g3@teste.local','formando');
SQL
como "$COORD" "INSERT INTO public.turmas(id,curso_id,designacao,codigo_inscricao,provincia,distrito,modalidade,estado) VALUES
 ('$T1','$C','Turma exame 1','EXME2345','Maputo','KaMpfumo','presencial','inscricoes_abertas'),
 ('$T2','$C','Turma exame 2','EXMF2345','Maputo','KaMpfumo','presencial','inscricoes_abertas');" >/dev/null
for u in $F1 $G1 $G2; do como "$u" "SELECT public.rpc_inscrever_por_codigo('EXME2345');" >/dev/null; done
for u in $F1 $G3; do como "$u" "SELECT public.rpc_inscrever_por_codigo('EXMF2345');" >/dev/null; done
IF1=$(insc $F1 $T1); IG1=$(insc $G1 $T1); IG2=$(insc $G2 $T1); IF1B=$(insc $F1 $T2); IG3=$(insc $G3 $T2)

echo "— condições de acesso ao exame —"
verifica "sem configuração do exame, não abre (exames inactivos)" "$(criar $F1 $IF1 | erro)" "EXAME_NAO_CONFIGURADO"
como "$COORD" "INSERT INTO public.exame_configuracoes(curso_id, numero_questoes, tentativas_max, prazo_dias) VALUES ('$C', 2, 2, 30);
INSERT INTO public.banco_questoes(curso_id,tipologia,dificuldade,enunciado,instrumento,estado_revisao,activa)
  SELECT '$C','verdadeiro_falso','facil','EXM '||g,'exame_final','em_uso',true FROM generate_series(1,5) g;" >/dev/null
verifica "banco abaixo do triplo recusa" "$(criar $F1 $IF1 | erro)" "BANCO_INSUFICIENTE"
como "$COORD" "INSERT INTO public.banco_questoes(curso_id,tipologia,dificuldade,enunciado,instrumento,estado_revisao,activa) VALUES ('$C','verdadeiro_falso','facil','EXM 6','exame_final','em_uso',true);" >/dev/null
verifica "pessoa autenticada não chama a operação directamente" \
  "$(como "$F1" "SELECT public.rpc_exame_tentativa_criar_matricula('$F1','$IF1', now(), 2, '[]');" | grep -c 'permission denied')" "1"
verifica "anónimo não chama a operação" \
  "$($P -c "SET ROLE anon; SELECT public.rpc_certificado_curso_emitir_matricula('$F1','$IF1','X',90,'estrita',90,90);" 2>&1 | grep -c 'permission denied')" "1"
verifica "outra conta não abre exame na inscrição alheia" "$(criar $G1 $IF1 | erro)" "VINCULO_NAO_VERIFICADO"

R=$(criar $F1 $IF1); TA=${R%%/*}
verifica "titular abre a 1.ª tentativa" "${R##*/}" "f"
verifica "tentativa ligada à inscrição, turma e curso" \
  "$($P -c "SELECT inscricao_id='$IF1' AND turma_id='$T1' AND curso_id='$C' AND numero=1 FROM public.exame_tentativas WHERE id='$TA';")" "t"
verifica "repetir o pedido retoma a mesma tentativa" "$(criar $F1 $IF1)" "$TA/t"
submeter $F1 $TA 50 >/dev/null
R=$(criar $F1 $IF1); TB=${R%%/*}
verifica "2.ª tentativa com número 2" "$($P -c "SELECT numero FROM public.exame_tentativas WHERE id='$TB';")" "2"
submeter $F1 $TB 80 >/dev/null
verifica "3.ª tentativa recusada" "$(criar $F1 $IF1 | erro)" "TENTATIVAS_ESGOTADAS"
verifica "mudar de turma no mesmo curso não dá tentativas extra" "$(criar $F1 $IF1B | erro)" "TENTATIVAS_ESGOTADAS"

R=$(criar $G1 $IG1); TG=${R%%/*}
verifica "outra pessoa na mesma turma tem as suas próprias tentativas (n.º 1)" \
  "$($P -c "SELECT numero FROM public.exame_tentativas WHERE id='$TG';")" "1"
verifica "sem ligação por conta, criou-se o registo de formando da própria pessoa" \
  "$($P -c "SELECT f.perfil_id FROM public.exame_tentativas t JOIN public.formandos f ON f.id=t.formando_id WHERE t.id='$TG';")" "$G1"
verifica "submeter tentativa alheia é recusado" "$(submeter $F1 $TG 100 | erro)" "VINCULO_NAO_VERIFICADO"
verifica "formando não lê tentativas de outra pessoa" \
  "$(como "$G1" "SELECT count(*) FROM public.exame_tentativas WHERE formando_id=(SELECT id FROM public.formandos WHERE perfil_id='$F1');")" "0"

como "$COORD" "UPDATE public.turmas SET data_fim='2020-01-01' WHERE id='$T2';" >/dev/null
verifica "prazo após o fim da turma expirado" "$(criar $G3 $IG3 | erro)" "PRAZO_EXPIRADO"

echo "— certificado —"
verifica "sem exame submetido não emite" "$(emitir $G2 $IG2 CODG2 95 | erro)" "SEM_EXAME_SUBMETIDO"
verifica "assiduidade abaixo do mínimo não emite" "$(emitir $F1 $IF1 CODF1 70 | erro)" "ASSIDUIDADE_INSUFICIENTE"
verifica "outra conta não emite pela inscrição alheia" "$(emitir $G1 $IF1 CODX 95 | erro)" "VINCULO_NAO_VERIFICADO"
verifica "titular emite com melhor nota da própria inscrição" "$(emitir $F1 $IF1 CODF1 90)" "CODF1/f"
verifica "certificado guarda inscrição, turma e nota 80" \
  "$($P -c "SELECT inscricao_id='$IF1' AND turma_id='$T1' AND nota_final_pct=80 AND tentativa_id='$TB' FROM public.certificados_curso WHERE codigo_verificacao='CODF1';")" "t"
verifica "repetir devolve o mesmo certificado" "$(emitir $F1 $IF1 CODF1B 90)" "CODF1/t"
verifica "pela outra turma do mesmo curso também não duplica" "$(emitir $F1 $IF1B CODF1C 90)" "CODF1/t"

submeter $G1 $TG 50 >/dev/null
verifica "nota abaixo do mínimo não emite" "$(emitir $G1 $IG1 CODG1 95 | erro)" "NOTA_INSUFICIENTE"
R=$(criar $G1 $IG1); submeter $G1 ${R%%/*} 90 >/dev/null
( emitir $G1 $IG1 CORRA 95 > /tmp/cert-a.txt ) &
( emitir $G1 $IG1 CORRB 95 > /tmp/cert-b.txt ) &
wait
verifica "dois pedidos simultâneos: um só certificado" \
  "$($P -c "SELECT count(*) FROM public.certificados_curso WHERE inscricao_id='$IG1';")" "1"
verifica "ambos recebem o mesmo código" \
  "$([ "$(cut -d/ -f1 /tmp/cert-a.txt)" = "$(cut -d/ -f1 /tmp/cert-b.txt)" ] && echo igual)" "igual"
verifica "formando não lê o certificado de outra pessoa" \
  "$(como "$G1" "SELECT count(*) FROM public.certificados_curso WHERE codigo_verificacao='CODF1';")" "0"
verifica "anónimo não lê a tabela de certificados directamente" \
  "$($P -c "SET ROLE anon; SELECT count(*) FROM public.certificados_curso;" 2>&1 | grep -cE 'permission denied|^0$')" "1"
verifica "auditoria regista a emissão" \
  "$($P -c "SELECT count(*)>0 FROM public.registo_auditoria WHERE entidade='certificados_curso';")" "t"

echo
echo "exame/certificado por inscrição: $OK ok, $MAU falhas"
[ "$MAU" = "0" ]
