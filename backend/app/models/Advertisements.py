from datetime import datetime
from email.mime import application
import enum
from typing import Optional, TYPE_CHECKING, List
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, func, Enum, Float, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from ..schemas.User_schema import UserRole
if TYPE_CHECKING:
    from .User_model import User
    from app.models.Application_model import Application
    from .Chat import Chat

class Advertisement(Base):
    __tablename__ = "advertisements"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    creator_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    target_roles: Mapped[List[UserRole]] = mapped_column(
        ARRAY(Enum(UserRole, name="targetrole_enum", native_enum=False)),
        nullable=False,
        default=list
    )

    title: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    sport: Mapped[str] = mapped_column(nullable=False)
    location: Mapped[str] = mapped_column(nullable=False)

    requirement_type: Mapped[Optional[str]] = mapped_column(nullable=True)

    view_count: Mapped[int] = mapped_column(default=0)
    application_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    embedding: Mapped[Optional[List[float]]] = mapped_column(ARRAY(Float), nullable=True)
    embedding_model: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    applications: Mapped[List["Application"]] = relationship(back_populates="advertisement")

    creator: Mapped["User"] = relationship(back_populates="advertisements")
    chats: Mapped[List["Chat"]] = relationship(back_populates="advertisment")