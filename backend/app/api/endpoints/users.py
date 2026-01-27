"""User CRUD endpoints with relation loading for persistence."""
from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload  # <--- Fundamental para cargar relaciones

from app.db.session import get_async_session
from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserRead
from app.core.security import get_password_hash, get_current_user

router = APIRouter(tags=["users"])

@router.get("/me", response_model=UserRead)
async def get_my_user(
    db: AsyncSession = Depends(get_async_session),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    """
    Obtiene el perfil del usuario actual.
    Utiliza selectinload para incluir los datos de la IA guardados en el perfil residencial.
    """
    stmt = (
        select(UserModel)
        .options(
            selectinload(UserModel.residential_profile),
            selectinload(UserModel.industrial_settings),
            selectinload(UserModel.gamification_profile)
        )
        .where(UserModel.id == current_user.id)
    )
    
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    return user


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_async_session)) -> UserRead:
    """Crea un nuevo usuario (Endpoint administrativo)."""
    user = UserModel(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="El nombre de usuario o email ya existe")
    await db.refresh(user)
    return user


@router.get("/", response_model=List[UserRead])
async def list_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_session)) -> List[UserRead]:
    """Lista todos los usuarios (Solo para desarrollo/admin)."""
    result = await db.execute(select(UserModel).offset(skip).limit(limit))
    users = result.scalars().all()
    return users


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: AsyncSession = Depends(get_async_session)) -> UserRead:
    """Obtiene un usuario específico por ID con sus perfiles cargados."""
    stmt = (
        select(UserModel)
        .options(
            selectinload(UserModel.residential_profile),
            selectinload(UserModel.industrial_settings)
        )
        .where(UserModel.id == user_id)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
