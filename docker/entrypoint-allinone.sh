#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Iniciando ChatIA All-in-One en Coolify"
echo "=========================================="

DB_NAME="${DB_NAME:-chatia}"
DB_USER="${DB_USER:-chatia}"
DB_PASS="${DB_PASS:-chatia}"

# 1. Configurar PostgreSQL
echo "📦 1. Configurando e iniciando PostgreSQL..."
PG_VERSION=$(ls /usr/lib/postgresql/ 2>/dev/null | tail -n 1)
if [ -z "$PG_VERSION" ]; then
    PG_VERSION="15"
fi

PG_DATA="/var/lib/postgresql/$PG_VERSION/main"

mkdir -p /var/run/postgresql "$PG_DATA" /var/log/postgresql
chown -R postgres:postgres /var/run/postgresql /var/lib/postgresql /var/log/postgresql

# El paquete postgresql de Debian pre-crea un cluster cuyo postgresql.conf vive
# en /etc/postgresql (no en el datadir), lo que hace fallar a `pg_ctl -D`.
# Comprobamos el postgresql.conf DENTRO del datadir: si falta, (re)inicializamos
# un cluster autoservido. También cubre el caso de un volumen nuevo/vacío.
if [ ! -f "$PG_DATA/postgresql.conf" ]; then
    echo "   (Re)inicializando cluster autoservido de PostgreSQL en $PG_DATA..."
    rm -rf "$PG_DATA"
    mkdir -p "$PG_DATA"
    chown -R postgres:postgres "$PG_DATA"
    su - postgres -c "/usr/lib/postgresql/$PG_VERSION/bin/initdb -D $PG_DATA"
fi

echo "   Arrancando daemon de PostgreSQL..."
su - postgres -c "/usr/lib/postgresql/$PG_VERSION/bin/pg_ctl -D $PG_DATA -l /var/log/postgresql/postgresql.log start"

echo "   Aguardando disponibilidad de PostgreSQL..."
until su - postgres -c "pg_isready" 2>/dev/null; do
    sleep 1
done

# Crear usuario y base de datos si no existen
echo "   Verificando base de datos '$DB_NAME' y usuario '$DB_USER'..."
su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'\" | grep -q 1 || psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' SUPERUSER;\""
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='$DB_NAME'\" | grep -q 1 || psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\""

echo "✅ PostgreSQL está listo."

# 2. Configurar Redis
echo "📦 2. Iniciando Redis..."
mkdir -p /var/log/redis /var/lib/redis
chown -R redis:redis /var/log/redis /var/lib/redis
redis-server --daemonize yes

until redis-cli ping 2>/dev/null | grep -q PONG; do
    sleep 1
done
echo "✅ Redis está listo."

# 3. Ejecutar Migraciones de Base de Datos
echo "🔄 3. Ejecutando migraciones de Sequelize..."
cd /app/backend
export DB_HOST=127.0.0.1
export DB_PORT=5432
export DB_NAME="$DB_NAME"
export DB_USER="$DB_USER"
export DB_PASS="$DB_PASS"

npx sequelize-cli db:migrate --config database.config.js || {
    echo "⚠️ Aviso: Ocurrió una advertencia durante las migraciones, continuando..."
}

echo "🌱 3.1 Ejecutando Seeders (datos por defecto si no existen)..."
npx sequelize-cli db:seed:all --config database.config.js || {
    echo "ℹ️ Seeders ya ejecutados o no aplicables."
}

# 4. Iniciar Nginx (Frontend)
echo "🌐 4. Iniciando servidor Nginx (Frontend)..."
nginx

# 5. Iniciar Backend (Node.js)
echo "⚡ 5. Iniciando Backend Node.js..."
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
export NODE_ENV=production
export PORT=3000
export HOST=0.0.0.0
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379

exec node dist/server.js
