from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..auth import models, service
from ..auth.service import CurrentUser
from ..database.core import DbSession
from ..exceptions import AuthenticationError

router = APIRouter(
    prefix='/admin',
    tags=['admin']
)


@router.post("/register-user", status_code=status.HTTP_201_CREATED)
async def register_user_by_admin(
    register_request: models.AdminRegisterUserRequest,
    db: DbSession,
    current_user: CurrentUser
):
    """Регистрация нового пользователя администратором"""
    # Проверяем админ права
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        service.register_user_by_admin(db, register_request)
        return {"message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to register user: {str(e)}"
        )


@router.get("/users", response_model=List[models.UserResponse])
async def get_all_users(
    db: DbSession,
    current_user: CurrentUser
):
    """Получение списка всех пользователей"""
    # Проверяем админ права
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    from ..entities.user import User
    users = db.query(User).all()
    return [
        models.UserResponse(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_admin=user.is_admin
        ) for user in users
    ]


@router.get("/users/{user_id}", response_model=models.UserResponse)
async def get_user_by_id(
    user_id: str,
    db: DbSession,
    current_user: CurrentUser
):
    """Получение пользователя по ID"""
    # Проверяем админ права
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    from uuid import UUID
    try:
        user_uuid = UUID(user_id)
        user = service.get_user_by_id(db, user_uuid)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return models.UserResponse(
            id=str(user.id),
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_admin=user.is_admin
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )


@router.post("/create-admin", status_code=status.HTTP_201_CREATED)
async def create_admin_user(
    admin_request: models.CreateAdminRequest,
    db: DbSession,
    current_user: CurrentUser
):
    """Создание нового администратора"""
    # Проверяем админ права
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        admin_user = service.create_admin_user(
            db=db,
            email=admin_request.email,
            password=admin_request.password,
            first_name=admin_request.first_name,
            last_name=admin_request.last_name
        )
        return {
            "message": "Admin user created successfully",
            "user_id": str(admin_user.id),
            "email": admin_user.email
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create admin user: {str(e)}"
        )


@router.get("/me", response_model=models.UserResponse)
async def get_current_admin_info(
    current_user: CurrentUser
):
    """Получение информации о текущем администраторе"""
    # Проверяем админ права
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return models.UserResponse(
        id=current_user.user_id,
        email=current_user.email,
        first_name="",  # Эти поля нужно будет добавить в TokenData если нужно
        last_name="",
        is_admin=current_user.is_admin
    )
