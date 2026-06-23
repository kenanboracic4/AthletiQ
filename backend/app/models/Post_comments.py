from datetime import date, datetime
from email.mime import base, image
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Date, ForeignKey, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
if TYPE_CHECKING:
    from .Post import Post
    from .User_model import User

class Comments(Base):
    __tablename__ = "comments"

    id: Mapped[UUID] = mapped_column(default=uuid4, primary_key=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    post_id: Mapped[UUID] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"))
    content: Mapped[str] = mapped_column(String)
    reply_count: Mapped[int] = mapped_column(Integer, default=0)
    parent_comment_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    parent_comment: Mapped[Optional["Comments"]] = relationship(
        remote_side=[id],
        back_populates="replies"
    )

    replies: Mapped[list["Comments"]] = relationship(
        back_populates="parent_comment"
    )

    user: Mapped["User"] = relationship(back_populates="comments")
    post: Mapped["Post"] = relationship(back_populates="comments")
  