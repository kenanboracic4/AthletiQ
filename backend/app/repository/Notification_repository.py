from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, func, select, update
from sqlalchemy.orm import joinedload, selectinload
from ..models.Notification_model import Notification

async def create_notification(db: AsyncSession, notification_dict: dict):
    db_notification = Notification(**notification_dict)
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification

async def get_notification_by_uuid(db: AsyncSession, notification_id: UUID):
    query = (
        select(Notification)
        .where(Notification.id == notification_id)

    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def delete_notification(db: AsyncSession, notification_id: UUID):
    query = delete(Notification).where(Notification.id == notification_id)
    result = await db.execute(query)
    await db.commit()
    return int(result.rowcount)

async def get_notifications_by_user(db: AsyncSession, user_id: UUID):
    query = (
        select(Notification)
        .where(Notification.recipient_id == user_id)
        .options(
            selectinload(Notification.recipient),
            selectinload(Notification.sender),
            selectinload(Notification.post),
        )
    )
    result = await db.execute(query)
    return result.scalars().all()

async def mark_notifications_as_read(db: AsyncSession, user_id: UUID):

    query = (
        update(Notification)
        .where(
            Notification.recipient_id == user_id,
            Notification.is_read == False,
        )
        .values(is_read=True)
    )
    result = await db.execute(query)
    await db.commit()
    return int(result.rowcount)

async def get_unread_count_for_notifications(db: AsyncSession, user_id: UUID) -> int:
    query = (
        select(func.count(Notification.id))
        .where(
            and_(
                Notification.recipient_id == user_id,
                Notification.is_read == False
            )
        )
    )
    result = await db.execute(query)
    return result.scalar() or 0

async def mark_one_notification_as_read(db: AsyncSession, notification_id: UUID):
    query = (
        update(Notification)
        .where(Notification.id == notification_id)
        .values(is_read=True)
    )
    result = await db.execute(query)
    await db.commit()
    return int(result.rowcount)