from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.Location_model import Location

BOSNIA_LOCATIONS = [
    "Sarajevo",
    "Mostar",
    "Tuzla",
    "Zenica",
    "Banja Luka",
    "Bihać",
    "Brčko",
    "Cazin",
    "Konjic",
    "Trebinje",
    "Doboj",
    "Prijedor",
    "Bijeljina",
    "Travnik",
    "Goražde",
    "Kakanj",
    "Visoko",
    "Livno",
    "Gradačac",
    "Čapljina",
    "Jajce",
    "Bugojno",
    "Modriča",
    "Zvornik",
    "Foča",
]

async def seed_locations():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Location.name))
        existing = {row[0] for row in result.all()}

        for name in BOSNIA_LOCATIONS:
            if name not in existing:
                session.add(Location(name=name))

        await session.commit()
