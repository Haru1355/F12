import io
from typing import Optional, Dict, Any

from docx import Document
from docx.shared import Pt, Inches
from jinja2 import Template

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.session import Session
from app.models.test import Test
from app.models.question import Question
from app.models.answer import Answer
from app.models.report_template import ReportTemplate


async def get_report_data(
    db_session: AsyncSession, session_id: int
) -> Optional[Dict[str, Any]]:
    """Собирает все данные для отчёта."""
    # Загружаем сессию
    result = await db_session.execute(
        select(Session)
        .where(Session.id == session_id)
        .options(
            selectinload(Session.answers).selectinload(Answer.question).selectinload(Question.options),
            selectinload(Session.test),
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return None

    test = session.test

    # Формируем данные ответов
    answers_data = []
    for answer in session.answers:
        q = answer.question
        answer_text = ""

        if answer.selected_option_id:
            opt = next((o for o in q.options if o.id == answer.selected_option_id), None)
            answer_text = opt.text if opt else "N/A"
        elif answer.selected_option_ids:
            selected = [o.text for o in q.options if o.id in answer.selected_option_ids]
            answer_text = ", ".join(selected)
        elif answer.text_value:
            answer_text = answer.text_value
        elif answer.scale_value is not None:
            answer_text = str(answer.scale_value)

        answers_data.append({
            "question": q.text,
            "question_type": q.question_type,
            "answer": answer_text,
        })

    # Интерпретации
    interpretations = {}
    if session.results and session.results.get("metrics"):
        # Ищем шаблон отчёта
        templ_result = await db_session.execute(
            select(ReportTemplate).where(ReportTemplate.test_id == test.id)
        )
        templates = templ_result.scalars().all()

        for template in templates:
            if template.interpretations:
                for metric_key, ranges in template.interpretations.items():
                    score = session.results["metrics"].get(metric_key, 0)
                    for r in ranges:
                        if r.get("min", 0) <= score <= r.get("max", 999):
                            interpretations[metric_key] = {
                                "score": score,
                                "text": r.get("text", ""),
                                "level": r.get("level", ""),
                            }
                            break

    return {
        "test_title": test.title,
        "test_description": test.description,
        "client_name": session.client_name or "Анонимный клиент",
        "client_email": session.client_email or "",
        "completed_at": str(session.completed_at) if session.completed_at else "",
        "status": session.status,
        "results": session.results or {},
        "answers": answers_data,
        "interpretations": interpretations,
    }


async def generate_html_report(
    db_session: AsyncSession,
    session_id: int,
    report_type: str = "client",
) -> Optional[str]:
    """Генерация HTML-отчёта."""
    data = await get_report_data(db_session, session_id)
    if not data:
        return None

    # Ищем кастомный шаблон
    session_result = await db_session.execute(
        select(Session).where(Session.id == session_id)
    )
    session_obj = session_result.scalar_one_or_none()

    custom_template = None
    if session_obj:
        templ_result = await db_session.execute(
            select(ReportTemplate).where(
                ReportTemplate.test_id == session_obj.test_id,
                ReportTemplate.report_type == report_type,
            )
        )
        template_obj = templ_result.scalar_one_or_none()
        if template_obj and template_obj.html_template:
            custom_template = template_obj.html_template

    if custom_template:
        template = Template(custom_template)
    else:
        template = Template(DEFAULT_HTML_TEMPLATE)

    return template.render(**data, report_type=report_type)


async def generate_docx_report(
    db_session: AsyncSession,
    session_id: int,
    report_type: str = "client",
) -> Optional[io.BytesIO]:
    """Генерация DOCX-отчёта."""
    data = await get_report_data(db_session, session_id)
    if not data:
        return None

    doc = Document()

    # Заголовок
    doc.add_heading(f'Отчёт: {data["test_title"]}', level=0)

    # Информация о клиенте
    doc.add_heading("Информация", level=1)
    doc.add_paragraph(f'Клиент: {data["client_name"]}')
    if data["client_email"]:
        doc.add_paragraph(f'Email: {data["client_email"]}')
    doc.add_paragraph(f'Дата: {data["completed_at"]}')
    doc.add_paragraph(f'Статус: {data["status"]}')

    # Результаты
    if data["results"]:
        doc.add_heading("Результаты", level=1)

        results = data["results"]
        if "total_score" in results:
            doc.add_paragraph(f'Общий балл: {results["total_score"]}')

        if "metrics" in results:
            doc.add_heading("Метрики", level=2)
            for key, value in results["metrics"].items():
                doc.add_paragraph(f'{key}: {value}')

        if "computed" in results:
            doc.add_heading("Вычисленные показатели", level=2)
            for key, value in results["computed"].items():
                doc.add_paragraph(f'{key}: {value}')

    # Интерпретации
    if data["interpretations"]:
        doc.add_heading("Интерпретация", level=1)
        for metric, info in data["interpretations"].items():
            doc.add_paragraph(f'{metric} (балл: {info["score"]}): {info["text"]}')

    # Ответы (для психолога)
    if report_type == "psychologist" and data["answers"]:
        doc.add_heading("Детализация ответов", level=1)
        table = doc.add_table(rows=1, cols=2)
        table.style = "Table Grid"
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = "Вопрос"
        hdr_cells[1].text = "Ответ"

        for ans in data["answers"]:
            row_cells = table.add_row().cells
            row_cells[0].text = ans["question"]
            row_cells[1].text = ans["answer"]

    # В BytesIO
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer


# Дефолтный HTML-шаблон отчёта
DEFAULT_HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Отчёт: {{ test_title }}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #2980b9; margin-top: 30px; }
        .info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .metric { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .metric-key { font-weight: bold; }
        .metric-value { color: #2980b9; font-weight: bold; }
        .interpretation { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #4caf50; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
        th { background-color: #3498db; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .total { font-size: 1.5em; color: #e74c3c; font-weight: bold; text-align: center; padding: 20px; background: #ffeaa7; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>{{ test_title }}</h1>

    <div class="info">
        <p><strong>Клиент:</strong> {{ client_name }}</p>
        {% if client_email %}<p><strong>Email:</strong> {{ client_email }}</p>{% endif %}
        <p><strong>Дата:</strong> {{ completed_at }}</p>
    </div>

    {% if results %}
    <h2>Результаты</h2>

    {% if results.total_score is defined %}
    <div class="total">Общий балл: {{ results.total_score }}</div>
    {% endif %}

    {% if results.metrics %}
    <h2>Метрики</h2>
    {% for key, value in results.metrics.items() %}
    <div class="metric">
        <span class="metric-key">{{ key }}</span>
        <span class="metric-value">{{ value }}</span>
    </div>
    {% endfor %}
    {% endif %}

    {% if results.computed %}
    <h2>Вычисленные показатели</h2>
    {% for key, value in results.computed.items() %}
    <div class="metric">
        <span class="metric-key">{{ key }}</span>
        <span class="metric-value">{{ value }}</span>
    </div>
    {% endfor %}
    {% endif %}
    {% endif %}

    {% if interpretations %}
    <h2>Интерпретация</h2>
    {% for metric, info in interpretations.items() %}
    <div class="interpretation">
        <strong>{{ metric }}</strong> (балл: {{ info.score }})<br>
        {{ info.text }}
    </div>
    {% endfor %}
    {% endif %}

    {% if report_type == 'psychologist' and answers %}
    <h2>Детализация ответов</h2>
    <table>
        <thead>
            <tr><th>Вопрос</th><th>Ответ</th></tr>
        </thead>
        <tbody>
        {% for ans in answers %}
            <tr><td>{{ ans.question }}</td><td>{{ ans.answer }}</td></tr>
        {% endfor %}
        </tbody>
    </table>
    {% endif %}
</body>
</html>
"""