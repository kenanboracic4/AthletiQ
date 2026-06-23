from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class ClubBase(BaseModel):
    club_name: str
    sport_id: UUID
    location: str
    description: str

class ClubCreate(ClubBase):
    user_id: UUID

class ClubUpdate(BaseModel):
    club_name: Optional[str] = None
    sport_id: Optional[UUID] = None
    location: Optional[str] = None
    description: Optional[str] = None

class ClubRead(ClubBase):
    id: UUID
    user_id: UUID
    sport_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)