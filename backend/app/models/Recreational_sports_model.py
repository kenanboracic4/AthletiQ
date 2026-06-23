from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Date, ForeignKey, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .Recreational_model import Recreational
    from .Sport_model import Sport

class Recreational_sports(Base):
    __tablename__ = "recreational_sports"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    profile_id: Mapped[UUID] = mapped_column(ForeignKey("recreationals.id", ondelete="CASCADE"))
    sport_id: Mapped[UUID] = mapped_column(ForeignKey("sports.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    recreational: Mapped["Recreational"] = relationship()
    sport: Mapped["Sport"] = relationship()