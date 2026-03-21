from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_admin
from app.repositories.user import UserRepository

router = APIRouter()

@router.get("/")
async def get_users(db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    repo = UserRepository(db)
    return await repo.get_all()

@router.get("/{user_id}")
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    repo = UserRepository(db)
    return await repo.get_by_id(user_id)


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    await repo.delete(user)
    return {"status": "deleted"}