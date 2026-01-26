from typing import Dict, List, Any, Protocol


class AssetLike(Protocol):
    """Contrato mínimo que debe cumplir un activo para el cálculo vampiro."""
    icon: str
    is_high_impact: bool


class EnergyCalculators:
    """
    Núcleo matemático de EccoIA. 
    Aquí reside la 'física' del ahorro sin dependencias de DB o IA.
    Tarifas basadas en EMCALI (Cali, Colombia).
    """
    
    # Tarifas EMCALI por estrato (COP/kWh) - Ya incluyen subsidios aplicados
    ESTRATO_TARIFFS = {
        1: 398.86,   # Subsidio 60% aplicado
        2: 498.58,   # Subsidio 50% aplicado
        3: 657.80,   # Subsidio 15% aplicado
        4: 773.88,   # Tarifa plena
        5: 928.66,   # Contribución 20% aplicada
        6: 928.66    # Contribución 20% aplicada
    }
    
    # Subsidios/Contribuciones por estrato (para mostrar al usuario)
    ESTRATO_SUBSIDIO = {
        1: -0.60,   # -60% subsidio
        2: -0.50,   # -50% subsidio
        3: -0.15,   # -15% subsidio
        4: 0.00,    # Tarifa plena
        5: 0.20,    # +20% contribución
        6: 0.20     # +20% contribución
    }
    
    # Consumo promedio mensual por estrato (kWh) - Datos EMCALI
    ESTRATO_PROMEDIO_KWH = {
        1: 145.6,
        2: 156.1,
        3: 153.0,
        4: 167.4,
        5: 212.8,
        6: 372.2
    }
    
    CO2_FACTOR = 0.164  # kg CO2e / kWh
    TREE_COMPENSATION = 20.0  # kg CO2 / year per tree
    
    @classmethod
    def get_kwh_price(cls, stratum: int) -> float:
        """Obtiene la tarifa por kWh según el estrato (EMCALI)."""
        return cls.ESTRATO_TARIFFS.get(stratum, 657.80)  # Default: estrato 3
    
    @classmethod
    def get_stratum_average_kwh(cls, stratum: int) -> float:
        """Obtiene el consumo promedio mensual del estrato (kWh)."""
        return cls.ESTRATO_PROMEDIO_KWH.get(stratum, 153.0)  # Default: estrato 3
    
    @classmethod
    def get_stratum_subsidy(cls, stratum: int) -> float:
        """Obtiene el porcentaje de subsidio/contribución del estrato."""
        return cls.ESTRATO_SUBSIDIO.get(stratum, 0.0)
    
    @classmethod
    def calculate_stratum_comparison(cls, user_kwh: float, stratum: int) -> Dict[str, Any]:
        """
        Compara el consumo del usuario con el promedio de su estrato.
        Retorna: diferencia_kwh, diferencia_porcentaje, es_eficiente (True si consume menos)
        """
        average = cls.get_stratum_average_kwh(stratum)
        diff_kwh = user_kwh - average
        diff_percent = ((user_kwh - average) / average * 100) if average > 0 else 0
        
        return {
            "promedio_estrato_kwh": average,
            "consumo_usuario_kwh": user_kwh,
            "diferencia_kwh": round(diff_kwh, 1),
            "diferencia_porcentaje": round(diff_percent, 1),
            "es_eficiente": user_kwh <= average,
            "mensaje": f"{'Consumes ' + str(abs(round(diff_percent, 1))) + '% menos' if diff_kwh < 0 else 'Consumes ' + str(abs(round(diff_percent, 1))) + '% más'} que el promedio de tu estrato"
        }
    
    @classmethod
    def calculate_leak_cost(cls, otros_fugas_kwh: float, stratum: int) -> Dict[str, Any]:
        """
        Calcula el costo mensual de las fugas/otros consumos no identificados.
        """
        kwh_price = cls.get_kwh_price(stratum)
        costo_fugas = otros_fugas_kwh * kwh_price
        
        return {
            "fugas_kwh": round(otros_fugas_kwh, 2),
            "fugas_costo_cop": round(costo_fugas),
            "tarifa_kwh": kwh_price
        }
    
    @classmethod
    def calculate_bill_from_kwh(cls, total_kwh: float, stratum: int) -> Dict[str, Any]:
        """
        Calcula la factura estimada basada en el consumo en kWh y el estrato.
        """
        kwh_price = cls.get_kwh_price(stratum)
        total_cop = total_kwh * kwh_price
        subsidio = cls.get_stratum_subsidy(stratum)
        
        return {
            "consumo_kwh": round(total_kwh, 1),
            "tarifa_kwh": kwh_price,
            "factura_estimada_cop": round(total_cop),
            "subsidio_contribucion_porcentaje": subsidio * 100,
            "tipo_tarifa": "Subsidiada" if subsidio < 0 else ("Contribución" if subsidio > 0 else "Plena")
        }

    @staticmethod
    def calculate_monthly_kwh(power_watts: float, daily_hours: float) -> float:
        return (power_watts * daily_hours * 30) / 1000.0

    @classmethod
    def calculate_efficiency_score(cls, total_kwh: float, occupants: int) -> int:
        """
        Calcula el puntaje de eficiencia basado en benchmarking colombiano.
        Meta eficiente: 35 kWh/persona/mes.
        """
        if occupants <= 0: occupants = 1
        kwh_per_person = total_kwh / occupants
        # 100 es perfecto (<= 35kWh), reduce 1.5 puntos por cada kWh excedente
        score = 100 - (max(0, kwh_per_person - 35) * 1.5)
        return int(max(0, min(100, score)))

    @classmethod
    def get_vampire_estimate(cls, assets: List[AssetLike]) -> float:
        """
        Estima el consumo standby (vampiro) basado en el tipo de equipo y su antigüedad.
        """
        vampire_kwh = 0.0
        for a in assets:
            # Lógica refinada: equipos modernos consumen muy poco (~0.7 kWh/mes)
            if a.icon in ["tv", "monitor", "console", "desktop"]:
                vampire_kwh += 2.5 if a.is_high_impact else 0.7
            elif a.icon == "fridge" and a.is_high_impact:
                vampire_kwh += 8.0
            elif a.icon == "ac" and a.is_high_impact:
                vampire_kwh += 1.5
        return vampire_kwh

    @classmethod
    def calculate_environmental_impact(cls, total_kwh: float) -> Dict[str, Any]:
        co2 = total_kwh * cls.CO2_FACTOR
        return {
            "co2_kg": round(co2, 2),
            "trees": int(round(co2 / cls.TREE_COMPENSATION))
        }

energy_calculators = EnergyCalculators()
