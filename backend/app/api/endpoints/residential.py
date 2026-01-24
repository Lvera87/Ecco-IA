from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.db.session import get_async_session
from app.models.residential import ResidentialProfile as ProfileModel, ResidentialAsset as AssetModel, ConsumptionReading as ReadingModel
from app.models.user import User
from app.api.deps import get_current_active_user
from app.schemas.residential import (
    ResidentialProfile, ResidentialProfileCreate,
    ResidentialAsset, ResidentialAssetCreate,
    ConsumptionReading, ConsumptionReadingCreate
)
from app.services.residential import residential_service

router = APIRouter(tags=["Residential Efficiency"])

# --- PROFILE ENDPOINTS ---

@router.get("/profile", response_model=Optional[ResidentialProfile])
async def get_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Obtiene el perfil residencial del usuario actual"""
    result = await db.execute(select(ProfileModel).where(ProfileModel.user_id == current_user.id))
    return result.scalar_one_or_none()

@router.post("/profile", response_model=ResidentialProfile)
async def update_profile(
    profile_in: ResidentialProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Crea o actualiza el perfil residencial"""
    result = await db.execute(select(ProfileModel).where(ProfileModel.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    
    profile_data = profile_in.model_dump()
    if profile:
        for key, value in profile_data.items(): setattr(profile, key, value)
    else:
        profile = ProfileModel(**profile_data, user_id=current_user.id)
        db.add(profile)
    
    await db.commit()
    await db.refresh(profile)
    return profile

# --- ASSETS ENDPOINTS ---

@router.get("/assets", response_model=List[ResidentialAsset])
async def list_assets(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Lista los electrodomésticos registrados con cálculos de costo actualizados"""
    # 1. Obtener equipos
    assets_result = await db.execute(select(AssetModel).where(AssetModel.user_id == current_user.id))
    assets = assets_result.scalars().all()

    # 2. Obtener el precio del kWh basado en el estrato del perfil para el cálculo
    profile_result = await db.execute(select(ProfileModel).where(ProfileModel.user_id == current_user.id))
    profile = profile_result.scalar_one_or_none()
    kwh_price = residential_service.get_kwh_price(profile.stratum if profile else 3)
    
    # 3. Recalcular costos en demanda para asegurar precisión (Source of Truth)
    for a in assets:
        a.monthly_cost_estimate = residential_service.calculate_appliance_cost(a.power_watts, a.daily_hours, kwh_price)
    
    return assets

@router.post("/assets", response_model=List[ResidentialAsset])
async def add_assets(
    assets_in: List[ResidentialAssetCreate],
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Registra uno o varios electrodomésticos. 
    Unifica la creación individual y masiva (Batch) en una sola lógica clara.
    """
    # Precio base para nuevos registros
    profile_result = await db.execute(select(ProfileModel).where(ProfileModel.user_id == current_user.id))
    profile = profile_result.scalar_one_or_none()
    kwh_price = residential_service.get_kwh_price(profile.stratum if profile else 3)

    new_assets = []
    for asset_in in assets_in:
        asset_data = asset_in.model_dump()
        asset_data["monthly_cost_estimate"] = residential_service.calculate_appliance_cost(
            asset_data.get("power_watts", 0), 
            asset_data.get("daily_hours", 0),
            kwh_price
        )
        asset = AssetModel(**asset_data, user_id=current_user.id)
        db.add(asset)
        new_assets.append(asset)
    
    await db.commit()
    for asset in new_assets: await db.refresh(asset)
    return new_assets

@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Elimina un electrodoméstico"""
    result = await db.execute(select(AssetModel).where(AssetModel.id == asset_id, AssetModel.user_id == current_user.id))
    asset = result.scalar_one_or_none()
    if not asset: raise HTTPException(status_code=404, detail="No encontrado")
    await db.delete(asset)
    await db.commit()
    return None

@router.patch("/assets/{asset_id}", response_model=ResidentialAsset)
async def update_asset(
    asset_id: int,
    asset_update: dict,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Actualiza propiedades de un electrodoméstico (ej: status, hours)"""
    result = await db.execute(select(AssetModel).where(AssetModel.id == asset_id, AssetModel.user_id == current_user.id))
    asset = result.scalar_one_or_none()
    if not asset: raise HTTPException(status_code=404, detail="No encontrado")
    
    for key, value in asset_update.items():
        if hasattr(asset, key):
            setattr(asset, key, value)
            
    # Obtener el precio del kWh para recalcular
    profile_result = await db.execute(select(ProfileModel).where(ProfileModel.user_id == current_user.id))
    profile = profile_result.scalar_one_or_none()
    kwh_price = residential_service.get_kwh_price(profile.stratum if profile else 3)
    
    # Recalcular costo si cambiaron watts u horas
    asset.monthly_cost_estimate = residential_service.calculate_appliance_cost(asset.power_watts, asset.daily_hours, kwh_price)
    
    await db.commit()
    await db.refresh(asset)
    return asset

# --- CONSUMPTION ENDPOINTS ---

@router.get("/consumption", response_model=List[ConsumptionReading])
async def get_consumption_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Historial de lecturas de consumo ordenado cronológicamente"""
    result = await db.execute(
        select(ReadingModel).where(ReadingModel.user_id == current_user.id).order_by(ReadingModel.date.desc())
    )
    return result.scalars().all()

@router.post("/consumption", response_model=ConsumptionReading)
async def add_consumption_reading(
    reading_in: ConsumptionReadingCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Registra una nueva lectura de contador con validación técnica"""
    reading = ReadingModel(**reading_in.model_dump(), user_id=current_user.id)
    db.add(reading)
    await db.commit()
    await db.refresh(reading)
    return reading

# --- ASSISTANT ---

@router.post("/assistant/chat")
async def chat_with_assistant(
    message: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Conversación directa con el experto del hogar (Gemini)"""
    from app.services.gemini_service import gemini_service
    
    # Eager load para evitar múltiples queries (Senior Pattern)
    result_profile = await db.execute(select(ProfileModel).where(ProfileModel.user_id == current_user.id))
    profile = result_profile.scalar_one_or_none()
    
    result_assets = await db.execute(select(AssetModel).where(AssetModel.user_id == current_user.id))
    assets = result_assets.scalars().all()
    
    home_context = {
        "stratum": profile.stratum if profile else 3,
        "housing": profile.house_type if profile else "apartamento",
        "appliances": [f"{a.name} ({a.icon})" for a in assets],
        "city": profile.city if profile else "Colombia"
    }
    
    # 2. Consultar el motor centralizado de IA
    return await gemini_service.get_chat_response(
        message=message,
        context=home_context,
        profile_type="residential"
    )

# --- DASHBOARD INSIGHTS ---

@router.get("/dashboard-insights")
async def get_residential_insights(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Métricas y consejos de IA para el hogar usando ResidentialService (Truth Engine)"""
    return await residential_service.get_dashboard_insights(db, current_user.id)
