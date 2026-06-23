from uuid import UUID

from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_access_token
from app.database import get_db
from app.repository import User_repository as user_repo
from app.schemas.User_schema import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> UUID:
    try:
        payload = verify_access_token(token)

        if not payload:
            raise HTTPException(status_code=401, detail="Token nevažeći")

        user_id = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="ID korisnika nije pronađen u tokenu")
        return UUID(user_id)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token je istekao ili je nevažeći")

async def get_current_user_id_from_token(token: str) -> UUID:
    try:
        payload = verify_access_token(token)

        if not payload:
            raise HTTPException(status_code=401, detail="Token nevažeći")

        user_id = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="ID korisnika nije pronađen u tokenu")

        return UUID(user_id)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Token je istekao ili je nevažeći")

async def get_admin_user_id(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> UUID:
    user = await user_repo.get_user_by_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Korisnik nije pronađen")
    if user.is_admin:
        return user_id
    if user.role == UserRole.ADMIN:
        return user_id
    role_value = user.role.value if hasattr(user.role, "value") else str(user.role)
    if role_value == UserRole.ADMIN.value:
        return user_id
    raise HTTPException(status_code=403, detail="Nemate administratorske ovlasti")

async def get_optional_user_id(request: Request) -> UUID | None:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = verify_access_token(token)
        user_id = payload.get("id")
        return UUID(user_id) if user_id else None
    except Exception:
        return None