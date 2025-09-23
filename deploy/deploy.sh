#!/bin/bash
# Скрипт автоматического развертывания приложения
# Запускать от пользователя horizons

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Проверка что скрипт запущен от правильного пользователя
if [ "$USER" != "horizons" ]; then
    error "Скрипт должен запускаться от пользователя 'horizons'"
fi

# Переход в домашнюю директорию
cd /home/horizons

log "🚀 Начинаем развертывание приложения..."

# Создание директорий
log "📁 Создание необходимых директорий..."
mkdir -p horizons-app/{nginx/ssl,logs,backups}
cd horizons-app

# Клонирование репозитория (если нужно)
if [ ! -d "horizons_case2" ]; then
    log "📥 Клонирование репозитория..."
    # Замените на ваш репозиторий
    # git clone https://github.com/yourusername/horizons_case2.git
    # Или скопируйте файлы вручную
    warn "Скопируйте файлы проекта в директорию /home/horizons/horizons-app/horizons_case2/"
    read -p "Нажмите Enter когда файлы будут скопированы..."
fi

cd horizons_case2

# Создание .env файла
log "⚙️ Настройка переменных окружения..."
if [ ! -f ".env" ]; then
    cp deploy/.env.production.example .env
    warn "⚠️  ВАЖНО: Отредактируйте файл .env и измените пароли!"
    warn "⚠️  Особенно: POSTGRES_PASSWORD, SECRET_KEY, ALLOWED_ORIGINS"
    read -p "Нажмите Enter когда .env файл будет настроен..."
fi

# Генерация SSL сертификатов (самоподписанные для хакатона)
log "🔐 Генерация SSL сертификатов..."
if [ ! -f "deploy/nginx/ssl/cert.pem" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout deploy/nginx/ssl/key.pem \
        -out deploy/nginx/ssl/cert.pem \
        -subj "/C=RU/ST=Moscow/L=Moscow/O=Hackathon/CN=localhost"
    log "✅ SSL сертификаты созданы"
fi

# Остановка существующих контейнеров
log "🛑 Остановка существующих контейнеров..."
docker compose -f docker-compose.prod.yml down || true

# Очистка неиспользуемых образов
log "🧹 Очистка Docker образов..."
docker system prune -f

# Сборка и запуск приложения
log "🔨 Сборка и запуск приложения..."
docker compose -f docker-compose.prod.yml up --build -d

# Ожидание запуска сервисов
log "⏳ Ожидание запуска сервисов..."
sleep 30

# Проверка статуса сервисов
log "🔍 Проверка статуса сервисов..."
docker compose -f docker-compose.prod.yml ps

# Проверка здоровья приложения
log "🏥 Проверка здоровья приложения..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    log "✅ Приложение успешно запущено!"
    log "🌐 Доступно по адресу: https://$(hostname -I | awk '{print $1}')"
    log "📊 Логи: docker compose -f docker-compose.prod.yml logs -f"
else
    error "❌ Приложение не отвечает на health check"
fi

# Настройка автоматического запуска
log "🔄 Настройка автоматического запуска..."
sudo tee /etc/systemd/system/horizons-app.service > /dev/null << EOF
[Unit]
Description=Horizons App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/horizons/horizons-app/horizons_case2
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=horizons
Group=horizons

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable horizons-app

log "✅ Развертывание завершено успешно!"
log "📋 Полезные команды:"
log "   Статус: sudo systemctl status horizons-app"
log "   Логи: docker compose -f docker-compose.prod.yml logs -f"
log "   Перезапуск: sudo systemctl restart horizons-app"
log "   Остановка: sudo systemctl stop horizons-app"
