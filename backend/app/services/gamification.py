from typing import List, Dict, Any, Optional
from sqlalchemy import select, update, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.gamification import GamificationProfile, Mission, UserMission
from app.models.user import User
from datetime import datetime, timedelta
from app.services.gemini_service import gemini_service
import logging

logger = logging.getLogger(__name__)

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

    async def refresh_daily_missions(self, db: AsyncSession, user_id: int):
        """
        Verifica y genera misiones diarias limitadas a 4 por día.
        """
        # 1. Check existing missions for today
        today = datetime.utcnow().date()
        query = select(func.count(UserMission.id)).where(
            UserMission.user_id == user_id,
            func.date(UserMission.created_at) == today
        )
        result = await db.execute(query)
        count_today = result.scalar()

        logger.info(f"CHECK MISIONES: Usuario {user_id} tiene {count_today} misiones hoy. (Límite: 4)")

        if count_today >= 4:
            logger.info("CHECK MISIONES: Límite diario alcanzado. No se generan nuevas.")
            return  # Limit reached
            
        needed = 4 - count_today
        if needed <= 0: return

        # 2. Fetch User Context (Appliances & Consumption)
        from app.models.residential import InventoryItem, ConsumptionRecord
        
        # Appliances
        app_result = await db.execute(select(InventoryItem).where(InventoryItem.user_id == user_id))
        appliances = app_result.scalars().all()
        appliance_list = ", ".join([f"{a.name} ({a.category})" for a in appliances]) or "Ninguno registrado"

        # Recent Consumption (Last 7 days avg)
        avg_consumption = "Desconocido"
        try:
            cons_query = select(ConsumptionRecord).where(
                ConsumptionRecord.user_id == user_id
            ).order_by(ConsumptionRecord.date.desc()).limit(7)
            cons_result = await db.execute(cons_query)
            records = cons_result.scalars().all()
            if records:
                avg = sum(r.value for r in records) / len(records)
                avg_consumption = f"{avg:.2f} kWh/día"
        except Exception:
            pass

        # Build Context
        context = f"""
        Usuario ID: {user_id}
        Electrodomésticos: {appliance_list}
        Consumo Reciente: {avg_consumption}
        Objetivo: Reducir factura y huella de carbono.
        """

        # 3. Generate with AI
        logger.info(f"--- GENERANDO NUEVAS MISIONES DIARIAS PARA USUARIO {user_id} ---")
        ai_missions = await gemini_service.generate_daily_missions(context)
        
        # 4. Create and Assign
        created_missions = []
        for m_data in ai_missions[:needed]:
            # Create a dynamic mission entry
            new_mission = Mission(
                title=m_data.get("title", "Misión Diaria"),
                description=m_data.get("description", "Ahorra energía hoy"),
                xp_reward=m_data.get("xp_reward", 50),
                icon=m_data.get("icon", "Zap"),
                category="ai_daily",
                mission_type="dynamic"
            )
            db.add(new_mission)
            await db.flush() # Get ID
            
            # Assign to user
            user_mission = UserMission(
                user_id=user_id,
                mission_id=new_mission.id,
                status="pending",
                progress=0.0
            )
            db.add(user_mission)
            created_missions.append(user_mission)
            
        await db.commit()
    
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

        # 3. Aplicar ahorro energético (Reducir factura proyectada)
        from app.models.residential import ResidentialProfile
        res_profile_result = await db.execute(select(ResidentialProfile).where(ResidentialProfile.user_id == user_id))
        res_profile = res_profile_result.scalar_one_or_none()

        if res_profile:
            # 3.1. Calculate Savings
            saving_kwh = 0.0
            
            # Hardcoded legacy map
            savings_map = {
                "Caza de Vampiros": 15.0,
                "Hogar Consciente": 8.0,
                "Apagar Luces": 5.0
            }
            
            if mission.title in savings_map:
                saving_kwh = savings_map[mission.title]
            elif mission.category == "ai_daily":
                 # AI Missions default savings (could be stored in mission.metadata later)
                 saving_kwh = 5.0 # Conservative default for daily tasks
            
            # 3.2 Apply reduction
            if saving_kwh > 0:
                # Inicializar si es nulo
                if res_profile.average_kwh_captured is None:
                    res_profile.average_kwh_captured = 200.0 # Valor base default
                
                # Aplicar reducción (sin bajar de un mínimo razonable)
                # El ahorro es PERMANENTE en la estimación del "base load" (consumo no medido)
                current_base = res_profile.average_kwh_captured
                new_val = max(50.0, current_base - saving_kwh)
                res_profile.average_kwh_captured = new_val
                
                # También actualizar el promedio de factura si existe
                if res_profile.monthly_bill_avg:
                     # Actualizamos el valor monetario
                     # Asumimos precio promedio ~800 COP/kWh si no tenemos el exacto a mano aquí
                     estimated_saving_money = saving_kwh * 850
                     res_profile.monthly_bill_avg = max(50000.0, res_profile.monthly_bill_avg - estimated_saving_money)

        await db.commit()
        return user_mission

    async def seed_initial_missions(self, db: AsyncSession):
        """Puebla la base de datos con misiones iniciales si no existen."""
        result = await db.execute(select(Mission).limit(1))
        if result.scalar_one_or_none():
            return
            
        initial_missions = [
            Mission(title="Eco-Onboarding", description="Completa tu perfil residencial o industrial", xp_reward=200, category="global", icon="UserCheck"),
            Mission(title="Caza de Vampiros", description="Identifica 3 equipos con alto consumo standby", xp_reward=150, category="residential", icon="Zap", related_appliance_type="wasted_energy"),
            Mission(title="Maestro de la Eficiencia", description="Mantén tu eficiencia industrial sobre el 90% una semana", xp_reward=500, category="industrial", icon="Trophy"),
            Mission(title="Primer ROI", description="Calcula un escenario de inversión para un motor", xp_reward=300, category="industrial", icon="TrendingUp"),
            Mission(title="Hogar Consciente", description="Registra todos los equipos de tu cocina", xp_reward=100, category="residential", icon="Home", related_appliance_type="fridge"),
        ]
        db.add_all(initial_missions)
        await db.commit()

gamification_service = GamificationService()
