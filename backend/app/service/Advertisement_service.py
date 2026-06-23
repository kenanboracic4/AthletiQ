
from datetime import datetime
from email.mime import application
from hmac import new
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import HTTPException
from sqlmodel import desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository import Advertisement_repository as advertisement_repo
from app.repository import Advertisement_requirements_repository as requirements_repo
from app.repository import User_repository as user_repo
from app.schemas.Advertisment_schema import AdvertisementCreate, AdvertisementUpdate
from app.schemas.User_schema import UserRole, parse_user_role
from app.repository import Application_repository as application_repo

ALLOWED_TARGETS = {
    UserRole.CLUB: [
        UserRole.ATHLETE,
        UserRole.COACH,
        UserRole.SCOUT,
    ],

    UserRole.COACH: [
        UserRole.CLUB,
        UserRole.ATHLETE,
        UserRole.RECREATIONAL_ATHLETE,
    ],

    UserRole.SCOUT: [
        UserRole.CLUB,
        UserRole.ATHLETE,
    ],

    UserRole.ATHLETE: [
        UserRole.CLUB,
        UserRole.COACH,
        UserRole.SCOUT,
    ],
}

async def create_advertisement(
    db: AsyncSession,
    creator_id: UUID,
    data: AdvertisementCreate,
):
    user = await user_repo.get_user_by_uuid(db, creator_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Greška prilikom traženja korisnika!"
        )

    if parse_user_role(user.role) == UserRole.RECREATIONAL_ATHLETE:
        raise HTTPException(
            status_code=400,
            detail="Rekreativni sportista ne može kreirati oglase!"
        )

    creator_role = parse_user_role(user.role)

    if creator_role not in ALLOWED_TARGETS:
        raise HTTPException(
            status_code=400,
            detail="Ova vrsta korisnika ne može kreirati oglase."
        )

    if not data.target_roles:
        raise HTTPException(
            status_code=400,
            detail="Morate odabrati kome je oglas namijenjen."
        )

    allowed_roles = ALLOWED_TARGETS[creator_role]

    target_enums = []
    for role in data.target_roles:
        role_enum = parse_user_role(role)
        if role_enum not in allowed_roles:

            role_msg = role_enum.value if hasattr(role_enum, "value") else role_enum
            raise HTTPException(
                status_code=400,
                detail=f"Uloga '{role_msg}' nije dozvoljena za ovaj tip oglasa."
            )
        target_enums.append(role_enum)

    requirement_type = requirements_repo.compute_requirement_type(
        creator_role, target_enums[0]
    )

    new_advertisement = await advertisement_repo.create_advertisement(
        db,
        {
            "creator_id": creator_id,
            "title": data.title,
            "description": data.description,
            "sport": data.sport,
            "location": data.location,
            "target_roles": data.target_roles,
            "requirement_type": requirement_type,
        }
    )

    await requirements_repo.create_requirements(
        db, new_advertisement.id, requirement_type, data.requirements
    )

    await db.commit()
    await db.refresh(new_advertisement)
    await requirements_repo.attach_requirements(db, new_advertisement)

    from app.service import Matching_service
    try:
        await Matching_service.ensure_advertisement_embedding(db, new_advertisement)
    except Exception as exc:
        print(f"[Advertisement_service] Embedding nije generisan: {exc}")

    return new_advertisement

async def get_advertisement(db: AsyncSession, advertisement_id: UUID, current_user_id: UUID):
    ad = await advertisement_repo.get_advertisement_by_id(db, advertisement_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Oglas ne postoji.")
    await advertisement_repo.increse_view(db, advertisement_id)
    has_applied = await application_repo.get_applications_by_advertisement_user_id(db, advertisement_id, current_user_id)
    ad.has_applied = has_applied is not None
    await requirements_repo.attach_requirements(db, ad)
    return ad

async def update_advertisement(db: AsyncSession, ad_id: UUID, current_user_id: UUID, data: AdvertisementUpdate):
    ad = await advertisement_repo.get_advertisement_by_id(db, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Oglas ne postoji.")

    if ad.creator_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Nemate dozvolu za izmjenu ovog oglasa!"
        )

    update_data = data.model_dump(exclude_unset=True)
    new_requirements = update_data.pop("requirements", None)
    new_target_roles = update_data.get("target_roles", None)

    for key, value in update_data.items():
        setattr(ad, key, value)

    requirements_changed = new_requirements is not None or new_target_roles is not None
    if requirements_changed:
        creator = await user_repo.get_user_by_uuid(db, ad.creator_id)
        target_roles = ad.target_roles or []
        first_target = target_roles[0] if target_roles else None

        new_type = requirements_repo.compute_requirement_type(
            creator.role if creator else None, first_target
        )

        await requirements_repo.delete_requirements(db, ad.id, ad.requirement_type)
        ad.requirement_type = new_type
        await requirements_repo.create_requirements(
            db, ad.id, new_type, new_requirements or {}
        )

    await db.commit()
    await db.refresh(ad)
    await requirements_repo.attach_requirements(db, ad)

    from app.service import Matching_service
    try:
        ad.embedding = None
        ad.embedding_model = None
        await Matching_service.ensure_advertisement_embedding(db, ad)
    except Exception as exc:
        print(f"[Advertisement_service] Embedding nije regenerisan: {exc}")

    return ad

async def delete_advertisement(db: AsyncSession, ad_id: UUID, current_user_id: UUID):
    ad = await advertisement_repo.get_advertisement_by_id(db, ad_id)
    if not ad:
        raise HTTPException(status_code=404, detail="Oglas ne postoji.")

    if ad.creator_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Nemate dozvolu za brisanje ovog oglasa!"
        )

    await advertisement_repo.delete_advertisement(db, ad_id)
    await db.commit()
    return {"detail": "Oglas uspješno obrisan."}

async def get_advertisements_by_user(db: AsyncSession, user_id: UUID, cursor: Optional[str], limit: int):
    user = await user_repo.get_user_by_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Greška prilikom traženja korisnika!")

    result = await advertisement_repo.get_advertisements_by_user(db, user.role, cursor, limit)
    for ad in result["items"]:
        await requirements_repo.attach_requirements(db, ad)
    return result

async def get_user_advertisements(db: AsyncSession, user_id: UUID):
    return await advertisement_repo.get_user_advertisements(db, user_id)

async def get_recommended_advertisements(db: AsyncSession, user_id: UUID, limit: int = 20):
    from app.service import Matching_service

    user = await user_repo.get_user_by_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Greška prilikom traženja korisnika!")
    return await Matching_service.get_recommended_advertisements(db, user_id, limit)