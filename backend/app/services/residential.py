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
    def get_kwh_price(stratum: int) -> float:
        """Retorna la tarifa por kWh según el estrato (Datos actualizados Colombia)."""
        tariffs = {1: 350.0, 2: 450.0, 3: 680.0, 4: 850.0, 5: 1100.0, 6: 1400.0}
        return tariffs.get(stratum, 680.0)

    @staticmethod
    def calculate_appliance_cost(power_watts: float, daily_hours: float, kwh_price: float) -> float:
        """Calcula el costo mensual estimado de un electrodoméstico."""
        # kWh = (Watts * Horas) / 1000
        monthly_kwh = (power_watts * daily_hours * 30) / 1000.0
        return round(monthly_kwh * kwh_price, 2)

    async def get_dashboard_insights(self, db: AsyncSession, user_id: int) -> Dict[str, Any]:
        """
        Genera una visión 360 del hogar: Financiero + Técnico + IA.
        """
        from app.models.user import User
        from sqlalchemy.orm import selectinload
        
        # 1. Carga optimizada de todo el grafo del usuario (Senior Pattern)
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
        # Tomar las últimas 10 lecturas directamente de la relación cargada
        readings = sorted(user.consumption_readings, key=lambda x: x.date, reverse=True)[:10]

        # 2. Análisis Técnico de Activos
        stratum = profile.stratum if profile else 3
        kwh_price = self.get_kwh_price(stratum)
        
        total_estimated_monthly_cost = 0.0
        high_impact_assets = []
        vampire_kwh_monthly = 0.0

        for a in assets:
            # Si el equipo no tiene potencia definida, usamos promedios por categoría
            power = a.power_watts
            hours = a.daily_hours
            
            if power == 0:
                # Valores por defecto por tipo de icono/nombre
                defaults = {
                    "fridge": (250, 8),      # 250W, 8h efectivas (ciclos)
                    "washer": (500, 1),      # 500W, 1h promedio
                    "ac": (1500, 4),        # 1.5kW, 4h
                    "tv": (100, 5),         # 100W, 5h
                    "stove_electric": (2000, 1),
                    "heater_electric": (3000, 0.5),
                }
                power, hours = defaults.get(a.icon, (100, 2))
                # Actualizamos en el objeto para la respuesta, pero no en DB aquí
                a.power_watts = power
                a.daily_hours = hours

            cost = self.calculate_appliance_cost(power, hours, kwh_price)
            total_estimated_monthly_cost += cost
            
            if a.is_high_impact or cost > 20000:
                high_impact_assets.append({"name": a.name, "cost": cost})
            
            # Cálculo de vampiro (basado en auditoría del frontend)
            if a.icon in ["tv", "monitor", "console", "desktop"]:
                vampire_kwh_monthly += 5.0 # Promedio 5kWh standby
            elif a.icon == "fridge" and a.is_high_impact:
                vampire_kwh_monthly += 15.0 # Equipo viejo consume más base

        # 3. Análisis de Consumo real (Lecturas)
        latest_reading_kwh = readings[0].reading_value if readings else 0
        projected_bill_real = latest_reading_kwh * 30 * kwh_price if readings else total_estimated_monthly_cost
        
        # 4. Contexto para Gemini
        home_context = {
            "house_type": profile.house_type if profile else "Hogar",
            "occupants": profile.occupants if profile else 1,
            "stratum": stratum,
            "total_assets": len(assets),
            "high_impact_assets": high_impact_assets[:3],
            "recent_readings": [r.reading_value for r in readings[:5]],
            "monthly_budget": profile.target_monthly_bill if profile else 0,
            "estimated_cost": total_estimated_monthly_cost
        }

        # 5. Auditoría de IA
        ai_output = await gemini_service.get_residential_insights(home_context)

        return {
            # Inteligencia y Cálculos Dinámicos (Lo que NO está en el perfil estático)
            "metrics": {
                "kwh_price": kwh_price,
                "efficiency_score": ai_output.get("efficiency_score", 85),
                "vampire_cost_monthly": round(vampire_kwh_monthly * kwh_price),
                "projected_bill": round(projected_bill_real),
                "total_estimated_monthly_cost": round(total_estimated_monthly_cost),
                "potential_savings": f"$ {round(vampire_kwh_monthly * kwh_price * 0.8)}",
                "trees_equivalent": round(latest_reading_kwh * 0.5) if readings else 0 # Ejemplo de cálculo dinámico
            },
            "analysis": {
                "total_assets": len(assets),
                "high_impact_assets": high_impact_assets[:5],
                "top_waste_reason": ai_output.get("top_waste_reason", "Consumo Base Elevado")
            },
            "ai_advice": ai_output.get("ai_advice", "Considera revisar los consumos en horas pico."),
            "missions": ai_output.get("missions", [])
        }

residential_service = ResidentialService()
