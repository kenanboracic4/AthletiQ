from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.User_schema import ProfileResponseSchema, ProfileUpdateSchema, UserMinRead,UserReadSuggested, ClubReadSuggested, PrivacyUpdate
from app.service import User_service as user_service
from app.core.dependecy import get_current_user_id
import shutil, uuid
from pathlib import Path

from fastapi import UploadFile, File

router = APIRouter(
    prefix="/user",
    tags=["User"],
)

@router.get('/by-username/{nickname}', response_model=ProfileResponseSchema)
async def get_user_by_username(nickname: str, db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await user_service.get_user_by_username(nickname, db, current_user)

@router.patch('/edit/by-username/{nickname}', response_model=ProfileResponseSchema)
async def edit_user_by_username(
    nickname: str,
    data: ProfileUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await user_service.edit_user_by_username(nickname, data, db, current_user)

@router.patch('/privacy', status_code=status.HTTP_200_OK)
async def update_privacy(
    data: PrivacyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await user_service.set_privacy(current_user, data.is_private, db)

@router.get('/search/{search_query}')
async def search_users(search_query: str, db: AsyncSession = Depends(get_db)):
    return await user_service.search_users(search_query, db)

@router.get('/suggested-people', response_model=list[UserReadSuggested])
async def get_suggested_people(
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1),
    random_sort: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id)
):

    return await user_service.get_suggested_people(page, limit, random_sort, db, current_user_id)

@router.get('/suggested-clubs', response_model=list[ClubReadSuggested])
async def get_suggested_clubs(
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1),
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id)
):

    return await user_service.get_suggested_clubs(page, limit, db, current_user_id)

@router.post('/upload-image/{nickname}')
async def upload_profile_image(
    nickname: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    return await user_service.upload_profile_image(nickname, file, db)

@router.post('/upload-cover/{nickname}')
async def upload_cover_image(
    nickname: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await user_service.upload_cover_image(nickname, file, db, current_user)

@router.get('/real-user/{nickname}')
async def get_real_user(
    nickname: str,
    db: AsyncSession = Depends(get_db)
):
    return await user_service.get_real_user(nickname, db)