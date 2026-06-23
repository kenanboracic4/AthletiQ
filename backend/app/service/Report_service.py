from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repository import Report_repository as report_repo
from app.repository import Post_repository as post_repo
from app.repository import Advertisement_repository as ad_repo
from app.repository import User_repository as user_repo
from app.service import Notification_service as notification_service
from app.service.Email_service import EmailService
from app.schemas.Report_schema import ReportCreate
from app.models.Report_model import ReportTargetType

async def _notify_admins_about_report(
    db: AsyncSession,
    reporter_id: UUID,
    target_type: ReportTargetType,
    reason: str,
    description: str | None,
    post_id: UUID | None = None,
    advertisement_id: UUID | None = None,
):
    admins = await user_repo.get_admin_users(db)
    if not admins:
        return

    reporter = await user_repo.get_user_by_uuid(db, reporter_id)
    reporter_name = reporter.nickname if reporter else "Korisnik"

    if target_type == ReportTargetType.POST:
        content_label = "objavu"
    else:
        content_label = "oglas"

    desc_part = f"<p><strong>Opis:</strong> {description}</p>" if description else ""

    for admin in admins:
        if admin.id == reporter_id:
            continue

        notification_data = {
            "recipient_id": admin.id,
            "sender_id": reporter_id,
            "notification_type": "report",
        }
        if post_id:
            notification_data["post_id"] = post_id

        await notification_service.create_notification(db, notification_data)

        try:
            await EmailService.send_notification_email(
                recipient_email=admin.email,
                subject="Nova prijava sadržaja",
                body=(
                    f"<h1>Nova prijava sadržaja</h1>"
                    f"<p>Korisnik <strong>{reporter_name}</strong> prijavio je {content_label}.</p>"
                    f"<p><strong>Razlog:</strong> {reason}</p>"
                    f"{desc_part}"
                    f"<p>Pregled prijava: otvorite Admin Panel → Prijave.</p>"
                ),
            )
        except Exception:
            pass

async def create_report(db: AsyncSession, reporter_id: UUID, data: ReportCreate):
    target_type = ReportTargetType(data.target_type.value)

    if target_type == ReportTargetType.POST:
        if not data.post_id:
            raise HTTPException(status_code=400, detail="Post ID je obavezan")
        post = await post_repo.get_post_by_uuid(db, data.post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post ne postoji")
        if post.user_id == reporter_id:
            raise HTTPException(status_code=400, detail="Ne možete prijaviti vlastiti post")

        existing = await report_repo.get_existing_report(
            db, reporter_id, ReportTargetType.POST, post_id=data.post_id
        )
        if existing:
            raise HTTPException(status_code=400, detail="Već ste prijavili ovaj post")

        report = await report_repo.create_report(db, {
            "reporter_id": reporter_id,
            "target_type": ReportTargetType.POST,
            "post_id": data.post_id,
            "reason": data.reason,
            "description": data.description,
        })

        await _notify_admins_about_report(
            db,
            reporter_id,
            target_type,
            data.reason,
            data.description,
            post_id=data.post_id,
        )

    elif target_type == ReportTargetType.ADVERTISEMENT:
        if not data.advertisement_id:
            raise HTTPException(status_code=400, detail="ID oglasa je obavezan")
        ad = await ad_repo.get_advertisement_by_id(db, data.advertisement_id)
        if not ad:
            raise HTTPException(status_code=404, detail="Oglas ne postoji")
        if ad.creator_id == reporter_id:
            raise HTTPException(status_code=400, detail="Ne možete prijaviti vlastiti oglas")

        existing = await report_repo.get_existing_report(
            db, reporter_id, ReportTargetType.ADVERTISEMENT, advertisement_id=data.advertisement_id
        )
        if existing:
            raise HTTPException(status_code=400, detail="Već ste prijavili ovaj oglas")

        report = await report_repo.create_report(db, {
            "reporter_id": reporter_id,
            "target_type": ReportTargetType.ADVERTISEMENT,
            "advertisement_id": data.advertisement_id,
            "reason": data.reason,
            "description": data.description,
        })

        await _notify_admins_about_report(
            db,
            reporter_id,
            target_type,
            data.reason,
            data.description,
        )
    else:
        raise HTTPException(status_code=400, detail="Nevalidan tip prijave")

    await db.commit()
    return await report_repo.get_report_by_id(db, report.id)
