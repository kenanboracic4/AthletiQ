from sqlalchemy import text

from app.database import AsyncSessionLocal
from app.repository import Advertisement_requirements_repository as requirements_repo

async def _requirements_column_exists(session) -> bool:
    result = await session.execute(text(
        "SELECT 1 FROM information_schema.columns "
        "WHERE table_name = 'advertisements' AND column_name = 'requirements'"
    ))
    return result.first() is not None

async def migrate_advertisement_requirements():
    async with AsyncSessionLocal() as session:
        if not await _requirements_column_exists(session):
            return

        rows = await session.execute(text(
            "SELECT a.id, u.role, a.target_roles, a.requirements "
            "FROM advertisements a JOIN users u ON u.id = a.creator_id "
            "WHERE a.requirement_type IS NULL AND a.requirements IS NOT NULL"
        ))

        for ad_id, role, target_roles, requirements in rows.all():
            target = target_roles[0] if target_roles else None
            requirement_type = requirements_repo.compute_requirement_type(role, target)

            if requirement_type:
                await requirements_repo.create_requirements(
                    session, ad_id, requirement_type, requirements or {}
                )

            await session.execute(
                text(
                    "UPDATE advertisements SET requirement_type = :rt WHERE id = :id"
                ),
                {"rt": requirement_type, "id": ad_id},
            )

        await session.commit()

        await session.execute(text(
            "ALTER TABLE advertisements DROP COLUMN IF EXISTS requirements"
        ))
        await session.commit()
