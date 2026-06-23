from typing import List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repository import Chat_repository as chat_repo
from app.schemas.Chat_schema import ChatCreate
from app.repository import ChatMessages_repository as chat_messages_repo

async def create_chat(db: AsyncSession, data: ChatCreate, current_user: UUID):

    if current_user not in (data.first_user_id, data.second_user_id):
        raise HTTPException(
            status_code=403,
            detail="Ne možete kreirati chat u ime drugog korisnika!",
        )

    if data.first_user_id == data.second_user_id:
        raise HTTPException(
            status_code=400,
            detail="Ne možete kreirati chat sa samim sobom!",
        )

    existing_chat = await chat_repo.get_chat_by_users(
        db, data.first_user_id, data.second_user_id
    )
    if existing_chat:
        return existing_chat

    chat_dict = {
        "first_user_id": data.first_user_id,
        "second_user_id": data.second_user_id,
        "advertisment_id": data.advertisment_id,
    }
    return await chat_repo.create_chat(db, chat_dict)

async def get_chat_by_uuid(db: AsyncSession, chat_id: UUID, current_user: UUID):
    chat = await chat_repo.get_chat_by_uuid(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat ne postoji!")

    if current_user not in (chat.first_user_id, chat.second_user_id):
        raise HTTPException(status_code=403, detail="Nemate pristup ovom chatu!")

    return chat

async def delete_chat(db: AsyncSession, chat_id: UUID, current_user: UUID):
    chat = await chat_repo.get_chat_by_uuid(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat ne postoji!")

    if current_user not in (chat.first_user_id, chat.second_user_id):
        raise HTTPException(
            status_code=403,
            detail="Nemate dozvolu za brisanje ovog chata!",
        )

    return await chat_repo.delete_chat(db, chat_id)

async def get_chat_by_users(
    db: AsyncSession, first_user_id: UUID, second_user_id: UUID
):
    chat = await chat_repo.get_chat_by_users(db, first_user_id, second_user_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat ne postoji!")
    return chat

async def get_user_chats(db: AsyncSession, user_id: UUID):
    return await chat_repo.get_user_chats(db, user_id)

async def get_unread_count(db: AsyncSession, user_id: UUID):
    return await chat_messages_repo.get_unread_count_for_chats(db, user_id)