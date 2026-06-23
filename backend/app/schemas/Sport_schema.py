from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class SportBase(BaseModel):
    name: str

class SportCreate(SportBase):
    pass

class SportUpdate(BaseModel):
    name: Optional[str] = None

class SportRead(SportBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)