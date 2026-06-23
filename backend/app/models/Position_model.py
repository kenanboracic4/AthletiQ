from datetime import date, datetime
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Date, ForeignKey, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

from app.models.Sport_model import Sport

if TYPE_CHECKING:
    from app.models.Athlete_model import Athlete

class Position(Base):
    __tablename__ = "positions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    sport_id: Mapped[UUID] = mapped_column(ForeignKey("sports.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    sport: Mapped["Sport"] = relationship(back_populates="positions")
    athletes: Mapped[List["Athlete"]] = relationship(back_populates="position")

