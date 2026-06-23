from typing import Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.repository import Admin_repository as admin_repo
from app.repository import User_repository as user_repo
from app.repository import Report_repository as report_repo
from app.repository import Advertisement_requirements_repository as requirements_repo
from app.schemas.Admin_schema import AdminUserCreate, AdminUserUpdate
from app.schemas.Report_schema import ReportStatus
from app.models.Report_model import ReportStatus as ModelReportStatus
from app.schemas.User_schema import UserRole
from app.service.Auth_service import validate_nickname

async def get_stats(db: AsyncSession):
    stats = await admin_repo.get_system_stats(db)
    stats["total_reports"] = await report_repo.count_reports(db)
    stats["pending_reports"] = await report_repo.count_reports(db, ModelReportStatus.PENDING)
    return stats

async def get_users(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
):
    return await admin_repo.get_all_users(db, page, limit, search)

async def get_user(db: AsyncSession, user_id: UUID):
    user = await user_repo.get_user_by_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return user

async def create_user(db: AsyncSession, data: AdminUserCreate):
    existing_email = await user_repo.get_user_by_email(db, data.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Korisnik s tom email adresom već postoji")

    existing_nickname = await user_repo.get_user_by_nickname(db, data.nickname)
    if existing_nickname:
        raise HTTPException(status_code=400, detail="Korisnik s tom nadimkom već postoji")

    validate_nickname(data.nickname)

    user = await user_repo.create_user(db, {
        "email": data.email,
        "nickname": data.nickname,
        "password": hash_password(data.password),
        "role": data.role,
        "is_verified": data.is_verified,
        "is_admin": data.is_admin,
    })

    await db.commit()
    await db.refresh(user)
    return user

async def update_user(db: AsyncSession, user_id: UUID, data: AdminUserUpdate):
    user = await user_repo.get_user_by_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    update_data = data.model_dump(exclude_unset=True, exclude_none=True)

    if "nickname" in update_data:
        validate_nickname(update_data["nickname"])
        existing = await user_repo.get_user_by_nickname(db, update_data["nickname"])
        if existing and existing.id != user_id:
            raise HTTPException(status_code=400, detail="Korisnik s tom nadimkom već postoji")

    if "email" in update_data:
        existing = await user_repo.get_user_by_email(db, update_data["email"])
        if existing and existing.id != user_id:
            raise HTTPException(status_code=400, detail="Korisnik s tom email adresom već postoji")

    if "password" in update_data:
        if not update_data["password"]:
            update_data.pop("password")
        else:
            update_data["password"] = hash_password(update_data["password"])

    if not update_data:
        return user

    rows = await admin_repo.admin_update_user(db, user_id, update_data)
    if not rows:
        raise HTTPException(status_code=400, detail="Korisnik nije ažuriran")

    await db.commit()
    updated = await user_repo.get_user_by_uuid(db, user_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen nakon ažuriranja")
    return updated

async def delete_user(db: AsyncSession, user_id: UUID, admin_id: UUID):
    if user_id == admin_id:
        raise HTTPException(status_code=400, detail="Ne možete obrisati vlastiti nalog")

    user = await user_repo.get_user_by_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    result = await admin_repo.admin_delete_user(db, user_id)
    await db.commit()

    if not result:
        raise HTTPException(status_code=400, detail="Korisnik nije obrisan")
    return {"detail": "Korisnik uspješno obrisan"}

async def get_posts(db: AsyncSession, page: int = 1, limit: int = 20, search: Optional[str] = None):
    return await admin_repo.get_all_posts_admin(db, page, limit, search)

async def delete_post(db: AsyncSession, post_id: UUID):
    result = await admin_repo.admin_delete_post(db, post_id)
    await db.commit()
    if not result:
        raise HTTPException(status_code=404, detail="Post ne postoji")
    return {"detail": "Post uspješno obrisan"}

async def get_advertisements(db: AsyncSession, page: int = 1, limit: int = 20, search: Optional[str] = None):
    result = await admin_repo.get_all_advertisements_admin(db, page, limit, search)
    for ad in result["items"]:
        await requirements_repo.attach_requirements(db, ad)
    return result

async def delete_advertisement(db: AsyncSession, advertisement_id: UUID):
    result = await admin_repo.admin_delete_advertisement(db, advertisement_id)
    await db.commit()
    if not result:
        raise HTTPException(status_code=404, detail="Oglas ne postoji")
    return {"detail": "Oglas uspješno obrisan"}

async def get_reports(
    db: AsyncSession,
    status: Optional[ReportStatus] = None,
    cursor: Optional[str] = None,
    limit: int = 20,
):
    model_status = ModelReportStatus(status.value) if status else None
    return await report_repo.get_reports(db, model_status, cursor, limit)

async def update_report_status(db: AsyncSession, report_id: UUID, status: ReportStatus):
    report = await report_repo.get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Prijava ne postoji")

    await report_repo.update_report_status(db, report_id, ModelReportStatus(status.value))
    await db.commit()
    return await report_repo.get_report_by_id(db, report_id)

async def delete_report(db: AsyncSession, report_id: UUID):
    result = await report_repo.delete_report(db, report_id)
    await db.commit()
    if not result:
        raise HTTPException(status_code=404, detail="Prijava ne postoji")
    return {"detail": "Prijava uspješno obrisana"}
