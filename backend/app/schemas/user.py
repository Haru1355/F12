from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime, timedelta


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "psychologist"
    access_until: Optional[datetime] = None  # 🆕
    
    @field_validator('access_until')
    @classmethod
    def validate_access_until(cls, v, info):
        """Валидация: дата доступа должна быть в будущем."""
        if v is not None and v < datetime.utcnow():
            raise ValueError('Дата окончания доступа должна быть в будущем')
        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    access_until: Optional[datetime] = None  # 🆕


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    access_until: Optional[datetime] = None 
    has_active_access: bool = True 
    created_at: datetime

    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        """Добавляем вычисление has_active_access."""
        data = super().model_validate(obj)
        if hasattr(obj, 'has_active_access'):
            data.has_active_access = obj.has_active_access()
        return data


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int


class ExtendAccessRequest(BaseModel):
    days: int = Field(
        ..., 
        ge=1, 
        le=3650,
        description="Количество дней для продления (от 1 до 3650)"
    )
    
    @field_validator('days')
    @classmethod
    def validate_days(cls, v):
        """Стандартные периоды: 30, 90, 180, 365 дней."""
        allowed = {1, 7, 30, 90, 180, 365, 730, 1095, 1825, 3650}
        if v not in allowed:
            pass
        return v


class ExtendAccessResponse(BaseModel):
    user_id: int
    email: str
    old_access_until: Optional[datetime]
    new_access_until: datetime
    extended_days: int
    message: str


TokenResponse.model_rebuild()