
import os
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.User_schema import ProfileUpdateSchema, UserReadSuggested, ClubReadSuggested, UserRole
from app.repository import User_repository as user_repo
import shutil, uuid
from pathlib import Path
from fastapi import UploadFile

from app.schemas.User_schema import (
    AthleteProfileRead,
    CoachProfileRead,
    ClubProfileRead,
    ScoutProfileRead,
    RecreationalProfileRead,
    UserRead,
    UserRole
)
from app.repository import Follow_repository as follow_repo
from app.repository import FriendRequest_repository as friend_repo
from app.service import FriendRequest_service as friend_service
from app.repository import Profile_extended_repository as ext_repo

def _build_profile_payload(user, followers_count, following_count, is_following, base_visibility_data):
    role_mapping = {
        UserRole.ATHLETE: AthleteProfileRead,
        UserRole.COACH: CoachProfileRead,
        UserRole.CLUB: ClubProfileRead,
        UserRole.SCOUT: ScoutProfileRead,
        UserRole.RECREATIONAL_ATHLETE: RecreationalProfileRead,
    }

    current_role = user.role

    if current_role not in role_mapping:
        return UserRead.model_validate({
            **{
                "id": user.id,
                "email": user.email,
                "nickname": user.nickname,
                "image": user.image,
                "cover_image": user.cover_image,
                "created_at": user.created_at,
                "followers_count": followers_count,
                "following_count": following_count,
                "is_following": is_following,
                **base_visibility_data,
            }
        }).model_dump()

    profile_schema = role_mapping[current_role]
    relation_name = current_role.name.lower()
    if current_role == UserRole.RECREATIONAL_ATHLETE:
        relation_name = "recreational"

    profile_data = getattr(user, relation_name, None)
    if not profile_data:
        return UserRead.model_validate(user).model_dump()

    combined_data = {
        "id": user.id,
        "email": user.email,
        "nickname": user.nickname,
        "role": current_role.name,
        "image": user.image,
        "cover_image": user.cover_image,
        "created_at": user.created_at,
        "followers_count": followers_count,
        "following_count": following_count,
        "is_following": is_following,
        **base_visibility_data,
    }

    for column in profile_data.__table__.columns.keys():
        combined_data[column] = getattr(profile_data, column)

    if hasattr(profile_data, "sport") and profile_data.sport:
        combined_data["sport"] = profile_data.sport
    if hasattr(profile_data, "position") and profile_data.position:
        combined_data["position"] = profile_data.position

    combined_data.update(ext_repo.serialize_extended_profile(user))

    return profile_schema.model_validate(combined_data).model_dump()

async def get_user_by_username(nickname: str, db: AsyncSession, current_user_id: UUID):

    user = await user_repo.get_user_with_profile_by_username(nickname, db)

    if user is None:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    followers_count = await follow_repo.get_followers_count(db, user.id)
    following_count = await follow_repo.get_following_count(db, user.id)

    following_record = await follow_repo.get_follow(db, current_user_id, user.id)
    is_following = following_record is not None

    friendship_status = await friend_service.get_friendship_status(db, current_user_id, user.id)
    is_friend = friendship_status == "friends"

    base_visibility_data = {
        "is_private": user.is_private,
        "is_friend": is_friend,
        "friendship_status": friendship_status,
    }

    return _build_profile_payload(
        user, followers_count, following_count, is_following, base_visibility_data
    )

async def get_user_by_id(user_id: UUID, db: AsyncSession):
    return await user_repo.get_user_by_uuid( db, user_id)

async def set_privacy(user_id: UUID, is_private: bool, db: AsyncSession):
    user = await user_repo.get_user_by_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    if is_private and user.role == UserRole.CLUB:
        raise HTTPException(status_code=400, detail="Klub ne može imati privatan profil!")
    user.is_private = is_private
    await db.commit()
    await db.refresh(user)
    return {"is_private": user.is_private}

async def edit_user_by_username(nickname: str, data: ProfileUpdateSchema, db: AsyncSession, current_user_id: UUID):
    updated_user = await user_repo.edit_user_by_username(db, nickname, data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    if updated_user.id != current_user_id:
        raise HTTPException(status_code=403, detail="Nemate dozvolu za uređivanje ovog profila")

    return await get_user_by_username(nickname, db, current_user_id)

async def search_users(search_query: str, db: AsyncSession):
    return await user_repo.search_users( db, search_query)

async def get_suggested_people(page: int, limit: int, random_sort: bool, db: AsyncSession, current_user_id: UUID):

    if random_sort:
        users = await user_repo.get_suggested_people_random_sort(db, page, limit, current_user_id)
    else:
        users = await user_repo.get_suggested_people(db, page, limit, current_user_id)

    result = []

    for user in users:
        if user.id == current_user_id:
            continue

        following_record = await follow_repo.get_follow(db, current_user_id, user.id)
        is_following = following_record is not None

        friendship_status = await friend_service.get_friendship_status(db, current_user_id, user.id)

        result.append(UserReadSuggested(
            id=user.id,
            image=user.image,
            created_at=user.created_at,
            is_following=is_following,
            is_private=user.is_private,
            friendship_status=friendship_status,
            nickname=user.nickname,
            role=user.role.name,
        ))

    return result

async def get_suggested_clubs(page: int, limit: int, db: AsyncSession, current_user_id: UUID):
    clubs = await user_repo.get_suggested_clubs(db, page, limit, current_user_id)

    result = []

    for user in clubs:
        if user.id == current_user_id:
            continue

        following_record = await follow_repo.get_follow(db, current_user_id, user.id)
        is_following = following_record is not None

        result.append(ClubReadSuggested(
            id=user.id,
            image=user.image,
            created_at=user.created_at,
            is_following=is_following,
            nickname=user.nickname,
            role=user.role.name,
            club_name=user.club.club_name if user.club else None,
            location=user.club.location if user.club else None,
            sport=user.club.sport.name if user.club and user.club.sport else None,
        ))

    return result

async def upload_profile_image(nickname: str, file: UploadFile, db: AsyncSession):
    user = await user_repo.get_user_with_profile_by_username(nickname, db)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    save_path = Path("uploads/profile_images") / filename
    save_path.parent.mkdir(parents=True, exist_ok=True)

    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
    image_url = f"{BASE_URL}/uploads/profile_images/{filename}"

    user.image = image_url
    await db.commit()
    await db.refresh(user)

    return {"image": image_url}

async def upload_cover_image(nickname: str, file: UploadFile, db: AsyncSession, current_user_id: UUID):
    user = await user_repo.get_user_with_profile_by_username(nickname, db)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    if user.id != current_user_id:
        raise HTTPException(status_code=403, detail="Nemate dozvolu za uređivanje ovog profila")

    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    save_path = Path("uploads/cover_images") / filename
    save_path.parent.mkdir(parents=True, exist_ok=True)

    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
    image_url = f"{BASE_URL}/uploads/cover_images/{filename}"

    user.cover_image = image_url
    await db.commit()
    await db.refresh(user)

    return {"cover_image": image_url}

async def get_real_user(nickname: str, db: AsyncSession):
    return await user_repo.get_real_user(db, nickname)