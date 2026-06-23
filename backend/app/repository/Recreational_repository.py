from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.Recreational_model import Recreational

async def create_recreational(db: AsyncSession, recreational_dict: dict) -> Recreational:
    db_recreational = Recreational(**recreational_dict)
    db.add(db_recreational)
    return db_recreational

async def get_recreational_by_uuid(db: AsyncSession, recreational_id: UUID) -> Optional[Recreational]:
    result = await db.execute(select(Recreational).where(Recreational.id == recreational_id))
    return result.scalar_one_or_none()