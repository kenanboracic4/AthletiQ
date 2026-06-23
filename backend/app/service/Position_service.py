
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repository import Position_repository as position_repo
async def get_positions(db: AsyncSession):

    return await position_repo.get_positions(db)

async def get_position_by_name(db: AsyncSession, name: str):

    return await position_repo.get_position_by_name(db, name)

async def get_position_by_sport_id(db: AsyncSession, sport_id: UUID):

    return await position_repo.get_position_by_sport_id(db, sport_id)