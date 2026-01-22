"""Authentication endpoints (JWT login and refresh)."""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_async_session
from app.services.auth import authenticate_user, create_tokens_for_user
from app.core.security import decode_token
from app.models.user import User

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

router = APIRouter(tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_async_session)) -> TokenResponse:
    """Inicia sesión y devuelve un par de tokens (Access + Refresh)."""
    user = await authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    
    tokens = await create_tokens_for_user(user)
    return TokenResponse(**tokens)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_async_session)
) -> TokenResponse:
    """Permite obtener un nuevo access token usando un refresh token válido."""
    try:
        payload = decode_token(refresh_token, expected_type="refresh")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
            
        result = await db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
            
        # Generamos nuevos tokens (Rotation)
        tokens = await create_tokens_for_user(user)
        return TokenResponse(**tokens)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de refresco inválido o expirado")
