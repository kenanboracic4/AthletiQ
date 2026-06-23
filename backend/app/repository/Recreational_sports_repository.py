from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from ..models.Recreational_sports_model import Recreational_sports

def create_recreational_sports(db: Session, recreational_sports_dict: dict) -> Recreational_sports:
    db_recreational_sports = Recreational_sports(**recreational_sports_dict)
    db.add(db_recreational_sports)
    return db_recreational_sports

def get_recreational_sports_by_uuid(db: Session, recreational_sports_id: UUID) -> Optional[Recreational_sports]:
    return db.query(Recreational_sports).filter(Recreational_sports.id == recreational_sports_id).first()
