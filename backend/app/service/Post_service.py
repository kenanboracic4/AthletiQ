
from datetime import datetime
import os
import shutil
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.Post import PostVisibility

from app.repository import Post_repository as post_repo
from app.repository import Like_repository as like_repo
from app.repository import Comment_repository as comment_repo
from app.repository import FriendRequest_repository as friend_repo

from app.repository.Post_repository import PAGE_SIZE
from app.schemas.Comments_schema import CommentsCreate
from app.repository import User_repository
from app.service import Notification_service as notification_service

async def create_post(
    db: AsyncSession,
    content: str,
    images: List[Optional[UploadFile]],
    current_user_id: UUID,
    visibility: PostVisibility = PostVisibility.PUBLIC,
):
    created_post = await post_repo.create_post(
        db,
        {
            "content": content,
            "user_id": current_user_id,
            "visibility": visibility,
        },
    )

    if images:
        for image in images:
            if not image or not image.filename:
                continue
            file_extension = os.path.splitext(image.filename)[1]
            if file_extension not in [".jpg", ".png", ".jpeg", ".webp", ".svg"]:
                raise HTTPException(status_code=400, detail="Dozvoljeni formati su JPG, PNG, JPEG, WEBP i SVG")

            unique_file_name = f"{uuid4()}{file_extension}"
            upload_dir = "uploads/posts"
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, unique_file_name)

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            image_url = f"/uploads/posts/{unique_file_name}"
            await post_repo.add_image(db, created_post.id, image_url)

    await db.commit()

    return await post_repo.get_post_by_id(db, created_post.id)

async def edit_post(
    db: AsyncSession,
    post_id: UUID,
    content: str,
    images: List[UploadFile],
    deleted_image_ids: List[UUID],
    current_user_id: UUID
):
    existing = await post_repo.get_post_by_id(
        db,
        post_id
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Post ne postoji!"
        )

    if existing.user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Niste ovlašteni za uređivanje ovog posta!"
        )

    if images:
        for image in images:

            if not image or not image.filename:
                continue

            file_extension = (
                os.path.splitext(image.filename)[1]
                .lower()
            )

            if file_extension not in [
                ".jpg",
                ".png",
                ".jpeg",
                ".webp",
                ".svg"
            ]:
                raise HTTPException(
                    status_code=400,
                    detail="Dozvoljeni formati su JPG, PNG, JPEG, WEBP i SVG"
                )

            unique_file_name = (
                f"{uuid4()}{file_extension}"
            )

            upload_dir = "uploads/posts"

            os.makedirs(
                upload_dir,
                exist_ok=True
            )

            file_path = os.path.join(
                upload_dir,
                unique_file_name
            )

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(
                    image.file,
                    buffer
                )

            image_url = (
                f"/uploads/posts/{unique_file_name}"
            )

            await post_repo.add_image(
                db,
                post_id,
                image_url
            )

    for image_id in deleted_image_ids:

        img_obj = await post_repo.get_image_by_id(
            db,
            image_id
        )

        if not img_obj:
            continue

        if img_obj.post_id != post_id:
            continue

        file_path = img_obj.image_url.lstrip("/")

        if os.path.exists(file_path):
            os.remove(file_path)

        await post_repo.delete_image(
            db,
            post_id,
            img_obj.id
        )

    await post_repo.update_post(
        db,
        post_id,
        content
    )

    await db.commit()

    return await post_repo.get_post_by_id(
        db,
        post_id
    )

async def delete_post(db: AsyncSession, post_id: UUID, current_user_id: UUID):
    existing = await post_repo.get_post_by_id(db, post_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Post ne postoji!")
    return await post_repo.delete_post(db, post_id, current_user_id)

async def get_post_by_uuid(db: AsyncSession, post_id: UUID, viewer_id: Optional[UUID] = None):
    post = await post_repo.get_post_by_uuid(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post ne postoji!")
    if not await post_repo.can_view_post(db, post, viewer_id):
        raise HTTPException(status_code=403, detail="Nemate pristup ovoj objavi!")
    return post

async def get_posts_by_user_id(
    db: AsyncSession,
    nickname: str,
    offset: int,
    limit: int,
    viewer_id: Optional[UUID] = None,
):
    user = await User_repository.get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik ne postoji!")

    if user.is_private and viewer_id != user.id:
        if viewer_id is None or not await friend_repo.are_friends(db, viewer_id, user.id):
            return []

    return await post_repo.get_posts_by_user_id(db, user.id, offset, limit, viewer_id)

async def get_random_posts(db: AsyncSession, limit: int = 10, offset: int = 0):
    return await post_repo.get_random_posts(db, limit, offset)

async def like_post(db: AsyncSession, post_id: UUID, current_user_id: UUID):
    existing = await like_repo.get_like(db, post_id, current_user_id)
    post = await post_repo.get_post_by_id(db, post_id)
    if existing:
        return existing

    await post_repo.like_post(db, post_id)
    await notification_service.create_notification(db, {"recipient_id": post.user_id, "sender_id": current_user_id, "notification_type": "like"})
    rows = await like_repo.create_like(db, {"post_id": post_id, "user_id": current_user_id})
    if rows == 0:
        raise HTTPException(status_code=404, detail="Oznaka sviđa nije uspješno dodana!")
    return rows

async def delete_like(db: AsyncSession, user_id: UUID, post_id: UUID):
    existing = await like_repo.get_like(db, post_id, user_id)
    if not existing:
        return 0

    await post_repo.delete_like(db, post_id)
    rows_deleted = await like_repo.delete_like(db, user_id, post_id)
    if rows_deleted == 0:
        raise HTTPException(status_code=404, detail="Oznaka sviđa mi se nije uklonjena!")
    return rows_deleted

async def get_posts(db: AsyncSession, cursor: datetime | None = Query(None), viewer_id: Optional[UUID] = None):
    posts = await post_repo.get_posts(db, cursor, viewer_id)

    has_more = len(posts) > PAGE_SIZE
    posts = posts[:PAGE_SIZE]
    next_cursor = None

    if posts and has_more:
        next_cursor = posts[-1].created_at.isoformat()
    return {
        "items": posts,
        "has_more": has_more,
        "next_cursor": next_cursor
    }

async def get_algorithmic_feed(db: AsyncSession, cursor: Optional[str] = None, viewer_id: Optional[UUID] = None) -> dict:

    posts = await post_repo.get_posts_algorithmic(db, cursor=cursor, limit=PAGE_SIZE + 1, viewer_id=viewer_id)

    has_more = len(posts) > PAGE_SIZE

    posts_to_return = posts[:PAGE_SIZE]

    next_cursor = None
    if posts_to_return and has_more:
        last_post = posts_to_return[-1]

        next_cursor = f"{last_post.algorithmic_score}|{last_post.id}"

    return {
        "items": posts_to_return,
        "has_more": has_more,
        "next_cursor": next_cursor
    }

async def add_comment(db: AsyncSession, post_id: UUID, content: CommentsCreate, user_id: UUID):

    post = await post_repo.get_post_by_uuid(db, post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post nije pronađen!")

    print(post)
    print(user_id)

    if post.user_id != user_id:
        await notification_service.create_notification(db, {
            "recipient_id": post.user_id,
            "sender_id": user_id,
            "notification_type": 'comment',
            "post_id": post_id,
        })

    return await comment_repo.create_comment(db, {
        "post_id": post_id,
        "user_id": user_id,
        "content": content
    })

async def delete_comment(db: AsyncSession, comment_id: UUID, user_id: UUID):
    return await comment_repo.delete_comment(db, comment_id, user_id)

async def get_comments_by_post_id(db: AsyncSession, post_id: UUID):
    return await comment_repo.get_comments_by_post_id(db, post_id)

async def add_comment_reply(db: AsyncSession, comment_id: UUID, content: str, post_id: UUID, user_id: UUID):
    await notification_service.create_notification(db, {"recipient_id": user_id, "sender_id": user_id, "notification_type": "comment"})
    existing = await comment_repo.get_comment_by_id(db, comment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Komentar ne postoji!")

    return await comment_repo.create_comment_reply(db, {"user_id": user_id, "content": content, "parent_comment_id": comment_id, "post_id": post_id})

async def get_comment_replies(db: AsyncSession, comment_id: UUID):
    comment = await comment_repo.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Komentar ne postoji!")

    return await comment_repo.get_comment_replies(db, comment_id)

async def delete_comment_reply(db: AsyncSession, comment_id: UUID, user_id: UUID):
    existing = await comment_repo.get_comment_by_id(db, comment_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Komentar ne postoji!")

    return await comment_repo.delete_comment_reply(db, comment_id, user_id)

async def get_following_feed(
    db: AsyncSession,
    user_id: UUID,
    limit: int = 10,
    cursor: Optional[datetime] = None
):

    return await post_repo.get_following_feed(db, user_id, limit, cursor)