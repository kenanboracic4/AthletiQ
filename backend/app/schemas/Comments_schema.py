from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.schemas.User_schema import UserMinRead

class CommentsBase(BaseModel):
    content: str

class CommentsCreate(CommentsBase):
    pass

class CommentsUpdate(BaseModel):
    pass

class CommentsRead(CommentsBase):
    id: UUID
    post_id: UUID
    created_at: datetime
    user: Optional[UserMinRead] = None
    reply_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class CommentsReadReply(CommentsRead):

    parent_comment_id: Optional[UUID] = None
    replies: list["CommentsReadReply"] = []

CommentsReadReply.model_rebuild()