
"""FastAPI application entrypoint."""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
except Exception:  # pragma: no cover - optional dependency in test env
    Limiter = None
    # Fallback stub for get_remote_address when slowapi is not installed.
    def get_remote_address(request):
        return None

from app.api.routes import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging

logger = logging.getLogger("app")

# Create limiter later inside create_app if the dependency is available.
limiter = None


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging()

    application = FastAPI(title=settings.app_name, version=settings.project_version, docs_url="/docs", redoc_url="/redoc")

    # Register custom exception handlers
    register_exception_handlers(application)

    # Add rate limiter state if slowapi is available
    if Limiter is not None:
        local_limiter = Limiter(key_func=get_remote_address)
        application.state.limiter = local_limiter
        # attach a simple 429 handler used by the limiter
        application.add_exception_handler(429, lambda request, exc: {"detail": "Rate limit exceeded"})
    else:
        # Ensure the attribute exists for code that expects it, but leave as None
        application.state.limiter = None

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.backend_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router, prefix=settings.api_v1_prefix)

    @application.get("/", tags=["root"], summary="Root welcome message")
    async def read_root() -> dict[str, str]:
        return {"message": f"Welcome to {settings.app_name}!"}

    @application.on_event("startup")
    async def startup_event():
        from app.db.session import get_async_session
        from app.services.gamification import gamification_service
        async for db in get_async_session():
            try:
                await gamification_service.seed_initial_missions(db)
                logger.info("Master missions seeded successfully")
                break # Solo necesitamos una sesión
            except Exception as e:
                logger.warning(f"Could not seed missions on startup (table might not exist yet): {e}")

    logger.info("Application started in %s mode", settings.environment)
    return application


app = create_app()
