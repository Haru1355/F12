from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.dependencies import get_current_psychologist
from app.models.session import Session
from app.models.test import Test
from app.services.scoring_service import calculate_results
from app.schemas.session import SessionResponse
from app.models.user import User

router = APIRouter()


@router.post("/{session_id}/recalculate", response_model=SessionResponse)
async def recalculate_results(
    session_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_psychologist),
):
    """Пересчитать результаты сессии."""
    result = await session.execute(
        select(Session)
        .where(Session.id == session_id)
        .options(selectinload(Session.test))
    )
    sess = result.scalar_one_or_none()
    if not sess:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    # Проверяем доступ
    if current_user.role != "admin" and sess.test.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа")

    results = await calculate_results(session, sess)
    sess.results = results
    await session.commit()
    await session.refresh(sess)

    return SessionResponse.model_validate(sess)