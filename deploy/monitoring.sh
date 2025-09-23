#!/bin/bash
# Скрипт мониторинга и логирования
# Запускать от пользователя horizons

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Функция проверки статуса сервисов
check_services() {
    log "🔍 Проверка статуса сервисов..."
    
    # Проверка Docker
    if ! systemctl is-active --quiet docker; then
        echo -e "${RED}❌ Docker не запущен${NC}"
        return 1
    fi
    
    # Проверка контейнеров
    cd /home/horizons/horizons-app/horizons_case2
    docker compose -f docker-compose.prod.yml ps
    
    # Проверка здоровья приложения
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Приложение работает${NC}"
    else
        echo -e "${RED}❌ Приложение не отвечает${NC}"
    fi
}

# Функция показа логов
show_logs() {
    log "📋 Показ логов приложения..."
    cd /home/horizons/horizons-app/horizons_case2
    docker compose -f docker-compose.prod.yml logs --tail=50 -f
}

# Функция показа ресурсов
show_resources() {
    log "💻 Использование ресурсов..."
    
    echo -e "${BLUE}=== CPU и Memory ===${NC}"
    top -bn1 | head -20
    
    echo -e "\n${BLUE}=== Дисковое пространство ===${NC}"
    df -h
    
    echo -e "\n${BLUE}=== Docker контейнеры ===${NC}"
    docker stats --no-stream
    
    echo -e "\n${BLUE}=== Сетевые соединения ===${NC}"
    netstat -tulpn | grep -E ':(80|443|5432|8000|3000)'
}

# Функция бэкапа
backup_data() {
    log "💾 Создание бэкапа..."
    
    BACKUP_DIR="/home/horizons/horizons-app/backups"
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    mkdir -p "$BACKUP_DIR"
    
    # Бэкап базы данных
    cd /home/horizons/horizons-app/horizons_case2
    docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U horizons_user horizons_db > "$BACKUP_DIR/db_backup.sql"
    
    # Бэкап конфигураций
    tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        .
    
    log "✅ Бэкап создан: $BACKUP_DIR/$BACKUP_FILE"
}

# Функция очистки логов
cleanup_logs() {
    log "🧹 Очистка старых логов..."
    
    # Очистка Docker логов
    docker system prune -f
    
    # Очистка системных логов (старше 7 дней)
    sudo journalctl --vacuum-time=7d
    
    # Очистка логов nginx
    sudo find /var/log/nginx -name "*.log" -mtime +7 -delete
    
    log "✅ Очистка завершена"
}

# Функция показа статистики безопасности
security_stats() {
    log "🔒 Статистика безопасности..."
    
    echo -e "${BLUE}=== SSH подключения ===${NC}"
    sudo grep "Failed password" /var/log/auth.log | tail -10
    
    echo -e "\n${BLUE}=== Заблокированные IP (fail2ban) ===${NC}"
    sudo fail2ban-client status sshd
    
    echo -e "\n${BLUE}=== Активные соединения ===${NC}"
    ss -tuln | grep -E ':(22|80|443)'
    
    echo -e "\n${BLUE}=== UFW статус ===${NC}"
    sudo ufw status verbose
}

# Главное меню
case "${1:-menu}" in
    "status")
        check_services
        ;;
    "logs")
        show_logs
        ;;
    "resources")
        show_resources
        ;;
    "backup")
        backup_data
        ;;
    "cleanup")
        cleanup_logs
        ;;
    "security")
        security_stats
        ;;
    "menu"|*)
        echo -e "${BLUE}=== Мониторинг приложения ===${NC}"
        echo "1. check_services - Проверить статус сервисов"
        echo "2. show_logs - Показать логи"
        echo "3. show_resources - Показать ресурсы"
        echo "4. backup_data - Создать бэкап"
        echo "5. cleanup_logs - Очистить логи"
        echo "6. security_stats - Статистика безопасности"
        echo ""
        echo "Использование: $0 [команда]"
        echo "Пример: $0 status"
        ;;
esac
