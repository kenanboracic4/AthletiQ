
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Response, status, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from websockets import Router
from app.database import get_db
from app.schemas.Follow_schema import FollowRead, FollowCreate, FollowTogleReponse, FollowUpdate
from app.service import Follow_service
from app.core.dependecy import get_current_user_id
from app.schemas.Post_schema import PostRead

router = APIRouter(
    prefix="/follows",
    tags=["Follows"],
)

@router.post("/create", status_code=status.HTTP_200_OK, response_model=FollowTogleReponse)
async def create_follow( data: FollowCreate, db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await Follow_service.create_follow(db,current_user, data.nickname)

@router.get("/get-followers-list/{nickname}", status_code=status.HTTP_200_OK)
async def get_followers_list(
    nickname: str,
    limit: int = 10,
    cursor: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    parsed_cursor = datetime.fromisoformat(cursor) if cursor else None
    return await Follow_service.get_followers_list(db, nickname, limit, parsed_cursor)

@router.get("/get-following-list/{nickname}", status_code=status.HTTP_200_OK)
async def get_following_list(
    nickname: str,
    limit: int = 10,
    cursor: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    return await Follow_service.get_following_list(db, nickname, limit, cursor)

@router.get("/search/followers/{search_query}", status_code=status.HTTP_200_OK)
async def search_followers(nickname: str, search_query: str, db: AsyncSession = Depends(get_db)):
    return await Follow_service.search_followers(db, search_query, nickname)

@router.get("/search/{search_query}", status_code=status.HTTP_200_OK)
async def search_following_users(nickname: str, search_query: str, db: AsyncSession = Depends(get_db)):
    return await Follow_service.search_following_users(db, search_query, nickname)

