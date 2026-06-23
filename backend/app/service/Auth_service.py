import re

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repository import Athlete_repository as athlete_repo, Club_repository as club_repo, Coach_repository as coach_repo, Recreational_repository as recreational_repo, Scout_repository as scout_repo
from app.models import User_model
from app.schemas.User_schema import LoginSchema, RegisterSchema
from app.repository import (
    User_repository as user_repo,
)
from app.core.security import hash_password, verify_password

def validate_nickname(nickname: str):

    if not re.match(r"^[a-zA-Z0-9šđčćžŠĐČĆŽ]+$", nickname):
        raise HTTPException(
            status_code=400,
            detail="Nadimak smije sadržavati samo slova i brojeve, bez specijalnih znakova i razmaka!"
        )

async def register_user(data: RegisterSchema, db: AsyncSession):

    db_user = await user_repo.get_user_by_email(db, data.email)
    db_nickname = await user_repo.get_user_by_nickname(db, data.nickname)

    if db_nickname:
        raise HTTPException(status_code=400, detail="Korisnik s tom nadimkom već postoji")

    if db_user:
        raise HTTPException(status_code=400, detail="Korisnik s tom email adresom već postoji")
    db_nickname = await user_repo.get_user_by_nickname(db, data.nickname)

    validate_nickname(data.nickname)

    new_user = await user_repo.create_user(db, {
        "email": data.email,
        "nickname" : data.nickname,
        "password": hash_password(data.password),
        "role": data.role,
    })
    await db.flush()

    match data.role:
        case 'ATHLETE':
            await athlete_repo.create_athlete(db, {
                "user_id": new_user.id,
                "full_name": data.full_name,
                "birth_date": data.birth_date,
                "location": data.location,
                "bio": data.bio,
                "height": data.height,
                "sport_id": data.sport_id,
                "position_id": data.position_id,
            })

        case 'COACH':
            await coach_repo.create_coach(db, {
                "user_id": new_user.id,
                "full_name": data.full_name,
                "sport_id": data.sport_id,
                "philosophy": data.philosophy,
                "experience": data.experience,
                "contact_number": data.contact_number,
            })

        case 'CLUB':
            await club_repo.create_club(db, {
                "user_id": new_user.id,
                "club_name": data.club_name,
                "sport_id": data.sport_id,
                "location": data.location,
                "description": data.description,
            })

        case 'SCOUT':
            await scout_repo.create_scout(db, {
                "user_id": new_user.id,
                "full_name": data.full_name,
                "organization": data.organization,
                "sought_position": data.sought_position,
                "contact_number": data.contact_number,
                "sport_id": data.sport_id,
            })

        case 'RECREATIONAL_ATHLETE':
            await recreational_repo.create_recreational(db, {
                "user_id": new_user.id,
                "full_name": data.full_name,
                "location": data.location,
                "description": data.description,
            })

        case _:
            raise HTTPException(status_code=400, detail="Nevalidna rola")

    await db.commit()
    return new_user

async def login_user(data: LoginSchema, db: AsyncSession):
    db_user = await user_repo.get_user_by_nickname(db, data.nickname)
    if not db_user:
        raise HTTPException(status_code=400, detail="Korisnik s tom email adresom ne postoji")
    if not verify_password(data.password, db_user.password):
        raise HTTPException(status_code=400, detail="Pogrešna lozinka")

    return db_user

    