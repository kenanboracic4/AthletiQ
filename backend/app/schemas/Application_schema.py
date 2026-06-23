from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from ..schemas.User_schema import UserRole, UserMinRead

class ApplicationBase(BaseModel):
    cover_letter: str
    youtube_url: Optional[str] = None
    created_at: datetime

class ApplicationCreate(ApplicationBase):
    advertisement_id: UUID

class ApplicationUpdate(BaseModel):
    cover_letter: Optional[str] = None
    cv_url: Optional[str] = None
    youtube_url: Optional[str] = None
    status: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: UUID
    advertisement_id: UUID
    user_id: UUID
    cover_letter: str
    cv_url: str
    youtube_url: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(arbitrary_types_allowed=True)

class ApplicationReadByAdvertisement(ApplicationResponse):
    user: UserMinRead
    