from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.Scout_model import Scout

async def create_scout(db: AsyncSession, scout_dict: dict) -> Scout:
    db_scout = Scout(**scout_dict)
    db.add(db_scout)
    return db_scout

async def get_scout_by_uuid(db: AsyncSession, scout_id: UUID) -> Optional[Scout]:
    result = await db.execute(select(Scout).where(Scout.id == scout_id))
    return result.scalar_one_or_none()