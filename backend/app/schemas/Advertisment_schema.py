from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from ..schemas.User_schema import UserRole, UserMinRead

class AdvertisementBase(BaseModel):
    title: str
    description: str
    sport: str
    location: str
    requirements: Dict[str, Any] = Field(default_factory=dict)

class AdvertisementCreate(AdvertisementBase):
    target_roles: Optional[list[UserRole]] = None

class AdvertisementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sport: Optional[str] = None
    location: Optional[str] = None
    target_roles: Optional[list[UserRole]] = None
    requirements: Optional[dict] = None

class AdvertisementRead(AdvertisementBase):
    id: UUID
    creator_id: UUID
    created_at: datetime
    target_roles: list[UserRole]
    requirements: dict
    view_count: int
    application_count: int
    creator: UserMinRead
    has_applied: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

class MatchCriterion(BaseModel):
    label: str
    ok: bool
    detail: str
    missing: bool = False

class RecommendedAdvertisementRead(AdvertisementRead):
    match_percentage: int = 0
    match_score: float = 0.0
    match_reasons: List[MatchCriterion] = []

class PaginatedAdvertisementsResponse(BaseModel):
    items: List[AdvertisementRead]
    has_more: bool
    next_cursor: Optional[str] = None

class AdvertismentPersonalResponse(BaseModel):
    id: UUID
    title: str
    description: str
    sport: str
    application_count: int
    view_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AdvertisementMinRead(BaseModel):
    id: UUID
    title: str

    model_config = ConfigDict(from_attributes=True)