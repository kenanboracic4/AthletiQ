from datetime import datetime
from typing import Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select, update
from sqlalchemy.orm import joinedload, selectinload

from app.models.Application_model import Application

async def create_application(db: AsyncSession, application_dict: dict):
    db_application = Application(**application_dict)
    db.add(db_application)
    await db.commit()
    await db.refresh(db_application)
    return db_application

async def get_application_by_id(db: AsyncSession, id: UUID):
    query = (
        select(Application)
        .options(joinedload(Application.advertisement))
        .where(Application.id == id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_applications_by_advertisement_user_id(db: AsyncSession, advertisement_id: UUID, user_id: UUID):
    query = (
        select(Application)
        .options(joinedload(Application.advertisement))
        .where(Application.advertisement_id == advertisement_id)
        .where(Application.user_id == user_id)
    )
    result = await db.execute(query)
    return result.scalars().first()

async def get_applications_by_advertisment(db: AsyncSession, advertisement_id: UUID):
    query = (
        select(Application)

        .options(joinedload(Application.user))
        .where(Application.advertisement_id == advertisement_id)
        .order_by(Application.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()

async def delete_application(db: AsyncSession, application_id: UUID):
    query = (
        delete(Application)
        .where(Application.id == application_id)
    )
    result = await db.execute(query)
    return result.rowcount

async def accept_application_status(db: AsyncSession, application_id: UUID):
    query = (
        update(Application)
        .where(Application.id == application_id)
        .values(status="ACCEPTED")
    )
    result = await db.execute(query)
    return result.rowcount

async def reject_application_status(db: AsyncSession, application_id: UUID):
    query = (
        update(Application)
        .where(Application.id == application_id)
        .values(status="REJECTED")
    )
    result = await db.execute(query)
    return result.rowcount

async def get_applications_by_user(db: AsyncSession, user_id: UUID):
    query = (
        select(Application)
        .options(joinedload(Application.advertisement))
        .where(Application.user_id == user_id)
    )
    result = await db.execute(query)
    return result.scalars().all()
