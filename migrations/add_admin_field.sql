-- Миграция для добавления поля is_admin в таблицу users
-- Выполняется при развертывании приложения

-- Добавляем поле is_admin в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Создаем индекс для быстрого поиска админов
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Комментарий к полю
COMMENT ON COLUMN users.is_admin IS 'Флаг администратора системы';
