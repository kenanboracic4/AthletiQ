from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.dependecy import get_current_user_id
from app.schemas.Chat_schema import ChatCreate, ChatRead, ChatRead
from app.service import Chat_service

router = APIRouter(
    prefix="/chat",
    tags=["chats"],
)

@router.get("/by-id/{chat_id}", status_code=status.HTTP_200_OK, response_model=ChatRead)
async def get_chat_by_id(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await Chat_service.get_chat_by_uuid(db, chat_id, current_user)

@router.get("/by-user", status_code=status.HTTP_200_OK, response_model=List[ChatRead])
async def get_chats_by_user(
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):

    chats = await Chat_service.get_user_chats(db, current_user)
    unread_count = await Chat_service.get_unread_count(db, current_user)

    result = []
    for chat in chats:
        chat_data = ChatRead.model_validate(chat)
        chat_data.unread_count = unread_count.get(chat.id, 0)
        result.append(chat_data)

    return result

@router.post("/create", status_code=status.HTTP_201_CREATED, response_model=ChatRead)
async def create_chat(
    data: ChatCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id)
):
    return await Chat_service.create_chat(db, data, current_user)

@router.delete("/delete-chat/{chat_id}", status_code=status.HTTP_200_OK)
async def delete_chat(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await Chat_service.delete_chat(db, chat_id, current_user)

@router.get(
    "/by-users/{second_user_id}",
    status_code=status.HTTP_200_OK,
    response_model=ChatRead,
)
async def get_chat_by_users(
    second_user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await Chat_service.get_chat_by_users(db, current_user, second_user_id)