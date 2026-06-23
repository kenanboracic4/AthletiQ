from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select
from sqlalchemy.orm import joinedload, selectinload

from ..models.Post import Post
from ..models.PostLikes import PostLikes

async def create_like(db: AsyncSession, like_dict: dict):
    db_like = PostLikes(**like_dict)
    db.add(db_like)
    await db.commit()
    await db.refresh(db_like)
    return db_like

async def delete_like(db: AsyncSession, user_id: UUID, post_id: UUID):
    query = delete(PostLikes).where(PostLikes.user_id == user_id).where(PostLikes.post_id == post_id)
    result = await db.execute(query)
    await db.commit()
    return int(result.rowcount)

async def get_like(db: AsyncSession, post_id: UUID, user_id: UUID):
    query = (
        select(PostLikes)
        .where(PostLikes.post_id == post_id)
        .where(PostLikes.user_id == user_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()