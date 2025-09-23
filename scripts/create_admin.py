#!/usr/bin/env python3
"""
Скрипт для создания администратора системы при развертывании
Используется в Docker контейнере для инициализации первого админ пользователя
"""

import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Добавляем путь к src в sys.path
sys.path.append('/app')

from src.entities.user import User
from src.auth.service import create_admin_user, get_password_hash
from src.database.core import Base

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_default_admin():
    """Создание администратора по умолчанию"""
    
    # Получаем параметры из переменных окружения
    database_url = os.getenv("DATABASE_URL", "postgresql://horizons_user:horizons_password@postgres:5432/horizons_db")
    admin_email = os.getenv("ADMIN_EMAIL", "admin@horizons.local")
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    admin_first_name = os.getenv("ADMIN_FIRST_NAME", "System")
    admin_last_name = os.getenv("ADMIN_LAST_NAME", "Administrator")
    
    try:
        # Создаем подключение к базе данных
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Создаем таблицы если их нет
        Base.metadata.create_all(bind=engine)
        
        db = SessionLocal()
        
        try:
            # Проверяем, есть ли уже админы в системе
            existing_admin = db.query(User).filter(User.is_admin == True).first()
            
            if existing_admin:
                logger.info(f"Admin user already exists: {existing_admin.email}")
                return
            
            # Создаем админ пользователя
            admin_user = create_admin_user(
                db=db,
                email=admin_email,
                password=admin_password,
                first_name=admin_first_name,
                last_name=admin_last_name
            )
            
            logger.info(f"Admin user created successfully: {admin_user.email}")
            logger.info(f"Admin credentials: {admin_email} / {admin_password}")
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to create admin user: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    logger.info("Starting admin user creation...")
    create_default_admin()
    logger.info("Admin user creation completed.")
