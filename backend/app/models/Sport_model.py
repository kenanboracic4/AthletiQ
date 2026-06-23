from datetime import date, datetime
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Date, ForeignKey, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from backend.app.models.Athlete_model import Athlete
    from backend.app.models.Club_model import Club
    from backend.app.models.Coach_model import Coach
    from backend.app.models.Position_model import Position
    from backend.app.models.Scout_model import Scout
class Sport(Base):
    __tablename__ = "sports"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    athletes: Mapped[List["Athlete"]] = relationship(back_populates="sport")
    coaches: Mapped[List["Coach"]] = relationship(back_populates="sport")
    clubs: Mapped[List["Club"]] = relationship(back_populates="sport")
    positions: Mapped[List["Position"]] = relationship(back_populates="sport")
    scouts: Mapped[List["Scout"]] = relationship(back_populates="sport")

