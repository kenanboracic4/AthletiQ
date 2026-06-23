from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, Boolean, DateTime, Enum, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from ..schemas.User_schema import UserRole

if TYPE_CHECKING:
    from .Athlete_model import Athlete
    from .Coach_model import Coach
    from .Recreational_model import Recreational
    from .Scout_model import Scout
    from .Club_model import Club
    from .Post import Post
    from .PostLikes import PostLikes
    from .Post_comments import Comments
    from .Advertisements import Advertisement
    from .Application_model import Application
    from .Chat import Chat
    from .ChatMessage import ChatMessage
    from .Notification_model import Notification
    from .Profile_extended_model import ProfileCareerEntry, ProfileAchievement

class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    nickname: Mapped[str] = mapped_column(String(255))
    password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole))
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    image: Mapped[Optional[str]] = mapped_column(String(255))
    cover_image: Mapped[Optional[str]] = mapped_column(String(255))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)

    match_preferences: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    athlete: Mapped[Optional["Athlete"]] = relationship(back_populates="user")
    coach: Mapped[Optional["Coach"]] = relationship(back_populates="user")
    scout: Mapped[Optional["Scout"]] = relationship(back_populates="user")
    club: Mapped[Optional["Club"]] = relationship(back_populates="user")
    recreational: Mapped[Optional["Recreational"]] = relationship(back_populates="user")
    posts: Mapped[List["Post"]] = relationship(back_populates="user")
    post_likes: Mapped[List["PostLikes"]] = relationship(back_populates="user")
    comments: Mapped[List["Comments"]] = relationship(back_populates="user")
    advertisements: Mapped[List["Advertisement"]] = relationship(back_populates="creator")
    applications: Mapped[List["Application"]] = relationship(back_populates="user")

    chats_as_first: Mapped[List["Chat"]] = relationship(
        "Chat",
        foreign_keys="Chat.first_user_id",
        back_populates="first_user"
    )
    chats_as_second: Mapped[List["Chat"]] = relationship(
        "Chat",
        foreign_keys="Chat.second_user_id",
        back_populates="second_user"
    )

    sent_messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="sender"
    )

    notifications_received: Mapped[List["Notification"]] = relationship(
        "Notification",
        foreign_keys="Notification.recipient_id",
        back_populates="recipient",
        cascade="all, delete-orphan"
    )

    notifications_sent: Mapped[List["Notification"]] = relationship(
        "Notification",
        foreign_keys="Notification.sender_id",
        back_populates="sender",
        cascade="all, delete-orphan"
    )

    career_entries: Mapped[List["ProfileCareerEntry"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="ProfileCareerEntry.start_date.desc()",
    )
    achievements: Mapped[List["ProfileAchievement"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="ProfileAchievement.year.desc()",
    )