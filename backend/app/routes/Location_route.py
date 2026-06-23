from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.Location_schema import LocationRead
from app.service import Location_service

router = APIRouter(
    prefix="/locations",
    tags=["Locations"],
)

@router.get("/all", response_model=List[LocationRead])
async def get_locations(db: AsyncSession = Depends(get_db)):
    return await Location_service.get_locations(db)
