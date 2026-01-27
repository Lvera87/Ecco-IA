"""Collect and expose API routers."""
from fastapi import APIRouter

# 1. Agregamos 'prediction' a los imports
from app.api.endpoints import (
    health, 
    users, 
    auth, 
    industrial, 
    settings, 
    residential, 
    gamification,
    prediction # <-- NUEVO: Importamos el archivo de la IA
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(industrial.router, prefix="/industrial", tags=["industrial"])
api_router.include_router(residential.router, prefix="/residential", tags=["residential"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])

# 2. Registramos la ruta de la IA
# El prefijo "/ia" significa que tus URLs serán: /api/v1/ia/predict
api_router.include_router(prediction.router, prefix="/ia", tags=["Artificial Intelligence"])
