from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.Coach_model import Coach

async def create_coach(db: AsyncSession, coach_dict: dict) -> Coach:
    db_coach = Coach(**coach_dict)
    db.add(db_coach)
    return db_coach

async def get_coach_by_uuid(db: AsyncSession, coach_id: UUID) -> Optional[Coach]:
    result = await db.execute(select(Coach).where(Coach.id == coach_id))
    return result.scalar_one_or_none()