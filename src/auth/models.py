from uuid import UUID
from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterUserRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str

class AdminRegisterUserRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    user_id: str | None = None
    email: str | None = None
    is_admin: bool = False

    def get_uuid(self) -> UUID | None:
        if self.user_id:
            return UUID(self.user_id)
        return None

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    is_admin: bool

class CreateAdminRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str = "Admin"
    last_name: str = "User"