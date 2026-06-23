import enum
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .User_model import User
    from .Post import Post

class NotificationType(str, enum.Enum):
    FOLLOW = "follow"
    LIKE = "like"
    COMMENT = "comment"
    REPORT = "report"
    FRIEND_REQUEST = "friend_request"
    FRIEND_ACCEPT = "friend_accept"

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    recipient_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sender_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    notification_type: Mapped[NotificationType] = mapped_column(Enum(NotificationType, native_enum=False), nullable=False)
    post_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)
    is_read: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    recipient: Mapped["User"] = relationship("User", foreign_keys=[recipient_id], lazy="joined")
    sender: Mapped["User"] = relationship("User", foreign_keys=[sender_id], lazy="joined")
    post: Mapped[Optional["Post"]] = relationship("Post", lazy="joined")