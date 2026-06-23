
from datetime import datetime
import json
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Query, Response, UploadFile, status, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from websockets import Router
from app.database import get_db
from app.models.Post import PostVisibility
from app.schemas.Post_schema import PaginationPostsResponse, PostRead, PostCreate
from app.service import Post_service
from app.core.dependecy import get_current_user_id, get_optional_user_id
from app.schemas.Comments_schema import CommentsCreate, CommentsRead, CommentsReadReply

router = APIRouter(
    prefix="/post",
    tags=["post"],
)

@router.post('/create', response_model=PostRead)
async def create_post(
    content: str = Form(...),
    visibility: PostVisibility = Form(PostVisibility.PUBLIC),
    images: List[Optional[UploadFile]] = File(None),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)

):
    return await Post_service.create_post(db, content, images, user_id, visibility)

@router.patch("/{post_id}/post", response_model=PostRead)
async def edit_post(
    post_id: UUID,
    content: str = Form(...),
    deleted_image_ids: str = Form("[]"),
    images: List[UploadFile] = File([]),
    db: AsyncSession = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    deleted_ids = json.loads(deleted_image_ids)
    print("Usao ")
    return await Post_service.edit_post(
        db,
        post_id,
        content,
        images,
        deleted_ids,
        user_id
    )
@router.get('/by-user-nickname/{nickname}', response_model=List[PostRead])
async def get_posts_by_user_id(
    nickname: str,
    db: AsyncSession = Depends(get_db),
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    viewer_id: UUID | None = Depends(get_optional_user_id),
):
    return await Post_service.get_posts_by_user_id(db, nickname, offset, limit, viewer_id)

@router.get('/by-id/{post_id}', response_model=PostRead)
async def get_post_by_uuid(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    viewer_id: UUID | None = Depends(get_optional_user_id),
):
    return await Post_service.get_post_by_uuid(db, post_id, viewer_id)

@router.get('/random', response_model=List[PostRead])
async def get_random_posts(limit: int = 10, offset: int = 0, db: AsyncSession = Depends(get_db)):
    return await Post_service.get_random_posts(db, limit, offset)

@router.get('/posts', response_model=PaginationPostsResponse)
async def get_posts(
    cursor: datetime | None = Query(None),
    db: AsyncSession = Depends(get_db),
    viewer_id: UUID | None = Depends(get_optional_user_id),
):
    return await Post_service.get_posts(db, cursor, viewer_id)

@router.post('/like')
async def like_post(post_id: UUID, db: AsyncSession = Depends(get_db), current_user_id: UUID = Depends(get_current_user_id)):
    return await Post_service.like_post(db, post_id, current_user_id)

@router.delete('/like')
async def delete_like(post_id: UUID, db: AsyncSession = Depends(get_db), current_user_id: UUID = Depends(get_current_user_id)):
    return await Post_service.delete_like(db, current_user_id, post_id)

@router.get("/feed", response_model=PaginationPostsResponse)
async def get_feed(
    cursor: Optional[str] = Query(None, description="Kursor za paginaciju (score|id)"),
    db: AsyncSession = Depends(get_db),
    viewer_id: UUID | None = Depends(get_optional_user_id),
):
    return await Post_service.get_algorithmic_feed(db, cursor, viewer_id)

@router.post("/comment")
async def add_comment(
    post_id: UUID,
    data: CommentsCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id)

):
    return await Post_service.add_comment(db, post_id, data.content, current_user_id)

@router.delete("/comment/{comment_id}")
async def delete_comment(
    comment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id)
):
    try:
        return await Post_service.delete_comment(db, comment_id, current_user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Komentar ne postoji ili ga nije moguće obrisati")

@router.get("/comments/{post_id}", response_model=List[CommentsRead])
async def get_comments_by_post_id(post_id: UUID, db: AsyncSession = Depends(get_db)):
    try:
        return await Post_service.get_comments_by_post_id(db, post_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Došlo je do greške pri dohvaćanju komentara")

@router.post("/comment/reply/{comment_id}/{post_id}")
async def add_comment_reply(
    comment_id: UUID,
    post_id: UUID,
    data: CommentsCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id)

):
    return await Post_service.add_comment_reply(db, comment_id, data.content, post_id, current_user_id)

@router.get("/comment/reply/{comment_id}", response_model=List[CommentsRead])
async def get_comment_replies(
    comment_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    return await Post_service.get_comment_replies(db, comment_id)

@router.delete('/comment/reply/{comment_id}')
async def delete_comment_reply(
    comment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id)
):
    return await Post_service.delete_comment_reply(db, comment_id, current_user_id)

@router.delete("/delete/{post_id}")
async def delete_post(post_id: UUID, db: AsyncSession = Depends(get_db), current_user_id: UUID = Depends(get_current_user_id)):
    return await Post_service.delete_post(db, post_id, current_user_id)

@router.get("/friends-feed", response_model=PaginationPostsResponse)
async def get_following_feed(
    limit: int = 10,
    cursor: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id)
):

    return await Post_service.get_following_feed(db, current_user_id, limit, cursor)