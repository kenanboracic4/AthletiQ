from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.User_schema import UserMinRead

class ReportTargetType(str, PyEnum):
    POST = "post"
    ADVERTISEMENT = "advertisement"

class ReportStatus(str, PyEnum):
    PENDING = "pending"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class ReportCreate(BaseModel):
    target_type: ReportTargetType
    post_id: Optional[UUID] = None
    advertisement_id: Optional[UUID] = None
    reason: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)

class ReportUpdateStatus(BaseModel):
    status: ReportStatus

class ReportRead(BaseModel):
    id: UUID
    reporter_id: UUID
    target_type: ReportTargetType
    post_id: Optional[UUID] = None
    advertisement_id: Optional[UUID] = None
    reason: str
    description: Optional[str] = None
    status: ReportStatus
    created_at: datetime
    reporter: Optional[UserMinRead] = None

    model_config = ConfigDict(from_attributes=True)

class PaginatedReportsResponse(BaseModel):
    items: list[ReportRead]
    has_more: bool
    next_cursor: Optional[str] = None
