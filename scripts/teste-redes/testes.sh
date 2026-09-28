#!/bin/bash
set -u
P="psql -h ${PGDIR} -p ${PGPORTA} -U postgres -d postgres -X -q -t -A -v ON_ERROR_STOP=1"
OK=0; MAU=0
ADMIN=00000000-0000-0000-0000-0000000000a1
COORD=00000000-0000-0000-0000-0000000000c1
CURSO=ae6347fd-007b-498f-a6f6-7b3c13b180db
# $1 papel, $2 uid, $3 sql, $4 COMMIT|ROLLBACK
como() { local s=""; [ -n "$2" ] && s="SET LOCAL request.jwt.claim.sub = '$2';"
  $P <<SQL 2>&1 | tr '\n' ' '
BEGIN; SET LOCAL ROLE $1; $s
$3
${4:-ROLLBACK};
SQL
}
IMPORTAR="SELECT public.rpc_importar_redes((SELECT p FROM public._pacote_teste), public.rpc_estado_redes()->>'hash');"
ok()     { if echo "$2" | grep -qi "ERROR"; then echo "FALHA  $1 -> $2"; MAU=$((MAU+1)); else echo "ok     $1"; OK=$((OK+1)); fi; }
recusa() { if echo "$2" | grep -q "$3"; then echo "ok     $1 ($3)"; OK=$((OK+1)); else echo "FALHA  $1 -> esperado $3: $2"; MAU=$((MAU+1)); fi; }
igual()  { if [ "$2" = "$3" ]; then echo "ok     $1 ($2)"; OK=$((OK+1)); else echo "FALHA  $1 -> obtido '$2', esperado '$3'"; MAU=$((MAU+1)); fi; }
conta_conteudo() { $P -c "SELECT count(*) FROM public.licoes l JOIN public.curso_modulos cm ON cm.modulo_id=l.modulo_id WHERE cm.curso_id='$CURSO' AND coalesce(l.conteudo_elearning,'')<>''"; }
conta_aud() { $P -c "SELECT count(*) FROM public.registo_auditoria WHERE entidade IN ('licoes','cursos','curso_modulos','modulos')"; }
impressao_outros() { $P -c "SELECT md5(string_agg(t::text, '|' ORDER BY t::text)) FROM (SELECT c::text t FROM public.cursos c WHERE slug<>'redes-avancadas-seguranca-cibernetica' UNION ALL SELECT m::text FROM public.modulos m WHERE id='3d0dd3a0-a53b-4800-a032-68527d708eb1' UNION ALL SELECT cm::text FROM public.curso_modulos cm WHERE curso_id<>'$CURSO') x"; }
OUTROS0=$(impressao_outros)

echo "— acesso —"
recusa "anon não executa a leitura de estado" "$(como anon "" "SELECT public.rpc_estado_redes();")" "permission denied"
recusa "anon não executa a importação" "$(como anon "" "$IMPORTAR")" "permission denied"
recusa "conta sem perfil admin_ologa é recusada" "$(como authenticated "$COORD" "SELECT public.rpc_estado_redes();")" "SEM_PERMISSAO_ADMIN_GERAL"
recusa "sem sessão é recusada" "$(como authenticated "" "SELECT public.rpc_importar_redes('{}'::jsonb,'x');")" "SEM_SESSAO"

echo "— sem as regras de escrita por autorizar —"
igual "estado indica regra em falta" "$(como authenticated "$ADMIN" "SELECT public.rpc_estado_redes()->>'regra_de_escrita_do_curso';" | tr -d ' ')" "false"
recusa "importação falha fechada" "$(como authenticated "$ADMIN" "$IMPORTAR" COMMIT)" "SEM_REGRA_DE_ESCRITA_CURSO"
igual "nenhuma lição gravada" "$(conta_conteudo)" "0"

echo "— validação do pacote (recusas, nada gravado) —"
recusa "59 lições" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_redes((SELECT jsonb_set(p,'{licoes}', (p->'licoes') - 0) FROM public._pacote_teste),'x');")" "PAYLOAD_FORA_DO_ESPERADO"
recusa "horas alteradas (81 h)" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_redes((SELECT jsonb_set(p,'{curso,carga_horaria}','81') FROM public._pacote_teste),'x');")" "MINUTOS_INCOERENTES"
recusa "transversal com 90 min" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_redes((SELECT jsonb_set(p,'{transversal,minutos}','90') FROM public._pacote_teste),'x');")" "MINUTOS_INCOERENTES"
recusa "curso com outro ID" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_redes((SELECT jsonb_set(p,'{curso,id}','\"00000000-0000-0000-0000-00000000c0f2\"') FROM public._pacote_teste),'x');")" "IDS_INESPERADOS"
recusa "slug de outro curso" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_redes((SELECT jsonb_set(p,'{curso,slug}','\"outro-curso\"') FROM public._pacote_teste),'x');")" "IDS_INESPERADOS"
recusa "minutos de um módulo incoerentes" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_redes((SELECT jsonb_set(jsonb_set(p,'{modulos,0,minutos}','370'),'{modulos,1,minutos}','390') FROM public._pacote_teste),'x');")" "MINUTOS_POR_MODULO_INCOERENTES"
recusa "título JSON null" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_redes((SELECT jsonb_set(p,'{licoes,3,titulo}','null') FROM public._pacote_teste),'x');")" "PAYLOAD_FORA_DO_ESPERADO"

echo "— aplicar regras POR AUTORIZAR (só nesta base efémera) —"
$P -f "$RAIZ/docs/migracoes-por-autorizar/politicas-redes.sql" >/dev/null && echo "regras aplicadas na base temporária"
igual "estado reconhece as regras" "$(como authenticated "$ADMIN" "SELECT public.rpc_estado_redes()->>'regra_de_escrita_do_curso';" | tr -d ' ')" "true"
recusa "coordenação continua sem escrever na ficha" "$(como authenticated "$COORD" "UPDATE public.cursos SET carga_horaria=1 WHERE id='$CURSO'; DO \$\$ BEGIN IF (SELECT carga_horaria FROM public.cursos WHERE id='$CURSO')=1 THEN RAISE EXCEPTION 'ESCREVEU'; END IF; RAISE EXCEPTION 'NAO_ESCREVEU'; END \$\$;")" "NAO_ESCREVEU"
recusa "admin não altera outro curso pela nova regra" "$(como authenticated "$ADMIN" "UPDATE public.cursos SET carga_horaria=1 WHERE slug='outro-curso'; DO \$\$ BEGIN IF (SELECT carga_horaria FROM public.cursos WHERE slug='outro-curso')=1 THEN RAISE EXCEPTION 'ESCREVEU'; END IF; RAISE EXCEPTION 'NAO_ESCREVEU'; END \$\$;")" "NAO_ESCREVEU"

recusa "lição com ID trocado" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_redes((SELECT jsonb_set(p,'{licoes,0,id}','\"00000000-0000-0000-0000-000000000999\"') FROM public._pacote_teste),'x');")" "LICOES_EXISTENTES_INESPERADAS"
echo "— simulação (dry-run): importa e anula —"
ok "importação completa dentro de transacção anulada" "$(como authenticated "$ADMIN" "$IMPORTAR")"
igual "após ROLLBACK nada ficou gravado" "$(conta_conteudo)" "0"

echo "— concorrência —"
recusa "hash visto desactualizado" "$(como authenticated "$ADMIN" "SELECT public.rpc_importar_redes((SELECT p FROM public._pacote_teste), 'hash-antigo-000');")" "ESTADO_ALTERADO"
recusa "estado muda entre verificação e importação" "$(como authenticated "$ADMIN" "CREATE TEMP TABLE h AS SELECT public.rpc_estado_redes()->>'hash' AS v; RESET ROLE; UPDATE public.licoes SET duracao='x' WHERE id='a75c4162-4acf-44ec-ae4b-8a49db60ad9e'; SET LOCAL ROLE authenticated; SELECT public.rpc_importar_redes((SELECT p FROM public._pacote_teste),(SELECT v FROM h));")" "ESTADO_ALTERADO"

echo "— conflito e anulação total —"
recusa "conteúdo diferente numa lição é recusado" "$(como postgres "" "UPDATE public.licoes SET conteudo_elearning='<p>outro</p>' WHERE id='a75c4162-4acf-44ec-ae4b-8a49db60ad9e'; SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claim.sub='$ADMIN'; $IMPORTAR")" "CONFLITO_CONTEUDO_EXISTENTE"
recusa "título diferente é recusado" "$(como postgres "" "UPDATE public.licoes SET titulo='Outro' WHERE id='67e5efb0-2288-4402-8a63-f80cc93634fe'; SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claim.sub='$ADMIN'; $IMPORTAR")" "CONFLITO_CONTEUDO_EXISTENTE"
recusa "módulo partilhado com outro curso é recusado" "$(como postgres "" "INSERT INTO public.curso_modulos(curso_id,modulo_id,ordem,carga_horaria_minutos,obrigatorio,transversal) VALUES ('00000000-0000-0000-0000-00000000c0f2','4203984e-da8a-405f-8450-c7c4760fe3ea',9,60,true,false); SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claim.sub='$ADMIN'; $IMPORTAR")" "MODULO_PARTILHADO_COM_OUTRO_CURSO"
recusa "lição a mais num módulo é recusada" "$(como postgres "" "INSERT INTO public.licoes(modulo_id,ordem,titulo) VALUES ('4203984e-da8a-405f-8450-c7c4760fe3ea',6,'Extra'); SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claim.sub='$ADMIN'; $IMPORTAR")" "LICOES_EXISTENTES_INESPERADAS"
recusa "falha de auditoria anula a importação inteira" "$(como postgres "" "ALTER TABLE public.registo_auditoria ADD CONSTRAINT falha_forcada CHECK (false) NOT VALID; SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claim.sub='$ADMIN'; $IMPORTAR" COMMIT)" "ERROR"
igual "depois das recusas: nenhuma lição gravada" "$(conta_conteudo)" "0"

echo "— importação real na base temporária —"
AUD0=$(conta_aud)
R1=$(como authenticated "$ADMIN" "$IMPORTAR" COMMIT)
ok "primeira importação" "$R1"
echo "       resposta: $(echo "$R1" | grep -o '{.*}')"
igual "60 lições com conteúdo" "$(conta_conteudo)" "60"
igual "total do curso = 4800 min" "$($P -c "SELECT sum(carga_horaria_minutos)+(SELECT minutos_avaliacao_orientacao FROM public.cursos WHERE id='$CURSO') FROM public.curso_modulos WHERE curso_id='$CURSO'")" "4800"
igual "12 módulos com 380 min" "$($P -c "SELECT count(*) FROM public.curso_modulos WHERE curso_id='$CURSO' AND NOT transversal AND carga_horaria_minutos=380")" "12"
igual "transversal neste curso = 120" "$($P -c "SELECT carga_horaria_minutos FROM public.curso_modulos WHERE curso_id='$CURSO' AND transversal")" "120"
igual "outros cursos e transversal global intactos" "$(impressao_outros)" "$OUTROS0"
AUD1=$(conta_aud)
igual "todos os registos de auditoria novos têm o actor admin_ologa autenticado" "$($P -c "SELECT count(*) FROM public.registo_auditoria WHERE entidade IN ('licoes','cursos','curso_modulos','modulos') AND utilizador_id='$ADMIN' AND contexto_actor='sessao_autenticada'")" "$((AUD1-AUD0))"
echo "       registos de auditoria criados: $((AUD1-AUD0))"

echo "— idempotência —"
R2=$(como authenticated "$ADMIN" "$IMPORTAR" COMMIT)
igual "segunda importação: 0 alteradas, 60 inalteradas, 0 módulos, ficha igual" "$(echo "$R2" | grep -o '{.*}' | python3 -c 'import sys,json;d=json.loads(sys.stdin.read());print(d["licoes_alteradas"],d["licoes_inalteradas"],d["modulos_alterados"],d["ficha_alterada"])')" "0 60 0 False"
igual "sem escritas nem auditoria novas" "$(conta_aud)" "$AUD1"
recusa "depois de importado, conteúdo mudado à mão bloqueia nova importação" "$(como postgres "" "UPDATE public.licoes SET conteudo_elearning=conteudo_elearning||' ' WHERE id='a75c4162-4acf-44ec-ae4b-8a49db60ad9e'; SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claim.sub='$ADMIN'; $IMPORTAR")" "CONFLITO_CONTEUDO_EXISTENTE"

echo
echo "RESULTADO: $OK ok, $MAU falhas"
[ $MAU -eq 0 ]
