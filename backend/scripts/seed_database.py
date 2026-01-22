"""
Script de Seeding para Ecco-IA
Crea datos de demostración para un hogar y una empresa industrial.
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import text
from app.db.session import async_engine, get_async_session
from app.db.base import Base
from app.models.user import User
from app.models.industrial_asset import IndustrialAsset
from app.models.residential import ResidentialProfile, ResidentialAsset, ConsumptionReading
from app.models.gamification import GamificationProfile, Mission, UserMission
from app.core.security import get_password_hash

async def reset_and_seed():
    print("🔄 Reseteando base de datos...")
    
    # Drop all tables and recreate
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Tablas recreadas")
    
    # Get a session
    async for db in get_async_session():
        try:
            # ==========================================
            # 1. USUARIOS
            # ==========================================
            print("👤 Creando usuarios...")
            
            # Usuario Residencial (Hogar)
            home_user = User(
                username="casa_verde",
                email="familia@ecco-ia.com",
                full_name="Familia García Martínez",
                hashed_password=get_password_hash("hogar123")
            )
            db.add(home_user)
            
            # Usuario Industrial (Empresa)
            industrial_user = User(
                username="metalurgica_norte",
                email="operaciones@metalurgicanorte.com",
                full_name="Metalúrgica Norte S.A.S",
                hashed_password=get_password_hash("industria123")
            )
            db.add(industrial_user)
            
            await db.commit()
            await db.refresh(home_user)
            await db.refresh(industrial_user)
            
            print(f"   ✓ Usuario Hogar: {home_user.username} (ID: {home_user.id})")
            print(f"   ✓ Usuario Industrial: {industrial_user.username} (ID: {industrial_user.id})")
            
            # ==========================================
            # 2. PERFIL RESIDENCIAL
            # ==========================================
            print("🏠 Creando perfil residencial...")
            
            home_profile = ResidentialProfile(
                user_id=home_user.id,
                stratum=4,
                city="Bogotá",
                home_type="apartment",
                occupants=4,
                has_electric_stove=True,
                has_electric_heater=False,
                target_monthly_bill=180000
            )
            db.add(home_profile)
            
            # ==========================================
            # 3. ELECTRODOMÉSTICOS DEL HOGAR
            # ==========================================
            print("🔌 Creando electrodomésticos...")
            
            home_appliances = [
                ResidentialAsset(user_id=home_user.id, name="Nevera Samsung", category="kitchen", 
                                 power_watts=150, estimated_hours_day=24, standby_watts=5, 
                                 is_high_impact=True, status=True, icon="Refrigerator"),
                ResidentialAsset(user_id=home_user.id, name="Lavadora LG", category="laundry",
                                 power_watts=500, estimated_hours_day=1.5, standby_watts=3,
                                 is_high_impact=True, status=True, icon="WashingMachine"),
                ResidentialAsset(user_id=home_user.id, name="TV 55\" OLED", category="entertainment",
                                 power_watts=120, estimated_hours_day=5, standby_watts=15,
                                 is_high_impact=False, status=True, icon="Tv"),
                ResidentialAsset(user_id=home_user.id, name="Consola PlayStation 5", category="entertainment",
                                 power_watts=200, estimated_hours_day=2, standby_watts=25,
                                 is_high_impact=False, status=True, icon="Gamepad2"),
                ResidentialAsset(user_id=home_user.id, name="Aire Acondicionado", category="climate",
                                 power_watts=1500, estimated_hours_day=6, standby_watts=10,
                                 is_high_impact=True, status=True, icon="Wind"),
                ResidentialAsset(user_id=home_user.id, name="Microondas", category="kitchen",
                                 power_watts=1000, estimated_hours_day=0.3, standby_watts=3,
                                 is_high_impact=False, status=True, icon="Microwave"),
                ResidentialAsset(user_id=home_user.id, name="Router WiFi", category="office",
                                 power_watts=12, estimated_hours_day=24, standby_watts=12,
                                 is_high_impact=False, status=True, icon="Wifi"),
                ResidentialAsset(user_id=home_user.id, name="PC Gamer", category="office",
                                 power_watts=450, estimated_hours_day=4, standby_watts=8,
                                 is_high_impact=True, status=True, icon="Monitor"),
            ]
            db.add_all(home_appliances)
            
            # ==========================================
            # 4. HISTORIAL DE CONSUMO
            # ==========================================
            print("📊 Creando historial de consumo...")
            
            readings = []
            base_date = datetime.now() - timedelta(days=30)
            for i in range(30):
                reading_date = base_date + timedelta(days=i)
                # Simular consumo realista con variación
                daily_kwh = 12 + (i % 7) * 0.5 + (3 if i % 7 in [5, 6] else 0)  # Más en fines de semana
                readings.append(ConsumptionReading(
                    user_id=home_user.id,
                    date=reading_date.date(),
                    reading_value=round(daily_kwh, 2),
                    reading_type="daily"
                ))
            db.add_all(readings)
            
            # ==========================================
            # 5. ACTIVOS INDUSTRIALES
            # ==========================================
            print("🏭 Creando activos industriales...")
            
            industrial_assets = [
                IndustrialAsset(
                    user_id=industrial_user.id,
                    name="Motor Trifásico #01",
                    asset_type="Motor de Inducción",
                    nominal_power_kw=75.0,
                    daily_usage_hours=16,
                    op_days_per_month=22,
                    load_factor=0.82,
                    power_factor=0.88,
                    efficiency_percentage=92,
                    location="Planta A - Línea de Corte"
                ),
                IndustrialAsset(
                    user_id=industrial_user.id,
                    name="Compresor Atlas Copco",
                    asset_type="Compresor de Aire",
                    nominal_power_kw=55.0,
                    daily_usage_hours=20,
                    op_days_per_month=25,
                    load_factor=0.70,
                    power_factor=0.85,
                    efficiency_percentage=88,
                    location="Cuarto de Máquinas"
                ),
                IndustrialAsset(
                    user_id=industrial_user.id,
                    name="Horno de Fundición #02",
                    asset_type="Caldera",
                    nominal_power_kw=150.0,
                    daily_usage_hours=8,
                    op_days_per_month=20,
                    load_factor=0.90,
                    power_factor=0.92,
                    efficiency_percentage=85,
                    location="Área de Fundición"
                ),
                IndustrialAsset(
                    user_id=industrial_user.id,
                    name="Bomba Hidráulica Central",
                    asset_type="Bomba",
                    nominal_power_kw=30.0,
                    daily_usage_hours=24,
                    op_days_per_month=30,
                    load_factor=0.65,
                    power_factor=0.80,
                    efficiency_percentage=90,
                    location="Sistema de Refrigeración"
                ),
                IndustrialAsset(
                    user_id=industrial_user.id,
                    name="Transformador Principal",
                    asset_type="Transformador",
                    nominal_power_kw=500.0,
                    daily_usage_hours=24,
                    op_days_per_month=30,
                    load_factor=0.55,
                    power_factor=0.95,
                    efficiency_percentage=98,
                    location="Subestación Eléctrica"
                ),
            ]
            db.add_all(industrial_assets)
            
            # ==========================================
            # 6. MISIONES DE GAMIFICACIÓN
            # ==========================================
            print("🎮 Creando misiones de gamificación...")
            
            missions = [
                Mission(title="Eco-Onboarding", description="Completa tu perfil residencial o industrial", 
                        xp_reward=200, point_reward=50, category="global", icon="UserCheck", mission_type="achievement"),
                Mission(title="Caza de Vampiros", description="Identifica 3 equipos con alto consumo standby",
                        xp_reward=150, point_reward=30, category="residential", icon="Zap", mission_type="action"),
                Mission(title="Maestro de la Eficiencia", description="Mantén tu eficiencia industrial sobre el 90% una semana",
                        xp_reward=500, point_reward=100, category="industrial", icon="Trophy", mission_type="achievement"),
                Mission(title="Primer ROI", description="Calcula un escenario de inversión para un motor",
                        xp_reward=300, point_reward=60, category="industrial", icon="TrendingUp", mission_type="calculation"),
                Mission(title="Hogar Consciente", description="Registra todos los equipos de tu cocina",
                        xp_reward=100, point_reward=20, category="residential", icon="Home", mission_type="survey"),
                Mission(title="Auditor Novato", description="Revisa el análisis de IA de tu consumo",
                        xp_reward=75, point_reward=15, category="global", icon="Brain", mission_type="action"),
            ]
            db.add_all(missions)
            await db.commit()
            
            # Refresh missions to get IDs
            for m in missions:
                await db.refresh(m)
            
            # ==========================================
            # 7. PERFILES DE GAMIFICACIÓN Y MISIONES ACTIVAS
            # ==========================================
            print("⭐ Asignando progreso de gamificación...")
            
            # Perfil del hogar - nivel 2
            home_gp = GamificationProfile(user_id=home_user.id, total_xp=350, current_level=2, eco_points=85)
            db.add(home_gp)
            
            # Perfil industrial - nivel 3
            industrial_gp = GamificationProfile(user_id=industrial_user.id, total_xp=720, current_level=3, eco_points=150)
            db.add(industrial_gp)
            
            # Asignar misiones activas
            db.add(UserMission(user_id=home_user.id, mission_id=missions[1].id, status="pending", progress=0.33))
            db.add(UserMission(user_id=home_user.id, mission_id=missions[4].id, status="pending", progress=0.8))
            db.add(UserMission(user_id=home_user.id, mission_id=missions[5].id, status="pending", progress=0.0))
            
            db.add(UserMission(user_id=industrial_user.id, mission_id=missions[2].id, status="pending", progress=0.6))
            db.add(UserMission(user_id=industrial_user.id, mission_id=missions[3].id, status="pending", progress=0.0))
            
            await db.commit()
            
            print("\n" + "="*50)
            print("✅ BASE DE DATOS POBLADA EXITOSAMENTE")
            print("="*50)
            print("\n📋 CREDENCIALES DE ACCESO:\n")
            print("🏠 HOGAR (Residencial):")
            print("   Usuario: casa_verde")
            print("   Contraseña: hogar123")
            print("   Email: familia@ecco-ia.com")
            print()
            print("🏭 EMPRESA (Industrial):")
            print("   Usuario: metalurgica_norte")
            print("   Contraseña: industria123")
            print("   Email: operaciones@metalurgicanorte.com")
            print()
            print("="*50)
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error: {e}")
            raise
        finally:
            await db.close()

if __name__ == "__main__":
    asyncio.run(reset_and_seed())
