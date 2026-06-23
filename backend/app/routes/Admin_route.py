from typing import Optional

from uuid import UUID

from fastapi import APIRouter, Depends, Query

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

from app.core.dependecy import get_admin_user_id

from app.schemas.Admin_schema import (

    AdminStatsRead,

    AdminUserRead,

    AdminUserCreate,

    AdminUserUpdate,

    PaginatedAdminUsersResponse,

    PaginatedAdminPostsResponse,

    PaginatedAdminAdvertisementsResponse,

    PaginatedAdminReportsResponse,

    AdminReportRead,

    serialize_admin_user,

    serialize_admin_post,

    serialize_admin_advertisement,

    serialize_admin_report,

)

from app.schemas.Report_schema import ReportUpdateStatus, ReportStatus

from app.service import Admin_service as admin_service

router = APIRouter(

    prefix="/admin",

    tags=["Admin"],

)

@router.get("/stats", response_model=AdminStatsRead)

async def get_stats(

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    return await admin_service.get_stats(db)

@router.get("/users", response_model=PaginatedAdminUsersResponse)

async def get_users(

    page: int = Query(1, ge=1),

    limit: int = Query(20, ge=1, le=100),

    search: Optional[str] = Query(None),

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    result = await admin_service.get_users(db, page, limit, search)

    return {

        **result,

        "items": [serialize_admin_user(u) for u in result["items"]],

    }

@router.get("/users/{user_id}", response_model=AdminUserRead)

async def get_user(

    user_id: UUID,

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    user = await admin_service.get_user(db, user_id)

    return serialize_admin_user(user)

@router.post("/users", response_model=AdminUserRead)

async def create_user(

    data: AdminUserCreate,

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    user = await admin_service.create_user(db, data)

    return serialize_admin_user(user)

@router.patch("/users/{user_id}", response_model=AdminUserRead)

async def update_user(

    user_id: UUID,
    data: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    admin_id: UUID = Depends(get_admin_user_id),
):
    user = await admin_service.update_user(db, user_id, data)

    return serialize_admin_user(user)

@router.delete("/users/{user_id}")
async def delete_user(

    user_id: UUID,

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    return await admin_service.delete_user(db, user_id, admin_id)

@router.get("/posts", response_model=PaginatedAdminPostsResponse)

async def get_posts(

    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    admin_id: UUID = Depends(get_admin_user_id),
):
    result = await admin_service.get_posts(db, page, limit, search)

    return {

        **result,

        "items": [serialize_admin_post(p) for p in result["items"]],

    }

@router.delete("/posts/{post_id}")

async def delete_post(

    post_id: UUID,

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    return await admin_service.delete_post(db, post_id)

@router.get("/advertisements", response_model=PaginatedAdminAdvertisementsResponse)

async def get_advertisements(

    page: int = Query(1, ge=1),

    limit: int = Query(20, ge=1, le=100),

    search: Optional[str] = Query(None),

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    result = await admin_service.get_advertisements(db, page, limit, search)

    return {

        **result,

        "items": [serialize_admin_advertisement(a) for a in result["items"]],

    }

@router.delete("/advertisements/{advertisement_id}")

async def delete_advertisement(

    advertisement_id: UUID,

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    return await admin_service.delete_advertisement(db, advertisement_id)

@router.get("/reports", response_model=PaginatedAdminReportsResponse)

async def get_reports(

    status: Optional[ReportStatus] = Query(None),

    cursor: Optional[str] = Query(None),

    limit: int = Query(20, ge=1, le=100),

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    result = await admin_service.get_reports(db, status, cursor, limit)

    return {

        **result,

        "items": [serialize_admin_report(r) for r in result["items"]],

    }

@router.patch("/reports/{report_id}", response_model=AdminReportRead)

async def update_report_status(

    report_id: UUID,

    data: ReportUpdateStatus,

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    report = await admin_service.update_report_status(db, report_id, data.status)

    return serialize_admin_report(report)

@router.delete("/reports/{report_id}")

async def delete_report(

    report_id: UUID,

    db: AsyncSession = Depends(get_db),

    admin_id: UUID = Depends(get_admin_user_id),

):

    return await admin_service.delete_report(db, report_id)

