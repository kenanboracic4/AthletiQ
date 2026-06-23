from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.dependecy import get_current_user_id
from app.schemas.FriendRequest_schema import (
    FriendRequestCreate,
    FriendRequestRead,
    FriendRequestActionResponse,
)
from app.service import FriendRequest_service

router = APIRouter(
    prefix="/friend-requests",
    tags=["Friend Requests"],
)

@router.post("/send", status_code=status.HTTP_200_OK, response_model=FriendRequestActionResponse)
async def send_request(
    data: FriendRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await FriendRequest_service.send_request(db, current_user, data.nickname)

@router.post("/accept", status_code=status.HTTP_200_OK, response_model=FriendRequestActionResponse)
async def accept_request(
    data: FriendRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await FriendRequest_service.accept_request(db, current_user, data.nickname)

@router.post("/decline", status_code=status.HTTP_200_OK, response_model=FriendRequestActionResponse)
async def decline_request(
    data: FriendRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await FriendRequest_service.decline_request(db, current_user, data.nickname)

@router.post("/cancel", status_code=status.HTTP_200_OK, response_model=FriendRequestActionResponse)
async def cancel_request(
    data: FriendRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await FriendRequest_service.cancel_request(db, current_user, data.nickname)

@router.post("/remove", status_code=status.HTTP_200_OK, response_model=FriendRequestActionResponse)
async def remove_friend(
    data: FriendRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await FriendRequest_service.remove_friend(db, current_user, data.nickname)

@router.get("/incoming", status_code=status.HTTP_200_OK, response_model=List[FriendRequestRead])
async def get_incoming_requests(
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await FriendRequest_service.get_incoming_requests(db, current_user)
