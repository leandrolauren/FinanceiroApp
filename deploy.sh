#!/bin/bash
# Interrompe o script imediatamente se qualquer comando falhar
set -e

# Adiciona um log com data e hora para sabermos quando o deploy foi acionado
echo ">>> INICIANDO DEPLOY AUTOMÁTICO EM: $(date) <<<"

# 1. Puxar as últimas alterações do repositório Git
echo "=> Etapa 1/3: Puxando código mais recente da branch 'main'..."
# Garante que estamos na branch correta e limpa quaisquer alterações locais
git checkout main
git pull origin main

# 2. Atualizar e reiniciar os containers Docker
# Habilitar BuildKit para builds mais rápidos e cache otimizado
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo "=> Etapa 2/3: Recriando e atualizando os containers..."
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d --build

# 3. Limpar imagens Docker antigas e não utilizadas para economizar espaço
echo "=> Etapa 3/3: Limpando imagens Docker antigas..."
docker image prune -f

echo ">>> DEPLOY CONCLUÍDO COM SUCESSO! <<<"
