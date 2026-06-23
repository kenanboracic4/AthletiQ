import enum
from datetime import datetime
from typing import List, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, ForeignKey, func, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.User_model import User

class PostVisibility(str, enum.Enum):
    PUBLIC = "public"
    FRIENDS = "friends"
    PRIVATE = "private"

if TYPE_CHECKING:
    from .PostLikes import PostLikes
    from .Post_images import Post_image
    from .Post_comments import Comments
    from .Notification_model import Notification

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    content: Mapped[str] = mapped_column(String(255))
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    comments_count: Mapped[int] = mapped_column(Integer, default=0)
    visibility: Mapped[PostVisibility] = mapped_column(
        Enum(
            PostVisibility,
            name="post_visibility_enum",
            native_enum=False,
            values_callable=lambda enum: [member.value for member in enum],
        ),
        default=PostVisibility.PUBLIC,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user: Mapped["User"] = relationship(back_populates="posts")
    likes: Mapped[List["PostLikes"]] = relationship(back_populates="post")
    images: Mapped[List["Post_image"]] = relationship(back_populates="post")
    comments: Mapped[List["Comments"]] = relationship(back_populates="post")
    notifications: Mapped[List["Notification"]] = relationship(back_populates="post")
    