from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import create_access_token
from app.core.dependencies import get_current_user, get_current_admin
from app.services.user_service import authenticate_user, create_user, get_user_by_email
from app.schemas.user import (
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
    ProfileUpdate,
)
from app.models.user import User

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: LoginRequest,
    session: AsyncSession = Depends(get_session),
):
    user = await authenticate_user(session, form_data.email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )
    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: UserCreate,
    session: AsyncSession = Depends(get_session),
    current_admin: User = Depends(get_current_admin),
):
    existing = await get_user_by_email(session, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует",
        )
    if data.role not in ("psychologist", "admin"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недопустимая роль",
        )
    user = await create_user(session, data)
    return UserResponse.model_validate(user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: ProfileUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Редактирование собственного профиля."""
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    await session.commit()
    await session.refresh(current_user)
    return UserResponse.model_validate(current_user)