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

from app.core.energy_logic import energy_calculators

class ResidentialService:
    """
    Servicio Residencial de Ecco-IA.
    Orquesta la lógica entre la base de datos, los calculadores core y la IA.
    """

    async def get_dashboard_insights(self, db: AsyncSession, user_id: int) -> Dict[str, Any]:
        """
        Genera una visión 360 del hogar: Financiero + Técnico + IA.
        """
        from app.models.user import User
        from sqlalchemy.orm import selectinload
        
        # 1. Carga optimizada (Senior Pattern)
        query = (
            select(User)
            .where(User.id == user_id)
            .options(
                selectinload(User.residential_profile),
                selectinload(User.residential_assets),
                selectinload(User.consumption_readings)
            )
        )
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            return {}

        profile = user.residential_profile
        assets = user.residential_assets
        readings = sorted(user.consumption_readings, key=lambda x: x.date, reverse=True)[:10]

        # 2. Análisis Técnico vía Core
        stratum = profile.stratum if profile else 3
        kwh_price = energy_calculators.get_kwh_price(stratum)
        
        total_estimated_monthly_cost = 0.0
        high_impact_assets = []
        
        for a in assets:
            if a.power_watts == 0:
                # Defaults técnicos si no hay data
                defaults = {"fridge": (250, 8), "washer": (500, 1), "ac": (1500, 4), "tv": (100, 5)}
                a.power_watts, a.daily_hours = defaults.get(a.icon, (100, 2))

            monthly_kwh = energy_calculators.calculate_monthly_kwh(a.power_watts, a.daily_hours)
            cost = monthly_kwh * kwh_price
            total_estimated_monthly_cost += cost
            
            if a.is_high_impact or cost > 20000:
                high_impact_assets.append({"name": a.name, "cost": cost})

        vampire_kwh_monthly = energy_calculators.get_vampire_estimate(assets)

        # 3. Proyección de Consumo (Single Source of Truth)
        latest_reading_kwh = readings[0].reading_value if readings else 0
        
        if profile and profile.average_kwh_captured and profile.average_kwh_captured > 0:
            projected_kwh = profile.average_kwh_captured
        elif readings:
            projected_kwh = latest_reading_kwh * 30
        elif profile and profile.monthly_bill_avg and profile.monthly_bill_avg > 0:
            projected_kwh = profile.monthly_bill_avg / kwh_price if kwh_price > 0 else 0
        else:
            projected_kwh = total_estimated_monthly_cost / kwh_price if kwh_price > 0 else 0

        # 4. Métricas de Impacto
        impact = energy_calculators.calculate_environmental_impact(projected_kwh)
        tech_efficiency_score = energy_calculators.calculate_efficiency_score(
            projected_kwh, 
            profile.occupants if profile else 1
        )

        # 5. Auditoría de IA
        home_context = {
            "house_type": profile.house_type if profile else "Hogar",
            "occupants": profile.occupants if profile else 1,
            "stratum": stratum,
            "total_assets": len(assets),
            "high_impact_assets": high_impact_assets[:3],
            "recent_history_kwh": [r.reading_value for r in readings] or (profile.history_kwh if profile else []),
            "monthly_budget": profile.target_monthly_bill if profile else 0,
            "estimated_monthly_cost": total_estimated_monthly_cost,
            "projected_kwh_month": projected_kwh
        }
        ai_output = await gemini_service.get_residential_insights(home_context)

        return {
            "metrics": {
                "kwh_price": kwh_price,
                "efficiency_score": tech_efficiency_score,
                "vampire_cost_monthly": round(vampire_kwh_monthly * kwh_price),
                "projected_bill": round(projected_kwh * kwh_price),
                "projected_kwh": round(projected_kwh),
                "total_estimated_monthly_cost": round(total_estimated_monthly_cost),
                "potential_savings": f"$ {round(vampire_kwh_monthly * kwh_price * 0.8)}",
                "co2_footprint": impact["co2_kg"],
                "trees_equivalent": impact["trees"]
            },
            "analysis": {
                "total_assets": len(assets),
                "high_impact_assets": high_impact_assets[:5],
                "top_waste_reason": ai_output.get("top_waste_reason", "Consumo Base Elevado")
            },
            "ai_advice": ai_output.get("ai_advice", "Excelente gestión."),
            "missions": ai_output.get("missions", [])
        }

residential_service = ResidentialService()
