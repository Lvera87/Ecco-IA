from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class IndustrialAssetBase(BaseModel):
    name: str
    asset_type: str
    nominal_power_kw: float
    efficiency_percentage: Optional[float] = None
    daily_usage_hours: float
    location: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class IndustrialAssetCreate(IndustrialAssetBase):
    pass

class IndustrialAssetUpdate(IndustrialAssetBase):
    name: Optional[str] = None
    asset_type: Optional[str] = None
    nominal_power_kw: Optional[float] = None
    daily_usage_hours: Optional[float] = None

class IndustrialAssetRead(IndustrialAssetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: Optional[int] = None
