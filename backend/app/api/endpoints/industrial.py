from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_session
from app.models.industrial_asset import IndustrialAsset as AssetModel
from app.models.user import User
from app.api.deps import get_current_active_user
from app.schemas.industrial_asset import IndustrialAssetCreate, IndustrialAssetRead, IndustrialAssetBatchCreate, IndustrialDashboardInsights
from app.services.industrial import industrial_service
from app.services.gemini_service import gemini_service
from app.models.roi_scenario import RoiScenario as RoiModel
from app.schemas.roi_scenario import RoiScenarioCreate, RoiScenario as RoiRead

router = APIRouter(tags=["Industrial Efficiency"])

@router.post("/assets/batch", response_model=List[IndustrialAssetRead], status_code=status.HTTP_201_CREATED)
async def create_assets_batch(
    assets_in: IndustrialAssetBatchCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
) -> List[IndustrialAssetRead]:
    """Crea múltiples activos industriales a la vez"""
    new_assets = []
    for asset_in in assets_in.assets:
        asset_data = asset_in.model_dump()
        asset_data["user_id"] = current_user.id
        asset = AssetModel(**asset_data)
        db.add(asset)
        new_assets.append(asset)
    
    await db.commit()
    for asset in new_assets:
        await db.refresh(asset)
    return new_assets

@router.post("/assets", response_model=IndustrialAssetRead, status_code=status.HTTP_201_CREATED)
async def create_asset(
    asset_in: IndustrialAssetCreate, 
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
) -> IndustrialAssetRead:
    """Crea un nuevo activo industrial (Motores, Calderas, etc.)"""
    asset_data = asset_in.model_dump()
    asset_data["user_id"] = current_user.id
    asset = AssetModel(**asset_data)
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset

@router.get("/assets", response_model=List[IndustrialAssetRead])
async def list_assets(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
) -> List[IndustrialAssetRead]:
    """Lista todos los activos de la planta del usuario actual"""
    result = await db.execute(select(AssetModel).where(AssetModel.user_id == current_user.id))
    return result.scalars().all()

@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Elimina un activo de la planta logísticamente"""
    result = await db.execute(select(AssetModel).where(AssetModel.id == asset_id, AssetModel.user_id == current_user.id))
    asset = result.scalar_one_or_none()
    
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activo no encontrado")
    
    await db.delete(asset)
    await db.commit()
    return None

@router.get("/dashboard-insights", response_model=IndustrialDashboardInsights)
async def get_dashboard_insights(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Calcula métricas de la planta solicitando interpretación a la IA"""
    return await industrial_service.get_dashboard_insights(db, current_user.id)

@router.post("/assistant/chat")
async def chat_with_assistant(
    message: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Conversación directa con el experto de la planta (Gemini)"""
    result = await db.execute(select(AssetModel).where(AssetModel.user_id == current_user.id))
    assets = result.scalars().all()
    
    plant_context = [
        f"Activo: {a.name} ({a.asset_type}), Potencia: {a.nominal_power_kw}kW, Eficiencia: {a.efficiency_percentage}%"
        for a in assets
    ]
    
    prompt = f"Eres un experto en eficiencia industrial. Contexto de planta: {', '.join(plant_context)}. Pregunta: {message}"
    response = await gemini_service.model.generate_content_async(prompt)
    return {"response": response.text}

@router.get("/consumption-analysis")
async def get_consumption_analysis(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Análisis avanzado por zonas usando IndustrialService"""
    result = await db.execute(select(AssetModel).where(AssetModel.user_id == current_user.id))
    assets = result.scalars().all()
    
    if not assets: return []
    
    analysis = {}
    for asset in assets:
        loc = asset.location or "General"
        if loc not in analysis:
            analysis[loc] = {"name": loc, "consumption": 0, "machines": 0, "weighted_eff_sum": 0}
        
        stats = industrial_service.calculate_asset_consumption(asset)
        analysis[loc]["consumption"] += stats["monthly_kwh"]
        analysis[loc]["machines"] += 1
        analysis[loc]["weighted_eff_sum"] += (asset.efficiency_percentage * stats["monthly_kwh"])
        
    final_zones = []
    for loc, data in analysis.items():
        avg_eff = data["weighted_eff_sum"] / data["consumption"] if data["consumption"] > 0 else 85
        final_zones.append({
            "name": loc,
            "consumption": round(data["consumption"]),
            "machines": data["machines"],
            "status": "optimal" if avg_eff > 85 else "warning" if avg_eff > 75 else "critical",
            "efficiency": round(avg_eff, 1),
            "change": round((100 - avg_eff) / 2, 1)
        })
    return final_zones
