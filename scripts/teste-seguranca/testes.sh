#!/bin/bash
# Testes de integração contra a base EFÉMERA: barreiras de escalada de papel,
# políticas de gestão e privilégios mínimos. Cada bloco abre uma ligação nova.
PSQL="psql -h ${PGDIR:-/tmp/pgtest-seguranca} -p ${PGPORTA:-55433} -U postgres -d postgres -X -q -t -A"
A=00000000-0000-0000-0000-0000000000a1
B=00000000-0000-0000-0000-0000000000b1
ADM=00000000-0000-0000-0000-0000000000ad
AUD=00000000-0000-0000-0000-0000000000cd
NOVO=00000000-0000-0000-0000-0000000000f1

falhas=0
ok() { echo "  OK   $1"; }
ko() { echo "  FALHA $1 (obtido: $2)"; falhas=$((falhas+1)); }

como() { # como <uid> <sql>
  $PSQL <<SQL 2>&1
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '$1', false);
$2
SQL
}
limpo() { como "$1" "$2" | tail -1; }
recusa() { # recusa <descrição> <uid> <sql>
  r=$(como "$2" "$3" | grep -c 'ERRO\|ERROR\|reservada\|só pode criar\|denied\|violates')
  [ "$r" -ge 1 ] && ok "$1" || ko "$1" "sem erro"
}
aceita() { # aceita <descrição> <uid> <sql>
  r=$(limpo "$2" "$3")
  [ "$r" = "feito" ] && ok "$1" || ko "$1" "$r"
}

echo "1. Escalada de papel em perfis"
recusa "formando não se promove a admin (UPDATE)" $A \
  "UPDATE public.perfis SET papel='admin_ologa' WHERE id='$A';"
recusa "formando não altera o papel de outro (UPDATE)" $A \
  "UPDATE public.perfis SET papel='admin_ologa' WHERE id='$B';"
recusa "novo perfil próprio com papel elevado (INSERT)" $NOVO \
  "INSERT INTO public.perfis (id,nome,email,papel) VALUES ('$NOVO','N','n@exemplo.invalid','admin_ologa');"
recusa "perfil criado com o id de outra pessoa (INSERT)" $NOVO \
  "INSERT INTO public.perfis (id,nome,email,papel) VALUES ('$B','N','n@exemplo.invalid','formando');"
recusa "upsert que muda o papel (INSERT ... ON CONFLICT DO UPDATE)" $A \
  "INSERT INTO public.perfis (id,nome,email,papel) VALUES ('$A','A','a@exemplo.invalid','formando')
   ON CONFLICT (id) DO UPDATE SET papel='admin_ologa';"
aceita "perfil próprio com papel formando é aceite" $NOVO \
  "INSERT INTO public.perfis (id,nome,email,papel) VALUES ('$NOVO','N','n@exemplo.invalid','formando') RETURNING 'feito';"
aceita "administração altera papéis" $ADM \
  "UPDATE public.perfis SET papel='gestor_instituicao' WHERE id='$B' RETURNING 'feito';"

echo "2. Atribuição de papéis do sistema"
recusa "formando não se atribui admin_atdi" $A \
  "INSERT INTO public.utilizador_papeis (utilizador_id,papel) VALUES ('$A','admin_atdi');"
recusa "formando não se atribui coordenador_nacional" $A \
  "INSERT INTO public.utilizador_papeis (utilizador_id,papel) VALUES ('$A','coordenador_nacional');"
recusa "formando não atribui papéis a outros" $A \
  "INSERT INTO public.utilizador_papeis (utilizador_id,papel) VALUES ('$B','auditor_atdi');"
recusa "auditor não se promove" $AUD \
  "INSERT INTO public.utilizador_papeis (utilizador_id,papel) VALUES ('$AUD','admin_atdi');"
recusa "formando não apaga o papel de auditor" $A \
  "DELETE FROM public.utilizador_papeis WHERE utilizador_id='$AUD';"
aceita "administração atribui papéis" $ADM \
  "INSERT INTO public.utilizador_papeis (utilizador_id,papel) VALUES ('$A','formador') RETURNING 'feito';"

echo "3. Políticas de gestão (workshops)"
recusa "formando não escreve em workshops" $A \
  "INSERT INTO public.workshops (provincia) VALUES ('Maputo');"
recusa "auditor não escreve em workshops (só leitura)" $AUD \
  "INSERT INTO public.workshops (provincia) VALUES ('Maputo');"
aceita "administração escreve em workshops" $ADM \
  "INSERT INTO public.workshops (provincia) VALUES ('Maputo') RETURNING 'feito';"
r=$(limpo $AUD "SELECT count(*) FROM public.workshops;")
[ "$r" = "1" ] && ok "auditor lê workshops" || ko "auditor lê workshops" "$r"
r=$(limpo $A "SELECT count(*) FROM public.workshops;")
[ "$r" = "0" ] && ok "formando não lê workshops" || ko "formando não lê workshops" "$r"

echo "4. Privilégios mínimos (anon)"
r=$($PSQL <<SQL 2>&1 | grep -c 'denied\|ERRO\|ERROR'
SET ROLE anon;
INSERT INTO public.utilizador_papeis (utilizador_id,papel) VALUES ('$A','admin_atdi');
SQL
)
[ "$r" -ge 1 ] && ok "anónimo sem INSERT em utilizador_papeis" || ko "anónimo sem INSERT" "$r"
r=$($PSQL <<SQL 2>&1 | grep -c 'denied\|ERRO\|ERROR'
SET ROLE anon;
SELECT public.tem_papel('$A','admin_atdi');
SQL
)
[ "$r" -ge 1 ] && ok "anónimo não sonda papéis (tem_papel)" || ko "anónimo não sonda papéis" "$r"
r=$($PSQL <<SQL 2>&1 | grep -c 'denied\|ERRO\|ERROR'
SET ROLE anon;
SELECT public.pode_gerir_programa('$A');
SQL
)
[ "$r" -ge 1 ] && ok "anónimo não executa pode_gerir_programa" || ko "anónimo não executa pode_gerir_programa" "$r"

echo
if [ "$falhas" = "0" ]; then echo "Todos os testes passaram."; else echo "$falhas teste(s) falharam."; exit 1; fi
