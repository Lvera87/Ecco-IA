from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.industrial_asset import IndustrialAsset
from app.models.industrial_settings import IndustrialSettings
from app.services.gemini_service import gemini_service

class IndustrialService:
    """
    Servicio de Ingeniería Industrial para el cálculo de eficiencia energética y retorno de inversión.
    Diseñado bajo el patrón Service Layer para desacoplar lógica de negocio de la API.
    """

    @staticmethod
    def calculate_asset_consumption(asset: IndustrialAsset) -> Dict[str, float]:
        """
        Realiza cálculos de ingeniería para un activo individual.
        Single source of truth para la física del equipo.
        """
        power = asset.nominal_power_kw or 0.0
        load_f = asset.load_factor or 0.75
        hours = asset.daily_usage_hours or 0.0
        op_days = asset.op_days_per_month or 22
        efficiency = (asset.efficiency_percentage or 85.0) / 100.0
        
        # Kw reales = Potencia x Factor de Carga
        real_kw = power * load_f
        # Consumo Mensual = Kw reales x horas x días operativos
        monthly_kwh = real_kw * hours * op_days
        # Desperdicio = Consumo x (1 - Eficiencia)
        waste_kwh = monthly_kwh * (1.0 - efficiency)
        
        # Penalidad por Factor de Potencia (Cos φ) bajo
        # Estándar industrial: Penalidad si PF < 0.90
        pf = asset.power_factor or 0.85
        if pf < 0.90:
            waste_kwh += monthly_kwh * (0.90 - pf) * 0.1
            
        return {
            "real_kw": round(real_kw, 2),
            "monthly_kwh": round(monthly_kwh, 2),
            "waste_kwh": round(waste_kwh, 2)
        }

    async def get_dashboard_insights(self, db: AsyncSession, user_id: int) -> Dict[str, Any]:
        """
        Calcula las métricas globales de la planta y solicita una auditoría a la IA.
        """
        # 1. Fetch data
        assets_query = select(IndustrialAsset).where(IndustrialAsset.user_id == user_id)
        settings_query = select(IndustrialSettings).where(IndustrialSettings.user_id == user_id)
        
        assets_res = await db.execute(assets_query)
        settings_res = await db.execute(settings_query)
        
        assets = assets_res.scalars().all()
        settings = settings_res.scalar_one_or_none()
        
        currency = settings.currency_code if settings else "USD"
        cost_per_kwh = settings.energy_cost_per_kwh if settings else 0.15

        if not assets:
            return self._empty_dashboard_state(currency)

        # 2. Aggregated Calculations
        total_kwh = 0.0
        total_waste_kwh = 0.0
        total_kw = 0.0
        asset_details = []

        for a in assets:
            stats = self.calculate_asset_consumption(a)
            total_kwh += stats["monthly_kwh"]
            total_waste_kwh += stats["waste_kwh"]
            total_kw += stats["real_kw"]
            
            asset_details.append({
                "name": a.name,
                "type": a.asset_type,
                "waste_kwh": stats["waste_kwh"],
                "efficiency": a.efficiency_percentage
            })

        # 3. AI Audit context
        plant_data = {
            "company": settings.company_name if settings else "Planta",
            "total_assets": len(assets),
            "total_real_demand_kw": round(total_kw, 2),
            "total_consumption_monthly_kwh": round(total_kwh, 2),
            "total_waste_monthly_kwh": round(total_waste_kwh, 2),
            "energy_cost_per_kwh": cost_per_kwh,
            "currency": currency,
            "assets_top": asset_details[:5]
        }

        ai_insights = await gemini_service.get_dashboard_insights(plant_data)
        
        # 4. Final synthesis
        waste_score = ai_insights.get("waste_score", round((total_waste_kwh / total_kwh * 100) if total_kwh > 0 else 0))
        potential_savings_val = total_waste_kwh * cost_per_kwh

        return {
            "waste_score": waste_score,
            "top_waste_reason": ai_insights.get("top_waste_reason", "Ineficiencia General"),
            "potential_savings": ai_insights.get("potential_savings", f"{currency} {round(potential_savings_val)}"),
            "potential_savings_monthly": float(potential_savings_val * 0.25), 
            "total_consumption_monthly_kwh": round(total_kwh),
            "total_real_demand_kw": round(total_kw, 1),
            "recommendation_highlight": ai_insights.get("recommendation_highlight", "Optimizar procesos"),
            "ai_interpretation": ai_insights.get("ai_interpretation", "Análisis pendiente."),
            "currency": currency
        }

    def _empty_dashboard_state(self, currency: str) -> Dict[str, Any]:
        return {
            "waste_score": 0,
            "top_waste_reason": "Sin Equipos",
            "potential_savings": f"{currency} 0",
            "potential_savings_monthly": 0.0,
            "total_consumption_monthly_kwh": 0.0,
            "total_real_demand_kw": 0.0,
            "recommendation_highlight": "Registrar Activos",
            "ai_interpretation": "Añade tus equipos para iniciar el análisis.",
            "currency": currency
        }

industrial_service = IndustrialService()
