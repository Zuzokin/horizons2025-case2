#!/bin/bash
# Установка Docker и Docker Compose на Ubuntu/Debian
# Запускать от root пользователя

set -e

echo "🐳 Установка Docker и Docker Compose..."

# Удаление старых версий
apt remove -y docker docker-engine docker.io containerd runc || true

# Установка зависимостей
apt update
apt install -y ca-certificates curl gnupg lsb-release

# Добавление официального GPG ключа Docker
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавление репозитория Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Обновление пакетов
apt update

# Установка Docker
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Установка Docker Compose (standalone)
DOCKER_COMPOSE_VERSION="v2.24.0"
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Добавление пользователя в группу docker
usermod -aG docker horizons

# Настройка Docker daemon для безопасности
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true
}
EOF

# Включение и запуск Docker
systemctl enable docker
systemctl start docker

# Проверка установки
echo "🔍 Проверка установки Docker..."
docker --version
docker compose version

echo "✅ Docker и Docker Compose установлены успешно!"
echo "⚠️  Перелогиньтесь для применения изменений в группах пользователей"
