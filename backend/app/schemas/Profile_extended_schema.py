from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

class CareerEntryRead(BaseModel):
    id: UUID
    organization: str
    role_title: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    is_current: bool = False

    model_config = ConfigDict(from_attributes=True)

class CareerEntryWrite(BaseModel):
    id: Optional[UUID] = None
    organization: str = Field(min_length=1, max_length=255)
    role_title: str = Field(min_length=1, max_length=255)
    location: Optional[str] = Field(default=None, max_length=255)
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    is_current: bool = False

class AchievementRead(BaseModel):
    id: UUID
    title: str
    year: Optional[int] = None
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class AchievementWrite(BaseModel):
    id: Optional[UUID] = None
    title: str = Field(min_length=1, max_length=255)
    year: Optional[int] = Field(default=None, ge=1900, le=2100)
    description: Optional[str] = None

class TrophyRead(BaseModel):
    id: UUID
    title: str
    competition: Optional[str] = None
    year: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class TrophyWrite(BaseModel):
    id: Optional[UUID] = None
    title: str = Field(min_length=1, max_length=255)
    competition: Optional[str] = Field(default=None, max_length=255)
    year: Optional[int] = Field(default=None, ge=1900, le=2100)

class CertificationRead(BaseModel):
    id: UUID
    title: str
    issuer: Optional[str] = None
    year: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class CertificationWrite(BaseModel):
    id: Optional[UUID] = None
    title: str = Field(min_length=1, max_length=255)
    issuer: Optional[str] = Field(default=None, max_length=255)
    year: Optional[int] = Field(default=None, ge=1900, le=2100)

class ScoutRegionRead(BaseModel):
    id: UUID
    region_name: str

    model_config = ConfigDict(from_attributes=True)

class ScoutRegionWrite(BaseModel):
    id: Optional[UUID] = None
    region_name: str = Field(min_length=1, max_length=255)
