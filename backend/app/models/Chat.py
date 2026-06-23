from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .Advertisements import Advertisement
    from .User_model import User
    from .ChatMessage import ChatMessage

class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    first_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    second_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))

    advertisment_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("advertisements.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    first_user: Mapped["User"] = relationship("User", foreign_keys=[first_user_id], lazy="joined")
    second_user: Mapped["User"] = relationship("User", foreign_keys=[second_user_id], lazy="joined")

    advertisment: Mapped[Optional["Advertisement"]] = relationship("Advertisement", back_populates="chats", lazy="joined")

    messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="chat", cascade="all, delete-orphan"
    )

    __table_args__ = (
       UniqueConstraint("first_user_id", "second_user_id", "advertisment_id", name="uq_chat_users_advertiment"),
    )