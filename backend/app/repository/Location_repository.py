from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.Location_model import Location

async def get_locations(db: AsyncSession) -> Sequence[Location]:
    result = await db.execute(select(Location).order_by(Location.name))
    return result.scalars().all()
