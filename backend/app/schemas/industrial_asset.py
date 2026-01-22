from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class IndustrialAssetBase(BaseModel):
    name: str
    asset_type: str
    nominal_power_kw: float
    efficiency_percentage: Optional[float] = 85.0
    load_factor: Optional[float] = 0.75
    power_factor: Optional[float] = 0.85
    daily_usage_hours: float
    op_days_per_month: Optional[int] = 22
    location: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class IndustrialAssetCreate(IndustrialAssetBase):
    pass

class IndustrialAssetBatchCreate(BaseModel):
    assets: List[IndustrialAssetCreate]

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

class IndustrialDashboardInsights(BaseModel):
    waste_score: int
    top_waste_reason: str
    potential_savings: str
    potential_savings_monthly: float # Valor numérico para cálculos exactos
    total_consumption_monthly_kwh: float
    total_real_demand_kw: float
    recommendation_highlight: str
    ai_interpretation: str
    currency: str
