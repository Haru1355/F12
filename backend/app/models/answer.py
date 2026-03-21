from sqlalchemy import Column, Integer, ForeignKey
from app.db.base import Base

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    option_id = Column(Integer, ForeignKey("options.id"))