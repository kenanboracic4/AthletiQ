from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, delete, func, select, update
from sqlalchemy.orm import selectinload
from app.models.ChatMessage import ChatMessage

async def create_chat_message(db: AsyncSession, chat_message_dict: dict) -> ChatMessage:
    db_chat_message = ChatMessage(**chat_message_dict)
    db.add(db_chat_message)
    await db.commit()
    await db.refresh(db_chat_message)
    return db_chat_message

async def get_chat_message_by_uuid(db: AsyncSession, chat_message_id: UUID) -> Optional[ChatMessage]:
    query = (
        select(ChatMessage)
        .where(ChatMessage.id == chat_message_id)
        .options(selectinload(ChatMessage.sender))
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def delete_chat_message(db: AsyncSession, chat_message_id: UUID) -> int:
    query = delete(ChatMessage).where(ChatMessage.id == chat_message_id)
    result = await db.execute(query)
    await db.commit()
    return int(result.rowcount)

async def get_chat_messages_by_chat_id(db: AsyncSession, chat_id: UUID) -> list[ChatMessage]:
    query = (
        select(ChatMessage)
        .where(ChatMessage.chat_id == chat_id)
        .options(selectinload(ChatMessage.sender))
        .order_by(ChatMessage.created_at.asc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())

async def mark_messages_as_read(db: AsyncSession, chat_id: UUID, reader_id: UUID) -> int:

    query = (
        update(ChatMessage)
        .where(
            ChatMessage.chat_id == chat_id,
            ChatMessage.sender_id != reader_id,
            ChatMessage.is_read == False,
        )
        .values(is_read=True)
    )
    result = await db.execute(query)
    await db.commit()
    return int(result.rowcount)

async def get_unread_count_for_chats(db: AsyncSession, user_id: UUID) -> dict[UUID, int]:
    query = (
        select(ChatMessage.chat_id, func.count(ChatMessage.id).label("unread"))
        .where(
            and_(
                ChatMessage.sender_id != user_id,
                ChatMessage.is_read == False
            )
        )
        .group_by(ChatMessage.chat_id)
    )
    result = await db.execute(query)
    return {row.chat_id: row.unread for row in result.fetchall()}