#!/bin/bash
# Simulação do importador de Redes numa base EFÉMERA em /tmp (nunca a do projecto).
# Aplica todas as migrações do repositório (excepto sementes), depois as duas
# propostas POR AUTORIZAR de docs/migracoes-por-autorizar, só nesta base temporária.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$DIR/../.." && pwd)"
BASE=/tmp/pgtest-redes
PORTA=55436
rm -rf "$BASE"; mkdir -p "$BASE"
if [ "$(id -u)" = "0" ]; then chown -R 1000 "$BASE"; COMO() { setpriv --reuid=1000 --regid=1000 --clear-groups bash -c "$1"; }
else COMO() { bash -c "$1"; }; fi
COMO "initdb -D $BASE/data -U postgres --auth=trust" >"$BASE/initdb.log" 2>&1
COMO "pg_ctl -D $BASE/data -o \"-p $PORTA -k $BASE -c listen_addresses=''\" -l $BASE/pg.log start" >/dev/null
terminar() { COMO "pg_ctl -D $BASE/data -m immediate stop" >/dev/null 2>&1 || true; }
trap terminar EXIT
for _ in $(seq 1 30); do psql -h "$BASE" -p $PORTA -U postgres -c 'select 1' >/dev/null 2>&1 && break; sleep 1; done
P="psql -h $BASE -p $PORTA -U postgres -d postgres -X -q -v ON_ERROR_STOP=1"
$P -f "$RAIZ/scripts/teste-integracao/ambiente.sql"
for f in "$RAIZ"/drizzle/migrations/*.sql; do
  case "$f" in *seed*) continue;; esac
  $P -f "$f" >/dev/null
done
$P -c "GRANT EXECUTE ON FUNCTION public.e_admin_atdi(uuid), public.e_auditor_atdi(uuid), public.tem_papel(uuid, public.papel_sistema), public.is_admin(uuid), public.e_admin_geral_ologa(uuid) TO authenticated, service_role;"
$P -f "$RAIZ/scripts/teste-integracao/dados.sql" >/dev/null
(cd "$RAIZ" && bun "$DIR/gerar.ts" "$BASE")
$P -f "$BASE/fixtures.sql" >/dev/null
$P -v p="$(cat "$BASE/payload.json")" <<'SQL' >/dev/null
CREATE TABLE public._pacote_teste(p jsonb);
INSERT INTO public._pacote_teste VALUES (:'p'::jsonb);
GRANT SELECT ON public._pacote_teste TO authenticated;
SQL
echo "migrações do repositório aplicadas; aplicar funções POR AUTORIZAR (só nesta base):"
$P -f "$RAIZ/docs/migracoes-por-autorizar/importacao-redes.sql" >/dev/null
PGDIR="$BASE" PGPORTA=$PORTA RAIZ="$RAIZ" bash "$DIR/testes.sh"
