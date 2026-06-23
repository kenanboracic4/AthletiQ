from typing import Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, or_, and_, exists
from sqlalchemy.orm import joinedload

from app.schemas.User_schema import ProfileUpdateSchema, UserRole
from ..models.User_model import User
from ..models.Athlete_model import Athlete
from ..models.Coach_model import Coach
from ..models.Scout_model import Scout
from ..models.Club_model import Club
from ..models.Follow_model import Follow
from ..models.FriendRequest_model import FriendRequest, FriendRequestStatus

def _suggestion_exclusion_filters(current_user_id):
    """Iskljuci sebe, osobe koje vec pratim i prijatelje iz preporuka."""
    not_self = User.id != current_user_id

    not_following = ~exists(
        select(1).where(
            Follow.follower_id == current_user_id,
            Follow.following_id == User.id,
        )
    )

    not_friend = ~exists(
        select(1).where(
            FriendRequest.status == FriendRequestStatus.ACCEPTED,
            or_(
                and_(FriendRequest.sender_id == current_user_id, FriendRequest.receiver_id == User.id),
                and_(FriendRequest.sender_id == User.id, FriendRequest.receiver_id == current_user_id),
            ),
        )
    )

    return [not_self, not_following, not_friend]

async def create_user(db: AsyncSession, user_dict: dict) -> User:
    db_user = User(**user_dict)
    db.add(db_user)
    return db_user

async def get_user_by_nickname(db: AsyncSession, nickname: str) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.nickname == nickname)
    )
    return result.scalar_one_or_none()

async def get_user_by_uuid(db: AsyncSession, user_id: UUID) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()

async def get_user_with_profile_by_username(nickname: str, db: AsyncSession) -> Optional[User]:
    query = (
        select(User)
        .options(
            joinedload(User.athlete).joinedload(Athlete.sport),
            joinedload(User.athlete).joinedload(Athlete.position),
            joinedload(User.coach).joinedload(Coach.sport),
            joinedload(User.coach).joinedload(Coach.certifications),
            joinedload(User.scout).joinedload(Scout.sport),
            joinedload(User.scout).joinedload(Scout.regions),
            joinedload(User.club).joinedload(Club.sport),
            joinedload(User.club).joinedload(Club.trophies),
            joinedload(User.recreational),
            joinedload(User.career_entries),
            joinedload(User.achievements),
        )
        .filter(User.nickname == nickname)
    )
    result = await db.execute(query)
    return result.scalars().first()

async def get_user_with_profile_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    query = (
        select(User)
        .options(
            joinedload(User.athlete).joinedload(Athlete.sport),
            joinedload(User.athlete).joinedload(Athlete.position),
            joinedload(User.coach).joinedload(Coach.sport),
            joinedload(User.coach).joinedload(Coach.certifications),
            joinedload(User.scout).joinedload(Scout.sport),
            joinedload(User.scout).joinedload(Scout.regions),
            joinedload(User.club).joinedload(Club.sport),
            joinedload(User.club).joinedload(Club.trophies),
            joinedload(User.recreational),
            joinedload(User.career_entries),
            joinedload(User.achievements),
        )
        .filter(User.id == user_id)
    )
    result = await db.execute(query)
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(
        select(User).where(User.email == email)
    )
    return result.scalar_one_or_none()

async def edit_user_by_username(db: AsyncSession, nickname: str, data: ProfileUpdateSchema):
    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        user = await get_user_with_profile_by_username(nickname, db)
        if not user:
            raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
        return user

    extended_keys = {
        "career_entries",
        "achievements",
        "trophies",
        "certifications",
        "scout_regions",
    }
    extended_data = {
        k: update_data.pop(k) for k in list(update_data.keys()) if k in extended_keys
    }

    user = await get_user_with_profile_by_username(nickname, db)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    update_data.pop("role", None)
    relation_name = user.role.name.lower()
    if user.role.name == "RECREATIONAL_ATHLETE":
        relation_name = "recreational"

    profile_sub_object = getattr(user, relation_name, None)

    for key, value in update_data.items():
        if hasattr(user, key) and key in ["nickname", "email", "image", "cover_image", "match_preferences"]:
            setattr(user, key, value)
        elif profile_sub_object and hasattr(profile_sub_object, key):
            setattr(profile_sub_object, key, value)

    if extended_data:
        from app.repository import Profile_extended_repository as ext_repo
        await ext_repo.sync_extended_profile(db, user, extended_data)

    await db.commit()
    await db.refresh(user)

    return await get_user_with_profile_by_username(nickname, db)

async def search_users(db: AsyncSession, search_query: str):
    query = (
        select(User)
        .where(User.nickname.ilike(f"%{search_query}%"))
    )
    result = await db.execute(query)
    return result.scalars().all()

async def get_suggested_people_random_sort(db: AsyncSession, page: int, limit: int, current_user_id=None):
    query = select(User)
    if current_user_id is not None:
        query = query.where(*_suggestion_exclusion_filters(current_user_id))
    query = (
        query
        .order_by(func.random())
        .limit(limit)
        .offset((page - 1) * limit)
    )
    result = await db.execute(query)
    return result.scalars().all()

async def get_suggested_people(db: AsyncSession, page: int, limit: int, current_user_id=None):
    query = select(User)
    if current_user_id is not None:
        query = query.where(*_suggestion_exclusion_filters(current_user_id))
    query = (
        query
        .limit(limit)
        .offset((page - 1) * limit)
    )
    result = await db.execute(query)
    return result.scalars().all()

async def get_suggested_clubs(db: AsyncSession, page: int, limit: int, current_user_id=None):
    query = (
        select(User)
        .where(User.role == UserRole.CLUB)
        .options(joinedload(User.club).joinedload(Club.sport))
    )
    if current_user_id is not None:
        query = query.where(*_suggestion_exclusion_filters(current_user_id))
    query = (
        query
        .limit(limit)
        .offset((page - 1) * limit)
    )
    result = await db.execute(query)
    return result.scalars().unique().all()

async def get_real_user(db: AsyncSession, nickname: str):
    query = (
        select(User)
        .where(User.nickname == nickname)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_admin_users(db: AsyncSession):
    query = select(User).where(
        or_(User.is_admin == True, User.role == UserRole.ADMIN)
    )
    result = await db.execute(query)
    return list(result.scalars().all())