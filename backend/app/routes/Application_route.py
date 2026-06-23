from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Query, Response, UploadFile, status, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from websockets import Router
from app.database import get_db
from app.core.dependecy import get_current_user_id
from app.schemas.Application_schema import ApplicationCreate, ApplicationUpdate,  ApplicationResponse, ApplicationReadByAdvertisement
from app.service import Application_service

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE_MB = 5

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_application(
    advertisement_id: UUID = Form(...),
    cover_letter: str = Form(...),
    youtube_url: str | None = Form(default=None),
    cv_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: UUID = Depends(get_current_user_id),
):
    if cv_file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="CV mora biti PDF ili Word dokument (.pdf, .doc, .docx).",
        )

    content = await cv_file.read()
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"CV ne smije biti veći od {MAX_FILE_SIZE_MB}MB.",
        )
    await cv_file.seek(0)

    return await Application_service.create_application(
        db=db,
        advertisement_id=advertisement_id,
        cover_letter=cover_letter,
        youtube_url=youtube_url,
        cv_file=cv_file,
        cv_content=content,
        current_user_id=current_user,
    )
@router.get("/get-application/{application_id}", status_code=status.HTTP_200_OK, response_model=ApplicationResponse)
async def get_application(application_id: UUID, db: AsyncSession = Depends(get_db)):
    return await Application_service.get_application(db, application_id)

@router.get("/get-applications-by-advertisement/{advertisement_id}", status_code=status.HTTP_200_OK , response_model=List[ApplicationReadByAdvertisement])
async def get_applications_by_advertisement(advertisement_id: UUID, db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await Application_service.get_applications_by_advertisement(db, advertisement_id, current_user)

@router.delete("/delete-application/{application_id}", status_code=status.HTTP_200_OK)
async def delete_application(application_id: UUID, db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await Application_service.delete_application(db, application_id, current_user)

@router.put("/accept-application/{application_id}", status_code=status.HTTP_200_OK)
async def accept_application_status(application_id: UUID, db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await Application_service.accept_application_status(db, application_id, current_user)

@router.put("/reject-application/{application_id}", status_code=status.HTTP_200_OK)
async def reject_application_status(application_id: UUID, db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await Application_service.reject_application_status(db, application_id, current_user)

@router.get("/my-applications", status_code=status.HTTP_200_OK )
async def get_applications_by_user( db: AsyncSession = Depends(get_db), current_user: UUID = Depends(get_current_user_id)):
    return await Application_service.get_applications_by_user(db, current_user)