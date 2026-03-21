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
)
from app.schemas.user import UserResponse, UserUpdate, UserListResponse
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