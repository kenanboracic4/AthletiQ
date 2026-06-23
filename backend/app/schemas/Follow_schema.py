from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class FollowBase(BaseModel):
    following_id: UUID

class FollowCreate(BaseModel):
    nickname: str

class FollowUpdate(BaseModel):
    follower_id: Optional[UUID] = None
    following_id: Optional[UUID] = None

class FollowRead(FollowBase):
    follower_id: UUID
    created_at: datetime

class FollowTogleReponse(BaseModel):
    status: str
    detail: str