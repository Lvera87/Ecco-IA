from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.residential import ResidentialProfile, ResidentialAsset, ConsumptionReading
from app.services.gemini_service import gemini_service

class ResidentialService:
    """
    Servicio Residencial de Ecco-IA.
    Aplica lógica de sentido común para el hogar: proyecciones de factura, 
    análisis de consumo por persona y auditoría de IA.
    """

    @staticmethod
    def calculate_appliance_cost(power_watts: float, daily_hours: float, kwh_price: float = 850.0) -> float:
        """Calcula el costo mensual estimado de un electrodoméstico."""
        # kWh = (Watts * Horas) / 1000
        monthly_kwh = (power_watts * daily_hours * 30) / 1000.0
        return round(monthly_kwh * kwh_price, 2)

    async def get_dashboard_insights(self, db: AsyncSession, user_id: int) -> Dict[str, Any]:
        """
        Genera una visión 360 del hogar: Financiero + Técnico + IA.
        """
        # 1. Datos base
        profile_res = await db.execute(select(ResidentialProfile).where(ResidentialProfile.user_id == user_id))
        assets_res = await db.execute(select(ResidentialAsset).where(ResidentialAsset.user_id == user_id))
        readings_res = await db.execute(
            select(ConsumptionReading)
            .where(ConsumptionReading.user_id == user_id)
            .order_by(ConsumptionReading.date.desc())
            .limit(10)
        )
        
        profile = profile_res.scalar_one_or_none()
        assets = assets_res.scalars().all()
        readings = readings_res.scalars().all()

        # 2. Análisis Técnico de Activos
        total_estimated_monthly_cost = 0.0
        high_impact_assets = []
        kwh_price = 850.0 # Valor por defecto, se podría parametrizar por estrato

        for a in assets:
            cost = self.calculate_appliance_cost(a.power_watts, a.daily_hours, kwh_price)
            total_estimated_monthly_cost += cost
            if a.is_high_impact or cost > 20000:
                high_impact_assets.append({"name": a.name, "cost": cost})

        # 3. Análisis de Consumo (Sentido Común)
        occupants = profile.occupants if profile else 1
        efficiency_score = 85 # Default
        vampire_cost = total_estimated_monthly_cost * 0.12 # Estimación de base del 12%
        
        # 4. Contexto para Gemini
        home_context = {
            "house_type": profile.house_type if profile else "Hogar",
            "occupants": occupants,
            "stratum": profile.stratum if profile else 3,
            "total_assets": len(assets),
            "high_impact_assets": high_impact_assets[:3],
            "recent_readings": [r.reading_value for r in readings[:5]],
            "monthly_budget": profile.target_monthly_bill if profile else 0
        }

        # 5. Auditoría de IA
        ai_output = await gemini_service.get_residential_insights(home_context)

        return {
            "efficiency_score": ai_output.get("efficiency_score", efficiency_score),
            "vampire_cost_monthly": round(vampire_cost),
            "projected_bill": round(total_estimated_monthly_cost * 1.1), # Estimación con margen
            "ai_advice": ai_output.get("ai_advice", "Considera revisar los consumos en horas pico."),
            "top_waste_reason": ai_output.get("top_waste_reason", "Consumo Base Elevado"),
            "potential_savings": f"$ {round(vampire_cost * 0.8)}",
            "missions": ai_output.get("missions", [
                {"id": 1, "title": "Caza Fantasmas", "xp": 100, "icon": "Zap"},
                {"id": 2, "title": "Hogar Eficiente", "xp": 150, "icon": "Home"}
            ])
        }

residential_service = ResidentialService()
