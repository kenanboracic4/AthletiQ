from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID
from fastapi import Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, text, update, func, literal_column, or_, and_, exists
from sqlalchemy.orm import joinedload, selectinload

from app.models.Follow_model import Follow
from app.models.FriendRequest_model import FriendRequest, FriendRequestStatus
from app.models.Post import Post, PostVisibility
from app.schemas.Post_schema import PaginationPostsResponse, PostRead

from ..models.PostLikes import PostLikes
from ..models.Post_images import Post_image
from ..models.Post_comments import Comments

PAGE_SIZE = 10

def build_visibility_filter(viewer_id: Optional[UUID]):
    public = Post.visibility == PostVisibility.PUBLIC

    if viewer_id is None:
        return public

    own = Post.user_id == viewer_id

    is_friend = exists(
        select(1).where(
            FriendRequest.status == FriendRequestStatus.ACCEPTED,
            or_(
                and_(FriendRequest.sender_id == viewer_id, FriendRequest.receiver_id == Post.user_id),
                and_(FriendRequest.sender_id == Post.user_id, FriendRequest.receiver_id == viewer_id),
            ),
        )
    )
    friends = and_(
        Post.visibility == PostVisibility.FRIENDS,
        is_friend,
    )

    return or_(public, own, friends)

async def can_view_post(db: AsyncSession, post: Post, viewer_id: Optional[UUID]) -> bool:
    if post.visibility == PostVisibility.PUBLIC:
        return True
    if viewer_id is None:
        return False
    if post.user_id == viewer_id:
        return True
    if post.visibility == PostVisibility.PRIVATE:
        return False
    friendship = await db.execute(
        select(FriendRequest.id).where(
            FriendRequest.status == FriendRequestStatus.ACCEPTED,
            or_(
                and_(FriendRequest.sender_id == viewer_id, FriendRequest.receiver_id == post.user_id),
                and_(FriendRequest.sender_id == post.user_id, FriendRequest.receiver_id == viewer_id),
            ),
        )
    )
    return friendship.scalar_one_or_none() is not None

async def get_post_by_id(db: AsyncSession, post_id: UUID) -> Post:
    result = await db.execute(
        select(Post)
        .options(
            joinedload(Post.user),
            selectinload(Post.likes).selectinload(PostLikes.user),
            selectinload(Post.images),
           selectinload(Post.comments.and_(Comments.parent_comment_id.is_(None))).selectinload(Comments.user)
        )
        .where(Post.id == post_id)
    )
    return result.scalar_one()

async def create_post(db: AsyncSession, post_dict: dict) -> Post:
    db_post = Post(**post_dict)
    db.add(db_post)
    await db.flush()
    return db_post

async def add_image(db: AsyncSession, post_id: UUID, image_url: str):
    db_images = Post_image(post_id=post_id, image_url=image_url)
    db.add(db_images)
    await db.commit()
    await db.refresh(db_images)
    return db_images

async def get_post_by_uuid(db: AsyncSession, post_id: UUID) -> Optional[Post]:
    query = (
        select(Post)
        .options(
            joinedload(Post.user),
            selectinload(Post.likes).selectinload(PostLikes.user),
            selectinload(Post.images),
           selectinload(Post.comments.and_(Comments.parent_comment_id.is_(None))).selectinload(Comments.user)
        )
        .where(Post.id == post_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_posts_by_user_id(
    db: AsyncSession,
    user_id: UUID,
    offset: int,
    limit: int,
    viewer_id: Optional[UUID] = None,
) -> list[Post]:
    query = (
        select(Post)
        .options(
            joinedload(Post.user),
            selectinload(Post.likes).selectinload(PostLikes.user),
            selectinload(Post.images),
            selectinload(Post.comments.and_(Comments.parent_comment_id.is_(None))).selectinload(Comments.user)
        )
        .where(Post.user_id == user_id)
        .where(build_visibility_filter(viewer_id))
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(query)
    return list(result.scalars().unique().all())

async def get_random_posts(db: AsyncSession, limit: int = 10, offset: int = 0) -> list[Post]:
    query = (
        select(Post)
        .options(
            joinedload(Post.user),
            selectinload(Post.likes).selectinload(PostLikes.user),
            selectinload(Post.images),
            selectinload(Post.comments.and_(Comments.parent_comment_id.is_(None))).selectinload(Comments.user)
        )
        .where(Post.visibility == PostVisibility.PUBLIC)
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(query)
    return list(result.scalars().unique().all())

async def like_post(db: AsyncSession, post_id: UUID):
    query = (
        update(Post)
        .where(Post.id == post_id)
        .values(likes_count=Post.likes_count + 1)
    )
    result = await db.execute(query)
    return int(result.rowcount)

async def delete_like(db: AsyncSession, post_id: UUID):
    query = (
        update(Post)
        .where(Post.id == post_id)
        .values(likes_count=Post.likes_count - 1)
    )
    result = await db.execute(query)
    return int(result.rowcount)

async def get_posts(db: AsyncSession, cursor: datetime | None, viewer_id: Optional[UUID] = None):
    query = (
        select(Post)
        .options(
            joinedload(Post.user),
            selectinload(Post.likes).selectinload(PostLikes.user),
            selectinload(Post.images),
           selectinload(Post.comments.and_(Comments.parent_comment_id.is_(None))).selectinload(Comments.user)
        )
        .where(build_visibility_filter(viewer_id))
        .order_by(Post.created_at.desc())
        .limit(PAGE_SIZE + 1)
    )
    if cursor:
        query = query.where(Post.created_at < cursor)

    result = await db.execute(query)
    posts = result.scalars().unique().all()
    return posts

async def get_posts_algorithmic(db: AsyncSession, cursor: str | None, limit: int, viewer_id: Optional[UUID] = None):

    vremenska_granica = datetime.utcnow() - timedelta(days=7)

    hours_old = func.extract("EPOCH", func.now() - Post.created_at) / 3600
    score_formula = (Post.likes_count / func.pow(hours_old + 2, 1.7))

    query = (
        select(Post, score_formula.label("score"))
        .options(
            joinedload(Post.user),
            selectinload(Post.likes).selectinload(PostLikes.user),
            selectinload(Post.images),
            selectinload(Post.comments.and_(Comments.parent_comment_id.is_(None))).selectinload(Comments.user)
        )
        .where(Post.created_at >= vremenska_granica)
        .where(build_visibility_filter(viewer_id))
    )

    if cursor:
        try:
            cursor_score_str, cursor_id_str = cursor.split("|")
            cursor_score = float(cursor_score_str)
            cursor_id = UUID(cursor_id_str)

            score_col = score_formula.label("score")
            query = query.where(
                (score_col < cursor_score) |
                ((score_col == cursor_score) & (Post.id < cursor_id))
            )
        except ValueError:
            pass

    query = query.order_by(score_formula.desc(), Post.id.desc()).limit(limit)

    result = await db.execute(query)

    posts_with_score = []

    for row in result.unique().all():
        post = row[0]
        post.algorithmic_score = row[1]
        posts_with_score.append(post)

    return posts_with_score

async def delete_post(db: AsyncSession, post_id: UUID, current_user_id: UUID):
    query = (
        delete(Post)
        .where(Post.id == post_id)
        .where(Post.user_id == current_user_id)

    )
    result = await db.execute(query)
    await db.commit()
    return int(result.rowcount)

async def update_post(db: AsyncSession, post_id: UUID, content: str):
    query = (
        update(Post)
        .where(Post.id == post_id)
        .values(content=content)

    )
    result = await db.execute(query)
    return int(result.rowcount)
async def delete_image(db: AsyncSession, post_id: UUID, image_id: UUID):
    query = (
        delete(Post_image)
        .where(Post_image.post_id == post_id)
        .where(Post_image.id == image_id)

    )
    result = await db.execute(query)
    return int(result.rowcount)

async def get_image_by_id(db: AsyncSession, id: UUID):
    query = (
        select(Post_image)
        .where(Post_image.id == id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()
async def get_following_feed(
    db: AsyncSession,
    user_id: UUID,
    limit: int = 10,
    cursor: Optional[datetime] = None
):
    follows = exists(
        select(1).where(
            Follow.follower_id == user_id,
            Follow.following_id == Post.user_id,
        )
    )
    is_friend = exists(
        select(1).where(
            FriendRequest.status == FriendRequestStatus.ACCEPTED,
            or_(
                and_(FriendRequest.sender_id == user_id, FriendRequest.receiver_id == Post.user_id),
                and_(FriendRequest.sender_id == Post.user_id, FriendRequest.receiver_id == user_id),
            ),
        )
    )

    query = (
        select(Post)
        .where(Post.user_id != user_id)
        .where(or_(follows, is_friend))
        .where(build_visibility_filter(user_id))
    )

    if cursor:
        query = query.where(Post.created_at < cursor)

    query = (
        query.order_by(Post.created_at.desc())
        .limit(limit)
        .options(
            joinedload(Post.user),
            selectinload(Post.likes).selectinload(PostLikes.user),
            selectinload(Post.images),
            selectinload(Post.comments.and_(Comments.parent_comment_id.is_(None))).selectinload(Comments.user)
        )
    )

    result = await db.execute(query)
    posts = result.scalars().unique().all()

    next_cursor = None
    if len(posts) == limit:
        next_cursor = posts[-1].created_at.isoformat()

    return PaginationPostsResponse(
        items=[PostRead.model_validate(p) for p in posts],
        has_more=len(posts) == limit,
        next_cursor=next_cursor
    )