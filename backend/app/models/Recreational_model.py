from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Date, ForeignKey, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .User_model import User

class Recreational(Base):
    __tablename__ = "recreationals"

    id : Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id : Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True
    )
    full_name : Mapped[str] = mapped_column(String(255))
    location: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(255))

    fitness_level: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    age_group: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    goals: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sport: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user: Mapped["User"] = relationship(back_populates="recreational")