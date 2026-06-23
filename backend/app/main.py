from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import engine, Base, get_db
import os
from pathlib import Path
from app.routes.Auth_route import router as auth_router
from app.routes.Sports_route import router as sports_router
from app.routes.Position_router import router as position_router
from app.routes.User_route import router as user_router
from app.routes.Post_route import router as post_router
from app.routes.Follow_route import router as follow_router
from app.routes.Advertisments_route import router as advertisement_router
from app.routes.Application_route import router as application_router
from app.routes.Chat_route import router as chat_router
from app.routes.ChatMessages_route import router as chat_messages_router
from app.routes.Notification_route import router as notification_router
from app.routes.Admin_route import router as admin_router
from app.routes.Report_route import router as report_router
from app.routes.FriendRequest_route import router as friend_request_router
from app.routes.Location_route import router as location_router
from app.service.Email_service import EmailService

from app import models
from app.migration_ad_requirements import migrate_advertisement_requirements
from app.seed_locations import seed_locations

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)

from sqlalchemy import text

@asynccontextmanager
async def lifespan(app: FastAPI):

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text(
            "ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public' NOT NULL"
        ))
        await conn.execute(text(
            "UPDATE posts SET visibility = lower(visibility) WHERE visibility <> lower(visibility)"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false NOT NULL"
        ))
        await conn.execute(text(
            "ALTER TABLE notifications ALTER COLUMN notification_type TYPE VARCHAR(50)"
        ))
        await conn.execute(text(
            "ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS requirement_type VARCHAR(50)"
        ))
        await conn.execute(text(
            "ALTER TABLE clubs ADD COLUMN IF NOT EXISTS league VARCHAR(255)"
        ))
        await conn.execute(text(
            "ALTER TABLE clubs ADD COLUMN IF NOT EXISTS founded_year INTEGER"
        ))
        await conn.execute(text(
            "ALTER TABLE clubs ADD COLUMN IF NOT EXISTS home_venue VARCHAR(255)"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image VARCHAR(255)"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS match_preferences TEXT"
        ))
        await conn.execute(text(
            "ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS embedding DOUBLE PRECISION[]"
        ))
        await conn.execute(text(
            "ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS embedding_model VARCHAR(100)"
        ))

        for col, ddl in [
            ("weight", "INTEGER"),
            ("dominant_side", "VARCHAR(50)"),
            ("experience_years", "INTEGER"),
            ("experience_level", "VARCHAR(100)"),
            ("current_club", "VARCHAR(255)"),
            ("preferred_league", "VARCHAR(255)"),
            ("availability", "VARCHAR(255)"),
            ("citizenship", "VARCHAR(255)"),
        ]:
            await conn.execute(text(
                f"ALTER TABLE athletes ADD COLUMN IF NOT EXISTS {col} {ddl}"
            ))

        for col, ddl in [
            ("license", "VARCHAR(255)"),
            ("years_exp", "INTEGER"),
            ("team_category", "VARCHAR(255)"),
            ("preferred_club_level", "VARCHAR(255)"),
            ("availability", "VARCHAR(255)"),
            ("open_to_relocation", "BOOLEAN"),
        ]:
            await conn.execute(text(
                f"ALTER TABLE coaches ADD COLUMN IF NOT EXISTS {col} {ddl}"
            ))

        for col, ddl in [
            ("years_exp", "INTEGER"),
            ("scouting_type", "VARCHAR(255)"),
            ("network_level", "VARCHAR(255)"),
            ("availability", "VARCHAR(255)"),
        ]:
            await conn.execute(text(
                f"ALTER TABLE scouts ADD COLUMN IF NOT EXISTS {col} {ddl}"
            ))

        for col, ddl in [
            ("fitness_level", "VARCHAR(255)"),
            ("age_group", "VARCHAR(255)"),
            ("goals", "VARCHAR(255)"),
            ("sport", "VARCHAR(255)"),
        ]:
            await conn.execute(text(
                f"ALTER TABLE recreationals ADD COLUMN IF NOT EXISTS {col} {ddl}"
            ))

    await migrate_advertisement_requirements()
    await seed_locations()
    yield

app = FastAPI(title="AthletiQ", lifespan=lifespan)

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_router)
app.include_router(sports_router)
app.include_router(position_router)
app.include_router(user_router)
app.include_router(post_router)
app.include_router(follow_router)
app.include_router(advertisement_router)
app.include_router(application_router)
app.include_router(chat_router)
app.include_router(chat_messages_router)
app.include_router(notification_router)
app.include_router(admin_router)
app.include_router(report_router)
app.include_router(friend_request_router)
app.include_router(location_router)

@app.get("/")
def read_root():
    return {"message": "Pozdrav sa FastAPI backenda!"}

@app.get("/test-db")
async def test_db(db: AsyncSession = Depends(get_db)):
    return {"status": "Uspješna konekcija na bazu"}

@app.post("/test-email")
async def test_email(email: str):
    try:
       await EmailService.send_notification_email(
            recipient_email=email,
            subject="Test email",
            body="<h1>Radi!</h1><p>Ovo je testna notifikacija.</p>"
        )
       return {"message": "Email poslan uspješno"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))