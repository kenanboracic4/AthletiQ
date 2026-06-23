from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, ForeignKey, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .User_model import User
    from backend.app.models.Sport_model import Sport
    from .Profile_extended_model import ClubTrophy

class Club(Base):
    __tablename__ = "clubs"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True
    )
    club_name: Mapped[str] = mapped_column(String(255))
    sport_id : Mapped[UUID] = mapped_column(ForeignKey("sports.id", ondelete="CASCADE"))
    location: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(255))
    league: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    founded_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    home_venue: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user: Mapped["User"] = relationship(back_populates="club")
    sport: Mapped["Sport"] = relationship(back_populates="clubs")
    trophies: Mapped[list["ClubTrophy"]] = relationship(
        back_populates="club",
        cascade="all, delete-orphan",
        order_by="ClubTrophy.year.desc()",
    )