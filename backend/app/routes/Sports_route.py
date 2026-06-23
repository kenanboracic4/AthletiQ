
from typing import List

from fastapi import APIRouter, Depends, Response, status, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from websockets import Router
from app.database import get_db
from app.schemas.Sport_schema import SportRead
from app.service import Sport_service

router = APIRouter(
    prefix="/sports",
    tags=["Sports"],
)

@router.get('/all', response_model=List[SportRead])
async def get_sports(db: AsyncSession = Depends(get_db)):
    return await Sport_service.get_sports(db)