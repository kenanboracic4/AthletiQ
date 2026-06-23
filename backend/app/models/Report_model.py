from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .User_model import User
    from .Post import Post
    from .Advertisements import Advertisement

class ReportTargetType(PyEnum):
    POST = "post"
    ADVERTISEMENT = "advertisement"

class ReportStatus(PyEnum):
    PENDING = "pending"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    reporter_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    target_type: Mapped[ReportTargetType] = mapped_column(Enum(ReportTargetType, native_enum=False))
    post_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    advertisement_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("advertisements.id", ondelete="CASCADE"), nullable=True)
    reason: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    status: Mapped[ReportStatus] = mapped_column(Enum(ReportStatus, native_enum=False), default=ReportStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    reporter: Mapped["User"] = relationship(foreign_keys=[reporter_id])
    post: Mapped[Optional["Post"]] = relationship(foreign_keys=[post_id])
    advertisement: Mapped[Optional["Advertisement"]] = relationship(foreign_keys=[advertisement_id])
