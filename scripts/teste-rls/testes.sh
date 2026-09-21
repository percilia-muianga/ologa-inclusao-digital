#!/bin/bash
# Testes de integração reais contra a base efémera: RLS, autorização,
# persistência e duplicação. Cada bloco abre uma ligação nova (psql) —
# leitura depois de gravação é mesmo leitura noutra sessão.
PSQL="psql -h ${PGDIR:-/tmp/pgtest-rls} -p ${PGPORTA:-55432} -U postgres -d postgres -X -q -t -A"
A=00000000-0000-0000-0000-00000000000a
B=00000000-0000-0000-0000-00000000000b
EQ=00000000-0000-0000-0000-0000000000ee
INS_A1=11cc0000-0000-0000-0000-00000000000a
INS_A2=11cc0000-0000-0000-0000-0000000000a2
INS_B=11cc0000-0000-0000-0000-00000000000b
L1=11ee0000-0000-0000-0000-000000000001
L2=11ee0000-0000-0000-0000-000000000002

falhas=0
ok() { echo "  OK   $1"; }
ko() { echo "  FALHA $1 (obtido: $2)"; falhas=$((falhas+1)); }
verificar() { [ "$2" = "$3" ] && ok "$1" || ko "$1" "$2"; }

como() { # como <uid> <sql>
  $PSQL <<SQL 2>&1
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '$1', false);
$2
SQL
}
limpo() { como "$1" "$2" | tail -1; }

echo "1. Gravação na própria matrícula"
r=$(limpo $A "INSERT INTO public.progresso_licoes_matricula (inscricao_id, licao_id) VALUES ('$INS_A1','$L1') RETURNING 'gravado';")
verificar "A grava na sua matrícula" "$r" "gravado"

echo "2. Leitura depois da gravação, em ligação nova"
r=$(limpo $A "SELECT count(*) FROM public.progresso_licoes_matricula WHERE inscricao_id='$INS_A1';")
verificar "A relê o que gravou" "$r" "1"

echo "3. Duplicação"
r=$(limpo $A "INSERT INTO public.progresso_licoes_matricula (inscricao_id, licao_id) VALUES ('$INS_A1','$L1');" | grep -c 'duplicate key\|progresso_licoes_matricula_unico')
[ "$r" -ge 1 ] && ok "duplicado recusado pela unicidade" || ko "duplicado recusado" "$r"

echo "4. Acesso cruzado — escrita"
r=$(limpo $A "INSERT INTO public.progresso_licoes_matricula (inscricao_id, licao_id) VALUES ('$INS_B','$L1');" | grep -c 'row-level security')
[ "$r" -ge 1 ] && ok "A não grava na matrícula de B" || ko "A não grava na matrícula de B" "$r"

echo "5. Acesso cruzado — leitura"
r=$(limpo $B "SELECT count(*) FROM public.progresso_licoes_matricula;")
verificar "B não vê o progresso de A" "$r" "0"

echo "6. Acesso cruzado — apagar"
r=$(limpo $B "WITH d AS (DELETE FROM public.progresso_licoes_matricula WHERE inscricao_id='$INS_A1' RETURNING 1) SELECT count(*) FROM d;")
verificar "B não apaga o progresso de A" "$r" "0"
r=$(limpo $A "SELECT count(*) FROM public.progresso_licoes_matricula WHERE inscricao_id='$INS_A1';")
verificar "o registo de A continua lá" "$r" "1"

echo "7. Duas matrículas da mesma pessoa não se contaminam"
limpo $A "INSERT INTO public.progresso_licoes_matricula (inscricao_id, licao_id) VALUES ('$INS_A2','$L2');" >/dev/null
r=$(limpo $A "SELECT count(*) FROM public.progresso_licoes_matricula WHERE inscricao_id='$INS_A1';")
verificar "matrícula 1 continua com 1 lição" "$r" "1"
r=$(limpo $A "SELECT count(*) FROM public.progresso_licoes_matricula WHERE inscricao_id='$INS_A2';")
verificar "matrícula 2 tem a sua própria lição" "$r" "1"

echo "8. Equipa de formação lê, mas não escreve por outrem"
r=$(limpo $EQ "SELECT count(*) FROM public.progresso_licoes_matricula;")
verificar "equipa lê os dois registos" "$r" "2"
r=$(limpo $EQ "INSERT INTO public.progresso_licoes_matricula (inscricao_id, licao_id) VALUES ('$INS_B','$L1');" | grep -c 'row-level security')
[ "$r" -ge 1 ] && ok "equipa não grava por um formando" || ko "equipa não grava por um formando" "$r"

echo "9. Matrículas: cada pessoa só vê as suas"
r=$(limpo $A "SELECT count(*) FROM public.turma_inscricoes;")
verificar "A vê as suas duas matrículas" "$r" "2"
r=$(limpo $B "SELECT count(*) FROM public.turma_inscricoes;")
verificar "B vê só a sua" "$r" "1"

echo
[ $falhas -eq 0 ] && echo "TODOS OS TESTES DE INTEGRAÇÃO PASSARAM" || echo "FALHAS: $falhas"
exit $falhas
