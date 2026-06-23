from datetime import datetime
from typing import Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import joinedload, selectinload

from app.models.User_model import User
from app.models import Post

from ..models.Follow_model import Follow

async def create_follow(db: AsyncSession, follow_dict: dict):
    db_follow = Follow(**follow_dict)
    db.add(db_follow)

    await db.flush()
    return db_follow

async def get_follow(db: AsyncSession, follower_id: UUID, following_id: UUID):
    query = (
        select(Follow)
        .where(Follow.follower_id == follower_id)
        .where(Follow.following_id == following_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def delete_follow(db: AsyncSession, follower_id: UUID, following_id: UUID):
    query = (
        delete(Follow)
        .where(Follow.follower_id == follower_id)
        .where(Follow.following_id == following_id)
    )
    result = await db.execute(query)
    return result.rowcount

async def get_followers_count(db: AsyncSession, following_id: UUID):
    query = (
        select(func.count(Follow.follower_id))
        .where(Follow.following_id == following_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_following_count(db: AsyncSession, follower_id: UUID):
    query = (
        select(func.count(Follow.following_id))
        .where(Follow.follower_id == follower_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_following_list(db: AsyncSession, user_id: UUID, limit: int = 10, cursor: Optional[datetime] = None):
    query = (
        select(User, Follow.created_at.label("follow_date"))
        .join(Follow, User.id == Follow.following_id)
        .where(Follow.follower_id == user_id)
    )

    if cursor:

        cursor_naive = cursor.replace(tzinfo=None) if cursor.tzinfo else cursor
        query = query.where(Follow.created_at < cursor_naive)

    query = query.order_by(Follow.created_at.desc()).limit(limit)

    result = await db.execute(query)
    rows = result.all()

    users = []
    for user, follow_date in rows:
        user_dict = {
            "id": str(user.id),
            "email": user.email,
            "nickname": user.nickname,
            "role": user.role,
            "image": user.image,
            "is_verified": user.is_verified,
            "is_admin": user.is_admin,

            "created_at": follow_date.isoformat() if follow_date else None
        }
        users.append(user_dict)

    return users

async def get_followers_list(db: AsyncSession, user_id: UUID, limit: int = 10, cursor: Optional[datetime] = None):
    query = (
        select(User, Follow.created_at.label("follow_date"))
        .join(Follow, User.id == Follow.follower_id)
        .where(Follow.following_id == user_id)
    )

    if cursor:

        cursor_naive = cursor.replace(tzinfo=None) if cursor.tzinfo else cursor
        query = query.where(Follow.created_at < cursor_naive)

    query = query.order_by(Follow.created_at.desc()).limit(limit)

    result = await db.execute(query)
    rows = result.all()

    users = []
    for user, follow_date in rows:
        user_dict = {
            "id": str(user.id),
            "email": user.email,
            "nickname": user.nickname,
            "role": user.role,
            "image": user.image,
            "is_verified": user.is_verified,
            "is_admin": user.is_admin,

            "created_at": follow_date.isoformat() if follow_date else None
        }
        users.append(user_dict)

    return users

async def search_following_users(db: AsyncSession, search_query: str, user_id: UUID):
    query = (
        select(User)
        .join(Follow, User.id == Follow.following_id)
        .where(User.nickname.ilike(f"%{search_query}%"))
        .where(Follow.follower_id == user_id)
    )
    result = await db.execute(query)
    return result.scalars().all()

async def search_followers(db: AsyncSession, search_query: str, user_id: UUID):
    query = (
        select(User)
        .join(Follow, User.id == Follow.follower_id)
        .where(User.nickname.ilike(f"%{search_query}%"))
        .where(Follow.following_id == user_id)
    )
    result = await db.execute(query)
    return result.scalars().all()