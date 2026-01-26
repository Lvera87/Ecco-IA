from fastapi import APIRouter, HTTPException, Depends # <--- Agregamos Depends
from pydantic import BaseModel, Field
from typing import List
import numpy as np
import json

# --- 1. IMPORTS NUEVOS PARA BASE DE DATOS ---
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.models.residential import ResidentialProfile
from app.core.security import get_current_user
from app.services.ia_service import ia
from app.core.energy_logic import energy_calculators
# --------------------------------------------

router = APIRouter()

# --- MODELOS DE DATOS ---

class PredictionRequest(BaseModel):
    client_type: str = Field(..., example="residencial")
    features: List[float] = Field(..., 
        description="Orden obligatorio: [Estrato, Consumo_Total, Personas, TVs, PCs, Lavadoras, Aire, Nevera_Vieja, Nevera_Inverter]",
        example=[3, 220, 3, 2, 1, 1, 0, 0, 1]
    )

class DesgloseConsumo(BaseModel):
    refrigeracion: float
    climatizacion: float
    entretenimiento: float
    cocina_lavado: float

class PredictionResponse(BaseModel):
    consumo_total_real: float
    consumo_identificado: float
    otros_fugas: float
    desglose: DesgloseConsumo
    alerta_fuga: bool
    mensaje: str

@router.post("/predict")  # Sin response_model para permitir campos adicionales
async def predict_sector(
    payload: PredictionRequest,
    # --- 2. INYECCIÓN DE DEPENDENCIAS (Para tener acceso a la DB y al Usuario) ---
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
    # -----------------------------------------------------------------------------
):
    try:
        # 1. Validar que vengan los 9 datos exactos
        if len(payload.features) != 9:
            raise HTTPException(status_code=400, detail=f"Se esperaban 9 variables, se recibieron {len(payload.features)}")

        # 2. Obtener predicción cruda [v1, v2, v3, v4]
        raw_result = ia.predict(payload.client_type, payload.features)
        
        # --- Limpieza de NumPy (Seguridad) ---
        if isinstance(raw_result, np.ndarray):
            raw_result = raw_result.tolist()

        # 3. Mapeo de Variables
        val_nevera = float(raw_result[0])
        val_clima = float(raw_result[1])
        val_entretenimiento = float(raw_result[2])
        val_cocina = float(raw_result[3])

        # 4. Cálculos Matemáticos
        estrato = int(payload.features[0])  # Estrato del usuario
        consumo_total = payload.features[1]  # kWh mensual
        
        suma_predicciones = val_nevera + val_clima + val_entretenimiento + val_cocina
        
        # Calculamos el residual (Otros / Fugas)
        otros_fugas = consumo_total - suma_predicciones
        if otros_fugas < 0:
            otros_fugas = 0.0

        # Definimos si hay alerta de fuga
        porcentaje_fuga = (otros_fugas / consumo_total) * 100 if consumo_total > 0 else 0
        es_alerta = porcentaje_fuga > 20.0

        # 5. NUEVOS CÁLCULOS CON TARIFAS EMCALI
        # Facturación real
        facturacion = energy_calculators.calculate_bill_from_kwh(consumo_total, estrato)
        
        # Costo de fugas
        fugas = energy_calculators.calculate_leak_cost(otros_fugas, estrato)
        
        # Comparación con promedio del estrato
        comparacion_estrato = energy_calculators.calculate_stratum_comparison(consumo_total, estrato)

        # Preparamos el objeto de respuesta enriquecido
        response_data = {
            "consumo_total_real": consumo_total,
            "consumo_identificado": round(suma_predicciones, 2),
            "otros_fugas": round(otros_fugas, 2),
            "desglose": {
                "refrigeracion": round(val_nevera, 2),
                "climatizacion": round(val_clima, 2),
                "entretenimiento": round(val_entretenimiento, 2),
                "cocina_lavado": round(val_cocina, 2)
            },
            "alerta_fuga": es_alerta,
            "porcentaje_fuga": round(porcentaje_fuga, 1),
            "mensaje": "Fuga detectada" if es_alerta else "Consumo normal",
            
            # NUEVOS CAMPOS - Facturación EMCALI
            "facturacion": {
                "estrato": estrato,
                "tarifa_kwh": facturacion["tarifa_kwh"],
                "factura_estimada_cop": facturacion["factura_estimada_cop"],
                "tipo_tarifa": facturacion["tipo_tarifa"],
                "subsidio_porcentaje": facturacion["subsidio_contribucion_porcentaje"]
            },
            
            # NUEVOS CAMPOS - Costo de Fugas
            "fugas": {
                "kwh": fugas["fugas_kwh"],
                "costo_cop": fugas["fugas_costo_cop"]
            },
            
            # NUEVOS CAMPOS - Comparación con Estrato
            "comparacion_estrato": {
                "promedio_kwh": comparacion_estrato["promedio_estrato_kwh"],
                "diferencia_kwh": comparacion_estrato["diferencia_kwh"],
                "diferencia_porcentaje": comparacion_estrato["diferencia_porcentaje"],
                "es_eficiente": comparacion_estrato["es_eficiente"],
                "mensaje": comparacion_estrato["mensaje"]
            }
        }

        # --- 3. GUARDADO EN BASE DE DATOS ---
        # Buscamos el perfil del usuario que está haciendo la petición
        stmt = select(ResidentialProfile).where(ResidentialProfile.user_id == current_user.id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if profile:
            # Guardamos el Dict directamente (la columna JSON lo serializa automáticamente)
            profile.history_kwh = response_data
            # Actualizamos también el promedio si quieres
            profile.average_kwh_captured = consumo_total
            
            db.add(profile)
            await db.commit()
            print(f"💾 Resultado guardado en DB para usuario {current_user.id}")
        else:
            print(f"⚠️ Usuario {current_user.id} no tiene perfil residencial. No se guardó historial.")
        # ---------------------------------------------

        return response_data

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))