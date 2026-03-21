from pydantic import BaseModel
from typing import Optional


class ReportTemplateCreate(BaseModel):
    test_id: int
    name: str
    report_type: str = "client"
    html_template: Optional[str] = None
    interpretations: Optional[dict] = None


class ReportTemplateUpdate(BaseModel):
    name: Optional[str] = None
    report_type: Optional[str] = None
    html_template: Optional[str] = None
    interpretations: Optional[dict] = None


class ReportTemplateResponse(BaseModel):
    id: int
    test_id: int
    name: str
    report_type: str
    html_template: Optional[str]
    interpretations: Optional[dict]

    class Config:
        from_attributes = True