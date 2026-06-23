from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.schemas.User_schema import UserMinRead
from ..models.Notification_model import NotificationType

class NotificationBase(BaseModel):
    id: UUID
    recipient_id: UUID
    sender_id: Optional[UUID] = None
    notification_type: NotificationType
    post_id: Optional[UUID] = None
    is_read: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationCreate(BaseModel):
    recipient_id: UUID
    sender_id: Optional[UUID] = None
    notification_type: NotificationType
    post_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)
class NotificationUpdate(NotificationBase):
    pass

class NotificationRead(NotificationBase):
    id: UUID
    recipient_id: UUID
    sender_id: Optional[UUID] = None
    notification_type: NotificationType
    post_id: Optional[UUID] = None
    is_read: bool = False
    created_at: datetime

    recipient: Optional[UserMinRead] = None
    sender: Optional[UserMinRead] = None

    model_config = ConfigDict(from_attributes=True)