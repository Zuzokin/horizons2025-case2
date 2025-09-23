# 🚀 Развертывание приложения на Linux сервере

## Быстрый старт для хакатона

### 1. Подготовка сервера (выполнить от root)

```bash
# Скачать и запустить скрипт безопасности
wget https://raw.githubusercontent.com/your-repo/deploy/security-setup.sh
chmod +x security-setup.sh
./security-setup.sh

# Установить Docker
wget https://raw.githubusercontent.com/your-repo/deploy/docker-install.sh
chmod +x docker-install.sh
./docker-install.sh
```

### 2. Развертывание приложения (выполнить от пользователя horizons)

```bash
# Переключиться на пользователя horizons
su - horizons

# Скачать и запустить скрипт развертывания
wget https://raw.githubusercontent.com/your-repo/deploy/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

## 🔒 Меры безопасности

### Настроенные компоненты:
- ✅ UFW Firewall (только порты 22, 80, 443)
- ✅ Fail2ban (защита от брутфорса)
- ✅ Автоматические обновления безопасности
- ✅ Отключен root доступ по SSH
- ✅ Nginx с SSL и безопасными заголовками
- ✅ Rate limiting для API
- ✅ Docker контейнеры с ограниченными правами

### Важные настройки:
1. **Измените пароли** в `.env` файле:
   - `POSTGRES_PASSWORD` - пароль базы данных
   - `SECRET_KEY` - секретный ключ приложения

2. **Настройте домен** в `.env`:
   - `ALLOWED_ORIGINS` - разрешенные домены
   - `REACT_APP_API_URL` - URL API

3. **SSL сертификаты**:
   - По умолчанию используются самоподписанные
   - Для продакшена замените на Let's Encrypt

## 📊 Мониторинг

### Полезные команды:

```bash
# Статус приложения
sudo systemctl status horizons-app

# Логи приложения
docker compose -f docker-compose.prod.yml logs -f

# Мониторинг ресурсов
./monitoring.sh resources

# Проверка безопасности
./monitoring.sh security

# Создание бэкапа
./monitoring.sh backup
```

### Автоматический мониторинг:

```bash
# Добавить в crontab для автоматических бэкапов
crontab -e

# Бэкап каждый день в 2:00
0 2 * * * /home/horizons/horizons-app/horizons_case2/deploy/monitoring.sh backup

# Очистка логов каждую неделю
0 3 * * 0 /home/horizons/horizons-app/horizons_case2/deploy/monitoring.sh cleanup
```

## 🛠️ Управление приложением

### Запуск/остановка:
```bash
# Запуск
sudo systemctl start horizons-app

# Остановка
sudo systemctl stop horizons-app

# Перезапуск
sudo systemctl restart horizons-app

# Статус
sudo systemctl status horizons-app
```

### Обновление приложения:
```bash
cd /home/horizons/horizons-app/horizons_case2
git pull origin main
docker compose -f docker-compose.prod.yml up --build -d
```

## 🔧 Устранение неполадок

### Приложение не запускается:
1. Проверьте логи: `docker compose -f docker-compose.prod.yml logs`
2. Проверьте .env файл
3. Проверьте доступность портов: `netstat -tulpn`

### Проблемы с SSL:
1. Проверьте сертификаты в `deploy/nginx/ssl/`
2. Пересоздайте: `./deploy.sh` (пересоздаст сертификаты)

### Проблемы с базой данных:
1. Проверьте статус PostgreSQL: `docker compose -f docker-compose.prod.yml ps postgres`
2. Проверьте логи БД: `docker compose -f docker-compose.prod.yml logs postgres`

## 📁 Структура файлов

```
/home/horizons/horizons-app/
├── horizons_case2/          # Основное приложение
│   ├── .env                 # Переменные окружения
│   ├── docker-compose.prod.yml
│   └── deploy/
│       ├── nginx/
│       │   ├── nginx.conf
│       │   └── ssl/         # SSL сертификаты
│       ├── deploy.sh        # Скрипт развертывания
│       └── monitoring.sh    # Скрипт мониторинга
├── logs/                    # Логи приложения
└── backups/                 # Бэкапы
```

## ⚠️ Важные замечания для хакатона

1. **Быстрая настройка**: Используйте самоподписанные SSL сертификаты
2. **Пароли**: Обязательно смените все пароли по умолчанию
3. **Мониторинг**: Регулярно проверяйте логи и ресурсы
4. **Бэкапы**: Настройте автоматические бэкапы
5. **Обновления**: Регулярно обновляйте систему

## 🆘 Экстренные команды

```bash
# Полная перезагрузка приложения
sudo systemctl stop horizons-app
docker compose -f docker-compose.prod.yml down
docker system prune -f
sudo systemctl start horizons-app

# Просмотр всех логов
journalctl -u horizons-app -f

# Проверка безопасности
sudo fail2ban-client status
sudo ufw status verbose
```
