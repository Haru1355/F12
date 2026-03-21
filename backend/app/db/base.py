from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

from app.models.user import User
from app.models.test import Test
from app.models.question import Question
from app.models.option import Option
from app.models.session import Session
from app.models.answer import Answer