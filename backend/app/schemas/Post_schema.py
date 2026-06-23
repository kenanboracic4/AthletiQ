from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.models.Post import PostVisibility
from app.schemas.Likes_schema import LikesRead
from app.schemas.User_schema import UserMinRead
from app.schemas.Post_Images_schema import PostImageRead, PostImageCreate
from app.schemas.Comments_schema import CommentsRead

class PostBase(BaseModel):
    content: str
    visibility: PostVisibility = PostVisibility.PUBLIC

class PostCreate(BaseModel):
    content: Optional[str] = None
    images: Optional[List[PostImageCreate]] = None
    visibility: PostVisibility = PostVisibility.PUBLIC

class PostUpdate(BaseModel):
    content: Optional[str] = None

class PostRead(PostBase):
    id: UUID
    likes_count: int
    created_at: datetime
    algorithmic_score: Optional[float] = None

    user: Optional[UserMinRead] = None
    likes: Optional[List[LikesRead]] = None
    images: Optional[List[PostImageRead]] = None
    comments: Optional[List[CommentsRead]] = None

    model_config = ConfigDict(from_attributes=True)

class PaginationPostsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: List[PostRead]
    has_more: bool
    next_cursor: Optional[str]

