import pytest
import pytest_asyncio
from httpx import AsyncClient
from polyfactory.factories.pydantic_factory import ModelFactory as PydanticFactory
from app.schemas.auth import RegisterRequest
from app.schemas.residential import ResidentialProfileCreate, ResidentialAssetCreate
import logging

# Configurar logging para ver resultados en consola
logger = logging.getLogger(__name__)

@pytest.mark.asyncio
async def test_full_onboarding_ingestion_manual(async_client: AsyncClient):
    """
    Prueba de flujo completo:
    Registro -> Login -> Simulación de Ingesta de Recibo (Perfil + Assets) -> Dashboard
    """
    import random
    import string
    
    # --- 1. REGISTRO ---
    rand_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    reg_payload = {
        "username": f"user_{rand_id}",
        "email": f"email_{rand_id}@example.com",
        "password": "Secret123!", 
        "full_name": "Tester Ecco IA",
        "user_type": "residential"
    }
    
    print(f"\n[Test] Iniciando registro para: {reg_payload['username']}")
    reg_resp = await async_client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201, f"Error en registro: {reg_resp.text}"
    
    # --- 2. LOGIN ---
    print("[Test] Iniciando sesión...")
    login_resp = await async_client.post("/api/v1/auth/login", data={
        "username": reg_payload["username"],
        "password": reg_payload["password"]
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # --- 3. INGESTA DE RECIBO (SIMULADA) ---
    # Datos que vendrían del escaneo del recibo (unificado)
    print("[Test] Simulando ingesta de datos del recibo (Perfil)...")
    profile_data = {
        "house_type": "apartment",
        "occupants": 3,
        "area_sqm": 85.5,
        "city": "Bogota",
        "stratum": 4,
        "occupancy_profile": "hybrid",
        "energy_source": "electricity",
        "monthly_bill_avg": 185000,
        "target_monthly_bill": 150000,
        "average_kwh_captured": 210.5,
        "history_kwh": [205, 215, 198, 220, 210, 212]
    }
    
    prof_resp = await async_client.post("/api/v1/residential/profile", json=profile_data, headers=headers)
    assert prof_resp.status_code == 200
    
    # Ingesta de Assets (Equipos detectados)
    print("[Test] Ingresando lista de equipos detectados...")
    assets_data = [
        {"name": "Nevera Inverter", "icon": "fridge", "power_watts": 280, "daily_hours": 8, "is_high_impact": True},
        {"name": "Lavadora LG", "icon": "washer", "power_watts": 500, "daily_hours": 1, "is_high_impact": False},
        {"name": "Televisor OLED", "icon": "tv", "power_watts": 150, "daily_hours": 5, "is_high_impact": False},
        {"name": "Ducha Eléctrica", "icon": "heater_electric", "power_watts": 3500, "daily_hours": 0.5, "is_high_impact": True}
    ]
    
    assets_resp = await async_client.post("/api/v1/residential/assets", json=assets_data, headers=headers)
    assert assets_resp.status_code == 200
    assert len(assets_resp.json()) == 4
    
    # --- 4. VALIDACIÓN DASHBOARD (INSIGHTS) ---
    print("[Test] Verificando Dashboard Insights (IA + Métricas)...")
    dash_resp = await async_client.get("/api/v1/residential/dashboard-insights", headers=headers)
    assert dash_resp.status_code == 200
    
    insights = dash_resp.json()
    
    # Imprimir resultados para que el usuario los vea
    print("\n--- RESULTADOS DEL TEST DE INGESTA ---")
    print(f"Usuario: {reg_payload['username']} (Estrato {profile_data['stratum']})")
    print(f"Factura Proyectada: ${insights['metrics']['projected_bill']}")
    print(f"Costo Vampiro Est.: ${insights['metrics']['vampire_cost_monthly']}")
    print(f"Score de Eficiencia: {insights['metrics']['efficiency_score']}/100")
    print(f"Equipos de Alto Impacto Detectados: {len(insights['analysis']['high_impact_assets'])}")
    print(f"Consejo de IA: {insights['ai_advice'][:100]}...")
    print("--------------------------------------\n")
    
    assert insights["metrics"]["projected_bill"] > 0
    assert insights["analysis"]["total_assets"] == 4
    assert "metrics" in insights
    assert "analysis" in insights
