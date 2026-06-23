from typing import Optional
from uuid import UUID

from sqlalchemy import func, select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.User_model import User
from app.models.Post import Post
from app.models.Advertisements import Advertisement
from app.models.Application_model import Application
from app.models.Follow_model import Follow
from app.models.Report_model import Report

async def get_system_stats(db: AsyncSession):
    total_users = await db.scalar(select(func.count()).select_from(User)) or 0
    total_posts = await db.scalar(select(func.count()).select_from(Post)) or 0
    total_advertisements = await db.scalar(select(func.count()).select_from(Advertisement)) or 0
    total_applications = await db.scalar(select(func.count()).select_from(Application)) or 0

    role_query = select(User.role, func.count()).group_by(User.role)
    role_result = await db.execute(role_query)
    users_by_role = {str(role.value): count for role, count in role_result.all()}

    return {
        "total_users": total_users,
        "total_posts": total_posts,
        "total_advertisements": total_advertisements,
        "total_applications": total_applications,
        "users_by_role": users_by_role,
    }

async def get_all_users(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
):
    count_query = select(func.count()).select_from(User)
    query = select(User).order_by(User.created_at.desc())

    if search:
        search_term = f"%{search}%"
        filter_clause = (User.nickname.ilike(search_term)) | (User.email.ilike(search_term))
        query = query.where(filter_clause)
        count_query = count_query.where(filter_clause)

    total = await db.scalar(count_query) or 0

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    items = list(result.scalars().all())

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "has_more": offset + limit < total,
    }

async def admin_delete_user(db: AsyncSession, user_id: UUID):
    await db.execute(delete(Report).where(Report.reporter_id == user_id))
    await db.execute(delete(Follow).where(
        (Follow.follower_id == user_id) | (Follow.following_id == user_id)
    ))
    await db.execute(delete(Post).where(Post.user_id == user_id))
    query = delete(User).where(User.id == user_id)
    result = await db.execute(query)
    return result.rowcount

async def admin_update_user(db: AsyncSession, user_id: UUID, update_data: dict):
    query = (
        update(User)
        .where(User.id == user_id)
        .values(update_data)
    )
    result = await db.execute(query)
    return result.rowcount

async def get_all_posts_admin(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
):
    query = (
        select(Post)
        .options(
            joinedload(Post.user),
        )
        .order_by(Post.created_at.desc())
    )

    if search:
        query = query.where(Post.content.ilike(f"%{search}%"))

    count_query = select(func.count()).select_from(Post)
    if search:
        count_query = count_query.where(Post.content.ilike(f"%{search}%"))
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    items = list(result.scalars().unique().all())

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "has_more": offset + limit < total,
    }

async def admin_delete_post(db: AsyncSession, post_id: UUID):
    query = delete(Post).where(Post.id == post_id)
    result = await db.execute(query)
    return result.rowcount

async def get_all_advertisements_admin(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
):
    query = (
        select(Advertisement)
        .options(joinedload(Advertisement.creator))
        .order_by(Advertisement.created_at.desc())
    )

    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Advertisement.title.ilike(search_term)) | (Advertisement.description.ilike(search_term))
        )

    count_query = select(func.count()).select_from(Advertisement)
    if search:
        search_term = f"%{search}%"
        count_query = count_query.where(
            (Advertisement.title.ilike(search_term)) | (Advertisement.description.ilike(search_term))
        )
    total = await db.scalar(count_query) or 0

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    items = list(result.scalars().unique().all())

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "has_more": offset + limit < total,
    }

async def admin_delete_advertisement(db: AsyncSession, advertisement_id: UUID):
    query = delete(Advertisement).where(Advertisement.id == advertisement_id)
    result = await db.execute(query)
    return result.rowcount
