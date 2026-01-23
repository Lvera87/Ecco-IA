"""Authentication endpoints (JWT login, register and refresh)."""
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_async_session
from app.services.auth import authenticate_user, create_tokens_for_user
from app.core.security import decode_token, get_password_hash
from app.models.user import User
from app.models.residential import ResidentialProfile
from app.models.industrial_settings import IndustrialSettings
from app.models.gamification import GamificationProfile

# =====================
# Schemas
# =====================

from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(tags=["auth"])

# =====================
# Endpoints
# =====================

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_async_session)) -> TokenResponse:
    """
    Registra un nuevo usuario con su perfil específico (residencial o industrial).
    Retorna tokens para auto-login inmediato.
    """
    # Verificar si el usuario ya existe
    existing = await db.execute(
        select(User).where((User.username == payload.username) | (User.email == payload.email))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario o email ya existe"
        )
    
    # Crear usuario
    new_user = User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password)
    )
    db.add(new_user)
    await db.flush()  # Obtener ID sin commit
    
    # Crear perfil según tipo
    if payload.user_type == "residential":
        profile = ResidentialProfile(
            user_id=new_user.id,
            city=payload.city,
            stratum=payload.stratum or 3,
            occupants=payload.occupants or 1,
            house_type=payload.house_type or "apartment"
        )
        db.add(profile)
    elif payload.user_type == "industrial":
        profile = IndustrialSettings(
            user_id=new_user.id,
            company_name=payload.company_name or "Mi Empresa Industrial"
        )
        db.add(profile)
    
    # Crear perfil de gamificación (ambos tipos)
    gami_profile = GamificationProfile(
        user_id=new_user.id,
        total_xp=0,
        current_level=1,
        eco_points=0
    )
    db.add(gami_profile)
    
    await db.commit()
    await db.refresh(new_user)
    
    # Auto-login: generar tokens
    tokens = await create_tokens_for_user(new_user)
    return TokenResponse(**tokens, user_type=payload.user_type)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_async_session)) -> TokenResponse:
    """Inicia sesión y devuelve un par de tokens (Access + Refresh)."""
    import logging
    logger = logging.getLogger("app.auth")
    
    try:
        user = await authenticate_user(db, payload.username, payload.password)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
        
        # Determinar tipo de usuario
        res_profile = await db.execute(select(ResidentialProfile).where(ResidentialProfile.user_id == user.id))
        has_res = res_profile.scalar_one_or_none()
        user_type = "residential" if has_res else "industrial"
        
        tokens = await create_tokens_for_user(user)
        return TokenResponse(**tokens, user_type=user_type)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en login: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


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
            
        tokens = await create_tokens_for_user(user)
        return TokenResponse(**tokens)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de refresco inválido o expirado")
