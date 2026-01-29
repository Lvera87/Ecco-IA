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
from app.models.industrial_settings import IndustrialSettings as SettingsModel
from app.schemas.industrial_settings import IndustrialSettingsUpdate, IndustrialSettingsRead

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
    from app.services.gemini_service import gemini_service
    
    # Obtener activos para contexto
    result = await db.execute(select(AssetModel).where(AssetModel.user_id == current_user.id))
    assets = result.scalars().all()
    
    plant_context = {
        "assets": [
            {
                "name": a.name, 
                "type": a.asset_type, 
                "power_kw": a.nominal_power_kw, 
                "efficiency": a.efficiency_percentage
            } for a in assets
        ]
    }
    
    return await gemini_service.get_chat_response(
        message=message,
        context=plant_context,
        profile_type="industrial"
    )

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


# === NUEVO ENDPOINT: Predicción Industrial con ONNX ===
from pydantic import BaseModel, Field

class IndustrialPredictionRequest(BaseModel):
    sector_id: int = Field(..., ge=1, le=17, description="ID del sector industrial (1-17)")
    consumo_total: float = Field(..., gt=0, description="Consumo total mensual en kWh")
    area_m2: float = Field(..., gt=0, description="Área de la instalación en m²")
    tarifa_kwh: float = Field(default=850.0, description="Tarifa por kWh en COP (default: $850)")

class DesgloseIndustrial(BaseModel):
    maquinaria_produccion: float
    iluminacion: float
    climatizacion: float
    otros_auxiliares: float

class IndustrialPredictionResponse(BaseModel):
    consumo_total_kwh: float
    desglose: DesgloseIndustrial
    factura_estimada_cop: float
    consumo_por_m2: float
    sector_nombre: str
    recomendacion: str

# Nombres de los sectores
SECTOR_NAMES = {
    1: "Minas y Canteras",
    2: "Suministro Electricidad/Gas",
    3: "Distribución de Agua",
    4: "Industrias Manufactureras",
    5: "Salud y Asistencia Social",
    6: "Construcción",
    7: "Alojamiento y Comida",
    8: "Comercio al por Mayor/Menor",
    9: "Información y Comunicaciones",
    10: "Educación",
    11: "Actividades Financieras",
    12: "Servicios Administrativos",
    13: "Actividades Profesionales/Cient.",
    14: "Inmobiliarias",
    15: "Admin. Pública y Defensa",
    16: "Arte y Entretenimiento",
    17: "Otras Actividades de Servicios",
}

# === ENDPOINTS DE CONFIGURACIÓN (PERSISTENCIA) ===

@router.get("/settings", response_model=IndustrialSettingsRead)
async def get_settings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Obtiene la configuración industrial del usuario (Sector, Área, Consumo Base)"""
    result = await db.execute(select(SettingsModel).where(SettingsModel.user_id == current_user.id))
    settings = result.scalars().first()
    if not settings:
        # Crear default si no existe
        settings = SettingsModel(user_id=current_user.id)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings

@router.put("/settings", response_model=IndustrialSettingsRead)
async def update_settings(
    settings_in: IndustrialSettingsUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Actualiza la configuración industrial (Guarda Sector, Área, etc.)"""
    result = await db.execute(select(SettingsModel).where(SettingsModel.user_id == current_user.id))
    settings = result.scalars().first()
    if not settings:
        settings = SettingsModel(user_id=current_user.id)
        db.add(settings)
    
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
        
    db.add(settings)
    await db.commit()
    await db.refresh(settings)
    return settings


@router.post("/predict", response_model=IndustrialPredictionResponse)
async def predict_industrial(
    payload: IndustrialPredictionRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Ejecuta predicción del modelo ONNX industrial.
    """
    from app.services.ia_service import ia
    import numpy as np
    
    try:
        # 1. Preparar features [Sector_ID, Consumo_Total, Area_m2]
        features = [payload.sector_id, payload.consumo_total, payload.area_m2]
        
        # 2. Ejecutar predicción con el modelo ONNX industrial
        raw_result = ia.predict("industrial", features)
        
        # Convertir a lista si es numpy
        if isinstance(raw_result, np.ndarray):
            raw_result = raw_result.tolist()
        
        # 3. Mapear las 4 salidas
        val_maquinaria = max(0, float(raw_result[0]))
        val_iluminacion = max(0, float(raw_result[1]))
        val_climatizacion = max(0, float(raw_result[2]))
        val_otros = max(0, float(raw_result[3]))
        
        # 4. Calcular factura estimada
        factura_cop = payload.consumo_total * payload.tarifa_kwh
        
        # 5. Calcular consumo por m²
        consumo_m2 = payload.consumo_total / payload.area_m2 if payload.area_m2 > 0 else 0
        
        # 6. Generar recomendación basada en el desglose
        total_predicho = val_maquinaria + val_iluminacion + val_climatizacion + val_otros
        
        # NORMALIZACIÓN: Ajustar para que la suma sea EXACTAMENTE el consumo_total
        if total_predicho > 0:
            factor = payload.consumo_total / total_predicho
            val_maquinaria *= factor
            val_iluminacion *= factor
            val_climatizacion *= factor
            val_otros *= factor
            
            # Recalcular total predicho para validaciones posteriores (ahora será igual a consumo_total)
            total_predicho = payload.consumo_total

        cat_mayor = max([
            ("Maquinaria/Producción", val_maquinaria),
            ("Iluminación", val_iluminacion),
            ("Climatización", val_climatizacion),
            ("Otros/Auxiliares", val_otros)
        ], key=lambda x: x[1])
        
        porcentaje_mayor = (cat_mayor[1] / total_predicho * 100) if total_predicho > 0 else 0
        
        if porcentaje_mayor > 60:
            recomendacion = f"⚠️ {cat_mayor[0]} concentra el {porcentaje_mayor:.0f}% del consumo. Considere una auditoría energética en esta área."
        elif consumo_m2 > 50:
            recomendacion = f"📊 Consumo elevado por m² ({consumo_m2:.1f} kWh/m²). Revise eficiencia de equipos."
        else:
            recomendacion = "✅ Distribución de consumo balanceada. Mantenga el monitoreo continuo."
        
        return IndustrialPredictionResponse(
            consumo_total_kwh=payload.consumo_total,
            desglose=DesgloseIndustrial(
                maquinaria_produccion=round(val_maquinaria, 2),
                iluminacion=round(val_iluminacion, 2),
                climatizacion=round(val_climatizacion, 2),
                otros_auxiliares=round(val_otros, 2)
            ),
            factura_estimada_cop=round(factura_cop, 0),
            consumo_por_m2=round(consumo_m2, 2),
            sector_nombre=SECTOR_NAMES.get(payload.sector_id, "Desconocido"),
            recomendacion=recomendacion
        )
        
    except Exception as e:
        print(f"❌ Error en predicción industrial: {e}")
        raise HTTPException(status_code=500, detail=str(e))
