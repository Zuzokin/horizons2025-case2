from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.core import engine, Base
from .entities.user import User  # Import models to register them
from .api import register_routes
from .logging import configure_logging, LogLevels
import os
from dotenv import load_dotenv

load_dotenv()


configure_logging(LogLevels.info)

app = FastAPI(
    title="Horizons Case 2 API",
    description="API для работы с данными парсинга 23met",
    version="1.0.0"
)

# Добавляем CORS middleware для работы с фронтендом
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://10.20.3.39:3000,http://10.20.3.134:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

""" Create tables for SQLite database """
Base.metadata.create_all(bind=engine)

register_routes(app)


@app.get("/health", tags=["Health Check"])
async def health_check():
    """
    Health check endpoint для проверки состояния API
    """
    return {
        "status": "healthy",
        "message": "API is running",
        "version": "1.0.0"
    }
