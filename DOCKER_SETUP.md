# Docker Setup для проекта Horizons Case 2

## Обзор

Проект настроен для работы с Docker и включает в себя:
- **PostgreSQL** контейнер для базы данных
- **FastAPI** контейнер для основного приложения
- **Health checks** для мониторинга состояния сервисов
- **Автоматические зависимости** между сервисами

## Файлы конфигурации

- `docker-compose.yml` - Полный стек (PostgreSQL + App)
- `docker-compose.dev.yml` - Только PostgreSQL для разработки
- `docker-compose-db.yml` - Только PostgreSQL (старая версия)
- `Dockerfile` - Конфигурация для сборки приложения
- `.dockerignore` - Исключения для Docker build
- `docker-scripts.ps1` - PowerShell скрипты для управления

## Быстрый старт

### 1. Запуск полного стека (рекомендуется для продакшена)

```bash
# Запуск всех сервисов
docker compose up -d

# Просмотр логов
docker compose logs -f

# Остановка
docker compose down
```

### 2. Разработка (только PostgreSQL)

```bash
# Запуск только PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# Запуск приложения локально
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Остановка PostgreSQL
docker compose -f docker-compose.dev.yml down
```

### 3. Использование PowerShell скриптов

```powershell
# Запуск полного стека
.\docker-scripts.ps1 up

# Только PostgreSQL для разработки
.\docker-scripts.ps1 dev-up

# Просмотр логов
.\docker-scripts.ps1 logs

# Пересборка приложения
.\docker-scripts.ps1 build

# Остановка
.\docker-scripts.ps1 down
```

## Сервисы

### PostgreSQL
- **Контейнер:** `horizons_postgres`
- **Порт:** 5432
- **База данных:** `horizons_db`
- **Пользователь:** `horizons_user`
- **Пароль:** `horizons_password`
- **Health check:** Проверка готовности PostgreSQL

### FastAPI App
- **Контейнер:** `horizons_app`
- **Порт:** 8000
- **Health check:** HTTP запрос к `/health`
- **Зависимости:** Ждет готовности PostgreSQL
- **Volumes:** Монтирует папку `parser` для чтения

## Переменные окружения

Приложение использует следующие переменные окружения:

```env
DATABASE_URL=postgresql://horizons_user:horizons_password@postgres:5432/horizons_db
SECRET_KEY=197b2c37c391bed93fe80344fe73b806947a65e36206e05a1a23c2fa12702fe3
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,http://10.20.3.39:3000
```

## Полезные команды

### Управление контейнерами
```bash
# Просмотр статуса
docker ps --filter "name=horizons"

# Просмотр логов конкретного сервиса
docker compose logs postgres
docker compose logs app

# Перезапуск сервиса
docker compose restart app

# Пересборка без кэша
docker compose build --no-cache app
```

### Работа с базой данных
```bash
# Подключение к PostgreSQL
docker exec -it horizons_postgres psql -U horizons_user -d horizons_db

# Просмотр таблиц
docker exec -it horizons_postgres psql -U horizons_user -d horizons_db -c "\dt"

# Создание бэкапа
docker exec horizons_postgres pg_dump -U horizons_user horizons_db > backup.sql
```

### Очистка
```bash
# Удаление контейнеров и volumes
docker compose down -v

# Удаление образов
docker rmi horizons_case2-app

# Полная очистка
docker system prune -a
```

## Troubleshooting

### Проблемы с подключением к базе данных
1. Убедитесь, что PostgreSQL контейнер запущен: `docker ps`
2. Проверьте логи PostgreSQL: `docker compose logs postgres`
3. Убедитесь, что health check проходит: `docker compose ps`

### Проблемы с приложением
1. Проверьте логи приложения: `docker compose logs app`
2. Убедитесь, что все зависимости установлены в requirements.txt
3. Проверьте, что порт 8000 свободен

### Проблемы с volumes
1. Убедитесь, что папка `parser` существует
2. Проверьте права доступа к файлам
3. При необходимости пересоздайте volumes: `docker compose down -v`

## Мониторинг

### Health Checks
- **PostgreSQL:** Проверка готовности каждые 10 секунд
- **App:** HTTP запрос к `/health` каждые 30 секунд

### Логи
```bash
# Все логи
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f app
docker compose logs -f postgres
```

## Безопасность

- Приложение запускается под непривилегированным пользователем
- Секретные данные передаются через переменные окружения
- Volumes монтируются в режиме только для чтения где возможно
- Health checks не раскрывают чувствительную информацию
