from typing import Optional, Sequence
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.Sport_model import Sport

async def create_sport(db: AsyncSession, sport_dict: dict) -> Sport:
    db_sport = Sport(**sport_dict)
    db.add(db_sport)
    await db.commit()
    await db.refresh(db_sport)
    return db_sport

async def get_sport_by_uuid(db: AsyncSession, sport_id: UUID) -> Optional[Sport]:
    result = await db.execute(select(Sport).filter(Sport.id == sport_id))
    return result.scalar_one_or_none()

async def get_sports(db: AsyncSession) -> Sequence[Sport]:

    result = await db.execute(select(Sport))
    return result.scalars().all()  