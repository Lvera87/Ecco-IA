from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ResidentialProfileBase(BaseModel):
    house_type: Optional[str] = None
    occupants: Optional[int] = 1
    area_sqm: Optional[float] = None
    city: Optional[str] = None
    stratum: Optional[int] = None
    occupancy_profile: Optional[str] = None
    energy_source: Optional[str] = None
    monthly_bill_avg: Optional[float] = None
    target_monthly_bill: Optional[float] = None
    average_kwh_captured: Optional[float] = None
    history_kwh: Optional[Any] = None  # Puede ser List[float] antiguo o Dict con desglose de IA

class ResidentialProfileCreate(ResidentialProfileBase):
    pass

class ResidentialProfile(ResidentialProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ResidentialAssetBase(BaseModel):
    name: str
    icon: Optional[str] = None
    category: Optional[str] = None
    is_high_impact: bool = False
    status: bool = True
    power_watts: float = 0.0
    daily_hours: float = 0.0
    monthly_cost_estimate: float = 0.0

class ResidentialAssetCreate(ResidentialAssetBase):
    pass

class ResidentialAsset(ResidentialAssetBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ConsumptionReadingBase(BaseModel):
    reading_value: float
    reading_type: str = "manual"

class ConsumptionReadingCreate(ConsumptionReadingBase):
    pass

class ConsumptionReading(ConsumptionReadingBase):
    id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True
