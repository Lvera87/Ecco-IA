from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RoiScenarioBase(BaseModel):
    asset_id: int
    target_efficiency: float
    investment_usd: float
    annual_savings_usd: float
    payback_months: float

class RoiScenarioCreate(RoiScenarioBase):
    pass

class RoiScenario(RoiScenarioBase):
    id: int
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True
