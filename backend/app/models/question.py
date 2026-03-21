from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    text = Column(String)
    test_id = Column(Integer, ForeignKey("tests.id"))