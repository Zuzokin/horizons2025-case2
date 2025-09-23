# GitLab CI/CD Setup Guide

## 🚀 Быстрая настройка GitLab CI/CD

### 1. Подготовка репозитория

Убедитесь, что в корне проекта есть файл `.gitlab-ci.yml`:

```bash
# Проверка наличия файла
ls -la .gitlab-ci.yml

# Если файла нет, скопируйте его из проекта
cp .gitlab-ci.yml.example .gitlab-ci.yml
```

### 2. Настройка переменных окружения

В GitLab перейдите в **Settings → CI/CD → Variables** и добавьте:

#### Обязательные переменные:
- `SSH_PRIVATE_KEY` - Приватный SSH ключ для доступа к серверам
- `PRODUCTION_SERVER` - IP адрес продакшен сервера
- `PRODUCTION_USER` - Пользователь для продакшен сервера
- `STAGING_SERVER` - IP адрес staging сервера (опционально)
- `STAGING_USER` - Пользователь для staging сервера (опционально)

#### Переменные для продакшена:
- `SECRET_KEY` - Секретный ключ для JWT
- `POSTGRES_PASSWORD` - Пароль для базы данных
- `ALLOWED_ORIGINS` - Разрешенные домены для CORS

### 3. Настройка SSH ключей

#### На сервере:
```bash
# Создание SSH ключа для GitLab CI
ssh-keygen -t rsa -b 4096 -C "gitlab-ci@yourdomain.com"

# Добавление публичного ключа в authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# Установка правильных прав
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

#### В GitLab:
1. Скопируйте содержимое приватного ключа:
   ```bash
   cat ~/.ssh/id_rsa
   ```
2. Добавьте его в переменную `SSH_PRIVATE_KEY` в GitLab

### 4. Настройка Container Registry

GitLab автоматически предоставляет Container Registry. Образы будут доступны по адресу:
```
registry.gitlab.com/your-group/your-project/backend:latest
registry.gitlab.com/your-group/your-project/frontend:latest
```

### 5. Настройка серверов

#### На продакшен сервере:
```bash
# Установка Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Клонирование репозитория
git clone https://gitlab.com/your-group/your-project.git
cd your-project

# Создание .env файла
cp .env.example .env
nano .env
```

#### Настройка .env для продакшена:
```env
# Database Configuration
DATABASE_URL=postgresql://horizons_user:STRONG_PASSWORD@postgres:5432/horizons_db
POSTGRES_DB=horizons_db
POSTGRES_USER=horizons_user
POSTGRES_PASSWORD=STRONG_PASSWORD

# JWT Configuration
SECRET_KEY=VERY_LONG_RANDOM_SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend Configuration
REACT_APP_API_URL=https://yourdomain.com/api
NODE_ENV=production
```

### 6. Тестирование пайплайна

#### Запуск пайплайна:
1. Сделайте commit и push в ветку `main` или `develop`
2. Перейдите в **CI/CD → Pipelines** в GitLab
3. Дождитесь завершения стадий Test и Build
4. Вручную запустите стадию Deploy

#### Проверка развертывания:
```bash
# На сервере проверьте статус контейнеров
docker compose ps

# Проверьте логи
docker compose logs -f

# Проверьте доступность приложения
curl -f http://localhost:8000/health
curl -f http://localhost:3000/health
```

### 7. Мониторинг и уведомления

#### Настройка уведомлений:
1. Перейдите в **Settings → Notifications**
2. Выберите события для уведомлений:
   - Pipeline failures
   - Successful deployments
   - Failed deployments

#### Мониторинг пайплайна:
- **CI/CD → Pipelines** - просмотр всех пайплайнов
- **Deployments** - отслеживание развертываний
- **Environments** - управление окружениями

### 8. Troubleshooting

#### Частые проблемы:

1. **Pipeline не запускается:**
   - Проверьте наличие файла `.gitlab-ci.yml`
   - Убедитесь, что файл находится в корне репозитория
   - Проверьте синтаксис YAML

2. **Ошибка SSH подключения:**
   ```bash
   # Проверьте SSH ключ
   ssh-keygen -l -f ~/.ssh/id_rsa.pub
   
   # Проверьте подключение
   ssh -i ~/.ssh/id_rsa user@server
   ```

3. **Ошибка сборки Docker образов:**
   - Проверьте Dockerfile
   - Убедитесь, что все необходимые файлы присутствуют
   - Проверьте права доступа к Container Registry

4. **Ошибка развертывания:**
   - Проверьте переменные окружения
   - Убедитесь, что сервер доступен
   - Проверьте логи на сервере

### 9. Дополнительные возможности

#### Кэширование:
GitLab автоматически кэширует:
- Python зависимости (.venv/)
- Node.js зависимости (frontend/node_modules/)
- Собранные файлы (frontend/build/)

#### Артефакты:
- Отчеты о покрытии кода
- Собранные Docker образы
- Логи выполнения

#### Environments:
- Автоматическое создание staging и production окружений
- Отслеживание развертываний
- Возможность отката изменений

---

**Примечание**: Этот гайд предполагает использование GitLab.com. Для self-hosted GitLab настройка может отличаться.

**Поддержка**: При возникновении проблем создайте Issue в репозитории или обратитесь к команде разработки.
