from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.models.FriendRequest_model import FriendRequestStatus
from app.schemas.User_schema import UserMinRead

class FriendRequestCreate(BaseModel):
    nickname: str

class FriendRequestRead(BaseModel):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    status: FriendRequestStatus
    created_at: datetime

    sender: Optional[UserMinRead] = None
    receiver: Optional[UserMinRead] = None

    model_config = ConfigDict(from_attributes=True)

class FriendRequestActionResponse(BaseModel):
    status: str
    detail: str
