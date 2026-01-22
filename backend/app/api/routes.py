"""Collect and expose API routers."""
from fastapi import APIRouter

from app.api.endpoints import health, users, auth, industrial, settings, residential, gamification

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(industrial.router, prefix="/industrial", tags=["industrial"])
api_router.include_router(residential.router, prefix="/residential", tags=["residential"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["gamification"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
