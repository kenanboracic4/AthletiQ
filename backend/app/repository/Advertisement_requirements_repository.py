from typing import Optional
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.Advertisements import Advertisement
from app.models.Advertisement_requirements_model import (
    ReqClubAthlete,
    ReqClubAthleteAttachment,
    ReqClubCoach,
    ReqClubCoachCertification,
    ReqClubScout,
    ReqClubScoutRegion,
    ReqCoachClub,
    ReqCoachClubAchievement,
    ReqCoachAthlete,
    ReqCoachAthleteService,
    ReqCoachRecreational,
    ReqCoachRecreationalService,
    ReqScoutClub,
    ReqScoutClubRegion,
    ReqScoutClubAchievement,
    ReqScoutAthlete,
    ReqScoutAthleteAttribute,
    ReqAthleteClub,
    ReqAthleteClubHighlight,
    ReqAthleteScout,
    ReqAthleteScoutStrength,
    ReqAthleteCoach,
    ReqAthleteCoachGoal,
)

REQUIREMENT_REGISTRY = {
    "club_athlete": {
        "model": ReqClubAthlete,
        "scalars": {
            "age_min": "int",
            "age_max": "int",
            "position": "str",
            "height_min_cm": "int",
            "min_experience": "str",
            "salary_range_km": "str",
            "match_bonuses": "str",
            "accommodation_provided": "bool",
        },
        "lists": {"mandatory_attachments": ReqClubAthleteAttachment},
    },
    "club_coach": {
        "model": ReqClubCoach,
        "scalars": {
            "license": "str",
            "min_years_exp": "int",
            "team_category": "str",
            "salary_range_km": "str",
            "contract_type": "str",
            "relocation_package": "bool",
        },
        "lists": {"required_certifications": ReqClubCoachCertification},
    },
    "club_scout": {
        "model": ReqClubScout,
        "scalars": {
            "scouting_exp": "str",
            "network_level": "str",
            "scouting_type": "str",
            "compensation": "str",
            "employment_type": "str",
        },
        "lists": {"coverage_regions": ReqClubScoutRegion},
    },
    "coach_club": {
        "model": ReqCoachClub,
        "scalars": {
            "license": "str",
            "years_exp": "int",
            "preferred_club_level": "str",
            "expected_salary_km": "str",
            "availability": "str",
            "open_to_relocation": "bool",
        },
        "lists": {"career_achievements": ReqCoachClubAchievement},
    },
    "coach_athlete": {
        "model": ReqCoachAthlete,
        "scalars": {
            "program_duration": "str",
            "max_group_size": "int",
            "target_level": "str",
            "training_location": "str",
            "price_per_player_km": "int",
            "payment_type": "str",
        },
        "lists": {"included_services": ReqCoachAthleteService},
    },
    "coach_recreational_athlete": {
        "model": ReqCoachRecreational,
        "scalars": {
            "program_duration": "str",
            "max_group_size": "int",
            "fitness_level": "str",
            "age_group": "str",
            "price_per_player_km": "int",
            "training_schedule": "str",
        },
        "lists": {"included_services": ReqCoachRecreationalService},
    },
    "scout_club": {
        "model": ReqScoutClub,
        "scalars": {
            "years_exp": "int",
            "scouting_type": "str",
            "network_level": "str",
            "expected_compensation": "str",
            "availability": "str",
        },
        "lists": {
            "coverage_regions": ReqScoutClubRegion,
            "career_achievements": ReqScoutClubAchievement,
        },
    },
    "scout_athlete": {
        "model": ReqScoutAthlete,
        "scalars": {
            "position": "str",
            "age_min": "int",
            "age_max": "int",
            "citizenship": "str",
            "league_level": "str",
            "availability": "str",
            "required_documents": "str",
            "agency_note": "str",
        },
        "lists": {"key_attributes": ReqScoutAthleteAttribute},
    },
    "athlete_club": {
        "model": ReqAthleteClub,
        "scalars": {
            "position": "str",
            "age": "int",
            "height_cm": "int",
            "weight_kg": "int",
            "dominant_side": "str",
            "current_club": "str",
            "experience": "str",
            "availability": "str",
            "preferred_league": "str",
            "profile_link": "str",
        },
        "lists": {"highlights": ReqAthleteClubHighlight},
    },
    "athlete_scout": {
        "model": ReqAthleteScout,
        "scalars": {
            "position": "str",
            "age": "int",
            "height_cm": "int",
            "citizenship": "str",
            "experience": "str",
            "video_link": "str",
            "profile_link": "str",
            "career_goal": "str",
        },
        "lists": {"key_strengths": ReqAthleteScoutStrength},
    },
    "athlete_coach": {
        "model": ReqAthleteCoach,
        "scalars": {
            "current_level": "str",
            "age": "int",
            "training_city": "str",
            "budget_km": "int",
            "training_type": "str",
            "additional_info": "str",
        },
        "lists": {"training_goals": ReqAthleteCoachGoal},
    },
}

def _to_int(value):
    if value is None or value == "":
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None

def _to_bool(value):
    if isinstance(value, bool):
        return value
    if value is None or value == "":
        return False
    return str(value).strip().lower() in {"true", "1", "da", "yes", "on"}

def _to_str(value):
    if value is None:
        return None
    text = str(value).strip()
    return text or None

def _cast(kind: str, value):
    if kind == "int":
        return _to_int(value)
    if kind == "bool":
        return _to_bool(value)
    return _to_str(value)

from app.schemas.User_schema import UserRole, parse_user_role

def compute_requirement_type(creator_role, target_role) -> Optional[str]:
    if creator_role is None or target_role is None:
        return None
    try:
        creator = parse_user_role(creator_role)
        target = parse_user_role(target_role)
    except ValueError:
        return None
    requirement_type = f"{creator.name.lower()}_{target.name.lower()}"
    return requirement_type if requirement_type in REQUIREMENT_REGISTRY else None

async def create_requirements(
    db: AsyncSession,
    advertisement_id: UUID,
    requirement_type: Optional[str],
    requirements: Optional[dict],
):
    config = REQUIREMENT_REGISTRY.get(requirement_type or "")
    if not config:
        return None

    requirements = requirements or {}

    scalar_values = {
        field: _cast(kind, requirements.get(field))
        for field, kind in config["scalars"].items()
    }

    parent = config["model"](advertisement_id=advertisement_id, **scalar_values)
    db.add(parent)
    await db.flush()

    for field, child_model in config["lists"].items():
        raw_values = requirements.get(field) or []
        if not isinstance(raw_values, (list, tuple)):
            raw_values = [raw_values]
        for raw in raw_values:
            value = _to_str(raw)
            if value:
                db.add(child_model(parent_id=parent.id, value=value))

    await db.flush()
    return parent

async def _get_parent(db: AsyncSession, advertisement_id: UUID, requirement_type: str):
    config = REQUIREMENT_REGISTRY[requirement_type]
    result = await db.execute(
        select(config["model"]).where(
            config["model"].advertisement_id == advertisement_id
        )
    )
    return result.scalar_one_or_none()

async def build_requirements_dict(db: AsyncSession, advertisement: Advertisement) -> dict:
    requirement_type = advertisement.requirement_type
    config = REQUIREMENT_REGISTRY.get(requirement_type or "")
    if not config:
        return {}

    parent = await _get_parent(db, advertisement.id, requirement_type)
    if not parent:
        return {}

    data = {field: getattr(parent, field) for field in config["scalars"].keys()}

    for field, child_model in config["lists"].items():
        result = await db.execute(
            select(child_model.value)
            .where(child_model.parent_id == parent.id)
            .order_by(child_model.id)
        )
        data[field] = [row[0] for row in result.all()]

    return data

async def delete_requirements(
    db: AsyncSession, advertisement_id: UUID, requirement_type: Optional[str]
):
    config = REQUIREMENT_REGISTRY.get(requirement_type or "")
    if not config:
        return
    await db.execute(
        delete(config["model"]).where(
            config["model"].advertisement_id == advertisement_id
        )
    )
    await db.flush()

async def attach_requirements(db: AsyncSession, advertisement: Advertisement):
    advertisement.requirements = await build_requirements_dict(db, advertisement)
    return advertisement
