"""Authentication endpoints (JWT login, register and refresh)."""
from typing import Optional, Literal, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db # Usamos el alias que creamos en session.py
from app.services.auth import authenticate_user
from app.core import security
from app.models.user import User
from app.models.residential import ResidentialProfile
from app.models.industrial_settings import IndustrialSettings
from app.models.gamification import GamificationProfile

# =====================
# Schemas
# =====================

from app.schemas.auth import RegisterRequest, TokenResponse

router = APIRouter(tags=["auth"])

# =====================
# Endpoints
# =====================

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> Any:
    """
    Registra un nuevo usuario.
    """
    # 1. Verificar si existe
    existing = await db.execute(
        select(User).where((User.username == payload.username) | (User.email == payload.email))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario o email ya existe"
        )
    
    # 2. Crear usuario
    new_user = User(
        username=payload.username, # En frontend usamos email como username, pero guardamos ambos
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=security.get_password_hash(payload.password),
        user_type=payload.user_type
    )
    db.add(new_user)
    await db.flush()
    
    # 3. Crear perfiles adicionales
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
            company_name=payload.company_name or "Mi Empresa"
        )
        db.add(profile)
    
    # Gamificación
    gami = GamificationProfile(user_id=new_user.id)
    db.add(gami)
    
    await db.commit()
    
    # 4. Generar tokens (Evitando bytes)
    access_token = security.create_access_token(data={"sub": str(new_user.id)})
    refresh_token = security.create_refresh_token(data={"sub": str(new_user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_type": new_user.user_type
    }


@router.post("/login", response_model=TokenResponse)
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Inicia sesión aceptando 'application/x-www-form-urlencoded'.
    Esto es lo que requiere FastAPI y lo que envía el Frontend ahora.
    """
    # Nota: form_data.username contendrá el email enviado desde el frontend
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generar tokens asegurando que sean Strings
    access_token = security.create_access_token(data={"sub": str(user.id)})
    refresh_token = security.create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_type": user.user_type
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Renueva el token."""
    try:
        payload = security.decode_token(refresh_token, expected_type="refresh")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")
            
        result = await db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
            
        new_access = security.create_access_token(data={"sub": str(user.id)})
        new_refresh = security.create_refresh_token(data={"sub": str(user.id)})
        
        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
            "user_type": user.user_type
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Token expirado o inválido")
