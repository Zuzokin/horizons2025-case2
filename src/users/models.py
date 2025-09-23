from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool
    is_admin: bool
    created_at: datetime


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    new_password_confirm: str
