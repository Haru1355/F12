from sqlalchemy import select
from app.models.user import User

class UserRepository:
    def __init__(self, db):
        self.db = db

    async def get_by_email(self, email):
        res = await self.db.execute(select(User).where(User.email == email))
        return res.scalar_one_or_none()

    async def create(self, email, password, role):
        user = User(email=email, hashed_password=password, role=role)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_all(self):
        res = await self.db.execute(select(User))
        return res.scalars().all()
    
    async def get_by_id(self, user_id: int):
        res = await self.db.execute(select(User).where(User.id == user_id))
        return res.scalar_one_or_none()

    async def delete(self, user: User):
        await self.db.delete(user)
        await self.db.commit()