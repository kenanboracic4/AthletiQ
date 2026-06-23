from datetime import date, datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Date, ForeignKey, Text, Integer, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .User_model import User
    from .Club_model import Club
    from .Coach_model import Coach
    from .Scout_model import Scout

class ProfileCareerEntry(Base):
    __tablename__ = "profile_career_entries"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    organization: Mapped[str] = mapped_column(String(255))
    role_title: Mapped[str] = mapped_column(String(255))
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user: Mapped["User"] = relationship(back_populates="career_entries")

class ProfileAchievement(Base):
    __tablename__ = "profile_achievements"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(255))
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    user: Mapped["User"] = relationship(back_populates="achievements")

class ClubTrophy(Base):
    __tablename__ = "club_trophies"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    club_id: Mapped[UUID] = mapped_column(
        ForeignKey("clubs.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(255))
    competition: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    club: Mapped["Club"] = relationship(back_populates="trophies")

class CoachCertification(Base):
    __tablename__ = "coach_certifications"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    coach_id: Mapped[UUID] = mapped_column(
        ForeignKey("coaches.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(255))
    issuer: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    coach: Mapped["Coach"] = relationship(back_populates="certifications")

class ScoutRegion(Base):
    __tablename__ = "scout_regions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    scout_id: Mapped[UUID] = mapped_column(
        ForeignKey("scouts.id", ondelete="CASCADE"), index=True
    )
    region_name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    scout: Mapped["Scout"] = relationship(back_populates="regions")
