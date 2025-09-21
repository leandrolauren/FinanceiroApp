#!/bin/bash
# Interrompe o script imediatamente se qualquer comando falhar
set -e

# Adiciona um log com data e hora para sabermos quando o deploy foi acionado
echo ">>> INICIANDO DEPLOY AUTOMÁTICO EM: $(date) <<<"

# 1. Puxar as últimas alterações do repositório Git
echo "=> Etapa 1/4: Puxando código mais recente da branch 'main'..."
# Garante que estamos na branch correta e limpa quaisquer alterações locais
git checkout main
git pull origin main

# 2. Construir a nova imagem usando Docker Compose
echo "=> Etapa 2/4: Construindo a nova imagem 'financeiro-app:latest'..."
docker compose build

# 3. Recriar o contêiner com a nova imagem, se necessário
echo "=> Etapa 3/4: Recriando e escalando o serviço 'webapp' para 3 instâncias..."
docker compose up -d --scale webapp=3 --no-recreate

# 4. Limpar imagens Docker antigas e não utilizadas para economizar espaço
echo "=> Etapa 4/4: Limpando imagens Docker antigas..."
docker image prune -f

echo ">>> DEPLOY CONCLUÍDO COM SUCESSO! <<<"
