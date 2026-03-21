from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from datetime import datetime, timedelta

from app.models.user import User
from app.core.security import hash_password, verify_password
from app.schemas.user import UserCreate, UserUpdate


async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(session: AsyncSession, user_id: int) -> Optional[User]:
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(session: AsyncSession, data: UserCreate) -> User:
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        access_until=data.access_until,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def update_user(session: AsyncSession, user: User, data: UserUpdate) -> User:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    await session.commit()
    await session.refresh(user)
    return user


async def delete_user(session: AsyncSession, user: User) -> None:
    await session.delete(user)
    await session.commit()


async def list_users(
    session: AsyncSession,
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple[List[User], int]:
    query = select(User)
    count_query = select(func.count(User.id))

    if role:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)

    total_result = await session.execute(count_query)
    total = total_result.scalar()

    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    result = await session.execute(query)
    users = result.scalars().all()

    return users, total


async def authenticate_user(
    session: AsyncSession, email: str, password: str
) -> Optional[User]:
    user = await get_user_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def extend_user_access(
    session: AsyncSession, 
    user: User, 
    days: int
) -> tuple[Optional[datetime], datetime]:
    """
    Продлить доступ пользователя.
    
    Args:
        session: Сессия БД
        user: Пользователь
        days: Количество дней для продления
    
    Returns:
        Tuple (старая дата, новая дата)
    """
    old_access_until = user.access_until

    if user.access_until is None or user.access_until < datetime.utcnow():
        base_date = datetime.utcnow()
    else:
        base_date = user.access_until
    
    user.access_until = base_date + timedelta(days=days)
    
    await session.commit()
    await session.refresh(user)
    
    return old_access_until, user.access_until


async def set_unlimited_access(
    session: AsyncSession,
    user: User
) -> None:
    """Установить бессрочный доступ (для админов или VIP-клиентов)."""
    user.access_until = None
    await session.commit()
    await session.refresh(user)


async def revoke_access(
    session: AsyncSession,
    user: User
) -> None:
    """Немедленно отозвать доступ (установить дату в прошлое)."""
    user.access_until = datetime.utcnow() - timedelta(days=1)
    await session.commit()
    await session.refresh(user)


async def get_users_with_expiring_access(
    session: AsyncSession,
    days_threshold: int = 7
) -> list[User]:
    """
    Получить пользователей, у которых доступ истекает в ближайшие N дней.
    Для отправки уведомлений.
    """
    threshold_date = datetime.utcnow() + timedelta(days=days_threshold)
    
    result = await session.execute(
        select(User).where(
            User.is_active == True,
            User.role == "psychologist",
            User.access_until.isnot(None),
            User.access_until <= threshold_date,
            User.access_until > datetime.utcnow()
        )
    )
    
    return result.scalars().all()