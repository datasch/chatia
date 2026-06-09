#!/bin/bash

# Script para iniciar o ChatIA em modo desenvolvimento

echo "======================================"
echo "ChatIA - Modo Desenvolvimento"
echo "======================================"

# Verificar se os containers Docker estão rodando
echo ""
echo "1. Verificando containers Docker..."
if ! docker ps | grep -q "chatia_postgres_dev"; then
    echo "   Iniciando containers Docker..."
    docker-compose up -d
    echo "   Aguardando containers ficarem prontos..."
    sleep 10
else
    echo "   ✓ Containers já estão rodando"
fi

# Instalar dependências do backend se necessário
echo ""
echo "2. Verificando dependências do backend..."
if [ ! -d "backend/node_modules" ]; then
    echo "   Instalando dependências do backend..."
    cd backend && npm install && cd ..
else
    echo "   ✓ Dependências do backend já instaladas"
fi

# Executar migrations do banco
echo ""
echo "3. Executando migrations do banco de dados..."
cd backend
npm run db:migrate
cd ..

# Instalar dependências do frontend se necessário
echo ""
echo "4. Verificando dependências do frontend..."
if [ ! -d "frontend/node_modules" ]; then
    echo "   Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
else
    echo "   ✓ Dependências do frontend já instaladas"
fi

echo ""
echo "======================================"
echo "Configuração concluída!"
echo "======================================"
echo ""
echo "Para iniciar os servidores de desenvolvimento:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && npm run dev:server"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend && npm start"
echo ""
echo "URLs:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3001"
echo "  - PostgreSQL: localhost:5434"
echo "  - Redis: localhost:6380"
echo ""
echo "Credenciais Admin (padrão):"
echo "  - Email: admin@chatia.local"
echo "  - Senha: admin123"
echo ""
echo "======================================"
