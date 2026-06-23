"""
AI matching između korisnika i oglasa na berzi.

Za svakog korisnika gradimo tekstualni profil, pretvaramo ga u vektor i
poredimo (kosinusna sličnost) sa vektorima oglasa koji ciljaju njegovu ulogu.
Rezultat je lista oglasa sortirana po procentu poklapanja.
"""

from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.Advertisements import Advertisement
from app.models.User_model import User
from app.repository import Advertisement_repository as advertisement_repo
from app.repository import Advertisement_requirements_repository as requirements_repo
from app.repository import User_repository as user_repo
from app.schemas.User_schema import UserRole, parse_user_role
from app.service import Embedding_service
from app.service import Structured_match

def _role_label(role) -> str:
    try:
        return parse_user_role(role).value
    except Exception:
        return str(role)

def build_advertisement_text(ad: Advertisement, requirements: Optional[dict]) -> str:
    parts: List[str] = []
    if ad.title:
        parts.append(f"Naslov oglasa: {ad.title}")
    if ad.description:
        parts.append(f"Opis: {ad.description}")
    if ad.sport:
        parts.append(f"Sport: {ad.sport}")
    if ad.location:
        parts.append(f"Lokacija: {ad.location}")

    if ad.target_roles:
        targets = ", ".join(_role_label(r) for r in ad.target_roles)
        parts.append(f"Namijenjeno ulogama: {targets}")

    for key, value in (requirements or {}).items():
        if value in (None, "", [], {}):
            continue
        if isinstance(value, (list, tuple)):
            value = ", ".join(str(v) for v in value if v not in (None, ""))
            if not value:
                continue
        parts.append(f"{key.replace('_', ' ')}: {value}")

    return "\n".join(parts)

def _career_text(user: User) -> List[str]:
    lines: List[str] = []
    for entry in getattr(user, "career_entries", []) or []:
        bits = [entry.role_title, entry.organization, entry.location, entry.description]
        bits = [b for b in bits if b]
        if bits:
            lines.append("Karijera: " + " - ".join(bits))
    for ach in getattr(user, "achievements", []) or []:
        bits = [ach.title, str(ach.year) if ach.year else None, ach.description]
        bits = [b for b in bits if b]
        if bits:
            lines.append("Dostignuće: " + " - ".join(bits))
    return lines

def build_user_profile_text(user: User) -> str:
    parts: List[str] = []
    role = parse_user_role(user.role)
    parts.append(f"Uloga: {role.value}")

    athlete = getattr(user, "athlete", None)
    coach = getattr(user, "coach", None)
    scout = getattr(user, "scout", None)
    club = getattr(user, "club", None)
    recreational = getattr(user, "recreational", None)

    if athlete:
        parts.append(f"Ime: {athlete.full_name}")
        if athlete.sport:
            parts.append(f"Sport: {athlete.sport.name}")
        if athlete.position:
            parts.append(f"Pozicija: {athlete.position.name}")
        if athlete.location:
            parts.append(f"Lokacija: {athlete.location}")
        if athlete.height:
            parts.append(f"Visina: {athlete.height} cm")
        if athlete.weight:
            parts.append(f"Težina: {athlete.weight} kg")
        if athlete.dominant_side:
            parts.append(f"Dominantna strana: {athlete.dominant_side}")
        if athlete.birth_date:
            parts.append(f"Datum rođenja: {athlete.birth_date}")
        if athlete.experience_level:
            parts.append(f"Nivo iskustva: {athlete.experience_level}")
        if athlete.experience_years:
            parts.append(f"Godina iskustva: {athlete.experience_years}")
        if athlete.current_club:
            parts.append(f"Trenutni klub: {athlete.current_club}")
        if athlete.preferred_league:
            parts.append(f"Željena liga: {athlete.preferred_league}")
        if athlete.availability:
            parts.append(f"Dostupnost: {athlete.availability}")
        if athlete.citizenship:
            parts.append(f"Državljanstvo: {athlete.citizenship}")
        if athlete.bio:
            parts.append(f"Bio: {athlete.bio}")

    if coach:
        parts.append(f"Ime: {coach.full_name}")
        if coach.sport:
            parts.append(f"Sport: {coach.sport.name}")
        if coach.philosophy:
            parts.append(f"Filozofija: {coach.philosophy}")
        if coach.experience:
            parts.append(f"Iskustvo: {coach.experience}")
        if coach.license:
            parts.append(f"Licenca: {coach.license}")
        if coach.years_exp:
            parts.append(f"Godina iskustva: {coach.years_exp}")
        if coach.team_category:
            parts.append(f"Kategorija tima: {coach.team_category}")
        if coach.preferred_club_level:
            parts.append(f"Željeni nivo kluba: {coach.preferred_club_level}")
        if coach.availability:
            parts.append(f"Dostupnost: {coach.availability}")
        if coach.open_to_relocation is not None:
            parts.append(f"Spreman na selidbu: {'Da' if coach.open_to_relocation else 'Ne'}")
        for cert in getattr(coach, "certifications", []) or []:
            bits = [cert.title, cert.issuer, str(cert.year) if cert.year else None]
            bits = [b for b in bits if b]
            if bits:
                parts.append("Certifikat: " + " - ".join(bits))

    if scout:
        parts.append(f"Ime: {scout.full_name}")
        if scout.organization:
            parts.append(f"Organizacija: {scout.organization}")
        if scout.sought_position:
            parts.append(f"Traženi profil: {scout.sought_position}")
        if scout.sport:
            parts.append(f"Sport: {scout.sport.name}")
        if scout.years_exp:
            parts.append(f"Godina iskustva: {scout.years_exp}")
        if scout.scouting_type:
            parts.append(f"Tip skautinga: {scout.scouting_type}")
        if scout.network_level:
            parts.append(f"Nivo mreže kontakata: {scout.network_level}")
        if scout.availability:
            parts.append(f"Dostupnost: {scout.availability}")
        for region in getattr(scout, "regions", []) or []:
            if region.region_name:
                parts.append(f"Regija praćenja: {region.region_name}")

    if club:
        parts.append(f"Klub: {club.club_name}")
        if club.sport:
            parts.append(f"Sport: {club.sport.name}")
        if club.location:
            parts.append(f"Lokacija: {club.location}")
        if club.league:
            parts.append(f"Liga: {club.league}")
        if club.description:
            parts.append(f"Opis: {club.description}")
        for trophy in getattr(club, "trophies", []) or []:
            bits = [trophy.title, trophy.competition, str(trophy.year) if trophy.year else None]
            bits = [b for b in bits if b]
            if bits:
                parts.append("Trofej: " + " - ".join(bits))

    if recreational:
        parts.append(f"Ime: {recreational.full_name}")
        if recreational.location:
            parts.append(f"Lokacija: {recreational.location}")
        if recreational.description:
            parts.append(f"Opis: {recreational.description}")
        if recreational.sport:
            parts.append(f"Sport: {recreational.sport}")
        if recreational.fitness_level:
            parts.append(f"Nivo kondicije: {recreational.fitness_level}")
        if recreational.age_group:
            parts.append(f"Uzrasna grupa: {recreational.age_group}")
        if recreational.goals:
            parts.append(f"Ciljevi: {recreational.goals}")

    parts.extend(_career_text(user))

    if getattr(user, "match_preferences", None):
        parts.append(f"Šta korisnik traži: {user.match_preferences}")

    return "\n".join(parts)

async def ensure_advertisement_embedding(
    db: AsyncSession, ad: Advertisement, commit: bool = True
) -> List[float]:
    """
    Vraća embedding oglasa. Ako ne postoji ili je nastao drugim modelom,
    ponovo ga izračuna i sačuva u bazi.
    """
    active_tag = Embedding_service.active_model_tag()
    if ad.embedding and ad.embedding_model == active_tag:
        return ad.embedding

    requirements = await requirements_repo.build_requirements_dict(db, ad)
    text = build_advertisement_text(ad, requirements)
    embedding, model_tag = await Embedding_service.generate_embedding(text)

    ad.embedding = embedding
    ad.embedding_model = model_tag
    if commit:
        await db.commit()
    return embedding

async def get_recommended_advertisements(
    db: AsyncSession, user_id: UUID, limit: int = 20
):
    user = await user_repo.get_user_with_profile_by_id(db, user_id)
    if not user:
        return []

    role = parse_user_role(user.role)

    ads = await advertisement_repo.get_advertisements_for_role(db, role, exclude_creator_id=user_id)
    if not ads:
        return []

    user_text = build_user_profile_text(user)
    user_embedding, _ = await Embedding_service.generate_embedding(user_text)

    results = []
    needs_commit = False
    for ad in ads:
        active_tag = Embedding_service.active_model_tag()
        if not (ad.embedding and ad.embedding_model == active_tag):
            await ensure_advertisement_embedding(db, ad, commit=False)
            needs_commit = True

        cosine = Embedding_service.cosine_similarity(user_embedding, ad.embedding or [])
        semantic_norm = _normalize_cosine(cosine)

        await requirements_repo.attach_requirements(db, ad)
        structured_score, criteria = Structured_match.evaluate(
            ad.requirement_type, ad, getattr(ad, "requirements", {}) or {}, user
        )

        if structured_score is not None:
            blended = 0.6 * structured_score + 0.4 * semantic_norm
        else:
            blended = semantic_norm

        percentage = max(1, min(99, round(blended * 100)))

        ad.match_percentage = percentage
        ad.match_score = round(cosine, 4)
        ad.match_reasons = criteria
        results.append(ad)

    if needs_commit:
        await db.commit()

    results.sort(key=lambda a: a.match_percentage, reverse=True)
    return results[:limit]

def _normalize_cosine(cosine: float) -> float:
    lo, hi = 0.25, 0.9
    return max(0.0, min(1.0, (cosine - lo) / (hi - lo)))
