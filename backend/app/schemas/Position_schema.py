from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class PositionBase(BaseModel):
    name: str

class PositionCreate(PositionBase):
    sport_id: UUID

class PositionUpdate(BaseModel):
    name: Optional[str] = None

class PositionRead(PositionBase):
    id: UUID
    sport_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)