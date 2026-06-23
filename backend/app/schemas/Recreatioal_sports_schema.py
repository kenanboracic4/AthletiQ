from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class Recreational_sportsBase(BaseModel):
    profile_id: UUID
    sport_id: UUID

class Recreational_sportsCreate(Recreational_sportsBase):
    pass

class Recreational_sportsUpdate(BaseModel):
    profile_id: Optional[UUID] = None
    sport_id: Optional[UUID] = None

class Recreational_sportsRead(Recreational_sportsBase):
    id: UUID
    profile_id: UUID
    sport_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)