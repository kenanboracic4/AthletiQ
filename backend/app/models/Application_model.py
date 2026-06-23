from datetime import datetime
from email.mime import application
import enum
from typing import Optional, TYPE_CHECKING, List, Dict, Any
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, UniqueConstraint, func, Enum
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from ..schemas.User_schema import UserRole
if TYPE_CHECKING:
    from .User_model import User
    from app.models.Advertisements import Advertisement

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class Application(Base):
    __tablename__ = "applications"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(ForeignKey("advertisements.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    cover_letter: Mapped[str] = mapped_column(nullable=False)
    cv_url: Mapped[str] = mapped_column(nullable=False)
    youtube_url: Mapped[Optional[str]] = mapped_column(nullable=True)

    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status_enum"),
        nullable=False,
        default=ApplicationStatus.PENDING
    )

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    advertisement: Mapped["Advertisement"] = relationship(back_populates="applications")
    user: Mapped["User"] = relationship(back_populates="applications")

    __table_args__ = (UniqueConstraint("advertisement_id", "user_id", name="unique_user_advertisement"),)