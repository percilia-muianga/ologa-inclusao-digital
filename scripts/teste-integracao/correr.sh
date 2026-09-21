#!/bin/bash
# Integração completa das migrações de segurança numa base EFÉMERA em /tmp.
#
# Aplica, por ordem e sem alterações, todas as migrações de esquema do
# repositório (0000 a 0016), excepto a migração de sementes
# 0002_seed_program_courses.sql, que não é executada por ser carga de dados.
# Nunca usa url nem credenciais do projecto; a base vive só em /tmp.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$DIR/../.." && pwd)"
BASE=/tmp/pgtest-integracao
PORTA=55434

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
$P -f "$DIR/ambiente.sql"

for f in "$RAIZ"/drizzle/migrations/*.sql; do
  case "$f" in *seed*) echo "ignorada (sementes): $(basename "$f")"; continue;; esac
  echo "aplicar: $(basename "$f")"
  $P -f "$f"
done

# Ajuste de ambiente: no projecto real o Supabase concede EXECUTE a
# "authenticated" nas funções à medida que são criadas. Aqui isso é reposto
# depois das migrações, com as MESMAS permissões verificadas na base do
# projecto (authenticated e service_role), para o teste reflectir a realidade.
$P -c "GRANT EXECUTE ON FUNCTION public.e_admin_atdi(uuid), public.e_auditor_atdi(uuid), public.tem_papel(uuid, public.papel_sistema), public.is_admin(uuid) TO authenticated, service_role;"

$P -f "$DIR/dados.sql"
echo
PGDIR="$BASE" PGPORTA=$PORTA bash "$DIR/testes.sh"
