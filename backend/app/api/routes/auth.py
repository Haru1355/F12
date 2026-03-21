from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_admin
from app.schemas.user import UserCreate
from app.schemas.auth import Token
from app.repositories.user import UserRepository
from app.services.auth import hash_password, verify_password, create_token

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(data: UserCreate, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_by_email(data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_token(user.id)
    return {"access_token": token}

@router.post("/register")
async def register(data: UserCreate, db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    repo = UserRepository(db)
    user = await repo.create(data.email, hash_password(data.password), "psychologist")
    return user

