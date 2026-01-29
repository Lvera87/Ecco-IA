"""FastAPI application entrypoint."""

from __future__ import annotations
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- CAMBIO IMPORTANTE: Importamos tu instancia 'ia' ---
from app.services.ia_service import ia 

# ... (Bloque try/except de slowapi igual que antes) ...
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
except Exception: 
    Limiter = None
    def get_remote_address(request):
        return None

from app.api.routes import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging

logger = logging.getLogger("app")
limiter = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Cargar la IA al iniciar
    try:
        ia.load_artifacts() # <-- Usamos tu método
        logger.info("🧠 Modelos de IA cargados correctamente")
    except Exception as e:
        logger.error(f"❌ Error cargando la IA: {e}")
        # Opcional: raise e (si quieres que la app falle si no hay IA)

    # 2. Gamificación (Tu lógica existente)
    from app.db.session import get_async_session
    from app.services.gamification import gamification_service
    
    logger.info("🎮 Iniciando gamificación...")
    async for db in get_async_session():
        try:
            await gamification_service.seed_initial_missions(db)
            break 
        except Exception as e:
            logger.error(f"⚠️ Error en gamificación: {e}")

    yield 
    
    logger.info("🛑 Apagando aplicación...")

def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging()

    application = FastAPI(
        title=settings.app_name, 
        version=settings.project_version, 
        docs_url="/docs", 
        redoc_url="/redoc",
        lifespan=lifespan # <-- Conectado
    )

    register_exception_handlers(application)

    if Limiter is not None:
        local_limiter = Limiter(key_func=get_remote_address)
        application.state.limiter = local_limiter
        application.add_exception_handler(429, lambda request, exc: {"detail": "Rate limit exceeded"})
    else:
        application.state.limiter = None

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.backend_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router, prefix=settings.api_v1_prefix)

    @application.get("/", tags=["root"])
    async def read_root() -> dict[str, str]:
        # Info de estado útil para debug
        return {
            "message": f"Welcome to {settings.app_name}!",
            "ia_status": "online" if ia.is_loaded else "offline"
        }

    logger.info("Application started in %s mode", settings.environment)
    return application

app = create_app()
# Trigger reload for env vars
