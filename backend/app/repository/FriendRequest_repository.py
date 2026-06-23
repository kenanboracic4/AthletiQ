from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, func, or_, select
from sqlalchemy.orm import selectinload

from ..models.FriendRequest_model import FriendRequest, FriendRequestStatus
from ..models.User_model import User

async def create_request(db: AsyncSession, sender_id: UUID, receiver_id: UUID):
    db_request = FriendRequest(
        sender_id=sender_id,
        receiver_id=receiver_id,
        status=FriendRequestStatus.PENDING,
    )
    db.add(db_request)
    await db.flush()
    return db_request

async def get_request_by_id(db: AsyncSession, request_id: UUID):
    query = (
        select(FriendRequest)
        .where(FriendRequest.id == request_id)
        .options(
            selectinload(FriendRequest.sender),
            selectinload(FriendRequest.receiver),
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_request_between(db: AsyncSession, user_a: UUID, user_b: UUID):
    query = (
        select(FriendRequest)
        .where(
            or_(
                and_(FriendRequest.sender_id == user_a, FriendRequest.receiver_id == user_b),
                and_(FriendRequest.sender_id == user_b, FriendRequest.receiver_id == user_a),
            )
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_pending_request(db: AsyncSession, sender_id: UUID, receiver_id: UUID):
    query = (
        select(FriendRequest)
        .where(
            FriendRequest.sender_id == sender_id,
            FriendRequest.receiver_id == receiver_id,
            FriendRequest.status == FriendRequestStatus.PENDING,
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def are_friends(db: AsyncSession, user_a: UUID, user_b: UUID) -> bool:
    query = (
        select(FriendRequest.id)
        .where(
            FriendRequest.status == FriendRequestStatus.ACCEPTED,
            or_(
                and_(FriendRequest.sender_id == user_a, FriendRequest.receiver_id == user_b),
                and_(FriendRequest.sender_id == user_b, FriendRequest.receiver_id == user_a),
            ),
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none() is not None

async def update_status(db: AsyncSession, request: FriendRequest, status: FriendRequestStatus):
    request.status = status
    await db.flush()
    return request

async def delete_request(db: AsyncSession, request_id: UUID):
    query = delete(FriendRequest).where(FriendRequest.id == request_id)
    result = await db.execute(query)
    return int(result.rowcount)

async def get_incoming_pending(db: AsyncSession, user_id: UUID):
    query = (
        select(FriendRequest)
        .where(
            FriendRequest.receiver_id == user_id,
            FriendRequest.status == FriendRequestStatus.PENDING,
        )
        .options(selectinload(FriendRequest.sender))
        .order_by(FriendRequest.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()

async def get_friends_count(db: AsyncSession, user_id: UUID) -> int:
    query = (
        select(func.count(FriendRequest.id))
        .where(
            FriendRequest.status == FriendRequestStatus.ACCEPTED,
            or_(
                FriendRequest.sender_id == user_id,
                FriendRequest.receiver_id == user_id,
            ),
        )
    )
    result = await db.execute(query)
    return result.scalar() or 0
