"""
Tests Unitarios para el Core Matemático de EccoIA.
Estos tests validan la 'física' del ahorro energético sin dependencias de DB o IA.
"""
import pytest
from dataclasses import dataclass
from app.core.energy_logic import EnergyCalculators, energy_calculators


# ============================================================================
# FIXTURES: Objetos simulados que cumplen el Protocol AssetLike
# ============================================================================

@dataclass
class MockAsset:
    """Simula un activo para tests sin necesitar el modelo SQLAlchemy."""
    icon: str
    is_high_impact: bool


# ============================================================================
# TEST: Tarifas por Estrato
# ============================================================================

class TestKwhPricing:
    """Validación de la tabla de tarifas por estratificación colombiana."""

    def test_stratum_1_lowest_price(self):
        assert EnergyCalculators.get_kwh_price(1) == 350.0

    def test_stratum_6_highest_price(self):
        assert EnergyCalculators.get_kwh_price(6) == 1400.0

    def test_invalid_stratum_returns_default(self):
        """El estrato 0 o valores fuera de rango deben retornar estrato 3 (680.0)."""
        assert EnergyCalculators.get_kwh_price(0) == 680.0
        assert EnergyCalculators.get_kwh_price(99) == 680.0
        assert EnergyCalculators.get_kwh_price(-1) == 680.0


# ============================================================================
# TEST: Cálculo de kWh Mensual
# ============================================================================

class TestMonthlyKwhCalculation:
    """Validación de la fórmula: (watts * hours * 30 días) / 1000."""

    def test_basic_calculation(self):
        # Un bombillo de 100W usado 8 horas diarias = 24 kWh/mes
        result = EnergyCalculators.calculate_monthly_kwh(100, 8)
        assert result == 24.0

    def test_zero_power_zero_result(self):
        assert EnergyCalculators.calculate_monthly_kwh(0, 24) == 0.0

    def test_zero_hours_zero_result(self):
        assert EnergyCalculators.calculate_monthly_kwh(1000, 0) == 0.0

    def test_high_consumption_appliance(self):
        # Un AC de 1500W usado 10 horas = 450 kWh/mes
        result = EnergyCalculators.calculate_monthly_kwh(1500, 10)
        assert result == 450.0


# ============================================================================
# TEST: Score de Eficiencia (Benchmarking)
# ============================================================================

class TestEfficiencyScore:
    """
    Valida el cálculo del puntaje de eficiencia basado en kWh/persona/mes.
    Meta: 35 kWh/persona. Score de 100 si cumple, decrece 1.5 pts por kWh excedente.
    """

    def test_perfect_efficiency(self):
        """Consumir exactamente 35 kWh/persona = 100 puntos."""
        # 3 ocupantes, 105 kWh total = 35 kWh/persona
        score = EnergyCalculators.calculate_efficiency_score(105.0, 3)
        assert score == 100

    def test_below_target_still_100(self):
        """Consumir menos de 35 kWh/persona sigue siendo 100 (no hay bonus)."""
        score = EnergyCalculators.calculate_efficiency_score(60.0, 3)  # 20 kWh/persona
        assert score == 100

    def test_slightly_above_target(self):
        """38 kWh/persona = 100 - (3 * 1.5) = 95.5 → 95."""
        score = EnergyCalculators.calculate_efficiency_score(114.0, 3)  # 38 kWh/persona
        assert score == 95

    def test_very_inefficient(self):
        """100 kWh/persona = 100 - (65 * 1.5) = 2.5 → 2."""
        score = EnergyCalculators.calculate_efficiency_score(100.0, 1)
        assert score == 2

    def test_extreme_consumption_floors_at_zero(self):
        """Consumos absurdos no pueden generar scores negativos."""
        score = EnergyCalculators.calculate_efficiency_score(500.0, 1)  # 500 kWh/persona
        assert score == 0

    def test_zero_occupants_treated_as_one(self):
        """Evitar división por cero: 0 ocupantes se trata como 1."""
        score = EnergyCalculators.calculate_efficiency_score(35.0, 0)
        assert score == 100


# ============================================================================
# TEST: Estimación de Consumo Vampiro
# ============================================================================

class TestVampireConsumption:
    """
    Validación del cálculo de consumo standby (vampiro).
    Basado en tipo de equipo y flag isHighImpact (antigüedad/ineficiencia).
    """

    def test_modern_tv_low_vampire(self):
        """Un TV moderno consume ~0.7 kWh/mes en standby."""
        assets = [MockAsset(icon="tv", is_high_impact=False)]
        result = EnergyCalculators.get_vampire_estimate(assets)
        assert result == 0.7

    def test_old_tv_high_vampire(self):
        """Un TV antiguo/ineficiente consume ~2.5 kWh/mes."""
        assets = [MockAsset(icon="tv", is_high_impact=True)]
        result = EnergyCalculators.get_vampire_estimate(assets)
        assert result == 2.5

    def test_old_fridge_highest_vampire(self):
        """Una nevera antigua consume ~8 kWh/mes en standby."""
        assets = [MockAsset(icon="fridge", is_high_impact=True)]
        result = EnergyCalculators.get_vampire_estimate(assets)
        assert result == 8.0

    def test_modern_fridge_no_vampire(self):
        """Una nevera moderna no se considera vampiro (ciclos optimizados)."""
        assets = [MockAsset(icon="fridge", is_high_impact=False)]
        result = EnergyCalculators.get_vampire_estimate(assets)
        assert result == 0.0

    def test_multiple_devices_summed(self):
        """Múltiples equipos suman su consumo vampiro."""
        assets = [
            MockAsset(icon="tv", is_high_impact=False),      # 0.7
            MockAsset(icon="monitor", is_high_impact=True),  # 2.5
            MockAsset(icon="fridge", is_high_impact=True),   # 8.0
        ]
        result = EnergyCalculators.get_vampire_estimate(assets)
        assert result == 11.2

    def test_empty_assets_returns_zero(self):
        """Sin activos = sin consumo vampiro."""
        result = EnergyCalculators.get_vampire_estimate([])
        assert result == 0.0


# ============================================================================
# TEST: Impacto Ambiental (CO2 y Árboles)
# ============================================================================

class TestEnvironmentalImpact:
    """Validación de la huella de carbono y compensación arbórea."""

    def test_co2_calculation(self):
        """100 kWh * 0.164 = 16.4 kg CO2."""
        result = EnergyCalculators.calculate_environmental_impact(100.0)
        assert result["co2_kg"] == 16.4

    def test_tree_compensation(self):
        """200 kWh = 32.8 kg CO2 → 32.8 / 20 = 1.64 → 2 árboles (redondeo)."""
        result = EnergyCalculators.calculate_environmental_impact(200.0)
        assert result["trees"] == 2

    def test_zero_consumption_no_impact(self):
        """Sin consumo = sin impacto."""
        result = EnergyCalculators.calculate_environmental_impact(0.0)
        assert result["co2_kg"] == 0.0
        assert result["trees"] == 0


# ============================================================================
# TEST: Instancia Singleton
# ============================================================================

class TestSingletonInstance:
    """Verifica que el módulo exporta una instancia utilizable."""

    def test_singleton_exists(self):
        assert energy_calculators is not None

    def test_singleton_methods_work(self):
        result = energy_calculators.get_kwh_price(4)
        assert result == 850.0
