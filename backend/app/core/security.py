"""Security helpers: password hashing, JWT token creation and user dependency."""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import get_settings
from app.db.session import get_db
from app.models.user import User

settings = get_settings()

# Configuración de Hash (Argon2 + Bcrypt)
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

# Constantes
ALGORITHM = "HS256"

# Esquema OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")

# --- Funciones de Hashing y Tokens ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña plana contra su hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera un hash seguro para la contraseña."""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Crea un Access Token JWT asegurando que sea String."""
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "access",
        "iss": "ecco-ia-auth"
    })
    
    # Generamos el token
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    
    # --- CORRECCIÓN CRÍTICA: Convertir bytes a string si es necesario ---
    if isinstance(encoded_jwt, bytes):
        return encoded_jwt.decode("utf-8")
    return str(encoded_jwt)

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Crea un Refresh Token JWT asegurando que sea String."""
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + timedelta(days=30)
    
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "refresh",
        "iss": "ecco-ia-auth"
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    
    # --- CORRECCIÓN CRÍTICA ---
    if isinstance(encoded_jwt, bytes):
        return encoded_jwt.decode("utf-8")
    return str(encoded_jwt)

def decode_token(token: str, expected_type: str = "access") -> Dict[str, Any]:
    """Decodifica y valida un token."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        if payload.get("type") != expected_type:
            raise JWTError(f"Invalid token type: expected {expected_type}")
        return payload
    except JWTError:
        raise

# --- Inyección de Dependencia ---

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Valida el token y recupera el usuario actual de la base de datos.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token, expected_type="access")
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        # Convertimos user_id a entero para buscar en la BD
        stmt = select(User).where(User.id == int(user_id))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
    except (ValueError, TypeError):
        raise credentials_exception

    if user is None:
        raise credentials_exception

    return user