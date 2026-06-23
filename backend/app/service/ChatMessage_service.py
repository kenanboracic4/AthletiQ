from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repository import ChatMessages_repository as chat_messages_repo
from app.repository import Chat_repository as chat_repo
from app.schemas.ChatMessages_schema import ChatMessageCreate

async def create_chat_message(db: AsyncSession, data: ChatMessageCreate, current_user: UUID):

    chat = await chat_repo.get_chat_by_uuid(db, data.chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat ne postoji!")

    if current_user not in (chat.first_user_id, chat.second_user_id):
        raise HTTPException(status_code=403, detail="Niste učesnik ovog chata!")

    chat_message_dict = {
        "chat_id": data.chat_id,
        "sender_id": current_user,
        "content": data.content,
    }
    return await chat_messages_repo.create_chat_message(db, chat_message_dict)

async def get_chat_message_by_uuid(db: AsyncSession, chat_message_id: UUID, current_user: UUID):
    message = await chat_messages_repo.get_chat_message_by_uuid(db, chat_message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Poruka ne postoji!")
    return message

async def delete_chat_message(db: AsyncSession, chat_message_id: UUID, current_user: UUID):
    message = await chat_messages_repo.get_chat_message_by_uuid(db, chat_message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Poruka ne postoji!")

    if message.sender_id != current_user:
        raise HTTPException(status_code=403, detail="Možete brisati samo svoje poruke!")

    return await chat_messages_repo.delete_chat_message(db, chat_message_id)

async def get_chat_messages_by_chat_id(db: AsyncSession, chat_id: UUID, current_user: UUID):

    chat = await chat_repo.get_chat_by_uuid(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat ne postoji!")

    if current_user not in (chat.first_user_id, chat.second_user_id):
        raise HTTPException(status_code=403, detail="Niste učesnik ovog chata!")

    return await chat_messages_repo.get_chat_messages_by_chat_id(db, chat_id)

async def mark_messages_as_read(db: AsyncSession, chat_id: UUID, current_user: UUID):

    chat = await chat_repo.get_chat_by_uuid(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat ne postoji!")

    if current_user not in (chat.first_user_id, chat.second_user_id):
        raise HTTPException(status_code=403, detail="Niste učesnik ovog chata!")

    count = await chat_messages_repo.mark_messages_as_read(db, chat_id, current_user)
    return {"marked_as_read": count}