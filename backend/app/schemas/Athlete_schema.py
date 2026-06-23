from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class AthleteBase(BaseModel):
    full_name: str
    birth_date: date
    location: str
    bio: Optional[str] = None
    height: Optional[int] = None

class AthleteCreate(AthleteBase):
    user_id: UUID
    sport_id: Optional[UUID] = None
    position_id: Optional[UUID] = None

class AthleteUpdate(BaseModel):
    full_name: Optional[str] = None
    birth_date: Optional[date] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    height: Optional[int] = None
    sport_id: Optional[UUID] = None
    position_id: Optional[UUID] = None

class AthleteRead(AthleteBase):
    id: UUID
    user_id: UUID
    sport_id: Optional[UUID] = None
    position_id: Optional[UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)