from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base

class Option(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True)
    text = Column(String)
    question_id = Column(Integer, ForeignKey("questions.id"))