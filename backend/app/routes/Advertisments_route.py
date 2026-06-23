from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from websockets import Router
from app.database import get_db
from app.core.dependecy import get_current_user_id
from app.schemas.Advertisment_schema import AdvertisementCreate, AdvertisementUpdate, AdvertisementRead, PaginatedAdvertisementsResponse, AdvertismentPersonalResponse, RecommendedAdvertisementRead
from app.service import Advertisement_service

router = APIRouter(
    prefix="/advertisements",
    tags=["Advertisements"],
)

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_advertisement(data: AdvertisementCreate, db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await Advertisement_service.create_advertisement(db, current_user, data)

@router.get("/get-advertisement/{advertisement_id}", status_code=status.HTTP_200_OK, response_model=AdvertisementRead)
async def get_advertisement(advertisement_id: UUID, db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await Advertisement_service.get_advertisement(db, advertisement_id, current_user)

@router.patch("/update-advertisement/{advertisement_id}", status_code=status.HTTP_200_OK)
async def update_advertisement(advertisement_id: UUID, data: AdvertisementUpdate, db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):

    return await Advertisement_service.update_advertisement(db, advertisement_id,current_user, data)

@router.delete("/delete-advertisement/{advertisement_id}", status_code=status.HTTP_200_OK)
async def delete_advertisement(advertisement_id: UUID, db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await Advertisement_service.delete_advertisement(db, advertisement_id,current_user)

@router.get("/get-advertisements-by-user/{user_id}", status_code=status.HTTP_200_OK, response_model=PaginatedAdvertisementsResponse)
async def get_advertisements_by_user(
    user_id: UUID,
    cursor: Optional[str] = Query(None),
    limit: int = Query(10),
    db: AsyncSession = Depends(get_db)
):
    return await Advertisement_service.get_advertisements_by_user(db, user_id, cursor, limit)

@router.get("/my-advertisements", status_code=status.HTTP_200_OK, response_model=List[AdvertismentPersonalResponse])
async def get_user_advertisements(db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await Advertisement_service.get_user_advertisements(db, current_user)

@router.get("/recommended", status_code=status.HTTP_200_OK, response_model=List[RecommendedAdvertisementRead])
async def get_recommended_advertisements(
    limit: int = Query(20),
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await Advertisement_service.get_recommended_advertisements(db, current_user, limit)