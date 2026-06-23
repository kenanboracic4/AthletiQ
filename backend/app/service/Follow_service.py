
from datetime import datetime
from hmac import new
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import HTTPException
from sqlmodel import desc
from app.repository import Follow_repository as follow_repo
from sqlalchemy.ext.asyncio import AsyncSession
from app.service import Notification_service as notification_service

from app.repository import User_repository as user_repo

async def create_follow(db: AsyncSession, follower_id: UUID, nickname: str):
    target_user = await  user_repo.get_user_by_nickname(db, nickname)

    if not target_user:
        raise HTTPException(status_code=404, detail="Korisnik kojeg želite zapratiti ne postoji! ")
    following_id = target_user.id

    if follower_id == following_id:

        raise HTTPException(status_code=400, detail="Ne možete zapratiti sami sebe!")

    exsiting_follow = await follow_repo.get_follow(db, follower_id, following_id)

    if exsiting_follow:

        delete_follow = await follow_repo.delete_follow(db, follower_id, following_id)

        if delete_follow == 0:

            raise HTTPException(status_code=404, detail="Nije moguće ukloniti zapisnik!")

        await db.commit()

        return {"status": "unfollow", "detail": "Uspješno ste otpratili korisnika !"}

    new_follow = await follow_repo.create_follow(db, {"follower_id": follower_id, "following_id": following_id})
    await notification_service.create_notification(db, {"recipient_id": following_id, "sender_id": follower_id, "notification_type": "follow"})

    await db.commit()

    return {"status": "follow", "detail": "Uspješno ste zapratili korisnika !"}

async def get_following_list(db: AsyncSession, nickname: str, limit: int = 10, cursor: Optional[datetime] = None):
    user = await user_repo.get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="Greška prilikom traženja korisnika!")
    following_list = await follow_repo.get_following_list(db, user.id, limit, cursor)
    return following_list

async def get_followers_list(db: AsyncSession, nickname: str, limit: int = 10, cursor: Optional[datetime] = None):
    user = await user_repo.get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="Greška prilikom traženja korisnika!")
    followers_list = await follow_repo.get_followers_list(db, user.id, limit, cursor)
    return followers_list

async def search_following_users(db: AsyncSession, search_query: str, nickname: str):
    user = await user_repo.get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="Greška prilikom traženja korisnika!")

    return await follow_repo.search_following_users(db, search_query, user.id)

async def search_followers(db: AsyncSession, search_query: str, nickname: str):
    user = await user_repo.get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="Greška prilikom traženja korisnika!")

    return await follow_repo.search_followers(db, search_query, user.id)