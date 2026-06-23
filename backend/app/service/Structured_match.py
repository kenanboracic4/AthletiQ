"""
Strukturirano poređenje oglasa i korisničkog profila.

Za svaki tip oglasa (npr. klub traži sportistu) poredimo konkretne uslove iz
oglasa (godine, visina, pozicija, licenca, iskustvo...) sa podacima koje je
korisnik unio na profil. Rezultat je lista kriterija sa oznakom da li su
zadovoljeni i ukupan strukturirani skor (0..1).

Ovaj skor se kombinuje sa semantičkim (vektorskim) skorom u Matching_service.
"""

from __future__ import annotations

from datetime import date
from typing import List, Optional

def _norm(value) -> str:
    return str(value).strip().lower() if value not in (None, "") else ""

def _str_overlap(a, b) -> bool:
    na, nb = _norm(a), _norm(b)
    if not na or not nb:
        return False
    return na == nb or na in nb or nb in na

def _to_int(value) -> Optional[int]:
    if value in (None, ""):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None

def _calc_age(birth_date) -> Optional[int]:
    if not birth_date:
        return None
    if isinstance(birth_date, str):
        try:
            birth_date = date.fromisoformat(birth_date[:10])
        except ValueError:
            return None
    today = date.today()
    age = today.year - birth_date.year
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1
    return age

def _criterion(label: str, ok: bool, detail: str, weight: float = 1.0, missing: bool = False):
    return {"label": label, "ok": ok, "detail": detail, "weight": weight, "missing": missing}

def _user_sport(user) -> Optional[str]:
    athlete = getattr(user, "athlete", None)
    coach = getattr(user, "coach", None)
    scout = getattr(user, "scout", None)
    club = getattr(user, "club", None)
    recreational = getattr(user, "recreational", None)
    if athlete and athlete.sport:
        return athlete.sport.name
    if coach and coach.sport:
        return coach.sport.name
    if scout and scout.sport:
        return scout.sport.name
    if club and club.sport:
        return club.sport.name
    if recreational and recreational.sport:
        return recreational.sport
    return None

def _user_location(user) -> Optional[str]:
    athlete = getattr(user, "athlete", None)
    club = getattr(user, "club", None)
    recreational = getattr(user, "recreational", None)
    if athlete and athlete.location:
        return athlete.location
    if club and club.location:
        return club.location
    if recreational and recreational.location:
        return recreational.location
    return None

def _sport_criterion(ad_sport, user, criteria):
    user_sport = _user_sport(user)
    if ad_sport:
        if not user_sport:
            criteria.append(_criterion("Sport", False, "Sport nije unesen na profil", weight=2.0, missing=True))
        else:
            ok = _str_overlap(ad_sport, user_sport)
            criteria.append(_criterion("Sport", ok, f"{ad_sport} ↔ {user_sport}", weight=2.0))

def _location_criterion(ad_location, user, criteria, label="Lokacija"):
    user_loc = _user_location(user)
    if ad_location and user_loc:
        ok = _str_overlap(ad_location, user_loc)
        criteria.append(_criterion(label, ok, f"{ad_location} ↔ {user_loc}"))

def _age_criterion(age_min, age_max, athlete, criteria):
    if age_min is None and age_max is None:
        return
    age = _calc_age(getattr(athlete, "birth_date", None))
    lo, hi = _to_int(age_min), _to_int(age_max)
    rng = f"{lo or '?'}–{hi or '?'} god."
    if age is None:
        criteria.append(_criterion("Godine", False, f"Traženo {rng}, godine nepoznate", weight=1.5, missing=True))
        return
    ok = (lo is None or age >= lo) and (hi is None or age <= hi)
    criteria.append(_criterion("Godine", ok, f"{age} god. (traženo {rng})", weight=1.5))

def _height_criterion(height_min, athlete, criteria):
    hmin = _to_int(height_min)
    if hmin is None:
        return
    h = getattr(athlete, "height", None)
    if not h:
        criteria.append(_criterion("Visina", False, f"Traženo min {hmin} cm, nije uneseno", missing=True))
        return
    criteria.append(_criterion("Visina", h >= hmin, f"{h} cm (min {hmin} cm)"))

def _str_criterion(label, ad_value, user_value, criteria, weight=1.0):
    if not ad_value:
        return
    if user_value in (None, ""):
        criteria.append(_criterion(label, False, f"Traženo: {ad_value}, nije uneseno", weight=weight, missing=True))
        return
    ok = _str_overlap(ad_value, user_value)
    criteria.append(_criterion(label, ok, f"{user_value} (traženo: {ad_value})", weight=weight))

def _min_years_criterion(label, req_years, user_years, criteria):
    ymin = _to_int(req_years)
    if ymin is None:
        return
    uy = _to_int(user_years)
    if uy is None:
        criteria.append(_criterion(label, False, f"Traženo min {ymin} god. iskustva, nije uneseno", missing=True))
        return
    criteria.append(_criterion(label, uy >= ymin, f"{uy} god. (min {ymin})"))

def evaluate(requirement_type: Optional[str], ad, requirements: dict, user) -> tuple[Optional[float], List[dict]]:
    """
    Vraća (structured_score 0..1 ili None, lista_kriterija).
    None znači da za ovaj tip nemamo strukturiranih kriterija (samo semantika).
    """
    req = requirements or {}
    criteria: List[dict] = []

    athlete = getattr(user, "athlete", None)
    coach = getattr(user, "coach", None)
    scout = getattr(user, "scout", None)
    recreational = getattr(user, "recreational", None)

    _sport_criterion(ad.sport, user, criteria)

    if requirement_type in ("club_athlete", "scout_athlete") and athlete:
        _str_criterion("Pozicija", req.get("position"),
                       athlete.position.name if athlete.position else None, criteria, weight=1.5)
        _age_criterion(req.get("age_min"), req.get("age_max"), athlete, criteria)
        _height_criterion(req.get("height_min_cm"), athlete, criteria)
        _str_criterion("Državljanstvo", req.get("citizenship"), athlete.citizenship, criteria)
        _str_criterion("Iskustvo", req.get("min_experience"), athlete.experience_level, criteria)
        _str_criterion("Liga", req.get("league_level"), athlete.preferred_league, criteria)
        _location_criterion(ad.location, user, criteria)

    elif requirement_type == "coach_athlete" and athlete:
        _str_criterion("Nivo", req.get("target_level"), athlete.experience_level, criteria)
        _location_criterion(req.get("training_location") or ad.location, user, criteria)

    elif requirement_type == "club_coach" and coach:
        _str_criterion("Licenca", req.get("license"), coach.license, criteria, weight=1.5)
        _min_years_criterion("Iskustvo", req.get("min_years_exp"), coach.years_exp, criteria)
        _str_criterion("Kategorija tima", req.get("team_category"), coach.team_category, criteria)
        _location_criterion(ad.location, user, criteria)

    elif requirement_type == "club_scout" and scout:
        _str_criterion("Tip skautinga", req.get("scouting_type"), scout.scouting_type, criteria)
        _str_criterion("Mreža kontakata", req.get("network_level"), scout.network_level, criteria)
        _min_years_criterion("Iskustvo", req.get("scouting_exp"), scout.years_exp, criteria)

    elif requirement_type == "coach_recreational_athlete" and recreational:
        _str_criterion("Nivo kondicije", req.get("fitness_level"), recreational.fitness_level, criteria)
        _str_criterion("Uzrasna grupa", req.get("age_group"), recreational.age_group, criteria)
        _location_criterion(req.get("training_location") or ad.location, user, criteria)

    else:

        _location_criterion(ad.location, user, criteria)

    if not criteria:
        return None, []

    total_weight = sum(c["weight"] for c in criteria)
    matched_weight = sum(c["weight"] for c in criteria if c["ok"])
    score = matched_weight / total_weight if total_weight else None
    return score, criteria
