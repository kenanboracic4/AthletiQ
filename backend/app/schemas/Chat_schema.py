from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.User_schema import UserMinRead
from app.schemas.Advertisment_schema import AdvertisementMinRead

class ChatBase(BaseModel):
    first_user_id: UUID
    second_user_id: UUID

class ChatCreate(ChatBase):
    advertisment_id: Optional[UUID] = None

class ChatUpdate(BaseModel):
    first_user_id: Optional[UUID] = None
    second_user_id: Optional[UUID] = None
    advertisment_id: Optional[UUID] = None

class ChatRead(ChatBase):
    id: UUID
    advertisment_id: Optional[UUID] = None
    created_at: datetime

    first_user: Optional[UserMinRead] = None
    second_user: Optional[UserMinRead] = None
    advertisment: Optional[AdvertisementMinRead] = None
    unread_count: int = 0

    model_config = ConfigDict(from_attributes=True)