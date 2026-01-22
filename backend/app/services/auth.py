from typing import Optional, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User as UserModel
from app.core.security import verify_password, create_access_token, create_refresh_token

async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[UserModel]:
    """Valida credenciales y devuelve el usuario si es correcto."""
    result = await db.execute(select(UserModel).where(UserModel.username == username))
    user = result.scalar_one_or_none()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def create_tokens_for_user(user: UserModel) -> Dict[str, str]:
    """Genera el set completo de tokens para una sesión."""
    payload = {"sub": str(user.id), "username": user.username}
    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token(payload)
    }
