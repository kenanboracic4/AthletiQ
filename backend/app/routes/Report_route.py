from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.dependecy import get_current_user_id, get_admin_user_id
from app.schemas.Report_schema import ReportCreate, ReportRead
from app.service import Report_service as report_service

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)

@router.post("/create", response_model=ReportRead)
async def create_report(
    data: ReportCreate,
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id),
):
    return await report_service.create_report(db, user_id, data)
