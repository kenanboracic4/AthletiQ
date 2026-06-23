from os import access
import datetime
from datetime import timezone, timedelta
import os
from uuid import UUID
import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

from fastapi import APIRouter, Depends, Response, status, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

from app.schemas.User_schema import ProfileResponseSchema, RegisterSchema, UserRead, LoginSchema
from app.schemas.Athlete_schema import AthleteCreate, AthleteUpdate, AthleteRead
from app.service import Auth_service as auth_service
from app.core.security import (
    JWT_REFRESH_TOKEN_EXPIRE_DAYS,
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_SECRET,
    JWT_ALGORITHM,
    create_access_token,
    create_refresh_token,
    verify_token,
    blacklist_token,
    is_token_blacklisted
)
from app.core.dependecy import get_current_user_id
from app.service import User_service

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)

@router.post('/register', response_model=UserRead)
async def register(data: RegisterSchema, db: AsyncSession = Depends(get_db)):
    return await auth_service.register_user(data, db)

@router.post('/login')
async def login(data: LoginSchema, response: Response, db: AsyncSession = Depends(get_db)):
    user = await auth_service.login_user(data, db)

    access_token = create_access_token(user.email, user.id)
    refresh_token = create_refresh_token(user.email, user.id)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=JWT_REFRESH_TOKEN_EXPIRE_DAYS * 60 * 60 * 24,
        path="/",
        secure=False,
        samesite="lax"
    )

    return {
        "access_token": access_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "nickname": user.nickname,
            "role": user.role,
            "image": user.image,
            "created_at": user.created_at,
            "is_admin": user.is_admin,
        }
    }

@router.post('/logout')
async def logout(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token:
        blacklist_token(refresh_token)

    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        path="/",
        secure=False,
        samesite="lax"
    )
    return {"detail": "Uspješno ste se odjavili"}

@router.post('/refresh')
async def refresh(request: Request):
    print("SVE COOKIJE:", request.cookies)
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Nema refresh tokena")

    if is_token_blacklisted(refresh_token):
        raise HTTPException(status_code=401, detail="Token je invalidiran")

    payload = verify_token(refresh_token)

    email = payload.get("sub")
    user_id = payload.get("id")

    new_access_token = create_access_token(email, user_id)
    return {"access_token": new_access_token}

@router.get('/me', response_model=UserRead)
async def get_current_user_data(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):

    try:
        uuid_id = user_id
    except ValueError:
        raise HTTPException(status_code=400, detail="Nevažeći ID korisnika")

    user = await User_service.get_user_by_id(uuid_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return user

@router.get('/me/session')
async def get_session(request: Request, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="Nema sesije")

    if is_token_blacklisted(refresh_token):
        raise HTTPException(status_code=401, detail="Token je invalidiran")

    payload = verify_token(refresh_token)

    email = payload.get("sub")
    user_id = payload.get("id")

    new_access_token = create_access_token(email, user_id)

    user = await User_service.get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")

    return {
        "access_token": new_access_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "nickname": user.nickname,
            "role": user.role,
            "image": user.image,
            "created_at": user.created_at,
            "is_admin": user.is_admin,
        }
    }