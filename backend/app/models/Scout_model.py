from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Date, ForeignKey, func, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .User_model import User
    from .Sport_model import Sport
    from .Profile_extended_model import ScoutRegion

class Scout(Base):
    __tablename__ = "scouts"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True
    )
    full_name: Mapped[str] = mapped_column(String(255))
    organization: Mapped[str] = mapped_column(String(255))
    sought_position: Mapped[str] = mapped_column(String(255))
    contact_number: Mapped[str] = mapped_column(String(255))
    sport_id : Mapped[UUID] = mapped_column(ForeignKey("sports.id", ondelete="CASCADE"), default=None, nullable=True)

    years_exp: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    scouting_type: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    network_level: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    availability: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user: Mapped["User"] = relationship(back_populates="scout")
    sport: Mapped["Sport"] = relationship(back_populates="scouts")
    regions: Mapped[list["ScoutRegion"]] = relationship(
        back_populates="scout",
        cascade="all, delete-orphan",
    )