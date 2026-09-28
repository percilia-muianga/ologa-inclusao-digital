#!/bin/bash
set -u
P="psql -h ${PGDIR} -p ${PGPORTA} -U postgres -d postgres -X -q -t -A -v ON_ERROR_STOP=1"
OK=0; MAU=0
ADMIN=00000000-0000-0000-0000-0000000000a1
COORD=00000000-0000-0000-0000-0000000000c1
como() { local s=""; [ -n "$2" ] && s="SET LOCAL request.jwt.claim.sub = '$2';"
  $P <<SQL 2>&1 | tr '\n' ' '
BEGIN; SET LOCAL ROLE $1; $s
$3
${4:-ROLLBACK};
SQL
}
ok()     { if echo "$2" | grep -qi "ERROR"; then echo "FALHA  $1 -> $2"; MAU=$((MAU+1)); else echo "ok     $1"; OK=$((OK+1)); fi; }
recusa() { if echo "$2" | grep -q "$3"; then echo "ok     $1 ($3)"; OK=$((OK+1)); else echo "FALHA  $1 -> esperado $3: $2"; MAU=$((MAU+1)); fi; }
igual()  { if [ "$2" = "$3" ]; then echo "ok     $1 ($2)"; OK=$((OK+1)); else echo "FALHA  $1 -> obtido '$2', esperado '$3'"; MAU=$((MAU+1)); fi; }
# Preparação feita como Administrador Geral autenticado (o gatilho exige actor verificado).
ok "preparar questão de outro curso" "$(como authenticated "$ADMIN" "INSERT INTO public.banco_questoes(curso_id, modulo_id, codigo, instrumento, tipologia, dificuldade, enunciado, conteudo, resposta, explicacao, cenario, activa, estado_revisao, versao, autor_nome) VALUES ('00000000-0000-0000-0000-0000000000b9','3d0dd3a0-a53b-4800-a032-68527d708eb1','OUTRO-01','exame_final','verdadeiro_falso','facil','Questão de outro curso (teste)','{}','{\"valor\":true}','x',false,false,'rascunho','v1','teste');" COMMIT)"
impressao_outros() { $P -c "SELECT md5(string_agg(b::text,'|' ORDER BY b.id)) FROM public.banco_questoes b WHERE curso_id='00000000-0000-0000-0000-0000000000b9'"; }
OUTROS0=$(impressao_outros)
conta_aud() { $P -c "SELECT count(*) FROM public.registo_auditoria WHERE entidade='banco_questoes'"; }

for S in sc tdg redes; do
  case $S in sc) N=banco-seguranca-cibernetica; C=b1;; tdg) N=banco-tecnologias-governo; C=b2;; redes) N=banco-redes; C=b3;; esac
  CURSO=00000000-0000-0000-0000-0000000000$C
  PK="(SELECT p FROM public._pacote_teste WHERE nome='$N')"
  EST="public.rpc_estado_banco_$S()"
  IMP="SELECT public.rpc_importar_banco_$S($PK, $EST->>'hash');"
  conta() { $P -c "SELECT count(*)||'/'||count(*) FILTER (WHERE activa)||'/'||count(*) FILTER (WHERE estado_revisao='rascunho') FROM public.banco_questoes WHERE curso_id='$CURSO'"; }
  echo "=== $N ==="
  recusa "anon não lê o estado" "$(como anon "" "SELECT $EST;")" "permission denied"
  recusa "anon não importa" "$(como anon "" "$IMP")" "permission denied"
  recusa "conta sem admin_ologa recusada (estado)" "$(como authenticated "$COORD" "SELECT $EST;")" "SEM_PERMISSAO_ADMIN_GERAL"
  recusa "conta sem admin_ologa recusada (importar)" "$(como authenticated "$COORD" "SELECT public.rpc_importar_banco_$S($PK,'x');")" "SEM_PERMISSAO_ADMIN_GERAL"
  recusa "sem sessão recusada (estado)" "$(como authenticated "" "SELECT $EST;")" "SEM_SESSAO"
  recusa "sem sessão recusada (importar)" "$(como authenticated "" "SELECT public.rpc_importar_banco_$S('{}'::jsonb,'x');")" "SEM_SESSAO"
  recusa "89 questões" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_banco_$S(jsonb_set($PK,'{questoes}',($PK->'questoes')-0), $EST->>'hash');")" "PAYLOAD_FORA_DO_ESPERADO"
  recusa "questão marcada activa" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_banco_$S(jsonb_set($PK,'{questoes,0,activa}','true'), $EST->>'hash');")" "QUESTAO_INVALIDA"
  recusa "questão mudada de módulo (matriz)" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_banco_$S(jsonb_set($PK,'{questoes,0,ordem_modulo}',to_jsonb((($PK->'questoes'->0->>'ordem_modulo')::int % 2)+1+CASE WHEN ($PK->'questoes'->0->>'ordem_modulo')::int=1 THEN 0 ELSE 0 END)), $EST->>'hash');")" "MATRIZ_INVALIDA"
  recusa "dificuldade alterada (matriz)" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_banco_$S(jsonb_set($PK,'{questoes,0,dificuldade}',CASE WHEN $PK->'questoes'->0->>'dificuldade'='dificil' THEN '\"facil\"' ELSE '\"dificil\"' END::jsonb), $EST->>'hash');")" "MATRIZ_INVALIDA"
  recusa "hash desactualizado" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_banco_$S($PK,'00000000');")" "ESTADO_ALTERADO"
  igual "nada gravado após recusas" "$(conta)" "0/0/0"
  A0=$(conta_aud)
  ok "importação completa" "$(como authenticated "$ADMIN" "$IMP" COMMIT)"
  igual "90 questões, 0 activas, 90 rascunho" "$(conta)" "90/0/90"
  igual "80 exame + 10 diagnóstico" "$($P -c "SELECT count(*) FILTER (WHERE instrumento='exame_final')||'+'||count(*) FILTER (WHERE instrumento='pre_pos_teste') FROM public.banco_questoes WHERE curso_id='$CURSO'")" "80+10"
  A1=$(conta_aud)
  igual "auditoria registou 90 inserções" "$((A1-A0))" "90"
  R=$(como authenticated "$ADMIN" "$IMP" COMMIT)
  recusa "segunda importação: 0 inseridas" "$R" '"inseridas": 0'
  recusa "segunda importação: 90 inalteradas" "$R" '"inalteradas": 90'
  igual "segunda importação sem writes auditados" "$(conta_aud)" "$A1"
  ok "edição humana de uma questão" "$(como authenticated "$ADMIN" "UPDATE public.banco_questoes SET enunciado = enunciado || ' (editado)' WHERE curso_id='$CURSO' AND codigo=(SELECT min(codigo) FROM public.banco_questoes WHERE curso_id='$CURSO');" COMMIT)"
  recusa "questão editada: conflito, sem sobrescrever" "$(como authenticated "$ADMIN" "$IMP" COMMIT)" "CONFLITO_QUESTOES_DIFERENTES"
  igual "edição humana preservada" "$($P -c "SELECT count(*) FROM public.banco_questoes WHERE curso_id='$CURSO' AND enunciado LIKE '% (editado)'")" "1"
  ok "inserir questão com código alheio" "$(como authenticated "$ADMIN" "INSERT INTO public.banco_questoes(curso_id, modulo_id, codigo, instrumento, tipologia, dificuldade, enunciado, conteudo, resposta, explicacao, cenario, activa, estado_revisao, versao, autor_nome) SELECT curso_id, modulo_id, 'ALHEIO-01', instrumento, tipologia, dificuldade, 'x', conteudo, resposta, 'x', cenario, false, 'rascunho', 'v1', 'teste' FROM public.banco_questoes WHERE curso_id='$CURSO' LIMIT 1;" COMMIT)"
  recusa "código alheio no curso bloqueia" "$(como authenticated "$ADMIN" "$IMP" COMMIT)" "CODIGO_INESPERADO_NA_BASE"
  igual "contagem inalterada após recusas" "$(conta)" "91/0/91"
  ok "remover questão alheia" "$(como authenticated "$ADMIN" "DELETE FROM public.banco_questoes WHERE curso_id='$CURSO' AND codigo='ALHEIO-01';" COMMIT)"
done
igual "outro curso tem 1 questão" "$($P -c "SELECT count(*) FROM public.banco_questoes WHERE curso_id='00000000-0000-0000-0000-0000000000b9'")" "1"
igual "banco do outro curso intacto" "$(impressao_outros)" "$OUTROS0"
igual "funções sem SECURITY DEFINER" "$($P -c "SELECT count(*) FROM pg_proc WHERE proname ~ '^rpc_(estado|importar)_banco_(sc|tdg|redes)$' AND prosecdef")" "0"
igual "6 funções criadas" "$($P -c "SELECT count(*) FROM pg_proc WHERE proname ~ '^rpc_(estado|importar)_banco_(sc|tdg|redes)$'")" "6"
echo "RESULTADO: $OK passaram, $MAU falharam"
[ $MAU -eq 0 ]
