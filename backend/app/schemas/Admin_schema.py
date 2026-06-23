from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.schemas.User_schema import UserRole

def parse_user_role(value):
    if value is None:
        return value
    if isinstance(value, UserRole):
        return value
    if isinstance(value, str):
        if value in UserRole.__members__:
            return UserRole[value]
        return UserRole(value)
    return value

def role_to_str(role) -> str:
    if isinstance(role, UserRole):
        return role.value
    return str(role)

def serialize_user_min(user) -> Optional[dict[str, Any]]:
    if not user:
        return None
    return {
        "id": user.id,
        "nickname": user.nickname,
        "email": user.email,
        "image": user.image,
        "role": role_to_str(user.role),
        "is_verified": user.is_verified,
    }

def serialize_admin_user(user) -> dict[str, Any]:
    return {
        "id": user.id,
        "email": user.email,
        "nickname": user.nickname,
        "role": role_to_str(user.role),
        "is_verified": user.is_verified,
        "is_admin": user.is_admin,
        "image": user.image,
        "created_at": user.created_at,
    }

def serialize_admin_post(post) -> dict[str, Any]:
    return {
        "id": post.id,
        "content": post.content,
        "likes_count": post.likes_count,
        "created_at": post.created_at,
        "user": serialize_user_min(post.user),
    }

def serialize_admin_advertisement(ad) -> dict[str, Any]:
    return {
        "id": ad.id,
        "creator_id": ad.creator_id,
        "title": ad.title,
        "description": ad.description,
        "sport": ad.sport,
        "location": ad.location,
        "requirements": getattr(ad, "requirements", None) or {},
        "target_roles": [role_to_str(r) for r in (ad.target_roles or [])],
        "view_count": ad.view_count,
        "application_count": ad.application_count,
        "created_at": ad.created_at,
        "creator": serialize_user_min(ad.creator),
    }

def serialize_admin_report(report) -> dict[str, Any]:
    return {
        "id": report.id,
        "reporter_id": report.reporter_id,
        "target_type": report.target_type.value,
        "post_id": report.post_id,
        "advertisement_id": report.advertisement_id,
        "reason": report.reason,
        "description": report.description,
        "status": report.status.value,
        "created_at": report.created_at,
        "reporter": serialize_user_min(report.reporter),
    }

class AdminStatsRead(BaseModel):
    total_users: int
    total_posts: int
    total_advertisements: int
    total_applications: int
    total_reports: int
    pending_reports: int
    users_by_role: dict[str, int]

class AdminUserRead(BaseModel):
    id: UUID
    email: str
    nickname: str
    role: str
    is_verified: bool
    is_admin: bool
    image: Optional[str] = None
    created_at: datetime

class AdminPostRead(BaseModel):
    id: UUID
    content: str
    likes_count: int
    created_at: datetime
    user: Optional[dict[str, Any]] = None

class AdminAdvertisementRead(BaseModel):
    id: UUID
    creator_id: UUID
    title: str
    description: str
    sport: str
    location: str
    requirements: dict
    target_roles: list[str]
    view_count: int
    application_count: int
    created_at: datetime
    creator: Optional[dict[str, Any]] = None

class AdminReportRead(BaseModel):
    id: UUID
    reporter_id: UUID
    target_type: str
    post_id: Optional[UUID] = None
    advertisement_id: Optional[UUID] = None
    reason: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    reporter: Optional[dict[str, Any]] = None

class AdminUserCreate(BaseModel):
    email: EmailStr
    nickname: str
    password: str = Field(..., min_length=6)
    role: UserRole
    is_verified: bool = False
    is_admin: bool = False

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, value):
        return parse_user_role(value)

class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nickname: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[UserRole] = None
    is_verified: Optional[bool] = None
    is_admin: Optional[bool] = None

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, value):
        return parse_user_role(value)

class PaginatedAdminUsersResponse(BaseModel):
    items: list[AdminUserRead]
    total: int
    page: int
    limit: int
    has_more: bool

class PaginatedAdminPostsResponse(BaseModel):
    items: list[AdminPostRead]
    total: int
    page: int
    limit: int
    has_more: bool

class PaginatedAdminAdvertisementsResponse(BaseModel):
    items: list[AdminAdvertisementRead]
    total: int
    page: int
    limit: int
    has_more: bool

class PaginatedAdminReportsResponse(BaseModel):
    items: list[AdminReportRead]
    has_more: bool
    next_cursor: Optional[str] = None

