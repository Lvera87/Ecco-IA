import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from polyfactory.factories.pydantic_factory import ModelFactory as PydanticFactory
from typing import AsyncGenerator

# Asegúrate de que estas rutas coincidan con tu estructura
from app.schemas.auth import RegisterRequest
from app.models.user import User
from app.models.residential import ResidentialProfile
from app.models.industrial_settings import IndustrialSettings
# from app.core.security import verify_password  # Descomenta si tienes esta función accesible

# --- FACTORY MEJORADA ---
class RegisterRequestFactory(PydanticFactory[RegisterRequest]):
    __model__ = RegisterRequest

    # MEJORA: Forzamos el uso de Faker para emails reales.
    # A veces Polyfactory genera strings aleatorios como "abcde" que fallan la validación de Pydantic.
    @classmethod
    def email(cls) -> str:
        return cls.__faker__.email()

# --- FIXTURES ---
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
    """Limpia los usuarios creados después de cada test."""
    from app.db.session import get_async_engine
    yield
    engine = get_async_engine()
    async with engine.begin() as conn:
        # El orden es vital: primero hijos, luego padre
        await conn.execute(text("DELETE FROM residential_profiles"))
        await conn.execute(text("DELETE FROM industrial_settings"))
        # Si tienes tabla de gamification, descomenta esto:
        await conn.execute(text("DELETE FROM gamification_profiles"))
        await conn.execute(text("DELETE FROM users"))

# --- TESTS ---

@pytest.mark.asyncio
async def test_register_residential_user_persistence(async_client: AsyncClient, db_session: AsyncSession):
    # 1. Generar datos
    payload = RegisterRequestFactory.build(user_type="residential").model_dump()
    
    # 2. Ejecutar registro
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    
    # 3. Verificar en DB
    result = await db_session.execute(select(User).where(User.username == payload["username"]))
    user = result.scalar_one_or_none()
    
    assert user is not None, f"Usuario {payload['username']} no encontrado"
    assert user.email == payload["email"]
    
    # MEJORA: Verificar seguridad (no guardar password en texto plano)
    assert user.hashed_password != payload["password"], "¡ERROR DE SEGURIDAD! La contraseña se guardó sin hashear."
    
    # Verificar creación automática del perfil
    profile_result = await db_session.execute(
        select(ResidentialProfile).where(ResidentialProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()
    assert profile is not None, "El perfil residencial no se creó automáticamente"
    # Opcional: verificar relación inversa si está configurada en SQLAlchemy
    # assert user.residential_profile is not None

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
    
    # MEJORA: Verificar seguridad
    assert user.hashed_password != payload["password"]
    
    # Verificar IndustrialSettings
    industrial_result = await db_session.execute(
        select(IndustrialSettings).where(IndustrialSettings.user_id == user.id)
    )
    industrial_profile = industrial_result.scalar_one_or_none()
    assert industrial_profile is not None, "La configuración industrial no se creó automáticamente"

@pytest.mark.asyncio
async def test_duplicate_user_registration_fails(async_client: AsyncClient):
    # 1. Registrar primero (Usuario A)
    payload = RegisterRequestFactory.build().model_dump()
    response_1 = await async_client.post("/api/v1/auth/register", json=payload)
    assert response_1.status_code == 201
    
    # 2. Intentar registrar duplicado (Usuario A otra vez)
    response_2 = await async_client.post("/api/v1/auth/register", json=payload)
    
    # 3. Verificar error
    assert response_2.status_code == 400
    data = response_2.json()
    # Verifica que el mensaje de error sea amigable
    assert "detail" in data
    # Ajusta este string al mensaje exacto que devuelve tu API en español o inglés
    # Ejemplo: "El usuario con este email ya existe"
    # assert "ya existe" in data["detail"].lower() or "already exists" in data["detail"].lower()
