from sqlalchemy import String, Boolean, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from datetime import datetime

from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(50), nullable=False, default="psychologist")  
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    

    access_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), 
        nullable=True,
        index=True, 
        comment="Дата окончания доступа (null = бессрочно, для админов)"
    )

    tests: Mapped[List["Test"]] = relationship(
        "Test", back_populates="owner", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
    

    def has_active_access(self) -> bool:
        """Проверяет, что у пользователя есть активный доступ."""
        if not self.is_active:
            return False
        

        if self.role == "admin":
            return True
        

        if self.access_until is None:
            return True
        

        return self.access_until > datetime.utcnow()