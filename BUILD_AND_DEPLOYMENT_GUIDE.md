# 🚀 Руководство по сборке и публикации приложения Horizons Case 2

## 📋 Обзор

Этот документ содержит полное руководство по сборке, развертыванию и публикации приложения Horizons Case 2 - платформы для анализа металлического рынка с парсингом данных, API и веб-интерфейсом.

## 🏗️ Архитектура приложения

### Компоненты системы:
- **Backend**: FastAPI (Python 3.12) - REST API и парсинг данных
- **Frontend**: React + TypeScript - веб-интерфейс с Material-UI
- **Database**: PostgreSQL 15 - хранение данных
- **Parser**: Python скрипты - парсинг данных с сайта 23met.ru
- **Reverse Proxy**: Nginx - маршрутизация и SSL

### Docker контейнеры:
- `horizons_postgres` - База данных PostgreSQL
- `horizons_app` - FastAPI приложение
- `horizons_frontend` - React приложение с Nginx
- `horizons_nginx` - Reverse proxy (только в продакшене)

## 📦 Требования к системе

### Минимальные требования:
- **OS**: Linux (Ubuntu 20.04+), Windows 10+
- **RAM**: 4GB (рекомендуется 8GB)
- **CPU**: 2 ядра (рекомендуется 4 ядра)
- **Disk**: 10GB свободного места
- **Docker**: 20.10+ с Docker Compose 2.0+
- **Node.js**: 18+ (для локальной разработки)
- **Python**: 3.12+ (для локальной разработки)

### Проверка требований:
```bash
# Проверка Docker
docker --version
docker compose version

# Проверка Node.js (для разработки)
node --version
npm --version

# Проверка Python (для разработки)
python --version
pip --version
```

## 🔧 Локальная разработка

### 1. Подготовка окружения

```bash
# Клонирование репозитория
git clone <repository-url>
cd horizons_case2

# Создание виртуального окружения Python
python -m venv .venv

# Активация виртуального окружения
# Windows:
.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Установка зависимостей Python
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта(локальная разработка, файл .env в .gitignore):
```env
# Database Configuration
DATABASE_URL=postgresql://horizons_user:horizons_password@localhost:5432/horizons_db
POSTGRES_DB=horizons_db
POSTGRES_USER=horizons_user
POSTGRES_PASSWORD=horizons_password

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://10.20.3.39:3000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
NODE_ENV=development
```

### 3. Запуск для разработки

#### Вариант A: Полный Docker стек
```bash
# Запуск всех сервисов
docker compose up -d

# Просмотр логов
docker compose logs -f

# Остановка
docker compose down
```

#### Вариант B: Гибридный режим (рекомендуется для разработки)
```bash
# Запуск только PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# Запуск backend локально
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# В другом терминале - запуск frontend
cd frontend
npm install
npm start
```

## 🚀 Развертывание в продакшене

### 1. Подготовка сервера

#### Системные требования для продакшена:
- **OS**: Ubuntu 20.04+ LTS
- **RAM**: 8GB+ (рекомендуется 16GB)
- **CPU**: 4+ ядра
- **Disk**: 50GB+ SSD
- **Network**: Статический IP, открытые порты 80, 443

#### Установка Docker на сервер:
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh


# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезагрузка для применения изменений
sudo reboot
```



### 3. Развертывание приложения

#### Клонирование и настройка:
```bash
# Переключение на пользователя horizons
su - horizons

# Создание директории
mkdir -p /home/horizons/horizons-app
cd /home/horizons/horizons-app

# Клонирование репозитория
git clone <repository-url> horizons_case2
cd horizons_case2

# Создание .env файла для продакшена
cp .env.example .env
nano .env 
```



#### Запуск продакшен стека:
```bash
# Запуск с продакшен конфигурацией
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Проверка статуса
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Просмотр логов
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```


## 📊 Мониторинг и логирование

### 1. Health Checks

#### Проверка состояния сервисов:
```bash
# Проверка всех контейнеров
docker compose ps

# Проверка health checks
docker inspect horizons_postgres | grep -A 10 Health
docker inspect horizons_app | grep -A 10 Health
docker inspect horizons_frontend | grep -A 10 Health

# Ручная проверка API
curl -f http://localhost:8000/health
curl -f http://localhost:3000/health
```

### 2. Логирование

#### Просмотр логов:
```bash
# Все логи
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f frontend

# Логи с временными метками
docker compose logs -f -t

# Последние 100 строк
docker compose logs --tail=100 app
```


### 3. Мониторинг ресурсов

#### Полезные команды:
```bash
# Использование ресурсов контейнерами
docker stats

# Использование диска
docker system df

# Очистка неиспользуемых ресурсов
docker system prune -a

# Мониторинг базы данных
docker exec -it horizons_postgres psql -U horizons_user -d horizons_db -c "SELECT * FROM pg_stat_activity;"
```

## 🔄 Обновление и развертывание

### 1. Обновление приложения

#### Процедура обновления:
```bash
# Переключение на пользователя horizons
su - horizons
cd /home/horizons/horizons-app/horizons_case2

# Создание бэкапа
docker compose exec postgres pg_dump -U horizons_user horizons_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Остановка сервисов
docker compose down

# Обновление кода
git pull origin main

# Пересборка образов
docker compose build --no-cache

# Запуск обновленных сервисов
docker compose up -d

# Проверка статуса
docker compose ps
```

### 2. Автоматическое развертывание

#### GitLab CI/CD Pipeline:
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  POSTGRES_DB: horizons_test_db
  POSTGRES_USER: horizons_user
  POSTGRES_PASSWORD: horizons_password

services:
  - postgres:15-alpine
  - docker:dind

# Тестирование Backend
test_backend:
  stage: test
  image: python:3.12-slim
  before_script:
    - pip install -r requirements.txt
    - pip install -r requirements-dev.txt
  script:
    - python -m pytest tests/ -v --cov=src --cov-report=xml
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

# Сборка Docker образов
build_backend:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHA
  only:
    - main

# Развертывание в production
deploy_production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
  script:
    - |
      ssh $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
        cd /home/horizons/horizons-app/horizons_case2
        git pull origin main
        docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
        docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
      EOF
  only:
    - main
  when: manual
```

#### Настройка GitLab CI/CD:

1. **Создание переменных окружения в GitLab:**
   - Перейдите в Settings → CI/CD → Variables
   - Добавьте следующие переменные:
     - `SSH_PRIVATE_KEY` - приватный SSH ключ для доступа к серверу
     - `PRODUCTION_SERVER` - IP адрес продакшен сервера
     - `PRODUCTION_USER` - пользователь для подключения к серверу
     - `STAGING_SERVER` - IP адрес staging сервера
     - `STAGING_USER` - пользователь для staging сервера

2. **Настройка SSH ключей:**
   ```bash
   # На сервере создайте SSH ключ для GitLab
   ssh-keygen -t rsa -b 4096 -C "gitlab-ci@yourdomain.com"
   
   # Добавьте публичный ключ в authorized_keys
   cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
   
   # Приватный ключ добавьте в GitLab CI/CD Variables
   cat ~/.ssh/id_rsa
   ```

3. **Настройка Container Registry:**
   - GitLab автоматически предоставляет Container Registry
   - Образы будут доступны по адресу: `registry.gitlab.com/your-group/your-project`
   - Обновите docker-compose файлы для использования образов из registry



    

### Файлы конфигурации:
- `docker-compose.yml` - Основная конфигурация
- `docker-compose.prod.yml` - Продакшен конфигурация
- `docker-compose.dev.yml` - Конфигурация для разработки
- `Dockerfile` - Конфигурация backend образа
- `frontend/Dockerfile` - Конфигурация frontend образа
- `nginx/nginx.conf` - Конфигурация Nginx

## 🔄 GitLab CI/CD Pipeline

### Обзор пайплайна

GitLab CI/CD пайплайн состоит из трех основных стадий:

1. **Test** - Тестирование кода
2. **Build** - Сборка Docker образов
3. **Deploy** - Развертывание в различные окружения

### Стадии пайплайна

#### 1. Тестирование (Test Stage)
- **test_backend** - Тестирование Python/FastAPI кода с покрытием
- **test_frontend** - Тестирование React приложения с покрытием

#### 2. Сборка (Build Stage)
- **build_backend** - Сборка и публикация backend образа
- **build_frontend** - Сборка и публикация frontend образа

#### 3. Развертывание (Deploy Stage)
- **deploy_staging** - Развертывание в staging окружение
- **deploy_production** - Развертывание в production окружение
- **rollback_production** - Откат изменений в production
- **cleanup_registry** - Очистка старых образов из registry

### Настройка переменных окружения

В GitLab перейдите в **Settings → CI/CD → Variables** и добавьте:

| Переменная | Описание | Пример |
|------------|----------|---------|
| `SSH_PRIVATE_KEY` | Приватный SSH ключ для доступа к серверам | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PRODUCTION_SERVER` | IP адрес продакшен сервера | `192.168.1.100` |
| `PRODUCTION_USER` | Пользователь для продакшен сервера | `horizons` |
| `STAGING_SERVER` | IP адрес staging сервера | `192.168.1.101` |
| `STAGING_USER` | Пользователь для staging сервера | `horizons` |
| `SECRET_KEY` | Секретный ключ для JWT | `your-secret-key-here` |
| `POSTGRES_PASSWORD` | Пароль для базы данных | `strong-password-here` |

### Управление пайплайном

#### Запуск пайплайна:
- **Автоматически** при push в ветки `main` и `develop`
- **Вручную** через GitLab UI в разделе CI/CD → Pipelines

#### Условное выполнение:
- **Тестирование** - выполняется для всех веток и merge requests
- **Сборка** - только для веток `main` и `develop`
- **Развертывание** - только для веток `main` (production) и `develop` (staging)
- **Ручные задачи** - требуют подтверждения в GitLab UI

---

**Примечание**: Это руководство регулярно обновляется. Для получения последней версии проверьте репозиторий проекта.

**Поддержка**: При возникновении проблем создайте Issue в репозитории или обратитесь к команде разработки.
