from typing import TYPE_CHECKING, List
from uuid import UUID, uuid4

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .Advertisements import Advertisement

class ReqClubAthlete(Base):
    __tablename__ = "req_club_athlete"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    age_min: Mapped[int] = mapped_column(Integer, nullable=True)
    age_max: Mapped[int] = mapped_column(Integer, nullable=True)
    position: Mapped[str] = mapped_column(String, nullable=True)
    height_min_cm: Mapped[int] = mapped_column(Integer, nullable=True)
    min_experience: Mapped[str] = mapped_column(String, nullable=True)
    salary_range_km: Mapped[str] = mapped_column(String, nullable=True)
    match_bonuses: Mapped[str] = mapped_column(String, nullable=True)
    accommodation_provided: Mapped[bool] = mapped_column(Boolean, default=False)

    mandatory_attachments: Mapped[List["ReqClubAthleteAttachment"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqClubAthleteAttachment(Base):
    __tablename__ = "req_club_athlete_attachments"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_club_athlete.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqClubCoach(Base):
    __tablename__ = "req_club_coach"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    license: Mapped[str] = mapped_column(String, nullable=True)
    min_years_exp: Mapped[int] = mapped_column(Integer, nullable=True)
    team_category: Mapped[str] = mapped_column(String, nullable=True)
    salary_range_km: Mapped[str] = mapped_column(String, nullable=True)
    contract_type: Mapped[str] = mapped_column(String, nullable=True)
    relocation_package: Mapped[bool] = mapped_column(Boolean, default=False)

    required_certifications: Mapped[List["ReqClubCoachCertification"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqClubCoachCertification(Base):
    __tablename__ = "req_club_coach_certifications"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_club_coach.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqClubScout(Base):
    __tablename__ = "req_club_scout"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    scouting_exp: Mapped[str] = mapped_column(String, nullable=True)
    network_level: Mapped[str] = mapped_column(String, nullable=True)
    scouting_type: Mapped[str] = mapped_column(String, nullable=True)
    compensation: Mapped[str] = mapped_column(String, nullable=True)
    employment_type: Mapped[str] = mapped_column(String, nullable=True)

    coverage_regions: Mapped[List["ReqClubScoutRegion"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqClubScoutRegion(Base):
    __tablename__ = "req_club_scout_regions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_club_scout.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqCoachClub(Base):
    __tablename__ = "req_coach_club"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    license: Mapped[str] = mapped_column(String, nullable=True)
    years_exp: Mapped[int] = mapped_column(Integer, nullable=True)
    preferred_club_level: Mapped[str] = mapped_column(String, nullable=True)
    expected_salary_km: Mapped[str] = mapped_column(String, nullable=True)
    availability: Mapped[str] = mapped_column(String, nullable=True)
    open_to_relocation: Mapped[bool] = mapped_column(Boolean, default=False)

    career_achievements: Mapped[List["ReqCoachClubAchievement"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqCoachClubAchievement(Base):
    __tablename__ = "req_coach_club_achievements"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_coach_club.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqCoachAthlete(Base):
    __tablename__ = "req_coach_athlete"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    program_duration: Mapped[str] = mapped_column(String, nullable=True)
    max_group_size: Mapped[int] = mapped_column(Integer, nullable=True)
    target_level: Mapped[str] = mapped_column(String, nullable=True)
    training_location: Mapped[str] = mapped_column(String, nullable=True)
    price_per_player_km: Mapped[int] = mapped_column(Integer, nullable=True)
    payment_type: Mapped[str] = mapped_column(String, nullable=True)

    included_services: Mapped[List["ReqCoachAthleteService"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqCoachAthleteService(Base):
    __tablename__ = "req_coach_athlete_services"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_coach_athlete.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqCoachRecreational(Base):
    __tablename__ = "req_coach_recreational"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    program_duration: Mapped[str] = mapped_column(String, nullable=True)
    max_group_size: Mapped[int] = mapped_column(Integer, nullable=True)
    fitness_level: Mapped[str] = mapped_column(String, nullable=True)
    age_group: Mapped[str] = mapped_column(String, nullable=True)
    price_per_player_km: Mapped[int] = mapped_column(Integer, nullable=True)
    training_schedule: Mapped[str] = mapped_column(String, nullable=True)

    included_services: Mapped[List["ReqCoachRecreationalService"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqCoachRecreationalService(Base):
    __tablename__ = "req_coach_recreational_services"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_coach_recreational.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqScoutClub(Base):
    __tablename__ = "req_scout_club"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    years_exp: Mapped[int] = mapped_column(Integer, nullable=True)
    scouting_type: Mapped[str] = mapped_column(String, nullable=True)
    network_level: Mapped[str] = mapped_column(String, nullable=True)
    expected_compensation: Mapped[str] = mapped_column(String, nullable=True)
    availability: Mapped[str] = mapped_column(String, nullable=True)

    coverage_regions: Mapped[List["ReqScoutClubRegion"]] = relationship(
        cascade="all, delete-orphan"
    )
    career_achievements: Mapped[List["ReqScoutClubAchievement"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqScoutClubRegion(Base):
    __tablename__ = "req_scout_club_regions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_scout_club.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqScoutClubAchievement(Base):
    __tablename__ = "req_scout_club_achievements"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_scout_club.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqScoutAthlete(Base):
    __tablename__ = "req_scout_athlete"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    position: Mapped[str] = mapped_column(String, nullable=True)
    age_min: Mapped[int] = mapped_column(Integer, nullable=True)
    age_max: Mapped[int] = mapped_column(Integer, nullable=True)
    citizenship: Mapped[str] = mapped_column(String, nullable=True)
    league_level: Mapped[str] = mapped_column(String, nullable=True)
    availability: Mapped[str] = mapped_column(String, nullable=True)
    required_documents: Mapped[str] = mapped_column(String, nullable=True)
    agency_note: Mapped[str] = mapped_column(String, nullable=True)

    key_attributes: Mapped[List["ReqScoutAthleteAttribute"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqScoutAthleteAttribute(Base):
    __tablename__ = "req_scout_athlete_attributes"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_scout_athlete.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqAthleteClub(Base):
    __tablename__ = "req_athlete_club"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    position: Mapped[str] = mapped_column(String, nullable=True)
    age: Mapped[int] = mapped_column(Integer, nullable=True)
    height_cm: Mapped[int] = mapped_column(Integer, nullable=True)
    weight_kg: Mapped[int] = mapped_column(Integer, nullable=True)
    dominant_side: Mapped[str] = mapped_column(String, nullable=True)
    current_club: Mapped[str] = mapped_column(String, nullable=True)
    experience: Mapped[str] = mapped_column(String, nullable=True)
    availability: Mapped[str] = mapped_column(String, nullable=True)
    preferred_league: Mapped[str] = mapped_column(String, nullable=True)
    profile_link: Mapped[str] = mapped_column(String, nullable=True)

    highlights: Mapped[List["ReqAthleteClubHighlight"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqAthleteClubHighlight(Base):
    __tablename__ = "req_athlete_club_highlights"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_athlete_club.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqAthleteScout(Base):
    __tablename__ = "req_athlete_scout"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    position: Mapped[str] = mapped_column(String, nullable=True)
    age: Mapped[int] = mapped_column(Integer, nullable=True)
    height_cm: Mapped[int] = mapped_column(Integer, nullable=True)
    citizenship: Mapped[str] = mapped_column(String, nullable=True)
    experience: Mapped[str] = mapped_column(String, nullable=True)
    video_link: Mapped[str] = mapped_column(String, nullable=True)
    profile_link: Mapped[str] = mapped_column(String, nullable=True)
    career_goal: Mapped[str] = mapped_column(String, nullable=True)

    key_strengths: Mapped[List["ReqAthleteScoutStrength"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqAthleteScoutStrength(Base):
    __tablename__ = "req_athlete_scout_strengths"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_athlete_scout.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)

class ReqAthleteCoach(Base):
    __tablename__ = "req_athlete_coach"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    advertisement_id: Mapped[UUID] = mapped_column(
        ForeignKey("advertisements.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    current_level: Mapped[str] = mapped_column(String, nullable=True)
    age: Mapped[int] = mapped_column(Integer, nullable=True)
    training_city: Mapped[str] = mapped_column(String, nullable=True)
    budget_km: Mapped[int] = mapped_column(Integer, nullable=True)
    training_type: Mapped[str] = mapped_column(String, nullable=True)
    additional_info: Mapped[str] = mapped_column(String, nullable=True)

    training_goals: Mapped[List["ReqAthleteCoachGoal"]] = relationship(
        cascade="all, delete-orphan"
    )

class ReqAthleteCoachGoal(Base):
    __tablename__ = "req_athlete_coach_goals"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    parent_id: Mapped[UUID] = mapped_column(
        ForeignKey("req_athlete_coach.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String, nullable=False)
