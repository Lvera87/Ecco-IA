from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_async_session
from app.models.industrial_asset import IndustrialAsset as AssetModel
from app.schemas.industrial_asset import IndustrialAssetCreate, IndustrialAssetRead
from app.services.gemini_service import gemini_service

router = APIRouter(tags=["Industrial Efficiency"])

@router.post("/assets", response_model=IndustrialAssetRead, status_code=status.HTTP_201_CREATED)
async def create_asset(asset_in: IndustrialAssetCreate, db: AsyncSession = Depends(get_async_session)) -> IndustrialAssetRead:
    """Crea un nuevo activo industrial (Motores, Calderas, etc.)"""
    asset = AssetModel(**asset_in.model_dump())
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset

@router.get("/assets", response_model=List[IndustrialAssetRead])
async def list_assets(db: AsyncSession = Depends(get_async_session)) -> List[IndustrialAssetRead]:
    """Lista todos los activos de la planta"""
    result = await db.execute(select(AssetModel))
    return result.scalars().all()

@router.get("/dashboard-insights")
async def get_dashboard_insights(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Endpoint del 'Backend Líquido'. Obtiene datos reales y los procesa con IA.
    """
    # 1. Obtener activos del usuario
    query = select(AssetModel).where(AssetModel.user_id == current_user.id)
    result = await db.execute(query)
    assets = result.scalars().all()
    
    if not assets:
        return {
            "waste_score": 0,
            "top_waste_reason": "No hay activos registrados",
            "potential_savings": "$0",
            "recommendation_highlight": "Registrar activos",
            "ai_interpretation": "Por favor, añade tus equipos industriales para iniciar el análisis de eficiencia."
        }
    
    # 2. Preparar datos para Gemini
    plant_data = {
        "total_assets": len(assets),
        "assets": [
            {
                "name": a.name,
                "type": a.asset_type,
                "power_kw": a.nominal_power_kw,
                "efficiency": a.efficiency_percentage,
                "usage_hours": a.daily_usage_hours
            } for a in assets
        ]
    }
    
    # 3. Llamar a Gemini
    insights = await gemini_service.get_dashboard_insights(plant_data)
    return insights

@router.post("/assistant/chat")
async def chat_with_assistant(
    message: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_session)
):
    """
    Conversación directa con el experto de la planta (Gemini).
    """
    # 1. Obtener contexto de la planta
    query = select(AssetModel).where(AssetModel.user_id == current_user.id)
    result = await db.execute(query)
    assets = result.scalars().all()
    
    plant_context = [
        f"Activo: {a.name}, Tipo: {a.asset_type}, Power: {a.nominal_power_kw}kW, Horas: {a.daily_usage_hours}h"
        for a in assets
    ]
    
    # 2. Consultar a Gemini con contexto
    prompt = f"""
    Eres el experto en eficiencia energética de Ecco-IA. 
    Contexto de la Planta: {", ".join(plant_context)}
    
    Usuario pregunta: {message}
    
    Responde de forma técnica pero motivadora, enfocada en ahorro de dinero y reducción de huella de carbono.
    """
    
    response = await gemini_service.model.generate_content_async(prompt)
    return {"response": response.text}
