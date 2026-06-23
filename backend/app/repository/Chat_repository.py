from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select

from app.models.ChatMessage import ChatMessage
from ..models.Chat import Chat
from sqlalchemy import delete, select, or_, and_
from sqlalchemy.orm import selectinload

async def create_chat(db: AsyncSession, chat_dict: dict) -> Chat:
    db_chat = Chat(**chat_dict)
    db.add(db_chat)
    await db.commit()
    await db.refresh(db_chat)
    return db_chat

async def get_chat_by_uuid(db: AsyncSession, chat_id: UUID) -> Optional[Chat]:
    query = (
        select(Chat)
        .where(Chat.id == chat_id)
        .options(
            selectinload(Chat.first_user),
            selectinload(Chat.second_user),
            selectinload(Chat.messages).selectinload(ChatMessage.sender),
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def delete_chat(db: AsyncSession, chat_id: UUID):
    query = (
        delete(Chat)
        .where(Chat.id == chat_id)
    )
    result = await db.execute(query)
    await db.commit()
    return int(result.rowcount)

async def get_chat_by_users(db: AsyncSession, first_user_id: UUID, second_user_id: UUID) -> Optional[Chat]:
    query = select(Chat).where(
        or_(
            and_(Chat.first_user_id == first_user_id, Chat.second_user_id == second_user_id),
            and_(Chat.first_user_id == second_user_id, Chat.second_user_id == first_user_id),
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_user_chats(db: AsyncSession, user_id: UUID) -> list[Chat]:
    query = (
        select(Chat)
        .where(
            or_(Chat.first_user_id == user_id, Chat.second_user_id == user_id)
        )
        .options(
            selectinload(Chat.first_user),
            selectinload(Chat.second_user),
            selectinload(Chat.messages),
        )
        .order_by(Chat.created_at.desc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())
