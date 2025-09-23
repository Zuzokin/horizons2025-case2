from datetime import timedelta, datetime, timezone
from typing import Annotated
from uuid import UUID, uuid4
from fastapi import Depends
from passlib.context import CryptContext
import jwt
from jwt import PyJWTError
from sqlalchemy.orm import Session
from src.entities.user import User
from . import models
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from ..exceptions import AuthenticationError
import logging

# Load configuration from environment variables
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "197b2c37c391bed93fe80344fe73b806947a65e36206e05a1a23c2fa12702fe3")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
ALLOW_REGISTRATION = os.getenv("ALLOW_REGISTRATION", "true").lower() == "true"

oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return bcrypt_context.hash(password)


def authenticate_user(email: str, password: str, db: Session) -> User | bool:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        logging.warning(f"Failed authentication attempt for email: {email}")
        return False
    return user


def create_access_token(email: str, user_id: UUID, expires_delta: timedelta, is_admin: bool = False) -> str:
    encode = {
        'sub': email,
        'id': str(user_id),
        'is_admin': is_admin,
        'exp': datetime.now(timezone.utc) + expires_delta
    }
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> models.TokenData:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get('id')
        email: str = payload.get('sub')
        is_admin: bool = payload.get('is_admin', False)
        return models.TokenData(user_id=user_id, email=email, is_admin=is_admin)
    except PyJWTError as e:
        logging.warning(f"Token verification failed: {str(e)}")
        raise AuthenticationError()


def register_user(db: Session, register_user_request: models.RegisterUserRequest) -> None:
    # Отключаем обычную регистрацию - только админы могут регистрировать пользователей
    logging.warning(f"Registration attempt blocked: {register_user_request.email}")
    raise AuthenticationError("Registration is disabled. Only administrators can register new users.")


def register_user_by_admin(db: Session, register_user_request: models.RegisterUserRequest) -> None:
    """Регистрация пользователя администратором"""
    try:
        create_user_model = User(
            id=uuid4(),
            email=register_user_request.email,
            first_name=register_user_request.first_name,
            last_name=register_user_request.last_name,
            password_hash=get_password_hash(register_user_request.password),
            is_admin=False  # Новые пользователи не являются админами по умолчанию
        )    
        db.add(create_user_model)
        db.commit()
        logging.info(f"User registered by admin: {register_user_request.email}")
    except Exception as e:
        logging.error(f"Failed to register user by admin: {register_user_request.email}. Error: {str(e)}")
        raise


def is_admin_user(db: Session, user_id: UUID) -> bool:
    """Проверка, является ли пользователь администратором"""
    user = db.query(User).filter(User.id == user_id).first()
    return user.is_admin if user else False


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    """Получение пользователя по ID"""
    return db.query(User).filter(User.id == user_id).first()


def create_admin_user(db: Session, email: str, password: str, first_name: str = "Admin", last_name: str = "User") -> User:
    """Создание администратора системы"""
    try:
        admin_user = User(
            id=uuid4(),
            email=email,
            first_name=first_name,
            last_name=last_name,
            password_hash=get_password_hash(password),
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        logging.info(f"Admin user created: {email}")
        return admin_user
    except Exception as e:
        logging.error(f"Failed to create admin user: {email}. Error: {str(e)}")
        raise
    
    
def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]) -> models.TokenData:
    return verify_token(token)

def get_current_admin_user(token: Annotated[str, Depends(oauth2_bearer)]) -> models.TokenData:
    """Получение текущего пользователя с проверкой админ прав"""
    token_data = verify_token(token)
    # Проверка админ прав будет выполнена в контроллере
    return token_data

CurrentUser = Annotated[models.TokenData, Depends(get_current_admin_user)]


def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: Session) -> models.Token:
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise AuthenticationError()
    token = create_access_token(user.email, user.id, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES), user.is_admin)
    return models.Token(access_token=token, token_type='bearer')
