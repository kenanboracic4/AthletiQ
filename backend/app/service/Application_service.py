
from datetime import datetime
from hmac import new
from pathlib import Path
from typing import List, Optional
from uuid import UUID, uuid4
import uuid

from fastapi import HTTPException, UploadFile
from sqlmodel import desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository import Application_repository as application_repo
from app.repository import Advertisement_repository as advertisement_repo
from app.service.Email_service import EmailService
from app.repository import User_repository as user_repo

from app.schemas.Application_schema import ApplicationCreate, ApplicationUpdate
UPLOAD_DIR = Path("uploads/cv")

async def create_application(
    db: AsyncSession,
    advertisement_id: UUID,
    cover_letter: str,
    youtube_url: str | None,
    cv_file: UploadFile,
    cv_content: bytes,
    current_user_id: UUID,
):
    existing_app = await application_repo.get_applications_by_advertisement_user_id(
        db, advertisement_id, current_user_id
    )
    if existing_app:
        raise HTTPException(
            status_code=400,
            detail="Već ste se prijavili za ovaj oglas!",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    extension = Path(cv_file.filename).suffix.lower() if cv_file.filename else ".pdf"
    filename = f"{uuid.uuid4()}{extension}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as f:
        f.write(cv_content)

    cv_url = f"uploads/cv/{filename}"

    application_data = {
        "advertisement_id": advertisement_id,
        "user_id": current_user_id,
        "cover_letter": cover_letter,
        "youtube_url": youtube_url,
        "cv_url": cv_url,
    }
    await advertisement_repo.increase_number_of_applications(db, advertisement_id)

    advertisment = await advertisement_repo.get_advertisement_by_id(db, advertisement_id)
    if not advertisment:
        raise HTTPException(status_code=404, detail="Oglas ne postoji!")

    target_user = await user_repo.get_user_by_uuid(db, advertisment.creator_id)
    curr_user = await user_repo.get_user_by_uuid(db, current_user_id)

    await EmailService.send_notification_email(
        recipient_email=target_user.email,
        subject="Novi oglas",
        body="<h1> Nova prijava na Vaš oglas </h1> <p> Dobili ste novu prijavu na Vaš oglas. Detalje provjerite putem naše web stranice. </p>"
    )

    await EmailService.send_notification_email(
        recipient_email=curr_user.email,
        subject="Nova prijava",
        body="<h1> Uspješno ste se prijavili na novi oglas </h1> <p> Detalje provjerite putem naše web stranice. </p>"
    )

    return await application_repo.create_application(db, application_data)

async def get_application(db: AsyncSession, application_id: UUID):
    app = await application_repo.get_application_by_id(db, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Oglas ne postoji.")
    return app

async def get_applications_by_advertisement(db: AsyncSession, advertisement_id: UUID, current_user_id: UUID):
    ad = await advertisement_repo.get_advertisement_by_id(db, advertisement_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Oglas ne postoji.")
    print("id: " + str(current_user_id))
    print("creator_id: " + str(ad.creator_id))

    if str(ad.creator_id) != str(current_user_id):
        raise HTTPException(
            status_code=403,
            detail="Nemate dozvolu za pregled ovog oglasaaa!"
        )
    return await application_repo.get_applications_by_advertisment(db, advertisement_id)

async def delete_application(db: AsyncSession, application_id: UUID, current_user_id: UUID):
    application = await application_repo.get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Oglas ne postoji.")

    if application.advertisement.creator_id != current_user_id and application.user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Nemate dozvolu za brisanje ovog oglasa!"
        )

    await application_repo.delete_application(db, application_id)
    await db.commit()
    return {"detail": "Oglas uspješno obrisan."}

async def accept_application_status(db: AsyncSession, application_id: UUID, current_user_id: UUID):
    application = await application_repo.get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Oglas ne postoji.")

    if application.advertisement.creator_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Nemate dozvolu za prihvatanje ovog oglasa!"
        )

    await application_repo.accept_application_status(db, application_id)
    await db.commit()
    return {"detail": "Oglas uspješno ažuriran."}

async def reject_application_status(db: AsyncSession, application_id: UUID, current_user_id: UUID):
    application = await application_repo.get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Oglas ne postoji.")

    if application.advertisement.creator_id != current_user_id:
        raise HTTPException(
            status_code=403,

            detail="Nemate dozvolu za odbijanje ovog oglasa!!"
        )

    await application_repo.reject_application_status(db, application_id)
    await db.commit()
    return {"detail": "Oglas uspješno odbijen."}

async def get_applications_by_user(db: AsyncSession, user_id: UUID):
    return await application_repo.get_applications_by_user(db, user_id)