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
                vampire_kwh_monthly += 2.5 # Promedio 2.5kWh standby (~3.5W)
            elif a.icon == "fridge" and a.is_high_impact:
                vampire_kwh_monthly += 8.0 # Equipo viejo consume más base

        # 3. Análisis de Consumo real (Lecturas vs Perfil vs Inventario)
        latest_reading_kwh = readings[0].reading_value if readings else 0
        
        # Lógica de honestidad (Senior Pattern): Priorizar datos reales/declarados sobre estimaciones técnicas
        if readings:
            # Si hay lecturas diarias, proyectamos a mes (30 días)
            projected_kwh = latest_reading_kwh * 30
        elif profile and profile.average_kwh_captured and profile.average_kwh_captured > 0:
            # Si capturamos el dato de la factura vía OCR
            projected_kwh = profile.average_kwh_captured
        elif profile and profile.monthly_bill_avg and profile.monthly_bill_avg > 0:
            # Si el usuario declaró un promedio en pesos, lo convertimos a kWh
            projected_kwh = profile.monthly_bill_avg / kwh_price if kwh_price > 0 else 0
        else:
            # Último recurso: lo que suma su inventario de electrodomésticos
            projected_kwh = total_estimated_monthly_cost / kwh_price if kwh_price > 0 else 0

        projected_bill_real = projected_kwh * kwh_price
        
        # Carbon Footprint (Fórmula estándar: 1 kWh ~ 0.164 kg CO2e)
        co2_footprint = projected_kwh * 0.164
        trees_equivalent = round(co2_footprint / 20) # 1 árbol compensa ~20kg CO2/año

        # 4. Contexto para Gemini (Unificando lecturas diarias con historial de factura)
        # Priorizamos lecturas diarias si existen, si no, usamos el historial del recibo
        history_for_ia = [r.reading_value for r in readings[:10]]
        if not history_for_ia and profile and profile.history_kwh:
            history_for_ia = profile.history_kwh

        home_context = {
            "house_type": profile.house_type if profile else "Hogar",
            "occupants": profile.occupants if profile else 1,
            "stratum": stratum,
            "total_assets": len(assets),
            "high_impact_assets": high_impact_assets[:3],
            "recent_history_kwh": history_for_ia,
            "monthly_budget": profile.target_monthly_bill if profile else 0,
            "estimated_monthly_cost": total_estimated_monthly_cost,
            "projected_kwh_month": projected_kwh
        }

        # 5. Auditoría de IA
        ai_output = await gemini_service.get_residential_insights(home_context)

        return {
            "metrics": {
                "kwh_price": kwh_price,
                "efficiency_score": ai_output.get("efficiency_score", 85),
                "vampire_cost_monthly": round(vampire_kwh_monthly * kwh_price),
                "projected_bill": round(projected_bill_real),
                "projected_kwh": round(projected_kwh),
                "total_estimated_monthly_cost": round(total_estimated_monthly_cost),
                "potential_savings": f"$ {round(vampire_kwh_monthly * kwh_price * 0.8)}",
                "co2_footprint": round(co2_footprint, 2),
                "trees_equivalent": trees_equivalent
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
