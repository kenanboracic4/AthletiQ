from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.Club_model import Club

async def create_club(db: AsyncSession, club_dict: dict) -> Club:
    db_club = Club(**club_dict)
    db.add(db_club)
    return db_club

async def get_club_by_uuid(db: AsyncSession, club_id: UUID) -> Optional[Club]:
    result = await db.execute(select(Club).where(Club.id == club_id))
    return result.scalar_one_or_none()