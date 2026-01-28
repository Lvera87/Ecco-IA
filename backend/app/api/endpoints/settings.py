from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.db.session import get_async_session
from app.models.user import User
from app.models.industrial_settings import IndustrialSettings
from app.schemas.industrial_settings import IndustrialSettingsRead as IndustrialSettingsSchema
from app.schemas.industrial_settings import IndustrialSettingsUpdate

router = APIRouter()

@router.get("/", response_model=IndustrialSettingsSchema)
async def read_settings(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve or create default settings for current user.
    """
    result = await db.execute(select(IndustrialSettings).where(IndustrialSettings.user_id == current_user.id))
    settings = result.scalar_one_or_none()

    if not settings:
        # Create default settings if none exist
        settings = IndustrialSettings(
            user_id=current_user.id,
            company_name="Mi Planta Industrial",
            industry_sector="Manufactura",
            monthly_budget_limit=50000.0,
            energy_cost_per_kwh=0.15,
            currency_code="USD"
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)

    return settings

@router.put("/", response_model=IndustrialSettingsSchema)
async def update_settings(
    *,
    db: AsyncSession = Depends(get_async_session),
    settings_in: IndustrialSettingsUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update settings for current user.
    """
    result = await db.execute(select(IndustrialSettings).where(IndustrialSettings.user_id == current_user.id))
    settings = result.scalar_one_or_none()

    if not settings:
        settings = IndustrialSettings(user_id=current_user.id)
        db.add(settings)
    
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    await db.commit()
    await db.refresh(settings)
    return settings
