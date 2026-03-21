from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_published: bool = False
    show_result_to_client: bool = True
    scoring_config: Optional[dict] = None


class TestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None
    show_result_to_client: Optional[bool] = None
    scoring_config: Optional[dict] = None


class TestResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    owner_id: int
    is_published: bool
    unique_link: Optional[str]
    show_result_to_client: bool
    scoring_config: Optional[dict]
    created_at: datetime
    updated_at: datetime
    questions_count: Optional[int] = 0
    sessions_count: Optional[int] = 0

    class Config:
        from_attributes = True


class TestListResponse(BaseModel):
    tests: list[TestResponse]
    total: int


class TestPublicResponse(BaseModel):
    """Публичная информация о тесте (для клиента)."""
    id: int
    title: str
    description: Optional[str]
    questions: list["QuestionPublicResponse"] = []

    class Config:
        from_attributes = True


# Forward reference — определим ниже в question.py, но здесь нужна заглушка
from app.schemas.question import QuestionPublicResponse  # noqa

TestPublicResponse.model_rebuild()