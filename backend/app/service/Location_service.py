from sqlalchemy.ext.asyncio import AsyncSession

from app.repository import Location_repository as location_repo

async def get_locations(db: AsyncSession):
    return await location_repo.get_locations(db)
