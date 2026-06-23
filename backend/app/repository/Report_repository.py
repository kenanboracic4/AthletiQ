from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import func, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.Report_model import Report, ReportStatus, ReportTargetType

async def create_report(db: AsyncSession, report_dict: dict) -> Report:
    db_report = Report(**report_dict)
    db.add(db_report)
    await db.flush()
    return db_report

async def get_report_by_id(db: AsyncSession, report_id: UUID) -> Optional[Report]:
    query = (
        select(Report)
        .options(joinedload(Report.reporter))
        .where(Report.id == report_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_reports(
    db: AsyncSession,
    status: Optional[ReportStatus] = None,
    cursor: Optional[str] = None,
    limit: int = 20,
):
    query = (
        select(Report)
        .options(
            joinedload(Report.reporter),
            joinedload(Report.post),
            joinedload(Report.advertisement),
        )
        .order_by(Report.created_at.desc())
    )

    if status:
        query = query.where(Report.status == status)

    if cursor:
        cursor_time = datetime.fromisoformat(cursor)
        query = query.where(Report.created_at < cursor_time)

    query = query.limit(limit + 1)
    result = await db.execute(query)
    items = list(result.scalars().unique().all())

    has_more = len(items) > limit
    if has_more:
        items = items[:limit]

    next_cursor = items[-1].created_at.isoformat() if has_more and items else None

    return {
        "items": items,
        "has_more": has_more,
        "next_cursor": next_cursor,
    }

async def update_report_status(db: AsyncSession, report_id: UUID, status: ReportStatus):
    query = (
        update(Report)
        .where(Report.id == report_id)
        .values(status=status)
    )
    result = await db.execute(query)
    return result.rowcount

async def delete_report(db: AsyncSession, report_id: UUID):
    query = delete(Report).where(Report.id == report_id)
    result = await db.execute(query)
    return result.rowcount

async def get_existing_report(
    db: AsyncSession,
    reporter_id: UUID,
    target_type: ReportTargetType,
    post_id: Optional[UUID] = None,
    advertisement_id: Optional[UUID] = None,
):
    query = select(Report).where(
        Report.reporter_id == reporter_id,
        Report.target_type == target_type,
        Report.status == ReportStatus.PENDING,
    )

    if post_id:
        query = query.where(Report.post_id == post_id)
    if advertisement_id:
        query = query.where(Report.advertisement_id == advertisement_id)

    result = await db.execute(query)
    return result.scalar_one_or_none()

async def count_reports(db: AsyncSession, status: Optional[ReportStatus] = None) -> int:
    query = select(func.count()).select_from(Report)
    if status:
        query = query.where(Report.status == status)
    result = await db.execute(query)
    return result.scalar() or 0
