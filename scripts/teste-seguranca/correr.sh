#!/bin/bash
# Testes de integração das barreiras de segurança (migrações 0013 e 0015).
#
# Cria uma base PostgreSQL EFÉMERA em /tmp, aplica as partes de segurança das
# migrações tal e qual como estão no repositório e corre os testes com várias
# identidades. NUNCA toca na base do projecto: não usa url nem credenciais de
# produção, só escreve em /tmp e a base é destruída no fim.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$DIR/../.." && pwd)"
BASE=/tmp/pgtest-seguranca
PORTA=55433

rm -rf "$BASE"; mkdir -p "$BASE"
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

# Partes da 0013 aplicáveis a este andaime, extraídas do ficheiro do repositório
# sem qualquer alteração: funções de decisão, revogações e políticas de workshops.
M13="$RAIZ/drizzle/migrations/0013_seguranca_gestao_auditoria.sql"
{ sed -n '7,31p' "$M13"; sed -n '78,85p' "$M13"; } > "$BASE/0013-parcial.sql"
$P -f "$BASE/0013-parcial.sql"

# A 0015 é aplicada na íntegra, tal e qual como está no repositório.
$P -f "$RAIZ/drizzle/migrations/0015_reforco_barreira_papel.sql"
$P -f "$DIR/dados.sql"
echo "Base efémera pronta; migrações de segurança aplicadas sem alterações."
echo

PGDIR="$BASE" PGPORTA=$PORTA bash "$DIR/testes.sh"
