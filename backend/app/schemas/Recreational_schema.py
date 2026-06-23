from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class RecreationalBase(BaseModel):
    full_name: str
    location: str
    description: str

class RecreationalCreate(RecreationalBase):
    user_id: UUID

class RecreationalUpdate(BaseModel):
    full_name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

class RecreationalRead(RecreationalBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)