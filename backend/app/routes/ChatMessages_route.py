import json
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.dependecy import get_current_user_id, get_current_user_id_from_token
from app.schemas.ChatMessages_schema import ChatMessageCreate, ChatMessageRead
from app.service import ChatMessage_service
from app.repository import ChatMessages_repository as chat_messages_repo
from app.repository import Chat_repository as chat_repo
from app.core.WebSocket import manager

router = APIRouter(
    prefix="/chat-messages",
    tags=["chat-messages"],
)

@router.get("/get-by-chat/{chat_id}", status_code=status.HTTP_200_OK, response_model=List[ChatMessageRead])
async def get_chat_messages(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await ChatMessage_service.get_chat_messages_by_chat_id(db, chat_id, current_user)

@router.get("/get-by-id/{message_id}", status_code=status.HTTP_200_OK, response_model=ChatMessageRead)
async def get_message_by_id(
    message_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await ChatMessage_service.get_chat_message_by_uuid(db, message_id, current_user)

@router.post("/send", status_code=status.HTTP_201_CREATED, response_model=ChatMessageRead)
async def send_message(
    data: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await ChatMessage_service.create_chat_message(db, data, current_user)

@router.delete("/delete/{message_id}", status_code=status.HTTP_200_OK)
async def delete_message(
    message_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await ChatMessage_service.delete_chat_message(db, message_id, current_user)

@router.patch("/mark-as-read/{chat_id}", status_code=status.HTTP_200_OK)
async def mark_as_read(
    chat_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    return await ChatMessage_service.mark_messages_as_read(db, chat_id, current_user)

@router.websocket("/ws/{chat_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    chat_id: UUID,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
):

    try:
        current_user = await get_current_user_id_from_token(token)
    except Exception:
        await websocket.close(code=1008)
        return

    chat = await chat_repo.get_chat_by_uuid(db, chat_id)
    if not chat or str(current_user) not in (str(chat.first_user_id), str(chat.second_user_id)):
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, str(chat_id))

    try:
        while True:

            data = await websocket.receive_text()

            message = await chat_messages_repo.create_chat_message(db, {
                "chat_id": chat_id,
                "sender_id": current_user,
                "content": data,
            })

            await manager.broadcast(
                json.dumps({
                    "id": str(message.id),
                    "chat_id": str(message.chat_id),
                    "sender_id": str(message.sender_id),
                    "content": message.content,
                    "is_read": message.is_read,
                    "created_at": str(message.created_at),
                }),
                str(chat_id),
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket, str(chat_id))