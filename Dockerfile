# ===================================================
# Stage 1: Build Backend
# ===================================================
FROM node:20-bookworm-slim AS backend-builder
WORKDIR /app/backend

RUN apt-get update && apt-get install -y python3 make g++ git && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm install
RUN npm install bcryptjs --save

COPY backend/ ./
RUN npm run build

# ===================================================
# Stage 2: Build Frontend
# ===================================================
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend

RUN apt-get update && apt-get install -y python3 make g++ git && rm -rf /var/lib/apt/lists/*

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./

ARG REACT_APP_BACKEND_URL
ARG REACT_APP_NAME_SYSTEM
ARG REACT_APP_COMPANY_NAME
ARG REACT_APP_NUMBER_SUPPORT
ARG REACT_APP_HOURS_CLOSE_TICKETS_AUTO
ARG REACT_APP_PRIMARY_COLOR
ARG REACT_APP_PRIMARY_DARK
ARG REACT_APP_REQUIRE_BUSINESS_MANAGEMENT

ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL} \
    REACT_APP_NAME_SYSTEM=${REACT_APP_NAME_SYSTEM:-ChatIA} \
    REACT_APP_COMPANY_NAME=${REACT_APP_COMPANY_NAME} \
    REACT_APP_NUMBER_SUPPORT=${REACT_APP_NUMBER_SUPPORT} \
    REACT_APP_HOURS_CLOSE_TICKETS_AUTO=${REACT_APP_HOURS_CLOSE_TICKETS_AUTO:-9999} \
    REACT_APP_PRIMARY_COLOR=${REACT_APP_PRIMARY_COLOR:-#6B46C1} \
    REACT_APP_PRIMARY_DARK=${REACT_APP_PRIMARY_DARK:-#4C1D95} \
    REACT_APP_REQUIRE_BUSINESS_MANAGEMENT=${REACT_APP_REQUIRE_BUSINESS_MANAGEMENT:-FALSE} \
    NODE_OPTIONS=--max-old-space-size=2048 \
    GENERATE_SOURCEMAP=false

RUN npx craco build || { echo "Re-intentando build con menos memoria..."; NODE_OPTIONS=--max-old-space-size=1536 npx craco build; }

# ===================================================
# Stage 3: Final All-in-One Runtime (Coolify ready)
# ===================================================
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql \
    postgresql-contrib \
    redis-server \
    nginx \
    ffmpeg \
    chromium \
    ca-certificates \
    fonts-freefont-ttf \
    netcat-openbsd \
    procps \
    curl \
    sudo \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    PORT=3000 \
    DB_HOST=127.0.0.1 \
    DB_PORT=5432 \
    DB_NAME=chatia \
    DB_USER=chatia \
    DB_PASS=chatia \
    REDIS_HOST=127.0.0.1 \
    REDIS_PORT=6379

WORKDIR /app

# Copiar artefactos del backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/.sequelizerc ./backend/
COPY --from=backend-builder /app/backend/database.config.js ./backend/

# Copiar artefactos del frontend
COPY --from=frontend-builder /app/frontend/build /var/www/frontend

# Copiar configuración Nginx y Entrypoint
COPY docker/nginx-allinone.conf /etc/nginx/sites-available/default
COPY docker/entrypoint-allinone.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Crear directorios para datos persistentes
RUN mkdir -p /app/backend/public /app/backend/uploads /app/backend/.wwebjs_auth /app/backend/.wwebjs_cache

VOLUME ["/var/lib/postgresql", "/var/lib/redis", "/app/backend/public", "/app/backend/uploads", "/app/backend/.wwebjs_auth", "/app/backend/.wwebjs_cache"]

EXPOSE 80 3000

ENTRYPOINT ["/entrypoint.sh"]
