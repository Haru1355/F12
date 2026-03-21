from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)