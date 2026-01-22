import asyncio
import sys
import os

# Añadimos el directorio raíz al path para poder importar la app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_async_session, get_async_engine
from app.models.industrial_asset import IndustrialAsset
from app.models.user import User

async def seed_data():
    print("🚀 Iniciando carga de datos de prueba para Ecco-IA...")
    
    from sqlalchemy.orm import sessionmaker
    engine = get_async_engine()
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with AsyncSessionLocal() as db:
        # Definimos algunos activos industriales con "problemas" para que la IA los detecte
        test_assets = [
            IndustrialAsset(
                name="Motor Extrusora Principal",
                asset_type="Motor",
                nominal_power_kw=75.0,
                efficiency_percentage=72.0,  # Eficiencia baja (desperdicio)
                daily_usage_hours=24.0,       # Uso intensivo
                location="Planta A - Extrusión"
            ),
            IndustrialAsset(
                name="Compresor de Aire Tornillo",
                asset_type="Compresor",
                nominal_power_kw=45.0,
                efficiency_percentage=85.0,
                daily_usage_hours=18.0,
                location="Cuarto de Máquinas"
            ),
            IndustrialAsset(
                name="Bomba de Agua Enfriamiento",
                asset_type="Bomba",
                nominal_power_kw=15.0,
                efficiency_percentage=60.0,  # Muy ineficiente
                daily_usage_hours=12.0,
                location="Torre de Enfriamiento"
            ),
            IndustrialAsset(
                name="Horno de Tratamiento Térmico",
                asset_type="Horno",
                nominal_power_kw=120.0,
                efficiency_percentage=90.0,
                daily_usage_hours=8.0,
                location="Planta B - Térmicos"
            )
        ]

        try:
            db.add_all(test_assets)
            await db.commit()
            print("✅ Datos cargados exitosamente en la base de datos.")
        except Exception as e:
            await db.rollback()
            print(f"❌ Error al cargar datos: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
