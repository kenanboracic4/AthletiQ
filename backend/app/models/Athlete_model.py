from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Date, ForeignKey, func, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .User_model import User
    from backend.app.models.Position_model import Position
    from backend.app.models.Sport_model import Sport

class Athlete(Base):
    __tablename__ = "athletes"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True
    )
    sport_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("sports.id", ondelete="SET NULL"))
    position_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("positions.id", ondelete="SET NULL"))

    full_name: Mapped[str] = mapped_column(String(255))
    birth_date: Mapped[date] = mapped_column(Date)
    location: Mapped[str] = mapped_column(String(255))
    bio: Mapped[Optional[str]] = mapped_column(String(255))
    height: Mapped[Optional[int]] = mapped_column(Integer)

    weight: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    dominant_side: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    experience_level: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    current_club: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    preferred_league: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    availability: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    citizenship: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user: Mapped["User"] = relationship(back_populates="athlete")
    sport: Mapped[Optional["Sport"]] = relationship(back_populates="athletes")
    position: Mapped[Optional["Position"]] = relationship(back_populates="athletes")
