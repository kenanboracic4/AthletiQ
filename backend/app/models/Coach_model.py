from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Date, ForeignKey, func, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .User_model import User
    from backend.app.models.Sport_model import Sport
    from .Profile_extended_model import CoachCertification

class Coach(Base):
    __tablename__ = "coaches"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True
    )

    full_name : Mapped[str] = mapped_column(String(255))
    sport_id: Mapped[UUID] = mapped_column(ForeignKey("sports.id", ondelete="CASCADE"))
    philosophy: Mapped[str] = mapped_column(String(255))
    experience: Mapped[str] = mapped_column(String(255))
    contact_number: Mapped[str] = mapped_column(String(255))

    license: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    years_exp: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    team_category: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    preferred_club_level: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    availability: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    open_to_relocation: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user: Mapped["User"] = relationship(back_populates="coach")
    sport: Mapped["Sport"] = relationship(back_populates="coaches")
    certifications: Mapped[list["CoachCertification"]] = relationship(
        back_populates="coach",
        cascade="all, delete-orphan",
        order_by="CoachCertification.year.desc()",
    )
