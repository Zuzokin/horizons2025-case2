from typing import Annotated
from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

""" You can add a DATABASE_URL environment variable to your .env file """
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://horizons_user:horizons_password@localhost:5432/horizons_db")

""" Or hard code SQLite here """
# DATABASE_URL = "sqlite:///./horizons.db"

""" Or hard code PostgreSQL here """
# DATABASE_URL="postgresql://horizons_user:horizons_password@localhost:5432/horizons_db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
DbSession = Annotated[Session, Depends(get_db)]

