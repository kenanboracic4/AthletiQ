
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repository import Sport_repository as sport_repo
from app.schemas.Sport_schema import SportRead

async def get_sports(db: AsyncSession):

    return await sport_repo.get_sports(db)
