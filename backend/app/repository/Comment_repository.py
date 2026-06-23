from typing import Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, update
from sqlalchemy.orm import joinedload, selectinload

from ..models.Post import Post
from ..models.Post_comments import Comments

async def create_comment(db: AsyncSession, comment_dict: dict):
    db_comment = Comments(**comment_dict)
    db.add(db_comment)

    await db.execute(
        update(Post)
        .where(Post.id == comment_dict["post_id"])
        .values(comments_count=Post.comments_count + 1)
    )

    await db.commit()
    await db.refresh(db_comment)
    return db_comment

async def get_comment_by_id(db: AsyncSession, comment_id: UUID):
    query = (
        select(Comments)
        .where(Comments.id == comment_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def delete_comment(db: AsyncSession, comment_id: UUID, user_id: UUID):

    db_comment = await get_comment_by_id(db, comment_id)
    if not db_comment:
        return 0

    if db_comment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Niste autor komentara")

    await db.execute(
        update(Post)
        .where(Post.id == db_comment.post_id)
        .values(comments_count=Post.comments_count - 1)
    )
    await db.delete(db_comment)
    await db.commit()

    return 1

async def get_comments_by_post_id(db: AsyncSession, post_id: UUID):
    query = (
        select(Comments)
        .where(Comments.post_id == post_id)
        .where(Comments.parent_comment_id.is_(None))
        .options(joinedload(Comments.user))
    )
    comments = await db.execute(query)
    return comments.scalars().all()

async def create_comment_reply(db: AsyncSession, comment_dict: dict):

    await db.execute(
        update(Comments)
        .where(Comments.id == comment_dict["parent_comment_id"])
        .values(reply_count=Comments.reply_count + 1)
    )

    db_comment = Comments(**comment_dict)
    db.add(db_comment)

    await db.commit()
    await db.refresh(db_comment)

    return db_comment

async def get_comment_replies(db: AsyncSession, comment_id: UUID):
    query = (
        select(Comments)
        .where(Comments.parent_comment_id == comment_id)
        .options(
            joinedload(Comments.user)
        )
        .order_by(Comments.created_at.asc())
    )
    result = await db.execute(query)
    return result.scalars().all()

async def delete_comment_reply(db: AsyncSession, comment_id: UUID, user_id: UUID):
    comment = await get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Komentar ne postoji!")

    if comment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Niste autor komentara")

    await db.execute(
        update(Comments)
        .where(Comments.id == comment.parent_comment_id)
        .values(reply_count=Comments.reply_count - 1)
    )
    await db.delete(comment)
    await db.commit()
    return 1