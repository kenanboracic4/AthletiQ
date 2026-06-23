
from datetime import datetime
from hmac import new
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import HTTPException
from sqlmodel import desc
from app.repository import Follow_repository as follow_repo
from sqlalchemy.ext.asyncio import AsyncSession

from app.repository import Notification_repository as notification_repo

async def create_notification(db: AsyncSession, notification_dict: dict):
    return await notification_repo.create_notification(db, notification_dict)

async def get_notification_by_uuid(db: AsyncSession, notification_id: UUID):
    return await notification_repo.get_notification_by_uuid(db, notification_id)

async def delete_notification(db: AsyncSession, notification_id: UUID):
    return await notification_repo.delete_notification(db, notification_id)

async def get_notifications_by_user(db: AsyncSession, user_id: UUID):
    return await notification_repo.get_notifications_by_user(db, user_id)

async def mark_notifications_as_read(db: AsyncSession, user_id: UUID):
    return await notification_repo.mark_notifications_as_read(db, user_id)

async def get_unread_count_for_notifications(db: AsyncSession, user_id: UUID):
    return await notification_repo.get_unread_count_for_notifications(db, user_id)

async def mark_one_notification_as_read(db: AsyncSession, notification_id: UUID):
    return await notification_repo.mark_one_notification_as_read(db, notification_id)