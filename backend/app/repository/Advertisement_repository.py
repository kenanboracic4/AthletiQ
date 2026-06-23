from datetime import datetime
from typing import Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, update
from sqlalchemy.orm import joinedload, selectinload

from app.models.Advertisements import Advertisement
from app.schemas.User_schema import UserRole

async def create_advertisement(db: AsyncSession, advertisement_dict: dict):
    db_advertisement = Advertisement(**advertisement_dict)
    db.add(db_advertisement)
    await db.flush()
    return db_advertisement

async def get_advertisement_by_id(db: AsyncSession, advertisement_id: UUID):
    query = (
        select(Advertisement)
        .options(joinedload(Advertisement.creator))
        .where(Advertisement.id == advertisement_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def delete_advertisement(db: AsyncSession, advertisement_id: UUID):

    query = (
        delete(Advertisement)
        .where(Advertisement.id == advertisement_id)
    )
    result = await db.execute(query)
    return result.rowcount

async def update_advertisement(db: AsyncSession, advertisement_id: UUID, advertisement_dict: dict):
    query = (
        update(Advertisement)
        .where(Advertisement.id == advertisement_id)
        .values(advertisement_dict)
    )
    result = await db.execute(query)
    return result.rowcount

async def get_advertisements_by_user(db: AsyncSession, user_role: UserRole, cursor: Optional[str] = None, limit: int = 10):
    query = (
        select(Advertisement)
        .where(Advertisement.target_roles.any(user_role))
        .options(joinedload(Advertisement.creator))
        .order_by(Advertisement.created_at.desc())
    )

    if cursor:
        cursor_time = datetime.fromisoformat(cursor)
        query = query.where(Advertisement.created_at < cursor_time)

    query = query.limit(limit + 1)
    result = await db.execute(query)
    items = result.scalars().all()

    has_more = len(items) > limit
    if has_more:
        items = items[:limit]

    next_cursor = items[-1].created_at.isoformat() if has_more else None

    return {
        "items": items,
        "has_more": has_more,
        "next_cursor": next_cursor
    }

async def get_advertisements_for_role(
    db: AsyncSession, user_role: UserRole, exclude_creator_id: Optional[UUID] = None, limit: int = 200
):
    query = (
        select(Advertisement)
        .where(Advertisement.target_roles.any(user_role))
        .options(joinedload(Advertisement.creator))
        .order_by(Advertisement.created_at.desc())
    )
    if exclude_creator_id is not None:
        query = query.where(Advertisement.creator_id != exclude_creator_id)

    query = query.limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def increse_view(db: AsyncSession, advertisement_id: UUID):
    query = (
        update(Advertisement)
        .where(Advertisement.id == advertisement_id)
        .values(view_count=Advertisement.view_count + 1)
    )
    result = await db.execute(query)
    await db.commit()
    return result.rowcount

async def increase_number_of_applications(db: AsyncSession, advertisement_id: UUID):
    query = (
        update(Advertisement)
        .where(Advertisement.id == advertisement_id)
        .values(application_count=Advertisement.application_count + 1)
    )
    result = await db.execute(query)
    await db.commit()
    return result.rowcount

async def get_user_advertisements(db: AsyncSession, user_id: UUID):
    query = (
        select(Advertisement)
        .where(Advertisement.creator_id == user_id)
        .order_by(Advertisement.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()