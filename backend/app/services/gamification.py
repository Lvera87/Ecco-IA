from typing import List, Dict, Any, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.gamification import GamificationProfile, Mission, UserMission
from app.models.user import User
from datetime import datetime

class GamificationService:
    """
    Motor de Gamificación de Ecco-IA.
    Gestiona la progresión de los usuarios y la lógica de misiones.
    """

    @staticmethod
    def calculate_level(total_xp: int) -> int:
        """Fórmula de nivel: cada nivel requiere más XP que el anterior (Progresión curva)."""
        # Nivel 1: 0xp, Nivel 2: 100xp, Nivel 3: 300xp, etc.
        return int((total_xp / 100) ** 0.5) + 1

    async def get_or_create_profile(self, db: AsyncSession, user_id: int) -> GamificationProfile:
        """Asegura que el usuario tenga un perfil de gamificación y misiones iniciales."""


        result = await db.execute(select(GamificationProfile).where(GamificationProfile.user_id == user_id))
        profile = result.scalar_one_or_none()
        
        if not profile:
            profile = GamificationProfile(user_id=user_id, total_xp=0, current_level=1, eco_points=0)
            db.add(profile)
            await db.flush() # Para tener el perfil disponible para misiones

            # Asignar misiones iniciales basadas en el tipo de usuario (por ahora global/residential)
            master_missions = await db.execute(select(Mission).where(Mission.category.in_(["global", "residential"])))
            for m in master_missions.scalars().all():
                db.add(UserMission(user_id=user_id, mission_id=m.id, status="pending", progress=0.0))
            
            await db.commit()
            await db.refresh(profile)
        return profile

    async def award_xp(self, db: AsyncSession, user_id: int, xp_amount: int):
        """Otorga XP y verifica si el usuario subió de nivel."""
        profile = await self.get_or_create_profile(db, user_id)
        profile.total_xp += xp_amount
        
        new_level = self.calculate_level(profile.total_xp)
        if new_level > profile.current_level:
            profile.current_level = new_level
            # Aquí se podría disparar un evento de 'Level Up' para el frontend
            
        await db.commit()
        return profile

    async def get_user_missions(self, db: AsyncSession, user_id: int):
        """Obtiene las misiones activas y completadas del usuario con carga inmediata de misión."""
        from sqlalchemy.orm import selectinload
        query = (
            select(UserMission)
            .where(UserMission.user_id == user_id)
            .options(selectinload(UserMission.mission))
            .order_by(UserMission.created_at.desc())
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def complete_mission(self, db: AsyncSession, user_id: int, mission_id: int):
        """Marca una misión como completada y otorga las recompensas."""
        from sqlalchemy.orm import selectinload
        query = select(UserMission).where(
            UserMission.user_id == user_id, 
            UserMission.mission_id == mission_id,
            UserMission.status == "pending"
        ).options(selectinload(UserMission.mission))
        result = await db.execute(query)
        user_mission = result.scalar_one_or_none()
        
        if not user_mission:
            return None # O ya está completada o no existe
            
        # 1. Marcar como completada
        user_mission.status = "completed"
        user_mission.completed_at = datetime.utcnow()
        user_mission.progress = 1.0
        
        # 2. Recompensas
        mission_query = select(Mission).where(Mission.id == mission_id)
        m_res = await db.execute(mission_query)
        mission = m_res.scalar_one()
        
        profile = await self.get_or_create_profile(db, user_id)
        profile.total_xp += mission.xp_reward
        profile.eco_points += mission.point_reward
        
        # Check level up
        profile.current_level = self.calculate_level(profile.total_xp)
        
        await db.commit()
        return user_mission

    async def seed_initial_missions(self, db: AsyncSession):
        """Puebla la base de datos con misiones iniciales si no existen."""
        result = await db.execute(select(Mission).limit(1))
        if result.scalar_one_or_none():
            return
            
        initial_missions = [
            Mission(title="Eco-Onboarding", description="Completa tu perfil residencial o industrial", xp_reward=200, category="global", icon="UserCheck"),
            Mission(title="Caza de Vampiros", description="Identifica 3 equipos con alto consumo standby", xp_reward=150, category="residential", icon="Zap"),
            Mission(title="Maestro de la Eficiencia", description="Mantén tu eficiencia industrial sobre el 90% una semana", xp_reward=500, category="industrial", icon="Trophy"),
            Mission(title="Primer ROI", description="Calcula un escenario de inversión para un motor", xp_reward=300, category="industrial", icon="TrendingUp"),
            Mission(title="Hogar Consciente", description="Registra todos los equipos de tu cocina", xp_reward=100, category="residential", icon="Home"),
        ]
        db.add_all(initial_missions)
        await db.commit()

gamification_service = GamificationService()
