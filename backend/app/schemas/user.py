from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# --- Auth ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# --- User ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "psychologist"


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int


# Разрешаем forward references
TokenResponse.model_rebuild()