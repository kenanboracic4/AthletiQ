from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.Athlete_model import Athlete

async def create_athlete(db: AsyncSession, athlete_dict: dict) -> Athlete:
    db_athlete = Athlete(**athlete_dict)
    db.add(db_athlete)
    return db_athlete

async def get_athlete_by_uuid(db: AsyncSession, athlete_id: UUID) -> Optional[Athlete]:
    result = await db.execute(select(Athlete).where(Athlete.id == athlete_id))
    return result.scalar_one_or_none()