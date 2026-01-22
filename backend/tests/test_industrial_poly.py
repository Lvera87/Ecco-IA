import pytest
from polyfactory.factories.pydantic_factory import PydanticFactory
from app.schemas.industrial_asset import IndustrialAssetCreate
from httpx import AsyncClient

class IndustrialAssetFactory(PydanticFactory[IndustrialAssetCreate]):
    __model__ = IndustrialAssetCreate

@pytest.mark.asyncio
async def test_create_industrial_asset_with_factory(async_client: AsyncClient):
    # Generamos datos aleatorios válidos usando Polyfactory
    asset_data = IndustrialAssetFactory.build().model_dump()
    
    response = await async_client.post(
        "/api/v1/industrial/assets",
        json=asset_data
    )
    
    assert response.status_code == 201 # Cambiado a 201 según el decorator
    data = response.json()
    assert data["name"] == asset_data["name"]
    assert data["nominal_power_kw"] == asset_data["nominal_power_kw"]

@pytest.mark.asyncio
async def test_dashboard_insights_with_real_ai_call(async_client: AsyncClient):
    # Este test verifica la integración con Gemini
    response = await async_client.get(
        "/api/v1/industrial/dashboard-insights"
    )
    
    # Si la API Key no está configurada, el servicio devuelve un mensaje o error gracefully
    assert response.status_code == 200
    data = response.json()
    
    # Verificamos que los campos líquidos existan
    expected_fields = ["waste_score", "top_waste_reason", "potential_savings", "recommendation_highlight", "ai_interpretation"]
    for field in expected_fields:
        assert field in data
