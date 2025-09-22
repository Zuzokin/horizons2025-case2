-- Создание расширения для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание базы данных (если нужно)
-- CREATE DATABASE horizons_db;

-- Установка прав доступа
GRANT ALL PRIVILEGES ON DATABASE horizons_db TO horizons_user;
