import asyncio
import sys
import os

# Añadimos el directorio raíz al path para poder importar la app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session, get_async_engine
from sqlalchemy.future import select
from app.models.industrial_settings import IndustrialSettings
from app.models.industrial_asset import IndustrialAsset
from app.models.user import User

async def seed_data():
    print("🚀 Limpiando y cargando datos reales de 'Postobon Industrial'...")
    
    from sqlalchemy.orm import sessionmaker
    engine = get_async_engine()
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with AsyncSessionLocal() as db:
        # 1. Asegurar usuario Developer
        result = await db.execute(select(User).where(User.username == "developer"))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                username="developer",
                email="dev@eccoia.com",
                full_name="Postobon Ops Manager",
                hashed_password="fake_password"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # 2. Limpiar datos previos
        await db.execute(select(IndustrialAsset).where(IndustrialAsset.user_id == user.id))
        # Para simplificar en este script borramos todo lo relacionado al usuario
        from sqlalchemy import delete
        await db.execute(delete(IndustrialAsset).where(IndustrialAsset.user_id == user.id))
        await db.execute(delete(IndustrialSettings).where(IndustrialSettings.user_id == user.id))
        
        # 3. Datos de Configuración Reales (Postobon)
        settings = IndustrialSettings(
            user_id=user.id,
            company_name="Postobon Planta Central",
            industry_sector="Bebidas / Alimentos",
            energy_cost_per_kwh=650.0, # Pesos Colombianos aprox
            currency_code="COP",
            monthly_budget_limit=150000000.0 # 150M COP
        )
        db.add(settings)

        # 4. Flota de Máquinas Realista
        test_assets = [
            IndustrialAsset(
                user_id=user.id,
                name="Sopladora PET Sidel Matrix",
                asset_type="Maquinaria Proceso",
                nominal_power_kw=120.0,
                load_factor=0.85, 
                efficiency_percentage=92.0,
                power_factor=0.82, # Bajo - causa desperdicio reactivo
                daily_usage_hours=24.0,
                op_days_per_month=30,
                location="Línea de Soplado"
            ),
            IndustrialAsset(
                user_id=user.id,
                name="Compresor de Alta Presión (40 Bar)",
                asset_type="Compresor",
                nominal_power_kw=250.0,
                load_factor=0.70,
                efficiency_percentage=85.0,
                power_factor=0.88,
                daily_usage_hours=24.0,
                op_days_per_month=30,
                location="Cuarto de Compresores"
            ),
            IndustrialAsset(
                user_id=user.id,
                name="Sistema de Enfriamiento (Chiller)",
                asset_type="Chiller / Enfriador",
                nominal_power_kw=180.0,
                load_factor=0.60,
                efficiency_percentage=78.0, # Ineficiente
                power_factor=0.85,
                daily_usage_hours=24.0,
                op_days_per_month=30,
                location="Planta de Frío"
            ),
            IndustrialAsset(
                user_id=user.id,
                name="Tren de Embotellado Krones",
                asset_type="Maquinaria Proceso",
                nominal_power_kw=85.0,
                load_factor=0.75,
                efficiency_percentage=94.0,
                power_factor=0.92, # Buena calidad
                daily_usage_hours=16.0,
                op_days_per_month=24,
                location="Línea de Envasado"
            ),
            IndustrialAsset(
                user_id=user.id,
                name="Bombas de Jarabe",
                asset_type="Bomba Centrífuga",
                nominal_power_kw=30.0,
                load_factor=0.90,
                efficiency_percentage=65.0, # Crítico - Desperdicio Mecánico
                power_factor=0.78,
                daily_usage_hours=12.0,
                op_days_per_month=22,
                location="Sala de Jarabes"
            )
        ]

        try:
            db.add_all(test_assets)
            await db.commit()
            print(f"✅ 'Postobon Planta Central' configurada con {len(test_assets)} activos de alta precisión.")
        except Exception as e:
            await db.rollback()
            print(f"❌ Error al cargar datos: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
