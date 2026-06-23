from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.User_model import User
from app.models.Club_model import Club
from app.models.Coach_model import Coach
from app.models.Scout_model import Scout
from app.models.Profile_extended_model import (
    ProfileCareerEntry,
    ProfileAchievement,
    ClubTrophy,
    CoachCertification,
    ScoutRegion,
)
from app.schemas.Profile_extended_schema import (
    CareerEntryWrite,
    AchievementWrite,
    TrophyWrite,
    CertificationWrite,
    ScoutRegionWrite,
)

async def load_user_extended_relations(db: AsyncSession, user: User) -> User:
    query = (
        select(User)
        .options(
            selectinload(User.career_entries),
            selectinload(User.achievements),
            selectinload(User.club).selectinload(Club.trophies),
            selectinload(User.coach).selectinload(Coach.certifications),
            selectinload(User.scout).selectinload(Scout.regions),
        )
        .where(User.id == user.id)
    )
    result = await db.execute(query)
    return result.scalars().first() or user

def serialize_extended_profile(user: User) -> dict:
    data = {
        "career_entries": [
            {
                "id": e.id,
                "organization": e.organization,
                "role_title": e.role_title,
                "location": e.location,
                "start_date": e.start_date,
                "end_date": e.end_date,
                "description": e.description,
                "is_current": e.is_current,
            }
            for e in (user.career_entries or [])
        ],
        "achievements": [
            {
                "id": a.id,
                "title": a.title,
                "year": a.year,
                "description": a.description,
            }
            for a in (user.achievements or [])
        ],
        "trophies": [],
        "certifications": [],
        "scout_regions": [],
    }

    if user.club and user.club.trophies:
        data["trophies"] = [
            {
                "id": t.id,
                "title": t.title,
                "competition": t.competition,
                "year": t.year,
            }
            for t in user.club.trophies
        ]

    if user.coach and user.coach.certifications:
        data["certifications"] = [
            {
                "id": c.id,
                "title": c.title,
                "issuer": c.issuer,
                "year": c.year,
            }
            for c in user.coach.certifications
        ]

    if user.scout and user.scout.regions:
        data["scout_regions"] = [
            {"id": r.id, "region_name": r.region_name}
            for r in user.scout.regions
        ]

    return data

async def sync_career_entries(
    db: AsyncSession, user_id: UUID, entries: list[CareerEntryWrite] | None
):
    if entries is None:
        return

    existing = (
        await db.execute(
            select(ProfileCareerEntry).where(ProfileCareerEntry.user_id == user_id)
        )
    ).scalars().all()
    existing_map = {e.id: e for e in existing}
    submitted_ids = {i.id for i in entries if i.id}
    keep_ids = set()

    for item in entries:
        payload = item.model_dump(exclude={"id"})
        if item.id and item.id in existing_map:
            row = existing_map[item.id]
            for key, val in payload.items():
                setattr(row, key, val)
            keep_ids.add(item.id)
        else:
            db.add(ProfileCareerEntry(user_id=user_id, **payload))

    for row in existing:
        if row.id not in keep_ids and row.id not in submitted_ids:
            await db.delete(row)

async def sync_achievements(
    db: AsyncSession, user_id: UUID, items: list[AchievementWrite] | None
):
    if items is None:
        return

    existing = (
        await db.execute(
            select(ProfileAchievement).where(ProfileAchievement.user_id == user_id)
        )
    ).scalars().all()
    existing_map = {a.id: a for a in existing}
    submitted_ids = {i.id for i in items if i.id}
    keep_ids = set()

    for item in items:
        payload = item.model_dump(exclude={"id"})
        if item.id and item.id in existing_map:
            row = existing_map[item.id]
            for key, val in payload.items():
                setattr(row, key, val)
            keep_ids.add(item.id)
        else:
            db.add(ProfileAchievement(user_id=user_id, **payload))

    for row in existing:
        if row.id not in keep_ids and row.id not in submitted_ids:
            await db.delete(row)

async def sync_trophies(
    db: AsyncSession, club_id: UUID, items: list[TrophyWrite] | None
):
    if items is None:
        return

    existing = (
        await db.execute(select(ClubTrophy).where(ClubTrophy.club_id == club_id))
    ).scalars().all()
    existing_map = {t.id: t for t in existing}
    submitted_ids = {i.id for i in items if i.id}
    keep_ids = set()

    for item in items:
        payload = item.model_dump(exclude={"id"})
        if item.id and item.id in existing_map:
            row = existing_map[item.id]
            for key, val in payload.items():
                setattr(row, key, val)
            keep_ids.add(item.id)
        else:
            db.add(ClubTrophy(club_id=club_id, **payload))

    for row in existing:
        if row.id not in keep_ids and row.id not in submitted_ids:
            await db.delete(row)

async def sync_certifications(
    db: AsyncSession, coach_id: UUID, items: list[CertificationWrite] | None
):
    if items is None:
        return

    existing = (
        await db.execute(
            select(CoachCertification).where(CoachCertification.coach_id == coach_id)
        )
    ).scalars().all()
    existing_map = {c.id: c for c in existing}
    submitted_ids = {i.id for i in items if i.id}
    keep_ids = set()

    for item in items:
        payload = item.model_dump(exclude={"id"})
        if item.id and item.id in existing_map:
            row = existing_map[item.id]
            for key, val in payload.items():
                setattr(row, key, val)
            keep_ids.add(item.id)
        else:
            db.add(CoachCertification(coach_id=coach_id, **payload))

    for row in existing:
        if row.id not in keep_ids and row.id not in submitted_ids:
            await db.delete(row)

async def sync_scout_regions(
    db: AsyncSession, scout_id: UUID, items: list[ScoutRegionWrite] | None
):
    if items is None:
        return

    existing = (
        await db.execute(select(ScoutRegion).where(ScoutRegion.scout_id == scout_id))
    ).scalars().all()
    existing_map = {r.id: r for r in existing}
    submitted_ids = {i.id for i in items if i.id}
    keep_ids = set()

    for item in items:
        if item.id and item.id in existing_map:
            existing_map[item.id].region_name = item.region_name
            keep_ids.add(item.id)
        else:
            db.add(ScoutRegion(scout_id=scout_id, region_name=item.region_name))

    for row in existing:
        if row.id not in keep_ids and row.id not in submitted_ids:
            await db.delete(row)

async def sync_extended_profile(db: AsyncSession, user: User, data: dict):
    role = user.role.name

    if role in ("ATHLETE", "COACH", "RECREATIONAL_ATHLETE"):
        entries = data.get("career_entries")
        if entries is not None:
            await sync_career_entries(
                db, user.id, [CareerEntryWrite(**e) for e in entries]
            )

    if role == "ATHLETE":
        achievements = data.get("achievements")
        if achievements is not None:
            await sync_achievements(
                db, user.id, [AchievementWrite(**a) for a in achievements]
            )

    if role == "CLUB" and user.club:
        trophies = data.get("trophies")
        if trophies is not None:
            await sync_trophies(
                db, user.club.id, [TrophyWrite(**t) for t in trophies]
            )

    if role == "COACH" and user.coach:
        certs = data.get("certifications")
        if certs is not None:
            await sync_certifications(
                db, user.coach.id, [CertificationWrite(**c) for c in certs]
            )

    if role == "SCOUT" and user.scout:
        regions = data.get("scout_regions")
        if regions is not None:
            await sync_scout_regions(
                db, user.scout.id, [ScoutRegionWrite(**r) for r in regions]
            )
