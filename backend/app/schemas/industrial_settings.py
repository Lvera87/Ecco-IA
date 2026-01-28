from pydantic import BaseModel, ConfigDict
from typing import Optional

class IndustrialSettingsBase(BaseModel):
    company_name: Optional[str] = None
    industry_sector: Optional[str] = None
    sector_id: Optional[int] = None
    monthly_budget_limit: Optional[float] = None
    baseline_consumption_kwh: Optional[float] = None
    area_m2: Optional[float] = None

class IndustrialSettingsUpdate(IndustrialSettingsBase):
    pass

class IndustrialSettingsRead(IndustrialSettingsBase):
    id: int
    user_id: int
    
    model_config = ConfigDict(from_attributes=True)
