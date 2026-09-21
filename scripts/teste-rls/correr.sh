#!/bin/bash
# Testes de integração das políticas de acesso ao progresso por matrícula.
#
# Cria uma base PostgreSQL EFÉMERA em /tmp, aplica a migração
# drizzle/migrations/0010_progresso_licoes_matricula.sql tal e qual como está
# no repositório e corre os testes de autorização com duas identidades.
#
# NUNCA toca na base de dados do projecto: só escreve em /tmp e a base é
# destruída no fim. Não existe aqui nenhum dado real.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$DIR/../.." && pwd)"
BASE=/tmp/pgtest-rls
PORTA=55432

rm -rf "$BASE"; mkdir -p "$BASE"
# O PostgreSQL recusa correr como root; usa-se o utilizador normal do ambiente.
if [ "$(id -u)" = "0" ]; then
  chown -R 1000 "$BASE"
  COMO() { setpriv --reuid=1000 --regid=1000 --clear-groups bash -c "$1"; }
else
  COMO() { bash -c "$1"; }
fi

COMO "initdb -D $BASE/data -U postgres --auth=trust" >"$BASE/initdb.log" 2>&1
COMO "pg_ctl -D $BASE/data -o \"-p $PORTA -k $BASE -c listen_addresses=''\" -l $BASE/pg.log start" >/dev/null
terminar() { COMO "pg_ctl -D $BASE/data -m immediate stop" >/dev/null 2>&1 || true; }
trap terminar EXIT

for _ in $(seq 1 30); do
  psql -h "$BASE" -p $PORTA -U postgres -c 'select 1' >/dev/null 2>&1 && break
  sleep 1
done

P="psql -h $BASE -p $PORTA -U postgres -d postgres -X -q -v ON_ERROR_STOP=1"
$P -f "$DIR/scaffold.sql"
$P -f "$RAIZ/drizzle/migrations/0010_progresso_licoes_matricula.sql"
$P -f "$DIR/dados.sql"
echo "Base efémera pronta; migração 0010 aplicada sem alterações."
echo

PGDIR="$BASE" PGPORTA=$PORTA bash "$DIR/testes.sh"
