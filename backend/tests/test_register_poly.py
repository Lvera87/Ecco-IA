import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from polyfactory.factories.pydantic_factory import ModelFactory as PydanticFactory
from typing import AsyncGenerator

from app.schemas.auth import RegisterRequest
from app.models.user import User
from app.models.residential import ResidentialProfile
from app.models.industrial_settings import IndustrialSettings
from app.db.base import Base

# Factory para generar datos de registro aleatorios pero válidos
class RegisterRequestFactory(PydanticFactory[RegisterRequest]):
    __model__ = RegisterRequest

@pytest.fixture(autouse=True)
def clear_db_engine():
    """Limpia el engine global para forzar su recreación en cada test con el loop actual."""
    import app.db.session
    app.db.session._engine = None
    yield

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Fixture para obtener una sesión de base de datos para cada test."""
    from app.db.session import get_async_engine
    engine = get_async_engine()
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        yield session

@pytest_asyncio.fixture(scope="function", autouse=True)
async def clean_db_users():
    """Limpia los usuarios creados después de cada test para evitar colisiones de Unique Constraints."""
    from app.db.session import get_async_engine
    from sqlalchemy import text
    yield
    engine = get_async_engine()
    async with engine.begin() as conn:
        # El orden es vital por las FKs
        await conn.execute(text("DELETE FROM residential_profiles"))
        await conn.execute(text("DELETE FROM industrial_settings"))
        await conn.execute(text("DELETE FROM gamification_profiles"))
        await conn.execute(text("DELETE FROM users"))

@pytest.mark.asyncio
async def test_register_residential_user_persistence(async_client: AsyncClient, db_session: AsyncSession):
    # 1. Generar datos
    payload = RegisterRequestFactory.build(user_type="residential").model_dump()
    
    # 2. Ejecutar registro
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    
    # 3. Verificar en DB
    # Refrescamos la sesión para ver los cambios del API
    result = await db_session.execute(select(User).where(User.username == payload["username"]))
    user = result.scalar_one_or_none()
    
    assert user is not None, f"Usuario {payload['username']} no encontrado"
    assert user.email == payload["email"]
    
    # Verificar perfil
    profile_result = await db_session.execute(
        select(ResidentialProfile).where(ResidentialProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()
    assert profile is not None

@pytest.mark.asyncio
async def test_register_industrial_user_persistence(async_client: AsyncClient, db_session: AsyncSession):
    # 1. Generar datos
    payload = RegisterRequestFactory.build(user_type="industrial").model_dump()
    
    # 2. Ejecutar registro
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    
    # 3. Verificar en DB
    result = await db_session.execute(select(User).where(User.username == payload["username"]))
    user = result.scalar_one_or_none()
    assert user is not None
    
    # Verificar IndustrialSettings
    industrial_result = await db_session.execute(
        select(IndustrialSettings).where(IndustrialSettings.user_id == user.id)
    )
    industrial_profile = industrial_result.scalar_one_or_none()
    assert industrial_profile is not None

@pytest.mark.asyncio
async def test_duplicate_user_registration_fails(async_client: AsyncClient):
    # 1. Registrar primero
    payload = RegisterRequestFactory.build().model_dump()
    await async_client.post("/api/v1/auth/register", json=payload)
    
    # 2. Intentar registrar duplicado
    response = await async_client.post("/api/v1/auth/register", json=payload)
    
    # 3. Verificar error
    assert response.status_code == 400
    assert "ya existe" in response.json()["detail"].lower()
