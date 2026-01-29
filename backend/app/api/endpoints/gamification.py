from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_async_session
from app.models.user import User
from app.api.deps import get_current_active_user
from app.services.gamification import gamification_service
from app.schemas.gamification import UserGamificationStats, UserMissionRead

router = APIRouter(tags=["Gamification"])

@router.get("/stats", response_model=UserGamificationStats)
async def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Obtiene el estado actual de gamificación del usuario: nivel, XP y misiones.
    """
    profile = await gamification_service.get_or_create_profile(db, current_user.id)
    missions = await gamification_service.get_user_missions(db, current_user.id)
    
    # Calcular XP para el siguiente nivel (Fórmula inversa simple)
    # Lvl = (XP/100)^0.5 + 1  => (Lvl-1)^2 * 100 = XP
    next_level_xp = (profile.current_level ** 2) * 100
    
    completed_missions = [m for m in missions if m.status == "completed"]
    active_missions = [m for m in missions if m.status == "pending"]
    
    return {
        "profile": profile,
        "active_missions": active_missions,
        "completed_count": len(completed_missions),
        "next_level_xp": next_level_xp
    }

@router.post("/missions/{mission_id}/complete", response_model=UserGamificationStats)
async def complete_mission(
    mission_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Marca una misión como completada y devuelve los stats actualizados.
    """
    user_mission = await gamification_service.complete_mission(db, current_user.id, mission_id)
    if not user_mission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La misión no pudo ser completada o ya lo está."
        )
    
    # Recalcular stats post-completion para feedback inmediato
    # Reutilizamos la lógica de get_user_stats pero optimizada
    missions = await gamification_service.get_user_missions(db, current_user.id)
    profile = await gamification_service.get_or_create_profile(db, current_user.id)
    
    next_level_xp = (profile.current_level ** 2) * 100
    completed_missions = [m for m in missions if m.status == "completed"]
    active_missions = [m for m in missions if m.status == "pending"]
    
    return {
        "profile": profile,
        "active_missions": active_missions,
        "completed_count": len(completed_missions),
        "next_level_xp": next_level_xp
    }

@router.post("/seed", status_code=status.HTTP_201_CREATED)
async def seed_missions(db: AsyncSession = Depends(get_async_session)):
    """Puebla las misiones maestras del sistema."""
    await gamification_service.seed_initial_missions(db)
    return {"message": "Misiones iniciales creadas exitosamente."}
