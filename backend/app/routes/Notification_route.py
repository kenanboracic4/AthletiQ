from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.dependecy import get_current_user_id
from app.schemas.Notification_schema import NotificationRead, NotificationCreate
from app.service import Notification_service

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)

@router.post("/create", status_code=status.HTTP_201_CREATED, response_model=NotificationRead)
async def create_notification(
    data: NotificationCreate,
    db: AsyncSession = Depends(get_db),

):
    return await Notification_service.create_notification(db, data.dict())

@router.get("/", status_code=status.HTTP_200_OK, response_model=List[NotificationRead])
async def get_my_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id)
):
    return await Notification_service.get_notifications_by_user(db, current_user)

@router.get("/unread-count", status_code=status.HTTP_200_OK)
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id)
):
    count = await Notification_service.get_unread_count_for_notifications(db, current_user)
    return {"unread_count": count}

@router.patch("/mark-all-read", status_code=status.HTTP_200_OK)
async def mark_all_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id)
):
    updated = await Notification_service.mark_notifications_as_read(db, current_user)
    return {"updated": updated}

@router.patch("/{notification_id}/mark-read", status_code=status.HTTP_200_OK)
async def mark_one_as_read(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id)
):
    notification = await Notification_service.get_notification_by_uuid(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notifikacija nije pronađena")
    if notification.recipient_id != current_user:
        raise HTTPException(status_code=403, detail="Nemate pristup ovoj notifikaciji")

    await Notification_service.mark_one_notification_as_read(db, notification_id)
    return {"message": "Notifikacija označena kao pročitana"}

@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
async def delete_notification(
    notification_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id)
):
    notification = await Notification_service.get_notification_by_uuid(db, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notifikacija nije pronađena")
    if notification.recipient_id != current_user:
        raise HTTPException(status_code=403, detail="Nemate pristup ovoj notifikaciji")

    await Notification_service.delete_notification(db, notification_id)
    return {"message": "Notifikacija obrisana"}