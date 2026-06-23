from uuid import UUID

from fastapi import HTTPException
import jwt
import os
import datetime
from datetime import timezone, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET")
if JWT_SECRET is None:
    raise ValueError("FATALNA GREŠKA: JWT_SECRET nije postavljen u .env fajlu!")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 15))
JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", 7))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
def create_access_token(email: str, id: UUID | str) -> str:
    expire = datetime.datetime.now(timezone.utc) + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": email,
        "email": email,
        "id": str(id),
        "exp": expire,
        "type": "access"
    }

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token( email: str, id: UUID | str) -> str:
    expire = datetime.datetime.now(timezone.utc) + timedelta(days=JWT_REFRESH_TOKEN_EXPIRE_DAYS)

    payload = {
        "sub": email,
        "email": email,
        "id": str(id),
        "exp": expire,
        "type": "refresh"
    }

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try :
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload["type"] == "refresh":
            return payload
        else:
            raise HTTPException(status_code=400, detail="Nevažeći token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token je istekao")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Nevažeći token")

def verify_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") == "access":
            return payload
        raise HTTPException(status_code=401, detail="Nevažeći tip tokena")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Access token je istekao")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Nevažeći token")

_token_blacklist: set[str] = set()

def blacklist_token(token: str) -> None:
    _token_blacklist.add(token)

def is_token_blacklisted(token: str) -> bool:
    return token in _token_blacklist