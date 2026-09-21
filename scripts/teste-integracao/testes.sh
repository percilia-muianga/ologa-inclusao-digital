#!/bin/bash
# Testes sobre a base EFÉMERA criada por correr.sh (0000 a 0016 aplicadas).
# Cada teste corre com uma identidade concreta: papel do Postgres + auth.uid().
set -u
P="psql -h ${PGDIR} -p ${PGPORTA} -U postgres -d postgres -X -q -t -A -v ON_ERROR_STOP=1"
OK=0; MAU=0
ADMIN=00000000-0000-0000-0000-0000000000a1
COORD=00000000-0000-0000-0000-0000000000c1
FORMANDO=00000000-0000-0000-0000-0000000000f1
AUDITOR=00000000-0000-0000-0000-0000000000d1

# executa SQL como um papel/identidade; imprime OK ou ERRO:<mensagem>
como() { # $1 papel pg, $2 uid (ou vazio), $3 sql
  local sub="$2"
  local set_sub=""
  [ -n "$sub" ] && set_sub="SET LOCAL request.jwt.claim.sub = '$sub';"
  $P <<SQL 2>&1 | tr '\n' ' '
BEGIN;
SET LOCAL ROLE $1;
$set_sub
$3
ROLLBACK;
SQL
}

espera_ok() { # nome, saida
  if echo "$2" | grep -qi "ERROR"; then echo "FALHA  $1 -> $2"; MAU=$((MAU+1));
  else echo "ok     $1"; OK=$((OK+1)); fi
}
espera_recusa() { # nome, saida, texto esperado
  if echo "$2" | grep -qi "ERROR"; then echo "ok     $1"; OK=$((OK+1));
  else echo "FALHA  $1 -> não foi recusado ($2)"; MAU=$((MAU+1)); fi
}

echo "— actor verificado nas escritas de gestão —"
espera_recusa "escrita de gestão sem auth.uid() é recusada" \
  "$(como authenticated "" "INSERT INTO public.turmas(curso_id, designacao, codigo_inscricao, provincia, distrito, modalidade) VALUES ('00000000-0000-0000-0000-00000000c001','T1','C1','Maputo','KaMpfumo','presencial');")"

espera_recusa "service_role também não escreve gestão sem actor" \
  "$(como service_role "" "INSERT INTO public.turmas(curso_id, designacao, codigo_inscricao, provincia, distrito, modalidade) VALUES ('00000000-0000-0000-0000-00000000c001','T2','C2','Maputo','KaMpfumo','presencial');")"

espera_ok "coordenação autenticada cria turma" \
  "$(como authenticated "$COORD" "INSERT INTO public.turmas(curso_id, designacao, codigo_inscricao, provincia, distrito, modalidade) VALUES ('00000000-0000-0000-0000-00000000c001','T3','C3','Maputo','KaMpfumo','presencial');")"

espera_recusa "formando não cria turma (política de escrita)" \
  "$(como authenticated "$FORMANDO" "INSERT INTO public.turmas(curso_id, designacao, codigo_inscricao, provincia, distrito, modalidade) VALUES ('00000000-0000-0000-0000-00000000c001','T4','C4','Maputo','KaMpfumo','presencial');")"

espera_recusa "auditor não escreve (só leitura)" \
  "$(como authenticated "$AUDITOR" "INSERT INTO public.turmas(curso_id, designacao, codigo_inscricao, provincia, distrito, modalidade) VALUES ('00000000-0000-0000-0000-00000000c001','T5','C5','Maputo','KaMpfumo','presencial');")"

espera_ok "auditor lê turmas" \
  "$(como authenticated "$AUDITOR" "SELECT count(*) FROM public.turmas;")"

echo "— auditoria: actor real, minimização e atomicidade —"
espera_ok "auditoria regista o actor verdadeiro da mutação" \
  "$(como authenticated "$COORD" "INSERT INTO public.turmas(curso_id, designacao, codigo_inscricao, provincia, distrito, modalidade) VALUES ('00000000-0000-0000-0000-00000000c001','T6','C6','Maputo','KaMpfumo','presencial');
  DO \$\$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.registo_auditoria WHERE entidade='turmas' AND utilizador_id='$COORD' AND contexto_actor='sessao_autenticada') THEN
      RAISE EXCEPTION 'sem registo com actor verificado';
    END IF;
  END \$\$;")"

espera_ok "auditoria não guarda valores, só nomes de colunas" \
  "$(como authenticated "$COORD" "INSERT INTO public.turmas(curso_id, designacao, codigo_inscricao, provincia, distrito, modalidade) VALUES ('00000000-0000-0000-0000-00000000c001','SEGREDO','C7','Maputo','KaMpfumo','presencial');
  DO \$\$ DECLARE r record; BEGIN
    SELECT * INTO r FROM public.registo_auditoria WHERE entidade='turmas' ORDER BY ocorrido_em DESC LIMIT 1;
    IF r.valor_anterior IS NOT NULL THEN RAISE EXCEPTION 'valor_anterior preenchido'; END IF;
    IF r.valor_novo::text LIKE '%SEGREDO%' THEN RAISE EXCEPTION 'valor gravado na auditoria'; END IF;
    IF NOT (r.valor_novo ? 'colunas') THEN RAISE EXCEPTION 'faltam nomes de colunas'; END IF;
  END \$\$;")"

espera_recusa "registo de auditoria é imutável (UPDATE)" \
  "$(como service_role "" "UPDATE public.registo_auditoria SET accao='x';")"
espera_recusa "registo de auditoria é imutável (DELETE)" \
  "$(como service_role "" "DELETE FROM public.registo_auditoria;")"

espera_recusa "se a auditoria falhar, a mutação não fica gravada" \
  "$(como postgres "" "ALTER TABLE public.registo_auditoria ADD CONSTRAINT falha_forcada CHECK (false) NOT VALID;
  SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claim.sub='$COORD';
  INSERT INTO public.turmas(curso_id, designacao, codigo_inscricao, provincia, distrito, modalidade) VALUES ('00000000-0000-0000-0000-00000000c001','T8','C8','Maputo','KaMpfumo','presencial');")"

echo "— barreiras de papel (perfis e utilizador_papeis) —"
espera_recusa "insere perfil com id de outra pessoa" \
  "$(como authenticated "$FORMANDO" "INSERT INTO public.perfis(id, nome, email) VALUES ('$ADMIN','x','x@x.local');")"
espera_recusa "insere o próprio perfil já com papel elevado" \
  "$(como authenticated "$FORMANDO" "DELETE FROM public.perfis WHERE id='$FORMANDO'; INSERT INTO public.perfis(id, nome, email, papel) VALUES ('$FORMANDO','x','x@x.local','admin_ologa');")"
espera_recusa "muda o próprio papel para administração" \
  "$(como authenticated "$FORMANDO" "UPDATE public.perfis SET papel='admin_ologa' WHERE id='$FORMANDO';")"
espera_ok "actualiza campos próprios sem tocar no papel" \
  "$(como authenticated "$FORMANDO" "UPDATE public.perfis SET nome='Novo nome' WHERE id='$FORMANDO';")"
espera_recusa "upsert do próprio perfil com papel elevado" \
  "$(como authenticated "$FORMANDO" "INSERT INTO public.perfis(id, nome, email, papel) VALUES ('$FORMANDO','x','x@x.local','admin_ologa') ON CONFLICT (id) DO UPDATE SET papel = EXCLUDED.papel;")"
espera_recusa "atribui a si um papel de sistema" \
  "$(como authenticated "$FORMANDO" "INSERT INTO public.utilizador_papeis(utilizador_id, papel) VALUES ('$FORMANDO','admin_atdi');")"
espera_recusa "anónimo não lê papéis de sistema" \
  "$(como anon "" "SELECT count(*) FROM public.utilizador_papeis;")"
espera_recusa "anónimo não escreve em turmas" \
  "$(como anon "" "INSERT INTO public.turmas(curso_id, designacao, codigo_inscricao, provincia, distrito, modalidade) VALUES ('00000000-0000-0000-0000-00000000c001','TA','CA','Maputo','KaMpfumo','presencial');")"

echo "— banco de questões e configuração de exame —"
espera_recusa "formando não cria questões" \
  "$(como authenticated "$FORMANDO" "INSERT INTO public.banco_questoes(curso_id, tipologia, dificuldade, enunciado, conteudo, resposta, explicacao, autor_nome) VALUES ('00000000-0000-0000-0000-00000000c001','verdadeiro_falso','facil','e','{}','{}','x','a');")"
espera_ok "coordenação cria questão e fica auditada" \
  "$(como authenticated "$COORD" "INSERT INTO public.banco_questoes(curso_id, tipologia, dificuldade, enunciado, conteudo, resposta, explicacao, autor_nome) VALUES ('00000000-0000-0000-0000-00000000c001','verdadeiro_falso','facil','e','{}','{}','x','a');
  DO \$\$ DECLARE r record; BEGIN
    SELECT * INTO r FROM public.registo_auditoria WHERE entidade='banco_questoes' ORDER BY ocorrido_em DESC LIMIT 1;
    IF r.utilizador_id <> '$COORD' THEN RAISE EXCEPTION 'actor errado'; END IF;
    IF r.valor_novo::text LIKE '%resposta\":%{%' THEN RAISE EXCEPTION 'gabarito na auditoria'; END IF;
  END \$\$;")"
espera_recusa "auditor não altera configuração de exame" \
  "$(como authenticated "$AUDITOR" "INSERT INTO public.exame_configuracoes(curso_id) VALUES ('00000000-0000-0000-0000-00000000c001');")"
espera_ok "coordenação guarda configuração de exame" \
  "$(como authenticated "$COORD" "INSERT INTO public.exame_configuracoes(curso_id) VALUES ('00000000-0000-0000-0000-00000000c001');")"

echo
echo "passaram: $OK   falharam: $MAU"
[ "$MAU" -eq 0 ] || exit 1
