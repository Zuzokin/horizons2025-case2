# Horizons Case 2 - Анализ металлического рынка

Полнофункциональная платформа для анализа металлического рынка с парсингом данных, API и веб-интерфейсом.

## 🚀 Возможности

### Backend (FastAPI)
- **Парсинг данных** с сайта 23met.ru
- **REST API** для работы с данными
- **Аутентификация** с JWT токенами
- **Каскадная фильтрация** данных
- **PostgreSQL** база данных с UUID
- **Rate limiting** для защиты API

### Frontend (React + TypeScript)
- **Современный интерфейс** с Material-UI
- **Аналитика цен** и графики
- **Мониторинг конкурентов**
- **Поиск клиентов**
- **Уведомления** о изменениях цен

### Инфраструктура
- **Docker Compose** для полного стека
- **Nginx** для фронтенда
- **PostgreSQL** для данных
- **Health checks** для мониторинга

## 📋 Требования

- Docker Desktop
- Node.js 18+ (для локальной разработки)
- Python 3.12+ (для локальной разработки)

## 🐳 Быстрый старт с Docker

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd horizons_case2
```

### 2. Настройка переменных окружения
Создайте файл `.env` в корне проекта:
```env
# Database Configuration
DATABASE_URL=postgresql://horizons_user:horizons_password@localhost:5432/horizons_db

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://10.20.3.39:3000
```

### 3. Запуск полного стека
```bash
# Запуск всех сервисов
docker compose up -d

# Просмотр логов
docker compose logs -f

# Остановка
docker compose down
```

### 4. Доступ к приложению
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

## 🛠️ PowerShell скрипты (Windows)

Для удобного управления используйте скрипты:

```powershell
# Запуск полного стека
.\docker-scripts.ps1 up

# Только PostgreSQL для разработки
.\docker-scripts.ps1 dev-up

# Только фронтенд
.\docker-scripts.ps1 frontend-only

# Только бэкенд
.\docker-scripts.ps1 backend-only

# Продакшен стек
.\docker-scripts.ps1 prod-up

# Просмотр логов
.\docker-scripts.ps1 logs

# Статус и ресурсы
.\docker-scripts.ps1 status

# Очистка ресурсов
.\docker-scripts.ps1 clean

# Остановка
.\docker-scripts.ps1 down
```

## 🔧 Локальная разработка

### Backend (без Docker)
```bash
# Активация виртуального окружения
.venv\Scripts\Activate.ps1

# Установка зависимостей
pip install -r requirements.txt

# Запуск только PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# Запуск бэкенда
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (без Docker)
```bash
cd frontend

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Сборка для продакшена
npm run build
```

## 📊 API Endpoints

### Аутентификация
- `POST /auth/` - Регистрация пользователя
- `POST /auth/token` - Получение JWT токена

### CSV данные
- `GET /csv-data/all-values` - Все уникальные значения
- `GET /csv-data/unique-values/{field}` - Значения по полю
- `GET /csv-data/products` - Продукты с фильтрацией
- `GET /csv-data/products-json` - Продукты в JSON формате

### Парсинг
- `POST /parser/start` - Запуск парсинга
- `GET /parser/status` - Статус парсинга
- `GET /parser/results` - Результаты парсинга

## 🗄️ Структура базы данных

### Таблица users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL
);
```

## 📁 Структура проекта

```
horizons_case2/
├── src/                    # Backend (FastAPI)
│   ├── api.py             # API роуты
│   ├── auth/              # Аутентификация
│   ├── csv_data/          # Работа с CSV данными
│   ├── parser/            # Парсинг данных
│   ├── users/             # Управление пользователями
│   └── main.py            # Точка входа
├── frontend/              # Frontend (React)
│   ├── src/               # Исходный код
│   ├── public/            # Статические файлы
│   ├── package.json       # Зависимости
│   └── Dockerfile         # Docker конфигурация
├── parser/                # Парсер данных
│   ├── 23MET_DATA/        # Данные парсинга
│   ├── results/           # Результаты
│   └── *.py               # Скрипты парсинга
├── docker-compose.yml     # Основная конфигурация
├── docker-compose.prod.yml # Продакшен конфигурация
├── docker-scripts.ps1     # PowerShell скрипты
└── requirements.txt       # Python зависимости
```

## 🧪 Тестирование

```bash
# Запуск всех тестов
pytest

# Тесты с покрытием
pytest --cov=src

# E2E тесты
pytest tests/e2e/
```

## 🔒 Безопасность

- **JWT токены** для аутентификации
- **Rate limiting** для защиты от атак
- **CORS** настройки для фронтенда
- **Переменные окружения** для секретов
- **Непривилегированные пользователи** в Docker

## 📈 Мониторинг

### Health Checks
- **PostgreSQL**: `pg_isready`
- **Backend**: `GET /health`
- **Frontend**: `GET /health`

### Логи
```bash
# Все логи
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f app
docker compose logs -f frontend
docker compose logs -f postgres
```

## 🚀 Развертывание в продакшене

### 1. Подготовка
```bash
# Создание .env файла с продакшен настройками
cp .env.example .env
# Отредактируйте .env файл
```

### 2. Запуск продакшен стека
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. Настройка nginx (опционально)
Создайте конфигурацию nginx для reverse proxy.

## 🐛 Troubleshooting

### Проблемы с Docker
```bash
# Пересборка без кэша
docker compose build --no-cache

# Очистка ресурсов
docker system prune -a

# Проверка статуса
docker compose ps
```

### Проблемы с базой данных
```bash
# Подключение к PostgreSQL
docker exec -it horizons_postgres psql -U horizons_user -d horizons_db

# Сброс базы данных
docker compose down -v
docker compose up -d
```

### Проблемы с фронтендом
```bash
# Пересборка фронтенда
docker compose build frontend

# Проверка логов
docker compose logs frontend
```

## 📚 Дополнительная документация

- [Docker Setup Guide](DOCKER_SETUP.md)
- [PostgreSQL Setup Guide](POSTGRESQL_SETUP.md)
- [Parser API Guide](PARSER_API_GUIDE.md)
- [Frontend Data Format](FRONTEND_DATA_FORMAT.md)

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте Issue в репозитории
- Обратитесь к документации
- Проверьте логи Docker контейнеров

---

**Horizons Case 2** - Современная платформа для анализа металлического рынка 🚀