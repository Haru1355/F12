from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.services.report_service import generate_html_report, generate_docx_report
from app.utils.file_helpers import create_docx_response, create_html_response

router = APIRouter()


@router.get("/{session_id}")
async def get_report(
    session_id: int,
    type: str = Query("client", description="Тип: client или psychologist"),
    format: str = Query("html", description="Формат: html или docx"),
    session: AsyncSession = Depends(get_session),
):
    if type not in ("client", "psychologist"):
        raise HTTPException(status_code=400, detail="Тип: client или psychologist")
    if format not in ("html", "docx"):
        raise HTTPException(status_code=400, detail="Формат: html или docx")

    if format == "html":
        html = await generate_html_report(session, session_id, report_type=type)
        if not html:
            raise HTTPException(status_code=404, detail="Данные не найдены")
        return create_html_response(html)
    elif format == "docx":
        docx_buffer = await generate_docx_report(session, session_id, report_type=type)
        if not docx_buffer:
            raise HTTPException(status_code=404, detail="Данные не найдены")
        return create_docx_response(docx_buffer, f"report_{session_id}_{type}.docx")