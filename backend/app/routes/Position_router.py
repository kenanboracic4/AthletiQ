
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Response, status, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from websockets import Router
from app.database import get_db
from app.schemas.Position_schema import PositionRead
from app.service import Position_service

router = APIRouter(
    prefix="/positions",
    tags=["positions"],
)

@router.get('/all', response_model=List[PositionRead])
async def get_positions(db: AsyncSession = Depends(get_db)):
    return await Position_service.get_positions(db)

@router.get('/by-name', response_model=List[PositionRead])
async def get_position_by_name(name: str, db: AsyncSession = Depends(get_db)):
    return await Position_service.get_position_by_name(db, name)

@router.get('/by-sport-id/{sport_id}', response_model=List[PositionRead])
async def get_position_by_sport_id(sport_id: UUID, db: AsyncSession = Depends(get_db)):
    return await Position_service.get_position_by_sport_id(db, sport_id)

