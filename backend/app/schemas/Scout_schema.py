from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class ScoutBase(BaseModel):
    full_name: str
    organization: str
    sought_position: str
    contact_number: str
    sport_id: Optional[UUID] = None

class ScoutCreate(ScoutBase):
    user_id: UUID

class ScoutUpdate(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    sought_position: Optional[str] = None
    contact_number: Optional[str] = None
    sport_id: Optional[UUID] = None

class ScoutRead(ScoutBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)