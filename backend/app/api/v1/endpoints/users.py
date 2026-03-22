from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_session
from app.core.dependencies import get_current_admin
from app.services.user_service import (
    list_users,
    get_user_by_id,
    update_user,
    delete_user,
    extend_user_access,
    set_unlimited_access,
    revoke_access,
    get_users_with_expiring_access,
)
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    UserListResponse,
    ExtendAccessRequest,
    ExtendAccessResponse,
)
from app.models.user import User


router = APIRouter()


@router.get("/", response_model=UserListResponse)
async def get_users(
    role: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    session: AsyncSession = Depends(get_session),
    current_admin: User = Depends(get_current_admin),
):
    users, total = await list_users(session, role=role, skip=skip, limit=limit)
    return UserListResponse(
        users=[UserResponse.model_validate(u) for u in users],
        total=total,
    )


# ← ВАЖНО: этот роут ВЫШЕ /{user_id}
@router.get("/expiring-access", response_model=UserListResponse)
async def get_expiring_access_users(
    days: int = Query(7, ge=1, le=90, description="Порог в днях"),
    session: AsyncSession = Depends(get_session),
    current_admin: User = Depends(get_current_admin),
):
    """Получить пользователей с истекающим доступом."""
    users = await get_users_with_expiring_access(session, days_threshold=days)
    return UserListResponse(
        users=[UserResponse.model_validate(u) for u in users],
        total=len(users),
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    current_admin: User = Depends(get_current_admin),
):
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user_endpoint(
    user_id: int,
    data: UserUpdate,
    session: AsyncSession = Depends(get_session),
    current_admin: User = Depends(get_current_admin),
):
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    updated = await update_user(session, user, data)
    return UserResponse.model_validate(updated)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    current_admin: User = Depends(get_current_admin),
):
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Нельзя удалить самого себя")
    await delete_user(session, user)


@router.post("/{user_id}/extend-access", response_model=ExtendAccessResponse)
async def extend_access(
    user_id: int,
    data: ExtendAccessRequest,
    session: AsyncSession = Depends(get_session),
    current_admin: User = Depends(get_current_admin),
):
    """Продлить доступ пользователю."""
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Нельзя изменить доступ администратору")

    old_date, new_date = await extend_user_access(session, user, data.days)

    return ExtendAccessResponse(
        user_id=user.id,
        email=user.email,
        old_access_until=old_date,
        new_access_until=new_date,
        extended_days=data.days,
        message=f"Доступ продлён до {new_date.strftime('%d.%m.%Y %H:%M')}",
    )


@router.post("/{user_id}/set-unlimited-access", response_model=UserResponse)
async def set_unlimited_access_endpoint(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    current_admin: User = Depends(get_current_admin),
):
    """Установить бессрочный доступ."""
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    await set_unlimited_access(session, user)
    return UserResponse.model_validate(user)


@router.post("/{user_id}/revoke-access", response_model=UserResponse)
async def revoke_access_endpoint(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    current_admin: User = Depends(get_current_admin),
):
    """Немедленно отозвать доступ."""
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Нельзя отозвать доступ администратору")

    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Нельзя отозвать доступ самому себе")

    await revoke_access(session, user)
    return UserResponse.model_validate(user)