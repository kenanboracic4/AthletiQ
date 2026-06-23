from datetime import date, datetime
from enum import Enum as PyEnum
from typing import Annotated, Literal, Optional, Union, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.Profile_extended_schema import (
    CareerEntryRead,
    CareerEntryWrite,
    AchievementRead,
    AchievementWrite,
    TrophyRead,
    TrophyWrite,
    CertificationRead,
    CertificationWrite,
    ScoutRegionRead,
    ScoutRegionWrite,
)

class UserRole(PyEnum):
    ATHLETE = "Sportista"
    RECREATIONAL_ATHLETE = "Rekreativni sportista"
    SCOUT = "Skaut"
    CLUB = "Klub"
    COACH = "Trener"
    ADMIN = "Administrator"

def parse_user_role(value) -> UserRole:
    if isinstance(value, UserRole):
        return value
    if isinstance(value, str):
        if value in UserRole.__members__:
            return UserRole[value]
        return UserRole(value)
    raise ValueError(f"Nepoznata uloga: {value}")

class UserBase(BaseModel):
    nickname: str
    email: EmailStr
    is_verified: bool = False
    image: Optional[str] = None
    cover_image: Optional[str] = None

class UserWithPassword(UserBase):
    password: str

class AthleteRegistration(UserWithPassword):
    role: Literal["ATHLETE"] = "ATHLETE"
    full_name: str
    birth_date: date
    location: str
    bio: Optional[str] = None
    height: Optional[int] = None
    sport_id: UUID
    position_id: Optional[UUID] = None

class CoachRegistration(UserWithPassword):
    role: Literal["COACH"] = "COACH"
    full_name: str
    sport_id: UUID
    philosophy: str
    experience: str
    contact_number: str

class ClubRegistration(UserWithPassword):
    role: Literal["CLUB"] = "CLUB"
    club_name: str
    sport_id: UUID
    location: str
    description: str

class ScoutRegistration(UserWithPassword):
    role: Literal["SCOUT"] = "SCOUT"
    full_name: str
    organization: str
    sought_position: str
    contact_number: str
    sport_id: Optional[UUID] = None

class RecreationalRegistration(UserWithPassword):
    role: Literal["RECREATIONAL_ATHLETE"] = "RECREATIONAL_ATHLETE"
    full_name: str
    location: str
    description: str

class AdminRegistration(UserWithPassword):
    role: Literal["ADMIN"] = "ADMIN"

RegisterSchema = Annotated[
    Union[
        AthleteRegistration,
        CoachRegistration,
        ClubRegistration,
        ScoutRegistration,
        RecreationalRegistration,
        AdminRegistration,
    ],
    Field(discriminator="role"),
]

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    is_verified: Optional[bool] = None
    password: Optional[str] = None
    image: Optional[str] = None
    cover_image: Optional[str] = None

class PrivacyUpdate(BaseModel):
    is_private: bool

class LoginSchema(BaseModel):
    nickname: str
    password: str

class PositionMinRead(BaseModel):
    id: UUID
    name: str
    model_config = ConfigDict(from_attributes=True)

class SportMinRead(BaseModel):
    id: UUID
    name: str
    model_config = ConfigDict(from_attributes=True)

class UserRead(UserBase):
    id: UUID
    image: Optional[str] = None
    match_preferences: Optional[str] = None
    created_at: datetime
    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False
    is_private: bool = False
    is_friend: bool = False
    friendship_status: str = "none"

    model_config = ConfigDict(from_attributes=True)

class UserReadSuggested(BaseModel):
    id: UUID
    image: Optional[str] = None
    created_at: datetime

    is_following: bool = False
    is_private: bool = False
    friendship_status: str = "none"
    nickname: str
    role: str

class ClubReadSuggested(BaseModel):
    id: UUID
    image: Optional[str] = None
    created_at: datetime

    is_following: bool = False
    nickname: str
    role: str
    club_name: Optional[str] = None
    location: Optional[str] = None
    sport: Optional[str] = None

class AthleteProfileRead(UserRead):
    role: Literal["ATHLETE"] = "ATHLETE"
    full_name: str
    birth_date: date
    location: str
    bio: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    dominant_side: Optional[str] = None
    experience_years: Optional[int] = None
    experience_level: Optional[str] = None
    current_club: Optional[str] = None
    preferred_league: Optional[str] = None
    availability: Optional[str] = None
    citizenship: Optional[str] = None
    sport_id: UUID
    position_id: Optional[UUID] = None
    sport: Optional[SportMinRead] = None
    position: Optional[PositionMinRead] = None
    career_entries: List[CareerEntryRead] = []
    achievements: List[AchievementRead] = []

class CoachProfileRead(UserRead):
    role: Literal["COACH"] = "COACH"
    full_name: str
    sport_id: UUID
    sport: Optional[SportMinRead] = None
    philosophy: str
    experience: str
    contact_number: str
    license: Optional[str] = None
    years_exp: Optional[int] = None
    team_category: Optional[str] = None
    preferred_club_level: Optional[str] = None
    availability: Optional[str] = None
    open_to_relocation: Optional[bool] = None
    career_entries: List[CareerEntryRead] = []
    certifications: List[CertificationRead] = []

class ClubProfileRead(UserRead):
    role: Literal["CLUB"] = "CLUB"
    club_name: str
    sport_id: UUID
    sport: Optional[SportMinRead] = None
    location: str
    description: str
    league: Optional[str] = None
    founded_year: Optional[int] = None
    home_venue: Optional[str] = None
    trophies: List[TrophyRead] = []

class ScoutProfileRead(UserRead):
    role: Literal["SCOUT"] = "SCOUT"
    full_name: str
    organization: str
    sought_position: str
    contact_number: str
    sport_id: Optional[UUID] = None
    sport: Optional[SportMinRead] = None
    years_exp: Optional[int] = None
    scouting_type: Optional[str] = None
    network_level: Optional[str] = None
    availability: Optional[str] = None
    scout_regions: List[ScoutRegionRead] = []

class RecreationalProfileRead(UserRead):
    role: Literal["RECREATIONAL_ATHLETE"] = "RECREATIONAL_ATHLETE"
    full_name: str
    location: str
    description: str
    fitness_level: Optional[str] = None
    age_group: Optional[str] = None
    goals: Optional[str] = None
    sport: Optional[str] = None
    career_entries: List[CareerEntryRead] = []

class AdminProfileRead(UserRead):
    role: Literal["ADMIN"] = "ADMIN"

ProfileResponseSchema = Annotated[
    Union[
        AthleteProfileRead,
        CoachProfileRead,
        ClubProfileRead,
        ScoutProfileRead,
        RecreationalProfileRead,
        AdminProfileRead,
    ],
    Field(discriminator="role"),
]

class UserBaseUpdate(BaseModel):
    nickname: Optional[str] = None
    email: Optional[EmailStr] = None
    image: Optional[str] = None
    cover_image: Optional[str] = None
    match_preferences: Optional[str] = None

class AthleteProfileUpdate(UserBaseUpdate):
    role: Literal["ATHLETE"] = "ATHLETE"
    full_name: Optional[str] = None
    birth_date: Optional[date] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    dominant_side: Optional[str] = None
    experience_years: Optional[int] = None
    experience_level: Optional[str] = None
    current_club: Optional[str] = None
    preferred_league: Optional[str] = None
    availability: Optional[str] = None
    citizenship: Optional[str] = None
    sport_id: Optional[UUID] = None
    position_id: Optional[UUID] = None
    career_entries: Optional[List[CareerEntryWrite]] = None
    achievements: Optional[List[AchievementWrite]] = None

class CoachProfileUpdate(UserBaseUpdate):
    role: Literal["COACH"] = "COACH"
    full_name: Optional[str] = None
    sport_id: Optional[UUID] = None
    philosophy: Optional[str] = None
    experience: Optional[str] = None
    contact_number: Optional[str] = None
    license: Optional[str] = None
    years_exp: Optional[int] = None
    team_category: Optional[str] = None
    preferred_club_level: Optional[str] = None
    availability: Optional[str] = None
    open_to_relocation: Optional[bool] = None
    career_entries: Optional[List[CareerEntryWrite]] = None
    certifications: Optional[List[CertificationWrite]] = None

class ClubProfileUpdate(UserBaseUpdate):
    role: Literal["CLUB"] = "CLUB"
    club_name: Optional[str] = None
    sport_id: Optional[UUID] = None
    location: Optional[str] = None
    description: Optional[str] = None
    league: Optional[str] = None
    founded_year: Optional[int] = None
    home_venue: Optional[str] = None
    trophies: Optional[List[TrophyWrite]] = None

class ScoutProfileUpdate(UserBaseUpdate):
    role: Literal["SCOUT"] = "SCOUT"
    full_name: Optional[str] = None
    organization: Optional[str] = None
    sought_position: Optional[str] = None
    contact_number: Optional[str] = None
    sport_id: Optional[UUID] = None
    years_exp: Optional[int] = None
    scouting_type: Optional[str] = None
    network_level: Optional[str] = None
    availability: Optional[str] = None
    scout_regions: Optional[List[ScoutRegionWrite]] = None

class RecreationalProfileUpdate(UserBaseUpdate):
    role: Literal["RECREATIONAL_ATHLETE"] = "RECREATIONAL_ATHLETE"
    full_name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    fitness_level: Optional[str] = None
    age_group: Optional[str] = None
    goals: Optional[str] = None
    sport: Optional[str] = None
    career_entries: Optional[List[CareerEntryWrite]] = None

class AdminProfileUpdate(UserBaseUpdate):
    role: Literal["ADMIN"] = "ADMIN"

ProfileUpdateSchema = Annotated[
    Union[
        AthleteProfileUpdate,
        CoachProfileUpdate,
        ClubProfileUpdate,
        ScoutProfileUpdate,
        RecreationalProfileUpdate,
        AdminProfileUpdate,
    ],
    Field(discriminator="role"),
]

class UserMinRead(UserBase):
    id: UUID
    role: str
    model_config = ConfigDict(from_attributes=True)  