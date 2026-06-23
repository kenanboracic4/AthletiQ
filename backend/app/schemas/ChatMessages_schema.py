from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.schemas.User_schema import UserMinRead

class ChatMessageBase(BaseModel):
    content: str

class ChatMessageCreate(ChatMessageBase):
    chat_id: UUID

class ChatMessageUpdate(BaseModel):
    content: Optional[str] = None
    is_read: Optional[bool] = None

class ChatMessageRead(ChatMessageBase):
    id: UUID
    chat_id: UUID
    sender_id: UUID
    is_read: bool
    created_at: datetime

    sender: Optional[UserMinRead] = None

    model_config = ConfigDict(from_attributes=True)