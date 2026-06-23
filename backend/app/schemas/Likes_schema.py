from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.schemas.User_schema import UserMinRead

class LikesBase(BaseModel):
    user_id: UUID
    post_id: UUID

class LikesCreate(LikesBase):
    pass

class LikesUpdate(BaseModel):
    pass

class LikesRead(LikesBase):
    created_at: datetime
    user: Optional[UserMinRead] = None

    model_config = ConfigDict(from_attributes=True)