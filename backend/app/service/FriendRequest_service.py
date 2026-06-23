from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.FriendRequest_model import FriendRequestStatus
from app.repository import FriendRequest_repository as friend_repo
from app.repository import User_repository as user_repo
from app.service import Notification_service as notification_service

async def get_friendship_status(db: AsyncSession, current_user_id: UUID, target_id: UUID) -> str:
    if current_user_id == target_id:
        return "self"

    request = await friend_repo.get_request_between(db, current_user_id, target_id)
    if not request:
        return "none"

    if request.status == FriendRequestStatus.ACCEPTED:
        return "friends"

    if request.status == FriendRequestStatus.PENDING:
        if request.sender_id == current_user_id:
            return "request_sent"
        return "request_received"

    return "none"

async def send_request(db: AsyncSession, sender_id: UUID, nickname: str):
    target_user = await user_repo.get_user_by_nickname(db, nickname)
    if not target_user:
        raise HTTPException(status_code=404, detail="Korisnik kojem želite poslati zahtjev ne postoji!")

    receiver_id = target_user.id
    if sender_id == receiver_id:
        raise HTTPException(status_code=400, detail="Ne možete poslati zahtjev sami sebi!")

    existing = await friend_repo.get_request_between(db, sender_id, receiver_id)

    if existing:
        if existing.status == FriendRequestStatus.ACCEPTED:
            raise HTTPException(status_code=400, detail="Već ste prijatelji!")
        if existing.status == FriendRequestStatus.PENDING:
            if existing.sender_id == sender_id:
                raise HTTPException(status_code=400, detail="Zahtjev je već poslan!")
            raise HTTPException(status_code=400, detail="Ovaj korisnik vam je već poslao zahtjev!")

        existing.sender_id = sender_id
        existing.receiver_id = receiver_id
        await friend_repo.update_status(db, existing, FriendRequestStatus.PENDING)
    else:
        await friend_repo.create_request(db, sender_id, receiver_id)

    await notification_service.create_notification(db, {
        "recipient_id": receiver_id,
        "sender_id": sender_id,
        "notification_type": "friend_request",
    })

    await db.commit()
    return {"status": "request_sent", "detail": "Zahtjev za prijateljstvo je poslan!"}

async def accept_request(db: AsyncSession, current_user_id: UUID, nickname: str):
    sender_user = await user_repo.get_user_by_nickname(db, nickname)
    if not sender_user:
        raise HTTPException(status_code=404, detail="Korisnik ne postoji!")

    request = await friend_repo.get_pending_request(db, sender_user.id, current_user_id)
    if not request:
        raise HTTPException(status_code=404, detail="Zahtjev za prijateljstvo ne postoji!")

    await friend_repo.update_status(db, request, FriendRequestStatus.ACCEPTED)

    await notification_service.create_notification(db, {
        "recipient_id": sender_user.id,
        "sender_id": current_user_id,
        "notification_type": "friend_accept",
    })

    await db.commit()
    return {"status": "friends", "detail": "Zahtjev za prijateljstvo je prihvaćen!"}

async def decline_request(db: AsyncSession, current_user_id: UUID, nickname: str):
    sender_user = await user_repo.get_user_by_nickname(db, nickname)
    if not sender_user:
        raise HTTPException(status_code=404, detail="Korisnik ne postoji!")

    request = await friend_repo.get_pending_request(db, sender_user.id, current_user_id)
    if not request:
        raise HTTPException(status_code=404, detail="Zahtjev za prijateljstvo ne postoji!")

    await friend_repo.delete_request(db, request.id)
    await db.commit()
    return {"status": "none", "detail": "Zahtjev za prijateljstvo je odbijen!"}

async def cancel_request(db: AsyncSession, current_user_id: UUID, nickname: str):
    target_user = await user_repo.get_user_by_nickname(db, nickname)
    if not target_user:
        raise HTTPException(status_code=404, detail="Korisnik ne postoji!")

    request = await friend_repo.get_pending_request(db, current_user_id, target_user.id)
    if not request:
        raise HTTPException(status_code=404, detail="Zahtjev za prijateljstvo ne postoji!")

    await friend_repo.delete_request(db, request.id)
    await db.commit()
    return {"status": "none", "detail": "Zahtjev za prijateljstvo je povučen!"}

async def remove_friend(db: AsyncSession, current_user_id: UUID, nickname: str):
    target_user = await user_repo.get_user_by_nickname(db, nickname)
    if not target_user:
        raise HTTPException(status_code=404, detail="Korisnik ne postoji!")

    request = await friend_repo.get_request_between(db, current_user_id, target_user.id)
    if not request or request.status != FriendRequestStatus.ACCEPTED:
        raise HTTPException(status_code=404, detail="Niste prijatelji s ovim korisnikom!")

    await friend_repo.delete_request(db, request.id)
    await db.commit()
    return {"status": "none", "detail": "Uklonili ste korisnika iz prijatelja!"}

async def get_incoming_requests(db: AsyncSession, current_user_id: UUID):
    return await friend_repo.get_incoming_pending(db, current_user_id)
