from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class CoachBase(BaseModel):
    full_name: str
    philosophy: str
    experience: str
    contact_number: str

class CoachCreate(CoachBase):
    user_id: UUID

class CoachUpdate(BaseModel):
    full_name: Optional[str] = None
    philosophy: Optional[str] = None
    experience: Optional[str] = None
    contact_number: Optional[str] = None

class CoachRead(CoachBase):
    id: UUID
    user_id: UUID
    sport_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)