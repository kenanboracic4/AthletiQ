from typing import Optional, Sequence
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.Position_model import Position
from ..models.Sport_model import Sport

async def create_position(db: AsyncSession, position_dict: dict) -> Position:
    db_position = Position(**position_dict)
    db.add(db_position)
    await db.commit()
    await db.refresh(db_position)
    return db_position

async def get_position_by_uuid(db: AsyncSession, position_id: UUID) -> Optional[Position]:
    result = await db.execute(select(Position).filter(Position.id == position_id))
    return result.scalar_one_or_none()

async def get_positions(db: AsyncSession) -> Sequence[Position]:
    result = await db.execute(select(Position))
    return result.scalars().all()

async def get_position_by_name(db: AsyncSession, name: str):
    query = select(Position).join(Sport, Position.sport_id == Sport.id).where(Sport.name == name)
    result = await db.execute(query)
    return result.scalars().all()

async def get_position_by_sport_id(db: AsyncSession, sport_id: UUID):
    query = select(Position).join(Sport, Position.sport_id == Sport.id).where(Sport.id == sport_id)
    result = await db.execute(query)
    return result.scalars().all()