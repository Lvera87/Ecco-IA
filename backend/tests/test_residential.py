import pytest
from httpx import AsyncClient
from app.db.base import Base
from app.db.session import get_async_engine
import app.db.session

@pytest.fixture(scope="function", autouse=True)
async def prepare_db():
    """Reset database schema before tests."""
    # Reset the global engine to avoid "Event loop is closed" errors
    app.db.session._engine = None
    engine = get_async_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Dispose of the engine and reset it again for the next test
    await engine.dispose()
    app.db.session._engine = None

@pytest.mark.asyncio
async def test_residential_profile_lifecycle(async_client: AsyncClient):
    profile_data = {
        "house_type": "apartment",
        "occupants": 3,
        "area_sqm": 75.5,
        "city": "Medellín",
        "stratum": 4,
        "occupancy_profile": "hybrid",
        "energy_source": "electric",
        "monthly_bill_avg": 120000.0,
        "target_monthly_bill": 100000.0
    }
    
    # Update Profile
    response = await async_client.post("/api/v1/residential/profile", json=profile_data)
    assert response.status_code == 200
    data = response.json()
    assert data["house_type"] == "apartment"
    assert data["stratum"] == 4
    
    # Get Profile
    response = await async_client.get("/api/v1/residential/profile")
    assert response.status_code == 200
    assert response.json()["city"] == "Medellín"

@pytest.mark.asyncio
async def test_residential_assets(async_client: AsyncClient):
    asset_data = {
        "name": "Nevera Samsung",
        "icon": "Refrigerator",
        "category": "kitchen",
        "is_high_impact": True,
        "status": True,
        "monthly_cost_estimate": 25000.0
    }
    
    # Create Asset
    response = await async_client.post("/api/v1/residential/assets", json=asset_data)
    assert response.status_code == 200
    created_id = response.json()["id"]
    
    # List Assets
    response = await async_client.get("/api/v1/residential/assets")
    assert response.status_code == 200
    assets = response.json()
    assert len(assets) == 1
    assert assets[0]["name"] == "Nevera Samsung"
    
    # Delete Asset
    response = await async_client.delete(f"/api/v1/residential/assets/{created_id}")
    assert response.status_code == 204

@pytest.mark.asyncio
async def test_consumption_readings(async_client: AsyncClient):
    reading_data = {
        "reading_value": 150.5,
        "reading_type": "manual"
    }
    
    # Add Reading
    response = await async_client.post("/api/v1/residential/consumption", json=reading_data)
    assert response.status_code == 200
    
    # Get History
    response = await async_client.get("/api/v1/residential/consumption")
    assert response.status_code == 200
    history = response.json()
    assert len(history) == 1
    assert history[0]["reading_value"] == 150.5

@pytest.mark.asyncio
async def test_dashboard_insights(async_client: AsyncClient):
    # Verify the insights endpoint returns the expected structure
    response = await async_client.get("/api/v1/residential/dashboard-insights")
    assert response.status_code == 200
    data = response.json()
    
    assert "efficiency_score" in data
    assert "vampire_cost_monthly" in data
    assert "ai_advice" in data
    assert "missions" in data
